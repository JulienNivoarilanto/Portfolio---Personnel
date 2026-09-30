import { 
  collection, 
  doc, 
  getDoc,
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  onSnapshot, 
  Unsubscribe,
  writeBatch
} from 'firebase/firestore';
import { signInAnonymously } from 'firebase/auth';
import { db, auth, testConnection } from './config';
import { Project, Skill, Testimonial, SiteConfig } from '../types';
import { defaultSiteConfig } from '../data';

let migrationExecuted = false;

/**
 * Initializes Firestore, checks connection, and ensures site config exists.
 * Does NOT inject any mock data: all collections remain purely database-driven.
 */
export async function initAndMigrateFirebase(): Promise<void> {
  if (migrationExecuted) return;

  try {
    // Attempt silent anonymous auth if unauthenticated
    if (!auth.currentUser) {
      try {
        await signInAnonymously(auth);
      } catch (authErr) {
        // Fall back gracefully
      }
    }

    await testConnection();

    // Verify if site configuration exists
    const cSnap = await getDoc(doc(db, 'config', 'site'));
    if (!cSnap.exists()) {
      await setDoc(doc(db, 'config', 'site'), { ...defaultSiteConfig, updatedAt: new Date().toISOString() });
    }

    migrationExecuted = true;
  } catch (error) {
    // Silent catch
  }
}

/**
 * Real-time subscribers to keep the local Zustand store in sync with Firestore
 */
export function subscribeToProjects(onUpdate: (projects: Project[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'projects'), (snapshot) => {
    const list: Project[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as Project;
      const validId = (data.id && typeof data.id === 'string' && data.id.trim() !== '') ? data.id : d.id;
      list.push({
        ...data,
        id: validId,
        tags: Array.isArray(data.tags) ? data.tags : (typeof (data as any).tags === 'string' ? [(data as any).tags] : []),
        extraImages: Array.isArray(data.extraImages) ? data.extraImages : [],
        codeBlocks: Array.isArray(data.codeBlocks) ? data.codeBlocks : []
      });
    });
    // Sort: user defined order first, then newest first
    list.sort((a, b) => {
      if (typeof a.order === 'number' && typeof b.order === 'number') {
        return a.order - b.order;
      }
      if (typeof a.order === 'number') return -1;
      if (typeof b.order === 'number') return 1;
      const timeA = (a as any).updatedAt || (a as any).createdAt || a.id || '';
      const timeB = (b as any).updatedAt || (b as any).createdAt || b.id || '';
      return String(timeB).localeCompare(String(timeA));
    });
    onUpdate(list);
  }, () => {});
}

export function subscribeToSkills(onUpdate: (skills: Skill[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'skills'), (snapshot) => {
    const list: Skill[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as Skill;
      const validId = (data.id && typeof data.id === 'string' && data.id.trim() !== '') ? data.id : d.id;
      list.push({
        ...data,
        id: validId
      });
    });
    // Sort: user defined order first, then alphabetical by name
    list.sort((a, b) => {
      if (typeof a.order === 'number' && typeof b.order === 'number') {
        return a.order - b.order;
      }
      if (typeof a.order === 'number') return -1;
      if (typeof b.order === 'number') return 1;
      return (a.name || '').localeCompare(b.name || '');
    });
    onUpdate(list);
  }, () => {});
}

export function subscribeToTestimonials(onUpdate: (testimonials: Testimonial[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'testimonials'), (snapshot) => {
    const list: Testimonial[] = [];
    snapshot.forEach((d) => {
      const data = d.data() as Testimonial;
      const validId = (data.id && typeof data.id === 'string' && data.id.trim() !== '') ? data.id : d.id;
      list.push({
        ...data,
        id: validId
      });
    });
    onUpdate(list);
  }, () => {});
}

export function subscribeToSiteConfig(onUpdate: (config: SiteConfig) => void): Unsubscribe {
  return onSnapshot(doc(db, 'config', 'site'), (snapshot) => {
    if (snapshot.exists()) {
      onUpdate(snapshot.data() as SiteConfig);
    }
  }, () => {});
}

/**
 * Persistence helpers directly writing to Firestore with timeout safety and merge support
 */

function sanitizeForFirestore<T>(data: T): T {
  if (data === null || data === undefined) {
    return null as unknown as T;
  }
  if (Array.isArray(data)) {
    return data.map(item => sanitizeForFirestore(item)) as unknown as T;
  }
  if (typeof data === 'object') {
    const cleaned: Record<string, any> = {};
    for (const [key, value] of Object.entries(data)) {
      if (value !== undefined) {
        cleaned[key] = sanitizeForFirestore(value);
      }
    }
    return cleaned as T;
  }
  return data;
}

async function safeFirestoreWrite<T>(promise: Promise<T>, timeoutMs = 4000): Promise<T | null> {
  let timer: any;
  const timeoutPromise = new Promise<null>((resolve) => {
    timer = setTimeout(() => {
      resolve(null);
    }, timeoutMs);
  });

  try {
    const result = await Promise.race([promise, timeoutPromise]);
    clearTimeout(timer);
    return result;
  } catch (err) {
    clearTimeout(timer);
    return null;
  }
}

export async function firestoreAddProject(project: Project): Promise<void> {
  const docId = (project.id && typeof project.id === 'string' && project.id.trim() !== '')
    ? project.id.trim()
    : `proj_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const payload = sanitizeForFirestore({
    ...project,
    id: docId,
    updatedAt: new Date().toISOString()
  });
  await safeFirestoreWrite(setDoc(doc(db, 'projects', docId), payload, { merge: true }));
}

export async function firestoreUpdateProject(id: string, updated: Partial<Project>): Promise<void> {
  if (!id) return;
  const payload = sanitizeForFirestore({
    ...updated,
    id,
    updatedAt: new Date().toISOString()
  });
  await safeFirestoreWrite(setDoc(doc(db, 'projects', id), payload, { merge: true }));
}

export async function firestoreDeleteProject(id: string): Promise<void> {
  if (!id) return;
  await safeFirestoreWrite(deleteDoc(doc(db, 'projects', id)));
}

export async function firestoreAddSkill(skill: Skill): Promise<void> {
  const docId = (skill.id && typeof skill.id === 'string' && skill.id.trim() !== '')
    ? skill.id.trim()
    : `skill_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const payload = sanitizeForFirestore({
    ...skill,
    id: docId,
    updatedAt: new Date().toISOString()
  });
  await safeFirestoreWrite(setDoc(doc(db, 'skills', docId), payload, { merge: true }));
}

export async function firestoreUpdateSkill(id: string, updated: Partial<Skill>): Promise<void> {
  if (!id) return;
  const payload = sanitizeForFirestore({
    ...updated,
    id,
    updatedAt: new Date().toISOString()
  });
  await safeFirestoreWrite(setDoc(doc(db, 'skills', id), payload, { merge: true }));
}

export async function firestoreDeleteSkill(id: string): Promise<void> {
  if (!id) return;
  await safeFirestoreWrite(deleteDoc(doc(db, 'skills', id)));
}

export async function firestoreAddTestimonial(testimonial: Testimonial): Promise<void> {
  const docId = (testimonial.id && typeof testimonial.id === 'string' && testimonial.id.trim() !== '')
    ? testimonial.id.trim()
    : `testi_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const payload = sanitizeForFirestore({
    ...testimonial,
    id: docId,
    updatedAt: new Date().toISOString()
  });
  await safeFirestoreWrite(setDoc(doc(db, 'testimonials', docId), payload, { merge: true }));
}

export async function firestoreUpdateTestimonial(id: string, updated: Partial<Testimonial>): Promise<void> {
  if (!id) return;
  const payload = sanitizeForFirestore({
    ...updated,
    id,
    updatedAt: new Date().toISOString()
  });
  await safeFirestoreWrite(setDoc(doc(db, 'testimonials', id), payload, { merge: true }));
}

export async function firestoreDeleteTestimonial(id: string): Promise<void> {
  if (!id) return;
  await safeFirestoreWrite(deleteDoc(doc(db, 'testimonials', id)));
}

export async function firestoreSaveSiteConfig(config: SiteConfig): Promise<void> {
  const payload = sanitizeForFirestore({
    ...config,
    updatedAt: new Date().toISOString()
  });
  await safeFirestoreWrite(setDoc(doc(db, 'config', 'site'), payload, { merge: true }));
}

export async function firestoreBatchUpdateProjectOrders(projectOrders: { id: string; order: number }[]): Promise<void> {
  if (!projectOrders || projectOrders.length === 0) return;
  const batch = writeBatch(db);
  for (const item of projectOrders) {
    if (item.id) {
      batch.set(
        doc(db, 'projects', item.id), 
        { order: item.order, updatedAt: new Date().toISOString() }, 
        { merge: true }
      );
    }
  }
  await safeFirestoreWrite(batch.commit());
}

export async function firestoreBatchUpdateSkillOrders(skillOrders: { id: string; order: number; category?: string }[]): Promise<void> {
  if (!skillOrders || skillOrders.length === 0) return;
  const batch = writeBatch(db);
  for (const item of skillOrders) {
    if (item.id) {
      const payload: Record<string, any> = { 
        order: item.order, 
        updatedAt: new Date().toISOString() 
      };
      if (item.category) payload.category = item.category;
      batch.set(
        doc(db, 'skills', item.id), 
        payload, 
        { merge: true }
      );
    }
  }
  await safeFirestoreWrite(batch.commit());
}

export interface ContactMessage {
  id?: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
  read?: boolean;
}

export async function firestoreSendMessage(msg: { name: string; email: string; message: string }): Promise<string> {
  const docId = `msg_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
  const payload = sanitizeForFirestore({
    id: docId,
    name: msg.name,
    email: msg.email,
    message: msg.message,
    createdAt: new Date().toISOString(),
    read: false,
  });
  await safeFirestoreWrite(setDoc(doc(db, 'messages', docId), payload));
  return docId;
}

export function subscribeToMessages(onUpdate: (messages: ContactMessage[]) => void): Unsubscribe {
  return onSnapshot(collection(db, 'messages'), (snapshot) => {
    const list: ContactMessage[] = [];
    snapshot.forEach((docSnap) => {
      const data = docSnap.data() as any;
      list.push({
        ...data,
        id: docSnap.id
      });
    });
    list.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    onUpdate(list);
  }, () => {});
}

export async function firestoreDeleteMessage(id: string): Promise<void> {
  if (!id) return;
  await safeFirestoreWrite(deleteDoc(doc(db, 'messages', id)));
}

export async function firestoreMarkMessageAsRead(id: string, read = true): Promise<void> {
  if (!id) return;
  await safeFirestoreWrite(setDoc(doc(db, 'messages', id), { read, updatedAt: new Date().toISOString() }, { merge: true }));
}


