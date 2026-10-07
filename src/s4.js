/* Session 4 */
const C = DATA.c.map(c=>({...c, d:c.dist/1000, g:c.gdppc/10000}));
const NAMES = Object.fromEntries(C.map(c=>[c.iso,c.n]));
function ols(cols){ // cols: array of functions c=>value ; returns {b, r2, res}
  const X = C.map(c=>[1, ...cols.map(f=>f(c))]), y = C.map(c=>c.share), k = X[0].length;
  const XtX = Array.from({length:k},(_,i)=>Array.from({length:k},(_,j)=>X.reduce((s,r)=>s+r[i]*r[j],0)));
  const Xty = Array.from({length:k},(_,i)=>X.reduce((s,r,n)=>s+r[i]*y[n],0));
  const A = XtX.map((r,i)=>[...r, Xty[i]]);
  for (let i=0;i<k;i++){ let p=i; for (let r=i+1;r<k;r++) if (Math.abs(A[r][i])>Math.abs(A[p][i])) p=r; [A[i],A[p]]=[A[p],A[i]];
    for (let r=0;r<k;r++) if (r!==i){ const f=A[r][i]/A[i][i]; for (let c=i;c<=k;c++) A[r][c]-=f*A[i][c]; } }
  const b = A.map((r,i)=>r[k]/r[i]); const yh = X.map(r=>r.reduce((s,v,i)=>s+v*b[i],0));
  const ym = y.reduce((a,v)=>a+v,0)/y.length; const res = y.map((v,i)=>v-yh[i]);
  return {b, r2: 1 - res.reduce((a,v)=>a+v*v,0)/y.reduce((a,v)=>a+(v-ym)**2,0), res, yh};
}
const M0 = ols([c=>c.d]); const A0=M0.b[0], B0=M0.b[1];
const SSE = (a,b) => C.reduce((s,c)=>s+(c.share-(a+b*c.d))**2,0);

/* puzzle: tile map */
function drawMap(){ tileMap($("#shareMap"),{title:"Military spending, % of GDP, 2024",sub:"Darker = higher share",vals:Object.fromEntries(C.map(c=>[c.iso,c.share])),names:NAMES,fmt:v=>v.toFixed(1),lo:0,hi:4.2,note:"Source: SIPRI via World Bank. Grey: Iceland (no armed forces)."}); }
lockChoice({group:"q-slope", button:"slBtn", key:"guess", onReveal:v=>{ $("#slOut").textContent="Saved. The answer comes in step 4."; markDone("puzzle"); faGuess(); }});

/* lesson A: line by eye */
let showBest=false;
function drawEye(){ const a=+$("#eyeA").value, b=+$("#eyeB").value; $("#eyeAo").textContent=a.toFixed(2); $("#eyeBo").textContent=b.toFixed(2);
  $("#eyeSSE").textContent=SSE(a,b).toFixed(1); $("#bestSSE").textContent= showBest?SSE(A0,B0).toFixed(1):"?";
  const r = scatter($("#eyeChart"),{title:"Your line through the cloud",sub:"Military spending, % of GDP, against distance of the capital from Moscow",pts:C.map(c=>({x:c.d,y:c.share,color:css("--ink2"),r:4.5,tip:`<b>${c.n}</b><br>${c.dist.toLocaleString("en-GB")} km · ${c.share.toFixed(2)}%`})),xmin:0,xmax:4,ymin:0,ymax:5,xticks:[0,1,2,3,4],yticks:[0,1,2,3,4,5],xfmt:v=>v*1000===0?"0 km":(v*1000).toLocaleString("en-GB"),yfmt:v=>v+"%",xlab:"Distance from Moscow, km",line:{a,b},lineLabel:"Your line",labels:false});
  if (showBest){ el("path",{d:`M${r.xs(0)},${r.ys(A0)} L${r.xs(4)},${r.ys(A0+B0*4)}`,stroke:css("--accent"),"stroke-width":2,fill:"none"},r.f.svg); txt(r.f.svg, r.xs(3.2), r.ys(A0+B0*3.2)-8, "Least squares", {class:"lab"}); }
}
["eyeA","eyeB"].forEach(id=>$("#"+id).addEventListener("input",drawEye));
$("#eyeBest").addEventListener("click",()=>{ showBest=true; drawEye(); markDone("lessonA"); });
$("#la-btn").addEventListener("click",()=>{ const [v]=readNums(["la-in"]); const t=3.37-0.73*2;
  if (Math.abs(v-t)<=0.02){ feedback($("#la-fb"),true,"Right: 3.37 − 0.73 × 2 = 1.91% of GDP."); markDone("lessonA"); }
  else feedback($("#la-fb"),false,"Distance is measured in thousands of km: 2,000 km is 2."); });

/* activity A */
let stA=store.get("actA",{ok:false});
const sp=C.find(c=>c.iso==="ESP"); const spP=3.37-0.733*3.44, spR=1.43-spP;
$("#aa-btn").addEventListener("click",()=>{ const [p,r]=readNums(["aa-p","aa-r"]);
  if (Math.abs(p-spP)<=0.03 && Math.abs(r-spR)<=0.03){ feedback($("#aa-fb"),true,`Right: 3.37 − 0.733 × 3.44 = ${spP.toFixed(2)}; residual 1.43 − ${spP.toFixed(2)} = +${spR.toFixed(2)}. Spain spends more than its distance predicts.`); stA.ok=true; store.set("actA",stA); markDone("activityA"); drawReg(); }
  else if (Math.abs(p-spP)<=0.03) feedback($("#aa-fb"),false,"Prediction right. Residual = actual − predicted.");
  else feedback($("#aa-fb"),false,"Use distance in thousands of km: 3.44."); });
$("#aaC").innerHTML=[...C].sort((a,b)=>a.n.localeCompare(b.n)).map(c=>`<option value="${c.iso}">${c.n}</option>`).join("");
$("#aaC").value = "POL";
function drawReg(){ const sel=$("#aaC").value, c=C.find(x=>x.iso===sel), p=A0+B0*c.d;
  $("#aaK").innerHTML=`<div><b>${c.share.toFixed(2)}%</b><span>actual</span></div><div><b>${p.toFixed(2)}%</b><span>predicted</span></div><div><b>${sgn(c.share-p,2)}</b><span>residual, points</span></div>`;
  scatter($("#regChart"),{title:`Least-squares line: ${A0.toFixed(2)} ${B0<0?"−":"+"} ${Math.abs(B0).toFixed(2)} × distance (R² = ${M0.r2.toFixed(2)})`,sub:"Military spending, % of GDP, 2024",
    pts:C.map(x=>({x:x.d,y:x.share,label:(x.iso===sel||Math.abs(x.share-(A0+B0*x.d))>0.95||x.iso==="ESP")?x.n:"",color:x.iso===sel?css("--verm"):css("--accent"),shape:x.iso===sel?"tri":"circ",res:x.iso===sel,r:x.iso===sel?7:4.5,tip:`<b>${x.n}</b><br>${x.share.toFixed(2)}% · predicted ${(A0+B0*x.d).toFixed(2)}%`})),
    xmin:0,xmax:4,ymin:0,ymax:5,xticks:[0,1,2,3,4],yticks:[0,1,2,3,4,5],xfmt:v=>(v*1000).toLocaleString("en-GB"),yfmt:v=>v+"%",xlab:"Distance from Moscow, km",line:{a:A0,b:B0}}); }
$("#aaC").addEventListener("change",drawReg);
$("#csvReg").value="country,share,dist_1000km,gdppc_10k,nato\n"+C.map(c=>`${c.n},${c.share},${c.d.toFixed(3)},${c.g.toFixed(3)},${c.nato}`).join("\n");
function faGuess(){ const g=store.get("guess",null); if (!g) return; $("#faGuess").textContent = g==="0.75" ? "Your guess, about 0.75 point, was right: the slope is 0.73." : `Your guess was ${g} point${g==="2"?"s":""}. The slope is about 0.73 point.`; }

/* lesson B: claims */
const CLAIMS=[
 {t:"“Countries closer to Russia spend more, so fear of Russia drives defence budgets.”",a:"plausible",e:"Plausible, but not shown by the regression: frontline states also share history, NATO commitments and politics. The data are consistent with the story; they do not prove it."},
 {t:"“Richer countries spend a smaller share of GDP on defence, so wealth makes countries complacent.”",a:"no",e:"A share falls when GDP is large even if spending is high; and many rich countries are also far from Russia or neutral. The causal reading does not follow."},
 {t:"“NATO members spend 0.8 points more, so joining NATO raises spending by 0.8 points.”",a:"no",e:"Countries that chose to join NATO may have spent more anyway: membership is not assigned at random. Session 5 shows how to get closer to a causal answer."}];
$("#claims").innerHTML = CLAIMS.map((c,i)=>`<p style="margin-top:${i?1:0}rem"><strong>${c.t}</strong></p><div class="row"><div class="seg" id="cl${i}"><button aria-pressed="false" data-v="plausible">Plausible, not proven</button><button aria-pressed="false" data-v="no">The data do not support this</button></div></div><p class="fb" id="clf${i}"></p>`).join("");
CLAIMS.forEach((c,i)=>seg("cl"+i, v=>{ feedback($("#clf"+i), v===c.a, c.e); markDone("lessonB"); }));

/* activity B: outliers */
const EXPL={A:"Rivalry with a neighbour other than Russia",B:"Neutrality: outside NATO",C:"Frontline state with a history of occupation",D:"NATO's 2% guideline keeps a distant member spending"};
const OUT=[["POL","C"],["GRC","A"],["AUT","B"],["IRL","B"],["PRT","D"],["CHE","B"]];
$("#outliers").innerHTML = OUT.map(([iso])=>{ const c=C.find(x=>x.iso===iso); const r=M0.res[C.indexOf(c)];
  return `<div class="row"><span style="min-width:9rem"><b>${c.n}</b> <span class="mono small">${sgn(r,2)}</span></span><select id="ol_${iso}" aria-label="Explanation for ${c.n}"><option value="">Choose an explanation</option>${Object.entries(EXPL).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select></div>`; }).join("");
const olSaved=store.get("ol",{}); OUT.forEach(([iso])=>{ if (olSaved[iso]) $("#ol_"+iso).value=olSaved[iso]; $("#ol_"+iso).addEventListener("change",e=>{ olSaved[iso]=e.target.value; store.set("ol",olSaved); }); });
$("#olBtn").addEventListener("click",()=>{ const right=OUT.filter(([iso,k])=>$("#ol_"+iso).value===k).length;
  feedback($("#olFb"), right>=5, `${right} of 6. Poland: frontline state. Greece: rivalry with Turkey. Austria, Ireland, Switzerland: neutral, outside NATO. Portugal: far from Russia, but NATO's 2% guideline sets a floor.`); markDone("activityB"); });
function drawCoef(){ const cols=[c=>c.d], names=["Distance from Moscow, per 1,000 km"];
  if ($("#cG").checked){ cols.push(c=>c.g); names.push("GDP per capita, per $10,000"); }
  if ($("#cN").checked){ cols.push(c=>c.nato); names.push("NATO member (1 = yes)"); }
  const m=ols(cols);
  $("#coefTable").innerHTML = `<tr><th>Variable</th><th class="num">Coefficient</th></tr>` + names.map((n,i)=>`<tr><td>${n}</td><td class="num">${sgn(m.b[i+1],2)}</td></tr>`).join("") + `<tr><td>Intercept</td><td class="num">${m.b[0].toFixed(2)}</td></tr><tr><td><b>R²</b></td><td class="num"><b>${m.r2.toFixed(2)}</b></td></tr>`;
  const rows=C.map((c,i)=>({label:c.n,v:m.res[i],color:m.res[i]>=0?css("--accent"):css("--verm"),tip:`<b>${c.n}</b><br>residual ${sgn(m.res[i],2)}`})).sort((a,b)=>b.v-a.v);
  hbar($("#resChart"),{title:"Residuals: spending above or below the model",sub:"Points of GDP",rows,xmin:-1.6,xmax:1.8,xfmt:v=>sgn(v,1),rowH:20});
  legend($("#resChart"),[{label:"Above the line",color:css("--accent"),kind:"sq"},{label:"Below the line",color:css("--verm"),kind:"sq"}]);
  if ($("#cG").checked && $("#cN").checked) markDone("feedbackB"); }
["cG","cN"].forEach(id=>$("#"+id).addEventListener("change",drawCoef));

/* claim audit */
["au1","au2","au3","au4"].forEach(id=>{ const t=$("#"+id); t.value=store.get(id,""); t.addEventListener("input",()=>{ store.set(id,t.value); }); });
const pol=DATA.pol, deu=DATA.deu;
$("#auModel").innerHTML = `<h4>Model audit</h4>
<p><b>Source.</b> SIPRI's Military Expenditure Database, republished by the World Bank, or NATO's own estimates. Both are reputable; they differ slightly because NATO counts more items (pensions, some infrastructure).</p>
<p><b>Comparison.</b> As a share of GDP, the claim holds: in 2024 Poland spent ${pol.share.toFixed(1)}% of GDP, Germany ${deu.share.toFixed(1)}%. In money, it is wrong: Germany spent about $${deu.usd.toFixed(0)} billion, Poland about $${pol.usd.toFixed(0)} billion, less than half. The headline does not say which measure it uses.</p>
<p><b>Cause.</b> No causal claim, but readers may infer that Poland has the stronger armed forces; spending says nothing directly about capability.</p>
<p><b>Verdict.</b> Misleading: true as a share of GDP, false in money; the claim should say “as a share of its economy”.</p>`;
$("#auBtn").addEventListener("click",()=>{ $("#auModel").hidden=!$("#auModel").hidden; markDone("audit"); });

/* quiz */
quiz($("#quizBox"), $("#quizScore"), [
 {q:"The slope of spending on distance is −0.73 per 1,000 km. Which reading is right?",o:["Every country 1,000 km further spends exactly 0.73 points less","On average, countries 1,000 km further spend 0.73 points less","Distance causes 73% of spending"],a:1,e:"A slope describes an average relationship in the sample, not a law for each country."},
 {q:"R² = 0.38 means…",o:["38% of countries are on the line","the line accounts for 38% of the differences between countries","the slope is 0.38"],a:1,e:"R² is the share of the variation the model accounts for."},
 {q:"Adding GDP per capita makes the distance coefficient smaller. Why?",o:["Distance and income are correlated, and income also matters","The computer made an error","Distance no longer matters"],a:0,e:"Part of the simple relationship came from income."},
 {q:"Spain's residual is positive. What does that mean?",o:["Spain spends more than average","Spain spends more than the line predicts for its distance","Spain is in NATO"],a:1,e:"A residual compares a country with its own prediction."},
 {q:"NATO members spend 0.8 points more, all else equal. Does joining NATO cause this?",o:["Yes, the regression proves it","Not necessarily: countries choose to join","No, NATO has no effect"],a:1,e:"Membership is not random; regression shows association."}], "quiz");

/* boot */
drawMap(); drawEye(); drawReg(); drawCoef(); faGuess();
wireCopy(); wireReset();
onRedraw(()=>{ drawMap(); drawEye(); drawReg(); drawCoef(); });
