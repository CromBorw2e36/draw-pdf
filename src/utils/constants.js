/**
 * App Constants
 */

// Page sizes in mm
export const PAGE_SIZES = {
  A4: { width: 210, height: 297, name: 'A4' },
  A3: { width: 297, height: 420, name: 'A3' },
  LETTER: { width: 216, height: 279, name: 'Letter' },
  LEGAL: { width: 216, height: 356, name: 'Legal' }
};

// Default page settings
export const DEFAULT_PAGE = {
  size: PAGE_SIZES.A4,
  margins: { top: 20, right: 15, bottom: 20, left: 15 },
  orientation: 'portrait'
};

// Scale factor: mm to pixels (at 96 DPI)
export const MM_TO_PX = 3.7795275591;
export const PX_TO_MM = 1 / MM_TO_PX;

// Element types
export const ELEMENT_TYPES = {
  TEXT: 'text',
  IMAGE: 'image',
  TABLE: 'table',
  SIGNATURE: 'signature',
  SHAPE: 'shape',
  LINE: 'line'
};

// Default element styles
export const DEFAULT_STYLES = {
  text: {
    fontSize: 12,
    fontFamily: 'Roboto',
    fontStyle: 'normal',
    fontWeight: 'normal',
    fill: '#000000',
    textAlign: 'left',
    lineHeight: 1.2
  },
  image: {
    width: 100,
    height: 100
  },
  signature: {
    width: 80,
    height: 40,
    strokeWidth: 1,
    stroke: '#000000',
    fill: 'transparent'
  },
  shape: {
    width: 100,
    height: 100,
    fill: 'transparent',
    stroke: '#000000',
    strokeWidth: 1
  },
  line: {
    stroke: '#000000',
    strokeWidth: 1
  }
};

// Zoom settings
export const ZOOM = {
  MIN: 0.25,
  MAX: 3,
  STEP: 0.1,
  DEFAULT: 1
};

// Grid settings
export const GRID = {
  SIZE: 10, // mm
  COLOR: 'rgba(99, 102, 241, 0.1)'
};

// Variable pattern
export const VARIABLE_PATTERN = /\{\{([^}]+)\}\}/g;

// Keyboard shortcuts
export const SHORTCUTS = {
  UNDO: 'ctrl+z',
  REDO: 'ctrl+y',
  SAVE: 'ctrl+s',
  DELETE: 'delete',
  DUPLICATE: 'ctrl+d',
  SELECT_ALL: 'ctrl+a',
  DESELECT: 'escape',
  ZOOM_IN: 'ctrl++',
  ZOOM_OUT: 'ctrl+-',
  ZOOM_RESET: 'ctrl+0'
};
