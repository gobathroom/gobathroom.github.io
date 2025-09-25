function armTapReset(a) {
  const activate = () => {
    a.classList.add('tapped');
    // quita foco para evitar :focus-visible persistente
    setTimeout(() => a.blur(), 50);
    // intenta restaurar a los 1.5s (puede pausarse en background)
    setTimeout(() => a.classList.remove('tapped'), 1500);
  };

  a.addEventListener('click', activate, { passive: true });
  a.addEventListener('touchstart', activate, { passive: true });
}

// Aplica a ambos lados
document.querySelectorAll('.dual-button .btn-left').forEach(armTapReset);
document.querySelectorAll('.dual-button .btn-right').forEach(armTapReset);

// ✅ Garantiza reset al volver a la página (por si el timer se pausó)
document.addEventListener('visibilitychange', () => {
  if (document.visibilityState === 'visible') {
    document.querySelectorAll('.dual-button a.tapped').forEach(el => el.classList.remove('tapped'));
    if (document.activeElement && document.activeElement.blur) document.activeElement.blur();
  }
});
