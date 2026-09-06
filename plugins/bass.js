// ════════════════════════════════════════════════
// Phrase Architect — Bass Plugin
// 元 v8.0.5 の genBass をそのまま移植（アルゴリズム変更なし）
// generate(ctx): ctx={root,bars,PPQ,ch,st,part,...} -> [{t,tp,ch,n,v}, ...]
// ════════════════════════════════════════════════
(function(){
function genBass(root,bars,PPQ,ch,st,part){
  var ev=[],Q=PPQ,E=PPQ/2;
  var beats=TS_BEATS[curTS]||4,barTicks=beats*Q;
  // コードから安定音を取得するヘルパー
  function bassNote(chord,semis){var n=((chord[0]%12)+12)%12+semis;while(n<28)n+=12;while(n>52)n-=12;return n;}
  function getR(chord){return bassNote(chord,0);}
  function getThird(chord){var iv=(chord[1]!==undefined)?(((chord[1]-chord[0])%12)+12)%12:4;return bassNote(chord,iv);}
  function getFifth(chord){var iv=(chord[2]!==undefined)?(((chord[2]-chord[0])%12)+12)%12:7;return bassNote(chord,iv);}
  function getSeventh(chord){var iv=(chord[3]!==undefined)?(((chord[3]-chord[0])%12)+12)%12:10;return bassNote(chord,iv);}
  // 次の小節のルート（ウォーキング用）
  function getNextRoot(bar2){
    var nc=getChordForPart(part,bar2,root);
    return bassNote(nc,0);
  }
  // アプローチノート（次ルートの半音上か下）
  function approachNote(nr){var a=nr-1;while(a<28)a+=12;while(a>52)a-=12;return a;}

  for(var bar=0;bar<bars;bar++){
    var c=getChordForPart(part,bar,root);
    var r=getR(c),third=getThird(c),fifth=getFifth(c),seventh=getSeventh(c);
    var bs=bar*barTicks;

    if(st===0){
      // ★ ルート: 各拍頭にルート、3拍目に5th（コード完全追従）
      for(var b=0;b<beats;b++){
        var n0=(b===2||b===Math.floor(beats*0.5))?fifth:r;
        addNote(ev,ch,bs+b*Q,Q-20,n0,b===0?90:75);
      }
    }else if(st===1){
      // ★ ウォーキング: コードトーンを滑らかに繋ぐ（次コードのルートへ向かうアプローチ）
      var nextR=(bar+1<bars)?getNextRoot(bar+1):r;
      var walk=[r,third,fifth,approachNote(nextR)];
      // ビート数に合わせて調整
      for(var b=0;b<beats;b++){
        var wn=walk[b%walk.length];
        addNote(ev,ch,bs+b*Q,Q-15,Math.max(28,Math.min(52,wn)),b===0?88:78);
      }
    }else if(st===2){
      // ★ オクターブ: ルート→1オクターブ上を繰り返し
      var r2=r+12;while(r2>64)r2-=12;
      [{t:0,n:r},{t:E,n:r2},{t:barTicks/2,n:r},{t:barTicks/2+E,n:r2}].forEach(function(x){
        if(x.t>=barTicks)return;addNote(ev,ch,bs+x.t,E-15,x.n,90);
      });
    }else if(st===3){
      // ★ シンコペ: 1拍目ルート・3拍半にFifth・4拍裏にルートを食い込み
      var syncs=[{t:0,n:r,v:92},{t:E*3,n:fifth,v:80},{t:E*4,n:r,v:87},{t:E*7,n:third,v:75}];
      syncs.forEach(function(x){if(x.t>=barTicks)return;addNote(ev,ch,bs+x.t,E-10,x.n,x.v);});
    }else if(st===4){
      // ★ ペダル: ルートを8分連打（拍頭は強め）
      for(var i=0;i<beats*2;i++)addNote(ev,ch,bs+i*E,E-10,r,i%2===0?88:62);
    }else if(st===5){
      // ★ アルペジオ: ルート→3rd→5th→ルート+oct→5th→3rd→ルート→ルート-oct
      var rUp=r+12;while(rUp>64)rUp-=12;
      var rDn=r-12;while(rDn<24)rDn+=12;
      [r,third,fifth,rUp,fifth,third,r,rDn].forEach(function(n,i){
        if(i*E>=barTicks)return;addNote(ev,ch,bs+i*E,E-15,Math.max(24,Math.min(64,n)),82-i%3*5);
      });
    }
  }
  return ev;
}

function generate(ctx){
  return genBass(ctx.root, ctx.bars, ctx.PPQ, ctx.ch, ctx.st, ctx.part);
}

registerInstrument({
  id:'bas',
  name:'🎸 ベース',
  pc:32,
  channel:2,
  trackName:'Bass',
  styles:['ルート','ウォーキング','オクターブ','シンコペ','ペダル','アルペジオ'],
  pcs:[32,32,32,32,32,32],
  generate:generate
});
})();
