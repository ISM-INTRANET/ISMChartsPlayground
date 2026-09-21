/* Chart Lab V2 — Export Engine */

function downloadPNG(){downloadDataURL(chart.toBase64Image("image/png",1),"chart-lab.png")}
function downloadJPEG(){downloadDataURL(chart.toBase64Image("image/jpeg",1),"chart-lab.jpg")}
function downloadSVG(){const canvas=document.getElementById("chartCanvas"),w=canvas.width,h=canvas.height,img=chart.toBase64Image("image/png"),svg=`<svg xmlns="http://www.w3.org/2000/svg" width="${w}" height="${h}" viewBox="0 0 ${w} ${h}"><image href="${img}" width="${w}" height="${h}"/></svg>`;downloadFile(svg,"chart-lab.svg","image/svg+xml")}
async function downloadPDF(){const{jsPDF}=window.jspdf,canvas=document.getElementById("chartCanvas"),image=canvas.toDataURL("image/png",1),pdf=new jsPDF({orientation:canvas.width>canvas.height?"landscape":"portrait",unit:"px",format:[canvas.width,canvas.height]});pdf.addImage(image,"PNG",0,0,canvas.width,canvas.height);pdf.save("chart-lab.pdf")}
function downloadDataURL(url,filename){const a=document.createElement("a");a.href=url;a.download=filename;a.click()}
function downloadFile(content,filename,type){const blob=new Blob([content],{type}),url=URL.createObjectURL(blob),a=document.createElement("a");a.href=url;a.download=filename;a.click();URL.revokeObjectURL(url)}

(function(){
  const EXPORT_W=2400;
  const EXPORT_H=1350;

  function saveDataURL(url,filename){
    if(!url) throw new Error("No image data was generated.");
    const a=document.createElement("a");
    a.href=url;
    a.download=filename;
    a.style.display="none";
    document.body.appendChild(a);
    a.click();
    a.remove();
  }

  function showExportError(err){
    console.error("Chart Lab export error:",err);
    const detail=err && err.message ? " ("+err.message+")" : "";
    const msg="Export failed"+detail+".";
    if(typeof window.showToast==="function") window.showToast(msg);
    else alert(msg);
  }

  // Clone only plain config objects while preserving functions.
  // This is important because Chart.js options can contain callback functions
  // (for example datalabel formatters and tooltip callbacks).
  function cloneConfig(v,seen=new WeakMap()){
    if(v===null || typeof v!=="object") return v;
    if(typeof v==="function") return v;
    if(seen.has(v)) return seen.get(v);
    if(Array.isArray(v)){
      const a=[]; seen.set(v,a);
      v.forEach(x=>a.push(cloneConfig(x,seen)));
      return a;
    }
    const proto=Object.getPrototypeOf(v);
    if(proto!==Object.prototype && proto!==null) return v;
    const o={}; seen.set(v,o);
    Object.keys(v).forEach(k=>{o[k]=cloneConfig(v[k],seen);});
    return o;
  }

  function enlargeFonts(options,factor){
    const p=options.plugins||{};
    if(p.title?.font?.size) p.title.font.size*=factor;
    if(p.subtitle?.font?.size) p.subtitle.font.size*=factor;
    if(p.legend?.labels?.font?.size) p.legend.labels.font.size*=factor;
    if(p.datalabels?.font?.size) p.datalabels.font.size*=factor;
    const scales=options.scales||{};
    Object.keys(scales).forEach(k=>{
      const sc=scales[k];
      if(sc.ticks?.font?.size) sc.ticks.font.size*=factor;
      if(sc.title?.font?.size) sc.title.font.size*=factor;
    });
  }

  function hdCapture(type="image/png",quality=1){
    if(typeof chart==="undefined" || !chart) throw new Error("Chart is not ready.");
    if(typeof Chart==="undefined") throw new Error("Chart.js is not loaded.");

    const holder=document.createElement("div");
    holder.style.position="fixed";
    holder.style.left="-10000px";
    holder.style.top="0";
    holder.style.width=EXPORT_W+"px";
    holder.style.height=EXPORT_H+"px";
    holder.style.background="#ffffff";
    holder.style.pointerEvents="none";
    holder.style.zIndex="-1";

    const canvas=document.createElement("canvas");
    canvas.width=EXPORT_W;
    canvas.height=EXPORT_H;
    canvas.style.width=EXPORT_W+"px";
    canvas.style.height=EXPORT_H+"px";
    holder.appendChild(canvas);
    document.body.appendChild(holder);

    let exportChart=null;
    try{
      // Use the ORIGINAL chart configuration, not resolved chart.options.
      // chart.options contains Chart.js runtime state; chart.config.options
      // is the user's clean configuration and is safe to reuse.
      const sourceOptions=chart.config && chart.config.options
        ? chart.config.options
        : {};
      const sourceData=chart.config && chart.config.data
        ? chart.config.data
        : {};

      const options=cloneConfig(sourceOptions);
      const data=cloneConfig(sourceData);

      options.responsive=false;
      options.maintainAspectRatio=false;
      options.animation=false;
      options.devicePixelRatio=1;

      // The export is a static image, so disable zoom/pan completely.
      options.plugins=options.plugins||{};
      options.plugins.zoom={
        ...(options.plugins.zoom||{}),
        zoom:{
          ...((options.plugins.zoom||{}).zoom||{}),
          wheel:{enabled:false},
          pinch:{enabled:false},
          drag:{enabled:false}
        },
        pan:{enabled:false}
      };

      // Scale text up for the 2400px canvas.
      enlargeFonts(options,1.55);

      options.layout=options.layout||{};
      options.layout.padding={top:45,right:55,bottom:45,left:55};

      // PNG stays transparent. JPEG gets a white background because JPEG
      // does not support transparency.
      const plugins=[];
      if(type==="image/jpeg"){
        plugins.push({
          id:"chartLabJpegBackground",
          beforeDraw(chartInstance){
            const ctx=chartInstance.ctx;
            ctx.save();
            ctx.globalCompositeOperation="destination-over";
            ctx.fillStyle="#ffffff";
            ctx.fillRect(0,0,chartInstance.width,chartInstance.height);
            ctx.restore();
          }
        });
      }

      exportChart=new Chart(canvas.getContext("2d"),{
        type:chart.config.type,
        data:data,
        options:options,
        plugins:plugins
      });

      exportChart.update("none");

      // Force one synchronous draw before reading the canvas.
      exportChart.draw();

      const url=canvas.toDataURL(type,quality);
      if(!url || url.length<100) throw new Error("The browser returned an empty image.");

      exportChart.destroy();
      holder.remove();
      return url;

    }catch(err){
      console.error("HD export internal error:",err);
      try{if(exportChart) exportChart.destroy();}catch(_){}
      holder.remove();
      throw err;
    }
  }

  window.downloadPNGHD=function(){
    try{
      saveDataURL(
        hdCapture("image/png",1),
        "chart-lab-HD-2400x1350.png"
      );
    }catch(e){showExportError(e);}
  };

  window.downloadJPEGHD=function(){
    try{
      saveDataURL(
        hdCapture("image/jpeg",1),
        "chart-lab-HD-2400x1350.jpg"
      );
    }catch(e){showExportError(e);}
  };

  window.downloadPDFHD=function(){
    try{
      const url=hdCapture("image/png",1);
      if(!window.jspdf) throw new Error("PDF library is not available.");

      const img=new Image();
      img.onload=function(){
        try{
          const pdf=new jspdf.jsPDF({
            orientation:"landscape",
            unit:"px",
            format:[EXPORT_W,EXPORT_H]
          });
          pdf.addImage(url,"PNG",0,0,EXPORT_W,EXPORT_H);
          pdf.save("chart-lab-HD-2400x1350.pdf");
        }catch(e){showExportError(e);}
      };
      img.onerror=()=>showExportError(new Error("Could not prepare PDF image."));
      img.src=url;
    }catch(e){showExportError(e);}
  };

  document.addEventListener("DOMContentLoaded",()=>{
    const bar=document.querySelector(".chart-toolbar .export-buttons")
      || document.querySelector(".chart-toolbar");
    if(!bar) return;

    [...bar.querySelectorAll("button")].forEach(b=>{
      const t=b.textContent.trim().toUpperCase();
      if(t==="PNG") b.onclick=window.downloadPNGHD;
      if(t==="JPEG") b.onclick=window.downloadJPEGHD;
      if(t==="PDF") b.onclick=window.downloadPDFHD;
    });

    if(!bar.querySelector('[data-phase3-hd="png"]')){
      const b=document.createElement("button");
      b.className="btn btn-primary";
      b.type="button";
      b.dataset.phase3Hd="png";
      b.textContent="HD PNG";
      b.title="2400 × 1350 high-resolution PNG with transparent background";
      b.addEventListener("click",window.downloadPNGHD);
      bar.appendChild(b);
    }

    if(!bar.querySelector('[data-phase3-hd="jpeg"]')){
      const b=document.createElement("button");
      b.className="btn";
      b.type="button";
      b.dataset.phase3Hd="jpeg";
      b.textContent="HD JPEG";
      b.title="2400 × 1350 high-resolution JPEG";
      b.addEventListener("click",window.downloadJPEGHD);
      bar.appendChild(b);
    }
  });
})();
