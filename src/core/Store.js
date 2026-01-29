/**
 * Store - Simple State Management
 * Reactive state container with subscription support
 */

import { eventBus, Events } from './EventBus.js';

class Store {
  constructor(initialState = {}) {
    this.state = this.createProxy(initialState);
    this.subscribers = new Map();
  }

  /**
   * Create a reactive proxy for the state
   */
  createProxy(obj, path = '') {
    return new Proxy(obj, {
      get: (target, prop) => {
        const value = target[prop];
        if (value && typeof value === 'object' && !Array.isArray(value)) {
          return this.createProxy(value, path ? `${path}.${prop}` : prop);
        }
        return value;
      },
      set: (target, prop, value) => {
        const oldValue = target[prop];
        target[prop] = value;
        
        const fullPath = path ? `${path}.${prop}` : prop;
        this.notifySubscribers(fullPath, value, oldValue);
        
        return true;
      }
    });
  }

  /**
   * Get current state
   */
  getState() {
    return this.state;
  }

  /**
   * Get a specific value by path
   * @param {string} path - Dot-notation path (e.g., 'template.pages')
   */
  get(path) {
    return path.split('.').reduce((obj, key) => obj?.[key], this.state);
  }

  /**
   * Set a value by path
   * @param {string} path - Dot-notation path
   * @param {*} value - Value to set
   */
  set(path, value) {
    const keys = path.split('.');
    const lastKey = keys.pop();
    const target = keys.reduce((obj, key) => {
      if (!obj[key]) obj[key] = {};
      return obj[key];
    }, this.state);
    target[lastKey] = value;
  }

  /**
   * Subscribe to state changes
   * @param {string} path - Path to watch
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  subscribe(path, callback) {
    if (!this.subscribers.has(path)) {
      this.subscribers.set(path, new Set());
    }
    this.subscribers.get(path).add(callback);
    
    return () => {
      this.subscribers.get(path)?.delete(callback);
    };
  }

  /**
   * Notify subscribers of changes
   */
  notifySubscribers(path, newValue, oldValue) {
    // Notify exact path subscribers
    if (this.subscribers.has(path)) {
      this.subscribers.get(path).forEach(cb => cb(newValue, oldValue, path));
    }

    // Notify parent path subscribers
    const parts = path.split('.');
    while (parts.length > 1) {
      parts.pop();
      const parentPath = parts.join('.');
      if (this.subscribers.has(parentPath)) {
        this.subscribers.get(parentPath).forEach(cb => 
          cb(this.get(parentPath), null, parentPath)
        );
      }
    }

    // Notify wildcard subscribers
    if (this.subscribers.has('*')) {
      this.subscribers.get('*').forEach(cb => cb(newValue, oldValue, path));
    }
  }

  /**
   * Batch update multiple values
   */
  batchUpdate(updates) {
    Object.entries(updates).forEach(([path, value]) => {
      this.set(path, value);
    });
  }

  /**
   * Reset state to initial
   */
  reset(initialState = {}) {
    this.state = this.createProxy(initialState);
    this.notifySubscribers('*', this.state, null);
  }
}

// Create global store instance with initial state
export const store = new Store({
  // Current template
  template: {
    id: null,
    name: 'Untitled Template',
    version: '1.0',
    pageSize: { width: 210, height: 297, unit: 'mm' },
    margins: { top: 20, right: 15, bottom: 20, left: 15 },
    pages: [{ pageNumber: 1, elements: [] }]
  },
  
  // Editor state
  editor: {
    currentPage: 0,
    zoom: 1,
    selectedElementId: null,
    gridEnabled: true,
    snapToGrid: true,
    gridSize: 5
  },
  
  // Variables data
  variables: {
    detected: [],
    data: {}
  },
  
  // UI state
  ui: {
    previewVisible: false,
    isDragging: false
  }
});

export default Store;
