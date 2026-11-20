import test from 'node:test';
import assert from 'node:assert/strict';
import {
  detectInstallPlatform,
  getInstallSteps,
  isEmbeddedIframe,
} from './pwaHelpers';

test('detectInstallPlatform identifies Android, iOS, and Desktop user agents', () => {
  assert.equal(
    detectInstallPlatform('Mozilla/5.0 (Linux; Android 14; Pixel 8) AppleWebKit/537.36 Chrome/126.0'),
    'android'
  );
  assert.equal(
    detectInstallPlatform('Mozilla/5.0 (iPhone; CPU iPhone OS 17_5 like Mac OS X) Safari/604.1'),
    'ios'
  );
  assert.equal(
    detectInstallPlatform('Mozilla/5.0 (iPad; CPU OS 17_0 like Mac OS X) AppleWebKit/605.1.15'),
    'ios'
  );
  assert.equal(
    detectInstallPlatform('Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/126.0.0.0'),
    'desktop'
  );
});

test('getInstallSteps returns 3 clear actionable steps for every platform', () => {
  for (const platform of ['android', 'ios', 'desktop'] as const) {
    const steps = getInstallSteps(platform);
    assert.equal(steps.length, 3);
    for (const step of steps) {
      assert.ok(step.title.length > 5);
      assert.ok(step.detail.length > 15);
    }
  }
});

test('isEmbeddedIframe detects standalone top window vs nested iframe safely', () => {
  const sameRef = {};
  assert.equal(isEmbeddedIframe({ self: sameRef, top: sameRef }), false);
  assert.equal(isEmbeddedIframe({ self: {}, top: {} }), true);
  assert.equal(isEmbeddedIframe(undefined), false);
});
