'use strict';
/* SINDH POLE RUNNER — vanilla JS / Canvas 2D. Systems: Save, Audio, Perspective, Road, Player, Obstacles, Collisions, Collectibles, PowerUps, UI */
const $=id=>document.getElementById(id),R=Math.random;
/* ---------- SaveManager ---------- */
const S={d:{best:0,coins:0,dist:0,chars:[0],char:0,music:true,sfx:true,vol:.6},
 load(){try{Object.assign(this.d,JSON.parse(localStorage.getItem('spr1')||'{}'))}catch(e){}},
 save(){try{localStorage.setItem('spr1',JSON.stringify(this.d))}catch(e){}}};
S.load();
const CHARS=[{n:'Mehran',t:0,k:'#f1f5f9',cost:0},{n:'Rickshaw Raja',t:1,k:'#f59e0b',cost:150},{n:'Truck Art Bedford',t:2,k:'#d62828',cost:400}];
const MSG=["Welcome to Sindh — Poles Included!","Road Complete, Poles Pending","Drive Carefully — Pole Ahead","Development Under Construction","Electricity Pole Expressway","Please Dodge Responsibly","Road Ka Budget Khatam, Pole Ka Nahi","Aagay Pole Hai, Sambhal Kar!","Congratulations! You Found Another Pole!","Road Bani, Pole Nahi Hata!"];
const DIE=["Pole Se Takra Gaye!","Development Ne Rok Diya!","Pole Abhi Bhi Wahin Hai!","Road Ka Kya Kasoor?","Mission Failed — Pole Wins!"];
const PU=[['S','#22d3ee'],['M','#ef4444'],['2x','#a855f7'],['J','#22c55e'],['⚡','#f97316']];
const SHOPS=['CHAI','PAAN','DHABA','TYRES','MOBILE'],SCOL=['#e76f51','#2a9d8f','#e9c46a','#8ecae6','#b5838d'];
const BIL=['POLE INCLUDED','NO ROAD, YES POLE','DEVELOPMENT™','WELCOME TO SINDH'];

/* ---------- AudioManager (synth placeholder; optional assets/audio/music.mp3) ---------- */
const A={ctx:null,mg:null,el:null,on:false,step:0,nt:0,tm:null,idx:3,
 fail:false,
 load(){fetch('assets/audio/music.mp3').then(r=>{if(!r.ok)throw 0;return r.blob()}).then(b=>{const e=new Audio(URL.createObjectURL(b));e.loop=true;e.preload='auto';this.el=e;this.vol();if(this.on)this.play()}).catch(()=>{this.fail=true;if(this.on)this.play()})},
 init(){if(this.ctx)return;try{this.ctx=new(window.AudioContext||window.webkitAudioContext)();this.mg=this.ctx.createGain();this.mg.connect(this.ctx.destination);this.vol()}catch(e){}},
 vol(){if(this.mg)this.mg.gain.value=S.d.music?S.d.vol*.5:0;if(this.el){this.el.volume=S.d.vol;if(!S.d.music)this.el.pause();else if(this.on&&this.el.paused)this.el.play().catch(()=>{})}},
 n(f,t,d,type,v,dest){const o=this.ctx.createOscillator(),g=this.ctx.createGain();o.type=type;o.frequency.value=f;g.gain.setValueAtTime(v,t);g.gain.exponentialRampToValueAtTime(.001,t+d);o.connect(g);g.connect(dest||this.mg);o.start(t);o.stop(t+d+.02)},
 play(){this.on=true;if(this.ctx)this.ctx.resume();if(this.el){if(S.d.music)this.el.play().catch(()=>{});return}
  if(this.ctx&&this.fail&&!this.tm){this.nt=this.ctx.currentTime+.05;this.tm=setInterval(()=>this.sched(),120)}},
 pause(){this.on=false;clearInterval(this.tm);this.tm=null;if(this.el)this.el.pause()},
 sched(){const x=this.ctx;if(!S.d.music){this.nt=x.currentTime+.1;return}const sc=[293.66,311.13,349.23,392,440,466.16,523.25],v=S.d.vol*.5;
  while(this.nt<x.currentTime+.35){const t=this.nt,i=this.step++;
   if(i%16===0)this.n(73.4,t,3,'triangle',.25*v);
   if(i%4===0)this.n(95,t,.18,'sine',.5*v);
   if(i%4===2)this.n(1000,t,.04,'square',.06*v);
   if(i%8===5)this.n(150,t,.1,'sine',.3*v);
   if(R()<.7){this.idx=Math.max(0,Math.min(6,this.idx+(R()*3|0)-1));this.n(sc[this.idx]*(i%32<16?1:2),t,.28,'sawtooth',.07*v)}
   this.nt+=.19}},
 sfx(k){if(!S.d.sfx||!this.ctx)return;const t=this.ctx.currentTime,n=(f,o,d,ty,v)=>this.n(f,t+o,d,ty||'square',v||.12,this.ctx.destination);
  if(k==='jump'){n(400,0,.12);n(620,.06,.1)}else if(k==='coin'){n(880,0,.07);n(1320,.06,.12)}
  else if(k==='hit'){n(90,0,.4,'sawtooth',.35);n(55,.05,.4,'sine',.4)}else if(k==='pow'){[523,659,784,1046].forEach((f,i)=>n(f,i*.07,.12))}
  else if(k==='over'){[440,370,311,220].forEach((f,i)=>n(f,i*.18,.3,'triangle',.2))}}};

/* ---------- Perspective ---------- */
const cv=$('c'),c=cv.getContext('2d');let W,H,LW,HY,GY,CX;
const sc=z=>1/(1+z*.12),FAR=72;
const fade=z=>z>56?Math.max(0,(FAR-z)/16):1;
function rs(){const d=Math.min(devicePixelRatio||1,2);W=innerWidth;H=innerHeight;cv.width=W*d;cv.height=H*d;c.setTransform(d,0,0,d,0,0);
 LW=Math.min(W*.27,H*.17);HY=H*.3;GY=H*.82;CX=W/2;if(g.st!=='play')draw()}

/* ---------- State ---------- */
const g={parts:[],st:'menu',t:0,off:0,speed:0,score:0,dist:0,coins:0,ents:[],decor:[],gap:0,safe:0,px:0,lane:0,py:0,vy:0,slide:0,dead:0,anim:0,shield:0,mag:0,dbl:0,boost:0,ej:0,msgT:6};
const pool=[];
function add(k,lane,z,x){const e=pool.pop()||{};e.k=k;e.lane=lane;e.z=z;e.tilt=0;e.v=0;e.all=0;if(x)Object.assign(e,x);g.ents.push(e)}
function decorInit(){g.decor.length=0;for(let i=0;i<24;i++)g.decor.push({d:1,z:i*3+2,side:i%2?1:-1,k:R()<.45?4:R()*4|0,v:R()*5|0})}
function reset(){g.parts.length=0;pool.push(...g.ents);g.ents.length=0;Object.assign(g,{t:0,off:0,score:0,dist:0,coins:0,gap:12,safe:0,px:0,lane:0,py:0,vy:0,slide:0,dead:0,anim:0,shield:0,mag:0,dbl:0,boost:0,ej:0,msgT:6});decorInit()}

/* ---------- ObstacleManager (fair rows: a safe lane always exists, shifts max 1 lane per row) ---------- */
function row(){const z=FAR,s=g.safe=Math.max(-1,Math.min(1,g.safe+(R()<.6?(R()<.5?-1:1):0)));
 const oth=[-1,0,1].filter(l=>l!==s),r=R();
 if(r<.3){const l=oth[R()*2|0],tp=R()*4|0;add(tp===1?'trans':'pole',l,z,{tilt:tp===2?(R()<.5?-.12:.12):0});
  if(tp===3)add('barr',oth.find(x=>x!==l),z)}
 else if(r<.55){oth.forEach(l=>add('pole',l,z))}
 else if(r<.7){add(R()<.5?'trans':'pole',oth[R()*2|0],z);add('pit',[-1,0,1][R()*3|0],z+7)}
 else if(r<.85){add('wire',0,z,{all:1})}
 else{[-1,0,1].forEach(l=>{if(R()<.7)add('barr',l,z)})}
 if(R()<.75){const v=R()<.06?5:[1,1,2,3][R()*4|0];for(let i=0;i<5;i++)add('coin',s,z+i*2.4-4,{v})}
 if(R()<.07)add('pu',s,z+10,{v:R()*5|0})}

/* ---------- Player + update ---------- */
function jump(){if(g.py<=.01&&g.vy<=0){g.vy=14;g.py=.02;A.sfx('jump')}else if(g.ej>0){g.ej--;g.vy=13;A.sfx('pow')}}
function swipe(d){if(g.st!=='play'||g.dead>0)return;if(navigator.vibrate&&d!=='d')navigator.vibrate(12);if(d==='l')g.lane=Math.max(-1,g.lane-1);else if(d==='r')g.lane=Math.min(1,g.lane+1);
 else if(d==='u')jump();else if(g.py<=0)g.slide=.7;else g.vy=-22}
function crash(e){if(g.shield){g.shield=0;A.sfx('hit');e.z=-9;boom();banner('Shield ne bacha liya!');return}g.dead=.9;boom();A.sfx('hit');if(navigator.vibrate)navigator.vibrate(120)}
function upd(dt){
 for(let i=g.parts.length-1;i>=0;i--){const p=g.parts[i];p.l-=dt;p.vy+=900*dt;p.x+=p.vx*dt;p.y+=p.vy*dt;if(p.l<=0)g.parts.splice(i,1)}
 if(g.dead>0){g.dead-=dt;if(g.dead<=0)over();return}
 g.t+=dt;const sp=g.speed=(15+Math.min(13,g.t*.12))*(g.boost>0?1.45:1);
 g.off+=sp*dt;g.dist+=sp*dt*.35;g.score+=sp*dt*.6*(g.dbl>0?2:1)*(g.boost>0?1.5:1);g.anim+=dt*sp*.5;
 g.px+=(g.lane-g.px)*Math.min(1,dt*14);
 if(g.py>0||g.vy>0){g.vy-=40*dt;g.py+=g.vy*dt;if(g.py<=0){g.py=0;g.vy=0}}
 g.slide=Math.max(0,g.slide-dt);g.mag=Math.max(0,g.mag-dt);g.dbl=Math.max(0,g.dbl-dt);g.boost=Math.max(0,g.boost-dt);
 g.gap-=sp*dt;if(g.gap<=0){row();g.gap=Math.max(13,22-g.t*.08)+R()*6}
 for(let i=g.ents.length-1;i>=0;i--){const e=g.ents[i];e.z-=sp*dt;
  if(e.k==='coin'&&g.mag>0&&e.z<22){e.lane+=(g.px-e.lane)*Math.min(1,dt*8);e.z-=sp*dt*.5}
  if(e.z<-4){pool.push(e);g.ents.splice(i,1);continue}
  if(e.z>1||e.z<-1)continue;
  const near=e.all||Math.abs(g.px-e.lane)<.55;if(!near)continue;
  /* CollisionSystem */
  if(e.k==='coin'){g.coins+=e.v;g.score+=e.v*10*(g.dbl>0?2:1);A.sfx('coin');e.z=-9}
  else if(e.k==='pu'){applyPU(e.v);e.z=-9}
  else if(e.k==='wire'){if(g.slide<=0)crash(e)}
  else if(e.k==='barr'){if(g.py<1.05)crash(e)}
  else if(e.k==='pit'){if(g.py<.3)crash(e)}
  else crash(e)}
 for(const d of g.decor){d.z-=sp*dt;if(d.z<-4){d.z+=FAR;d.k=R()<.45?4:R()*4|0;d.v=R()*5|0}}
 g.msgT-=dt;if(g.msgT<=0){banner(MSG[R()*MSG.length|0]);g.msgT=14}}
function applyPU(v){A.sfx('pow');if(v===0)g.shield=1;else if(v===1)g.mag=8;else if(v===2)g.dbl=10;else if(v===3)g.ej=1;else g.boost=5;banner(['Electricity Shield!','Pole Magnet!','Double Score!','Emergency Jump!','Development Boost!'][v])}

/* ---------- Rendering ---------- */
const SKY=[];for(let i=0;i<22;i++)SKY.push([i/22,.05,.1+((i*37)%10)/60]);
function poly(w,col){const s2=(H-HY)/(GY-HY);c.fillStyle=col;c.beginPath();c.moveTo(CX,HY);c.lineTo(CX+w*s2,H);c.lineTo(CX-w*s2,H);c.fill()}
function strip(lx,z0,z1,hw,col){const a=sc(z0),b=sc(z1),ya=HY+(GY-HY)*a,yb=HY+(GY-HY)*b;c.fillStyle=col;c.beginPath();
 c.moveTo(CX+(lx-hw)*LW*a,ya);c.lineTo(CX+(lx+hw)*LW*a,ya);c.lineTo(CX+(lx+hw)*LW*b,yb);c.lineTo(CX+(lx-hw)*LW*b,yb);c.fill()}
function draw(){c.save();if(g.dead>0)c.translate((R()-.5)*9,(R()-.5)*9);c.globalAlpha=1;
 let gr=c.createLinearGradient(0,0,0,HY);gr.addColorStop(0,'#ff7a3d');gr.addColorStop(.6,'#ffb870');gr.addColorStop(1,'#ffe8b0');c.fillStyle=gr;c.fillRect(-10,-10,W+20,HY+11);
 gr=c.createRadialGradient(W*.75,HY*.5,0,W*.75,HY*.5,HY*.5);gr.addColorStop(0,'rgba(255,248,200,.95)');gr.addColorStop(1,'rgba(255,248,200,0)');c.fillStyle=gr;c.fillRect(0,0,W,HY);
 c.fillStyle='#fff6c8';c.beginPath();c.arc(W*.75,HY*.5,HY*.12,0,7);c.fill();
 c.fillStyle='rgba(255,255,255,.5)';for(let i=0;i<4;i++){const cx=(i*W*.33+g.t*7+i*91)%(W+240)-120,cy=HY*(.12+.17*((i*3)%4)/3);for(const o of[[0,0,50],[35,6,38],[-35,8,34]]){c.beginPath();c.ellipse(cx+o[0],cy+o[1],o[2],o[2]*.38,0,0,7);c.fill()}}
 c.fillStyle='#d9a073';for(const b of SKY)c.fillRect(b[0]*W+W*.02,HY-b[2]*HY*.75,b[1]*W+1,b[2]*HY*.75);
 c.fillStyle='#b9825a';for(const b of SKY)c.fillRect(b[0]*W,HY-b[2]*HY,b[1]*W+1,b[2]*HY);
 gr=c.createLinearGradient(0,HY,0,H);gr.addColorStop(0,'#ead2a0');gr.addColorStop(1,'#c9a15f');c.fillStyle=gr;c.fillRect(0,HY,W,H-HY);
 poly(LW*1.85,'#a68a5b');poly(LW*1.55,'#3d3f46');
 const bi=Math.floor(g.off/6);
 for(let k=0;k<13;k++){const z0=Math.max(k*6-g.off%6,-4),z1=k*6-g.off%6+6;if(z1<-4)continue;const od=(k+bi)&1;
  if(od)strip(0,z0,z1,1.55,'rgba(255,255,255,.045)');strip(-1.68,z0,z1,.1,od?'#e11d48':'#f4f4f4');strip(1.68,z0,z1,.1,od?'#e11d48':'#f4f4f4')}
 strip(-1.5,-4,FAR,.05,'#f4f4f4');strip(1.5,-4,FAR,.05,'#f4f4f4');
 for(let k=0;k<10;k++){const z0=Math.max(k*8-g.off%8,-4),z1=k*8-g.off%8+3.5;if(z1<-4)continue;strip(-.5,z0,z1,.03,'#ffd23f');strip(.5,z0,z1,.03,'#ffd23f')}
 gr=c.createLinearGradient(0,HY,0,HY+(H-HY)*.22);gr.addColorStop(0,'rgba(255,232,176,.75)');gr.addColorStop(1,'rgba(255,232,176,0)');c.fillStyle=gr;c.fillRect(0,HY,W,(H-HY)*.22);
 const L=g.decor.concat(g.ents).sort((a,b)=>b.z-a.z);let pd=0;
 for(const o of L){if(o.z<=0&&!pd){player();pd=1}if(o.z<-3.5||o.z>FAR)continue;c.globalAlpha=fade(o.z);o.d?decor(o):ent(o)}
 if(!pd)player();c.globalAlpha=1;drawParts();c.restore()}
function decor(o){const s=sc(o.z),y=HY+(GY-HY)*s,u=LW*s,x=CX+o.side*(o.k===3?3.5:o.k===4?1.9:2.5)*u;c.textAlign='center';
 if(o.k===4){flag(x,y,u,o);return}
 if(o.k===0){const w=1.5*u,h=1.4*u;c.fillStyle=SCOL[o.v];c.fillRect(x-w/2,y-h,w,h);c.fillStyle='#d62828';c.fillRect(x-w/2,y-h*.72,w,h*.16);
  c.fillStyle='#2b2b2b';c.fillRect(x-w*.15,y-h*.5,w*.3,h*.5);c.fillStyle='#fde68a';c.fillRect(x-w*.45,y-h*.5,w*.22,h*.28);c.fillRect(x+w*.23,y-h*.5,w*.22,h*.28);if(u>14){c.fillStyle='#111';c.font='bold '+u*.24+'px sans-serif';c.fillText(SHOPS[o.v],x,y-h*.8)}}
 else if(o.k===1){c.fillStyle='#6b4423';c.fillRect(x-u*.06,y-u*.8,u*.12,u*.8);c.fillStyle='#256a2a';c.beginPath();c.arc(x,y-u*1.1,u*.55,0,7);c.fill();c.fillStyle='#3a9a40';c.beginPath();c.arc(x-u*.12,y-u*1.22,u*.38,0,7);c.fill()}
 else if(o.k===2){c.fillStyle='#555';c.fillRect(x-u*.7,y-u*1.3,u*.08,u*1.3);c.fillRect(x+u*.62,y-u*1.3,u*.08,u*1.3);c.fillStyle='#14532d';c.fillRect(x-u*.8,y-u*2,u*1.6,u*.8);
  if(u>16){c.fillStyle='#fff';c.font='bold '+u*.17+'px sans-serif';c.fillText(BIL[o.v%4],x,y-u*1.55)}}
 else{const w=1.7*u,h=(2.4+o.v*.4)*u;c.fillStyle=['#cdb4a0','#b8a38c','#d9c2a8'][o.v%3];c.fillRect(x-w/2,y-h,w,h);c.fillStyle='#fef3c7';
  for(let i=1;i<h/(u*.5);i++)for(let j=0;j<3;j++)c.fillRect(x-w/2+u*.2+j*u*.5,y-h+i*u*.5,u*.25,u*.25);c.fillStyle='#2563eb';c.fillRect(x-u*.3,y-h-u*.35,u*.6,u*.35)}}
function flag(x,y,u,o){/* PPP tricolour: red / black / green */
 c.fillStyle='#d1d5db';c.fillRect(x-u*.04,y-u*2.6,u*.08,u*2.6);c.beginPath();c.arc(x,y-u*2.6,u*.08,0,7);c.fill();
 const d=-o.side,fw=u*1.1,fh=u*.28,cols=['#d62828','#111','#15803d'];
 for(let b=0;b<3;b++){c.fillStyle=cols[b];for(let i=0;i<6;i++){const x0=x+d*(i*fw/6),w=Math.sin(g.t*6+i*.9+o.z)*u*.05*(i/5);
  c.fillRect(Math.min(x0,x0+d*fw/6+.5),y-u*2.55+b*fh+w,fw/6+.5,fh+.5)}}}
function pole(x,y,u,e){c.save();c.translate(x,y);if(e.tilt)c.rotate(e.tilt);
 c.fillStyle='rgba(0,0,0,.25)';c.beginPath();c.ellipse(0,0,u*.7,u*.15,0,0,7);c.fill();
 c.fillStyle='#8f9296';c.beginPath();c.moveTo(-u*.2,0);c.lineTo(u*.2,0);c.lineTo(u*.1,-u*5);c.lineTo(-u*.1,-u*5);c.fill();
 c.fillStyle='#facc15';c.fillRect(-u*.19,-u*1.2,u*.38,u*.3);c.fillStyle='#111';c.fillRect(-u*.19,-u*.9,u*.38,u*.1);
 c.fillStyle='rgba(255,255,255,.2)';c.beginPath();c.moveTo(-u*.2,0);c.lineTo(-u*.1,0);c.lineTo(-u*.04,-u*5);c.lineTo(-u*.1,-u*5);c.fill();c.fillStyle='#f8fafc';c.fillRect(-u*.18,-u*2.5,u*.36,u*.5);c.fillStyle='#d62828';c.fillRect(-u*.18,-u*2.5,u*.36,u*.1);
 c.fillStyle='#5a3b22';c.fillRect(-u*1.1,-u*4.7,u*2.2,u*.2);c.fillRect(-u*.8,-u*4.1,u*1.6,u*.14);
 c.fillStyle='#e8eef5';for(const dx of[-1,-.5,0,.5,1])c.fillRect(dx*u-u*.05,-u*4.95,u*.1,u*.25);
 c.strokeStyle='#111';c.lineWidth=Math.max(1,u*.04);for(const dx of[-1,0,1]){c.beginPath();c.moveTo(dx*u,-u*4.9);c.quadraticCurveTo(dx*u*2.2,-u*3.9,dx*u*3.2,-u*4.7);c.stroke()}
 if(e.k==='trans'){c.fillStyle='#6b7280';c.fillRect(-u*.55,-u*3.6,u*1.1,u*.9);c.fillStyle='#374151';c.fillRect(-u*.6,-u*3.6,u*1.2,u*.12);c.fillStyle='#fde047';c.fillRect(-u*.1,-u*3.35,u*.2,u*.4)}
 c.restore()}
function ent(e){const s=sc(e.z),y=HY+(GY-HY)*s,u=LW*s*.5,x=CX+e.lane*LW*s;
 switch(e.k){
 case'pole':case'trans':pole(x,y,u,e);break;
 case'barr':{const w=1.6*u,h=u*1.1;c.fillStyle='#333';c.fillRect(x-w*.4,y-h*.5,u*.12,h*.5);c.fillRect(x+w*.4-u*.12,y-h*.5,u*.12,h*.5);
  for(let i=0;i<6;i++){c.fillStyle=i%2?'#fff':'#e11d48';c.fillRect(x-w/2+i*w/6,y-h,w/6+.5,h*.5)}break}
 case'pit':c.fillStyle='#6b5a40';c.beginPath();c.ellipse(x,y,u*.9,u*.28,0,0,7);c.fill();c.fillStyle='#16161a';c.beginPath();c.ellipse(x,y,u*.7,u*.2,0,0,7);c.fill();break;
 case'wire':{const hw=1.8*LW*s,hh=u*2.6;c.fillStyle='#8f9296';c.fillRect(CX-hw-u*.12,y-u*5,u*.24,u*5);c.fillRect(CX+hw-u*.12,y-u*5,u*.24,u*5);
  c.strokeStyle='#111';c.lineWidth=Math.max(1.5,u*.07);c.beginPath();c.moveTo(CX-hw,y-hh);c.quadraticCurveTo(CX,y-u*.8,CX+hw,y-hh);c.stroke();
  c.fillStyle='#facc15';c.fillRect(CX-u*.35,y-u*1.75,u*.7,u*.3);break}
 case'coin':{const by=y-u*.9-Math.sin(g.t*6+e.z)*u*.1,r=u*.38;c.fillStyle=e.v===1?'#4ade80':e.v===2?'#facc15':e.v===3?'#fb923c':'#fde047';c.strokeStyle='#7c4a03';c.lineWidth=Math.max(1,u*.06);
  c.shadowColor=c.fillStyle;c.shadowBlur=u*.5;if(e.v===1){c.fillRect(x-r*1.3,by-r*.7,r*2.6,r*1.4);c.shadowBlur=0;txt('Rs',x,by+r*.25,r*.9,'#14532d')}else{const rr=e.v===5?r*1.3:r;c.beginPath();c.ellipse(x,by,Math.max(.2,Math.abs(Math.cos(g.t*5+e.z)))*rr,rr,0,0,7);c.fill();c.shadowBlur=0;c.stroke()}break}
 case'pu':{const by=y-u*1.1;c.shadowColor=PU[e.v][1];c.shadowBlur=u*.9;c.fillStyle=PU[e.v][1];c.beginPath();c.arc(x,by,u*.6,0,7);c.fill();c.shadowBlur=0;c.strokeStyle='#fff';c.lineWidth=Math.max(1,u*.08);c.stroke();
  c.fillStyle='#fff';c.textAlign='center';c.font='bold '+u*.6+'px sans-serif';c.fillText(PU[e.v][0],x,by+u*.2)}}}
function txt(t,x,y,sz,col){c.fillStyle=col;c.textAlign='center';c.font='bold '+sz+'px sans-serif';c.fillText(t,x,y)}
function lights(U,x1,y1){c.fillStyle='#ff2d2d';c.shadowColor='#ff2d2d';c.shadowBlur=U*.3;c.fillRect(-x1,y1,U*.22,U*.14);c.fillRect(x1-U*.22,y1,U*.22,U*.14);c.shadowBlur=0}
function plate(U,y){c.fillStyle='#fff';c.fillRect(-U*.24,y,U*.48,U*.17);txt('SINDH',0,y+U*.13,U*.12,'#111')}
function mehran(U,ch){c.fillStyle=ch.k;c.beginPath();c.roundRect(-U*.72,-U*.95,U*1.44,U*.62,U*.12);c.fill();
 c.beginPath();c.moveTo(-U*.58,-U*.9);c.lineTo(-U*.44,-U*1.45);c.lineTo(U*.44,-U*1.45);c.lineTo(U*.58,-U*.9);c.fill();
 c.fillStyle='#7cc4e0';c.beginPath();c.moveTo(-U*.5,-U*1);c.lineTo(-U*.38,-U*1.38);c.lineTo(U*.38,-U*1.38);c.lineTo(U*.5,-U*1);c.fill();
 c.fillStyle='rgba(255,255,255,.35)';c.beginPath();c.moveTo(-U*.3,-U*1);c.lineTo(-U*.1,-U*1.38);c.lineTo(U*.05,-U*1.38);c.lineTo(-U*.15,-U*1);c.fill();
 c.fillStyle='rgba(0,0,0,.12)';c.fillRect(-U*.72,-U*.62,U*1.44,U*.08);lights(U,U*.7,-U*.88);plate(U,-U*.74);c.fillStyle='#333';c.fillRect(-U*.76,-U*.42,U*1.52,U*.1)}
function rick(U,ch){c.fillStyle='#111';c.beginPath();c.roundRect(-U*.68,-U*1.78,U*1.36,U*.3,U*.1);c.fill();
 c.fillStyle=ch.k;c.beginPath();c.roundRect(-U*.58,-U*1.5,U*1.16,U*1.1,U*.1);c.fill();c.fillStyle='#15803d';c.fillRect(-U*.58,-U*.75,U*1.16,U*.3);
 c.fillStyle='#223';c.beginPath();c.roundRect(-U*.4,-U*1.4,U*.8,U*.5,U*.06);c.fill();c.fillStyle='rgba(255,255,255,.2)';c.fillRect(-U*.4,-U*1.4,U*.25,U*.5);
 lights(U,U*.58,-U*.86);txt('HORN OK',0,-U*.53,U*.17,'#fff');c.fillStyle='#333';c.fillRect(-U*.62,-U*.44,U*1.24,U*.08)}
function truck(U,ch){const cl=['#d62828','#facc15','#15803d','#1d4ed8'];c.fillStyle='#222';c.fillRect(-U*.8,-U*1.95,U*1.6,U*.14);
 for(let i=0;i<5;i++){c.fillStyle=i%2?'#facc15':'#d62828';c.beginPath();c.moveTo(-U*.8+i*U*.32,-U*1.95);c.lineTo(-U*.64+i*U*.32,-U*2.2);c.lineTo(-U*.48+i*U*.32,-U*1.95);c.fill()}
 for(let i=0;i<5;i++){c.fillStyle=cl[i%4];c.fillRect(-U*.8,-U*1.8+i*U*.28,U*1.6,U*.29)}
 for(let i=0;i<5;i++){c.fillStyle='#fff';c.beginPath();c.arc(-U*.6+i*U*.3,-U*1.52,U*.09,0,7);c.fill();c.fillStyle='#111';c.beginPath();c.arc(-U*.6+i*U*.3,-U*1.52,U*.04,0,7);c.fill()}
 txt('OK TATA',0,-U*.78,U*.2,'#fff');lights(U,U*.78,-U*.55);plate(U,-U*.52);c.fillStyle='#333';c.fillRect(-U*.8,-U*.38,U*1.6,U*.1)}
function player(){const ch=CHARS[S.d.char],U=LW*.5,x=CX+g.px*LW,y=GY-g.py*U,sl=g.slide>0&&g.py<=0,bob=g.py>0?0:Math.sin(g.anim*4)*U*.03;c.globalAlpha=1;
 c.fillStyle='rgba(0,0,0,.35)';c.beginPath();c.ellipse(x,GY,U*.9,U*.17,0,0,7);c.fill();
 c.save();c.translate(x,y+bob);if(g.dead>0)c.rotate(Math.min(1,(.9-g.dead)*3)*1.4);else c.rotate((g.lane-g.px)*.12);if(sl)c.scale(1.08,.62);
 c.fillStyle='#16161a';for(const sd of[-1,1]){c.beginPath();c.roundRect(sd*U*.62-U*.17,-U*.5,U*.34,U*.5,U*.08);c.fill()}
 if(ch.t===0)mehran(U,ch);else if(ch.t===1)rick(U,ch);else truck(U,ch);c.restore();
 if(g.shield){c.strokeStyle='#22d3ee';c.lineWidth=3;c.beginPath();c.arc(x,y-U*.95,U*1.3,0,7);c.stroke()}}
function boom(){const U=LW*.5,x=CX+g.px*LW,y=GY-g.py*U-U*.7;for(let i=0;i<24;i++)g.parts.push({x,y,vx:(R()-.5)*460,vy:-R()*400,l:.7,c:R()<.5?'#facc15':'#f97316'})}
function drawParts(){for(const p of g.parts){c.globalAlpha=Math.max(0,p.l/.7);c.fillStyle=p.c;c.fillRect(p.x,p.y,6,6)}c.globalAlpha=1}

/* ---------- UI ---------- */
const show=id=>document.querySelectorAll('.ov').forEach(o=>o.classList.toggle('on',o.id===id));
const set=(id,t)=>{const e=$(id);if(e.textContent!==t)e.textContent=t};
let bt;function banner(t){const b=$('banner');b.textContent=t;b.classList.add('on');clearTimeout(bt);bt=setTimeout(()=>b.classList.remove('on'),2200)}
function hud(){set('hs',''+(g.score|0));set('hd',(g.dist|0)+' m');set('hc','🪙 '+g.coins);
 set('hp',(g.shield?'🛡 ':'')+(g.mag>0?'🧲'+Math.ceil(g.mag)+' ':'')+(g.dbl>0?'2x'+Math.ceil(g.dbl)+' ':'')+(g.boost>0?'⚡'+Math.ceil(g.boost)+' ':'')+(g.ej?'⤒ ':''))}
function sync(){document.querySelectorAll('.tm').forEach(b=>b.textContent='Music: '+(S.d.music?'On':'Off'));document.querySelectorAll('.ts').forEach(b=>b.textContent='Sound: '+(S.d.sfx?'On':'Off'));
 $('vol').value=S.d.vol;set('mb',''+S.d.best);set('mc',''+S.d.coins)}
function shop(){set('sc','🪙 '+S.d.coins);const w=$('chars');w.innerHTML='';
 CHARS.forEach((ch,i)=>{const own=S.d.chars.includes(i),d=document.createElement('div');d.className='ch';
  d.innerHTML='<i style="background:'+ch.k+'"></i><span>'+ch.n+'</span>';const b=document.createElement('button');
  b.textContent=S.d.char===i?'Selected':own?'Select':'Buy 🪙'+ch.cost;b.onclick=()=>{if(!own){if(S.d.coins<ch.cost)return banner('Paisay kam hain!');S.d.coins-=ch.cost;S.d.chars.push(i)}S.d.char=i;S.save();shop();sync()};
  d.appendChild(b);w.appendChild(d)})}
let raf,last,lastTap=0;
function frame(ts){if(g.st!=='play')return;const dt=Math.min(.05,(ts-last)/1000);last=ts;upd(dt);if(g.st==='play'){draw();hud();raf=requestAnimationFrame(frame)}}
function start(){reset();g.st='play';document.body.classList.add('playing');show(null);A.init();A.play();last=performance.now();cancelAnimationFrame(raf);raf=requestAnimationFrame(frame);banner(MSG[0])}
function pause(){if(g.st!=='play')return;g.st='pause';cancelAnimationFrame(raf);A.pause();show('pause')}
function resume(){if(g.st!=='pause')return;g.st='play';show(null);A.play();last=performance.now();raf=requestAnimationFrame(frame)}
function menu(){g.st='menu';cancelAnimationFrame(raf);document.body.classList.remove('playing');reset();
 [[0,8],[0,20],[-1,32],[1,32],[0,46]].forEach(p=>add('pole',p[0],p[1]));add('trans',1,14);add('wire',0,38,{all:1});sync();show('menu');draw()}
function over(){g.st='over';cancelAnimationFrame(raf);A.sfx('over');const d=S.d,sc=g.score|0;if(sc>d.best)d.best=sc;d.coins+=g.coins;d.dist+=g.dist|0;S.save();
 set('om',DIE[R()*DIE.length|0]);set('os',''+sc);set('ob',''+d.best);set('od',(g.dist|0)+' m');set('oc',''+g.coins);sync();show('over')}
function share(){const t='I scored '+(g.score|0)+' in SINDH POLE RUNNER — Road Bani, Pole Nahi Hata!';
 if(navigator.share)navigator.share({title:'Sindh Pole Runner',text:t,url:location.href}).catch(()=>{});else if(navigator.clipboard)navigator.clipboard.writeText(t+' '+location.href).then(()=>banner('Score copied!'))}

/* ---------- Input ---------- */
let pd=null;
cv.addEventListener('pointerdown',e=>{A.init();A.play();pd={x:e.clientX,y:e.clientY,done:0};try{cv.setPointerCapture(e.pointerId)}catch(_){}});
cv.addEventListener('pointermove',e=>{if(!pd||pd.done||g.st!=='play')return;const dx=e.clientX-pd.x,dy=e.clientY-pd.y;
 if(Math.hypot(dx,dy)>20){pd.done=1;swipe(Math.abs(dx)>Math.abs(dy)?(dx>0?'r':'l'):(dy>0?'d':'u'));pd.x=e.clientX;pd.y=e.clientY;pd.done=0;pd.moved=1}});
cv.addEventListener('pointerup',()=>{if(pd&&!pd.done&&!pd.moved&&g.st==='play'){const n=performance.now();if(n-lastTap<320){jump();lastTap=0}else lastTap=n}pd=null});
cv.addEventListener('pointercancel',()=>pd=null);
addEventListener('keydown',e=>{const m={ArrowLeft:'l',ArrowRight:'r',ArrowUp:'u',ArrowDown:'d',' ':'u'}[e.key];
 if(m){e.preventDefault();A.init();A.play();swipe(m)}else if(e.key==='Escape'||e.key==='p'){g.st==='play'?pause():resume()}});
document.addEventListener('visibilitychange',()=>{if(document.hidden){pause();if(A.ctx)A.ctx.suspend()}else if(A.ctx){A.ctx.resume();if(g.st==='menu')A.play()}});
addEventListener('resize',rs);

/* ---------- Wiring ---------- */
$('play').onclick=start;$('retry').onclick=start;$('rt').onclick=start;$('rs').onclick=resume;$('bp').onclick=pause;$('share').onclick=share;
$('mshop').onclick=()=>{shop();show('shop')};$('mset').onclick=()=>show('set');$('mcr').onclick=()=>show('cred');
document.querySelectorAll('.back').forEach(b=>b.onclick=()=>show('menu'));document.querySelectorAll('.tomenu').forEach(b=>b.onclick=menu);
document.querySelectorAll('.tm').forEach(b=>b.onclick=()=>{S.d.music=!S.d.music;S.save();A.init();A.vol();if(S.d.music)A.play();sync()});
document.querySelectorAll('.ts').forEach(b=>b.onclick=()=>{S.d.sfx=!S.d.sfx;S.save();A.init();sync()});
$('vol').oninput=e=>{S.d.vol=+e.target.value;S.save();A.vol()};
let ip;addEventListener('beforeinstallprompt',e=>{e.preventDefault();ip=e;$('inst').hidden=false});
$('inst').onclick=()=>{if(ip){ip.prompt();ip=null;$('inst').hidden=true}};
if('serviceWorker' in navigator)addEventListener('load',()=>navigator.serviceWorker.register('service-worker.js').catch(()=>{}));
rs();menu();A.load();addEventListener('pointerdown',()=>{if(g.st==='menu'&&!A.on){A.init();A.play()}else if(A.on&&S.d.music&&A.el&&A.el.paused)A.el.play().catch(()=>{})},true);
