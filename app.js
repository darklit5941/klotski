import {parseBoard,limits,move,won} from './engine.js';
const $=id=>document.getElementById(id), palette=['#d4b766','#79a49a','#92a771','#7d9eaf','#bf947b','#aaa0bf','#afbb8d','#91b4b8','#c79c9b','#a7ae75','#7dada5'];
let manifest,band=0,page=0,current=1,minimum=1,cars=[],history=[],drag=null,loading=false,loadVersion=0,listVersion=0;
const cache=new Map();let records={};
try{records=JSON.parse(localStorage.getItem('ranglu-progress')||'{}');if(!records||typeof records!=='object')records={};}catch{}
const save=()=>{try{localStorage.setItem('ranglu-progress',JSON.stringify(records));}catch{}};
async function chunk(n){if(!cache.has(n)){const pending=fetch(`./data/${n}.json`).then(r=>{if(!r.ok)throw Error('data');return r.json()}).catch(e=>{cache.delete(n);throw e});cache.set(n,pending);}return cache.get(n);}
async function level(id){return (await chunk(Math.floor((id-1)/manifest.chunkSize)))[(id-1)%manifest.chunkSize];}
function setStatus(text){$('status').textContent=text;}
function paint(){
  const board=$('board');board.replaceChildren();
  cars.forEach((car,i)=>{
    const el=document.createElement('button');el.className=`car ${car.horizontal?'horizontal':'vertical'} ${car.id==='A'?'target':''}`;el.dataset.car=car.id;
    el.setAttribute('aria-label',`${car.id==='A'?'紅色目標車':car.id+' 號車'}，${car.horizontal?'左右':'上下'}拖曳`);
    el.style.setProperty('--car',car.id==='A'?'#e36b52':palette[(i-1+palette.length)%palette.length]);
    el.style.left=`calc(${car.x/6*100}% + 4px)`;el.style.top=`calc(${car.y/6*100}% + 4px)`;
    el.style.width=`calc(${(car.horizontal?car.length:1)/6*100}% - 8px)`;el.style.height=`calc(${(car.horizontal?1:car.length)/6*100}% - 8px)`;
    el.innerHTML=`<i class="cabin"></i><span>${car.id==='A'?'→':car.id}</span>`;
    el.disabled=loading||won(cars);board.append(el);
  });
  $('moves').textContent=history.length;$('undo').disabled=!history.length||loading;$('reset').disabled=loading||!cars.length;
}
function clearCelebration(){
  document.querySelector('.game-card').classList.remove('celebrating');
  document.querySelector('.confetti')?.remove();
}
function celebrate(){
  clearCelebration();
  const card=document.querySelector('.game-card');
  card.classList.add('celebrating');
  if(window.matchMedia('(prefers-reduced-motion: reduce)').matches)return;
  const confetti=document.createElement('div');confetti.className='confetti';confetti.setAttribute('aria-hidden','true');
  for(let i=0;i<24;i++){
    const piece=document.createElement('i');
    piece.style.cssText=`--x:${8+Math.random()*84}%;--drift:${Math.random()*100-50}px;--delay:${Math.random()*.25}s;--spin:${Math.random()*540-270}deg;--color:${['#df654e','#d4b766','#79a49a','#92a771'][i%4]}`;
    confetti.append(piece);
  }
  confetti.addEventListener('animationend',e=>{if(e.target===confetti)confetti.remove();});
  card.append(confetti);
}
function finish(){
  if(!won(cars))return;
  const count=history.length,prior=records[current];records[current]=Number.isFinite(prior)?Math.min(prior,count):count;save();
  $('victory').hidden=false;$('win-message').textContent=count===minimum?`只用 ${count} 步，達成最佳解！`:`用了 ${count} 步，最佳解是 ${minimum} 步。`;
  celebrate();setStatus('紅車已抵達出口，做得好！');renderList();
}
async function start(id){
  const version=++loadVersion;clearCelebration();loading=true;drag=null;paint();
  $('next').disabled=true;$('next').textContent='載入中…';setStatus('正在載入題目…');
  try{
    const row=await level(id);if(version!==loadVersion)return;
    current=id;minimum=row[0];cars=parseBoard(row[1]);history=[];loading=false;
    $('level-label').textContent=`#${String(id).padStart(3,'0')}`;$('minimum').textContent=minimum;
    $('difficulty').textContent=manifest.bands.find(b=>id>=b.start&&id<=b.end).name;
    $('victory').hidden=true;paint();setStatus('按住車輛拖曳，放開滑鼠即可停車。');renderList();
  }catch{if(version!==loadVersion)return;loading=false;paint();setStatus('題目載入失敗，請重試。');}
  finally{if(version===loadVersion){$('next').disabled=false;$('next').textContent='下一題 →';}}
}
function renderBands(){
  $('bands').replaceChildren();manifest.bands.forEach((b,i)=>{const el=document.createElement('button');el.className=`band ${i===band?'active':''}`;el.setAttribute('aria-pressed',i===band);el.innerHTML=`${b.name}<small>${b.min}–${b.max} 步</small>`;el.onclick=()=>{band=i;page=0;renderBands();renderList()};$('bands').append(el)});
}
async function renderList(){
  const version=++listVersion,b=manifest.bands[band],first=b.start+page*12,last=Math.min(first+11,b.end);
  $('list-title').textContent=b.name+'題庫';$('range').textContent=`${b.start.toLocaleString()}–${b.end.toLocaleString()}`;
  $('page-label').textContent=`${page+1} / ${Math.ceil((b.end-b.start+1)/12)} 頁`;
  $('prev-page').disabled=page===0;$('next-page').disabled=last===b.end;
  $('levels').replaceChildren();
  try{
    const rows=await Promise.all(Array.from({length:last-first+1},(_,i)=>level(first+i)));if(version!==listVersion)return;
    rows.forEach((row,i)=>{const id=first+i,el=document.createElement('button');el.className=`level ${id===current?'active':''} ${records[id]!==undefined?'done':''}`;el.setAttribute('aria-label',`第 ${id} 題，最少 ${row[0]} 步${records[id]!==undefined?'，已完成':''}`);el.setAttribute('aria-pressed',id===current);el.innerHTML=`<strong>${String(id).padStart(3,'0')}</strong><small>${row[0]} 步</small>`;el.onclick=()=>start(id);$('levels').append(el)});
  }catch{if(version!==listVersion)return;const retry=document.createElement('button');retry.textContent='載入失敗，點此重試';retry.onclick=renderList;$('levels').append(retry);}
}
$('board').addEventListener('pointerdown',e=>{
  const el=e.target.closest('.car');if(!el||loading||won(cars)||e.button!==0||drag)return;
  const car=cars.find(c=>c.id===el.dataset.car),bounds=limits(cars,car.id),pos=car.horizontal?car.x:car.y;
  drag={id:car.id,pointer:e.pointerId,el,start:car.horizontal?e.clientX:e.clientY,pos,horizontal:car.horizontal,cell:$('board').clientWidth/6,...bounds,delta:0};
  // Keep capture on the board: paint() replaces the car elements.
  $('board').setPointerCapture(e.pointerId);el.classList.add('dragging');
  // CSS touch-action handles touch gestures without suppressing later clicks.
  if(e.pointerType==='mouse')e.preventDefault();
});
$('board').addEventListener('pointermove',e=>{
  if(!drag||drag.pointer!==e.pointerId)return;
  const d=drag;d.delta=Math.max((d.min-d.pos)*d.cell,Math.min((d.max-d.pos)*d.cell,(d.horizontal?e.clientX:e.clientY)-d.start));
  d.el.style.translate=d.horizontal?`${d.delta}px 0`:`0 ${d.delta}px`;
});
function endDrag(e,cancel=false){
  if(!drag||drag.pointer!==e.pointerId)return;const d=drag;drag=null;
  if($('board').hasPointerCapture(d.pointer))$('board').releasePointerCapture(d.pointer);
  if(!cancel){const pos=Math.max(d.min,Math.min(d.max,d.pos+Math.round(d.delta/d.cell)));const snapshot=cars.map(c=>({...c}));if(move(cars,d.id,pos)){history.push(snapshot);setStatus('繼續挪一挪，替紅車留出路。');}}
  paint();finish();
}
$('board').addEventListener('pointerup',e=>endDrag(e));$('board').addEventListener('pointercancel',e=>endDrag(e,true));
$('board').addEventListener('lostpointercapture',e=>endDrag(e,true));
$('undo').onclick=()=>{if(loading||!history.length)return;clearCelebration();drag=null;cars=history.pop();$('victory').hidden=true;paint();setStatus('已復原上一步。');};
$('reset').onclick=()=>start(current);
$('random').onclick=()=>{if(!manifest)return;const b=manifest.bands[band],id=b.start+Math.floor(Math.random()*(b.end-b.start+1));page=Math.floor((id-b.start)/12);start(id);};
$('next').onclick=()=>{if(loading)return;const id=current===manifest.total?1:current+1;band=manifest.bands.findIndex(b=>id>=b.start&&id<=b.end);page=Math.floor((id-manifest.bands[band].start)/12);renderBands();start(id);};
$('prev-page').onclick=()=>{page--;renderList()};$('next-page').onclick=()=>{page++;renderList()};
$('help').onclick=()=>$('help-dialog').showModal();$('close-help').onclick=$('start-playing').onclick=()=>$('help-dialog').close();
async function init(){try{const r=await fetch('./data/manifest.json');if(!r.ok)throw Error('manifest');manifest=await r.json();$('total').textContent=manifest.total.toLocaleString();renderBands();await start(1);}catch{setStatus('無法載入題庫，請確認網路後重新整理頁面。');}}
init();
