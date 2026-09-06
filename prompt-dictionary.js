// ════════════════════════════════════════════════
// Phrase Architect — SUNO Prompt Translation Dictionary
// SONG JSON の値 → 音楽的Semantic表現 → SUNO向け英語表現
// このファイルは「辞書」のみを持つ。文章組み立てロジックは持たない。
// ════════════════════════════════════════════════
window.PROMPT_DICTIONARY = {

  // ──────────────────────────────
  // MOOD: プリセットごとのジャンル・感情語彙
  // ──────────────────────────────
  mood: {
    presets: {
      folk:      { genre:'acoustic folk',        suno:'warm acoustic folk with gentle, organic feel' },
      pop:       { genre:'J-pop',                 suno:'bright, catchy J-pop' },
      jazz:      { genre:'jazz-influenced pop',    suno:'sophisticated jazz-tinged harmony' },
      epic:      { genre:'cinematic epic',         suno:'grand, sweeping cinematic epic' },
      sad:       { genre:'melancholic ballad',     suno:'introspective, melancholic ballad' },
      happy:     { genre:'upbeat pop',             suno:'joyful, sunny upbeat pop' },
      cinematic: { genre:'cinematic score',        suno:'cinematic, film-score atmosphere' },
      lofi:      { genre:'lo-fi chill',            suno:'relaxed lo-fi chill' },
      dark:      { genre:'dark atmospheric',       suno:'tense, dark atmospheric mood' },
      romantic:  { genre:'romantic ballad',        suno:'sweet, tender romantic ballad' },
      tense:     { genre:'tense dramatic',         suno:'suspenseful, tense dramatic energy' },
      playful:   { genre:'playful upbeat',         suno:'light, playful, energetic feel' }
    },
    // スケールが与える色彩感
    scale: {
      major:              'bright, open major tonality',
      natural_minor:      'melancholic natural minor tonality',
      harmonic_minor:     'dramatic, exotic harmonic minor tonality',
      pentatonic:         'simple, folk-like pentatonic melody',
      blues:              'bluesy, soulful coloring',
      dorian:              'modal dorian character, subtly wistful',
      mixolydian:         'mixolydian character, rootsy and bright',
      lydian:             'lydian brightness, dreamlike and floating',
      phrygian:           'phrygian tension, exotic and dark',
      locrian:            'locrian instability, unresolved tension'
    }
  },

  // ──────────────────────────────
  // MELODY: 旋律の性格（0-1レンジ値）
  // ──────────────────────────────
  melody: {
    leapProb: [
      { min:0.0, max:0.2, suno:'smooth, mostly stepwise melodic motion' },
      { min:0.2, max:0.4, suno:'gently flowing melody with occasional leaps' },
      { min:0.4, max:0.6, suno:'balanced melody mixing steps and leaps' },
      { min:0.6, max:0.8, suno:'expressive, wide-ranging melodic leaps' },
      { min:0.8, max:1.01,suno:'bold, angular melodic leaps' }
    ],
    ascendDescendBias: [
      { min:-1.0, max:-0.5, suno:'melodic phrases that tend to fall and settle downward' },
      { min:-0.5, max:-0.15,suno:'gently descending melodic contour' },
      { min:-0.15,max:0.15, suno:'balanced melodic contour' },
      { min:0.15, max:0.5,  suno:'gently rising, uplifting melodic contour' },
      { min:0.5,  max:1.01, suno:'soaring, ascending melodic lines' }
    ],
    pitchCenter: [
      { min:0.0, max:0.3, suno:'warm, low-register melody' },
      { min:0.3, max:0.6, suno:'mid-range, natural vocal register' },
      { min:0.6, max:1.01,suno:'bright, high-register melody' }
    ],
    chordToneDependency: [
      { min:0.0, max:0.35, suno:'modal, scale-driven melodic freedom' },
      { min:0.35,max:0.65, suno:'melody loosely anchored to the harmony' },
      { min:0.65,max:1.01, suno:'melody tightly locked to the chord tones' }
    ],
    phraseLength: [
      { min:1, max:1,  suno:'short, punchy one-bar melodic phrases' },
      { min:2, max:2,  suno:'compact, memorable two-bar phrases' },
      { min:3, max:3,  suno:'moderately extended melodic phrases' },
      { min:4, max:99, suno:'long, flowing melodic phrases' }
    ]
  },

  // ──────────────────────────────
  // RHYTHM / REPETITION
  // ──────────────────────────────
  rhythm: {
    repeatRate: [
      { min:0.0, max:0.2, suno:'constantly evolving melodic ideas' },
      { min:0.2, max:0.4, suno:'varied melodic phrasing' },
      { min:0.4, max:0.6, suno:'recurring melodic ideas' },
      { min:0.6, max:0.8, suno:'strong recurring melodic motifs' },
      { min:0.8, max:1.01,suno:'highly memorable and repetitive melodic motifs' }
    ],
    variationRate: [
      { min:0.0, max:0.2, suno:'phrases repeated almost exactly' },
      { min:0.2, max:0.4, suno:'subtle melodic variation between repeats' },
      { min:0.4, max:0.6, suno:'noticeable melodic variation and embellishment' },
      { min:0.6, max:0.8, suno:'inventive, evolving melodic variation' },
      { min:0.8, max:1.01,suno:'highly improvisatory, ever-changing melodic variation' }
    ],
    // 音符長の重みから算出した「密度」比率 (0-1) を変換
    density: [
      { min:0.0, max:0.25, suno:'sparse, spacious rhythmic feel' },
      { min:0.25,max:0.5,  suno:'relaxed, flowing rhythmic feel' },
      { min:0.5, max:0.75, suno:'moderately busy, driving rhythmic feel' },
      { min:0.75,max:1.01, suno:'busy, energetic, fast-moving rhythmic feel' }
    ]
  },

  // ──────────────────────────────
  // HARMONY
  // ──────────────────────────────
  harmony: {
    chordProgression: {
      major:      'simple diatonic pop progression',
      p1564:      'classic anthemic I-V-vi-IV pop progression',
      p4536:      'emotional, bittersweet pop-ballad progression',
      p251:       'jazz ii-V-I harmony',
      p6451:      'melancholic vi-IV-V-I progression',
      p1541:      'driving, hymn-like progression',
      p50s:       'nostalgic 1950s doo-wop progression',
      pAxis:      'cinematic axis progression with emotional lift',
      p2516:      'smooth jazz-pop ii-V-I-vi turnaround',
      pFlamenco:  'flamenco-tinged minor progression',
      pBlues:     'classic blues progression',
      pModal:     'modal, vamp-like harmony',
      p1625:      'warm, circular I-vi-ii-V progression',
      pMinLoop:   'hypnotic minor-key loop progression',
      pJTTOU:     'bittersweet, nostalgic Japanese pop progression'
    },
    customChordPresent: 'custom harmonic variations across different song sections'
  },

  // ──────────────────────────────
  // STRUCTURE
  // ──────────────────────────────
  structure: {
    partLabel: {
      INTRO:'intro', A:'verse', PRE:'pre-chorus', B:'second verse',
      CHORUS:'chorus', INTER:'instrumental interlude', BRIDGE:'bridge', OUTRO:'outro'
    },
    ending: {
      fade:'fading outro',
      res:'a resolved, cadential ending',
      hold:'a sustained, held final chord'
    }
  },

  // ──────────────────────────────
  // INSTRUMENTATION
  // ──────────────────────────────
  instrumentation: {
    names: {
      mel:'lead vocal melody', gtr:'strummed guitar', bas:'bass',
      drm:'drums', lead:'lead guitar', piano:'piano', str:'strings'
    },
    gtrBasic: {
      0:'sustained whole-note strums', 1:'half-note strumming pulse',
      2:'steady quarter-note strumming', 3:'driving eighth-note strumming',
      4:'busy sixteenth-note strumming'
    },
    gtrArt: {
      0:'', 1:'palm-muted guitar tone', 2:'syncopated offbeat guitar accents',
      3:'muted, syncopated cutting guitar', 4:'arpeggiated guitar picking'
    },
    bassStyle: {
      0:'steady root-note bass', 1:'walking bassline', 2:'octave-jumping bass',
      3:'syncopated bass groove', 4:'pulsing pedal-tone bass', 5:'melodic arpeggiated bass'
    },
    drumStyle: {
      0:'standard pop/rock drum groove', 1:'half-time drum groove', 2:'shuffle drum groove',
      3:'driving rock drum groove', 4:'latin-influenced drum groove', 5:'brushed, soft drum groove',
      6:'laid-back city-pop drum groove', 7:'anthemic four-on-the-floor drums', 8:'sparse lo-fi drum groove'
    }
  }
};
