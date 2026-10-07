/* Session 6 */
const F = [...DATA.fuel].sort((a,b)=>a.n.localeCompare(b.n));
const LOWP = DATA.brentShock/DATA.brent2025-1, HIGHP = DATA.brentPeak/DATA.brent2025-1;
const lowC = f => f.net_pct*LOWP*0.9, highC = f => f.net_pct*HIGHP;
const wk = s => { const d=new Date(s+"T00:00:00Z"); return d.getUTCFullYear()+(d - Date.UTC(d.getUTCFullYear(),0,1))/(365*864e5); };

/* puzzle */
function drawHZ(){
  lineChart($("#hzChart"),{title:"Navires traversant le détroit d'Ormuz",sub:"Passages moyens par jour, par semaine",series:[{name:"Tous navires",color:css("--accent"),shape:"circ",pts:DATA.hormuz.map(([d,v])=>[wk(d),v])},{name:"Pétroliers",color:css("--verm"),shape:"tri",dash:"5 3",pts:DATA.tankers.map(([d,v])=>[wk(d),v])}],yfmt:v=>v.toFixed(0),xfmt:v=>{ const y=Math.floor(v+1e-6), m=Math.round((v-y)*12); return ["janv.","févr.","mars","avr.","mai","juin","juil.","août","sept.","oct.","nov.","déc."][Math.min(11,m)]+" "+y; },xticks:[2025,2025.5,2026,2026.5],vline:2026+2/12,vlabel:"1er mars 2026",H:300,labelEnds:false});
  legend($("#hzChart"),[{label:"Tous navires",color:css("--accent")},{label:"Pétroliers",color:css("--verm"),kind:"line",dash:"5 3"}]);
}
lockChoice({group:"q-cost", button:"csBtn", key:"guess", onReveal:()=>{ $("#csOut").textContent="Enregistré. La réponse vient à l'étape 4."; markDone("puzzle"); fbGuess(); }});

/* lesson */
$("#la-btn").addEventListener("click",()=>{ const [v]=readNums(["la-in"]); const t=1.67*0.44;
  if (Math.abs(v-t)<=0.02){ feedback($("#la-fb"),true,"Exact : 1,67 × 0,44 ≈ 0,73 % du PIB par an."); markDone("lesson"); }
  else feedback($("#la-fb"),false,"Multipliez 1,67 par 0,44."); });

/* activity */
$("#cC").innerHTML = F.map(f=>`<option value="${f.iso}">${f.n}</option>`).join("");
$("#cC").value = store.get("country","DEU");
function cur(){ return F.find(f=>f.iso===$("#cC").value); }
function info(){ const f=cur(); $("#cInfo").innerHTML = `${f.n} : importations nettes d'énergie <b>${f.net_pct.toFixed(2)} % du PIB</b> (${f.year}).${f.net_pct<0?" Exportateur net : la formule donne un gain, présenté comme un coût négatif.":""}`;
  $("#aiPrompt").textContent = `Que coûterait au pays suivant, ${f.n}, la fermeture du détroit d'Ormuz à partir de mars 2026, en part du PIB par an ? Donnez une estimation basse et une estimation haute, indiquez la hausse du prix du pétrole que vous retenez, le montant des importations nettes d'énergie de ce pays en part du PIB, et vos sources.`; }
$("#cC").addEventListener("change",()=>{ store.set("country",$("#cC").value); info(); $("#cFb").textContent=""; });
$("#cBtn").addEventListener("click",()=>{ const f=cur(); const [lo,hi]=readNums(["cLo","cHi"]); const L=lowC(f), Hh=highC(f);
  if (isNaN(lo)||isNaN(hi)) return feedback($("#cFb"),false,"Remplissez les deux cases.");
  if (Math.abs(lo-L)<=0.03+Math.abs(L)*0.02 && Math.abs(hi-Hh)<=0.03+Math.abs(Hh)*0.02){ feedback($("#cFb"),true,`Exact : bas ${f.net_pct.toFixed(2)} × ${LOWP.toFixed(2)} × 0,9 = ${L.toFixed(2)} ; haut ${f.net_pct.toFixed(2)} × ${HIGHP.toFixed(2)} = ${Hh.toFixed(2)} % du PIB.`); store.set("done1",true); markDone("activity"); drawCost(); }
  else feedback($("#cFb"),false,`Bas : importations nettes × ${LOWP.toFixed(2)} × 0,9. Haut : importations nettes × ${HIGHP.toFixed(2)}.`); });
$("#aiCopy").addEventListener("click",()=>{ const t=$("#aiPrompt").textContent; try { navigator.clipboard.writeText(t).then(()=>$("#aiCopied").textContent="Copié.",()=>$("#aiCopied").textContent="Sélectionnez le texte et copiez-le."); } catch(e){ $("#aiCopied").textContent="Sélectionnez le texte et copiez-le."; } });
const aiA=$("#aiAns"); aiA.value=store.get("ai",""); aiA.addEventListener("input",()=>store.set("ai",aiA.value));
function drawCost(){
  if (!store.get("done1",false)){ $("#costChart").innerHTML='<div class="cs" style="padding:2rem 1rem">Le graphique pour tous les pays s\'affiche une fois que vous avez calculé votre propre estimation.</div>'; return; }
  const sel=$("#cC").value;
  const rows=[...F].filter(f=>f.net_pct>0).sort((a,b)=>highC(b)-highC(a)).map(f=>({label:f.n,v:lowC(f),lo:lowC(f),hi:highC(f),bold:f.iso===sel,color:f.iso===sel?css("--verm"):css("--accent"),tip:`<b>${f.n}</b><br>bas ${lowC(f).toFixed(2)} % · haut ${highC(f).toFixed(2)} % du PIB`}));
  hbar($("#costChart"),{title:"Coût de premier tour du choc des prix de l'énergie de 2026",sub:"% du PIB par an, importateurs nets d'énergie ; votre pays en surbrillance",rows,xmin:0,xfmt:v=>v.toFixed(0)+" %",rowH:20});
}

/* feedback */
function fbGuess(){ const g=store.get("guess",null); if (!g) return; $("#fbGuess").textContent = g==="b" ? "Votre estimation, environ 1 % à 2 % du PIB, était juste pour un pays type de l'UE." : `Votre estimation était ${({a:"moins de 0,5 %",c:"environ 3 % à 5 %",d:"plus de 5 %"})[g]}. Pour un pays type de l'UE, la réponse est d'environ 1 % à 2 % du PIB.`; }
const au=store.get("audit",[]); $$("#aiAudit input").forEach(i=>{ i.checked=au.includes(i.value); i.addEventListener("change",()=>{ const v=$$("#aiAudit input:checked").map(x=>x.value); store.set("audit",v); $("#aiScore").textContent=`L'IA a rempli ${v.length} des 5 critères.`; markDone("feedback"); }); });
if (au.length) $("#aiScore").textContent=`L'IA a rempli ${au.length} des 5 critères.`;

/* quiz */
quiz($("#quizBox"), $("#quizScore"), [
 {q:"Les importations nettes d'énergie représentent 3 % du PIB et les prix augmentent de 50 %. Sans tenir compte de la réaction de la demande, le coût de premier tour est de…",o:["0,15 % du PIB","1,5 % du PIB","3,5 % du PIB"],a:1,e:"3 × 0,5 = 1,5 % du PIB."},
 {q:"Pourquoi donner un scénario bas et un scénario haut ?",o:["Pour paraître prudent","Parce que les paramètres sont incertains et que le lecteur doit voir dans quelle mesure","Parce que les ministres préfèrent deux chiffres"],a:1,e:"Une fourchette montre l'incertitude ouvertement ; chaque scénario énonce ses hypothèses."},
 {q:"Les exportations nettes d'énergie de la Norvège représentent environ 20 % du PIB. La hausse des prix…",o:["coûte le plus à la Norvège","est un gain pour la Norvège","n'affecte pas la Norvège"],a:1,e:"Les exportateurs nets gagnent à la hausse des prix, s'ils peuvent expédier."},
 {q:"PortWatch ne montre presque aucun navire dans le détroit. Pourquoi le nombre réel pourrait-il être plus élevé ?",o:["Les navires coupent leur transpondeur en zone de guerre","Les satellites ne voient pas la nuit","PortWatch ne compte que les pétroliers"],a:0,e:"Les comptages fondés sur l'AIS sous-estiment le trafic quand les navires deviennent invisibles."},
 {q:"Un assistant d'IA donne un coût précis avec trois références. Que faites-vous d'abord ?",o:["Je l'utilise : il cite ses sources","Je vérifie que les références existent et que les chiffres correspondent aux données","J'interroge une autre IA"],a:1,e:"Une réponse fluide peut contenir des sources inventées et des chiffres périmés."}], "quiz");

/* help when stuck */
helpAfter("la-btn","la-fb",()=>({"la-in":"0.73"}));
helpAfter("cBtn","cFb",()=>{ const f=cur(); return {"cLo":lowC(f).toFixed(2),"cHi":highC(f).toFixed(2)}; });

/* boot */
drawHZ(); info(); drawCost(); fbGuess();
wireReset();
onRedraw(()=>{ drawHZ(); drawCost(); });
