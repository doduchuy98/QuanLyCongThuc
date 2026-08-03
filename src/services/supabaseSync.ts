import { supabase, isSupabaseConfigured } from '../lib/supabase';

// Helper for local storage persistence keys
const getStorageKey = (collectionName: string) => `app_${collectionName}`;

export function getLocalItems<T>(collectionName: string, defaultItems: T[]): T[] {
  try {
    const saved = localStorage.getItem(getStorageKey(collectionName));
    if (saved) {
      const parsed = JSON.parse(saved);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (err) {
    console.warn(`[LocalStorage] Error reading ${collectionName}:`, err);
  }
  return defaultItems;
}

export function saveLocalItems<T>(collectionName: string, items: T[]) {
  try {
    localStorage.setItem(getStorageKey(collectionName), JSON.stringify(items));
    window.dispatchEvent(new CustomEvent('app_local_storage_change', { detail: { collectionName, items } }));
  } catch (err) {
    console.warn(`[LocalStorage] Error saving ${collectionName}:`, err);
  }
}

/**
 * Seeds Supabase table if empty or initializes local storage
 */
export async function seedCollectionIfEmpty<T extends { id: string }>(
  collectionName: string,
  initialItems: T[]
) {
  // Always ensure local storage has data
  const currentLocal = getLocalItems(collectionName, []);
  if (currentLocal.length === 0 && initialItems.length > 0) {
    saveLocalItems(collectionName, initialItems);
  }

  if (!isSupabaseConfigured || !supabase) {
    return;
  }

  try {
    const { data, error } = await supabase.from(collectionName).select('id').limit(1);
    if (!error && (!data || data.length === 0) && initialItems.length > 0) {
      // Upsert initial items into Supabase
      const payload = initialItems.map((item) => ({
        id: item.id,
        data: item,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from(collectionName).upsert(payload, { onConflict: 'id' });
      console.log(`[Supabase] Seeded ${collectionName} with initial items.`);
    }
  } catch (err) {
    console.warn(`[Supabase Seed Error] ${collectionName}:`, err);
  }
}

/**
 * Subscribe to Supabase Realtime or LocalStorage changes
 */
export function subscribeCollection<T extends { id: string }>(
  collectionName: string,
  onUpdate: (items: T[]) => void,
  onError?: (err: Error) => void
) {
  // Initial broadcast from local storage
  const localItems = getLocalItems<T>(collectionName, []);
  onUpdate(localItems);

  // Listen to custom local storage change events for immediate UI updates
  const handleLocalChange = (e: Event) => {
    const customEvent = e as CustomEvent;
    if (customEvent.detail && customEvent.detail.collectionName === collectionName) {
      onUpdate(customEvent.detail.items);
    }
  };

  const handleWindowStorage = (e: StorageEvent) => {
    if (e.key === getStorageKey(collectionName) && e.newValue) {
      try {
        onUpdate(JSON.parse(e.newValue));
      } catch (err) {
        console.warn('Storage event parse error:', err);
      }
    }
  };

  window.addEventListener('app_local_storage_change', handleLocalChange);
  window.addEventListener('storage', handleWindowStorage);

  let supabaseChannel: any = null;

  if (isSupabaseConfigured && supabase) {
    // Fetch latest from Supabase async
    (async () => {
      try {
        const { data, error } = await supabase.from(collectionName).select('*');
        if (!error && data && data.length > 0) {
          const remoteItems = data.map((row) => (row.data ? row.data : row) as T);
          saveLocalItems(collectionName, remoteItems);
          onUpdate(remoteItems);
        }
      } catch (err) {
        console.warn(`[Supabase Fetch Error] ${collectionName}:`, err);
        if (onError) onError(err as Error);
      }
    })();

    // Subscribe to realtime changes
    supabaseChannel = supabase
      .channel(`public:${collectionName}`)
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: collectionName },
        async () => {
          const { data } = await supabase.from(collectionName).select('*');
          if (data) {
            const remoteItems = data.map((row) => (row.data ? row.data : row) as T);
            saveLocalItems(collectionName, remoteItems);
            onUpdate(remoteItems);
          }
        }
      )
      .subscribe();
  }

  return () => {
    window.removeEventListener('app_local_storage_change', handleLocalChange);
    window.removeEventListener('storage', handleWindowStorage);
    if (supabaseChannel && supabase) {
      supabase.removeChannel(supabaseChannel);
    }
  };
}

/**
 * Save / Update a single document
 */
export async function syncSaveDoc<T extends { id: string }>(
  collectionName: string,
  item: T
) {
  // 1. Update LocalStorage immediately
  const localItems = getLocalItems<T>(collectionName, []);
  const index = localItems.findIndex((i) => i.id === item.id);
  let updatedList: T[];
  if (index >= 0) {
    updatedList = [...localItems];
    updatedList[index] = item;
  } else {
    updatedList = [item, ...localItems];
  }
  saveLocalItems(collectionName, updatedList);

  // 2. Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from(collectionName).upsert(
        {
          id: item.id,
          data: item,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
    } catch (err) {
      console.warn(`[Supabase Save Error] ${collectionName}/${item.id}:`, err);
    }
  }
}

/**
 * Delete a document
 */
export async function syncDeleteDoc(collectionName: string, id: string) {
  // 1. Update LocalStorage immediately
  const localItems = getLocalItems<any>(collectionName, []);
  const updatedList = localItems.filter((i) => i.id !== id);
  saveLocalItems(collectionName, updatedList);

  // 2. Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.from(collectionName).delete().eq('id', id);
    } catch (err) {
      console.warn(`[Supabase Delete Error] ${collectionName}/${id}:`, err);
    }
  }
}

/**
 * Save batch of documents
 */
export async function syncBatchSave<T extends { id: string }>(
  collectionName: string,
  items: T[]
) {
  // 1. Update LocalStorage immediately
  saveLocalItems(collectionName, items);

  // 2. Sync to Supabase if configured
  if (isSupabaseConfigured && supabase) {
    try {
      const payload = items.map((item) => ({
        id: item.id,
        data: item,
        updated_at: new Date().toISOString(),
      }));
      await supabase.from(collectionName).upsert(payload, { onConflict: 'id' });
    } catch (err) {
      console.warn(`[Supabase Batch Error] ${collectionName}:`, err);
    }
  }
}
