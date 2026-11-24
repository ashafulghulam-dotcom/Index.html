import { initializeApp } from 'firebase/app';
import {
  getAuth,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithPopup,
  signOut,
  type User as FirebaseUser,
} from 'firebase/auth';
import {
  collection,
  doc,
  getDoc,
  getDocFromServer,
  getFirestore,
  onSnapshot,
  query,
  serverTimestamp,
  setDoc,
  updateDoc,
  where,
} from 'firebase/firestore';
import firebaseConfig from '../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, firebaseConfig.firestoreDatabaseId);
export const auth = getAuth(app);

const googleProvider = new GoogleAuthProvider();
googleProvider.setCustomParameters({ prompt: 'select_account' });

export const BOOTSTRAP_ADMIN_EMAIL = 'ashafulghulam@gmail.com';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(
  error: unknown,
  operationType: OperationType,
  path: string | null
): never {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid ?? null,
      email: auth.currentUser?.email ?? null,
      emailVerified: auth.currentUser?.emailVerified ?? null,
      isAnonymous: auth.currentUser?.isAnonymous ?? null,
      tenantId: auth.currentUser?.tenantId ?? null,
      providerInfo:
        auth.currentUser?.providerData?.map((provider) => ({
          providerId: provider.providerId,
          email: provider.email,
        })) || [],
    },
    operationType,
    path,
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if (error instanceof Error && error.message.includes('the client is offline')) {
      console.error('Please check your Firebase configuration.');
    }
  }
}

if (typeof window !== 'undefined') {
  void testConnection();
}

export function sanitizeFirestoreId(raw: string, fallbackPrefix = 'id'): string {
  const cleaned = String(raw || '')
    .trim()
    .replace(/[^a-zA-Z0-9_\-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 64);
  return cleaned || `${fallbackPrefix}-${Date.now()}`;
}

export function truncateField(val: string | undefined, maxLength: number): string {
  return String(val || '').trim().slice(0, maxLength);
}

export interface CloudCertificateRecord {
  certCode: string;
  certificateNumber: string;
  documentType: 'Sertifikat' | 'Piagam' | 'Laporan' | 'Absensi';
  participantName: string;
  partnerName?: string;
  kua: string;
  issuedAt: string;
  status: 'valid' | 'revoked';
}

export interface CloudAnnouncementRecord {
  id: string;
  title: string;
  body: string;
  kuaScope: string;
  priority: 'normal' | 'penting';
  authorName: string;
  active: boolean;
  createdAtIso?: string;
}

export interface CloudDataTicketPayload {
  id: string;
  pesertaUsername: string;
  pesertaNama: string;
  kua: string;
  category: 'Koreksi Identitas' | 'Pindah KUA' | 'Ubah Jadwal Akad' | 'Kendala Teknis';
  details: string;
}

export async function signInWithGoogleAccount(): Promise<FirebaseUser> {
  const result = await signInWithPopup(auth, googleProvider);
  return result.user;
}

export async function signOutFirebaseAccount(): Promise<void> {
  await signOut(auth);
}

export function subscribeFirebaseAuth(
  callback: (user: FirebaseUser | null) => void
): () => void {
  return onAuthStateChanged(auth, callback);
}

export async function ensureCloudUserProfile(input: {
  user: FirebaseUser;
  username: string;
  kua: string;
}): Promise<void> {
  if (!input.user.emailVerified) return;
  const path = `users/${input.user.uid}`;
  const ref = doc(db, 'users', input.user.uid);
  try {
    const existingSnap = await getDoc(ref);
    const safeUsername =
      truncateField(input.username.replace(/[^a-zA-Z0-9._\-]/g, '_'), 64) || 'peserta';
    if (!existingSnap.exists()) {
      await setDoc(ref, {
        uid: input.user.uid,
        email: truncateField(input.user.email || 'peserta@samawa.id', 160),
        displayName: truncateField(input.user.displayName || safeUsername, 120),
        username: safeUsername,
        kua: truncateField(input.kua || 'KUA Jepara', 80),
        role: 'Peserta',
        identityLocked: false,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      const data = existingSnap.data();
      if (!data.identityLocked) {
        await updateDoc(ref, {
          displayName: truncateField(input.user.displayName || data.displayName, 120),
          username: safeUsername,
          kua: truncateField(input.kua || data.kua, 80),
          updatedAt: serverTimestamp(),
        });
      }
    }
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function publishCertificateToCloud(cert: CloudCertificateRecord): Promise<boolean> {
  const current = auth.currentUser;
  if (!current || !current.emailVerified) return false;

  const safeCode = sanitizeFirestoreId(cert.certCode, 'SERT').slice(0, 64);
  const path = `public_certificates/${safeCode}`;
  const ref = doc(db, 'public_certificates', safeCode);
  try {
    const snap = await getDoc(ref);
    const baseFields: Record<string, unknown> = {
      certCode: safeCode,
      certificateNumber: truncateField(cert.certificateNumber, 120),
      documentType: cert.documentType,
      participantName: truncateField(cert.participantName, 120),
      kua: truncateField(cert.kua, 80),
      issuedAt: truncateField(cert.issuedAt, 64),
      status: cert.status,
      updatedAt: serverTimestamp(),
    };
    if (cert.partnerName && cert.partnerName.trim()) {
      baseFields.partnerName = truncateField(cert.partnerName, 120);
    }

    if (!snap.exists()) {
      await setDoc(ref, {
        ...baseFields,
        ownerUid: current.uid,
        createdAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        certificateNumber: baseFields.certificateNumber,
        participantName: baseFields.participantName,
        ...(baseFields.partnerName ? { partnerName: baseFields.partnerName } : {}),
        kua: baseFields.kua,
        issuedAt: baseFields.issuedAt,
        status: baseFields.status,
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function verifyCertificateFromCloud(
  rawCode: string
): Promise<CloudCertificateRecord | null> {
  const safeCode = sanitizeFirestoreId(rawCode, '');
  if (!safeCode || safeCode.length > 64) return null;
  const path = `public_certificates/${safeCode}`;
  try {
    const snap = await getDoc(doc(db, 'public_certificates', safeCode));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      certCode: String(d.certCode || safeCode),
      certificateNumber: String(d.certificateNumber || ''),
      documentType: (d.documentType as CloudCertificateRecord['documentType']) || 'Sertifikat',
      participantName: String(d.participantName || ''),
      partnerName: d.partnerName ? String(d.partnerName) : undefined,
      kua: String(d.kua || ''),
      issuedAt: String(d.issuedAt || ''),
      status: d.status === 'revoked' ? 'revoked' : 'valid',
    };
  } catch (error) {
    // Allow graceful fallback to local registry if offline or unindexed
    console.warn('Cloud certificate lookup skipped:', path, error);
    return null;
  }
}

export async function publishAnnouncementToCloud(
  announcement: Omit<CloudAnnouncementRecord, 'createdAtIso'>
): Promise<boolean> {
  const current = auth.currentUser;
  if (!current || !current.emailVerified) return false;

  const safeId = sanitizeFirestoreId(announcement.id, 'ann');
  const path = `public_announcements/${safeId}`;
  const ref = doc(db, 'public_announcements', safeId);
  try {
    await setDoc(ref, {
      title: truncateField(announcement.title, 160),
      body: truncateField(announcement.body, 2000),
      kuaScope: truncateField(announcement.kuaScope, 80),
      priority: announcement.priority,
      authorName: truncateField(announcement.authorName, 120),
      authorUid: current.uid,
      active: announcement.active,
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function subscribePublicAnnouncements(
  onData: (items: CloudAnnouncementRecord[]) => void
): () => void {
  const path = 'public_announcements';
  const q = query(collection(db, path), where('active', '==', true));
  return onSnapshot(
    q,
    (snapshot) => {
      const items: CloudAnnouncementRecord[] = snapshot.docs.map((docSnap) => {
        const d = docSnap.data();
        return {
          id: docSnap.id,
          title: String(d.title || ''),
          body: String(d.body || ''),
          kuaScope: String(d.kuaScope || 'ALL'),
          priority: d.priority === 'penting' ? 'penting' : 'normal',
          authorName: String(d.authorName || 'Kemenag Kab. Jepara'),
          active: Boolean(d.active),
          createdAtIso:
            typeof d.createdAt?.toDate === 'function'
              ? d.createdAt.toDate().toISOString()
              : new Date().toISOString(),
        };
      });
      onData(items);
    },
    (error) => {
      console.warn('Announcement listener warning:', error);
    }
  );
}

export async function submitDataTicketToCloud(
  ticket: CloudDataTicketPayload
): Promise<boolean> {
  const current = auth.currentUser;
  if (!current || !current.emailVerified) return false;

  const safeId = sanitizeFirestoreId(ticket.id, 'tkt');
  const path = `data_tickets/${safeId}`;
  try {
    await setDoc(doc(db, 'data_tickets', safeId), {
      ownerUid: current.uid,
      pesertaUsername: truncateField(ticket.pesertaUsername, 64),
      pesertaNama: truncateField(ticket.pesertaNama, 120),
      kua: truncateField(ticket.kua, 80),
      category: ticket.category,
      details: truncateField(ticket.details, 1200),
      status: 'menunggu',
      createdAt: serverTimestamp(),
      updatedAt: serverTimestamp(),
    });
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, path);
  }
}

export function stripOversizedMediaForCloud<T>(value: T): T {
  const visit = (node: unknown): unknown => {
    if (typeof node === 'string') {
      // Prevent Firestore 1MB doc limit violation by stripping large inline base64 data URLs
      if (node.startsWith('data:image/') && node.length > 16000) {
        return '';
      }
      if (node.startsWith('data:video/') || node.startsWith('data:application/')) {
        return '';
      }
      return node;
    }
    if (Array.isArray(node)) {
      return node.map(visit);
    }
    if (node && typeof node === 'object') {
      const out: Record<string, unknown> = {};
      for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
        if (v !== undefined) {
          out[k] = visit(v);
        }
      }
      return out;
    }
    return node;
  };
  return visit(value) as T;
}

export async function saveCloudWorkspaceSnapshot(
  workspaceId: string,
  payload: {
    scopeLabel: string;
    totalUsers: number;
    totalCertificates: number;
    snapshot: Record<string, unknown>;
  }
): Promise<boolean> {
  const current = auth.currentUser;
  if (!current || !current.emailVerified) return false;

  const safeId = sanitizeFirestoreId(workspaceId, 'samawa-main');
  const path = `cloud_workspaces/${safeId}`;
  const ref = doc(db, 'cloud_workspaces', safeId);
  const compactSnapshot = stripOversizedMediaForCloud(payload.snapshot);

  try {
    const existingSnap = await getDoc(ref);
    if (!existingSnap.exists()) {
      await setDoc(ref, {
        ownerUid: current.uid,
        updatedByEmail: truncateField(current.email || 'admin@samawa.id', 160),
        scopeLabel: truncateField(payload.scopeLabel, 100),
        totalUsers: Math.max(0, Math.round(payload.totalUsers)),
        totalCertificates: Math.max(0, Math.round(payload.totalCertificates)),
        snapshot: compactSnapshot,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
      });
    } else {
      await updateDoc(ref, {
        updatedByEmail: truncateField(current.email || 'admin@samawa.id', 160),
        scopeLabel: truncateField(payload.scopeLabel, 100),
        totalUsers: Math.max(0, Math.round(payload.totalUsers)),
        totalCertificates: Math.max(0, Math.round(payload.totalCertificates)),
        snapshot: compactSnapshot,
        updatedAt: serverTimestamp(),
      });
    }
    return true;
  } catch (error) {
    handleFirestoreError(error, OperationType.WRITE, path);
  }
}

export async function loadCloudWorkspaceSnapshot(
  workspaceId: string
): Promise<{ updatedByEmail: string; updatedAtIso: string; snapshot: Record<string, unknown> } | null> {
  const current = auth.currentUser;
  if (!current || !current.emailVerified) return null;

  const safeId = sanitizeFirestoreId(workspaceId, 'samawa-main');
  const path = `cloud_workspaces/${safeId}`;
  try {
    const snap = await getDoc(doc(db, 'cloud_workspaces', safeId));
    if (!snap.exists()) return null;
    const d = snap.data();
    return {
      updatedByEmail: String(d.updatedByEmail || ''),
      updatedAtIso:
        typeof d.updatedAt?.toDate === 'function'
          ? d.updatedAt.toDate().toISOString()
          : new Date().toISOString(),
      snapshot: (d.snapshot as Record<string, unknown>) || {},
    };
  } catch (error) {
    handleFirestoreError(error, OperationType.GET, path);
  }
}
