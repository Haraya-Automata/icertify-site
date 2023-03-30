const form = document.getElementById('form');
const elements = document.getElementById('form').elements;
const preview = document.getElementById('preview');
const button = document.getElementById('button');

const dropdowns = ['color', 'font'];
const numbers = ['xName', 'yName', 'xQr', 'yQr'];

setBorderColor();
addChangeEventListeners();

button.addEventListener('click', async () => {
  console.clear();
  for (element of elements) {
    console.log(`name: ${element.name}, value: ${element.value}`);
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
  const options = {
    method: 'POST',
    body: new FormData(form)
  };

  const response = await fetch('https://icertify-server.onrender.com/generate', options)
    .catch(error => console.error('ERROR: there is a problem in submitting form', error));
  return response.text();
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
  await Promise.all([drawName(cert, options), drawQr(cert, options)]);
  return cert.saveAsBase64({ dataUri: true });
}

async function drawName(cert, options) {
  const fontStyle = await cert.embedFont(options.font);
  const page = cert.getPage(0);
  const name = 'Juan dela Cruz';
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
  const response = await fetch('https://icertify.vercel.app/images/example-qr.png');
  const imageBytes = await response.arrayBuffer();
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
    file = await blobToBase64(elements['file'].files[0]);
    file = await draw(file, getOptions());
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
    issuer: /^[A-Za-z].{2,30}$/.test(element.value),
    date: Boolean(element.value),
    names: /^[A-Za-z].{6,}/.test(element.value),
    size: /^[1-9][0-9]{0,1}$/.test(element.value),
    position: /^[-01-9][0-9]{0,3}$/.test(element.value)
  };

  if (element.name === 'file') {
    conditions.file = element?.files[0]?.type === 'application/pdf' &&
      element?.files[0]?.size <= 5000000;
  }

  return name ? conditions[name] : conditions[element.name];
}

function changeBorderColor(element, color) {
  element.style.borderColor = color;
}

function blobToBase64(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

function setFormValue(element) {
  let value = localStorage.getItem(element.name);
  if (value && element.name !== 'file') {
    element.value = value;
    element.dispatchEvent(new Event('change'));
  }
}

function setBorderColor() {
  for (let element of elements) {
    if (!element.value) element.style.borderColor = 'red';
  }
}