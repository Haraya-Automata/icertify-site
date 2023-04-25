const consoleBox = document.getElementById('console');
const text = document.getElementById('text');
const button = document.getElementById('button');
const driveUrl = document.getElementById('drive-url');

let options = {
  consoleStyle: 'none',
  buttonStyle: 'block',
  color: 'white',
  message: 'an automated electronic certificate maker \nby Haraya Automata.'
};

const logOptions = {
  consoleStyle: 'block',
  buttonStyle: 'none',
  color: 'lightpink',
  message: 'NOTE: Clicking on page links or refreshing will lose your progress.'
}

isLogEmpty();

text.addEventListener('click', () => {
  if (driveUrl.href) {
    location.href = driveUrl.href;
  }
});

function isLogEmpty() {
  const path = localStorage.getItem('log');
  if (path) {
    getMessage(path);
    options = logOptions;
    localStorage.removeItem('log');
  }
  setValues(options);
}

function getMessage(path) {
  const eventSource = new EventSource(`https://icertify-server.onrender.com${path}`);
  consoleBox.value += `INFO: request created to server\n`;
  consoleBox.value += `INFO: form data is submitted\n`;

  eventSource.addEventListener('message', (event) => {
    if (event.data === 'END') {
      closeConnection(eventSource, consoleBox);
    } else {
      if (event.data.includes('error')) {
        consoleBox.value += `ERROR: ${event.data}\n`;
        closeConnection(eventSource, consoleBox);
      } else if (event.data.includes('https')) {
        driveUrl.href = event.data;
        text.innerText = driveUrl.href;

        text.style.cursor = 'pointer';
        text.style.textDecoration = 'underline';
        text.style.textDecorationColor = 'white';
      } else {
        consoleBox.value += `INFO: ${event.data}\n`;
      }
    }
    scrollDown();
  });

  eventSource.addEventListener('error', (error) => {
    consoleBox.value += 'ERROR: an error has occured\n';
    closeConnection(eventSource, consoleBox);
    scrollDown();
  });
}

function closeConnection(eventSource, console) {
  console.value += 'INFO: closed connection to the server';
  eventSource.close();
}

function scrollDown() {
  consoleBox.scrollTop = consoleBox.scrollHeight;
}

function setValues(options) {
  consoleBox.style.display = options.consoleStyle;
  button.style.display = options.buttonStyle;
  text.style.color = options.color;
  text.innerText = options.message;
}



