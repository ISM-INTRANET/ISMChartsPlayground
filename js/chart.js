Chart.register(ChartDataLabels);
let chart;
function renderTable(){
const table=document.getElementById("dataTable");table.innerHTML="";
const thead=document.createElement("thead"),hr=document.createElement("tr"),rh=document.createElement("th");rh.textContent="#";hr.appendChild(rh);
columns.forEach((column,index)=>{const th=document.createElement("th"),input=document.createElement("input");input.value=column;input.addEventListener("change",()=>{const oldName=columns[index],newName=input.value.trim()||oldName;if(newName!==oldName){data.forEach(r=>{r[newName]=r[oldName];delete r[oldName]});columns[index]=newName;renderTable();updateColumnSelectors();renderChart();}});th.appendChild(input);hr.appendChild(th)});thead.appendChild(hr);table.appendChild(thead);
const tbody=document.createElement("tbody");
data.forEach((row,ri)=>{const tr=document.createElement("tr"),num=document.createElement("td");num.className="row-number";num.textContent=ri+1;tr.appendChild(num);columns.forEach(c=>{const td=document.createElement("td"),input=document.createElement("input");input.value=row[c]??"";input.addEventListener("input",e=>{let v=e.target.value;if(v!==""&&!isNaN(v))v=Number(v);row[c]=v;renderChart()});td.appendChild(input);tr.appendChild(td)});tbody.appendChild(tr)});table.appendChild(tbody);
}
function updateColumnSelectors(){
["xColumn","sizeColumn","groupColumn","labelColumn"].forEach(id=>{const s=document.getElementById(id),cur=s.value;s.innerHTML='<option value="">None</option>';columns.forEach(c=>{const o=document.createElement("option");o.value=c;o.textContent=c;s.appendChild(o)});if(columns.includes(cur))s.value=cur});
if(!document.getElementById("xColumn").value&&columns.length)document.getElementById("xColumn").value=columns[0];renderSeriesSelectors();
}
function renderSeriesSelectors(){
const c=document.getElementById("seriesContainer");c.innerHTML="";
selectedSeries.forEach((series,i)=>{const row=document.createElement("div");row.className="series-row";const s=document.createElement("select");columns.forEach(col=>{const o=document.createElement("option");o.value=col;o.textContent=col;o.selected=col===series;s.appendChild(o)});s.onchange=()=>{selectedSeries[i]=s.value;renderChart()};row.appendChild(s);if(selectedSeries.length>1){const b=document.createElement("button");b.className="remove-series";b.textContent="×";b.onclick=()=>{selectedSeries.splice(i,1);renderSeriesSelectors();renderChart()};row.appendChild(b)}c.appendChild(row)});
}
function addSeries(){const a=columns.find(c=>!selectedSeries.includes(c));if(a){selectedSeries.push(a);renderSeriesSelectors();renderChart()}}
function renderChart(){
const canvas=document.getElementById("chartCanvas"),ctx=canvas.getContext("2d"),type=document.getElementById("chartType").value;
const xColumn=document.getElementById("xColumn").value,title=document.getElementById("chartTitle").value,subtitle=document.getElementById("chartSubtitle").value;
const showLegend=document.getElementById("showLegend").checked,showLabels=document.getElementById("showLabels").checked,showGrid=document.getElementById("showGrid").checked,animation=document.getElementById("animation").checked;
const pointSize=+document.getElementById("pointSize").value,lineWidth=+document.getElementById("lineWidth").value,background=document.getElementById("backgroundColor").value;
document.getElementById("opacityValue").textContent=document.getElementById("opacity").value+"%";document.getElementById("pointSizeValue").textContent=pointSize;document.getElementById("lineWidthValue").textContent=lineWidth;
if(chart)chart.destroy();
const labels=data.map(r=>r[xColumn]);let chartType=type,datasets=[];
if(type==="pie"||type==="doughnut"){const s=selectedSeries[0];datasets=[{label:s,data:data.map(r=>+r[s]||0),backgroundColor:generateColors(data.length),borderWidth:1}]}
else if(type==="scatter"){const x=xColumn,y=selectedSeries[0];datasets=[{label:y,data:data.map(r=>({x:+r[x]||0,y:+r[y]||0})),pointRadius:pointSize,backgroundColor:generateColors(1)[0]}];chartType="scatter"}
else if(type==="bubble"){const x=xColumn,y=selectedSeries[0],sc=document.getElementById("sizeColumn").value;datasets=[{label:y,data:data.map(r=>({x:+r[x]||0,y:+r[y]||0,r:Math.max(3,Math.sqrt(+r[sc]||5))})),backgroundColor:generateColors(1)[0]}];chartType="bubble"}
else if(type==="histogram"){const s=selectedSeries[0],values=data.map(r=>+r[s]).filter(v=>!isNaN(v)),bins=createHistogram(values);createChart(ctx,"bar",bins.labels,[{label:s,data:bins.values,backgroundColor:generateColors(1)[0]}],title,subtitle,showLegend,showLabels,showGrid,animation,lineWidth,pointSize,background);return}
else{selectedSeries.forEach((s,i)=>{let d=data.map(r=>+r[s]||0);if(type==="percentBar")d=data.map(r=>{const total=selectedSeries.reduce((sum,ss)=>sum+(+r[ss]||0),0);return total?((+r[s]||0)/total)*100:0});datasets.push({label:s,data:d,borderWidth:lineWidth,borderRadius:5,pointRadius:pointSize,fill:type==="area",backgroundColor:generateColors(selectedSeries.length)[i],borderColor:generateColors(selectedSeries.length)[i]})});if(type==="horizontalBar"||type==="area"||type==="stackedBar"||type==="percentBar"||type==="combo")chartType=type==="area"?"line":"bar";if(type==="combo"&&datasets.length>1)datasets[1].type="line"}
createChart(ctx,chartType,labels,datasets,title,subtitle,showLegend,showLabels,showGrid,animation,lineWidth,pointSize,background);
}
function createChart(ctx,chartType,labels,datasets,title,subtitle,showLegend,showLabels,showGrid,animation,lineWidth,pointSize,background){
const selected=document.getElementById("chartType").value,
horizontal=selected==="horizontalBar",
stacked=selected==="stackedBar",
percent=selected==="percentBar",
yMin=document.getElementById("yMin").value,
yMax=document.getElementById("yMax").value,
titleSize=+(document.getElementById("p3TitleSize")?.value||20),
subtitleSize=+(document.getElementById("p3SubtitleSize")?.value||13),
axisSize=+(document.getElementById("p3AxisSize")?.value||12),
dataLabelSize=+(document.getElementById("p3DataLabelSize")?.value||11),
legendSize=+(document.getElementById("p3LegendSize")?.value||12);

chart=new Chart(ctx,{
  type:chartType,
  data:{labels,datasets},
  options:{
    responsive:true,
    maintainAspectRatio:false,
    indexAxis:horizontal?"y":"x",
    animation:{duration:animation?700:0},
    plugins:{
      legend:{display:showLegend,position:"top",labels:{font:{size:legendSize}}},
      title:{display:!!title,text:title,font:{size:titleSize,weight:"700"},padding:{bottom:6}},
      subtitle:{display:!!subtitle,text:subtitle,font:{size:subtitleSize}},
      datalabels:{
        display:showLabels,
        anchor:"end",
        align:"top",
        font:{size:dataLabelSize,weight:"600"},
        formatter:v=>formatNumber(v)
      },
      tooltip:{enabled:true},
      zoom:{zoom:{wheel:{enabled:false},pinch:{enabled:true},mode:"xy"},pan:{enabled:true,mode:"xy"}}
    },
    scales:(chartType==="pie"||chartType==="doughnut"||chartType==="polarArea")?{}:{
      x:{
        stacked:stacked||percent,
        grid:{display:showGrid},
        ticks:{font:{size:axisSize}},
        title:{display:!!document.getElementById("xAxisTitle").value,text:document.getElementById("xAxisTitle").value,font:{size:axisSize,weight:"600"}}
      },
      y:{
        stacked:stacked||percent,
        min:yMin!==""?+yMin:undefined,
        max:percent?100:(yMax!==""?+yMax:undefined),
        grid:{display:showGrid},
        ticks:{font:{size:axisSize},callback:v=>formatNumber(v)},
        title:{display:!!document.getElementById("yAxisTitle").value,text:document.getElementById("yAxisTitle").value,font:{size:axisSize,weight:"600"}}
      }
    }
  }
});
document.getElementById("chartStatus").textContent=`${data.length} rows · ${columns.length} columns · ${datasets.length} series`;
}
function formatNumber(v){const f=document.getElementById("numberFormat").value;if(f==="percent")return Number(v).toLocaleString()+"%";if(f==="currency")return "$"+Number(v).toLocaleString();return Number(v).toLocaleString()}
function generateColors(n){
  const palette = (window.phase2Palette && window.phase2Palette.length)
    ? window.phase2Palette
    : ["#2563eb","#10b981","#f59e0b","#7c3aed","#ef4444","#06b6d4"];
  return Array.from({length:n}, (_,i) => palette[i % palette.length]);
}
function addRow(){const r={};columns.forEach(c=>r[c]="");data.push(r);renderTable();renderChart()}
function deleteLastRow(){if(data.length>1){data.pop();renderTable();renderChart()}}
function addColumn(){let name="Column"+(columns.length+1),n=1;while(columns.includes(name)){n++;name="Column"+(columns.length+n)}columns.push(name);data.forEach(r=>r[name]="");renderTable();updateColumnSelectors();renderChart()}
function deleteLastColumn(){if(columns.length<=1)return;const c=columns.pop();data.forEach(r=>delete r[c]);selectedSeries=selectedSeries.filter(s=>columns.includes(s));if(!selectedSeries.length)selectedSeries=[columns[1]||columns[0]];renderTable();updateColumnSelectors();renderChart()}
function clearData(){data=[{Column1:"",Column2:""}];columns=["Column1","Column2"];selectedSeries=["Column2"];renderTable();updateColumnSelectors();renderChart()}
function newDataset(){clearData()}
function resetDataset(){data=[{Month:"Jan",Revenue:100000,Expenses:70000,Customers:120},{Month:"Feb",Revenue:115000,Expenses:72000,Customers:145},{Month:"Mar",Revenue:130000,Expenses:76000,Customers:160},{Month:"Apr",Revenue:142000,Expenses:79000,Customers:185},{Month:"May",Revenue:155000,Expenses:81000,Customers:205},{Month:"Jun",Revenue:168000,Expenses:85000,Customers:230}];columns=Object.keys(data[0]);selectedSeries=["Revenue"];document.getElementById("chartTitle").value="Monthly Revenue";document.getElementById("chartType").value="bar";renderTable();updateColumnSelectors();renderChart()}

