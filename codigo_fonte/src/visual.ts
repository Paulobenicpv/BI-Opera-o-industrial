import powerbi from 'powerbi-visuals-api';
import {Panel} from './panel';
import {Machine} from './factory';
import '../style/visual.less';
export class Visual implements powerbi.extensibility.visual.IVisual {
 private host:powerbi.extensibility.visual.IVisualHost;private selection:powerbi.extensibility.ISelectionManager;private panel:Panel;
 private map=new Map<string,powerbi.visuals.ISelectionId>();
 constructor(options:powerbi.extensibility.visual.VisualConstructorOptions){this.host=options.host;this.selection=this.host.createSelectionManager();
 this.panel=new Panel(options.element,(id,multi)=>{const selectionId=this.map.get(id);if(selectionId)this.selection.select(selectionId,multi).then(()=>this.sync());},()=>{this.selection.clear().then(()=>this.sync());});
 this.selection.registerOnSelectCallback(()=>this.sync());}
 private sync(){const selected=this.selection.getSelectionIds();this.panel.setSelected([...this.map].filter(([,id])=>selected.some(s=>(s as powerbi.visuals.ISelectionId).equals(id))).map(([name])=>name));}
 update(options:powerbi.extensibility.visual.VisualUpdateOptions){this.host.eventService.renderingStarted(options);
 try{const categorical=options.dataViews?.[0]?.categorical;const cat=categorical?.categories?.[0];this.map.clear();
 const values=categorical?.values||[];const num=(role:string,i:number):number|null=>{const column=values.find(c=>c.source.roles?.[role]);const v=column?.values[i];return typeof v==='number'&&Number.isFinite(v)?v:null;};
 const machines:Machine[]=(cat?.values||[]).slice(0,60).map((v,i)=>{const id=String(v??'(sem nome)');this.map.set(id,this.host.createSelectionIdBuilder().withCategory(cat,i).createSelectionId());const raw=num('status',i);return{id,status:raw!==null&&[0,1,2].includes(raw)?raw:null,oee:num('oee',i),mtbf:num('mtbf',i),mttr:num('mttr',i),production:num('production',i),orders:num('orders',i)};});
 const enabled=options.dataViews?.[0]?.metadata?.objects?.motion?.enabled;this.motionEnabled=enabled!==false;this.panel.enableMotion(this.motionEnabled);
 this.panel.setData(machines,(cat?.values.length||0)>60?'Limite de 60 máquinas. Filtre a linha ou setor para detalhar.':'');this.sync();this.panel.resize();this.host.eventService.renderingFinished(options);
 }catch(e){this.host.eventService.renderingFailed(options,String(e));}}
 getFormattingModel():powerbi.visuals.FormattingModel{return {cards:[{displayName:'Animação',uid:'motionCard',groups:[{displayName:'Movimento',uid:'motionGroup',slices:[{displayName:'Habilitar animação',uid:'motionEnabled',control:{type:powerbi.visuals.FormattingComponent.ToggleSwitch,properties:{descriptor:{objectName:'motion',propertyName:'enabled'},value:this.motionEnabled}}}]}]}]};}
 private motionEnabled=true;
 destroy(){this.panel.destroy();}
}
