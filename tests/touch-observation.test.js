import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import vm from 'node:vm';
const source=readFileSync(new URL('../app.js',import.meta.url),'utf8');
const setup=source.slice(source.indexOf('function setupTouchObservation(){'),source.indexOf('\nsetupTouchObservation();'));
function inspect(search){
  let panels=0;const listeners=[];
  vm.runInNewContext(`let trace;${setup};setupTouchObservation();`,{
    window:{location:{search}},URLSearchParams,
    document:{
      createElement(){return {style:{},setAttribute(){},append(){}}},
      querySelector(){return {after(){panels++}}},
      addEventListener(type,fn,options){listeners.push({type,passive:options.passive,capture:options.capture,handler:fn.toString()})}
    }
  });
  return {panels,listeners};
}
test('ordinary homepage uses the same event-only path verified on iPhone',()=>{
  const normal=inspect('');
  assert.deepEqual(normal,inspect('?debug-touch=events'));
  assert.equal(normal.panels,0);
  assert.equal(normal.listeners.length,8);
  for(const l of normal.listeners){assert.equal(l.passive,true);assert.equal(l.capture,true)}
});
test('full diagnostic panel stays opt-in and layout-only comparison stays isolated',()=>{
  assert.equal(inspect('?debug-touch=1').panels,1);
  assert.equal(inspect('?debug-touch=1').listeners.length,8);
  assert.deepEqual(inspect('?debug-touch=layout'),{panels:1,listeners:[]});
});
