import test from 'node:test';
import assert from 'node:assert/strict';
import {defaultLayouts, normalizeLayouts, exportLayout, importLayout, clamp} from '../touch-editor.mjs';

test('contains independent infantry and vehicle layouts',()=>{
 const d=defaultLayouts();assert.equal(d.infantry.length,10);assert.equal(d.vehicle.length,8);
 const old=d.vehicle[0].x;d.infantry[0].x=77;assert.equal(d.vehicle[0].x,old);
});
test('round trip preserves positions and sizes',()=>{
 const d=defaultLayouts();d.infantry[0].x=45.5;d.vehicle[2].size=72;
 const restored=importLayout(exportLayout(d));assert.equal(restored.infantry[0].x,45.5);assert.equal(restored.vehicle[2].size,72);
});
test('limits values even when imported values are extreme',()=>{
 const d=defaultLayouts();d.infantry[0].size=2000;d.infantry[0].opacity=-90;d.infantry[0].x=500;
 const r=normalizeLayouts(d);assert.equal(r.infantry[0].size,150);assert.equal(r.infantry[0].opacity,0.3);assert.equal(r.infantry[0].x,100);
});
test('rejects missing controls or invalid types',()=>{
 const d=defaultLayouts();d.vehicle=[];assert.throws(()=>normalizeLayouts(d),/Отсутствует кнопка/);
 const d2=defaultLayouts();d2.infantry[1].x='invalid';assert.throws(()=>normalizeLayouts(d2),/Некорректное значение/);
});
test('rejects unknown schema versions',()=>assert.throws(()=>importLayout('{"version":2,"layouts":{}}'),/версия/));
test('clamp stable at the boundaries',()=>{assert.equal(clamp(-2,0,100),0);assert.equal(clamp(3,0,100),3);assert.equal(clamp(999,0,100),100)});