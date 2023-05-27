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
    scrollbarStyle: 'overlay',
    showCursorWhenSelecting: true,
    extraKeys: {
        "Ctrl-/": "toggleComment",
        "Alt-F": "findPersistent"
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
editor.setSize('70vw', '65vh');


// -------------------------------------------------
//          Dynamically changing values
// -------------------------------------------------

const themeSelect = document.getElementById('theme');
const languageSelect = document.getElementById('language');

themeSelect.addEventListener('change', () => {

    // Reading values into variables
    selectedTheme = themeSelect.value;

    // dynamically assigning the required css for theme
    themeLinkTag.href = `dependencies/codemirror-5.65.13/theme/${selectedTheme}.css`;

    // Setting the theme of the editor
    editor.setOption('theme', selectedTheme);   
});

languageSelect.addEventListener('change', () => {

    // Reading values into variables
    let mode = selectedMode = languageSelect.value;
    let codeMirrorMode = `text/x-${selectedMode}`;

    // Turning on functionality
    editor.setOption('autoCloseBrackets', true);
    editor.setOption('matchBrackets', true);

    // Routing between C and C++ code highlighting
    if(selectedMode == 'c' || selectedMode == 'cpp' || selectedMode == 'java'){
        mode = 'clike';
        codeMirrorMode =  (selectedMode == 'c') ? `text/x-csrc` : (selectedMode == 'cpp') ? `text/x-c++src` : `text/x-java`;
    } else if(selectedMode == 'javascript'){
        codeMirrorMode = mode;
    }

    // Setting the mode of the editor after the <script> tag is completely loaded
    modeScriptTag.onload = () => {
        editor.setOption('mode', codeMirrorMode);
    };

    // dynamically assigning the required language highlighting
    modeScriptTag.src = `dependencies/codemirror-5.65.13/mode/${mode}/${mode}.js`;
});

// -------------------------------------------------
//          Toggling Input Text Area
// -------------------------------------------------

// global variables
let inputEnabled = false;

// Regex to check for input statements
const regex = {
    'c': /(scanf|getchar|gets|fgets|getc|fgetc|fscanf|sscanf|scanf_s|getch|getche|kbhit) *\(.*\) *;/,
    'cpp': /(cin|((scanf|getchar|gets|fgets|getc|fgetc|fscanf|sscanf|scanf_s|getch|getche|kbhit|getline) *\(.*\) *;))/,
    'java': /(System.(in|console *\( *\) *;)|read|args *\[ *\w *\])/,
    'python': /(input|getpass|read) *\(.*\)|sys.argv *\[ *\w *]/,
    'javascript': /prompt *\(.*\)|process\.argv *\[ *\w *\]|.*\.value|read|fetch/
};

// Adding event listener to toggle input textarea based on the presense of input statements
editor.on('change', () => {
    let code = editor.getValue();
    let language = selectedMode;

    // Checking if the code has any input statements
    if(language != null && regex[language].test(code)){
        document.getElementById('input').disabled = false;
    } else {
        document.getElementById('input').disabled = true;
    }
});