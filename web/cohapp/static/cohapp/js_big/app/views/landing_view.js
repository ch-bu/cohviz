var app = app || {};

app.LandingView = Backbone.View.extend({

  el: $('#landingview'),

  events: {
    'click #editor-button': 'analyzeText',
    'click #editor-full-button': 'reanalyzeText'
  },

  initialize: function () {
    // Assign self to this
    var self = this;

    // Generate 20 distinct colors
    this.colors = d3.scaleOrdinal(d3.schemeCategory10);

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
    var svgWidth = (width / 2);
    var margin = {top: 0, right: 0, bottom: 0, left: 0};

    /**
     * Closure
     * @param  {[type]} currentCluster [description]
     * @return {[type]}                [description]
     */
    function runSimulation(currentCluster) {
      // Save temporary cluster
      var cluster = currentCluster;

      // Get data for force simulation with
      // nodes and links
      var graph = app.getLinksNodes(cluster);

      // Create svg
      var svg = d3.select(svgID).append("svg")
        .attr("width", svgWidth + margin.left + margin.right)
        .attr("height", svgHeight + margin.top + margin.bottom);

      // Create force simulation
      var simulation = d3.forceSimulation(graph.nodes)
        .force('charge', d3.forceManyBody().strength(-100))
        // .force('link', d3.forceLink(graph.links).distance(20).strength(1).iterations(10))
        .force('link', d3.forceLink(graph.links)
          .distance(90)
          .id(function(d) {
            return d.id;
          }))
        .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
        .force('x', d3.forceX())
        .force('y', d3.forceY())
        .stop();

      // Wrap everything in g element
      var g = svg.append('g');

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
          .attr("x1", function(d) {
            // console.log(d);
            return d.source.x;
          })
          .attr("y1", function(d) { return d.source.y; })
          .attr("x2", function(d) { return d.target.x; })
          .attr("y2", function(d) { return d.target.y; });

        // Create g element that stores
        // circles and text and call dragging on it
        var node = g.append('g')
          .attr('class', 'nodes')
          .selectAll('.node')
          .data(graph.nodes)
          .enter().append('g')
          .attr('class', 'node')
          .attr('transform', function(d) {
            return 'translate(' + d.x + ',' + d.y + ')';
          });
          // .attr('transform'))
          // .attr("x", function(d) {
          //   console.log(d);
          //   return d.x;
          // })
          // .attr("y", function(d) { return d.y; });

        // Append label to node container
        var label = node.append('text')
          .attr('dy', '0')
          .attr('dx', '0')
          .attr('text-anchor', 'middle')
          .text(function(d) {
            return d.id;
          });
          // .attr('x', function(d) { return d.source.x; })
          // .attr('y', function(d) { return d.source.y; });
      });
    }

    // Create svg for each cluster
    for (var i = 0; i < this.clusters.length; i++) {
      console.log(this.clusters[i]);
      runSimulation(this.clusters[i]);

    }

    // /**
    //  * Tick function adds x and y
    //  * coordinates to nodes and links
    //  */
    // function ticked() {
    //   // Update links
    //   link
    //     .attr('x1', function(d) {
    //       // console.log(d);
    //       return d.source.x;
    //     })
    //     .attr('y1', function(d) { return d.source.y; })
    //     .attr('x2', function(d) { return d.target.x; })
    //     .attr('y2', function(d) { return d.target.y; });

    //   // var xTest = Math.max(6, Math.min(svgWidth, d.x));
    //   // var yTest = Math.max(6, Math.min(svgHeight, d.y));

    //   // Update nodes
    //   node.attr('transform', function(d) {
    //     // console.log(d);
    //     // var xTest = Math.max(25, Math.min(svgWidth, d.x));
    //     // var yTest = Math.max(25, Math.min(svgHeight, d.y));

    //     // return 'translate(' + xTest + ',' + yTest + ')';
    //     return 'translate(' + d.x + ',' + d.y + ')';
    //   });
    // }
      // console.log(cluster);

    // ****************** Render SVG ***************************************
    // Variable declaration
    // var clusters = clust;
    // var lemmaDic = this.analyzer.get('lemmaDic');
    // var graph = app.getLinksNodes(pairs);

    // console.log(graph);

    // // // Adjust height of svg
    // var svgHeight = height;
    // var svgWidth = width;
    // var windowHeight = $(window).height();

    // // Append rectangle to svg
    // var rect = svg.append("rect")
    //   .attr("width", svgWidth)
    //   .attr("height", svgHeight)
    //   .style("fill", "none")
    //   .style("pointer-events", "all");

    // ///////////////////////////////
    // // Enable zoom functionality //
    // ///////////////////////////////

    // // Call zoom
    // // svg.call(d3.zoom()
    // //   .scaleExtent([1 / 10, 10])
    // //   .on('zoom', zoomed));

    // // Wrap everything in g element
    // var g = svg.append('g')
    //   .on('mouseover', mouseover)
    //   .on('mouseout', mouseout);

    // /**
    //  * Zoom function
    //  */
    // // function zoomed() {
    // //   g.attr('transform', d3.event.transform);
    // // }

    // // Add links
    // var link = g.append('g')
    //   .attr('class', 'links')
    //   .selectAll('line')
    //   .data(graph.links)
    //   .enter().append('line');

    // // Create g element that stores
    // // circles and text and call dragging on it
    // var node = g.append('g')
    //   .attr('class', 'nodes')
    //   .selectAll('.node')
    //   .data(graph.nodes)
    //   .enter().append('g')
    //   .attr('class', 'node')
    //   .call(d3.drag()
    //     .on('start', dragstarted)
    //     .on('drag', dragged)
    //     .on('end', dragended));

    // // Append cirles to node
    // // var circles = node.append('circle')
    // //   // .attr('class', 'nodes')
    // //   .attr('r', 15)
    // //   .attr('cx', 0)
    // //   .attr('cy', 0)
    // //   // .attr('ry', 2)
    // //   // .style("fill", function (word) {
    // //   //  // Loop over every cluster
    // //   //  for (var i = 0; i < clusters.length; i++) {
    // //   //    // Check if current word is in current Array
    // //   //    if ($.inArray(word.id, clusters[i]) != -1) {
    // //   //      // Return color if word war found in array
    // //   //      return colors(i);
    // //   //    }
    // //   //  }
    // //   // })
    // //   .style('opacity', 0.6);

    // // Append label to node container
    // var label = node.append('text')
    //   .attr('dy', '0')
    //   .attr('dx', '0')
    //   .attr('text-anchor', 'middle')
    //   .text(function(d) {
    //     return d.id;
    //   });



    // function dragstarted(d) {
    //   if (!d3.event.active) simulation.alphaTarget(0.3).restart();
    //   d.fx = d.x;
    //   d.fy = d.y;
    // }

    // function dragged(d) {
    //   d.fx = d3.event.x;
    //   d.fy = d3.event.y;
    // }

    // function dragended(d) {
    //   if (!d3.event.active) simulation.alphaTarget(0);
    //   d.fx = null;
    //   d.fy = null;
    // }

    // function mouseout() {
    //   // $('#editor-full-medium-editor').find('p').each(function(paragraph) {
    //   //  var textParagraph = $(this).text();
    //   //  // console.log(textParagraph);

    //   //  $(this).html(textParagraph);
    //   // });

    //   // // Get all nodes
    //   var nodes = d3.selectAll('.node');

    //   nodes.selectAll('circle')
    //     .style('opacity', 0.6);
    //     // .attr('r', 15);

    //   nodes.selectAll('text')
    //    .style('opacity', 0.6)
    //    .style('font-weight', 'normal');

    //   d3.selectAll('.links').selectAll('line')
    //    .style('stroke', '#ccc');

    // }

    // function mouseover() {
    //   // Get data
    //   var mouse = d3.mouse(this);
    //   var obj = simulation.find(mouse[0], mouse[1]);

    //   //////////////////////
    //   // Selected element //
    //   //////////////////////
    //   var nodeSelected = d3.selectAll('.node')
    //     .filter(function(d) {
    //       return d.id == obj.id;
    //     });

    //   var textSelected = nodeSelected.select('text')
    //    .style('opacity', 1)
    //    // .style('font-size', 20)
    //    .style('font-weight', 'bold');

    //   // nodeSelected.select('circle')
    //   //  .attr('r', 25);

    //   //////////////////////////////
    //   // Highlight adjacent nodes //
    //   //////////////////////////////
    //   // node.selectAll('circle')
    //   //   // .transition()
    //   //   // .duration(20)
    //   //   .style('opacity', function(d) {
    //   //     if (isConnected(obj, d)) {
    //   //       return 1;
    //   //     }

    //   //     return 0.6;
    //   //   });

    //   node.selectAll('text')
    //    // .transition()
    //    // .duration(20)
    //    .style('opacity', function(d) {

    //      if (isConnected(obj, d)) {
    //        return 1;
    //      }

    //      return 0.6;

    //    });
    //    // .style('font-weight', 'bold');

    //   /////////////////////
    //   // Highlight links //
    //   /////////////////////
    //   link
    //     .style('stroke', function(d) {
    //       return d.source.id === obj.id || d.target.id === obj.id ? '#4c4c4c' : '#ccc';
    //     });


    //   ////////////////////////
    //   // Unselected element //
    //   ////////////////////////
    //   // var nodeUnselected = d3.selectAll('.node')
    //   //  .filter(function(d) {
    //   //    return d.id != obj.id;
    //   //  });

    //   // nodeUnselected.select('text')
    //   //  .style('font-size', 16)
    //   //  .style('font-weight', 'normal');

    //   // nodeUnselected.select('circle')
    //   //  .attr('r', 15);

    //   /////////////////////////////
    //   // Highlight words in text //
    //   /////////////////////////////

    //   // We need to get the text of the selected word in order
    //   // to highlight them
    //   // var wordSelected = textSelected.text();

    //   // // Get all words that are semantically related
    //   // // to the selected word
    //   // var wordsUnselected = [];
    //   // node.selectAll('text')
    //   //  .each(function(d) {
    //   //    if (isConnected(obj, d)) {
    //   //      wordsUnselected.push(d.id);
    //   //    }
    //   //  });

    //   // Remove selected word
    //   // var index = wordsUnselected.indexOf(wordSelected);

    //   // Update unselected words without selected word
    //   // wordsUnselected.splice(index, 1);

    //   // app.highlightSelectedWord('#editor-full-medium-editor', wordSelected, wordsUnselected, lemmaDic, clusters,
    //   //  self.colors);
    // }

    // function isConnected(a, b) {
    //   return isConnectedAsTarget(a, b) || isConnectedAsSource(a, b) || a.index == b.index;
    // }

    // function isConnectedAsSource(a, b) {
    //   return linkedByIndex[a.index + "," + b.index];
    // }

    // function isConnectedAsTarget(a, b) {
    //   return linkedByIndex[b.index + "," + a.index];
    // }
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
