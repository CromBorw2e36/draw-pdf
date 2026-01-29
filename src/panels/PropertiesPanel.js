/**
 * PropertiesPanel - Right sidebar for element properties
 */

import { eventBus, Events } from '../core/EventBus.js';
import { store } from '../core/Store.js';
import { ELEMENT_TYPES } from '../utils/constants.js';
import { extractVariables, debounce } from '../utils/helpers.js';

class PropertiesPanel {
  constructor(panelId, canvasEditor) {
    this.panelId = panelId;
    this.canvasEditor = canvasEditor;
    this.panel = null;
    this.currentElement = null;
    
    // DOM elements
    this.emptyState = null;
    this.form = null;
    this.textProperties = null;
    this.imageProperties = null;
    
    this.init();
  }

  /**
   * Initialize the properties panel
   */
  init() {
    this.panel = document.getElementById(this.panelId);
    if (!this.panel) {
      console.error('PropertiesPanel: Panel element not found');
      return;
    }

    // Cache DOM elements
    this.emptyState = document.getElementById('propertiesEmpty');
    this.form = document.getElementById('propertiesForm');
    this.textProperties = document.getElementById('textProperties');
    this.imageProperties = document.getElementById('imageProperties');
    
    // Setup event listeners
    this.setupEventListeners();
    this.setupFormListeners();
    
    console.log('✅ PropertiesPanel initialized');
  }

  /**
   * Setup event bus listeners
   */
  setupEventListeners() {
    eventBus.on(Events.ELEMENT_SELECTED, (data) => {
      this.showProperties(data);
    });

    eventBus.on(Events.ELEMENT_DESELECTED, () => {
      this.hideProperties();
    });

    eventBus.on(Events.ELEMENT_MODIFIED, (data) => {
      if (this.currentElement && this.currentElement.id === data.id) {
        this.updateFormValues(data.properties);
      }
    });
  }

  /**
   * Setup form input listeners
   */
  setupFormListeners() {
    // Position inputs
    const propX = document.getElementById('propX');
    const propY = document.getElementById('propY');
    const propWidth = document.getElementById('propWidth');
    const propHeight = document.getElementById('propHeight');

    // Text inputs
    const propContent = document.getElementById('propContent');
    const propFontSize = document.getElementById('propFontSize');
    const propColor = document.getElementById('propColor');

    // Style toggles
    const propBold = document.getElementById('propBold');
    const propItalic = document.getElementById('propItalic');
    const propAlignLeft = document.getElementById('propAlignLeft');
    const propAlignCenter = document.getElementById('propAlignCenter');
    const propAlignRight = document.getElementById('propAlignRight');

    // Debounced update function
    const updateProperty = debounce((property, value) => {
      if (this.canvasEditor) {
        this.canvasEditor.updateSelectedProperties({ [property]: value });
      }
    }, 100);

    // Position listeners
    propX?.addEventListener('input', (e) => updateProperty('x', parseFloat(e.target.value)));
    propY?.addEventListener('input', (e) => updateProperty('y', parseFloat(e.target.value)));

    // Text content listener
    propContent?.addEventListener('input', (e) => {
      const content = e.target.value;
      updateProperty('content', content);
      
      // Detect variables
      const variables = extractVariables(content);
      if (variables.length > 0) {
        eventBus.emit(Events.VARIABLES_DETECTED, { variables });
      }
    });

    // Font size listener
    propFontSize?.addEventListener('input', (e) => {
      updateProperty('fontSize', parseInt(e.target.value));
    });

    // Color listener
    propColor?.addEventListener('input', (e) => {
      updateProperty('fill', e.target.value);
    });

    // Style toggle listeners
    propBold?.addEventListener('click', () => {
      propBold.classList.toggle('active');
      updateProperty('fontWeight', propBold.classList.contains('active') ? 'bold' : 'normal');
    });

    propItalic?.addEventListener('click', () => {
      propItalic.classList.toggle('active');
      updateProperty('fontStyle', propItalic.classList.contains('active') ? 'italic' : 'normal');
    });

    // Alignment listeners
    const alignButtons = [propAlignLeft, propAlignCenter, propAlignRight];
    const alignValues = ['left', 'center', 'right'];
    
    alignButtons.forEach((btn, index) => {
      btn?.addEventListener('click', () => {
        alignButtons.forEach(b => b?.classList.remove('active'));
        btn.classList.add('active');
        updateProperty('textAlign', alignValues[index]);
      });
    });
  }

  /**
   * Show properties for selected element
   */
  showProperties(data) {
    this.currentElement = data;
    
    // Show form, hide empty state
    if (this.emptyState) this.emptyState.style.display = 'none';
    if (this.form) this.form.style.display = 'block';
    
    // Show/hide type-specific sections
    if (this.textProperties) {
      this.textProperties.style.display = 
        data.type === ELEMENT_TYPES.TEXT ? 'block' : 'none';
    }
    
    if (this.imageProperties) {
      this.imageProperties.style.display = 
        data.type === ELEMENT_TYPES.IMAGE ? 'block' : 'none';
    }
    
    // Update form values
    this.updateFormValues(data.properties);
  }

  /**
   * Hide properties panel
   */
  hideProperties() {
    this.currentElement = null;
    
    if (this.emptyState) this.emptyState.style.display = 'block';
    if (this.form) this.form.style.display = 'none';
  }

  /**
   * Update form values
   */
  updateFormValues(properties) {
    // Position
    this.setInputValue('propX', properties.x);
    this.setInputValue('propY', properties.y);
    this.setInputValue('propWidth', properties.width);
    this.setInputValue('propHeight', properties.height);
    
    // Text properties
    if (properties.content !== undefined) {
      this.setInputValue('propContent', properties.content);
    }
    if (properties.fontSize !== undefined) {
      this.setInputValue('propFontSize', properties.fontSize);
    }
    if (properties.fill !== undefined) {
      this.setInputValue('propColor', properties.fill);
    }
    
    // Style toggles
    this.setToggleState('propBold', properties.fontWeight === 'bold');
    this.setToggleState('propItalic', properties.fontStyle === 'italic');
    
    // Alignment
    const alignButtons = ['propAlignLeft', 'propAlignCenter', 'propAlignRight'];
    const alignValues = ['left', 'center', 'right'];
    alignButtons.forEach((id, index) => {
      this.setToggleState(id, properties.textAlign === alignValues[index]);
    });
  }

  /**
   * Set input value
   */
  setInputValue(id, value) {
    const input = document.getElementById(id);
    if (input && value !== undefined) {
      input.value = value;
    }
  }

  /**
   * Set toggle button state
   */
  setToggleState(id, active) {
    const btn = document.getElementById(id);
    if (btn) {
      btn.classList.toggle('active', active);
    }
  }
}

export default PropertiesPanel;
