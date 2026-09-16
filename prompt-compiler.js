// ════════════════════════════════════════════════
// Phrase Architect — SUNO Style Prompt Compiler
// 入力: SONG JSON（collectSongState()の出力）のみ
// 内部変数(curMood, curCP等)には一切依存しない
// ════════════════════════════════════════════════

function _pickRange(ranges, value){
  if(value===undefined||value===null||!ranges)return null;
  for(var i=0;i<ranges.length;i++){
    var r=ranges[i];
    if(value>=r.min&&value<r.max)return r.suno;
  }
  // 端点(max境界)フォールバック
  var last=ranges[ranges.length-1];
  return last?last.suno:null;
}

function _dedupe(arr){
  var seen={};var out=[];
  arr.forEach(function(s){
    if(!s)return;
    var key=s.toLowerCase().trim();
    if(seen[key])return;
    seen[key]=true;out.push(s);
  });
  return out;
}

// 音符長重みから「密度」比率(0-1)を算出
// busy系(8分/16分/8分休符/16分休符)の重み合計 / 全体重み合計
function _computeNoteDensity(ndw){
  if(!ndw)return null;
  var n=ndw.notes||{},r=ndw.rests||{};
  var busy=(n.eighth||0)+(n.sixteenth||0)+(r.eighth||0)+(r.sixteenth||0);
  var total=(n.whole||0)+(n.half||0)+(n.quarter||0)+(n.eighth||0)+(n.sixteenth||0)+(n.dottedQuarter||0)+
             (r.whole||0)+(r.half||0)+(r.quarter||0)+(r.eighth||0)+(r.sixteenth||0);
  if(total<=0)return null;
  return busy/total;
}

function compileSunoStylePrompt(songJson){
  var D=window.PROMPT_DICTIONARY;
  if(!songJson||!D)return '';

  var basic=songJson.basic||{};
  var mood=songJson.mood||{};
  var chord=songJson.chordProgression||{};
  var phrase=songJson.phraseDesign||{};
  var structure=songJson.structure||{};
  var instruments=songJson.instruments||{};

  var sections=[]; // 各カテゴリの文断片を積み上げ、最後に結合

  // 1. Genre / Style（MOODプリセット）
  var moodDict=D.mood.presets[mood.preset];
  if(moodDict)sections.push(moodDict.suno);

  // 2. Overall Mood（スケールの色彩）
  var scaleDict=D.mood.scale[basic.scale];
  if(scaleDict)sections.push(scaleDict);

  // 3. Tempo / Rhythm
  var tempoFrag=[];
  if(basic.tempo)tempoFrag.push(basic.tempo+' BPM');
  if(basic.timeSignature&&basic.timeSignature!=='4/4')tempoFrag.push('in '+basic.timeSignature+' time');
  var density=_computeNoteDensity(mood.noteDurationWeights);
  var densityFrag=_pickRange(D.rhythm.density,density);
  if(densityFrag)tempoFrag.push(densityFrag);
  if(tempoFrag.length)sections.push(tempoFrag.join(', '));

  // 4. Melody / Motif
  var melFrags=[];
  var p=mood.params||{};
  melFrags.push(_pickRange(D.melody.leapProb,p.leapProb));
  melFrags.push(_pickRange(D.melody.ascendDescendBias,p.ascendDescendBias));
  melFrags.push(_pickRange(D.melody.pitchCenter,p.pitchCenter));
  var legacy=phrase.legacyCommonParams||{};
  melFrags.push(_pickRange(D.rhythm.repeatRate,legacy.repeatRate));
  melFrags.push(_pickRange(D.rhythm.variationRate,legacy.variationRate));
  var gm=phrase.globalMotif||{};
  if(gm.phraseLengthBars)melFrags.push(_pickRange(D.melody.phraseLength,gm.phraseLengthBars));
  melFrags=_dedupe(melFrags);
  if(melFrags.length)sections.push(melFrags.join(', '));

  // 5. Harmony
  var harmFrags=[];
  var cpDict=D.harmony.chordProgression[chord.commonPreset];
  if(cpDict)harmFrags.push(cpDict);
  var cdMean=p.chordToneDependency;
  var cdFrag=_pickRange(D.melody.chordToneDependency,cdMean);
  if(cdFrag)harmFrags.push(cdFrag);
  if(chord.partOverrides&&Object.keys(chord.partOverrides).length){
    harmFrags.push(D.harmony.customChordPresent);
  }
  harmFrags=_dedupe(harmFrags);
  if(harmFrags.length)sections.push(harmFrags.join(', '));

  // 6. Instrumentation
  var instFrags=[];
  var main=instruments.main||{};
  Object.keys(D.instrumentation.names).forEach(function(key){
    var inst=main[key];
    if(!inst||!inst.on)return;
    if(key==='gtr'){
      var basic2=D.instrumentation.gtrBasic[inst.basicPat]||D.instrumentation.gtrBasic[0];
      var art=D.instrumentation.gtrArt[inst.artPat]||'';
      instFrags.push([basic2,art].filter(Boolean).join(' with '));
    }else if(key==='bas'){
      instFrags.push(D.instrumentation.bassStyle[inst.st]||D.instrumentation.names.bas);
    }else if(key==='drm'){
      instFrags.push(D.instrumentation.drumStyle[inst.st]||D.instrumentation.names.drm);
    }else{
      instFrags.push(D.instrumentation.names[key]);
    }
  });
  instFrags=_dedupe(instFrags);
  if(instFrags.length)sections.push(instFrags.join(', '));

  // 7. Song Structure
  if(structure.parts&&structure.parts.length){
    var labels=structure.parts.map(function(s){return D.structure.partLabel[s.part]||s.part.toLowerCase();});
    labels=labels.filter(function(v,i,a){return a.indexOf(v)===i;}); // 出現順ユニーク
    if(labels.length)sections.push(labels.join('–')+' structure');
  }

  // 8. Dynamics / Development — endingのみ利用可能
  if(basic.ending&&D.structure.ending[basic.ending]){
    sections.push('ending with '+D.structure.ending[basic.ending]);
  }

  // 9. ★ v9.0 Vocal Character（MOOD_SYSTEM CharacterのsunoVocal語彙。数値解決とは独立の追加ステップ）
  var charFrags=[];
  var characters=mood.characters||[];
  characters.forEach(function(cid){
    var v=D.character&&D.character[cid];
    if(v)charFrags.push(v);
  });
  charFrags=_dedupe(charFrags);
  if(charFrags.length)sections.push(charFrags.join(', '));

  // 最終組み立て：重複を除去し、自然な1つのPromptにまとめる
  sections=_dedupe(sections);
  return sections.join('. ')+'.';
}
