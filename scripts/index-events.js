const console = document.getElementById('console');
const text = document.getElementById('text');
const button = document.getElementById('button');

function isLogEmpty() {
  if (localStorage.getItem('log')) {
    consoleStyle = 'block';
    buttonStyle = 'none';
    color = 'pink';

    message = "NOTE: Clicking on page links or refreshing will lose your progress."
    localStorage.removeItem('log');
    setInterval(() => {
      console.value += `#${count++}: Sending request to server\n`;
      console.scrollTop = console.scrollHeight;
    }, 1000);
  }
  console.style.display = consoleStyle;
  button.style.display = buttonStyle;
  text.innerText = message;
  text.style.color = color;
}

let consoleStyle = 'none';
let buttonStyle = 'block';
let color = 'white';
let count = 1;
let message = 'an automated electronic certificate maker \nby Haraya Automata.';

isLogEmpty();

