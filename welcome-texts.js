var request = new XMLHttpRequest();
request.onload = function() {
    var fileContent = this.responseText;
    console.log(this.responseText)
    var fileContentTexts = fileContent.split( '\n\n' );
    console.log(fileContentTexts.length);
    console.log(fileContentTexts[0]);
    var randomLineIndex = Math.floor( Math.random() * fileContentTexts.length );
    var randomText = fileContentTexts[ randomLineIndex ];
    document.getElementById( '#welcome-text' ).innerHTML = randomText;
};
request.open( 'GET', 'welcome-texts.txt', true );
request.send();
