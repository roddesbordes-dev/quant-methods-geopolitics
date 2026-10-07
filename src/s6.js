/* Session 6 */
const F = [...DATA.fuel].sort((a,b)=>a.n.localeCompare(b.n));
const LOWP = DATA.brentShock/DATA.brent2025-1, HIGHP = DATA.brentPeak/DATA.brent2025-1;
const lowC = f => f.net_pct*LOWP*0.9, highC = f => f.net_pct*HIGHP;
const wk = s => { const d=new Date(s+"T00:00:00Z"); return d.getUTCFullYear()+(d - Date.UTC(d.getUTCFullYear(),0,1))/(365*864e5); };

/* puzzle */
function drawHZ(){
  lineChart($("#hzChart"),{title:"Ships crossing the Strait of Hormuz",sub:"Average transits a day, by week",series:[{name:"All ships",color:css("--accent"),shape:"circ",pts:DATA.hormuz.map(([d,v])=>[wk(d),v])},{name:"Tankers",color:css("--verm"),shape:"tri",dash:"5 3",pts:DATA.tankers.map(([d,v])=>[wk(d),v])}],yfmt:v=>v.toFixed(0),xfmt:v=>{ const y=Math.floor(v+1e-6), m=Math.round((v-y)*12); return ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"][Math.min(11,m)]+" "+y; },xticks:[2025,2025.5,2026,2026.5],vline:2026+2/12,vlabel:"1 March 2026",H:300,labelEnds:false});
  legend($("#hzChart"),[{label:"All ships",color:css("--accent")},{label:"Tankers",color:css("--verm"),kind:"line",dash:"5 3"}]);
}
lockChoice({group:"q-cost", button:"csBtn", key:"guess", onReveal:()=>{ $("#csOut").textContent="Saved. The answer comes in step 4."; markDone("puzzle"); fbGuess(); }});

/* lesson */
$("#la-btn").addEventListener("click",()=>{ const [v]=readNums(["la-in"]); const t=1.67*0.44;
  if (Math.abs(v-t)<=0.02){ feedback($("#la-fb"),true,"Right: 1.67 × 0.44 ≈ 0.73% of GDP a year."); markDone("lesson"); }
  else feedback($("#la-fb"),false,"Multiply 1.67 by 0.44."); });

/* activity */
$("#cC").innerHTML = F.map(f=>`<option value="${f.iso}">${f.n}</option>`).join("");
$("#cC").value = store.get("country","DEU");
function cur(){ return F.find(f=>f.iso===$("#cC").value); }
function info(){ const f=cur(); $("#cInfo").innerHTML = `${f.n}: net energy imports <b>${f.net_pct.toFixed(2)}% of GDP</b> (${f.year}).${f.net_pct<0?" A net exporter: the formula gives a gain, shown as a negative cost.":""}`;
  $("#aiPrompt").textContent = `What would the closure of the Strait of Hormuz from March 2026 cost ${f.n}, as a share of GDP per year? Give a low and a high estimate, state the oil price rise you assume, the size of ${f.n}'s net energy imports as a share of GDP, and your sources.`; }
$("#cC").addEventListener("change",()=>{ store.set("country",$("#cC").value); info(); $("#cFb").textContent=""; });
$("#cBtn").addEventListener("click",()=>{ const f=cur(); const [lo,hi]=readNums(["cLo","cHi"]); const L=lowC(f), Hh=highC(f);
  if (isNaN(lo)||isNaN(hi)) return feedback($("#cFb"),false,"Fill in both boxes.");
  if (Math.abs(lo-L)<=0.03+Math.abs(L)*0.02 && Math.abs(hi-Hh)<=0.03+Math.abs(Hh)*0.02){ feedback($("#cFb"),true,`Right: low ${f.net_pct.toFixed(2)} × ${LOWP.toFixed(2)} × 0.9 = ${L.toFixed(2)}; high ${f.net_pct.toFixed(2)} × ${HIGHP.toFixed(2)} = ${Hh.toFixed(2)}% of GDP.`); store.set("done1",true); markDone("activity"); drawCost(); }
  else feedback($("#cFb"),false,`Low: net imports × ${LOWP.toFixed(2)} × 0.9. High: net imports × ${HIGHP.toFixed(2)}.`); });
$("#aiCopy").addEventListener("click",()=>{ const t=$("#aiPrompt").textContent; try { navigator.clipboard.writeText(t).then(()=>$("#aiCopied").textContent="Copied.",()=>$("#aiCopied").textContent="Select the text and copy it."); } catch(e){ $("#aiCopied").textContent="Select the text and copy it."; } });
const aiA=$("#aiAns"); aiA.value=store.get("ai",""); aiA.addEventListener("input",()=>store.set("ai",aiA.value));
function drawCost(){
  if (!store.get("done1",false)){ $("#costChart").innerHTML='<div class="cs" style="padding:2rem 1rem">The chart for all countries appears once you have computed your own.</div>'; return; }
  const sel=$("#cC").value;
  const rows=[...F].filter(f=>f.net_pct>0).sort((a,b)=>highC(b)-highC(a)).map(f=>({label:f.n,v:lowC(f),lo:lowC(f),hi:highC(f),bold:f.iso===sel,color:f.iso===sel?css("--verm"):css("--accent"),tip:`<b>${f.n}</b><br>low ${lowC(f).toFixed(2)}% · high ${highC(f).toFixed(2)}% of GDP`}));
  hbar($("#costChart"),{title:"First-round cost of the 2026 energy price shock",sub:"% of GDP a year, net energy importers; your country highlighted",rows,xmin:0,xfmt:v=>v.toFixed(0)+"%",rowH:20});
}

/* feedback */
function fbGuess(){ const g=store.get("guess",null); if (!g) return; $("#fbGuess").textContent = g==="b" ? "Your guess, about 1% to 2% of GDP, was right for a typical EU country." : `Your guess was ${({a:"less than 0.5%",c:"about 3% to 5%",d:"more than 5%"})[g]}. For a typical EU country the answer is about 1% to 2% of GDP.`; }
const au=store.get("audit",[]); $$("#aiAudit input").forEach(i=>{ i.checked=au.includes(i.value); i.addEventListener("change",()=>{ const v=$$("#aiAudit input:checked").map(x=>x.value); store.set("audit",v); $("#aiScore").textContent=`The AI passed ${v.length} of 5 checks.`; markDone("feedback"); }); });
if (au.length) $("#aiScore").textContent=`The AI passed ${au.length} of 5 checks.`;

/* quiz */
quiz($("#quizBox"), $("#quizScore"), [
 {q:"Net energy imports are 3% of GDP and prices rise by 50%. Ignoring demand response, the first-round cost is…",o:["0.15% of GDP","1.5% of GDP","3.5% of GDP"],a:1,e:"3 × 0.5 = 1.5% of GDP."},
 {q:"Why give a low and a high case?",o:["To look cautious","Because the inputs are uncertain and the reader must see how much","Because ministers prefer two numbers"],a:1,e:"A range shows the uncertainty openly; each case states its assumptions."},
 {q:"Norway's net energy exports are about 20% of GDP. The price rise…",o:["costs Norway the most","is a gain for Norway","does not affect Norway"],a:1,e:"Net exporters gain from higher prices, if they can ship."},
 {q:"PortWatch shows almost no ships in the strait. Why might the true number be higher?",o:["Ships switch off transponders in war zones","Satellites cannot see at night","PortWatch counts only tankers"],a:0,e:"AIS-based counts understate traffic when ships go dark."},
 {q:"An AI assistant gives a precise cost with three references. What do you do first?",o:["Use it: it cites sources","Check that the references exist and that the numbers match the data","Ask another AI"],a:1,e:"Fluent answers can contain invented sources and outdated numbers."}], "quiz");

/* boot */
drawHZ(); info(); drawCost(); fbGuess();
wireReset();
onRedraw(()=>{ drawHZ(); drawCost(); });
