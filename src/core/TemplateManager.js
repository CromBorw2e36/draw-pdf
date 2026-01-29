/**
 * TemplateManager - Template save/load/export functionality
 */

import { eventBus, Events } from './EventBus.js';
import { store } from './Store.js';
import { downloadFile, readFileAsText, generateId } from '../utils/helpers.js';

class TemplateManager {
  constructor(canvasEditor) {
    this.canvasEditor = canvasEditor;
    
    this.init();
  }

  /**
   * Initialize template manager
   */
  init() {
    this.setupEventListeners();
    console.log('✅ TemplateManager initialized');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    eventBus.on(Events.TEMPLATE_SAVE, () => this.saveTemplate());
    eventBus.on(Events.TEMPLATE_LOAD, (data) => this.loadTemplate(data));
    eventBus.on(Events.TEMPLATE_CLEAR, () => this.clearTemplate());
  }

  /**
   * Get current template data
   */
  getCurrentTemplate() {
    const template = store.get('template');
    const canvasState = this.canvasEditor?.getState();
    
    return {
      ...template,
      id: template.id || generateId(),
      canvasState,
      exportedAt: new Date().toISOString()
    };
  }

  /**
   * Save template to file
   */
  saveTemplate(filename = null) {
    const template = this.getCurrentTemplate();
    const name = filename || `${template.name || 'template'}.json`;
    
    const json = JSON.stringify(template, null, 2);
    downloadFile(json, name, 'application/json');
    
    console.log('📄 Template saved:', name);
    return template;
  }

  /**
   * Save template to localStorage
   */
  saveToLocalStorage(key = 'pdf_builder_autosave') {
    const template = this.getCurrentTemplate();
    try {
      localStorage.setItem(key, JSON.stringify(template));
      console.log('💾 Template auto-saved to localStorage');
    } catch (e) {
      console.error('Failed to save to localStorage:', e);
    }
  }

  /**
   * Load template from file
   */
  async loadTemplateFromFile() {
    return new Promise((resolve, reject) => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const text = await readFileAsText(file);
            const template = JSON.parse(text);
            this.loadTemplate(template);
            resolve(template);
          } catch (err) {
            console.error('Failed to load template:', err);
            reject(err);
          }
        }
      };
      
      input.click();
    });
  }

  /**
   * Load template from localStorage
   */
  loadFromLocalStorage(key = 'pdf_builder_autosave') {
    try {
      const saved = localStorage.getItem(key);
      if (saved) {
        const template = JSON.parse(saved);
        this.loadTemplate(template);
        return template;
      }
    } catch (e) {
      console.error('Failed to load from localStorage:', e);
    }
    return null;
  }

  /**
   * Load template into editor
   */
  loadTemplate(template) {
    if (!template) return;
    
    // Update store
    store.set('template', {
      id: template.id,
      name: template.name,
      version: template.version,
      pageSize: template.pageSize,
      margins: template.margins,
      pages: template.pages || [{ pageNumber: 1, elements: [] }]
    });
    
    // Load canvas state
    if (template.canvasState && this.canvasEditor) {
      this.canvasEditor.loadState(template.canvasState);
    }
    
    console.log('📂 Template loaded:', template.name);
  }

  /**
   * Clear current template
   */
  clearTemplate() {
    // Reset store
    store.set('template', {
      id: null,
      name: 'Untitled Template',
      version: '1.0',
      pageSize: { width: 210, height: 297, unit: 'mm' },
      margins: { top: 20, right: 15, bottom: 20, left: 15 },
      pages: [{ pageNumber: 1, elements: [] }]
    });
    
    // Clear canvas
    if (this.canvasEditor) {
      this.canvasEditor.clear();
    }
    
    console.log('🗑️ Template cleared');
  }

  /**
   * Export template for sharing
   */
  exportTemplate() {
    const template = this.getCurrentTemplate();
    
    // Remove canvas state for lighter export
    const exportData = {
      ...template,
      canvasState: undefined
    };
    
    return exportData;
  }

  /**
   * Import template from data
   */
  importTemplate(data) {
    this.loadTemplate(data);
  }
}

export default TemplateManager;
