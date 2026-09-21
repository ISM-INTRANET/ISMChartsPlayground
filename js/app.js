/* Chart Lab V2 — Application & UI Logic */

window.phase2Palette = window.phase2Palette || ["#2563eb","#10b981","#f59e0b","#7c3aed","#ef4444","#06b6d4"];

document.addEventListener("DOMContentLoaded",()=>{renderTable();updateColumnSelectors();attachEvents();renderChart();});

function attachEvents(){
document.querySelectorAll("#chartType,#chartTitle,#chartSubtitle,#backgroundColor,#opacity,#pointSize,#lineWidth,#showLegend,#showLabels,#showGrid,#animation,#xAxisTitle,#yAxisTitle,#yMin,#yMax,#numberFormat").forEach(e=>{e.addEventListener("input",renderChart);e.addEventListener("change",renderChart);});
["xColumn","sizeColumn","groupColumn","labelColumn"].forEach(id=>document.getElementById(id).addEventListener("change",renderChart));
}

function loadPreset(name){
  const p = presets[name];
  if(!p || !p.headers || !p.rows) return;

  // Convert the work-area rows into the Chart Lab's internal data format.
  data = p.rows.map(row => {
    const obj = {};
    p.headers.forEach((header, i) => {
      obj[header] = row[i] ?? "";
    });
    return obj;
  });

  columns = [...p.headers];

  // Use the first column as X and automatically select all numeric columns as Y.
  const numericColumns = columns.filter(col =>
    data.some(row => typeof row[col] === "number" && Number.isFinite(row[col]))
  );

  selectedSeries = numericColumns.length
    ? numericColumns.slice(0, 3)
    : (columns.length > 1 ? [columns[1]] : [columns[0]]);

  // Sensible default title for each work area.
  const titles = {
    application: "Application Activity",
    revenue: "Revenue Collection",
    maintenance: "Maintenance & Operations",
    projects: "Project Spending",
    kpi: "KPI Performance",
    others: "Sample Data"
  };

  const titleEl = document.getElementById("chartTitle");
  const typeEl = document.getElementById("chartType");

  if(titleEl) titleEl.value = titles[name] || "Chart";
  if(typeEl) typeEl.value = "bar";

  renderTable();
  updateColumnSelectors();
  renderChart();

  // Keep the "What are you analysing?" filter in sync with the loaded work area.
  document.querySelectorAll("[data-work-area]").forEach(btn => {
    btn.classList.toggle("active", btn.dataset.workArea === name);
  });
  document.querySelectorAll(".preset-btn").forEach(btn => {
    const match = btn.getAttribute("onclick")?.match(/loadPreset\('([^']+)'\)/);
    btn.classList.toggle("active", !!match && match[1] === name);
  });

  // Give immediate visual feedback.
  if(typeof showToast === "function"){
    showToast((titles[name] || "Work area") + " loaded");
  }
}
function openCSVModal(){document.getElementById("csvModal").classList.add("show")}function closeCSVModal(){document.getElementById("csvModal").classList.remove("show")}
function parseCSV(text){const lines=text.trim().split(/\r?\n/);if(!lines.length)return[];const headers=lines[0].split(",").map(x=>x.trim());return lines.slice(1).map(line=>{const vals=line.split(",").map(x=>x.trim()),r={};headers.forEach((h,i)=>{const v=vals[i]??"";r[h]=v!==""&&!isNaN(v)?Number(v):v});return r})}
function importCSV(){const imported=parseCSV(document.getElementById("csvInput").value);if(!imported.length){alert("No valid CSV data found.");return}data=imported;columns=Object.keys(data[0]);selectedSeries=columns.length>1?[columns[1]]:[columns[0]];renderTable();updateColumnSelectors();renderChart();closeCSVModal()}
function exportCSV(){let csv=columns.join(",")+"\n";data.forEach(r=>{csv+=columns.map(c=>`"${String(r[c]??"").replace(/"/g,'""')}"`).join(",")+"\n"});downloadFile(csv,"chart-lab-data.csv","text/csv")}

function createHistogram(values){if(!values.length)return{labels:[],values:[]};const min=Math.min(...values),max=Math.max(...values),count=Math.min(8,Math.max(3,Math.ceil(Math.sqrt(values.length)))),width=(max-min)/count||1,bins=new Array(count).fill(0);values.forEach(v=>{let i=Math.floor((v-min)/width);if(i>=count)i=count-1;bins[i]++});return{labels:bins.map((_,i)=>Math.round(min+i*width)+"–"+Math.round(min+(i+1)*width)),values:bins}}
function toggleAdvanced(){document.getElementById("advancedControls").classList.toggle("show")}
function resetZoom(){if(chart&&chart.resetZoom)chart.resetZoom()}
function toggleFullscreen(){const c=document.getElementById("chartContainer");if(!document.fullscreenElement)c.requestFullscreen();else document.exitFullscreen()}
document.addEventListener("paste",e=>{const a=document.activeElement;if(a&&a.tagName==="INPUT"&&a.closest(".data-table")){const t=e.clipboardData.getData("text/plain");if(t.includes("\t")){e.preventDefault();pasteExcelData(t)}}});
function pasteExcelData(text){const rows=text.trim().split(/\r?\n/).map(r=>r.split("\t"));if(!rows.length)return;columns=rows[0].map((h,i)=>h.trim()||"Column"+(i+1));data=rows.slice(1).map(vals=>{const r={};columns.forEach((c,i)=>{const v=vals[i]??"";r[c]=v!==""&&!isNaN(v)?Number(v):v});return r});selectedSeries=columns.length>1?[columns[1]]:[columns[0]];renderTable();updateColumnSelectors();renderChart()}

/* ===== QoL helpers ===== */
let toastTimer;
function showToast(message){const el=document.getElementById('toast');if(!el)return;el.textContent=message;el.classList.add('show');clearTimeout(toastTimer);toastTimer=setTimeout(()=>el.classList.remove('show'),2200)}
function scrollToEditor(){document.querySelector('.data-panel')?.scrollIntoView({behavior:'smooth',block:'start'})}
function scrollToMapping(){document.querySelector('.mapping-panel')?.scrollIntoView({behavior:'smooth',block:'start'})}
function getSetup(){
 const ids=['chartType','chartTitle','chartSubtitle','backgroundColor','opacity','pointSize','lineWidth','showLegend','showLabels','showGrid','animation','xAxisTitle','yAxisTitle','yMin','yMax','numberFormat','xColumn','sizeColumn','groupColumn','labelColumn'];
 const controls={}; ids.forEach(id=>{const e=document.getElementById(id);if(e) controls[id]=e.type==='checkbox'?e.checked:e.value});
 return {version:2,data,columns,selectedSeries,controls};
}
function applySetup(setup){
 if(!setup||!setup.data||!setup.columns)return false;
 data=JSON.parse(JSON.stringify(setup.data));columns=[...setup.columns];selectedSeries=[...(setup.selectedSeries||[])].filter(s=>columns.includes(s));
 if(!selectedSeries.length&&columns[1])selectedSeries=[columns[1]];
 Object.entries(setup.controls||{}).forEach(([id,v])=>{const e=document.getElementById(id);if(!e)return;if(e.type==='checkbox')e.checked=!!v;else e.value=v});
 renderTable();updateColumnSelectors();renderChart();return true;
}
function saveSetup(){try{localStorage.setItem('chartLabSetup',JSON.stringify(getSetup()));showToast('Setup saved on this device');}catch(e){showToast('Could not save setup')}}
function loadSetup(){try{const raw=localStorage.getItem('chartLabSetup');if(!raw){showToast('No saved setup found');return}applySetup(JSON.parse(raw));showToast('Saved setup loaded');}catch(e){showToast('Saved setup could not be loaded')}}
function copyShareLink(){try{const payload=btoa(unescape(encodeURIComponent(JSON.stringify(getSetup()))));const url=location.href.split('#')[0]+'#setup='+payload;navigator.clipboard.writeText(url).then(()=>showToast('Share link copied')).catch(()=>showToast('Clipboard blocked by browser'));}catch(e){showToast('Could not create share link')}}
function loadHashSetup(){if(!location.hash.startsWith('#setup='))return;try{const raw=decodeURIComponent(escape(atob(location.hash.slice(7))));applySetup(JSON.parse(raw));showToast('Shared setup loaded');}catch(e){console.warn('Invalid setup link',e)}}

// Make control sections collapsible by clicking their headings.
function initCollapsibleSections(){
 document.querySelectorAll('.control-section').forEach(section=>{
   const heading=section.querySelector('h3'); if(!heading||heading.dataset.bound)return; heading.dataset.bound='1';
   heading.title='Click to collapse/expand';
   heading.style.cursor='pointer';
   heading.addEventListener('click',()=>section.classList.toggle('is-collapsed'));
 });
}

// Slightly friendlier keyboard shortcuts.
document.addEventListener('keydown',e=>{
 if((e.ctrlKey||e.metaKey)&&e.key.toLowerCase()==='s'){e.preventDefault();saveSetup()}
 if(e.key==='Escape'){document.querySelectorAll('.modal.show').forEach(m=>m.classList.remove('show'));}
});

// Auto-save a lightweight copy while the user is working.
let autoSaveTimer;
function scheduleAutoSave(){clearTimeout(autoSaveTimer);autoSaveTimer=setTimeout(()=>{try{localStorage.setItem('chartLabAutosave',JSON.stringify(getSetup()))}catch(e){}},700)}
const _renderChart=renderChart;
renderChart=function(){_renderChart();scheduleAutoSave()};

window.addEventListener('DOMContentLoaded',()=>{initCollapsibleSections();loadHashSetup();});
window.addEventListener('beforeunload',()=>{try{localStorage.setItem('chartLabAutosave',JSON.stringify(getSetup()))}catch(e){}});

document.addEventListener('DOMContentLoaded', () => {
  if (window.Chart && window.Chart.defaults && window.Chart.defaults.plugins &&
      window.Chart.defaults.plugins.zoom) {
    const z = window.Chart.defaults.plugins.zoom;
    z.zoom = z.zoom || {};
    z.zoom.wheel = z.zoom.wheel || {};
    z.zoom.wheel.enabled = false;
  }
});

(function(){
  const themes = {
    corporate:["#2563eb","#10b981","#f59e0b","#7c3aed","#ef4444","#06b6d4"],
    ocean:["#0f4c81","#168aad","#52b69a","#76c893","#34a0a4","#1a759f"],
    forest:["#166534","#15803d","#65a30d","#ca8a04","#0f766e","#14532d"],
    sunset:["#dc2626","#ea580c","#f59e0b","#db2777","#9333ea","#7c2d12"],
    purple:["#6d28d9","#7c3aed","#a855f7","#c026d3","#db2777","#4f46e5"],
    mono:["#334155","#475569","#64748b","#94a3b8","#cbd5e1","#1e293b"]
  };

  function hexValid(v){ return /^#[0-9a-f]{6}$/i.test(v); }
  function syncColour(idColor,idHex){
    const c=document.getElementById(idColor), h=document.getElementById(idHex);
    if(!c || !h) return;
    c.addEventListener("input",()=>{h.value=c.value; window.phase2ApplyColours();});
    h.addEventListener("change",()=>{
      if(hexValid(h.value)){c.value=h.value; window.phase2ApplyColours();}
      else h.value=c.value;
    });
  }

  window.phase2Palette = themes.corporate.slice();

  window.phase2ApplyColours = function(){
    const theme=document.getElementById("phase2Theme")?.value || "corporate";
    if(theme !== "custom"){
      window.phase2Palette = (themes[theme] || themes.corporate).slice();
    }else{
      window.phase2Palette = [
        document.getElementById("phase2Color1")?.value || "#2563eb",
        document.getElementById("phase2Color2")?.value || "#10b981",
        document.getElementById("phase2Color3")?.value || "#f59e0b"
      ];
    }

    // Update the standard Chart.js default palette used by this app.
    if(window.Chart){
      Chart.defaults.backgroundColor = window.phase2Palette[0];
      Chart.defaults.borderColor = window.phase2Palette[0];
    }
    if(typeof renderChart === "function") {
      try { renderChart(); } catch(e) {}
    }
  };

  window.phase2SetTheme = function(theme){
    const p=themes[theme] || themes.corporate;
    ["phase2Color1","phase2Color2","phase2Color3"].forEach((id,i)=>{
      const el=document.getElementById(id);
      if(el) el.value=p[i];
    });
    ["phase2Hex1","phase2Hex2","phase2Hex3"].forEach((id,i)=>{
      const el=document.getElementById(id);
      if(el) el.value=p[i];
    });
    window.phase2ApplyColours();
  };

  document.addEventListener("DOMContentLoaded",()=>{
    syncColour("phase2Color1","phase2Hex1");
    syncColour("phase2Color2","phase2Hex2");
    syncColour("phase2Color3","phase2Hex3");

    const t=document.getElementById("phase2Theme");
    if(t) t.addEventListener("change",()=>{
      if(t.value==="custom"){
        window.phase2ApplyColours();
      }else{
        window.phase2SetTheme(t.value);
      }
    });

    // Prevent the annoying chart mouse-wheel zoom without removing page scrolling.
    if(window.Chart && Chart.defaults?.plugins?.zoom){
      Chart.defaults.plugins.zoom.zoom = Chart.defaults.plugins.zoom.zoom || {};
      Chart.defaults.plugins.zoom.zoom.wheel = Chart.defaults.plugins.zoom.zoom.wheel || {};
      Chart.defaults.plugins.zoom.zoom.wheel.enabled = false;
    }
  });
})();

document.addEventListener("DOMContentLoaded",()=>{
  const ids=["p3TitleSize","p3SubtitleSize","p3AxisSize","p3DataLabelSize","p3LegendSize"];
  ids.forEach(id=>{
    const el=document.getElementById(id);
    if(!el) return;
    el.addEventListener("input",()=>{
      const v=document.getElementById(id+"Value");
      if(v) v.textContent=el.value;
      if(typeof renderChart==="function") renderChart();
    });
  });
});

(function(){
  const $=id=>document.getElementById(id);
  const num=v=>Number.isFinite(Number(v))?Number(v):v;

  function updateStatus(text){
    const el=$("p4EditorStatus");
    if(el) el.textContent=text || `${Array.isArray(window.data)?data.length:0} rows · ${Array.isArray(window.columns)?columns.length:0} columns`;
  }
  function rerender(){
    if(typeof renderTable==="function") renderTable();
    if(typeof updateColumnSelectors==="function") updateColumnSelectors();
    if(typeof renderChart==="function"){try{renderChart();}catch(e){console.error(e)}}
    updateStatus();
  }
  function numericColumns(){
    if(!Array.isArray(window.columns)||!Array.isArray(window.data)) return [];
    return columns.filter(c=>data.some(r=>r && r[c]!=="" && r[c]!==null && !isNaN(Number(r[c]))));
  }
  function addRow(){
    const r={}; columns.forEach(c=>r[c]=""); data.push(r); rerender();
  }
  function duplicateLast(){
    if(!data.length){addRow();return}
    data.push({...data[data.length-1]}); rerender();
  }
  function deleteLast(){
    if(data.length){data.pop();rerender()}
  }
  function addCol(){
    let name="New Column",i=2;
    while(columns.includes(name)) name=`New Column ${i++}`;
    columns.push(name); data.forEach(r=>r[name]=""); rerender();
  }
  function renameLast(){
    if(!columns.length)return;
    const old=columns[columns.length-1];
    const next=prompt("New column name:",old);
    if(!next || next===old)return;
    let name=next.trim(),i=2;
    while(columns.includes(name)&&name!==old) name=`${next.trim()} ${i++}`;
    const idx=columns.indexOf(old); columns[idx]=name;
    data.forEach(r=>{r[name]=r[old];delete r[old]});
    rerender();
  }
  function deleteCol(){
    if(columns.length<=1)return;
    const old=columns.pop(); data.forEach(r=>delete r[old]); rerender();
  }
  function parsePaste(text){
    const lines=text.replace(/\r/g,"").split("\n").filter(x=>x.trim());
    if(!lines.length)return;
    const delim=lines[0].includes("\t")?"\t":",";
    const parse=line=>{
      if(delim==="\t")return line.split("\t");
      const a=[];let cur="",q=false;
      for(let i=0;i<line.length;i++){
        const ch=line[i];
        if(ch==='"'){if(q&&line[i+1]==='"'){cur+='"';i++}else q=!q}
        else if(ch===","&&!q){a.push(cur);cur=""}else cur+=ch;
      }a.push(cur);return a;
    };
    const rows=lines.map(parse);
    const heads=[];rows[0].forEach((h,i)=>{
      let n=(h||`Column ${i+1}`).trim()||`Column ${i+1}`,b=n,k=2;
      while(heads.includes(n))n=`${b} ${k++}`;heads.push(n)
    });
    window.columns=heads;
    window.data=rows.slice(1).map(vals=>{
      const r={};heads.forEach((h,i)=>{
        const v=vals[i]??"";
        r[h]=v!==""&&!isNaN(Number(v))?Number(v):v;
      });return r;
    });
    rerender(); updateStatus("Pasted data loaded");
  }
  function paste(){
    const t=prompt("Paste Excel or CSV data here:");
    if(t)parsePaste(t);
  }
  function clearData(){
    data.forEach(r=>columns.forEach(c=>r[c]=""));rerender();updateStatus("Data cleared");
  }

  function bindRange(id,valId){
    const e=$(id),v=$(valId);if(!e)return;
    const sync=()=>{if(v)v.textContent=e.value+"px";if(typeof renderChart==="function")renderChart()};
    e.addEventListener("input",sync);sync();
  }

  function wire(){
    $("p4AddRow")?.addEventListener("click",addRow);
    $("p4DuplicateRow")?.addEventListener("click",duplicateLast);
    $("p4DeleteRow")?.addEventListener("click",deleteLast);
    $("p4AddCol")?.addEventListener("click",addCol);
    $("p4RenameCol")?.addEventListener("click",renameLast);
    $("p4DeleteCol")?.addEventListener("click",deleteCol);
    $("p4Paste")?.addEventListener("click",paste);
    $("p4Clear")?.addEventListener("click",clearData);
    bindRange("p4TitleSize","p4TitleVal");
    bindRange("p4AxisSize","p4AxisVal");
    bindRange("p4LabelSize","p4LabelVal");
    bindRange("p4LegendSize","p4LegendVal");
    $("p4NumberFormat")?.addEventListener("change",()=>typeof renderChart==="function"&&renderChart());
    $("p4LabelPosition")?.addEventListener("change",()=>typeof renderChart==="function"&&renderChart());
    updateStatus();
  }
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",wire);else wire();
})();
