/** BF1942 WEB touch-HUD layout editor.
 * UI-only proof of concept: no game or game-input integration yet.
 * Nothing is transmitted. The user layout stays in localStorage.
 */
export const STORAGE_KEY = 'bf1942-web-touch-layout-v1';
export const LAYOUT_VERSION = 1;
export const CONTROL_LABELS = Object.freeze({
  move:'Ходьба', look:'Обзор', fire:'Огонь', aim:'Прицел',
  jump:'Прыжок', reload:'Перезарядка', crouch:'Присесть', use:'Действие',
  map:'Карта', weapon:'Оружие', steer:'Руль', throttle:'Газ', brake:'Тормоз', seat:'Место', exit:'Выход'
});
const defaults = {
  infantry: [
    ['move',12,72,112],['look',63,42,88],['fire',89,75,82],
    ['aim',78,59,60],['jump',77,88,52],['reload',65,84,54],
    ['crouch',56,84,51],['use',45,86,50],['map',90,16,50],['weapon',33,85,51]
  ],
  vehicle: [
    ['steer',13,73,112],['look',61,38,88],['fire',89,76,79],
    ['throttle',77,82,72],['brake',64,84,65],['seat',39,84,56],
    ['exit',49,84,56],['map',91,16,50]
  ]
};
export const clamp = (value,min,max) => Math.max(min,Math.min(max,value));
export const defaultLayouts = () => Object.fromEntries(Object.entries(defaults).map(([mode,rows])=>[
  mode, rows.map(([id,x,y,size])=>({id,x,y,size,opacity:0.82}))
]));
export function normalizeLayouts(data){
  if(!data || typeof data !== 'object' || Array.isArray(data)) throw Error('Формат файла не распознан');
  const safe = defaultLayouts();
  for(const mode of ['infantry','vehicle']){
    const rows=data[mode];
    if(!Array.isArray(rows)) throw Error('Отсутствует схема '+mode);
    for(const item of safe[mode]){
      const input=rows.find(x=>x && x.id===item.id);
      if(!input) throw Error('Отсутствует кнопка '+item.id);
      for(const field of ['x','y','size','opacity'])
        if(typeof input[field]!=='number'||!Number.isFinite(input[field])) throw Error('Некорректное значение '+field);
      item.x=clamp(input.x,0,100);
      item.y=clamp(input.y,0,100);
      item.size=clamp(input.size,40,150);
      item.opacity=clamp(input.opacity,0.3,1);
    }
  }
  return safe;
}
export const exportLayout = layouts => JSON.stringify({version:LAYOUT_VERSION,layouts:normalizeLayouts(layouts)},null,2);
export function importLayout(json){
  const data=typeof json==='string'?JSON.parse(json):json;
  if(data.version!==LAYOUT_VERSION) throw Error('Неподдерживаемая версия раскладки');
  return normalizeLayouts(data.layouts);
}

export function initTouchEditor(root = document){
  const $ = id => root.getElementById(id);
  const stage=$('touch-stage');
  if(!stage) return;
  const status=$('layout-status');
  const size=$('control-size');
  const alpha=$('control-opacity');
  const sizeLabel=$('size-display');
  const alphaLabel=$('opacity-display');
  const selectedLabel=$('selected-control');
  let layouts=defaultLayouts();
  try{
    const saved=localStorage.getItem(STORAGE_KEY);
    if(saved)layouts=importLayout(saved);
  }catch(error){ console.warn('Touch layout could not be restored:',error); }
  let mode='infantry';
  let selected='move';
  let dragging=null;
  let showLabels=true;
  const active=()=>layouts[mode];
  const selectedControl=()=>active().find(x=>x.id===selected);
  const setStatus=message=>{status.textContent=message;};
  function save(){
    try{localStorage.setItem(STORAGE_KEY,exportLayout(layouts));setStatus('Раскладка сохранена на этом устройстве');}
    catch(e){setStatus('Не удалось сохранить. Экспортируй JSON как резервную копию.');}
  }
  function constrain(control){
    const w=stage.clientWidth,h=stage.clientHeight;
    if(!w||!h)return;
    const mx=Math.min(49,100*control.size/(2*w));
    const my=Math.min(49,100*control.size/(2*h));
    control.x=clamp(control.x,mx,100-mx);
    control.y=clamp(control.y,my,100-my);
  }
  function paint(){
    stage.replaceChildren();
    for(const c of active()){
      constrain(c);
      const b=document.createElement('button');
      b.type='button';
      b.className='touch-control'+(c.id===selected?' selected':'')+(c.id==='fire'?' fire-button':'');
      b.dataset.id=c.id;
      b.setAttribute('aria-label',CONTROL_LABELS[c.id]+' — перетащить');
      b.setAttribute('aria-pressed',String(c.id===selected));
      b.textContent=showLabels?CONTROL_LABELS[c.id]:c.id.toUpperCase();
      b.style.left=c.x+'%';b.style.top=c.y+'%';
      b.style.width=c.size+'px';b.style.height=c.size+'px';
      b.style.opacity=String(c.opacity);
      b.addEventListener('pointerdown',e=>{
        if(e.button!==0 && e.pointerType==='mouse')return;
        e.preventDefault();
        selected=c.id;
        b.setPointerCapture(e.pointerId);
        dragging={id:c.id,pointerId:e.pointerId,startX:e.clientX,startY:e.clientY,x:c.x,y:c.y,moved:false};
        stage.querySelectorAll('.touch-control').forEach(node=>{
          const isActive=node===b;
          node.classList.toggle('selected',isActive);
          node.setAttribute('aria-pressed',String(isActive));
        });
        syncSelected();
      });
      b.addEventListener('pointermove',e=>{
        if(!dragging||dragging.id!==c.id||dragging.pointerId!==e.pointerId)return;
        const rect=stage.getBoundingClientRect();
        const dx=(e.clientX-dragging.startX)/rect.width*100;
        const dy=(e.clientY-dragging.startY)/rect.height*100;
        if(Math.abs(dx)+Math.abs(dy)>0.3)dragging.moved=true;
        c.x=dragging.x+dx;c.y=dragging.y+dy;constrain(c);
        b.style.left=c.x+'%';b.style.top=c.y+'%';
        setStatus('Размещаем: '+CONTROL_LABELS[c.id]);
      });
      const finish=e=>{
        if(!dragging||dragging.id!==c.id||dragging.pointerId!==e.pointerId)return;
        dragging=null;
        save();
      };
      b.addEventListener('pointerup',finish);
      b.addEventListener('pointercancel',finish);
      b.addEventListener('keydown',e=>{
        const delta={ArrowLeft:[-1,0],ArrowRight:[1,0],ArrowUp:[0,-1],ArrowDown:[0,1]}[e.key];
        if(!delta)return;
        e.preventDefault();selected=c.id;c.x+=delta[0];c.y+=delta[1];constrain(c);paint();save();
      });
      stage.append(b);
    }
    syncSelected();
  }
  function syncSelected(){
    const c=selectedControl();
    if(!c)return;
    selectedLabel.textContent=CONTROL_LABELS[c.id];
    size.value=String(c.size);
    alpha.value=String(Math.round(c.opacity*100));
    sizeLabel.textContent=c.size+' px';
    alphaLabel.textContent=Math.round(c.opacity*100)+'%';
  }
  function setMode(next){
    mode=next;
    selected=active()[0].id;
    for(const btn of root.querySelectorAll('[data-touch-mode]')){
      const on=btn.dataset.touchMode===next;
      btn.classList.toggle('active',on);
      btn.setAttribute('aria-pressed',String(on));
    }
    paint();setStatus('Режим: '+(mode==='infantry'?'пехота':'техника'));
  }
  root.querySelectorAll('[data-touch-mode]').forEach(btn=>btn.addEventListener('click',()=>setMode(btn.dataset.touchMode)));
  size.addEventListener('input',()=>{const c=selectedControl();c.size=Number(size.value);constrain(c);paint();save();});
  alpha.addEventListener('input',()=>{const c=selectedControl();c.opacity=Number(alpha.value)/100;paint();save();});
  $('layout-reset').addEventListener('click',()=>{
    layouts[mode]=defaultLayouts()[mode];selected=active()[0].id;paint();save();setStatus('Раскладка режима восстановлена');
  });
  $('layout-save').addEventListener('click',save);
  $('layout-export').addEventListener('click',()=>{
    const blob=new Blob([exportLayout(layouts)],{type:'application/json'});
    const url=URL.createObjectURL(blob);const a=document.createElement('a');a.href=url;a.download='bf1942-touch-layout.json';a.click();setTimeout(()=>URL.revokeObjectURL(url),2000);
    setStatus('Скачана резервная копия схемы');
  });
  $('layout-import-trigger').addEventListener('click',()=>$('layout-import').click());
  $('layout-import').addEventListener('change',async e=>{
    const file=e.target.files?.[0];if(!file)return;
    try{
      if(file.size>200000)throw Error('Файл слишком большой');
      layouts=importLayout(await file.text());selected=active()[0].id;paint();save();setStatus('Раскладка восстановлена из JSON');
    }catch(err){setStatus('Ошибка импорта: '+err.message);}
    e.target.value='';
  });
  $('layout-labels').addEventListener('change',e=>{showLabels=e.target.checked;paint();});
  window.addEventListener('resize',()=>paint(),{passive:true});
  setMode(mode);
}
if(typeof document!=='undefined'){
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',()=>initTouchEditor());
  else initTouchEditor();
}