const form = document.getElementById('form');
const elements = document.getElementById('form').elements;
const preview = document.getElementById('preview');
const button = document.getElementById('button');
const date = elements['date'];

const dropdowns = ['color', 'font'];
const numbers = ['xName', 'yName', 'xQr', 'yQr'];

let imageBytes;

start();
getQR();
setBorderColor();
addChangeEventListeners();

date.addEventListener('keydown', (e) => e.preventDefault());

button.addEventListener('click', async () => {
  console.clear();
  for (element of elements) {
    if (element.name) {
      console.log(`name: ${element.name}, value: ${element.value}`);
    }
  }

  if (validateInputs() && isLoggedIn()) {
    const url = await submitForm();
    localStorage.setItem('log', url);
    location.href = 'index.html';
  } else if (!isLoggedIn()) {
    location.href = 'login.html';
  }
});

async function submitForm() {
  return new Promise((resolve, reject) => {
    const options = {
      method: 'POST',
      body: new FormData(form)
    };
    fetch('https://icertify-server.onrender.com/generate', options)
      .then(res => resolve(res.text()))
      .catch(err => console.error('ERROR: there is a problem in submitting form', err));
  });
}

async function getQR() {
  if (!imageBytes) {
    let response = await fetch('https://icertify.vercel.app/images/example-qr.png');
    imageBytes = await response.arrayBuffer();
  }
}

function start() {
  fetch('https://icertify-server.onrender.com/start')
    .then(res => res.ok && console.log('server has started'))
    .catch(err => console.error('ERROR: an error has occured while starting the server', err));
}

function isLoggedIn() {
  return localStorage.getItem('authorized');
}

function validateInputs() {
  for (let element of elements) {
    if (element.name && !dropdowns.includes(element.name)) {
      if (numbers.includes(element.name)) {
        if (!getCondition(element, 'position')) return false;
      } else {
        if (!getCondition(element)) return false;
      }
    }
  }
  return true;
}

function addChangeEventListeners() {
  for (let element of elements) {
    if (element.name) {
      element.addEventListener('change', (e) => isInputValid(e.target));
      setFormValue(element);
    }
  }
}

async function draw(file, options) {
  const pdf = await PDFLib.PDFDocument.load(file);
  const cert = await pdf.copy();
  cert.setTitle('Juan Dela Cruz');
  await Promise.all([drawName(cert, options), drawQr(cert, options)]);
  return cert.save();
}

async function drawName(cert, options) {
  const fontStyle = await cert.embedFont(options.font);
  const page = cert.getPage(0);
  const name = 'Juan Dela Cruz';
  const drawOptions = {
    x: page.getWidth() / 2 + Number(options.xName),
    y: page.getHeight() / 2 + Number(options.yName),
    font: fontStyle,
    size: Number(options.size),
    color: getRGB(options.color)
  }
  page.drawText(name, drawOptions);
}

async function drawQr(cert, options) {
  const image = await cert.embedPng(imageBytes);
  const page = cert.getPage(0);
  page.drawImage(image, {
    x: Number(options.xQr),
    y: Number(options.yQr),
    width: 60,
    height: 60
  });
}

function isInputValid(element) {
  let condition;
  if (!dropdowns.includes(element.name)) {
    condition = numbers.includes(element.name) ?
      getCondition(element, 'position') : getCondition(element);
    condition ? changeBorderColor(element, 'black') : changeBorderColor(element, 'red');
  }

  if (condition && element.name !== 'file' ||
    dropdowns.includes(element.name)) {
    localStorage.setItem(element.name, element.value);
  }

  if (condition &&
    ['file', 'number'].includes(element.type) ||
    [...dropdowns, 'file'].includes(element.name)) {
    refreshPreview();
  }
}

async function refreshPreview() {
  let file = '';
  if (getCondition(elements['file'])) {
    URL.revokeObjectURL(file);
    file = await fileToArrayBuffer(elements['file'].files[0]);
    file = await draw(file, getOptions());
    file = URL.createObjectURL(new Blob([file], { type: 'application/pdf' }));
  }
  preview.src = file;
}

function getOptions() {
  return {
    xName: elements['xName'].value || -350,
    yName: elements['yName'].value || 50,
    xQr: elements['xQr'].value || 470,
    yQr: elements['yQr'].value || 330,
    size: elements['size'].value || 30,
    font: elements['font'].value,
    color: elements['color'].value
  };
}

function getRGB(color) {
  const rgb = PDFLib.rgb;
  return {
    black: rgb(0, 0, 0),
    white: rgb(1, 1, 1),
    red: rgb(1, 0, 0),
    green: rgb(0, 1, 0),
    blue: rgb(0, 0, 1),
    yellow: rgb(1, 1, 0),
    violet: rgb(1, 0, 1),
    orange: rgb(1, 0.5, 0)
  }[color];
}

function getCondition(element, name = null) {
  let conditions = {
    issuer: /^[A-Za-z][A-Za-z\.\'\s-]{4,45}$/.test(element.value),
    date: Boolean(element.value),
    size: /^[1-9][0-9]{0,1}$/.test(element.value),
    position: /^[-01-9][0-9]{0,3}$/.test(element.value)
  };

  if (element.name === 'file') {
    conditions.file = element?.files[0]?.type === 'application/pdf' &&
      element?.files[0]?.size <= 5000000;
  } else if (element.name === 'names') {
    conditions.names = validateNames(element.value);
  }

  return name ? conditions[name] : conditions[element.name];
}

function validateNames(names) {
  let isValid = true;
  names = names
    .replace(/\r\n/g, '\n')
    .split('\n')
    .filter(name => name !== '');

  for (let name of names) {
    if (!/^[A-Za-z][A-Za-z\.\'\s-]{4,45}$/.test(name)) {
      isValid = false;
      break;
    }
  }
  return isValid;
}

function changeBorderColor(element, color) {
  element.style.borderColor = color;
}

function fileToArrayBuffer(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsArrayBuffer(file);
  });
}

function setFormValue(element) {
  let value = localStorage.getItem(element.name);
  if (value && element.name !== 'file') {
    (element.name === 'date') ? element.valueAsDate = new Date() : element.value = value;
    element.dispatchEvent(new Event('change'));
  }
}

function setBorderColor() {
  for (let element of elements) {
    if (!element.value) element.style.borderColor = 'red';
  }
}