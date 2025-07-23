import { Injectable } from '@angular/core';
import { AppSettings } from './settings/settings.component'; // Corrected import path for AppSettings

@Injectable({
  providedIn: 'root' // Makes the service available throughout the application
})
export class WordsService {
  private db!: IDBDatabase;
  private dbInitialized: Promise<void>; // Promise to track DB initialization

  constructor() {
    this.dbInitialized = this.initDB(); // Initialize the promise in the constructor
  }

  private initDB(): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('WordLearner', 2);

      request.onupgradeneeded = (event) => {
        const db = (event.target as IDBOpenDBRequest).result;
        // Create object stores if they don't exist
        if (!db.objectStoreNames.contains('words')) {
          db.createObjectStore('words', { keyPath: 'id' });
          console.log('IndexedDB object store "words" created.');
        }
        if (!db.objectStoreNames.contains('settings')) {
          db.createObjectStore('settings', { keyPath: 'id' });
          console.log('IndexedDB object store "settings" created.');
        }
      };

      request.onsuccess = (event) => {
        this.db = (event.target as IDBOpenDBRequest).result;
        console.log('IndexedDB initialized successfully');
        resolve(); // Resolve the promise when DB is ready
      };

      request.onerror = (event) => {
        console.error('IndexedDB error:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error); // Reject the promise on error
      };
    });
  }

  // Helper to ensure DB is initialized before transaction
  private async getDB(): Promise<IDBDatabase> {
    await this.dbInitialized; // Wait for the DB to be initialized
    return this.db;
  }

  // --- Methods for 'words' object store ---
  async saveData(key: string, data: string): Promise<void> {
    const db = await this.getDB(); // Ensure DB is ready
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('words', 'readwrite');
      const store = transaction.objectStore('words');
      const request = store.put({ id: key, data });

      request.onsuccess = () => {
        console.log(`Data for key "${key}" saved successfully.`);
        resolve();
      };

      request.onerror = (event) => {
        console.error(`Error saving data for key "${key}":`, (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async getData(key: string): Promise<string | null> {
    const db = await this.getDB(); // Ensure DB is ready
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('words', 'readonly');
      const store = transaction.objectStore('words');
      const request = store.get(key);

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        resolve(result ? result.data : null);
      };

      request.onerror = (event) => {
        console.error(`Error retrieving data for key "${key}":`, (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  // --- Methods for 'settings' object store ---
  async saveSettings(settings: AppSettings): Promise<void> {
    const db = await this.getDB(); // Ensure DB is ready
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('settings', 'readwrite');
      const store = transaction.objectStore('settings');
      // Store settings with a fixed ID, e.g., 'appSettings'
      const request = store.put({ id: 'appSettings', data: settings }); // Using 'data' key for consistency

      request.onsuccess = () => {
        console.log('Settings saved successfully to IndexedDB.');
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error saving settings to IndexedDB:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  async getSettings(): Promise<AppSettings | null> {
    const db = await this.getDB(); // Ensure DB is ready
    return new Promise((resolve, reject) => {
      const transaction = db.transaction('settings', 'readonly');
      const store = transaction.objectStore('settings');
      const request = store.get('appSettings'); // Retrieve settings using the fixed ID

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        resolve(result ? result.data : null);
      };

      request.onerror = (event) => {
        console.error('Error retrieving settings from IndexedDB:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }
}
