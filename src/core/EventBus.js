/**
 * EventBus - Simple Pub/Sub Event System
 * Allows decoupled communication between components
 */

class EventBus {
  constructor() {
    this.events = new Map();
  }

  /**
   * Subscribe to an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   * @returns {Function} Unsubscribe function
   */
  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, new Set());
    }
    this.events.get(event).add(callback);

    // Return unsubscribe function
    return () => this.off(event, callback);
  }

  /**
   * Subscribe to an event once
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  once(event, callback) {
    const wrapper = (...args) => {
      callback(...args);
      this.off(event, wrapper);
    };
    this.on(event, wrapper);
  }

  /**
   * Unsubscribe from an event
   * @param {string} event - Event name
   * @param {Function} callback - Callback function
   */
  off(event, callback) {
    if (this.events.has(event)) {
      this.events.get(event).delete(callback);
    }
  }

  /**
   * Emit an event
   * @param {string} event - Event name
   * @param {*} data - Event data
   */
  emit(event, data) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => {
        try {
          callback(data);
        } catch (error) {
          console.error(`Error in event handler for "${event}":`, error);
        }
      });
    }
  }

  /**
   * Clear all listeners for an event
   * @param {string} event - Event name
   */
  clear(event) {
    if (event) {
      this.events.delete(event);
    } else {
      this.events.clear();
    }
  }
}

// Singleton instance
export const eventBus = new EventBus();

// Event names constants
export const Events = {
  // Canvas events
  CANVAS_READY: 'canvas:ready',
  CANVAS_ZOOM_CHANGE: 'canvas:zoom:change',
  
  // Element events
  ELEMENT_ADDED: 'element:added',
  ELEMENT_SELECTED: 'element:selected',
  ELEMENT_DESELECTED: 'element:deselected',
  ELEMENT_MODIFIED: 'element:modified',
  ELEMENT_DELETED: 'element:deleted',
  
  // Properties events
  PROPERTIES_UPDATE: 'properties:update',
  PROPERTIES_CHANGED: 'properties:changed',
  
  // Template events
  TEMPLATE_LOAD: 'template:load',
  TEMPLATE_SAVE: 'template:save',
  TEMPLATE_CLEAR: 'template:clear',
  
  // Variable events
  VARIABLES_DETECTED: 'variables:detected',
  VARIABLES_DATA_CHANGE: 'variables:data:change',
  
  // Page events
  PAGE_ADD: 'page:add',
  PAGE_CHANGE: 'page:change',
  PAGE_DELETE: 'page:delete',
  
  // Command events
  COMMAND_EXECUTE: 'command:execute',
  COMMAND_UNDO: 'command:undo',
  COMMAND_REDO: 'command:redo',
  
  // PDF events
  PDF_PREVIEW: 'pdf:preview',
  PDF_EXPORT: 'pdf:export'
};

export default EventBus;
