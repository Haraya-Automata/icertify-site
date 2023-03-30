const console = document.getElementById('console');
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

isLogEmpty(defaultOptions, logOptions);

function isLogEmpty(defaultOptions, logOptions) {
  const url = localStorage.getItem('log');
  if (url) {
    localStorage.removeItem('log');
    getMessage(url);
    setValues(logOptions);
  } else {
    setValues(defaultOptions);
  }
}

function getMessage(url) {
  const eventSource = new EventSource(`https://icertify-server.onrender.com/${url}`);
  console.value += `INFO: request created to server\n`;
  console.value += `INFO: form data is submitted\n`;

  eventSource.addEventListener('message', (event) => {
    console.value += `INFO: ${event.data}\n`;
    if (event.data === 'END') {
      eventSource.close(); 
      console.value += 'INFO: closed connection to the server';
    }
    scrollDown();
  });

  eventSource.addEventListener('error', (error) => {
    console.value += 'ERROR: an error has occured\n', error;
    scrollDown();
  });
}

function scrollDown() {
  console.scrollTop = console.scrollHeight;
}

function setValues(options) {
  console.style.display = options.consoleStyle;
  button.style.display = options.buttonStyle;
  text.style.color = options.color;
  text.innerText = options.message;
}



