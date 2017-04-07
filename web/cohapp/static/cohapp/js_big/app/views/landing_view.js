var app = app || {};

app.LandingView = Backbone.View.extend({

  el: $('#landingview'),

  events: {
    'click #editor-button': 'analyzeText',
    'click #editor-full-button': 'reanalyzeText',
    'mouseover #editor-full-medium-editor span': 'onTextHover',
    'mouseout #editor-full-medium-editor span': 'onTextHoverOff',
  },

  initialize: function () {
    // Assign self to this
    var self = this;

    // Generate 20 distinct colors
    this.colors = d3.scaleOrdinal(d3.schemeCategory10);

    // this simulations
    this.simulations = {};

    // Render editor
    this.$el.find('#landingview-editor').html(
      Handlebars.templates.editor({'instruction': ""}));

    // Enable editor functionality
    var editor = new MediumEditor('#editor-textinput', {
      toolbar: false,
      placeholder: false,
    });

    // Check if user first visits the page
    if (localStorage.getItem('firstVisit') === null) {
      // Start type animation
      $('#editor-textinput').typed({
        strings: app.constants.editor_textinput,
        typeSpeed: 2,
        contentType: 'html',
        cursorChar: "",
        callback: function() {
          // Select text in medium editor
          var editableElement = document.
            querySelector('#editor-textinput').firstChild;
          editor.selectElement(editableElement);
        }
      });
    // User has already visited the site
    } else {
      $('#editor-textinput').html('<p>Schreibe hier ...</p>');

      // Select text so that user can type instantly
      var editableElement = document.
        querySelector('#editor-textinput').firstChild;
      editor.selectElement(editableElement);
    }

    // Initalize model for text analysis
    this.analyzer = new app.TextAnalyzerModel();

    _.bindAll(this, "onTextHover");
  },


  /**
   * Get text from medium editor and pass it to render function
   */
  analyzeText: function() {
    // Assign self to this
    var self = this;

    // Get text from medium editor
    var paragraphs = app.getParagraphs(this.$el.find('#editor-textinput'));

    // Render loading ring
    this.$el.find('#editor-button-div').html(
      Handlebars.templates['loading-ring']());

    // Fetch data from server
    this.analyzer.set({'text': paragraphs});
    this.analyzer.save(null, {
      success: function(response) {
        self.renderGraph('#editor-textinput', true,
          '#editor-full-medium-editor', '#editor-full-graph', self.colors);
      },
      error: function(model, response) {
        console.log(response.responseText);
        // Send error message as toast
        Materialize.toast(app.constants.toast_textinput, 4000);

        // Rerender analyze button
        self.$el.find('#editor-button-div').html(
          Handlebars.templates['text_analyze_button']());
      }
    });
  },

  /**
   * Analye Text when user has already submitted first draft
   */
  reanalyzeText: function() {

    var self = this;

    // Get text from medium editor
    var paragraphs = app.getParagraphs(
      this.$el.find('#editor-full-medium-editor'));

    // Get plain Text
    var plainText = app.getPlainText(this.$el.find('#editor-full-medium-editor'));

    // Render loading ring
    this.$el.find('#editor-full-button-div').html(
      Handlebars.templates['loading-ring']());

    // Fetch data from server
    this.analyzer.set({'text': paragraphs});
    this.analyzer.save(null, {
      success: function(response) {
        // Render graph
        self.renderGraph('#editor-full-medium-editor', false,
          '#editor-full-medium-editor', '#editor-full-graph',
          self.colors);

        // Rerender analyze button
        self.$el.find('#editor-full-button-div').html(
          Handlebars.templates['text_analyze_button_full']());
      },
      error: function(model, response) {
        // Send error message as toast
        Materialize.toast(app.constants.toast_textinput, 4000);

        // Rerender analyze button
        self.$el.find('#editor-full-button-div').html(
          Handlebars.templates['text_analyze_button_full']());

      }
    });
  },

  onTextHover: function(e) {
    // Get span element that is hovered
    var hoveredElement = e.currentTarget.innerText;

    // Get lemmas for word
    var lemmasForWord = this.analyzer.get('wordLemmaRelations')[hoveredElement];

    // Is element in Data?
    if (lemmasForWord) {

      var lemma = lemmasForWord[0];

      if (lemma == e.target.innerText || this.analyzer.get('lemmaWordRelations')[lemma].indexOf(e.target.innerText) > -1) {
        e.currentTarget.style.color = this.colors(this.analyzer.get('word_cluster_index')[lemma]);
      }

      // spanElement.style.color = colors(index[wordSelected]);
      e.currentTarget.className += 'highlight-related';
      // // Get selected word
      var nodeSelected = d3.select('#node-' + lemma);
      var nodeData = nodeSelected.data()[0];

      // Change text of selected element
      nodeSelected.select('text')
        .style('opacity', 1)
        .style('font-weight', 'bold')
        .style('font-size', '20px');

      nodeSelected.select('circle')
        .style('stroke', '#000')
        .style('stroke-width', 1);
    }

  },

  onTextHoverOff: function(e) {
    // Change text of selected element
    d3.selectAll('text')
      .style('font-weight', 'normal')
      .style('font-size', '16px');

    d3.selectAll('circle')
      .style('stroke', 'none')
      .style('stroke-width', 0);

    $('#editor-full-medium-editor').find('span').each(function(index, span) {
      span.style.color = null;
      span.className = "";
    });
},

  /**
   * Render graph
   * @param  {String}  paragraphDiv the div that contains the paragraphs
   * @param  {Boolean} full         wheather editor full template should be loaded
   * @param  {String}  mediumEditor div of medium editor in ordre to enable typing
   * @param  {String}  graphDiv     div where svg is rendered
   * @return {None}
   */
  renderGraph: function(paragraphDiv, full, mediumEditor, graphDiv) {
    var self = this;

    // Get paragraphs from editor
    var paragraphs = this.$el.find(paragraphDiv).html();

    // Save clusters in Backbone View scope
    this.clusters = this.analyzer.get('clusters');

    // Add template
    if (full) {
      this.$el.find('#landingview-editor').html(
        Handlebars.templates['editor-full']({'text': paragraphs}));
    }

    // Enable editor functionality
    var editor = new MediumEditor(mediumEditor, {
      toolbar: false,
    });

    // Render Graph
    var svgWidth = $(graphDiv).width();
    var svgHeight = $(mediumEditor).height();

    // Empty div with svg element
    $(graphDiv).empty();

    // Render graph
    this.renderCmap(this.analyzer.get('word_pairs'),
      this.analyzer.get('numConcepts'), this.analyzer.get('numClusters'),
      graphDiv, svgHeight, svgWidth, this.colors);

    // Check if user first visits the page
    if (localStorage.getItem('firstVisit') === null) {
      // Trigger modal
      this.$el.append(Handlebars.templates['modal_instruction']());
      $('#modal-instruction').openModal();

      // Set local storage
      localStorage.setItem('firstVisit', false);
    }
  },

  renderCmap: function(pairs, numConcepts, numClusters, svgID, height, width, colors)  {
    var self = this;
    var svgHeight = height + 200;
    var svgWidth = width;
    var margin = {top: 0, right: 0, bottom: 0, left: 0};
    var voronoi;

    // Create svg
    var svg = d3.select(svgID).append("svg")
      .attr('width', svgWidth - 5)
      .attr("height", svgHeight);
      // .attr('transform', 'scale(0.5)');

    // Add wrapper for svg
    var g = svg.append('g')
      .attr('width', svgWidth)
      .attr('height', svgHeight);

    // Overlay svg with rectangle
    var rect = svg.append('rect')
      .attr('class', 'overlay')
      .attr('width', svgWidth)
      .attr('height', svgHeight)
      .style('fill', 'red')
      .style('opacity', 0)
      .on('mousemove', mouseMoveHandler)
      .on('mouseleave', mouseLeaveHandler);

    // Call zoom
    svg.call(d3.zoom()
      .scaleExtent([1 / 2, 1.5])
      .on('zoom', zoomed));

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
      .range([0, svgWidth]);

    // Create force simulation
    var simulation = d3.forceSimulation(self.analyzer.get('nodes'))
      .force('charge', d3.forceManyBody().strength(-250))
      .force('link', d3.forceLink(self.analyzer.get('links'))
        .distance(80)
        .id(function(d) {
          return d.id;
        }))
      .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
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
        .data(self.analyzer.get('links'))
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
        .data(self.analyzer.get('nodes'))
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
        .style('fill', function(d, i) {
          return self.colors(self.analyzer.get('word_cluster_index')[d.id]);
        })
        .attr('fill', '#ccc');

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

    function zoomed() {
      g.attr('transform', d3.event.transform);
      rect.attr('transform', d3.event.transform);
    }

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
      var nearestPoint = simulation.find(mouse[0], mouse[1]);

      // Select element that is hovered
      var nodeSelected = g.select('#node-' + nearestPoint.id);
      var nodeData = nodeSelected.data()[0];

      // Change text of selected element
      nodeSelected.select('text')
        .style('opacity', 1)
        .style('font-weight', 'bold')
        .style('font-size', '20px');

      nodeSelected.select('circle')
        .style('stroke', '#000')
        .style('stroke-width', 1);

      /////////////////////////////
      // Highlight words in text //
      /////////////////////////////

      // We need to get the text of the selected word in order
      // to highlight them
      var wordSelected = nearestPoint.id;

      app.highlightSelectedWord('#editor-full-medium-editor', wordSelected,
        self.analyzer.get('lemmaWordRelations'), self.colors,
        self.analyzer.get('word_cluster_index'));
    }

    function mouseLeaveHandler() {
      // Change text of selected element
      svg.selectAll('text')
        .style('font-weight', 'normal')
        .style('font-size', '16px');

      svg.selectAll('circle')
        .style('stroke', 'none')
        .style('stroke-width', 0);

      $('#editor-full-medium-editor').find('p').each(function(paragraph) {
        var textParagraph = $(this).text();
        // Wrap everything in span elements
        var spanText = textParagraph.replace(/([A-z0-9'<>\u00dc\u00fc\u00e4\u00c4\u00f6\u00d6\u00df\-/]+)/g, '<span>$1</span>');

        var jquerySpan = $(spanText);

        // Generate spans for text
        $(this).html(jquerySpan);
        $(this).append('.');

      });
    }
  }

});

if (window.location.pathname == '/') {
  new app.LandingView();
}
