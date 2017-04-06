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
      // Get cluster of word

      // Loop over every cluster and see in which cluster the word is
      var clusters = this.analyzer.get('clusters');
      var indexOfCluster = null;

      for (var key in clusters) {
        clusters[key].map(function(d, i) {
          var source = d.source.word;
          var target = d.target.word;

          if (hoveredElement == source || hoveredElement == target) {
            indexOfCluster = key;
          }
        });
      }

      var linkedByIndex = this.simulations[indexOfCluster].linkedByIndex;
      var svg = this.simulations[indexOfCluster].svg;

      // Get selected word
      var nodeSelected = d3.select('#node-' + lemmasForWord[0]);
      var nodeData = nodeSelected.data()[0];

      // Change text of selected element
      var textSelected = nodeSelected.select('text')
        .style('opacity', 1)
        .style('font-weight', 'bold');

      // Highlight adjacent nodes
      svg.selectAll('text')
        .style('opacity', function(d) {
         if (isConnected(nodeData, d)) {
           return 1;
         }

         return 0.1;

        });

      svg.selectAll('circle')
        .style('fill', function(d) {
          if (isConnected(nodeData, d)) {
            return '#000';
          }

          return '#f4f4f4';
        })
        .style('opacity', function(d) {
          if (isConnected(nodeData, d)) {
            return 1;
          }

          return 0.2;
        });

      /////////////////////
      // Highlight links //
      /////////////////////
      svg.selectAll('line')
        .style('stroke', function(d) {
          return d.source.id === nodeData.id || d.target.id === nodeData.id ? '#4c4c4c' : '#f4f4f4';
        });
    }

    function isConnected(a, b) {
      return isConnectedAsTarget(a, b) || isConnectedAsSource(a, b) || a.index == b.index;
    }

    function isConnectedAsSource(a, b) {
      return linkedByIndex[a.index + "," + b.index];
    }

    function isConnectedAsTarget(a, b) {
      return linkedByIndex[b.index + "," + a.index];
    }
  },

  onTextHoverOff: function(e) {
    // var gElement = d3.selectAll('g');

    // gElement.select('circle')
    //   .style('fill', '#ccc');

    // gElement.select('text')
    //   .style('font-weight', 'normal');

    d3.selectAll('text')
       .style('opacity', 0.8)
       .style('font-weight', 'normal');

    d3.selectAll('circle')
      .style('fill', '#ccc')
      .style('opacity', 1);

    d3.selectAll('.links').selectAll('line')
     .style('stroke', '#ccc');
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

    // Loop over every paragraph
    // app.highlightWholeText('#editor-full-medium-editor', this.clusters, this.colors);
  },

  renderCmap: function(pairs, numConcepts, numClusters, svgID, height, width, colors)  {
    var self = this;
    var svgHeight = height / 2;
    var svgWidth = width / 2;
    var margin = {top: 0, right: 0, bottom: 0, left: 0};

    /**
     * Closure
     * @param  {[type]} currentCluster [description]
     * @return {[type]}                [description]
     */
    function runSimulation(currentCluster, clusterIndex) {
      // Save temporary cluster
      var cluster = currentCluster;

      // Get data for force simulation with
      // nodes and links
      var graph = app.getLinksNodes(cluster);

      // Create svg
      var svg = d3.select(svgID).append("svg");
        // .attr("width", svgWidth + margin.left + margin.right)
        // .attr("height", svgHeight + margin.top + margin.bottom);

      // Create force simulation
      var simulation = d3.forceSimulation(graph.nodes)
        .force('charge', d3.forceManyBody().strength(-240))
        .force('link', d3.forceLink(graph.links)
          .distance(200)
          .id(function(d) {
            return d.id;
          }))
        // .force("collide", d3.forceCollide().radius(function(d) { return d.r + 1.5; }).iterations(2))
        .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
        .force('x', d3.forceX())
        .force('y', d3.forceY())
        .stop();

      // Wrap everything in g element
      var g = svg.append('g');

      // Stores all links
      var linkedByIndex = {};

      // Call zoom
      svg.call(d3.zoom()
        .scaleExtent([1 / 10, 10])
        .on('zoom', zoomed));

      var loading = svg.append("text")
        .attr("dy", "0.35em")
        .attr("text-anchor", "middle")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr('x', svgWidth / 2)
        .attr('y', svgHeight / 2)
        .text("Simulating. One moment please…");

      // Run simulation in the background
      d3.timeout(function() {
        loading.remove();

        // See https://github.com/d3/d3-force/blob/master/README.md#simulation_tick
        for (var i = 0, n = Math.ceil(Math.log(simulation.alphaMin()) / Math.log(1 - simulation.alphaDecay())); i < n; ++i) {
          simulation.tick();
        }

        // Add links
        var link = g.append('g')
          .attr('class', 'links')
          .selectAll('line')
          .data(graph.links)
          .enter().append('line')
          .attr("x1", function(d) { return d.source.x; })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        link.each(function(d) {
          linkedByIndex[d.source.index + "," + d.target.index] = true;
        });

        // Add data of simulation globally
        self.simulations[clusterIndex] = {'simulation': simulation, 'linkedByIndex': linkedByIndex, 'svg': svg};

        // Create g element that stores
        // circles and text and call dragging on it
        var node = g.append('g')
          .attr('class', 'nodes')
          .selectAll('.node')
          .data(graph.nodes)
          .enter().append('g')
          .attr('id', function(d, i) {
            return 'node-' + d.id;
          })
          .attr('class', 'node')
          .attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
          })
          .on('mouseover', mouseover)
          .on('mouseout', mouseout);

        // Append circle
        var circle = node.append('circle')
          .attr('r', 10)
          .attr('cx', 0)
          .attr('cy', 0)
          .attr('fill', '#ccc');

        // Append label to node container
        var label = node.append('text')
          .attr('dy', -10)
          .attr('dx', 12)
          .style('opacity', 0.8)
          .attr('text-anchor', 'start')
          .text(function(d) {
            return d.id;
          });
      });

      function mouseover(mouseOverObject) {

        // Get data
        var mouse = d3.mouse(this);

        // Select element that is hovered
        var nodeSelected = g.select('#node-' + mouseOverObject.id);
        var nodeData = nodeSelected.data()[0];

        // Change text of selected element
        var textSelected = nodeSelected.select('text')
          .style('opacity', 1)
          .style('font-weight', 'bold');

        // Highlight adjacent nodes
        svg.selectAll('text')
          .style('opacity', function(d) {
           if (isConnected(nodeData, d)) {
             return 1;
           }

           return 0.1;

          });

        svg.selectAll('circle')
          .style('fill', function(d) {
            if (isConnected(nodeData, d)) {
              return '#000';
            }

            return '#f4f4f4';
          })
          .style('opacity', function(d) {
            if (isConnected(nodeData, d)) {
              return 1;
            }

            return 0.2;
          });

        /////////////////////
        // Highlight links //
        /////////////////////
        svg.selectAll('line')
          .style('stroke', function(d) {
            return d.source.id === nodeData.id || d.target.id === nodeData.id ? '#4c4c4c' : '#f4f4f4';
          });

        /////////////////////////////
        // Highlight words in text //
        /////////////////////////////

        // We need to get the text of the selected word in order
        // to highlight them
        var wordSelected = textSelected.text();

        // Get all words that are semantically related
        // to the selected word
        var wordsRelated = [];

        svg.selectAll('text')
         .each(function(d) {
           if (isConnected(nodeData, d)) {
             wordsRelated.push(d);
           }
         });

        // Get all words and corresponding orthoForms
        // console.log(self.analyzer.toJSON());
        var lemmaWordRelations = self.analyzer.get('lemmaWordRelations');
        var orthos = wordsRelated.map(function(obj) {
          return self.analyzer.get('lemmaWordRelations')[obj.id];
        });

        orthos = [].concat.apply([], orthos);

        app.highlightSelectedWord('#editor-full-medium-editor', orthos);

      }

      function isConnected(a, b) {
        return isConnectedAsTarget(a, b) || isConnectedAsSource(a, b) || a.index == b.index;
      }

      function isConnectedAsSource(a, b) {
        return linkedByIndex[a.index + "," + b.index];
      }

      function isConnectedAsTarget(a, b) {
        return linkedByIndex[b.index + "," + a.index];
      }

      function zoomed() {
        g.attr('transform', d3.event.transform);
      }
    }

    // Create svg for each cluster
    for (var i = 0; i < this.clusters.length; i++) {
      runSimulation(this.clusters[i], i);

    }

    function mouseout() {

      $('#editor-full-medium-editor').find('p').each(function(paragraph) {
        var textParagraph = $(this).text();
        // Wrap everything in span elements
        var spanText = textParagraph.replace(/([A-z0-9'<>\u00dc\u00fc\u00e4\u00c4\u00f6\u00d6\u00df\-/]+)/g, '<span>$1</span>');

        var jquerySpan = $(spanText);

        // Generate spans for text
        $(this).html(jquerySpan);
        $(this).append('.');

      });

      // Get all nodes
      var nodes = d3.selectAll('.node');

      nodes.selectAll('text')
         .style('opacity', 0.8)
         .style('font-weight', 'normal');

      d3.selectAll('circle')
        .style('fill', '#ccc')
        .style('opacity', 1);

      d3.selectAll('.links').selectAll('line')
       .style('stroke', '#ccc');

    }
  }

  // printSVG: function() {
  //  /*
  //   * Prints SVG as pdf
  //   * borrowed from http://stackoverflow.com/questions/21660843/print-only-svg-from-browser
  //   */

  //  var popUpAndPrint = function() {
  //    var container = $('#openapp_svg');
  //    var mySVG = container.find('svg');
  //    var width = mySVG.width();
  //    var height = mySVG.height();

  //    // Open new window
  //    var printWindow = window.open('', 'SVG',
  //    'width=' + width + ',height=' + height);

  //    // Open and close HTML output stream
  //    printWindow.document.writeln('<link rel="stylesheet" href="/static/cohapp/css/custom.css" type="text/css">');
  //    printWindow.document.writeln($(container).html());
  //    printWindow.document.close();

  //    // Wait until pop up window is loaded
  //    // http://stackoverflow.com/questions/15890448/java-script-printing-out-a-blank-page
  //    $(printWindow).on('load', function() {
  //      printWindow.print();
  //      printWindow.close();
  //    });
  //  };

  //  setTimeout(popUpAndPrint, 500);
  // }

});

if (window.location.pathname == '/') {
  new app.LandingView();
}
