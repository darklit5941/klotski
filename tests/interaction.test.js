import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
import {parseBoard,limits,move,won} from '../engine.js';
function game(){
  const nodes=new Map(),events=[],captures=new Set();
  const element=()=>({style:{setProperty(){}},dataset:{},classList:{add(){},remove(){}},setAttribute(){},append(){},replaceChildren(){events.push('paint')},addEventListener(type,fn){this[type]=fn},clientWidth:600});
  const get=id=>{if(!nodes.has(id))nodes.set(id,element());return nodes.get(id)};
  const board=get('board');
  board.setPointerCapture=id=>{captures.add(id);events.push('capture')};
  board.hasPointerCapture=id=>captures.has(id);
  board.releasePointerCapture=id=>{captures.delete(id);events.push('release');board.lostpointercapture({pointerId:id})};
  const context=vm.createContext({parseBoard,limits,move,won,document:{getElementById:get,createElement:element},localStorage:{getItem(){return '{}'}}});
  const source=readFileSync(new URL('../app.js',import.meta.url),'utf8').replace(/^import .*\n/,'').replace(/init\(\);\s*$/,'');
  vm.runInContext(source,context);
  vm.runInContext("cars=[{id:'A',horizontal:true,x:0,y:2,length:2}];",context);
  const car=element();car.dataset.car='A';car.closest=()=>car;
  return {board,car,context,events,captures};
}
for(const pointerType of ['touch','mouse'])test(`${pointerType} drag releases capture before repaint and accepts another gesture`,()=>{
  const g=game();let prevented=0;
  const e={target:g.car,button:0,pointerId:1,pointerType,clientX:0,clientY:0,preventDefault(){prevented++}};
  g.board.pointerdown(e);
  assert.equal(prevented,pointerType==='mouse'?1:0);
  g.board.pointermove({...e,clientX:100});g.board.pointerup(e);
  assert.deepEqual(g.events,['capture','release','paint']);
  assert.equal(vm.runInContext('history.length',g.context),1);
  assert.equal(g.captures.size,0);
  g.board.pointerdown({...e,pointerId:2});g.board.pointercancel({...e,pointerId:2});
  assert.equal(g.captures.size,0);
  assert.equal(vm.runInContext('history.length',g.context),1);
});
