/* Session 3 */
const PR = DATA.products, CO = DATA.countries;
const NAMES = Object.fromEntries(CO.map(c=>[c.iso,c.n]));
const RIGHT = ["854143","810411","850511"];

/* puzzle */
const order = ["847130","810411","100199","854143","270900","850511","271111","280530"];
$("#q-prod").innerHTML = order.map(c=>{ const p=PR.find(x=>x.code===c); return `<label><input type="checkbox" value="${c}"> ${p.name}</label>`; }).join("");
$("#q-country").innerHTML = '<option value="">Choose a country</option>' + [...CO].sort((a,b)=>a.n.localeCompare(b.n)).map(c=>`<option value="${c.iso}">${c.n}</option>`).join("");
function puzzleState(){ const n=$$("#q-prod input:checked").length; $("#prodCount").textContent = n===3?"Three picked.":`Pick three (${n} so far).`; $("#prodBtn").disabled = !(n===3 && $("#q-country").value) || !!store.get("puz",null); }
$$("#q-prod input").forEach(i=>i.addEventListener("change",()=>{ if ($$("#q-prod input:checked").length>3) i.checked=false; puzzleState(); }));
$("#q-country").addEventListener("change", puzzleState);
function puzzleReveal(v){
  $$("#q-prod input").forEach(i=>{ i.checked=v.p.includes(i.value); i.disabled=true; }); $("#q-country").value=v.c; $("#q-country").disabled=true; $("#prodBtn").disabled=true;
  const hits=v.p.filter(c=>RIGHT.includes(c)).length; $("#prodOut").hidden=false;
  feedback($("#prodFb"), hits===3 && v.c==="CZE", `${hits} of 3 products right; country ${v.c==="CZE"?"right":"not quite"}.`);
  $("#prodTxt").innerHTML = `China's share of EU imports from outside the EU, 2024: <b>solar panels 98%</b>, <b>unwrought magnesium 92%</b>, <b>permanent magnets 90%</b>; laptops come close at 86%. Among member states, <b>Czechia</b> buys the largest share of all its imports from China (17%), ahead of Poland (15%) and Germany (12%).`;
  markDone("puzzle"); }
$("#prodBtn").addEventListener("click",()=>{ const v={p:$$("#q-prod input:checked").map(i=>i.value), c:$("#q-country").value}; store.set("puz",v); puzzleReveal(v); });

/* lesson A check */
$("#la-btn").addEventListener("click",()=>{ const [v]=readNums(["la-in"]);
  if (Math.abs(v-4600)<=1){ feedback($("#la-fb"),true,"Right: 3,600 + 900 + 100 = 4,600. Highly concentrated."); markDone("lessonA"); }
  else feedback($("#la-fb"),false,"Square each share (60² = 3,600) and add them up."); });

/* activity A */
let stA = store.get("actA",{ok:false,all:false});
const wheat = PR.find(p=>p.code==="100199"); const wheatH = wheat.top.slice(0,4).reduce((a,[,s])=>a+s*s,0);
function drawProd(){
  $("#prodTable").innerHTML = `<tr><th>Product</th><th>Largest suppliers (share of extra-EU imports, %)</th><th class="num">Imports, US$ bn</th><th class="num">HHI</th></tr>` +
    PR.map(p=>{ const show = stA.all || (p.code==="100199" && stA.ok);
      return `<tr><td><strong>${p.name}</strong></td><td style="text-align:left">${p.top.slice(0,4).map(([n,s])=>`${n} ${s.toFixed(1)}`).join(" · ")}</td><td class="num">${p.total_bn.toFixed(1)}</td><td class="num">${show?p.hhi.toLocaleString("en-GB"):"…"}</td></tr>`; }).join("");
  if (!stA.all){ $("#prodChart").innerHTML = '<div class="cs" style="padding:2rem 1rem">The chart appears once you have computed all products.</div>'; return; }
  const rows=[...PR].sort((a,b)=>b.hhi-a.hhi).map(p=>({label:p.name, v:p.hhi, color: p.top[0][0]==="China"?css("--verm"):css("--accent"), tip:`<b>${p.name}</b><br>HHI ${p.hhi.toLocaleString("en-GB")}<br>largest: ${p.top[0][0]} ${p.top[0][1]}%`}));
  hbar($("#prodChart"),{title:"Concentration of EU import suppliers, 2024",sub:"Herfindahl–Hirschman index, 0 to 10,000",rows,xmin:0,xmax:10000,xfmt:v=>v.toLocaleString("en-GB"),ref:2500,refLabel:"2,500"});
  legend($("#prodChart"),[{label:"China is the largest supplier",color:css("--verm"),kind:"sq"},{label:"Another country is",color:css("--accent"),kind:"sq"}]);
}
$("#aa-btn").addEventListener("click",()=>{ const [v]=readNums(["aa-in"]);
  if (Math.abs(v-wheatH)<=15){ feedback($("#aa-fb"),true,`Right: 66.0² + 15.5² + 6.9² + 4.6² ≈ ${Math.round(wheatH).toLocaleString("en-GB")}. With all suppliers: ${wheat.hhi.toLocaleString("en-GB")}.`); stA.ok=true; store.set("actA",stA); $("#aa-all").disabled=false; drawProd(); }
  else feedback($("#aa-fb"),false,"Square each of the four shares and add them: 66.0² = 4,356 to start."); });
$("#aa-all").addEventListener("click",()=>{ stA.all=true; store.set("actA",stA); drawProd(); markDone("activityA"); markDone("feedbackA"); });
$("#csvProd").value = "product,supplier,share\n"+PR.flatMap(p=>p.top.map(([n,s])=>`${p.name},${n.replace(/,/g,"")},${s}`)).join("\n");

/* activity B: index */
const ind = ["china","hhi","energy"];
const mm = Object.fromEntries(ind.map(k=>[k,[Math.min(...CO.map(c=>c[k])),Math.max(...CO.map(c=>c[k]))]]));
const norm = (c,k) => 100*(c[k]-mm[k][0])/(mm[k][1]-mm[k][0]);
let stB = store.get("actB",{country:"DEU",best:null,worst:null});
$("#rCountry").innerHTML = [...CO].sort((a,b)=>a.n.localeCompare(b.n)).map(c=>`<option value="${c.iso}" ${c.iso===stB.country?"selected":""}>${c.n}</option>`).join("");
function scores(){ const w=["w1","w2","w3"].map(id=>+$("#"+id).value); const s=w.reduce((a,b)=>a+b,0)||1;
  ["w1","w2","w3"].forEach((id,i)=>$("#"+id+"o").textContent=Math.round(w[i]/s*100)+"%");
  return CO.map(c=>({...c, score: ind.reduce((a,k,i)=>a+w[i]/s*norm(c,k),0)})).sort((a,b)=>b.score-a.score).map((c,i)=>({...c,rank:i+1})); }
function drawIdx(track=true){
  const S=scores(), me=S.find(c=>c.iso===stB.country);
  if (track){ if (stB.best===null||me.rank<stB.best) stB.best=me.rank; if (stB.worst===null||me.rank>stB.worst) stB.worst=me.rank; store.set("actB",stB); }
  $("#rRank").textContent=me.rank; $("#rBest").textContent=stB.best??"–"; $("#rWorst").textContent=stB.worst??"–";
  tileMap($("#tileMap"),{title:"Vulnerability index, EU-27",sub:"0 = least vulnerable, 100 = most; darker = more vulnerable",vals:Object.fromEntries(S.map(c=>[c.iso,c.score])),names:NAMES,fmt:v=>v.toFixed(0),lo:0,hi:100,note:"Grey tiles: not in the EU, no data. Sources: UN Comtrade 2024; Eurostat 2023."});
  $("#rankTable").innerHTML = `<tr><th class="num">Rank</th><th>Country</th><th class="num">China share %</th><th class="num">Partner HHI</th><th class="num">Energy dependence %</th><th class="num">Score</th></tr>` +
    S.map(c=>`<tr${c.iso===stB.country?' style="background:var(--soft);font-weight:600"':''}><td class="num">${c.rank}</td><td>${c.n}</td><td class="num">${c.china.toFixed(1)}</td><td class="num">${c.hhi}</td><td class="num">${c.energy.toFixed(1)}</td><td class="num">${c.score.toFixed(0)}</td></tr>`).join("");
  if (stB.best!==null && stB.worst!==null && stB.worst-stB.best>=5){ markDone("activityB"); }
  fbRange(); }
function fbRange(){ if (stB.best===null) return; const n=NAMES[stB.country];
  $("#fbRange").textContent = stB.worst-stB.best>0 ? `You moved ${n} between rank ${stB.best} and rank ${stB.worst} without changing a single number.` : `Try moving the weights to see how far ${n} can move.`;
  if (stB.worst-stB.best>=5) markDone("feedbackB"); }
["w1","w2","w3"].forEach(id=>$("#"+id).addEventListener("input",()=>drawIdx()));
$("#rCountry").addEventListener("change",()=>{ stB={country:$("#rCountry").value,best:null,worst:null}; drawIdx(); });
$("#csvIdx").value = "country,china,hhi,energy\n"+CO.map(c=>`${c.n},${c.china},${c.hhi},${c.energy}`).join("\n");

/* quiz */
quiz($("#quizBox"), $("#quizScore"), [
 {q:"Two suppliers, 50% each. What is the HHI?",o:["100","2,500","5,000"],a:2,e:"50² + 50² = 5,000."},
 {q:"The EU imports almost all its crude oil, yet its supplier HHI is below 1,000. Why?",o:["Oil is not important","It buys from many countries","The data are wrong"],a:1,e:"Dependence on imports in general is not dependence on one supplier."},
 {q:"China took about 1% of Lithuania's exports. Why did Chinese pressure still hurt?",o:["China blocked goods containing Lithuanian parts","Lithuania imports all its food from China","It did not hurt"],a:0,e:"The exposure ran through supply chains, invisible in direct trade shares."},
 {q:"You change only the weights of an index and a country moves from 5th to 20th. What does this tell you?",o:["The country changed","The ranking depends heavily on choices","The index is fraudulent"],a:1,e:"Sensitivity to weights is a property of the index, not of the country."},
 {q:"Which should you map with a colour scale?",o:["Total imports from China in dollars","Share of imports from China","Population"],a:1,e:"Map rates and shares; totals mostly show which countries are big."}], "quiz");

/* help when stuck */
helpAfter("la-btn","la-fb",()=>({"la-in":"4600"}));
helpAfter("aa-btn","aa-fb",()=>({"aa-in":Math.round(wheatH)}));

/* boot */
const pv=store.get("puz",null); if (pv) puzzleReveal(pv);
drawProd(); if (stA.ok) $("#aa-all").disabled = stA.all;
drawIdx(false); fbRange();
wireCopy(); wireReset();
onRedraw(()=>{ drawProd(); drawIdx(false); });
