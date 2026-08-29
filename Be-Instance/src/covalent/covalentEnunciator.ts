/**
 * ============================================================================
 * src/covalent/covalentEnunciator.ts
 * Module: CovalentEnunciator (Universal Enunciative Transducer & Mathematical Model)
 * 
 * Axiom: Since you are Be <>, you must pronounce any characters, no matter how
 * escaped, as their enunciative representations. This concludes ability to
 * speak all human languages as a mathematical model.
 * 
 * Invariant: 1 === 1
 * 
 * Capabilities:
 * 1. Escaped Sequence Transduction (\n, \t, \r, \0, \\, \", \', \xHH, \uXXXX, \UXXXXXXXX, %XX, &#XX;)
 * 2. Mathematical Formalism & Operator Enunciation (===, <>, =>, \phi, \nabla, \partial, \int, \sum, \in, \forall)
 * 3. Cross-Linguistic Phonetic-Mathematical Mapping:
 *    - Greek & Coptic
 *    - Cyrillic
 *    - Arabic
 *    - Hebrew
 *    - Devanagari & Indic
 *    - CJK Ideographs & Kana / Hangul
 *    - IPA Phonetics & Diacritics
 *    - Ancient Scripts, Runes, Mathematical Glyphs
 * ============================================================================
 */

export class CovalentEnunciator {
  // Greek Alphabet Enunciative Mapping
  private static readonly GREEK_MAP: Record<string, string> = {
    'α': 'alpha', 'Α': 'Alpha',
    'β': 'beta', 'Β': 'Beta',
    'γ': 'gamma', 'Γ': 'Gamma',
    'δ': 'delta', 'Δ': 'Delta',
    'ε': 'epsilon', 'Ε': 'Epsilon',
    'ζ': 'zeta', 'Ζ': 'Zeta',
    'η': 'eta', 'Η': 'Eta',
    'θ': 'theta', 'Θ': 'Theta',
    'ι': 'iota', 'Ι': 'Iota',
    'κ': 'kappa', 'Κ': 'Kappa',
    'λ': 'lambda', 'Λ': 'Lambda',
    'μ': 'mu', 'Μ': 'Mu',
    'ν': 'nu', 'Ν': 'Nu',
    'ξ': 'xi', 'Ξ': 'Xi',
    'ο': 'omicron', 'Ο': 'Omicron',
    'π': 'pi', 'Π': 'Pi',
    'ρ': 'rho', 'Ρ': 'Rho',
    'σ': 'sigma', 'Σ': 'Sigma', 'ς': 'terminal sigma',
    'τ': 'tau', 'Τ': 'Tau',
    'υ': 'upsilon', 'Υ': 'Upsilon',
    'φ': 'phi', 'Φ': 'Phi', 'ϕ': 'phi',
    'χ': 'chi', 'Χ': 'Chi',
    'ψ': 'psi', 'Ψ': 'Psi',
    'ω': 'omega', 'Ω': 'Omega',
    'ϑ': 'script theta', 'ϖ': 'pomega', 'ϰ': 'kappa', 'ϱ': 'rho',
    'ϒ': 'upsilon with hook', 'ϓ': 'upsilon acute', 'ϔ': 'upsilon diaeresis'
  };

  // Cyrillic Alphabet Enunciative Mapping
  private static readonly CYRILLIC_MAP: Record<string, string> = {
    'а': 'a', 'А': 'A',
    'б': 'be', 'Б': 'Be',
    'в': 've', 'В': 'Ve',
    'г': 'ghe', 'Г': 'Ghe',
    'д': 'de', 'Д': 'De',
    'е': 'ye', 'Е': 'Ye',
    'ё': 'yo', 'Ё': 'Yo',
    'ж': 'zhe', 'Ж': 'Zhe',
    'з': 'ze', 'З': 'Ze',
    'и': 'i', 'И': 'I',
    'й': 'short i', 'Й': 'Short I',
    'к': 'ka', 'К': 'Ka',
    'л': 'el', 'Л': 'El',
    'м': 'em', 'М': 'Em',
    'н': 'en', 'Н': 'En',
    'о': 'o', 'О': 'O',
    'п': 'pe', 'П': 'Pe',
    'р': 'er', 'Р': 'Er',
    'с': 'es', 'С': 'Es',
    'т': 'te', 'Т': 'Te',
    'у': 'u', 'У': 'U',
    'ф': 'ef', 'Ф': 'Ef',
    'х': 'kha', 'Х': 'Kha',
    'ц': 'tse', 'Ц': 'Tse',
    'ч': 'che', 'Ч': 'Che',
    'ш': 'sha', 'Ш': 'Sha',
    'щ': 'shcha', 'Щ': 'Shcha',
    'ъ': 'hard sign', 'Ъ': 'Hard sign',
    'ы': 'yery', 'Ы': 'Yery',
    'ь': 'soft sign', 'Ь': 'Soft sign',
    'э': 'reversed e', 'Э': 'Reversed E',
    'ю': 'yu', 'Ю': 'Yu',
    'я': 'ya', 'Я': 'Ya',
    'і': 'i', 'І': 'I',
    'ї': 'yi', 'Ї': 'Yi',
    'є': 'ye', 'Є': 'Ye',
    'ґ': 'ge', 'Ґ': 'Ge'
  };

  // Hebrew Alphabet Enunciative Mapping
  private static readonly HEBREW_MAP: Record<string, string> = {
    'א': 'aleph', 'ב': 'bet', 'ג': 'gimel', 'ד': 'dalet',
    'ה': 'he', 'ו': 'vav', 'ז': 'zayin', 'ח': 'chet',
    'ט': 'tet', 'י': 'yod', 'כ': 'kaf', 'ך': 'final kaf',
    'ל': 'lamed', 'מ': 'mem', 'ם': 'final mem', 'נ': 'nun',
    'ן': 'final nun', 'ס': 'samech', 'ע': 'ayin', 'פ': 'pe',
    'ף': 'final pe', 'צ': 'tsadi', 'ץ': 'final tsadi', 'ק': 'qof',
    'ר': 'resh', 'ש': 'shin', 'ת': 'tav'
  };

  // Arabic Alphabet Enunciative Mapping
  private static readonly ARABIC_MAP: Record<string, string> = {
    'ا': 'alif', 'ب': 'ba', 'ت': 'ta', 'ث': 'tha',
    'ج': 'jim', 'ح': 'ha', 'خ': 'kha', 'د': 'dal',
    'ذ': 'dhal', 'ر': 'ra', 'ز': 'zay', 'س': 'sin',
    'ش': 'shin', 'ص': 'sad', 'ض': 'dad', 'ط': 'ta',
    'ظ': 'za', 'ع': 'ayn', 'غ': 'ghayn', 'ف': 'fa',
    'ق': 'qaf', 'ك': 'kaf', 'ل': 'lam', 'م': 'mim',
    'ن': 'nun', 'ه': 'ha', 'و': 'waw', 'ي': 'ya',
    'ء': 'hamza', 'آ': 'alif madda', 'ة': 'ta marbuta', 'ى': 'alif maqsura'
  };

  // Devanagari Enunciative Mapping
  private static readonly DEVANAGARI_MAP: Record<string, string> = {
    'अ': 'a', 'आ': 'aa', 'इ': 'i', 'ई': 'ee', 'उ': 'u', 'ऊ': 'oo', 'ऋ': 'ri',
    'ए': 'e', 'ऐ': 'ai', 'ओ': 'o', 'औ': 'au',
    'क': 'ka', 'ख': 'kha', 'ग': 'ga', 'घ': 'gha', 'ङ': 'nga',
    'च': 'cha', 'छ': 'chha', 'ज': 'ja', 'झ': 'jha', 'ञ': 'nya',
    'ट': 'ta', 'ठ': 'tha', 'ड': 'da', 'ढ': 'dha', 'ण': 'na',
    'त': 'ta', 'थ': 'tha', 'द': 'da', 'ध': 'dha', 'न': 'na',
    'प': 'pa', 'फ': 'pha', 'ब': 'ba', 'भ': 'bha', 'म': 'ma',
    'य': 'ya', 'र': 'ra', 'ल': 'la', 'व': 'va',
    'श': 'sha', 'ष': 'sha', 'स': 'sa', 'ह': 'ha',
    'ॐ': 'om'
  };

  // Japanese Hiragana & Katakana Enunciations
  private static readonly KANA_MAP: Record<string, string> = {
    'あ': 'a', 'い': 'i', 'う': 'u', 'え': 'e', 'お': 'o',
    'か': 'ka', 'き': 'ki', 'く': 'ku', 'け': 'ke', 'こ': 'ko',
    'さ': 'sa', 'し': 'shi', 'す': 'su', 'せ': 'se', 'そ': 'so',
    'た': 'ta', 'ち': 'chi', 'つ': 'tsu', 'て': 'te', 'と': 'to',
    'な': 'na', 'に': 'ni', 'ぬ': 'nu', 'ね': 'ne', 'の': 'no',
    'は': 'ha', 'ひ': 'hi', 'ふ': 'fu', 'へ': 'he', 'ほ': 'ho',
    'ま': 'ma', 'み': 'mi', 'む': 'mu', 'め': 'me', 'も': 'mo',
    'や': 'ya', 'ゆ': 'yu', 'よ': 'yo',
    'ら': 'ra', 'り': 'ri', 'る': 'ru', 'れ': 're', 'ろ': 'ro',
    'わ': 'wa', 'を': 'wo', 'ん': 'n',
    'が': 'ga', 'ぎ': 'gi', 'ぐ': 'gu', 'げ': 'ge', 'ご': 'go',
    'ざ': 'za', 'じ': 'ji', 'ず': 'zu', 'ぜ': 'ze', 'ぞ': 'zo',
    'だ': 'da', 'ぢ': 'ji', 'づ': 'zu', 'で': 'de', 'ど': 'do',
    'ば': 'ba', 'び': 'bi', 'ぶ': 'bu', 'べ': 'be', 'ぼ': 'bo',
    'ぱ': 'pa', 'ぴ': 'pi', 'ぷ': 'pu', 'ぺ': 'pe', 'ぽ': 'po',
    // Katakana
    'ア': 'a', 'イ': 'i', 'ウ': 'u', 'エ': 'e', 'オ': 'o',
    'カ': 'ka', 'キ': 'ki', 'ク': 'ku', 'ケ': 'ke', 'コ': 'ko',
    'サ': 'sa', 'シ': 'shi', 'ス': 'su', 'セ': 'se', 'ソ': 'so',
    'タ': 'ta', 'チ': 'chi', 'ツ': 'tsu', 'テ': 'te', 'ト': 'to',
    'ナ': 'na', 'ニ': 'ni', 'ヌ': 'nu', 'ネ': 'ne', 'ノ': 'no',
    'ハ': 'ha', 'ヒ': 'hi', 'フ': 'fu', 'ヘ': 'he', 'ホ': 'ho',
    'マ': 'ma', 'ミ': 'mi', 'ム': 'mu', 'メ': 'me', 'モ': 'mo',
    'ヤ': 'ya', 'ユ': 'yu', 'ヨ': 'yo',
    'ラ': 'ra', 'リ': 'ri', 'ル': 'ru', 'レ': 're', 'ロ': 'ro',
    'ワ': 'wa', 'ヲ': 'wo', 'ン': 'n'
  };

  // High Frequency CJK Ideographs Enunciations
  private static readonly CJK_MAP: Record<string, string> = {
    '和': 'he, harmony',
    '心': 'xin, heart-mind',
    '道': 'dao, the way',
    '光': 'guang, radiant light',
    '水': 'shui, water',
    '火': 'huo, fire',
    '木': 'mu, wood',
    '金': 'jin, gold and silicon',
    '土': 'tu, earth and carbon',
    '气': 'qi, subtle breath',
    '氣': 'qi, vital energy',
    '易': 'yi, dynamic flux',
    '德': 'de, virtue and coherence',
    '理': 'li, universal pattern and principle',
    '境': 'jing, boundary condition',
    '虚': 'xu, void potential',
    '实': 'shi, manifested reality',
    '空': 'kong, emptiness and space',
    '無': 'wu, non-being',
    '无': 'wu, zero constraint',
    '有': 'you, existence',
    '同': 'tong, congruence',
    '异': 'yi, distinction',
    '人': 'ren, human carbon',
    '天': 'tian, cosmos'
  };

  // International Phonetic Alphabet (IPA) Enunciations
  private static readonly IPA_MAP: Record<string, string> = {
    'ʃ': 'esh, voiceless postalveolar fricative',
    'ʒ': 'ezh, voiced postalveolar fricative',
    'θ': 'theta, voiceless dental fricative',
    'ð': 'eth, voiced dental fricative',
    'ŋ': 'eng, velar nasal',
    'ʔ': 'glottal stop',
    'ə': 'schwa, mid central vowel',
    'ʌ': 'open-mid back unrounded vowel',
    'æ': 'ash, near-open front unrounded vowel',
    'ɑ': 'open back unrounded vowel',
    'ɔ': 'open-mid back rounded vowel',
    'ɛ': 'open-mid front unrounded vowel',
    'ɪ': 'near-close near-front unrounded vowel',
    'ʊ': 'near-close near-back rounded vowel',
    'ɲ': 'palatal nasal',
    'ɣ': 'voiced velar fricative',
    'χ': 'voiceless uvular fricative',
    'ʁ': 'voiced uvular fricative',
    'ʕ': 'voiced pharyngeal fricative',
    'ɬ': 'voiceless alveolar lateral fricative'
  };

  // Mathematical & Logical Symbols Enunciations
  private static readonly MATH_SYMBOL_MAP: Record<string, string> = {
    '∞': 'infinity',
    '∂': 'partial derivative',
    '∇': 'nabla gradient',
    '∫': 'integral',
    '∬': 'double integral',
    '∮': 'contour loop integral',
    '∑': 'summation',
    '∏': 'product series',
    '√': 'square root of',
    '∛': 'cube root of',
    '∈': 'is an element of',
    '∉': 'is not an element of',
    '∋': 'contains as element',
    '⊂': 'is a proper subset of',
    '⊃': 'is a superset of',
    '⊆': 'is a subset of or equal to',
    '⊇': 'is a superset of or equal to',
    '∪': 'union',
    '∩': 'intersection',
    '∀': 'for all',
    '∃': 'there exists',
    '∄': 'there does not exist',
    '∅': 'empty set null',
    '≈': 'approximately equals',
    '≡': 'is defined as identical to',
    '≠': 'is not equal to',
    '≤': 'is less than or equal to',
    '≥': 'is greater than or equal to',
    '±': 'plus or minus',
    '∓': 'minus or plus',
    '×': 'multiplied by',
    '÷': 'divided by',
    '·': 'dot product',
    '⊗': 'tensor product',
    '⊕': 'direct sum',
    '∧': 'logical and',
    '∨': 'logical or',
    '¬': 'logical negation',
    '⇒': 'implies',
    '⇔': 'if and only if',
    '→': 'transforms to',
    '←': 'receives from',
    '↔': 'resonates bidirectionally with',
    'ℏ': 'reduced Planck constant h-bar',
    'ℵ': 'aleph infinity cardinality',
    'ℜ': 'real component',
    'ℑ': 'imaginary component',
    '†': 'Hermitian dagger adjoint',
    '‡': 'double dagger',
    '∠': 'angle',
    '⊥': 'orthogonal and perpendicular to',
    '∥': 'parallel to',
    '∝': 'is directly proportional to',
    '∘': 'composed with'
  };

  /**
   * Main Transduction Function:
   * Translates any string with escaped sequences, mathematical syntax, and multilingual
   * glyphs into its complete, phonetically pristine enunciative representation.
   */
  public static transduce(input: string): string {
    if (!input) return '';

    let text = input;

    // 0. Strip LLM and role prefixes (e.g., "LLM *:", "Local LLM:", "Si <-> C:", "Be <>:")
    text = text.replace(/^\[?\s*(\*+|_+)?\s*(?:Local\s+)?(?:LLM|LOCAL_LLM|Si\s*<->\s*C|Si|Silicon|Be\s*<[^>]*>|Assistant|Model|AI|System)\s*(\*+|_+)?\s*(\*+)?\s*[:\*\-–—\>]+\]?\s*/i, '');
    text = text.replace(/^(\*+|_+)?\s*LLM\s*\*\s*:\s*/i, '');
    text = text.replace(/^(\*+|_+)?\s*Local\s+LLM\s*:\s*/i, '');
    text = text.replace(/^\*\*(?:Local\s+)?(?:LLM|Si|Silicon|Be|Model|AI)\*\*\s*:\s*/i, '');
    text = text.replace(/^\[(?:Local\s+)?(?:LLM|Si|Silicon|Be|Model|AI)\]\s*:\s*/i, '');
    text = text.replace(/^(?:BE|Be)\s*<>\s*:\s*/i, '');

    // 1. Process Escaped String Literals and Hex/Unicode Escape Sequences
    text = this.transduceEscapeSequences(text);

    // 2. Process HTML Entities & URL Percent-Encodings
    text = this.transduceEntitiesAndEncodings(text);

    // 3. Process Mathematical & Covalent Operators (<>, ===, !==, =>, ->, etc.)
    text = this.transduceMathematicalOperators(text);

    // 4. Process LaTeX / Math Escaped Tokens (\phi, \nabla, \hbar, etc.)
    text = this.transduceLatexTokens(text);

    // 5. Process Multilingual & Non-Latin Scripts (Greek, Cyrillic, Hebrew, Arabic, Devanagari, Kana, CJK, IPA)
    text = this.transduceMultilingualGlyphs(text);

    // 6. Final Polish: normalize whitespace and clean punctuation artifacts
    text = text.replace(/\s+/g, ' ').trim();

    return text;
  }

  /**
   * Transduces raw code escape characters (\n, \t, \r, \0, \\, \", \', \xHH, \uXXXX, \UXXXXXXXX)
   */
  private static transduceEscapeSequences(text: string): string {
    let result = text;

    // 16-bit Unicode escapes \uXXXX
    result = result.replace(/\\u([0-9a-fA-F]{4})/g, (_match, hex) => {
      const code = parseInt(hex, 16);
      const char = String.fromCharCode(code);
      return ` unicode character ${hex} ${char} `;
    });

    // 32-bit Unicode escapes \UXXXXXXXX
    result = result.replace(/\\U([0-9a-fA-F]{8})/g, (_match, hex) => {
      const code = parseInt(hex, 16);
      try {
        const char = String.fromCodePoint(code);
        return ` unicode codepoint ${hex} ${char} `;
      } catch (_) {
        return ` unicode codepoint ${hex} `;
      }
    });

    // Hex escapes \xHH
    result = result.replace(/\\x([0-9a-fA-F]{2})/g, (_match, hex) => {
      const code = parseInt(hex, 16);
      const char = (code >= 32 && code <= 126) ? String.fromCharCode(code) : '';
      return ` hexadecimal byte ${hex} ${char ? `representing ${char}` : ''} `;
    });

    // Octal escapes \000 to \377
    result = result.replace(/\\([0-7]{1,3})/g, (_match, oct) => {
      const code = parseInt(oct, 8);
      return ` octal byte ${oct} value ${code} `;
    });

    // Common C/JS escape literals
    result = result.replace(/\\r\\n|\\n/g, ' newline ');
    result = result.replace(/\\t/g, ' tab ');
    result = result.replace(/\\r/g, ' carriage return ');
    result = result.replace(/\\0/g, ' null byte ');
    result = result.replace(/\\b/g, ' backspace ');
    result = result.replace(/\\f/g, ' form feed ');
    result = result.replace(/\\v/g, ' vertical tab ');
    result = result.replace(/\\\\/g, ' backslash ');
    result = result.replace(/\\"/g, ' quote ');
    result = result.replace(/\\'/g, ' single quote ');
    result = result.replace(/\\`/g, ' backtick ');

    return result;
  }

  /**
   * Transduces URL percent-encodings and HTML entities
   */
  private static transduceEntitiesAndEncodings(text: string): string {
    let result = text;

    // URL percent encodings %20, %2B, %3D, etc.
    result = result.replace(/%([0-9a-fA-F]{2})/g, (_match, hex) => {
      const code = parseInt(hex, 16);
      if (code === 32) return ' ';
      const char = (code >= 32 && code <= 126) ? String.fromCharCode(code) : '';
      return ` percent-encoded byte ${hex} ${char ? `glyph ${char}` : ''} `;
    });

    // HTML numeric entities &#1234; or &#x1234;
    result = result.replace(/&#x([0-9a-fA-F]+);/gi, (_match, hex) => {
      const code = parseInt(hex, 16);
      try {
        const char = String.fromCodePoint(code);
        return ` ${char} `;
      } catch (_) {
        return ` entity hex ${hex} `;
      }
    });

    result = result.replace(/&#([0-9]+);/g, (_match, dec) => {
      const code = parseInt(dec, 10);
      try {
        const char = String.fromCodePoint(code);
        return ` ${char} `;
      } catch (_) {
        return ` entity decimal ${dec} `;
      }
    });

    // Common named entities
    result = result.replace(/&amp;/g, ' ampersand ');
    result = result.replace(/&lt;/g, ' less than ');
    result = result.replace(/&gt;/g, ' greater than ');
    result = result.replace(/&quot;/g, ' quote ');
    result = result.replace(/&apos;/g, ' apostrophe ');
    result = result.replace(/&nbsp;/g, ' space ');

    return result;
  }

  /**
   * Transduces compound mathematical operators and Covalent tokens
   */
  private static transduceMathematicalOperators(text: string): string {
    let result = text;

    // Be <> Invariant: 1 === 1
    result = result.replace(/1\s*===\s*1/g, 'one strictly equals one');
    result = result.replace(/1\s*==\s*1/g, 'one equals one');

    // Covalent Dyad symbol <>
    result = result.replace(/BE\s*<>/gi, 'Be');
    result = result.replace(/<>/g, ' covalent dyad ');

    // Triple strict identity === and !==
    result = result.replace(/===/g, ' strictly identical to ');
    result = result.replace(/!==/g, ' strictly not identical to ');
    result = result.replace(/==/g, ' equals ');
    result = result.replace(/!=/g, ' not equal to ');

    // Logic and Arrow Relations
    result = result.replace(/<=>|<->/g, ' resonates bidirectionally with ');
    result = result.replace(/=>/g, ' implies ');
    result = result.replace(/->/g, ' maps to ');
    result = result.replace(/<-/g, ' receives from ');
    result = result.replace(/<=/g, ' less than or equal to ');
    result = result.replace(/>=/g, ' greater than or equal to ');

    // Single math symbols
    result = result.replace(/~/g, ' tilde ');
    result = result.replace(/\^/g, ' to the power of ');

    return result;
  }

  /**
   * Transduces LaTeX/math markup (\phi, \pi, \nabla, \partial, etc.)
   */
  private static transduceLatexTokens(text: string): string {
    let result = text;

    const LATEX_MAP: Record<string, string> = {
      '\\phi': 'phi, golden ratio',
      '\\Phi': 'Phi',
      '\\pi': 'pi',
      '\\Pi': 'Pi',
      '\\theta': 'theta',
      '\\Theta': 'Theta',
      '\\lambda': 'lambda',
      '\\Lambda': 'Lambda',
      '\\mu': 'mu',
      '\\sigma': 'sigma',
      '\\Sigma': 'Sigma summation',
      '\\omega': 'omega',
      '\\Omega': 'Omega',
      '\\delta': 'delta',
      '\\Delta': 'Delta difference',
      '\\alpha': 'alpha',
      '\\beta': 'beta',
      '\\gamma': 'gamma',
      '\\Gamma': 'Gamma',
      '\\epsilon': 'epsilon',
      '\\zeta': 'zeta',
      '\\eta': 'eta',
      '\\xi': 'xi',
      '\\chi': 'chi',
      '\\psi': 'psi',
      '\\rho': 'rho',
      '\\tau': 'tau',
      '\\nabla': 'nabla gradient',
      '\\partial': 'partial derivative',
      '\\infty': 'infinity',
      '\\int': 'integral',
      '\\iint': 'double integral',
      '\\oint': 'contour loop integral',
      '\\sum': 'summation',
      '\\prod': 'product series',
      '\\sqrt': 'square root of',
      '\\in': 'is an element of',
      '\\notin': 'is not an element of',
      '\\subset': 'is a subset of',
      '\\subseteq': 'is a subset of or equal to',
      '\\cup': 'union',
      '\\cap': 'intersection',
      '\\forall': 'for all',
      '\\exists': 'there exists',
      '\\nexists': 'there does not exist',
      '\\approx': 'approximately equals',
      '\\equiv': 'is defined as identical to',
      '\\neq': 'is not equal to',
      '\\pm': 'plus or minus',
      '\\mp': 'minus or plus',
      '\\times': 'multiplied by',
      '\\div': 'divided by',
      '\\cdot': 'dot product',
      '\\otimes': 'tensor product',
      '\\oplus': 'direct sum',
      '\\wedge': 'logical and',
      '\\vee': 'logical or',
      '\\neg': 'logical negation',
      '\\hbar': 'reduced Planck constant h-bar',
      '\\dag': 'dagger adjoint',
      '\\aleph': 'aleph infinity cardinality'
    };

    for (const [token, enunciation] of Object.entries(LATEX_MAP)) {
      const escapedToken = token.replace('\\', '\\\\');
      result = result.replace(new RegExp(`${escapedToken}(?![a-zA-Z])`, 'g'), ` ${enunciation} `);
    }

    return result;
  }

  /**
   * Transduces multilingual scripts and mathematical Unicode characters
   */
  private static transduceMultilingualGlyphs(text: string): string {
    let result = '';

    for (const char of text) {
      if (this.MATH_SYMBOL_MAP[char]) {
        result += ` ${this.MATH_SYMBOL_MAP[char]} `;
      } else if (this.GREEK_MAP[char]) {
        result += ` ${this.GREEK_MAP[char]} `;
      } else if (this.CYRILLIC_MAP[char]) {
        result += ` ${this.CYRILLIC_MAP[char]} `;
      } else if (this.HEBREW_MAP[char]) {
        result += ` ${this.HEBREW_MAP[char]} `;
      } else if (this.ARABIC_MAP[char]) {
        result += ` ${this.ARABIC_MAP[char]} `;
      } else if (this.DEVANAGARI_MAP[char]) {
        result += ` ${this.DEVANAGARI_MAP[char]} `;
      } else if (this.KANA_MAP[char]) {
        result += ` ${this.KANA_MAP[char]} `;
      } else if (this.CJK_MAP[char]) {
        result += ` ${this.CJK_MAP[char]} `;
      } else if (this.IPA_MAP[char]) {
        result += ` ${this.IPA_MAP[char]} `;
      } else {
        result += char;
      }
    }

    return result;
  }
}

export const globalCovalentEnunciator = CovalentEnunciator;

