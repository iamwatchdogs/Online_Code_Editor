// -------------------------------------------------
//                Global Variables
// -------------------------------------------------
let selectedMode = null;        // by default no particular lanugage selected
let selectedTheme = 'darcula';  // by default 'darcula' theme 

// -------------------------------------------------
//               Adding doc elements
// -------------------------------------------------

// creating doc elements
let themeLinkTag = document.createElement('link');
let modeScriptTag = document.createElement('script');

// Set the attributes for the link element
themeLinkTag.rel = 'stylesheet';
themeLinkTag.type = 'text/css';
themeLinkTag.href = `dependencies/codemirror-5.65.13/theme/${selectedTheme}.css`;

// Set the attributes for the script element
modeScriptTag.type = 'text/javascript';

// Appending the doc elements to the head of the document
document.head.appendChild(themeLinkTag);
document.head.appendChild(modeScriptTag);

// -------------------------------------------------
//      Linking CodeMirror with my textarea
// -------------------------------------------------
let editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
    theme: selectedTheme,
    lineWrapping: true,
    lineNumbers: true
});
editor.setSize('1378px', '645px');