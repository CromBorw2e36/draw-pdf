/**
 * DataPanel - Variables data input panel
 */

import { eventBus, Events } from '../core/EventBus.js';
import { store } from '../core/Store.js';
import { readFileAsText, debounce } from '../utils/helpers.js';

class DataPanel {
  constructor() {
    this.variablesList = null;
    this.detectedVariables = new Set();
    
    this.init();
  }

  /**
   * Initialize the data panel
   */
  init() {
    this.variablesList = document.getElementById('variablesList');
    this.setupEventListeners();
    this.setupLoadButton();
    
    console.log('✅ DataPanel initialized');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    eventBus.on(Events.VARIABLES_DETECTED, (data) => {
      data.variables.forEach(v => this.detectedVariables.add(v));
      this.renderVariables();
    });
  }

  /**
   * Setup load JSON button
   */
  setupLoadButton() {
    const btnLoadData = document.getElementById('btnLoadData');
    
    btnLoadData?.addEventListener('click', () => {
      const input = document.createElement('input');
      input.type = 'file';
      input.accept = '.json';
      
      input.onchange = async (e) => {
        const file = e.target.files[0];
        if (file) {
          try {
            const text = await readFileAsText(file);
            const data = JSON.parse(text);
            this.loadVariablesData(data);
          } catch (err) {
            console.error('Failed to load JSON:', err);
            alert('Invalid JSON file');
          }
        }
      };
      
      input.click();
    });
  }

  /**
   * Render variables list
   */
  renderVariables() {
    if (!this.variablesList) return;
    
    if (this.detectedVariables.size === 0) {
      this.variablesList.innerHTML = '<p class="variables-empty">No variables detected</p>';
      return;
    }

    const currentData = store.get('variables.data') || {};
    
    this.variablesList.innerHTML = Array.from(this.detectedVariables).map(varName => `
      <div class="variable-item">
        <span class="variable-item__name">{{${varName}}}</span>
        <input 
          type="text" 
          class="variable-item__input" 
          data-variable="${varName}"
          value="${currentData[varName] || ''}"
          placeholder="Enter value..."
        >
      </div>
    `).join('');

    // Add input listeners
    this.variablesList.querySelectorAll('.variable-item__input').forEach(input => {
      input.addEventListener('input', debounce((e) => {
        const varName = e.target.dataset.variable;
        const value = e.target.value;
        
        const data = store.get('variables.data') || {};
        data[varName] = value;
        store.set('variables.data', data);
        
        eventBus.emit(Events.VARIABLES_DATA_CHANGE, { name: varName, value });
      }, 200));
    });

    // Update store
    store.set('variables.detected', Array.from(this.detectedVariables));
  }

  /**
   * Load variables data from JSON
   */
  loadVariablesData(data) {
    // Add keys to detected variables
    Object.keys(data).forEach(key => this.detectedVariables.add(key));
    
    // Update store
    store.set('variables.data', data);
    
    // Re-render
    this.renderVariables();
    
    // Emit event
    eventBus.emit(Events.VARIABLES_DATA_CHANGE, { data });
  }

  /**
   * Get all variables data
   */
  getData() {
    return store.get('variables.data') || {};
  }

  /**
   * Clear all variables
   */
  clear() {
    this.detectedVariables.clear();
    store.set('variables.data', {});
    store.set('variables.detected', []);
    this.renderVariables();
  }
}

export default DataPanel;
