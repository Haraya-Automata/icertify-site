const toggleButton = document.getElementsByClassName('toggle-button')[0];
const navbarLinks = document.getElementsByClassName('navbar-links')[0];

highlightHeader();

toggleButton.addEventListener('click', () => {
  navbarLinks.classList.toggle('active');
});

function highlightHeader() {
  const list = navbarLinks.getElementsByTagName('li');
  const links = navbarLinks.getElementsByTagName('a');

  for (let link of links) {
    if (location.href === link.href) showCurrentPage(link, list);
  }
}

function showCurrentPage(link, list) {
  for (let item of list) {
    if (item.innerHTML.includes(link.pathname.substring(1))) {
      link.style.color = '#dcd61c';
      link.style.backgroundColor = '#051937';
    }
  }
}