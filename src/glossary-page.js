/* Glossary page */
const SL = LANG==="fr" ? ["Séance","fr-FR"] : ["Session","en-GB"];
$("#glist").innerHTML = [...GLOSSARY].sort((a,b)=>a[LANG][0].localeCompare(b[LANG][0],SL[1],{sensitivity:"base"}))
  .map(g=>`<dt>${g[LANG][0]}</dt><dd>${g["d"+LANG]} <a href="session${g.s}.html">${SL[0]} ${g.s}</a></dd>`).join("");
