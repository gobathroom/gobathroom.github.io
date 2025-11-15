/* =========================================================
   1) HELPERS & GLOBALS
   ========================================================= */

// Helper tipo jQuery mini
const $ = (s, d = document) => d.querySelector(s);

// Referencias globales
const body  = document.body;
const root  = document.documentElement;

// Estado global de "theme popover" (aunque ahora no lo uses)
let themeOpen = false;
