import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root' // Makes the service available throughout the application
})
export class WordsService {
  private db!: IDBDatabase;

  constructor() {
    this.initDB();
  }

  private initDB() {
    const request = indexedDB.open('WordLearner', 1);

    request.onupgradeneeded = (event) => {
      const db = (event.target as IDBOpenDBRequest).result;
      db.createObjectStore('words', { keyPath: 'id' });
    };

    request.onsuccess = (event) => {
      this.db = (event.target as IDBOpenDBRequest).result;
      console.log('IndexedDB initialized successfully');
    };

    request.onerror = (event) => {
      console.error('IndexedDB error:', (event.target as IDBRequest).error);
    };
  }

  saveData(key: string, data: string): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('words', 'readwrite');
      const store = transaction.objectStore('words');
      const request = store.put({ id: key, data });

      request.onsuccess = () => {
        console.log('Data saved successfully');
        resolve();
      };

      request.onerror = (event) => {
        console.error('Error saving data:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }

  getData(key: string): Promise<string | null> {
    return new Promise((resolve, reject) => {
      const transaction = this.db.transaction('words', 'readonly');
      const store = transaction.objectStore('words');
      const request = store.get(key);

      request.onsuccess = (event) => {
        const result = (event.target as IDBRequest).result;
        resolve(result ? result.data : null);
      };

      request.onerror = (event) => {
        console.error('Error retrieving data:', (event.target as IDBRequest).error);
        reject((event.target as IDBRequest).error);
      };
    });
  }
}