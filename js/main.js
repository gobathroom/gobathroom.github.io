function armTapReset(a) {
  a.addEventListener('click', function () {
    this.classList.add('tapped');
    setTimeout(() => this.blur(), 50);
    setTimeout(() => this.classList.remove('tapped'), 1500);
  }, { passive: true });

  a.addEventListener('touchstart', function () {
    this.classList.add('tapped');
    setTimeout(() => this.blur(), 50);
    setTimeout(() => this.classList.remove('tapped'), 1500);
  }, { passive: true });
}

// Llama la función en ambos lados del botón doble
document.querySelectorAll('.dual-button .btn-left')
  .forEach(a => armTapReset(a));
document.querySelectorAll('.dual-button .btn-right')
  .forEach(a => armTapReset(a));

