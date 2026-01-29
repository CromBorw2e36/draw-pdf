/**
 * RichTextTokenizer
 * Tokenizes HTML inline content into styled segments for jsPDF rendering
 * 
 * Input: "Chào ông <b>Nguyễn Văn A</b>, chức vụ <i>Giám đốc</i>."
 * Output: [
 *   { text: "Chào ông ", style: { bold: false, italic: false, underline: false, color: null } },
 *   { text: "Nguyễn Văn A", style: { bold: true, italic: false, underline: false, color: null } },
 *   ...
 * ]
 */

class RichTextTokenizer {
  constructor() {
    // Inline tags to track
    this.inlineTags = ['b', 'strong', 'i', 'em', 'u', 's', 'strike', 'span'];
  }

  /**
   * Tokenize HTML string into styled segments
   * @param {string} html - HTML content (from CKEditor paragraph innerHTML)
   * @returns {Array<{text: string, style: Object}>} Array of styled segments
   */
  tokenize(html) {
    if (!html || typeof html !== 'string') {
      return [{ text: '', style: this.createDefaultStyle() }];
    }

    // Create a temporary DOM element to parse HTML
    const container = document.createElement('div');
    container.innerHTML = html;

    const segments = [];
    this.walkTree(container, this.createDefaultStyle(), segments);

    // Merge adjacent segments with same style
    return this.mergeSegments(segments);
  }

  /**
   * Create default style object
   */
  createDefaultStyle() {
    return {
      bold: false,
      italic: false,
      underline: false,
      strikethrough: false,
      color: null,
      backgroundColor: null,
      fontSize: null
    };
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
      '&copy;': '©',
      '&reg;': '®',
      '&trade;': '™',
      '&deg;': '°',
      '&plusmn;': '±',
      '&times;': '×',
      '&divide;': '÷',
    };
    let result = text;
    for (const [entity, char] of Object.entries(entities)) {
      result = result.split(entity).join(char);
    }
    // Handle numeric entities like &#160; &#8217;
    result = result.replace(/&#(\d+);/g, (match, dec) => String.fromCharCode(dec));
    result = result.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => String.fromCharCode(parseInt(hex, 16)));
    // Replace non-breaking space (char code 160) with regular space
    result = result.replace(/\u00A0/g, ' ');
    return result;
  }

  /**
   * Walk the DOM tree and extract text with styles
   */
  walkTree(node, currentStyle, segments) {
    const childNodes = node.childNodes;

    for (let i = 0; i < childNodes.length; i++) {
      const child = childNodes[i];

      if (child.nodeType === Node.TEXT_NODE) {
        // Text node - add segment with current style
        let text = child.textContent;
        // Decode HTML entities and normalize spaces
        text = this.decodeHtmlEntities(text);
        if (text) {
          segments.push({
            text: text,
            style: { ...currentStyle }
          });
        }
      } else if (child.nodeType === Node.ELEMENT_NODE) {
        // Element node - update style and recurse
        const newStyle = this.applyNodeStyle(child, currentStyle);
        this.walkTree(child, newStyle, segments);
      }
    }
  }

  /**
   * Apply element's style modifications
   */
  applyNodeStyle(element, parentStyle) {
    const style = { ...parentStyle };
    const tagName = element.tagName.toLowerCase();

    // Tag-based styles
    switch (tagName) {
      case 'b':
      case 'strong':
        style.bold = true;
        break;
      case 'i':
      case 'em':
        style.italic = true;
        break;
      case 'u':
        style.underline = true;
        break;
      case 's':
      case 'strike':
      case 'del':
        style.strikethrough = true;
        break;
    }

    // Inline CSS styles
    if (element.style) {
      // Font weight
      if (element.style.fontWeight === 'bold' || parseInt(element.style.fontWeight) >= 700) {
        style.bold = true;
      }

      // Font style
      if (element.style.fontStyle === 'italic') {
        style.italic = true;
      }

      // Text decoration
      if (element.style.textDecoration) {
        if (element.style.textDecoration.includes('underline')) {
          style.underline = true;
        }
        if (element.style.textDecoration.includes('line-through')) {
          style.strikethrough = true;
        }
      }

      // Color
      if (element.style.color) {
        style.color = this.parseColor(element.style.color);
      }

      // Background color
      if (element.style.backgroundColor) {
        style.backgroundColor = this.parseColor(element.style.backgroundColor);
      }

      // Font size
      if (element.style.fontSize) {
        style.fontSize = this.parseFontSize(element.style.fontSize);
      }
    }

    return style;
  }

  /**
   * Parse color string to hex or RGB array
   */
  parseColor(colorStr) {
    if (!colorStr) return null;

    // Already hex
    if (colorStr.startsWith('#')) {
      return colorStr;
    }

    // RGB format
    const rgbMatch = colorStr.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (rgbMatch) {
      const r = parseInt(rgbMatch[1]);
      const g = parseInt(rgbMatch[2]);
      const b = parseInt(rgbMatch[3]);
      return [r, g, b];
    }

    // RGBA format - ignore alpha for PDF
    const rgbaMatch = colorStr.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/i);
    if (rgbaMatch) {
      const r = parseInt(rgbaMatch[1]);
      const g = parseInt(rgbaMatch[2]);
      const b = parseInt(rgbaMatch[3]);
      return [r, g, b];
    }

    return null;
  }

  /**
   * Parse font size to number (pt)
   */
  parseFontSize(sizeStr) {
    if (!sizeStr) return null;

    // Parse px
    const pxMatch = sizeStr.match(/(\d+(?:\.\d+)?)\s*px/i);
    if (pxMatch) {
      // Convert px to pt (approximately)
      return Math.round(parseFloat(pxMatch[1]) * 0.75);
    }

    // Parse pt
    const ptMatch = sizeStr.match(/(\d+(?:\.\d+)?)\s*pt/i);
    if (ptMatch) {
      return parseFloat(ptMatch[1]);
    }

    // Plain number
    const numMatch = sizeStr.match(/^(\d+(?:\.\d+)?)$/);
    if (numMatch) {
      return parseFloat(numMatch[1]);
    }

    return null;
  }

  /**
   * Merge adjacent segments with identical styles
   */
  mergeSegments(segments) {
    if (segments.length === 0) return segments;

    const merged = [];
    let current = { ...segments[0] };

    for (let i = 1; i < segments.length; i++) {
      const next = segments[i];

      if (this.stylesEqual(current.style, next.style)) {
        // Same style - merge text
        current.text += next.text;
      } else {
        // Different style - push current and start new
        if (current.text) {
          merged.push(current);
        }
        current = { ...next };
      }
    }

    // Push last segment
    if (current.text) {
      merged.push(current);
    }

    return merged;
  }

  /**
   * Check if two style objects are equal
   */
  stylesEqual(style1, style2) {
    return (
      style1.bold === style2.bold &&
      style1.italic === style2.italic &&
      style1.underline === style2.underline &&
      style1.strikethrough === style2.strikethrough &&
      this.colorsEqual(style1.color, style2.color) &&
      style1.fontSize === style2.fontSize
    );
  }

  /**
   * Check if two colors are equal
   */
  colorsEqual(c1, c2) {
    if (c1 === c2) return true;
    if (!c1 || !c2) return false;
    if (Array.isArray(c1) && Array.isArray(c2)) {
      return c1[0] === c2[0] && c1[1] === c2[1] && c1[2] === c2[2];
    }
    return false;
  }
}

export default RichTextTokenizer;
