/**
 * Take an html string and return the inner
 * html of every paragraph
 * @param  {htmlText} A string of an html element
 * @return {String} The inner text of the html element
 */
var getPlainText = function(htmlText) {
    var self = this;

    var htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlText;

    var paragraphs = htmlObject.getElementsByTagName('p');

    var paragraphText = '';

    for (let paragraph = 0; paragraph < paragraphs.length; paragraph++) {
      paragraphText += paragraphs[paragraph].textContent + " ";
      paragraphText += '[LINEBREAK]';
    }

    paragraphText = paragraphText.replace(/&#8660/g, '');
    paragraphText = paragraphText.replace(/⇔/g, '');

    // Remove double LINEBREAKS without content
    paragraphText = paragraphText.replace('[LINEBREAK] [LINEBREAK]', '[LINEBREAK]');

    return paragraphText;
};

export {getPlainText};
