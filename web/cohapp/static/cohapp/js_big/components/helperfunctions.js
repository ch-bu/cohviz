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
    }

    paragraphText = paragraphText.replace('&#9849;', '');
    paragraphText = paragraphText.replace('⇔', '');

    return paragraphText;
};

export {getPlainText};
