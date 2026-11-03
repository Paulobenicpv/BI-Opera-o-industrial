import {Panel} from './panel';
const data=[
{id:'Prensa 01',status:0,oee:.86,mtbf:42,mttr:1.2,production:1340,orders:0},
{id:'Solda 02',status:1,oee:.72,mtbf:28,mttr:1.8,production:980,orders:1},
{id:'Robô 03',status:0,oee:.91,mtbf:56,mttr:.7,production:2050,orders:0},
{id:'Pintura 04',status:0,oee:.54,mtbf:16,mttr:2.4,production:740,orders:2},
{id:'Montagem 05',status:1,oee:.75,mtbf:31,mttr:1.5,production:1120,orders:1},
{id:'Inspeção 06',status:0,oee:.89,mtbf:49,mttr:.9,production:1880,orders:0}];
let selected:string[]=[];
const panel=new Panel(document.getElementById('app'),(id,multi)=>{selected=multi?(selected.includes(id)?selected.filter(x=>x!==id):[...selected,id]):selected.length===1&&selected[0]===id?[]:[id];panel.setSelected(selected);},()=>{selected=[];panel.setSelected([]);});
panel.setData(data,'PRÉVIA LOCAL · LINHA AUTOMOTIVA FICTÍCIA · a seleção filtra o relatório somente no Power BI');
window.addEventListener('resize',()=>panel.resize());

const controls=document.createElement('div');controls.className='demo-controls';controls.style.cssText='display:flex;align-items:center;gap:12px;padding:9px 20px;background:#142638;color:#a1b8ce;font:11px Segoe UI;flex-wrap:wrap';const label=document.createElement('span');label.textContent='TESTE DA PRÉVIA:';const stop=document.createElement('button');stop.textContent='Demonstrar parada na pintura';stop.style.cssText='background:#30465b;border:1px solid #52758b;color:#e1f0fb;padding:6px 10px;border-radius:4px;cursor:pointer';let stopped=false;stop.onclick=()=>{stopped=!stopped;data[3].status=stopped?2:0;stop.textContent=stopped?'Retomar produção':'Demonstrar parada na pintura';panel.setData(data,'PRÉVIA LOCAL · DADOS ILUSTRATIVOS · o teste altera apenas a demonstração');};controls.append(label,stop);document.getElementById('app').prepend(controls);panel.resize();
