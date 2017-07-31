import Preloader from '../../preloader.jsx';

class CMap extends React.Component {
  constructor(props) {
    super(props);

    console.log(this.props);

    // Bind this to methods
    this.updateRevision = this.updateRevision.bind(this);
    this.returnInnerHTML = this.returnInnerHTML.bind(this);
  }

  render() {
    return (
      <div className="row" id="editor">
        <div id="editor-medium-editor" className="col s11 m4 offset-m1">
          <div id="editor-textinput" ref={(el) => { this.textInput = el; }}
              dangerouslySetInnerHTML={this.returnInnerHTML()}
              onKeyUp={this.updateRevision} ></div>
          <div id="editor-button-div" className="s12 m4 offset-m1 col">
            <a onClick={this.props.analyzeRevision}
               className="waves-effect waves-light btn" id="editor-button">Analysiere meinen Text</a>
          </div>
        </div>
        <div id="cmap" ref={(el) => { this.cmap = el; }} className="col s11 m7">
          <svg  ref={(el) => { this.svg = el; }} ></svg>
        </div>
      </div>
    )
  }

  /**
   * Return dangerous html to editor
   * @return {dict} html
   */
  returnInnerHTML() {
    return {__html: this.props.revisionText}
  }

  // We need to store the revision in a state variable
  // in order to process it afterwards. Otherwise we will
  // lose the changes when the component is mounted again
  updateRevision() {
    this.props.updateRevision(this.textInput.innerHTML);
  }

  /**
   * Enable Medium Editor after component mounted
   * @return {undefined}
   */
  componentDidMount() {
    var self = this;

    // Enable editor
    var editor = new MediumEditor(this.textInput, {
      toolbar: false,
      placeholder: {
        // text: '',
        hideOnClick: true
      },
    });

    /////////////////
    // Render Cmap //
    /////////////////

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
      // .on('mousemove', mouseMoveHandler);
      // .on('mouseleave', mouseLeaveHandler);

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
    var simulation = d3.forceSimulation(this.props.draftAnalyzed.nodes)
      .force('charge', d3.forceManyBody().strength(-250))
      .force('link', d3.forceLink(this.props.draftAnalyzed.links)
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
        .data(self.props.draftAnalyzed.links)
        .enter().append('line')
        .attr("x1", function(d) { return d.source.x; })
        .attr("y1", function(d) { return d.source.y; })
        .attr("x2", function(d) { return d.target.x; })
        .attr("y2", function(d) { return d.target.y; })
        .style('stroke-dasharray', function(d) {
          if (d['device'] == 'coreference') {
            return '5,5';
          }
        })
        .style('d', function(d) {
          if (d['device'] == 'coreference') {
            return 'M5 20 l215 0';
          }
        });

      // Create g element that stores
      // circles and text and call dragging on it
      var node = g.append('g')
        .attr('class', 'nodes')
        .selectAll('.node')
        .data(self.props.draftAnalyzed.nodes)
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
          // console.log(d.id);
          // console.log(self.props.draftAnalyzed['wordClusterIndex'][d.id]);
          return colors[self.props.draftAnalyzed['wordClusterIndex'][d.id]];
        });
        // .attr('fill', '#ccc');

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

    // function mouseMoveHandler() {
    //   // Change text of selected element
    //   svg.selectAll('text')
    //     .style('font-weight', 'normal')
    //     .style('font-size', '16px');

    //   svg.selectAll('circle')
    //     .style('stroke', 'none')
    //     .style('stroke-width', 0);

    //   // Get data
    //   var mouse = d3.mouse(this);

    //   // Find nearest point to mouse coordinate
    //   var nearestPoint = simulation.find(mouse[0], mouse[1]);

    //   // Select element that is hovered
    //   var nodeSelected = g.select('#node-' + nearestPoint.id);
    //   var nodeData = nodeSelected.data()[0];

    //   // Change text of selected element
    //   nodeSelected.select('text')
    //     .style('opacity', 1)
    //     .style('font-weight', 'bold')
    //     .style('font-size', '20px');

    //   nodeSelected.select('circle')
    //     .style('stroke', '#000')
    //     .style('stroke-width', 1);

    //   /////////////////////////////
    //   // Highlight words in text //
    //   /////////////////////////////

    //   // We need to get the text of the selected word in order
    //   // to highlight them
    //   var wordSelected = nearestPoint.id;

    //   console.log(wordSelected);
    // }
  }

  /**
   * Update component only if editor is not currently
   * visible
   * @return {Boolean} True if editor is not visible false otherwise
   */
  shouldComponentUpdate() {
    if (this.props.editorVisible) {
      return false;
    }

    return true;
  }
};

export default CMap;
