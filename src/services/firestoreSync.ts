import {
  collection,
  doc,
  setDoc,
  deleteDoc,
  onSnapshot,
  getDocs,
  writeBatch,
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { Recipe, IngredientItem, Category, ShoppingListItem } from '../types';

/**
 * Seeds Firestore collection if it's currently empty, so users get standard data right away.
 */
export async function seedCollectionIfEmpty<T extends { id: string }>(
  collectionName: string,
  initialItems: T[]
) {
  try {
    const colRef = collection(db, collectionName);
    const snapshot = await getDocs(colRef);
    if (snapshot.empty && initialItems.length > 0) {
      const batch = writeBatch(db);
      initialItems.forEach((item) => {
        const itemRef = doc(db, collectionName, item.id);
        batch.set(itemRef, item);
      });
      await batch.commit();
      console.log(`[Firestore] Seeded ${collectionName} with initial items.`);
    }
  } catch (err) {
    console.warn(`[Firestore] Could not seed ${collectionName}:`, err);
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
    await setDoc(docRef, item, { merge: true });
  } catch (err) {
    console.error(`[Firestore Save Error] ${collectionName}/${item.id}:`, err);
  }
}

export async function syncDeleteDoc(collectionName: string, id: string) {
  try {
    const docRef = doc(db, collectionName, id);
    await deleteDoc(docRef);
  } catch (err) {
    console.error(`[Firestore Delete Error] ${collectionName}/${id}:`, err);
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
      batch.set(docRef, item, { merge: true });
    });
    await batch.commit();
  } catch (err) {
    console.error(`[Firestore Batch Save Error] ${collectionName}:`, err);
  }
}
