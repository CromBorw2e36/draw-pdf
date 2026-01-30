/**
 * Full bundle entry point - includes ALL dependencies:
 * - jsPDF
 * - jsPDF-AutoTable  
 * - CKEditor
 * - DrawPDF core
 */

// 1. Import jsPDF và AutoTable (UMD files - they self-register to window)
import './lib/jspdf.umd.min.js';
import './lib/jspdf.plugin.autotable.min.js';

// 2. Import Fonts
import '../public/fonts/Roboto-Regular-normal.js';
import '../public/fonts/Roboto-Bold-normal.js';
import '../public/fonts/Roboto-Italic-normal.js';
import '../public/fonts/Roboto-BoldItalic-normal.js';

// 3. Import CKEditor (side-effect: defines window.CKEDITOR)
import './lib/ckeditor.js';

// 4. Export everything from the main entry point
export * from './index.js';
import DrawPDF from './index.js';
export default DrawPDF;
