/* =========================================================
   1) bottom bar actions  (6/-)
   ========================================================= */

const bottomBar = document.getElementById("bottomBar");
let lastScrollY = window.scrollY;

window.addEventListener("scroll", () => {
  const current = window.scrollY;

  // bajando
  if (current > lastScrollY + 5) {
    bottomBar?.classList.add("hidden");
  }
  // subiendo
  else if (current < lastScrollY - 5) {
    bottomBar?.classList.remove("hidden");
  }

  lastScrollY = current;
});

// opcional: marcar activo cuando hacen click
const bottomLinks = document.querySelectorAll(".bottom-bar .bottom-item");
bottomLinks.forEach((link) => {
  link.addEventListener("click", () => {
    bottomLinks.forEach((l) => l.classList.remove("is-active"));
    link.classList.add("is-active");
  });
});
