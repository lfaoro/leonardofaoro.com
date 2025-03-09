// Initialize dynamic year
document.getElementById('current-year').textContent = new Date().getFullYear();

// Add skip link functionality
document.querySelector('.skip-link').addEventListener('click', function(e) {
  e.preventDefault();
  document.querySelector('main').focus();
});

// Initialize htmx indicators
document.body.addEventListener('htmx:beforeRequest', function(evt) {
  document.querySelector('.loading').style.display = 'block';
});

document.body.addEventListener('htmx:afterRequest', function(evt) {
  document.querySelector('.loading').style.display = 'none';
}); 