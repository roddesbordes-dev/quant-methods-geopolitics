const fmt = num;
/* ---------- STEP 1 PUZZLE ---------- */
const euYears = Object.keys(DATA.eu).map(Number).sort((a,b)=>a-b);
function euPts(measure, from=1990, to=2024){ return euYears.filter(y=>y>=from&&y<=to).map(y=>[y, measure==="share"?DATA.eu[y].share: measure==="real"?DATA.eu[y].real_bn: DATA.eu[y].usd_bn]); }
function drawPuzzle(){
  const box=$("#puzzleCharts"); box.innerHTML='<div class="chart" id="pzA"></div><div class="chart" id="pzB"></div>';
  lineChart($("#pzA"),{title:"« L'Europe a désarmé »",sub:"Dépenses militaires, % du PIB, UE à 27",series:[{name:"",color:css("--verm"),shape:"tri",pts:euPts("share",1990,2021)}],yfmt:v=>v.toFixed(1)+"%",labelEnds:false,H:260});
  lineChart($("#pzB"),{title:"« L'Europe n'a jamais autant dépensé »",sub:"Dépenses militaires, milliards de dollars US courants, UE à 27",series:[{name:"",color:css("--accent"),shape:"circ",pts:euPts("usd",1990,2021)}],yfmt:v=>"$"+v.toFixed(0),labelEnds:false,H:260});
}
$$('#q-puzzle input').forEach(i=>i.addEventListener("change",()=>$("#puzBtn").disabled=false));
function puzReveal(v){
  $("#puzOut").hidden=false;
  const fb=$("#puzFb"); fb.className="fb "+(v==="both"?"ok":"no");
  fb.textContent = v==="both" ? "Exact." : "Pas tout à fait. Votre réponse : "+({a:"seulement le premier",b:"seulement le second",neither:"aucun des deux"}[v])+".";
}
$("#puzBtn").addEventListener("click",()=>{ const v=$('#q-puzzle input:checked')?.value; if(!v) return; store.set("puz",v); puzReveal(v); markDone("puzzle"); });

/* ---------- STEP 2 check ---------- */
$("#la-btn").addEventListener("click",()=>{ const v=parseFloat($("#la-in").value), fb=$("#la-fb");
  if (isNaN(v)){ fb.className="fb no"; fb.textContent="Saisissez d'abord un nombre."; return; }
  if (Math.abs(v-3.64)<=0.06){ fb.className="fb ok"; fb.textContent="Exact : 1,74 + 0,38 × 5 = 3,64 % par an."; markDone("lessonA"); }
  else { fb.className="fb no"; fb.textContent="Pas tout à fait. Multipliez d'abord 0,38 par 5, puis ajoutez 1,74."; } });

/* ---------- STEP 3 ACTIVITY A ---------- */
const A=1.74, B=0.38;
const ten = DATA.ten.map(d=>({...d, exp:A+B*d.lig, gap:d.off-(A+B*d.lig)}));
let stA = store.get("actA", {aOk:false, all:false, picks:[], revealed:false});
function saveA(){ store.set("actA", stA); }
function drawTenTable(){
  const t=$("#tenTable");
  const head = `<tr><th>Pays</th>${stA.revealed?"<th>Nom</th><th>Régime</th>":""}<th class="num">Croissance officielle</th><th class="num">Croissance des lumières</th><th class="num">Attendue</th><th class="num">Écart</th><th>Suspect ?</th></tr>`;
  t.innerHTML = head + ten.map(d=>{
    const show = stA.all || (d.id==="A" && stA.aOk);
    const picked = stA.picks.includes(d.id);
    return `<tr><td><strong>${d.id}</strong></td>${stA.revealed?`<td>${d.name}</td><td><span class="chip ${d.grp}">${d.grp==="NF"?"▲ Non libre":"● Libre"}</span></td>`:""}
      <td class="num">${d.off.toFixed(2)}</td><td class="num">${d.lig.toFixed(2)}</td>
      <td class="num">${show?d.exp.toFixed(2):"…"}</td><td class="num">${show?sgn(d.gap,2):"…"}</td>
      <td><label style="display:inline-flex;gap:.3rem;align-items:center"><input type="checkbox" data-pick="${d.id}" ${picked?"checked":""} ${stA.revealed?"disabled":""}><span class="small">${picked?"suspect":""}</span></label></td></tr>`; }).join("");
  $$("[data-pick]").forEach(c=>c.addEventListener("change",()=>{
    const id=c.dataset.pick; if (c.checked){ if (stA.picks.length>=4){ c.checked=false; $("#aa-count").textContent="Vous pouvez en choisir quatre au maximum."; return; } stA.picks.push(id);} else stA.picks=stA.picks.filter(x=>x!==id);
    saveA(); drawTenTable(); drawTenChart(); }));
  $("#aa-count").textContent = `${stA.picks.length} sur 4 choisis`;
  $("#aa-reveal").disabled = stA.picks.length===0 || stA.revealed;
  $("#aa-all").disabled = !stA.aOk || stA.all;
}
function drawTenChart(){
  const f = frame($("#tenChart"),{title:"Croissance officielle et croissance des lumières, 1992–2013",sub:"% par an ; la droite indique ce que déclarerait une démocratie typique",H:380,m:{t:16,r:24,b:44,l:48}});
  const xmin=-2,xmax=10,ymin=0,ymax=10;
  const xs=v=>f.m.l+(v-xmin)/(xmax-xmin)*f.iw, ys=v=>f.m.t+f.ih-(v-ymin)/(ymax-ymin)*f.ih;
  axes(f,xs,ys,{xticks:[-2,0,2,4,6,8,10],yticks:[0,2,4,6,8,10],yfmt:v=>v+"%",xfmt:v=>v+"%"});
  const t=el("text",{x:f.m.l+f.iw/2,y:f.H-6,"text-anchor":"middle"},f.svg); t.textContent="Croissance des lumières nocturnes, % par an";
  el("path",{d:`M${xs(xmin)},${ys(A+B*xmin)} L${xs(xmax)},${ys(A+B*xmax)}`,stroke:css("--hi"),"stroke-width":2,"stroke-dasharray":"6 4",fill:"none"},f.svg);
  const lt=el("text",{x:xs(-1.8),y:ys(A+B*-1.8)+20,"text-anchor":"start",class:"lab"},f.svg); lt.textContent="Attendue (démocraties)";
  const g=el("g",{},f.svg);
  for (const d of ten){
    const show = stA.all || (d.id==="A" && stA.aOk);
    const col = stA.revealed ? (d.grp==="NF"?css("--verm"):css("--accent")) : css("--ink2");
    if (show) el("line",{x1:xs(d.lig),x2:xs(d.lig),y1:ys(d.off),y2:ys(d.exp),stroke:col,"stroke-width":1.2,"stroke-dasharray":"2 2"},g);
    const s = shape(g, stA.revealed?(d.grp==="NF"?"tri":"circ"):"circ", xs(d.lig), ys(d.off), 6, col, true);
    const right = d.lig > 7; const lab=el("text",{x:xs(d.lig)+(right?-9:9),y:ys(d.off)+4,class:"lab","text-anchor":right?"end":"start"},g); lab.textContent = d.id + (stA.revealed?" "+d.name:"") + (stA.picks.includes(d.id)?" ★":"");
    const hit=el("circle",{cx:xs(d.lig),cy:ys(d.off),r:14,fill:"transparent"},g);
    hit.addEventListener("pointerenter",()=>showTip(f,xs(d.lig),ys(d.off),`<b>${d.id}${stA.revealed?" · "+d.name:""}</b><br>officielle ${d.off.toFixed(2)} % · lumières ${d.lig.toFixed(2)} %${show?"<br>écart "+sgn(d.gap,2):""}`));
    hit.addEventListener("pointerleave",()=>hideTip(f));
  }
  if (stA.revealed){ const lg=document.createElement("div"); lg.className="legend"; lg.innerHTML=`<span><svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="${css("--accent")}"/></svg>Libre</span><span><svg width="12" height="12"><path d="M6,0 L12,11 L0,11Z" fill="${css("--verm")}"/></svg>Non libre</span><span>★ vos suspects</span>`; $("#tenChart").appendChild(lg); }
}
$("#aa-btn").addEventListener("click",()=>{ const e=parseFloat($("#aa-exp").value), g=parseFloat($("#aa-gap").value), fb=$("#aa-fb"); const a=ten[0];
  if (isNaN(e)||isNaN(g)){ fb.className="fb no"; fb.textContent="Remplissez les deux cases."; return; }
  const okE=Math.abs(e-a.exp)<=0.03, okG=Math.abs(g-a.gap)<=0.04;
  if (okE&&okG){ fb.className="fb ok"; fb.textContent=`Exact : 1,74 + 0,38 × ${a.lig} = ${a.exp.toFixed(2)}, et ${a.off} − ${a.exp.toFixed(2)} = ${sgn(a.gap,2)}. A a crû un peu moins que ne le suggèrent ses lumières.`; stA.aOk=true; saveA(); drawTenTable(); drawTenChart(); }
  else if (okE){ fb.className="fb no"; fb.textContent="La croissance attendue est correcte. Pour l'écart, soustrayez la croissance attendue de la croissance officielle (le résultat est négatif)."; }
  else { fb.className="fb no"; fb.textContent=`Pas encore. Attendue = 1,74 + 0,38 × ${a.lig}.`; } });
$("#aa-all").addEventListener("click",()=>{ stA.all=true; saveA(); drawTenTable(); drawTenChart(); });
$("#aa-reveal").addEventListener("click",()=>{ stA.revealed=true; saveA(); drawTenTable(); drawTenChart(); markDone("activityA"); openFeedbackA(); });
$("#csvTen").value = "country,official,light\n"+ten.map(d=>`${d.id},${d.off},${d.lig}`).join("\n");

/* ---------- STEP 4 FEEDBACK A ---------- */
function openFeedbackA(){
  $("#fa-locked").hidden=true; $("#fa-body").hidden=false;
  const hits = stA.picks.filter(id=>ten.find(d=>d.id===id).grp==="NF").length;
  $("#fa-score").textContent = stA.picks.length ? `${hits} de vos ${stA.picks.length} suspects ${hits<=1?"était classé":"étaient classés"} Non libre${hits<=1?"":"s"}.` : "Vous n'avez choisi aucun suspect ; voici les réponses.";
  drawAllChart(); markDone("feedbackA");
}
$("#fa-skip").addEventListener("click", openFeedbackA);
function drawAllChart(){
  const f=frame($("#allChart"),{title:"105 pays : croissance officielle et croissance des lumières, 1992–2013",sub:"% par an",H:420,m:{t:16,r:24,b:44,l:48}});
  const xmin=-4,xmax=14,ymin=-2,ymax=12;
  const xs=v=>f.m.l+(v-xmin)/(xmax-xmin)*f.iw, ys=v=>f.m.t+f.ih-(v-ymin)/(ymax-ymin)*f.ih;
  axes(f,xs,ys,{xticks:[-4,-2,0,2,4,6,8,10,12,14],yticks:[-2,0,2,4,6,8,10,12],yfmt:v=>v+"%",xfmt:v=>v+"%"});
  const t=el("text",{x:f.m.l+f.iw/2,y:f.H-6,"text-anchor":"middle"},f.svg); t.textContent="Croissance des lumières nocturnes, % par an";
  el("path",{d:`M${xs(xmin)},${ys(A+B*xmin)} L${xs(xmax)},${ys(A+B*xmax)}`,stroke:css("--hi"),"stroke-width":2,"stroke-dasharray":"6 4",fill:"none"},f.svg);
  const g=el("g",{},f.svg);
  const order={PF:0,F:1,NF:2};
  const colr={F:css("--accent"),NF:css("--verm"),PF:css("--grey")}, shp={F:"circ",NF:"tri",PF:"sq"};
  for (const d of [...DATA.all].sort((a,b)=>order[a.g]-order[b.g])){
    if (d.l<xmin||d.l>xmax||d.o<ymin||d.o>ymax) continue;
    shape(g, shp[d.g], xs(d.l), ys(d.o), 5, colr[d.g], true);
    const hit=el("circle",{cx:xs(d.l),cy:ys(d.o),r:9,fill:"transparent"},g);
    const gap=d.o-(A+B*d.l);
    hit.addEventListener("pointerenter",()=>showTip(f,xs(d.l),ys(d.o),`<b>${d.n}</b> · ${({F:"Libre",PF:"Partiellement libre",NF:"Non libre"})[d.g]}<br>officielle ${d.o.toFixed(2)} % · lumières ${d.l.toFixed(2)} %<br>écart ${sgn(gap,2)}`));
    hit.addEventListener("pointerleave",()=>hideTip(f));
  }
  for (const n of ["China","Myanmar","India","Germany","Russia"]){ const d=DATA.all.find(x=>x.n===n); if(!d) continue; const tl=el("text",{x:xs(d.l)+8,y:ys(d.o)-7,class:"lab"},g); tl.textContent=n; }
  const lg=document.createElement("div"); lg.className="legend";
  lg.innerHTML=`<span><svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="${colr.F}"/></svg>Libre</span><span><svg width="12" height="12"><rect x="1" y="1" width="10" height="10" fill="${colr.PF}"/></svg>Partiellement libre</span><span><svg width="12" height="12"><path d="M6,0 L12,11 L0,11Z" fill="${colr.NF}"/></svg>Non libre</span><span><svg width="18" height="12"><path d="M0,6 H18" stroke="${css("--hi")}" stroke-width="2" stroke-dasharray="5 3"/></svg>Attendue (démocraties)</span>`;
  $("#allChart").appendChild(lg);
}

/* ---------- STEP 5 LESSON B ---------- */
let euM="usd", euS=1990;
function drawEU(){
  const pts=euPts(euM, euS, 2024);
  const lab={usd:["Milliards de dollars US courants",v=>v.toFixed(0)+" $"],share:["% du PIB",v=>v.toFixed(1)+" %"],real:["Milliards de dollars US aux prix de 2015",v=>v.toFixed(0)+" $"]}[euM];
  lineChart($("#euChart"),{title:"Dépenses militaires de l'UE à 27, "+euS+"–2024",sub:lab[0],series:[{name:"",color:css("--accent"),shape:"circ",pts}],yfmt:lab[1],labelEnds:false,H:300});
  const a=pts[0][1], b=pts[pts.length-1][1], ch=(b/a-1)*100;
  $("#euSentence").textContent = euM==="share" ? `De ${euS} à 2024 : de ${a.toFixed(1)} % à ${b.toFixed(1)} % du PIB (${sgn(b-a,1)} points).` : `De ${euS} à 2024 : ${sgn(ch,0)} % (de ${lab[1](a).replace(" $","")} à ${lab[1](b).replace(" $","")} milliards de dollars).`;
}
function seg(id, cb){ $$(`#${id} button`).forEach(b=>b.addEventListener("click",()=>{ $$(`#${id} button`).forEach(x=>x.setAttribute("aria-pressed", x===b)); cb(b.dataset.v); })); }
seg("segMeasure", v=>{euM=v; drawEU(); markDone("lessonB");});
seg("segStart", v=>{euS=+v; drawEU(); markDone("lessonB");});

/* ---------- STEP 6 ACTIVITY B ---------- */
const NAMES={POL:"Pologne",DEU:"Allemagne",ITA:"Italie"};
const T=DATA.three;
let stB=store.get("actB",{guess:null,pOk:false,all:false});
function saveB(){ store.set("actB",stB); }
const rr = (c,y)=>T[c][y].real_bn;
function drawThreeTable(){
  const rows=["POL","DEU","ITA"].map(c=>{ const show=stB.all||(c==="POL"&&stB.pOk);
    const a=rr(c,2021), b=rr(c,2024);
    return `<tr><td><strong>${NAMES[c]}</strong></td><td class="num">${T[c][2021].share.toFixed(2)}</td><td class="num">${T[c][2024].share.toFixed(2)}</td><td class="num">${T[c][2021].gdp_real_bn.toFixed(1)}</td><td class="num">${T[c][2024].gdp_real_bn.toFixed(1)}</td><td class="num">${show?a.toFixed(1):"…"}</td><td class="num">${show?b.toFixed(1):"…"}</td><td class="num">${show?sgn((b/a-1)*100,0)+" %":"…"}</td></tr>`; });
  $("#threeTable").innerHTML=`<tr><th>Pays</th><th class="num">Part du PIB 2021, %</th><th class="num">Part 2024, %</th><th class="num">PIB réel 2021, Md$</th><th class="num">PIB réel 2024, Md$</th><th class="num">Dépenses réelles 2021, Md$</th><th class="num">Dépenses réelles 2024, Md$</th><th class="num">Variation</th></tr>`+rows.join("");
  $("#pb-all").disabled=!stB.pOk||stB.all;
}
function drawThreeChart(){
  const cols={POL:css("--accent"),DEU:css("--verm"),ITA:css("--hi")}, shp={POL:"circ",DEU:"tri",ITA:"sq"};
  const show = stB.all ? ["POL","DEU","ITA"] : stB.pOk ? ["POL"] : [];
  if (!show.length){ $("#threeChart").innerHTML='<div class="cs" style="padding:2rem 1rem">Le graphique apparaît une fois la Pologne calculée.</div>'; return; }
  const series=show.map(c=>({name:NAMES[c],color:cols[c],shape:shp[c],pts:Object.keys(T[c]).map(Number).sort((a,b)=>a-b).map(y=>[y, T[c][y].real_bn/rr(c,2021)*100])}));
  lineChart($("#threeChart"),{title:"Dépenses de défense réelles, 2014–2024",sub:"Indice, 2021 = 100",series,yfmt:v=>v.toFixed(0),H:300});
}
$$('#q-guessB input').forEach(i=>i.addEventListener("change",()=>{ if(!stB.guess) $("#gbBtn").disabled=false; }));
function showGuess(){ if(!stB.guess) return; $("#gbOut").textContent="Votre réponse : "+NAMES[stB.guess]+". Vérifiez-la maintenant."; $("#gbBtn").disabled=true; $$('#q-guessB input').forEach(i=>{i.disabled=true; i.checked=i.value===stB.guess;}); fbB(); }
$("#gbBtn").addEventListener("click",()=>{ const v=$('#q-guessB input:checked')?.value; if(!v) return; stB.guess=v; saveB(); showGuess(); });
$("#pb-btn").addEventListener("click",()=>{ const a=parseFloat($("#pb-21").value), b=parseFloat($("#pb-24").value), c=parseFloat($("#pb-ch").value), fb=$("#pb-fb");
  const A1=rr("POL",2021), B1=rr("POL",2024), C1=(B1/A1-1)*100;
  if ([a,b,c].some(isNaN)){ fb.className="fb no"; fb.textContent="Remplissez les trois cases."; return; }
  const ok1=Math.abs(a-A1)<=0.15, ok2=Math.abs(b-B1)<=0.15, ok3=Math.abs(c-C1)<=2;
  if (ok1&&ok2&&ok3){ fb.className="fb ok"; fb.textContent=`Exact : 2,217/100 × 605,3 = ${A1.toFixed(1)} ; 4,154/100 × 658,1 = ${B1.toFixed(1)} ; variation ${sgn(C1,0)} %.`; stB.pOk=true; saveB(); drawThreeTable(); drawThreeChart(); }
  else { fb.className="fb no"; fb.textContent = !ok1||!ok2 ? "Vérifiez les dépenses : divisez la part par 100, puis multipliez par le PIB réel." : "Les dépenses sont correctes. Variation = (2024 ÷ 2021 − 1) × 100."; } });
$("#pb-all").addEventListener("click",()=>{ stB.all=true; saveB(); drawThreeTable(); drawThreeChart(); markDone("activityB"); fbB(); });
function fbB(){ const g=stB.guess; $("#fbB-guess").textContent = !g ? "Faites votre pronostic à l'étape 6 pour comparer." : g==="POL" ? "Votre pronostic, la Pologne, était juste." : `Votre pronostic était : ${NAMES[g]}. La réponse est la Pologne.`; if (g && stB.all) markDone("feedbackB"); }
$("#csvThree").value="country,year,share,gdp_real\n"+["POL","DEU","ITA"].flatMap(c=>Object.keys(T[c]).map(y=>`${NAMES[c]},${y},${T[c][y].share},${T[c][y].gdp_real_bn}`)).join("\n");

/* ---------- STEP 8 EXERCISE ---------- */
const DE=T.DEU, deYears=Object.keys(DE).map(Number).sort((a,b)=>a-b);
function barChart(container,{title,sub,vals,ymin,yfmt,color,H=300,source}){
  const f=frame(container,{title,sub,H,m:{t:16,r:16,b:30,l:52}});
  const ymax=Math.max(...vals.map(v=>v[1]))*1.08; const yt=niceTicks(ymin,ymax,4);
  const top=yt.ticks[yt.ticks.length-1]>=ymax?yt.ticks[yt.ticks.length-1]:ymax;
  const ys=v=>f.m.t+f.ih-(v-ymin)/(top-ymin)*f.ih; const bw=f.iw/vals.length;
  axes(f,i=>f.m.l+bw*(i+.5),ys,{xticks:[],yticks:yt.ticks.filter(v=>v>=ymin&&v<=top),yfmt});
  vals.forEach((v,i)=>{ const x=f.m.l+bw*i+bw*0.18, w=bw*0.64, y=ys(v[1]), h=ys(ymin)-y;
    el("path",{d:`M${x},${y+h} V${y+3} Q${x},${y} ${x+3},${y} H${x+w-3} Q${x+w},${y} ${x+w},${y+3} V${y+h} Z`,fill:color},f.svg);
    if (i%2===0||i===vals.length-1){ const t=el("text",{x:x+w/2,y:f.H-f.m.b+18,"text-anchor":"middle"},f.svg); t.textContent=v[0]; }
    const hit=el("rect",{x:f.m.l+bw*i,y:f.m.t,width:bw,height:f.ih,fill:"transparent"},f.svg);
    hit.addEventListener("pointerenter",()=>showTip(f,x+w/2,y,`<b>${v[0]}</b>: ${yfmt(v[1])}`)); hit.addEventListener("pointerleave",()=>hideTip(f)); });
  if (source){ const s=document.createElement("div"); s.className="cs"; s.textContent=source; container.appendChild(s); }
}
function drawBad(){ barChart($("#badChart"),{title:"Les dépenses de défense de l'Allemagne ont explosé !",sub:"Milliards de dollars US",vals:deYears.map(y=>[y,DE[y].usd_bn]),ymin:40,yfmt:v=>v.toFixed(0),color:css("--verm"),H:280}); }
let bM="usd", bA="cut";
function drawFix(){
  const m={usd:["Milliards de dollars US courants",y=>DE[y].usd_bn,v=>v.toFixed(0),40],real:["Milliards de dollars US aux prix de 2015",y=>DE[y].real_bn,v=>v.toFixed(0),30],share:["% du PIB",y=>DE[y].share,v=>v.toFixed(1)+" %",1]}[bM];
  const ymin = bA==="zero"?0:m[3];
  barChart($("#fixChart"),{title:"Dépenses de défense de l'Allemagne, 2014–2024",sub:m[0]+(bA==="zero"?"":" (axe coupé)"),vals:deYears.map(y=>[y,m[1](y)]),ymin,yfmt:m[2],color:css("--accent"),H:260,source:"Source : SIPRI via Banque mondiale, World Development Indicators"});
  const fb=$("#fixFb");
  if (bA==="cut"){ fb.className="fb no"; fb.textContent="L'axe est toujours coupé : la longueur des barres n'est pas proportionnelle aux valeurs."; }
  else if (bM==="usd"){ fb.className="fb no"; fb.textContent="Axe corrigé. Les dollars courants mélangent toujours croissance réelle, inflation et taux de change."; }
  else { fb.className="fb ok"; fb.textContent = bM==="real" ? "Honnête : termes réels, à partir de zéro. Les dépenses ont augmenté d'environ 83 % en dix ans, surtout après 2021." : "Honnête aussi : une part du PIB à partir de zéro, de 1,1 % à 1,9 %. Cela répond à une autre question : l'effort rapporté à la taille de l'économie."; markDone("exercise"); }
}
seg("segBadM",v=>{bM=v;drawFix();}); seg("segBadA",v=>{bA=v;drawFix();});
$("#badBtn").addEventListener("click",()=>{ const sel=$$('#q-bad input:checked').map(i=>i.value), right=["axis","nominal","source"];
  const ok = right.every(r=>sel.includes(r)) && sel.length===3, fb=$("#badFb");
  fb.className="fb "+(ok?"ok":"no");
  fb.textContent = ok ? "Exact : trois problèmes. Les chiffres eux-mêmes sont réels (SIPRI), et les barres conviennent pour des totaux annuels." : sel.includes("invented") ? "Les chiffres sont de vraies données du SIPRI ; le problème est la manière dont ils sont présentés." : sel.includes("bars") ? "Les barres conviennent pour des totaux annuels, à condition de partir de zéro." : "Il y a trois problèmes à trouver."; });
const note=$("#note"); note.value=store.get("note","");
function wc(){ const n=note.value.trim()?note.value.trim().split(/\s+/).length:0; $("#wc").textContent=n+(n>1?" mots":" mot"); }
note.addEventListener("input",()=>{store.set("note",note.value); wc();}); wc();
$("#modelBtn").addEventListener("click",()=>{ $("#model").hidden=!$("#model").hidden; });

/* ---------- STEP 9 QUIZ ---------- */
const QUIZ=[
 {q:"Les dépenses de défense de l'UE ont augmenté en dollars courants entre 1990 et 2021, mais baissé en part du PIB. Comment est-ce possible ?",o:["L'une des deux séries est forcément fausse","Le PIB a crû plus vite que les dépenses de défense","L'inflation a réduit la part du PIB"],a:1,e:"Une part baisse dès que le dénominateur, le PIB, croît plus vite que le numérateur."},
 {q:"Exprimer les dépenses en termes réels élimine l'effet…",o:["des variations de prix","des variations de la taille de l'économie","des variations du nombre de soldats"],a:0,e:"Les termes réels maintiennent les prix constants ; c'est la part du PIB qui tient compte de la taille de l'économie."},
 {q:"Pourquoi les lumières nocturnes sont-elles utiles pour vérifier la croissance officielle ?",o:["Elles mesurent exactement le PIB","Elles sont produites par une source que le gouvernement ne peut pas retoucher","Elles sont plus brillantes dans les démocraties"],a:1,e:"Les images satellites sont un témoin extérieur ; elles sont bruitées, mais un institut statistique ne peut pas les manipuler."},
 {q:"La croissance officielle d'un pays dépasse de 2 points par an ce qu'impliquent ses lumières. Que pouvez-vous en conclure ?",o:["Son gouvernement falsifie les statistiques","Le cas mérite enquête","Rien du tout"],a:1,e:"Un écart désigne un suspect, pas un coupable : pensez à une croissance tirée par les services ou à la saturation des lumières urbaines."},
 {q:"L'axe vertical d'un diagramme en barres commence à 40 au lieu de 0. Quel est le problème ?",o:["Aucun, si l'axe est légendé","La longueur des barres n'est plus proportionnelle aux valeurs","Les barres deviennent plus difficiles à colorer"],a:1,e:"Les lecteurs comparent la longueur des barres ; un axe coupé exagère les différences."}];
let qa=store.get("quiz",{});
function drawQuiz(){
  $("#quizBox").innerHTML=QUIZ.map((q,i)=>`<div class="box"><p style="margin-top:0"><strong>${i+1}. ${q.q}</strong></p><div class="choice">${q.o.map((o,j)=>`<label><input type="radio" name="qz${i}" value="${j}" ${qa[i]===j?"checked":""} ${qa[i]!==undefined?"disabled":""}> ${o}</label>`).join("")}</div>${qa[i]!==undefined?`<p class="fb ${qa[i]===q.a?"ok":"no"}">${qa[i]===q.a?"Exact. ":"Pas tout à fait. "}${q.e}</p>`:""}</div>`).join("");
  $$("#quizBox input").forEach(i=>i.addEventListener("change",()=>{ qa[+i.name.slice(2)]=+i.value; store.set("quiz",qa); drawQuiz(); }));
  const n=Object.keys(qa).length, s=QUIZ.filter((q,i)=>qa[i]===q.a).length;
  $("#quizScore").textContent = n===QUIZ.length ? `Score : ${s} sur ${QUIZ.length}.` : "";
  if (n===QUIZ.length) markDone("quiz");
}

$("#dl-btn").addEventListener("click",()=>{ const [v]=readNums(["dl-in"]);
  if (Math.abs(v-1.89)<=0.02) feedback($("#dl-fb"),true,"Exact : 1,89 % du PIB en 2024 (SIPRI). Si votre téléchargement affiche un chiffre légèrement différent, la base a été révisée depuis octobre 2026 : notez toujours la date de votre téléchargement.");
  else feedback($("#dl-fb"),false,"Cherchez 2024 dans la série de l'Allemagne ; la valeur doit être juste en dessous de 2 %."); });
wireCopy(); wireReset();
/* help when stuck */
helpAfter("la-btn","la-fb",()=>({"la-in":"3.64"}));
helpAfter("aa-btn","aa-fb",()=>({"aa-exp":ten[0].exp.toFixed(2),"aa-gap":ten[0].gap.toFixed(2)}));
helpAfter("pb-btn","pb-fb",()=>({"pb-21":rr("POL",2021).toFixed(1),"pb-24":rr("POL",2024).toFixed(1),"pb-ch":Math.round((rr("POL",2024)/rr("POL",2021)-1)*100)}));
helpAfter("dl-btn","dl-fb",()=>({"dl-in":"1.89"}));

/* ---------- boot ---------- */
function drawCharts(){ drawPuzzle(); drawTenChart(); if (!$("#fa-body").hidden) drawAllChart(); drawEU(); drawThreeChart(); drawBad(); drawFix(); }
function drawAll(){
  drawTenTable(); drawThreeTable(); drawQuiz(); drawCharts();
  const p=store.get("puz",null); if (p){ $$('#q-puzzle input').forEach(i=>{i.checked=i.value===p; i.disabled=true;}); $("#puzBtn").disabled=true; puzReveal(p); }
  if (stA.revealed) openFeedbackA();
  if (stA.aOk){ const a=ten[0]; $("#aa-exp").value=a.exp.toFixed(2); $("#aa-gap").value=a.gap.toFixed(2); }
  showGuess(); fbB();
}
drawAll();
// redraw charts when the theme changes so colours follow the tokens
try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", drawCharts); new MutationObserver(drawCharts).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]}); } catch(e){}
let rz, lastW=innerWidth; addEventListener("resize",()=>{ if (innerWidth===lastW) return; lastW=innerWidth; clearTimeout(rz); rz=setTimeout(drawCharts,200);});
