/* Session 5 */
const M = DATA.months, S = DATA.m;
const tnum = m => +m.slice(0,4) + (+m.slice(5,7)-1)/12;
const avg = (p,a,b) => { const v=M.map((m,i)=>[m,S[p][i]]).filter(([m])=>m>=a&&m<=b).map(([,x])=>x); return v.reduce((s,x)=>s+x,0)/v.length; };
const PRE=["2019-01","2021-12"], POST=["2022-03","2024-12"];
const g = p => avg(p,...POST)/avg(p,...PRE)-1;
const NAMES={NBR:"Three neighbours",KG:"Kyrgyzstan",AM:"Armenia",KZ:"Kazakhstan",GE:"Georgia",UZ:"Uzbekistan",TR:"Türkiye"};

/* puzzle */
function drawCars(){ const v=Object.entries(DATA.de_kg_cars).map(([y,x])=>[y,x]);
  vbar($("#carChart"),{title:"German exports of cars and car parts to Kyrgyzstan",sub:"€ million (HS chapter 87)",vals:v,ymin:0,yfmt:x=>"€"+x.toFixed(0)+"m",color:css("--accent"),H:260,source:"Source: Eurostat Comext (DS-045409)."}); }
lockChoice({group:"q-share", button:"shBtn", key:"guess", onReveal:()=>{ $("#shOut").textContent="Saved. The answer comes in step 4."; markDone("puzzle"); faGuess(); }});

/* lesson A */
$("#la-btn").addEventListener("click",()=>{ const [v]=readNums(["la-in"]);
  if (Math.abs(v-30)<=0.5){ feedback($("#la-fb"),true,"Right: 50 − 20 = 30 percentage points."); markDone("lessonA"); }
  else feedback($("#la-fb"),false,"Subtract the comparison group's change from the treated group's change."); });

/* activity A */
const n0=avg("NBR",...PRE), n1=avg("NBR",...POST), r0=avg("ROW",...PRE), r1=avg("ROW",...POST);
const fmtM = v => v.toLocaleString("en-GB",{maximumFractionDigits:1, minimumFractionDigits:1});
$("#ddTable").innerHTML = `<tr><th>Group</th><th class="num">Before</th><th class="num">After</th></tr><tr><td><strong>Armenia + Kazakhstan + Kyrgyzstan</strong></td><td class="num">${fmtM(n0)}</td><td class="num">${fmtM(n1)}</td></tr><tr><td><strong>Rest of the world (comparison)</strong></td><td class="num">${fmtM(r0)}</td><td class="num">${fmtM(r1)}</td></tr>`;
const gN=(n1/n0-1)*100, gR=(r1/r0-1)*100, DD=gN-gR;
let stA=store.get("actA",{ok:false});
$("#aa-btn").addEventListener("click",()=>{ const [a,b,c]=readNums(["aa1","aa2","aa3"]);
  if ([a,b,c].some(isNaN)) return feedback($("#aa-fb"),false,"Fill in the three boxes.");
  const ok1=Math.abs(a-gN)<=0.6, ok2=Math.abs(b-gR)<=0.6, ok3=Math.abs(c-DD)<=1;
  if (ok1&&ok2&&ok3){ feedback($("#aa-fb"),true,`Right: +${gN.toFixed(1)}% against +${gR.toFixed(1)}%, a difference of ${DD.toFixed(1)} points.`); stA.ok=true; store.set("actA",stA); markDone("activityA"); openFA(); }
  else feedback($("#aa-fb"),false, !ok1 ? "Neighbours: (after ÷ before − 1) × 100." : !ok2 ? "Same formula for the rest of the world." : "Subtract the second change from the first."); });
function openFA(){ $("#fa-locked").hidden=true; $("#fa-body").hidden=false; markDone("feedbackA"); faGuess(); }
function faGuess(){ const gss=store.get("guess",null); if (!gss||$("#fa-body").hidden) return;
  $("#faGuess").textContent = gss==="10" ? "Your guess, about 10%, was right." : `Your guess was ${({5:"less than 5%",30:"about 30%",50:"more than half"})[gss]}. The answer is about 9%.`; }
$("#csvDD").value = "month,group,exports\n"+M.flatMap((m,i)=>[`${m},neighbours,${S.NBR[i]}`,`${m},rest_of_world,${S.ROW[i]}`]).join("\n");

/* activity B: event study */
let part="NBR", ev="2022-03";
function series(p, evd){
  const ratio=M.map((m,i)=>S[p][i]/S.ROW[i]);
  const preIdx=M.map((m,i)=>i).filter(i=> evd==="2022-03" ? M[i]<="2021-12" : M[i]<="2019-12");
  const base=preIdx.reduce((s,i)=>s+ratio[i],0)/preIdx.length;
  const idx=ratio.map(r=>r/base*100);
  const ma=idx.map((v,i)=> i<2 ? null : (idx[i]+idx[i-1]+idx[i-2])/3);
  return M.map((m,i)=>[tnum(m), ma[i]]).filter(p=>p[1]!==null && (evd==="2022-03" || M[M.length-1] && true)).filter(p=> evd==="2022-03" ? true : p[0] < 2022);
}
function drawES(){
  const pts=series(part, ev);
  lineChart($("#esChart"),{title:`${NAMES[part]}: EU exports relative to the rest of the world`,sub:"Index, pre-event average = 100",series:[{name:NAMES[part],color:css("--accent"),shape:"circ",pts}],yfmt:v=>v.toFixed(0),xfmt:v=>Math.floor(v+1e-6),tipfmt:v=>v.toFixed(0),refY:100,refLabel:"Pre-event level",vline: ev==="2022-03"?2022+2/12:2020+2/12, vlabel: ev==="2022-03"?"Sanctions":"Placebo date",labelEnds:false,H:320,zero:false,xticks: ev==="2022-03"?[2019,2020,2021,2022,2023,2024,2025,2026]:[2019,2020,2021,2022]});
  const evt = ev==="2022-03";
  const pre = evt ? avg(part,"2019-01","2021-12")/avg("ROW","2019-01","2021-12") : avg(part,"2019-01","2019-12")/avg("ROW","2019-01","2019-12");
  const post = evt ? avg(part,"2022-03","2024-12")/avg("ROW","2022-03","2024-12") : avg(part,"2020-03","2021-12")/avg("ROW","2020-03","2021-12");
  $("#esK").innerHTML = `<div><b>${sgn((post/pre-1)*100,0)}%</b><span>change relative to the rest of the world, ${evt?"Mar 2022–Dec 2024 vs 2019–2021":"Mar 2020–Dec 2021 vs 2019 (placebo)"}</span></div>`;
}
seg("segP", v=>{ part=v; drawES(); markDone("activityB"); });
seg("segE", v=>{ ev=v; drawES(); markDone("lessonB"); });
const esn=$("#esNote"); esn.value=store.get("esNote",""); esn.addEventListener("input",()=>{ store.set("esNote",esn.value); if (esn.value.length>40) markDone("feedbackB"); });

/* exercise: Türkiye */
const t0=avg("TR",...PRE), t1=avg("TR",...POST), gT=(t1/t0-1)*100;
$("#trTable").innerHTML = `<tr><th>Group</th><th class="num">Before, € m a month</th><th class="num">After</th><th class="num">Change</th></tr><tr><td><strong>Türkiye</strong></td><td class="num">${fmtM(t0)}</td><td class="num">${fmtM(t1)}</td><td class="num">${sgn(gT,1)}%</td></tr><tr><td><strong>Rest of the world</strong></td><td class="num">${fmtM(r0)}</td><td class="num">${fmtM(r1)}</td><td class="num">${sgn(gR,1)}%</td></tr>`;
function drawTR(){ lineChart($("#trChart"),{title:"Türkiye: EU exports relative to the rest of the world",sub:"Index, 2019–2021 average = 100, three-month moving average",series:[{name:"Türkiye",color:css("--verm"),shape:"tri",pts:series("TR","2022-03")}],yfmt:v=>v.toFixed(0),xfmt:v=>Math.floor(v+1e-6),refY:100,vline:2022+2/12,vlabel:"Sanctions",labelEnds:false,H:280,zero:false,xticks:[2019,2020,2021,2022,2023,2024,2025,2026]}); }
["ex1","ex2","ex3","ex4"].forEach(id=>{ const t=$("#"+id); t.value=store.get(id,""); t.addEventListener("input",()=>store.set(id,t.value)); });
$("#exModel").innerHTML = `<h4>Model note</h4>
<p><b>Chart.</b> The event-study line above: EU exports to Türkiye relative to the comparison group, flat around 100 before 2022, rising to about 115 in 2023 and easing back after.</p>
<p><b>Effect.</b> EU exports to Türkiye grew by ${gT.toFixed(0)}% between 2019–2021 and March 2022–December 2024, against ${gR.toFixed(0)}% for the comparison group: about ${(gT-gR).toFixed(0)} percentage points more, roughly €${((t1-t0*(1+gR/100))).toFixed(0)} million a month.</p>
<p><b>Assumption.</b> Without sanctions, exports to Türkiye would have grown like exports to the comparison group. The flat pre-2022 line supports this.</p>
<p><b>Why it could be wrong.</b> Türkiye's very high inflation and currency swings after 2021 changed its demand for EU goods for reasons unrelated to Russia; euro values also mix prices and volumes. The estimate is an upper bound on rerouting, much smaller than for Kyrgyzstan.</p>`;
$("#exBtn").addEventListener("click",()=>{ $("#exModel").hidden=!$("#exModel").hidden; markDone("exercise"); });

/* quiz */
quiz($("#quizBox"), $("#quizScore"), [
 {q:"Why is a before/after comparison not enough to measure the effect of sanctions?",o:["Because other things changed at the same time","Because trade data are secret","Because sanctions have no effect"],a:0,e:"Inflation, recovery and other shocks also changed trade; the comparison group absorbs them."},
 {q:"Treated group +130%, comparison group +33%. The difference-in-differences estimate is…",o:["+163 points","+97 points","+33 points"],a:1,e:"130 − 33 = 97 percentage points."},
 {q:"What does the parallel-trends assumption say?",o:["Both groups have the same level","Without the policy, both groups would have moved alike","The policy affects both groups equally"],a:1,e:"Levels can differ; trends must be comparable."},
 {q:"A placebo test at a fake date shows a large effect. What should you conclude?",o:["The policy worked twice","Something other than the policy moves the data; be cautious","Nothing"],a:1,e:"Here the pandemic hit small neighbours harder; state it as a caveat."},
 {q:"The detour through three neighbours made up about 9% of lost EU exports to Russia. What does this say about sanctions?",o:["They failed completely","Rerouting was real but small relative to the collapse","They had no effect on Russia"],a:1,e:"Both headlines, “sanctions fail” and “no leakage”, are wrong."}], "quiz");

/* boot */
drawCars(); drawES(); drawTR(); if (stA.ok) openFA(); faGuess();
wireCopy(); wireReset();
onRedraw(()=>{ drawCars(); drawES(); drawTR(); });
