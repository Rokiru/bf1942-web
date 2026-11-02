import test from 'node:test';
import assert from 'node:assert/strict';
import {parseRFA, previewTextEntry, RfaFormatError} from '../rfa.mjs';

// Completely synthetic archive fixture. No Electronic Arts / DICE content.
function fixture({v11=true, compressed=false, path='bf1942/levels/Test/init.con', contents='rem synthetic fixture\n'}={}) {
  const enc=new TextEncoder(), name=enc.encode(path), data=enc.encode(contents);
  const header=v11?36:156, index=header+data.length;
  const b=new Uint8Array(index+4+4+name.length+24), d=new DataView(b.buffer);
  if(v11)b.set(enc.encode('Refractor2 FlatArchive 1.1  '));
  d.setUint32(v11?28:0,index,true);
  d.setUint32(v11?32:4,compressed?1:0,true);
  b.set(data,header);d.setUint32(index,1,true);d.setUint32(index+4,name.length,true);
  b.set(name,index+8);
  const m=index+8+name.length;
  d.setUint32(m,data.length,true);d.setUint32(m+4,data.length,true);d.setUint32(m+8,header,true);
  return new Blob([b]);
}
test('RFA 1.1: reads a synthetic directory and an uncompressed CON',async()=>{
  const f=fixture(),r=await parseRFA(f);
  assert.equal(r.version,'1.1');assert.equal(r.count,1);
  assert.equal(r.entries[0].path,'bf1942/levels/Test/init.con');
  assert.equal(await previewTextEntry(f,r,r.entries[0]),'rem synthetic fixture\n');
});
test('RFA 1.0: reads synthetic directory',async()=>{
  const r=await parseRFA(fixture({v11:false}));
  assert.equal(r.version,'1.0');assert.equal(r.count,1);
});
test('rejects out-of-bounds index',async()=>{
  const b=new Uint8Array(await fixture().arrayBuffer());
  new DataView(b.buffer).setUint32(28,b.length+1,true);
  await assert.rejects(parseRFA(new Blob([b])),RfaFormatError);
});
test('rejects broken filename length',async()=>{
  const b=new Uint8Array(await fixture().arrayBuffer()),d=new DataView(b.buffer);
  d.setUint32(d.getUint32(28,true)+4,0xffffffff,true);
  await assert.rejects(parseRFA(new Blob([b])),RfaFormatError);
});
test('compressed RFA: lists filenames but does not fake LZO decompression',async()=>{
  const f=fixture({compressed:true}),r=await parseRFA(f);
  assert.equal(r.compressed,true);
  await assert.rejects(previewTextEntry(f,r,r.entries[0]),/LZO1X/);
});
