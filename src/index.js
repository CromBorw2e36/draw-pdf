/**
 * DrawPDF - PDF Template Builder Library
 * 
 * Main entry point for npm package.
 * Exports all public APIs for PDF generation from HTML/JSON templates.
 * 
 * @module drawpdf
 */

// All-in-One API (recommended for most users)
import DrawPDF from './DrawPDF.js';
export default DrawPDF;

// Parser - Convert HTML to JSON Blueprint
export { default as CKEditorParser, PAGE, FONTS } from './parser/CKEditorParser.js';
export { default as RichTextTokenizer } from './parser/RichTextTokenizer.js';

// Renderer - Convert JSON Blueprint to PDF
export { default as PDFRenderer } from './renderer/PDFRenderer.js';

// Service - Low-level jsPDF wrapper with 88+ methods
export { default as JsPdfService } from './service/jspdf-service.js';

// Utils - Template engine with variables, loops, conditionals
export { TemplateEngine } from './utils/TemplateEngine.js';

// Re-export for convenience
export { DrawPDF };
export const VERSION = '2.1.0';
