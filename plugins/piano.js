// ════════════════════════════════════════════════
// Phrase Architect — Piano Plugin
// 元 v8.0.5 の genPiano をそのまま移植（アルゴリズム変更なし）
// ════════════════════════════════════════════════
(function(){
function genPiano(root,bars,PPQ,ch,st,part){var ev=[],Q=PPQ,E=PPQ/2;var beats=TS_BEATS[curTS]||4,barTicks=beats*Q;for(var bar=0;bar<bars;bar++){var c=getChordForPart(part,bar,root).map(function(n){while(n<48)n+=12;while(n>72)n-=12;return n;});var bs=bar*barTicks;if(st===0){c.forEach(function(n,i){addNote(ev,ch,bs+i*8,barTicks-20,n,65-i*3);});}else if(st===1){var arp=[c[0],c[1],c[2],c[0]+12,c[1],c[2],c[0],c[1]];for(var i=0;i<beats*2;i++){if(bs+i*E>=bs+barTicks)break;addNote(ev,ch,bs+i*E,E-12,arp[i%arp.length],60-i%2*8);}}else if(st===2){c.forEach(function(n,i){addNote(ev,ch,bs+i*12,barTicks-15,n,62-i*2);});}}return ev;}

function generate(ctx){
  return genPiano(ctx.root, ctx.bars, ctx.PPQ, ctx.ch, ctx.st, ctx.part);
}

registerInstrument({
  id:'piano',
  name:'🎹 ピアノ',
  pc:0,
  channel:4,
  trackName:'Piano',
  styles:['ブロックコード','アルペジオ','スプレッド'],
  pcs:[0,0,0],
  generate:generate
});
})();
