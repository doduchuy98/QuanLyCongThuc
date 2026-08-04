import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  getDocFromServer,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';

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
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    operationType,
    path,
  };
  console.error('[Firestore Error]:', JSON.stringify(errInfo));
  return errInfo;
}

/**
 * Clean undefined values from JS objects so Firestore setDoc doesn't throw invalid data errors.
 */
function sanitizeForFirestore(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map((item) => sanitizeForFirestore(item));
  }
  if (typeof obj === 'object') {
    const cleaned: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = sanitizeForFirestore(val);
      }
    }
    return cleaned;
  }
  return obj;
}

/**
 * Tests connection to Firestore database
 */
export async function testFirestoreConnection(): Promise<{
  success: boolean;
  message: string;
  details?: string;
}> {
  try {
    const colRef = collection(db, 'recipes');
    await getDocs(colRef);
    return {
      success: true,
      message: 'Kết nối Firebase Firestore hoạt động bình thường! Tất cả dữ liệu đang đồng bộ thời gian thực.',
    };
  } catch (error: any) {
    const errInfo = handleFirestoreError(error, OperationType.GET, 'recipes');
    return {
      success: false,
      message: `Không thể kết nối Firebase Firestore: ${errInfo.error}`,
      details: String(error),
    };
  }
}

/**
 * Seeds Firestore collection if it's currently empty.
 */
export async function seedCollectionIfEmpty<T extends { id: string }>(
  collectionName: string,
  initialItems: T[]
): Promise<boolean> {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty && initialItems.length > 0) {
      const batch = writeBatch(db);
      initialItems.forEach((item) => {
        const itemRef = doc(db, collectionName, item.id);
        batch.set(itemRef, sanitizeForFirestore(item));
      });
      await batch.commit();
      console.log(`[Firestore] Seeded ${collectionName} with initial items.`);
      return true;
    }
    return false;
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, collectionName);
    return false;
  }
}

/**
 * Real-time subscription to a Firestore collection.
 */
export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (items: T[]) => void,
  onError?: (err: Error) => void
) {
  const colRef = collection(db, collectionName);

  return onSnapshot(
    colRef,
    (snapshot) => {
      const items: T[] = [];
      snapshot.forEach((docSnap) => {
        items.push(docSnap.data() as T);
      });
      onUpdate(items);
    },
    (err) => {
      console.warn(`[Firestore Listener Error] ${collectionName}:`, err);
      handleFirestoreError(err, OperationType.LIST, collectionName);
      if (onError) onError(err);
    }
  );
}

// Single item CRUD operations
export async function syncSaveDoc<T extends { id: string }>(
  collectionName: string,
  item: T
) {
  try {
    const docRef = doc(db, collectionName, item.id);
    const cleaned = sanitizeForFirestore(item);
    await setDoc(docRef, cleaned, { merge: true });
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${item.id}`);
  }
}

export async function syncDeleteDoc(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    handleFirestoreError(err, OperationType.DELETE, `${collectionName}/${id}`);
  }
}

export async function syncBatchSave<T extends { id: string }>(
  collectionName: string,
  items: T[]
) {
  try {
    const batch = writeBatch(db);
    items.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, sanitizeForFirestore(item), { merge: true });
    });
    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, collectionName);
  }
}

export async function syncReplaceCollection<T extends { id: string }>(
  collectionName: string,
  newItems: T[]
) {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    const batch = writeBatch(db);

    const newIds = new Set(newItems.map((i) => i.id));
    snapshot.forEach((docSnap) => {
      if (!newIds.has(docSnap.id)) {
        batch.delete(docSnap.ref);
      }
    });

    newItems.forEach((item) => {
      const docRef = doc(db, collectionName, item.id);
      batch.set(docRef, sanitizeForFirestore(item));
    });

    await batch.commit();
  } catch (err) {
    handleFirestoreError(err, OperationType.WRITE, collectionName);
  }
}


