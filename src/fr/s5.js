/* Session 5 */
const M = DATA.months, S = DATA.m;
const tnum = m => +m.slice(0,4) + (+m.slice(5,7)-1)/12;
const avg = (p,a,b) => { const v=M.map((m,i)=>[m,S[p][i]]).filter(([m])=>m>=a&&m<=b).map(([,x])=>x); return v.reduce((s,x)=>s+x,0)/v.length; };
const PRE=["2019-01","2021-12"], POST=["2022-03","2024-12"];
const g = p => avg(p,...POST)/avg(p,...PRE)-1;
const NAMES={NBR:"Trois voisins",KG:"Kirghizstan",AM:"Arménie",KZ:"Kazakhstan",GE:"Géorgie",UZ:"Ouzbékistan",TR:"Turquie"};

/* puzzle */
function drawCars(){ const v=Object.entries(DATA.de_kg_cars).map(([y,x])=>[y,x]);
  vbar($("#carChart"),{title:"Exportations allemandes de voitures et de pièces automobiles vers le Kirghizstan",sub:"Millions d'euros (chapitre 87 du SH)",vals:v,ymin:0,yfmt:x=>x.toFixed(0)+" M€",color:css("--accent"),H:260,source:"Source : Eurostat Comext (DS-045409)."}); }
lockChoice({group:"q-share", button:"shBtn", key:"guess", onReveal:()=>{ $("#shOut").textContent="Enregistré. La réponse arrive à l'étape 4."; markDone("puzzle"); faGuess(); }});

/* lesson A */
$("#la-btn").addEventListener("click",()=>{ const [v]=readNums(["la-in"]);
  if (Math.abs(v-30)<=0.5){ feedback($("#la-fb"),true,"Exact : 50 − 20 = 30 points de pourcentage."); markDone("lessonA"); }
  else feedback($("#la-fb"),false,"Soustrayez la variation du groupe de comparaison de celle du groupe traité."); });

/* activity A */
const n0=avg("NBR",...PRE), n1=avg("NBR",...POST), r0=avg("ROW",...PRE), r1=avg("ROW",...POST);
const fmtM = v => v.toLocaleString("fr-FR",{maximumFractionDigits:1, minimumFractionDigits:1});
$("#ddTable").innerHTML = `<tr><th>Groupe</th><th class="num">Avant</th><th class="num">Après</th></tr><tr><td><strong>Arménie + Kazakhstan + Kirghizstan</strong></td><td class="num">${fmtM(n0)}</td><td class="num">${fmtM(n1)}</td></tr><tr><td><strong>Reste du monde (comparaison)</strong></td><td class="num">${fmtM(r0)}</td><td class="num">${fmtM(r1)}</td></tr>`;
const gN=(n1/n0-1)*100, gR=(r1/r0-1)*100, DD=gN-gR;
let stA=store.get("actA",{ok:false});
$("#aa-btn").addEventListener("click",()=>{ const [a,b,c]=readNums(["aa1","aa2","aa3"]);
  if ([a,b,c].some(isNaN)) return feedback($("#aa-fb"),false,"Remplissez les trois cases.");
  const ok1=Math.abs(a-gN)<=0.6, ok2=Math.abs(b-gR)<=0.6, ok3=Math.abs(c-DD)<=1;
  if (ok1&&ok2&&ok3){ feedback($("#aa-fb"),true,`Exact : +${gN.toFixed(1)} % contre +${gR.toFixed(1)} %, soit un écart de ${DD.toFixed(1)} points.`); stA.ok=true; store.set("actA",stA); markDone("activityA"); openFA(); }
  else feedback($("#aa-fb"),false, !ok1 ? "Voisins : (après ÷ avant − 1) × 100." : !ok2 ? "Même formule pour le reste du monde." : "Soustrayez la seconde variation de la première."); });
function openFA(){ $("#fa-locked").hidden=true; $("#fa-body").hidden=false; markDone("feedbackA"); faGuess(); }
function faGuess(){ const gss=store.get("guess",null); if (!gss||$("#fa-body").hidden) return;
  $("#faGuess").textContent = gss==="10" ? "Votre estimation, environ 10 %, était juste." : `Votre estimation : ${({5:"moins de 5 %",30:"environ 30 %",50:"plus de la moitié"})[gss]}. La réponse est d'environ 9 %.`; }
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
  lineChart($("#esChart"),{title:`${NAMES[part]} : exportations de l'UE rapportées au reste du monde`,sub:"Indice, moyenne d'avant l'événement = 100",series:[{name:NAMES[part],color:css("--accent"),shape:"circ",pts}],yfmt:v=>v.toFixed(0),xfmt:v=>Math.floor(v+1e-6),tipfmt:v=>v.toFixed(0),refY:100,refLabel:"Niveau d'avant l'événement",vline: ev==="2022-03"?2022+2/12:2020+2/12, vlabel: ev==="2022-03"?"Sanctions":"Date placebo",labelEnds:false,H:320,zero:false,xticks: ev==="2022-03"?[2019,2020,2021,2022,2023,2024,2025,2026]:[2019,2020,2021,2022]});
  const evt = ev==="2022-03";
  const pre = evt ? avg(part,"2019-01","2021-12")/avg("ROW","2019-01","2021-12") : avg(part,"2019-01","2019-12")/avg("ROW","2019-01","2019-12");
  const post = evt ? avg(part,"2022-03","2024-12")/avg("ROW","2022-03","2024-12") : avg(part,"2020-03","2021-12")/avg("ROW","2020-03","2021-12");
  $("#esK").innerHTML = `<div><b>${sgn((post/pre-1)*100,0)} %</b><span>variation par rapport au reste du monde, ${evt?"mars 2022–déc. 2024 contre 2019–2021":"mars 2020–déc. 2021 contre 2019 (placebo)"}</span></div>`;
}
seg("segP", v=>{ part=v; drawES(); markDone("activityB"); });
seg("segE", v=>{ ev=v; drawES(); markDone("lessonB"); });
const esn=$("#esNote"); esn.value=store.get("esNote",""); esn.addEventListener("input",()=>{ store.set("esNote",esn.value); if (esn.value.length>40) markDone("feedbackB"); });

/* exercise: Türkiye */
const t0=avg("TR",...PRE), t1=avg("TR",...POST), gT=(t1/t0-1)*100;
$("#trTable").innerHTML = `<tr><th>Groupe</th><th class="num">Avant, M€ par mois</th><th class="num">Après</th><th class="num">Variation</th></tr><tr><td><strong>Turquie</strong></td><td class="num">${fmtM(t0)}</td><td class="num">${fmtM(t1)}</td><td class="num">${sgn(gT,1)} %</td></tr><tr><td><strong>Reste du monde</strong></td><td class="num">${fmtM(r0)}</td><td class="num">${fmtM(r1)}</td><td class="num">${sgn(gR,1)} %</td></tr>`;
function drawTR(){ lineChart($("#trChart"),{title:"Turquie : exportations de l'UE rapportées au reste du monde",sub:"Indice, moyenne 2019–2021 = 100, moyenne mobile sur trois mois",series:[{name:"Turquie",color:css("--verm"),shape:"tri",pts:series("TR","2022-03")}],yfmt:v=>v.toFixed(0),xfmt:v=>Math.floor(v+1e-6),refY:100,vline:2022+2/12,vlabel:"Sanctions",labelEnds:false,H:280,zero:false,xticks:[2019,2020,2021,2022,2023,2024,2025,2026]}); }
["ex1","ex2","ex3","ex4"].forEach(id=>{ const t=$("#"+id); t.value=store.get(id,""); t.addEventListener("input",()=>store.set(id,t.value)); });
$("#exModel").innerHTML = `<h4>Note modèle</h4>
<p><b>Graphique.</b> La courbe d'étude d'événement ci-dessus : exportations de l'UE vers la Turquie rapportées au groupe de comparaison, stables autour de 100 avant 2022, montant à environ 115 en 2023 puis refluant ensuite.</p>
<p><b>Effet.</b> Les exportations de l'UE vers la Turquie ont progressé de ${gT.toFixed(0)} % entre 2019–2021 et la période de mars 2022 à décembre 2024, contre ${gR.toFixed(0)} % pour le groupe de comparaison : environ ${(gT-gR).toFixed(0)} points de pourcentage de plus, soit environ ${((t1-t0*(1+gR/100))).toFixed(0)} millions d'euros par mois.</p>
<p><b>Hypothèse.</b> Sans sanctions, les exportations vers la Turquie auraient progressé comme celles vers le groupe de comparaison. La courbe plate avant 2022 conforte cette hypothèse.</p>
<p><b>Pourquoi elle pourrait être fausse.</b> L'inflation très élevée de la Turquie et les fortes variations de sa monnaie après 2021 ont modifié sa demande de biens européens pour des raisons sans lien avec la Russie ; les valeurs en euros mêlent aussi prix et volumes. L'estimation constitue une borne supérieure du détournement, bien plus faible que pour le Kirghizstan.</p>`;
$("#exBtn").addEventListener("click",()=>{ $("#exModel").hidden=!$("#exModel").hidden; markDone("exercise"); });

/* quiz */
quiz($("#quizBox"), $("#quizScore"), [
 {q:"Pourquoi une comparaison avant/après ne suffit-elle pas à mesurer l'effet des sanctions ?",o:["Parce que d'autres choses ont changé en même temps","Parce que les données commerciales sont secrètes","Parce que les sanctions n'ont aucun effet"],a:0,e:"L'inflation, la reprise et d'autres chocs ont aussi modifié les échanges ; le groupe de comparaison les absorbe."},
 {q:"Groupe traité +130 %, groupe de comparaison +33 %. L'estimation par différence de différences est de…",o:["+163 points","+97 points","+33 points"],a:1,e:"130 − 33 = 97 points de pourcentage."},
 {q:"Que dit l'hypothèse de tendances parallèles ?",o:["Les deux groupes ont le même niveau","Sans la politique, les deux groupes auraient évolué de la même manière","La politique affecte les deux groupes de la même façon"],a:1,e:"Les niveaux peuvent différer ; les tendances doivent être comparables."},
 {q:"Un test placebo à une date fictive montre un effet important. Que faut-il en conclure ?",o:["La politique a fonctionné deux fois","Quelque chose d'autre que la politique fait bouger les données : prudence","Rien"],a:1,e:"Ici, la pandémie a frappé plus durement les petits voisins ; il faut le signaler comme réserve."},
 {q:"Le détour par trois voisins a compensé environ 9 % des exportations de l'UE perdues vers la Russie. Qu'est-ce que cela dit des sanctions ?",o:["Elles ont complètement échoué","Le détournement était réel mais faible au regard de l'effondrement","Elles n'ont eu aucun effet sur la Russie"],a:1,e:"Les deux titres, « les sanctions échouent » et « aucune fuite », sont faux."}], "quiz");

/* help when stuck */
helpAfter("la-btn","la-fb",()=>({"la-in":"30"}));
helpAfter("aa-btn","aa-fb",()=>({"aa1":gN.toFixed(1),"aa2":gR.toFixed(1),"aa3":DD.toFixed(1)}));

/* boot */
drawCars(); drawES(); drawTR(); if (stA.ok) openFA(); faGuess();
wireCopy(); wireReset();
onRedraw(()=>{ drawCars(); drawES(); drawTR(); });
