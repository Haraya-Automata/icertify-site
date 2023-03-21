const inputs = document.getElementById('form').elements;
const upload = document.getElementById('certificate');
const preview = document.getElementById('preview');

upload.addEventListener('change', () => {
  preview.src = URL.createObjectURL(upload.files[0]);
});

button.addEventListener('click', () => {
  localStorage.setItem('log', 'true');
  location.href = "index.html";
});