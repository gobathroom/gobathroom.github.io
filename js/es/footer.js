function getShareUrl() {
  const url  = new URL(window.location.href);
  const path = url.pathname;

  // 1) Detectar prefijo de idioma: /es/ , /en/ , /fr/, etc.
  //    Si no coincide, asumimos raíz "/"
  let langPrefix = '/';
  const match = path.match(/^\/([a-z]{2})\//i);
  if (match) {
    langPrefix = `/${match[1]}/`;  // ej: "/es/"
  }

  // 2) Obtener el último segmento del path (el "slug")
  const segments = path.replace(/\/+$/, '').split('/'); // quita "/" final y divide
  const lastSegment = segments[segments.length - 1] || '';

  // 3) Slugs que NO queremos compartir tal cual (solo compartimos la home del idioma)
  const legalSlugs = new Set([
    'privacidad',
    'terminos',
    'privacy',
    'terms'
  ]);

  if (legalSlugs.has(lastSegment)) {
    // Compartimos la home del idioma: /es/ , /en/ , etc. (o "/" si no hay idioma)
    url.pathname = langPrefix === '/' ? '/' : langPrefix;
    url.search   = '';
    url.hash     = '';
    return url.toString();
  }

  // 4) En cualquier otra página, compartir la URL actual completa
  return url.toString();
}
