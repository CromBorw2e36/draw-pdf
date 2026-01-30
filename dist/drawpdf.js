import "jspdf";
import "jspdf-autotable";
class v {
  constructor() {
    this.inlineTags = ["b", "strong", "i", "em", "u", "s", "strike", "span"];
  }
  /**
   * Tokenize HTML string into styled segments
   * @param {string} html - HTML content (from CKEditor paragraph innerHTML)
   * @returns {Array<{text: string, style: Object}>} Array of styled segments
   */
  tokenize(t) {
    if (!t || typeof t != "string")
      return [{ text: "", style: this.createDefaultStyle() }];
    const i = document.createElement("div");
    i.innerHTML = t;
    const e = [];
    return this.walkTree(i, this.createDefaultStyle(), e), this.mergeSegments(e);
  }
  /**
   * Create default style object
   */
  createDefaultStyle() {
    return {
      bold: !1,
      italic: !1,
      underline: !1,
      strikethrough: !1,
      color: null,
      backgroundColor: null,
      fontSize: null
    };
  }
  /**
   * Decode HTML entities in text
   */
  decodeHtmlEntities(t) {
    if (!t || typeof t != "string") return t;
    const i = {
      "&nbsp;": " ",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
      "&apos;": "'",
      "&ndash;": "–",
      "&mdash;": "—",
      "&hellip;": "…",
      "&copy;": "©",
      "&reg;": "®",
      "&trade;": "™",
      "&deg;": "°",
      "&plusmn;": "±",
      "&times;": "×",
      "&divide;": "÷"
    };
    let e = t;
    for (const [n, s] of Object.entries(i))
      e = e.split(n).join(s);
    return e = e.replace(/&#(\d+);/g, (n, s) => String.fromCharCode(s)), e = e.replace(/&#x([0-9a-fA-F]+);/g, (n, s) => String.fromCharCode(parseInt(s, 16))), e = e.replace(/\u00A0/g, " "), e;
  }
  /**
   * Walk the DOM tree and extract text with styles
   */
  walkTree(t, i, e) {
    const n = t.childNodes;
    for (let s = 0; s < n.length; s++) {
      const r = n[s];
      if (r.nodeType === Node.TEXT_NODE) {
        let o = r.textContent;
        o = this.decodeHtmlEntities(o), o && e.push({
          text: o,
          style: { ...i }
        });
      } else if (r.nodeType === Node.ELEMENT_NODE) {
        const o = this.applyNodeStyle(r, i);
        this.walkTree(r, o, e);
      }
    }
  }
  /**
   * Apply element's style modifications
   */
  applyNodeStyle(t, i) {
    const e = { ...i };
    switch (t.tagName.toLowerCase()) {
      case "b":
      case "strong":
        e.bold = !0;
        break;
      case "i":
      case "em":
        e.italic = !0;
        break;
      case "u":
        e.underline = !0;
        break;
      case "s":
      case "strike":
      case "del":
        e.strikethrough = !0;
        break;
    }
    return t.style && ((t.style.fontWeight === "bold" || parseInt(t.style.fontWeight) >= 700) && (e.bold = !0), t.style.fontStyle === "italic" && (e.italic = !0), t.style.textDecoration && (t.style.textDecoration.includes("underline") && (e.underline = !0), t.style.textDecoration.includes("line-through") && (e.strikethrough = !0)), t.style.color && (e.color = this.parseColor(t.style.color)), t.style.backgroundColor && (e.backgroundColor = this.parseColor(t.style.backgroundColor)), t.style.fontSize && (e.fontSize = this.parseFontSize(t.style.fontSize))), e;
  }
  /**
   * Parse color string to hex or RGB array
   */
  parseColor(t) {
    if (!t) return null;
    if (t.startsWith("#"))
      return t;
    const i = t.match(/rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)/i);
    if (i) {
      const n = parseInt(i[1]), s = parseInt(i[2]), r = parseInt(i[3]);
      return [n, s, r];
    }
    const e = t.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/i);
    if (e) {
      const n = parseInt(e[1]), s = parseInt(e[2]), r = parseInt(e[3]);
      return [n, s, r];
    }
    return null;
  }
  /**
   * Parse font size to number (pt)
   */
  parseFontSize(t) {
    if (!t) return null;
    const i = t.match(/(\d+(?:\.\d+)?)\s*px/i);
    if (i)
      return Math.round(parseFloat(i[1]) * 0.75);
    const e = t.match(/(\d+(?:\.\d+)?)\s*pt/i);
    if (e)
      return parseFloat(e[1]);
    const n = t.match(/^(\d+(?:\.\d+)?)$/);
    return n ? parseFloat(n[1]) : null;
  }
  /**
   * Merge adjacent segments with identical styles
   */
  mergeSegments(t) {
    if (t.length === 0) return t;
    const i = [];
    let e = { ...t[0] };
    for (let n = 1; n < t.length; n++) {
      const s = t[n];
      this.stylesEqual(e.style, s.style) ? e.text += s.text : (e.text && i.push(e), e = { ...s });
    }
    return e.text && i.push(e), i;
  }
  /**
   * Check if two style objects are equal
   */
  stylesEqual(t, i) {
    return t.bold === i.bold && t.italic === i.italic && t.underline === i.underline && t.strikethrough === i.strikethrough && this.colorsEqual(t.color, i.color) && t.fontSize === i.fontSize;
  }
  /**
   * Check if two colors are equal
   */
  colorsEqual(t, i) {
    return t === i ? !0 : !t || !i ? !1 : Array.isArray(t) && Array.isArray(i) ? t[0] === i[0] && t[1] === i[1] && t[2] === i[2] : !1;
  }
}
const _ = {
  WIDTH: 210,
  HEIGHT: 297,
  MARGIN_TOP: 20,
  MARGIN_BOTTOM: 20,
  MARGIN_LEFT: 15,
  MARGIN_RIGHT: 15,
  get CONTENT_WIDTH() {
    return this.WIDTH - this.MARGIN_LEFT - this.MARGIN_RIGHT;
  },
  get CONTENT_HEIGHT() {
    return this.HEIGHT - this.MARGIN_TOP - this.MARGIN_BOTTOM;
  }
}, x = {
  DEFAULT_SIZE: 12,
  LINE_HEIGHT: 1.5,
  H1_SIZE: 18,
  H2_SIZE: 16,
  H3_SIZE: 14
};
class k {
  constructor() {
    this.currentY = _.MARGIN_TOP, this.currentPage = 0, this.pages = [{ pageNumber: 1, elements: [] }], this.tokenizer = new v();
  }
  /**
   * Decode HTML entities in text
   */
  decodeHtmlEntities(t) {
    if (!t || typeof t != "string") return t;
    const i = {
      "&nbsp;": " ",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
      "&apos;": "'",
      "&ndash;": "–",
      "&mdash;": "—",
      "&hellip;": "…"
    };
    let e = t;
    for (const [n, s] of Object.entries(i))
      e = e.split(n).join(s);
    return e = e.replace(/&#(\d+);/g, (n, s) => String.fromCharCode(s)), e = e.replace(/&#x([0-9a-fA-F]+);/g, (n, s) => String.fromCharCode(parseInt(s, 16))), e = e.replace(/\u00A0/g, " "), e;
  }
  /**
   * Parse CKEditor HTML to JSON blueprint
   * @param {string} html - CKEditor HTML output
   * @returns {Object} JSON blueprint
   */
  parse(t) {
    this.currentY = _.MARGIN_TOP, this.currentPage = 0, this.pages = [{ pageNumber: 1, elements: [] }];
    const n = new DOMParser().parseFromString(t, "text/html").body.children;
    for (let s = 0; s < n.length; s++)
      this.processNode(n[s]);
    return {
      version: "1.0",
      pageSize: { width: _.WIDTH, height: _.HEIGHT, unit: "mm" },
      margins: {
        top: _.MARGIN_TOP,
        bottom: _.MARGIN_BOTTOM,
        left: _.MARGIN_LEFT,
        right: _.MARGIN_RIGHT
      },
      pages: this.pages
    };
  }
  /**
   * Process a DOM node
   */
  processNode(t) {
    var e, n;
    switch ((e = t.tagName) == null ? void 0 : e.toLowerCase()) {
      case "p":
        this.processParagraph(t);
        break;
      case "h1":
        this.processHeading(t, 1);
        break;
      case "h2":
        this.processHeading(t, 2);
        break;
      case "h3":
        this.processHeading(t, 3);
        break;
      case "ul":
        this.processList(t, "bullet");
        break;
      case "ol":
        this.processList(t, "number");
        break;
      case "table":
        this.processTable(t);
        break;
      case "figure":
        t.querySelector("table") ? this.processTable(t.querySelector("table")) : t.querySelector("img") && this.processImage(t.querySelector("img"));
        break;
      case "hr":
        this.processHorizontalRule();
        break;
      case "pre":
        this.processCodeBlock(t);
        break;
      default:
        (n = t.textContent) != null && n.trim() && this.addTextElement(t.textContent.trim(), {});
    }
  }
  /**
   * Process paragraph element
   */
  processParagraph(t) {
    const i = t.innerHTML, e = this.extractStyles(t), n = t.style.textAlign || "left";
    this.addTextElement(i, { ...e, align: n });
  }
  /**
   * Process heading element
   */
  processHeading(t, i) {
    const e = t.innerHTML, n = { 1: x.H1_SIZE, 2: x.H2_SIZE, 3: x.H3_SIZE };
    this.addTextElement(e, {
      fontSize: n[i],
      fontWeight: "bold",
      align: t.style.textAlign || "left"
    });
  }
  /**
   * Process list
   */
  processList(t, i) {
    t.querySelectorAll("li").forEach((n, s) => {
      const o = (i === "number" ? `${s + 1}. ` : "• ") + n.innerHTML;
      this.addTextElement(o, { indent: 10 });
    });
  }
  /**
   * Process table with properties
   */
  processTable(t) {
    const i = [], e = t.querySelectorAll("tr"), n = {
      // Width: from style or attribute
      width: this.parseWidth(t.style.width || t.getAttribute("width")),
      // Border: from style or attribute
      borderWidth: this.parseBorderWidth(t.style.border || t.getAttribute("border")),
      borderColor: this.parseColor(t.style.borderColor) || "#000000",
      // Background
      backgroundColor: this.parseColor(t.style.backgroundColor),
      // Alignment: check for margin auto (center) or margin-left auto (right)
      align: this.parseTableAlign(t)
    };
    e.forEach((s) => {
      const r = [];
      s.querySelectorAll("td, th").forEach((a) => {
        const l = a.querySelector("img"), c = parseInt(a.getAttribute("colspan")) || 1, d = parseInt(a.getAttribute("rowspan")) || 1;
        let h = a.style.textAlign || "left";
        const u = a.querySelector('p[style*="text-align"]');
        u && u.style.textAlign && (h = u.style.textAlign);
        const g = {
          backgroundColor: this.parseColor(a.style.backgroundColor),
          borderColor: this.parseColor(a.style.borderColor),
          borderWidth: this.parseBorderWidth(a.style.border || a.style.borderWidth),
          verticalAlign: a.style.verticalAlign || "middle",
          padding: this.parsePadding(a.style.padding),
          width: this.parseWidth(a.style.width || a.getAttribute("width")),
          height: this.parseWidth(a.style.height || a.getAttribute("height"))
        };
        l ? r.push({
          type: "image",
          src: l.src || l.getAttribute("src"),
          width: parseInt(l.width) || 50,
          height: parseInt(l.height) || 50,
          colSpan: c,
          rowSpan: d,
          align: h,
          isHeader: a.tagName.toLowerCase() === "th",
          cellStyle: g
        }) : r.push({
          content: a.innerHTML || " ",
          isHeader: a.tagName.toLowerCase() === "th",
          colSpan: c,
          rowSpan: d,
          align: h,
          cellStyle: g
        });
      }), i.push(r);
    }), this.addElement({
      type: "table",
      width: n.width || _.CONTENT_WIDTH,
      rows: i,
      style: n
    });
  }
  /**
   * Parse width value to mm
   */
  parseWidth(t) {
    if (!t) return null;
    const i = parseFloat(t);
    return isNaN(i) ? null : String(t).includes("%") ? i / 100 * _.CONTENT_WIDTH : String(t).includes("px") ? i * 0.264 : i;
  }
  /**
   * Parse border width
   */
  parseBorderWidth(t) {
    if (!t) return 0.5;
    const i = String(t).match(/(\d+\.?\d*)/);
    if (i) {
      const e = parseFloat(i[1]);
      return e > 5 ? e * 0.264 : e;
    }
    return 0.5;
  }
  /**
   * Parse color from CSS
   */
  parseColor(t) {
    if (!t) return null;
    if (t.startsWith("#")) return t;
    const i = t.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    if (i) {
      const e = parseInt(i[1]).toString(16).padStart(2, "0"), n = parseInt(i[2]).toString(16).padStart(2, "0"), s = parseInt(i[3]).toString(16).padStart(2, "0");
      return `#${e}${n}${s}`;
    }
    return t;
  }
  /**
   * Parse table alignment from margin styles
   */
  parseTableAlign(t) {
    const i = t.style.marginLeft, e = t.style.marginRight;
    return i === "auto" && e === "auto" ? "center" : i === "auto" ? "right" : "left";
  }
  /**
   * Parse padding value to mm
   */
  parsePadding(t) {
    if (!t) return null;
    const i = parseFloat(t);
    return isNaN(i) ? null : i * 0.264;
  }
  /**
   * Process image
   */
  processImage(t) {
    const i = t.src || t.getAttribute("src"), e = parseInt(t.width) || 50, n = parseInt(t.height) || 50, s = Math.min(e * 0.264, _.CONTENT_WIDTH), r = n * 0.264;
    this.addElement({
      type: "image",
      // Content-flow: No x,y - renderer will calculate
      width: s,
      height: r,
      src: i,
      align: "left"
      // Default alignment, can be extended
    });
  }
  /**
   * Process horizontal rule (content-flow)
   */
  processHorizontalRule() {
    this.addElement({
      type: "line",
      // Content-flow: No fixed coordinates - renderer will calculate
      fullWidth: !0,
      // Indicates line spans full content width
      style: { color: "#cccccc", width: 0.5 }
    });
  }
  /**
   * Extract inline styles from node (content-flow approach)
   */
  extractStyles(t) {
    var l, c, d, h;
    const i = {}, e = t.innerHTML;
    (e.includes("<strong>") || e.includes("<b>") || t.style.fontWeight === "bold") && (i.fontWeight = "bold"), (e.includes("<i>") || e.includes("<em>") || t.style.fontStyle === "italic") && (i.fontStyle = "italic"), (e.includes("<u>") || (l = t.style.textDecoration) != null && l.includes("underline")) && (i.underline = !0);
    const n = e.match(/color:\s*([^;"]+)/);
    n && (i.color = n[1]);
    const s = e.match(/font-size:\s*(\d+)/);
    s && (i.fontSize = parseInt(s[1]));
    const r = (c = t.style.marginLeft) == null ? void 0 : c.match(/(\d+)/);
    r && (i.marginLeft = parseFloat(r[1]) * 0.264);
    const o = (d = t.style.textIndent) == null ? void 0 : d.match(/(\d+)/);
    o && (i.indent = parseFloat(o[1]) * 0.264);
    const a = (h = t.style.paddingLeft) == null ? void 0 : h.match(/(\d+)/);
    return a && (i.indent = (i.indent || 0) + parseFloat(a[1]) * 0.264), i;
  }
  /**
   * Add text element with rich text tokenization (content-flow approach)
   * No x,y coordinates - renderer will calculate based on layout hints
   */
  addTextElement(t, i) {
    const e = this.tokenizer.tokenize(t), n = e.map((l) => l.text).join("");
    if (!n.trim()) {
      this.addElement({
        type: "space",
        height: (i.fontSize || x.DEFAULT_SIZE) * x.LINE_HEIGHT * 0.352778
        // line height in mm
      });
      return;
    }
    const s = i.fontSize || x.DEFAULT_SIZE, r = s * x.LINE_HEIGHT * 0.352778, o = (i.indent || 0) + (i.marginLeft || 0), a = _.CONTENT_WIDTH - o;
    this.addElement({
      type: "richtext",
      // Content-flow: No x,y - use layout hints instead
      indent: i.indent || 0,
      marginLeft: i.marginLeft || 0,
      width: a,
      segments: e,
      content: n,
      // Fallback plain text
      style: {
        fontSize: s,
        fontWeight: i.fontWeight || "normal",
        fontStyle: i.fontStyle || "normal",
        color: i.color || "#000000",
        align: i.align || "left",
        underline: i.underline || !1,
        lineHeight: r
      }
    });
  }
  /**
   * Add element to current page
   */
  addElement(t) {
    this.pages[this.currentPage].elements.push(t);
  }
  /**
   * Create new page
   */
  newPage() {
    this.currentPage++, this.pages.push({
      pageNumber: this.currentPage + 1,
      elements: []
    }), this.currentY = _.MARGIN_TOP;
  }
  /**
   * Process code block element (pre > code)
   * If code starts with '// eval', it will be evaluated as JavaScript
   * Otherwise treated as display-only code
   */
  processCodeBlock(t) {
    const i = t.querySelector("code") || t;
    let e = i.textContent || "";
    e = this.decodeHtmlEntities(e);
    const n = e.trim().startsWith("// eval") || e.trim().startsWith("/* eval */") || e.trim().startsWith("//eval"), r = (i.className || "").match(/language-(\w+)/), o = r ? r[1] : "javascript", a = {
      type: n ? "evalblock" : "codeblock",
      code: e.trim(),
      language: o,
      isEval: n
    };
    this.addElement(a), console.log("[CKEditorParser] Code block:", n ? "EVAL" : "DISPLAY", o);
  }
}
class w {
  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Data object
   * @param {string} path - Dot notation path (e.g., "user.address.city")
   * @returns {*} Value at path or undefined
   */
  static getNestedValue(t, i) {
    if (!t || !i) return;
    const e = i.trim().split(".");
    let n = t;
    for (const s of e) {
      if (n == null) return;
      n = n[s];
    }
    return n;
  }
  /**
   * Evaluate simple condition expression
   * Supports: ===, !==, >, <, >=, <=, truthy check
   * @param {string} expression - Condition expression
   * @param {Object} data - Data context
   * @returns {boolean}
   */
  static evaluateCondition(t, i) {
    const e = t.trim(), n = ["===", "!==", ">=", "<=", ">", "<"];
    for (const r of n)
      if (e.includes(r)) {
        const [o, a] = e.split(r).map((d) => d.trim()), l = this.resolveValue(o, i), c = this.resolveValue(a, i);
        switch (r) {
          case "===":
            return l === c;
          case "!==":
            return l !== c;
          case ">":
            return l > c;
          case "<":
            return l < c;
          case ">=":
            return l >= c;
          case "<=":
            return l <= c;
        }
      }
    return !!this.resolveValue(e, i);
  }
  /**
   * Resolve a value - could be a variable path or literal
   * @param {string} token - Value token
   * @param {Object} data - Data context
   * @returns {*}
   */
  static resolveValue(t, i) {
    const e = t.trim();
    if (e.startsWith("'") && e.endsWith("'") || e.startsWith('"') && e.endsWith('"'))
      return e.slice(1, -1);
    if (!isNaN(e) && e !== "")
      return parseFloat(e);
    if (e === "true") return !0;
    if (e === "false") return !1;
    if (e === "null") return null;
    if (e !== "undefined")
      return this.getNestedValue(i, e);
  }
  /**
   * Process {{#if condition}}...{{/if}} blocks
   * Also supports {{#if}}...{{else}}...{{/if}}
   * @param {string} text - Template text
   * @param {Object} data - Data context
   * @returns {string}
   */
  static processIfBlocks(t, i) {
    const e = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    return t.replace(e, (n, s, r) => {
      const o = this.evaluateCondition(s, i), a = r.indexOf("{{else}}");
      if (a !== -1) {
        const l = r.substring(0, a), c = r.substring(a + 8);
        return o ? l : c;
      }
      return o ? r : "";
    });
  }
  /**
   * Process {{#each array}}...{{/each}} blocks
   * Also supports {{~#each}} tilde syntax for whitespace control
   * Special vars: @index, @first, @last
   * Auto-adds newline between items
   * Supports multi-line template content
   * @param {string} text - Template text
   * @param {Object} data - Data context
   * @returns {string}
   */
  static processEachBlocks(t, i) {
    const e = /\{\{~?#each\s+([^}~]+)~?\}\}([\s\S]*?)\{\{~?\/each~?\}\}/g;
    return t.replace(e, (n, s, r) => {
      const o = s.trim(), a = this.getNestedValue(i, o);
      if (console.log("[TemplateEngine] #each:", o, "array:", a), !Array.isArray(a) || a.length === 0)
        return console.log("[TemplateEngine] #each: array not found or empty"), "";
      const l = r.trim();
      return a.map((c, d) => {
        const h = {
          ...i,
          // Parent data
          ...c,
          // Item properties (if object)
          "@index": d,
          "@first": d === 0,
          "@last": d === a.length - 1,
          "@item": c
          // Reference to current item
        };
        let u = this.processIfBlocks(l, h);
        return u = this.processFormatHelpers(u, h), u = this.processDateHelpers(u), u = this.replaceVariables(u, h), u = this.processLayoutTags(u), u.trim();
      }).join(`
`);
    });
  }
  /**
   * Process helper tags: {{br}}, {{tab}}, {{space}}, {{hr}}, {{pageBreak}}
   * Converts to markers that renderer will handle
   * @param {string} text - Template text
   * @returns {string}
   */
  static processLayoutTags(t) {
    let i = t;
    return i = i.replace(/\{\{br\}\}/gi, "___BR___"), i = i.replace(/\{\{tab\}\}/gi, "___TAB___"), i = i.replace(/\{\{space\}\}/gi, " "), i = i.replace(/\{\{hr\}\}/gi, "___HR___"), i = i.replace(/\{\{pageBreak\}\}/gi, "___PAGEBREAK___"), i;
  }
  /**
   * Process format helpers
   * @param {string} text - Template text
   * @param {Object} data - Data context
   * @returns {string}
   */
  static processFormatHelpers(t, i) {
    let e = t;
    return e = e.replace(/\{\{formatNumber\s+([^}]+)\}\}/g, (n, s) => {
      const r = this.getNestedValue(i, s.trim());
      return r == null ? n : this.formatNumber(r);
    }), e = e.replace(/\{\{formatCurrency\s+([^}]+)\}\}/g, (n, s) => {
      const r = this.getNestedValue(i, s.trim());
      return r == null ? n : this.formatCurrency(r);
    }), e = e.replace(/\{\{formatDate\s+([^}]+)\}\}/g, (n, s) => {
      const r = this.getNestedValue(i, s.trim());
      return r == null ? n : this.formatDate(r);
    }), e = e.replace(/\{\{uppercase\s+([^}]+)\}\}/g, (n, s) => {
      const r = this.getNestedValue(i, s.trim());
      return r == null ? n : String(r).toUpperCase();
    }), e = e.replace(/\{\{lowercase\s+([^}]+)\}\}/g, (n, s) => {
      const r = this.getNestedValue(i, s.trim());
      return r == null ? n : String(r).toLowerCase();
    }), e = e.replace(/\{\{capitalize\s+([^}]+)\}\}/g, (n, s) => {
      const r = this.getNestedValue(i, s.trim());
      return r == null ? n : String(r).replace(/\b\w/g, (o) => o.toUpperCase());
    }), e;
  }
  /**
   * Process date helpers: {{now}}, {{today}}, {{year}}, {{month}}, {{day}}
   * @param {string} text - Template text
   * @returns {string}
   */
  static processDateHelpers(t) {
    const i = /* @__PURE__ */ new Date();
    let e = t;
    return e = e.replace(/\{\{now\}\}/gi, i.toLocaleString("vi-VN")), e = e.replace(/\{\{today\}\}/gi, this.formatDateObject(i)), e = e.replace(/\{\{year\}\}/gi, String(i.getFullYear())), e = e.replace(/\{\{month\}\}/gi, String(i.getMonth() + 1).padStart(2, "0")), e = e.replace(/\{\{day\}\}/gi, String(i.getDate()).padStart(2, "0")), e = e.replace(
      /\{\{time\}\}/gi,
      `${String(i.getHours()).padStart(2, "0")}:${String(i.getMinutes()).padStart(2, "0")}`
    ), e;
  }
  /**
   * Format number with thousand separators (Vietnamese style: 1.000.000)
   */
  static formatNumber(t) {
    if (t == null || t === "") return "";
    const i = parseFloat(t);
    return isNaN(i) ? "" : i.toLocaleString("vi-VN");
  }
  /**
   * Format as Vietnamese currency (25.000.000đ)
   */
  static formatCurrency(t) {
    if (t == null || t === "") return "";
    const i = parseFloat(t);
    return isNaN(i) ? "" : i.toLocaleString("vi-VN") + "đ";
  }
  /**
   * Format date string or object to dd/MM/yyyy
   */
  static formatDate(t) {
    if (!t) return "";
    if (typeof t == "string" && /^\d{2}\/\d{2}\/\d{4}$/.test(t))
      return t;
    const i = new Date(t);
    return isNaN(i.getTime()) ? String(t) : this.formatDateObject(i);
  }
  /**
   * Format Date object to dd/MM/yyyy
   */
  static formatDateObject(t) {
    const i = String(t.getDate()).padStart(2, "0"), e = String(t.getMonth() + 1).padStart(2, "0"), n = t.getFullYear();
    return `${i}/${e}/${n}`;
  }
  /**
   * Replace {{variable}} placeholders with values
   * Supports nested paths: {{user.address.city}}
   * @param {string} text - Template text
   * @param {Object} data - Data context
   * @returns {string}
   */
  static replaceVariables(t, i) {
    return !t || typeof t != "string" ? t || "" : t.replace(/\{\{([^#\/][^}]*?)\}\}/g, (e, n) => {
      const s = n.trim();
      if ([
        "br",
        "tab",
        "space",
        "hr",
        "pageBreak",
        "now",
        "today",
        "year",
        "month",
        "day",
        "time"
      ].includes(s.toLowerCase()) || s.startsWith("formatNumber") || s.startsWith("formatCurrency") || s.startsWith("formatDate") || s.startsWith("uppercase") || s.startsWith("lowercase") || s.startsWith("capitalize"))
        return e;
      if (s.startsWith("@")) {
        const a = i[s];
        return a !== void 0 ? String(a) : e;
      }
      const o = this.getNestedValue(i, s);
      return o !== void 0 ? String(o) : e;
    });
  }
  /**
   * Main process function - processes all template features
   * Order: if blocks → each blocks → format helpers → date helpers → variables → layout tags
   * @param {string} text - Template text
   * @param {Object} data - Data context
   * @returns {string}
   */
  static process(t, i) {
    if (!t || typeof t != "string") return t || "";
    let e = t;
    return e = this.processIfBlocks(e, i), e = this.processEachBlocks(e, i), e = this.processFormatHelpers(e, i), e = this.processDateHelpers(e), e = this.replaceVariables(e, i), e = this.processLayoutTags(e), e;
  }
  /**
   * Extract all variable names from template
   * @param {string} text - Template text
   * @returns {string[]} Array of variable paths
   */
  static extractVariables(t) {
    if (!t || typeof t != "string") return [];
    const i = /* @__PURE__ */ new Set(), e = [
      "br",
      "tab",
      "space",
      "hr",
      "pageBreak",
      "now",
      "today",
      "year",
      "month",
      "day",
      "time",
      "else"
    ], n = /\{\{([^#\/][^}]*?)\}\}/g;
    let s;
    for (; (s = n.exec(t)) !== null; ) {
      const a = s[1].trim();
      if (!a.startsWith("@") && !e.includes(a.toLowerCase())) {
        if (a.startsWith("formatNumber ") || a.startsWith("formatCurrency ") || a.startsWith("formatDate ") || a.startsWith("uppercase ") || a.startsWith("lowercase ") || a.startsWith("capitalize ")) {
          const l = a.split(" ");
          l[1] && i.add(l[1].trim());
          continue;
        }
        i.add(a);
      }
    }
    const r = /\{\{#each\s+([^}]+)\}\}/g;
    for (; (s = r.exec(t)) !== null; )
      i.add(s[1].trim());
    const o = /\{\{#if\s+([^}]+)\}\}/g;
    for (; (s = o.exec(t)) !== null; )
      s[1].trim().split(/[=!<>]+/).map((c) => c.trim()).forEach((c) => {
        c && !c.startsWith("'") && !c.startsWith('"') && isNaN(c) && c !== "true" && c !== "false" && c !== "null" && i.add(c);
      });
    return Array.from(i);
  }
}
const P = {
  defaultFont: "Roboto",
  // Primary font for PDF rendering
  fallback: "helvetica",
  // Built-in jsPDF fallback font
  register: []
  // Custom font files to load (URLs to .js files)
}, { jsPDF: I } = window.jspdf;
typeof window < "u" && !window.jspdf && (window.jspdf = { jsPDF: I });
class A {
  /**
   * Create JsPdfService instance
   * @param {Object} fontConfig - Font configuration
   * @param {string} fontConfig.defaultFont - Primary font name (default: 'Roboto')
   * @param {string} fontConfig.fallback - Fallback font name (default: 'helvetica')
   */
  constructor(t = {}) {
    this.fontConfig = { ...P, ...t }, this.defaultFont = this.fontConfig.defaultFont, this.fallbackFont = this.fontConfig.fallback, this.doc = new I(), this.currentY = 20, this.lineHeight = 1, this.pageHeight = this.doc.internal.pageSize.height, this.pageWidth = this.doc.internal.pageSize.width, this.margins = { left: 15, right: 15, top: 20, bottom: 20 }, this._setupDefaultFont();
  }
  /**
   * Setup default font with fallback logic
   * @private
   */
  _setupDefaultFont() {
    try {
      const t = this.doc.getFontList();
      t[this.defaultFont] ? this.doc.setFont(this.defaultFont, "normal") : t[this.fallbackFont] ? (console.warn(`Font '${this.defaultFont}' not found, using fallback '${this.fallbackFont}'`), this.doc.setFont(this.fallbackFont, "normal"), this.defaultFont = this.fallbackFont) : (console.warn(`Neither '${this.defaultFont}' nor '${this.fallbackFont}' found, using 'helvetica'`), this.doc.setFont("helvetica", "normal"), this.defaultFont = "helvetica");
    } catch (t) {
      console.warn("Error setting up font, using helvetica:", t.message), this.doc.setFont("helvetica", "normal"), this.defaultFont = "helvetica";
    }
  }
  /**
   * Set font with automatic fallback
   * @param {string} fontName - Font name to use (optional, uses defaultFont if not provided)
   * @param {string} style - Font style: 'normal', 'bold', 'italic', 'bolditalic'
   */
  _setFont(t = null, i = "normal") {
    const e = t || this.defaultFont;
    try {
      this.doc.setFont(e, i);
    } catch {
      try {
        this.doc.setFont(this.fallbackFont, i);
      } catch {
        this.doc.setFont("helvetica", i);
      }
    }
  }
  // Kiểm tra và tự động xuống trang
  checkPageBreak(t = 10) {
    this.currentY + t > this.pageHeight - this.margins.bottom && this.addNewPage();
  }
  // Helper: Decode HTML entities
  _decodeHtmlEntities(t) {
    if (!t || typeof t != "string") return t;
    let i = t.replace(/\u00A0/g, " ");
    const e = {
      "&nbsp;": " ",
      "&amp;": "&",
      "&lt;": "<",
      "&gt;": ">",
      "&quot;": '"',
      "&#39;": "'",
      "&apos;": "'",
      "&ndash;": "–",
      "&mdash;": "—",
      "&hellip;": "…",
      "&copy;": "©",
      "&reg;": "®",
      "&trade;": "™",
      "&deg;": "°",
      "&plusmn;": "±",
      "&times;": "×",
      "&divide;": "÷",
      "&cent;": "¢",
      "&pound;": "£",
      "&euro;": "€",
      "&yen;": "¥",
      "&sect;": "§",
      "&bull;": "•"
    };
    for (const [n, s] of Object.entries(e))
      i = i.split(n).join(s);
    return i = i.replace(/&#(\d+);/g, (n, s) => {
      const r = parseInt(s, 10);
      return r === 160 ? " " : String.fromCharCode(r);
    }), i = i.replace(/&#x([0-9a-fA-F]+);/g, (n, s) => {
      const r = parseInt(s, 16);
      return r === 160 ? " " : String.fromCharCode(r);
    }), i = i.replace(/\u00A0/g, " "), i;
  }
  // Wrapper method để vẽ text với auto-decode HTML entities
  _drawText(t, i, e, n = {}) {
    const s = this._decodeHtmlEntities(t);
    this.doc.text(s, i, e, n);
  }
  // Helper: Convert any color format to RGB array [r, g, b]
  _parseColorToArray(t) {
    if (Array.isArray(t))
      return t;
    if (!t)
      return [0, 0, 0];
    if (typeof t == "string" && t.startsWith("#")) {
      let i = t.slice(1);
      i.length === 3 && (i = i[0] + i[0] + i[1] + i[1] + i[2] + i[2]);
      const e = parseInt(i.substring(0, 2), 16) || 0, n = parseInt(i.substring(2, 4), 16) || 0, s = parseInt(i.substring(4, 6), 16) || 0;
      return [e, n, s];
    }
    if (typeof t == "string") {
      const i = t.match(/rgb[a]?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
      if (i)
        return [parseInt(i[1]), parseInt(i[2]), parseInt(i[3])];
    }
    return [0, 0, 0];
  }
  // Insert text to PDF với hỗ trợ tiếng Việt và xuống dòng
  addText(t, i = null, e = null, n = {}) {
    t = this._decodeHtmlEntities(t);
    const r = { ...{
      fontSize: 12,
      fontStyle: "normal",
      color: [0, 0, 0],
      maxWidth: this.pageWidth - this.margins.left - this.margins.right,
      align: "left",
      lineHeight: this.lineHeight
    }, ...n }, o = i !== null ? i : this.margins.left;
    e !== null || this.currentY, this.doc.setFontSize(r.fontSize), this._setFont(null, r.fontStyle), this.doc.setTextColor(r.color[0], r.color[1], r.color[2]);
    const a = this.doc.splitTextToSize(t, r.maxWidth), l = a.length * r.lineHeight;
    this.checkPageBreak(l + 5);
    let c = this.currentY;
    a.forEach((h, u) => {
      if (r.align === "center") {
        const g = this.doc.getTextWidth(h), f = (this.pageWidth - g) / 2;
        this._drawText(h, f, c);
      } else if (r.align === "right") {
        const g = this.doc.getTextWidth(h), f = this.pageWidth - this.margins.right - g;
        this._drawText(h, f, c);
      } else r.align === "justify" ? !(u === a.length - 1) && h.trim().length > 0 ? this.drawJustifiedText(h, o, c, r.maxWidth, r) : this._drawText(h, o, c) : this._drawText(h, o, c);
      c += r.lineHeight;
    });
    const d = n.spacing !== void 0 ? n.spacing : 1;
    return this.currentY = c + d, this;
  }
  // Hàm vẽ text canh đều (justify)
  drawJustifiedText(t, i, e, n, s) {
    const r = t.trim().split(" ");
    if (r.length <= 1) {
      this._drawText(t, i, e);
      return;
    }
    let o = 0;
    r.forEach((h) => {
      o += this.doc.getTextWidth(h);
    });
    const a = r.length - 1, c = (n - o) / a;
    let d = i;
    r.forEach((h, u) => {
      this._drawText(h, d, e), d += this.doc.getTextWidth(h), u < r.length - 1 && (d += c);
    });
  }
  // Thêm bảng với jspdf-autotable
  addTable(t, i, e = {}) {
    if (!this.doc.autoTable)
      return console.warn("jspdf-autotable is not loaded"), this;
    const n = e.y !== void 0 ? e.y : this.currentY, s = {
      font: this.defaultFont,
      fontSize: 10,
      cellPadding: 3,
      overflow: "linebreak"
    };
    e.lineWidth !== void 0 && (s.lineWidth = e.lineWidth), e.lineColor && (s.lineColor = e.lineColor), e.fillColor && (s.fillColor = e.fillColor);
    let r = {
      top: this.margins.top,
      right: this.margins.right,
      bottom: this.margins.bottom,
      left: this.margins.left
    }, o = e.tableWidth || "auto";
    if (e.tableAlign === "center" && e.tableWidth) {
      const d = (this.pageWidth - this.margins.left - this.margins.right - e.tableWidth) / 2;
      r.left = this.margins.left + d;
    } else if (e.tableAlign === "right" && e.tableWidth) {
      const d = this.pageWidth - this.margins.left - this.margins.right - e.tableWidth;
      r.left = this.margins.left + d;
    }
    const a = {
      fillColor: !1,
      // No default - let user control via CKEditor
      textColor: [0, 0, 0],
      // fontStyle: 'bold', // Theo config của CKEditor
      halign: "center",
      ...e.headStyles || {}
    }, l = {
      startY: n,
      head: [t],
      body: i,
      theme: "grid",
      styles: s,
      headStyles: a,
      columnStyles: {},
      margin: r,
      tableWidth: typeof o == "number" ? o : "auto",
      didDrawPage: (c) => {
        this.currentY = c.cursor.y + 5;
      },
      ...e
    };
    return this.doc.autoTable(l), this.doc.lastAutoTable && (this.currentY = this.doc.lastAutoTable.finalY + 10), this;
  }
  // Thêm tiêu đề với style đặc biệt
  addTitle(t, i = {}) {
    const e = {
      fontSize: 18,
      fontStyle: "bold",
      color: [0, 0, 0],
      align: "center",
      lineHeight: 7,
      // Giảm từ 10 xuống 7
      ...i
    };
    return this.addText(t, null, null, e), this.currentY += 3, this;
  }
  // Thêm tiêu đề phụ
  addSubTitle(t, i = {}) {
    const e = {
      fontSize: 14,
      fontStyle: "bold",
      color: [0, 0, 0],
      lineHeight: 5.5,
      // Giảm từ 8 xuống 5.5
      ...i
    };
    return this.addText(t, null, null, e), this.currentY += 2, this;
  }
  // Thêm đoạn văn với các option linh hoạt
  addParagraph(t, i = {}) {
    const e = {
      fontSize: 10,
      fontStyle: "normal",
      color: [0, 0, 0],
      lineHeight: 4,
      // Giảm từ 6 xuống 4
      spacing: 1,
      // Khoảng cách sau paragraph (thay vì cộng thêm 3)
      ...i
    };
    return this.addText(t, null, null, e), this;
  }
  // Thêm text với bullet point
  addBulletPoint(t, i = {}) {
    const e = {
      fontSize: 11,
      fontStyle: "normal",
      color: [0, 0, 0],
      lineHeight: 4,
      // Giảm từ 6 xuống 4
      ...i
    };
    this.doc.setFontSize(e.fontSize), this._drawText("•", this.margins.left, this.currentY);
    const n = t, s = {
      ...e,
      maxWidth: e.maxWidth - 10
    };
    return this.addText(n, this.margins.left + 8, this.currentY, s), this;
  }
  // Insert image to PDF với nhiều tính năng
  addImage(t, i = null, e = null, n = 100, s = 100, r = {}) {
    const o = {
      format: "JPEG",
      align: "left",
      caption: null,
      captionOptions: {
        fontSize: 9,
        fontStyle: "italic",
        color: [100, 100, 100]
      },
      border: !1,
      borderOptions: {
        width: 1,
        color: [0, 0, 0]
      },
      compression: "MEDIUM",
      rotation: 0,
      ...r
    };
    let a = i !== null ? i : this.margins.left;
    e !== null || this.currentY, o.align === "center" ? a = (this.pageWidth - n) / 2 : o.align === "right" && (a = this.pageWidth - this.margins.right - n), this.checkPageBreak(s + 15);
    try {
      let l = o.format;
      if (typeof t == "string" && t.startsWith("data:") && (t.includes("data:image/png") ? l = "PNG" : t.includes("data:image/jpeg") || t.includes("data:image/jpg") ? l = "JPEG" : t.includes("data:image/gif") ? l = "GIF" : t.includes("data:image/webp") && (l = "WEBP")), this.doc.addImage(
        t,
        l,
        a,
        this.currentY,
        n,
        s,
        "",
        // alias (để trống)
        o.compression,
        o.rotation
      ), o.border) {
        this.doc.setLineWidth(o.borderOptions.width);
        const c = Array.isArray(o.borderOptions.color) ? o.borderOptions.color : [0, 0, 0];
        this.doc.setDrawColor(...c), this.doc.rect(a, this.currentY, n, s);
      }
      this.currentY += s + 5, o.caption ? this.addText(o.caption, null, null, {
        ...o.captionOptions,
        align: o.align
      }) : this.currentY += 5;
    } catch (l) {
      console.error("Lỗi khi thêm ảnh:", l), this.addText(`[Lỗi hiển thị ảnh: ${l.message}]`, a, null, {
        fontSize: 10,
        color: [255, 0, 0],
        align: o.align
      });
    }
    return this;
  }
  // Thêm ảnh từ file path
  async addImageFromPath(t, i = null, e = null, n = 100, s = 100, r = {}) {
    try {
      const o = await this.loadImageFromPath(t);
      if (o)
        return this.addImage(o, i, e, n, s, r);
      throw new Error(`Không thể load ảnh từ ${t}`);
    } catch (o) {
      console.error("Lỗi khi thêm ảnh từ path:", o), this.addText(`[Không thể load ảnh: ${t}]`, i, e, {
        fontSize: 10,
        color: [255, 0, 0]
      });
    }
    return this;
  }
  // Thêm ảnh với auto-resize để fit trong khung
  addImageFit(t, i = null, e = null, n = 150, s = 150, r = {}) {
    return new Promise((o) => {
      const a = new Image();
      a.onload = () => {
        let { width: l, height: c } = this.calculateFitSize(
          a.naturalWidth,
          a.naturalHeight,
          n,
          s
        );
        this.addImage(t, i, e, l, c, r), o(this);
      }, a.onerror = () => {
        console.error("Không thể load ảnh để tính kích thước"), this.addImage(t, i, e, n, s, r), o(this);
      }, a.src = t;
    });
  }
  // Tính toán kích thước fit
  calculateFitSize(t, i, e, n) {
    const s = e / t, r = n / i, o = Math.min(s, r);
    return {
      width: t * o,
      height: i * o
    };
  }
  // Thêm đường kẻ ngang
  addLine(t = null, i = null, e = null, n = null, s = {}) {
    const r = t !== null ? t : this.margins.left, o = i !== null ? i : this.currentY, a = e !== null ? e : this.pageWidth - this.margins.right, l = n !== null ? n : o, c = {
      lineWidth: 0.5,
      color: [0, 0, 0],
      ...s
    };
    return this.doc.setLineWidth(c.lineWidth), this.doc.setDrawColor(c.color[0], c.color[1], c.color[2]), this.doc.line(r, o, a, l), this.currentY = o + 8, this;
  }
  // Thêm trang mới
  addNewPage() {
    return this.doc.addPage(), this.currentY = this.margins.top, this._addSecondarySignaturesToNewPage(), this;
  }
  // Thêm khoảng trống
  addSpace(t = 10) {
    return this.currentY += t, this.checkPageBreak(), this;
  }
  // Thêm đường kẻ ngang
  addHorizontalLine(t = {}) {
    const i = {
      width: t.width || this.pageWidth - this.margins.left - this.margins.right,
      thickness: t.thickness || 0.5,
      color: t.color || [0, 0, 0],
      marginTop: t.marginTop || 3,
      marginBottom: t.marginBottom || 3,
      ...t
    };
    this.currentY += i.marginTop, this.checkPageBreak(i.thickness + i.marginBottom);
    const e = this.margins.left, n = e + i.width;
    return this.doc.setDrawColor(...i.color), this.doc.setLineWidth(i.thickness), this.doc.line(e, this.currentY, n, this.currentY), this.currentY += i.thickness + i.marginBottom, this;
  }
  // Reset vị trí
  resetPosition(t = null) {
    return this.currentY = t !== null ? t : this.margins.top, this;
  }
  // Lấy vị trí hiện tại
  getCurrentY() {
    return this.currentY;
  }
  // Thêm header cho tất cả trang
  addHeader(t, i = {}) {
    const e = {
      fontSize: 10,
      fontStyle: "normal",
      align: "center",
      // "left", "center", "right"
      color: [0, 0, 0],
      // Màu text [R, G, B]
      y: 10,
      ...i
    }, n = this.doc.internal.getNumberOfPages(), s = this.doc.internal.getCurrentPageInfo().pageNumber, r = this.doc.internal.getCurrentPageInfo().color || [0, 0, 0];
    for (let o = 1; o <= n; o++) {
      this.doc.setPage(o), this.doc.setFontSize(e.fontSize), this.doc.setTextColor(e.color[0], e.color[1], e.color[2]), this._setFont(null, e.fontStyle);
      let a;
      const l = this.doc.getTextWidth(t);
      e.align === "center" ? a = (this.pageWidth - l) / 2 : e.align === "right" ? a = this.pageWidth - this.margins.right - l : a = this.margins.left, this._drawText(t, a, e.y);
    }
    return this.doc.setTextColor(r[0] || 0, r[1] || 0, r[2] || 0), this.doc.setPage(s), this;
  }
  // Thêm footer cho tất cả trang
  addFooter(t, i = {}) {
    const e = {
      fontSize: 8,
      fontStyle: "normal",
      align: "center",
      y: this.pageHeight - 10,
      color: [0, 0, 0],
      // Thêm màu đen mặc định
      ...i
    }, n = this.doc.internal.getNumberOfPages(), s = this.doc.internal.getCurrentPageInfo().pageNumber;
    for (let r = 1; r <= n; r++) {
      this.doc.setPage(r), this.doc.setFontSize(e.fontSize), this._setFont(null, e.fontStyle);
      const o = Array.isArray(e.color) ? e.color : [0, 0, 0];
      this.doc.setTextColor(o[0], o[1], o[2]);
      const a = t.replace("{pageNumber}", r).replace("{totalPages}", n);
      if (e.align === "center") {
        const l = this.doc.getTextWidth(a), c = (this.pageWidth - l) / 2;
        this._drawText(a, c, e.y);
      } else if (e.align === "right") {
        const l = this.doc.getTextWidth(a);
        this._drawText(a, this.pageWidth - this.margins.right - l, e.y);
      } else
        this._drawText(a, this.margins.left, e.y);
    }
    return this.doc.setPage(s), this;
  }
  // Save PDF
  savePDF(t = "document.pdf") {
    try {
      this.doc.save(t), console.log(`PDF đã được lưu: ${t}`);
    } catch (i) {
      console.error("Lỗi khi lưu PDF:", i);
    }
  }
  // Gen blob PDF
  generateBlob() {
    try {
      return this.doc.output("blob");
    } catch (t) {
      return console.error("Lỗi khi tạo blob:", t), null;
    }
  }
  // Tạo Data URL
  generateDataURL() {
    try {
      return this.doc.output("dataurlstring");
    } catch (t) {
      return console.error("Lỗi khi tạo data URL:", t), null;
    }
  }
  // Preview PDF
  previewPDF() {
    try {
      const t = this.doc.output("dataurlstring");
      window.open(t, "_blank");
    } catch (t) {
      console.error("Lỗi khi preview PDF:", t);
    }
  }
  // Export PDF thành File để upload lên server
  exportPDFFile(t = "document.pdf") {
    try {
      const i = this.doc.output("blob"), e = new File([i], t, {
        type: "application/pdf",
        lastModified: Date.now()
      });
      return console.log(`PDF file đã được tạo: ${t}, Size: ${e.size} bytes`), e;
    } catch (i) {
      return console.error("Lỗi khi tạo PDF file:", i), null;
    }
  }
  // Export PDF thành ArrayBuffer để upload
  exportPDFArrayBuffer() {
    try {
      const t = this.doc.output("arraybuffer");
      return console.log(`PDF ArrayBuffer đã được tạo, Size: ${t.byteLength} bytes`), t;
    } catch (t) {
      return console.error("Lỗi khi tạo PDF ArrayBuffer:", t), null;
    }
  }
  // Export PDF với nhiều format khác nhau
  exportPDF(t = "file", i = "document.pdf") {
    try {
      switch (t.toLowerCase()) {
        case "file":
          return this.exportPDFFile(i);
        case "blob":
          return this.generateBlob();
        case "arraybuffer":
          return this.exportPDFArrayBuffer();
        case "dataurl":
          return this.generateDataURL();
        case "base64":
          return this.doc.output("datauristring").split(",")[1];
        case "binarystring":
          return this.doc.output("binarystring");
        default:
          return console.warn(`Format không hỗ trợ: ${t}. Sử dụng format 'file' mặc định.`), this.exportPDFFile(i);
      }
    } catch (e) {
      return console.error(`Lỗi khi export PDF với format ${t}:`, e), null;
    }
  }
  // Upload PDF lên server (hàm tiện ích)
  async uploadPDFToServer(t, i = "document.pdf", e = {}) {
    try {
      const n = this.exportPDFFile(i);
      if (!n)
        throw new Error("Không thể tạo PDF file");
      const s = new FormData();
      s.append(e.fieldName || "pdf", n), e.additionalData && Object.keys(e.additionalData).forEach((l) => {
        s.append(l, e.additionalData[l]);
      });
      const r = {
        method: "POST",
        body: s,
        ...e.fetchOptions
      };
      console.log(`Đang upload PDF tới: ${t}`);
      const o = await fetch(t, r);
      if (!o.ok)
        throw new Error(`HTTP error! status: ${o.status}`);
      const a = await o.json();
      return console.log("Upload thành công:", a), a;
    } catch (n) {
      throw console.error("Lỗi khi upload PDF:", n), n;
    }
  }
  // Thêm chữ ký đẹp mắt với nội dung căn giữa theo khối
  addSignature(t, i, e = null, n = {}) {
    const s = {
      align: "right",
      fontSize: 11,
      titleFontSize: 10,
      nameFontSize: 12,
      spacing: 8,
      signatureHeight: 20,
      blockWidth: 100,
      // Độ rộng khối chữ ký
      ...n
    }, r = e || (/* @__PURE__ */ new Date()).toLocaleDateString("vi-VN");
    let o;
    s.align === "right" ? o = this.pageWidth - this.margins.right - s.blockWidth : s.align === "center" ? o = (this.pageWidth - s.blockWidth) / 2 : o = this.margins.left;
    const a = o + s.blockWidth / 2;
    this.doc.setFontSize(s.fontSize);
    try {
      this._setFont(null, "normal");
    } catch {
      this.doc.setFont("helvetica", "normal");
    }
    this.doc.setTextColor(0, 0, 0);
    const l = this.doc.getTextWidth(r), c = a - l / 2;
    this._drawText(r, c, this.currentY), this.currentY += s.spacing, this.doc.setFontSize(s.titleFontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }
    const d = this.doc.getTextWidth(i), h = a - d / 2;
    this._drawText(i, h, this.currentY), this.currentY += 5;
    const u = "(Ký và ghi rõ họ tên)";
    this.doc.setFontSize(9);
    try {
      this._setFont(null, "italic");
    } catch {
      this.doc.setFont("helvetica", "italic");
    }
    this.doc.setTextColor(100, 100, 100);
    const g = this.doc.getTextWidth(u), f = a - g / 2;
    this._drawText(u, f, this.currentY), this.currentY += s.spacing, this.addSpace(s.signatureHeight), this.doc.setFontSize(s.nameFontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }
    this.doc.setTextColor(0, 0, 0);
    const p = this.doc.getTextWidth(t), b = a - p / 2;
    return this._drawText(t, b, this.currentY), this.currentY += 15, this;
  }
  // Load hình từ file path
  async loadImageFromPath(t) {
    try {
      const i = await fetch(t);
      if (!i.ok) throw new Error(`Không thể load hình từ ${t}`);
      const e = await i.blob();
      return new Promise((n, s) => {
        const r = new FileReader();
        r.onload = function(o) {
          n(o.target.result);
        }, r.onerror = function(o) {
          s(new Error("Lỗi khi đọc file"));
        }, r.readAsDataURL(e);
      });
    } catch (i) {
      return console.warn(`Không thể load hình từ ${t}:`, i.message), null;
    }
  }
  // Thêm chữ ký có hình ảnh với nội dung căn giữa theo khối
  async addSignatureWithImage(t, i, e, n = null, s = {}) {
    const r = {
      align: "right",
      fontSize: 11,
      titleFontSize: 10,
      nameFontSize: 12,
      dateFontSize: 10,
      spacing: 8,
      imageWidth: 60,
      imageHeight: 20,
      blockWidth: 100,
      // Độ rộng khối chữ ký
      ...s
    }, o = n || (/* @__PURE__ */ new Date()).toLocaleDateString("vi-VN");
    let a;
    r.align === "right" ? a = this.pageWidth - this.margins.right - r.blockWidth : r.align === "center" ? a = (this.pageWidth - r.blockWidth) / 2 : a = this.margins.left;
    const l = a + r.blockWidth / 2;
    this.doc.setFontSize(r.fontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }
    this.doc.setTextColor(0, 0, 0), this.doc.setFontSize(r.dateFontSize);
    const c = this._decodeHtmlEntities(o), d = this.doc.getTextWidth(c), h = l - d / 2;
    this._drawText(c, h, this.currentY), this.currentY += r.spacing, this.doc.setFontSize(r.titleFontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }
    const u = this._decodeHtmlEntities(i), g = this.doc.getTextWidth(u), f = l - g / 2;
    this._drawText(u, f, this.currentY), this.currentY += 5;
    const p = r.noteText ?? "(Ký và ghi rõ họ tên)";
    this.doc.setFontSize(9);
    try {
      this._setFont(null, "italic");
    } catch {
      this.doc.setFont("helvetica", "italic");
    }
    this.doc.setTextColor(100, 100, 100);
    const b = this._decodeHtmlEntities(p), m = this.doc.getTextWidth(b), S = l - m / 2;
    this._drawText(b, S, this.currentY), this.currentY += r.spacing, this.addSpace(5);
    let y = null;
    if (e && (typeof e == "string" ? e.startsWith("data:") ? y = e : y = await this.loadImageFromPath(e) : y = e), y) {
      const C = l - r.imageWidth / 2;
      this.addImage(
        y,
        C,
        this.currentY,
        r.imageWidth,
        r.imageHeight,
        {
          format: "JPEG"
        }
      );
    } else if (r.nameTag && r.nameTag.trim()) {
      const C = this.doc.internal.getCurrentPageInfo().color || [0, 0, 0];
      this.doc.setTextColor(255, 255, 255), this.doc.setFontSize(9);
      try {
        this._setFont(null, "italic");
      } catch {
        this.doc.setFont("helvetica", "italic");
      }
      const z = this._decodeHtmlEntities(r.nameTag), D = this.doc.getTextWidth(z), N = l - D / 2;
      this._drawText(z, N, this.currentY + r.imageHeight / 2), this.doc.setTextColor(
        C[0] || 0,
        C[1] || 0,
        C[2] || 0
      ), this.addSpace(r.imageHeight + 10);
    } else
      this.addSpace(r.imageHeight + 10);
    this.doc.setFontSize(r.nameFontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }
    this.doc.setTextColor(0, 0, 0);
    const T = this._decodeHtmlEntities(t), W = this.doc.getTextWidth(T), L = l - W / 2;
    return this._drawText(T, L, this.currentY), this.currentY += 15, this;
  }
  // Thêm chữ ký từ file path (phương thức tiện lợi)
  async addSignatureFromFile(t, i, e, n = null, s = {}) {
    return await this.addSignatureWithImage(t, i, e, n, s);
  }
  // Thêm chữ ký với nhiều tùy chọn hình ảnh
  async addSmartSignature(t, i, e = {}, n = null, s = {}) {
    const {
      imagePath: r = null,
      imageData: o = null,
      fallbackText: a = null,
      createFallback: l = !0
    } = e;
    let c = null;
    return r && (c = await this.loadImageFromPath(r)), !c && o && (c = o), !c && l && (c = this.createTextSignature(a || t)), await this.addSignatureWithImage(t, i, c, n, s);
  }
  /**
   * Thêm chữ ký nháy (chữ ký phụ) - hiển thị trên tất cả các trang
   * @param {Object} options - Tùy chọn cho chữ ký nháy
   * @param {string} options.imageData - Base64 image data của chữ ký (optional)
   * @param {string} options.nameTag - Text hiển thị dạng watermark khi không có hình (chữ không dấu)
   * @param {string[]} options.positions - Mảng vị trí: 'top-left', 'top-right', 'bottom-left', 'bottom-right'
   * @param {number} options.width - Chiều rộng chữ ký (mm) - mặc định 15
   * @param {number} options.height - Chiều cao chữ ký (mm) - mặc định 15
   * @param {number} options.margin - Khoảng cách từ mép trang (mm) - mặc định 5
   * @param {number} options.fontSize - Font size cho nameTag - mặc định 8
   * @param {boolean} options.showPageNumber - Hiển thị số trang sau nameTag - mặc định false
   * @returns {this}
   */
  addSecondarySignature(t = {}) {
    const e = { ...{
      imageData: null,
      nameTag: "Secondary Signature",
      positions: ["top-right"],
      width: 15,
      height: 15,
      margin: 5,
      fontSize: 8,
      showPageNumber: !1
    }, ...t }, n = ["top-left", "top-right", "bottom-left", "bottom-right"], r = (Array.isArray(e.positions) ? e.positions : [e.positions]).filter((a) => n.includes(a));
    if (r.length === 0)
      return console.warn("No valid positions provided for secondary signature"), this;
    this.secondarySignatures || (this.secondarySignatures = []), this.secondarySignatures.push({
      imageData: e.imageData,
      nameTag: e.nameTag,
      positions: r,
      width: e.width,
      height: e.height,
      margin: e.margin,
      fontSize: e.fontSize,
      showPageNumber: e.showPageNumber
    });
    const o = this.doc.internal.getNumberOfPages();
    for (let a = 1; a <= o; a++)
      this.doc.setPage(a), this._renderSecondarySignature(e, a);
    return this;
  }
  /**
   * Render chữ ký nháy ở các vị trí đã chọn (internal method)
   * @private
   */
  _renderSecondarySignature(t, i = null) {
    const e = this.doc.internal.pageSize.width, n = this.doc.internal.pageSize.height;
    i === null && (i = this.doc.internal.getCurrentPageInfo().pageNumber);
    for (const s of t.positions) {
      let r, o;
      switch (s) {
        case "top-left":
          r = t.margin, o = t.margin;
          break;
        case "top-right":
          r = e - t.width - t.margin, o = t.margin;
          break;
        case "bottom-left":
          r = t.margin, o = n - t.height - t.margin;
          break;
        case "bottom-right":
          r = e - t.width - t.margin, o = n - t.height - t.margin;
          break;
        default:
          continue;
      }
      if (t.imageData)
        try {
          this.doc.addImage(
            t.imageData,
            "PNG",
            r,
            o,
            t.width,
            t.height
          );
        } catch (a) {
          console.warn("Failed to add secondary signature image:", a), this._renderSecondarySignatureNameTag(r, o, t, i);
        }
      else
        this._renderSecondarySignatureNameTag(r, o, t, i);
    }
  }
  /**
   * Render nameTag dạng watermark cho chữ ký nháy (internal method)
   * @private
   */
  _renderSecondarySignatureNameTag(t, i, e, n) {
    const s = this.doc.getTextColor(), r = this.doc.internal.getFontSize(), o = this.doc.getFont();
    this.doc.setTextColor(154, 166, 178), this.doc.setFontSize(e.fontSize);
    try {
      this._setFont(null, "italic");
    } catch {
      this.doc.setFont("helvetica", "italic");
    }
    let a = e.nameTag;
    e.showPageNumber && n && (a = `${e.nameTag}_${n}`);
    const l = this._decodeHtmlEntities(a), c = this.doc.getTextWidth(l), d = t + (e.width - c), h = i + e.height / 2 + e.fontSize / 2 + 3;
    this._drawText(l, d, h), this.doc.setTextColor(s), this.doc.setFontSize(r), this.doc.setFont(o.fontName, o.fontStyle);
  }
  /**
   * Override addPage để tự động thêm chữ ký nháy vào trang mới
   */
  _addSecondarySignaturesToNewPage() {
    if (this.secondarySignatures && this.secondarySignatures.length > 0)
      for (const t of this.secondarySignatures)
        this._renderSecondarySignature(t);
  }
  // Tạo chữ ký text đơn giản
  createTextSignature(t, i = 120, e = 40) {
    const n = document.createElement("canvas"), s = n.getContext("2d");
    n.width = i, n.height = e, s.fillStyle = "white", s.fillRect(0, 0, i, e), s.fillStyle = "#1a5490", s.font = 'italic bold 14px cursive, "Times New Roman", serif';
    const r = this._decodeHtmlEntities(t), o = s.measureText(r).width, a = (i - o) / 2, l = e / 2 + 5;
    return s.fillText(r, a, l), s.strokeStyle = "#1a5490", s.lineWidth = 1.5, s.beginPath(), s.moveTo(a - 5, l + 8), s.lineTo(a + o + 5, l + 8), s.stroke(), n.toDataURL("image/png");
  }
  // Thêm chữ ký đơn giản với đường gạch
  addSimpleSignature(t, i, e = null, n = {}) {
    const s = {
      fontSize: 11,
      lineWidth: 100,
      spacing: 8,
      ...n
    }, r = e || this.margins.left;
    return this.addText(i, r, null, {
      fontSize: s.fontSize,
      fontStyle: "bold"
    }), this.addSpace(s.spacing), this.doc.setLineWidth(0.5), this.doc.line(r, this.currentY, r + s.lineWidth, this.currentY), this.addSpace(5), this.addText(t, r, null, {
      fontSize: s.fontSize - 1
    }), this.addSpace(15), this;
  }
  // Tạo bố cục chữ ký hai cột với nội dung căn giữa theo khối
  addDualSignature(t, i) {
    const n = this.margins.left, s = this.pageWidth / 2 + 10, r = n + 90 / 2, o = s + 90 / 2, a = this.currentY;
    this.currentY = a;
    const l = t.date || "";
    this.renderCenteredText(l, r, this.currentY, 11, "normal"), this.currentY += 8, this.renderCenteredText(t.title, r, this.currentY, 10, "bold"), this.currentY += 5;
    const c = t.note || "(Ký và ghi rõ họ tên)";
    if (this.renderCenteredText(c, r, this.currentY, 9, "italic", [100, 100, 100]), this.currentY += 25, t.signaturePath && t.signaturePath.trim())
      try {
        this.doc.addImage(
          t.signaturePath,
          "PNG",
          r - 15,
          this.currentY - 20,
          30,
          15
        );
      } catch (g) {
        console.warn("Không thể thêm chữ ký trái:", g);
      }
    else if (t.nameTag && t.nameTag.trim()) {
      const g = this.doc.internal.getCurrentPageInfo().color || [0, 0, 0];
      this.doc.setTextColor(255, 255, 255);
      const f = this._decodeHtmlEntities(t.nameTag);
      this._drawText(f, r - this.doc.getTextWidth(f) / 2, this.currentY - 15), this.doc.setTextColor(
        g[0] || 0,
        g[1] || 0,
        g[2] || 0
      );
    }
    this.renderCenteredText(t.name, r, this.currentY, 11, "bold");
    const d = this.currentY;
    this.currentY = a;
    const h = i.date || "";
    this.renderCenteredText(h, o, this.currentY, 11, "normal"), this.currentY += 8, this.renderCenteredText(i.title, o, this.currentY, 10, "bold"), this.currentY += 5;
    const u = i.note || "(Ký và ghi rõ họ tên)";
    if (this.renderCenteredText(u, o, this.currentY, 9, "italic", [100, 100, 100]), this.currentY += 25, i.signaturePath && i.signaturePath.trim())
      try {
        this.doc.addImage(
          i.signaturePath,
          "PNG",
          o - 15,
          this.currentY - 20,
          30,
          15
        );
      } catch (g) {
        console.warn("Không thể thêm chữ ký phải:", g);
      }
    else if (i.nameTag && i.nameTag.trim()) {
      const g = this.doc.internal.getCurrentPageInfo().color || [0, 0, 0];
      this.doc.setTextColor(255, 255, 255);
      const f = this._decodeHtmlEntities(i.nameTag);
      this._drawText(f, o - this.doc.getTextWidth(f) / 2, this.currentY - 15), this.doc.setTextColor(
        g[0] || 0,
        g[1] || 0,
        g[2] || 0
      );
    }
    return this.renderCenteredText(i.name, o, this.currentY, 11, "bold"), this.currentY = Math.max(d, this.currentY) + 10, this;
  }
  // Hàm helper để render text căn giữa (hỗ trợ cả text và mixed text)
  renderCenteredText(t, i, e, n = 11, s = "normal", r = [0, 0, 0]) {
    if (Array.isArray(t)) {
      const o = this.currentY;
      this.currentY = e;
      let a = 0;
      t.forEach((c) => {
        let d = typeof c == "string" ? c : c.text;
        d = this._decodeHtmlEntities(d);
        const h = typeof c == "object" && c.fontSize ? c.fontSize : n, u = typeof c == "object" && c.style ? c.style : s;
        this.doc.setFontSize(h), this._setFont(null, u), a += this.doc.getTextWidth(d);
      });
      let l = i - a / 2;
      t.forEach((c) => {
        const d = typeof c == "string" ? c : c.text, h = typeof c == "object" && c.fontSize ? c.fontSize : n, u = typeof c == "object" && c.style ? c.style : s, g = typeof c == "object" && c.color ? c.color : r;
        this.doc.setFontSize(h), this._setFont(null, u), this.doc.setTextColor(g[0], g[1], g[2]), this._drawText(d, l, e), l += this.doc.getTextWidth(d);
      }), this.currentY = o;
    } else if (typeof t == "object" && t.text) {
      const o = t.text, a = t.fontSize || n, l = t.style || s, c = t.color || r;
      this.doc.setFontSize(a), this._setFont(null, l), this.doc.setTextColor(c[0], c[1], c[2]);
      const d = this._decodeHtmlEntities(o), h = this.doc.getTextWidth(d);
      this._drawText(d, i - h / 2, e);
    } else {
      let o = t.toString();
      o = this._decodeHtmlEntities(o), this.doc.setFontSize(n), this._setFont(null, s), this.doc.setTextColor(r[0], r[1], r[2]);
      const a = this.doc.getTextWidth(o);
      this._drawText(o, i - a / 2, e);
    }
  }
  // Thêm leader dots (dấu chấm dẫn)
  addLeaderDots(t, i, e = {}) {
    t = this._decodeHtmlEntities(t), i = this._decodeHtmlEntities(i);
    const n = {
      fontSize: 11,
      fontStyle: "normal",
      color: [0, 0, 0],
      dotChar: ".",
      dotSpacing: 3,
      // Khoảng cách giữa các dấu chấm
      minDots: 3,
      // Số chấm tối thiểu
      leftPadding: 5,
      // Khoảng cách sau text trái
      rightPadding: 5,
      // Khoảng cách trước text phải
      lineHeight: 6,
      ...e
    };
    this.doc.setFontSize(n.fontSize), this._setFont(null, n.fontStyle);
    const s = Array.isArray(n.color) ? n.color : [0, 0, 0];
    this.doc.setTextColor(...s);
    const r = this.doc.getTextWidth(t), o = this.doc.getTextWidth(i), a = this.doc.getTextWidth(n.dotChar), l = this.margins.left, c = this.pageWidth - this.margins.right - o, d = l + r + n.leftPadding, h = c - n.rightPadding, u = h - d, g = Math.max(
      n.minDots,
      Math.floor(u / (a + n.dotSpacing))
    );
    this.checkPageBreak(n.lineHeight + 3), this._drawText(t, l, this.currentY);
    let f = d;
    for (let p = 0; p < g; p++)
      f + a <= h && (this._drawText(n.dotChar, f, this.currentY), f += a + n.dotSpacing);
    return this._drawText(i, c, this.currentY), this.currentY += n.lineHeight, this;
  }
  // Thêm table of contents với leader dots
  addTableOfContents(t, i = {}) {
    const e = {
      title: "MỤC LỤC",
      titleOptions: {
        fontSize: 16,
        fontStyle: "bold",
        align: "center"
      },
      itemOptions: {
        fontSize: 11,
        fontStyle: "normal",
        indent: 0
      },
      subItemOptions: {
        fontSize: 10,
        fontStyle: "normal",
        indent: 15
      },
      ...i
    };
    return e.title && (this.addText(e.title, null, null, e.titleOptions), this.addSpace(10)), t.forEach((n) => {
      let s = typeof n == "string" ? n : n.title;
      s = this._decodeHtmlEntities(s);
      const r = typeof n == "object" ? n.page : "", a = typeof n == "object" && n.isSubItem ? e.subItemOptions : e.itemOptions, l = a.indent || 0, c = " ".repeat(l / 3) + s;
      this.addLeaderDots(c, r.toString(), {
        ...a,
        leftPadding: 5,
        rightPadding: 5
      });
    }), this;
  }
  // Thêm price list với leader dots
  addPriceList(t, i = {}) {
    const e = {
      title: "BẢNG GIÁ",
      titleOptions: {
        fontSize: 16,
        fontStyle: "bold",
        align: "center"
      },
      itemOptions: {
        fontSize: 11,
        fontStyle: "normal"
      },
      currency: "VNĐ",
      ...i
    };
    return e.title && (this.addText(e.title, null, null, e.titleOptions), this.addSpace(10)), t.forEach((n) => {
      const s = n.name || n.title, r = n.price || n.cost || 0, o = this._decodeHtmlEntities(s), a = this.formatPrice(r, e.currency), l = this._decodeHtmlEntities(a);
      this.addLeaderDots(o, l, {
        ...e.itemOptions,
        leftPadding: 8,
        rightPadding: 8
      });
    }), this;
  }
  // Thêm menu với leader dots
  addMenu(t, i = {}) {
    const e = {
      title: "THỰC ĐƠN",
      titleOptions: {
        fontSize: 18,
        fontStyle: "bold",
        align: "center",
        color: [139, 0, 0]
      },
      sectionOptions: {
        fontSize: 14,
        fontStyle: "bold",
        color: [0, 0, 139]
      },
      itemOptions: {
        fontSize: 11,
        fontStyle: "normal"
      },
      currency: "VNĐ",
      ...i
    };
    return e.title && (this.addText(e.title, null, null, e.titleOptions), this.addSpace(15)), t.forEach((n) => {
      this.addText(n.name, null, null, e.sectionOptions), this.addSpace(8), n.items.forEach((s) => {
        const r = `${s.name}${s.description ? ` - ${s.description}` : ""}`, o = this.formatPrice(s.price, e.currency), a = this._decodeHtmlEntities(r), l = this._decodeHtmlEntities(o);
        this.addLeaderDots(a, l, {
          ...e.itemOptions,
          leftPadding: 10,
          rightPadding: 10,
          dotChar: ".",
          dotSpacing: 2
        });
      }), this.addSpace(12);
    }), this;
  }
  // Thêm index với leader dots
  addIndex(t, i = {}) {
    const e = {
      title: "CHỈ MỤC",
      titleOptions: {
        fontSize: 16,
        fontStyle: "bold",
        align: "center"
      },
      itemOptions: {
        fontSize: 10,
        fontStyle: "normal"
      },
      columns: 2,
      // Số cột
      ...i
    };
    if (e.title && (this.addText(e.title, null, null, e.titleOptions), this.addSpace(10)), e.columns === 1)
      t.forEach((n) => {
        const s = this._decodeHtmlEntities(n.term), r = this._decodeHtmlEntities(n.pages.join(", "));
        this.addLeaderDots(s, r, {
          ...e.itemOptions,
          leftPadding: 5,
          rightPadding: 5,
          lineHeight: 5
        });
      });
    else {
      const n = Math.ceil(t.length / e.columns), s = (this.pageWidth - this.margins.left - this.margins.right) / e.columns;
      for (let r = 0; r < e.columns; r++) {
        const o = r * n, a = Math.min(o + n, t.length), l = t.slice(o, a), c = this.currentY, d = this.margins.left + r * s;
        r > 0 && (this.currentY = c), l.forEach((h) => {
          const u = this._decodeHtmlEntities(h.term), g = this._decodeHtmlEntities(h.pages.join(", ")), f = this.doc.getTextWidth(u), p = this.doc.getTextWidth(g);
          this.doc.setFontSize(e.itemOptions.fontSize);
          const b = this.doc.getTextWidth("."), m = s - f - p - 15, S = Math.max(3, Math.floor(m / (b + 2)));
          this._drawText(u, d, this.currentY);
          let y = d + f + 5;
          for (let W = 0; W < S; W++)
            this._drawText(".", y, this.currentY), y += b + 2;
          const T = d + s - p - 5;
          this._drawText(g, T, this.currentY), this.currentY += 5;
        });
      }
    }
    return this;
  }
  // Format giá tiền
  formatPrice(t, i = "VNĐ") {
    return typeof t == "number" ? t.toLocaleString("vi-VN") + " " + i : t.toString() + " " + i;
  }
  // Thêm Fill-in line (đường kẻ để điền thông tin)
  addFillInLine(t = "", i = {}) {
    t = this._decodeHtmlEntities(t);
    const e = {
      lineCount: 1,
      // Số dòng kẻ
      lineLength: 100,
      // Độ dài mỗi dòng
      lineSpacing: 8,
      // Khoảng cách giữa các dòng
      lineStyle: "dots",
      // 'solid', 'dashed', 'dotted', 'dots'
      lineWidth: 0.5,
      // Độ dày đường kẻ
      lineColor: [0, 0, 0],
      // Màu đường kẻ
      dotSpacing: 1,
      // Khoảng cách giữa các dấu chấm (cho style 'dots')
      dotChar: ".",
      // Ký tự dùng cho dots
      labelPosition: "left",
      // 'left', 'right', 'above', 'below', 'none'
      labelOptions: {
        fontSize: 11,
        fontStyle: "normal",
        color: [0, 0, 0],
        spacing: 5
        // Khoảng cách từ label đến line
      },
      align: "left",
      // 'left', 'center', 'right'
      showPlaceholder: !1,
      // Hiển thị placeholder text
      placeholderText: "(điền thông tin)",
      placeholderOptions: {
        fontSize: 9,
        fontStyle: "italic",
        color: [150, 150, 150]
      }
    }, n = {
      ...e,
      ...i,
      labelOptions: {
        ...e.labelOptions,
        ...i.labelOptions || {}
      },
      placeholderOptions: {
        ...e.placeholderOptions,
        ...i.placeholderOptions || {}
      }
    };
    let s;
    if (this.currentY, n.align === "center" ? s = (this.pageWidth - n.lineLength) / 2 : n.align === "right" ? s = this.pageWidth - this.margins.right - n.lineLength : s = this.margins.left, t && n.labelPosition !== "none") {
      this.doc.setFontSize(n.labelOptions.fontSize), this._setFont(null, n.labelOptions.fontStyle);
      const a = Array.isArray(n.labelOptions.color) ? n.labelOptions.color : [0, 0, 0];
      this.doc.setTextColor(...a);
      const l = this.doc.getTextWidth(t);
      if (n.labelPosition === "above") {
        const c = n.align === "center" ? (this.pageWidth - l) / 2 : n.align === "right" ? this.pageWidth - this.margins.right - l : this.margins.left;
        this._drawText(t, c, this.currentY), this.currentY += n.labelOptions.spacing;
      } else n.labelPosition === "left" && (this._drawText(t, this.margins.left, this.currentY), s = this.margins.left + l + n.labelOptions.spacing, n.lineLength = Math.min(
        n.lineLength,
        this.pageWidth - this.margins.right - s
      ));
    }
    const r = (n.lineCount - 1) * n.lineSpacing + 10;
    this.checkPageBreak(r), this.doc.setLineWidth(n.lineWidth);
    const o = Array.isArray(n.lineColor) ? n.lineColor : [0, 0, 0];
    this.doc.setDrawColor(...o);
    for (let a = 0; a < n.lineCount; a++) {
      const l = this.currentY + a * n.lineSpacing;
      if (n.lineStyle === "dots") {
        this.doc.setFontSize(n.labelOptions.fontSize);
        try {
          this._setFont(null, "normal");
        } catch {
          this.doc.setFont("helvetica", "normal");
        }
        const c = Array.isArray(n.lineColor) ? n.lineColor : [0, 0, 0];
        this.doc.setTextColor(...c);
        const d = this.doc.getTextWidth(n.dotChar), h = Math.floor(n.lineLength / (d + n.dotSpacing));
        for (let u = 0; u < h; u++) {
          const g = s + u * (d + n.dotSpacing);
          g + d <= s + n.lineLength && this._drawText(n.dotChar, g, l);
        }
      } else
        n.lineStyle === "dashed" ? this.doc.setLineDashPattern([3, 2], 0) : n.lineStyle === "dotted" ? this.doc.setLineDashPattern([1, 2], 0) : this.doc.setLineDashPattern([], 0), this.doc.line(s, l, s + n.lineLength, l);
      if (n.showPlaceholder && n.placeholderText) {
        this.doc.setFontSize(n.placeholderOptions.fontSize), this._setFont(null, n.placeholderOptions.fontStyle);
        const c = Array.isArray(n.placeholderOptions.color) ? n.placeholderOptions.color : [150, 150, 150];
        this.doc.setTextColor(...c);
        const d = l - 2;
        this._drawText(n.placeholderText, s + 5, d);
      }
    }
    if (this.doc.setLineDashPattern([], 0), t && n.labelPosition === "right") {
      this.doc.setFontSize(n.labelOptions.fontSize), this._setFont(null, n.labelOptions.fontStyle);
      const a = Array.isArray(n.labelOptions.color) ? n.labelOptions.color : [0, 0, 0];
      this.doc.setTextColor(...a);
      const l = s + n.lineLength + n.labelOptions.spacing;
      this._drawText(t, l, this.currentY);
    }
    if (t && n.labelPosition === "below") {
      const a = this.currentY + (n.lineCount - 1) * n.lineSpacing;
      this.currentY = a + n.labelOptions.spacing;
      const l = this.doc.getTextWidth(t), c = n.align === "center" ? (this.pageWidth - l) / 2 : n.align === "right" ? this.pageWidth - this.margins.right - l : this.margins.left;
      this._drawText(t, c, this.currentY);
    }
    return this.currentY += (n.lineCount - 1) * n.lineSpacing + 10, this;
  }
  // Tạo form fill-in nhanh
  addFillInForm(t, i = {}) {
    const e = {
      title: null,
      titleOptions: {
        fontSize: 14,
        fontStyle: "bold",
        color: [0, 0, 0]
      },
      fieldSpacing: 12,
      columns: 1,
      // Số cột
      ...i
    };
    if (e.title && (this.addText(e.title, null, null, e.titleOptions), this.addSpace(8)), e.columns === 1)
      t.forEach((n) => {
        const s = {
          lineLength: 150,
          labelPosition: "left",
          ...n.options
        };
        this.addFillInLine(n.label || "", s), this.addSpace(e.fieldSpacing - 10);
      });
    else {
      const n = Math.ceil(t.length / e.columns), s = (this.pageWidth - this.margins.left - this.margins.right) / e.columns;
      for (let r = 0; r < t.length; r += n) {
        const o = t.slice(r, r + n), a = Math.floor(r / n), l = this.currentY;
        o.forEach((c, d) => {
          a > 0 && (this.currentY = l + d * e.fieldSpacing);
          const h = {
            lineLength: s - 20,
            labelPosition: "above",
            align: "left",
            ...c.options
          }, u = this.margins.left + a * s, g = this.margins.left;
          this.margins.left = u, this.addFillInLine(c.label || "", h), this.margins.left = g, a === 0 && this.addSpace(e.fieldSpacing - 10);
        });
      }
    }
    return this;
  }
  // Tạo signature line với fill-in
  addSignatureFillIn(t = [], i = {}) {
    const e = {
      layout: "horizontal",
      // 'horizontal', 'vertical'
      signatureWidth: 120,
      dateWidth: 80,
      spacing: 20,
      showDate: !0,
      dateLabel: "Ngày:",
      signatureLabel: "Chữ ký:",
      nameLabel: "Họ tên:",
      ...i
    };
    if (e.layout === "horizontal") {
      const n = t.length * (e.signatureWidth + e.spacing) - e.spacing;
      let s = (this.pageWidth - n) / 2;
      t.forEach((r, o) => {
        const a = s + o * (e.signatureWidth + e.spacing), l = this.margins.left;
        this.margins.left = a, e.showDate && this.addFillInLine(e.dateLabel, {
          lineLength: e.dateWidth,
          labelPosition: "left",
          align: "left"
        }), r.title && this.addText(
          r.title,
          a + (e.signatureWidth - this.doc.getTextWidth(r.title)) / 2,
          null,
          {
            fontSize: 10,
            fontStyle: "bold"
          }
        ), this.addFillInLine(e.signatureLabel, {
          lineLength: e.signatureWidth,
          labelPosition: "above",
          align: "left"
        }), this.addFillInLine(e.nameLabel, {
          lineLength: e.signatureWidth,
          labelPosition: "left",
          align: "left"
        }), this.margins.left = l;
      });
    } else
      t.forEach((n) => {
        n.title && this.addText(n.title, null, null, {
          fontSize: 12,
          fontStyle: "bold",
          align: "center"
        }), e.showDate && this.addFillInLine(e.dateLabel, {
          lineLength: e.dateWidth,
          labelPosition: "left",
          align: "center"
        }), this.addFillInLine(e.signatureLabel, {
          lineLength: e.signatureWidth,
          labelPosition: "above",
          align: "center"
        }), this.addFillInLine(e.nameLabel, {
          lineLength: e.signatureWidth,
          labelPosition: "left",
          align: "center"
        }), this.addSpace(e.spacing);
      });
    return this;
  }
  // Thêm dotted fill-in line (dấu chấm thay vì đường kẻ)
  addDottedFillIn(t = "", i = {}) {
    const e = {
      lineStyle: "dots",
      dotChar: ".",
      dotSpacing: 2,
      lineLength: 100,
      labelPosition: "left",
      ...i
    };
    return this.addFillInLine(t, e);
  }
  // Thêm form với dotted lines
  addDottedForm(t, i = {}) {
    const e = {
      fieldDefaults: {
        lineStyle: "dots",
        dotChar: ".",
        dotSpacing: 2
      },
      ...i
    }, n = t.map((s) => ({
      ...s,
      options: {
        ...e.fieldDefaults,
        ...s.options
      }
    }));
    return this.addFillInForm(n, e);
  }
  // Thêm signature với dotted lines
  addDottedSignature(t = [], i = {}) {
    const e = {
      lineStyle: "dots",
      dotChar: ".",
      dotSpacing: 2,
      ...i
    }, n = this.addFillInLine.bind(this);
    this.addFillInLine = (r, o = {}) => n(r, {
      lineStyle: "dots",
      dotChar: ".",
      dotSpacing: 2,
      ...o
    });
    const s = this.addSignatureFillIn(t, e);
    return this.addFillInLine = n, s;
  }
  // Thêm custom dotted pattern
  addCustomDottedLine(t = "", i = ".", e = 2, n = 100, s = {}) {
    return this.addFillInLine(t, {
      lineStyle: "dots",
      dotChar: i,
      dotSpacing: e,
      lineLength: n,
      ...s
    });
  }
  // Thêm text với định dạng hỗn hợp (bold, italic trong cùng dòng)
  addMixedText(t, i = {}) {
    const n = { ...{
      fontSize: 12,
      color: [0, 0, 0],
      maxWidth: this.pageWidth - this.margins.left - this.margins.right,
      align: "left",
      lineHeight: this.lineHeight
    }, ...i };
    n.lineHeight = parseFloat(n.lineHeight) || 5, n.fontSize = parseFloat(n.fontSize) || 12, n.maxWidth = parseFloat(n.maxWidth) || this.pageWidth - this.margins.left - this.margins.right;
    let s = n.x || this.margins.left, r = this.currentY, o = [], a = 0;
    return this.checkPageBreak(n.lineHeight + 10), r = this.currentY, t.forEach((l, c) => {
      let d = typeof l == "string" ? l : l.text;
      d = this._decodeHtmlEntities(d);
      let h = "normal";
      if (typeof l == "object" && l.style) {
        if (typeof l.style == "string")
          h = l.style;
        else if (typeof l.style == "object") {
          const p = l.style;
          p.bold && p.italic ? h = "bolditalic" : p.bold ? h = "bold" : p.italic ? h = "italic" : h = "normal";
        }
      }
      const u = typeof l == "object" && l.color ? l.color : typeof l == "object" && l.style && l.style.color ? l.style.color : n.color;
      let g = typeof l == "object" && l.fontSize ? l.fontSize : typeof l == "object" && l.style && l.style.fontSize ? l.style.fontSize : n.fontSize;
      if (g = parseFloat(g) || n.fontSize || 12, this.doc.setFontSize(g), this._setFont(null, h), !d) return;
      const f = String(d).split(" ");
      f.forEach((p, b) => {
        const m = b < f.length - 1 ? p + " " : p, S = this.doc.getTextWidth(m);
        if (a + S > n.maxWidth && o.length > 0) {
          this.renderMixedLine(o, s, r, n, !1), r += n.lineHeight;
          const W = this.currentY;
          this.checkPageBreak(n.lineHeight + 5), this.currentY < W && (r = this.currentY), s = n.x || this.margins.left, o = [], a = 0;
        }
        const y = typeof l == "object" && l.style && typeof l.style == "object" ? l.style.underline : !1, T = typeof l == "object" && l.style && typeof l.style == "object" ? l.style.strikethrough : !1;
        o.push({
          text: m,
          style: h,
          color: this._parseColorToArray(u),
          fontSize: g,
          width: S,
          underline: y,
          strikethrough: T
        }), a += S;
      });
    }), o.length > 0 && (this.renderMixedLine(o, s, r, n, !0), r += n.lineHeight), n.spacing !== void 0 && n.spacing, this.currentY = r, this;
  }
  // Helper function để render một dòng mixed text
  renderMixedLine(t, i, e, n, s = !1) {
    if (!t || t.length === 0) return;
    let r = i;
    if (n.align === "center") {
      const o = t.reduce((a, l) => a + l.width, 0);
      r = (this.pageWidth - o) / 2;
    } else if (n.align === "right") {
      const o = t.reduce((a, l) => a + l.width, 0);
      r = this.pageWidth - this.margins.right - o;
    } else if (n.align === "justify" && !s && t.length > 1) {
      this.renderJustifiedMixedLine(t, i, e, n);
      return;
    }
    t.forEach((o) => {
      if (this.doc.setFontSize(o.fontSize), this._setFont(null, o.style), this.doc.setTextColor(o.color[0], o.color[1], o.color[2]), this._drawText(o.text, r, e), o.underline) {
        const a = this.doc.getTextWidth(o.text.trimEnd()), l = e + 1;
        this.doc.setDrawColor(o.color[0], o.color[1], o.color[2]), this.doc.setLineWidth(0.3), this.doc.line(r, l, r + a, l);
      }
      if (o.strikethrough) {
        const a = this.doc.getTextWidth(o.text.trimEnd()), l = e - o.fontSize * 0.12;
        this.doc.setDrawColor(o.color[0], o.color[1], o.color[2]), this.doc.setLineWidth(0.3), this.doc.line(r, l, r + a, l);
      }
      r += o.width;
    });
  }
  // Hàm vẽ mixed text canh đều
  renderJustifiedMixedLine(t, i, e, n) {
    if (t.length <= 1) {
      this.renderMixedLine(t, i, e, { ...n, align: "left" });
      return;
    }
    let s = 0;
    t.forEach((c) => {
      this.doc.setFontSize(c.fontSize), this._setFont(null, c.style), s += this.doc.getTextWidth(c.text.trimEnd());
    });
    const r = t.length - 1, a = (n.maxWidth - s) / r;
    let l = i;
    t.forEach((c, d) => {
      this.doc.setFontSize(c.fontSize), this._setFont(null, c.style), this.doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      const h = c.text.trimEnd(), u = this.doc.getTextWidth(h);
      if (this._drawText(h, l, e), c.underline) {
        const g = e + 1;
        this.doc.setDrawColor(c.color[0], c.color[1], c.color[2]), this.doc.setLineWidth(0.3), this.doc.line(l, g, l + u, g);
      }
      if (c.strikethrough) {
        const g = e - c.fontSize * 0.12;
        this.doc.setDrawColor(c.color[0], c.color[1], c.color[2]), this.doc.setLineWidth(0.3), this.doc.line(l, g, l + u, g);
      }
      l += u, d < t.length - 1 && (l += a);
    });
  }
  // Thêm paragraph với định dạng hỗn hợp
  addMixedParagraph(t, i = {}) {
    const e = {
      fontSize: 10,
      color: [0, 0, 0],
      lineHeight: 5,
      align: "left",
      maxWidth: this.pageWidth - this.margins.left - this.margins.right,
      spacing: 1,
      // Giảm khoảng cách sau paragraph từ 3 xuống 1
      ...i
    };
    return !Array.isArray(t) || t.length === 0 ? (console.warn("addMixedParagraph: textParts phải là array không rỗng"), this) : (this.addMixedText(t, e), this.currentY += e.spacing, this);
  }
  // Helper functions cho mixed text
  createTextPart(t, i = "normal", e = null, n = null) {
    const s = { text: t, style: i };
    return e && (s.color = Array.isArray(e) ? e : [0, 0, 0]), n && (s.fontSize = n), s;
  }
  // Tạo bold text part
  bold(t, i = null, e = null) {
    return this.createTextPart(t, "bold", i, e);
  }
  // Tạo italic text part
  italic(t, i = null, e = null) {
    return this.createTextPart(t, "italic", i, e);
  }
  // Tạo bold italic text part
  boldItalic(t, i = null, e = null) {
    return this.createTextPart(t, "bolditalic", i, e);
  }
  // Tạo normal text part
  normal(t, i = null, e = null) {
    return this.createTextPart(t, "normal", i, e);
  }
  // Tạo colored text part
  colored(t, i, e = "normal", n = null) {
    return this.createTextPart(t, e, i, n);
  }
  // Thêm paragraph với helper functions
  addStyledParagraph(t, i = {}) {
    return Array.isArray(t) || (t = [t]), this.addMixedParagraph(t, i);
  }
  // Thêm text có đánh số tự động với thụt lề
  addNumberedText(t, i = {}) {
    t = this._decodeHtmlEntities(t);
    const e = {
      fontSize: 11,
      fontStyle: "normal",
      color: [0, 0, 0],
      numberStyle: "decimal",
      // 'decimal', 'roman', 'alpha', 'bullet'
      numberFormat: "{number}.",
      // Format của số: '{number}.', '{number})', '({number})', etc.
      startNumber: 1,
      // Số bắt đầu
      indent: 20,
      // Khoảng cách thụt lề cho text
      numberWidth: 15,
      // Độ rộng vùng số
      lineHeight: null,
      // Sẽ tính toán động
      maxWidth: null,
      // Tự tính toán nếu null
      align: "left",
      showIndex: !0,
      // Hiển thị số hay không
      lineSpacing: 1.3,
      // Hệ số cho khoảng cách dòng
      ...i
    };
    e.lineHeight === null && (e.lineHeight = Math.max(
      this.lineHeight,
      Math.ceil(e.fontSize * e.lineSpacing)
    )), e.maxWidth || (e.maxWidth = this.pageWidth - this.margins.left - this.margins.right - e.indent), this.currentNumberByStyle || (this.currentNumberByStyle = {}), this.currentNumberByStyle[e.numberStyle] || (this.currentNumberByStyle[e.numberStyle] = e.startNumber);
    const n = this.currentNumberByStyle[e.numberStyle];
    let s = "";
    switch (e.numberStyle) {
      case "decimal":
        s = n.toString();
        break;
      case "roman":
        s = this.toRomanNumeral(n);
        break;
      case "alpha":
        s = this.toAlphaNumeral(n);
        break;
      case "bullet":
        s = "•";
        break;
      default:
        s = n.toString();
    }
    const r = e.numberFormat.replace("{number}", s);
    this.doc.setFontSize(e.fontSize), this._setFont(null, e.fontStyle);
    const o = Array.isArray(e.color) ? e.color : [0, 0, 0];
    this.doc.setTextColor(...o);
    const a = this.doc.splitTextToSize(t, e.maxWidth);
    if (e.skipPageBreakCheck !== !0) {
      const h = a.length * (3 + e.lineHeight);
      this.checkPageBreak(h + 10);
    }
    let l = this.margins.left, c = this.margins.left + e.indent, d = this.currentY;
    return a.forEach((h, u) => {
      if (a.length > 5 && e.skipPageBreakCheck !== !0 && (this.checkPageBreak(3 + e.lineHeight + 5), d = this.currentY), u === 0 && e.showIndex) {
        if (e.align === "center") {
          const g = this.doc.getTextWidth(r + " " + h), f = (this.pageWidth - g) / 2;
          l = f, c = f + this.doc.getTextWidth(r) + 5;
        } else if (e.align === "right") {
          const g = this.doc.getTextWidth(r + " " + h), f = this.pageWidth - this.margins.right - g;
          l = f, c = f + this.doc.getTextWidth(r) + 5;
        } else
          l = this.margins.left, c = this.margins.left + e.indent;
        this._drawText(r, l, d);
      }
      if (e.align === "center")
        if (u === 0 && e.showIndex)
          this._drawText(h, c, d);
        else {
          const g = this.doc.getTextWidth(h), f = (this.pageWidth - g) / 2;
          this._drawText(h, f, d);
        }
      else if (e.align === "right")
        if (u === 0 && e.showIndex)
          this._drawText(h, c, d);
        else {
          const g = this.doc.getTextWidth(h), f = this.pageWidth - this.margins.right - g;
          this._drawText(h, f, d);
        }
      else if (e.align === "justify") {
        const g = u === a.length - 1;
        u === 0 ? (c = this.margins.left + e.indent, !g && h.trim().length > 0 ? this.drawJustifiedText(
          h,
          c,
          d,
          e.maxWidth,
          e
        ) : this._drawText(h, c, d)) : (c = this.margins.left + e.indent, !g && h.trim().length > 0 ? this.drawJustifiedText(
          h,
          c,
          d,
          e.maxWidth,
          e
        ) : this._drawText(h, c, d));
      } else
        u === 0 ? c = this.margins.left + e.indent : c = this.margins.left + e.indent, this._drawText(h, c, d);
      d += 3 + e.lineHeight;
    }), this.currentY = d, this.currentNumberByStyle[e.numberStyle]++, this;
  }
  // Reset số đếm
  resetNumbering(t = "decimal", i = 1) {
    return this.currentNumberByStyle || (this.currentNumberByStyle = {}), this.currentNumberByStyle[t] = i, this;
  }
  // Thêm danh sách có đánh số
  addNumberedList(t, i = {}) {
    const e = {
      title: null,
      titleOptions: {
        fontSize: 14,
        fontStyle: "bold",
        color: [0, 0, 0],
        align: "left"
        // Alignment cho title
      },
      itemOptions: {
        fontSize: 11,
        fontStyle: "normal",
        color: [0, 0, 0],
        numberStyle: "decimal",
        indent: 20,
        align: "left"
        // Alignment cho items
      },
      spacing: 0.5,
      // Khoảng cách giữa các item
      resetNumbers: !0,
      // Reset số đếm khi bắt đầu list mới
      ...i
    };
    return e.title && (this.addText(e.title, null, null, e.titleOptions), this.addSpace(5)), e.resetNumbers && this.resetNumbering(e.itemOptions.numberStyle, 1), t.forEach((n, s) => {
      const r = typeof n == "string" ? n : n.text, o = typeof n == "object" ? { ...e.itemOptions, ...n.options } : e.itemOptions;
      this.doc.setFontSize(o.fontSize || 11);
      const a = o.maxWidth || this.pageWidth - this.margins.left - this.margins.right - (o.indent || 20), c = this.doc.splitTextToSize(r, a).length * ((o.lineHeight || this.lineHeight) + 3) + (e.spacing || 0.5) + 10;
      this.checkPageBreak(c);
      const d = { ...o, skipPageBreakCheck: !0 };
      this.addNumberedText(r, d), s < t.length - 1 && this.addSpace(e.spacing);
    }), this;
  }
  // Thêm danh sách có nhiều cấp độ (nested list)
  addMultiLevelList(t, i = {}) {
    const e = {
      level1: {
        numberStyle: "decimal",
        numberFormat: "{number}.",
        indent: 20,
        fontSize: 11
      },
      level2: {
        numberStyle: "alpha",
        numberFormat: "{number})",
        indent: 35,
        fontSize: 10
      },
      level3: {
        numberStyle: "roman",
        numberFormat: "({number})",
        indent: 50,
        fontSize: 10
      },
      level4: {
        numberStyle: "bullet",
        numberFormat: "{number}",
        indent: 65,
        fontSize: 9
      },
      spacing: 2,
      ...i
    };
    this.resetNumbering("decimal", 1), this.resetNumbering("alpha", 1), this.resetNumbering("roman", 1);
    const n = (s, r = 1) => {
      const o = `level${Math.min(r, 4)}`, a = e[o];
      s.forEach((l, c) => {
        if (typeof l == "string")
          this.addNumberedText(l, a);
        else if (l.text) {
          const d = { ...a, ...l.options };
          this.addNumberedText(l.text, d), l.subItems && Array.isArray(l.subItems) && (this.addSpace(e.spacing), n(l.subItems, r + 1));
        }
        c < s.length - 1 && this.addSpace(e.spacing);
      });
    };
    return n(t), this;
  }
  // Convert số thành Roman numeral
  toRomanNumeral(t) {
    const i = [
      ["M", 1e3],
      ["CM", 900],
      ["D", 500],
      ["CD", 400],
      ["C", 100],
      ["XC", 90],
      ["L", 50],
      ["XL", 40],
      ["X", 10],
      ["IX", 9],
      ["V", 5],
      ["IV", 4],
      ["I", 1]
    ];
    let e = "";
    for (let [n, s] of i) {
      const r = Math.floor(t / s);
      e += n.repeat(r), t -= s * r;
    }
    return e.toLowerCase();
  }
  // Convert số thành chữ cái
  toAlphaNumeral(t) {
    let i = "";
    for (; t > 0; )
      t--, i = String.fromCharCode(97 + t % 26) + i, t = Math.floor(t / 26);
    return i;
  }
  // Thêm outline/table of contents với auto-numbering
  addOutline(t, i = {}) {
    const e = {
      title: "OUTLINE",
      titleOptions: {
        fontSize: 16,
        fontStyle: "bold",
        align: "center"
      },
      h1Options: {
        numberStyle: "decimal",
        numberFormat: "{number}.",
        fontSize: 12,
        fontStyle: "bold",
        indent: 15
      },
      h2Options: {
        numberStyle: "decimal",
        numberFormat: "{number}.{parent}.",
        fontSize: 11,
        fontStyle: "normal",
        indent: 25
      },
      h3Options: {
        numberStyle: "decimal",
        numberFormat: "{number}.{parent}.{grandparent}.",
        fontSize: 10,
        fontStyle: "normal",
        indent: 35
      },
      showPageNumbers: !0,
      ...i
    };
    e.title && (this.addText(e.title, null, null, e.titleOptions), this.addSpace(10)), this.resetNumbering("h1", 1), this.resetNumbering("h2", 1), this.resetNumbering("h3", 1);
    const n = (s, r = 1, o = []) => {
      s.forEach((a) => {
        const l = typeof a == "string" ? a : a.title, c = typeof a == "object" ? a.page : "", d = typeof a == "object" ? a.subItems : null;
        let h = `h${Math.min(r, 3)}`, u = e[`${h}Options`], g = this.currentNumberByStyle[h] || 1, f = g.toString();
        u.numberFormat.includes("{parent}") && o.length > 0 && (f = f + "." + o[o.length - 1]), u.numberFormat.includes("{grandparent}") && o.length > 1 && (f = f + "." + o[o.length - 2]);
        const p = u.numberFormat.replace("{number}", g).replace("{parent}", o[o.length - 1] || "").replace("{grandparent}", o[o.length - 2] || "");
        if (e.showPageNumbers && c ? this.addLeaderDots(p + " " + l, c.toString(), {
          fontSize: u.fontSize,
          fontStyle: u.fontStyle,
          leftPadding: u.indent
        }) : this.addText(p + " " + l, this.margins.left + u.indent, null, {
          fontSize: u.fontSize,
          fontStyle: u.fontStyle
        }), this.currentNumberByStyle || (this.currentNumberByStyle = {}), this.currentNumberByStyle[h] = g + 1, d && Array.isArray(d)) {
          const b = [...o, g];
          this.resetNumbering(`h${r + 1}`, 1), n(d, r + 1, b);
        }
      });
    };
    return n(t), this;
  }
  // Lấy thông tin trang
  getPageInfo() {
    return {
      currentPage: this.doc.internal.getCurrentPageInfo().pageNumber,
      totalPages: this.doc.internal.getNumberOfPages(),
      pageSize: this.doc.internal.pageSize,
      currentY: this.currentY
    };
  }
  /**
   * Căn đều dấu ":" trong danh sách các dòng mô tả (kiểu biểu mẫu hành chính)
   * @param {string[]} lines - danh sách các dòng (mỗi dòng chứa 1 dấu ":")
   * @param {number} [padSize=1] - số khoảng trắng thêm sau dấu ":" (mặc định 1)
   * @returns {string[]} danh sách dòng đã căn đều
   */
  alignColons(t, i = 1) {
    const e = t.map((r) => {
      const [o, a] = r.split(":");
      return { left: o ?? "", right: a ?? "" };
    }), n = Math.max(...e.map((r) => r.left.trimEnd().length)), s = " ".repeat(i);
    return e.map((r) => {
      const o = " ".repeat(n - r.left.trimEnd().length);
      return `${r.left.trimEnd()}${o} :${s}${r.right.trimStart()}`;
    });
  }
}
class E {
  /**
   * Create PDFRenderer instance
   * @param {Object} fontConfig - Font configuration (optional)
   * @param {string} fontConfig.defaultFont - Primary font name
   * @param {string} fontConfig.fallback - Fallback font name
   */
  constructor(t = {}) {
    this.fontConfig = { ...P, ...t }, this.pdfService = null, this.margins = {
      left: 15,
      right: 15,
      top: 20,
      bottom: 20
    }, this.pageWidth = 210, this.contentWidth = this.pageWidth - this.margins.left - this.margins.right;
  }
  /**
   * Content-flow: Calculate x position from layout hints
   */
  calculateX(t) {
    const i = t.indent || 0, e = t.marginLeft || 0;
    return this.margins.left + i + e;
  }
  /**
   * Render JSON blueprint to PDF using JsPdfService
   * @param {Object} blueprint - JSON blueprint from CKEditorParser
   * @param {Object} data - Variable data for replacement
   * @returns {JsPdfService} PDF service instance
   */
  render(t, i = {}) {
    return this.pdfService = new A(this.fontConfig), t.margins && (this.margins = { ...this.margins, ...t.margins }, this.contentWidth = this.pageWidth - this.margins.left - this.margins.right), t.pages.forEach((e, n) => {
      n > 0 && this.pdfService.addNewPage(), this.pdfService.resetPosition(this.margins.top), this.renderPage(e, i);
    }), this;
  }
  /**
   * Helper to clean content (strip HTML tags + decode entities)
   */
  cleanContent(t) {
    if (!t) return "";
    let i = String(t);
    return i = i.replace(/<br\s*\/?>/gi, `
`), i = i.replace(/<\/p>\s*<p[^>]*>/gi, `
`), i = i.replace(/<[^>]*>/g, ""), this.pdfService._decodeHtmlEntities(i);
  }
  /**
   * Render a single page
   */
  renderPage(t, i) {
    t.elements.forEach((e) => {
      switch (e.content && (e.content = this.pdfService._decodeHtmlEntities(e.content)), e.type) {
        case "text":
          this.renderText(e, i);
          break;
        case "richtext":
          this.renderRichText(e, i);
          break;
        case "heading":
          this.renderHeading(e, i);
          break;
        case "table":
          this.renderTable(e, i);
          break;
        case "image":
          this.renderImage(e, i);
          break;
        case "line":
          this.renderLine(e);
          break;
        case "space":
          this.pdfService.addSpace(e.height || 10);
          break;
        case "evalblock":
          this.renderEvalBlock(e, i);
          break;
        case "codeblock":
          this.renderCodeBlock(e, i);
          break;
      }
    });
  }
  /**
   * Render rich text element with mixed inline styles (content-flow)
   * Handles layout markers: ___BR___, ___HR___, ___PAGEBREAK___, ___TAB___
   */
  renderRichText(t, i) {
    const e = t.segments || [], n = t.style || {}, s = e.map((h) => ({
      text: this.replaceVariables(h.text, i),
      style: h.style
    })), r = this.calculateX(t), o = n.lineHeight || 5, a = {
      fontSize: n.fontSize || 12,
      color: this.parseColor(n.color),
      align: n.align || "left",
      lineHeight: o,
      x: r,
      maxWidth: t.width || this.contentWidth
    };
    if (!s.some(
      (h) => h.text && (h.text.includes("___BR___") || h.text.includes("___HR___") || h.text.includes("___PAGEBREAK___"))
    )) {
      const h = s.map((u) => ({
        ...u,
        text: u.text ? u.text.replace(/___TAB___/g, "    ") : u.text
      }));
      this.pdfService.addMixedParagraph(h, a);
      return;
    }
    let c = s.map((h) => h.text || "").join("");
    c = c.replace(/___TAB___/g, "    ");
    const d = c.split(/(___BR___|___HR___|___PAGEBREAK___)/);
    for (const h of d)
      if (h === "___BR___")
        this.pdfService.addSpace(this.pdfService.lineHeight);
      else if (h === "___HR___")
        this.pdfService.addHorizontalLine();
      else if (h === "___PAGEBREAK___")
        this.pdfService.addNewPage();
      else if (h.trim()) {
        const u = [{ text: h.trim(), style: {} }];
        this.pdfService.addMixedParagraph(u, a);
      }
  }
  /**
   * Render text element using JsPdfService (content-flow)
   * Handles layout markers: ___BR___, ___HR___, ___PAGEBREAK___, ___TAB___
   */
  renderText(t, i) {
    let e = this.replaceVariables(t.content, i);
    const n = t.style || {}, s = n.lineHeight || 5, r = {
      fontSize: n.fontSize || 12,
      fontStyle: this.mapFontStyle(n),
      color: this.parseColor(n.color),
      align: n.align || "left",
      lineHeight: s
    }, o = this.calculateX(t);
    if (e = e.replace(/___TAB___/g, "    "), !e.includes("___BR___") && !e.includes("___HR___") && !e.includes("___PAGEBREAK___")) {
      this.pdfService.addText(e, o, null, r);
      return;
    }
    const a = e.split(/(___BR___|___HR___|___PAGEBREAK___)/);
    for (const l of a)
      l === "___BR___" ? this.pdfService.addSpace(s) : l === "___HR___" ? this.pdfService.addHorizontalLine() : l === "___PAGEBREAK___" ? this.pdfService.addNewPage() : l.trim() && this.pdfService.addText(l.trim(), o, null, r);
  }
  /**
   * Render heading element (content-flow)
   */
  renderHeading(t, i) {
    var s, r, o;
    const e = this.replaceVariables(t.content, i);
    switch (t.level || 1) {
      case 1:
        this.pdfService.addTitle(e, { align: ((s = t.style) == null ? void 0 : s.align) || "center" });
        break;
      case 2:
        this.pdfService.addSubTitle(e, { align: ((r = t.style) == null ? void 0 : r.align) || "left" });
        break;
      default:
        this.pdfService.addText(e, null, null, {
          fontSize: 14,
          fontStyle: "bold",
          align: ((o = t.style) == null ? void 0 : o.align) || "left"
        });
    }
  }
  /**
   * Render table element with styles
   */
  renderTable(t, i) {
    var h, u, g;
    const e = t.rows || [];
    if (e.length === 0) return;
    if (t.dataVar) {
      const f = t.dataVar.replace(/\{\{|\}\}/g, ""), p = i[f];
      if (Array.isArray(p)) {
        this.renderDataTable(t, p);
        return;
      }
    }
    t.y !== void 0 && this.pdfService.resetPosition(t.y);
    const n = [], s = t.style || {}, r = (f, p, b) => {
      if (!f) return { content: "" };
      const m = f.cellStyle || {}, S = {
        halign: f.align || "left",
        valign: m.verticalAlign === "top" ? "top" : m.verticalAlign === "bottom" ? "bottom" : "middle"
      };
      if (m.backgroundColor && (S.fillColor = this.parseColorToArray(m.backgroundColor)), m.borderColor && (S.lineColor = this.parseColorToArray(m.borderColor)), m.borderWidth && (S.lineWidth = m.borderWidth), m.padding && (S.cellPadding = m.padding), f.type === "image")
        return n.push({
          rowIndex: p,
          cellIndex: b,
          src: f.src,
          width: f.width,
          height: f.height
        }), {
          content: "[IMG]",
          colSpan: f.colSpan || 1,
          rowSpan: f.rowSpan || 1,
          styles: S
        };
      const y = typeof f == "object" ? this.replaceVariables(f.content, i) : f;
      return {
        content: this.cleanContent(y),
        colSpan: f.colSpan || 1,
        rowSpan: f.rowSpan || 1,
        styles: S
      };
    }, o = ((h = e[0]) == null ? void 0 : h.map((f, p) => r(f, 0, p))) || [], a = (u = e[0]) == null ? void 0 : u[0], l = (g = a == null ? void 0 : a.cellStyle) == null ? void 0 : g.backgroundColor, c = e.slice(1).map(
      (f, p) => f.map((b, m) => r(b, p + 1, m))
    ), d = {
      tableWidth: t.width
    };
    s.borderWidth !== void 0 && (d.lineWidth = s.borderWidth), s.borderColor && (d.lineColor = this.parseColorToArray(s.borderColor)), s.backgroundColor && (d.fillColor = this.parseColorToArray(s.backgroundColor)), s.align === "center" ? d.tableAlign = "center" : s.align === "right" && (d.tableAlign = "right"), l && (d.headStyles = {
      fillColor: this.parseColorToArray(l)
    }), typeof this.pdfService.addTable == "function" ? this.pdfService.addTable(o, c, d) : this.drawTableManually(t, i);
  }
  /**
   * Parse color string to RGB array for jspdf-autotable
   */
  parseColorToArray(t) {
    if (!t) return [0, 0, 0];
    if (t.startsWith("#")) {
      const e = t.slice(1), n = parseInt(e.substr(0, 2), 16), s = parseInt(e.substr(2, 2), 16), r = parseInt(e.substr(4, 2), 16);
      return [n, s, r];
    }
    const i = t.match(/rgb\((\d+),\s*(\d+),\s*(\d+)\)/);
    return i ? [parseInt(i[1]), parseInt(i[2]), parseInt(i[3])] : [0, 0, 0];
  }
  /**
   * Render dynamic data table
   */
  renderDataTable(t, i) {
    const e = t.columns || [];
    if (e.length === 0 || !Array.isArray(i)) return;
    const n = e.map((r) => r.label || r), s = i.map(
      (r) => e.map((o) => {
        const a = o.key || o;
        return String(r[a] || "");
      })
    );
    typeof this.pdfService.addTable == "function" && this.pdfService.addTable(n, s, t.style || {});
  }
  /**
   * Manual table drawing when addTable is not available
   */
  drawTableManually(t, i) {
    var d;
    const e = t.rows || [], n = t.x || this.pdfService.margins.left, s = t.width || this.pdfService.pageWidth - n - this.pdfService.margins.right, r = t.rowHeight || 8, o = ((d = e[0]) == null ? void 0 : d.length) || 1, a = s / o, l = this.pdfService.doc;
    let c = this.pdfService.getCurrentY();
    l.setLineWidth(0.5), l.setFontSize(10), e.forEach((h, u) => {
      h.forEach((g, f) => {
        const p = n + f * a, b = typeof g == "object" ? this.replaceVariables(g.content, i) : this.replaceVariables(String(g), i), m = typeof g == "object" ? g.isHeader : u === 0;
        m && (l.setFillColor(240, 240, 240), l.rect(p, c, a, r, "F")), l.setDrawColor(0, 0, 0), l.rect(p, c, a, r);
        try {
          l.setFont(this.fontConfig.defaultFont, m ? "bold" : "normal");
        } catch {
          l.setFont(this.fontConfig.fallback || "helvetica", m ? "bold" : "normal");
        }
        l.setTextColor(0, 0, 0);
        const S = b.replace(/<[^>]*>/g, ""), y = c + r / 2 + 2;
        l.text(S, p + 2, y, { maxWidth: a - 4 });
      }), c += r;
    }), this.pdfService.resetPosition(c + 5);
  }
  /**
   * Render image element (content-flow)
   */
  renderImage(t, i) {
    let e = this.replaceVariables(t.src, i);
    if (e && (e.startsWith("data:") || e.startsWith("http"))) {
      const n = t.x !== void 0 ? t.x : this.margins.left;
      this.pdfService.addImage(
        e,
        n,
        null,
        // Let service handle y (content-flow)
        t.width || 50,
        t.height || 50,
        t.style || {}
      );
    }
  }
  /**
   * Render line element (content-flow)
   */
  renderLine(t) {
    if (t.fullWidth) {
      const i = this.pdfService.getCurrentY();
      this.pdfService.addLine(
        this.margins.left,
        i,
        this.pageWidth - this.margins.right,
        i,
        t.style || {}
      ), this.pdfService.addSpace(5);
    } else
      this.pdfService.addLine(
        t.x1,
        t.y1,
        t.x2,
        t.y2,
        t.style || {}
      );
  }
  /**
   * Replace {{variables}} with data values
   * Now supports: nested objects, #each loops, #if conditionals
   */
  replaceVariables(t, i) {
    return w.process(t, i);
  }
  /**
   * Process layout markers in text and render appropriately
   * Handles: ___BR___, ___TAB___, ___HR___, ___PAGEBREAK___
   * @param {string} text - Text with markers
   * @param {Object} options - Rendering options
   * @returns {string} Text with markers replaced (TAB only)
   */
  processLayoutMarkers(t, i = {}) {
    if (!t || typeof t != "string") return t || "";
    let e = t.replace(/___TAB___/g, "    ");
    const n = e.includes("___BR___"), s = e.includes("___HR___"), r = e.includes("___PAGEBREAK___");
    if (!n && !s && !r)
      return e;
    const o = e.split(/(___BR___|___HR___|___PAGEBREAK___)/);
    for (let a = 0; a < o.length; a++) {
      const l = o[a];
      l === "___BR___" ? this.pdfService.addSpace(i.lineHeight || 5) : l === "___HR___" ? this.pdfService.addHorizontalLine() : l === "___PAGEBREAK___" ? this.pdfService.addNewPage() : l.trim();
    }
    return e.replace(/___BR___|___HR___|___PAGEBREAK___/g, "");
  }
  /**
   * Check if text contains layout markers that need special rendering
   */
  hasLayoutMarkers(t) {
    return t ? t.includes("___BR___") || t.includes("___HR___") || t.includes("___PAGEBREAK___") : !1;
  }
  /**
   * Render text with layout markers support
   * Splits text by markers and renders each segment appropriately
   */
  renderTextWithMarkers(t, i = {}) {
    if (!t) return;
    const n = t.replace(/___TAB___/g, "    ").split(/(___BR___|___HR___|___PAGEBREAK___)/), s = i.x || this.margins.left, r = i.fontSize || 12, o = i.lineHeight || r * 0.5;
    for (const a of n)
      a === "___BR___" ? this.pdfService.addSpace(o) : a === "___HR___" ? this.pdfService.addHorizontalLine ? this.pdfService.addHorizontalLine() : this.pdfService.addSpace(5) : a === "___PAGEBREAK___" ? this.pdfService.addNewPage() : a.trim() && this.pdfService.addText(a.trim(), s, null, {
        fontSize: r,
        maxWidth: i.maxWidth || this.contentWidth,
        align: i.align || "left",
        color: i.color
      });
  }
  /**
   * Map style to font style string
   */
  mapFontStyle(t) {
    return t.fontWeight === "bold" && t.fontStyle === "italic" ? "bolditalic" : t.fontWeight === "bold" ? "bold" : t.fontStyle === "italic" ? "italic" : "normal";
  }
  /**
   * Parse color to RGB array
   */
  parseColor(t) {
    if (!t) return [0, 0, 0];
    if (Array.isArray(t)) return t;
    if (typeof t == "string" && t.startsWith("#")) {
      const i = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(t);
      if (i)
        return [
          parseInt(i[1], 16),
          parseInt(i[2], 16),
          parseInt(i[3], 16)
        ];
    }
    if (typeof t == "string" && t.startsWith("rgb")) {
      const i = t.match(/(\d+),\s*(\d+),\s*(\d+)/);
      if (i)
        return [parseInt(i[1]), parseInt(i[2]), parseInt(i[3])];
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
  download(t = "document.pdf") {
    this.pdfService.savePDF(t);
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
  renderEvalBlock(t, i) {
    let e = t.code || "";
    e = e.replace(/^\/\/\s*eval\s*/i, ""), e = e.replace(/^\/\*\s*eval\s*\*\/\s*/i, ""), console.log("[PDFRenderer] Evaluating code block with full PDF access...");
    try {
      const n = {
        // Direct PDF service access
        pdf: this.pdfService,
        // Data context
        data: i,
        // Renderer reference
        renderer: this,
        // Helper functions
        formatNumber: (o) => w.formatNumber(o),
        formatCurrency: (o) => w.formatCurrency(o),
        formatDate: (o) => w.formatDate(o),
        today: () => w.formatDateObject(/* @__PURE__ */ new Date()),
        now: () => (/* @__PURE__ */ new Date()).toLocaleString("vi-VN"),
        year: () => (/* @__PURE__ */ new Date()).getFullYear(),
        sum: (o, a) => Array.isArray(o) ? o.reduce((l, c) => l + (Number(c[a]) || 0), 0) : 0,
        count: (o) => Array.isArray(o) ? o.length : 0,
        filter: (o, a) => Array.isArray(o) ? o.filter(a) : [],
        map: (o, a) => Array.isArray(o) ? o.map(a) : [],
        join: (o, a = ", ") => Array.isArray(o) ? o.join(a) : "",
        // Convenience shortcuts
        addText: (o, a, l, c) => this.pdfService.addText(o, a, l, c),
        addTitle: (o, a) => this.pdfService.addTitle(o, a),
        addTable: (o, a, l) => this.pdfService.addTable(o, a, l),
        addSpace: (o) => this.pdfService.addSpace(o),
        addLine: () => this.pdfService.addHorizontalLine(),
        addImage: (o, a, l, c, d) => this.pdfService.addImage(o, a, l, c, d),
        newPage: () => this.pdfService.addNewPage()
      }, r = new Function(...Object.keys(n), `
        "use strict";
        ${e}
      `)(...Object.values(n));
      console.log("[PDFRenderer] Eval completed, result:", r), typeof r == "string" && r.trim() && this.pdfService.addText(r, this.margins.left, null, {
        fontSize: 12,
        maxWidth: this.contentWidth
      });
    } catch (n) {
      console.error("[PDFRenderer] Eval error:", n), this.pdfService.addText(`[Eval Error: ${n.message}]`, this.margins.left, null, {
        fontSize: 10,
        color: [255, 0, 0]
      });
    }
  }
  /**
   * Render code block - display code as formatted text (not evaluated)
   */
  renderCodeBlock(t, i) {
    const e = t.code || "", n = t.language || "text";
    console.log("[PDFRenderer] Rendering code block:", n, e.length, "chars"), this.pdfService.addText(e, this.margins.left, null, {
      fontSize: 10,
      fontStyle: "normal",
      maxWidth: this.contentWidth
    });
  }
}
class H {
  constructor() {
    this.editor = null, this.parser = new k(), this.renderer = null, this.blueprint = null, this._initialized = !1, this.fontConfig = { ...P };
  }
  /**
   * Initialize CKEditor into a container element
   * @param {string|HTMLElement} elementOrSelector - DOM element or CSS selector
   * @param {Object} options - CKEditor configuration options
   * @returns {Promise<DrawPDF>} This instance (chainable)
   */
  async init(t, i = {}) {
    var l, c, d, h, u;
    const e = typeof t == "string" ? document.querySelector(t) : t;
    if (!e)
      throw new Error(`DrawPDF: Element not found: ${t}`);
    const n = ((l = window.CKEDITOR) == null ? void 0 : l.DecoupledEditor) || ((c = window.CKEDITOR) == null ? void 0 : c.ClassicEditor) || window.DecoupledEditor || window.ClassicEditor;
    if (!n)
      throw new Error("DrawPDF: CKEditor not loaded. Please include CKEditor script before using DrawPDF.");
    const s = {
      toolbar: {
        items: [
          // History
          "undo",
          "redo",
          "|",
          // Find
          "findAndReplace",
          "|",
          // Formatting
          "heading",
          "|",
          "bold",
          "italic",
          "underline",
          "strikethrough",
          "subscript",
          "superscript",
          "code",
          "removeFormat",
          "|",
          // Font
          "fontFamily",
          "fontSize",
          "fontColor",
          "fontBackgroundColor",
          "highlight",
          "|",
          // Alignment & Lists
          "alignment",
          "|",
          "bulletedList",
          "numberedList",
          "todoList",
          "|",
          "outdent",
          "indent",
          "|",
          // Insert
          "link",
          "uploadImage",
          "insertTable",
          "blockQuote",
          "codeBlock",
          "|",
          "horizontalLine",
          "pageBreak",
          "specialCharacters"
        ],
        shouldNotGroupWhenFull: !0
      },
      heading: {
        options: [
          { model: "paragraph", title: "Paragraph", class: "ck-heading_paragraph" },
          { model: "heading1", view: "h1", title: "Heading 1" },
          { model: "heading2", view: "h2", title: "Heading 2" },
          { model: "heading3", view: "h3", title: "Heading 3" },
          { model: "heading4", view: "h4", title: "Heading 4" },
          { model: "heading5", view: "h5", title: "Heading 5" },
          { model: "heading6", view: "h6", title: "Heading 6" }
        ]
      },
      fontSize: {
        options: [12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 42, 48, 72],
        supportAllValues: !0
      },
      fontFamily: {
        options: [
          "default",
          "Roboto, sans-serif",
          "Times New Roman, Times, serif",
          "Arial, Helvetica, sans-serif",
          "Georgia, serif",
          "Verdana, Geneva, sans-serif",
          "Courier New, Courier, monospace",
          "Tahoma, Geneva, sans-serif",
          "Trebuchet MS, sans-serif"
        ],
        supportAllValues: !0
      },
      fontColor: {
        colors: [
          { color: "#000000", label: "Black" },
          { color: "#4d4d4d", label: "Dark Gray" },
          { color: "#999999", label: "Gray" },
          { color: "#e6e6e6", label: "Light Gray" },
          { color: "#ffffff", label: "White" },
          { color: "#e64c4c", label: "Red" },
          { color: "#e6994c", label: "Orange" },
          { color: "#e6e64c", label: "Yellow" },
          { color: "#4ce64c", label: "Green" },
          { color: "#4c4ce6", label: "Blue" },
          { color: "#994ce6", label: "Purple" }
        ]
      },
      table: {
        contentToolbar: [
          "tableColumn",
          "tableRow",
          "mergeTableCells",
          "tableProperties",
          "tableCellProperties"
        ]
      },
      image: {
        toolbar: [
          "imageTextAlternative",
          "toggleImageCaption",
          "imageStyle:inline",
          "imageStyle:block",
          "imageStyle:side",
          "linkImage"
        ]
      },
      link: {
        addTargetToExternalLinks: !0,
        defaultProtocol: "https://"
      },
      placeholder: `Soạn thảo văn bản ở đây...

Sử dụng {{tênBiến}} để chèn biến.`,
      language: "vi",
      // Remove plugins that might cause issues
      removePlugins: [
        // Premium plugins (require license)
        "CKBox",
        "CKFinder",
        "EasyImage",
        "RealTimeCollaborativeComments",
        "RealTimeCollaborativeTrackChanges",
        "RealTimeCollaborativeRevisionHistory",
        "PresenceList",
        "Comments",
        "TrackChanges",
        "TrackChangesData",
        "RevisionHistory",
        "Pagination",
        "WProofreader",
        "MathType",
        "SlashCommand",
        "Template",
        "DocumentOutline",
        "FormatPainter",
        "TableOfContents",
        "PasteFromOfficeEnhanced",
        "CaseChange",
        // AI features (require license)
        "AIAssistant",
        "AI",
        // Multi-level list (require license)
        "MultiLevelList",
        // Restricted editing (causes read-only mode)
        "RestrictedEditingMode",
        "StandardEditingMode"
      ]
    }, { fonts: r, ...o } = i, a = { ...s, ...o };
    r && (this.fontConfig = { ...P, ...r }), this.fontConfig.register && this.fontConfig.register.length > 0 && await this._loadFontFiles(this.fontConfig.register), this.renderer = new E(this.fontConfig);
    try {
      if (this.editor = await n.create(e, a), (u = (h = (d = this.editor.ui) == null ? void 0 : d.view) == null ? void 0 : h.toolbar) != null && u.element)
        if (i.toolbarContainer) {
          const g = typeof i.toolbarContainer == "string" ? document.querySelector(i.toolbarContainer) : i.toolbarContainer;
          g && g.appendChild(this.editor.ui.view.toolbar.element);
        } else
          e instanceof HTMLElement && e.parentNode && e.parentNode.insertBefore(this.editor.ui.view.toolbar.element, e);
      this._initialized = !0, console.log("✅ DrawPDF initialized with font:", this.fontConfig.defaultFont);
    } catch (g) {
      throw console.error("DrawPDF init failed:", g), g;
    }
    return this;
  }
  /**
   * Load custom font files (JS modules)
   * @param {string[]} fontUrls - Array of font file URLs
   * @private
   */
  async _loadFontFiles(t) {
    for (const i of t)
      try {
        await this._loadFontScript(i), console.log(`✅ Font loaded: ${i}`);
      } catch (e) {
        console.warn(`⚠️ Failed to load font: ${i}`, e.message);
      }
  }
  /**
   * Load a single font script file
   * @param {string} url - URL to font JS file
   * @private
   */
  _loadFontScript(t) {
    return new Promise((i, e) => {
      const n = document.createElement("script");
      n.src = t, n.onload = i, n.onerror = () => e(new Error(`Failed to load font script: ${t}`)), document.head.appendChild(n);
    });
  }
  /**
   * Register a custom font dynamically
   * @param {string} fontUrl - URL to the font JS file (pre-converted from TTF)
   * @returns {Promise<DrawPDF>} This instance (chainable)
   */
  async registerFont(t) {
    return await this._loadFontScript(t), console.log(`✅ Font registered: ${t}`), this;
  }
  /**
   * Get JSON Blueprint from current editor content
   * Parses HTML → JSON Blueprint and stores internally
   * @returns {Object} JSON Blueprint
   */
  getData() {
    if (!this._initialized)
      throw new Error("DrawPDF: Not initialized. Call init() first.");
    const t = this.editor.getData();
    return this.blueprint = this.parser.parse(t), this.blueprint.sourceHtml = t, this.blueprint.createdAt = (/* @__PURE__ */ new Date()).toISOString(), this.blueprint;
  }
  /**
   * Set JSON Blueprint for later rendering
   * @param {Object} blueprint - JSON Blueprint object
   * @returns {DrawPDF} This instance (chainable)
   */
  setData(t) {
    if (!t || typeof t != "object")
      throw new Error("DrawPDF: setData expects a JSON Blueprint object.");
    return this.blueprint = t, this._initialized && t.sourceHtml && this.editor.setData(t.sourceHtml), this;
  }
  /**
   * Render PDF from stored blueprint
   * @param {Object} data - Variable data for template replacement
   * @returns {string} PDF as data URL (base64)
   */
  render(t = {}) {
    if (!this.blueprint && this._initialized && this.getData(), !this.blueprint)
      throw new Error("DrawPDF: No blueprint. Call getData() or setData() first.");
    return this.renderer.render(this.blueprint, t), this.renderer.getDataUrl();
  }
  /**
   * Download PDF from stored blueprint
   * @param {string} filename - Output filename
   * @param {Object} data - Variable data for template replacement
   * @returns {DrawPDF} This instance (chainable)
   */
  download(t = "document.pdf", i = {}) {
    if (!this.blueprint && this._initialized && this.getData(), !this.blueprint)
      throw new Error("DrawPDF: No blueprint. Call getData() or setData() first.");
    return this.renderer.render(this.blueprint, i), this.renderer.download(t), this;
  }
  /**
   * Get PDF as Blob (for custom handling)
   * @param {Object} data - Variable data for template replacement
   * @returns {Blob} PDF blob
   */
  getBlob(t = {}) {
    if (!this.blueprint && this._initialized && this.getData(), !this.blueprint)
      throw new Error("DrawPDF: No blueprint.");
    return this.renderer.render(this.blueprint, t), this.renderer.getBlob();
  }
  /**
   * Preview PDF in new browser tab
   * @param {Object} data - Variable data for template replacement
   */
  preview(t = {}) {
    if (!this.blueprint && this._initialized && this.getData(), !this.blueprint)
      throw new Error("DrawPDF: No blueprint.");
    this.renderer.render(this.blueprint, t), this.renderer.preview();
  }
  /**
   * Get current blueprint without re-parsing
   * @returns {Object|null} Stored blueprint or null
   */
  getBlueprint() {
    return this.blueprint;
  }
  /**
   * Export blueprint as JSON string
   * @returns {string} JSON string
   */
  exportJson() {
    if (!this.blueprint)
      throw new Error("DrawPDF: No blueprint to export.");
    return JSON.stringify(this.blueprint, null, 2);
  }
  /**
   * Import blueprint from JSON string
   * @param {string} jsonString - JSON string
   * @returns {DrawPDF} This instance (chainable)
   */
  importJson(t) {
    const i = JSON.parse(t);
    return this.setData(i);
  }
  /**
   * Destroy editor instance and cleanup
   */
  destroy() {
    this.editor && (this.editor.destroy(), this.editor = null, this._initialized = !1), this.blueprint = null;
  }
  /**
   * Static factory method - create and initialize in one call
   * @param {string|HTMLElement} element - DOM element or selector
   * @param {Object} options - CKEditor options
   * @returns {Promise<DrawPDF>} Initialized DrawPDF instance
   */
  static async create(t, i = {}) {
    const e = new H();
    return await e.init(t, i), e;
  }
  /**
   * Static method - parse HTML to blueprint without editor
   * @param {string} html - HTML content
   * @returns {Object} JSON Blueprint
   */
  static parseHtml(t) {
    const e = new k().parse(t);
    return e.sourceHtml = t, e.createdAt = (/* @__PURE__ */ new Date()).toISOString(), e;
  }
  /**
   * Static method - render PDF from blueprint (headless)
   * @param {Object} blueprint - JSON Blueprint
   * @param {Object} data - Variable data
   * @returns {string} PDF as data URL
   */
  static renderBlueprint(t, i = {}) {
    const e = new E();
    return e.render(t, i), e.getDataUrl();
  }
  /**
   * Static method - download PDF from blueprint (headless)
   * @param {Object} blueprint - JSON Blueprint
   * @param {string} filename - Output filename
   * @param {Object} data - Variable data
   */
  static downloadBlueprint(t, i = "document.pdf", e = {}) {
    const n = new E();
    n.render(t, e), n.download(i);
  }
}
const B = "2.1.0";
export {
  k as CKEditorParser,
  H as DrawPDF,
  x as FONTS,
  P as FONT_CONFIG,
  A as JsPdfService,
  _ as PAGE,
  E as PDFRenderer,
  v as RichTextTokenizer,
  w as TemplateEngine,
  B as VERSION,
  H as default
};
