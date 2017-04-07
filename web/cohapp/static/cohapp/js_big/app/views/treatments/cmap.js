var app = app || {};


app.CmapView = Backbone.View.extend({

  el: '#treatment-cmap',

	events: {
    'click #instruction-read': 'renderEditor',
		'click #help': 'renderInstructionModal',
		'click #editor-button': 'analyzeText',
		'click #editor-full-button': 'saveText',
    // 'click #print': 'printText'
	},

	initialize: function() {
    // Variable declaration
    var self = this;
    this.prePageDurationStart = null;
    this.postPageDurationStart = null;

		// Generate 20 distinct colors for the cmap
		this.colors = d3.scaleOrdinal(d3.schemeCategory10);

    // this simulations
    this.simulations = {};

    // Get user data
    this.userModel = new app.UserSpecificModel();

    // Init textanalyzer model
    this.textModel = new app.TextModelComplete();

    // Init textAnalyzer model
    this.analyzer = new app.TextAnalyzerModel();

    // Fetch user data
    this.userModel.fetch({
        success: function(model, response) {
            self.renderInstruction();
        },
        error: function(model, response) {
            console.log(response);
        }
    });

	},

    /** Render instruction for
      * this part of the experiment
      */
	renderInstruction: function() {
    // Render instruction
    this.$el.html(
        Handlebars.templates.instruction({'instruction':
            this.userModel.get('instruction')}));
	},

	/**
     * When user has read the instruction he or she is able
     * to write their text.
     */
    renderEditor: function() {
        // Start timer for draft
        this.prePageDurationStart = new Date();

        // Render editor
        this.$el.html(Handlebars.templates.editor());

        // Enable editor functionality
        var editor = new MediumEditor('#editor-textinput', {
            toolbar: false,
            placeholder: false,
        });

        // Add text to editor
        $('#editor-textinput').html('<p>Schreibe hier ...</p>');

        // Select text so that user can type instantly
        var editableElement = document.
            querySelector('#editor-textinput').firstChild;
        editor.selectElement(editableElement);

        // Append help button to window
        this.$el.append('<i id="help" class="material-icons">help</i>');

        // Append modal
        this.$el.append(Handlebars.templates['modal-help']({'instruction':
            this.userModel.get('instruction') }));
    },

    /**
     * Render modal of instruction
     */
    renderInstructionModal: function() {
        $('#modal-help').openModal();
    },

    /**
     * After user has written his or her text the
     * user gets feedback on the draft.
     * Before users can see the feedback we need
     * to make some sanity checks whether the
     * text is long enough.
     */
    analyzeText: function() {
        var self = this;

        // Change text with major concepts
        app.regExText('#editor-textinput');

        // Get text
        var text = app.getParagraphs(this.$el.find('#editor-textinput'));

        // Get plain text
        var plainText = app.getPlainText(this.$el.find('#editor-textinput'));

        // Check if text is long enough
        if (text.length < 300) {
            // Display toast
            Materialize.toast('Ihr Text ist leider zu kurz.', 4000);
        } else {
            // Stop timer for draft
            var draftElapsed = (new Date() - this.prePageDurationStart) / 1000;

            // Start timer for text revision
            this.postPageDurationStart = new Date();

            // Set draft time and draftText to textModel
            this.textModel.set({'pre_page_duration': draftElapsed,
                                'pre_text': plainText});

            // Render loading ring
            this.$el.find('#editor-button-div').html(
                Handlebars.templates['loading-ring']());

            // Get text data
            this.analyzer.set({'text': text});
            this.analyzer.save(null, {
                success: function(response) {
                    self.renderRevision();
                },
                error: function(model, response) {
                    console.log(response.responseText);
                }
            });
        }
    },


    /**
     * After user has written the draft she gets the
     * opportunity to revise her text
     */
    renderRevision: function() {
      var self = this;

      // Render submit button
      this.$el.find('#editor-button-div').html(
              '<a class="waves-effect waves-light btn" id="save-text">Text abschicken</a>');

      // Save data for draft
      this.textModel.set({
          'pre_num_sentences': this.analyzer.get('numSentences'),
          'pre_num_clusters': this.analyzer.get('numCluster'),
          'pre_num_coherent_sentences': this.analyzer.get('cohSentences'),
          'pre_num_non_coherent_sentences': this.analyzer.get('cohNotSentences'),
          'pre_num_concepts': this.analyzer.get('numConcepts'),
          'pre_local_cohesion': this.analyzer.get('local cohesion')});

      // Get inner html of text input
      this.paragraphs = $('#editor-textinput').html();

      // Change inner html
      this.$el.html(Handlebars.templates['editor-full']({'instruction':
          app.constants.simpleRevisionModal}));

      // Append help button to window
      this.$el.append('<i id="help" class="material-icons">help</i>');

      // Append modal
      this.$el.append(Handlebars.templates['modal-help']({'instruction':
          this.userModel.get('instructionreview') }));

      // Change inner html of editor
      $('#editor-full-medium-editor').html(this.paragraphs);

      // Enable editor functionality
      var editor = new MediumEditor('#editor-full-medium-editor', {
        toolbar: false,
      });

      // Change text of Button
      $('#editor-full-button').text('Text abschicken');

      // Display modal
      this.$el.append(Handlebars.templates['modal-revision']({'instruction':
          this.userModel.get('instructionreview')}));
      $('#modal-revision').openModal();

      // Set width of height of svg element
      var svgWidth = $('#editor-full-graph').width();
      var svgHeight = $('#editor-full-medium-editor').height();

      // Add print symbol
      // this.$el.append('<i id="print" class="material-icons">print</i>');

      // Render graph
      this.renderCmap(this.analyzer.get('word_pairs'),
        this.analyzer.get('numConcepts'), this.analyzer.get('numClusters'),
        '#editor-full-graph', svgHeight, svgWidth, this.colors);
      },


    /**
     * Print text as pdf
     * @return {[type]} [description]
     */
    printText: function() {
        // Get plain Text
        // var plainText = app.getPlainText(this.$el.find('#editor-full-medium-editor'));
        // var doc = new jsPDF();
        // var splitText = doc.splitTextToSize(plainText, 180);
        // doc.text(splitText, 10, 10);
        // doc.save('cohviz_textoutput.pdf');
    },

	renderCmap: function(pairs, clust, numClusters, svgID, height, width, colors)  {
    var self = this;
    var svgHeight = (window.innerHeight || e.clientHeight|| g.clientHeight) - 50;
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
  },

  saveText: function() {
      var self = this;

      // Get seconds subject worked for revision
      var revisionElapsed = (new Date() - this.postPageDurationStart) / 1000;

      // Render loading ring
      this.$el.find('#editor-full-button-div').html(
          Handlebars.templates['loading-ring']());

      // Get text
      var text = app.getParagraphs(this.$el.find('#editor-full-medium-editor'));

      // Get plain Text
      var plainText = app.getPlainText(this.$el.find('#editor-full-medium-editor'));

      // Save post text to textModel
      this.textModel.set({'post_text': plainText,
                          'post_page_duration': revisionElapsed});

      // Set text to analyzer
      this.analyzer.set({'text': text});

      // Fetch data
      this.analyzer.save(null, {
          success: function(response) {
              self.sendToServer();
          },
          error: function(model, response) {
              console.log(response.responseText);
          }
      });
  },

  sendToServer: function() {
    // Save last data
    this.textModel.set({'post_num_sentences': this.analyzer.get('numSentences'),
        'post_num_clusters': this.analyzer.get('numCluster'),
        'post_num_coherent_sentences': this.analyzer.get('cohSentences'),
        'post_num_non_coherent_sentences': this.analyzer.get('cohNotSentences'),
        'post_num_concepts': this.analyzer.get('numConcepts'),
        'post_local_cohesion': this.analyzer.get('local cohesion')});

    // Send data to server
    this.textModel.save(null, {
        success: function(response) {
            // Reload page
            location.reload();
        },
        error: function(model, response) {
            console.log('error');
        }
    });
  }
});

new app.CmapView();
