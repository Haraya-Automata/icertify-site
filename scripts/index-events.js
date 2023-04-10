const consoleBox = document.getElementById('console');
const text = document.getElementById('text');
const button = document.getElementById('button');

const defaultOptions = {
  consoleStyle: 'none',
  buttonStyle: 'block',
  color: 'white',
  message: 'an automated electronic certificate maker \nby Haraya Automata.'
};

const logOptions = {
  consoleStyle: 'block',
  buttonStyle: 'none',
  color: 'pink',
  message: 'NOTE: Clicking on page links or refreshing will lose your progress.'
}

start();
isLogEmpty(defaultOptions, logOptions);

function start() {
  fetch('https://icertify-server.onrender.com/start')
    .then(res => res.ok && console.log('server has started'))
    .catch(err => console.error('ERROR: an error has occured while starting the server', err));
}

function isLogEmpty(defaultOptions, logOptions) {
  const path = localStorage.getItem('log');
  if (path) {
    localStorage.removeItem('log');
    getMessage(path);
    setValues(logOptions);
  } else {
    setValues(defaultOptions);
  }
}

function getMessage(path) {
  const eventSource = new EventSource(`https://icertify-server.onrender.com${path}`);
  consoleBox.value += `INFO: request created to server\n`;
  consoleBox.value += `INFO: form data is submitted\n`;

  eventSource.addEventListener('message', (event) => {
    consoleBox.value += `INFO: ${event.data}\n`;
    if (event.data === 'END') {
      eventSource.close();
      consoleBox.value += 'INFO: closed connection to the server';
    }
    scrollDown();
  });

  eventSource.addEventListener('error', (error) => {
    consoleBox.value += 'ERROR: an error has occured\n', error;
    scrollDown();
  });
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



