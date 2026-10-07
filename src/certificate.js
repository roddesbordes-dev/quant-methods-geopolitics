/* Certificate */
const SES=[[1,"Can we trust the numbers?",9],[2,"Can we trust a poll?",9],[3,"Who depends on whom?",9],[4,"Why does Poland spend so much, and Spain so little?",10],[5,"Why did German cars flood into Kyrgyzstan?",10],[6,"What does the Hormuz closure cost?",7]];
const got=n=>{ try { const v=localStorage.getItem("qm"+n+":done"); return v?JSON.parse(v).length:0; } catch(e){ return 0; } };
let all=true;
$("#progTable").innerHTML=`<tr><th>Session</th><th class="num">Steps done</th><th>Status</th></tr>`+SES.map(([n,t,k])=>{ const g=Math.min(got(n),k); if (g<k) all=false;
  return `<tr><td><a href="session${n}.html">${n}. ${t}</a></td><td class="num">${g} of ${k}</td><td>${g>=k?'<span class="chip F">✓ complete</span>':'<span class="chip PF">in progress</span>'}</td></tr>`; }).join("");
if (all){ $("#unlock").hidden=false; } else { $("#locked").hidden=false; $("#lockedTxt").textContent="Finish the remaining steps, shown above, then come back. Each step is ticked in the bar at the top of its session page."; }
function code(s){ let h=2166136261; for (const c of s){ h^=c.charCodeAt(0); h=Math.imul(h,16777619); } return "QM-"+(h>>>0).toString(36).toUpperCase().padStart(7,"0"); }
function make(name){ const d=store.get("date", new Date().toISOString().slice(0,10)); store.set("date",d); store.set("name",name);
  $("#cN").textContent=name; $("#cD").textContent=new Date(d+"T12:00:00").toLocaleDateString("en-GB",{day:"numeric",month:"long",year:"numeric"}); $("#cC").textContent=code(name+"|"+d);
  $("#certWrap").hidden=false; }
$("#certBtn").addEventListener("click",()=>{ const n=$("#certName").value.trim(); if (n.length<2) return; make(n); });
$("#printBtn").addEventListener("click",()=>window.print());
const prev=store.get("name",""); if (all && prev){ $("#certName").value=prev; make(prev); }
