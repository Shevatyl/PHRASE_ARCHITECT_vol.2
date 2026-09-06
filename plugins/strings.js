// ════════════════════════════════════════════════
// Phrase Architect — Strings Plugin
// 元 v8.0.5 の genStrings をそのまま移植（アルゴリズム変更なし）
// ════════════════════════════════════════════════
(function(){
function genStrings(root,bars,PPQ,ch,st,part){var ev=[],Q=PPQ,E=PPQ/2;var beats=TS_BEATS[curTS]||4,barTicks=beats*Q;for(var bar=0;bar<bars;bar++){var c=getChordForPart(part,bar,root).map(function(n){while(n<52)n+=12;while(n>76)n-=12;return n;});var bs=bar*barTicks;if(st===0){c.forEach(function(n,i){addNote(ev,ch,bs+i*10,barTicks-10,n,55-i*4);});}else if(st===1){[0,E,barTicks/2,barTicks/2+E].filter(function(t){return t<barTicks;}).forEach(function(t){c.slice(0,2).forEach(function(n,i){addNote(ev,ch,bs+t+i*8,E-15,n,58-i*5);});});}else if(st===2){var top=c[c.length-1];[top,top-2,top+2,top-3,top+1,top-1,top,top+2].forEach(function(n,i){if(i*E>=barTicks)return;addNote(ev,ch,bs+i*E,E-12,Math.max(48,Math.min(84,n)),52);});}}return ev;}

function generate(ctx){
  return genStrings(ctx.root, ctx.bars, ctx.PPQ, ctx.ch, ctx.st, ctx.part);
}

registerInstrument({
  id:'str',
  name:'🎻 ストリングス',
  pc:48,
  channel:6,
  trackName:'Strings',
  styles:['パッド','ピチカート','カウンターメロ'],
  pcs:[48,48,48],
  generate:generate
});
})();
