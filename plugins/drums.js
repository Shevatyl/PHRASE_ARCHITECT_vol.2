// ════════════════════════════════════════════════
// Phrase Architect — Drums Plugin
// 元 v8.0.5 の genDrums をそのまま移植（アルゴリズム変更なし）
// ドラムはチャンネル9固定・パーカッション専用のためプログラムチェンジは送らない(channel:null)
// ════════════════════════════════════════════════
(function(){
function genDrums(bars,PPQ,st){var ev=[],Q=PPQ,E=PPQ/2,S2=PPQ/4;var KI=36,SN=38,HH=42,RI=51,CR=49;var beats=TS_BEATS[curTS]||4,barTicks=beats*Q;for(var bar=0;bar<bars;bar++){var bs=bar*barTicks;if(st===0){for(var i=0;i<beats*2;i++)addNote(ev,9,bs+i*E,E-5,HH,i%2===0?74:56);[0,Math.floor(beats/2)].forEach(function(b){addNote(ev,9,bs+b*Q,E-5,KI,102);});var snB=beats>=4?2:1;[snB,snB+Math.floor(beats/2)].filter(function(b){return b<beats;}).forEach(function(b){addNote(ev,9,bs+b*Q,E-5,SN,92);});if(bar===0)addNote(ev,9,bs,Q,CR,105);}else if(st===1){for(var i=0;i<beats;i++)addNote(ev,9,bs+i*Q,Q-5,HH,i%2===0?70:54);addNote(ev,9,bs,E-5,KI,100);addNote(ev,9,bs+E*2,E-5,KI,82);var sb=Math.floor(beats/2);addNote(ev,9,bs+sb*Q,E-5,SN,96);}else if(st===2){for(var b=0;b<beats;b++){var tt=bs+b*Q;addNote(ev,9,tt,E-5,RI,74);addNote(ev,9,tt+Math.floor(E*1.33),E-5,RI,57);if(b===0||b===Math.floor(beats/2))addNote(ev,9,tt,E,KI,97);if(b===1||b===beats-1)addNote(ev,9,tt,E,SN,90);}}else if(st===3){for(var i=0;i<beats*2;i++)addNote(ev,9,bs+i*E,E-5,HH,i%2===0?80:64);[0,1,2,3].filter(function(b){return b<beats;}).map(function(b){return Math.floor(b*beats/4);}).forEach(function(b){addNote(ev,9,bs+b*Q,E-5,KI,106);});[1,3].filter(function(b){return b<beats;}).forEach(function(b){addNote(ev,9,bs+b*Q,E-5,SN,100);});if(bar%4===0)addNote(ev,9,bs,Q,CR,108);}else if(st===4){[0,E,E*2,E*3+S2,E*5,E*6,E*7].filter(function(t){return t<barTicks;}).forEach(function(t,i){addNote(ev,9,bs+t,E-10,HH,72-i%2*16);});[{t:0,n:KI,v:92},{t:E*2,n:KI,v:76},{t:E*4,n:SN,v:88},{t:E*6,n:SN,v:82}].filter(function(x){return x.t<barTicks;}).forEach(function(x){addNote(ev,9,bs+x.t,E-5,x.n,x.v);});}else if(st===5){for(var b2=0;b2<beats;b2++){var tt2=bs+b2*Q;addNote(ev,9,tt2,E,RI,58);addNote(ev,9,tt2+E,Q-5,RI,44);if(b2===0)addNote(ev,9,tt2,E,KI,72);if(b2===Math.floor(beats/2))addNote(ev,9,tt2,E,SN,62);}}else if(st===6){
  // シティポップ: レイドバックグルーヴ、ハイハット8分+キック裏打ち
  for(var i6=0;i6<beats*2;i6++)addNote(ev,9,bs+i6*E,E-8,HH,i6%2===0?68:46);
  addNote(ev,9,bs,E-3,KI,96);if(beats>=4)addNote(ev,9,bs+Q+E,E-3,KI,78);
  addNote(ev,9,bs+Q,E-3,SN,90);if(beats>=4)addNote(ev,9,bs+Q*3,E-3,SN,86);
}else if(st===7){
  // アンセム: 4つ打ちキック+毎拍クラッシュ気味、力強いスネア
  for(var b7=0;b7<beats;b7++){addNote(ev,9,bs+b7*Q,Q-5,KI,112);if(b7%2===1)addNote(ev,9,bs+b7*Q,Q-5,SN,104);}
  for(var i7=0;i7<beats*2;i7++)addNote(ev,9,bs+i7*E,E-5,49,i7===0?100:i7%2===0?60:40);
  if(bar===0)addNote(ev,9,bs,Q,CR,110);
}else if(st===8){
  // Lo-Fi: スパースなキック/スネア+揺れたハイハット
  addNote(ev,9,bs,E,KI,80);if(beats>=4)addNote(ev,9,bs+Q*2+S2,E,KI,64);
  addNote(ev,9,bs+Q+E,E,SN,72);
  [0,E*1.5,E*3,E*4.5,E*6,E*7.5].filter(function(t){return t<barTicks;}).forEach(function(t,i){addNote(ev,9,bs+Math.round(t),S2,HH,56-i%2*10);});
}}return ev;}

function generate(ctx){
  return genDrums(ctx.bars, ctx.PPQ, ctx.st);
}

registerInstrument({
  id:'drm',
  name:'🥁 ドラム',
  pc:-1,
  channel:null,
  trackName:'Drums',
  styles:['ベーシック','ハーフタイム','シャッフル','ロック','ラテン','ブラシ','シティポップ','アンセム','Lo-Fi'],
  pcs:[-1,-1,-1,-1,-1,-1,-1,-1,-1],
  generate:generate
});
})();
