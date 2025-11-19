document.addEventListener('DOMContentLoaded', () => {
  const brand = document.getElementById('brandLink');

  if (brand) {
    const path = window.location.pathname;

    // Detecta idioma automáticamente
    if (path.startsWith("/es")) {
      brand.href = "/es";
    } else {
      brand.href = "/";
    }
  }
});
