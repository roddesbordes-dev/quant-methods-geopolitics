/* Session 2 */
const P = DATA.polls, RES = DATA.result;
const moe = (p, n) => 1.96*Math.sqrt(p*(1-p)/n)*100;

/* puzzle */
$("#pollTable").innerHTML = `<tr><th>Pollster</th><th>Fieldwork</th><th class="num">Sample</th><th class="num">Yes %</th><th class="num">No %</th><th class="num">Undecided %</th></tr>` +
  P.map(p=>`<tr><td>${p.p}</td><td style="text-align:left">${p.dates}</td><td class="num">${p.n.toLocaleString("en-GB")}</td><td class="num">${p.yes.toFixed(1)}</td><td class="num">${p.no.toFixed(1)}</td><td class="num">${p.und.toFixed(1)}</td></tr>`).join("");
const gy = $("#guessYes"), gyo = $("#guessYesOut");
gy.addEventListener("input",()=>gyo.textContent=gy.value+"%");
function showGuess(){ const g=store.get("guess",null); if (g===null) return; gy.value=g; gyo.textContent=g+"%"; gy.disabled=true; $("#guessBtn").disabled=true; $("#guessSaved").textContent="Saved. The answer comes in step 4."; markDone("puzzle"); }
$("#guessBtn").addEventListener("click",()=>{ store.set("guess", +gy.value); showGuess(); });

/* lesson A calculator */
function calc(){ const n=+$("#mN").value, p=+$("#mP").value/100; $("#mNout").textContent=n.toLocaleString("en-GB"); $("#mPout").textContent=Math.round(p*100)+"%";
  $("#mOut").textContent = `± ${moe(p,n).toFixed(1)} points`; }
["mN","mP"].forEach(id=>$("#"+id).addEventListener("input",()=>{calc(); markDone("lessonA");})); calc();
$("#la-btn").addEventListener("click",()=>{ const [v]=readNums(["la-in"]); const t=moe(.5,1100);
  if (isNaN(v)) return feedback($("#la-fb"),false,"Type a number first.");
  if (Math.abs(v-t)<=0.15){ feedback($("#la-fb"),true,`Right: 1.96 × √(0.5 × 0.5 ÷ 1,100) = ${t.toFixed(2)}, about ±3 points.`); markDone("lessonA"); }
  else feedback($("#la-fb"),false,"Not quite. Use p = 0.5 and n = 1,100, then multiply by 100 to get points."); });

/* activity A */
let stA = store.get("actA",{ok:false,revealed:false}); let und="drop";
function est(p, how){ const dec=p.yes+p.no;
  if (how==="drop") return {v:p.yes/dec*100, m:moe(p.yes/dec, p.n*dec/100)};
  if (how==="split") { const v=p.yes+p.und/2; return {v, m:moe(v/100,p.n)}; }
  return {v:p.yes, m:moe(p.yes/100,p.n)}; }
function drawPolls(){
  const rows = P.map(p=>{ const e=est(p,und); return {label:p.p.split("–")[0], v:e.v, lo:e.v-e.m, hi:e.v+e.m, color:css("--accent"), tip:`<b>${p.p}</b><br>Yes ${e.v.toFixed(1)}% ± ${e.m.toFixed(1)}`}; });
  const f = hbar($("#pollChart"),{title:"Yes share, % ("+({drop:"undecided dropped",split:"undecided split evenly",no:"undecided all to No"})[und]+")", rows, xmin:30, xmax:75, xfmt:v=>v+"%", ref: stA.revealed?RES.home:undefined, refLabel: stA.revealed?"Result in Moldova 45.4%":undefined, rowH:44});
  if (stA.revealed){ legend($("#pollChart"),[{label:"Poll estimate with 95% margin",color:css("--accent")},{label:"Result among voters in Moldova",color:css("--hi"),kind:"line",dash:"6 4"}]); }
}
seg("segUnd", v=>{ und=v; drawPolls(); });
$("#aa-btn").addEventListener("click",()=>{ const [p,m]=readNums(["aa-p","aa-m"]); const e=est(P[0],"drop");
  if (isNaN(p)||isNaN(m)) return feedback($("#aa-fb"),false,"Fill in both boxes.");
  const okP=Math.abs(p-e.v)<=0.15, okM=Math.abs(m-e.m)<=0.15;
  if (okP&&okM){ feedback($("#aa-fb"),true,`Right: 55.1 ÷ 89.6 = ${e.v.toFixed(1)}%; decided respondents 1,034 × 0.896 ≈ 926; margin ±${e.m.toFixed(1)}.`); stA.ok=true; store.set("actA",stA); }
  else if (okP) feedback($("#aa-fb"),false,"The share is right. For the margin, use n = 1,034 × 0.896 and p = 0.615.");
  else feedback($("#aa-fb"),false,"Not yet. Yes among decided = 55.1 ÷ (55.1 + 34.5)."); });
$("#aa-reveal").addEventListener("click",()=>{ stA.revealed=true; store.set("actA",stA); drawPolls(); markDone("activityA"); openFA(); });
$("#csvPolls").value = "pollster,n,yes,no,und\n"+P.map(p=>`${p.p},${p.n},${p.yes},${p.no},${p.und}`).join("\n");
function openFA(){ $("#fa-locked").hidden=true; $("#fa-body").hidden=false; markDone("feedbackA");
  const g=store.get("guess",null);
  $("#fa-guess").textContent = g===null ? "You did not record a guess." : `Your guess was ${g}%. The result was 50.35%, a miss of ${Math.abs(g-50.35).toFixed(1)} points.`; }

/* activity B */
const PW = DATA.pew;
let stB = store.get("actB",{ok:false,all:false});
const dmoe = (a,b) => 1.96*Math.sqrt((a/100)*(1-a/100)/1000 + (b/100)*(1-b/100)/1000)*100;
function drawPew(){
  $("#pewTable").innerHTML = `<tr><th>Country</th><th class="num">2024 %</th><th class="num">2025 %</th><th class="num">Change</th><th class="num">Margin ±</th><th>Real change?</th></tr>` +
    PW.map(r=>{ const has=r.y24!==null, show=stB.all||(r.c==="France"&&stB.ok);
      const ch=has?r.y25-r.y24:null, m=has?dmoe(r.y24,r.y25):null;
      return `<tr><td>${r.c}</td><td class="num">${has?r.y24:"–"}</td><td class="num">${r.y25}</td><td class="num">${show&&has?sgn(ch,0):has?"…":"–"}</td><td class="num">${show&&has?m.toFixed(1):has?"…":"–"}</td><td>${!has?'<span class="small">not comparable</span>':show?(Math.abs(ch)>m?'<span class="chip F">✓ yes</span>':'<span class="chip PF">✗ within noise</span>'):"…"}</td></tr>`; }).join("");
  const rows = PW.filter(r=>r.y24!==null);
  const f = frame($("#pewChart"),{title:"Favourable view of China, 2024 → 2025",sub:"% of adults",H:40+rows.length*30+30,m:{t:16,r:24,b:30,l:120}});
  const xs=v=>f.m.l+(v)/70*f.iw;
  for (const v of [0,10,20,30,40,50,60,70]){ el("line",{x1:xs(v),x2:xs(v),y1:f.m.t,y2:f.m.t+rows.length*30,stroke:css("--rule")},f.svg); txt(f.svg,xs(v),f.m.t+rows.length*30+18,v+"%",{"text-anchor":"middle"}); }
  rows.forEach((r,i)=>{ const y=f.m.t+i*30+15; const show=stB.all||(r.c==="France"&&stB.ok); const real=Math.abs(r.y25-r.y24)>dmoe(r.y24,r.y25);
    const col = show ? (real?css("--accent"):css("--grey")) : css("--ink2");
    el("line",{x1:xs(r.y24),x2:xs(r.y25),y1:y,y2:y,stroke:col,"stroke-width":2},f.svg);
    el("circle",{cx:xs(r.y24),cy:y,r:4,fill:css("--panel"),stroke:col,"stroke-width":2},f.svg);
    shape(f.svg,show&&!real?"sq":"circ",xs(r.y25),y,5,col,true);
    txt(f.svg,f.m.l-8,y+4,r.c,{"text-anchor":"end"});
    const hit=el("rect",{x:f.m.l,y:y-15,width:f.iw,height:30,fill:"transparent"},f.svg); hover(f,hit,xs(r.y25),y-6,`<b>${r.c}</b><br>${r.y24}% → ${r.y25}%`); });
  legend($("#pewChart"),[{label:"2024 (open) → 2025 (filled)",color:css("--ink2")},{label:"Real change",color:css("--accent")},{label:"Within noise",color:css("--grey"),kind:"sq"}]);
}
$("#pb-btn").addEventListener("click",()=>{ const [c,m]=readNums(["pb-ch","pb-m"]); const tm=dmoe(23,36);
  if (isNaN(c)||isNaN(m)) return feedback($("#pb-fb"),false,"Fill in both boxes.");
  if (Math.abs(c-13)<=0.5 && Math.abs(m-tm)<=0.2){ feedback($("#pb-fb"),true,`Right: +13 points against a margin of ±${tm.toFixed(1)}. The change is real.`); stB.ok=true; store.set("actB",stB); drawPew(); $("#pb-all").disabled=false; }
  else if (Math.abs(c-13)<=0.5) feedback($("#pb-fb"),false,"Change right. Margin: 1.96 × √(0.23 × 0.77 ÷ 1,000 + 0.36 × 0.64 ÷ 1,000) × 100.");
  else feedback($("#pb-fb"),false,"The change is 2025 minus 2024."); });
$("#pb-all").addEventListener("click",()=>{ stB.all=true; store.set("actB",stB); drawPew(); markDone("activityB"); markDone("feedbackB"); });
$("#csvPew").value = "country,y24,y25\n"+PW.filter(r=>r.y24!==null).map(r=>`${r.c},${r.y24},${r.y25}`).join("\n");
const tn=$("#trendsNote"); tn.value=store.get("trends",""); tn.addEventListener("input",()=>{ store.set("trends",tn.value); if (tn.value.length>20) markDone("feedbackB"); });

/* brief */
wireBrief();
const bq = brief.get("question","");
$$("#bQuestion input").forEach(i=>{ i.checked = i.value===bq; i.addEventListener("change",()=>{ brief.set("question", i.value); markDone("brief"); }); });

/* quiz */
quiz($("#quizBox"), $("#quizScore"), [
 {q:"A poll of 1,000 people gives 52% Yes. Roughly what is its margin of error?",o:["±1 point","±3 points","±10 points"],a:1,e:"1.96 × √(0.52 × 0.48 ÷ 1,000) ≈ 3.1 points."},
 {q:"To halve the margin of error, a pollster must…",o:["double the sample","quadruple the sample","ask better questions"],a:1,e:"The margin shrinks with the square root of n: four times the sample, half the margin."},
 {q:"The Moldovan polls missed the result among residents by far more than their margins. Which error did the margin not cover?",o:["The luck of who was sampled","Undecided voters, refusals and pressure on voters","Rounding"],a:1,e:"Non-sampling errors are outside the margin of error, and often larger."},
 {q:"Spain: 33% favourable to China in 2024, 37% in 2025, about 1,000 people each year. What can you say?",o:["Views clearly improved","The change is within the noise","The poll is wrong"],a:1,e:"The margin of the difference is about ±4.2 points, larger than the 4-point change."},
 {q:"Searches for “Taiwan” triple in one week. This shows…",o:["more support for Taiwan","more attention to Taiwan","nothing at all"],a:1,e:"Google Trends measures attention, not opinion."}], "quiz");

/* boot */
showGuess(); drawPolls(); drawPew(); if (stB.ok) $("#pb-all").disabled = stB.all;
if (stA.revealed) openFA();
wireCopy(); wireReset();
onRedraw(()=>{ drawPolls(); drawPew(); });
