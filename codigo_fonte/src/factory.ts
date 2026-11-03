import * as THREE from 'three';
import {OrbitControls} from 'three/examples/jsm/controls/OrbitControls.js';
export interface Machine {id:string;status:number|null;oee:number|null;mtbf:number|null;mttr:number|null;production:number|null;orders:number|null;}
const COLORS=[0x32e6ad,0xffbd53,0xff526b];
const STATIONS=[[-15,-5],[-5,-5],[5,-5],[15,-5],[15,5],[5,5]];
const STAGES=['01 · ESTAMPARIA','02 · SOLDA','03 · CARROCERIA','04 · PINTURA','05 · MONTAGEM','06 · QUALIDADE'];
interface Car {root:THREE.Group;body:THREE.Mesh[];shell:THREE.Group;wheels:THREE.Group;glass:THREE.Group;phase:number;}
interface Robot {pivot:THREE.Group;elbow:THREE.Group;tip:THREE.Mesh;index:number;offset:number;}
export class Factory {
 private scene=new THREE.Scene();private camera=new THREE.PerspectiveCamera(38,1,.1,300);private renderer:THREE.WebGLRenderer;private controls:OrbitControls;
 private data:Machine[]=[];private selected:string[]=[];private groups:THREE.Group[]=[];private dynamic=new THREE.Group();private roof=new THREE.Group();
 private lamps:THREE.Mesh[]=[];private rings:THREE.Mesh[]=[];private robots:Robot[]=[];private press:THREE.Mesh;private rollers:THREE.Mesh[]=[];private cars:Car[]=[];private forklift:THREE.Group;
 private ray=new THREE.Raycaster();private down={x:0,y:0};private frame=0;private disposed=false;private paused=false;private clock=0;private last=0;private flow=0;private beltSpeed=.035;
 private renderFrames=0;
 constructor(private container:HTMLElement,private onSelect:(id:string,multi:boolean)=>void){
 this.renderer=new THREE.WebGLRenderer({antialias:true,powerPreference:'high-performance'});this.renderer.setPixelRatio(Math.min(devicePixelRatio,1.7));this.renderer.setClearColor(0x101b29);this.renderer.outputColorSpace=THREE.SRGBColorSpace;this.renderer.toneMapping=THREE.ACESFilmicToneMapping;this.renderer.toneMappingExposure=1.25;
 container.appendChild(this.renderer.domElement);this.controls=new OrbitControls(this.camera,this.renderer.domElement);this.controls.enableDamping=true;this.controls.minDistance=16;this.controls.maxDistance=105;this.controls.maxPolarAngle=Math.PI/2.12;this.reset();
 this.scene.add(new THREE.HemisphereLight(0xe5f5ff,0x525f73,2.3));const sun=new THREE.DirectionalLight(0xfff3da,3);sun.position.set(-20,40,25);this.scene.add(sun);const fill=new THREE.DirectionalLight(0xb2d8ff,1.6);fill.position.set(20,15,-20);this.scene.add(fill);
 this.buildSite();this.scene.add(this.dynamic);this.renderer.domElement.addEventListener('pointerdown',this.pointerDown);this.renderer.domElement.addEventListener('pointerup',this.pointerUp);this.renderer.domElement.addEventListener('webglcontextlost',this.contextLost);this.animate(0);
 }
 private mat(color:number,emissive=false){return new THREE.MeshStandardMaterial({color,roughness:.58,metalness:.22,...(emissive?{emissive:color,emissiveIntensity:1}:{})});}
 private box(parent:THREE.Object3D,w:number,h:number,d:number,x:number,y:number,z:number,color:number=0x8fa4ad){const m=new THREE.Mesh(new THREE.BoxGeometry(w,h,d),this.mat(color));m.position.set(x,y,z);parent.add(m);return m;}
 private cylinder(parent:THREE.Object3D,r:number,h:number,x:number,y:number,z:number,color:number){const m=new THREE.Mesh(new THREE.CylinderGeometry(r,r,h,12),this.mat(color));m.position.set(x,y,z);parent.add(m);return m;}
 private label(parent:THREE.Object3D,text:string,x:number,y:number,z:number,w:number=7,color='#dbeaf5',floor=true){const c=document.createElement('canvas');c.width=768;c.height=128;const ctx=c.getContext('2d');if(!ctx)return;ctx.fillStyle='#172c3c';ctx.fillRect(0,0,768,128);ctx.strokeStyle='#456170';ctx.lineWidth=3;ctx.strokeRect(2,2,764,124);ctx.fillStyle=color;ctx.font='bold 43px sans-serif';ctx.textAlign='center';ctx.fillText(text.slice(0,34),384,80);const tex=new THREE.CanvasTexture(c);tex.colorSpace=THREE.SRGBColorSpace;const m=new THREE.Mesh(new THREE.PlaneGeometry(w,w/6),new THREE.MeshBasicMaterial({map:tex,side:THREE.DoubleSide}));m.position.set(x,y,z);if(floor)m.rotation.x=-Math.PI/2;parent.add(m);}
 private buildSite(){
 // Open-front industrial hall: envelope, roof trusses, offices and logistics.
 this.box(this.scene,56,.5,40,0,-.5,0,0x344450);this.box(this.scene,49,.16,31,0,-.16,-1,0xaeb5b4);
 this.box(this.scene,49,5,.25,0,2.3,-16.4,0x627b87);this.box(this.scene,.25,5,31,-24.5,2.3,-1,0x78909a);
 for(let x=-23;x<=23;x+=5.8){this.box(this.scene,.22,7,.22,x,3.4,-16.2,0xd2d9d7);this.box(this.scene,.22,7,.22,x,3.4,14.1,0xa6b5b8);this.box(this.roof,.18,.24,30.4,x,7, -1,0x95aab0);}
 this.box(this.roof,48,.2,.25,0,7,-16.1,0xa8b9bd);this.box(this.roof,48,.2,.25,0,7,14.1,0xa8b9bd);
 for(let x=-20;x<24;x+=8){this.box(this.roof,4,.12,.35,x,6.85,-7,0xf7ffe9);this.box(this.roof,4,.12,.35,x,6.85,7,0xf7ffe9);}this.roof.visible=false;this.scene.add(this.roof);
 // Pedestrian lanes, loading apron and hazard markings.
 for(let z of [-11,11]){this.box(this.scene,43,.025,.1,0,.03,z,0xffc64b);for(let x=-21;x<22;x+=3)this.box(this.scene,.9,.03,.09,x,.035,z+.55,0xe4d5a0);}
 for(let x=-22;x<24;x+=3)this.box(this.scene,.95,.03,.12,x,.03,16,0xe6e7da);
 for(let z=-13;z<=13;z+=2)this.box(this.scene,.1,.03,.9,-21,.03,z,0xffc64b);
 this.label(this.scene,'RECEBIMENTO',-16,.05,-13.5,8,'#95e2f3');this.label(this.scene,'LINHA DE MONTAGEM',-2,.05,0,10,'#ffe29a');this.label(this.scene,'EXPEDIÇÃO',-14,.05,11.5,7,'#8df3ce');
 // Warehouse racks with stocked parts.
 for(let row=0;row<2;row++){const x=-18+row*6;for(let k=0;k<3;k++){const z=-13;[-2,2].forEach(dx=>this.box(this.scene,.12,3.6,.12,x+dx,1.8,z));[.3,1.55,2.8].forEach(y=>{this.box(this.scene,4.5,.12,2,x,y,z,0x426a83);for(let j=0;j<3;j++)this.box(this.scene,.9,.85,1.4,x-1.3+j*1.3,y+.49,z,0xcaa57a);});break;}}
 for(let x=-5;x<=5;x+=5){for(let i=0;i<3;i++)this.box(this.scene,2.7,.18,1.5,x,.15+i*.22,-13,0x879ca5);}
 // Office at rear with glazing, desks and roof signage.
 this.box(this.scene,9,3.7,4,18,1.8,-13.5,0x466372);this.box(this.scene,8.4,1.65,.06,18,2.3,-11.45,0x3c9dba);for(let x=14;x<=22;x+=2)this.box(this.scene,.1,2,.15,x,2.3,-11.35,0xd2e0df);this.label(this.scene,'CONTROLE DE PRODUÇÃO',18,4,-11.3,8,'#b2f6e3',false);
 // Overhead bridge crane and suspended hoist.
 [-19,19].forEach(x=>{this.box(this.scene,.3,6.3,.3,x,3.1,-9);});
 this.box(this.scene,39,.5,.55,0,6.25,-9,0xf2b640);this.box(this.scene,1.5,.8,1,0,5.9,-9,0xe8a830);this.cylinder(this.scene,.025,2.3,0,4.4,-9,0x253644);this.box(this.scene,.6,.2,.4,0,3.25,-9,0xf2b640);
 // Truck and finished-car parking area.
 const truck=new THREE.Group();truck.position.set(-17,.15,18);this.scene.add(truck);this.box(truck,7,2.7,3,0,2,0,0xe4e8e5);this.box(truck,2.2,2.4,2.8,4.6,1.8,0,0x27aab0);this.box(truck,.12,1.1,2.35,5.75,2.2,0,0x173644);[-2.5,2.5,4.6].forEach(x=>[-1.5,1.5].forEach(z=>{const w=this.cylinder(truck,.6,.35,x,.6,z,0x18252f);w.rotation.x=Math.PI/2;}));
 for(let i=0;i<3;i++){const c=this.car(i);c.root.position.set(-13+i*5,0,10);c.shell.visible=c.wheels.visible=c.glass.visible=true;c.root.rotation.y=Math.PI/2;c.body.forEach(m=>(m.material as THREE.MeshStandardMaterial).color.setHex([0x27b7bb,0xe5e9e5,0xd4a54c][i]));this.scene.add(c.root);}
 this.forklift=this.createForklift();this.scene.add(this.forklift);
 // Conveyor and all six physical production cells are always present.
 this.conveyor(-15,-5,15,-5);this.conveyor(15,-5,15,5);this.conveyor(15,5,-15,5);
 STATIONS.forEach(([x,z],i)=>this.station(x,z,i));
 for(let i=0;i<8;i++){const car=this.car(i);car.phase=i/8;this.scene.add(car.root);this.cars.push(car);}
 }
 private conveyor(x1:number,z1:number,x2:number,z2:number){const horizontal=z1===z2;const len=Math.abs(x2-x1)+Math.abs(z2-z1);const group=new THREE.Group();group.position.set((x1+x2)/2,0,(z1+z2)/2);if(!horizontal)group.rotation.y=Math.PI/2;this.scene.add(group);
 this.box(group,len+.5,.42,2.5,0,.5,0,0x293d4a);[-1.35,1.35].forEach(z=>{this.box(group,len+.5,.2,.14,0,.83,z,0xd0b64e);for(let x=-len/2;x<=len/2;x+=3)this.box(group,.12,.7,.12,x,.34,z,0x506672);});
 for(let x=-len/2;x<=len/2;x+=.65){const roller=this.cylinder(group,.11,2.3,x,.82,0,0x85979d);roller.rotation.x=Math.PI/2;this.rollers.push(roller);}
 }
 private station(x:number,z:number,index:number){const g=new THREE.Group();g.position.set(x,0,z);g.userData.station=index;this.scene.add(g);this.groups.push(g);
 this.box(g,7,.035,5.8,0,.02,0,0x647c7f);this.label(g,STAGES[index],0,.08,z<0?-3.1:3.1,7,'#fff3ce');
 for(let dx=-3.3;dx<=3.3;dx+=.6){const stripe=this.box(g,.32,.03,.3,dx,.05,-2.65,0xefc34d);stripe.rotation.y=.6;}
 const ring=this.box(g,7,.035,.16,0,.07,z<0?-2.75:2.75,0x34cbb1);this.rings.push(ring);
 const lamp=this.cylinder(g,.14,.3,2.9,3.25,-1.8,0x8495a0);this.box(g,.08,2.8,.08,2.9,1.7,-1.8,0x5b6f7b);this.lamps.push(lamp);
 // Electrical cabinet, HMI and guard fences.
 this.box(g,.85,1.7,.65,-2.8,.9,-2.1,0xd5dfdd);this.box(g,.55,.4,.04,-2.8,1.38,-1.76,0x20475a);this.box(g,.12,.12,.06,-2.6,1,-1.75,0xed6652);
 if(index===0){[-2,2].forEach(a=>this.box(g,.45,3.8,.8,a,2,-.1,0x829da8));this.box(g,4.5,.8,1.6,0,4,-.1,0xf1b53c);this.press=this.box(g,3.1,.4,1.8,0,2.6,0,0x627e8e);}
 if(index===1||index===2||index===4){this.robot(g,-2.5,index===4?1.8:-1.9,index,index);this.robot(g,2.5,index===4?-1.8:1.9,index,index+1.8);}
 if(index===3){[-2.6,2.6].forEach(a=>{this.box(g,.25,3.6,3.6,a,2,0,0xb4d2d3);this.box(g,.12,1.6,2.8,a*.97,2,0,0x67b6c4);});this.box(g,5.5,.3,3.6,0,3.9,0,0x8eb0b6);this.robot(g,-1.7,-1.3,index,0);this.box(g,.16,.06,2.8,0,3.5,0,0x9df7dd);}
 if(index===5){[-2,2].forEach(a=>this.box(g,.16,3.5,.2,a,1.9,0,0x3d8791));this.box(g,4.1,.2,.4,0,3.7,0,0x49c5ba);this.box(g,3,.06,.08,0,3.5,0,0x84ffe0);}
 }
 private robot(parent:THREE.Object3D,x:number,z:number,index:number,offset:number){const base=new THREE.Group();base.position.set(x,0,z);parent.add(base);this.cylinder(base,.6,.5,0,.3,0,0x384d59);const pivot=new THREE.Group();pivot.position.y=.55;base.add(pivot);this.box(pivot,.48,1.5,.48,0,.75,0,0xf1ab38);this.cylinder(pivot,.32,.65,0,1.5,0,0x354c5a).rotation.z=Math.PI/2;const elbow=new THREE.Group();elbow.position.set(0,1.5,0);pivot.add(elbow);this.box(elbow,1.5,.33,.34,.65,0,0,0xf2ad36);const tip=this.box(elbow,.25,.4,.25,1.5,-.12,0,0x78949a);const spark=new THREE.Mesh(new THREE.SphereGeometry(.085,6,4),this.mat(0xabf5ff,true));spark.position.set(1.5,-.38,0);spark.name='spark';elbow.add(spark);this.robots.push({pivot,elbow,tip,index,offset});}
 private car(n:number):Car{const root=new THREE.Group();const body:THREE.Mesh[]=[];body.push(this.box(root,3.2,.22,1.6,0,1.13,0,0x81979e));const shell=new THREE.Group();root.add(shell);body.push(this.box(shell,3.25,.45,1.65,0,1.45,0,0x81979e));body.push(this.box(shell,1.65,.55,1.48,-.15,1.95,0,0x81979e));this.box(shell,.6,.3,1.65,1.3,1.64,0,0x81979e);const glass=new THREE.Group();shell.add(glass);this.box(glass,1.25,.38,1.51,-.15,1.98,0,0x183d51);this.box(glass,.14,.45,1.55,-.15,1.98,0,0x96aab0);this.box(glass,.25,.1,.45,1.65,1.55,-.53,0xfff8c8);this.box(glass,.25,.1,.45,1.65,1.55,.53,0xfff8c8);const wheels=new THREE.Group();root.add(wheels);[-1.05,1.05].forEach(x=>[-.83,.83].forEach(z=>{const tire=this.cylinder(wheels,.4,.25,x,1.05,z,0x1b252b);tire.rotation.x=Math.PI/2;const hub=this.cylinder(wheels,.19,.28,x,1.05,z,0xacc0c6);hub.rotation.x=Math.PI/2;}));shell.visible=wheels.visible=glass.visible=false;return{root,body,shell,wheels,glass,phase:n/8};}
 private createForklift(){const g=new THREE.Group();this.box(g,1.6,.8,1.1,0,.6,0,0xe6b33d);this.box(g,.6,.7,1,-.5,1.2,0,0xe6b33d);this.box(g,1.2,.12,1.25,0,2.2,0,0x243c49);[-.45,.45].forEach(z=>{this.box(g,.1,1.6,.1,.45,1.4,z,0x243c49);this.box(g,.1,2,.1,.95,1,z,0x243c49);this.box(g,1,.1,.13,1.4,.32,z,0x647d8a);});[-.55,.55].forEach(x=>[-.6,.6].forEach(z=>{const w=this.cylinder(g,.3,.2,x,.3,z,0x1b2931);w.rotation.x=Math.PI/2;}));this.box(g,.9,.6,.9,1.5,.65,0,0xcda775);return g;}
 private getStage(m:Machine,i:number){const s=m.id.toLocaleLowerCase();if(/prensa 04/.test(s))return 3;if(/prensa|estamp/.test(s))return 0;if(/solda|cnc 02/.test(s))return 1;if(/carroceria|rob[oô] 03/.test(s))return 2;if(/pintura|prensa 04/.test(s))return 3;if(/montagem|cnc 05/.test(s))return 4;if(/inspe|qualidade|rob[oô] 06/.test(s))return 5;return i%6;}
 private stageData(i:number){return this.data.filter((m,j)=>this.getStage(m,j)===i);}
 private status(i:number){const items=this.stageData(i);return items.length?Math.max(...items.map(m=>m.status??-1)):-1;}
 setData(data:Machine[]){this.data=data;this.groups.forEach((g,i)=>{const list=this.stageData(i);g.userData.id=list[0]?.id;const status=this.status(i);const color=status<0?0x8799a2:COLORS[status];const lamp=this.lamps[i].material as THREE.MeshStandardMaterial;lamp.color.setHex(color);lamp.emissive.setHex(color);lamp.emissiveIntensity=.8;(this.rings[i].material as THREE.MeshStandardMaterial).color.setHex(color);});this.setSelected(this.selected);}
 setSelected(ids:string[]){this.selected=ids;this.rings.forEach((m,i)=>{const active=this.stageData(i).some(d=>ids.includes(d.id));m.scale.y=active?3:1;(m.material as THREE.MeshStandardMaterial).emissive.setHex(active?0x3a887b:0x000000);});}
 setPaused(p:boolean){this.paused=p;}
 setRoof(visible:boolean){this.roof.visible=visible;}
 setView(mode:string){if(mode==='top'){this.camera.position.set(0,61,.1);this.controls.target.set(0,0,0);}else if(mode==='line'){this.camera.position.set(32,15,25);this.controls.target.set(0,1,-2);}else this.reset();this.controls.update();}
 reset(){this.camera.position.set(43,42,52);this.controls.target.set(0,0,0);this.controls.update();}
 resize(w:number,h:number){this.camera.aspect=Math.max(w,1)/Math.max(h,1);this.camera.updateProjectionMatrix();this.renderer.setSize(Math.max(1,w),Math.max(1,h));}
 private positionCar(car:Car,phase:number){const d=phase*70;let stage:number;if(d<30){car.root.position.set(-15+d,0,-5);car.root.rotation.y=0;stage=Math.floor(d/10);}else if(d<40){car.root.position.set(15,0,-5+(d-30));car.root.rotation.y=-Math.PI/2;stage=3;}else{car.root.position.set(15-(d-40),0,5);car.root.rotation.y=Math.PI;stage=d<50?4:5;}car.shell.visible=stage>=1;car.glass.visible=stage>=2;car.wheels.visible=stage>=4;const col=stage>=3?[0x1bacb9,0xd9e5e4,0xd79c3d][Math.round(car.phase*8)%3]:0x899da4;car.body.forEach(m=>(m.material as THREE.MeshStandardMaterial).color.setHex(col));}
 private animate=(now:number)=>{if(this.disposed)return;this.frame=requestAnimationFrame(this.animate);const dt=this.last?Math.min((now-this.last)/1000,.08):0;this.last=now;const active=!this.paused&&!document.hidden;
 if(active){this.clock+=dt;const stopped=this.data.length===0||this.data.some(m=>m.status===2||m.status===null);const speed=stopped?0:this.data.some(m=>m.status===1)?.65:1;this.flow=(this.flow+dt*this.beltSpeed*speed)%1;
 this.rollers.forEach(r=>r.rotation.z+=dt*speed*3);this.robots.forEach(r=>{const running=this.status(r.index)===0||this.status(r.index)===1;if(running){r.pivot.rotation.y=Math.sin(this.clock*1.4+r.offset)*.85+Math.PI/2;r.elbow.rotation.z=Math.sin(this.clock*1.8+r.offset)*.5-.35;}const spark=r.elbow.getObjectByName('spark');if(spark)spark.visible=running&&r.index!==4&&Math.sin(this.clock*24+r.offset)>.7;});if(this.press&&this.status(0)===0)this.press.position.y=2.7+Math.sin(this.clock*2.5)*.7;
 this.lamps.forEach((lamp,i)=>{(lamp.material as THREE.MeshStandardMaterial).emissiveIntensity=this.status(i)===2?.45+(Math.sin(this.clock*4)+1)*.45:.8;});this.forklift.position.set(-17+((this.clock*.95)%34),0,13);this.forklift.rotation.y=Math.PI;
 }
 this.cars.forEach(c=>this.positionCar(c,(this.flow+c.phase)%1));this.controls.update();this.renderer.render(this.scene,this.camera);this.renderFrames++;this.container.dataset.flow=this.flow.toFixed(5);this.container.dataset.frames=String(this.renderFrames);
 };
 private contextLost=(e:Event)=>{e.preventDefault();this.paused=true;this.container.setAttribute('aria-label','A renderização 3D foi interrompida. Reabra o relatório.');};
 private pointerDown=(e:PointerEvent)=>{this.down={x:e.clientX,y:e.clientY};};
 private pointerUp=(e:PointerEvent)=>{if(Math.hypot(e.clientX-this.down.x,e.clientY-this.down.y)>5)return;const rect=this.renderer.domElement.getBoundingClientRect();this.ray.setFromCamera(new THREE.Vector2((e.clientX-rect.left)/rect.width*2-1,-(e.clientY-rect.top)/rect.height*2+1),this.camera);const hit=this.ray.intersectObjects(this.groups,true)[0];if(!hit)return;let o:THREE.Object3D=hit.object;while(o&&!o.userData.id)o=o.parent;if(o?.userData.id)this.onSelect(o.userData.id,e.ctrlKey||e.metaKey);};
 private free(){const textures=new Set<THREE.Texture>();const materials=new Set<THREE.Material>();const geometries=new Set<THREE.BufferGeometry>();this.scene.traverse(o=>{const m=o as THREE.Mesh;if(m.geometry)geometries.add(m.geometry);if(m.material)(Array.isArray(m.material)?m.material:[m.material]).forEach(mat=>{materials.add(mat);const map=(mat as THREE.MeshStandardMaterial).map;if(map)textures.add(map);});});textures.forEach(t=>t.dispose());materials.forEach(m=>m.dispose());geometries.forEach(g=>g.dispose());}
 destroy(){this.disposed=true;cancelAnimationFrame(this.frame);this.controls.dispose();this.renderer.domElement.removeEventListener('pointerdown',this.pointerDown);this.renderer.domElement.removeEventListener('pointerup',this.pointerUp);this.renderer.domElement.removeEventListener('webglcontextlost',this.contextLost);this.free();this.renderer.dispose();this.renderer.domElement.remove();}
}
