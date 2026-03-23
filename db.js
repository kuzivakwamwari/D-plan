/**
 * db.js — IndexedDB CRUD layer
 * ─────────────────────────────
 * Two object stores:
 *   • contacts  — name, phone, email, category
 *   • users     — username, email, role, bio, avatar colour
 *
 * Exports a single `db` object used by all pages.
 */

const DB_NAME    = 'pwa_app_db';
const DB_VERSION = 1;

const db = (() => {

  // ── Open / initialise the database ──────────────────────────────
  function openDB() {
    return new Promise((resolve, reject) => {
      const req = indexedDB.open(DB_NAME, DB_VERSION);

      req.onupgradeneeded = e => {
        const database = e.target.result;

        // Contacts store
        if (!database.objectStoreNames.contains('contacts')) {
          const cs = database.createObjectStore('contacts', {
            keyPath: 'id',
            autoIncrement: true
          });
          cs.createIndex('email',    'email',    { unique: false });
          cs.createIndex('category', 'category', { unique: false });
        }

        // Users store
        if (!database.objectStoreNames.contains('users')) {
          const us = database.createObjectStore('users', {
            keyPath: 'id',
            autoIncrement: true
          });
          us.createIndex('username', 'username', { unique: true });
          us.createIndex('email',    'email',    { unique: true });
        }
      };

      req.onsuccess = e => resolve(e.target.result);
      req.onerror   = e => reject(e.target.error);
    });
  }

  // ── Generic helpers ──────────────────────────────────────────────

  /**
   * getAll(storeName)
   * Returns all records from the given store.
   */
  async function getAll(storeName) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = database.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req   = store.getAll();
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  /**
   * getById(storeName, id)
   * Returns a single record by its numeric id.
   */
  async function getById(storeName, id) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = database.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req   = store.get(Number(id));
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  /**
   * add(storeName, data)
   * Adds a new record. Returns the generated id.
   */
  async function add(storeName, data) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const record = { ...data, createdAt: new Date().toISOString() };
      const req = store.add(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  /**
   * update(storeName, data)
   * Updates an existing record. data must include the id field.
   */
  async function update(storeName, data) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const record = { ...data, updatedAt: new Date().toISOString() };
      const req = store.put(record);
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  /**
   * remove(storeName, id)
   * Deletes a record by id.
   */
  async function remove(storeName, id) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = database.transaction(storeName, 'readwrite');
      const store = tx.objectStore(storeName);
      const req   = store.delete(Number(id));
      req.onsuccess = () => resolve(true);
      req.onerror   = () => reject(req.error);
    });
  }

  /**
   * count(storeName)
   * Returns the total number of records in a store.
   */
  async function count(storeName) {
    const database = await openDB();
    return new Promise((resolve, reject) => {
      const tx    = database.transaction(storeName, 'readonly');
      const store = tx.objectStore(storeName);
      const req   = store.count();
      req.onsuccess = () => resolve(req.result);
      req.onerror   = () => reject(req.error);
    });
  }

  // ── Contacts API ────────────────────────────────────────────────
  const contacts = {
    getAll:   ()     => getAll('contacts'),
    getById:  (id)   => getById('contacts', id),
    add:      (data) => add('contacts', data),
    update:   (data) => update('contacts', data),
    remove:   (id)   => remove('contacts', id),
    count:    ()     => count('contacts'),
  };

  // ── Users API ────────────────────────────────────────────────────
  const users = {
    getAll:   ()     => getAll('users'),
    getById:  (id)   => getById('users', id),
    add:      (data) => add('users', data),
    update:   (data) => update('users', data),
    remove:   (id)   => remove('users', id),
    count:    ()     => count('users'),
  };

  return { contacts, users };
})();
