/**
 * Utility Helper Functions
 */

import { MM_TO_PX, PX_TO_MM } from './constants.js';
import { TemplateEngine } from './TemplateEngine.js';

/**
 * Generate unique ID
 * @returns {string}
 */
export function generateId() {
  return 'el_' + Date.now().toString(36) + Math.random().toString(36).substr(2, 5);
}

/**
 * Convert mm to pixels
 * @param {number} mm 
 * @returns {number}
 */
export function mmToPx(mm) {
  return mm * MM_TO_PX;
}

/**
 * Convert pixels to mm
 * @param {number} px 
 * @returns {number}
 */
export function pxToMm(px) {
  return px * PX_TO_MM;
}

/**
 * Extract variables from text content
 * Supports nested paths and special blocks (#each, #if)
 * @param {string} text 
 * @returns {string[]} Array of variable names
 */
export function extractVariables(text) {
  return TemplateEngine.extractVariables(text);
}

/**
 * Replace variables in text with data values
 * Supports: nested objects, #each loops, #if conditionals
 * @param {string} text 
 * @param {Object} data 
 * @returns {string}
 */
export function replaceVariables(text, data) {
  return TemplateEngine.process(text, data);
}

/**
 * Deep clone an object
 * @param {*} obj 
 * @returns {*}
 */
export function deepClone(obj) {
  if (obj === null || typeof obj !== 'object') return obj;
  if (obj instanceof Date) return new Date(obj);
  if (obj instanceof Array) return obj.map(item => deepClone(item));
  if (obj instanceof Object) {
    const copy = {};
    Object.keys(obj).forEach(key => {
      copy[key] = deepClone(obj[key]);
    });
    return copy;
  }
  return obj;
}

/**
 * Debounce function
 * @param {Function} func 
 * @param {number} wait 
 * @returns {Function}
 */
export function debounce(func, wait) {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
}

/**
 * Throttle function
 * @param {Function} func 
 * @param {number} limit 
 * @returns {Function}
 */
export function throttle(func, limit) {
  let inThrottle;
  return function(...args) {
    if (!inThrottle) {
      func.apply(this, args);
      inThrottle = true;
      setTimeout(() => inThrottle = false, limit);
    }
  };
}

/**
 * Clamp a number between min and max
 * @param {number} num 
 * @param {number} min 
 * @param {number} max 
 * @returns {number}
 */
export function clamp(num, min, max) {
  return Math.min(Math.max(num, min), max);
}

/**
 * Format number for display
 * @param {number} num 
 * @param {number} decimals 
 * @returns {string}
 */
export function formatNumber(num, decimals = 2) {
  return Number(num).toFixed(decimals);
}

/**
 * Check if value is empty (null, undefined, empty string, empty array)
 * @param {*} value 
 * @returns {boolean}
 */
export function isEmpty(value) {
  if (value === null || value === undefined) return true;
  if (typeof value === 'string' && value.trim() === '') return true;
  if (Array.isArray(value) && value.length === 0) return true;
  if (typeof value === 'object' && Object.keys(value).length === 0) return true;
  return false;
}

/**
 * Download a file
 * @param {Blob|string} content 
 * @param {string} filename 
 * @param {string} mimeType 
 */
export function downloadFile(content, filename, mimeType = 'application/octet-stream') {
  const blob = content instanceof Blob ? content : new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Read file as data URL
 * @param {File} file 
 * @returns {Promise<string>}
 */
export function readFileAsDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/**
 * Read file as text
 * @param {File} file 
 * @returns {Promise<string>}
 */
export function readFileAsText(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsText(file);
  });
}

/**
 * Load image from source
 * @param {string} src 
 * @returns {Promise<HTMLImageElement>}
 */
export function loadImage(src) {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });
}
