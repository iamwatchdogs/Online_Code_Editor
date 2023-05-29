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
CodeMirror.modeURL = 'dependencies/codemirror-5.65.13/mode/%N/%N.js';

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
    selectedMode = languageSelect.value;

    // Adding Additional functionality when a mode is selected
    editor.setOption('autoCloseBrackets', true);
    editor.setOption('matchBrackets', true);
  
     // Routing between C, C++, Java & Javascript code highlighting
    const codeMirrorMIME = CodeMirror.findModeByExtension(selectedMode).mime;
    const codeMirrormode = CodeMirror.findModeByExtension(selectedMode).mode;
  
    // Dynamically load the script only if it hasn't been loaded before
    const scriptSrc = `dependencies/codemirror-5.65.13/mode/${codeMirrormode}/${codeMirrormode}.js`;

    // Replace the src attribute of the existing script tag
    modeScriptTag.setAttribute('src', scriptSrc);
    
    // Script has already been loaded, update the mode directly
    editor.setOption('mode', codeMirrorMIME);
    CodeMirror.autoLoadMode(editor, codeMirrormode);

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
    'py': /(input|getpass|read) *\(.*\)|sys.argv *\[ *\w *]/,
    'js': /prompt *\(.*\)|process\.argv *\[ *\w *\]|.*\.value|read|fetch/
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
        document.getElementById('input').value = '';
    }
});

// -------------------------------------------------
//          Validating POST Request
// -------------------------------------------------

const validate = () => {
    if(inputEnabled && document.getElementById('input').value === ''){
        alert('Please enter some input');
        return false;
    }
    return true;
};

// -------------------------------------------------
//          Handling POST Request
// -------------------------------------------------

const outputTextArea = document.getElementById('output');

document.getElementById('code').addEventListener('submit', (event) => {
    event.preventDefault();

    document.getElementById('output').value = '';

    const formData = new FormData(event.target);
    const requestData = {};

    formData.forEach(function(value, key) {
        requestData[key] = value;
    });

    const xhr = new XMLHttpRequest();
    
    xhr.open('POST', 'core.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    xhr.onreadystatechange = () => {
        if (xhr.readyState === XMLHttpRequest.DONE) {
            if (xhr.status === 200) {
                // Handle the successful response
                const response = JSON.parse(xhr.responseText);
                outputTextArea.style.color = (response['output'] !== '' || response['error'] === '') ? 'white' : 'red';
                outputTextArea.value = (response['output'] !== '' || response['error'] === '') ? response['output'] : response['error'];
            } else {
                // Handle the error response
                const errorLog = `Request failed with status ${xhr.status}.`;
                console.error(errorLog);
                outputTextArea.style.color = 'red';
                outputTextArea.style.value = errorLog;
            }
        }
    };

    xhr.send(JSON.stringify(requestData));
});

// -------------------------------------------------
//          Customizing the reset button
// -------------------------------------------------

document.getElementById('reset').addEventListener('click', () => {

    // DOM variable
    const inputTextArea = document.getElementById('input');
    const outputTextArea = document.getElementById('output');

    // Resetting the input and output text areas
    inputTextArea.value = '';
    outputTextArea.value = '';

    // Resetting the theme source files
    themeLinkTag.href = 'dependencies/codemirror-5.65.13/theme/darcula.css';
    modeScriptTag.src = ' ';

    // Resetting the editor
    editor.setValue('');
    editor.clearHistory();
    editor.setOption('mode','text/plain');
    CodeMirror.autoLoadMode(editor, null);
    editor.setOption('theme','darcula');
    editor.setOption('autoCloseBrackets', false);
    editor.setOption('matchBrackets', false);
});