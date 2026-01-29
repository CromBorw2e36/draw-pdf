/**
 * CKEditor HTML Parser
 * Converts CKEditor HTML output to JSON blueprint for PDF rendering
 */

import RichTextTokenizer from './RichTextTokenizer.js';

// Page dimensions in mm
const PAGE = {
  WIDTH: 210,
  HEIGHT: 297,
  MARGIN_TOP: 20,
  MARGIN_BOTTOM: 20,
  MARGIN_LEFT: 15,
  MARGIN_RIGHT: 15,
  get CONTENT_WIDTH() { return this.WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT; },
  get CONTENT_HEIGHT() { return this.HEIGHT - this.MARGIN_TOP - this.MARGIN_BOTTOM; }
};

// Font settings
const FONTS = {
  DEFAULT_SIZE: 12,
  LINE_HEIGHT: 1.5,
  H1_SIZE: 18,
  H2_SIZE: 16,
  H3_SIZE: 14
};

class CKEditorParser {
  constructor() {
    this.currentY = PAGE.MARGIN_TOP;
    this.currentPage = 0;
    this.pages = [{ pageNumber: 1, elements: [] }];
    this.tokenizer = new RichTextTokenizer();
  }

  /**
   * Decode HTML entities in text
   */
  decodeHtmlEntities(text) {
    if (!text || typeof text !== 'string') return text;
    const entities = {
      '&nbsp;': ' ',
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&apos;': "'",
      '&ndash;': '–',
      '&mdash;': '—',
      '&hellip;': '…',
    };
    let result = text;
    for (const [entity, char] of Object.entries(entities)) {
      result = result.split(entity).join(char);
    }
    // Handle numeric entities
    result = result.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
    // Replace non-breaking space
    result = result.replace(/\u00A0/g, ' ');
    return result;
  }

  /**
   * Parse CKEditor HTML to JSON blueprint
   * @param {string} html - CKEditor HTML output
   * @returns {Object} JSON blueprint
   */
  parse(html) {
    // Reset state
    this.currentY = PAGE.MARGIN_TOP;
    this.currentPage = 0;
    this.pages = [{ pageNumber: 1, elements: [] }];

    // Create DOM parser
    const parser = new DOMParser();
    const doc = parser.parseFromString(html, 'text/html');
    
    // Process all child nodes of body
    const children = doc.body.children;
    for (let i = 0; i < children.length; i++) {
      this.processNode(children[i]);
    }

    return {
      version: '1.0',
      pageSize: { width: PAGE.WIDTH, height: PAGE.HEIGHT, unit: 'mm' },
      margins: {
        top: PAGE.MARGIN_TOP,
        bottom: PAGE.MARGIN_BOTTOM,
        left: PAGE.MARGIN_LEFT,
        right: PAGE.MARGIN_RIGHT
      },
      pages: this.pages
    };
  }

  /**
   * Process a DOM node
   */
  processNode(node) {
    const tagName = node.tagName?.toLowerCase();

    switch (tagName) {
      case 'p':
        this.processParagraph(node);
        break;
      case 'h1':
        this.processHeading(node, 1);
        break;
      case 'h2':
        this.processHeading(node, 2);
        break;
      case 'h3':
        this.processHeading(node, 3);
        break;
      case 'ul':
        this.processList(node, 'bullet');
        break;
      case 'ol':
        this.processList(node, 'number');
        break;
      case 'table':
        this.processTable(node);
        break;
      case 'figure':
        // Could be image or table
        if (node.querySelector('table')) {
          this.processTable(node.querySelector('table'));
        } else if (node.querySelector('img')) {
          this.processImage(node.querySelector('img'));
        }
        break;
      case 'hr':
        this.processHorizontalRule();
        break;
      case 'pre':
        // Code block - for JavaScript eval
        this.processCodeBlock(node);
        break;
      default:
        // Try to get text content
        if (node.textContent?.trim()) {
          this.addTextElement(node.textContent.trim(), {});
        }
    }
  }

  /**
   * Process paragraph element
   */
  processParagraph(node) {
    const text = node.innerHTML;
    const styles = this.extractStyles(node);
    
    // Check for alignment
    const align = node.style.textAlign || 'left';
    
    this.addTextElement(text, { ...styles, align });
  }

  /**
   * Process heading element
   */
  processHeading(node, level) {
    const text = node.innerHTML;
    const fontSizes = { 1: FONTS.H1_SIZE, 2: FONTS.H2_SIZE, 3: FONTS.H3_SIZE };
    
    this.addTextElement(text, {
      fontSize: fontSizes[level],
      fontWeight: 'bold',
      align: node.style.textAlign || 'left'
    });
  }

  /**
   * Process list
   */
  processList(node, type) {
    const items = node.querySelectorAll('li');
    items.forEach((item, index) => {
      const prefix = type === 'number' ? `${index + 1}. ` : '• ';
      const text = prefix + item.innerHTML;
      this.addTextElement(text, { indent: 10 });
    });
  }

  /**
   * Process table with properties
   */
  processTable(tableNode) {
    const rows = [];
    const tableRows = tableNode.querySelectorAll('tr');
    
    // Extract table-level properties
    const tableStyle = {
      // Width: from style or attribute
      width: this.parseWidth(tableNode.style.width || tableNode.getAttribute('width')),
      // Border: from style or attribute
      borderWidth: this.parseBorderWidth(tableNode.style.border || tableNode.getAttribute('border')),
      borderColor: this.parseColor(tableNode.style.borderColor) || '#000000',
      // Background
      backgroundColor: this.parseColor(tableNode.style.backgroundColor),
      // Alignment: check for margin auto (center) or margin-left auto (right)
      align: this.parseTableAlign(tableNode)
    };

    tableRows.forEach(tr => {
      const cells = [];
      const tds = tr.querySelectorAll('td, th');
      tds.forEach(td => {
        const img = td.querySelector('img');
        const colspan = parseInt(td.getAttribute('colspan')) || 1;
        const rowspan = parseInt(td.getAttribute('rowspan')) || 1;
        
        // Get text alignment from style or nested p element
        let align = td.style.textAlign || 'left';
        const nestedP = td.querySelector('p[style*="text-align"]');
        if (nestedP && nestedP.style.textAlign) {
          align = nestedP.style.textAlign;
        }

        // Extract cell-level properties
        const cellStyle = {
          backgroundColor: this.parseColor(td.style.backgroundColor),
          borderColor: this.parseColor(td.style.borderColor),
          borderWidth: this.parseBorderWidth(td.style.border || td.style.borderWidth),
          verticalAlign: td.style.verticalAlign || 'middle',
          padding: this.parsePadding(td.style.padding),
          width: this.parseWidth(td.style.width || td.getAttribute('width')),
          height: this.parseWidth(td.style.height || td.getAttribute('height'))
        };

        if (img) {
          // Store as image cell
          cells.push({
            type: 'image',
            src: img.src || img.getAttribute('src'),
            width: parseInt(img.width) || 50,
            height: parseInt(img.height) || 50,
            colSpan: colspan,
            rowSpan: rowspan,
            align: align,
            isHeader: td.tagName.toLowerCase() === 'th',
            cellStyle: cellStyle
          });
        } else {
          // Store raw innerHTML - renderer will handle conversion
          cells.push({
            content: td.innerHTML || ' ',
            isHeader: td.tagName.toLowerCase() === 'th',
            colSpan: colspan,
            rowSpan: rowspan,
            align: align,
            cellStyle: cellStyle
          });
        }
      });
      rows.push(cells);
    });

    this.addElement({
      type: 'table',
      width: tableStyle.width || PAGE.CONTENT_WIDTH,
      rows: rows,
      style: tableStyle
    });
  }

  /**
   * Parse width value to mm
   */
  parseWidth(value) {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    // If percentage, calculate from content width
    if (String(value).includes('%')) {
      return (num / 100) * PAGE.CONTENT_WIDTH;
    }
    // If px, convert to mm
    if (String(value).includes('px')) {
      return num * 0.264;
    }
    return num; // Assume mm or unitless
  }

  /**
   * Parse border width
   */
  parseBorderWidth(value) {
    if (!value) return 0.5; // Default
    const match = String(value).match(/(\d+\.?\d*)/);
    if (match) {
      const num = parseFloat(match[1]);
      // Convert px to mm if needed
      return num > 5 ? num * 0.264 : num;
    }
    return 0.5;
  }

  /**
   * Parse color from CSS
   */
  parseColor(value) {
    if (!value) return null;
    // Already hex
    if (value.startsWith('#')) return value;
    // RGB format
    const rgbMatch = value.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]).toString(16).padStart(2, '0');
      const g = parseInt(rgbMatch[2]).toString(16).padStart(2, '0');
      const b = parseInt(rgbMatch[3]).toString(16).padStart(2, '0');
      return `#${r}${g}${b}`;
    }
    return value;
  }

  /**
   * Parse table alignment from margin styles
   */
  parseTableAlign(node) {
    const ml = node.style.marginLeft;
    const mr = node.style.marginRight;
    if (ml === 'auto' && mr === 'auto') return 'center';
    if (ml === 'auto') return 'right';
    return 'left';
  }

  /**
   * Parse padding value to mm
   */
  parsePadding(value) {
    if (!value) return null;
    const num = parseFloat(value);
    if (isNaN(num)) return null;
    // Convert px to mm
    return num * 0.264;
  }

  /**
   * Process image
   */
  processImage(imgNode) {
    const src = imgNode.src || imgNode.getAttribute('src');
    const width = parseInt(imgNode.width) || 50;
    const height = parseInt(imgNode.height) || 50;
    
    // Convert px to mm (approximate)
    const widthMm = Math.min(width * 0.264, PAGE.CONTENT_WIDTH);
    const heightMm = height * 0.264;

    // Content-flow: Image element without fixed x,y position
    this.addElement({
      type: 'image',
      // Content-flow: No x,y - renderer will calculate
      width: widthMm,
      height: heightMm,
      src: src,
      align: 'left' // Default alignment, can be extended
    });
  }

  /**
   * Process horizontal rule (content-flow)
   */
  processHorizontalRule() {
    // Content-flow: Line element without fixed y position
    this.addElement({
      type: 'line',
      // Content-flow: No fixed coordinates - renderer will calculate
      fullWidth: true, // Indicates line spans full content width
      style: { color: '#cccccc', width: 0.5 }
    });
  }

  /**
   * Extract inline styles from node (content-flow approach)
   */
  extractStyles(node) {
    const styles = {};
    const html = node.innerHTML;

    // Check for bold
    if (html.includes('<strong>') || html.includes('<b>') || 
        node.style.fontWeight === 'bold') {
      styles.fontWeight = 'bold';
    }

    // Check for italic
    if (html.includes('<i>') || html.includes('<em>') ||
        node.style.fontStyle === 'italic') {
      styles.fontStyle = 'italic';
    }

    // Check for underline
    if (html.includes('<u>') || node.style.textDecoration?.includes('underline')) {
      styles.underline = true;
    }

    // Check for color
    const colorMatch = html.match(/color:\s*([^;"]+)/);
    if (colorMatch) {
      styles.color = colorMatch[1];
    }

    // Check for font size
    const sizeMatch = html.match(/font-size:\s*(\d+)/);
    if (sizeMatch) {
      styles.fontSize = parseInt(sizeMatch[1]);
    }

    // Content-flow: Extract margin-left for indent
    const marginLeftMatch = node.style.marginLeft?.match(/(\d+)/);
    if (marginLeftMatch) {
      styles.marginLeft = parseFloat(marginLeftMatch[1]) * 0.264; // px to mm
    }

    // Content-flow: Extract text-indent
    const textIndentMatch = node.style.textIndent?.match(/(\d+)/);
    if (textIndentMatch) {
      styles.indent = parseFloat(textIndentMatch[1]) * 0.264; // px to mm
    }

    // Content-flow: Extract padding-left (from CKEditor indent)
    const paddingLeftMatch = node.style.paddingLeft?.match(/(\d+)/);
    if (paddingLeftMatch) {
      styles.indent = (styles.indent || 0) + parseFloat(paddingLeftMatch[1]) * 0.264;
    }

    return styles;
  }

  /**
   * Add text element with rich text tokenization (content-flow approach)
   * No x,y coordinates - renderer will calculate based on layout hints
   */
  addTextElement(htmlContent, styles) {
    // Tokenize HTML to get styled segments
    const segments = this.tokenizer.tokenize(htmlContent);
    
    // Get plain text for height calculation
    const plainText = segments.map(s => s.text).join('');
    // If empty paragraph (user pressed Enter), add space instead of skipping
    if (!plainText.trim()) {
      this.addElement({
        type: 'space',
        height: (styles.fontSize || FONTS.DEFAULT_SIZE) * FONTS.LINE_HEIGHT * 0.352778 // line height in mm
      });
      return;
    }

    const fontSize = styles.fontSize || FONTS.DEFAULT_SIZE;
    const lineHeight = fontSize * FONTS.LINE_HEIGHT * 0.352778; // pt to mm
    
    // Calculate effective width considering indent
    const totalIndent = (styles.indent || 0) + (styles.marginLeft || 0);
    const effectiveWidth = PAGE.CONTENT_WIDTH - totalIndent;

    this.addElement({
      type: 'richtext',
      // Content-flow: No x,y - use layout hints instead
      indent: styles.indent || 0,
      marginLeft: styles.marginLeft || 0,
      width: effectiveWidth,
      segments: segments,
      content: plainText, // Fallback plain text
      style: {
        fontSize: fontSize,
        fontWeight: styles.fontWeight || 'normal',
        fontStyle: styles.fontStyle || 'normal',
        color: styles.color || '#000000',
        align: styles.align || 'left',
        underline: styles.underline || false,
        lineHeight: lineHeight
      }
    });
  }

  /**
   * Add element to current page
   */
  addElement(element) {
    this.pages[this.currentPage].elements.push(element);
  }

  /**
   * Create new page
   */
  newPage() {
    this.currentPage++;
    this.pages.push({
      pageNumber: this.currentPage + 1,
      elements: []
    });
    this.currentY = PAGE.MARGIN_TOP;
  }

  /**
   * Process code block element (pre > code)
   * If code starts with '// eval', it will be evaluated as JavaScript
   * Otherwise treated as display-only code
   */
  processCodeBlock(node) {
    const codeElement = node.querySelector('code') || node;
    let code = codeElement.textContent || '';
    
    // Decode HTML entities
    code = this.decodeHtmlEntities(code);
    
    // Check if this is an eval block
    const isEval = code.trim().startsWith('// eval') || 
                   code.trim().startsWith('/* eval */') ||
                   code.trim().startsWith('//eval');
    
    // Get language from class (e.g., "language-javascript")
    const langClass = codeElement.className || '';
    const langMatch = langClass.match(/language-(\w+)/);
    const language = langMatch ? langMatch[1] : 'javascript';
    
    // Create element
    const element = {
      type: isEval ? 'evalblock' : 'codeblock',
      code: code.trim(),
      language: language,
      isEval: isEval
    };
    
    this.addElement(element);
    console.log('[CKEditorParser] Code block:', isEval ? 'EVAL' : 'DISPLAY', language);
  }
}

export default CKEditorParser;
export { PAGE, FONTS };
