/* Session 2 */
const P = DATA.polls, RES = DATA.result;
const moe = (p, n) => 1.96*Math.sqrt(p*(1-p)/n)*100;

/* puzzle */
$("#pollTable").innerHTML = `<tr><th>Institut</th><th>Terrain</th><th class="num">Échantillon</th><th class="num">Oui %</th><th class="num">Non %</th><th class="num">Indécis %</th></tr>` +
  P.map(p=>`<tr><td>${p.p}</td><td style="text-align:left">${p.dates}</td><td class="num">${p.n.toLocaleString("fr-FR")}</td><td class="num">${p.yes.toFixed(1)}</td><td class="num">${p.no.toFixed(1)}</td><td class="num">${p.und.toFixed(1)}</td></tr>`).join("");
const gy = $("#guessYes"), gyo = $("#guessYesOut");
gy.addEventListener("input",()=>gyo.textContent=gy.value+" %");
function showGuess(){ const g=store.get("guess",null); if (g===null) return; gy.value=g; gyo.textContent=g+" %"; gy.disabled=true; $("#guessBtn").disabled=true; $("#guessSaved").textContent="Enregistrée. La réponse vous attend à l'étape 4."; markDone("puzzle"); }
$("#guessBtn").addEventListener("click",()=>{ store.set("guess", +gy.value); showGuess(); });

/* lesson A calculator */
function calc(){ const n=+$("#mN").value, p=+$("#mP").value/100; $("#mNout").textContent=n.toLocaleString("fr-FR"); $("#mPout").textContent=Math.round(p*100)+" %";
  $("#mOut").textContent = `± ${moe(p,n).toFixed(1)} points`; }
["mN","mP"].forEach(id=>$("#"+id).addEventListener("input",()=>{calc(); markDone("lessonA");})); calc();
$("#la-btn").addEventListener("click",()=>{ const [v]=readNums(["la-in"]); const t=moe(.5,1100);
  if (isNaN(v)) return feedback($("#la-fb"),false,"Saisissez d'abord un nombre.");
  if (Math.abs(v-t)<=0.15){ feedback($("#la-fb"),true,`Exact : 1,96 × √(0,5 × 0,5 ÷ 1 100) = ${t.toFixed(2)}, soit environ ±3 points.`); markDone("lessonA"); }
  else feedback($("#la-fb"),false,"Pas tout à fait. Utilisez p = 0,5 et n = 1 100, puis multipliez par 100 pour obtenir des points."); });

/* activity A */
let stA = store.get("actA",{ok:false,revealed:false}); let und="drop";
function est(p, how){ const dec=p.yes+p.no;
  if (how==="drop") return {v:p.yes/dec*100, m:moe(p.yes/dec, p.n*dec/100)};
  if (how==="split") { const v=p.yes+p.und/2; return {v, m:moe(v/100,p.n)}; }
  return {v:p.yes, m:moe(p.yes/100,p.n)}; }
function drawPolls(){
  const rows = P.map(p=>{ const e=est(p,und); return {label:p.p.split("–")[0], v:e.v, lo:e.v-e.m, hi:e.v+e.m, color:css("--accent"), tip:`<b>${p.p}</b><br>Oui ${e.v.toFixed(1)} % ± ${e.m.toFixed(1)}`}; });
  const f = hbar($("#pollChart"),{title:"Part du Oui, % ("+({drop:"indécis écartés",split:"indécis répartis à parts égales",no:"indécis tous au Non"})[und]+")", rows, xmin:30, xmax:75, xfmt:v=>v+" %", ref: stA.revealed?RES.home:undefined, refLabel: stA.revealed?"Résultat en Moldavie 45,4 %":undefined, rowH:44});
  if (stA.revealed){ legend($("#pollChart"),[{label:"Estimation du sondage avec marge à 95 %",color:css("--accent")},{label:"Résultat parmi les électeurs en Moldavie",color:css("--hi"),kind:"line",dash:"6 4"}]); }
}
seg("segUnd", v=>{ und=v; drawPolls(); });
$("#aa-btn").addEventListener("click",()=>{ const [p,m]=readNums(["aa-p","aa-m"]); const e=est(P[0],"drop");
  if (isNaN(p)||isNaN(m)) return feedback($("#aa-fb"),false,"Remplissez les deux cases.");
  const okP=Math.abs(p-e.v)<=0.15, okM=Math.abs(m-e.m)<=0.15;
  if (okP&&okM){ feedback($("#aa-fb"),true,`Exact : 55,1 ÷ 89,6 = ${e.v.toFixed(1)} % ; répondants décidés 1 034 × 0,896 ≈ 926 ; marge ±${e.m.toFixed(1)}.`); stA.ok=true; store.set("actA",stA); }
  else if (okP) feedback($("#aa-fb"),false,"La part est juste. Pour la marge, utilisez n = 1 034 × 0,896 et p = 0,615.");
  else feedback($("#aa-fb"),false,"Pas encore. Oui parmi les décidés = 55,1 ÷ (55,1 + 34,5)."); });
$("#aa-reveal").addEventListener("click",()=>{ stA.revealed=true; store.set("actA",stA); drawPolls(); markDone("activityA"); openFA(); });
$("#csvPolls").value = "pollster,n,yes,no,und\n"+P.map(p=>`${p.p},${p.n},${p.yes},${p.no},${p.und}`).join("\n");
function openFA(){ $("#fa-locked").hidden=true; $("#fa-body").hidden=false; markDone("feedbackA");
  const g=store.get("guess",null);
  $("#fa-guess").textContent = g===null ? "Vous n'avez pas enregistré d'estimation." : `Votre estimation était de ${g} %. Le résultat a été de 50,35 %, soit un écart de ${Math.abs(g-50.35).toFixed(1)} points.`; }

/* activity B */
const PW = DATA.pew;
let stB = store.get("actB",{ok:false,all:false});
const dmoe = (a,b) => 1.96*Math.sqrt((a/100)*(1-a/100)/1000 + (b/100)*(1-b/100)/1000)*100;
function drawPew(){
  $("#pewTable").innerHTML = `<tr><th>Pays</th><th class="num">2024 %</th><th class="num">2025 %</th><th class="num">Évolution</th><th class="num">Marge ±</th><th>Évolution réelle ?</th></tr>` +
    PW.map(r=>{ const has=r.y24!==null, show=stB.all||(r.c==="France"&&stB.ok);
      const ch=has?r.y25-r.y24:null, m=has?dmoe(r.y24,r.y25):null;
      return `<tr><td>${r.c}</td><td class="num">${has?r.y24:"–"}</td><td class="num">${r.y25}</td><td class="num">${show&&has?sgn(ch,0):has?"…":"–"}</td><td class="num">${show&&has?m.toFixed(1):has?"…":"–"}</td><td>${!has?'<span class="small">non comparable</span>':show?(Math.abs(ch)>m?'<span class="chip F">✓ oui</span>':'<span class="chip PF">✗ dans le bruit</span>'):"…"}</td></tr>`; }).join("");
  const rows = PW.filter(r=>r.y24!==null);
  const f = frame($("#pewChart"),{title:"Opinion favorable de la Chine, 2024 → 2025",sub:"% des adultes",H:40+rows.length*30+30,m:{t:16,r:24,b:30,l:120}});
  const xs=v=>f.m.l+(v)/70*f.iw;
  for (const v of [0,10,20,30,40,50,60,70]){ el("line",{x1:xs(v),x2:xs(v),y1:f.m.t,y2:f.m.t+rows.length*30,stroke:css("--rule")},f.svg); txt(f.svg,xs(v),f.m.t+rows.length*30+18,v+" %",{"text-anchor":"middle"}); }
  rows.forEach((r,i)=>{ const y=f.m.t+i*30+15; const show=stB.all||(r.c==="France"&&stB.ok); const real=Math.abs(r.y25-r.y24)>dmoe(r.y24,r.y25);
    const col = show ? (real?css("--accent"):css("--grey")) : css("--ink2");
    el("line",{x1:xs(r.y24),x2:xs(r.y25),y1:y,y2:y,stroke:col,"stroke-width":2},f.svg);
    el("circle",{cx:xs(r.y24),cy:y,r:4,fill:css("--panel"),stroke:col,"stroke-width":2},f.svg);
    shape(f.svg,show&&!real?"sq":"circ",xs(r.y25),y,5,col,true);
    txt(f.svg,f.m.l-8,y+4,r.c,{"text-anchor":"end"});
    const hit=el("rect",{x:f.m.l,y:y-15,width:f.iw,height:30,fill:"transparent"},f.svg); hover(f,hit,xs(r.y25),y-6,`<b>${r.c}</b><br>${r.y24} % → ${r.y25} %`); });
  legend($("#pewChart"),[{label:"2024 (vide) → 2025 (plein)",color:css("--ink2")},{label:"Évolution réelle",color:css("--accent")},{label:"Dans le bruit",color:css("--grey"),kind:"sq"}]);
}
$("#pb-btn").addEventListener("click",()=>{ const [c,m]=readNums(["pb-ch","pb-m"]); const tm=dmoe(23,36);
  if (isNaN(c)||isNaN(m)) return feedback($("#pb-fb"),false,"Remplissez les deux cases.");
  if (Math.abs(c-13)<=0.5 && Math.abs(m-tm)<=0.2){ feedback($("#pb-fb"),true,`Exact : +13 points pour une marge de ±${tm.toFixed(1)}. L'évolution est réelle.`); stB.ok=true; store.set("actB",stB); drawPew(); $("#pb-all").disabled=false; }
  else if (Math.abs(c-13)<=0.5) feedback($("#pb-fb"),false,"L'évolution est juste. Marge : 1,96 × √(0,23 × 0,77 ÷ 1 000 + 0,36 × 0,64 ÷ 1 000) × 100.");
  else feedback($("#pb-fb"),false,"L'évolution correspond à 2025 moins 2024."); });
$("#pb-all").addEventListener("click",()=>{ stB.all=true; store.set("actB",stB); drawPew(); markDone("activityB"); markDone("feedbackB"); });
$("#csvPew").value = "country,y24,y25\n"+PW.filter(r=>r.y24!==null).map(r=>`${r.c},${r.y24},${r.y25}`).join("\n");
const tn=$("#trendsNote"); tn.value=store.get("trends",""); tn.addEventListener("input",()=>{ store.set("trends",tn.value); if (tn.value.length>20) markDone("feedbackB"); });

/* quiz */
quiz($("#quizBox"), $("#quizScore"), [
 {q:"Un sondage auprès de 1 000 personnes donne 52 % de Oui. Quelle est approximativement sa marge d'erreur ?",o:["±1 point","±3 points","±10 points"],a:1,e:"1,96 × √(0,52 × 0,48 ÷ 1 000) ≈ 3,1 points."},
 {q:"Pour diviser la marge d'erreur par deux, un institut doit…",o:["doubler l'échantillon","quadrupler l'échantillon","poser de meilleures questions"],a:1,e:"La marge diminue avec la racine carrée de n : un échantillon quatre fois plus grand, une marge deux fois plus petite."},
 {q:"Les sondages moldaves ont manqué le résultat parmi les résidents bien au-delà de leurs marges. Quelle erreur la marge ne couvrait-elle pas ?",o:["Le hasard du choix des personnes interrogées","Les indécis, les refus de répondre et les pressions sur les électeurs","Les arrondis"],a:1,e:"Les erreurs non liées à l'échantillonnage échappent à la marge d'erreur, et sont souvent plus importantes."},
 {q:"Espagne : 33 % d'opinions favorables à la Chine en 2024, 37 % en 2025, environ 1 000 personnes chaque année. Que pouvez-vous en dire ?",o:["Les opinions se sont nettement améliorées","L'évolution reste dans le bruit","Le sondage est faux"],a:1,e:"La marge de l'écart est d'environ ±4,2 points, supérieure à l'évolution de 4 points."},
 {q:"Les recherches sur « Taiwan » triplent en une semaine. Cela montre…",o:["un soutien accru à Taiwan","une attention accrue portée à Taiwan","rien du tout"],a:1,e:"Google Trends mesure l'attention, non l'opinion."}], "quiz");

/* help when stuck */
helpAfter("la-btn","la-fb",()=>({"la-in":moe(.5,1100).toFixed(1)}));
helpAfter("aa-btn","aa-fb",()=>{ const e=est(P[0],"drop"); return {"aa-p":e.v.toFixed(1),"aa-m":e.m.toFixed(1)}; });
helpAfter("pb-btn","pb-fb",()=>({"pb-ch":"13","pb-m":dmoe(23,36).toFixed(1)}));

/* boot */
showGuess(); drawPolls(); drawPew(); if (stB.ok) $("#pb-all").disabled = stB.all;
if (stA.revealed) openFA();
wireCopy(); wireReset();
onRedraw(()=>{ drawPolls(); drawPew(); });
