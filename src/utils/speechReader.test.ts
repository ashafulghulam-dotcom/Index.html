import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import { DEFAULT_MODULES } from '../data/curriculumData';
import { buildModuleSpeechText } from './bimwinLogic';
import {
  buildOnlineTtsUrl,
  normalizeTextForSpeech,
  pickBestSpeechVoice,
  resolveOnlineTtsLangCode,
  resolveSpeechLangCode,
  splitSpeechChunks,
  SpeechVoiceLike,
} from './speechReader';

describe('Multilingual & Arabic Speech Reader Logic', () => {
  it('preserves Arabic diacritics while normalizing surah references and punctuation', () => {
    const raw = 'بَارَكَ اللَّهُ لَكَ — سورة الروم: ٢١ (السكينة والمودة).';
    const normalized = normalizeTextForSpeech(raw, 'ar');
    assert.ok(normalized.includes('بَارَكَ'), 'Arabic harakat should be preserved');
    assert.ok(!normalized.includes(':'), 'Colons should become natural pauses');
    assert.ok(!normalized.includes('('), 'Parentheses should be cleaned');
  });

  it('splits every module across all 4 languages into safe chunks <= 160 chars', () => {
    const langs = ['id', 'jv', 'en', 'ar'] as const;
    for (const mod of DEFAULT_MODULES) {
      for (const lang of langs) {
        const fullText = buildModuleSpeechText(mod, lang);
        const chunks = splitSpeechChunks(fullText, lang, 155);
        assert.ok(chunks.length >= 3, `Module ${mod.id} (${lang}) should produce multiple chunks`);
        for (const chunk of chunks) {
          assert.ok(chunk.trim().length > 0, 'Chunk must not be empty');
          assert.ok(
            chunk.length <= 160,
            `Chunk length ${chunk.length} exceeded limit in module ${mod.id} (${lang}): ${chunk}`
          );
        }
      }
    }
  });

  it('never assigns a non-Arabic voice to Arabic text so cloud Arabic fallback triggers', () => {
    const indoAndEnglishOnly: SpeechVoiceLike[] = [
      { name: 'Google Bahasa Indonesia', lang: 'id-ID', localService: false },
      { name: 'Google US English', lang: 'en-US', localService: false },
    ];
    assert.equal(pickBestSpeechVoice(indoAndEnglishOnly, 'ar'), null);
    assert.equal(pickBestSpeechVoice(indoAndEnglishOnly, 'id')?.lang, 'id-ID');
    assert.equal(pickBestSpeechVoice(indoAndEnglishOnly, 'jv')?.lang, 'id-ID');
    assert.equal(pickBestSpeechVoice(indoAndEnglishOnly, 'en')?.lang, 'en-US');
  });

  it('prioritizes authentic Arabic voices (ar-SA / ar-XA / ar-EG) when installed', () => {
    const mixedVoices: SpeechVoiceLike[] = [
      { name: 'Google Bahasa Indonesia', lang: 'id-ID' },
      { name: 'Microsoft Hoda - Arabic (Egypt)', lang: 'ar-EG' },
      { name: 'Google العربية', lang: 'ar-SA' },
    ];
    const picked = pickBestSpeechVoice(mixedVoices, 'ar');
    assert.equal(picked?.lang, 'ar-SA');
    assert.equal(picked?.name, 'Google العربية');

    const egyptOnly: SpeechVoiceLike[] = [
      { name: 'Google US English', lang: 'en-US' },
      { name: 'Microsoft Salma Online (Natural) - Arabic (Egypt)', lang: 'ar-EG' },
    ];
    assert.equal(pickBestSpeechVoice(egyptOnly, 'ar')?.lang, 'ar-EG');
  });

  it('builds valid primary and fallback online TTS URLs for Arabic and other languages', () => {
    assert.equal(resolveSpeechLangCode('ar'), 'ar-SA');
    assert.equal(resolveOnlineTtsLangCode('ar'), 'ar');
    const primary = buildOnlineTtsUrl('الوحدة الأولى: بناء الأسرة السكينة', 'ar', 0);
    const secondary = buildOnlineTtsUrl('الوحدة الأولى: بناء الأسرة السكينة', 'ar', 1);
    assert.ok(primary.startsWith('https://translate.googleapis.com/translate_tts?'));
    assert.ok(primary.includes('tl=ar'));
    assert.ok(secondary.startsWith('https://translate.google.com/translate_tts?'));
    assert.ok(secondary.includes('client=tw-ob'));
  });
});
