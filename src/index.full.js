/**
 * Full bundle entry point including dependencies and CKEditor
 */

// Import CKEditor (side-effect: defines window.CKEDITOR)
import './lib/ckeditor.js';

// Export everything from the main entry point
export * from './index.js';
import DrawPDF from './index.js';
export default DrawPDF;
