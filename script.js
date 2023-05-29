// -------------------------------------------------
//                Global Variables
// -------------------------------------------------
let selectedTheme = 'darcula';  // by default 'darcula' theme 

// -------------------------------------------------
//               Adding doc elements
// -------------------------------------------------

// creating doc elements
const themeLinkTag = document.createElement('link');
const modeScriptTag = document.createElement('script');

// Set the attributes for the link element
themeLinkTag.rel = 'stylesheet';
themeLinkTag.type = 'text/css';
themeLinkTag.href = `dependencies/codemirror-5.65.13/theme/${selectedTheme}.css`;

// Set the attributes for the script element
modeScriptTag.type = 'text/javascript';

// Appending the doc elements to the head of the document
document.head.appendChild(themeLinkTag);

// -------------------------------------------------
//      Linking CodeMirror with my textarea
// -------------------------------------------------
const editor = CodeMirror.fromTextArea(document.getElementById("code-editor"), {
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
editor.setSize('70vw', '65vh');         /*  Setting height and Width of the code editor   */


// -------------------------------------------------
//          Dynamically changing values
// -------------------------------------------------

// Creating DOM reference object to access theme & language
const themeSelect = document.getElementById('theme');
const languageSelect = document.getElementById('language');

// Overriding the default modeURL of CodeMirror for this project
CodeMirror.modeURL = 'dependencies/codemirror-5.65.13/mode/%N/%N.js';

// Event Listener for changing theme
themeSelect.addEventListener('change', () => {
    
    // Reading values into variables
    selectedTheme = themeSelect.value;

    // dynamically assigning the required css for theme
    themeLinkTag.href = `dependencies/codemirror-5.65.13/theme/${selectedTheme}.css`;
    
    // Setting the theme of the editor
    editor.setOption('theme', selectedTheme);   
});

// Event Listener for changing mode (or) language-based code highlighting
languageSelect.addEventListener('change', () => {

    // Reading values into variables
    selectedMode = languageSelect.value;

    // Adding Additional functionality when a mode is selected
    editor.setOption('autoCloseBrackets', true);
    editor.setOption('matchBrackets', true);
  
     // Routing between C, C++, Java & Javascript code highlighting
    const codeMirrorMIME = CodeMirror.findModeByExtension(selectedMode).mime;   /*  ex: "text/x-javascript" */
    const codeMirrormode = CodeMirror.findModeByExtension(selectedMode).mode;   /*  ex: "javascript"        */
    
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

    // Reading values into variables
    const code = editor.getValue();
    const language = selectedMode;    /*  Could directly use `selectedMode`, Just for the sake of readibility */

    // Checking if the code has any input statements
    if(language != null && regex[language].test(code)){
        document.getElementById('input').disabled = false;
    } else {
        document.getElementById('input').disabled = true;
        document.getElementById('input').value = '';
    }
});

// -------------------------------------------------
//          Handling POST Request ( AJAX )
// -------------------------------------------------

// Created an Reference DOM object for output Textarea 
const outputTextArea = document.getElementById('output');

document.getElementById('code').addEventListener('submit', (event) => {
    // Prevents the default behavior
    event.preventDefault();

    // Resetting the output Textarea
    document.getElementById('output').value = '';

    // Collecting Data from the form
    const formData = new FormData(event.target);
    const requestData = {};

    // Storing the data into request Javascript Object
    formData.forEach(function(value, key) {
        requestData[key] = value;
    });

    // Creating an instance of XHR object for async communication
    const xhr = new XMLHttpRequest();
    
    // Setting the request method and the request URL
    xhr.open('POST', 'core.php', true);
    xhr.setRequestHeader('Content-Type', 'application/json');
    
    // Handling Request & Response using event handler when the Request is done.
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

    // --- Resetting the editor ---
    // Clearing previous session data
    editor.setValue('');
    editor.clearHistory();

    // Resetting the mode to default
    editor.setOption('mode','text/plain');
    CodeMirror.autoLoadMode(editor, null);
    
    // Resetting the theme to default
    editor.setOption('theme','darcula');

    // Turning of the functionalities
    editor.setOption('autoCloseBrackets', false);
    editor.setOption('matchBrackets', false);
});