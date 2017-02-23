var app = app || {};


app.CmapView = Backbone.View.extend({

    el: '#treatment-cmap-integrated',

    events: {
        'click #instruction-read': 'renderEditor',
        'click #help': 'renderInstructionModal',
        'click #editor-button': 'analyzeText',
        'click #editor-full-button': 'saveText',
    },

    initialize: function() {
        // Variable declaration
        var self = this;
        this.prePageDurationStart = null;
        this.postPageDurationStart = null;

        // Generate 20 distinct colors for the cmap
        this.colors = d3.scaleOrdinal(d3.schemeCategory10);
        
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

        // Check if text is long enough
        if (text.length < 1000) {
            // Display toast
            Materialize.toast('Ihr Text ist leider zu kurz.', 4000);
        } else {
            // Stop timer for draft
            var draftElapsed = (new Date() - this.prePageDurationStart) / 1000;

            // Start timer for text revision
            this.postPageDurationStart = new Date();

            // Set draft time and draftText to textModel
            this.textModel.set({'pre_page_duration': draftElapsed,
                                'pre_text': text});

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
        this.textModel.set({'pre_text': this.analyzer.get('text'),
            'pre_num_sentences': this.analyzer.get('numSentences'),
            'pre_num_clusters': this.analyzer.get('numClusters'),
            'pre_num_coherent_sentences': this.analyzer.get('cohSentences'),
            'pre_num_non_coherent_sentences': this.analyzer.get('cohNotSentences'),
            'pre_num_concepts': this.analyzer.get('numConcepts')});

        // Get inner html of text input
        this.paragraphs = $('#editor-textinput').html();

        // Change inner html
        this.$el.html(Handlebars.templates['editor-full']({'instruction':
            app.constants.simpleRevisionModal}));

        //  Append help button to window
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
        this.$el.append(Handlebars.templates['modal-help']({'instruction':
            this.userModel.get('instructionreview')}));
        $('#modal-help').openModal();

        // Set width of height of svg element
        var svgWidth = $('#editor-full-graph').width();
        var svgHeight = $('#editor-full-medium-editor').height();

        // Render graph
        this.renderCmap(this.analyzer.get('word_pairs'),
            this.analyzer.get('clusters'), this.analyzer.get('numClusters'),
            '#editor-full-graph', svgHeight, svgWidth, this.colors);
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

        // Remove unnecessary white spaces
        text = text.replace(/\s\,/g, ',');
        text = text.replace(/\s\./g, '.');
        text = text.replace(/\s!/g, '!');
        text = text.replace(/\[\s/g, '[');
        text = text.replace(/\s&/g, '&');
        text = text.replace(/\s`/g, '`');
        text = text.replace(/\s~/g, '~');
        text = text.replace(/\s;/g, ';');
        text = text.replace(/\s_/g, '_');
        text = text.replace(/\s]/g, ']');
        text = text.replace(/\s:/g, ':');
        text = text.replace(/\s\?/g, '?');
        text = text.replace(/\(\s/g, '(');
        text = text.replace(/\s\)/g, ')');
        text = text.replace(/\s\//g, '/');

        // Save post text to textModel
        this.textModel.set({'post_text': text,
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
            'post_num_clusters': this.analyzer.get('numClusters'),
            'post_num_coherent_sentences': this.analyzer.get('cohSentences'),
            'post_num_non_coherent_sentences': this.analyzer.get('cohNotSentences'),
            'post_num_concepts': this.analyzer.get('numConcepts')});
        
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
    },


    renderCmap: function(pairs, clust, numClusters, svgID, height, width, colors)  {
        var self = this;
    
        // ****************** Render SVG ***************************************
        // Variable declaration
        var clusters = clust;
        var lemmaDic = this.analyzer.get('lemmaDic');
        var graph = app.getLinksNodes(pairs);

        // // Adjust height of svg
        var svgHeight = height;
        var svgWidth = width;
        var windowHeight = $(window).height();

        // Set margin and width
        var margin = {top: 0, right: 0, bottom: 0, left: 0};

        // Select svg
        var svg = d3.select(svgID).append("svg")
            .attr("width", svgWidth + margin.left + margin.right)
            .attr("height", svgHeight + margin.top + margin.bottom);

        // Append rectangle to svg
        var rect = svg.append("rect")
            .attr("width", svgWidth)
            .attr("height", svgHeight)
            .style("fill", "none")
            .style("pointer-events", "all");

        // Create new force simulation
        var simulation = d3.forceSimulation()
            .force('link', d3.forceLink().id(function(d) {
                return d.id;
            }))
            .force('charge', d3.forceManyBody().strength(50))
            .force('center', d3.forceCenter(svgWidth / 2, svgHeight / 2))
            .force('collide', d3.forceCollide(40).iterations(60));

        ///////////////////////////////
        // Enable zoom functionality //
        ///////////////////////////////
        
        // Call zoom
        svg.call(d3.zoom()
            .scaleExtent([1 / 10, 10])
            .on('zoom', zoomed));

        // Wrap everything in g element
        var g = svg.append('g')
            .on('mouseover', mouseover)
            .on('mouseout', mouseout);

        /**
         * Zoom function
         */
        function zoomed() {
            g.attr('transform', d3.event.transform);
        }
        
        // Add links
        var link = g.append('g')
            .attr('class', 'links')
            .selectAll('line')
            .data(graph.links)
            .enter().append('line');

        // Create g element that stores
        // circles and text and call dragging on it
        var node = g.append('g')
            .attr('class', 'nodes')
            .selectAll('.node')
            .data(graph.nodes)
            .enter().append('g')
            .attr('class', 'node')
            .call(d3.drag()
                .on('start', dragstarted)
                .on('drag', dragged)
                .on('end', dragended));
        
        // Append cirles to node
        var circles = node.append('circle')
            // .attr('class', 'nodes')
            .attr('r', 15)
            .attr('cx', 0)
            .attr('cy', 0)
            // .attr('ry', 2)
            .style("fill", function (word) {
                // Loop over every cluster
                for (var i = 0; i < clusters.length; i++) {
                    // Check if current word is in current Array
                    if ($.inArray(word.id, clusters[i]) != -1) {
                        // Return color if word war found in array
                        return colors(i);
                    }
                }
            })
            .style('opacity', 0.6);

        // Append label to node container
        var label = node.append('text')
            .attr('dy', '-.35em')
            .attr('dx', '1.4em')
            .text(function(d) {
                return d.id;
            });

        // Add nodes to simulation
        simulation
            .nodes(graph.nodes)
            .on('tick', ticked);

        // Add links to simulation
        simulation.force('link')
            .links(graph.links);

        var linkedByIndex = {};
            link.each(function(d) {
                linkedByIndex[d.source.index + "," + d.target.index] = true;
            });

        /**
         * Tick function adds x and y
         * coordinates to nodes and links
         */
        function ticked() {
            // Update links
            link
                .attr('x1', function(d) { return d.source.x; })
                .attr('y1', function(d) { return d.source.y; })
                .attr('x2', function(d) { return d.target.x; })
                .attr('y2', function(d) { return d.target.y; });

            // Update nodes
            node.attr('transform', function(d) {
                return 'translate(' + d.x + ',' + d.y + ')';
            });
        }

        function dragstarted(d) {
            if (!d3.event.active) simulation.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
        }

        function dragged(d) {
            d.fx = d3.event.x;
            d.fy = d3.event.y;
        }

        function dragended(d) {
            if (!d3.event.active) simulation.alphaTarget(0);
            d.fx = null;
            d.fy = null;
        }

        function mouseout() {
            $('#editor-full-medium-editor').find('p').each(function(paragraph) {
                var textParagraph = $(this).text();
                // console.log(textParagraph);

                $(this).html(textParagraph);
            });

            // Get all nodes
            var nodes = d3.selectAll('.node');

            nodes.selectAll('circle')
                .style('opacity', 0.6)
                .attr('r', 15);

            nodes.selectAll('text')
                .style('opacity', 0);

            d3.selectAll('.links').selectAll('line')
                .style('stroke', '#ccc');

        }

        function mouseover() {
            // Get data
            var mouse = d3.mouse(this);
            var obj = simulation.find(mouse[0], mouse[1]);
            
            //////////////////////
            // Selected element //
            //////////////////////
            var nodeSelected = d3.selectAll('.node')
                .filter(function(d) {
                    return d.id == obj.id;
                });

            var textSelected = nodeSelected.select('text')
                .style('opacity', 1)
                .style('font-size', 20)
                .style('font-weight', 'bold');

            nodeSelected.select('circle')
                .attr('r', 25);

            //////////////////////////////
            // Highlight adjacent nodes //
            //////////////////////////////
            node.selectAll('circle')
                // .transition()
                // .duration(20)
                .style('opacity', function(d) {

                    if (isConnected(obj, d)) {
                        return 1;
                    }

                    return 0.6;
                });

            node.selectAll('text')
                // .transition()
                // .duration(20)
                .style('opacity', function(d) {

                    if (isConnected(obj, d)) {
                        return 1;
                    }

                    return 0;

                });

            /////////////////////
            // Highlight links //
            /////////////////////
            link
                // .transition()
                // .duration(20)
                .style('stroke', function(d) {
                    return d.source.id === obj.id || d.target.id === obj.id ? '#000' : '#ccc';
                });


            ////////////////////////
            // Unselected element //
            ////////////////////////
            var nodeUnselected = d3.selectAll('.node')
                .filter(function(d) {
                    return d.id != obj.id;
                });

            nodeUnselected.select('text')
                .style('font-size', 16)
                .style('font-weight', 'normal');

            nodeUnselected.select('circle')
                .attr('r', 15);

            /////////////////////////////
            // Highlight words in text //
            /////////////////////////////
            
            // We need to get the text of the selected word in order
            // to highlight them
            var wordSelected = textSelected.text();
            
            // Get all words that are semantically related
            // to the selected word
            var wordsUnselected = [];
            node.selectAll('text')
                .each(function(d) {
                    if (isConnected(obj, d)) {
                        wordsUnselected.push(d.id);
                    }
                });

            // Remove selected word
            var index = wordsUnselected.indexOf(wordSelected);

            // Update unselected words without selected word
            wordsUnselected.splice(index, 1);

            app.highlightSelectedWord('#editor-full-medium-editor', wordSelected,
                wordsUnselected, lemmaDic, clusters, self.colors);
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
    }


});

new app.CmapView();
