import Preloader from '../preloader.jsx';
import {getPlainText} from '../helperfunctions.js';
import {my_urls} from '../jsx-strings.jsx';
import {Provider} from 'react-redux';
import {LandingPageStore} from '../../store.jsx';
import {connect} from 'react-redux';
import {setLoading, updateTextData, updateText} from '../../actions/landingpage';

class LandingPage extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      myText: this.props.textdata.text,
      keystrokes: 0,
      switchStatus: false
    };

    // Bind this to methods
    this.analyzeText = this.analyzeText.bind(this);
    this.renderCMap = this.renderCMap.bind(this);
    this.highlighWordInText = this.highlighWordInText.bind(this);
    this.updateText = this.updateText.bind(this);
    this.fetchNewTextData = this.fetchNewTextData.bind(this);
    this.updateCMap = this.updateCMap.bind(this);
    this.switchClicked = this.switchClicked.bind(this);
  }

  render() {

    var button = <button onClick={this.analyzeText}
          className="waves-effect waves-light btn"
          id="editor-button">Process text</button>;

    return (
      <div id="application">
        <nav id="navigation">
          <ul id="nav-wrapper">
            <li className="logo"><a href="/">CohViz</a></li>
          </ul>
        </nav>
        <div className="button">
          {this.props.loading ? <Preloader /> : button}
        </div>
        <div id="application-editor">
          <div id="editor-medium-editor">
            <div id="editor-textinput" ref={(el) => { this.textInput = el; }}
              onKeyUp={this.updateText}
              dangerouslySetInnerHTML={this.returnInnerHTML()}></div>
          </div>
        </div>
        <div className="concept-map" ref={(el) => { this.cmap = el; }}>
          <svg  ref={(el) => { this.svg = el; }} ></svg>
        </div>
        <div className="controller">
          <div className="switch">
            <label>
              not automatic
              <input type="checkbox" onClick={this.switchClicked} />
              <span className="lever"></span>
              automatic
            </label>
          </div>
        </div>
        <div className="toggles">
          <ul className="toggles-flex">
            <li><a href="#">What is it?</a></li>
            <li><a href="#">How does it work?</a></li>
          </ul>
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
   * Enable automatic analysis of
   * texts
   */
  switchClicked(el) {
    this.setState({switchStatus: el.target.checked});
  }

  /**
   * Update written text with every keystroke
   */
  updateText() {
    var self = this;

    // Only update if user wants to update
    // automatically
    if (this.state.switchStatus) {
      // Send action to receiver
      this.props.dispatch(updateText(this.textInput.innerHTML));

      // Update keystrokes
      this.setState({keystrokes: this.state.keystrokes + 1}, () => {
        if (this.state.keystrokes == 20) {
          self.fetchNewTextData();

          self.setState({keystrokes: 0});
        }
      });
    }
  }

  fetchNewTextData() {
    var self = this;

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
      // Update text data
      self.props.dispatch(updateTextData(data));

      self.updateCMap();
    });
  }

  /**
   * Analyze text.
   * Send data to server. When finished, render
   * CMap.
   */
  analyzeText() {
    var self = this;

    // Render loading ring
    this.props.dispatch(setLoading(true));

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
      // Set loading to false
      self.props.dispatch(setLoading(false));

      // Update text data
      self.props.dispatch(updateTextData(data));

      // Render Cmap
      self.renderCMap();
    });
  }


  /**
   * Render CMap after data has been
   * fetched from the server
   */
  renderCMap() {
    var self = this;
    var voronoi;
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

    // Call zoom
    svg.call(d3.zoom()
      .scaleExtent([1 / 2, 1.5])
      .on('zoom', zoomed));

    // Add wrapper for svg
    var g = svg.append('g')
      .attr('width', width)
      .attr('height', height);

    // Overlay svg with rectangle
    var rect = svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', width)
      .attr('height', height)
      .style('fill', '#333')
      .style('opacity', 0)
      .on('mousemove', mouseMoveHandler)
      .on('mouseleave', mouseLeaveHandler);

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
    self.simulation = d3.forceSimulation(self.props.textdata.nodes)
      .force('charge', d3.forceManyBody().strength(-250))
      .force('link', d3.forceLink(self.props.textdata.links)
        .distance(80)
        .id(function(d) {
          return d.id;
        }))
      .force('center', d3.forceCenter(width / 2, height / 2))
      .force('collision', d3.forceCollide().radius(50))
      .force('x', d3.forceX())
      .force('y', d3.forceY())
      .stop();

    function zoomed() {
      g.attr('transform', d3.event.transform);
      rect.attr('transform', d3.event.transform);
    }

    // Add timeout to process data
    d3.timeout(function() {
      // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
      for (var i = 0, n = Math.ceil(Math.log(self.simulation.alphaMin()) / Math.log(1 - self.simulation.alphaDecay())); i < n; ++i) {
        self.simulation.tick();
      }

      // Add links
      self.link = g.append('g')
        .attr('class', 'links')
        .selectAll('line')
        .data(self.props.textdata.links)
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

      // Create g element for verteces
      self.node = g.append('g')
        .attr('class', 'nodes')
        .selectAll('.node')
        .data(self.props.textdata.nodes)
        .enter().append('g')
        .attr('id', function(d, i) {
          return 'node-' + d.id;
        })
        .attr('class', 'node')
        .attr('transform', function(d) {
          return 'translate(' + d.x + ',' + d.y + ')';
        });

      // Append circle
      self.circle = self.node.append('circle')
        .attr('r', 10)
        .attr('cx', 0)
        .attr('cy', 0)
        .attr('fill', function(d, i) {
          return colors[self.props.textdata['wordClusterIndex'][d.id]];
        });

      // Append label to node container
      var label = self.node.append('text')
        .attr('dy', -8)
        .attr('dx', 10)
        .style('opacity', 0.8)
        .attr('text-anchor', 'start')
        .text(function(d) {
          return d.id;
        });
    });

    function mouseMoveHandler() {
      // Change text of selected element
      svg.selectAll('text')
        .style('font-weight', 'normal')
        .style('font-size', '16px');

      svg.selectAll('circle')
        .style('stroke', 'none')
        .style('stroke-width', 0);

      // Get data
      var mouse = d3.mouse(this);

      // Find nearest point to mouse coordinate
      var nearestPoint = self.simulation.find(mouse[0], mouse[1]);

      // Select element that is hovered
      var nodeSelected = g.select('#node-' + nearestPoint.id);
      var nodeData = nodeSelected.data()[0];

      // Change text of selected element
      nodeSelected.select('text')
        .style('opacity', 1)
        .style('font-weight', 'bold')
        .style('font-size', '20px');

      nodeSelected.select('circle')
        .style('stroke', '#fff')
        .style('stroke-width', 1);

      self.highlighWordInText(nodeData.id);
    }

    function mouseLeaveHandler() {
      // Change text of selected element
      svg.selectAll('text')
        .style('font-weight', 'normal')
        .style('font-size', '16px');

      svg.selectAll('circle')
        .style('stroke', 'none')
        .style('stroke-width', 0);

      // Get inner html
      var innerHTML = self.textInput.innerHTML;

      // Remove all spans from text
      innerHTML =  innerHTML.replace(/<\/?span[^>]*>/g,"");

      // Update state
      self.setState({'myText': innerHTML});
    }
  }

  updateCMap() {
    var self = this;

    // Update data for nodes
    this.node = this.node.data(this.props.textdata.nodes, function(d) {
      return d.id;
    });

    // Remove unused nodes
    this.node.exit().remove();

    var colors = ['#1f77b4', '#ff7f0e', '#2ca02c', '#d62728', '#9467bd', '#8c564b', '#e377c2', '#7f7f7f', '#bcbd22', '#17becf'];

    // Append new nodes and merge
    var updateSelection = this.node
      .enter()
      .append('g')
      .attr('id', function(d, i) {
        return 'node-' + d.id;
      })
      .attr('class', 'node');

    // Add circles to new elements
    updateSelection.append('circle')
      .attr('r', 10)
      .attr('cx', 0)
      .attr('cy', 0)
      .attr('fill', function(d, i) {
        return colors[self.props.textdata['wordClusterIndex'][d.id]];
      });

    // Add text to new elements
    updateSelection.append('text')
      .attr('dy', -8)
      .attr('dx', 10)
      .style('opacity', 0.8)
      .attr('text-anchor', 'start')
      .text(function(d) {
        return d.id;
      });

    // Merge both selections
    this.node = updateSelection
      .merge(this.node);

    d3.selectAll('circle')
      .attr('fill', function(d, i) {
        return colors[self.props.textdata['wordClusterIndex'][d.id]];
      });

    // Update links
    this.link = this.link.data(this.props.textdata.links, function(d) {
      return d.id
    });

    // Remove unneeded links
    this.link.exit().remove();

    // Add new links
    this.link = this.link.enter().append('line').merge(this.link);

    this.simulation.on('tick', ticked);
    this.simulation.nodes(this.props.textdata.nodes, function(d) {
      return d.id;
    });
    this.simulation.force('link').links(this.props.textdata.links);
    this.simulation.alpha(1).restart();

    function ticked() {
      self.node.attr('transform', function(d) {
        return 'translate(' + d.x + ',' + d.y + ')';
      });

      self.link
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; });
    }
  }

  highlighWordInText(nodeData) {
    // Get inner html
    var innerHTML = this.textInput.innerHTML;

    // Remove all spans from text
    innerHTML =  innerHTML.replace(/<\/?span[^>]*>/g,"");

    // Get corresponding orthograpic text of node
    var relations = this.props.textdata.lemmaWordRelations[nodeData];

    // Replace word with span
    for (var i = 0; i < relations.length; i++) {
      var re = new RegExp(relations[i], 'g');
      innerHTML = innerHTML.replace(re, '<span class="cluster-' + this.props.textdata.wordClusterIndex[nodeData] + '">' + relations[i] + '</span>');
    }

    this.setState({'myText': innerHTML});
  }

  componentDidMount() {
    // Enable editor
    var editor = new MediumEditor(this.textInput, {
      toolbar: false,
      placeholder: {
        text: 'Start writing here.',
        hideOnClick: true
      },
    });

    // If textdata is not empty render Cmap
    if (localStorage.getItem('landingpage')) {
      this.renderCMap();
    }
  }
}

/**
 * Maps the state to the props
 * @param  {[type]} store [description]
 * @return {[type]}       [description]
 */
function mapStatetoProps(store) {
  return {
    textdata: store.textdata,
    loading: store.general.loading
  }
}

// Connect store to landing page
var ConnectedLandingPage = connect(mapStatetoProps)(LandingPage);

// Subscribe app to local storage
LandingPageStore.subscribe(() => {
  localStorage.setItem('landingpage', JSON.stringify(LandingPageStore.getState()));
});

ReactDOM.render(<Provider store={LandingPageStore}>
    <ConnectedLandingPage />
  </Provider>,
  document.getElementById('landing-page')
);
