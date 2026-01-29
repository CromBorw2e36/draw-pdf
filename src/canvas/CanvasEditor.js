/**
 * CanvasEditor - Main Fabric.js Canvas Controller
 * Handles canvas initialization, element manipulation, and events
 */

// Import Fabric.js - using * as fabric for compatibility
import * as fabricModule from 'fabric';
const fabric = fabricModule.fabric || fabricModule;

import { eventBus, Events } from '../core/EventBus.js';
import { store } from '../core/Store.js';
import { 
  generateId, 
  mmToPx, 
  pxToMm, 
  extractVariables,
  debounce 
} from '../utils/helpers.js';
import { 
  PAGE_SIZES, 
  DEFAULT_STYLES, 
  ELEMENT_TYPES,
  ZOOM,
  GRID
} from '../utils/constants.js';

class CanvasEditor {
  constructor(canvasId, containerId) {
    this.canvasId = canvasId;
    this.containerId = containerId;
    this.canvas = null;
    this.container = null;
    this.currentZoom = ZOOM.DEFAULT;
    
    // Page dimensions in pixels
    this.pageWidth = mmToPx(PAGE_SIZES.A4.width);
    this.pageHeight = mmToPx(PAGE_SIZES.A4.height);
    
    this.init();
  }

  /**
   * Initialize the canvas
   */
  init() {
    this.container = document.getElementById(this.containerId);
    
    // Create Fabric canvas
    this.canvas = new fabric.Canvas(this.canvasId, {
      width: this.pageWidth,
      height: this.pageHeight,
      backgroundColor: '#ffffff',
      selection: true,
      preserveObjectStacking: true,
      controlsAboveOverlay: true
    });

    // Setup event listeners
    this.setupEventListeners();
    
    // Setup drag and drop
    this.setupDragAndDrop();
    
    // Setup grid (optional)
    this.setupGrid();
    
    // Emit ready event
    eventBus.emit(Events.CANVAS_READY, { canvas: this.canvas });
    
    console.log('✅ CanvasEditor initialized');
  }

  /**
   * Setup canvas event listeners
   */
  setupEventListeners() {
    // Selection events
    this.canvas.on('selection:created', (e) => {
      this.handleSelection(e.selected[0]);
    });

    this.canvas.on('selection:updated', (e) => {
      this.handleSelection(e.selected[0]);
    });

    this.canvas.on('selection:cleared', () => {
      store.set('editor.selectedElementId', null);
      eventBus.emit(Events.ELEMENT_DESELECTED);
    });

    // Object modification events
    this.canvas.on('object:modified', (e) => {
      this.handleObjectModified(e.target);
    });

    this.canvas.on('object:moving', debounce((e) => {
      this.handleObjectModified(e.target);
    }, 50));

    this.canvas.on('object:scaling', debounce((e) => {
      this.handleObjectModified(e.target);
    }, 50));

    // Text editing
    this.canvas.on('text:changed', (e) => {
      this.handleTextChanged(e.target);
    });
  }

  /**
   * Handle element selection
   */
  handleSelection(obj) {
    if (!obj) return;
    
    store.set('editor.selectedElementId', obj.id);
    
    eventBus.emit(Events.ELEMENT_SELECTED, {
      id: obj.id,
      type: obj.elementType,
      properties: this.getObjectProperties(obj)
    });
  }

  /**
   * Handle object modification
   */
  handleObjectModified(obj) {
    if (!obj) return;
    
    const properties = this.getObjectProperties(obj);
    
    // Update store
    this.updateElementInStore(obj.id, properties);
    
    eventBus.emit(Events.ELEMENT_MODIFIED, {
      id: obj.id,
      properties
    });
  }

  /**
   * Handle text content change
   */
  handleTextChanged(obj) {
    if (!obj) return;
    
    const text = obj.text || '';
    const variables = extractVariables(text);
    
    if (variables.length > 0) {
      eventBus.emit(Events.VARIABLES_DETECTED, { variables });
    }
    
    this.handleObjectModified(obj);
  }

  /**
   * Get object properties for display
   */
  getObjectProperties(obj) {
    const base = {
      id: obj.id,
      type: obj.elementType,
      x: Math.round(pxToMm(obj.left)),
      y: Math.round(pxToMm(obj.top)),
      width: Math.round(pxToMm(obj.width * (obj.scaleX || 1))),
      height: Math.round(pxToMm(obj.height * (obj.scaleY || 1))),
      angle: obj.angle || 0
    };

    // Add type-specific properties
    if (obj.elementType === ELEMENT_TYPES.TEXT) {
      return {
        ...base,
        content: obj.text || '',
        fontSize: obj.fontSize,
        fontFamily: obj.fontFamily,
        fontWeight: obj.fontWeight,
        fontStyle: obj.fontStyle,
        fill: obj.fill,
        textAlign: obj.textAlign
      };
    }

    if (obj.elementType === ELEMENT_TYPES.IMAGE) {
      return {
        ...base,
        src: obj.getSrc ? obj.getSrc() : ''
      };
    }

    return base;
  }

  /**
   * Update element in store
   */
  updateElementInStore(id, properties) {
    const currentPage = store.get('editor.currentPage');
    const pages = store.get('template.pages');
    
    if (pages[currentPage]) {
      const elements = pages[currentPage].elements;
      const index = elements.findIndex(el => el.id === id);
      
      if (index !== -1) {
        pages[currentPage].elements[index] = {
          ...elements[index],
          ...properties
        };
        store.set('template.pages', pages);
      }
    }
  }

  /**
   * Setup drag and drop from toolbox
   */
  setupDragAndDrop() {
    const canvasContainer = document.getElementById(this.containerId);
    
    canvasContainer.addEventListener('dragover', (e) => {
      e.preventDefault();
      canvasContainer.classList.add('drag-over');
    });

    canvasContainer.addEventListener('dragleave', (e) => {
      e.preventDefault();
      canvasContainer.classList.remove('drag-over');
    });

    canvasContainer.addEventListener('drop', (e) => {
      e.preventDefault();
      canvasContainer.classList.remove('drag-over');
      
      const elementType = e.dataTransfer.getData('element-type');
      if (elementType) {
        const rect = canvasContainer.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        this.addElement(elementType, x, y);
      }
    });
  }

  /**
   * Add element to canvas
   */
  addElement(type, x = 100, y = 100) {
    let fabricObj;
    const id = generateId();

    switch (type) {
      case ELEMENT_TYPES.TEXT:
        fabricObj = this.createTextElement(id, x, y);
        break;
      case ELEMENT_TYPES.IMAGE:
        fabricObj = this.createImagePlaceholder(id, x, y);
        break;
      case ELEMENT_TYPES.SIGNATURE:
        fabricObj = this.createSignatureElement(id, x, y);
        break;
      case ELEMENT_TYPES.SHAPE:
        fabricObj = this.createShapeElement(id, x, y);
        break;
      case ELEMENT_TYPES.LINE:
        fabricObj = this.createLineElement(id, x, y);
        break;
      case ELEMENT_TYPES.TABLE:
        fabricObj = this.createTablePlaceholder(id, x, y);
        break;
      default:
        console.warn('Unknown element type:', type);
        return;
    }

    if (fabricObj) {
      fabricObj.id = id;
      fabricObj.elementType = type;
      
      this.canvas.add(fabricObj);
      this.canvas.setActiveObject(fabricObj);
      this.canvas.renderAll();

      // Add to store
      this.addElementToStore(id, type, this.getObjectProperties(fabricObj));
      
      eventBus.emit(Events.ELEMENT_ADDED, {
        id,
        type,
        properties: this.getObjectProperties(fabricObj)
      });
    }

    return fabricObj;
  }

  /**
   * Create text element
   */
  createTextElement(id, x, y) {
    return new fabric.IText('Enter text or {{variable}}', {
      left: x,
      top: y,
      fontSize: DEFAULT_STYLES.text.fontSize,
      fontFamily: 'Inter, sans-serif',
      fill: DEFAULT_STYLES.text.fill,
      editable: true,
      ...this.getDefaultControls()
    });
  }

  /**
   * Create image placeholder
   */
  createImagePlaceholder(id, x, y) {
    const width = mmToPx(DEFAULT_STYLES.image.width);
    const height = mmToPx(DEFAULT_STYLES.image.height);
    
    const group = new fabric.Group([
      new fabric.Rect({
        width,
        height,
        fill: '#f0f0f0',
        stroke: '#cccccc',
        strokeWidth: 1,
        strokeDashArray: [5, 5]
      }),
      new fabric.Text('🖼️', {
        fontSize: 40,
        originX: 'center',
        originY: 'center',
        left: width / 2,
        top: height / 2 - 10
      }),
      new fabric.Text('Drop image or {{variable}}', {
        fontSize: 10,
        fill: '#888888',
        originX: 'center',
        left: width / 2,
        top: height / 2 + 25
      })
    ], {
      left: x,
      top: y,
      ...this.getDefaultControls()
    });

    return group;
  }

  /**
   * Create signature element
   */
  createSignatureElement(id, x, y) {
    const width = mmToPx(DEFAULT_STYLES.signature.width);
    const height = mmToPx(DEFAULT_STYLES.signature.height);
    
    const group = new fabric.Group([
      new fabric.Rect({
        width,
        height,
        fill: 'transparent',
        stroke: '#000000',
        strokeWidth: 1,
        strokeDashArray: [3, 3]
      }),
      new fabric.Text('✍️ Signature', {
        fontSize: 10,
        fill: '#666666',
        originX: 'center',
        originY: 'center',
        left: width / 2,
        top: height / 2
      })
    ], {
      left: x,
      top: y,
      ...this.getDefaultControls()
    });

    return group;
  }

  /**
   * Create shape element (rectangle)
   */
  createShapeElement(id, x, y) {
    return new fabric.Rect({
      left: x,
      top: y,
      width: mmToPx(DEFAULT_STYLES.shape.width),
      height: mmToPx(DEFAULT_STYLES.shape.height),
      fill: DEFAULT_STYLES.shape.fill,
      stroke: DEFAULT_STYLES.shape.stroke,
      strokeWidth: DEFAULT_STYLES.shape.strokeWidth,
      ...this.getDefaultControls()
    });
  }

  /**
   * Create line element
   */
  createLineElement(id, x, y) {
    return new fabric.Line([x, y, x + 100, y], {
      stroke: DEFAULT_STYLES.line.stroke,
      strokeWidth: DEFAULT_STYLES.line.strokeWidth,
      ...this.getDefaultControls()
    });
  }

  /**
   * Create table placeholder
   */
  createTablePlaceholder(id, x, y) {
    const width = mmToPx(150);
    const height = mmToPx(80);
    
    const group = new fabric.Group([
      new fabric.Rect({
        width,
        height,
        fill: '#f8f8f8',
        stroke: '#cccccc',
        strokeWidth: 1
      }),
      new fabric.Text('📊 Table', {
        fontSize: 14,
        fill: '#666666',
        originX: 'center',
        originY: 'center',
        left: width / 2,
        top: height / 2 - 10
      }),
      new fabric.Text('{{tableData}}', {
        fontSize: 10,
        fill: '#888888',
        fontFamily: 'monospace',
        originX: 'center',
        left: width / 2,
        top: height / 2 + 15
      })
    ], {
      left: x,
      top: y,
      ...this.getDefaultControls()
    });

    return group;
  }

  /**
   * Get default control settings
   */
  getDefaultControls() {
    return {
      cornerColor: '#6366f1',
      cornerStrokeColor: '#ffffff',
      cornerStyle: 'circle',
      cornerSize: 10,
      transparentCorners: false,
      borderColor: '#6366f1',
      borderScaleFactor: 2
    };
  }

  /**
   * Add element to store
   */
  addElementToStore(id, type, properties) {
    const currentPage = store.get('editor.currentPage');
    const pages = store.get('template.pages');
    
    if (pages[currentPage]) {
      pages[currentPage].elements.push({
        id,
        type,
        ...properties
      });
      store.set('template.pages', pages);
    }
  }

  /**
   * Delete selected element
   */
  deleteSelected() {
    const activeObject = this.canvas.getActiveObject();
    if (activeObject) {
      const id = activeObject.id;
      this.canvas.remove(activeObject);
      this.removeElementFromStore(id);
      eventBus.emit(Events.ELEMENT_DELETED, { id });
    }
  }

  /**
   * Remove element from store
   */
  removeElementFromStore(id) {
    const currentPage = store.get('editor.currentPage');
    const pages = store.get('template.pages');
    
    if (pages[currentPage]) {
      pages[currentPage].elements = pages[currentPage].elements.filter(el => el.id !== id);
      store.set('template.pages', pages);
    }
  }

  /**
   * Update selected element properties
   */
  updateSelectedProperties(properties) {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject) return;

    // Update Fabric object
    if (properties.x !== undefined) activeObject.set('left', mmToPx(properties.x));
    if (properties.y !== undefined) activeObject.set('top', mmToPx(properties.y));
    if (properties.content !== undefined && activeObject.set) {
      activeObject.set('text', properties.content);
    }
    if (properties.fontSize !== undefined) activeObject.set('fontSize', properties.fontSize);
    if (properties.fill !== undefined) activeObject.set('fill', properties.fill);
    if (properties.fontWeight !== undefined) activeObject.set('fontWeight', properties.fontWeight);
    if (properties.fontStyle !== undefined) activeObject.set('fontStyle', properties.fontStyle);
    if (properties.textAlign !== undefined) activeObject.set('textAlign', properties.textAlign);

    this.canvas.renderAll();
    this.handleObjectModified(activeObject);
  }

  /**
   * Setup grid
   */
  setupGrid() {
    // Grid can be added as overlay pattern if needed
  }

  /**
   * Zoom canvas
   */
  setZoom(zoom) {
    this.currentZoom = Math.max(ZOOM.MIN, Math.min(ZOOM.MAX, zoom));
    
    const center = this.canvas.getCenter();
    this.canvas.zoomToPoint(new fabric.Point(center.left, center.top), this.currentZoom);
    
    store.set('editor.zoom', this.currentZoom);
    eventBus.emit(Events.CANVAS_ZOOM_CHANGE, { zoom: this.currentZoom });
  }

  /**
   * Zoom in
   */
  zoomIn() {
    this.setZoom(this.currentZoom + ZOOM.STEP);
  }

  /**
   * Zoom out
   */
  zoomOut() {
    this.setZoom(this.currentZoom - ZOOM.STEP);
  }

  /**
   * Reset zoom
   */
  resetZoom() {
    this.setZoom(ZOOM.DEFAULT);
  }

  /**
   * Get canvas state for serialization
   */
  getState() {
    return this.canvas.toJSON(['id', 'elementType']);
  }

  /**
   * Load state into canvas
   */
  loadState(state) {
    this.canvas.loadFromJSON(state, () => {
      this.canvas.renderAll();
    });
  }

  /**
   * Clear canvas
   */
  clear() {
    this.canvas.clear();
    this.canvas.backgroundColor = '#ffffff';
    this.canvas.renderAll();
  }

  /**
   * Duplicate selected element
   */
  duplicateSelected() {
    const activeObject = this.canvas.getActiveObject();
    if (!activeObject) return;

    activeObject.clone((cloned) => {
      cloned.set({
        left: activeObject.left + 20,
        top: activeObject.top + 20,
        id: generateId(),
        elementType: activeObject.elementType
      });
      
      this.canvas.add(cloned);
      this.canvas.setActiveObject(cloned);
      this.canvas.renderAll();
      
      this.addElementToStore(cloned.id, cloned.elementType, this.getObjectProperties(cloned));
    });
  }

  /**
   * Get canvas as image
   */
  toDataURL(options = {}) {
    return this.canvas.toDataURL({
      format: 'png',
      quality: 1,
      ...options
    });
  }
}

export default CanvasEditor;
