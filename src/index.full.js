/**
 * Full bundle entry point - includes ALL dependencies:
 * - jsPDF
 * - jsPDF-AutoTable  
 * - CKEditor
 * - DrawPDF core
 */

// 1. Import jsPDF (UMD file - self-registers to window)
// Note: AutoTable is applied via applyPlugin in jspdf-service.js
import './lib/jspdf.umd.min.js';

// 2. Import Fonts
import './fonts/Roboto-Regular-normal.js';
import './fonts/Roboto-Bold-normal.js';
import './fonts/Roboto-Italic-normal.js';
import './fonts/Roboto-BoldItalic-normal.js';

// 3. Import CKEditor (side-effect: defines window.CKEDITOR)
import './lib/ckeditor.js';
import './lib/bypass-license-check.js';

// 4. Export everything from the main entry point
export * from './index.js';
import DrawPDF from './index.js';

// 5. Attach CKEDITOR to DrawPDF namespace for encapsulation
// This allows access via window.DrawPDF.CKEDITOR in UMD build
if (typeof window !== 'undefined' && window.CKEDITOR) {
    DrawPDF.CKEDITOR = window.CKEDITOR;
}

export default DrawPDF;
