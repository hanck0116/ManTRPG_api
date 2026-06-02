import type { SessionStorageAdapter, StoredSessionRecord } from '../state/storageAdapter.js';

const dbName = 'mantrpg-pwa';
const dbVersion = 1;
const sessionStore = 'sessions';
const keyStore = 'apiKeys';

function ensureIndexedDb(): IDBFactory {
  if (!globalThis.indexedDB) throw new Error('indexeddb_unavailable');
  return globalThis.indexedDB;
}

export async function openManTrpgDb(): Promise<IDBDatabase> {
  const indexedDB = ensureIndexedDb();
  return await new Promise((resolve, reject) => {
    const request = indexedDB.open(dbName, dbVersion);
    request.onupgradeneeded = () => {
      const db = request.result;
      if (!db.objectStoreNames.contains(sessionStore)) db.createObjectStore(sessionStore, { keyPath: 'session.sessionId' });
      if (!db.objectStoreNames.contains(keyStore)) db.createObjectStore(keyStore, { keyPath: 'provider' });
    };
    request.onerror = () => reject(request.error ?? new Error('indexeddb_open_failed'));
    request.onsuccess = () => resolve(request.result);
  });
}

function txDone(transaction: IDBTransaction): Promise<void> {
  return new Promise((resolve, reject) => {
    transaction.oncomplete = () => resolve();
    transaction.onerror = () => reject(transaction.error ?? new Error('indexeddb_tx_failed'));
    transaction.onabort = () => reject(transaction.error ?? new Error('indexeddb_tx_aborted'));
  });
}

export class IndexedDbSessionStorageAdapter implements SessionStorageAdapter {
  async saveSession(record: StoredSessionRecord): Promise<void> {
    const db = await openManTrpgDb();
    const tx = db.transaction(sessionStore, 'readwrite');
    tx.objectStore(sessionStore).put(record);
    await txDone(tx);
    db.close();
  }

  async loadSession(sessionId: string): Promise<StoredSessionRecord | null> {
    const db = await openManTrpgDb();
    const tx = db.transaction(sessionStore, 'readonly');
    const request = tx.objectStore(sessionStore).get(sessionId);
    const result = await new Promise<StoredSessionRecord | null>((resolve, reject) => {
      request.onerror = () => reject(request.error ?? new Error('indexeddb_get_failed'));
      request.onsuccess = () => resolve((request.result as StoredSessionRecord | undefined) ?? null);
    });
    await txDone(tx);
    db.close();
    return result;
  }

  async deleteSession(sessionId: string): Promise<void> {
    const db = await openManTrpgDb();
    const tx = db.transaction(sessionStore, 'readwrite');
    tx.objectStore(sessionStore).delete(sessionId);
    await txDone(tx);
    db.close();
  }
}

export { keyStore };
