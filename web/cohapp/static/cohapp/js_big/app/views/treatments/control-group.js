var app = app || {};

app.SimpleRevisionView = Backbone.View.extend({

    el: '#treatment-simple-revision',

    events: {
        'click #instruction-read': 'renderEditor',
        'click #help': 'renderInstructionModal',
        'click #editor-button': 'analyzeText',
        'click #save-text': 'saveText',
        // 'click #print': 'printText'
    },

    initialize: function() {
        // Variable declaration
        var self = this;
        this.prePageDurationStart = null;
        this.postPageDurationStart = null;

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

        // Get plain Text
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
        // Render submit button
        this.$el.find('#editor-button-div').html(
                '<a class="waves-effect waves-light btn" id="save-text">Text abschicken</a>');

        // this.$el.append('<i id="print" class="material-icons">print</i>');

        // Save data for draft
        this.textModel.set({
            'pre_num_sentences': this.analyzer.get('numSentences'),
            'pre_num_clusters': this.analyzer.get('numCluster'),
            'pre_num_coherent_sentences': this.analyzer.get('cohSentences'),
            'pre_num_non_coherent_sentences': this.analyzer.get('cohNotSentences'),
            'pre_num_concepts': this.analyzer.get('numConcepts'),
            'pre_local_cohesion': this.analyzer.get('local cohesion')});

        // Change html of modal
        $('#modal-help').find('.modal-content').html(this.userModel.get('instructionreview'));

        // Open revision modal
        $('#modal-help').openModal();
    },

    saveText: function() {
        var self = this;

        // Get plain Text
        var plainText = app.getPlainText(this.$el.find('#editor-textinput'));

        if (app.getDifference(this.textModel.get('pre_text'), plainText) > 5) {

            // Get seconds subject worked for revision
            var revisionElapsed = (new Date() - this.postPageDurationStart) / 1000;

            // Render loading ring
            this.$el.find('#editor-button-div').html(
                Handlebars.templates['loading-ring']());

            // Ge
            var text = app.getParagraphs(this.$el.find('#editor-textinput'));

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

        } else {
            Materialize.toast('Revidieren Sie Ihren Text bitte stärker.', 4000);
        }


    },

    /**
     * Print text as pdf
     * @return {[type]} [description]
     */
    printText: function() {
        // // Get plain Text
        // var plainText = app.getPlainText(this.$el.find('#editor-textinput'));
        // var doc = new jsPDF();
        // var splitText = doc.splitTextToSize(plainText, 180);
        // doc.text(splitText, 10, 10);
        // doc.save('cohviz_textoutput.pdf');
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

new app.SimpleRevisionView();
