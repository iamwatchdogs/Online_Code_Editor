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
    lineNumbers: true,
    extraKeys: {
        "Ctrl-/": "toggleComment"
    },
    addons: ["comment/comment.js"],
    comment: {
        lineComment: "//",
        blockCommentStart: "/*",
        blockCommentEnd: "*/",
        padding: " ",
        commentBlankLines: false,
        indent: false,
        fullLines: true
    }
});
editor.setSize('1378px', '645px');


// -------------------------------------------------
//          Dynamically changing values
// -------------------------------------------------

const themeSelect = document.getElementById('theme');
const languageSelect = document.getElementById('language');

themeSelect.addEventListener('change', () => {
    selectedTheme = themeSelect.value;
    themeLinkTag.href = `dependencies/codemirror-5.65.13/theme/${selectedTheme}.css`;
    editor.setOption('theme', selectedTheme);   
});

languageSelect.addEventListener('change', () => {
    let selectedMode = languageSelect.value;
    let codeMirrorMode = `text/x-${selectedMode}`;
    editor.setOption('autoCloseBrackets', true);
    if(selectedMode == 'c' || selectedMode == 'cpp'){
        selectedMode = 'clike';
        codeMirrorMode =  (selectedMode == 'c') ? `text/x-csrc` : `text/x-c++src`;
    }
    modeScriptTag.onload = () => {
        editor.setOption('mode', codeMirrorMode);
    };
    modeScriptTag.src = `dependencies/codemirror-5.65.13/mode/${selectedMode}/${selectedMode}.js`;
});