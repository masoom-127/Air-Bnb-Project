(() => {
  'use strict';

  const forms = document.querySelectorAll('.needs-validation');

  forms.forEach(form => {
    form.addEventListener('submit', event => {

      //  REMOVE SPACES
      const fields = form.querySelectorAll('input, textarea');
      fields.forEach(field => {
        field.value = field.value.trim();
      });

      if (!form.checkValidity()) {
        event.preventDefault();
        event.stopPropagation();
      }

      form.classList.add('was-validated');
    });
  });
})();
