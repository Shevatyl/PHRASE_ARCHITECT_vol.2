// ════════════════════════════════════════════════
// Phrase Architect — SUNO Lyrics Translation Dictionary
// LYRICS DNA の値 → SUNO Lyrics Prompt向け英語表現
// Style Prompt用のPROMPT_DICTIONARYとは独立させる。
// ════════════════════════════════════════════════
window.LYRICS_DICTIONARY = {

  // ──────────────────────────────
  // Emotional Arc: 感情の起点/経過語彙（自由選択タグ）
  // ──────────────────────────────
  emotion: {
    sad:'melancholic, emotionally vulnerable',
    lonely:'isolated, quietly aching',
    happy:'joyful, light-hearted',
    excited:'energetic, exhilarated',
    hopeful:'gradually hopeful',
    nostalgic:'wistfully nostalgic',
    longing:'yearning, wistful',
    peaceful:'calm, at ease',
    angry:'defiant, frustrated',
    love:'tender, affectionate',
    acceptance:'quietly accepting',
    freedom:'liberated, unburdened',
    connection:'warmly connected',
    euphoria:'overwhelmed with joy'
  },

  // ──────────────────────────────
  // Perspective
  // ──────────────────────────────
  perspective: {
    first:'a first-person perspective',
    second:'a second-person perspective, speaking directly to "you"',
    third:'a third-person narrative perspective',
    neutral:'a neutral, observational perspective'
  },

  // ──────────────────────────────
  // Lyric Style
  // ──────────────────────────────
  style: {
    poetic:'poetic and metaphorical language',
    conversational:'natural, conversational language',
    cinematic:'vivid, cinematic imagery',
    simple:'simple, direct language',
    abstract:'abstract, impressionistic language',
    restrained:'emotionally restrained, understated language',
    vivid:'vivid, sensory-rich language',
    metaphorical:'rich metaphorical language'
  },

  // ──────────────────────────────
  // Structure: セクションごとの役割（歌詞構造テンプレート）
  // 音楽STRUCTUREのpartLabelと対応させる
  // ──────────────────────────────
  sectionRole: {
    intro:'sets the atmosphere, largely instrumental or wordless',
    verse:'scene-setting and narrative detail, building the story',
    'pre-chorus':'rising emotional tension leading into the chorus',
    'second verse':'develops the story further, deepening the emotion',
    chorus:'the main emotional hook — the central message of the song',
    'instrumental interlude':'a wordless breathing space',
    bridge:'a moment of realization or emotional shift',
    outro:'closing resolution or lingering feeling'
  },

  // MOODプリセットからEmotional Arcのデフォルト推定に使う軽い橋渡し
  moodToEmotion: {
    folk:'nostalgic', pop:'happy', jazz:'peaceful', epic:'hopeful',
    sad:'sad', happy:'happy', cinematic:'hopeful', lofi:'peaceful',
    dark:'lonely', romantic:'love', tense:'angry', playful:'excited'
  }
};
