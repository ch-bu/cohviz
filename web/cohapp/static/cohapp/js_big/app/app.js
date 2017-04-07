var app = app || {};

/**
 * Landing View for application
 */
app.urls = function() {
    this.url =  window.location.href;
    var url_split = this.url.split('/');

    this.url = window.location.href;
    this.split = this.url.split('/');
    this.website = this.split[0] + '//' + this.split[2];
    this.dashboard = this.website + "/dashboard/";

    // Api endpoints
    this.experiments = this.website + '/apis/experiments/';
    this.measurement = this.website + '/apis/measurements/';
    this.experiment = this.website + '/apis/experiment/';
    this.user_specific = this.website + '/apis/user-specific/';
    this.user_experiment = this.website + '/apis/user-experiment';
    this.user_specific_name = this.website + '/apis/user-specific-name/';
    this.user = this.website + '/apis/user-experiment/';
    this.registration = this.website + '/apis/registration/';
    this.groups = this.website + '/apis/groups/';
    this.textanalyzer = this.website + '/apis/textanalyzer/';
    this.textdata = this.website + '/apis/textdata/';
    this.csv_text_data = this.website + '/csv_text_export/';

    this.single_experiment = this.website + '/experiment/';
    this.run_experiment = this.website + '/run-experiment/';

    return this;
}();

/**
 * Constants for app
 */
app.constants = function() {
    this.editor_textinput = ["<p>Der Editor zur Analyse der Kohärenz von Texten.</p>",
        "<p>Schreibe hier deinen Text, klicke auf <em>Analyziere Text</em> und lass dir anzeigen, wie kohärent dein Text ist.</p>"];
    this.toast_textinput = ['Dein Text konnte nicht verarbeitet werden! \
                             Schaue, ob du mindestens zwei Sätze geschrieben hast.'];
    this.simpleRevisionModal = "Sie haben nun die Gelegenheit Ihren Text zu überarbeiten. \
                                Versuchen Sie potentielle Kohärenzbrüche in Ihrem Text zu \
                                schließen und Bezüge zwischen den Konzepten klar darzustellen. \
                                Integrieren Sie in Ihrer Überarbeitung auch Konzepte und Verbindungen \
                                zwischen Konzepten, die Sie eventuell in Ihrem Entwurf noch nicht \
                                bedacht haben.";
    return this;
}();

/**
 * Get id of experiment based on path of url
 * @return {Number} id of experiment
 */
app.getExperimentId = function() {
    var path = window.location.href;
    var experiment_id = path.substr(path.lastIndexOf('/') + 1);

    return experiment_id;
};

app.regExText = function(id) {
    var textToChange = $('#editor-textinput').html();

    // textToChange = textToChange.replace(/CLT/g, 'Cognitive-Load-Theory');
    textToChange = textToChange.replace(/[Cc]ognitive [Ll]oad [Tt]heor(y|(ie))/g, 'Cognitive-Load-Theory');
    // textToChange = textToChange.replace(/[Cc]ognitive [Ll]oad/g, 'Kognitive-Belastung');
    // textToChange = textToChange.replace(/[Kk]ognitiv[rn]? [Bb]elastung/g, 'Kognitive-Belastung');
    textToChange = textToChange.replace(/[Ee]xtrinsischer? [Bb]elastung/g, 'Extrinsische-Belastung');
    textToChange = textToChange.replace(/[Ii]ntrinsischer? [Bb]elastung/g, 'Intrinsische-Belastung');
    textToChange = textToChange.replace(/[Ll]ernbezogener? [Bb]elastung/g, 'Lernbezogene-Belastung');
    textToChange = textToChange.replace(/[Ee]xtrinsic [Ll]oad/, 'Extrinsic-Load');
    textToChange = textToChange.replace(/[Ii]ntrinsic [Ll]oad/g, 'Intrinsic-Load');
    textToChange = textToChange.replace(/[Gg]ermane [Ll]oad/g, 'Germane-Load');
    // textToChange = textToChange.replace(/[Aa]rbeitsgedächtnisses/g, 'Arbeitsgedächtnis');
    textToChange = textToChange.replace(/bzw.?/g, 'beziehungsweise');

    // textToChange = textToChange.replace(/[Ss]ensorischer [Ss]peicher/g, 'Sensorisches-Gedächtnis');
    // textToChange = textToChange.replace(/[Ss]ensorische[sn]? [Gg]edächtnis/g, 'Sensorisches-Gedächtnis');
    // textToChange = textToChange.replace(/[Dd]reispeichermodells?/g, 'Drei-Speicher-Modell');

    $(id).html(textToChange);
};

app.getDifference = function(a, b){
    var i = 0;
    var j = 0;
    var result = "";

    while (j < b.length)
    {
        if (a[i] != b[j] || i == a.length)
            result += b[j];
        else
            i++;
        j++;
    }
    return result.length;
};

/**
 * Get text from multiple paragraphs
 * @param {jQuery Object} div div that includes multiple paragraphs
 */
app.getParagraphs = function(div) {
    var self = this;
    // All paragraphs in text
    var paragraphs = div.find('p');

    // Api needs a single string. We need to get the text from
    // the paragraphs
    var paragraphText = '';

    paragraphs.each(function(paragraph) {
        // Wrap everything in span elements
        var spanText = paragraphs[paragraph].innerText.replace(/([A-z0-9'<>\u00dc\u00fc\u00e4\u00c4\u00f6\u00d6\u00df\-/]+)/g, '<span>$1</span>');

        var jquerySpan = $(spanText);

        paragraphText += paragraphs[paragraph].innerText + " ";

        // Generate spans for text
        $(this).html(jquerySpan);
        $(this).append('.');
    });

    // Remove line breaks from string
    paragraphText.replace(/(\r\n|\n|\r)/gm,"");

    // Remove tabs, newlines and too many spaces
    paragraphText.replace(/\s\s+/g, '');

    return paragraphText.trim();
};

/**
 * Get Plain text with line breaks
 * @param  {[type]} div [description]
 * @return {[type]}     [description]
 */
app.getPlainText = function(div) {
    var self = this;

    var paragraphs = div.find('p');

    var paragraphText = '';

    paragraphs.each(function(paragraph) {
       paragraphText += paragraphs[paragraph].innerText + '|LINE-BREAK|';
    });

    return paragraphText;
};

/**
 * Escape all occurences of string
 * @return {String} Replacements
 */
app.escapeRegExp = function(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
};

app.replaceAll = function(str, find, replace) {
  return str.replace(new RegExp(find, 'g'), replace);
};


app.getCookie = function(name) {
    var cookieValue = null;
    if (document.cookie && document.cookie !== '') {
        var cookies = document.cookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = jQuery.trim(cookies[i]);
            // Does this cookie string begin with the name we want?
            if (cookie.substring(0, name.length + 1) == (name + '=')) {
                cookieValue = decodeURIComponent(cookie.substring(name.length + 1));
                 break;
            }
        }
    }
    return cookieValue;
};

app.csrfSafeMethod = function(method) {
    // these HTTP methods do not require CSRF protection
    return (/^(GET|HEAD|OPTIONS|TRACE)$/.test(method));
};

app.sameOrigin = function(url) {
    // test that a given url is a same-origin URL
    // url could be relative or scheme relative or absolute
    var host = document.location.host; // host + port
    var protocol = document.location.protocol;
    var sr_origin = '//' + host;
    var origin = protocol + sr_origin;
    // Allow absolute or scheme relative URLs to same origin
    return (url == origin || url.slice(0, origin.length + 1) == origin + '/') ||
        (url == sr_origin || url.slice(0, sr_origin.length + 1) == sr_origin + '/') ||
        // or any other URL that isn't scheme relative or absolute i.e relative.
        !(/^(\/\/|http:|https:).*/.test(url));
};

// *
//  * Highlights each paragraph with the corresponding
//  * words
//  * @param  {String}  divId         Id of medium editor
//  * @param  {Array}   clusters      Array of all clusters
//  * @param  {Array}   colors        20 distinct colors
//  * @param  {String}  word          word of cluster that should be highlighted
//  * @param  {Boolean} singleCluster Wheter a single cluster should be highlighted
//  * @return {null}
app.highlightWholeText = function(divId, clusters, colors) {

    var clustersArray = [];

    // Store words of clusters in array
    for (var cluster = 0; cluster < clusters.length; cluster++) {
        clustersArray[cluster] = [].concat.apply([], Object.keys(clusters[cluster]).map(function(key) {
            return [clusters[cluster][key].source.word, clusters[cluster][key].target.word];
        }));
    }

    $(divId).find('p').each(function(paragraph) {
        var textParagraph = $(this).text();
        $(this).html(app.colorText(textParagraph, this, clustersArray, colors));
    });
};


app.colorText = function(text, paragraph, clusters, colors) {
    // Save text in variable
    var newText = text;
    // Get each word in paragraph and remove punctuation from text
    var words = text.replace(/[.,\/#!$%\^&\*;:{}=_`~()]/g,"").split(" ");

    // Split whole text string
    var newTextSplit = newText.replace(/[^\wöäüÄÖÜß-\s]|_/g, function ($1) { return ' ' + $1 + ' ';}).replace(/[ ]+/g, ' ').split(' ');

    // Loop over whole text
    for (var i = 0; i < newTextSplit.length; i++) {
        var splitWord = newTextSplit[i];

        for (var cluster = 0; cluster < clusters.length; cluster++) {
            if ($.inArray(splitWord, clusters[cluster]) != -1) {
                // newTextSplit[i] = splitWord.replace(splitWord,
                //     '<a style="background-color: ' +
                //     colors(cluster) + ';color: #fff;border-radius: 3px; padding: 1px 3px;" class="cluster' + cluster + '">' +
                //     splitWord + '</a>');
                newTextSplit[i] = splitWord.replace(splitWord,
                    '<a style="color: ' +
                    colors(cluster) + ';font-weight: bold" class="cluster' + cluster + '">' +
                    splitWord + '</a>');
            }
        }
    }

    return newTextSplit.join(' ');
};

app.highlightSelectedWord = function(divId, wordSelected, relations, colors, index) {
    var self = this;


    // Loop over every paragraph
    $(divId).find('p').each(function(paragraph) {
        var textParagraph = $(this).text();

        var spanText = textParagraph.replace(/([A-z0-9'<>\u00dc\u00fc\u00e4\u00c4\u00f6\u00d6\u00df\-/]+)/g, '<span>$1</span>');

        var jquerySpan = $(spanText);

        // Change attributes
        spanText = jquerySpan.map(function(obj) {

            // We have a span
            if (jquerySpan[obj].tagName == 'SPAN') {

                var spanElement = jquerySpan[obj];

                // Highlight lemma and orthografical forms
                if (wordSelected == spanElement.innerHTML ||
                    relations[wordSelected].indexOf(spanElement.innerHTML) > -1) {
                    spanElement.style.color = colors(index[wordSelected]);
                    spanElement.className += 'highlight-related';
                    return spanElement;
                }

            }

            return obj;
        });

        // Return paragraph with highlighting
        $(this).html(jquerySpan);
        $(this).append('.');
    });
};

// app.getLinksNodes = function(wordpairs) {
//     // Variable declaration
//     var links = [];
//     var uniqueLinks = [];
//     var nodes = [];
//     var edges = [];

//     // Save all word-pairs in different format
//     wordpairs.forEach(function(pair) {
//         links.push(pair.source['lemma']);
//         links.push(pair.target['lemma']);
//     });

//     // Remove duplicates
//     $.each(links, function(i, el){
//         if($.inArray(el, uniqueLinks) === -1) uniqueLinks.push(el);
//     });

//     $.each(uniqueLinks, function(i) {
//         nodes.push({"index": i, "id": uniqueLinks[i]});
//     });

//     // Generate links
//     $.each(wordpairs, function(i) {
//         // Push to edges
//         edges.push({'source': wordpairs[i].source['lemma'],
//           'target': wordpairs[i].target['lemma']});
//     });

//     // Save nodes and edges to graph object
//     var graph = {
//         "nodes": nodes,
//         "links": edges,
//     };

//     console.log(graph);

//     return graph;
// };


/**
 * Renders a simple concept map of forces
 * @param  {Object} pairs       word-pairs of a text
 * @param  {Object} clust       clusters of words
 * @param  {Number} numClusters number of clusters of a text
 * @param  {String} svgID       id of dom element for svg
 * @param  {Number} height      height of svg
 * @param  {Number} width       width of svg
 */
// app.renderCmap = function(pairs, clust, numClusters, svgID, height, width, colors)  {

// }
