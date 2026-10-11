const $ = s => document.querySelector(s);
const C = Object.assign({whatsapp:"59177579228", inicio:"2025-03-21", admin:"251208", supabaseUrl:"", supabaseKey:""}, window.CONFIG || {});
const esc = t => String(t).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));

// ===== Nube (Supabase): guarda textos, fotos y video para todos los celulares =====
const K = !!(C.supabaseUrl && C.supabaseKey);
const H = {apikey: C.supabaseKey, Authorization: "Bearer " + C.supabaseKey};
const PUB = C.supabaseUrl + "/storage/v1/object/public/medios/";
let S = {
  opc: [{e:"🗣️",t:"Hoy quiero que me cuentes tu día"},{e:"🤗",t:"Hoy quiero un abrazo"},{e:"😘",t:"Hoy quiero un beso"},{e:"📞",t:"Hoy quiero una llamada"}],
  carr: [], video: "",
  alb: {recuerdos: ["Carnavales","San Juan","Halloween","Navidad","Año Nuevo","Todos Santos","Semana Santa"].map(n => ({n, f: []})),
        viajes: [{n:"Nuestros viajes", f: []}], lindas: [{n:"Fotos lindas", f: []}]}
};
function aviso(t, ms) { const a = $("#aviso"); a.textContent = t; a.style.display = t ? "block" : "none"; if (ms) setTimeout(() => a.style.display = "none", ms); }
async function cargar() {
  try {
    if (!K) return JSON.parse(localStorage.getItem("estado"));
    const r = await fetch(`${C.supabaseUrl}/rest/v1/contenido?clave=eq.estado&select=valor`, {headers: H});
    const j = await r.json(); return j[0] && j[0].valor;
  } catch (e) { return null; }
}
async function guardar() {
  if (!K) { try { localStorage.setItem("estado", JSON.stringify(S)); } catch (e) {} return; }
  try {
    const r = await fetch(`${C.supabaseUrl}/rest/v1/contenido`, {method:"POST", headers:{...H,"Content-Type":"application/json",Prefer:"resolution=merge-duplicates,return=minimal"}, body: JSON.stringify({clave:"estado", valor:S})});
    if (!r.ok) throw 0;
  } catch (e) { alert("No se pudo guardar. Revisa tu internet y la configuración."); }
}
async function reducir(f) {
  if (!f.type.startsWith("image/") || f.type === "image/gif") return {b: f, ext: (f.name.split(".").pop() || "bin").toLowerCase()};
  try {
    const im = await createImageBitmap(f), r = Math.min(1, 1600 / Math.max(im.width, im.height));
    const c = document.createElement("canvas"); c.width = im.width * r; c.height = im.height * r;
    c.getContext("2d").drawImage(im, 0, 0, c.width, c.height);
    return {b: await new Promise(ok => c.toBlob(ok, "image/jpeg", .85)), ext: "jpg"};
  } catch (e) { return {b: f, ext: "jpg"}; }
}
async function subir(f) {
  if (!K) { alert("Primero conecta Supabase (mira el README) para guardar fotos y videos."); return null; }
  if (f.size > 50e6) { alert("Ese archivo pesa más de 50 MB. Usa uno más liviano."); return null; }
  const {b, ext} = await reducir(f), n = Date.now() + Math.random().toString(36).slice(2, 6) + "." + ext;
  let r;
  try { r = await fetch(`${C.supabaseUrl}/storage/v1/object/medios/${n}`, {method:"POST", headers:{...H,"Content-Type":b.type || "application/octet-stream"}, body: b}); }
  catch (e) { alert("No hay conexión con Supabase. Revisa tu internet y la URL en config.js."); return null; }
  if (!r.ok) { let m = ""; try { m = (await r.json()).message || ""; } catch (e) {} alert("No se pudo subir (error " + r.status + "): " + m); return null; }
  return PUB + n;
}
function borrarArchivo(u) { if (K && u.startsWith(PUB)) fetch(`${C.supabaseUrl}/storage/v1/object/medios/${u.slice(PUB.length)}`, {method:"DELETE", headers:H}).catch(() => {}); }
async function subirVarios(files) { const out = []; for (const [i, f] of [...files].entries()) { aviso(`Subiendo ${i + 1} de ${files.length}...`); const u = await subir(f); if (u) out.push(u); } aviso("", 0); return out; }

// ===== Contador =====
function tiempo() {
  const a = new Date(C.inicio + "T00:00:00"), n = new Date();
  let y = n.getFullYear() - a.getFullYear(), m = n.getMonth() - a.getMonth(), d = n.getDate() - a.getDate();
  if (d < 0) { m--; d += new Date(n.getFullYear(), n.getMonth(), 0).getDate(); }
  if (m < 0) { y--; m += 12; }
  $("#t-total").textContent = Math.floor((n - a) / 864e5);
  $("#t-y").textContent = y; $("#t-m").textContent = m; $("#t-d").textContent = d;
}

// ===== WhatsApp con letra cursiva + emojis =====
const F = t => [...t.normalize("NFD")].map(c => { const k = c.charCodeAt(0);
  return k >= 65 && k <= 90 ? String.fromCodePoint(0x1D4D0 + k - 65) : k >= 97 && k <= 122 ? String.fromCodePoint(0x1D4EA + k - 97) : c; }).join("");
const enviar = t => window.open(`https://wa.me/${C.whatsapp}?text=${encodeURIComponent(`💖✨ ${F("Mi amor")} ✨💖\n\n🌙⭐ ${F(t)} ⭐🌙\n\n💌 ${F("Con amor, Kheyani")} 💞🌹`)}`, "_blank");

// ===== Frases =====
const FRASES = ["Eres la luna que ilumina mis noches y la estrella que guía mis días.","Contigo aprendí que el amor también se escribe en las cosas pequeñas.","Si me preguntan por mi lugar favorito, pienso en tu abrazo.","Cada día a tu lado es mi mejor casualidad.","Gracias por ser mi calma cuando el mundo hace ruido.","Tu sonrisa es mi parte favorita de cada día.","Entre todas las estrellas del cielo, yo te elegí a ti.","Contigo hasta lo simple se vuelve especial.","Eres mi hoy, mi mañana y todos mis ojalá.","Mi corazón encontró en ti su hogar."];
let fi = Math.floor(Date.now() / 864e5) % FRASES.length;
const rFrase = () => $("#frase").textContent = "“" + FRASES[fi] + "”";
$("#otraFrase").onclick = () => { fi = (fi + 1) % FRASES.length; rFrase(); };

// ===== Corazoncitos al tocar botones =====
document.addEventListener("click", e => {
  if (!e.target.closest("button,.btn,.bola,.nav-link") || matchMedia("(prefers-reduced-motion:reduce)").matches) return;
  for (let i = 0; i < 5; i++) {
    const s = document.createElement("span"); s.className = "cor"; s.textContent = ["💖","💗","💕","❤️"][i % 4];
    s.style.cssText = `left:${e.clientX - 8}px;top:${e.clientY - 8}px;font-size:${14 + Math.random() * 8}px;--dx:${Math.random() * 80 - 40}px;animation-delay:${i * 60}ms`;
    document.body.appendChild(s); setTimeout(() => s.remove(), 1500);
  }
}, true);

// ===== Pintar =====
const MOODS = [["😊","Feliz"],["😢","Triste"],["😣","Estresado"],["😰","Ansioso"],["😠","Enojado"],["✨","Otro"]];
$("#moods").innerHTML = MOODS.map((m, i) => `<button class="bola" data-mo="${i}"><span>${m[0]}</span>${m[1]}</button>`).join("");
const rOps = () => $("#ops").innerHTML = S.opc.map((o, i) => `<div class="d-flex gap-2"><button class="btn-op" data-op="${i}">${o.e} ${esc(o.t)}</button><button class="btn btn-danger adm" data-dop="${i}">✕</button></div>`).join("");
function rCar() {
  const h = [...(C.carrusel || []), ...S.carr].map((u, i) => `<div class="carousel-item ${i ? "" : "active"}"><img src="${u}" class="d-block mx-auto" alt="Foto de amor"></div>`).join("");
  $("#slides").innerHTML = h || `<div class="carousel-item active"><div class="ph">💕 Aquí irán nuestras fotos de amor 💕</div></div>`;
  $("#carAdm").innerHTML = S.carr.map((u, i) => `<button class="btn btn-sm btn-outline-light m-1" data-dc="${i}">✕ foto ${i + 1}</button>`).join("");
}
function rAlb(sec) {
  $("#g-" + sec).innerHTML = S.alb[sec].map((a, i) => {
    const th = a.f.map(u => `<div class="th ${sec === "lindas" ? "heart" : ""}"><img src="${u}" loading="lazy" alt=""><button class="x adm" data-df="${sec}|${i}|${esc(u)}">✕</button></div>`).join("");
    return `<div class="col-12 col-md-6 col-lg-4"><div class="frame"><h5>${esc(a.n)}</h5><div class="ths">${th || '<p class="vacio">💕 Aquí irán tus fotos</p>'}</div>
      <div class="adm"><label class="btn btn-sm btn-light">＋ Foto<input type="file" accept="image/*" multiple hidden data-up="${sec}|${i}"></label>
      <button class="btn btn-sm btn-warning" data-ra="${sec}|${i}">✏️</button> <button class="btn btn-sm btn-danger" data-da="${sec}|${i}">🗑</button></div></div></div>`;
  }).join("");
}
const rVid = () => $("#vbox").innerHTML = (S.video || C.video) ? `<video controls playsinline src="${S.video || C.video}"></video>` : `<div class="ph">🎬 Aquí irá nuestro video 💞</div>`;
const todo = () => { tiempo(); rFrase(); rOps(); rCar(); ["recuerdos","viajes","lindas"].forEach(rAlb); rVid(); };

// ===== Clics =====
document.addEventListener("click", async e => {
  const t = e.target.closest("button"); if (!t) return; const d = t.dataset;
  if (d.op !== undefined) enviar(+d.op < 0 ? "Hola mi amor, quiero hablar contigo" : S.opc[+d.op].t);
  if (d.mo !== undefined) { let x = MOODS[+d.mo][1]; if (+d.mo === 5) { x = prompt("¿Cómo te sientes hoy?"); if (!x) return; } enviar("Hoy me siento " + x.toLowerCase()); }
  if (d.dop !== undefined && confirm("¿Quitar esta opción?")) { S.opc.splice(+d.dop, 1); rOps(); await guardar(); }
  if (t.id === "addOp") { const x = prompt("Escribe la nueva opción (ej: Hoy quiero un audio)"); if (x) { S.opc.push({e: prompt("Un emoji", "💕") || "💕", t: x}); rOps(); await guardar(); } }
  if (d.dc !== undefined) { borrarArchivo(S.carr.splice(+d.dc, 1)[0]); rCar(); await guardar(); }
  if (d.na) { const n = prompt("Nombre del cuadro"); if (n) { S.alb[d.na].push({n, f: []}); rAlb(d.na); await guardar(); } }
  if (d.ra) { const [s, i] = d.ra.split("|"), n = prompt("Nuevo nombre", S.alb[s][i].n); if (n) { S.alb[s][i].n = n; rAlb(s); await guardar(); } }
  if (d.da && confirm("¿Borrar este cuadro con sus fotos?")) { const [s, i] = d.da.split("|"); S.alb[s].splice(+i, 1)[0].f.forEach(borrarArchivo); rAlb(s); await guardar(); }
  if (d.df) { const [s, i, u] = d.df.split("|"); S.alb[s][i].f = S.alb[s][i].f.filter(x => x !== u); borrarArchivo(u); rAlb(s); await guardar(); }
  if (t.id === "delVid" && S.video && confirm("¿Quitar el video?")) { borrarArchivo(S.video); S.video = ""; rVid(); await guardar(); }
});
document.addEventListener("change", async e => {
  const el = e.target; if (el.type !== "file" || !el.files.length) return;
  const us = await subirVarios(el.files);
  if (el.id === "upCar") { S.carr.push(...us); rCar(); }
  else if (el.id === "upVid") { if (us[0]) { borrarArchivo(S.video); S.video = us[0]; rVid(); } }
  else if (el.dataset.up) { const [s, i] = el.dataset.up.split("|"); S.alb[s][i].f.push(...us); rAlb(s); }
  if (us.length) { await guardar(); aviso("✅ Guardado", 1500); }
  el.value = "";
});

// ===== Admin =====
const modal = new bootstrap.Modal($("#mAdmin"));
$("#btnAdmin").onclick = () => { if (document.body.classList.contains("admin")) { document.body.classList.remove("admin"); $("#btnAdmin").textContent = "🔐 Admin"; return; } $("#inCod").value = ""; $("#err").textContent = ""; modal.show(); };
const entrar = () => { if ($("#inCod").value === C.admin) { document.body.classList.add("admin"); $("#btnAdmin").textContent = "🔓 Salir"; modal.hide(); } else $("#err").textContent = "Código incorrecto"; };
$("#okCod").onclick = entrar; $("#inCod").addEventListener("keydown", e => { if (e.key === "Enter") entrar(); });

// ===== Inicio =====
todo(); setInterval(tiempo, 60000);
cargar().then(g => { if (g) { S = Object.assign(S, g); todo(); } });
