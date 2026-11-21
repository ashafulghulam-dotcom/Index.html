import assert from 'node:assert/strict';
import { describe, it } from 'node:test';
import {
  buildLockedYouTubeEmbedUrl,
  clampVideoSeekPosition,
  evaluateVideoCompletion,
  extractYouTubeVideoId,
  formatDurationClock,
  parseVideoSource,
  resolveRequiredWatchSeconds,
} from './videoWatchGuard';

describe('Video Watch Guard Pure Logic', () => {
  it('extracts YouTube IDs and builds locked embed URLs with controls=0 & disablekb=1', () => {
    assert.equal(
      extractYouTubeVideoId('https://www.youtube.com/embed/NHBZKLBZjXg?rel=0'),
      'NHBZKLBZjXg'
    );
    assert.equal(
      extractYouTubeVideoId('https://www.youtube.com/watch?v=NHBZKLBZjXg&t=30s'),
      'NHBZKLBZjXg'
    );
    assert.equal(extractYouTubeVideoId('https://youtu.be/NHBZKLBZjXg'), 'NHBZKLBZjXg');

    const lockedUrl = buildLockedYouTubeEmbedUrl('NHBZKLBZjXg');
    assert.match(lockedUrl, /controls=0/);
    assert.match(lockedUrl, /disablekb=1/);
    assert.match(lockedUrl, /enablejsapi=1/);
  });

  it('classifies YouTube, IndexedDB uploaded videos, and direct MP4/WebM URLs', () => {
    const yt = parseVideoSource('https://www.youtube.com/embed/NHBZKLBZjXg?rel=0');
    assert.equal(yt.kind, 'youtube');
    assert.equal(yt.youtubeId, 'NHBZKLBZjXg');

    const idb = parseVideoSource('idb://module_1_1700000000');
    assert.equal(idb.kind, 'idb');
    assert.equal(idb.idbKey, 'module_1_1700000000');

    const mp4 = parseVideoSource('https://cdn.example.com/bimwin/modul-1.mp4');
    assert.equal(mp4.kind, 'direct');

    const blob = parseVideoSource('blob:http://localhost:3000/abc-123');
    assert.equal(blob.kind, 'direct');
  });

  it('resolves minimum watch duration to match actual uploaded video length', () => {
    // 1. Live detected duration takes top priority
    assert.equal(
      resolveRequiredWatchSeconds({ durationMinutes: 15, videoDurationSeconds: 180 }, 242.2),
      243
    );
    // 2. Stored uploaded video duration takes priority over default reading minutes
    assert.equal(
      resolveRequiredWatchSeconds({ durationMinutes: 15, videoDurationSeconds: 135 }, null),
      135
    );
    // 3. Fallback to durationMinutes * 60 when no video duration is set
    assert.equal(resolveRequiredWatchSeconds({ durationMinutes: 15 }, null), 900);
  });

  it('blocks fast-forward seeks while permitting backward rewind', () => {
    const forwardAttempt = clampVideoSeekPosition(60, 12, 1.5);
    assert.equal(forwardAttempt.blocked, true);
    assert.equal(forwardAttempt.clampedTime, 12);

    const slightDrift = clampVideoSeekPosition(13.2, 12, 1.5);
    assert.equal(slightDrift.blocked, false);
    assert.equal(slightDrift.clampedTime, 13.2);

    const rewindAttempt = clampVideoSeekPosition(5, 25, 1.5);
    assert.equal(rewindAttempt.blocked, false);
    assert.equal(rewindAttempt.clampedTime, 5);
  });

  it('keeps completion locked until full video length is genuinely watched', () => {
    const partial = evaluateVideoCompletion({
      alreadyWatched: false,
      watchedSeconds: 50,
      maxPositionSeconds: 50,
      requiredSeconds: 120,
      hasEnded: false,
    });
    assert.equal(partial.canComplete, false);
    assert.equal(partial.remainingSeconds, 70);
    assert.equal(partial.progressPercent, 41);

    // Seeking to end without actually accumulating watch time is rejected
    const skippedEnd = evaluateVideoCompletion({
      alreadyWatched: false,
      watchedSeconds: 10,
      maxPositionSeconds: 120,
      requiredSeconds: 120,
      hasEnded: true,
    });
    assert.equal(skippedEnd.canComplete, false);

    // Authentic full watch unlocks completion
    const fullWatched = evaluateVideoCompletion({
      alreadyWatched: false,
      watchedSeconds: 120,
      maxPositionSeconds: 120,
      requiredSeconds: 120,
      hasEnded: false,
    });
    assert.equal(fullWatched.canComplete, true);
    assert.equal(fullWatched.remainingSeconds, 0);
    assert.equal(fullWatched.progressPercent, 100);

    // Authentic video ended within 1.5s rounding tolerance unlocks completion
    const endedNaturally = evaluateVideoCompletion({
      alreadyWatched: false,
      watchedSeconds: 119,
      maxPositionSeconds: 119.5,
      requiredSeconds: 120,
      hasEnded: true,
    });
    assert.equal(endedNaturally.canComplete, true);
  });

  it('formats durations as mm:ss and hh:mm:ss', () => {
    assert.equal(formatDurationClock(0), '00:00');
    assert.equal(formatDurationClock(75), '01:15');
    assert.equal(formatDurationClock(3665), '01:01:05');
  });
});
