import { getSupabaseClient, getSupabaseConfig } from '../lib/supabase';

// Helper for local storage persistence keys
const getStorageKey = (collectionName: string) => `app_${collectionName}`;

export const SUPABASE_INIT_SQL = `-- SQL Khởi tạo bảng dữ liệu cho Supabase (Chạy trong Supabase SQL Editor)

CREATE TABLE IF NOT EXISTS recipes (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS ingredients (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS categories (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS shoppingList (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS expenses (
  id TEXT PRIMARY KEY,
  data JSONB NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Tắt Row Level Security (RLS) để cho phép đọc/ghi công khai
ALTER TABLE recipes DISABLE ROW LEVEL SECURITY;
ALTER TABLE ingredients DISABLE ROW LEVEL SECURITY;
ALTER TABLE categories DISABLE ROW LEVEL SECURITY;
ALTER TABLE shoppingList DISABLE ROW LEVEL SECURITY;
ALTER TABLE expenses DISABLE ROW LEVEL SECURITY;
`;

export async function testSupabaseConnection(): Promise<{
  success: boolean;
  message: string;
  missingTables?: string[];
  details?: string;
}> {
  const client = getSupabaseClient();
  const { isConfigured, url } = getSupabaseConfig();

  if (!isConfigured || !client) {
    return {
      success: false,
      message: 'Supabase chưa được cấu hình (Thiếu URL hoặc Anon Key hợp lệ).',
    };
  }

  const collections = ['recipes', 'ingredients', 'categories', 'shoppingList', 'expenses'];
  const missingTables: string[] = [];
  let connectionOk = false;

  for (const table of collections) {
    try {
      const { error } = await client.from(table).select('id').limit(1);
      if (error) {
        if (error.code === '42P01' || error.message.includes('does not exist')) {
          missingTables.push(table);
        } else {
          return {
            success: false,
            message: `Lỗi truy vấn bảng "${table}": ${error.message} (Mã lỗi: ${error.code || 'N/A'})`,
            details: error.details || error.hint || error.message,
          };
        }
      } else {
        connectionOk = true;
      }
    } catch (err: any) {
      return {
        success: false,
        message: `Lỗi kết nối tới Supabase: ${err.message || String(err)}`,
      };
    }
  }

  if (missingTables.length > 0) {
    return {
      success: false,
      message: `Kết nối thành công tới Supabase (${url}), nhưng chưa khởi tạo các bảng: ${missingTables.join(', ')}.`,
      missingTables,
    };
  }

  if (!connectionOk) {
    return {
      success: false,
      message: 'Không thể kết nối hoặc xác thực với dự án Supabase.',
    };
  }

  return {
    success: true,
    message: `Đồng bộ Supabase hoạt động hoàn hảo! Tất cả 5/5 bảng dữ liệu đã sẵn sàng.`,
  };
}

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

  const client = getSupabaseClient();
  if (!client) {
    return;
  }

  try {
    const { data, error } = await client.from(collectionName).select('id').limit(1);
    if (!error && (!data || data.length === 0) && initialItems.length > 0) {
      // Upsert initial items into Supabase
      const payload = initialItems.map((item) => ({
        id: item.id,
        data: item,
        updated_at: new Date().toISOString(),
      }));
      await client.from(collectionName).upsert(payload, { onConflict: 'id' });
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
  const client = getSupabaseClient();

  if (client) {
    // Fetch latest from Supabase async
    (async () => {
      try {
        const { data, error } = await client.from(collectionName).select('*');
        if (error) {
          console.warn(`[Supabase Fetch Error] ${collectionName}:`, error.message);
          if (onError) onError(new Error(`[Supabase] ${collectionName}: ${error.message}`));
          return;
        }

        if (data && data.length > 0) {
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
    try {
      supabaseChannel = client
        .channel(`public:${collectionName}`)
        .on(
          'postgres_changes',
          { event: '*', schema: 'public', table: collectionName },
          async () => {
            const { data, error } = await client.from(collectionName).select('*');
            if (!error && data) {
              const remoteItems = data.map((row) => (row.data ? row.data : row) as T);
              saveLocalItems(collectionName, remoteItems);
              onUpdate(remoteItems);
            }
          }
        )
        .subscribe();
    } catch (realtimeErr) {
      console.warn(`[Supabase Realtime Error] ${collectionName}:`, realtimeErr);
    }
  }

  return () => {
    window.removeEventListener('app_local_storage_change', handleLocalChange);
    window.removeEventListener('storage', handleWindowStorage);
    if (supabaseChannel && client) {
      try {
        client.removeChannel(supabaseChannel);
      } catch {
        // ignore
      }
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
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from(collectionName).upsert(
        {
          id: item.id,
          data: item,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
      if (error) {
        console.warn(`[Supabase Save Error] ${collectionName}/${item.id}:`, error.message);
      }
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
  const client = getSupabaseClient();
  if (client) {
    try {
      const { error } = await client.from(collectionName).delete().eq('id', id);
      if (error) {
        console.warn(`[Supabase Delete Error] ${collectionName}/${id}:`, error.message);
      }
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
  const client = getSupabaseClient();
  if (client) {
    try {
      const payload = items.map((item) => ({
        id: item.id,
        data: item,
        updated_at: new Date().toISOString(),
      }));
      const { error } = await client.from(collectionName).upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn(`[Supabase Batch Error] ${collectionName}:`, error.message);
      }
    } catch (err) {
      console.warn(`[Supabase Batch Error] ${collectionName}:`, err);
    }
  }
}

