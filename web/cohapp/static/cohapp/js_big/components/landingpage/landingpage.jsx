import Preloader from '../preloader.jsx';
import {getPlainText} from '../helperfunctions.js';
import {my_urls} from '../jsx-strings.jsx';

class LandingPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      myText: "",
      data: null,
      loading: false
    };

    // Bind this to methods
    this.analyzeText = this.analyzeText.bind(this);
    this.renderCMap = this.renderCMap.bind(this);
  }

  render() {

    var button = <button onClick={this.analyzeText}
          className="waves-effect waves-light btn" id="editor-button">Analyze my text</button>;


    return (
      <div>
        <div id="visualization-button">
          {this.state.loading ? <Preloader /> : button}
        </div>
        <div className="row" id="editor-landing-page">
          <div id="editor-medium-editor" className="col s11 m4 offset-m1">
            <div id="editor-textinput" ref={(el) => { this.textInput = el; }}
              dangerouslySetInnerHTML={this.returnInnerHTML()}></div>
          </div>
          <div id="cmap" ref={(el) => { this.cmap = el; }} className="col s11 m7">
            <svg  ref={(el) => { this.svg = el; }} ></svg>
          </div>
        </div>
      </div>
    )
  }

  /**
   * Return dangerous html to editor
   * @return {dict} html
   */
  returnInnerHTML() {
    return {__html: this.state.myText}
  }

  /**
   * Analyze text.
   * Send data to server. When finished, render
   * CMap.
   */
  analyzeText() {
    var self = this;

    // Render loading ring
    this.setState({'loading': true});

    // Empty svg
    d3.select(this.svg).html('');

    // Get text
    var divText = this.textInput.innerHTML;

    // Get plain version of text
    var textPlain = getPlainText(divText);

    // Fetch data from server
    fetch(my_urls.textanalyzer, {
      method: 'POST',
      credentials: 'same-origin',
      body: JSON.stringify({'text': textPlain}),
      headers: new Headers({
        'Content-Type': 'application/json'
      })
    }).then(response => {
      return response.json();
    }).catch(error => {
      console.log(error);
    }).then(data => {
      console.log(data);
      self.setState({'data': data, 'loading': false, 'myText': data['html_string']}, () => {
        self.renderCMap();
      })
    });

  }


  /**
   * Render CMap after data has been
   * fetched from the server
   */
  renderCMap() {
    var self = this;

    ///////////////
    // Render Cmap
    ///////////////

    // Generate 20 distinct colors for the cmap
    // var colors = d3.scaleOrdinal(d3.schemeCategory10);
    var colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

    // Get width and height of parent div
    var width = this.cmap.offsetWidth - 20;
    var height = this.cmap.offsetHeight;

    // Init svg attributes
    var svg = d3.select(this.svg)
      .attr('width', width)
      .attr('height', height);

    // Add wrapper for svg
    var g = svg.append('g')
      .attr('width', width)
      .attr('height', height);

    // Overlay svg with rectangle
    var rect = svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .style('fill', 'red')
      .style('opacity', 0);

    // Init progress bar
    var progressBar = svg.append('line')
      .attr('x1', 0)
      .attr('x2', 0)
      .attr('y1', 0)
      .attr('y2', 0)
      .style('stroke', 'red')
      .style('stroke-width', '2');

    // Linear scale for progress bar
    var scale = d3.scaleLinear()
      .domain([0, 1])
      .range([0, width]);

    // Create force simulation
    var simulation = d3.forceSimulation(self.state.data.nodes)
      .force('charge', d3.forceManyBody().strength(-250))
      .force('link', d3.forceLink(self.state.data.links)
        .distance(80)
        .id(function(d) {
          return d.id;
        }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .stop();

    // Add timeout to process data
    d3.timeout(function() {
      // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
      for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
        simulation.tick();
      }

      // Add links
      var link = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(self.state.data.links)
        .enter().append('line')
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .style('stroke-dasharray', function(d) {
          if (d['device'] == 'between') {
            return '5,5';
          }
        })
        .style('d', function(d) {
          if (d['device'] == 'between') {
            return 'M5 20 l215 0';
          }
        });

      // Create g element that stores
      // circles and text and call dragging on it
      var node = g.append('g')
        .attr('class', 'nodes')
        .selectAll('.node')
        .data(self.state.data.nodes)
        .enter().append('g')
        .attr('id', function(d, i) {
          return 'node-' + d.id;
        })
        .attr('class', 'node')
        .attr('transform', function(d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        });
        // .on('mouseover', mouseover)
        // .on('mouseout', mouseout);

      // Append circle
      var circle = node.append('circle')
        .attr('r', 10)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('fill', function(d, i) {
          return colors[self.state.data['wordClusterIndex'][d.id]];
        });
        // .style('stroke', (d, i) => {
        //   // This node is a subject
        //   // Make it black
        //   if (self.state.data.subjects.indexOf(d.id) > -1) {
        //     return 'black';
        //   }
        // })
        // .style('stroke-width', (d, i) => {
        //   // This node is a subject
        //   // Give the node a width
        //   if (self.state.data.subjects.indexOf(d.id) > -1) {
        //     return 2;
        //   }
        // });

      // Append label to node container
      var label = node.append('text')
        .attr('dy', -8)
        .attr('dx', 10)
        .style('opacity', 0.8)
        .attr('text-anchor', 'start')
        .text(function(d) {
          return d.id;
        });
    });
  }


  componentDidMount() {
    // Enable editor
    var editor = new MediumEditor(this.textInput, {
      toolbar: false,
      placeholder: {
        text: 'Your text goes here. Push the button to see your visualization.',
        hideOnClick: true
      },
    });
  }


}

ReactDOM.render(
  <LandingPage />,
  document.getElementById('landingpage')
);
