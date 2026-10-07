/* Course home */
const SES = [
 {n:1, t:"Can we trust the numbers?", d:"Catch an autocracy inflating its growth with night lights seen from space; redraw a misleading defence-spending chart.", m:"Indicators, real terms, honest charts", task:"Exercise 1 (practice)", steps:9},
 {n:2, t:"Can we trust a poll?", d:"Recount the polls before Moldova's 2024 EU referendum; decide which changes in European views of China are real.", m:"Margins of error, comparing groups", task:"Self-check quiz", steps:8},
 {n:3, t:"Who depends on whom?", d:"Find the products Europe buys almost only from China; rig a vulnerability ranking and meet the Doing Business affair.", m:"Import shares, Herfindahl index, composite indices, maps", task:"Self-check quiz", steps:8},
 {n:4, t:"Why does Poland spend so much, and Spain so little?", d:"Fit a line through European defence spending, add controls, explain the outliers, audit a claim.", m:"Regression, controls, outliers", task:"Claim audit", steps:9},
 {n:5, t:"Why did German cars flood into Kyrgyzstan?", d:"Measure how much EU trade with Russia was rerouted through its neighbours.", m:"Difference-in-differences, event studies, placebo tests", task:"Exercise 2: evaluation note", steps:9},
 {n:6, t:"What does the Hormuz closure cost?", d:"Cost the 2026 closure of the Strait of Hormuz for any country; check an AI assistant's answer; put it all together.", m:"Scenario costing with ranges, auditing AI", task:"An optional two-page note", steps:6}];
function prog(n){ try { const v=localStorage.getItem("qm"+n+":done"); return v?JSON.parse(v).length:0; } catch(e){ return 0; } }
$("#sessions").innerHTML = SES.map(s=>{ const p=prog(s.n), pct=Math.round(p/s.steps*100);
  return `<a class="scard" href="session${s.n}.html"><span class="eyebrow">Session ${s.n}${p?` · ${p} of ${s.steps} steps done`:""}</span><strong>${s.t}</strong><span>${s.d}</span><span class="small"><b>Methods:</b> ${s.m}. <b>Ends with:</b> ${s.task}.</span><span class="bar" aria-hidden="true"><i style="width:${pct}%"></i></span></a>`; }).join("");
wireCopy();
$("#resetAll").addEventListener("click",()=>{ try { Object.keys(localStorage).filter(k=>/^qm(\d|brief|cert):/.test(k)).forEach(k=>localStorage.removeItem(k)); } catch(e){} location.reload(); });
