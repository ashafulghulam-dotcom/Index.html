import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { describe, it } from 'node:test';

const rulesPath = path.resolve(process.cwd(), 'firestore.rules');
const blueprintPath = path.resolve(process.cwd(), 'firebase-blueprint.json');
const rulesText = fs.readFileSync(rulesPath, 'utf8');
const blueprint = JSON.parse(fs.readFileSync(blueprintPath, 'utf8')) as {
  entities: Record<string, { required?: string[]; properties: Record<string, { maxLength?: number; pattern?: string }> }>;
  firestore: Record<string, { schema: { $ref: string } }>;
};

describe('Firestore Security Rules & Blueprint Invariants (Dirty Dozen Guard)', () => {
  it('contains default-deny safety net and covers every blueprint collection', () => {
    assert.ok(rulesText.includes("rules_version = '2';"));
    assert.ok(rulesText.includes('match /{document=**}'));
    assert.ok(rulesText.includes('allow read, write: if false;'));

    const requiredMatches = [
      'match /admins/{adminUid}',
      'match /users/{userId}',
      'match /public_certificates/{certCode}',
      'match /public_announcements/{announcementId}',
      'match /data_tickets/{ticketId}',
      'match /cloud_workspaces/{workspaceId}',
    ];
    for (const block of requiredMatches) {
      assert.ok(rulesText.includes(block), `Missing rules block: ${block}`);
    }
    assert.equal(Object.keys(blueprint.firestore).length, requiredMatches.length);
  });

  it('prevents unverified email spoofing and self-assigned admin escalation', () => {
    assert.ok(rulesText.includes('request.auth.token.email_verified == true'));
    assert.ok(rulesText.includes("data.role == 'Peserta'"));
    assert.ok(rulesText.includes('incoming().identityLocked == false'));
  });

  it('enforces strict PII isolation, no blanket list reads, and zero DB lookups inside allow list', () => {
    const listLines = rulesText
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l.startsWith('allow list:'));
    assert.ok(listLines.length >= 6);
    for (const line of listLines) {
      assert.ok(!line.includes('isAdmin()'), `allow list must not invoke exists()-based isAdmin(): ${line}`);
      assert.ok(!line.includes('get(') && !line.includes('exists('), `allow list must avoid DB lookups: ${line}`);
      assert.ok(line !== 'allow list: if isSignedIn();', 'Blanket signed-in list is forbidden');
    }
  });

  it('guards all updates with validation blueprints, affectedKeys allowlists, terminal state lock, and server timestamps', () => {
    assert.ok(rulesText.includes('isValidCloudUserProfile(incoming())'));
    assert.ok(rulesText.includes('isValidPublicCertificate(incoming())'));
    assert.ok(rulesText.includes('isValidAnnouncement(incoming())'));
    assert.ok(rulesText.includes('isValidDataTicket(incoming())'));
    assert.ok(rulesText.includes('isValidCloudWorkspace(incoming())'));
    assert.ok(rulesText.includes("existing().status == 'menunggu'"));
    assert.ok(rulesText.includes('incoming().createdAt == request.time'));
    assert.ok(rulesText.includes('incoming().updatedAt == request.time'));
    assert.ok(rulesText.includes('affectedKeys().hasOnly('));
  });
});
