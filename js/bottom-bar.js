/* =========================================================
   1) bottom bar actions (solo estado activo) (6/-)
   ========================================================= */

// nav inferior
const bottomBar = document.getElementById("bottomBar");

// opcional: marcar activo cuando hacen click
const bottomLinks = document.querySelectorAll(".bottom-bar .bottom-item");
bottomLinks.forEach((link) => {
  link.addEventListener("click", () => {
    bottomLinks.forEach((l) => l.classList.remove("is-active"));
    link.classList.add("is-active");
  });
});
