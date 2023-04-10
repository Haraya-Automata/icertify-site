const url = new URL(location.href);
const query = url.searchParams.get('q');

history.pushState('verify', '', 'verify.html');

setValue(evaluate(query));

function evaluate(query) {
  let data; 
  if (query) data = JSON.parse(atob(query));

  return (data && isValid(data)) ? data :
    { name: 'Nothing', issuer: 'Nothing', date: 'Nothing' };
}

function isValid(data) {
  let bool = true;
  let keys = Object.keys(data);

  for (let key of keys) {
    if (!['name', 'issuer', 'date'].includes(key) || keys.length !== 3) {
      bool = false;
      break;
    }
  }
  return bool;
}

function setValue(data) {
  ['name', 'issuer', 'date'].forEach(id => {
    document.getElementById(id).innerText = data[id];
  });
}

