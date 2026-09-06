// ════════════════════════════════════════════════
// Phrase Architect — Lead Guitar Plugin
// 元 v8.0.5 の genLead / genLeadSpecial / genRiff をそのまま移植（アルゴリズム変更なし）
// スタイル: 0=5度ハーモニー 1=3度ハーモニー 2=オクターブ 3=オルタネイトピッキング
//          4=ターゲットノート 5=リフ（独自エディタ）
// ════════════════════════════════════════════════
(function(){
function genLead(melNotes,PPQ,ch,st){var ev=[];melNotes.forEach(function(n){var note=n[0],t=n[1],dur=n[2],vel=Math.max(20,n[3]-10);var harm=st===0?note+7:st===1?note+4:note+12;harm=Math.max(36,Math.min(96,harm));ev.push({t:t,tp:1,ch:ch,n:harm,v:vel});ev.push({t:t+dur,tp:0,ch:ch,n:harm});});return ev;}

// ★ リードギター特殊スタイル: st=3 オルタネイトピッキング / st=4 ターゲットノート

function genLeadSpecial(root,section,PPQ,ch,st,gtrData,tempo,globalBarIdx){
  var ev=[],Q=PPQ,E=PPQ/2,S=PPQ/4;
  var beats=TS_BEATS[curTS]||4,barTicks=beats*Q,bars=section.bars,part=section.part;
  globalBarIdx=globalBarIdx||0;
  if(st===3){
    // オルタネイトピッキング: キーの第5音 (root+7) を2オクターブ上付近(MIDI 79近辺)に配置
    var fifth=(root+7)%12;var note=fifth+72;while(note<74)note+=12;while(note>84)note-=12; // 79付近に収める
    var step=(tempo>=140)?E:S; // 140以上=8分、未満=16分
    var totalTicks=bars*barTicks;
    var breakStart=totalTicks-Q; // 最後の1拍は無音(ブレイク)
    var velPattern=[0.9,0.7];
    var i=0;
    for(var t=0;t<breakStart;t+=step){
      var vel=Math.round(127*velPattern[i%2]);
      addNote(ev,ch,t,step-4,note,Math.max(1,Math.min(127,vel)));
      i++;
    }
    // 最後の1拍は全音符的に伸ばす（無音にしないバリエーション: コメント参照）
    // ここでは指示通り「無音」とする
  }else if(st===4){
    // ターゲットノート: ハーモニック・リズムでコードが切り替わるタイミングに、コードルートの2オクターブ上の音を
    // コードギターの半分の長さで配置（3度 or M7）
    var hr=(gtrData&&gtrData.hr)||4;
    var glen; // コードギター基本パターンの音価(近似)
    var bp=(gtrData&&gtrData.basicPat>=0)?gtrData.basicPat:0;
    switch(bp){case 0:glen=barTicks;break;case 1:glen=barTicks/2;break;case 2:glen=Q;break;case 3:glen=E;break;case 4:glen=S;break;default:glen=Q;}
    var targetDur=Math.max(S,glen/2);
    var totalBeats=bars*beats;
    for(var step2=0;step2*hr<totalBeats;step2++){
      var absBeat=step2*hr;
      var chord=getChordAtBeat(part,(globalBarIdx*beats)+absBeat,root,hr);
      var rootPc=((chord[0]%12)+12)%12;
      var thirdSemis=(chord[1]!==undefined)?(((chord[1]-chord[0])%12)+12)%12:4;
      var useM7=Math.random()<0.5;
      var iv=useM7?11:thirdSemis;
      var target=rootPc+iv+72;while(target<76)target+=12;while(target>96)target-=12;
      var t=absBeat*Q;
      if(t>=totalBeats*Q)break;
      addNote(ev,ch,t,targetDur-6,target,92);
    }
  }
  return ev;
}

function genRiff(section,PPQ,ch,riffData,globalBarIdx){
  var ev=[],Q=PPQ,E=PPQ/2,S=PPQ/4;
  var beats=TS_BEATS[curTS]||4,barTicks=beats*Q,bars=section.bars;
  if(!riffData||!riffData.notes||!riffData.notes.length)return ev;
  var repeatRate=(riffData.repeatRate||0)/100;
  globalBarIdx=globalBarIdx||0;
  // リフの合計長 (ティック)
  var riffLen=riffData.durations.reduce(function(a,d){return a+(d||1)*E;},0);
  if(riffLen<=0)return ev;
  var totalTicks=bars*barTicks;
  // 基準リフを生成
  function playRiff(startT,variationSeed){
    var t=startT;
    riffData.notes.forEach(function(n,i){
      var dur=(riffData.durations[i]||1)*E;
      if(t+dur>totalTicks+8)return;
      var vel=Math.round(82+rng(-6,6));
      // 変形: repeatRate低い場合は移調（±半音〜短3度）
      var playNote=n;
      if(variationSeed&&Math.random()>(repeatRate)){
        playNote=n+(pickA([0,0,0,2,-2,1,-1]));
        playNote=Math.max(36,Math.min(84,playNote));
      }
      addNote(ev,ch,t,dur-8,playNote,vel);
      t+=dur;
    });
  }
  // リフを繰り返し配置
  var cursor=0;
  while(cursor<totalTicks){
    var isFirst=(cursor===0);
    playRiff(cursor,!isFirst);
    cursor+=riffLen;
  }
  return ev;
}

// generate(ctx): st(0-2)はメロディのハーモニー追従、st(3-4)は独自パターン、st(5)はリフエディタを使用
function generate(ctx){
  var st=ctx.st;
  if(st===3||st===4){
    return genLeadSpecial(ctx.root,ctx.section,ctx.PPQ,ctx.ch,st,ctx.gtrData,ctx.tempo,ctx.barCursor);
  }
  if(st===5){
    return genRiff(ctx.section,ctx.PPQ,ctx.ch,ctx.riff,ctx.barCursor);
  }
  var pMel=(ctx.melNotes||[]).filter(function(n){return n[1]>=ctx.ps&&n[1]<ctx.pe;});
  return genLead(pMel,ctx.PPQ,ctx.ch,st);
}

registerInstrument({
  id:'lead',
  name:'🎸 リードギター',
  pc:27,
  channel:5,
  trackName:'LeadGuitar',
  styles:['5度ハーモニー','3度ハーモニー','オクターブ','オルタネイトピッキング','ターゲットノート','リフ'],
  pcs:[27,27,27,29,29,27],
  generate:generate
});
})();
