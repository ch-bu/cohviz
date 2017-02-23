(function($) {


	// ===================== Experiment Model =================
    var TextAnalyzerModel = Backbone.Model.extend({
        url: url_api_textanalyzer
    });


	// ===================== View ============================================
	var ListView = Backbone.View.extend({

		el: $('#openapp'),

		events: {
			// 'click #openapp_analyze_button': 'analyzeText',
			// 'click #openapp_print_svg': 'printSVG'
		},

		initialize: function () {
			// fixes loss of context for 'this' within methods
			// Bind methods on object
			// _.bindAll(this, 'analyzeText');

			var editor = new MediumEditor('#index_textinput', {
				toolbar: false
			});

			// // Templates
			// this.template_loading_ring = _.template($('#loading-ring-template').html());

			// // Variable declaration
			// this.textarea = $('#openapp_textarea').find('textarea');
			// this.svgDiv = $('#openapp_svg');
			// this.openappDiv = $('#openapp');
			// this.firstRender = true;

			// // Focus textarea
			// this.textarea.focus();

			// // Initialize models
			// this.analyzer = new TextAnalyzerModel();

			// // Render height of first section
			// this.openappDiv.height($(window).height());

			// // Render height of textarea
			// this.textarea.height(this.openappDiv.height() * 0.75);
			
			// // Render svg
			// this.analyzeText();
		
		},

		// analyzeText: function() {

		// 	var self = this;

		// 	// Render SVG 
		// 	var demoText = "Cohapp ist eine App, die die Kohärenz von Texten untersucht. ";
		// 	demoText += "Cohapp verbindet Akkusative, Nominative, Dative und Genitive pro Satz ";
		// 	demoText += "und verbindet diese Kasuse miteinander. ";
		// 	demoText += "Die Kohärenz des Textes wird durch diese Verbindungen angezeigt. ";
		// 	demoText += "Die Software stellt Brüche durch verschiedene Fragmente dar. ";
		// 	demoText += "Brüche entstehen, wenn Nomen eines Fragments mit keinem anderen Nomen ";
		// 	demoText += "der anderen Fragmente verbunden sind. ";
		// 	demoText += "Geben Sie einen Text zu einem Thema Ihrer Wahl ein. Auf Grundlage ";
		// 	demoText += "der Visualisierung können Sie die Kohärenz ihres Textes verbessern. ";
		// 	demoText += "Das Scroolrad Ihrer Maus können Sie benutzen, um die Fragmente deutlicher zu sehen.";

		// 	// Remove multiple spaces
		// 	demoText = demoText.replace(/[„“]/g, "");
		// 	demoText = demoText.replace(/&rdquo/g, "");

		// 	// Display loading ring
		// 	this.svgDiv.html(this.template_loading_ring());

		// 	if (this.firstRender === true) {
		// 		this.textarea.val(demoText);
		// 		this.analyzer.set({'text': demoText});
		// 		this.firstRender = false;
		// 	} else {
		// 		// Get text
		// 		this.analyzer.set({'text': this.textarea.val()});
		// 	}
			
			
		// 	// Fetch data from server
		// 	this.analyzer.save(null, {
		// 		success: function(response) {
		// 			self.renderSVG();
		// 		},
		// 		error: function(model, response) {
		// 			console.log(response.responseText);
		// 		}
		// 	});
			
		// },

		// renderSVG: function() {

		// 	// Remove loading ring
		// 	this.svgDiv.empty();

		// 	// Define height and width of svg
		// 	// var svgHeight = $('#openapp_svg').height();
		// 	var svgHeight = $('#openapp_textarea').height() + 10;
		// 	var svgWidth = $('#openapp_svg').width();

		// 	console.log(this.analyzer.get('word_pairs'));

		// 	// Render SVG
		// 	// renderCmap(this.analyzer.get('word_pairs'), this.analyzer.get('clusters'),
		// 	// 	this.analyzer.get('numClusters'), '#openapp_svg',
		// 	// 	svgHeight, svgWidth);
		// },

		// printSVG: function() {
		// 	/*
		// 	 * Prints SVG as pdf 
		// 	 * borrowed from http://stackoverflow.com/questions/21660843/print-only-svg-from-browser
		// 	 */
			
		// 	var popUpAndPrint = function() {
		// 		var container = $('#openapp_svg');
		// 		var mySVG = container.find('svg');
		// 		var width = mySVG.width();
		// 		var height = mySVG.height();

		// 		// Open new window
		// 		var printWindow = window.open('', 'SVG',
		// 		'width=' + width + ',height=' + height);

		// 		// Open and close HTML output stream
		// 		printWindow.document.writeln('<link rel="stylesheet" href="/static/cohapp/css/custom.css" type="text/css">');
		// 		printWindow.document.writeln($(container).html());
		// 		printWindow.document.close();

		// 		// Wait until pop up window is loaded
		// 		// http://stackoverflow.com/questions/15890448/java-script-printing-out-a-blank-page
		// 		$(printWindow).on('load', function() {
		// 			printWindow.print();
		// 			printWindow.close();
		// 		});
		// 	};
		
		// 	setTimeout(popUpAndPrint, 500);
		// }

	});

	var listView = new ListView();

})(jQuery);