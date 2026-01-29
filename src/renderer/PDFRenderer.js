/**
 * PDF Renderer using JsPdfService
 * Renders JSON blueprint to PDF using the existing JsPdfService
 */

import { TemplateEngine } from '../utils/TemplateEngine.js';
import JsPdfService from '../service/jspdf-service.js';
import { FONT_CONFIG } from '../utils/constants.js';

class PDFRenderer {
  /**
   * Create PDFRenderer instance
   * @param {Object} fontConfig - Font configuration (optional)
   * @param {string} fontConfig.defaultFont - Primary font name
   * @param {string} fontConfig.fallback - Fallback font name
   */
  constructor(fontConfig = {}) {
    this.fontConfig = { ...FONT_CONFIG, ...fontConfig };
    this.pdfService = null;
    // Content-flow: Store margins for position calculation
    this.margins = {
      left: 15,
      right: 15,
      top: 20,
      bottom: 20
    };
    this.pageWidth = 210; // A4 width in mm
    this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
  }

  /**
   * Content-flow: Calculate x position from layout hints
   */
  calculateX(element) {
    const indent = element.indent || 0;
    const marginLeft = element.marginLeft || 0;
    return this.margins.left + indent + marginLeft;
  }

  /**
   * Render JSON blueprint to PDF using JsPdfService
   * @param {Object} blueprint - JSON blueprint from CKEditorParser
   * @param {Object} data - Variable data for replacement
   * @returns {JsPdfService} PDF service instance
   */
  render(blueprint, data = {}) {
    // Create new JsPdfService instance with font configuration
    this.pdfService = new JsPdfService(this.fontConfig);

    // Update margins from blueprint if available
    if (blueprint.margins) {
      this.margins = { ...this.margins, ...blueprint.margins };
      this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
    }

    // Render each page
    blueprint.pages.forEach((page, pageIndex) => {
      if (pageIndex > 0) {
        this.pdfService.addNewPage();
      }

      // Reset Y position for each page
      this.pdfService.resetPosition(this.margins.top);

      // Render each element
      this.renderPage(page, data);
    });

    return this;
  }


  /**
   * Helper to clean content (strip HTML tags + decode entities)
   */
  cleanContent(content) {
    if (!content) return '';
    let text = String(content);
    // Preserve line breaks: convert <br> and </p><p> to newlines before stripping
    text = text.replace(/<br\s*\/?>/gi, '\n');
    text = text.replace(/<\/p>\s*<p[^>]*>/gi, '\n');
    // Strip remaining HTML tags
    text = text.replace(/<[^>]*>/g, '');
    // Decode entities
    return this.pdfService._decodeHtmlEntities(text);
  }

  /**
   * Render a single page
   */
  renderPage(page, data) {
    page.elements.forEach(element => {

      // Decode HTML entities in content using the service
      if (element.content) {
        element.content = this.pdfService._decodeHtmlEntities(element.content);
      }

      switch (element.type) {
        case 'text':
          this.renderText(element, data);
          break;
        case 'richtext':
          this.renderRichText(element, data);
          break;
        case 'heading':
          this.renderHeading(element, data);
          break;
        case 'table':
          this.renderTable(element, data);
          break;
        case 'image':
          this.renderImage(element, data);
          break;
        case 'line':
          this.renderLine(element);
          break;
        case 'space':
          this.pdfService.addSpace(element.height || 10);
          break;
        case 'evalblock':
          this.renderEvalBlock(element, data);
          break;
        case 'codeblock':
          this.renderCodeBlock(element, data);
          break;
      }
    });
  }

  /**
   * Render rich text element with mixed inline styles (content-flow)
   * Handles layout markers: ___BR___, ___HR___, ___PAGEBREAK___, ___TAB___
   */
  renderRichText(element, data) {
    const segments = element.segments || [];
    const style = element.style || {};

    // Replace variables in each segment (this also creates markers)
    const processedSegments = segments.map(seg => ({
      text: this.replaceVariables(seg.text, data),
      style: seg.style
    }));

    // Content-flow: Calculate x from layout hints
    const x = this.calculateX(element);
    const lineHeight = style.lineHeight || 5;

    const options = {
      fontSize: style.fontSize || 12,
      color: this.parseColor(style.color),
      align: style.align || 'left',
      lineHeight: lineHeight,
      x: x,
      maxWidth: element.width || this.contentWidth
    };

    // Check if any segment has layout markers
    const hasMarkers = processedSegments.some(seg =>
      seg.text && (
        seg.text.includes('___BR___') ||
        seg.text.includes('___HR___') ||
        seg.text.includes('___PAGEBREAK___')
      )
    );

    if (!hasMarkers) {
      // No markers - render normally
      // Replace TAB markers with spaces
      const cleanedSegments = processedSegments.map(seg => ({
        ...seg,
        text: seg.text ? seg.text.replace(/___TAB___/g, '    ') : seg.text
      }));
      this.pdfService.addMixedParagraph(cleanedSegments, options);
      return;
    }

    // Has markers - need to split and render parts separately
    // Combine all segment texts first
    let fullText = processedSegments.map(seg => seg.text || '').join('');

    // Replace TAB markers with spaces
    fullText = fullText.replace(/___TAB___/g, '    ');

    // Split by markers, keeping the markers
    const parts = fullText.split(/(___BR___|___HR___|___PAGEBREAK___)/);

    for (const part of parts) {
      if (part === '___BR___') {
        // Line break - add vertical space
        this.pdfService.addSpace(this.pdfService.lineHeight);
      } else if (part === '___HR___') {
        // Horizontal rule
        this.pdfService.addHorizontalLine();
      } else if (part === '___PAGEBREAK___') {
        // Page break
        this.pdfService.addNewPage();
      } else if (part.trim()) {
        // Regular text - create simple segment and render
        const textSegments = [{ text: part.trim(), style: {} }];
        this.pdfService.addMixedParagraph(textSegments, options);
      }
    }
  }


  /**
   * Render text element using JsPdfService (content-flow)
   * Handles layout markers: ___BR___, ___HR___, ___PAGEBREAK___, ___TAB___
   */
  renderText(element, data) {
    let text = this.replaceVariables(element.content, data);
    const style = element.style || {};
    const lineHeight = style.lineHeight || 5;

    // Map styles to JsPdfService options
    const options = {
      fontSize: style.fontSize || 12,
      fontStyle: this.mapFontStyle(style),
      color: this.parseColor(style.color),
      align: style.align || 'left',
      lineHeight: lineHeight
    };

    // Content-flow: Calculate x from layout hints, let service handle y
    const x = this.calculateX(element);

    // Replace TAB markers with spaces
    text = text.replace(/___TAB___/g, '    ');

    // Check for layout markers
    if (!text.includes('___BR___') && !text.includes('___HR___') && !text.includes('___PAGEBREAK___')) {
      // No markers - render normally
      this.pdfService.addText(text, x, null, options);
      return;
    }

    // Has markers - split and render parts
    const parts = text.split(/(___BR___|___HR___|___PAGEBREAK___)/);

    for (const part of parts) {
      if (part === '___BR___') {
        this.pdfService.addSpace(lineHeight);
      } else if (part === '___HR___') {
        this.pdfService.addHorizontalLine();
      } else if (part === '___PAGEBREAK___') {
        this.pdfService.addNewPage();
      } else if (part.trim()) {
        this.pdfService.addText(part.trim(), x, null, options);
      }
    }
  }

  /**
   * Render heading element (content-flow)
   */
  renderHeading(element, data) {
    const text = this.replaceVariables(element.content, data);
    const level = element.level || 1;

    // Content-flow: No y position needed, let service handle it
    switch (level) {
      case 1:
        this.pdfService.addTitle(text, { align: element.style?.align || 'center' });
        break;
      case 2:
        this.pdfService.addSubTitle(text, { align: element.style?.align || 'left' });
        break;
      default:
        this.pdfService.addText(text, null, null, {
          fontSize: 14,
          fontStyle: 'bold',
          align: element.style?.align || 'left'
        });
    }
  }

  /**
   * Render table element with styles
   */
  renderTable(element, data) {
    const rows = element.rows || [];
    if (rows.length === 0) return;

    // Check if there's a dataVar for dynamic table
    if (element.dataVar) {
      const varName = element.dataVar.replace(/\{\{|\}\}/g, '');
      const tableData = data[varName];
      if (Array.isArray(tableData)) {
        this.renderDataTable(element, tableData);
        return;
      }
    }

    // Static table rendering
    if (element.y !== undefined) {
      this.pdfService.resetPosition(element.y);
    }

    // Track images to render after table
    const imagesToRender = [];
    const tableStyle = element.style || {};

    // Process all rows for autoTable format
    const processCell = (cell, rowIndex, cellIndex) => {
      if (!cell) return { content: '' };

      // Build cell styles from cellStyle
      const cs = cell.cellStyle || {};
      const cellStyles = {
        halign: cell.align || 'left',
        valign: cs.verticalAlign === 'top' ? 'top' :
          cs.verticalAlign === 'bottom' ? 'bottom' : 'middle'
      };

      // Cell background color
      if (cs.backgroundColor) {
        cellStyles.fillColor = this.parseColorToArray(cs.backgroundColor);
      }

      // Cell border
      if (cs.borderColor) {
        cellStyles.lineColor = this.parseColorToArray(cs.borderColor);
      }
      if (cs.borderWidth) {
        cellStyles.lineWidth = cs.borderWidth;
      }

      // Cell padding
      if (cs.padding) {
        cellStyles.cellPadding = cs.padding;
      }

      // Handle image cells
      if (cell.type === 'image') {
        imagesToRender.push({
          rowIndex,
          cellIndex,
          src: cell.src,
          width: cell.width,
          height: cell.height
        });
        return {
          content: '[IMG]',
          colSpan: cell.colSpan || 1,
          rowSpan: cell.rowSpan || 1,
          styles: cellStyles
        };
      }

      // Handle text cells
      const content = typeof cell === 'object'
        ? this.replaceVariables(cell.content, data)
        : cell;
      const cleanedContent = this.cleanContent(content);

      return {
        content: cleanedContent,
        colSpan: cell.colSpan || 1,
        rowSpan: cell.rowSpan || 1,
        styles: cellStyles
      };
    };

    // Build header row
    const headerRow = rows[0]?.map((cell, idx) => processCell(cell, 0, idx)) || [];

    // Extract header background color from first cell (assume consistent)
    const firstHeaderCell = rows[0]?.[0];
    const headerBgColor = firstHeaderCell?.cellStyle?.backgroundColor;

    // Build data rows
    const dataRows = rows.slice(1).map((row, rIdx) =>
      row.map((cell, cIdx) => processCell(cell, rIdx + 1, cIdx))
    );

    // Build table options from tableStyle
    const tableOptions = {
      tableWidth: element.width
    };

    // Table border
    if (tableStyle.borderWidth !== undefined) {
      tableOptions.lineWidth = tableStyle.borderWidth;
    }
    if (tableStyle.borderColor) {
      tableOptions.lineColor = this.parseColorToArray(tableStyle.borderColor);
    }

    // Table background
    if (tableStyle.backgroundColor) {
      tableOptions.fillColor = this.parseColorToArray(tableStyle.backgroundColor);
    }

    // Table alignment (for positioning)
    if (tableStyle.align === 'center') {
      tableOptions.tableAlign = 'center';
    } else if (tableStyle.align === 'right') {
      tableOptions.tableAlign = 'right';
    }

    // Header styles - use first header cell's background if available
    if (headerBgColor) {
      tableOptions.headStyles = {
        fillColor: this.parseColorToArray(headerBgColor)
      };
    }

    // Use addTable from service
    if (typeof this.pdfService.addTable === 'function') {
      this.pdfService.addTable(headerRow, dataRows, tableOptions);
    } else {
      this.drawTableManually(element, data);
    }
  }

  /**
   * Parse color string to RGB array for jspdf-autotable
   */
  parseColorToArray(color) {
    if (!color) return [0, 0, 0];
    // Hex format
    if (color.startsWith('#')) {
      const hex = color.slice(1);
      const r = parseInt(hex.substr(0, 2), 16);
      const g = parseInt(hex.substr(2, 2), 16);
      const b = parseInt(hex.substr(4, 2), 16);
      return [r, g, b];
    }
    // RGB format
    const rgbMatch = color.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      return [parseInt(rgbMatch[1]), parseInt(rgbMatch[2]), parseInt(rgbMatch[3])];
    }
    return [0, 0, 0];
  }


  /**
   * Render dynamic data table
   */
  renderDataTable(element, dataArray) {
    const columns = element.columns || [];
    if (columns.length === 0 || !Array.isArray(dataArray)) return;

    const headers = columns.map(col => col.label || col);
    const dataRows = dataArray.map(row =>
      columns.map(col => {
        const key = col.key || col;
        return String(row[key] || '');
      })
    );

    if (typeof this.pdfService.addTable === 'function') {
      this.pdfService.addTable(headers, dataRows, element.style || {});
    }
  }

  /**
   * Manual table drawing when addTable is not available
   */
  drawTableManually(element, data) {
    const rows = element.rows || [];
    const startX = element.x || this.pdfService.margins.left;
    const tableWidth = element.width || (this.pdfService.pageWidth - startX - this.pdfService.margins.right);
    const rowHeight = element.rowHeight || 8;
    const numCols = rows[0]?.length || 1;
    const colWidth = tableWidth / numCols;

    const doc = this.pdfService.doc;
    let currentY = this.pdfService.getCurrentY();

    doc.setLineWidth(0.5);
    doc.setFontSize(10);

    rows.forEach((row, rowIndex) => {
      row.forEach((cell, colIndex) => {
        const cellX = startX + (colIndex * colWidth);
        const content = typeof cell === 'object'
          ? this.replaceVariables(cell.content, data)
          : this.replaceVariables(String(cell), data);
        const isHeader = typeof cell === 'object' ? cell.isHeader : rowIndex === 0;

        // Header background
        if (isHeader) {
          doc.setFillColor(240, 240, 240);
          doc.rect(cellX, currentY, colWidth, rowHeight, 'F');
        }

        // Cell border
        doc.setDrawColor(0, 0, 0);
        doc.rect(cellX, currentY, colWidth, rowHeight);

        // Cell text
        try {
          doc.setFont(this.fontConfig.defaultFont, isHeader ? 'bold' : 'normal');
        } catch {
          doc.setFont(this.fontConfig.fallback || 'helvetica', isHeader ? 'bold' : 'normal');
        }
        doc.setTextColor(0, 0, 0);

        const plainText = content.replace(/<[^>]*>/g, '');
        const textY = currentY + (rowHeight / 2) + 2;
        doc.text(plainText, cellX + 2, textY, { maxWidth: colWidth - 4 });
      });

      currentY += rowHeight;
    });

    this.pdfService.resetPosition(currentY + 5);
  }

  /**
   * Render image element (content-flow)
   */
  renderImage(element, data) {
    let src = this.replaceVariables(element.src, data);

    if (src && (src.startsWith('data:') || src.startsWith('http'))) {
      // Content-flow: Calculate x from layout hints or use default
      const x = element.x !== undefined ? element.x : this.margins.left;

      this.pdfService.addImage(
        src,
        x,
        null, // Let service handle y (content-flow)
        element.width || 50,
        element.height || 50,
        element.style || {}
      );
    }
  }

  /**
   * Render line element (content-flow)
   */
  renderLine(element) {
    // Content-flow: Calculate line position
    if (element.fullWidth) {
      // Line spans full content width
      const currentY = this.pdfService.getCurrentY();
      this.pdfService.addLine(
        this.margins.left,
        currentY,
        this.pageWidth - this.margins.right,
        currentY,
        element.style || {}
      );
      this.pdfService.addSpace(5); // Add spacing after line
    } else {
      // Use specified coordinates (fallback for backward compatibility)
      this.pdfService.addLine(
        element.x1,
        element.y1,
        element.x2,
        element.y2,
        element.style || {}
      );
    }
  }

  /**
   * Replace {{variables}} with data values
   * Now supports: nested objects, #each loops, #if conditionals
   */
  replaceVariables(text, data) {
    return TemplateEngine.process(text, data);
  }

  /**
   * Process layout markers in text and render appropriately
   * Handles: ___BR___, ___TAB___, ___HR___, ___PAGEBREAK___
   * @param {string} text - Text with markers
   * @param {Object} options - Rendering options
   * @returns {string} Text with markers replaced (TAB only)
   */
  processLayoutMarkers(text, options = {}) {
    if (!text || typeof text !== 'string') return text || '';

    // Replace TAB marker with spaces (safe to keep in text)
    let result = text.replace(/___TAB___/g, '    ');

    // Check for markers that need special handling
    const hasBreak = result.includes('___BR___');
    const hasHr = result.includes('___HR___');
    const hasPageBreak = result.includes('___PAGEBREAK___');

    if (!hasBreak && !hasHr && !hasPageBreak) {
      return result;
    }

    // Split by markers and process each part
    const parts = result.split(/(___BR___|___HR___|___PAGEBREAK___)/);

    for (let i = 0; i < parts.length; i++) {
      const part = parts[i];

      if (part === '___BR___') {
        // Line break - increase currentY
        this.pdfService.addSpace(options.lineHeight || 5);
      } else if (part === '___HR___') {
        // Horizontal rule
        this.pdfService.addHorizontalLine();
      } else if (part === '___PAGEBREAK___') {
        // Page break
        this.pdfService.addNewPage();
      } else if (part.trim()) {
        // Regular text - render it
        // This will be handled by the calling method
      }
    }

    // Return text without break markers (for simple text rendering)
    return result.replace(/___BR___|___HR___|___PAGEBREAK___/g, '');
  }

  /**
   * Check if text contains layout markers that need special rendering
   */
  hasLayoutMarkers(text) {
    if (!text) return false;
    return text.includes('___BR___') ||
      text.includes('___HR___') ||
      text.includes('___PAGEBREAK___');
  }

  /**
   * Render text with layout markers support
   * Splits text by markers and renders each segment appropriately
   */
  renderTextWithMarkers(text, options = {}) {
    if (!text) return;

    // Replace TAB marker
    let processedText = text.replace(/___TAB___/g, '    ');

    // Split by markers
    const parts = processedText.split(/(___BR___|___HR___|___PAGEBREAK___)/);

    const x = options.x || this.margins.left;
    const fontSize = options.fontSize || 12;
    const lineHeight = options.lineHeight || fontSize * 0.5;

    for (const part of parts) {
      if (part === '___BR___') {
        // Line break - add vertical space
        this.pdfService.addSpace(lineHeight);
      } else if (part === '___HR___') {
        // Horizontal rule
        if (this.pdfService.addHorizontalLine) {
          this.pdfService.addHorizontalLine();
        } else {
          this.pdfService.addSpace(5);
        }
      } else if (part === '___PAGEBREAK___') {
        // Page break
        this.pdfService.addNewPage();
      } else if (part.trim()) {
        // Regular text segment
        this.pdfService.addText(part.trim(), x, null, {
          fontSize: fontSize,
          maxWidth: options.maxWidth || this.contentWidth,
          align: options.align || 'left',
          color: options.color
        });
      }
    }
  }

  /**
   * Map style to font style string
   */
  mapFontStyle(style) {
    if (style.fontWeight === 'bold' && style.fontStyle === 'italic') {
      return 'bolditalic';
    } else if (style.fontWeight === 'bold') {
      return 'bold';
    } else if (style.fontStyle === 'italic') {
      return 'italic';
    }
    return 'normal';
  }

  /**
   * Parse color to RGB array
   */
  parseColor(color) {
    if (!color) return [0, 0, 0];

    if (Array.isArray(color)) return color;

    // Handle hex color
    if (typeof color === 'string' && color.startsWith('#')) {
      const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(color);
      if (result) {
        return [
          parseInt(result[1], 16),
          parseInt(result[2], 16),
          parseInt(result[3], 16)
        ];
      }
    }

    // Handle rgb() format
    if (typeof color === 'string' && color.startsWith('rgb')) {
      const match = color.match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (match) {
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      }
    }

    return [0, 0, 0];
  }

  /**
   * Get PDF as data URL
   */
  getDataUrl() {
    return this.pdfService.generateDataURL();
  }

  /**
   * Download PDF
   */
  download(filename = 'document.pdf') {
    this.pdfService.savePDF(filename);
  }

  /**
   * Get PDF as Blob
   */
  getBlob() {
    return this.pdfService.generateBlob();
  }

  /**
   * Preview PDF in new tab
   */
  preview() {
    this.pdfService.previewPDF();
  }

  /**
   * Render eval block - execute JavaScript code with full PDF access
   * Code must start with '// eval' to be evaluated
   * Available in code: pdf (pdfService), data, renderer, helpers
   */
  renderEvalBlock(element, data) {
    let code = element.code || '';

    // Remove the '// eval' marker from start
    code = code.replace(/^\/\/\s*eval\s*/i, '');
    code = code.replace(/^\/\*\s*eval\s*\*\/\s*/i, '');

    console.log('[PDFRenderer] Evaluating code block with full PDF access...');

    try {
      // Create context with full PDF access
      const context = {
        // Direct PDF service access
        pdf: this.pdfService,

        // Data context
        data: data,

        // Renderer reference
        renderer: this,

        // Helper functions
        formatNumber: (num) => TemplateEngine.formatNumber(num),
        formatCurrency: (num) => TemplateEngine.formatCurrency(num),
        formatDate: (date) => TemplateEngine.formatDate(date),
        today: () => TemplateEngine.formatDateObject(new Date()),
        now: () => new Date().toLocaleString('vi-VN'),
        year: () => new Date().getFullYear(),
        sum: (arr, key) => arr.reduce((s, i) => s + (Number(i[key]) || 0), 0),
        count: (arr) => Array.isArray(arr) ? arr.length : 0,
        filter: (arr, fn) => arr.filter(fn),
        map: (arr, fn) => arr.map(fn),
        join: (arr, sep = ', ') => arr.join(sep),

        // Convenience shortcuts
        addText: (text, x, y, opts) => this.pdfService.addText(text, x, y, opts),
        addTitle: (text, opts) => this.pdfService.addTitle(text, opts),
        addTable: (headers, rows, opts) => this.pdfService.addTable(headers, rows, opts),
        addSpace: (h) => this.pdfService.addSpace(h),
        addLine: () => this.pdfService.addHorizontalLine(),
        addImage: (src, x, y, w, h) => this.pdfService.addImage(src, x, y, w, h),
        newPage: () => this.pdfService.addNewPage(),
      };

      // Create function with all context vars
      const fn = new Function(...Object.keys(context), `
        "use strict";
        ${code}
      `);

      // Execute with context
      const result = fn(...Object.values(context));

      console.log('[PDFRenderer] Eval completed, result:', result);

      // If code returns a string, render it as text
      if (typeof result === 'string' && result.trim()) {
        this.pdfService.addText(result, this.margins.left, null, {
          fontSize: 12,
          maxWidth: this.contentWidth
        });
      }
    } catch (error) {
      console.error('[PDFRenderer] Eval error:', error);
      this.pdfService.addText(`[Eval Error: ${error.message}]`, this.margins.left, null, {
        fontSize: 10,
        color: [255, 0, 0]
      });
    }
  }

  /**
   * Render code block - display code as formatted text (not evaluated)
   */
  renderCodeBlock(element, data) {
    const code = element.code || '';
    const language = element.language || 'text';

    console.log('[PDFRenderer] Rendering code block:', language, code.length, 'chars');

    // Render code as monospace text with background
    // For now, just render as plain text with fixed-width font
    this.pdfService.addText(code, this.margins.left, null, {
      fontSize: 10,
      fontStyle: 'normal',
      maxWidth: this.contentWidth
    });
  }
}

export default PDFRenderer;
