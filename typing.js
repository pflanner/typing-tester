let typingTextElement = document.getElementById("typing-text");
let changeTextButton = document.getElementById("btn-change-text");
let typingText = typingTextElement.textContent;
let highlightedChars = [];
let pos = 0;
let startTime = 0;
let typedChars = 0;
let typableChars = 0;
let backspaces = 0;
let keystrokes = 0;
let mistakes = 0;

const highlight = '<span class="highlight">';
const good = '<span class="good">';
const bad = '<span class="bad">';
const spanEnd = '</span>';

let ignoreKeys = new Set();
ignoreKeys.add("Control");
ignoreKeys.add("Alt");
ignoreKeys.add("Meta");
ignoreKeys.add("Shift");
ignoreKeys.add("Escape");
for (let i = 1; i <= 12; i++) {
    let k = "F" + i;
    ignoreKeys.add(k);
}



class HighlightedCharacter {
    static GOOD = 'good';
    static INVERSE_GOOD = 'inverse-good';
    static BAD = 'bad';
    static INVERSE_BAD = 'inverse-bad';
    static DONE = 'done';
    static HIGHLIGHTED = "highlighted";
    static NONE = 'none';

    constructor(c, highlight) {
        this.c = c;
        this.highlight = highlight;
        this.isLeadingWhitespace = false;

        this.inverseHighlightMap = {
            [HighlightedCharacter.GOOD]: HighlightedCharacter.INVERSE_GOOD,
            [HighlightedCharacter.BAD]: HighlightedCharacter.INVERSE_BAD,
            [HighlightedCharacter.HIGHLIGHTED]: HighlightedCharacter.HIGHLIGHTED,
        }
    }

    getHighlight() {
        if (isWhitespace(this.c)) {
            return this.inverseHighlightMap[this.highlight]
        }

        return this.highlight;
    }
}


function initTypingText() {
    pos = 0;
    startTime = 0;
    typedChars = 0;
    typableChars = 0;
    backspaces = 0;
    keystrokes = 0;
    mistakes = 0;
    typingText = typingTextElement.textContent;
    highlightedChars = [];

    for (let i = 0; i < typingText.length; i++) {
        highlightedChars.push(new HighlightedCharacter(typingText[i], HighlightedCharacter.NONE));
        if (!isWhitespace(typingText[i])) {
            typableChars++;
        }
    }

    skipWhitespace();
    markCharacter(HighlightedCharacter.HIGHLIGHTED);
    render();
}

initTypingText();

function handleKeydown(event) {
    if (event.target !== document.body) {
        return;
    }

    // prevent space from scrolling
    if (event.key === ' ') {
        event.preventDefault()
    }

    const key = event.key;

    if (ignoreKeys.has(key)) {
        return;
    }
    if (pos === typingText.length - 1) {
        if (startTime !== 0) {
            let elapsedTime = new Date().getTime() - startTime;
            let wpm = (typableChars / 5) / (elapsedTime / 1000 / 60);
            wpm = Math.round(wpm);
            let accuracy = (keystrokes - mistakes) / keystrokes * 100;
            accuracy = Math.round(accuracy);

            addLineToModal("WPM: " + wpm);
            addLineToModal("Keystrokes: " + keystrokes);
            addLineToModal("Mistakes: " + mistakes);
            addLineToModal("Backspaces: " + backspaces);
            addLineToModal("Accuracy: " + accuracy + "%");
            displayModal();
        }
        startTime = 0;
        return;
    }

    keystrokes++;

    if (startTime === 0) {
        startTime = new Date().getTime();
    }

    if (key === "Backspace") {
        backspaces++;
        
        if (pos > 0) {
            markCharacter(HighlightedCharacter.NONE);
            pos--;
        }

        if (pos >= 0) {
            pos--;
        }
    } else if (key === "Enter" && typingText[pos] ==='\n') {
        judgeCharacter(HighlightedCharacter.GOOD);
        skipWhitespace();
        pos--;
    } else if (key === typingText[pos]) {
        judgeCharacter(HighlightedCharacter.GOOD);
    } else {
        mistakes++;
        judgeCharacter(HighlightedCharacter.BAD);
    }

    if (pos < highlightedChars.length - 1) {
        pos++;
    }
    highlightedChars[pos].highlight = HighlightedCharacter.HIGHLIGHTED;

    render();
}

function markCharacter(marking) {
    highlightedChars[pos].highlight = marking
}

function judgeCharacter(marking) {
    highlightedChars[pos].highlight = marking
    let prevChar = highlightedChars[pos - 1];
    if (pos > 0 && prevChar.highlight !== HighlightedCharacter.BAD && !prevChar.isLeadingWhitespace) {
        highlightedChars[pos - 1].highlight = HighlightedCharacter.DONE;
    }
}

function skipWhitespace() {
    while (isWhitespace(typingText[pos])) {
        pos++;
    }
}

function isWhitespace(c) {
    return /^\s$/.test(c)
}

function render() {
    if (!highlightedChars) {
        return;
    }

    let buffer = [];
    let prevHighlight = highlightedChars[0].getHighlight();
    let curHighlight;

    if (prevHighlight !== HighlightedCharacter.NONE) {
        buffer.push('<span class="' + prevHighlight + '">');
        buffer.push(highlightedChars[0].c);
        buffer.push(spanEnd);
    } else {
        buffer.push(highlightedChars[0].c);
    }

    for (let i = 1; i < highlightedChars.length; i++) {
        let hc = highlightedChars[i];
        curHighlight = hc.getHighlight();

        if (i === pos && typingText[pos] === '\n') {
            buffer.push('<span class="return">')
            buffer.push("&#x23CE;")
            buffer.push(spanEnd);
        }

        if (curHighlight !== HighlightedCharacter.NONE) {
            if (curHighlight === prevHighlight) {
                buffer.pop();
            } else {
                buffer.push('<span class="' + curHighlight + '">');
            }
            buffer.push(hc.c);
            buffer.push(spanEnd);
        } else {
            buffer.push(hc.c);
        }

        prevHighlight = curHighlight;
    }

    typingTextElement.innerHTML = buffer.join('');
}

document.addEventListener('keydown', handleKeydown);

changeTextButton.addEventListener('click', event => {
   let text = document.getElementById("input-text").value;
   if (text) {
       typingTextElement.innerHTML = text;
       typingText = text;
       initTypingText();
   }

   window.focus();
   document.activeElement.blur();
});
