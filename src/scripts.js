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

// Auto-resize textarea as user types
document.addEventListener('DOMContentLoaded', function() {
  const textarea = document.getElementById('leona-input');
  const chatForm = document.getElementById('leona-chat-form');
  
  if (textarea) {
    textarea.addEventListener('input', function() {
      // Reset height to auto to get the right scrollHeight
      this.style.height = 'auto';
      // Set new height based on scrollHeight
      this.style.height = (this.scrollHeight) + 'px';
    });
    
    // Initialize height on page load
    textarea.style.height = 'auto';
    textarea.style.height = (textarea.scrollHeight) + 'px';
  }
  
  // Handle form submission to dismiss keyboard
  if (chatForm) {
    chatForm.addEventListener('submit', function() {
      // Blur the input field to dismiss keyboard
      if (document.activeElement) {
        document.activeElement.blur();
      }
      
      // Also specifically blur the input element
      if (textarea) {
        textarea.blur();
      }
    });
  }
  
  // Also handle htmx events
  document.body.addEventListener('htmx:beforeRequest', function(e) {
    if (e.detail.elt.id === 'leona-chat-form') {
      // Blur the input field to dismiss keyboard
      if (document.activeElement) {
        document.activeElement.blur();
      }
      
      // Also specifically blur the input element
      if (textarea) {
        textarea.blur();
      }
    }
  });
}); 