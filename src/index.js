/* Course home */
const SES = [
 {n:1, t:"Can we trust the numbers?", d:"Catch an autocracy inflating its growth with night lights seen from space; redraw a misleading defence-spending chart.", m:"Indicators, real terms, honest charts", task:"Exercise 1 (practice)", steps:9},
 {n:2, t:"Can we trust a poll?", d:"Recount the polls before Moldova's 2024 EU referendum; decide which changes in European views of China are real.", m:"Margins of error, comparing groups", task:"Choose your brief question", steps:9},
 {n:3, t:"Who depends on whom?", d:"Find the products Europe buys almost only from China; rig a vulnerability ranking and meet the Doing Business affair.", m:"Import shares, Herfindahl index, composite indices, maps", task:"Brief: first chart and source", steps:9},
 {n:4, t:"Why does Poland spend so much, and Spain so little?", d:"Fit a line through European defence spending, add controls, explain the outliers, audit a claim.", m:"Regression, controls, outliers", task:"Claim audit", steps:10},
 {n:5, t:"Why did German cars flood into Kyrgyzstan?", d:"Measure how much EU trade with Russia was rerouted through its neighbours.", m:"Difference-in-differences, event studies, placebo tests", task:"Exercise 2: evaluation note", steps:10},
 {n:6, t:"What does the Hormuz closure cost?", d:"Cost the 2026 closure of the Strait of Hormuz for any country; check an AI assistant's answer; finish your brief.", m:"Scenario costing with ranges, auditing AI", task:"Finish and present your brief", steps:7}];
function prog(n){ try { const v=localStorage.getItem("qm"+n+":done"); return v?JSON.parse(v).length:0; } catch(e){ return 0; } }
$("#sessions").innerHTML = SES.map(s=>{ const p=prog(s.n), pct=Math.round(p/s.steps*100);
  return `<a class="scard" href="session${s.n}.html"><span class="eyebrow">Session ${s.n}${p?` · ${p} of ${s.steps} steps done`:""}</span><strong>${s.t}</strong><span>${s.d}</span><span class="small"><b>Methods:</b> ${s.m}. <b>Ends with:</b> ${s.task}.</span><span class="bar" aria-hidden="true"><i style="width:${pct}%"></i></span></a>`; }).join("");
const PARTS=[["country","Country"],["question","Question"],["data","Data needed"],["headline","1. Headline"],["chart1","2. Charts"],["estimate","3. Estimate"],["range","4. Range"],["limits","5. What could make it wrong"],["source","6. Sources"],["regression","Notes: regression (session 4)"],["did","Notes: difference-in-differences (session 5)"]];
const QTXT={A:"Is it spending enough on defence, and would voters accept more?",B:"Should it reduce its dependence on China for a critical product?",C:"Are sanctions on Russia being circumvented through its trade?",D:"Can we trust its official growth figures?"};
function drawBrief(){ const got=PARTS.map(([k,l])=>[l, brief.get(k,"")]).filter(([,v])=>v && String(v).trim());
  $("#briefView").innerHTML = got.length ? got.map(([l,v])=>`<p style="margin:.3rem 0"><b>${l}:</b> ${l==="Question"?(v+". "+(QTXT[v]||"")):String(v).replace(/</g,"&lt;").slice(0,240)}${String(v).length>240?"…":""}</p>`).join("") : "Nothing yet. Start with session 2, step 8.";
  $("#briefText").value = got.map(([l,v])=>`${l}\n${l==="Question"?(v+". "+(QTXT[v]||"")):v}\n`).join("\n"); }
drawBrief(); wireCopy();
$("#resetAll").addEventListener("click",()=>{ try { Object.keys(localStorage).filter(k=>/^qm(\d|brief):/.test(k)).forEach(k=>localStorage.removeItem(k)); } catch(e){} location.reload(); });
