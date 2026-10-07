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
function drawMap(){ tileMap($("#shareMap"),{title:"Dépenses militaires, % du PIB, 2024",sub:"Plus foncé = part plus élevée",vals:Object.fromEntries(C.map(c=>[c.iso,c.share])),names:NAMES,fmt:v=>v.toFixed(1),lo:0,hi:4.2,note:"Source : SIPRI via la Banque mondiale. Gris : Islande (pas de forces armées)."}); }
lockChoice({group:"q-slope", button:"slBtn", key:"guess", onReveal:v=>{ $("#slOut").textContent="Enregistré. La réponse arrive à l'étape 4."; markDone("puzzle"); faGuess(); }});

/* lesson A: line by eye */
let showBest=false;
function drawEye(){ const a=+$("#eyeA").value, b=+$("#eyeB").value; $("#eyeAo").textContent=a.toFixed(2); $("#eyeBo").textContent=b.toFixed(2);
  $("#eyeSSE").textContent=SSE(a,b).toFixed(1); $("#bestSSE").textContent= showBest?SSE(A0,B0).toFixed(1):"?";
  const r = scatter($("#eyeChart"),{title:"Votre droite à travers le nuage",sub:"Dépenses militaires, % du PIB, selon la distance entre la capitale et Moscou",pts:C.map(c=>({x:c.d,y:c.share,color:css("--ink2"),r:4.5,tip:`<b>${c.n}</b><br>${c.dist.toLocaleString("fr-FR")} km · ${c.share.toFixed(2)} %`})),xmin:0,xmax:4,ymin:0,ymax:5,xticks:[0,1,2,3,4],yticks:[0,1,2,3,4,5],xfmt:v=>v*1000===0?"0 km":(v*1000).toLocaleString("fr-FR"),yfmt:v=>v+" %",xlab:"Distance à Moscou, km",line:{a,b},lineLabel:"Votre droite",labels:false});
  if (showBest){ el("path",{d:`M${r.xs(0)},${r.ys(A0)} L${r.xs(4)},${r.ys(A0+B0*4)}`,stroke:css("--accent"),"stroke-width":2,fill:"none"},r.f.svg); txt(r.f.svg, r.xs(3.2), r.ys(A0+B0*3.2)-8, "Moindres carrés", {class:"lab"}); }
}
["eyeA","eyeB"].forEach(id=>$("#"+id).addEventListener("input",drawEye));
$("#eyeBest").addEventListener("click",()=>{ showBest=true; drawEye(); markDone("lessonA"); });
$("#la-btn").addEventListener("click",()=>{ const [v]=readNums(["la-in"]); const t=3.37-0.73*2;
  if (Math.abs(v-t)<=0.02){ feedback($("#la-fb"),true,"Exact : 3,37 − 0,73 × 2 = 1,91 % du PIB."); markDone("lessonA"); }
  else feedback($("#la-fb"),false,"La distance est mesurée en milliers de km : 2 000 km correspondent à 2."); });

/* activity A */
let stA=store.get("actA",{ok:false});
const sp=C.find(c=>c.iso==="ESP"); const spP=3.37-0.733*3.44, spR=1.43-spP;
$("#aa-btn").addEventListener("click",()=>{ const [p,r]=readNums(["aa-p","aa-r"]);
  if (Math.abs(p-spP)<=0.03 && Math.abs(r-spR)<=0.03){ feedback($("#aa-fb"),true,`Exact : 3,37 − 0,733 × 3,44 = ${spP.toFixed(2)} ; résidu 1,43 − ${spP.toFixed(2)} = +${spR.toFixed(2)}. L'Espagne dépense plus que ne le prédit sa distance.`); stA.ok=true; store.set("actA",stA); markDone("activityA"); drawReg(); }
  else if (Math.abs(p-spP)<=0.03) feedback($("#aa-fb"),false,"Prédiction exacte. Résidu = observé − prédit.");
  else feedback($("#aa-fb"),false,"Utilisez la distance en milliers de km : 3,44."); });
$("#aaC").innerHTML=[...C].sort((a,b)=>a.n.localeCompare(b.n)).map(c=>`<option value="${c.iso}">${c.n}</option>`).join("");
$("#aaC").value = "POL";
function drawReg(){ const sel=$("#aaC").value, c=C.find(x=>x.iso===sel), p=A0+B0*c.d;
  $("#aaK").innerHTML=`<div><b>${c.share.toFixed(2)} %</b><span>observé</span></div><div><b>${p.toFixed(2)} %</b><span>prédit</span></div><div><b>${sgn(c.share-p,2)}</b><span>résidu, en points</span></div>`;
  scatter($("#regChart"),{title:`Droite des moindres carrés : ${A0.toFixed(2)} ${B0<0?"−":"+"} ${Math.abs(B0).toFixed(2)} × distance (R² = ${M0.r2.toFixed(2)})`,sub:"Dépenses militaires, % du PIB, 2024",
    pts:C.map(x=>({x:x.d,y:x.share,label:(x.iso===sel||Math.abs(x.share-(A0+B0*x.d))>0.95||x.iso==="ESP")?x.n:"",color:x.iso===sel?css("--verm"):css("--accent"),shape:x.iso===sel?"tri":"circ",res:x.iso===sel,r:x.iso===sel?7:4.5,tip:`<b>${x.n}</b><br>${x.share.toFixed(2)} % · prédit ${(A0+B0*x.d).toFixed(2)} %`})),
    xmin:0,xmax:4,ymin:0,ymax:5,xticks:[0,1,2,3,4],yticks:[0,1,2,3,4,5],xfmt:v=>(v*1000).toLocaleString("fr-FR"),yfmt:v=>v+" %",xlab:"Distance à Moscou, km",line:{a:A0,b:B0}}); }
$("#aaC").addEventListener("change",drawReg);
$("#csvReg").value="country,share,dist_1000km,gdppc_10k,nato\n"+C.map(c=>`${c.n},${c.share},${c.d.toFixed(3)},${c.g.toFixed(3)},${c.nato}`).join("\n");
function faGuess(){ const g=store.get("guess",null); if (!g) return; $("#faGuess").textContent = g==="0.75" ? "Votre estimation, environ 0,75 point, était juste : la pente est de 0,73." : `Votre estimation était de ${g.replace(".",",")} point${g==="2"?"s":""}. La pente est d'environ 0,73 point.`; }

/* lesson B: claims */
const CLAIMS=[
 {t:"« Les pays plus proches de la Russie dépensent davantage, donc la peur de la Russie détermine les budgets de défense. »",a:"plausible",e:"Plausible, mais la régression ne le démontre pas : les États de première ligne partagent aussi une histoire, des engagements envers l'OTAN et des orientations politiques. Les données sont compatibles avec ce récit ; elles ne le prouvent pas."},
 {t:"« Les pays plus riches consacrent une part plus faible de leur PIB à la défense, donc la richesse rend les pays complaisants. »",a:"no",e:"Une part diminue quand le PIB est élevé, même si les dépenses sont importantes ; et beaucoup de pays riches sont aussi éloignés de la Russie ou neutres. La lecture causale ne s'ensuit pas."},
 {t:"« Les membres de l'OTAN dépensent 0,8 point de plus, donc adhérer à l'OTAN augmente les dépenses de 0,8 point. »",a:"no",e:"Les pays qui ont choisi d'adhérer à l'OTAN auraient peut-être dépensé davantage de toute façon : l'adhésion n'est pas attribuée au hasard. La séance 5 montre comment se rapprocher d'une réponse causale."}];
$("#claims").innerHTML = CLAIMS.map((c,i)=>`<p style="margin-top:${i?1:0}rem"><strong>${c.t}</strong></p><div class="row"><div class="seg" id="cl${i}"><button aria-pressed="false" data-v="plausible">Plausible, non démontré</button><button aria-pressed="false" data-v="no">Les données ne l'étayent pas</button></div></div><p class="fb" id="clf${i}"></p>`).join("");
CLAIMS.forEach((c,i)=>seg("cl"+i, v=>{ feedback($("#clf"+i), v===c.a, c.e); markDone("lessonB"); }));

/* activity B: outliers */
const EXPL={A:"Rivalité avec un voisin autre que la Russie",B:"Neutralité : hors de l'OTAN",C:"État de première ligne marqué par une histoire d'occupation",D:"La norme de 2 % de l'OTAN maintient les dépenses d'un membre éloigné"};
const OUT=[["POL","C"],["GRC","A"],["AUT","B"],["IRL","B"],["PRT","D"],["CHE","B"]];
$("#outliers").innerHTML = OUT.map(([iso])=>{ const c=C.find(x=>x.iso===iso); const r=M0.res[C.indexOf(c)];
  return `<div class="row"><span style="min-width:9rem"><b>${c.n}</b> <span class="mono small">${sgn(r,2)}</span></span><select id="ol_${iso}" aria-label="Explication pour ${c.n}"><option value="">Choisissez une explication</option>${Object.entries(EXPL).map(([k,v])=>`<option value="${k}">${v}</option>`).join("")}</select></div>`; }).join("");
const olSaved=store.get("ol",{}); OUT.forEach(([iso])=>{ if (olSaved[iso]) $("#ol_"+iso).value=olSaved[iso]; $("#ol_"+iso).addEventListener("change",e=>{ olSaved[iso]=e.target.value; store.set("ol",olSaved); }); });
$("#olBtn").addEventListener("click",()=>{ const right=OUT.filter(([iso,k])=>$("#ol_"+iso).value===k).length;
  feedback($("#olFb"), right>=5, `${right} sur 6. Pologne : État de première ligne. Grèce : rivalité avec la Turquie. Autriche, Irlande, Suisse : neutres, hors de l'OTAN. Portugal : loin de la Russie, mais la norme de 2 % de l'OTAN fixe un plancher.`); markDone("activityB"); });
function drawCoef(){ const cols=[c=>c.d], names=["Distance à Moscou, pour 1 000 km"];
  if ($("#cG").checked){ cols.push(c=>c.g); names.push("PIB par habitant, pour 10 000 $"); }
  if ($("#cN").checked){ cols.push(c=>c.nato); names.push("Membre de l'OTAN (1 = oui)"); }
  const m=ols(cols);
  $("#coefTable").innerHTML = `<tr><th>Variable</th><th class="num">Coefficient</th></tr>` + names.map((n,i)=>`<tr><td>${n}</td><td class="num">${sgn(m.b[i+1],2)}</td></tr>`).join("") + `<tr><td>Constante</td><td class="num">${m.b[0].toFixed(2)}</td></tr><tr><td><b>R²</b></td><td class="num"><b>${m.r2.toFixed(2)}</b></td></tr>`;
  const rows=C.map((c,i)=>({label:c.n,v:m.res[i],color:m.res[i]>=0?css("--accent"):css("--verm"),tip:`<b>${c.n}</b><br>résidu ${sgn(m.res[i],2)}`})).sort((a,b)=>b.v-a.v);
  hbar($("#resChart"),{title:"Résidus : dépenses au-dessus ou en dessous du modèle",sub:"Points de PIB",rows,xmin:-1.6,xmax:1.8,xfmt:v=>sgn(v,1),rowH:20});
  legend($("#resChart"),[{label:"Au-dessus de la droite",color:css("--accent"),kind:"sq"},{label:"En dessous de la droite",color:css("--verm"),kind:"sq"}]);
  if ($("#cG").checked && $("#cN").checked) markDone("feedbackB"); }
["cG","cN"].forEach(id=>$("#"+id).addEventListener("change",drawCoef));

/* claim audit */
["au1","au2","au3","au4"].forEach(id=>{ const t=$("#"+id); t.value=store.get(id,""); t.addEventListener("input",()=>{ store.set(id,t.value); }); });
const pol=DATA.pol, deu=DATA.deu;
$("#auModel").innerHTML = `<h4>Audit modèle</h4>
<p><b>Source.</b> La base de données du SIPRI sur les dépenses militaires (Military Expenditure Database), republiée par la Banque mondiale, ou les estimations propres de l'OTAN. Les deux sont fiables ; elles diffèrent légèrement car l'OTAN comptabilise davantage de postes (pensions, certaines infrastructures).</p>
<p><b>Comparaison.</b> En part du PIB, l'affirmation est exacte : en 2024, la Pologne a consacré ${pol.share.toFixed(1)} % de son PIB à la défense, l'Allemagne ${deu.share.toFixed(1)} %. En montant, elle est fausse : l'Allemagne a dépensé environ ${deu.usd.toFixed(0)} milliards de dollars, la Pologne environ ${pol.usd.toFixed(0)} milliards, soit moins de la moitié. Le titre ne précise pas quelle mesure il utilise.</p>
<p><b>Cause.</b> Aucune affirmation causale, mais le lecteur peut en déduire que la Pologne dispose des forces armées les plus puissantes ; les dépenses ne disent rien directement des capacités.</p>
<p><b>Verdict.</b> Trompeuse : exacte en part du PIB, fausse en montant ; l'affirmation devrait préciser « en proportion de son économie ».</p>`;
$("#auBtn").addEventListener("click",()=>{ $("#auModel").hidden=!$("#auModel").hidden; markDone("audit"); });

/* quiz */
quiz($("#quizBox"), $("#quizScore"), [
 {q:"La pente des dépenses selon la distance est de −0,73 pour 1 000 km. Quelle lecture est correcte ?",o:["Chaque pays situé 1 000 km plus loin dépense exactement 0,73 point de moins","En moyenne, les pays situés 1 000 km plus loin dépensent 0,73 point de moins","La distance cause 73 % des dépenses"],a:1,e:"Une pente décrit une relation moyenne dans l'échantillon, pas une loi valable pour chaque pays."},
 {q:"R² = 0,38 signifie…",o:["38 % des pays sont sur la droite","la droite explique 38 % des différences entre pays","la pente vaut 0,38"],a:1,e:"Le R² est la part de la variation expliquée par le modèle."},
 {q:"Ajouter le PIB par habitant réduit le coefficient de la distance. Pourquoi ?",o:["La distance et le revenu sont corrélés, et le revenu compte aussi","L'ordinateur s'est trompé","La distance ne compte plus"],a:0,e:"Une partie de la relation simple provenait du revenu."},
 {q:"Le résidu de l'Espagne est positif. Qu'est-ce que cela signifie ?",o:["L'Espagne dépense plus que la moyenne","L'Espagne dépense plus que ce que la droite prédit pour sa distance","L'Espagne est membre de l'OTAN"],a:1,e:"Un résidu compare un pays à sa propre prédiction."},
 {q:"Les membres de l'OTAN dépensent 0,8 point de plus, toutes choses égales par ailleurs. L'adhésion à l'OTAN en est-elle la cause ?",o:["Oui, la régression le prouve","Pas nécessairement : les pays choisissent d'adhérer","Non, l'OTAN n'a aucun effet"],a:1,e:"L'adhésion n'est pas aléatoire ; la régression montre une association."}], "quiz");

/* help when stuck */
helpAfter("la-btn","la-fb",()=>({"la-in":"1.91"}));
helpAfter("aa-btn","aa-fb",()=>({"aa-p":spP.toFixed(2),"aa-r":spR.toFixed(2)}));

/* boot */
drawMap(); drawEye(); drawReg(); drawCoef(); faGuess();
wireCopy(); wireReset();
onRedraw(()=>{ drawMap(); drawEye(); drawReg(); drawCoef(); });
