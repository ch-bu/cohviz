var getPlainText = function(htmlText) {
    var self = this;

    var htmlObject = document.createElement('div');
    htmlObject.innerHTML = htmlText;

    var paragraphs = htmlObject.getElementsByTagName('p');

    var paragraphText = '';

    // console.log(paragraphs);

    for (let paragraph = 0; paragraph < paragraphs.length; paragraph++) {
      paragraphText += paragraphs[paragraph].innerText + " ";
    }
    // paragraphs.each(function(paragraph) {
    //    paragraphText += paragraphs[paragraph].innerText + " ";
    // });

    return paragraphText;
};

export {getPlainText};
