// MIDI
function vl(v){var o=[];o.push(v&127);v>>=7;while(v){o.push((v&127)|128);v>>=7;}o.reverse();return o;}
function u32(v){return[(v>>24)&255,(v>>16)&255,(v>>8)&255,v&255];}
function u16(v){return[(v>>8)&255,v&255];}
function nOn(ch,n,vel,d){d=d||0;return vl(d).concat([0x90|ch,n,vel]);}
function nOff(ch,n,d){d=d||0;return vl(d).concat([0x80|ch,n,64]);}
function pcB(ch,p){return[0,0xC0|ch,p];}
function mkTrk(ev,name){var b=[];if(name){var nb=[].slice.call(new TextEncoder().encode(name));b=[0,255,3].concat(vl(nb.length)).concat(nb);}b=b.concat(ev).concat([0,255,47,0]);return[77,84,114,107].concat(u32(b.length)).concat(b);}
function mkHdr(n){return[77,84,104,100,0,0,0,6,0,1].concat(u16(n)).concat(u16(480));}

var SCALES={major:[0,2,4,5,7,9,11],natural_minor:[0,2,3,5,7,8,10],harmonic_minor:[0,2,3,5,7,8,11],pentatonic:[0,2,4,7,9],blues:[0,3,5,6,7,10],dorian:[0,2,3,5,7,9,10],mixolydian:[0,2,4,5,7,9,10],lydian:[0,2,4,6,7,9,11],phrygian:[0,1,3,5,7,8,10],locrian:[0,1,3,5,6,8,10]};
var TS_BEATS={'4/4':4,'3/4':3,'6/8':6,'5/4':5};
var NN=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
var CP_DATA={major:[[0,4,7],[2,5,9],[5,9,0],[7,11,2],[9,0,4]],p1564:[[0,4,7],[7,11,2],[9,0,4],[5,9,0]],p4536:[[5,9,0],[7,11,2],[4,7,11],[9,0,4]],p251:[[2,5,9],[7,11,2],[0,4,7],[0,4,7]],p6451:[[9,0,4],[5,9,0],[7,11,2],[0,4,7]],p1541:[[0,4,7],[7,11,2],[5,9,0],[0,4,7]],p50s:[[0,4,7],[9,0,4],[5,9,0],[7,11,2]],pAxis:[[0,4,7],[9,0,4],[4,7,11],[11,2,5]],p2516:[[2,5,9],[7,11,2],[0,4,7],[9,0,4]],pFlamenco:[[9,0,3],[10,2,5],[8,0,3],[7,11,2]],pBlues:[[0,4,10],[0,4,10],[5,9,3],[0,4,10]],pModal:[[0,4,7],[10,2,5],[5,9,0],[0,4,7]],p1625:[[0,4,7],[9,0,4],[2,5,9],[7,11,2]],pMinLoop:[[9,0,4],[5,9,0],[0,4,7],[7,11,2]],pJTTOU:[[5,9,0],[4,7,11],[9,0,4],[0,4,7]]};
var CP_NAMES={major:['I','IIm','IV','V','VIm'],p1564:['I','V','VIm','IV'],p4536:['IV','V','IIIm','VIm'],p251:['IIm','V','I','I'],p6451:['VIm','IV','V','I'],p1541:['I','V','IV','I'],p50s:['I','VIm','IV','V'],pAxis:['I','VIm','IIIm','VIIm'],p2516:['IIm','V','I','VIm'],pFlamenco:['VIm','VII','VI','V'],pBlues:['I7','I7','IV7','I7'],pModal:['I','bVII','IV','I'],p1625:['I','VIm','IIm','V'],pMinLoop:['VIm','IV','I','V'],pJTTOU:['IV','IIIm','VIm','I']};
var DEG_MAP={'I':[0,4,7],'IIm':[2,5,9],'IIIm':[4,7,11],'IV':[5,9,0],'V':[7,11,2],'VIm':[9,0,4],'VIIm':[11,2,5],'I7':[0,4,7,10],'IIm7':[2,5,9,0],'IV7':[5,9,0,3],'V7':[7,11,2,5],'Imaj7':[0,4,7,11],'bVII':[10,2,5],'bIII':[3,7,10],'IVm':[5,8,0]};
var ALL_DEGREES=Object.keys(DEG_MAP);
var MOODS={folk:{pc:.50,lp:.20,rr:.35,vr:.15,ar:0.0,cd:.60,ts:'4/4',nb:[1,1,3,3,0,1,0,0,1,0,0],struct:'folk',end:'fade'},pop:{pc:.55,lp:.35,rr:.30,vr:.25,ar:.2,cd:.50,ts:'4/4',nb:[1,1,3,4,1,1,0,0,1,0,0],struct:'jpop',end:'fade'},jazz:{pc:.55,lp:.40,rr:.20,vr:.50,ar:0.0,cd:.90,ts:'4/4',nb:[0,0,2,3,2,1,0,0,2,1,0],struct:'folk',end:'res'},epic:{pc:.75,lp:.60,rr:.25,vr:.20,ar:.7,cd:.55,ts:'4/4',nb:[0,2,2,3,1,2,0,0,1,0,0],struct:'jpop',end:'hold'},sad:{pc:.40,lp:.15,rr:.50,vr:.10,ar:-.3,cd:.65,ts:'4/4',nb:[2,2,3,2,0,2,0,0,1,0,0],struct:'folk',end:'hold'},happy:{pc:.65,lp:.35,rr:.25,vr:.30,ar:.5,cd:.40,ts:'4/4',nb:[0,1,3,4,1,1,0,0,1,0,0],struct:'jpop',end:'fade'},cinematic:{pc:.65,lp:.50,rr:.40,vr:.20,ar:.4,cd:.70,ts:'4/4',nb:[2,2,2,2,0,2,0,0,1,0,0],struct:'jpop',end:'hold'},lofi:{pc:.45,lp:.20,rr:.45,vr:.30,ar:-.1,cd:.55,ts:'4/4',nb:[1,2,3,2,0,1,0,1,1,0,0],struct:'folk',end:'fade'},dark:{pc:.35,lp:.45,rr:.30,vr:.25,ar:-.5,cd:.75,ts:'4/4',nb:[1,2,2,2,1,1,0,0,1,0,0],struct:'folk',end:'hold'},romantic:{pc:.55,lp:.20,rr:.45,vr:.10,ar:.1,cd:.60,ts:'3/4',nb:[2,2,3,2,0,2,0,0,1,0,0],struct:'folk',end:'hold'},tense:{pc:.50,lp:.55,rr:.15,vr:.40,ar:.3,cd:.80,ts:'4/4',nb:[0,0,2,4,3,1,0,0,1,1,0],struct:'jpop',end:'res'},playful:{pc:.60,lp:.40,rr:.20,vr:.45,ar:.3,cd:.40,ts:'4/4',nb:[0,0,2,4,2,1,0,0,1,1,0],struct:'tiktok',end:'fade'}};
var PCOL={INTRO:'#666',A:'#47ffe8',PRE:'#b3f7b3',B:'#e8ff47',CHORUS:'#ff4787',INTER:'#47b3ff',BRIDGE:'#a78bfa',OUTRO:'#666'};
var PLBL={INTRO:'INTRO',A:'Aメロ',PRE:'プレコーラス',B:'Bメロ',CHORUS:'CHORUS',INTER:'INTER(間奏)',BRIDGE:'BRIDGE',OUTRO:'OUTRO'};
var ALL_PARTS=['INTRO','A','PRE','B','CHORUS','INTER','BRIDGE','OUTRO'];

// ★ 基本パターン5種
var GTR_BASICS=[
  {id:0,name:'① ４拍',    desc:'全音符×1',    icon:'𝅝'},
  {id:1,name:'② ２ビート', desc:'2分音符×2',   icon:'𝅗𝅥𝅗𝅥'},
  {id:2,name:'③ ４ビート', desc:'4分音符×4',   icon:'♩♩♩♩'},
  {id:3,name:'④ ８ビート', desc:'8分音符×8 D/U',icon:'♪♪×8'},
  {id:4,name:'⑤ 16ビート', desc:'16分音符×16', icon:'♬×16'}
];
// ★ アーティキュレーション5種
var GTR_ARTS=[
  {id:0,name:'ストレート', desc:'そのまま',         color:'var(--ac2)'},
  {id:1,name:'ミュート',   desc:'短音価・低ベロ',    color:'var(--ac5)'},
  {id:2,name:'シンコペ',   desc:'裏拍へ移動',        color:'var(--ac3)'},
  {id:3,name:'カッティング',desc:'ミュート+シンコペ', color:'var(--ac4)'},
  {id:4,name:'アルペジオ', desc:'コードを分散',      color:'#b3f7b3'}
];
// ★ 高度パターン5種 (⑥〜⑩)
var GTR_ADV=[
  {id:5, name:'⑥ ８ビートA', desc:'タン-タタ-タン-タタ'},
  {id:6, name:'⑦ ８ビートB', desc:'タン タタ-ンタ タタ'},
  {id:7, name:'⑧ 16ビートA', desc:'タン-タン タン-タタ×2'},
  {id:8, name:'⑨ 16ビートB', desc:'タタ-タン バリエーション'},
  {id:9, name:'⑩ 16ビートC', desc:'アップをのばす変形'}
];

// ★ プラグイン対応: コア楽器(mel/gtr)はここで定義。
//   他の楽器(lead/bas/piano/str/drm 等)は plugins/*.js が registerInstrument() で登録し、
//   initApp() 実行時に INST_DEFS へ自動的に合流する（buildInstDefsFromPlugins参照）。
var INST_DEFS={
  mel: {label:'🎵 メロディ',   pc:73, styles:['フルート','バイオリン','ピアノ','シンセ'], pcs:[73,40,0,80]},
  gtr: {label:'🎸 コードギター',pc:25, styles:null, pcs:[25]}// gtrは専用UI
};
PCOL.MAIN='#ffb347';PLBL.MAIN='⭐ MAIN（共通）';

// ══════════════════════════════════════════════
// ★ プラグインレジストリ
// ══════════════════════════════════════════════
// 各楽器プラグインは registerInstrument({id,name,pc,styles,pcs,generate}) を呼んで自己登録する。
// id: INST_DEFS / partInst のキーとして使われる短い識別子 (例: 'bas')
// name: UIに表示するラベル (例: '🎸 ベース')
// pc: デフォルトのMIDIプログラムチェンジ番号
// styles: スタイル名のドロップダウン配列 (専用UIを使う場合は null)
// pcs: 各スタイルに対応するプログラムチェンジ番号配列
// generate(ctx): MIDIノート生成関数。ctx の内容は各プラグインファイルのコメントを参照。
window.INSTRUMENT_PLUGINS=window.INSTRUMENT_PLUGINS||{};
window.PLUGIN_ORDER=window.PLUGIN_ORDER||[];
function registerInstrument(def){
  if(!def||!def.id)throw new Error('registerInstrument: id is required');
  if(!def.generate)throw new Error('registerInstrument: generate() is required (id='+def.id+')');
  INSTRUMENT_PLUGINS[def.id]=def;
  if(PLUGIN_ORDER.indexOf(def.id)===-1)PLUGIN_ORDER.push(def.id);
}
// 登録済みプラグインをINST_DEFS(メイン側のUI生成データ)へ合流させる
function buildInstDefsFromPlugins(){
  PLUGIN_ORDER.forEach(function(id){
    var p=INSTRUMENT_PLUGINS[id];
    INST_DEFS[id]={label:p.name,pc:p.pc,styles:p.styles||null,pcs:p.pcs||[p.pc]};
  });
}

var curCP='major',curMood='folk',curTS='4/4',curEnd='fade';
var struct=[],partInst={},partChords={};

function defPartInst(){
  var obj={};Object.keys(INST_DEFS).forEach(function(k){obj[k]={on:(k==='mel'||k==='gtr'||k==='bas'||k==='drm'),st:0,ov:false};});
  // gtr専用: basicPat=0, artPat=0, custom pattern (16分割 0=休 1=D 2=U)
  obj.gtr.basicPat=0;obj.gtr.artPat=0;obj.gtr.useCustom=false;obj.gtr.custom=new Array(16).fill(0);obj.gtr.hr=4;
  // lead専用: リフデータ
  obj.lead.riff={notes:[60,62,64],durations:[1,1,2],repeatRate:50}; // notes=MIDI, durations=8分音符単位, repeatRate=0-100
  // パート終わり休符長 (拍数)
  obj.partEndRest=0;
  return obj;
}
function defPartChord(){return{seq:[]};}
// effective instrument settings: on/offは各構成パーツ毎に独立。st(スタイル)等はMAINを基本に、ovがtrueなら個別設定で上書き
function effInst(idx){
  var main=partInst['MAIN']||defPartInst();
  var key='P'+idx;
  if(idx==null||!partInst[key])return main;
  var p=partInst[key],out={};
  Object.keys(INST_DEFS).forEach(function(k){
    var base=(p[k]&&p[k].ov)?p[k]:main[k];
    var o=Object.assign({},base);
    o.on=(p[k]?p[k].on:base.on); // on/offは常にこのパーツ自身の設定
    out[k]=o;
  });
  return out;
}

function rng(a,b){return a+Math.floor(Math.random()*(b-a+1));}
function pickA(a){return a[Math.floor(Math.random()*a.length)];}
function toggleStep(id){document.getElementById(id).classList.toggle('open');}
function toggleFold(toggleId,bodyId){var t=document.getElementById(toggleId),b=document.getElementById(bodyId);if(!t||!b)return;t.classList.toggle('open');b.classList.toggle('vis');}
function setMPDisp(vid,val){document.getElementById(vid).textContent=(val/100).toFixed(2);}
function setARDisp(val){document.getElementById('ARV').textContent=(val/100).toFixed(1);}
function getMPV(id){return +document.getElementById(id).value/100;}
function getARV(){return +document.getElementById('AR').value/100;}
function selTS(btn){document.querySelectorAll('#TS_BTNS .mb').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');curTS=btn.dataset.ts;}
function selEnd(btn){document.querySelectorAll('[data-end]').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');curEnd=btn.dataset.end;}
function selCP(btn){document.querySelectorAll('#CP_BTNS .cpb').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');curCP=btn.dataset.cp;updateCPPreview();}
function selMood(btn){
  document.querySelectorAll('[data-mood]').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');curMood=btn.dataset.mood;
  var m=MOODS[curMood];if(!m)return;
  [['PC','PCV',m.pc],['LP','LPV',m.lp],['RR','RRV',m.rr],['VR','VRV',m.vr],['CD','CDV',m.cd]].forEach(function(x){var e=document.getElementById(x[0]);if(e)e.value=Math.round(x[2]*100);var v=document.getElementById(x[1]);if(v)v.textContent=x[2].toFixed(2);});
  document.getElementById('AR').value=Math.round(m.ar*100);document.getElementById('ARV').textContent=m.ar.toFixed(1);
  for(var i=0;i<11;i++){var e=document.getElementById('NW'+i);var v=document.getElementById('NV'+i);if(e&&v){e.value=m.nb[i];v.textContent=m.nb[i];}}
  var tb=document.querySelector('[data-ts="'+m.ts+'"]');if(tb)selTS(tb);
  var eb=document.querySelector('[data-end="'+m.end+'"]');if(eb)selEnd(eb);
  if(struct.length===0)presetStruct(m.struct||'folk');
  syncFIVarRate();
}

function updateCPPreview(){
  var root=parseInt(document.getElementById('KEY').value);
  var names=CP_NAMES[curCP]||[];var data=CP_DATA[curCP]||CP_DATA.major;
  var row=document.getElementById('CP_PREVIEW');row.innerHTML='';
  var total=names.length;
  for(var i=0;i<total;i++){
    var ivs=data[i%data.length];var rootNote=(root+ivs[0])%12;var rn=NN[rootNote];
    var type='';if(ivs[1]-ivs[0]===3||(ivs[1]-ivs[0]+12)%12===3)type='m';else if(ivs.length>=4)type='7';
    var chip=document.createElement('div');chip.className='cp-chip';chip.textContent=rn+type;chip.title=names[i];row.appendChild(chip);
    if(i<total-1){var arr=document.createElement('span');arr.className='cp-arrow';arr.textContent='→';row.appendChild(arr);}
  }
}

// ★ v7.7.0 フレーズ設計
var curFL=2; // フレーズ長 (小節数)
var curSP='AUTO'; // セットパターン
// フレーズ継承設定
var FI_SETTINGS={}; // part -> {mode:'off'|'phrase'|'variation', structOnly:false, syncVar:true, varRate:20}
var A_INHERIT_PARTS=['INTRO','PRE','B','CHORUS','INTER','BRIDGE','OUTRO'];
// 後方互換のため残す
var A_PHRASE_REST={INTRO:0,PRE:0,B:0,CHORUS:0,INTER:0,BRIDGE:0,OUTRO:0};

function defFISetting(){return{mode:'off',structOnly:false,syncVar:true,varRate:20};}
function getFISetting(part){if(!FI_SETTINGS[part])FI_SETTINGS[part]=defFISetting();return FI_SETTINGS[part];}

function selFL(btn){document.querySelectorAll('#FL_BTNS .flb').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');curFL=+btn.dataset.fl;document.getElementById('FL_VAL').textContent=curFL+'小節';}
function selSP(btn){document.querySelectorAll('#SP_BTNS .spb').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');curSP=btn.dataset.sp;document.getElementById('SP_VAL').textContent=curSP;var ap=document.getElementById('AUTO_PARAMS');if(ap)ap.classList.toggle('hidden',curSP!=='AUTO');}

// セットパターンから各フレーズ番号の配列を取得 (0=A,1=B,2=C,3=D)
function getSetPattern(totalBars){
  var fl=curFL||2;
  var phraseCount=Math.max(1,Math.ceil(totalBars/fl));
  if(curSP==='AUTO'){
    var rr=+document.getElementById('RR').value/100;
    // repeatRate -> A B C D傾向
    var pat=[];
    var distinctUsed=[0];
    for(var i=0;i<phraseCount;i++){
      if(i===0){pat.push(0);continue;}
      var r=Math.random();
      if(r<rr){
        // 反復: 既存のどれかを使う
        pat.push(pickA(distinctUsed));
      }else{
        // 新規: 新しい記号か既存のどれか(rr寄りに既存をピック)
        if(distinctUsed.length>=4||Math.random()<rr*0.5){
          pat.push(pickA(distinctUsed));
        }else{
          var next=distinctUsed[distinctUsed.length-1]+1;
          distinctUsed.push(next);pat.push(next);
        }
      }
    }
    return pat;
  }
  // 固定パターン解析 ("1A2B3A4B" -> [0,1,0,1])
  var seqStr=curSP.replace(/[0-9]/g,'');
  var letters=seqStr.split('');
  var map={A:0,B:1,C:2,D:3};
  var base=letters.map(function(l){return map[l]!==undefined?map[l]:0;});
  var result=[];
  for(var i=0;i<phraseCount;i++){result.push(base[i%base.length]);}
  return result;
}

function syncFIVarRate(){
  var vr=+document.getElementById('VR').value;
  A_INHERIT_PARTS.forEach(function(part){
    var fi=getFISetting(part);if(fi.syncVar){fi.varRate=vr;}
  });
  // update sliders if open
  document.querySelectorAll('.fi-var-slider').forEach(function(sl){
    var part=sl.dataset.part;var fi=getFISetting(part);if(fi.syncVar){sl.value=fi.varRate;var span=document.getElementById('FIVAR_'+part);if(span)span.textContent=(fi.varRate/100).toFixed(2);}
  });
}

// ★ スケールからコード構築 (buildChordFromScale方式)
// scaleIntervals: スケールの音程配列, degree: 0-6 (スケール度数), root: MIDIルートノート
function buildChordFromScale(rootMidi, scaleInts, degree){
  var len=scaleInts.length;
  // 3和音: degree, degree+2, degree+4 (スケール内でstep2ずつ)
  var d0=scaleInts[degree%len];
  var d1=scaleInts[(degree+2)%len];
  var d2=scaleInts[(degree+4)%len];
  // オクターブ巻き戻し
  if(d1<=d0)d1+=12;if(d2<=d1)d2+=12;
  return[rootMidi+d0,rootMidi+d1,rootMidi+d2];
}

// スケールに基づいたコードデータ生成 (CP_DATAの代替として使用)
// returns array of chord [absolute intervals from root%12 perspective]
function buildScaleChords(scaleName){
  var iv=SCALES[scaleName]||SCALES.major;
  var len=iv.length;
  // 7度数分生成 (ペンタ等の5音スケールは5度数)
  var chords=[];
  for(var d=0;d<len;d++){
    var d0=iv[d%len];
    var d1=iv[(d+2)%len];var d2=iv[(d+4)%len];
    if(d1<=d0)d1+=12;if(d2<=d1)d2+=12;
    // 相対インターバル (root=0基準)
    chords.push([d0%12, d1%12, d2%12]);
  }
  return chords;
}

// ★ コード機能判定 (スケールに応じてトニック/サブドミナント/ドミナント)
function getChordFunction(scaleName, degree){
  var tonics,subs,doms;
  switch(scaleName){
    case 'major':
    case 'lydian':
      tonics=[0,2,5];subs=[1,3];doms=[4,6];break;
    case 'natural_minor':
    case 'dorian':
    case 'phrygian':
    case 'locrian':
      tonics=[0,2,5];subs=[1,3];doms=[4,6];break;
    case 'harmonic_minor':
      tonics=[0,5];subs=[1,3];doms=[4,6];break;
    case 'mixolydian':
      tonics=[0,2,5];subs=[1,3];doms=[4,6];break;
    case 'pentatonic':case 'blues':
      tonics=[0,2];subs=[1,3];doms=[4];break;
    default:tonics=[0,2,5];subs=[1,3];doms=[4,6];
  }
  if(tonics.indexOf(degree)>=0)return'tonic';
  if(subs.indexOf(degree)>=0)return'subdominant';
  if(doms.indexOf(degree)>=0)return'dominant';
  return'';
}

// ★ DEG_MAPのコード機能色をスケールに応じて付与
function getDegFuncClass(deg, scaleName){
  // 固定度数マップのファンクション判定
  var major_tonic=['I','iii','IIIm','vi','VIm'];
  var major_sub=['ii','IIm','IV','IIm7','IV7','IVm'];
  var major_dom=['V','V7','vii','VIIm','bVII'];
  if(major_tonic.indexOf(deg)>=0)return'tonic';
  if(major_sub.indexOf(deg)>=0)return'subdominant';
  if(major_dom.indexOf(deg)>=0)return'dominant';
  // Minor/Modal
  var minor_tonic=['i','Im','bIII'];
  var minor_sub=['iv','IVm','bVI'];
  var minor_dom=['v','VII'];
  if(minor_tonic.indexOf(deg)>=0)return'tonic';
  if(minor_sub.indexOf(deg)>=0)return'subdominant';
  if(minor_dom.indexOf(deg)>=0)return'dominant';
  return'';
}

// ★ フレーズ継承グリッド構築
function buildFIGrid(){
  var grid=document.getElementById('FI_GRID');if(!grid)return;
  grid.innerHTML='';
  A_INHERIT_PARTS.forEach(function(part){
    var color=PCOL[part]||'#888';
    var fi=getFISetting(part);
    var sec=document.createElement('div');sec.className='fi-section';
    var hdr=document.createElement('div');hdr.className='fi-part-header';
    hdr.innerHTML='<span class="fi-dot" style="background:'+color+'"></span><span class="fi-part-name" style="color:'+color+'">'+PLBL[part]+'</span>';
    sec.appendChild(hdr);
    // Mode buttons
    var modeGrid=document.createElement('div');modeGrid.className='fi-mode-grid';
    var modes=[
      {v:'off',n:'OFF',d:'新規生成'},
      {v:'phrase',n:'PHRASE',d:'そのまま継承'},
      {v:'variation',n:'VARIATION',d:'変形して継承'}
    ];
    modes.forEach(function(m){
      var btn=document.createElement('button');btn.className='fimb'+(fi.mode===m.v?' on':'');
      btn.innerHTML='<span class="fimn">'+m.n+'</span><span class="fimd">'+m.d+'</span>';
      btn.onclick=function(){
        fi.mode=m.v;modeGrid.querySelectorAll('.fimb').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');
        // show/hide sub-options
        var offDiv=sec.querySelector('.fi-off-opts');
        var varDiv=sec.querySelector('.fi-var-row');
        if(offDiv)offDiv.style.display=(m.v==='off')?'':'none';
        if(varDiv)varDiv.classList.toggle('hidden',m.v!=='variation');
      };
      modeGrid.appendChild(btn);
    });
    sec.appendChild(modeGrid);
    // OFF sub-option: 構造のみ適用
    var offDiv=document.createElement('div');offDiv.className='fi-off-opts';offDiv.style.display=(fi.mode==='off')?'':'none';
    offDiv.innerHTML='<div class="fi-struct-opt"><input type="checkbox" class="fi-struct-check" id="FISTRUCT_'+part+'"'+(fi.structOnly?' checked':'')+' onchange="getFISetting(\''+part+'\').structOnly=this.checked"><label for="FISTRUCT_'+part+'" class="fi-sync-label">構造のみ適用（フレーズ設計の長さ/パターンを適用、モチーフは新規）</label></div>';
    sec.appendChild(offDiv);
    // VARIATION sub-option: 変形率
    var varRow=document.createElement('div');varRow.className='fi-var-row'+(fi.mode!=='variation'?' hidden':'');
    var syncChecked=fi.syncVar!==false;
    var curVarRate=fi.varRate!==undefined?fi.varRate:20;
    varRow.innerHTML='<div class="fi-sync-row"><input type="checkbox" class="fi-sync-check" id="FISYNC_'+part+'"'+(syncChecked?' checked':'')+' onchange="onFISyncChange(\''+part+'\',this.checked)"><label for="FISYNC_'+part+'" class="fi-sync-label">フレーズ内変形率と同期</label></div>'+
      '<div id="FISEP_'+part+'" style="'+(syncChecked?'display:none':'')+'"><div style="font-family:\'Space Mono\',monospace;font-size:7px;color:var(--mt);letter-spacing:1px;margin-bottom:3px;display:flex;justify-content:space-between">継承変形率 <span id="FIVAR_'+part+'" style="color:var(--ac3)">'+(curVarRate/100).toFixed(2)+'</span></div><input type="range" class="fi-var-slider" data-part="'+part+'" min="0" max="100" value="'+curVarRate+'" step="5" style="accent-color:var(--ac3)" oninput="onFIVarInput(\''+part+'\',this.value)"></div>';
    sec.appendChild(varRow);
    grid.appendChild(sec);
  });
}
function onFISyncChange(part,checked){var fi=getFISetting(part);fi.syncVar=checked;var sep=document.getElementById('FISEP_'+part);if(sep)sep.style.display=checked?'none':'';if(checked){fi.varRate=+document.getElementById('VR').value;}}
function onFIVarInput(part,val){var fi=getFISetting(part);fi.varRate=+val;var span=document.getElementById('FIVAR_'+part);if(span)span.textContent=(val/100).toFixed(2);}

// 後方互換
function getAInheritMode(part){var fi=getFISetting(part);return fi.mode==='off'?'none':fi.mode==='phrase'?'same':'transform';}


// ★ Aメロモチーフ変形関数（将来の拡張に備え分離）
// motif: [{scaleIdx, dur}] の配列
// mode: 'expand'=音価を2倍に, 'substitute'=スケール隣接音へ置換, 'invert'=旋律を反転
function transformMotif(motif, mode){
  if(!motif||!motif.length)return motif;
  var methods=['expand','substitute','invert'];
  var m=mode||methods[Math.floor(Math.random()*methods.length)];
  if(m==='expand'){
    return motif.map(function(n){return{scaleIdx:n.scaleIdx,dur:n.dur*2};});
  }
  if(m==='substitute'){
    return motif.map(function(n){var shift=(Math.random()<0.5)?1:-1;return{scaleIdx:n.scaleIdx+shift,dur:n.dur};});
  }
  if(m==='invert'){
    // 旋律の動きを上下反転
    if(motif.length<2)return motif;
    var center=motif[0].scaleIdx;
    return motif.map(function(n){return{scaleIdx:2*center-n.scaleIdx,dur:n.dur};});
  }
  return motif;
}

function buildPartChordGrid(){
  var grid=document.getElementById('PART_CHORD_GRID');grid.innerHTML='';
  var scaleName=document.getElementById('SCALE')?document.getElementById('SCALE').value:'major';
  ALL_PARTS.forEach(function(part){
    if(!partChords[part])partChords[part]=defPartChord();
    var color=PCOL[part]||'#888';
    var card=document.createElement('div');card.className='pc-card';
    card.innerHTML='<div class="pc-part"><span class="pc-dot" style="background:'+color+'"></span><span style="color:'+color+'">'+PLBL[part]+'</span></div>'+
      '<div style="font-family:\'Space Mono\',monospace;font-size:7px;color:var(--mt);margin-bottom:4px">度数を選んで入力（空=共通プリセット）</div>'+
      '<div class="chord-func-legend"><span class="cfl-item"><span class="cfl-dot" style="background:#47b3ff"></span><span style="color:#47b3ff">トニック</span></span><span class="cfl-item"><span class="cfl-dot" style="background:#47ff87"></span><span style="color:#47ff87">サブドミナント</span></span><span class="cfl-item"><span class="cfl-dot" style="background:#ff6b47"></span><span style="color:#ff6b47">ドミナント</span></span></div>'+
      '<div class="degree-btns" id="DEG_'+part+'"></div>'+
      '<div class="chord-seq" id="CSEQ_'+part+'"><span class="chord-empty">← 度数ボタンで追加</span></div>'+
      '<button class="pb" style="margin-top:4px;font-size:7px;padding:3px 7px" onclick="clearPartChord(\''+part+'\')">クリア</button>';
    grid.appendChild(card);
    var degCont=document.getElementById('DEG_'+part);
    ALL_DEGREES.forEach(function(d){
      var btn=document.createElement('button');
      btn.className='deg-btn';
      var fc=getDegFuncClass(d,scaleName);if(fc)btn.classList.add(fc);
      btn.textContent=d;
      btn.title=fc==='tonic'?'トニック':fc==='subdominant'?'サブドミナント':fc==='dominant'?'ドミナント':'';
      btn.onclick=(function(p,deg){return function(){addPartChord(p,deg);};})(part,d);
      degCont.appendChild(btn);
    });
    renderPartChordSeq(part);
  });
}
// スケール変更時にコードグリッドを再描画
document.addEventListener('DOMContentLoaded',function(){var scl=document.getElementById('SCALE');if(scl)scl.addEventListener('change',function(){buildPartChordGrid();updateCPPreview();});});
function addPartChord(part,deg){if(!partChords[part])partChords[part]=defPartChord();partChords[part].seq.push(deg);renderPartChordSeq(part);}
function removePartChord(part,idx){if(partChords[part])partChords[part].seq.splice(idx,1);renderPartChordSeq(part);}
function clearPartChord(part){if(partChords[part])partChords[part].seq=[];renderPartChordSeq(part);}
function renderPartChordSeq(part){
  var seq=document.getElementById('CSEQ_'+part);if(!seq)return;
  seq.innerHTML='';
  var chords=partChords[part]?partChords[part].seq:[];
  var scaleName=document.getElementById('SCALE')?document.getElementById('SCALE').value:'major';
  if(!chords.length){seq.innerHTML='<span class="chord-empty">← 度数ボタンで追加（空=共通プリセット）</span>';return;}
  chords.forEach(function(d,i){
    var tag=document.createElement('span');
    var fc=getDegFuncClass(d,scaleName);
    tag.className='chord-tag'+(fc?' '+fc:'');
    tag.textContent=d;
    tag.onclick=(function(p,idx){return function(){removePartChord(p,idx);};})(part,i);
    seq.appendChild(tag);
  });
}
function getChordForPart(part,barIdx,root){
  var scaleName=document.getElementById('SCALE')?document.getElementById('SCALE').value:'major';
  var pc=partChords[part];
  if(pc&&pc.seq.length>0){
    var d=pc.seq[barIdx%pc.seq.length];
    var ivs=DEG_MAP[d]||[0,4,7];
    return ivs.map(function(iv){return root-12+iv;});
  }
  // スケール対応コードデータ
  var scaleChords=buildScaleChords(scaleName);
  var cpData=CP_DATA[curCP]||CP_DATA.major;
  var baseIntervals=cpData[barIdx%cpData.length];
  // scale-built chord を優先 (スケールにある音程から構築)
  // CP_DATAのインデックスをスケール度数として使う
  var cpIdx=barIdx%cpData.length;
  if(scaleChords.length>0){
    var degIdx=cpIdx%scaleChords.length;
    return scaleChords[degIdx].map(function(iv){return root-12+iv;});
  }
  return baseIntervals.map(function(iv){return root-12+iv;});
}
function getChordAtBeat(part,absBeat,root,hrBeats){
  var step=Math.floor(absBeat/Math.max(1,hrBeats));
  var scaleName=document.getElementById('SCALE')?document.getElementById('SCALE').value:'major';
  var pc=partChords[part];
  if(pc&&pc.seq.length>0){
    var d=pc.seq[step%pc.seq.length];
    var ivs=DEG_MAP[d]||[0,4,7];
    return ivs.map(function(iv){return root-12+iv;});
  }
  var scaleChords=buildScaleChords(scaleName);
  var cpData=CP_DATA[curCP]||CP_DATA.major;
  var cpIdx=step%cpData.length;
  if(scaleChords.length>0){
    var degIdx=cpIdx%scaleChords.length;
    return scaleChords[degIdx].map(function(iv){return root-12+iv;});
  }
  return cpData[cpIdx].map(function(iv){return root-12+iv;});
}

// ★ 楽器パートタブ (ギター専用UI付き) — MAIN + STEP5で構成した各パーツ毎
function buildPartTabs(){
  var tabs=document.getElementById('PART_TABS'),panels=document.getElementById('PART_PANELS');
  tabs.innerHTML='';panels.innerHTML='';
  if(!partInst['MAIN'])partInst['MAIN']=defPartInst();
  var src=struct.length?struct:[];
  // entries: {tabId, label, color, isMain, idx(struct index or null)}
  var entries=[{tabId:'MAIN',label:PLBL.MAIN,color:PCOL.MAIN,isMain:true,idx:null,part:'MAIN'}];
  src.forEach(function(s,i){
    var key='P'+i;
    if(!partInst[key])partInst[key]=defPartInst();
    entries.push({tabId:key,label:PLBL[s.part]+' #'+(i+1),color:PCOL[s.part]||'#888',isMain:false,idx:i,part:s.part});
  });
  entries.forEach(function(en,i){
    var color=en.color;
    var tab=document.createElement('button');tab.className='part-tab'+(i===0?' on':'');
    tab.textContent=en.label;
    if(i===0){tab.style.borderColor=color;tab.style.color=color;}
    tab.onclick=function(){document.querySelectorAll('.part-tab').forEach(function(t){t.classList.remove('on');t.style.borderColor='';t.style.color='';});document.querySelectorAll('.part-panel').forEach(function(p){p.classList.remove('vis');});tab.classList.add('on');tab.style.borderColor=color;tab.style.color=color;document.getElementById('PP_'+en.tabId).classList.add('vis');};
    tabs.appendChild(tab);
    var panel=document.createElement('div');panel.className='part-panel'+(i===0?' vis':'');panel.id='PP_'+en.tabId;
    var inst=partInst[en.tabId];
    var isMain=en.isMain,part=en.part,tabId=en.tabId;
    Object.keys(INST_DEFS).forEach(function(key){
      var def=INST_DEFS[key];var iData=inst[key];
      var wrap=document.createElement('div');wrap.style.marginBottom='8px';
      var row=document.createElement('div');row.className='inst-row';
      var cb=document.createElement('button');cb.className='cb'+(iData.on?' on':'');
      cb.innerHTML='<span class="dot"></span>'+def.label;
      cb.onclick=function(){cb.classList.toggle('on');iData.on=cb.classList.contains('on');};
      row.appendChild(cb);

      // ★ MAIN以外: 個別設定(スタイル上書き)トグル ※on/offは常に個別
      var detailWrap=null,ovBtn=null;
      if(!isMain){
        ovBtn=document.createElement('button');ovBtn.className='ov-toggle'+(iData.ov?' on':'');
        ovBtn.textContent=iData.ov?'🔓 個別設定':'🔒 MAINと共通';
        row.appendChild(ovBtn);
      }
      wrap.appendChild(row);
      detailWrap=document.createElement('div');
      wrap.appendChild(detailWrap);

      function renderDetail(){
        detailWrap.innerHTML='';
        if(!isMain&&!iData.ov){
          var note=document.createElement('div');note.className='ov-note';
          note.textContent='MAINタブの設定（'+(INST_DEFS[key].styles?INST_DEFS[key].styles[partInst.MAIN[key].st]||'':'')+'）を使用中。「個別設定」で上書き可能。';
          detailWrap.appendChild(note);return;
        }
        if(key==='gtr'){
          buildGtrUI(detailWrap,iData,part);
        }else if(key==='lead'&&def.styles&&def.styles.length>0){
          var sel=document.createElement('select');sel.style.cssText='font-size:10px;padding:4px 6px;margin-top:3px;';
          def.styles.forEach(function(s,si){var o=document.createElement('option');o.value=si;o.textContent=s;if(si===iData.st)o.selected=true;sel.appendChild(o);});
          var riffWrap=document.createElement('div');
          function updateRiffVisibility(){riffWrap.style.display=(iData.st===5)?'block':'none';}
          sel.onchange=function(){iData.st=+sel.value;updateRiffVisibility();};
          detailWrap.appendChild(sel);
          buildRiffEditor(riffWrap,iData);
          updateRiffVisibility();
          detailWrap.appendChild(riffWrap);
        }else if(def.styles&&def.styles.length>0){
          var sel=document.createElement('select');sel.style.cssText='font-size:10px;padding:4px 6px;margin-top:3px;';
          def.styles.forEach(function(s,si){var o=document.createElement('option');o.value=si;o.textContent=s;if(si===iData.st)o.selected=true;sel.appendChild(o);});
          sel.onchange=function(){iData.st=+sel.value;};detailWrap.appendChild(sel);
        }
      }
      if(ovBtn)ovBtn.onclick=function(){iData.ov=!iData.ov;ovBtn.classList.toggle('on');ovBtn.textContent=iData.ov?'🔓 個別設定':'🔒 MAINと共通';renderDetail();};
      renderDetail();
      panel.appendChild(wrap);
    });
    // パート終わり休符長 (MAIN以外)
    if(!isMain){
      var perWrap=document.createElement('div');perWrap.style.cssText='margin-top:10px;padding-top:8px;border-top:1px solid var(--bd)';
      var perLabel=document.createElement('div');perLabel.style.cssText='font-family:\'Space Mono\',monospace;font-size:8px;color:var(--mt);letter-spacing:1px;margin-bottom:5px';
      perLabel.textContent='パート終わり休符 (拍数)';
      perWrap.appendChild(perLabel);
      var perRow=document.createElement('div');perRow.style.cssText='display:flex;gap:3px;flex-wrap:wrap;';
      var instRef=inst;
      [0,1,2,4,8,12,16].forEach(function(v){
        var btn=document.createElement('button');
        var curV=instRef.partEndRest||0;
        btn.style.cssText='padding:4px 6px;font-family:\'Space Mono\',monospace;font-size:7px;background:'+(v===curV?'var(--ac5)22':'var(--bg3)')+';border:1px solid '+(v===curV?'var(--ac5)':'var(--bd)')+';color:'+(v===curV?'var(--ac5)':'var(--mt)')+';border-radius:2px;cursor:pointer;transition:all .12s';
        btn.textContent=v;
        btn.onclick=function(){
          instRef.partEndRest=v;
          perRow.querySelectorAll('button').forEach(function(b){b.style.background='var(--bg3)';b.style.borderColor='var(--bd)';b.style.color='var(--mt)';});
          btn.style.background='var(--ac5)22';btn.style.borderColor='var(--ac5)';btn.style.color='var(--ac5)';
        };
        perRow.appendChild(btn);
      });
      perWrap.appendChild(perRow);
      panel.appendChild(perWrap);
    }
    panels.appendChild(panel);
  });
}

// ★ ギター専用UI構築（MAINタブ・個別設定タブ共通で使用）
function buildGtrUI(container,iData,part){
  var gtrSec=document.createElement('div');gtrSec.className='gtr-section';

  // --- 基本パターン（折りたたみ） ---
  var basicFold=document.createElement('div');basicFold.className='fold-toggle open';
  basicFold.innerHTML='<span class="fold-toggle-label">基本パターン（ストローク種別）</span><span class="fold-toggle-arrow">▼</span>';
  var basicBody=document.createElement('div');basicBody.className='fold-body vis';
  basicFold.onclick=function(){basicFold.classList.toggle('open');basicBody.classList.toggle('vis');};
  var bgrid=document.createElement('div');bgrid.className='gtr-basic-grid';
  GTR_BASICS.forEach(function(bp){
    var btn=document.createElement('button');btn.className='gtrb'+((!iData.useCustom&&iData.basicPat===bp.id)?' on':'');
    btn.innerHTML='<span class="gbn">'+bp.name+'</span><span class="gbd">'+bp.desc+'</span>';
    btn.onclick=function(){
      iData.basicPat=bp.id;iData.useCustom=false;
      bgrid.querySelectorAll('.gtrb').forEach(function(x){x.classList.remove('on');});
      gtrSec.querySelectorAll('.advb').forEach(function(x){x.classList.remove('on');});
      var cb=gtrSec.querySelector('.cust-toggle');if(cb)cb.classList.remove('on');
      btn.classList.add('on');
    };
    bgrid.appendChild(btn);
  });
  basicBody.appendChild(bgrid);
  gtrSec.appendChild(basicFold);gtrSec.appendChild(basicBody);

  // --- アーティキュレーション（折りたたみ） ---
  var artFold=document.createElement('div');artFold.className='fold-toggle open';
  artFold.innerHTML='<span class="fold-toggle-label">▼ アーティキュレーション</span><span class="fold-toggle-arrow">▼</span>';
  var artBody=document.createElement('div');artBody.className='fold-body vis';
  artFold.onclick=function(){artFold.classList.toggle('open');artBody.classList.toggle('vis');};
  var al=document.createElement('div');al.className='gtr-art-label';
  al.innerHTML='<span style="font-size:6px;color:var(--mt)">（基本/カスタムパターンに重ねる）</span>';
  artBody.appendChild(al);
  var agrid=document.createElement('div');agrid.className='gtr-art-grid';
  GTR_ARTS.forEach(function(art){
    var btn=document.createElement('button');btn.className='gtra'+(iData.artPat===art.id?' on':'');
    btn.innerHTML='<span class="gan">'+art.name+'</span><span class="gad">'+art.desc+'</span>';
    if(iData.artPat===art.id){btn.style.borderColor=art.color;btn.style.color=art.color;}
    btn.onclick=function(){
      iData.artPat=art.id;
      agrid.querySelectorAll('.gtra').forEach(function(x){x.classList.remove('on');x.style.borderColor='';x.style.color='';});
      btn.classList.add('on');btn.style.borderColor=art.color;btn.style.color=art.color;
    };
    agrid.appendChild(btn);
  });
  artBody.appendChild(agrid);
  gtrSec.appendChild(artFold);gtrSec.appendChild(artBody);

  // --- ハーモニック・リズム（折りたたみ） ---
  var hrFold=document.createElement('div');hrFold.className='fold-toggle';
  hrFold.innerHTML='<span class="fold-toggle-label">▼ ハーモニックリズム</span><span style="font-family:\'Space Mono\',monospace;font-size:6px;color:var(--mt);margin-left:6px">（何拍ごとにコードが変わるか）</span><span class="fold-toggle-arrow">▼</span>';
  var hrBody=document.createElement('div');hrBody.className='adv-body';
  hrFold.onclick=function(){hrFold.classList.toggle('open');hrBody.classList.toggle('vis');};
  var hrGrid=document.createElement('div');hrGrid.className='gtr-art-grid';
  [1,2,4,8,16].forEach(function(hv){
    var btn=document.createElement('button');btn.className='gtra'+((iData.hr||4)===hv?' on':'');
    btn.innerHTML='<span class="gan">'+hv+'拍</span>';
    if((iData.hr||4)===hv){btn.style.borderColor='var(--ac2)';btn.style.color='var(--ac2)';}
    btn.onclick=function(){
      iData.hr=hv;
      hrGrid.querySelectorAll('.gtra').forEach(function(x){x.classList.remove('on');x.style.borderColor='';x.style.color='';});
      btn.classList.add('on');btn.style.borderColor='var(--ac2)';btn.style.color='var(--ac2)';
    };
    hrGrid.appendChild(btn);
  });
  hrBody.appendChild(hrGrid);
  gtrSec.appendChild(hrFold);gtrSec.appendChild(hrBody);

  // --- 高度設定（⑥〜⑩・折りたたみ） ---
  var advToggle=document.createElement('div');advToggle.className='adv-toggle';
  advToggle.innerHTML='<span class="adv-toggle-label">⚙ 高度設定（⑥〜⑩）</span><span style="font-family:\'Space Mono\',monospace;font-size:6px;color:var(--mt);margin-left:6px">専用ストロークパターン</span><span class="adv-toggle-arrow">▼</span>';
  var advBody=document.createElement('div');advBody.className='adv-body';
  advToggle.onclick=function(){advToggle.classList.toggle('open');advBody.classList.toggle('vis');};
  var advGrid=document.createElement('div');advGrid.className='adv-grid';
  GTR_ADV.forEach(function(ap){
    var btn=document.createElement('button');btn.className='advb'+((!iData.useCustom&&iData.basicPat===-1&&iData.st===ap.id)?' on':'');
    btn.innerHTML='<span class="adn">'+ap.name+'</span><span class="add">'+ap.desc+'</span>';
    btn.onclick=function(){
      iData.st=ap.id;iData.basicPat=-1;iData.useCustom=false;
      advGrid.querySelectorAll('.advb').forEach(function(x){x.classList.remove('on');});
      bgrid.querySelectorAll('.gtrb').forEach(function(x){x.classList.remove('on');});
      var cb=gtrSec.querySelector('.cust-toggle');if(cb)cb.classList.remove('on');
      btn.classList.add('on');
    };
    advGrid.appendChild(btn);
  });
  advBody.appendChild(advGrid);
  gtrSec.appendChild(advToggle);gtrSec.appendChild(advBody);

  // --- カスタムパターン（折りたたみ） ---
  var custFold=document.createElement('div');custFold.className='fold-toggle'+(iData.useCustom?' open':'');
  custFold.innerHTML='<span class="fold-toggle-label cust-toggle'+(iData.useCustom?' on':'')+'" style="border:1px solid var(--bd);border-radius:2px;padding:3px 8px;'+(iData.useCustom?'border-color:var(--ac4);color:var(--ac4);background:var(--ac4)15;':'')+'">★ カスタムパターン（16分割）</span><span class="fold-toggle-arrow">▼</span>';
  var custBody=document.createElement('div');custBody.className='fold-body'+(iData.useCustom?' vis':'');
  custFold.onclick=function(){
    custFold.classList.toggle('open');custBody.classList.toggle('vis');
    iData.useCustom=custBody.classList.contains('vis');
    var lab=custFold.querySelector('.cust-toggle');
    if(iData.useCustom){
      iData.basicPat=-1;
      bgrid.querySelectorAll('.gtrb').forEach(function(x){x.classList.remove('on');});
      advGrid.querySelectorAll('.advb').forEach(function(x){x.classList.remove('on');});
      lab.classList.add('on');lab.style.borderColor='var(--ac4)';lab.style.color='var(--ac4)';lab.style.background='var(--ac4)15';
    }else{
      lab.classList.remove('on');lab.style.borderColor='';lab.style.color='';lab.style.background='';
    }
  };
  var beatRow=document.createElement('div');beatRow.className='cust-beat-row';
  for(var bi=0;bi<16;bi++){var bl2=document.createElement('div');bl2.className='cust-beat';bl2.textContent=(bi%4===0)?((bi/4+1)+'拍'):'';beatRow.appendChild(bl2);}
  var cgrid=document.createElement('div');cgrid.className='cust-grid';
  for(var ci=0;ci<16;ci++){
    (function(idx){
      var cell=document.createElement('div');cell.className='cust-cell';
      var v=iData.custom[idx]||0;
      cell.textContent=v===1?'D':v===2?'U':'';
      cell.className='cust-cell'+(v===1?' d':v===2?' u':'');
      cell.onclick=function(){
        iData.custom[idx]=(iData.custom[idx]+1)%3;
        var nv=iData.custom[idx];
        cell.textContent=nv===1?'D':nv===2?'U':'';
        cell.className='cust-cell'+(nv===1?' d':nv===2?' u':'');
      };
      cgrid.appendChild(cell);
    })(ci);
  }
  var hint=document.createElement('div');hint.className='cust-hint';
  hint.textContent='クリックで 空→D(ダウン)→U(アップ)→空 と切替。16分音符単位の升目に配置。連続した升目の間隔がそのまま音価になります（例：1拍分空けてD＝4分音符のダウンストローク）。空の升目は弾きません。';
  custBody.appendChild(beatRow);custBody.appendChild(cgrid);custBody.appendChild(hint);
  gtrSec.appendChild(custFold);gtrSec.appendChild(custBody);

  container.appendChild(gtrSec);
}

// ★ リフエディタ構築 (リードギター st=5 専用)
var NOTE_NAMES_JP=['C','C#','D','D#','E','F','F#','G','G#','A','A#','B'];
function buildRiffEditor(container,iData){
  var riff=iData.riff||(iData.riff={notes:[60,62,64],durations:[1,1,2],repeatRate:50});
  var sec=document.createElement('div');
  sec.style.cssText='background:var(--bg3);border:1px solid var(--bd);border-radius:4px;padding:10px;margin-top:6px;';
  var foldToggle=document.createElement('div');foldToggle.className='fold-toggle';
  foldToggle.innerHTML='<span class="fold-toggle-label">▼ リフエディタ</span><span class="fold-toggle-arrow">▼</span>';
  var foldBody=document.createElement('div');foldBody.className='adv-body';
  foldToggle.onclick=function(){foldToggle.classList.toggle('open');foldBody.classList.toggle('vis');};

  // 音数選択 (2/3/4)
  var noteCntWrap=document.createElement('div');noteCntWrap.style.cssText='margin-bottom:8px;';
  var ncLabel=document.createElement('div');ncLabel.style.cssText='font-family:\'Space Mono\',monospace;font-size:7px;color:var(--mt);letter-spacing:1px;margin-bottom:4px';ncLabel.textContent='音数';
  noteCntWrap.appendChild(ncLabel);
  var ncRow=document.createElement('div');ncRow.style.cssText='display:flex;gap:4px;';
  [2,3,4].forEach(function(n){
    var btn=document.createElement('button');
    btn.style.cssText='padding:4px 10px;font-family:\'Space Mono\',monospace;font-size:8px;background:'+(riff.notes.length===n?'var(--ac4)18':'var(--bg2)')+';border:1px solid '+(riff.notes.length===n?'var(--ac4)':'var(--bd)')+';color:'+(riff.notes.length===n?'var(--ac4)':'var(--mt)')+';border-radius:2px;cursor:pointer;transition:all .12s';
    btn.textContent=n+'音';
    btn.onclick=function(){
      while(riff.notes.length<n){riff.notes.push(riff.notes[riff.notes.length-1]||60);riff.durations.push(1);}
      riff.notes=riff.notes.slice(0,n);riff.durations=riff.durations.slice(0,n);
      ncRow.querySelectorAll('button').forEach(function(b,bi){var bn=[2,3,4][bi];b.style.background=bn===n?'var(--ac4)18':'var(--bg2)';b.style.borderColor=bn===n?'var(--ac4)':'var(--bd)';b.style.color=bn===n?'var(--ac4)':'var(--mt)';});
      rebuildNoteGrid();
    };
    ncRow.appendChild(btn);
  });
  noteCntWrap.appendChild(ncRow);
  foldBody.appendChild(noteCntWrap);

  // 音列/音価グリッド
  var noteGrid=document.createElement('div');noteGrid.id='riff_grid_'+Math.random().toString(36).slice(2);
  foldBody.appendChild(noteGrid);

  function rebuildNoteGrid(){
    noteGrid.innerHTML='';
    var headerRow=document.createElement('div');headerRow.style.cssText='display:grid;grid-template-columns:repeat('+riff.notes.length+',1fr);gap:4px;margin-bottom:4px;';
    riff.notes.forEach(function(n,i){
      var col=document.createElement('div');col.style.cssText='text-align:center;font-family:\'Space Mono\',monospace;font-size:7px;color:var(--ac4)';col.textContent=(i+1)+'音目';
      headerRow.appendChild(col);
    });
    noteGrid.appendChild(headerRow);

    // 音高選択
    var noteRow=document.createElement('div');noteRow.style.cssText='display:grid;grid-template-columns:repeat('+riff.notes.length+',1fr);gap:4px;margin-bottom:6px;';
    riff.notes.forEach(function(n,i){
      var sel=document.createElement('select');sel.style.cssText='font-size:9px;padding:3px 4px;width:100%;';
      for(var midi=36;midi<=84;midi++){
        var o=document.createElement('option');o.value=midi;
        o.textContent=NOTE_NAMES_JP[midi%12]+(Math.floor(midi/12)-1);
        if(midi===n)o.selected=true;sel.appendChild(o);
      }
      sel.onchange=function(){riff.notes[i]=+sel.value;};
      noteRow.appendChild(sel);
    });
    noteGrid.appendChild(noteRow);

    // 音価選択
    var durLabel=document.createElement('div');durLabel.style.cssText='font-family:\'Space Mono\',monospace;font-size:7px;color:var(--mt);letter-spacing:1px;margin-bottom:3px';durLabel.textContent='音価（8分音符単位）';
    noteGrid.appendChild(durLabel);
    var durRow=document.createElement('div');durRow.style.cssText='display:grid;grid-template-columns:repeat('+riff.notes.length+',1fr);gap:4px;';
    riff.notes.forEach(function(n,i){
      var sel=document.createElement('select');sel.style.cssText='font-size:9px;padding:3px 4px;width:100%;';
      [[1,'8分'],[2,'4分'],[3,'付点4分'],[4,'2分'],[8,'全音符']].forEach(function(d){
        var o=document.createElement('option');o.value=d[0];o.textContent=d[1];if(d[0]===(riff.durations[i]||1))o.selected=true;sel.appendChild(o);
      });
      sel.onchange=function(){riff.durations[i]=+sel.value;};
      durRow.appendChild(sel);
    });
    noteGrid.appendChild(durRow);
  }
  rebuildNoteGrid();

  // 反復率
  var repWrap=document.createElement('div');repWrap.style.cssText='margin-top:8px;';
  var repLabel=document.createElement('div');repLabel.style.cssText='font-family:\'Space Mono\',monospace;font-size:7px;color:var(--mt);letter-spacing:1px;margin-bottom:3px;display:flex;justify-content:space-between';
  var repSpan=document.createElement('span');repSpan.style.color='var(--ac3)';repSpan.textContent=riff.repeatRate+'%';
  repLabel.innerHTML='リフ反復率 ';repLabel.appendChild(repSpan);
  var repRange=document.createElement('input');repRange.type='range';repRange.min=0;repRange.max=100;repRange.step=5;repRange.value=riff.repeatRate;repRange.style.cssText='accent-color:var(--ac3);width:100%;';
  repRange.oninput=function(){riff.repeatRate=+repRange.value;repSpan.textContent=repRange.value+'%';};
  var repHint=document.createElement('div');repHint.className='mp-hint';repHint.textContent='0%=毎回新規　100%=同一リフを繰り返す';
  repWrap.appendChild(repLabel);repWrap.appendChild(repRange);repWrap.appendChild(repHint);
  foldBody.appendChild(repWrap);

  sec.appendChild(foldToggle);sec.appendChild(foldBody);
  container.appendChild(sec);
}

var NP_PRESETS={ballad:[3,2,2,1,0,2,0,0,1,0,0],folk:[1,1,3,3,0,1,0,0,1,0,0],pop:[1,1,3,4,1,1,0,0,1,0,0],uptempo:[0,0,2,4,3,1,0,0,1,1,0],jazz:[0,0,2,3,2,1,0,0,2,1,0]};
function setNP(name){var w=NP_PRESETS[name];if(!w)return;for(var i=0;i<11;i++){var e=document.getElementById('NW'+i);var v=document.getElementById('NV'+i);if(e&&v){e.value=w[i];v.textContent=w[i];}}}
function getNW(){return[0,1,2,3,4,5,6,7,8,9,10].map(function(i){return+document.getElementById('NW'+i).value;});}
function addPart(part,def){var bars=+document.getElementById('PBARS').value||def;struct.push({part:part,bars:bars});if(!partInst[part])partInst[part]=defPartInst();renderStruct();buildPartTabs();}
function removePart(i){struct.splice(i,1);renderStruct();buildPartTabs();}
function clearStruct(){struct=[];renderStruct();buildPartTabs();}
function presetStruct(name){var presets={jpop:[{part:'INTRO',bars:4},{part:'A',bars:8},{part:'PRE',bars:4},{part:'B',bars:4},{part:'CHORUS',bars:8},{part:'A',bars:8},{part:'PRE',bars:4},{part:'CHORUS',bars:8},{part:'BRIDGE',bars:4},{part:'CHORUS',bars:8},{part:'OUTRO',bars:4}],folk:[{part:'INTRO',bars:4},{part:'A',bars:8},{part:'CHORUS',bars:8},{part:'A',bars:8},{part:'CHORUS',bars:8},{part:'BRIDGE',bars:4},{part:'CHORUS',bars:8},{part:'OUTRO',bars:4}],tiktok:[{part:'INTRO',bars:2},{part:'CHORUS',bars:4},{part:'A',bars:4},{part:'CHORUS',bars:4},{part:'OUTRO',bars:2}]};struct=(presets[name]||[]).map(function(s){return{part:s.part,bars:s.bars};});struct.forEach(function(s){if(!partInst[s.part])partInst[s.part]=defPartInst();});renderStruct();buildPartTabs();}
function renderStruct(){var seq=document.getElementById('SEQ');seq.innerHTML='';if(!struct.length){seq.innerHTML='<div class="se">← パーツを追加</div>';return;}struct.forEach(function(s,i){var tag=document.createElement('div');tag.className='stt';tag.style.cssText='background:'+PCOL[s.part]+'22;border:1px solid '+PCOL[s.part]+';color:'+PCOL[s.part]+';';tag.innerHTML=PLBL[s.part]+' <span style="font-size:7px;opacity:.7">'+s.bars+'小節</span> <span style="opacity:.6;margin-left:3px" onclick="removePart('+i+')">✕</span>';seq.appendChild(tag);});}

function initViz(){var c=document.getElementById('VBARS');c.innerHTML='';for(var i=0;i<54;i++){var b=document.createElement('div');b.className='bar';b.style.height='4px';c.appendChild(b);}}
function animViz(notes,totalBars){var els=document.querySelectorAll('#VBARS .bar');document.getElementById('VPH').style.display='none';var viz=document.getElementById('VIZ');viz.classList.add('sc');setTimeout(function(){viz.classList.remove('sc');},800);var beats=TS_BEATS[curTS]||4,total=totalBars*beats*480,d=[];var seg=els.length;for(var i=0;i<seg;i++)d.push(0);notes.forEach(function(n){var idx=Math.floor(n[1]/total*seg);if(idx>=0&&idx<seg)d[idx]=Math.max(d[idx],(n[0]%24)/24);});els.forEach(function(b,i){b.style.height=Math.max(4,Math.round(d[i]*52+4))+'px';b.style.background=d[i]>.5?'var(--ac)':d[i]>.2?'var(--ac2)':'var(--bd)';});}
function drawRoll(notes,total){var cv=document.getElementById('RC'),W=cv.parentElement.clientWidth,H=86;cv.width=W;cv.height=H;var ctx=cv.getContext('2d');ctx.fillStyle='#0a0a0f';ctx.fillRect(0,0,W,H);ctx.strokeStyle='#1a1a26';ctx.lineWidth=1;for(var i=0;i<W;i+=W/32){ctx.beginPath();ctx.moveTo(i,0);ctx.lineTo(i,H);ctx.stroke();}if(!notes.length)return;var mn=notes.reduce(function(a,n){return Math.min(a,n[0]);},999),mx=notes.reduce(function(a,n){return Math.max(a,n[0]);},0);var nr=Math.max(12,mx-mn+2);notes.forEach(function(n){var x=n[1]/total*W,w=Math.max(2,n[2]/total*W-1),y=H-((n[0]-mn+1)/nr)*H,h=Math.max(3,H/nr-1);ctx.fillStyle='rgba(232,255,71,'+(0.4+n[3]/127*0.6)+')';ctx.fillRect(x,y,w,h);});}

function buildScale(root,name,oct){var iv=SCALES[name]||SCALES.pentatonic,ns=[];var os=oct===0?3:oct-1,oe=oct===0?6:oct+1;for(var o=os;o<=oe;o++)iv.forEach(function(i){var n=root+i+(o-5)*12;if(n>=36&&n<=96)ns.push(n);});return ns.filter(function(v,i,a){return a.indexOf(v)===i;}).sort(function(a,b){return a-b;});}
function clampChord(c){return c.map(function(n){while(n<28)n+=12;while(n>64)n-=12;return n;});}
function buildDurPool(PPQ){var W=PPQ*4,H=PPQ*2,Q=PPQ,E=PPQ/2,S=PPQ/4,DQ=PPQ*1.5;var durs=[W,H,Q,E,S,DQ,W,H,Q,E,S];var nw=getNW();var pool=[];for(var i=0;i<11;i++){for(var j=0;j<nw[i];j++){if(i<6)pool.push(durs[i]);else pool.push(-(durs[i]));}}if(pool.length===0)pool=[Q];return pool;}

function getRR(){return +document.getElementById('RR').value/100;}

function genMelody(sn,sections,PPQ){
  var Q=PPQ,E=PPQ/2,S=PPQ/4;
  var beats=TS_BEATS[curTS]||4,barTicks=beats*Q;
  var cl=function(i){return Math.max(0,Math.min(sn.length-1,i));};
  var root=parseInt(document.getElementById('KEY').value);
  var pc=getMPV('PC'),lp=getMPV('LP'),ar=getARV(),cd=getMPV('CD');
  var variationRate=+document.getElementById('VR').value/100;
  var durPool=buildDurPool(PPQ);
  var centerIdx=Math.floor(sn.length*pc);

  // ★ セットパターン計算
  var totalBars=sections.reduce(function(a,s){return a+s.bars;},0);
  var setPattern=getSetPattern(Math.ceil(totalBars/Math.max(1,curFL)));

  // ★ 変形率に応じた変形メソッド選択
  function transformMotifWithStrength(motif, vr){
    var method;var r=Math.random();
    if(vr<0.30){method=(r<0.90)?'substitute':'expand';}
    else if(vr<0.70){method=(r<0.70)?'substitute':(r<0.95)?'expand':'invert';}
    else{method=(r<0.50)?'substitute':(r<0.80)?'expand':'invert';}
    var result=transformMotif(motif, method);
    if(vr>=0.70&&Math.random()<0.4){result=transformMotif(result,(method==='substitute')?'expand':'substitute');}
    return result;
  }

  function cloneMotif(motif){return motif.map(function(m){return{scaleIdx:m.scaleIdx,dur:m.dur};});}

  function resolveChordNote(sn,idx,chordTones){
    var best=idx,bestD=999;
    sn.forEach(function(n,i){if(chordTones.indexOf(n%12)>=0){var d=Math.abs(i-idx);if(d<bestD){bestD=d;best=i;}}});
    return best;
  }

  function genBar(barStartTick, chord, ci_in){
    var chordTones=chord.map(function(n){return n%12;});
    var notes=[],motifIdxs=[],noteCursor=barStartTick,ci=ci_in,prevDir=0,ni=0;
    while(noteCursor<barStartTick+barTicks&&ni<24){
      var dur=pickA(durPool);
      if(dur<0){noteCursor+=Math.abs(dur);ni++;continue;}
      if(noteCursor+dur>barStartTick+barTicks)dur=(barStartTick+barTicks)-noteCursor;
      if(dur<S)break;
      var step;
      if(Math.random()<lp){step=rng(-6,6);while(Math.abs(step)<3)step=rng(-6,6);}
      else step=rng(-2,2)||1;
      if(ar>0&&Math.random()<ar)step=Math.abs(step)||1;
      else if(ar<0&&Math.random()<-ar)step=-(Math.abs(step)||1);
      if(Math.abs(prevDir)>=4&&Math.random()<0.7)step=-Math.sign(prevDir)*rng(1,2);
      ci=cl(ci+step);prevDir=step;
      var idx=ci;
      if(Math.random()<cd*0.5)idx=resolveChordNote(sn,idx,chordTones);
      var pp=ni/Math.max(1,barTicks/Q);
      var vel=Math.round(74+Math.sin(pp*Math.PI)*14+rng(-4,4));
      notes.push([sn[cl(idx)],noteCursor,dur-12,Math.max(20,Math.min(127,vel))]);
      motifIdxs.push({scaleIdx:cl(idx),dur:dur});
      noteCursor+=dur;ni++;
    }
    return{notes:notes,motif:motifIdxs,ci:ci};
  }

  function renderMotif(motif, barStartTick, chord, clampFn){
    var chordTones=chord.map(function(n){return n%12;});
    var notes=[],cursor=barStartTick,lenLimit=barStartTick+barTicks;
    motif.forEach(function(m){
      var dur=m.dur;
      if(cursor>=lenLimit)return;
      if(cursor+dur>lenLimit)dur=lenLimit-cursor;
      if(dur<S)return;
      var idx=clampFn(m.scaleIdx);
      if(Math.random()<cd*0.5)idx=resolveChordNote(sn,idx,chordTones);
      var vel=Math.round(74+rng(-5,5));
      notes.push([sn[idx],cursor,dur-12,Math.max(20,Math.min(127,vel))]);
      cursor+=m.dur;
    });
    return notes;
  }

  var all=[];
  var cursor=0;
  var ci=centerIdx;
  // モチーフキャッシュ: setPattern index -> motif
  var MOTIF_CACHE={};
  var A_MOTIF=null;
  // 絶対小節インデックス
  var globalBar=0;

  sections.forEach(function(sec){
    var secTicks=sec.bars*barTicks;
    var secEnd=cursor+secTicks;
    var fi=getFISetting(sec.part);
    var phraseLen=Math.max(1,curFL);

    for(var bar=0;bar<sec.bars;bar++){
      var barStart=cursor+bar*barTicks;
      var chord=getChordForPart(sec.part,bar,root);
      var phraseIdx=Math.floor(globalBar/phraseLen);
      var patternId=setPattern[phraseIdx%setPattern.length]||0;
      var isFirstInPhrase=(globalBar%phraseLen===0);

      var notes=null;

      // ★ フレーズ継承処理
      if(sec.part==='A'){
        // Aメロは常に新規生成 / モチーフをセットパターンに従ってキャッシュ
        if(!MOTIF_CACHE[patternId]||isFirstInPhrase){
          var result=genBar(barStart,chord,ci);
          ci=result.ci;notes=result.notes;
          if(!MOTIF_CACHE[patternId])MOTIF_CACHE[patternId]=cloneMotif(result.motif);
          if(bar===0&&!A_MOTIF)A_MOTIF=cloneMotif(result.motif);
        } else {
          // 同パターン再出現: variationRateに応じて変形
          var baseM=cloneMotif(MOTIF_CACHE[patternId]);
          var useMotif=Math.random()<variationRate?transformMotifWithStrength(baseM,variationRate):baseM;
          notes=renderMotif(useMotif,barStart,chord,cl);
        }
      } else if(fi.mode==='off'){
        if(fi.structOnly&&MOTIF_CACHE[patternId]){
          // 構造のみ: フレーズ長/パターン適用、モチーフ新規
          var result=genBar(barStart,chord,ci);ci=result.ci;notes=result.notes;
        } else {
          var result=genBar(barStart,chord,ci);ci=result.ci;notes=result.notes;
        }
      } else if(fi.mode==='phrase'&&A_MOTIF){
        // PHRASEモード: AメロモチーフをパターンIDで取得してそのまま使う
        var srcMotif=MOTIF_CACHE[patternId]||A_MOTIF;
        notes=renderMotif(cloneMotif(srcMotif),barStart,chord,cl);
      } else if(fi.mode==='variation'&&A_MOTIF){
        // VARIATIONモード: 継承変形率を適用
        var vr=fi.syncVar?(variationRate):(fi.varRate/100);
        var srcMotif=MOTIF_CACHE[patternId]||A_MOTIF;
        var varMotif=transformMotifWithStrength(cloneMotif(srcMotif),vr);
        notes=renderMotif(varMotif,barStart,chord,cl);
      } else {
        // フォールバック: 新規生成
        var result=genBar(barStart,chord,ci);ci=result.ci;notes=result.notes;
      }
      if(notes)all=all.concat(notes);
      globalBar++;
    }
    cursor=secEnd;
  });
  return all;
}

function addNote(ev,ch,t,dur,n,vel){if(dur<=0)return;ev.push({t:t,tp:1,ch:ch,n:n,v:Math.max(1,vel)});ev.push({t:t+dur,tp:0,ch:ch,n:n});}
function strumD(ev,ch,t,dur,vel,ns){if(dur<=0)return;ns.forEach(function(n,i){addNote(ev,ch,t+i*8,dur,n,Math.max(1,vel-i*2));});}
function strumU(ev,ch,t,dur,vel,ns){if(dur<=0)return;ns.slice().reverse().forEach(function(n,i){addNote(ev,ch,t+i*5,dur,n,Math.max(1,vel-10-i*2));});}

// ★ アーティキュレーション変換
// artPat: 0=ストレート(そのまま), 1=ミュート, 2=シンコペ, 3=カッティング(ミュート+シンコペ), 4=アルペジオ(分散)
function applyArt(events,artPat,barTicks,E,S){
  if(artPat===0)return events;// ストレート: そのまま
  // アルペジオ: 同時発音のコードを時間方向に分散させる
  if(artPat===4){
    var groups={};
    events.forEach(function(e){if(e.tp===1){groups[e.t]=groups[e.t]||[];groups[e.t].push(e);}});
    var offMap={};
    events.forEach(function(e){if(e.tp===0){offMap[e.ch+'_'+e.n]=offMap[e.ch+'_'+e.n]||[];offMap[e.ch+'_'+e.n].push(e.t);}});
    var result=[];
    Object.keys(groups).forEach(function(tKey){
      var t=+tKey,grp=groups[tKey];
      // このグループの終了時刻(全ノート共通とみなし最小値を採用)
      var endT=Infinity;
      grp.forEach(function(e){var arr=offMap[e.ch+'_'+e.n];if(arr&&arr.length){endT=Math.min(endT,arr.shift());}});
      if(!isFinite(endT))endT=t+S;
      var totalDur=Math.max(S,endT-t);var n=grp.length,slice=Math.max(S/2,totalDur/n);
      grp.forEach(function(e,i){
        var st2=t+i*slice;
        result.push({t:st2,tp:1,ch:e.ch,n:e.n,v:e.v});
        result.push({t:st2+slice-2,tp:0,ch:e.ch,n:e.n});
      });
    });
    return result;
  }
  var result=[];
  events.forEach(function(e){
    var ne=Object.assign({},e);
    if(e.tp===0){result.push(ne);return;}// noteoffはそのまま
    // ミュート: 音価を短く, ベロシティ少し下げ
    if(artPat===1){
      ne.v=Math.max(1,Math.round(e.v*0.75));
      // 対応するnoteoffのtを探して短くするのは複雑なので、ここではnoteOnのvelocityだけ下げる
      result.push(ne);return;
    }
    // シンコペ: 発音位置を8分音符分ずらす（裏拍へ）
    if(artPat===2){
      ne.t=e.t+E;result.push(ne);return;
    }
    // カッティング: ミュート+シンコペ
    if(artPat===3){
      ne.t=e.t+E;ne.v=Math.max(1,Math.round(e.v*0.70));result.push(ne);return;
    }
    result.push(ne);
  });
  // ミュートとカッティング: noteoffも音価を短くする（S=16分音符分）
  if(artPat===1||artPat===3){
    var noteOnTimes={};
    result.forEach(function(e){if(e.tp===1)noteOnTimes[e.ch+'_'+e.n]=e.t;});
    result.forEach(function(e){
      if(e.tp===0){
        var onT=noteOnTimes[e.ch+'_'+e.n];
        if(onT!==undefined){
          var origDur=e.t-onT;var newDur=Math.min(origDur,S*2);// 最大32分音符2個分
          e.t=onT+Math.max(S,newDur);
        }
      }
    });
  }
  return result;
}

// ★ カスタムパターン(16分割) からストロークイベントを生成
function genCustomBar(barEv,ch,bs,barTicks,custom,c,vH,vM){
  var S=barTicks/16;
  var idxs=[];for(var i=0;i<16;i++)if(custom[i])idxs.push(i);
  if(!idxs.length)return;
  idxs.forEach(function(idx,k){
    var t=bs+idx*S;
    var next=(k+1<idxs.length)?idxs[k+1]:16;
    var dur=(next-idx)*S-8;if(dur<=0)dur=S-4;
    var vel=(idx%4===0)?vH:vM;
    if(custom[idx]===1)strumD(barEv,ch,t,dur,vel,c);else strumU(barEv,ch,t,dur,vel-8,c);
  });
}
// ハーモニック・リズム対応版: 各セルでchordAtTickによりコードを取得
function genCustomBarHR(barEv,ch,bs,barTicks,custom,bar,chordAtTick,vH,vM){
  var S=barTicks/16;
  var idxs=[];for(var i=0;i<16;i++)if(custom[i])idxs.push(i);
  if(!idxs.length)return;
  idxs.forEach(function(idx,k){
    var t=bs+idx*S;
    var next=(k+1<idxs.length)?idxs[k+1]:16;
    var dur=(next-idx)*S-8;if(dur<=0)dur=S-4;
    var vel=(idx%4===0)?vH:vM;
    var c=chordAtTick(bar,idx*S);
    if(custom[idx]===1)strumD(barEv,ch,t,dur,vel,c);else strumU(barEv,ch,t,dur,vel-8,c);
  });
}

function genGuitar(root,bars,PPQ,ch,iData,part,globalBarIdx){
  var ev=[],Q=PPQ,E=PPQ/2,S=PPQ/4;
  var beats=TS_BEATS[curTS]||4,barTicks=beats*Q;
  var basicPat=iData.basicPat>=0?iData.basicPat:0;
  var artPat=iData.artPat||0;
  var advPat=iData.st; // 高度設定（5〜9: id=5〜9）
  var hr=iData.hr||4; // ハーモニック・リズム（何ビートごとにコード変化）
  globalBarIdx=globalBarIdx||0;
  // 指定ビート位置(小節内のティック位置)に対応するコードを取得
  function chordAtTick(bar,tickInBar){
    var absBeat=(globalBarIdx+bar)*beats+(tickInBar/Q);
    return clampChord(getChordAtBeat(part,absBeat,root,hr));
  }

  for(var bar=0;bar<bars;bar++){
    var bs=bar*barTicks;
    var barEv=[];

    // ★ カスタムパターン優先
    if(iData.useCustom){
      genCustomBarHR(barEv,ch,bs,barTicks,iData.custom,bar,chordAtTick,80,66);
      barEv=applyArt(barEv,artPat,barTicks,E,S);
      ev=ev.concat(barEv);continue;
    }

    var c=chordAtTick(bar,0);

    // 高度設定が選択されている場合(basicPat===-1かidが5以上)
    var useAdv=(iData.basicPat===-1&&advPat>=5);
    if(useAdv){
      var st=advPat;
      var vH=80,vM=68,vL=58,vU=50;
      switch(st){
        case 5:// ⑥８ビートA: 1,3拍=4分D, 2,4拍=8分D+U
          strumD(barEv,ch,bs,Q-20,vH,chordAtTick(bar,0));strumD(barEv,ch,bs+Q,E-15,vM,chordAtTick(bar,Q));strumU(barEv,ch,bs+Q+E,E-15,vU,chordAtTick(bar,Q+E));
          strumD(barEv,ch,bs+Q*2,Q-20,vH,chordAtTick(bar,Q*2));strumD(barEv,ch,bs+Q*3,E-15,vM,chordAtTick(bar,Q*3));strumU(barEv,ch,bs+Q*3+E,E-15,vU,chordAtTick(bar,Q*3+E));break;
        case 6:// ⑦８ビートB
          strumD(barEv,ch,bs,Q-20,vH,chordAtTick(bar,0));strumD(barEv,ch,bs+Q,E-15,vM,chordAtTick(bar,Q));strumU(barEv,ch,bs+Q+E,Q-15,vU,chordAtTick(bar,Q+E));
          strumU(barEv,ch,bs+Q*2+E,E-15,vU,chordAtTick(bar,Q*2+E));strumD(barEv,ch,bs+Q*3,E-15,vM,chordAtTick(bar,Q*3));strumU(barEv,ch,bs+Q*3+E,E-15,vU,chordAtTick(bar,Q*3+E));break;
        case 7:// ⑧16ビートA
          for(var b=0;b<4;b++){var cb=chordAtTick(bar,b*Q);strumD(barEv,ch,bs+b*Q,E-12,b===0?vH:vM,cb);if(b===1||b===3){strumD(barEv,ch,bs+b*Q+E,S-8,vL,cb);strumU(barEv,ch,bs+b*Q+E+S,S-8,vU,cb);}else strumD(barEv,ch,bs+b*Q+E,E-12,vM,cb);}break;
        case 8:// ⑨16ビートB
          for(var b=0;b<4;b++){var cb2=chordAtTick(bar,b*Q);if(b===2){strumD(barEv,ch,bs+b*Q,S-8,vL,cb2);strumU(barEv,ch,bs+b*Q+S,S-8,vU,cb2);strumD(barEv,ch,bs+b*Q+E,E-12,vM,cb2);}else{strumD(barEv,ch,bs+b*Q,E-12,b===0?vH:vM,cb2);if(b===1||b===3){strumD(barEv,ch,bs+b*Q+E,S-8,vL,cb2);strumU(barEv,ch,bs+b*Q+E+S,S-8,vU,cb2);}else strumD(barEv,ch,bs+b*Q+E,E-12,vM,cb2);}}break;
        case 9:// ⑩16ビートC
          for(var b=0;b<4;b++){var cb3=chordAtTick(bar,b*Q);if(b===1){strumD(barEv,ch,bs+b*Q,E-12,vM,cb3);strumD(barEv,ch,bs+b*Q+E,S-8,vL,cb3);strumU(barEv,ch,bs+b*Q+E+S,Q-8,vU,cb3);}else if(b===2){strumD(barEv,ch,bs+b*Q+E,E-12,vM,cb3);}else if(b===3){strumD(barEv,ch,bs+b*Q,E-12,vM,cb3);strumD(barEv,ch,bs+b*Q+E,S-8,vL,cb3);strumU(barEv,ch,bs+b*Q+E+S,S-8,vU,cb3);}else{strumD(barEv,ch,bs+b*Q,E-12,vH,cb3);strumD(barEv,ch,bs+b*Q+E,E-12,vM,cb3);}}break;
        default:strumD(barEv,ch,bs,Q-25,vH,c);
      }
    } else {
      // 基本パターン①〜⑤
      var vH2=80,vM2=68,vL2=58,vU2=50;
      switch(basicPat){
        case 0:// ① ４拍: 全音符1回ダウン（ハーモニック・リズムに応じて分割）
          if(hr<beats){
            var segTicks=hr*Q,nseg=Math.ceil(barTicks/segTicks);
            for(var sg=0;sg<nseg;sg++){var segT=sg*segTicks,segLen=Math.min(segTicks,barTicks-segT);if(segLen<=0)break;strumD(barEv,ch,bs+segT,segLen-20,sg===0?vH2:vM2,chordAtTick(bar,segT));}
          }else strumD(barEv,ch,bs,barTicks-30,vH2,c);break;
        case 1:// ② ２ビート: 2分音符×2（ハーモニック・リズムに応じて分割、最大4分割）
          if(hr<beats){
            var segs=Math.min(Math.ceil(barTicks/(hr*Q)),4),segTicks2=barTicks/segs;
            for(var sg2=0;sg2<segs;sg2++){var segT2=sg2*segTicks2;strumD(barEv,ch,bs+segT2,segTicks2-15,sg2===0?vH2:vM2,chordAtTick(bar,segT2));}
          }else{strumD(barEv,ch,bs,Q*2-25,vH2,c);strumD(barEv,ch,bs+Q*2,Q*2-25,vM2,chordAtTick(bar,Q*2));}break;
        case 2:// ③ ４ビート: 4分音符×4
          for(var b=0;b<4;b++)strumD(barEv,ch,bs+b*Q,Q-25,b===0?vH2:vM2,chordAtTick(bar,b*Q));break;
        case 3:// ④ ８ビート: D/U×8
          for(var i=0;i<8;i++){var cti=chordAtTick(bar,i*E);if(i%2===0)strumD(barEv,ch,bs+i*E,E-15,i===0?vH2:vM2,cti);else strumU(barEv,ch,bs+i*E,E-15,vU2,cti);}break;
        case 4:// ⑤ 16ビート: D/U×16
          for(var i=0;i<16;i++){var cti2=chordAtTick(bar,i*S);if(i%2===0)strumD(barEv,ch,bs+i*S,S-8,i===0?vH2:i%4===0?vM2:vL2,cti2);else strumU(barEv,ch,bs+i*S,S-8,vU2-5,cti2);}break;
        default:strumD(barEv,ch,bs,Q-25,vH2,c);
      }
      // ★ アーティキュレーション適用
      barEv=applyArt(barEv,artPat,barTicks,E,S);
    }
    ev=ev.concat(barEv);
  }
  return ev;
}

function ev2b(evList,prog){prog=prog||[];var s=evList.slice().sort(function(a,b){return a.t!==b.t?a.t-b.t:a.tp-b.tp;});var cur=0,b=prog.slice();s.forEach(function(e){var d=e.t-cur;cur=e.t;if(e.tp===1)b=b.concat(nOn(e.ch,e.n,e.v,d));else b=b.concat(nOff(e.ch,e.n,d));});return b;}

function randAll(){var keys=[60,62,64,65,67,69,71,57,59,50,52];document.getElementById('KEY').value=keys[rng(0,keys.length-1)];document.getElementById('SCALE').value=pickA(Object.keys(SCALES));var t=60+rng(0,35)*2;document.getElementById('TEMPO').value=t;document.getElementById('TVL').textContent=t;document.getElementById('OCT').value=pickA(['4','5','5','6']);var mb=pickA(document.querySelectorAll('[data-mood]'));if(mb)selMood(mb);var cpb=pickA(document.querySelectorAll('#CP_BTNS .cpb'));if(cpb)selCP(cpb);}

// ══════════════════════════════════════════════
// ★ v8.0 GLOBAL MOTIF
// ══════════════════════════════════════════════
var GLOBAL_MOTIFS={A:null,Ap:null}; // {notes:[{scaleIdx,dur}], label:string}

function genGlobalMotif(key){
  var root=parseInt(document.getElementById('KEY').value);
  var scale=document.getElementById('SCALE').value;
  var octave=parseInt(document.getElementById('OCT').value);
  var PPQ=480;
  var sn=buildScale(root,scale,octave);
  var Q=PPQ,E=PPQ/2,S=PPQ/4;
  var beats=TS_BEATS[curTS]||4,barTicks=beats*Q;
  var durPool=buildDurPool(PPQ);
  var centerIdx=Math.floor(sn.length*getMPV('PC'));
  var chord=getChordForPart('A',0,root);

  // Ap はAを変形して生成
  if(key==='Ap'){
    if(!GLOBAL_MOTIFS.A){alert('先にAモチーフを生成してください');return;}
    var base=GLOBAL_MOTIFS.A.notes.map(function(n){return{scaleIdx:n.scaleIdx,dur:n.dur};});
    var vr=+document.getElementById('VR').value/100;
    GLOBAL_MOTIFS.Ap={notes:transformMotifWithStrength(base,Math.max(0.4,vr)),label:"A'"};
    renderGlobalMotif('Ap',sn);
    return;
  }

  // A: 新規生成
  var cl=function(i){return Math.max(0,Math.min(sn.length-1,i));};
  var cd=getMPV('CD'); // ★ コードトーン依存度はGlobal Motifにのみ適用
  var chordTones=chord.map(function(n){return n%12;});
  function resolveChordNoteGM(idx){
    var best=idx,bestD=999;
    sn.forEach(function(n,i){if(chordTones.indexOf(n%12)>=0){var d=Math.abs(i-idx);if(d<bestD){bestD=d;best=i;}}});
    return best;
  }
  var motif=[],ci=centerIdx,noteCursor=0,ni=0;
  var targetBars=Math.max(1,curFL);
  var totalTicks=targetBars*barTicks;
  while(noteCursor<totalTicks&&ni<24){
    var dur=pickA(durPool);
    if(dur<0){noteCursor+=Math.abs(dur);ni++;continue;}
    if(noteCursor+dur>totalTicks)dur=totalTicks-noteCursor;
    if(dur<S)break;
    var step=Math.random()<getMPV('LP')?rng(-4,4)||(1):(rng(-2,2)||1);
    ci=cl(ci+step);
    var idx=ci;
    if(Math.random()<cd*0.5)idx=resolveChordNoteGM(idx);
    motif.push({scaleIdx:cl(idx),dur:dur});
    noteCursor+=dur;ni++;
  }
  GLOBAL_MOTIFS.A={notes:motif,label:'A'};
  renderGlobalMotif('A',sn);
}

function renderGlobalMotif(key,sn){
  var cont=document.getElementById('GM_'+(key==='Ap'?'AP':'A')+'_NOTES');
  if(!cont)return;
  var motif=GLOBAL_MOTIFS[key];
  if(!motif||!motif.notes.length){cont.innerHTML='<span class="gm-empty">未生成</span>';return;}
  var root=parseInt(document.getElementById('KEY').value);
  if(!sn)sn=buildScale(root,document.getElementById('SCALE').value,parseInt(document.getElementById('OCT').value));
  cont.innerHTML='';
  var hues={'A':62,'Ap':180};
  var hue=hues[key]||62;
  motif.notes.slice(0,16).forEach(function(m){
    var idx=Math.max(0,Math.min(sn.length-1,m.scaleIdx));
    var nn2=NN[sn[idx]%12];
    var span=document.createElement('span');span.className='gm-note';
    span.textContent=nn2;
    span.style.cssText='background:hsl('+hue+',80%,15%);border:1px solid hsl('+hue+',70%,50%);color:hsl('+hue+',90%,70%)';
    cont.appendChild(span);
  });
  if(motif.notes.length>16){var more=document.createElement('span');more.style.cssText='font-family:\'Space Mono\',monospace;font-size:7px;color:var(--mt);align-self:center';more.textContent='…+'+(motif.notes.length-16);cont.appendChild(more);}
}

function transformMotifWithStrength(motif,vr){
  var method;var r=Math.random();
  if(vr<0.30){method=(r<0.90)?'substitute':'expand';}
  else if(vr<0.70){method=(r<0.70)?'substitute':(r<0.95)?'expand':'invert';}
  else{method=(r<0.50)?'substitute':(r<0.80)?'expand':'invert';}
  var result=transformMotif(motif,method);
  if(vr>=0.70&&Math.random()<0.4){result=transformMotif(result,(method==='substitute')?'expand':'substitute');}
  return result;
}

// ══════════════════════════════════════════════
// ★ v8.0 PATTERN HANDLERS (A-F 辞書管理。将来G-Jを追加可能)
// ══════════════════════════════════════════════
// motif: [{scaleIdx, dur}]
// returns transformed motif

var PATTERN_HANDLERS={
  // A: 原型そのまま
  A: function(motif){ return motif.map(function(n){return{scaleIdx:n.scaleIdx,dur:n.dur};}); },
  // B: リズムのみ変更（音程は保持、音価をシャッフル）
  B: function(motif){
    var durs=motif.map(function(n){return n.dur;});
    // shuffle durations
    for(var i=durs.length-1;i>0;i--){var j=Math.floor(Math.random()*(i+1));var t=durs[i];durs[i]=durs[j];durs[j]=t;}
    return motif.map(function(n,i){return{scaleIdx:n.scaleIdx,dur:durs[i]};});
  },
  // C: リズム維持、音程変更（各音を±1〜3スケール度数移動）
  C: function(motif){
    return motif.map(function(n){
      var shift=pickA([-3,-2,-1,1,2,3]);
      return{scaleIdx:n.scaleIdx+shift,dur:n.dur};
    });
  },
  // D: 後半のみ変更（前半はそのまま、後半は新しい音程）
  D: function(motif){
    var half=Math.floor(motif.length/2);
    return motif.map(function(n,i){
      if(i<half)return{scaleIdx:n.scaleIdx,dur:n.dur};
      var shift=pickA([-2,-1,1,2]);
      return{scaleIdx:n.scaleIdx+shift,dur:n.dur};
    });
  },
  // E: リズム維持、音程逆行（旋律の動きを上下反転）
  E: function(motif){
    if(motif.length<2)return motif.map(function(n){return{scaleIdx:n.scaleIdx,dur:n.dur};});
    var center=motif[0].scaleIdx;
    return motif.map(function(n){return{scaleIdx:2*center-n.scaleIdx,dur:n.dur};});
  },
  // F: フレーズ後半部分を2連（後半を1/2長で2回繰り返す）
  F: function(motif){
    var half=Math.floor(motif.length/2);
    var front=motif.slice(0,half).map(function(n){return{scaleIdx:n.scaleIdx,dur:n.dur};});
    var backSrc=motif.slice(half);
    // back: 各音価を半分にして2回
    var back1=backSrc.map(function(n){return{scaleIdx:n.scaleIdx,dur:Math.max(60,Math.floor(n.dur/2))};});
    var back2=backSrc.map(function(n){return{scaleIdx:n.scaleIdx+pickA([-1,0,1]),dur:Math.max(60,Math.floor(n.dur/2))};});
    return front.concat(back1).concat(back2);
  }
  // 将来: G,H,I,J などをここに追加
};

function applyPatternChar(ch, motif){
  var fn=PATTERN_HANDLERS[ch.toUpperCase()];
  if(!fn)fn=PATTERN_HANDLERS.A;
  return fn(motif);
}

// ══════════════════════════════════════════════
// ★ v8.0 PART PHRASE DESIGN (PPD)
// ══════════════════════════════════════════════
// PPD_DATA: {ppdId -> {mode:'phrase'|'legacy', ref:'A'|'Ap'|'new', fl:number, pattern:string, cd:number, restEnd:number}}
// ppdId format: 'INTRO_1','INTRO_2','A_1','A_2', ...
var PPD_DATA={};
// 元パート名リスト（折りたたみグループ単位）
var PPD_BASE_PARTS=['INTRO','A','PRE','B','CHORUS','INTER','BRIDGE','OUTRO'];
// 全PPD ID（各パート×2）
var PPD_PARTS=[];PPD_BASE_PARTS.forEach(function(p){PPD_PARTS.push(p+'_1');PPD_PARTS.push(p+'_2');});

// ppdIdから元パートを取得
function ppdBasePart(ppdId){return ppdId.replace(/_[12]$/,'');}
// ppdIdの番号
function ppdNum(ppdId){return ppdId.slice(-1);}
// ppdIdの表示ラベル
var PPD_SLOT_LABELS={'1':'①','2':'②'};
function getPPDLabel(ppdId){
  var base=ppdBasePart(ppdId),num=ppdNum(ppdId);
  return(PLBL[base]||base)+' '+PPD_SLOT_LABELS[num];}

function defPPD(ppdId){
  var base=ppdBasePart(ppdId);
  return{mode:'phrase',ref:'A',fl:2,pattern:(base==='A'||base==='CHORUS')?'AABB':'ABAB',cd:0.5,restEnd:0};
}
function getPPD(ppdId){if(!PPD_DATA[ppdId])PPD_DATA[ppdId]=defPPD(ppdId);return PPD_DATA[ppdId];}

function calcPPDBars(ppd){return ppd.pattern.replace(/[^A-Za-z]/g,'').length*Math.max(1,ppd.fl);}

// PPDカード1枚を生成する共通ヘルパー
function buildPPDCard(ppdId){
  var base=ppdBasePart(ppdId),num=ppdNum(ppdId);
  var color=PCOL[base]||'#888';
  var ppd=getPPD(ppdId);

  var card=document.createElement('div');
  card.style.cssText='background:var(--bg2);border:1px solid var(--bd);border-radius:4px;padding:9px;flex:1;min-width:0;';

  // スロットラベル（①②）
  var slotHdr=document.createElement('div');
  slotHdr.style.cssText='font-family:\'Space Mono\',monospace;font-size:8px;font-weight:700;letter-spacing:2px;color:'+color+';margin-bottom:7px;display:flex;align-items:center;gap:5px;';
  slotHdr.innerHTML='<span style="background:'+color+'22;border:1px solid '+color+'44;border-radius:2px;padding:1px 6px;">'+PPD_SLOT_LABELS[num]+'</span>';
  card.appendChild(slotHdr);

  // Mode tabs
  var modeTabs=document.createElement('div');modeTabs.className='ppd-mode-tabs';
  var tabPhrase=document.createElement('button');tabPhrase.className='ppd-mode-tab'+(ppd.mode==='phrase'?' on':'');tabPhrase.textContent='Phrase Design';
  var tabLegacy=document.createElement('button');tabLegacy.className='ppd-mode-tab'+(ppd.mode==='legacy'?' on':'');tabLegacy.textContent='Legacy Inherit';
  modeTabs.appendChild(tabPhrase);modeTabs.appendChild(tabLegacy);
  card.appendChild(modeTabs);

  // フレーズ終わり休符
  var restWrap=document.createElement('div');restWrap.style.cssText='margin:6px 0 8px;padding:6px;background:var(--bg);border:1px dashed var(--ac5)44;border-radius:3px;';
  var restLabel=document.createElement('div');restLabel.style.cssText='font-family:\'Space Mono\',monospace;font-size:7px;color:var(--ac5);letter-spacing:1px;margin-bottom:4px;display:flex;justify-content:space-between';
  var restValSpan=document.createElement('span');restValSpan.style.color='var(--ac5)';restValSpan.textContent=(ppd.restEnd||0)+'拍';
  restLabel.innerHTML='🎵 フレーズ終わり休符 ';restLabel.appendChild(restValSpan);
  var restHint=document.createElement('div');restHint.style.cssText='font-family:\'Space Mono\',monospace;font-size:6px;color:var(--mt);margin-top:3px';restHint.textContent='各フレーズ末尾から何拍休符にするか。06楽器のパート終わり休符とは独立。';
  var restRange=document.createElement('input');restRange.type='range';restRange.min=0;restRange.max=16;restRange.step=1;restRange.value=ppd.restEnd||0;restRange.style.cssText='accent-color:var(--ac5);width:100%;';
  restRange.oninput=function(){ppd.restEnd=+restRange.value;restValSpan.textContent=ppd.restEnd+'拍';};
  restWrap.appendChild(restLabel);restWrap.appendChild(restRange);restWrap.appendChild(restHint);
  card.appendChild(restWrap);

  // Phrase Design body
  var phraseBody=document.createElement('div');phraseBody.className='ppd-phrase-body'+(ppd.mode!=='phrase'?' hidden':'');

  // Reference Source
  var refLabel=document.createElement('div');refLabel.style.cssText='font-family:\'Space Mono\',monospace;font-size:7px;color:var(--mt);letter-spacing:1px;margin-bottom:4px';refLabel.textContent='Reference Source';
  phraseBody.appendChild(refLabel);
  var refGrid=document.createElement('div');refGrid.className='ppd-ref-grid';
  [{v:'A',n:'Global A',d:'Aモチーフ元に展開'},{v:'Ap',n:"Global A'",d:"A'モチーフ元に展開"},{v:'new',n:'New Generate',d:'独自モチーフ生成'}].forEach(function(r){
    var btn=document.createElement('button');btn.className='ppd-ref-btn'+(ppd.ref===r.v?' on':'');
    btn.innerHTML='<span class="prn">'+r.n+'</span><span class="prd">'+r.d+'</span>';
    btn.onclick=function(){
      ppd.ref=r.v;refGrid.querySelectorAll('.ppd-ref-btn').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');
      if(r.v==='A'||r.v==='Ap'){
        ppd.fl=curFL;
        flGrid.querySelectorAll('.ppd-fl-btn').forEach(function(b){b.classList.toggle('on',+b.dataset.fl===ppd.fl);});
        updateBarsCalc();
      }
    };
    refGrid.appendChild(btn);
  });
  phraseBody.appendChild(refGrid);

  // Phrase Length
  var flLabel2=document.createElement('div');flLabel2.style.cssText='font-family:\'Space Mono\',monospace;font-size:7px;color:var(--mt);letter-spacing:1px;margin-bottom:4px';flLabel2.textContent='Phrase Length';
  phraseBody.appendChild(flLabel2);
  var flGrid=document.createElement('div');flGrid.className='ppd-fl-grid';
  [1,2,3,4].forEach(function(v){
    var btn=document.createElement('button');btn.className='ppd-fl-btn'+(ppd.fl===v?' on':'');btn.textContent=v+'小節';btn.dataset.fl=v;
    btn.onclick=function(){ppd.fl=v;flGrid.querySelectorAll('.ppd-fl-btn').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');updateBarsCalc();};
    flGrid.appendChild(btn);
  });
  phraseBody.appendChild(flGrid);
  var flHint=document.createElement('div');flHint.className='ppd-pattern-hint';
  flHint.textContent='2小節=2小節ひと続きの旋律。Global A/A\'参照時: モチーフ長>FL→前半使用、モチーフ長<FL→繰り返し。';
  phraseBody.appendChild(flHint);

  // コードトーン依存度
  var cdWrap=document.createElement('div');cdWrap.style.cssText='margin:8px 0;';
  var cdLabel2=document.createElement('div');cdLabel2.style.cssText='font-family:\'Space Mono\',monospace;font-size:7px;color:var(--mt);letter-spacing:1px;margin-bottom:3px;display:flex;justify-content:space-between';
  var cdValSpan=document.createElement('span');cdValSpan.style.color='var(--ac2)';cdValSpan.textContent=ppd.cd.toFixed(2);
  cdLabel2.innerHTML='コードトーン依存度 ';cdLabel2.appendChild(cdValSpan);
  var cdRange=document.createElement('input');cdRange.type='range';cdRange.min=0;cdRange.max=100;cdRange.step=5;cdRange.value=Math.round(ppd.cd*100);cdRange.style.cssText='accent-color:var(--ac2);width:100%;';
  cdRange.oninput=function(){ppd.cd=+cdRange.value/100;cdValSpan.textContent=ppd.cd.toFixed(2);};
  var cdHint=document.createElement('div');cdHint.className='ppd-pattern-hint';cdHint.textContent='0.0=モチーフの原型を維持　1.0=コードトーンへ吸着';
  cdWrap.appendChild(cdLabel2);cdWrap.appendChild(cdRange);cdWrap.appendChild(cdHint);
  phraseBody.appendChild(cdWrap);

  // Pattern input
  var patRow=document.createElement('div');patRow.className='ppd-pattern-row';
  var patLabelEl=document.createElement('div');patLabelEl.style.cssText='font-family:\'Space Mono\',monospace;font-size:7px;color:var(--mt);letter-spacing:1px;margin-right:4px';patLabelEl.textContent='Pattern:';
  var patInput=document.createElement('input');patInput.className='ppd-pattern-input';patInput.type='text';patInput.maxLength=16;patInput.value=ppd.pattern;patInput.placeholder='AABB';
  var barsCalc=document.createElement('span');barsCalc.className='ppd-bars-calc';
  function updateBarsCalc(){
    var p=patInput.value.replace(/[^A-Za-z]/g,'');
    ppd.pattern=p||'A';
    var bars=p.length*Math.max(1,ppd.fl);
    barsCalc.textContent='→ '+bars+' Bars ('+p.length+'× '+ppd.fl+'小節)';
  }
  patInput.oninput=updateBarsCalc;
  updateBarsCalc();
  patRow.appendChild(patLabelEl);patRow.appendChild(patInput);patRow.appendChild(barsCalc);
  phraseBody.appendChild(patRow);
  var patHint=document.createElement('div');patHint.className='ppd-pattern-hint';
  patHint.textContent='A=原型 B=リズム変更 C=音程変更 D=後半変更 E=逆行 F=後半2連 X=新規生成(出現毎にユニーク)';
  phraseBody.appendChild(patHint);

  // Commit button
  var commitBtn=document.createElement('button');commitBtn.className='ppd-commit';commitBtn.textContent='✓ Phrase Libraryに追加';
  commitBtn.onclick=function(){syncLibraryFromPPD();};
  phraseBody.appendChild(commitBtn);

  card.appendChild(phraseBody);

  // Legacy Inherit body
  var legacyBody=document.createElement('div');legacyBody.style.cssText='padding-top:6px;border-top:1px solid var(--bd);'+(ppd.mode!=='legacy'?'display:none':'');
  var fi=getFISetting(base);
  var modeGrid=document.createElement('div');modeGrid.className='fi-mode-grid';
  var modes=[{v:'off',n:'OFF',d:'新規生成'},{v:'phrase',n:'PHRASE',d:'そのまま継承'},{v:'variation',n:'VARIATION',d:'変形して継承'}];
  modes.forEach(function(m){
    var btn=document.createElement('button');btn.className='fimb'+(fi.mode===m.v?' on':'');
    btn.innerHTML='<span class="fimn">'+m.n+'</span><span class="fimd">'+m.d+'</span>';
    btn.onclick=function(){fi.mode=m.v;modeGrid.querySelectorAll('.fimb').forEach(function(b){b.classList.remove('on');});btn.classList.add('on');};
    modeGrid.appendChild(btn);
  });
  legacyBody.appendChild(modeGrid);
  card.appendChild(legacyBody);

  tabPhrase.onclick=function(){ppd.mode='phrase';tabPhrase.classList.add('on');tabLegacy.classList.remove('on');phraseBody.classList.remove('hidden');legacyBody.style.display='none';};
  tabLegacy.onclick=function(){ppd.mode='legacy';tabLegacy.classList.add('on');tabPhrase.classList.remove('on');phraseBody.classList.add('hidden');legacyBody.style.display='';};

  return card;
}

function buildPPDGrid(){
  var grid=document.getElementById('PPD_GRID');if(!grid)return;
  grid.innerHTML='';

  PPD_BASE_PARTS.forEach(function(base){
    var color=PCOL[base]||'#888';

    // ★ パートグループ折りたたみコンテナ
    var groupWrap=document.createElement('div');
    groupWrap.style.cssText='border:1px solid '+color+'44;border-radius:5px;margin-bottom:8px;overflow:hidden;';

    // グループヘッダー（折りたたみトグル）
    var groupHdr=document.createElement('div');
    groupHdr.style.cssText='display:flex;align-items:center;gap:8px;padding:9px 12px;cursor:pointer;background:'+color+'0d;user-select:none;transition:background .15s;';
    groupHdr.onmouseenter=function(){groupHdr.style.background=color+'1a';};
    groupHdr.onmouseleave=function(){groupHdr.style.background=color+'0d';};
    var groupDot=document.createElement('span');groupDot.style.cssText='width:8px;height:8px;border-radius:50%;background:'+color+';flex-shrink:0;';
    var groupTitle=document.createElement('span');groupTitle.style.cssText='font-family:\'Space Mono\',monospace;font-size:10px;font-weight:700;color:'+color+';letter-spacing:2px;';
    groupTitle.textContent=PLBL[base]||base;
    var groupArrow=document.createElement('span');groupArrow.style.cssText='margin-left:auto;font-size:12px;color:'+color+';transition:transform .2s;';groupArrow.textContent='▼';
    groupHdr.appendChild(groupDot);groupHdr.appendChild(groupTitle);groupHdr.appendChild(groupArrow);
    groupWrap.appendChild(groupHdr);

    // グループボディ（2カラム横並び）
    var groupBody=document.createElement('div');
    groupBody.style.cssText='display:flex;gap:8px;padding:10px;background:var(--bg2);'; // 最初は開いた状態

    var card1=buildPPDCard(base+'_1');
    var card2=buildPPDCard(base+'_2');
    groupBody.appendChild(card1);
    groupBody.appendChild(card2);
    groupWrap.appendChild(groupBody);

    // 折りたたみトグル処理
    var isOpen=true;
    groupHdr.onclick=function(){
      isOpen=!isOpen;
      groupBody.style.display=isOpen?'flex':'none';
      groupArrow.style.transform=isOpen?'':'rotate(-90deg)';
    };

    grid.appendChild(groupWrap);
  });
}

// ══════════════════════════════════════════════
// ★ v8.0 PHRASE LIBRARY
// ══════════════════════════════════════════════
// phraseLibrary: [{id, part, ref, fl, pattern, bars, cd, restEnd}]
var phraseLibrary=[];

function syncLibraryFromPPD(){
  // PPD設定をPhraseLibraryに同期（ppdId単位で上書き or 追加）
  PPD_PARTS.forEach(function(ppdId){
    var ppd=getPPD(ppdId);
    if(ppd.mode!=='phrase')return;
    var base=ppdBasePart(ppdId);
    var pattern=ppd.pattern.replace(/[^A-Za-z]/g,'')||'A';
    var bars=pattern.length*Math.max(1,ppd.fl);
    var idx=phraseLibrary.findIndex(function(e){return e.ppdId===ppdId;});
    var entry={id:ppdId+'_'+Date.now(),ppdId:ppdId,part:base,ref:ppd.ref,fl:ppd.fl,pattern:pattern,bars:bars,cd:(ppd.cd!==undefined?ppd.cd:0.5),restEnd:ppd.restEnd||0};
    if(idx>=0)phraseLibrary[idx]=entry;else phraseLibrary.push(entry);
  });
  renderPhraseLibrary();
  renderS5LibraryBtns();
}

// パターン文字ごとの表示色
var PATTERN_CHAR_COLORS={A:'var(--ac)',B:'var(--ac2)',C:'var(--ac3)',D:'var(--ac4)',E:'var(--ac5)',F:'#b3f7b3',X:'#ffd447'};

function renderPhraseLibrary(){
  var cont=document.getElementById('PHRASE_LIBRARY');if(!cont)return;
  if(!phraseLibrary.length){cont.innerHTML='<div style="font-family:\'Space Mono\',monospace;font-size:8px;color:var(--mt);padding:8px">フレーズが登録されていません。各パートを設計後「同期」を押してください。</div>';return;}
  cont.innerHTML='';

  // パートグループ単位で横並び表示
  PPD_BASE_PARTS.forEach(function(base){
    var entries=phraseLibrary.filter(function(e){return e.part===base;});
    if(!entries.length)return;
    var color=PCOL[base]||'#888';
    var groupWrap=document.createElement('div');
    groupWrap.style.cssText='margin-bottom:8px;border:1px solid '+color+'33;border-radius:4px;overflow:hidden;';
    // グループ名ヘッダー
    var ghdr=document.createElement('div');
    ghdr.style.cssText='font-family:\'Space Mono\',monospace;font-size:8px;font-weight:700;color:'+color+';padding:5px 10px;background:'+color+'0d;letter-spacing:2px;display:flex;align-items:center;gap:5px;';
    ghdr.innerHTML='<span style="width:6px;height:6px;border-radius:50%;background:'+color+';display:inline-block"></span>'+PLBL[base];
    groupWrap.appendChild(ghdr);
    // 横並び
    var row=document.createElement('div');
    row.style.cssText='display:flex;gap:6px;padding:8px;';
    entries.forEach(function(entry){
      var num=entry.ppdId?entry.ppdId.slice(-1):'1';
      var sec=document.createElement('div');sec.className='pl-section';sec.style.cssText='flex:1;min-width:0;margin:0;';
      var hdr2=document.createElement('div');hdr2.className='pl-header';
      var title2=document.createElement('div');title2.className='pl-title';
      var slotBadge='<span style="background:'+color+'22;border:1px solid '+color+'44;border-radius:2px;padding:1px 5px;font-size:8px;color:'+color+';">'+(PPD_SLOT_LABELS[num]||num)+'</span>';
      var refColors={'A':'var(--ac)','Ap':'var(--ac2)','new':'var(--mt)'};
      var refNames={'A':'→ Global A','Ap':"→ Global A'",'new':'→ New'};
      var rc=refColors[entry.ref]||'var(--mt)',rn=refNames[entry.ref]||'→ New';
      title2.innerHTML=slotBadge+'<span class="pl-ref-badge" style="background:'+rc+'18;border:1px solid '+rc+'44;color:'+rc+'">'+rn+'</span>';
      var cdv=(entry.cd!==undefined?entry.cd:0.5);
      var meta2=document.createElement('div');meta2.className='pl-meta';
      meta2.textContent='FL:'+entry.fl+'小節 CD:'+cdv.toFixed(2)+' 休符:'+(entry.restEnd||0)+'拍';
      var barsBadge=document.createElement('span');barsBadge.className='pl-bars-badge';barsBadge.textContent=entry.bars+' Bars';
      hdr2.appendChild(title2);hdr2.appendChild(barsBadge);
      sec.appendChild(hdr2);sec.appendChild(meta2);
      var patRow=document.createElement('div');patRow.className='pl-pattern-display';
      entry.pattern.split('').forEach(function(ch){
        var chip=document.createElement('span');chip.className='pl-pat-chip';
        var c=PATTERN_CHAR_COLORS[ch.toUpperCase()]||'var(--mt)';
        chip.style.cssText='background:'+c+'18;border:1px solid '+c+'44;color:'+c;
        chip.textContent=ch.toUpperCase();patRow.appendChild(chip);
      });
      sec.appendChild(patRow);
      row.appendChild(sec);
    });
    // entries が1個しかなければ右側を空白placeholderに
    if(entries.length===1){
      var ph=document.createElement('div');ph.style.cssText='flex:1;min-width:0;border:1px dashed var(--bd);border-radius:3px;display:flex;align-items:center;justify-content:center;';
      ph.innerHTML='<span style="font-family:\'Space Mono\',monospace;font-size:7px;color:var(--mt)">② 未登録</span>';
      row.appendChild(ph);
    }
    groupWrap.appendChild(row);
    cont.appendChild(groupWrap);
  });
}

function renderS5LibraryBtns(){
  var cont=document.getElementById('S5_LIBRARY_BTNS');if(!cont)return;
  if(!phraseLibrary.length){cont.innerHTML='<span style="font-family:\'Space Mono\',monospace;font-size:7px;color:var(--mt)">← STEP04でフレーズを設計・同期するとここにボタンが表示されます</span>';return;}
  cont.innerHTML='';
  phraseLibrary.forEach(function(entry){
    var base=entry.part,color=PCOL[base]||'#888';
    var num=entry.ppdId?entry.ppdId.slice(-1):'1';
    var btn=document.createElement('button');btn.className='pb';
    btn.style.cssText='border-color:'+color+';color:'+color;
    btn.innerHTML='＋ '+(PLBL[base]||base)+(PPD_SLOT_LABELS[num]||'')+'<span style="font-family:\'Space Mono\',monospace;font-size:6px;opacity:.7;margin-left:4px">'+entry.pattern+' / '+entry.bars+'Bars</span>';
    btn.onclick=(function(e){return function(){addPartFromLibrary(e);};})(entry);
    cont.appendChild(btn);
  });
}

function addPartFromLibrary(entry){
  struct.push({part:entry.part,bars:entry.bars,phraseEntry:entry});
  var key='P'+(struct.length-1);
  if(!partInst[key])partInst[key]=defPartInst();
  // ★ entry.restEnd はフレーズ終わり休符（PPD側で管理）。06楽器のpartEndRestとは別物なので伝播しない。
  renderStruct();buildPartTabs();
}

// STEP5 クイック追加トグル
function toggleQuickAdd(){
  var fold=document.getElementById('QUICK_ADD_FOLD');
  var body=document.getElementById('QUICK_ADD_BODY');
  fold.classList.toggle('open');
  body.classList.toggle('vis');
}

// ══════════════════════════════════════════════
// ★ v8.0 Phrase-based melody generation integration
// ══════════════════════════════════════════════
// genMelody に phraseEntry があれば PATTERN_HANDLERS を使う拡張
// 既存genMelody関数を上書き

var _origGenMelody=genMelody;
genMelody=function(sn,sections,PPQ){
  // phraseEntryを持つsectionが一つもなければ旧ロジック
  var hasPhraseEntry=sections.some(function(s){return s.phraseEntry;});
  if(!hasPhraseEntry)return _origGenMelody(sn,sections,PPQ);

  var Q=PPQ,E=PPQ/2,S=PPQ/4;
  var beats=TS_BEATS[curTS]||4,barTicks=beats*Q;
  var root=parseInt(document.getElementById('KEY').value);
  var cl=function(i){return Math.max(0,Math.min(sn.length-1,i));};
  var durPool=buildDurPool(PPQ);
  var centerIdx=Math.floor(sn.length*getMPV('PC'));

  // グローバルモチーフ取得（ref='A'/'Ap' → GLOBAL_MOTIFS から）
  function getBaseMotif(ref){
    if(ref==='A'&&GLOBAL_MOTIFS.A)return GLOBAL_MOTIFS.A.notes.map(function(n){return{scaleIdx:n.scaleIdx,dur:n.dur};});
    if(ref==='Ap'&&GLOBAL_MOTIFS.Ap)return GLOBAL_MOTIFS.Ap.notes.map(function(n){return{scaleIdx:n.scaleIdx,dur:n.dur};});
    return null;
  }

  function resolveChordNote(sn2,idx,chordTones){
    var best=idx,bestD=999;
    sn2.forEach(function(n,i){if(chordTones.indexOf(n%12)>=0){var d=Math.abs(i-idx);if(d<bestD){bestD=d;best=i;}}});
    return best;
  }

  // ★ 複数小節分のモチーフを生成（bars小節ひと続きのモチーフ。1小節×bars回ではない）
  function genFreshMotif(barStartTick,chord,ci_in,cd,bars){
    bars=bars||1;
    var chordTones=chord.map(function(n){return n%12;});
    var motif=[],ci=ci_in,noteCursor=barStartTick,ni=0;
    var totalTicks=barStartTick+bars*barTicks;
    while(noteCursor<totalTicks&&ni<bars*24){
      var dur=pickA(durPool);if(dur<0){noteCursor+=Math.abs(dur);ni++;continue;}
      if(noteCursor+dur>totalTicks)dur=totalTicks-noteCursor;
      if(dur<S)break;
      var step=Math.random()<getMPV('LP')?rng(-4,4)||1:rng(-2,2)||1;
      ci=cl(ci+step);
      if(Math.random()<cd*0.5){var idx2=resolveChordNote(sn,ci,chordTones);ci=idx2;}
      motif.push({scaleIdx:cl(ci),dur:dur});
      noteCursor+=dur;ni++;
    }
    return{motif:motif,ci:ci};
  }

  // ★ モチーフの指定小節区間をレンダリング
  // phraseBarOffset: フレーズ内の何小節目か（0-indexed）
  // motifBarCount: モチーフの総小節数
  //   - パートFL > モチーフFL → phraseBarOffset % motifBarCount でラップアラウンド（繰り返し）
  //   - パートFL < モチーフFL → 前半のみ使用（自然にトランケート）
  function renderMotif(motif,barStartTick,chord,cd,phraseBarOffset,motifBarCount){
    phraseBarOffset=phraseBarOffset||0;
    motifBarCount=Math.max(1,motifBarCount||1);
    var effectiveOffset=(phraseBarOffset%motifBarCount)*barTicks;
    var windowEnd=effectiveOffset+barTicks;
    var chordTones=chord.map(function(n){return n%12;});
    var notes=[],motifCursor=0;
    motif.forEach(function(m){
      var dur=m.dur;
      var noteEnd=motifCursor+dur;
      if(noteEnd<=effectiveOffset){motifCursor=noteEnd;return;}
      if(motifCursor>=windowEnd)return;
      var clipStart=Math.max(motifCursor,effectiveOffset);
      var clipEnd=Math.min(noteEnd,windowEnd);
      var clipDur=clipEnd-clipStart;
      if(clipDur>=S){
        var renderTick=barStartTick+(clipStart-effectiveOffset);
        var idx=cl(m.scaleIdx);
        if(Math.random()<cd*0.5)idx=resolveChordNote(sn,idx,chordTones);
        notes.push([sn[idx],renderTick,clipDur-12,Math.max(20,Math.min(127,74+rng(-5,5)))]);
      }
      motifCursor=noteEnd;
    });
    return notes;
  }

  var all=[],cursor=0,ci=centerIdx;
  sections.forEach(function(sec){
    var secTicks=sec.bars*barTicks;
    var entry=sec.phraseEntry;
    if(!entry){
      // 旧ロジックに委譲
      var subNotes=_origGenMelody(sn,[sec],PPQ);
      subNotes.forEach(function(n){all.push([n[0],n[1]+cursor,n[2],n[3]]);});
      cursor+=secTicks;return;
    }
    var pattern=entry.pattern.replace(/[^A-Za-z]/g,'')||'A';
    var fl=Math.max(1,entry.fl); // パートのフレーズ長（小節数）= モチーフ全体の長さ
    var entryCd=(entry.cd!==undefined)?entry.cd:0.5;
    var baseMotif=getBaseMotif(entry.ref);
    // Global Motifの小節数（ref=A/Ap時のみ有効）
    var globalMotifBars=Math.max(1,curFL);
    var motifCache={};
    var bar=0;
    pattern.split('').forEach(function(ch){
      var chUp=ch.toUpperCase();
      var motif,motifBars;
      if(chUp==='X'){
        // X=毎回新規生成、fl小節ひと続き
        var chordX=getChordForPart(sec.part,bar,root);
        var resX=genFreshMotif(0,chordX,ci,entryCd,fl);
        ci=resX.ci;motif=resX.motif;motifBars=fl;
      }else{
        if(!motifCache[chUp]){
          if(baseMotif){
            // Global Motif参照: curFL小節のモチーフをパターン変換（小節数はglobalMotifBarsのまま）
            var src=baseMotif.map(function(n){return{scaleIdx:n.scaleIdx,dur:n.dur};});
            motifCache[chUp]={notes:PATTERN_HANDLERS[chUp]?PATTERN_HANDLERS[chUp](src):src,bars:globalMotifBars};
          }else{
            // new generate: fl小節ひと続きで生成
            var chord=getChordForPart(sec.part,bar,root);
            var res=genFreshMotif(0,chord,ci,entryCd,fl);ci=res.ci;
            motifCache[chUp]={notes:res.motif,bars:fl};
          }
        }
        motif=motifCache[chUp].notes;
        motifBars=motifCache[chUp].bars;
      }

      // ★ fl小節をひと続きのフレーズとしてレンダリング
      // motifBars と fl の大小に応じて自動ラップ or トランケート
      var phraseNotes=[];
      var phraseStartTick=cursor+bar*barTicks;
      for(var b=0;b<fl&&bar<sec.bars;b++,bar++){
        var barStart=cursor+bar*barTicks;
        var chord2=getChordForPart(sec.part,bar,root);
        phraseNotes=phraseNotes.concat(renderMotif(motif,barStart,chord2,entryCd,b,motifBars));
      }

      // ★ フレーズ終わり休符（各フレーズ単位の末尾に適用。06楽器のパート終わり休符とは別）
      if(entry.restEnd>0){
        var restStartTick=phraseStartTick+fl*barTicks-entry.restEnd*Q;
        phraseNotes=phraseNotes.map(function(n){
          if(n[1]>=restStartTick)return null;
          if(n[1]+n[2]>restStartTick){
            var nd=restStartTick-n[1];
            return nd>=S?[n[0],n[1],nd,n[3]]:null;
          }
          return n;
        }).filter(Boolean);
      }

      all=all.concat(phraseNotes);
    });
    cursor+=secTicks;
  });
  return all;
};

// ══════════════════════════════════════════════
// ★ doGen: 楽曲全体のMIDI生成（Generate Notesフラグ・プラグイン経由の楽器生成を含む）
// ══════════════════════════════════════════════
function doGen(){
  var btn=document.getElementById('GBTN');
  btn.classList.add('ld');document.getElementById('GICO').textContent='⟳';document.getElementById('GTXT').textContent='GENERATING...';
  setTimeout(function(){
    try{
      var root=parseInt(document.getElementById('KEY').value);
      var scale=document.getElementById('SCALE').value;var tempo=parseInt(document.getElementById('TEMPO').value);
      var octave=parseInt(document.getElementById('OCT').value);
      var PPQ=480;var beats=TS_BEATS[curTS]||4;
      var sn=buildScale(root,scale,octave);
      var sections=struct.length?struct.slice():[{part:'ALL',bars:8}];
      if(!partInst['MAIN'])partInst['MAIN']=defPartInst();
      var melNotes=genMelody(sn,sections,PPQ);
      var melEv=[];melNotes.forEach(function(n){melEv.push({t:n[1],tp:1,ch:1,n:n[0],v:n[3]});melEv.push({t:n[1]+n[2],tp:0,ch:1,n:n[0]});});
      var totBars=sections.reduce(function(a,s){return a+s.bars;},0);
      var gtrEv=[],pluginEv={};PLUGIN_ORDER.forEach(function(id){pluginEv[id]=[];});var barCursor=0;
      sections.forEach(function(s,sIdx){
        var instIdx=struct.length?sIdx:null;
        var inst=effInst(instIdx);var barOff=barCursor*beats*PPQ;
        var instP=struct.length?partInst['P'+sIdx]:partInst['MAIN'];
        var partEndRestBeats=(instP&&instP.partEndRest)||0;
        var partEndRestTicks=partEndRestBeats*PPQ;
        var barTicks2=beats*PPQ;
        var playTicks=Math.max(0,s.bars*barTicks2-partEndRestTicks);
        var playBars=Math.floor(playTicks/barTicks2);
        var sEff=Object.assign({},s,{bars:Math.max(1,playBars)});
        // Generate Notes チェック
        if(inst.gtr.on&&inst.gtr.genNotes!==false){var g=genGuitar(root,sEff.bars,PPQ,0,inst.gtr,s.part,barCursor);g.forEach(function(e){var e2=Object.assign({},e);e2.t+=barOff;gtrEv.push(e2);});}
        // ★ プラグイン楽器: registerInstrument()で登録された楽器を自動で回す
        //   plugins/*.js を追加するだけで、ここを書き換えずに新しい楽器が生成・出力される
        var leadPs=barCursor*beats*PPQ,leadPe=(barCursor+sEff.bars)*beats*PPQ;
        PLUGIN_ORDER.forEach(function(id){
          var instX=inst[id];if(!instX)return;
          if(!instX.on||instX.genNotes===false)return;
          var p=INSTRUMENT_PLUGINS[id];
          var ctx={root:root,bars:sEff.bars,PPQ:PPQ,ch:p.channel,st:instX.st,part:s.part,section:sEff,barCursor:barCursor,beats:beats,tempo:tempo,instData:instX,
                   gtrData:inst.gtr,riff:instX.riff,melNotes:melNotes,ps:leadPs,pe:leadPe};
          var out=p.generate(ctx)||[];
          out.forEach(function(e){var e2=Object.assign({},e);e2.t+=barOff;pluginEv[id].push(e2);});
        });
        barCursor+=s.bars;
      });
      var fi=effInst(struct.length?0:null);
      var melPC=INST_DEFS.mel.pcs[fi.mel.st]||73;
      var us=Math.round(60000000/tempo);var tsNum=TS_BEATS[curTS]||4,tsComp=curTS==='6/8';
      var tB=[0,255,81,3,(us>>16)&255,(us>>8)&255,us&255,0,255,88,4,tsNum,tsComp?3:2,24,8];
      var tracks=[];
      if(partInst.MAIN.mel.on&&melEv.length)tracks.push([ev2b(melEv,pcB(1,melPC)),'Melody']);
      // ★ トラック順は元のv8.0.5と完全一致させるため Lead→Guitar(コア)→残りのプラグイン の順で出力する
      (function(){
        var leadEvs=pluginEv['lead'];
        if(leadEvs&&leadEvs.length){
          var lp=INSTRUMENT_PLUGINS['lead'];
          tracks.push([ev2b(leadEvs,pcB(lp.channel,INST_DEFS.lead.pc)),lp.trackName||lp.name]);
        }
      })();
      if(gtrEv.length)tracks.push([ev2b(gtrEv,pcB(0,INST_DEFS.gtr.pc)),'Guitar']);
      PLUGIN_ORDER.forEach(function(id){
        if(id==='lead')return;// 上で出力済み
        var evs=pluginEv[id];if(!evs||!evs.length)return;
        var p=INSTRUMENT_PLUGINS[id];
        var prog=(p.channel!=null)?pcB(p.channel,INST_DEFS[id].pc):[];
        tracks.push([ev2b(evs,prog),p.trackName||p.name]);
      });
      var nt=1+tracks.length;var ab=mkHdr(nt).concat(mkTrk(tB,'Tempo'));
      tracks.forEach(function(t){ab=ab.concat(mkTrk(t[0],t[1]));});
      var blob=new Blob([new Uint8Array(ab)],{type:'audio/midi'});var url=URL.createObjectURL(blob);
      var kn=NN[root%12];
      var titleInput=(document.getElementById('TITLE').value||'').trim();
      var filename=titleInput?titleInput.replace(/[\\/:*?"<>|]/g,'_'):'melody_'+kn+'_'+scale+'_'+tempo+'bpm';
      var dl=document.getElementById('DLLINK');dl.href=url;dl.download=filename+'.mid';
      var tt=totBars*beats*PPQ;drawRoll(melNotes,tt);animViz(melNotes,totBars);
      var gtrDesc=fi.gtr.useCustom?'カスタム':('基本'+GTR_BASICS[Math.min(fi.gtr.basicPat>=0?fi.gtr.basicPat:0,4)].name);
      gtrDesc+=' × '+GTR_ARTS[fi.gtr.artPat||0].name;
      var ss=struct.map(function(s){return s.part+'('+s.bars+')';}).join('→');
      document.getElementById('BDGS').innerHTML=
        '<div>KEY <span>'+kn+' '+scale+'</span></div><div>BPM <span>'+tempo+'</span></div>'+
        '<div>TS <span>'+curTS+'</span></div><div>BARS <span>'+totBars+'</span></div>'+
        '<div>MOOD <span>'+curMood+'</span></div><div>CHORD <span>'+curCP+'</span></div>'+
        '<div>FL <span>'+curFL+'小節</span></div><div>SP <span>'+curSP+'</span></div>'+
        '<div>REPEAT <span>'+Math.round(getRR()*100)+'%</span></div>'+
        '<div>VARIATION <span>'+Math.round(+document.getElementById('VR').value)+'%</span></div>'+
        '<div>GTR <span>'+gtrDesc+'</span></div>'+
        '<div>STRUCT <span>'+(ss||'AUTO')+'</span></div>';
      document.getElementById('OPANEL').classList.add('vis','fi');
    }catch(e){alert('エラー: '+e.message+'\n'+e.stack);}
    btn.classList.remove('ld');document.getElementById('GICO').textContent='▶';document.getElementById('GTXT').textContent='REGENERATE';
  },300);
}

// ══════════════════════════════════════════════
// ★ プラグイン対応 初期化エントリポイント
// ══════════════════════════════════════════════
// index.html の最後（全プラグインscript読み込み後）に initApp() を呼び出すこと。
// これによりMAIN/各パートの楽器構成(INST_DEFS)がプラグイン登録内容を反映した状態で
// UIが構築される。生成アルゴリズム・UI・設定値は元のv8.0.5から一切変更していない。
function initApp(){
  buildInstDefsFromPlugins();
  initViz();buildPartChordGrid();presetStruct('folk');selMood(document.querySelector('[data-mood="folk"]'));updateCPPreview();
  buildPPDGrid();
  buildFIGrid(); // Legacy Inherit 後方互換
  renderPhraseLibrary();
}

// ══════════════════════════════════════════════
// ★ Miku MIDI Phrase Pack Generator 連携
// ══════════════════════════════════════════════
// ポップアップで Miku Generator を開き、そちら側の「→PA」ボタンから
// postMessage({type:'PHRASE_ARCHITECT_MOTIF', ppq, notes:[{pitch,startTick,durTicks}]}) を
// 受け取って GLOBAL_MOTIFS.A へ変換・格納する。
var _mikuPopup=null;
function openMikuGenerator(){
  _mikuPopup=window.open('miku_midi_phrase_pack_generator.html','miku_gen','width=1280,height:840,menubar=no,toolbar=no');
  if(!_mikuPopup){alert('ポップアップがブロックされました。ブラウザのポップアップ許可設定をご確認ください。');return;}
  var st=document.getElementById('MIKU_IMPORT_STATUS');if(st)st.textContent='Miku Generatorを起動しました。生成後「→PA」で取り込み';
}

window.addEventListener('message',function(ev){
  var d=ev.data;
  if(!d||d.type!=='PHRASE_ARCHITECT_MOTIF'||!d.notes)return;
  importMotifFromMiku(d);
});

function importMotifFromMiku(d){
  var root=parseInt(document.getElementById('KEY').value);
  var scale=document.getElementById('SCALE').value;
  var octave=parseInt(document.getElementById('OCT').value);
  var sn=buildScale(root,scale,octave);
  if(!sn.length){alert('スケール取得に失敗しました');return;}
  var ppqRatio=480/(d.ppq||120); // Miku側PPQ(通常120)→PHRASE_ARCHITECT側PPQ(480)へ変換
  var srcNotes=d.notes.slice().sort(function(a,b){return a.startTick-b.startTick;});
  if(!srcNotes.length){alert('取り込めるノートがありません');return;}
  var motif=srcNotes.map(function(n){
    // MIDIピッチ→スケール音配列(sn)上の最近傍indexへスナップ
    var idx=0,bestD=999;
    sn.forEach(function(sp,i){var dd=Math.abs(sp-n.pitch);if(dd<bestD){bestD=dd;idx=i;}});
    var dur=Math.max(30,Math.round(n.durTicks*ppqRatio));
    return{scaleIdx:idx,dur:dur};
  });
  var key=(d.targetSlot==='Ap')?'Ap':'A';
  GLOBAL_MOTIFS[key]={notes:motif,label:key==='Ap'?"A'":'A'};
  renderGlobalMotif(key,sn);
  var st=document.getElementById('MIKU_IMPORT_STATUS');
  if(st)st.textContent='Global Motif '+(key==='Ap'?"A'":'A')+' に '+motif.length+'音 取り込み完了';
}


// ══════════════════════════════════════════════
// ★ SONG JSON Export（曲設計情報の構造化）
// ══════════════════════════════════════════════
function collectSongState(){
  var keySel=document.getElementById('KEY');
  var root=parseInt(keySel.value,10);
  var keyLabel=keySel.selectedOptions&&keySel.selectedOptions[0]?keySel.selectedOptions[0].textContent:'';
  var scale=document.getElementById('SCALE').value;
  var octave=parseInt(document.getElementById('OCT').value,10);
  var tempo=parseInt(document.getElementById('TEMPO').value,10);
  var title=(document.getElementById('TITLE').value||'').trim();

  var nw=getNW(); // [whole,half,quarter,eighth,sixteenth,dottedQuarter, wholeRest,halfRest,quarterRest,eighthRest,sixteenthRest]
  var noteDurationWeights={
    notes:{whole:nw[0],half:nw[1],quarter:nw[2],eighth:nw[3],sixteenth:nw[4],dottedQuarter:nw[5]},
    rests:{whole:nw[6],half:nw[7],quarter:nw[8],eighth:nw[9],sixteenth:nw[10]}
  };

  var partOverrides={};
  Object.keys(partChords).forEach(function(part){
    var seq=partChords[part]&&partChords[part].seq;
    if(seq&&seq.length)partOverrides[part]=seq.slice();
  });

  var state={
    version:'1.0',
    generator:'PHRASE_ARCHITECT',
    generatorVersion:'8.0.5',
    exportedAt:new Date().toISOString(),

    basic:{
      title:title,
      key:root,
      keyLabel:keyLabel,
      scale:scale,
      octave:octave,
      tempo:tempo,
      timeSignature:curTS,
      ending:curEnd
    },

    mood:{
      preset:curMood,
      params:{
        pitchCenter:getMPV('PC'),
        leapProb:getMPV('LP'),
        ascendDescendBias:getARV(),
        chordToneDependency:getMPV('CD')
      },
      noteDurationWeights:noteDurationWeights
    },

    chordProgression:{
      commonPreset:curCP,
      partOverrides:partOverrides
    },

    phraseDesign:{
      legacyCommonParams:{
        setPattern:curSP,
        repeatRate:getRR(),
        variationRate:+document.getElementById('VR').value/100
      },
      globalMotif:{
        phraseLengthBars:curFL,
        A:GLOBAL_MOTIFS.A,
        Ap:GLOBAL_MOTIFS.Ap
      },
      partPhraseDesign:PPD_DATA,
      phraseLibrary:phraseLibrary,
      legacyInherit:FI_SETTINGS
    },

    structure:{
      parts:struct.map(function(s){
        return{part:s.part,bars:s.bars,phraseEntryId:s.phraseEntry?s.phraseEntry.id:null};
      })
    },

    instruments:{
      main:partInst.MAIN,
      parts:struct.map(function(s,i){
        var key='P'+i;
        var p=partInst[key]||{};
        var overrides={};
        Object.keys(INST_DEFS).forEach(function(k){if(p[k])overrides[k]=p[k];});
        return{index:i,part:s.part,partEndRest:p.partEndRest||0,overrides:overrides};
      })
    }
  };

  // ライブ参照を切り離すためディープコピーして返す
  return JSON.parse(JSON.stringify(state));
}

function _safeFileTitle(){
  var titleInput=(document.getElementById('TITLE').value||'').trim();
  return titleInput?titleInput.replace(/[\\/:*?"<>|]/g,'_'):'untitled';
}

function exportSongJSON(){
  var state=collectSongState();
  var json=JSON.stringify(state,null,2);
  var blob=new Blob([json],{type:'application/json'});
  var url=URL.createObjectURL(blob);
  var filename='PHRASE_ARCHITECT_'+_safeFileTitle()+'.json';
  var a=document.createElement('a');
  a.href=url;a.download=filename;
  document.body.appendChild(a);a.click();a.remove();
  setTimeout(function(){URL.revokeObjectURL(url);},2000);
}

// ══════════════════════════════════════════════
// ★ SUNO MUSIC STYLE PROMPT（折りたたみパネル連携）
// ══════════════════════════════════════════════
function generateSunoPrompt(){
  var songJson=collectSongState(); // 内部変数を直接参照しない。SONG JSONのみ入力とする
  var prompt=compileSunoStylePrompt(songJson);
  var ta=document.getElementById('SUNO_PROMPT_TEXT');
  ta.value=prompt;
  // 折りたたみを自動展開
  var toggle=document.getElementById('STYLE_FOLD');
  var body=document.getElementById('STYLE_BODY');
  if(toggle&&body&&!body.classList.contains('vis')){
    toggle.classList.add('open');body.classList.add('vis');
  }
}
function copySunoPrompt(){
  var ta=document.getElementById('SUNO_PROMPT_TEXT');
  if(!ta.value)return;
  ta.select();
  try{document.execCommand('copy');}catch(e){}
  if(navigator.clipboard)navigator.clipboard.writeText(ta.value).catch(function(){});
}

// ══════════════════════════════════════════════
// ★ SONG JSON パネル（折りたたんだまま。開いたときのみ再取得して表示）
// ══════════════════════════════════════════════
function toggleSongJsonFold(){
  var toggle=document.getElementById('SONGJSON_FOLD');
  var body=document.getElementById('SONGJSON_BODY');
  if(!toggle||!body)return;
  toggle.classList.toggle('open');
  body.classList.toggle('vis');
  if(body.classList.contains('vis')){
    var ta=document.getElementById('SONG_JSON_TEXT');
    ta.value=JSON.stringify(collectSongState(),null,2);
  }
}
function copySongJson(){
  var ta=document.getElementById('SONG_JSON_TEXT');
  if(!ta.value)ta.value=JSON.stringify(collectSongState(),null,2);
  ta.select();
  try{document.execCommand('copy');}catch(e){}
  if(navigator.clipboard)navigator.clipboard.writeText(ta.value).catch(function(){});
}
function downloadSongJson(){
  exportSongJSON();
}
