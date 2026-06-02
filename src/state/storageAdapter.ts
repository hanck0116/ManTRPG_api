import type { SessionState } from './sessionState.js';

export interface StoredSessionRecord {
  session: SessionState;
  savedAt: string;
  version: 1;
}

export interface SessionStorageAdapter {
  saveSession(record: StoredSessionRecord): Promise<void>;
  loadSession(sessionId: string): Promise<StoredSessionRecord | null>;
  deleteSession(sessionId: string): Promise<void>;
}

export class MemorySessionStorageAdapter implements SessionStorageAdapter {
  private readonly records = new Map<string, StoredSessionRecord>();

  async saveSession(record: StoredSessionRecord): Promise<void> {
    this.records.set(record.session.sessionId, structuredClone(record));
  }

  async loadSession(sessionId: string): Promise<StoredSessionRecord | null> {
    const record = this.records.get(sessionId);
    return record ? structuredClone(record) : null;
  }

  async deleteSession(sessionId: string): Promise<void> {
    this.records.delete(sessionId);
  }
}

export function createStoredSessionRecord(session: SessionState): StoredSessionRecord {
  return {
    session: structuredClone(session),
    savedAt: new Date().toISOString(),
    version: 1,
  };
}
