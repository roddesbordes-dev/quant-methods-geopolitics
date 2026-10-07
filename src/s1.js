const fmt = num;
/* ---------- STEP 1 PUZZLE ---------- */
const euYears = Object.keys(DATA.eu).map(Number).sort((a,b)=>a-b);
function euPts(measure, from=1990, to=2024){ return euYears.filter(y=>y>=from&&y<=to).map(y=>[y, measure==="share"?DATA.eu[y].share: measure==="real"?DATA.eu[y].real_bn: DATA.eu[y].usd_bn]); }
function drawPuzzle(){
  const box=$("#puzzleCharts"); box.innerHTML='<div class="chart" id="pzA"></div><div class="chart" id="pzB"></div>';
  lineChart($("#pzA"),{title:"“Europe has disarmed”",sub:"Military spending, % of GDP, EU-27",series:[{name:"",color:css("--verm"),shape:"tri",pts:euPts("share",1990,2021)}],yfmt:v=>v.toFixed(1)+"%",labelEnds:false,H:260});
  lineChart($("#pzB"),{title:"“Europe has never spent more”",sub:"Military spending, billion current US$, EU-27",series:[{name:"",color:css("--accent"),shape:"circ",pts:euPts("usd",1990,2021)}],yfmt:v=>"$"+v.toFixed(0),labelEnds:false,H:260});
}
$$('#q-puzzle input').forEach(i=>i.addEventListener("change",()=>$("#puzBtn").disabled=false));
function puzReveal(v){
  $("#puzOut").hidden=false;
  const fb=$("#puzFb"); fb.className="fb "+(v==="both"?"ok":"no");
  fb.textContent = v==="both" ? "Right." : "Not quite. Your answer: "+({a:"only the first",b:"only the second",neither:"neither"}[v])+".";
}
$("#puzBtn").addEventListener("click",()=>{ const v=$('#q-puzzle input:checked')?.value; if(!v) return; store.set("puz",v); puzReveal(v); markDone("puzzle"); });

/* ---------- STEP 2 check ---------- */
$("#la-btn").addEventListener("click",()=>{ const v=parseFloat($("#la-in").value), fb=$("#la-fb");
  if (isNaN(v)){ fb.className="fb no"; fb.textContent="Type a number first."; return; }
  if (Math.abs(v-3.64)<=0.06){ fb.className="fb ok"; fb.textContent="Right: 1.74 + 0.38 × 5 = 3.64% a year."; markDone("lessonA"); }
  else { fb.className="fb no"; fb.textContent="Not quite. Multiply 0.38 by 5 first, then add 1.74."; } });

/* ---------- STEP 3 ACTIVITY A ---------- */
const A=1.74, B=0.38;
const ten = DATA.ten.map(d=>({...d, exp:A+B*d.lig, gap:d.off-(A+B*d.lig)}));
let stA = store.get("actA", {aOk:false, all:false, picks:[], revealed:false});
function saveA(){ store.set("actA", stA); }
function drawTenTable(){
  const t=$("#tenTable");
  const head = `<tr><th>Country</th>${stA.revealed?"<th>Name</th><th>Regime</th>":""}<th class="num">Official growth</th><th class="num">Light growth</th><th class="num">Expected</th><th class="num">Gap</th><th>Suspect?</th></tr>`;
  t.innerHTML = head + ten.map(d=>{
    const show = stA.all || (d.id==="A" && stA.aOk);
    const picked = stA.picks.includes(d.id);
    return `<tr><td><strong>${d.id}</strong></td>${stA.revealed?`<td>${d.name}</td><td><span class="chip ${d.grp}">${d.grp==="NF"?"▲ Not Free":"● Free"}</span></td>`:""}
      <td class="num">${d.off.toFixed(2)}</td><td class="num">${d.lig.toFixed(2)}</td>
      <td class="num">${show?d.exp.toFixed(2):"…"}</td><td class="num">${show?sgn(d.gap,2):"…"}</td>
      <td><label style="display:inline-flex;gap:.3rem;align-items:center"><input type="checkbox" data-pick="${d.id}" ${picked?"checked":""} ${stA.revealed?"disabled":""}><span class="small">${picked?"suspect":""}</span></label></td></tr>`; }).join("");
  $$("[data-pick]").forEach(c=>c.addEventListener("change",()=>{
    const id=c.dataset.pick; if (c.checked){ if (stA.picks.length>=4){ c.checked=false; $("#aa-count").textContent="You can pick four at most."; return; } stA.picks.push(id);} else stA.picks=stA.picks.filter(x=>x!==id);
    saveA(); drawTenTable(); drawTenChart(); }));
  $("#aa-count").textContent = `${stA.picks.length} of 4 picked`;
  $("#aa-reveal").disabled = stA.picks.length===0 || stA.revealed;
  $("#aa-all").disabled = !stA.aOk || stA.all;
}
function drawTenChart(){
  const f = frame($("#tenChart"),{title:"Official growth against light growth, 1992–2013",sub:"% a year; the line is what a typical democracy would report",H:380,m:{t:16,r:24,b:44,l:48}});
  const xmin=-2,xmax=10,ymin=0,ymax=10;
  const xs=v=>f.m.l+(v-xmin)/(xmax-xmin)*f.iw, ys=v=>f.m.t+f.ih-(v-ymin)/(ymax-ymin)*f.ih;
  axes(f,xs,ys,{xticks:[-2,0,2,4,6,8,10],yticks:[0,2,4,6,8,10],yfmt:v=>v+"%",xfmt:v=>v+"%"});
  const t=el("text",{x:f.m.l+f.iw/2,y:f.H-6,"text-anchor":"middle"},f.svg); t.textContent="Growth of night lights, % a year";
  el("path",{d:`M${xs(xmin)},${ys(A+B*xmin)} L${xs(xmax)},${ys(A+B*xmax)}`,stroke:css("--hi"),"stroke-width":2,"stroke-dasharray":"6 4",fill:"none"},f.svg);
  const lt=el("text",{x:xs(-1.8),y:ys(A+B*-1.8)+20,"text-anchor":"start",class:"lab"},f.svg); lt.textContent="Expected (democracies)";
  const g=el("g",{},f.svg);
  for (const d of ten){
    const show = stA.all || (d.id==="A" && stA.aOk);
    const col = stA.revealed ? (d.grp==="NF"?css("--verm"):css("--accent")) : css("--ink2");
    if (show) el("line",{x1:xs(d.lig),x2:xs(d.lig),y1:ys(d.off),y2:ys(d.exp),stroke:col,"stroke-width":1.2,"stroke-dasharray":"2 2"},g);
    const s = shape(g, stA.revealed?(d.grp==="NF"?"tri":"circ"):"circ", xs(d.lig), ys(d.off), 6, col, true);
    const right = d.lig > 7; const lab=el("text",{x:xs(d.lig)+(right?-9:9),y:ys(d.off)+4,class:"lab","text-anchor":right?"end":"start"},g); lab.textContent = d.id + (stA.revealed?" "+d.name:"") + (stA.picks.includes(d.id)?" ★":"");
    const hit=el("circle",{cx:xs(d.lig),cy:ys(d.off),r:14,fill:"transparent"},g);
    hit.addEventListener("pointerenter",()=>showTip(f,xs(d.lig),ys(d.off),`<b>${d.id}${stA.revealed?" · "+d.name:""}</b><br>official ${d.off.toFixed(2)}% · lights ${d.lig.toFixed(2)}%${show?"<br>gap "+sgn(d.gap,2):""}`));
    hit.addEventListener("pointerleave",()=>hideTip(f));
  }
  if (stA.revealed){ const lg=document.createElement("div"); lg.className="legend"; lg.innerHTML=`<span><svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="${css("--accent")}"/></svg>Free</span><span><svg width="12" height="12"><path d="M6,0 L12,11 L0,11Z" fill="${css("--verm")}"/></svg>Not Free</span><span>★ your suspects</span>`; $("#tenChart").appendChild(lg); }
}
$("#aa-btn").addEventListener("click",()=>{ const e=parseFloat($("#aa-exp").value), g=parseFloat($("#aa-gap").value), fb=$("#aa-fb"); const a=ten[0];
  if (isNaN(e)||isNaN(g)){ fb.className="fb no"; fb.textContent="Fill in both boxes."; return; }
  const okE=Math.abs(e-a.exp)<=0.03, okG=Math.abs(g-a.gap)<=0.04;
  if (okE&&okG){ fb.className="fb ok"; fb.textContent=`Right: 1.74 + 0.38 × ${a.lig} = ${a.exp.toFixed(2)}, and ${a.off} − ${a.exp.toFixed(2)} = ${sgn(a.gap,2)}. A grew slightly less than its lights suggest.`; stA.aOk=true; saveA(); drawTenTable(); drawTenChart(); }
  else if (okE){ fb.className="fb no"; fb.textContent="Expected is right. For the gap, subtract expected from official growth (the answer is negative)."; }
  else { fb.className="fb no"; fb.textContent=`Not yet. Expected = 1.74 + 0.38 × ${a.lig}.`; } });
$("#aa-all").addEventListener("click",()=>{ stA.all=true; saveA(); drawTenTable(); drawTenChart(); });
$("#aa-reveal").addEventListener("click",()=>{ stA.revealed=true; saveA(); drawTenTable(); drawTenChart(); markDone("activityA"); openFeedbackA(); });
$("#csvTen").value = "country,official,light\n"+ten.map(d=>`${d.id},${d.off},${d.lig}`).join("\n");

/* ---------- STEP 4 FEEDBACK A ---------- */
function openFeedbackA(){
  $("#fa-locked").hidden=true; $("#fa-body").hidden=false;
  const hits = stA.picks.filter(id=>ten.find(d=>d.id===id).grp==="NF").length;
  $("#fa-score").textContent = stA.picks.length ? `${hits} of your ${stA.picks.length} suspects ${hits===1?"was":"were"} rated Not Free.` : "You did not pick any suspects; here are the answers.";
  drawAllChart(); markDone("feedbackA");
}
$("#fa-skip").addEventListener("click", openFeedbackA);
function drawAllChart(){
  const f=frame($("#allChart"),{title:"105 countries: official growth against light growth, 1992–2013",sub:"% a year",H:420,m:{t:16,r:24,b:44,l:48}});
  const xmin=-4,xmax=14,ymin=-2,ymax=12;
  const xs=v=>f.m.l+(v-xmin)/(xmax-xmin)*f.iw, ys=v=>f.m.t+f.ih-(v-ymin)/(ymax-ymin)*f.ih;
  axes(f,xs,ys,{xticks:[-4,-2,0,2,4,6,8,10,12,14],yticks:[-2,0,2,4,6,8,10,12],yfmt:v=>v+"%",xfmt:v=>v+"%"});
  const t=el("text",{x:f.m.l+f.iw/2,y:f.H-6,"text-anchor":"middle"},f.svg); t.textContent="Growth of night lights, % a year";
  el("path",{d:`M${xs(xmin)},${ys(A+B*xmin)} L${xs(xmax)},${ys(A+B*xmax)}`,stroke:css("--hi"),"stroke-width":2,"stroke-dasharray":"6 4",fill:"none"},f.svg);
  const g=el("g",{},f.svg);
  const order={PF:0,F:1,NF:2};
  const colr={F:css("--accent"),NF:css("--verm"),PF:css("--grey")}, shp={F:"circ",NF:"tri",PF:"sq"};
  for (const d of [...DATA.all].sort((a,b)=>order[a.g]-order[b.g])){
    if (d.l<xmin||d.l>xmax||d.o<ymin||d.o>ymax) continue;
    shape(g, shp[d.g], xs(d.l), ys(d.o), 5, colr[d.g], true);
    const hit=el("circle",{cx:xs(d.l),cy:ys(d.o),r:9,fill:"transparent"},g);
    const gap=d.o-(A+B*d.l);
    hit.addEventListener("pointerenter",()=>showTip(f,xs(d.l),ys(d.o),`<b>${d.n}</b> · ${({F:"Free",PF:"Partly Free",NF:"Not Free"})[d.g]}<br>official ${d.o.toFixed(2)}% · lights ${d.l.toFixed(2)}%<br>gap ${sgn(gap,2)}`));
    hit.addEventListener("pointerleave",()=>hideTip(f));
  }
  for (const n of ["China","Myanmar","India","Germany","Russia"]){ const d=DATA.all.find(x=>x.n===n); if(!d) continue; const tl=el("text",{x:xs(d.l)+8,y:ys(d.o)-7,class:"lab"},g); tl.textContent=n; }
  const lg=document.createElement("div"); lg.className="legend";
  lg.innerHTML=`<span><svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="${colr.F}"/></svg>Free</span><span><svg width="12" height="12"><rect x="1" y="1" width="10" height="10" fill="${colr.PF}"/></svg>Partly Free</span><span><svg width="12" height="12"><path d="M6,0 L12,11 L0,11Z" fill="${colr.NF}"/></svg>Not Free</span><span><svg width="18" height="12"><path d="M0,6 H18" stroke="${css("--hi")}" stroke-width="2" stroke-dasharray="5 3"/></svg>Expected (democracies)</span>`;
  $("#allChart").appendChild(lg);
}

/* ---------- STEP 5 LESSON B ---------- */
let euM="usd", euS=1990;
function drawEU(){
  const pts=euPts(euM, euS, 2024);
  const lab={usd:["Billion current US$",v=>"$"+v.toFixed(0)],share:["% of GDP",v=>v.toFixed(1)+"%"],real:["Billion US$ at 2015 prices",v=>"$"+v.toFixed(0)]}[euM];
  lineChart($("#euChart"),{title:"EU-27 military spending, "+euS+"–2024",sub:lab[0],series:[{name:"",color:css("--accent"),shape:"circ",pts}],yfmt:lab[1],labelEnds:false,H:300});
  const a=pts[0][1], b=pts[pts.length-1][1], ch=(b/a-1)*100;
  $("#euSentence").textContent = euM==="share" ? `${euS} to 2024: from ${a.toFixed(1)}% to ${b.toFixed(1)}% of GDP (${sgn(b-a,1)} points).` : `${euS} to 2024: ${sgn(ch,0)}% (${lab[1](a)} to ${lab[1](b)} billion).`;
}
function seg(id, cb){ $$(`#${id} button`).forEach(b=>b.addEventListener("click",()=>{ $$(`#${id} button`).forEach(x=>x.setAttribute("aria-pressed", x===b)); cb(b.dataset.v); })); }
seg("segMeasure", v=>{euM=v; drawEU(); markDone("lessonB");});
seg("segStart", v=>{euS=+v; drawEU(); markDone("lessonB");});

/* ---------- STEP 6 ACTIVITY B ---------- */
const NAMES={POL:"Poland",DEU:"Germany",ITA:"Italy"};
const T=DATA.three;
let stB=store.get("actB",{guess:null,pOk:false,all:false});
function saveB(){ store.set("actB",stB); }
const rr = (c,y)=>T[c][y].real_bn;
function drawThreeTable(){
  const rows=["POL","DEU","ITA"].map(c=>{ const show=stB.all||(c==="POL"&&stB.pOk);
    const a=rr(c,2021), b=rr(c,2024);
    return `<tr><td><strong>${NAMES[c]}</strong></td><td class="num">${T[c][2021].share.toFixed(2)}</td><td class="num">${T[c][2024].share.toFixed(2)}</td><td class="num">${T[c][2021].gdp_real_bn.toFixed(1)}</td><td class="num">${T[c][2024].gdp_real_bn.toFixed(1)}</td><td class="num">${show?a.toFixed(1):"…"}</td><td class="num">${show?b.toFixed(1):"…"}</td><td class="num">${show?sgn((b/a-1)*100,0)+"%":"…"}</td></tr>`; });
  $("#threeTable").innerHTML=`<tr><th>Country</th><th class="num">Share of GDP 2021, %</th><th class="num">Share 2024, %</th><th class="num">Real GDP 2021, $bn</th><th class="num">Real GDP 2024, $bn</th><th class="num">Real spending 2021, $bn</th><th class="num">Real spending 2024, $bn</th><th class="num">Change</th></tr>`+rows.join("");
  $("#pb-all").disabled=!stB.pOk||stB.all;
}
function drawThreeChart(){
  const cols={POL:css("--accent"),DEU:css("--verm"),ITA:css("--hi")}, shp={POL:"circ",DEU:"tri",ITA:"sq"};
  const show = stB.all ? ["POL","DEU","ITA"] : stB.pOk ? ["POL"] : [];
  if (!show.length){ $("#threeChart").innerHTML='<div class="cs" style="padding:2rem 1rem">The chart appears once you have computed Poland.</div>'; return; }
  const series=show.map(c=>({name:NAMES[c],color:cols[c],shape:shp[c],pts:Object.keys(T[c]).map(Number).sort((a,b)=>a-b).map(y=>[y, T[c][y].real_bn/rr(c,2021)*100])}));
  lineChart($("#threeChart"),{title:"Real defence spending, 2014–2024",sub:"Index, 2021 = 100",series,yfmt:v=>v.toFixed(0),H:300});
}
$$('#q-guessB input').forEach(i=>i.addEventListener("change",()=>{ if(!stB.guess) $("#gbBtn").disabled=false; }));
function showGuess(){ if(!stB.guess) return; $("#gbOut").textContent="Your guess: "+NAMES[stB.guess]+". Now check it."; $("#gbBtn").disabled=true; $$('#q-guessB input').forEach(i=>{i.disabled=true; i.checked=i.value===stB.guess;}); fbB(); }
$("#gbBtn").addEventListener("click",()=>{ const v=$('#q-guessB input:checked')?.value; if(!v) return; stB.guess=v; saveB(); showGuess(); });
$("#pb-btn").addEventListener("click",()=>{ const a=parseFloat($("#pb-21").value), b=parseFloat($("#pb-24").value), c=parseFloat($("#pb-ch").value), fb=$("#pb-fb");
  const A1=rr("POL",2021), B1=rr("POL",2024), C1=(B1/A1-1)*100;
  if ([a,b,c].some(isNaN)){ fb.className="fb no"; fb.textContent="Fill in all three boxes."; return; }
  const ok1=Math.abs(a-A1)<=0.15, ok2=Math.abs(b-B1)<=0.15, ok3=Math.abs(c-C1)<=2;
  if (ok1&&ok2&&ok3){ fb.className="fb ok"; fb.textContent=`Right: 2.217/100 × 605.3 = ${A1.toFixed(1)}; 4.154/100 × 658.1 = ${B1.toFixed(1)}; change ${sgn(C1,0)}%.`; stB.pOk=true; saveB(); drawThreeTable(); drawThreeChart(); }
  else { fb.className="fb no"; fb.textContent = !ok1||!ok2 ? "Check the spending: divide the share by 100, then multiply by real GDP." : "Spending is right. Change = (2024 ÷ 2021 − 1) × 100."; } });
$("#pb-all").addEventListener("click",()=>{ stB.all=true; saveB(); drawThreeTable(); drawThreeChart(); markDone("activityB"); fbB(); });
function fbB(){ const g=stB.guess; $("#fbB-guess").textContent = !g ? "Make your guess in step 6 to compare." : g==="POL" ? "Your guess, Poland, was right." : `Your guess was ${NAMES[g]}. The answer is Poland.`; if (g && stB.all) markDone("feedbackB"); }
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
function drawBad(){ barChart($("#badChart"),{title:"Germany's defence spending has exploded!",sub:"Billion US$",vals:deYears.map(y=>[y,DE[y].usd_bn]),ymin:40,yfmt:v=>v.toFixed(0),color:css("--verm"),H:280}); }
let bM="usd", bA="cut";
function drawFix(){
  const m={usd:["Billion current US$",y=>DE[y].usd_bn,v=>v.toFixed(0),40],real:["Billion US$ at 2015 prices",y=>DE[y].real_bn,v=>v.toFixed(0),30],share:["% of GDP",y=>DE[y].share,v=>v.toFixed(1)+"%",1]}[bM];
  const ymin = bA==="zero"?0:m[3];
  barChart($("#fixChart"),{title:"German defence spending, 2014–2024",sub:m[0]+(bA==="zero"?"":" (axis cut)"),vals:deYears.map(y=>[y,m[1](y)]),ymin,yfmt:m[2],color:css("--accent"),H:260,source:"Source: SIPRI via World Bank, World Development Indicators"});
  const fb=$("#fixFb");
  if (bA==="cut"){ fb.className="fb no"; fb.textContent="The axis is still cut: bar lengths are not proportional to the values."; }
  else if (bM==="usd"){ fb.className="fb no"; fb.textContent="Axis fixed. Current dollars still mix real growth with inflation and exchange rates."; }
  else { fb.className="fb ok"; fb.textContent = bM==="real" ? "Honest: real terms, from zero. Spending rose by about 83% in ten years, most of it after 2021." : "Honest too: a share of GDP from zero, 1.1% to 1.9%. This answers a different question: effort relative to the economy."; markDone("exercise"); }
}
seg("segBadM",v=>{bM=v;drawFix();}); seg("segBadA",v=>{bA=v;drawFix();});
$("#badBtn").addEventListener("click",()=>{ const sel=$$('#q-bad input:checked').map(i=>i.value), right=["axis","nominal","source"];
  const ok = right.every(r=>sel.includes(r)) && sel.length===3, fb=$("#badFb");
  fb.className="fb "+(ok?"ok":"no");
  fb.textContent = ok ? "Right: three problems. The numbers themselves are real (SIPRI), and bars are fine for yearly totals." : sel.includes("invented") ? "The figures are real SIPRI data; the problem is how they are shown." : sel.includes("bars") ? "Bars are fine for yearly totals, as long as they start at zero." : "There are three problems to find."; });
const note=$("#note"); note.value=store.get("note","");
function wc(){ const n=note.value.trim()?note.value.trim().split(/\s+/).length:0; $("#wc").textContent=n+" words"; }
note.addEventListener("input",()=>{store.set("note",note.value); wc();}); wc();
$("#modelBtn").addEventListener("click",()=>{ $("#model").hidden=!$("#model").hidden; });

/* ---------- STEP 9 QUIZ ---------- */
const QUIZ=[
 {q:"EU defence spending rose in current dollars between 1990 and 2021 but fell as a share of GDP. How?",o:["One of the two series must be wrong","GDP grew faster than defence spending","Inflation lowered the share of GDP"],a:1,e:"A share falls whenever the denominator, GDP, grows faster than the numerator."},
 {q:"Spending in real terms removes the effect of…",o:["changes in prices","changes in the size of the economy","changes in the number of soldiers"],a:0,e:"Real terms hold prices constant; the share of GDP is what adjusts for the size of the economy."},
 {q:"Why are night lights useful for checking official growth?",o:["They measure GDP exactly","They are produced by someone the government cannot edit","They are brighter in democracies"],a:1,e:"Satellite images are an outside witness; they are noisy, but not manipulable by a statistics office."},
 {q:"A country's official growth is 2 points a year above what its lights imply. What can you conclude?",o:["Its government falsifies statistics","It is worth investigating","Nothing at all"],a:1,e:"A gap makes a suspect, not a culprit: think of services-led growth or saturated city lights."},
 {q:"A bar chart's vertical axis starts at 40 instead of 0. What goes wrong?",o:["Nothing, if the axis is labelled","Bar lengths are no longer proportional to the values","The bars become harder to colour"],a:1,e:"Readers compare bar lengths; a cut axis exaggerates differences."}];
let qa=store.get("quiz",{});
function drawQuiz(){
  $("#quizBox").innerHTML=QUIZ.map((q,i)=>`<div class="box"><p style="margin-top:0"><strong>${i+1}. ${q.q}</strong></p><div class="choice">${q.o.map((o,j)=>`<label><input type="radio" name="qz${i}" value="${j}" ${qa[i]===j?"checked":""} ${qa[i]!==undefined?"disabled":""}> ${o}</label>`).join("")}</div>${qa[i]!==undefined?`<p class="fb ${qa[i]===q.a?"ok":"no"}">${qa[i]===q.a?"Right. ":"Not quite. "}${q.e}</p>`:""}</div>`).join("");
  $$("#quizBox input").forEach(i=>i.addEventListener("change",()=>{ qa[+i.name.slice(2)]=+i.value; store.set("quiz",qa); drawQuiz(); }));
  const n=Object.keys(qa).length, s=QUIZ.filter((q,i)=>qa[i]===q.a).length;
  $("#quizScore").textContent = n===QUIZ.length ? `Score: ${s} out of ${QUIZ.length}.` : "";
  if (n===QUIZ.length) markDone("quiz");
}

$("#dl-btn").addEventListener("click",()=>{ const [v]=readNums(["dl-in"]);
  if (Math.abs(v-1.89)<=0.02) feedback($("#dl-fb"),true,"Right: 1.89% of GDP in 2024 (SIPRI). If your download shows a slightly different figure, the database has been revised since October 2026: always note the date you downloaded.");
  else feedback($("#dl-fb"),false,"Look for 2024 in the Germany series; it should be just under 2%."); });
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
