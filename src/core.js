/* ===== shared helpers for every session page ===== */
const $ = s => document.querySelector(s), $$ = s => [...document.querySelectorAll(s)];
const NS = "http://www.w3.org/2000/svg";
const PFX = "qm" + (window.SESSION || 0) + ":";
function learnerCode(name){ let h=2166136261; for (const ch of String(name).trim().toLowerCase().replace(/\s+/g," ")){ h^=ch.charCodeAt(0); h=Math.imul(h,16777619); } return "QM-"+(h>>>0).toString(36).toUpperCase().padStart(7,"0"); }
const store = {
  get(k, d){ try { const v = localStorage.getItem(PFX+k); return v === null ? d : JSON.parse(v); } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem(PFX+k, JSON.stringify(v)); } catch(e){} }
};
/* the brief is shared across sessions */
const brief = {
  get(k, d=""){ try { const v = localStorage.getItem("qmbrief:"+k); return v === null ? d : JSON.parse(v); } catch(e){ return d; } },
  set(k, v){ try { localStorage.setItem("qmbrief:"+k, JSON.stringify(v)); } catch(e){} }
};
const css = v => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
const sgn = (v, d=1) => (v>0?"+":v<0?"−":"") + Math.abs(v).toFixed(d);
const num = (v, d=1) => (v<0?"−":"") + Math.abs(v).toFixed(d);

/* ---------- step nav & progress ---------- */
const steps = $$("section.step");
const done = new Set(store.get("done", []));
function markDone(id){ if (done.has(id)) return; done.add(id); store.set("done", [...done]); renderNav(); }
function renderNav(){
  const nav = $("#stepnav"); if (!nav) return;
  nav.innerHTML = steps.map((s,i)=>`<li class="${done.has(s.id)?"done":""}"><a href="#${s.id}"><span class="dot" aria-hidden="true"></span>${i+1}. ${s.dataset.title}<span class="vh">${done.has(s.id)?" (done)":""}</span></a></li>`).join("");
}
renderNav();
/* reading-only steps get a button to mark them as read */
$$("section.step[data-read]").forEach(s=>{ const r=document.createElement("div"); r.className="row";
  r.innerHTML=`<button class="ghost" type="button">Mark as read</button>`; s.appendChild(r);
  const b=r.querySelector("button"); const sync=()=>{ if (done.has(s.id)){ b.textContent="Read ✓"; b.disabled=true; } };
  b.addEventListener("click",()=>{ markDone(s.id); sync(); }); sync(); });

/* ---------- answer checking ---------- */
function feedback(elm, ok, msg){ elm.className = "fb " + (ok ? "ok" : "no"); elm.textContent = msg; }
function readNums(ids){ return ids.map(id => parseFloat(String($("#"+id).value).replace(",", "."))); }

/* ---------- radio-choice lock-in ---------- */
function lockChoice({group, button, key, onReveal}){
  const inputs = $$(`#${group} input`);
  inputs.forEach(i=>i.addEventListener("change",()=>{ if (!store.get(key,null)) $("#"+button).disabled=false; }));
  const apply = v => { inputs.forEach(i=>{ i.checked = i.value===v; i.disabled = true; }); $("#"+button).disabled = true; onReveal(v); };
  $("#"+button).addEventListener("click",()=>{ const v = $(`#${group} input:checked`)?.value; if (!v) return; store.set(key, v); apply(v); });
  const prev = store.get(key, null); if (prev) apply(prev);
}

/* ---------- segmented controls ---------- */
function seg(id, cb){ $$(`#${id} button`).forEach(b=>b.addEventListener("click",()=>{ $$(`#${id} button`).forEach(x=>x.setAttribute("aria-pressed", x===b)); cb(b.dataset.v); })); }

/* ---------- SVG charts ---------- */
function el(tag, attrs={}, parent){ const e = document.createElementNS(NS, tag); for (const k in attrs) e.setAttribute(k, attrs[k]); if (parent) parent.appendChild(e); return e; }
function txt(parent, x, y, s, attrs={}){ const t = el("text", {x, y, ...attrs}, parent); t.textContent = s; return t; }
function niceTicks(min, max, n=5){
  if (max === min){ max = min + 1; }
  const span = max-min, step0 = span/n, mag = Math.pow(10, Math.floor(Math.log10(step0)));
  const err = step0/mag, step = (err>=7.5?10:err>=3.5?5:err>=1.5?2:1)*mag;
  const t=[]; for (let v=Math.ceil(min/step-1e-9)*step; v<=max+1e-9; v+=step) t.push(+v.toFixed(10)); return {ticks:t, step};
}
function shape(g, kind, x, y, r, fill, ring){
  const sw = ring ? 1.5 : 0, st = ring ? css("--panel") : "none";
  if (kind==="tri") return el("path",{d:`M${x},${y-r*1.2} L${x+r*1.1},${y+r*0.8} L${x-r*1.1},${y+r*0.8} Z`,fill,stroke:st,"stroke-width":sw},g);
  if (kind==="sq") return el("rect",{x:x-r*0.9,y:y-r*0.9,width:r*1.8,height:r*1.8,fill,stroke:st,"stroke-width":sw},g);
  if (kind==="dia") return el("path",{d:`M${x},${y-r*1.25} L${x+r*1.1},${y} L${x},${y+r*1.25} L${x-r*1.1},${y} Z`,fill,stroke:st,"stroke-width":sw},g);
  return el("circle",{cx:x,cy:y,r,fill,stroke:st,"stroke-width":sw},g);
}
function frame(container, {title, sub, H=320, m={t:14,r:20,b:34,l:52}}){
  container.innerHTML = "";
  const W = Math.round(Math.max(300, Math.min(900, container.clientWidth - 14)));
  if (W < 480) H = Math.round(H*0.85);
  if (title){ const t=document.createElement("div"); t.className="ct"; t.textContent=title; container.appendChild(t); }
  if (sub){ const s=document.createElement("div"); s.className="cs"; s.textContent=sub; container.appendChild(s); }
  const svg = el("svg",{viewBox:`0 0 ${W} ${H}`,role:"img","aria-label":title||"chart"}); container.appendChild(svg);
  const tip = document.createElement("div"); tip.className="tip"; tip.hidden=true; container.appendChild(tip);
  return {svg, tip, W, H, m, iw:W-m.l-m.r, ih:H-m.t-m.b, narrow: W < 480};
}
function axes(f, xs, ys, {xfmt=v=>v, yfmt=v=>v, xticks=[], yticks=[], xlab, ylab}){
  const g = el("g",{},f.svg);
  for (const v of yticks){ const y=ys(v); el("line",{x1:f.m.l,x2:f.W-f.m.r,y1:y,y2:y,stroke:css("--rule"),"stroke-width":v===0?1.4:1},g); txt(g, f.m.l-8, y+4, yfmt(v), {"text-anchor":"end"}); }
  for (const v of xticks){ txt(g, xs(v), f.H-f.m.b+18, xfmt(v), {"text-anchor":"middle"}); }
  if (xlab) txt(g, f.m.l+f.iw/2, f.H-6, xlab, {"text-anchor":"middle"});
  if (ylab) txt(g, f.m.l, f.m.t-4, ylab, {"text-anchor":"start"});
  return g;
}
function showTip(f, x, y, html){ f.tip.innerHTML=html; f.tip.hidden=false;
  const r=f.svg.getBoundingClientRect(), c=f.svg.parentNode.getBoundingClientRect();
  const px = r.left - c.left + x*r.width/f.W, py = r.top - c.top + y*r.height/f.H;
  f.tip.style.left = Math.min(Math.max(px, 80), c.width-80)+"px"; f.tip.style.top = py+"px"; }
function hideTip(f){ f.tip.hidden=true; }
function hover(f, node, x, y, html){ node.addEventListener("pointerenter",()=>showTip(f,x,y,html)); node.addEventListener("pointerleave",()=>hideTip(f)); }
function legend(container, items){ const lg=document.createElement("div"); lg.className="legend";
  lg.innerHTML = items.map(it=>{ const k=it.kind||"circ", c=it.color;
    const sw = k==="line" ? `<svg width="18" height="12"><path d="M0,6 H18" stroke="${c}" stroke-width="2" ${it.dash?`stroke-dasharray="${it.dash}"`:""}/></svg>`
      : k==="tri" ? `<svg width="12" height="12"><path d="M6,0 L12,11 L0,11Z" fill="${c}"/></svg>`
      : k==="sq" ? `<svg width="12" height="12"><rect x="1" y="1" width="10" height="10" fill="${c}"/></svg>`
      : k==="dia" ? `<svg width="12" height="12"><path d="M6,0 L12,6 L6,12 L0,6Z" fill="${c}"/></svg>`
      : `<svg width="12" height="12"><circle cx="6" cy="6" r="5" fill="${c}"/></svg>`;
    return `<span>${sw}${it.label}</span>`; }).join("");
  container.appendChild(lg); }

/* line chart: series [{name,color,shape,dash,pts:[[x,y]]}] ; x numeric or index with xlabels */
function lineChart(container, {title, sub, series, yfmt=v=>v, xfmt=v=>v, ylab, zero=true, labelEnds=true, tipfmt, H=300, ymin:yminF, ymax:ymaxF, refY, refLabel, xticks:xtF, vline, vlabel}){
  const f = frame(container,{title,sub,H,m:{t:22,r:labelEnds?96:20,b:30,l:52}});
  const all = series.flatMap(s=>s.pts);
  const xmin=Math.min(...all.map(p=>p[0])), xmax=Math.max(...all.map(p=>p[0]));
  let ymin = yminF ?? (zero?Math.min(0,...all.map(p=>p[1])):Math.min(...all.map(p=>p[1]))), ymax = ymaxF ?? Math.max(...all.map(p=>p[1]));
  if (refY!==undefined){ ymin=Math.min(ymin,refY); ymax=Math.max(ymax,refY); }
  const yt = niceTicks(ymin, ymax, 4); ymax = Math.max(ymax, yt.ticks[yt.ticks.length-1]); ymin = Math.min(ymin, yt.ticks[0]);
  const xs = v => f.m.l + (v-xmin)/(xmax-xmin||1)*f.iw, ys = v => f.m.t + f.ih - (v-ymin)/(ymax-ymin)*f.ih;
  const xt = xtF || niceTicks(xmin,xmax,f.narrow?4:6).ticks.filter(v=>v>=xmin&&v<=xmax);
  axes(f, xs, ys, {xticks:xt, yticks:yt.ticks, yfmt, xfmt, ylab});
  if (refY!==undefined){ el("line",{x1:f.m.l,x2:f.m.l+f.iw,y1:ys(refY),y2:ys(refY),stroke:css("--hi"),"stroke-width":2,"stroke-dasharray":"6 4"},f.svg); if (refLabel) txt(f.svg, f.m.l+4, ys(refY)-6, refLabel, {class:"lab"}); }
  if (vline!==undefined){ el("line",{x1:xs(vline),x2:xs(vline),y1:f.m.t,y2:f.m.t+f.ih,stroke:css("--muted"),"stroke-width":1.2,"stroke-dasharray":"4 3"},f.svg); if (vlabel) txt(f.svg, xs(vline)+5, f.m.t+12, vlabel, {class:"lab"}); }
  const g = el("g",{},f.svg);
  for (const s of series){
    el("path",{d:s.pts.map((p,i)=>(i?"L":"M")+xs(p[0])+","+ys(p[1])).join(" "),fill:"none",stroke:s.color,"stroke-width":s.width||2,"stroke-linejoin":"round","stroke-dasharray":s.dash||""},g);
    const last=s.pts[s.pts.length-1];
    if (s.shape) shape(g, s.shape, xs(last[0]), ys(last[1]), 4.5, s.color, true);
    if (labelEnds && s.name){ txt(g, xs(last[0])+9, ys(last[1])+4+(s.nudge||0), s.name, {class:"lab"}); }
  }
  const xsVals=[...new Set(all.map(p=>p[0]))].sort((a,b)=>a-b);
  const cross = el("line",{y1:f.m.t,y2:f.m.t+f.ih,stroke:css("--muted"),"stroke-width":1,"stroke-dasharray":"3 3",visibility:"hidden"},f.svg);
  const hit = el("rect",{x:f.m.l,y:f.m.t,width:f.iw,height:f.ih,fill:"transparent"},f.svg);
  hit.addEventListener("pointermove", ev => { const r=f.svg.getBoundingClientRect(); const sx=(ev.clientX-r.left)*f.W/r.width;
    const xv = xmin + (sx-f.m.l)/f.iw*(xmax-xmin); const near = xsVals.reduce((a,b)=>Math.abs(b-xv)<Math.abs(a-xv)?b:a);
    cross.setAttribute("x1",xs(near)); cross.setAttribute("x2",xs(near)); cross.setAttribute("visibility","visible");
    const lines = series.map(s=>{const p=s.pts.find(q=>q[0]===near); return p?`${s.name||"Value"}: <b>${tipfmt?tipfmt(p[1]):yfmt(p[1])}</b>`:""}).filter(Boolean);
    showTip(f, xs(near), f.m.t+10, `<b>${xfmt(near)}</b><br>${lines.join("<br>")}`); });
  hit.addEventListener("pointerleave", ()=>{cross.setAttribute("visibility","hidden"); hideTip(f);});
  return {f, xs, ys};
}

/* scatter: pts [{x,y,label,color,shape,tip}] ; line {a,b} optional */
function scatter(container, {title, sub, pts, xmin, xmax, ymin, ymax, xticks, yticks, xfmt=v=>v, yfmt=v=>v, xlab, line, lineLabel, labels=true, H=380}){
  const f = frame(container,{title,sub,H,m:{t:16,r:24,b:44,l:52}});
  const xs=v=>f.m.l+(v-xmin)/(xmax-xmin)*f.iw, ys=v=>f.m.t+f.ih-(v-ymin)/(ymax-ymin)*f.ih;
  axes(f,xs,ys,{xticks,yticks,xfmt,yfmt,xlab});
  if (line){ el("path",{d:`M${xs(xmin)},${ys(line.a+line.b*xmin)} L${xs(xmax)},${ys(line.a+line.b*xmax)}`,stroke:css("--hi"),"stroke-width":2,"stroke-dasharray":"6 4",fill:"none"},f.svg);
    if (lineLabel) txt(f.svg, xs(xmin)+6, ys(line.a+line.b*xmin)+(line.b<0?-8:18), lineLabel, {class:"lab"}); }
  const g=el("g",{},f.svg);
  for (const p of pts){
    if (p.res && line) el("line",{x1:xs(p.x),x2:xs(p.x),y1:ys(p.y),y2:ys(line.a+line.b*p.x),stroke:p.color,"stroke-width":1.2,"stroke-dasharray":"2 2"},g);
    shape(g, p.shape||"circ", xs(p.x), ys(p.y), p.r||5.5, p.color, true);
    if (labels && p.label){ const right = xs(p.x) > f.m.l + f.iw*0.8; txt(g, xs(p.x)+(right?-9:9), ys(p.y)+4, p.label, {class:"lab","text-anchor":right?"end":"start"}); }
    const hit=el("circle",{cx:xs(p.x),cy:ys(p.y),r:11,fill:"transparent"},g);
    if (p.tip) hover(f, hit, xs(p.x), ys(p.y), p.tip);
  }
  return {f, xs, ys};
}

/* horizontal bars: rows [{label, v, color, tip, lo, hi}] */
function hbar(container, {title, sub, rows, xmin=0, xmax, xfmt=v=>v, ref, refLabel, rowH=26}){
  const H = 40 + rows.length*rowH + 30;
  const f = frame(container,{title,sub,H,m:{t:16,r:24,b:30,l:Math.min(150, Math.max(80, 7.2*Math.max(...rows.map(r=>r.label.length))+14))}});
  const lo = Math.min(xmin, ...rows.map(r=>Math.min(r.v, r.lo??r.v))), hi = xmax ?? Math.max(...rows.map(r=>Math.max(r.v, r.hi??r.v)));
  const xt = niceTicks(lo, hi, f.narrow?4:6); const x0=xt.ticks[0], x1=Math.max(hi, xt.ticks[xt.ticks.length-1]);
  const xs = v => f.m.l + (v-x0)/(x1-x0)*f.iw, bh = rowH*0.62;
  const g = el("g",{},f.svg);
  for (const v of xt.ticks){ el("line",{x1:xs(v),x2:xs(v),y1:f.m.t,y2:f.m.t+rows.length*rowH,stroke:css("--rule"),"stroke-width":v===0?1.4:1},g); txt(g, xs(v), f.m.t+rows.length*rowH+18, xfmt(v), {"text-anchor":"middle"}); }
  rows.forEach((r,i)=>{ const y=f.m.t+i*rowH+(rowH-bh)/2; const a=xs(Math.min(0,r.v)), b=xs(Math.max(0,r.v));
    if (r.lo!==undefined){ el("rect",{x:xs(r.lo),y:y+bh*0.2,width:Math.max(2,xs(r.hi)-xs(r.lo)),height:bh*0.6,fill:r.color,opacity:.35,rx:2},g); shape(g,"circ",xs(r.v),y+bh/2,4.5,r.color,true); }
    else el("rect",{x:a,y,width:Math.max(1,b-a),height:bh,fill:r.color,rx:2},g);
    txt(g, f.m.l-8, y+bh/2+4, r.label, {"text-anchor":"end", class: r.bold?"lab":""});
    const hit=el("rect",{x:f.m.l,y:f.m.t+i*rowH,width:f.iw,height:rowH,fill:"transparent"},g);
    if (r.tip) hover(f, hit, xs(r.v), y, r.tip); });
  if (ref!==undefined){ el("line",{x1:xs(ref),x2:xs(ref),y1:f.m.t-6,y2:f.m.t+rows.length*rowH,stroke:css("--hi"),"stroke-width":2,"stroke-dasharray":"6 4"},f.svg); if (refLabel) txt(f.svg, xs(ref)+4, f.m.t-4, refLabel, {class:"lab"}); }
  return f;
}

/* vertical bars for a time series (used for honest/dishonest chart lessons) */
function vbar(container,{title,sub,vals,ymin=0,yfmt=v=>v,color,H=280,source}){
  const f=frame(container,{title,sub,H,m:{t:16,r:16,b:30,l:52}});
  const ymax=Math.max(...vals.map(v=>v[1]))*1.08; const yt=niceTicks(ymin,ymax,4);
  const top=Math.max(ymax, yt.ticks[yt.ticks.length-1]);
  const ys=v=>f.m.t+f.ih-(v-ymin)/(top-ymin)*f.ih; const bw=f.iw/vals.length;
  axes(f,i=>i,ys,{yticks:yt.ticks.filter(v=>v>=ymin&&v<=top),yfmt});
  vals.forEach((v,i)=>{ const x=f.m.l+bw*i+bw*0.18, w=bw*0.64, y=ys(v[1]), h=ys(ymin)-y;
    el("path",{d:`M${x},${y+h} V${y+3} Q${x},${y} ${x+3},${y} H${x+w-3} Q${x+w},${y} ${x+w},${y+3} V${y+h} Z`,fill:color},f.svg);
    if (i%2===0||i===vals.length-1) txt(f.svg, x+w/2, f.H-f.m.b+18, v[0], {"text-anchor":"middle"});
    const hit=el("rect",{x:f.m.l+bw*i,y:f.m.t,width:bw,height:f.ih,fill:"transparent"},f.svg);
    hover(f, hit, x+w/2, y, `<b>${v[0]}</b>: ${yfmt(v[1])}`); });
  if (source){ const s=document.createElement("div"); s.className="cs"; s.textContent=source; container.appendChild(s); }
  return f;
}

/* tile-grid map of Europe: tiles {iso: value}; layout fixed */
const TILE = {ISL:[0,0],NOR:[4,0],SWE:[5,0],FIN:[6,0],EST:[7,1],IRL:[1,2],GBR:[2,2],DNK:[4,2],LVA:[7,2],LTU:[7,3],NLD:[3,3],DEU:[4,3],POL:[6,3],BEL:[3,4],LUX:[3,5],CZE:[5,4],SVK:[6,4],FRA:[2,5],CHE:[3,6],AUT:[5,5],HUN:[6,5],ROU:[7,5],PRT:[0,7],ESP:[1,7],ITA:[4,7],SVN:[4,6],HRV:[5,6],MNE:[5,7],ALB:[6,8],MKD:[7,8],BGR:[7,6],GRC:[7,9],MLT:[4,9],CYP:[9,9]};
function tileMap(container,{title,sub,vals,names,fmt=v=>v,lo,hi,note}){
  container.innerHTML="";
  const t=document.createElement("div"); t.className="ct"; t.textContent=title; container.appendChild(t);
  if (sub){ const s=document.createElement("div"); s.className="cs"; s.textContent=sub; container.appendChild(s); }
  const W=10, Hh=10, cell=44, svg=el("svg",{viewBox:`0 0 ${W*cell} ${Hh*cell}`,role:"img","aria-label":title}); container.appendChild(svg);
  const tip=document.createElement("div"); tip.className="tip"; tip.hidden=true; container.appendChild(tip);
  const f={svg,tip,W:W*cell,H:Hh*cell};
  const vv=Object.values(vals).filter(v=>v!=null); lo=lo??Math.min(...vv); hi=hi??Math.max(...vv);
  for (const iso in TILE){ const [cx,cy]=TILE[iso]; const v=vals[iso];
    const tshare = v==null ? null : (v-lo)/(hi-lo||1);
    const fill = v==null ? css("--soft") : `color-mix(in oklab, ${css("--accent")} ${Math.round(12+tshare*78)}%, ${css("--panel")})`;
    const r=el("rect",{x:cx*cell+2,y:cy*cell+2,width:cell-4,height:cell-4,rx:4,fill,stroke:css("--rule")},svg);
    const dark = tshare!=null && tshare>0.55;
    const a=el("text",{x:cx*cell+cell/2,y:cy*cell+18,"text-anchor":"middle",style:`font-size:11px;font-weight:600;fill:${dark?"#fff":css("--ink")}`},svg); a.textContent=iso;
    if (v!=null){ const b=el("text",{x:cx*cell+cell/2,y:cy*cell+33,"text-anchor":"middle",style:`font-size:10px;font-family:var(--f-mono);fill:${dark?"#fff":css("--ink2")}`},svg); b.textContent=fmt(v); }
    hover(f, r, cx*cell+cell/2, cy*cell+4, `<b>${names?.[iso]||iso}</b>${v!=null?": "+fmt(v):": no data"}`);
  }
  if (note){ const s=document.createElement("div"); s.className="cs"; s.textContent=note; container.appendChild(s); }
}

/* ---------- copy buttons ---------- */
function wireCopy(){ $$("[data-copy]").forEach(b=>b.addEventListener("click",()=>{ const ta=$("#"+b.dataset.copy), out=$(`[data-copied="${b.dataset.copy}"]`);
  const fallback=()=>{ ta.focus(); ta.select(); if (out) out.textContent="Selected: press Ctrl+C or Cmd+C."; };
  try { navigator.clipboard.writeText(ta.value).then(()=>{ if (out) out.textContent="Copied."; },fallback); } catch(e){ fallback(); } })); }

/* ---------- quiz ---------- */
function quiz(box, scoreEl, QUIZ, stepId){
  let qa = store.get("quiz",{});
  const draw = () => {
    box.innerHTML = QUIZ.map((q,i)=>`<div class="box"><p style="margin-top:0"><strong>${i+1}. ${q.q}</strong></p><div class="choice">${q.o.map((o,j)=>`<label><input type="radio" name="qz${i}" value="${j}" ${qa[i]===j?"checked":""} ${qa[i]!==undefined?"disabled":""}> ${o}</label>`).join("")}</div>${qa[i]!==undefined?`<p class="fb ${qa[i]===q.a?"ok":"no"}">${qa[i]===q.a?"Right. ":"Not quite. "}${q.e}</p>`:""}</div>`).join("");
    $$("#"+box.id+" input").forEach(i=>i.addEventListener("change",()=>{ qa[+i.name.slice(2)]=+i.value; store.set("quiz",qa); draw(); }));
    const n=Object.keys(qa).length, s=QUIZ.filter((q,i)=>qa[i]===q.a).length;
    scoreEl.textContent = n===QUIZ.length ? `Score: ${s} out of ${QUIZ.length}.` : "";
    if (n===QUIZ.length) markDone(stepId);
  };
  draw();
}

/* ---------- brief text areas (saved across sessions) ---------- */
function wireBrief(){ $$("[data-brief]").forEach(t=>{ t.value = brief.get(t.dataset.brief, ""); t.addEventListener("input",()=>brief.set(t.dataset.brief, t.value)); }); }

/* ---------- reset ---------- */
function wireReset(){ const b=$("#resetBtn"); if (!b) return; b.addEventListener("click",()=>{ try{ Object.keys(localStorage).filter(k=>k.startsWith(PFX)).forEach(k=>localStorage.removeItem(k)); }catch(e){} location.reload(); }); }

/* ---------- redraw hooks ---------- */
function onRedraw(fn){
  try { matchMedia("(prefers-color-scheme: dark)").addEventListener("change", fn); new MutationObserver(fn).observe(document.documentElement,{attributes:true,attributeFilter:["data-theme"]}); } catch(e){}
  let rz, lastW=innerWidth; addEventListener("resize",()=>{ if (innerWidth===lastW) return; lastW=innerWidth; clearTimeout(rz); rz=setTimeout(fn,200); });
}
