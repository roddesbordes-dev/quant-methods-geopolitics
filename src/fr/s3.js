/* Session 3 */
const PR = DATA.products, CO = DATA.countries;
const NAMES = Object.fromEntries(CO.map(c=>[c.iso,c.n]));
const RIGHT = ["854143","810411","850511"];
/* French display names for products (data and CSV keep the English names) */
const PNAME_FR = {"810411":"Magnésium brut","850511":"Aimants permanents","847130":"Ordinateurs portables","854143":"Panneaux solaires","280530":"Métaux de terres rares","270900":"Pétrole brut","271111":"Gaz naturel liquéfié","100199":"Blé"};
const pn = p => PNAME_FR[p.code] || p.name;

/* puzzle */
const order = ["847130","810411","100199","854143","270900","850511","271111","280530"];
$("#q-prod").innerHTML = order.map(c=>{ const p=PR.find(x=>x.code===c); return `<label><input type="checkbox" value="${c}"> ${pn(p)}</label>`; }).join("");
$("#q-country").innerHTML = '<option value="">Choisissez un pays</option>' + [...CO].sort((a,b)=>a.n.localeCompare(b.n,"fr")).map(c=>`<option value="${c.iso}">${c.n}</option>`).join("");
function puzzleState(){ const n=$$("#q-prod input:checked").length; $("#prodCount").textContent = n===3?"Trois produits choisis.":`Choisissez-en trois (${n} pour l'instant).`; $("#prodBtn").disabled = !(n===3 && $("#q-country").value) || !!store.get("puz",null); }
$$("#q-prod input").forEach(i=>i.addEventListener("change",()=>{ if ($$("#q-prod input:checked").length>3) i.checked=false; puzzleState(); }));
$("#q-country").addEventListener("change", puzzleState);
function puzzleReveal(v){
  $$("#q-prod input").forEach(i=>{ i.checked=v.p.includes(i.value); i.disabled=true; }); $("#q-country").value=v.c; $("#q-country").disabled=true; $("#prodBtn").disabled=true;
  const hits=v.p.filter(c=>RIGHT.includes(c)).length; $("#prodOut").hidden=false;
  feedback($("#prodFb"), hits===3 && v.c==="CZE", `${hits} produit${hits>1?"s":""} juste${hits>1?"s":""} sur 3 ; pays ${v.c==="CZE"?"juste":"pas tout à fait"}.`);
  $("#prodTxt").innerHTML = `Part de la Chine dans les importations de l'UE en provenance de l'extérieur de l'UE, 2024 : <b>panneaux solaires 98 %</b>, <b>magnésium brut 92 %</b>, <b>aimants permanents 90 %</b> ; les ordinateurs portables s'en approchent avec 86 %. Parmi les États membres, la <b>Tchéquie</b> achète à la Chine la plus grande part de l'ensemble de ses importations (17 %), devant la Pologne (15 %) et l'Allemagne (12 %).`;
  markDone("puzzle"); }
$("#prodBtn").addEventListener("click",()=>{ const v={p:$$("#q-prod input:checked").map(i=>i.value), c:$("#q-country").value}; store.set("puz",v); puzzleReveal(v); });

/* lesson A check */
$("#la-btn").addEventListener("click",()=>{ const [v]=readNums(["la-in"]);
  if (Math.abs(v-4600)<=1){ feedback($("#la-fb"),true,"Exact : 3 600 + 900 + 100 = 4 600. Marché fortement concentré."); markDone("lessonA"); }
  else feedback($("#la-fb"),false,"Élevez chaque part au carré (60² = 3 600) et additionnez."); });

/* activity A */
let stA = store.get("actA",{ok:false,all:false});
const wheat = PR.find(p=>p.code==="100199"); const wheatH = wheat.top.slice(0,4).reduce((a,[,s])=>a+s*s,0);
function drawProd(){
  $("#prodTable").innerHTML = `<tr><th>Produit</th><th>Principaux fournisseurs (part des importations hors UE, %)</th><th class="num">Importations, Md US$</th><th class="num">IHH</th></tr>` +
    PR.map(p=>{ const show = stA.all || (p.code==="100199" && stA.ok);
      return `<tr><td><strong>${pn(p)}</strong></td><td style="text-align:left">${p.top.slice(0,4).map(([n,s])=>`${n} ${s.toFixed(1)}`).join(" · ")}</td><td class="num">${p.total_bn.toFixed(1)}</td><td class="num">${show?p.hhi.toLocaleString("fr-FR"):"…"}</td></tr>`; }).join("");
  if (!stA.all){ $("#prodChart").innerHTML = '<div class="cs" style="padding:2rem 1rem">Le graphique apparaît une fois que vous avez calculé tous les produits.</div>'; return; }
  const rows=[...PR].sort((a,b)=>b.hhi-a.hhi).map(p=>({label:pn(p), v:p.hhi, color: p.top[0][0]==="Chine"?css("--verm"):css("--accent"), tip:`<b>${pn(p)}</b><br>IHH ${p.hhi.toLocaleString("fr-FR")}<br>premier fournisseur : ${p.top[0][0]} ${p.top[0][1]} %`}));
  hbar($("#prodChart"),{title:"Concentration des fournisseurs de l'UE à l'importation, 2024",sub:"Indice de Herfindahl-Hirschman, de 0 à 10 000",rows,xmin:0,xmax:10000,xfmt:v=>v.toLocaleString("fr-FR"),ref:2500,refLabel:"2 500"});
  legend($("#prodChart"),[{label:"La Chine est le premier fournisseur",color:css("--verm"),kind:"sq"},{label:"Un autre pays l'est",color:css("--accent"),kind:"sq"}]);
}
$("#aa-btn").addEventListener("click",()=>{ const [v]=readNums(["aa-in"]);
  if (Math.abs(v-wheatH)<=15){ feedback($("#aa-fb"),true,`Exact : 66,0² + 15,5² + 6,9² + 4,6² ≈ ${Math.round(wheatH).toLocaleString("fr-FR")}. Avec l'ensemble des fournisseurs : ${wheat.hhi.toLocaleString("fr-FR")}.`); stA.ok=true; store.set("actA",stA); $("#aa-all").disabled=false; drawProd(); }
  else feedback($("#aa-fb"),false,"Élevez chacune des quatre parts au carré et additionnez-les : 66,0² = 4 356 pour commencer."); });
$("#aa-all").addEventListener("click",()=>{ stA.all=true; store.set("actA",stA); drawProd(); markDone("activityA"); markDone("feedbackA"); });
$("#csvProd").value = "product,supplier,share\n"+PR.flatMap(p=>p.top.map(([n,s])=>`${p.name},${n.replace(/,/g,"")},${s}`)).join("\n");

/* activity B: index */
const ind = ["china","hhi","energy"];
const mm = Object.fromEntries(ind.map(k=>[k,[Math.min(...CO.map(c=>c[k])),Math.max(...CO.map(c=>c[k]))]]));
const norm = (c,k) => 100*(c[k]-mm[k][0])/(mm[k][1]-mm[k][0]);
let stB = store.get("actB",{country:"DEU",best:null,worst:null});
$("#rCountry").innerHTML = [...CO].sort((a,b)=>a.n.localeCompare(b.n,"fr")).map(c=>`<option value="${c.iso}" ${c.iso===stB.country?"selected":""}>${c.n}</option>`).join("");
function scores(){ const w=["w1","w2","w3"].map(id=>+$("#"+id).value); const s=w.reduce((a,b)=>a+b,0)||1;
  ["w1","w2","w3"].forEach((id,i)=>$("#"+id+"o").textContent=Math.round(w[i]/s*100)+" %");
  return CO.map(c=>({...c, score: ind.reduce((a,k,i)=>a+w[i]/s*norm(c,k),0)})).sort((a,b)=>b.score-a.score).map((c,i)=>({...c,rank:i+1})); }
function drawIdx(track=true){
  const S=scores(), me=S.find(c=>c.iso===stB.country);
  if (track){ if (stB.best===null||me.rank<stB.best) stB.best=me.rank; if (stB.worst===null||me.rank>stB.worst) stB.worst=me.rank; store.set("actB",stB); }
  $("#rRank").textContent=me.rank; $("#rBest").textContent=stB.best??"–"; $("#rWorst").textContent=stB.worst??"–";
  tileMap($("#tileMap"),{title:"Indice de vulnérabilité, UE à 27",sub:"0 = le moins vulnérable, 100 = le plus ; plus foncé = plus vulnérable",vals:Object.fromEntries(S.map(c=>[c.iso,c.score])),names:NAMES,fmt:v=>v.toFixed(0),lo:0,hi:100,note:"Tuiles grises : hors UE, pas de données. Sources : UN Comtrade 2024 ; Eurostat 2023."});
  $("#rankTable").innerHTML = `<tr><th class="num">Rang</th><th>Pays</th><th class="num">Part de la Chine %</th><th class="num">IHH des partenaires</th><th class="num">Dépendance énergétique %</th><th class="num">Score</th></tr>` +
    S.map(c=>`<tr${c.iso===stB.country?' style="background:var(--soft);font-weight:600"':''}><td class="num">${c.rank}</td><td>${c.n}</td><td class="num">${c.china.toFixed(1)}</td><td class="num">${c.hhi}</td><td class="num">${c.energy.toFixed(1)}</td><td class="num">${c.score.toFixed(0)}</td></tr>`).join("");
  if (stB.best!==null && stB.worst!==null && stB.worst-stB.best>=5){ markDone("activityB"); }
  fbRange(); }
function fbRange(){ if (stB.best===null) return; const n=NAMES[stB.country];
  $("#fbRange").textContent = stB.worst-stB.best>0 ? `Vous avez fait varier ${n} entre le rang ${stB.best} et le rang ${stB.worst} sans modifier un seul chiffre.` : `Déplacez les poids pour voir jusqu'où ${n} peut bouger.`;
  if (stB.worst-stB.best>=5) markDone("feedbackB"); }
["w1","w2","w3"].forEach(id=>$("#"+id).addEventListener("input",()=>drawIdx()));
$("#rCountry").addEventListener("change",()=>{ stB={country:$("#rCountry").value,best:null,worst:null}; drawIdx(); });
$("#csvIdx").value = "country,china,hhi,energy\n"+CO.map(c=>`${c.n},${c.china},${c.hhi},${c.energy}`).join("\n");

/* quiz */
quiz($("#quizBox"), $("#quizScore"), [
 {q:"Deux fournisseurs, à 50 % chacun. Quel est l'IHH ?",o:["100","2 500","5 000"],a:2,e:"50² + 50² = 5 000."},
 {q:"L'UE importe presque tout son pétrole brut, et pourtant l'IHH de ses fournisseurs est inférieur à 1 000. Pourquoi ?",o:["Le pétrole n'est pas important","Elle achète à de nombreux pays","Les données sont fausses"],a:1,e:"La dépendance aux importations en général n'est pas la dépendance à un seul fournisseur."},
 {q:"La Chine absorbait environ 1 % des exportations lituaniennes. Pourquoi la pression chinoise a-t-elle tout de même fait mal ?",o:["La Chine a bloqué des marchandises contenant des composants lituaniens","La Lituanie importe toute sa nourriture de Chine","Elle n'a pas fait mal"],a:0,e:"L'exposition passait par les chaînes d'approvisionnement, invisibles dans les parts du commerce direct."},
 {q:"Vous ne modifiez que les poids d'un indice, et un pays passe du 5e au 20e rang. Qu'en concluez-vous ?",o:["Le pays a changé","Le classement dépend fortement des choix effectués","L'indice est frauduleux"],a:1,e:"La sensibilité aux poids est une propriété de l'indice, non du pays."},
 {q:"Que faut-il cartographier avec une échelle de couleurs ?",o:["Le total des importations venant de Chine, en dollars","La part des importations venant de Chine","La population"],a:1,e:"Cartographiez des taux et des parts ; les totaux montrent surtout quels pays sont grands."}], "quiz");

/* help when stuck */
helpAfter("la-btn","la-fb",()=>({"la-in":"4600"}));
helpAfter("aa-btn","aa-fb",()=>({"aa-in":Math.round(wheatH)}));

/* boot */
const pv=store.get("puz",null); if (pv) puzzleReveal(pv);
drawProd(); if (stA.ok) $("#aa-all").disabled = stA.all;
drawIdx(false); fbRange();
wireCopy(); wireReset();
onRedraw(()=>{ drawProd(); drawIdx(false); });
