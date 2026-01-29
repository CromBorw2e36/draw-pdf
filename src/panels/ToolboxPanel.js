/**
 * ToolboxPanel - Left sidebar with draggable elements
 */

import { eventBus, Events } from '../core/EventBus.js';
import { ELEMENT_TYPES } from '../utils/constants.js';

class ToolboxPanel {
  constructor(panelId) {
    this.panelId = panelId;
    this.panel = null;
    
    this.init();
  }

  /**
   * Initialize the toolbox panel
   */
  init() {
    this.panel = document.getElementById(this.panelId);
    if (!this.panel) {
      console.error('ToolboxPanel: Panel element not found');
      return;
    }

    this.setupDragEvents();
    console.log('✅ ToolboxPanel initialized');
  }

  /**
   * Setup drag events for toolbox items
   */
  setupDragEvents() {
    const items = this.panel.querySelectorAll('.toolbox__item');
    
    items.forEach(item => {
      item.addEventListener('dragstart', (e) => {
        const elementType = item.dataset.elementType;
        e.dataTransfer.setData('element-type', elementType);
        e.dataTransfer.effectAllowed = 'copy';
        
        item.classList.add('dragging');
        
        // Create custom drag image
        const dragPreview = document.createElement('div');
        dragPreview.className = 'drag-preview';
        dragPreview.textContent = this.getElementLabel(elementType);
        document.body.appendChild(dragPreview);
        e.dataTransfer.setDragImage(dragPreview, 50, 20);
        
        // Remove after drag
        setTimeout(() => dragPreview.remove(), 0);
      });

      item.addEventListener('dragend', () => {
        item.classList.remove('dragging');
      });
    });
  }

  /**
   * Get element label for drag preview
   */
  getElementLabel(type) {
    const labels = {
      [ELEMENT_TYPES.TEXT]: '📝 Text',
      [ELEMENT_TYPES.IMAGE]: '🖼️ Image',
      [ELEMENT_TYPES.TABLE]: '📊 Table',
      [ELEMENT_TYPES.SIGNATURE]: '✍️ Signature',
      [ELEMENT_TYPES.SHAPE]: '⬜ Shape',
      [ELEMENT_TYPES.LINE]: '➖ Line'
    };
    return labels[type] || type;
  }
}

export default ToolboxPanel;
