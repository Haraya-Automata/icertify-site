
const username = document.getElementById('username');
const password = document.getElementById('password');
const form = document.getElementById('form');
const buttonShow = document.getElementById('button-show');
const buttonSubmit = document.getElementById('button-submit');

setBorderColor();

buttonSubmit.addEventListener('click', () => {
  if (validate(username.value) && validate(password.value)) {
    const options = {
      method: 'POST',
      body: new FormData(form)
    };

    fetch('/verify', options)
      .then(res => isAuthorized(res.ok))
      .catch(error => console.error('ERROR: there is a problem in fetching authorization.', error));   
  }
});

function isAuthorized(authorized) {
  if (authorized) {
    localStorage.setItem('authorized', 'true');
    location.href = 'generate.html'
  } else {
    username.value = '';
    password.value = '';
    setBorderColor();
  }
}

function showOrHide() {
  password.type === 'password' ? password.type = 'text' :
    password.type = 'password';
}

function validate(value) {
  return /^[A-Za-z].{3,7}$/.test(value);
}

function setBorderColor() {
  username.style.borderColor = 'red';
  password.style.borderColor = 'red';
}

function changeBorderColor(element, condition) {
  element.style.borderColor = condition ? 'black' : 'red';
}

username.addEventListener('change', (e) => {
  changeBorderColor(e.target, validate(e.target.value));
});

password.addEventListener('change', (e) => {
  changeBorderColor(e.target, validate(e.target.value));
});

buttonShow.addEventListener('click', () => showOrHide());
