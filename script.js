// -------------------------------------------------
//                Global Variables
// -------------------------------------------------
let selectedTheme = 'darcula';  // by default 'darcula' theme 
let selectedMode = null;

// -------------------------------------------------
//               Adding doc elements
// -------------------------------------------------

// creating doc elements
const themeLinkTag = document.createElement('link');

// Set the attributes for the link element
themeLinkTag.rel = 'stylesheet';
themeLinkTag.type = 'text/css';
themeLinkTag.href = `dependencies/codemirror-5.65.13/theme/${selectedTheme}.css`;

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

// Created an Reference DOM object for input & output Textarea 
const inputTextArea = document.getElementById('input');
const outputTextArea = document.getElementById('output');

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

    // Adding Additional functionality when a mode is selected only if they aren't activated before
    if( !(editor.getOption('autoCloseBrackets') && editor.getOption('matchBrackets')) ) {
        editor.setOption('autoCloseBrackets', true);
        editor.setOption('matchBrackets', true);
    }
  
     // Routing between C, C++, Java & Javascript code highlighting
    const codeMirrorMIME = CodeMirror.findModeByExtension(selectedMode).mime;   /*  ex: "text/x-javascript" */
    const codeMirrormode = CodeMirror.findModeByExtension(selectedMode).mode;   /*  ex: "javascript"        */
    
    // Script has already been loaded, update the mode directly
    editor.setOption('mode', codeMirrorMIME);
    CodeMirror.autoLoadMode(editor, codeMirrormode);

    // Clearing the code editor & output TextArea when changed language
    editor.setValue('');
    outputTextArea.value = '';
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
        inputTextArea.disabled = false;
    } else {
        inputTextArea.disabled = true;
        inputTextArea.value = '';
    }
});

// -------------------------------------------------
//          Handling POST Request ( AJAX )
// -------------------------------------------------

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
                console.log(response);
                if(response['output'] !== undefined && response['error'] === ''){
                    outputTextArea.style.color = 'white';
                    outputTextArea.value = response['output'];
                } else {
                    outputTextArea.style.color = 'red';
                    outputTextArea.value = response['error'];
                }
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

// -------------------------------------------------
//       Notice for GitHub Pages & API Checkup
// -------------------------------------------------

// Function that checks for status of CodeX API POST Requests
const checkForApiWorkingStatus = () => {
    fetch('https://api.codex.jaagrav.in', {
        method: 'POST',
        headers: {
        'Content-Type': 'application/json',
        },
        body: JSON.stringify({ code: 'print(\'asdas\')', language: 'py', input: '' }),
    })
    .then(response => {
      if (!response.ok) {
        console.error('POST request failed. Status:', response.status);
        alert(`CodeX API failed with status code: ${response.status}. Try refreshing later...`);
        document.getElementById('run').disabled = true;
      }
    })
    .catch(error => {
      console.error('Error:', error);
    });
};

window.onload = () => {
    if (/github.io/.test(document.URL)) {
        setTimeout(() => {
            alert("Note:\nGitHub Pages build only for static web pages. PHP will not work in this environment !!!...\nTry hosting in your Local system.");
            document.getElementById('run').disabled = true;
        }, 3000);
    } else {
        setTimeout( checkForApiWorkingStatus(), 5000 );
    }
};