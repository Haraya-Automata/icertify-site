
const url = new URL(location.href);
const base64 = url.searchParams.get('q');

history.pushState('verify', 'Title', 'verify.html');

if (base64) {
  const data = JSON.parse(atob(base64));
  setValue(data);
} else {
  setValue({ name: 'Nothing', issuer: 'Nothing', date: 'Nothing' });
}

function setValue(data) {
  ['name', 'issuer', 'date'].forEach(id => {
    document.getElementById(id).innerText = data[id];
  });
}