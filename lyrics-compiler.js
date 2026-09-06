// ════════════════════════════════════════════════
// Phrase Architect — SUNO Lyrics Prompt Compiler
// 入力: songJson（構造情報のみ利用）+ lyricsDna
// DOM非依存。歌詞本文は生成しない。歌詞生成のための指示文を組み立てる。
// ════════════════════════════════════════════════

function _lyricsDedupe(arr){
  var seen={};var out=[];
  arr.forEach(function(s){
    if(!s)return;var k=s.toLowerCase().trim();
    if(seen[k])return;seen[k]=true;out.push(s);
  });
  return out;
}

// structure.parts から歌詞構造ラベルの出現順ユニーク配列を作る
// (Style Prompt側のstructure.partLabelを再利用。重複定義しない)
function _buildLyricSectionSequence(songJson){
  var D1=window.PROMPT_DICTIONARY;
  var parts=(songJson&&songJson.structure&&songJson.structure.parts)||[];
  if(!parts.length||!D1)return [];
  return parts.map(function(s){
    return D1.structure.partLabel[s.part]||s.part.toLowerCase();
  });
}

function compileSunoLyricsPrompt(songJson, lyricsDna){
  var D=window.LYRICS_DICTIONARY;
  if(!D||!lyricsDna)return '';

  var lines=[];

  // 1. 導入指示 + Language
  var lang=lyricsDna.language||'';
  var opener='Write'+(lang?(' '+lang):'')+' lyrics';
  if(lyricsDna.theme)opener+=' about '+lyricsDna.theme+'.';
  else opener+='.';
  lines.push(opener);

  // 2. Perspective
  if(lyricsDna.perspective&&D.perspective[lyricsDna.perspective]){
    lines.push('Use '+D.perspective[lyricsDna.perspective]+'.');
  }

  // 3. Story / Narrative
  if(lyricsDna.story){
    lines.push('The story: '+lyricsDna.story+'.');
  }

  // 4. Emotional Arc
  var arc=(lyricsDna.emotionalArc||[]).filter(Boolean);
  if(arc.length){
    var arcWords=arc.map(function(id){return D.emotion[id]||id;});
    arcWords=_lyricsDedupe(arcWords);
    lines.push('The emotional arc should move from '+arcWords.join(', through ')+'.');
  }else if(songJson&&songJson.mood&&songJson.mood.preset&&D.moodToEmotion[songJson.mood.preset]){
    // ユーザーがArcを設定していない場合のみ、Music Moodから軽く橋渡し（勝手な創作はしない）
    var inferred=D.moodToEmotion[songJson.mood.preset];
    if(D.emotion[inferred])lines.push('The emotional tone should reflect '+D.emotion[inferred]+', consistent with the music\'s mood.');
  }

  // 5. Imagery
  var imagery=(lyricsDna.imagery||[]).filter(Boolean);
  if(imagery.length){
    lines.push('Use imagery such as '+_lyricsDedupe(imagery).join(', ')+'.');
  }

  // 6. Hook Concept
  if(lyricsDna.hookConcept){
    lines.push('The chorus hook should center on: '+lyricsDna.hookConcept+'.');
  }

  // 7. Style
  var styles=(lyricsDna.style||[]).filter(Boolean);
  if(styles.length){
    var styleWords=styles.map(function(id){return D.style[id]||id;});
    lines.push('Keep the language '+_lyricsDedupe(styleWords).join(' and ')+'.');
  }

  // 8. Structure（songJson.structureを再利用。ユーザーがLYRICS DNA側で独自指定していればそちらを優先）
  var seq=(lyricsDna.structure&&lyricsDna.structure.sequence&&lyricsDna.structure.sequence.length)
    ? lyricsDna.structure.sequence
    : _buildLyricSectionSequence(songJson);
  if(seq.length){
    var seqUnique=seq.filter(function(v,i,a){return a.indexOf(v)===i;});
    var structLines=seqUnique.map(function(label){
      var role=D.sectionRole[label];
      return role?(_capitalize(label)+': '+role):null;
    }).filter(Boolean);
    if(structLines.length){
      lines.push('Song structure: '+seq.join(' → ')+'.');
      lines.push(structLines.join(' '));
    }
  }

  return lines.join(' ');
}

function _capitalize(s){return s.charAt(0).toUpperCase()+s.slice(1);}
