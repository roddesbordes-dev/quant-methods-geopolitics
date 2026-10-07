/* Certificate */
const SES=[[1,"Peut-on se fier aux chiffres ?",9],[2,"Peut-on se fier à un sondage ?",8],[3,"Qui dépend de qui ?",8],[4,"Pourquoi la Pologne dépense-t-elle autant, et l'Espagne si peu ?",9],[5,"Pourquoi les voitures allemandes ont-elles afflué au Kirghizstan ?",9],[6,"Combien coûte la fermeture d'Ormuz ?",6]];
const got=n=>{ try { const v=localStorage.getItem("qm"+n+":done"); return v?JSON.parse(v).length:0; } catch(e){ return 0; } };
let all=true;
$("#progTable").innerHTML=`<tr><th>Séance</th><th class="num">Étapes terminées</th><th>Statut</th></tr>`+SES.map(([n,t,k])=>{ const g=Math.min(got(n),k); if (g<k) all=false;
  return `<tr><td><a href="session${n}.html">${n}. ${t}</a></td><td class="num">${g} sur ${k}</td><td>${g>=k?'<span class="chip F">✓ terminée</span>':'<span class="chip PF">en cours</span>'}</td></tr>`; }).join("");
if (all){ $("#unlock").hidden=false; } else { $("#locked").hidden=false; $("#lockedTxt").textContent="Terminez les étapes restantes, indiquées ci-dessus, puis revenez. Chaque étape est cochée dans la barre en haut de la page de sa séance."; }
function make(name){ const d=store.get("date", new Date().toISOString().slice(0,10)); store.set("date",d); store.set("name",name);
  $("#cN").textContent=name; $("#cD").textContent=new Date(d+"T12:00:00").toLocaleDateString("fr-FR",{day:"numeric",month:"long",year:"numeric"}); $("#cC").textContent=learnerCode(name+"|"+d);
  $("#certWrap").hidden=false; }
$("#certBtn").addEventListener("click",()=>{ const n=$("#certName").value.trim(); if (n.length<2) return; make(n); });
$("#printBtn").addEventListener("click",()=>window.print());
const prev=store.get("name",""); if (all && prev){ $("#certName").value=prev; make(prev); }
