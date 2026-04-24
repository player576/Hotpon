import { useState, useRef, useEffect } from "react";

const HOTPON_VERSION = "2.0";

const COLORS = {
  оранжевый:"#ff6b35", красный:"#ef4444", синий:"#3b82f6", зеленый:"#22c55e",
  желтый:"#eab308", белый:"#e8e8f0", фиолетовый:"#a855f7", голубой:"#06b6d4",
  розовый:"#ec4899", серый:"#6b7280", черный:"#111114", бирюзовый:"#14b8a6",
  лайм:"#84cc16", индиго:"#6366f1", янтарный:"#f59e0b", коралловый:"#f43f5e",
  радужный:"rainbow",
};

function resolveColor(name, fallback="#ff6b35") {
  if (!name) return fallback;
  const k = name.trim().toLowerCase();
  return COLORS[k] || (k.startsWith("#") ? k : fallback);
}

function RainbowText({ children, style={} }) {
  return (
    <span style={{
      background:"linear-gradient(90deg,#ff6b35,#eab308,#22c55e,#06b6d4,#3b82f6,#a855f7,#ec4899)",
      WebkitBackgroundClip:"text", WebkitTextFillColor:"transparent",
      backgroundSize:"200%", animation:"rainbow 3s linear infinite",
      ...style,
    }}>{children}</span>
  );
}

const COLOR_THEMES = {
  "тёмный":    { bg:"#0d0d0f", card:"#111114", border:"#2a2a30", text:"#e8e8f0" },
  "светлый":   { bg:"#f5f5f5", card:"#ffffff", border:"#e0e0e0", text:"#111114" },
  "синий":     { bg:"#070d1a", card:"#0a1228", border:"#1a2a45", text:"#e8e8f0" },
  "зелёный":   { bg:"#051a0a", card:"#081f0d", border:"#0f3018", text:"#e8e8f0" },
  "фиолетовый":{ bg:"#0d070f", card:"#160b1a", border:"#2a1535", text:"#e8e8f0" },
  "розовый":   { bg:"#1a070e", card:"#200a12", border:"#3a1020", text:"#e8e8f0" },
};

const STARTER_FILES = [
  { id:1, name:"main.hot", code:
`Hotpon = start

Технология диалог

Диалог = технология диалог
На экране [Привет! Это Hotpon v2.0 🔥]
После команды dale
На экране [Теперь здесь есть всё!]
После команды dale
На экране [Рисовалка, браузер, календарь и многое другое.]

Hotpon = stop` },
  { id:2, name:"draw.hot", code:
`Hotpon = start

Технология карандаш
Технология ластик
Технология холст

[Цвета]{черный [Кнопка]} {красный [Кнопка]} {синий [Кнопка]} {зеленый [Кнопка]} {фиолетовый [Кнопка]} {радужный [Кнопка]}
Цвет холста = [белый]
Размер холста = [большой]

Hotpon = stop` },
  { id:3, name:"calendar.hot", code:
`Hotpon = start

Технология календарь

Цвет заголовка = [радужный]
Цвет дней = [белый]
Цвет выходных = [красный]
Цвет сегодня = [оранжевый]

Событие = [1.5] [День Hotpon! 🔥] [оранжевый]

Hotpon = stop` },
  { id:4, name:"browser.hot", code:
`Hotpon = start

Технология браузер

Браузер = домашняя страница [home]
Браузер цвет = [фиолетовый]
Браузер закладка = [🏠 Главная] [home]
Браузер закладка = [🎨 О Hotpon] [about]

Hotpon = stop` },
  { id:5, name:"home.страница", code:
`Страница = home
Заголовок = [🔥 Добро пожаловать в Hotpon!]
Цвет фона = [тёмный]
Цвет акцента = [радужный]
Цвет текста = [белый]

Текст = [Это твой мини-интернет, написанный на Hotpon.]
Разделитель
Кнопка = [🎨 О Hotpon] [about] [оранжевый]` },
  { id:6, name:"about.страница", code:
`Страница = about
Заголовок = [🎨 О языке Hotpon]
Цвет фона = [фиолетовый]
Цвет акцента = [голубой]
Цвет текста = [белый]

Заголовок 2 = [Что умеет Hotpon v2.0?]
Текст = [— Рисовалка с кистями]
Текст = [— Диалоги с командой dale]
Текст = [— Календарь с событиями]
Текст = [— Мини-браузер со своими страницами]
Разделитель
Кнопка = [← Назад] [home] [фиолетовый]` },
];

// ─── Save/Load ────────────────────────────────────────────────────────────────
function downloadBlob(content, filename, mime) {
  try {
    const blob = new Blob([content], { type: mime });
    const url  = URL.createObjectURL(blob);
    // Try anchor click (desktop)
    const a = document.createElement("a");
    a.href = url; a.download = filename;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(() => URL.revokeObjectURL(url), 2000);
    return true;
  } catch(e) {
    // Fallback: open in new tab (mobile)
    try {
      const dataUrl = "data:application/octet-stream;charset=utf-8," + encodeURIComponent(content);
      window.open(dataUrl, "_blank");
      return true;
    } catch(e2) { return false; }
  }
}

function saveProject(files) {
  const json = JSON.stringify({ version: HOTPON_VERSION, files }, null, 2);
  return downloadBlob(json, "project.hot", "application/json");
}

function loadProject(onLoad) {
  const input = document.createElement("input");
  input.type  = "file";
  input.accept = ".hot,application/json";
  input.onchange = e => {
    const f = e.target.files[0];
    if (!f) return;
    const r = new FileReader();
    r.onload = ev => {
      try { onLoad(JSON.parse(ev.target.result)); }
      catch { alert("Ошибка файла"); }
    };
    r.readAsText(f);
  };
  document.body.appendChild(input);
  input.click();
  document.body.removeChild(input);
}

// ─── Parser ───────────────────────────────────────────────────────────────────
function parseProgram(code) {
  const lines = code.split("\n").map(l => l.trim()).filter(Boolean);
  const si = lines.findIndex(l => l.toLowerCase() === "hotpon = start");
  const ei = lines.findIndex(l => l.toLowerCase() === "hotpon = stop" || l.toLowerCase() === "hotpon = stop + start");
  if (si === -1) return { errors: ["Нет 'Hotpon = start'"] };
  if (ei === -1) return { errors: ["Нет 'Hotpon = stop'"] };
  const cl = lines.slice(si + 1, ei);

  const hasPencil   = cl.some(l => l.toLowerCase() === "технология карандаш");
  const hasEraser   = cl.some(l => l.toLowerCase() === "технология ластик");
  const hasCanvas   = cl.some(l => l.toLowerCase() === "технология холст");
  const hasDialog   = cl.some(l => l.toLowerCase() === "технология диалог");
  const hasCalendar = cl.some(l => l.toLowerCase() === "технология календарь");
  const hasBrowser  = cl.some(l => l.toLowerCase() === "технология браузер");
  const canDownload = cl.some(l => l.toLowerCase() === "возможность скачать");

  let colors = [];
  const cline = cl.find(l => /^\[цвета\]/i.test(l));
  if (cline) colors = [...cline.matchAll(/\{([^}]+)\s+\[Кнопка\]\}/gi)].map(m => m[1].trim().toLowerCase());

  let canvasColor = "#ffffff", canvasSize = "средний";
  cl.forEach(l => {
    const cc = l.match(/^Цвет холста\s*=\s*\[(.+)\]$/i); if (cc) canvasColor = resolveColor(cc[1], "#ffffff");
    const cs = l.match(/^Размер холста\s*=\s*\[(.+)\]$/i); if (cs) canvasSize = cs[1].trim().toLowerCase();
  });

  const calConfig = { headerColor:"#ff6b35", daysColor:"#e8e8f0", weekendColor:"#ef4444", todayColor:"#ff6b35", headerRainbow:false, events:[] };
  if (hasCalendar) cl.forEach(l => {
    const hc = l.match(/^Цвет заголовка\s*=\s*\[(.+)\]$/i); if (hc) { calConfig.headerRainbow = hc[1].trim().toLowerCase() === "радужный"; calConfig.headerColor = resolveColor(hc[1]); }
    const dc = l.match(/^Цвет дней\s*=\s*\[(.+)\]$/i);      if (dc) calConfig.daysColor    = resolveColor(dc[1]);
    const wc = l.match(/^Цвет выходных\s*=\s*\[(.+)\]$/i);  if (wc) calConfig.weekendColor = resolveColor(wc[1]);
    const tc = l.match(/^Цвет сегодня\s*=\s*\[(.+)\]$/i);   if (tc) calConfig.todayColor   = resolveColor(tc[1]);
    const ev = l.match(/^Событие\s*=\s*\[(\d+)\.(\d+)\]\s*\[(.+)\]\s*(?:\[(.+)\])?$/i);
    if (ev) calConfig.events.push({ day:+ev[1], month:+ev[2], text:ev[3], color:resolveColor(ev[4] || "оранжевый") });
  });

  const browserConfig = { home:"home", accentColor:"#ff6b35", accentRainbow:false, bookmarks:[] };
  if (hasBrowser) cl.forEach(l => {
    const h  = l.match(/^Браузер\s*=\s*домашняя страница\s*\[(.+)\]$/i); if (h)  browserConfig.home = h[1].trim();
    const bc = l.match(/^Браузер цвет\s*=\s*\[(.+)\]$/i);                if (bc) { browserConfig.accentRainbow = bc[1].trim().toLowerCase() === "радужный"; browserConfig.accentColor = resolveColor(bc[1]); }
    const bm = l.match(/^Браузер закладка\s*=\s*\[(.+)\]\s*\[(.+)\]$/i); if (bm) browserConfig.bookmarks.push({ name:bm[1].trim(), url:bm[2].trim() });
  });

  const dialogs = [];
  if (hasDialog) {
    let i = 0;
    while (i < cl.length) {
      if (/^диалог\s*=\s*технология диалог$/i.test(cl[i])) {
        const messages = []; i++;
        while (i < cl.length && !/^(hotpon|технология|диалог\s*=)/i.test(cl[i])) {
          const m = cl[i].match(/^на экране\s+\[(.+)\]$/i); if (m) messages.push(m[1]);
          i++;
        }
        dialogs.push({ messages });
      } else i++;
    }
  }

  const consoleSteps = [];
  if (!hasCanvas && !hasDialog && !hasCalendar && !hasBrowser) {
    for (const line of cl) {
      if (/^(hotpon|технология|диалог|\[цвета\]|кнопки|возможность|цвет|событие|браузер|календарь)/i.test(line)) continue;
      const pt  = line.match(/^на экране\s+\[(.+)\]$/i); if (pt)  { consoleSteps.push({ type:"print",    value:pt[1] });          continue; }
      const pv  = line.match(/^на экране\s+\{([^}]+)\}$/i); if (pv) { consoleSteps.push({ type:"printVar", varName:pv[1].trim() }); continue; }
      const inp = line.match(/^ввод пользователя\s+\{([^}]+)\}$/i); if (inp) { consoleSteps.push({ type:"input", varName:inp[1].trim() }); continue; }
    }
  }

  return { errors:[], hasCanvas, hasPencil, hasEraser, hasDialog, hasCalendar, hasBrowser, canDownload, colors, canvasColor, canvasSize, calConfig, browserConfig, dialogs, consoleSteps };
}

function parsePage(code) {
  if (!code || !code.trim()) return null;
  const lines = code.split("\n").map(l => l.trim()).filter(Boolean);
  const idLine = lines.find(l => /^Страница\s*=/i.test(l));
  if (!idLine) return null;
  const idMatch = idLine.match(/^Страница\s*=\s*(.+)$/i);
  if (!idMatch) return null;
  const id = idMatch[1].trim();
  let accentRainbow = false, accent = "#ff6b35", textColor = "#e8e8f0";
  const theme = COLOR_THEMES["тёмный"]; let bg = theme.bg, card = theme.card, border = theme.border;
  const blocks = [];
  for (const line of lines) {
    const h1  = line.match(/^Заголовок\s*=\s*\[(.+)\]$/i);       if (h1)  { blocks.push({ type:"h1",      text:h1[1]  }); continue; }
    const h2  = line.match(/^Заголовок 2\s*=\s*\[(.+)\]$/i);     if (h2)  { blocks.push({ type:"h2",      text:h2[1]  }); continue; }
    const txt = line.match(/^Текст\s*=\s*\[(.+)\]$/i);           if (txt) { blocks.push({ type:"text",    text:txt[1] }); continue; }
    const btn = line.match(/^Кнопка\s*=\s*\[(.+)\]\s*\[(.+)\]\s*(?:\[(.+)\])?$/i);
    if (btn) { blocks.push({ type:"button", text:btn[1], url:btn[2], color:resolveColor(btn[3]||"оранжевый"), rainbow:btn[3]?.trim().toLowerCase()==="радужный" }); continue; }
    const div = line.match(/^Разделитель$/i);                     if (div) { blocks.push({ type:"divider" }); continue; }
    const ac  = line.match(/^Цвет акцента\s*=\s*\[(.+)\]$/i);    if (ac)  { accentRainbow = ac[1].trim().toLowerCase() === "радужный"; accent = resolveColor(ac[1]); }
    const tc  = line.match(/^Цвет текста\s*=\s*\[(.+)\]$/i);     if (tc)  textColor = resolveColor(tc[1], "#e8e8f0");
    const bg_ = line.match(/^Цвет фона\s*=\s*\[(.+)\]$/i);       if (bg_) { const t = COLOR_THEMES[bg_[1].trim().toLowerCase()]; if (t) { bg=t.bg; card=t.card; border=t.border; } }
  }
  return { id, accent, accentRainbow, textColor, bg, card, border, blocks };
}

// ─── ProjectBar ───────────────────────────────────────────────────────────────
function ProjectBar({ files, onLaunch, extraHandler, showProject }) {
  const [val, setVal] = useState(""); const [msg, setMsg] = useState(""); const [mt, setMt] = useState("ok");
  const flash = (t, type="ok") => { setMsg(t); setMt(type); setTimeout(() => setMsg(""), 2000); };
  const col = t => ({ ok:"#4ade80", err:"#ff4444", info:"#60a5fa" }[t] || "#888");
  const hk = e => {
    if (e.key !== "Enter") return;
    const cmd = val.trim(); setVal(""); if (!cmd) return;
    if (showProject) {
      const m = cmd.match(/^project\s+\[(.+)\]$/i);
      if (m) { const nm=m[1].trim(); const f=files.find(f=>f.name.toLowerCase()===nm.toLowerCase()||f.name.toLowerCase()===nm.toLowerCase()+".hot"); if(f){flash(`▶ ${f.name}`,"ok");setTimeout(()=>onLaunch(f),300);}else flash(`"${nm}" не найден`,"err"); return; }
      if (cmd.toLowerCase()==="list") { flash(files.filter(f=>f.name.endsWith(".hot")).map(f=>f.name).join("  ·  "),"info"); return; }
    }
    if (extraHandler) extraHandler(cmd, flash);
  };
  return (
    <div style={{ borderTop:"1px solid #1e1e22", background:"#090909", flexShrink:0 }}>
      {msg && <div style={{ padding:"4px 16px", fontSize:11, fontFamily:"'Courier New',monospace", color:col(mt), borderBottom:"1px solid #111" }}>{msg}</div>}
      <div style={{ display:"flex", alignItems:"center", padding:"8px 14px", gap:8 }}>
        <span style={{ color:"#ff6b35", fontSize:13, flexShrink:0 }}>$</span>
        <input value={val} onChange={e=>setVal(e.target.value)} onKeyDown={hk} placeholder={showProject?"project [файл]  ·  list":"введи команду..."} spellCheck={false} style={{ flex:1, background:"none", border:"none", outline:"none", color:"#e8e8f0", fontSize:13, fontFamily:"'Courier New',monospace", padding:"4px 0" }}/>
      </div>
    </div>
  );
}

// ─── GameShell ────────────────────────────────────────────────────────────────
function GameShell({ title, onClose, files, onLaunch, extraHandler, canDownload, onDownload, showProject, accentColor, children }) {
  const ac = accentColor || "#ff6b35";
  return (
    <div style={{ background:"#0a0a0d", border:"1px solid #2a2a30", borderRadius:16, width:"min(700px,97vw)", maxHeight:"90vh", boxShadow:`0 0 120px ${ac}22`, animation:"slideUp 0.2s ease", overflow:"hidden", display:"flex", flexDirection:"column" }}>
      <div style={{ background:"#13131a", padding:"10px 16px", display:"flex", alignItems:"center", gap:8, borderBottom:"1px solid #1e1e22", flexShrink:0 }}>
        <div style={{ width:12, height:12, borderRadius:"50%", background:"#ff5f57", cursor:"pointer" }} onClick={onClose}/>
        <div style={{ width:12, height:12, borderRadius:"50%", background:"#febc2e" }}/>
        <div style={{ width:12, height:12, borderRadius:"50%", background:"#28c840" }}/>
        <span style={{ color:"#555", fontSize:12, marginLeft:8, letterSpacing:1 }}>🎮 {title}</span>
        {canDownload && <button onClick={onDownload} style={{ marginLeft:"auto", background:`linear-gradient(135deg,${ac},#ff9f1c)`, border:"none", borderRadius:6, color:"#000", fontWeight:800, fontSize:11, padding:"5px 12px", cursor:"pointer", fontFamily:"'Courier New',monospace" }}>💾 Скачать</button>}
        <button onClick={onClose} style={{ marginLeft:canDownload?"8px":"auto", background:"none", border:"none", color:"#333", fontSize:15, cursor:"pointer" }}>✕</button>
      </div>
      <div style={{ flex:1, overflow:"hidden", display:"flex", flexDirection:"column" }}>{children}</div>
      <ProjectBar files={files} onLaunch={onLaunch} extraHandler={extraHandler} showProject={showProject}/>
    </div>
  );
}

// ─── Drawing Game ─────────────────────────────────────────────────────────────
function DrawingGame({ config, files, onLaunch, onClose, showProject }) {
  const cw = config.canvasSize==="большой"?700:config.canvasSize==="маленький"?300:500;
  const ch = config.canvasSize==="большой"?450:config.canvasSize==="маленький"?200:350;
  const canvasRef=useRef(null); const [tool,setTool]=useState("pencil"); const [color,setColor]=useState(config.colors[0]||"черный");
  const [brushSize,setBrushSize]=useState(4); const [eraserSize,setEraserSize]=useState(20);
  const drawing=useRef(false); const lastPos=useRef(null); const hue=useRef(0);
  useEffect(()=>{const ctx=canvasRef.current.getContext("2d");ctx.fillStyle=config.canvasColor||"#ffffff";ctx.fillRect(0,0,cw,ch);},[]);
  const getPos=(e,c)=>{const r=c.getBoundingClientRect(),sx=c.width/r.width,sy=c.height/r.height;if(e.touches)return{x:(e.touches[0].clientX-r.left)*sx,y:(e.touches[0].clientY-r.top)*sy};return{x:(e.clientX-r.left)*sx,y:(e.clientY-r.top)*sy};};
  const getRainbow=()=>{hue.current=(hue.current+2)%360;return`hsl(${hue.current},100%,50%)`;};
  const getColor=()=>tool==="eraser"?(config.canvasColor||"#ffffff"):color==="радужный"?getRainbow():resolveColor(color,"#111114");
  const startDraw=e=>{e.preventDefault();drawing.current=true;const p=getPos(e,canvasRef.current);lastPos.current=p;const ctx=canvasRef.current.getContext("2d");ctx.beginPath();ctx.arc(p.x,p.y,(tool==="eraser"?eraserSize:brushSize)/2,0,Math.PI*2);ctx.fillStyle=getColor();ctx.fill();};
  const draw=e=>{e.preventDefault();if(!drawing.current)return;const ctx=canvasRef.current.getContext("2d");const p=getPos(e,canvasRef.current);ctx.beginPath();ctx.moveTo(lastPos.current.x,lastPos.current.y);ctx.lineTo(p.x,p.y);ctx.strokeStyle=getColor();ctx.lineWidth=tool==="eraser"?eraserSize:brushSize;ctx.lineCap="round";ctx.lineJoin="round";ctx.stroke();lastPos.current=p;};
  const stopDraw=()=>{drawing.current=false;};
  const downloadCanvas=()=>{
    try {
      const dataUrl = canvasRef.current.toDataURL("image/png");
      const a = document.createElement("a"); a.download="drawing.png"; a.href=dataUrl;
      document.body.appendChild(a); a.click(); document.body.removeChild(a);
    } catch(e) {
      window.open(canvasRef.current.toDataURL("image/png"), "_blank");
    }
  };
  return (
    <GameShell title="ИГРА — рисовалка" onClose={onClose} files={files} onLaunch={onLaunch} extraHandler={(_,flash)=>{if(showProject)flash("project [файл] · list","info");}} canDownload={true} onDownload={downloadCanvas} showProject={showProject}>
      <div style={{ background:"#111116", borderBottom:"1px solid #1e1e22", padding:"8px 14px", display:"flex", alignItems:"center", gap:8, flexWrap:"wrap", flexShrink:0 }}>
        {config.hasPencil && <button onClick={()=>setTool("pencil")} style={{ background:tool==="pencil"?"linear-gradient(135deg,#ff6b35,#ff9f1c)":"#1a1a1f", border:`1px solid ${tool==="pencil"?"#ff6b35":"#2a2a30"}`, borderRadius:7, color:tool==="pencil"?"#000":"#888", fontWeight:700, fontSize:11, padding:"5px 12px", cursor:"pointer", fontFamily:"'Courier New',monospace" }}>✏️ карандаш</button>}
        {config.hasEraser && <button onClick={()=>setTool("eraser")} style={{ background:tool==="eraser"?"#e8e8f0":"#1a1a1f", border:`1px solid ${tool==="eraser"?"#aaa":"#2a2a30"}`, borderRadius:7, color:tool==="eraser"?"#000":"#888", fontWeight:700, fontSize:11, padding:"5px 12px", cursor:"pointer", fontFamily:"'Courier New',monospace" }}>⬜ ластик</button>}
        <div style={{ width:1, height:20, background:"#2a2a30" }}/>
        {config.colors.map(c => (
          <button key={c} onClick={()=>{setColor(c);setTool("pencil");}} title={c} style={{ width:24, height:24, borderRadius:"50%", background:c==="радужный"?"linear-gradient(135deg,#ff6b35,#eab308,#22c55e,#06b6d4,#a855f7)":resolveColor(c,"#888"), border:color===c&&tool==="pencil"?"3px solid #fff":"2px solid #2a2a30", cursor:"pointer", flexShrink:0 }}/>
        ))}
        <div style={{ width:1, height:20, background:"#2a2a30" }}/>
        <input type="range" min={1} max={30} value={tool==="eraser"?eraserSize:brushSize} onChange={e=>tool==="eraser"?setEraserSize(+e.target.value):setBrushSize(+e.target.value)} style={{ width:60, accentColor:"#ff6b35" }}/>
        <button onClick={()=>{const ctx=canvasRef.current.getContext("2d");ctx.fillStyle=config.canvasColor||"#ffffff";ctx.fillRect(0,0,cw,ch);}} style={{ marginLeft:"auto", background:"#1a1a1f", border:"1px solid #2a2a30", borderRadius:6, color:"#666", fontSize:10, padding:"4px 10px", cursor:"pointer" }}>🗑</button>
      </div>
      <div style={{ flex:1, overflow:"auto", display:"flex", alignItems:"center", justifyContent:"center", background:"#0d0d10", padding:10 }}>
        <canvas ref={canvasRef} width={cw} height={ch} onMouseDown={startDraw} onMouseMove={draw} onMouseUp={stopDraw} onMouseLeave={stopDraw} onTouchStart={startDraw} onTouchMove={draw} onTouchEnd={stopDraw} style={{ borderRadius:8, cursor:tool==="eraser"?"cell":"crosshair", display:"block", maxWidth:"100%", touchAction:"none" }}/>
      </div>
    </GameShell>
  );
}

// ─── Dialog Game ──────────────────────────────────────────────────────────────
function DialogGame({ dialogs, files, onLaunch, onClose, showProject, canDownload }) {
  const [msgIndex,setMsgIndex]=useState(0); const [revealed,setRevealed]=useState([0]); const [finished,setFinished]=useState(false); const bottomRef=useRef(null);
  const messages = dialogs[0]?.messages || [];
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[revealed]);
  const extraHandler=(cmd,flash)=>{ if(finished){flash("Диалог завершён","info");return;} if(cmd.trim().toLowerCase()==="dale"){const next=msgIndex+1;if(next<messages.length){setMsgIndex(next);setRevealed(p=>[...p,next]);}else setFinished(true);}else flash("Напиши dale","err"); };
  const handleDL=()=>downloadBlob(messages.join("\n"), "dialog.txt", "text/plain");
  return (
    <GameShell title="ИГРА — диалог" onClose={onClose} files={files} onLaunch={onLaunch} extraHandler={extraHandler} canDownload={canDownload} onDownload={handleDL} showProject={showProject}>
      <div style={{ flex:1, overflowY:"auto", padding:"24px 20px 12px", display:"flex", flexDirection:"column", gap:12 }}>
        {revealed.map((mi,i)=>(
          <div key={i} style={{ display:"flex", alignItems:"flex-end", gap:10, animation:"bubbleIn 0.3s ease" }}>
            <div style={{ width:36, height:36, borderRadius:"50%", flexShrink:0, background:"linear-gradient(135deg,#ff6b35,#ff9f1c,#eab308)", display:"flex", alignItems:"center", justifyContent:"center", fontSize:18 }}>🔥</div>
            <div style={{ background:"#1a1a22", border:"1px solid #2a2a35", borderRadius:"16px 16px 16px 4px", padding:"12px 16px", color:"#e8e8f0", fontSize:15, lineHeight:1.5, maxWidth:"80%" }}>{messages[mi]}</div>
          </div>
        ))}
        {finished && <div style={{ textAlign:"center", color:"#333", fontSize:12, marginTop:8 }}>■ диалог завершён</div>}
        {!finished && <div style={{ color:"#444", fontSize:11, textAlign:"center", marginTop:4 }}>напиши <span style={{ color:"#ffcc02" }}>dale</span> внизу → {msgIndex+1}/{messages.length}</div>}
        <div ref={bottomRef}/>
      </div>
    </GameShell>
  );
}

// ─── Console Game ─────────────────────────────────────────────────────────────
function ConsoleGame({ steps, files, onLaunch, onClose, showProject, canDownload }) {
  const [output,setOutput]=useState([]); const [vars,setVars]=useState({}); const [pc,setPc]=useState(0); const [waiting,setWaiting]=useState(false); const [done,setDone]=useState(false); const bottomRef=useRef(null);
  useEffect(()=>{run(0,{},[]);},[]);
  useEffect(()=>{bottomRef.current?.scrollIntoView({behavior:"smooth"});},[output]);
  function interp(str,v){return str.replace(/\{([^}]+)\}/g,(_,n)=>v[n.trim()]??`{${n}}`);}
  function run(p0,v0,out0){let p=p0,v={...v0},out=[...out0];while(p<steps.length){const s=steps[p];if(s.type==="print"){out.push({value:s.value});p++;}else if(s.type==="printVar"){out.push({value:interp(`{${s.varName}}`,v)});p++;}else if(s.type==="input"){setOutput(out);setVars(v);setPc(p);setWaiting(true);return;}else p++;}setOutput(out);setDone(true);setWaiting(false);}
  const extraHandler=(cmd,flash)=>{if(waiting){const step=steps[pc];const nv={...vars,[step.varName]:cmd};const no=[...output,{value:cmd,isInput:true}];setWaiting(false);run(pc+1,nv,no);}else flash("Программа не ожидает ввода","err");};
  const handleDL=()=>downloadBlob(output.map(l=>l.value).join("\n"), "output.txt", "text/plain");
  return (
    <GameShell title="ИГРА — консоль" onClose={onClose} files={files} onLaunch={onLaunch} extraHandler={extraHandler} canDownload={canDownload} onDownload={handleDL} showProject={showProject}>
      <div style={{ flex:1, overflowY:"auto", padding:"20px 20px 8px", display:"flex", flexDirection:"column", gap:2 }}>
        {output.map((l,i)=>(<div key={i} style={{ display:"flex", gap:10, padding:"3px 0" }}><span style={{ color:l.isInput?"#60a5fa":"#ff6b35", fontSize:11, marginTop:3, flexShrink:0 }}>{l.isInput?"›":"→"}</span><span style={{ color:l.isInput?"#60a5fa":"#e8e8f0", fontSize:15, lineHeight:"22px", fontFamily:"'Courier New',monospace" }}>{l.value}</span></div>))}
        {waiting && <div style={{ color:"#ff6b35", fontSize:12, padding:"4px 0", animation:"blink 1s infinite" }}>● введи ответ внизу...</div>}
        {done && <div style={{ color:"#333", fontSize:12, marginTop:8 }}>■ программа завершена</div>}
        <div ref={bottomRef}/>
      </div>
    </GameShell>
  );
}

// ─── Calendar Game ────────────────────────────────────────────────────────────
const MONTHS_RU = ["Январь","Февраль","Март","Апрель","Май","Июнь","Июль","Август","Сентябрь","Октябрь","Ноябрь","Декабрь"];
const DAYS_RU   = ["Пн","Вт","Ср","Чт","Пт","Сб","Вс"];

function CalendarGame({ calConfig, files, onLaunch, onClose, showProject }) {
  const today = new Date();
  const [year,setYear]=useState(today.getFullYear()); const [month,setMonth]=useState(today.getMonth());
  const [selected,setSelected]=useState(null); const [noteInput,setNoteInput]=useState(""); const [notes,setNotes]=useState({});
  const firstDay=new Date(year,month,1).getDay(); const daysInMonth=new Date(year,month+1,0).getDate();
  const startOffset=(firstDay+6)%7;
  const prevMonth=()=>{if(month===0){setMonth(11);setYear(y=>y-1);}else setMonth(m=>m-1);setSelected(null);};
  const nextMonth=()=>{if(month===11){setMonth(0);setYear(y=>y+1);}else setMonth(m=>m+1);setSelected(null);};
  const getEvents=day=>calConfig.events.filter(e=>e.day===day&&e.month===(month+1));
  const ac = calConfig.headerColor;
  return (
    <GameShell title="ИГРА — Календарь" onClose={onClose} files={files} onLaunch={onLaunch} extraHandler={(_,flash)=>{if(showProject)flash("project [файл] · list","info");}} showProject={showProject} accentColor={ac}>
      <div style={{ flex:1, overflowY:"auto", padding:"20px" }}>
        <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:18 }}>
          <button onClick={prevMonth} style={{ background:"#1a1a1f", border:"1px solid #2a2a30", borderRadius:8, color:ac, fontSize:18, padding:"6px 14px", cursor:"pointer" }}>‹</button>
          <div style={{ textAlign:"center" }}>
            {calConfig.headerRainbow ? <RainbowText style={{ fontSize:22, fontWeight:900 }}>{MONTHS_RU[month]} {year}</RainbowText> : <div style={{ color:ac, fontSize:22, fontWeight:900 }}>{MONTHS_RU[month]} {year}</div>}
            <div style={{ color:"#333", fontSize:11, marginTop:2 }}>сегодня: {today.getDate()} {MONTHS_RU[today.getMonth()]} {today.getFullYear()}</div>
          </div>
          <button onClick={nextMonth} style={{ background:"#1a1a1f", border:"1px solid #2a2a30", borderRadius:8, color:ac, fontSize:18, padding:"6px 14px", cursor:"pointer" }}>›</button>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4, marginBottom:6 }}>
          {DAYS_RU.map((d,i)=>(<div key={d} style={{ textAlign:"center", fontSize:11, fontWeight:700, color:i>=5?calConfig.weekendColor:"#444", padding:"4px 0" }}>{d}</div>))}
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(7,1fr)", gap:4 }}>
          {Array(startOffset).fill(null).map((_,i)=><div key={`e${i}`}/>)}
          {Array(daysInMonth).fill(null).map((_,i)=>{
            const day=i+1; const isToday=year===today.getFullYear()&&month===today.getMonth()&&day===today.getDate();
            const isSelected=selected===day; const isWeekend=((startOffset+i)%7)>=5;
            const dayEvents=getEvents(day); const dayKey=`${year}-${month}-${day}`; const hasNote=notes[dayKey];
            return (
              <div key={day} onClick={()=>{setSelected(day===selected?null:day);setNoteInput(notes[`${year}-${month}-${day}`]||"");}}
                style={{ background:isSelected?ac+"33":isToday?calConfig.todayColor+"22":"#111116", border:`1px solid ${isSelected?ac:isToday?calConfig.todayColor:"#1e1e22"}`, borderRadius:8, padding:"6px 4px", cursor:"pointer", minHeight:52, display:"flex", flexDirection:"column", alignItems:"center", gap:2 }}>
                <span style={{ color:isToday?calConfig.todayColor:isWeekend?calConfig.weekendColor:calConfig.daysColor, fontSize:14, fontWeight:isToday?900:400 }}>{day}</span>
                {dayEvents.map((ev,ei)=>(<div key={ei} style={{ width:"90%", background:ev.color, borderRadius:3, padding:"1px 3px", fontSize:9, color:"#000", fontWeight:700, textAlign:"center", overflow:"hidden", whiteSpace:"nowrap", textOverflow:"ellipsis" }}>{ev.text}</div>))}
                {hasNote && <div style={{ width:6, height:6, borderRadius:"50%", background:ac }}/>}
              </div>
            );
          })}
        </div>
        {selected && (
          <div style={{ marginTop:18, background:"#111116", border:"1px solid #2a2a30", borderRadius:10, padding:"14px 16px" }}>
            <div style={{ color:ac, fontSize:12, fontWeight:700, marginBottom:8 }}>📝 {selected} {MONTHS_RU[month]} {year}</div>
            <textarea value={noteInput} onChange={e=>setNoteInput(e.target.value)} placeholder="Добавь заметку..." style={{ width:"100%", background:"#0a0a0c", border:"1px solid #2a2a30", borderRadius:7, color:"#e8e8f0", fontSize:13, padding:"10px 12px", outline:"none", resize:"none", fontFamily:"'Courier New',monospace", boxSizing:"border-box", minHeight:60 }}/>
            <div style={{ display:"flex", justifyContent:"flex-end", marginTop:6 }}>
              <button onClick={()=>setNotes(n=>({...n,[`${year}-${month}-${selected}`]:noteInput}))} style={{ background:`linear-gradient(135deg,${ac},#ff9f1c)`, border:"none", borderRadius:7, color:"#000", fontWeight:800, fontSize:12, padding:"6px 16px", cursor:"pointer", fontFamily:"'Courier New',monospace" }}>💾 Сохранить</button>
            </div>
          </div>
        )}
      </div>
    </GameShell>
  );
}

// ─── Browser Game ─────────────────────────────────────────────────────────────
function BrowserGame({ browserConfig, pages, files, onLaunch, onClose, showProject }) {
  const [currentId,setCurrentId]=useState(browserConfig.home); const [history,setHistory]=useState([browserConfig.home]); const [histIdx,setHistIdx]=useState(0); const [urlBar,setUrlBar]=useState(browserConfig.home);
  const navigate=id=>{setCurrentId(id);setUrlBar(id);const nh=[...history.slice(0,histIdx+1),id];setHistory(nh);setHistIdx(nh.length-1);};
  const goBack=()=>{if(histIdx>0){const i=histIdx-1;setHistIdx(i);setCurrentId(history[i]);setUrlBar(history[i]);}};
  const goFwd=()=>{if(histIdx<history.length-1){const i=histIdx+1;setHistIdx(i);setCurrentId(history[i]);setUrlBar(history[i]);}};
  const page = pages.find(p => p.id === currentId);
  const ac = browserConfig.accentRainbow ? "#ff6b35" : browserConfig.accentColor;
  return (
    <div style={{ background:page?.bg||"#0d0d0f", border:"1px solid #2a2a30", borderRadius:16, width:"min(740px,97vw)", height:"min(640px,92vh)", boxShadow:`0 0 120px ${ac}33`, animation:"slideUp 0.2s ease", overflow:"hidden", display:"flex", flexDirection:"column", transition:"background 0.3s" }}>
      <div style={{ background:"#13131a", padding:"10px 14px", display:"flex", alignItems:"center", gap:8, borderBottom:"1px solid #1e1e22", flexShrink:0 }}>
        <div style={{ width:12, height:12, borderRadius:"50%", background:"#ff5f57", cursor:"pointer" }} onClick={onClose}/>
        <div style={{ width:12, height:12, borderRadius:"50%", background:"#febc2e" }}/>
        <div style={{ width:12, height:12, borderRadius:"50%", background:"#28c840" }}/>
        {browserConfig.accentRainbow ? <RainbowText style={{ fontSize:12, marginLeft:4 }}>🌐 Hotpon Browser</RainbowText> : <span style={{ color:"#555", fontSize:12, marginLeft:4 }}>🌐 Hotpon Browser</span>}
        <button onClick={onClose} style={{ marginLeft:"auto", background:"none", border:"none", color:"#333", fontSize:15, cursor:"pointer" }}>✕</button>
      </div>
      <div style={{ background:"#0e0e11", padding:"8px 12px", borderBottom:"1px solid #1e1e22", display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
        <button onClick={goBack}  disabled={histIdx===0} style={{ background:"none", border:"none", color:histIdx===0?"#2a2a30":"#888", fontSize:18, cursor:"pointer", padding:"2px 6px" }}>‹</button>
        <button onClick={goFwd}   disabled={histIdx===history.length-1} style={{ background:"none", border:"none", color:histIdx===history.length-1?"#2a2a30":"#888", fontSize:18, cursor:"pointer", padding:"2px 6px" }}>›</button>
        <div style={{ flex:1, display:"flex", alignItems:"center", background:"#111116", border:"1px solid #2a2a30", borderRadius:8, padding:"0 12px", gap:8 }}>
          <span style={{ color:ac, fontSize:11, flexShrink:0 }}>hotpon://</span>
          <input value={urlBar} onChange={e=>setUrlBar(e.target.value)} onKeyDown={e=>e.key==="Enter"&&navigate(urlBar.trim())} spellCheck={false} style={{ flex:1, background:"none", border:"none", outline:"none", color:"#e8e8f0", fontSize:13, padding:"8px 0", fontFamily:"'Courier New',monospace" }}/>
        </div>
        <button onClick={()=>navigate(urlBar.trim())} style={{ background:`linear-gradient(135deg,${ac},#ff9f1c)`, border:"none", borderRadius:7, color:"#000", fontWeight:800, fontSize:12, padding:"7px 14px", cursor:"pointer", fontFamily:"'Courier New',monospace", flexShrink:0 }}>→</button>
      </div>
      {browserConfig.bookmarks.length > 0 && (
        <div style={{ background:"#0a0a0d", padding:"5px 12px", borderBottom:"1px solid #1a1a1e", display:"flex", gap:6, flexWrap:"wrap", flexShrink:0 }}>
          {browserConfig.bookmarks.map((bm,i)=>(<button key={i} onClick={()=>navigate(bm.url)} style={{ background:currentId===bm.url?ac+"22":"#1a1a1f", border:`1px solid ${currentId===bm.url?ac:"#2a2a30"}`, borderRadius:5, color:currentId===bm.url?ac:"#888", fontSize:11, padding:"3px 10px", cursor:"pointer", fontFamily:"'Courier New',monospace" }}>{bm.name}</button>))}
        </div>
      )}
      <div style={{ flex:1, overflowY:"auto", padding:"28px 32px", background:page?.bg||"#0d0d0f", transition:"background 0.3s" }}>
        {!page ? (
          <div style={{ textAlign:"center", paddingTop:60 }}>
            <div style={{ fontSize:48, marginBottom:16 }}>🔍</div>
            <div style={{ color:"#555", fontSize:16, marginBottom:8 }}>Страница не найдена</div>
            <div style={{ color:"#333", fontSize:13 }}>hotpon://{currentId}</div>
            <div style={{ color:"#2a2a2a", fontSize:12, marginTop:12 }}>Создай файл <span style={{ color:"#ffcc02" }}>{currentId}.страница</span></div>
          </div>
        ) : (
          <div style={{ maxWidth:620, margin:"0 auto" }}>
            {page.blocks.map((block,i) => {
              if (block.type==="h1")      return page.accentRainbow ? <RainbowText key={i} style={{ fontSize:28, fontWeight:900, display:"block", marginBottom:20, fontFamily:"'Courier New',monospace" }}>{block.text}</RainbowText> : <h1 key={i} style={{ color:page.accent, fontSize:28, fontWeight:900, margin:"0 0 20px", fontFamily:"'Courier New',monospace" }}>{block.text}</h1>;
              if (block.type==="h2")      return page.accentRainbow ? <RainbowText key={i} style={{ fontSize:18, fontWeight:700, display:"block", margin:"20px 0 10px", fontFamily:"'Courier New',monospace" }}>{block.text}</RainbowText> : <h2 key={i} style={{ color:page.accent, fontSize:18, fontWeight:700, margin:"20px 0 10px", fontFamily:"'Courier New',monospace" }}>{block.text}</h2>;
              if (block.type==="text")    return <p key={i} style={{ color:page.textColor, fontSize:15, lineHeight:1.7, margin:"6px 0", fontFamily:"'Courier New',monospace" }}>{block.text}</p>;
              if (block.type==="divider") return <hr key={i} style={{ border:"none", borderTop:`1px solid ${page.border}`, margin:"20px 0" }}/>;
              if (block.type==="button")  return <button key={i} onClick={()=>navigate(block.url)} style={{ display:"inline-block", margin:"6px 8px 6px 0", background:block.rainbow?"linear-gradient(135deg,#ff6b35,#eab308,#22c55e,#06b6d4,#a855f7)":`linear-gradient(135deg,${block.color},${block.color}cc)`, border:"none", borderRadius:8, color:"#000", fontWeight:800, fontSize:13, padding:"10px 22px", cursor:"pointer", fontFamily:"'Courier New',monospace" }}>{block.text}</button>;
              return null;
            })}
          </div>
        )}
      </div>
      <ProjectBar files={files} onLaunch={onLaunch} extraHandler={(_,flash)=>{if(showProject)flash("project [файл] · list","info");}} showProject={showProject}/>
    </div>
  );
}

// ─── Main IDE ─────────────────────────────────────────────────────────────────
export default function HotponIDE() {
  const [files,setFiles]         = useState(STARTER_FILES);
  const [activeId,setActiveId]   = useState(1);
  const [modal,setModal]         = useState(null);
  const [gameMode,setGameMode]   = useState(null);
  const [parseResult,setParseResult] = useState(null);
  const [gameFiles,setGameFiles] = useState([]);
  const [playInput,setPlayInput] = useState("");
  const [playError,setPlayError] = useState(false);
  const [renamingId,setRenamingId] = useState(null);
  const [renameVal,setRenameVal] = useState("");
  const [saveFlash,setSaveFlash] = useState(false);
  const [saveMsg,setSaveMsg]     = useState("");
  const nextId       = useRef(30);
  const playInputRef = useRef(null);
  const textareaRef  = useRef(null);

  // FIX: always fall back to first file if activeId missing
  const activeFile = files.find(f => f.id === activeId) || files[0];

  useEffect(() => {
    if (modal === "play") { setPlayInput(""); setPlayError(false); setTimeout(() => playInputRef.current?.focus(), 50); }
  }, [modal]);

  const updateCode = code => setFiles(fs => fs.map(f => f.id === activeId ? { ...f, code } : f));

  const addHotFile = () => {
    const id = nextId.current++;
    setFiles(fs => [...fs, { id, name:`file${id}.hot`, code:`Hotpon = start\n\nна экране [Привет!]\n\nHotpon = stop` }]);
    setActiveId(id);
  };
  const addPageFile = () => {
    const id = nextId.current++;
    setFiles(fs => [...fs, { id, name:`page${id}.страница`, code:`Страница = page${id}\nЗаголовок = [Новая страница]\nЦвет фона = [тёмный]\nЦвет акцента = [радужный]\nЦвет текста = [белый]\n\nТекст = [Привет!]\nРазделитель\nКнопка = [← Назад] [home] [оранжевый]` }]);
    setActiveId(id);
  };

  const deleteFile = id => {
    if (files.length === 1) return;
    const remaining = files.filter(f => f.id !== id);
    setFiles(remaining);
    if (activeId === id) setActiveId(remaining[0].id);
  };

  const startRename = f => { setRenamingId(f.id); setRenameVal(f.name); };
  const commitRename = () => {
    const trimmed = renameVal.trim();
    if (trimmed) {
      setFiles(fs => fs.map(f => f.id === renamingId ? { ...f, name: trimmed } : f));
    }
    // if empty — silently revert (do nothing, old name stays in files)
    setRenamingId(null);
    setRenameVal("");
  };

  // FIX: save with proper error feedback
  const handleSave = () => {
    const ok = saveProject(files);
    if (ok) {
      setSaveFlash(true); setSaveMsg("✓ Сохранено!");
    } else {
      setSaveMsg("✗ Ошибка");
    }
    setTimeout(() => { setSaveFlash(false); setSaveMsg(""); }, 1500);
  };

  const handleOpen = () => loadProject(d => {
    if (d.files && Array.isArray(d.files)) {
      setFiles(d.files.map((f, i) => ({ ...f, id: i + 1 })));
      setActiveId(1);
    }
  });

  const launchFile = (file, allFiles) => {
    const result = parseProgram(file.code);
    setParseResult(result);
    setGameFiles(allFiles || files);
    if (result.errors?.length) { setGameMode("error"); setModal("game"); return; }
    if (result.hasBrowser) {
      const pages = files.filter(f => f.name.endsWith(".страница")).map(f => parsePage(f.code)).filter(Boolean);
      setParseResult({ ...result, pages });
      setGameMode("browser");
    } else if (result.hasCalendar) setGameMode("calendar");
    else if (result.hasCanvas)     setGameMode("draw");
    else if (result.hasDialog)     setGameMode("dialog");
    else                           setGameMode("console");
    setModal("game");
  };

  const handlePlayKey = e => {
    if (e.key === "Enter") {
      if (playInput.trim().toLowerCase() === "play") {
        launchFile(activeFile, files);
        setPlayInput(""); setPlayError(false);
      } else { setPlayError(true); setPlayInput(""); setTimeout(() => setPlayError(false), 600); }
    }
    if (e.key === "Escape") setModal(null);
  };

  const handleTextareaKey = e => {
    if (e.key === "Tab") { e.preventDefault(); const s=e.target.selectionStart,en=e.target.selectionEnd; const nv=activeFile.code.substring(0,s)+"  "+activeFile.code.substring(en); updateCode(nv); setTimeout(()=>{textareaRef.current.selectionStart=s+2;textareaRef.current.selectionEnd=s+2;},0); }
  };

  const isPage = activeFile.name.endsWith(".страница");

  return (
    <div style={{ minHeight:"100vh", background:"#080809", fontFamily:"'Courier New',monospace", display:"flex", flexDirection:"column", alignItems:"center", padding:"40px 20px" }}>
      <div style={{ textAlign:"center", marginBottom:32 }}>
        <div style={{ fontSize:42, fontWeight:900, letterSpacing:"-1px" }}><RainbowText>🔥 HOTPON</RainbowText></div>
        <div style={{ color:"#555", fontSize:13, marginTop:4, letterSpacing:3 }}>v{HOTPON_VERSION} — ЯЗЫК ПРОГРАММИРОВАНИЯ</div>
      </div>

      <div style={{ width:"100%", maxWidth:820, background:"#111114", border:"1px solid #222", borderRadius:16, overflow:"hidden", boxShadow:"0 0 60px rgba(255,107,53,0.08)" }}>
        {/* Toolbar */}
        <div style={{ background:"#0e0e11", padding:"8px 14px", borderBottom:"1px solid #1a1a1e", display:"flex", gap:8, alignItems:"center" }}>
          <button onClick={handleSave} style={{ background:saveFlash?"linear-gradient(135deg,#4ade80,#22c55e)":"#1a1a1f", border:`1px solid ${saveFlash?"#4ade80":"#2a2a30"}`, borderRadius:7, color:saveFlash?"#000":"#888", fontWeight:700, fontSize:12, padding:"7px 16px", cursor:"pointer", fontFamily:"'Courier New',monospace", transition:"all 0.2s" }}>
            {saveMsg || "💾 Сохранить"}
          </button>
          <button onClick={handleOpen} style={{ background:"#1a1a1f", border:"1px solid #2a2a30", borderRadius:7, color:"#888", fontWeight:700, fontSize:12, padding:"7px 16px", cursor:"pointer", fontFamily:"'Courier New',monospace" }}>📂 Открыть</button>
          <div style={{ marginLeft:"auto", display:"flex", gap:6 }}>
            <button onClick={addHotFile}  style={{ background:"#1a1a1f", border:"1px solid #2a2a30", borderRadius:7, color:"#888", fontSize:11, padding:"6px 12px", cursor:"pointer", fontFamily:"'Courier New',monospace" }}>+ .hot</button>
            <button onClick={addPageFile} style={{ background:"#1a1a1f", border:"1px solid #ff6b3544", borderRadius:7, color:"#ff6b35", fontSize:11, padding:"6px 12px", cursor:"pointer", fontFamily:"'Courier New',monospace" }}>+ .страница</button>
          </div>
        </div>

        {/* Tabs */}
        <div style={{ background:"#16161a", borderBottom:"1px solid #222", display:"flex", alignItems:"stretch", minHeight:42, overflowX:"auto" }}>
          {files.map(f => {
            const isPg = f.name.endsWith(".страница");
            return (
              <div key={f.id} onDoubleClick={()=>startRename(f)}
                style={{ display:"flex", alignItems:"center", gap:5, padding:"0 11px", cursor:"pointer", flexShrink:0, borderRight:"1px solid #222", background:f.id===activeId?"#111114":"transparent", borderBottom:f.id===activeId?`2px solid ${isPg?"#ffcc02":"#ff6b35"}`:"2px solid transparent" }}
                onClick={()=>setActiveId(f.id)}>
                <span style={{ fontSize:11, opacity:0.6 }}>{isPg?"🌐":"📄"}</span>
                {renamingId === f.id ? (
                  <input autoFocus value={renameVal}
                    onChange={e => setRenameVal(e.target.value)}
                    onBlur={commitRename}
                    onKeyDown={e => { if(e.key==="Enter") commitRename(); if(e.key==="Escape") setRenamingId(null); }}
                    onClick={e => e.stopPropagation()}
                    style={{ background:"#1a1a1f", border:"1px solid #ff6b35", borderRadius:4, color:"#ffcc02", fontSize:12, padding:"2px 6px", width:90, outline:"none", fontFamily:"'Courier New',monospace" }}
                  />
                ) : (
                  <span style={{ color:f.id===activeId?(isPg?"#ffcc02":"#e8e8f0"):"#555", fontSize:12 }}>{f.name}</span>
                )}
                {files.length > 1 && (
                  <span onClick={e=>{e.stopPropagation();deleteFile(f.id);}} style={{ color:"#252525", fontSize:11, cursor:"pointer", marginLeft:2 }}
                    onMouseEnter={e=>e.target.style.color="#ff4444"} onMouseLeave={e=>e.target.style.color="#252525"}>✕</span>
                )}
              </div>
            );
          })}
        </div>

        {/* Editor */}
        <div style={{ position:"relative" }}>
          {isPage && (
            <div style={{ background:"#0d0d10", borderBottom:"1px solid #1a1a1e", padding:"5px 16px", fontSize:11, color:"#555", display:"flex", alignItems:"center", gap:8 }}>
              <span style={{ color:"#ffcc02" }}>🌐</span>
              <span>Страница: <span style={{ color:"#ffcc02" }}>{parsePage(activeFile.code)?.id || "—"}</span></span>
            </div>
          )}
          <div style={{ position:"absolute", left:0, top:isPage?28:0, bottom:0, width:44, padding:"16px 0", display:"flex", flexDirection:"column", alignItems:"center", color:"#333", fontSize:13, lineHeight:"24px", userSelect:"none", borderRight:"1px solid #1e1e22" }}>
            {activeFile.code.split("\n").map((_,i) => <div key={i}>{i+1}</div>)}
          </div>
          <textarea ref={textareaRef} value={activeFile.code} onChange={e=>updateCode(e.target.value)} onKeyDown={handleTextareaKey} spellCheck={false}
            style={{ width:"100%", minHeight:260, padding:"16px 16px 16px 60px", background:"transparent", border:"none", outline:"none", color:"#e8e8f0", fontSize:15, lineHeight:"24px", resize:"vertical", fontFamily:"'Courier New',monospace", boxSizing:"border-box", caretColor:"#ff6b35" }}/>
        </div>

        <div style={{ padding:"10px 18px", borderTop:"1px solid #1e1e22", display:"flex", justifyContent:"space-between", alignItems:"center", background:"#111114" }}>
          <span style={{ color:"#333", fontSize:11 }}>{files.filter(f=>f.name.endsWith(".hot")).length} .hot · {files.filter(f=>f.name.endsWith(".страница")).length} страниц · 2×клик = переименовать</span>
          <button onClick={()=>setModal("play")} style={{ background:"linear-gradient(135deg,#ff6b35,#ff9f1c,#eab308)", border:"none", borderRadius:8, color:"#000", fontWeight:800, fontSize:14, padding:"10px 28px", cursor:"pointer", letterSpacing:1, fontFamily:"'Courier New',monospace" }}>▶ PLAY</button>
        </div>
      </div>

      {/* Docs */}
      <div style={{ marginTop:32, width:"100%", maxWidth:820, background:"#111114", border:"1px solid #1e1e22", borderRadius:12, padding:"18px 22px" }}>
        <div style={{ marginBottom:14 }}><RainbowText style={{ fontSize:12, letterSpacing:2 }}>📖 КОМАНДЫ HOTPON v{HOTPON_VERSION}</RainbowText></div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(240px,1fr))", gap:12 }}>
          {[
            ["🎨 Рисовалка","Технология холст\nТехнология карандаш\nТехнология ластик\n[Цвета]{радужный [Кнопка]}\nЦвет холста = [белый]\nРазмер холста = [большой]"],
            ["💬 Диалог","Технология диалог\nДиалог = технология диалог\nНа экране [текст]\nПосле команды dale"],
            ["📅 Календарь","Технология календарь\nЦвет заголовка = [радужный]\nЦвет выходных = [красный]\nСобытие = [15.5] [Текст] [синий]"],
            ["🌐 Браузер","Технология браузер\nБраузер = домашняя страница [home]\nБраузер цвет = [радужный]\nБраузер закладка = [Имя] [id]"],
            ["📄 Страница","Страница = id\nЗаголовок = [текст]\nЦвет акцента = [радужный]\nТекст = [текст]\nКнопка = [текст] [id] [цвет]\nРазделитель"],
            ["🌈 Цвета","оранжевый · красный · синий\nзеленый · желтый · белый\nфиолетовый · голубой · розовый\nбирюзовый · лайм · индиго\nкоралловый · радужный"],
          ].map(([title,content]) => (
            <div key={title} style={{ background:"#0d0d0f", border:"1px solid #1e1e22", borderRadius:8, padding:"12px 14px" }}>
              <div style={{ color:"#ff6b35", fontSize:11, fontWeight:700, marginBottom:8 }}>{title}</div>
              <pre style={{ color:"#555", fontSize:10, lineHeight:1.8, margin:0, whiteSpace:"pre-wrap", fontFamily:"'Courier New',monospace" }}>{content}</pre>
            </div>
          ))}
        </div>
      </div>

      {/* MODAL: play */}
      {modal === "play" && (
        <div onClick={e=>{if(e.target===e.currentTarget)setModal(null);}} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.75)", backdropFilter:"blur(6px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999 }}>
          <div style={{ background:"#111114", border:"1px solid #2a2a30", borderRadius:16, padding:"36px 40px", width:360, boxShadow:"0 0 80px rgba(255,107,53,0.2)", position:"relative", animation:"slideUp 0.2s ease" }}>
            <button onClick={()=>setModal(null)} style={{ position:"absolute", top:14, right:16, background:"none", border:"none", color:"#444", fontSize:18, cursor:"pointer" }}>✕</button>
            <div style={{ fontSize:26, fontWeight:900, marginBottom:8 }}><RainbowText>🔥 Запуск</RainbowText></div>
            <div style={{ color:"#555", fontSize:13, marginBottom:24, lineHeight:1.7 }}>Напиши <span style={{ color:"#ffcc02", background:"#1a1a1f", padding:"1px 8px", borderRadius:4 }}>play</span> и нажми <span style={{ color:"#ffcc02" }}>Enter</span></div>
            <div style={{ display:"flex", alignItems:"center", background:"#0a0a0c", border:`1px solid ${playError?"#ff4444":"#2a2a30"}`, borderRadius:8, padding:"0 14px", animation:playError?"shake 0.3s ease":"none" }}>
              <span style={{ color:"#ff6b35", marginRight:10, fontSize:14 }}>$</span>
              <input ref={playInputRef} value={playInput} onChange={e=>setPlayInput(e.target.value)} onKeyDown={handlePlayKey} placeholder="play" spellCheck={false} style={{ background:"none", border:"none", outline:"none", color:"#e8e8f0", fontSize:16, fontFamily:"'Courier New',monospace", padding:"14px 0", width:"100%", letterSpacing:2 }}/>
            </div>
            {playError && <div style={{ color:"#ff4444", fontSize:12, marginTop:8 }}>✗ Напиши: play</div>}
          </div>
        </div>
      )}

      {/* MODAL: game */}
      {modal === "game" && (
        <div onClick={e=>{if(e.target===e.currentTarget)setModal(null);}} style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.88)", backdropFilter:"blur(10px)", display:"flex", alignItems:"center", justifyContent:"center", zIndex:999, padding:12 }}>
          {gameMode==="draw"     && parseResult && <DrawingGame  config={parseResult}             files={gameFiles} onLaunch={f=>launchFile(f,gameFiles)} onClose={()=>setModal(null)} showProject={true}/>}
          {gameMode==="dialog"   && parseResult && <DialogGame   dialogs={parseResult.dialogs}    files={gameFiles} onLaunch={f=>launchFile(f,gameFiles)} onClose={()=>setModal(null)} showProject={true} canDownload={parseResult.canDownload}/>}
          {gameMode==="console"  && parseResult && <ConsoleGame  steps={parseResult.consoleSteps} files={gameFiles} onLaunch={f=>launchFile(f,gameFiles)} onClose={()=>setModal(null)} showProject={true} canDownload={parseResult.canDownload}/>}
          {gameMode==="calendar" && parseResult && <CalendarGame calConfig={parseResult.calConfig} files={gameFiles} onLaunch={f=>launchFile(f,gameFiles)} onClose={()=>setModal(null)} showProject={true}/>}
          {gameMode==="browser"  && parseResult && <BrowserGame  browserConfig={parseResult.browserConfig} pages={parseResult.pages} files={gameFiles} onLaunch={f=>launchFile(f,gameFiles)} onClose={()=>setModal(null)} showProject={true}/>}
          {gameMode==="error"    && parseResult && (
            <div style={{ background:"#111114", border:"1px solid #ff4444", borderRadius:16, padding:"32px 36px", width:"min(400px,92vw)", animation:"slideUp 0.2s ease", position:"relative" }}>
              <button onClick={()=>setModal(null)} style={{ position:"absolute", top:14, right:16, background:"none", border:"none", color:"#444", fontSize:18, cursor:"pointer" }}>✕</button>
              <div style={{ color:"#ff4444", fontWeight:900, fontSize:20, marginBottom:16 }}>✗ Ошибки</div>
              {parseResult.errors.map((e,i) => <div key={i} style={{ color:"#ff4444", fontSize:13, marginBottom:8 }}>• {e}</div>)}
            </div>
          )}
        </div>
      )}

      <style>{`
        @keyframes slideUp  { from{transform:translateY(24px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes shake    { 0%,100%{transform:translateX(0)} 25%{transform:translateX(-8px)} 75%{transform:translateX(8px)} }
        @keyframes bubbleIn { from{transform:translateY(10px);opacity:0} to{transform:translateY(0);opacity:1} }
        @keyframes blink    { 0%,100%{opacity:1} 50%{opacity:0.3} }
        @keyframes rainbow  { 0%{background-position:0%} 100%{background-position:200%} }
      `}</style>
    </div>
  );
}
