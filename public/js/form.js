document.addEventListener('DOMContentLoaded', () => {
  const select = document.getElementById('lease_type');
  if (!select) return;

  const toggleTargets = document.querySelectorAll('[data-types]');

  function applyVisibility() {
    const type = select.value;

    toggleTargets.forEach((el) => {
      const types = el.getAttribute('data-types').split(',');
      const visible = types.includes(type);
      el.style.display = visible ? '' : 'none';

      el.querySelectorAll('[data-required]').forEach((input) => {
        input.required = visible;
      });
      if (el.matches('[data-required]')) {
        el.required = visible;
      }
    });
  }

  select.addEventListener('change', applyVisibility);
  applyVisibility();
});
