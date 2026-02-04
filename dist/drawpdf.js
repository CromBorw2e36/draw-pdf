var Y = Object.defineProperty;
var B = (x, t, i) => t in x ? Y(x, t, { enumerable: !0, configurable: !0, writable: !0, value: i }) : x[t] = i;
var I = (x, t, i) => B(x, typeof t != "symbol" ? t + "" : t, i);
import "jspdf";
import { applyPlugin as M } from "jspdf-autotable";
class R {
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
    for (const [r, o] of Object.entries(i))
      e = e.split(r).join(o);
    return e = e.replace(/&#(\d+);/g, (r, o) => String.fromCharCode(o)), e = e.replace(/&#x([0-9a-fA-F]+);/g, (r, o) => String.fromCharCode(parseInt(o, 16))), e = e.replace(/\u00A0/g, " "), e;
  }
  /**
   * Walk the DOM tree and extract text with styles
   */
  walkTree(t, i, e) {
    const r = t.childNodes;
    for (let o = 0; o < r.length; o++) {
      const s = r[o];
      if (s.nodeType === Node.TEXT_NODE) {
        let n = s.textContent;
        n = this.decodeHtmlEntities(n), n && e.push({
          text: n,
          style: { ...i }
        });
      } else if (s.nodeType === Node.ELEMENT_NODE) {
        const n = this.applyNodeStyle(s, i);
        this.walkTree(s, n, e);
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
      const r = parseInt(i[1]), o = parseInt(i[2]), s = parseInt(i[3]);
      return [r, o, s];
    }
    const e = t.match(/rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)/i);
    if (e) {
      const r = parseInt(e[1]), o = parseInt(e[2]), s = parseInt(e[3]);
      return [r, o, s];
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
    const r = t.match(/^(\d+(?:\.\d+)?)$/);
    return r ? parseFloat(r[1]) : null;
  }
  /**
   * Merge adjacent segments with identical styles
   */
  mergeSegments(t) {
    if (t.length === 0) return t;
    const i = [];
    let e = { ...t[0] };
    for (let r = 1; r < t.length; r++) {
      const o = t[r];
      this.stylesEqual(e.style, o.style) ? e.text += o.text : (e.text && i.push(e), e = { ...o });
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
}, C = {
  DEFAULT_SIZE: 12,
  LINE_HEIGHT: 1.5,
  H1_SIZE: 18,
  H2_SIZE: 16,
  H3_SIZE: 14
};
class v {
  constructor() {
    this.currentY = _.MARGIN_TOP, this.currentPage = 0, this.pages = [{ pageNumber: 1, elements: [] }], this.tokenizer = new R();
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
    for (const [r, o] of Object.entries(i))
      e = e.split(r).join(o);
    return e = e.replace(/&#(\d+);/g, (r, o) => String.fromCharCode(o)), e = e.replace(/&#x([0-9a-fA-F]+);/g, (r, o) => String.fromCharCode(parseInt(o, 16))), e = e.replace(/\u00A0/g, " "), e;
  }
  /**
   * Parse CKEditor HTML to JSON blueprint
   * @param {string} html - CKEditor HTML output
   * @returns {Object} JSON blueprint
   */
  parse(t) {
    this.currentY = _.MARGIN_TOP, this.currentPage = 0, this.pages = [{ pageNumber: 1, elements: [] }];
    const r = new DOMParser().parseFromString(t, "text/html").body.children;
    for (let o = 0; o < r.length; o++)
      this.processNode(r[o]);
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
    var e, r;
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
        (r = t.textContent) != null && r.trim() && this.addTextElement(t.textContent.trim(), {});
    }
  }
  /**
   * Process paragraph element
   */
  processParagraph(t) {
    const i = t.innerHTML, e = this.extractStyles(t), r = t.style.textAlign || "left";
    this.addTextElement(i, { ...e, align: r });
  }
  /**
   * Process heading element
   */
  processHeading(t, i) {
    const e = t.innerHTML, r = { 1: C.H1_SIZE, 2: C.H2_SIZE, 3: C.H3_SIZE };
    this.addTextElement(e, {
      fontSize: r[i],
      fontWeight: "bold",
      align: t.style.textAlign || "left"
    });
  }
  /**
   * Process list
   */
  processList(t, i) {
    t.querySelectorAll("li").forEach((r, o) => {
      const n = (i === "number" ? `${o + 1}. ` : "• ") + r.innerHTML;
      this.addTextElement(n, { indent: 10 });
    });
  }
  /**
   * Process table with properties
   */
  processTable(t) {
    const i = [], e = t.querySelectorAll("tr"), r = {
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
    e.forEach((o) => {
      const s = [];
      o.querySelectorAll("td, th").forEach((a) => {
        const l = a.querySelector("img"), c = parseInt(a.getAttribute("colspan")) || 1, d = parseInt(a.getAttribute("rowspan")) || 1;
        let h = a.style.textAlign || "left";
        const g = a.querySelector('p[style*="text-align"]');
        g && g.style.textAlign && (h = g.style.textAlign);
        const u = {
          backgroundColor: this.parseColor(a.style.backgroundColor),
          borderColor: this.parseColor(a.style.borderColor),
          borderWidth: this.parseBorderWidth(a.style.border || a.style.borderWidth),
          verticalAlign: a.style.verticalAlign || "middle",
          padding: this.parsePadding(a.style.padding),
          width: this.parseWidth(a.style.width || a.getAttribute("width")),
          height: this.parseWidth(a.style.height || a.getAttribute("height"))
        };
        l ? s.push({
          type: "image",
          src: l.src || l.getAttribute("src"),
          width: parseInt(l.width) || 50,
          height: parseInt(l.height) || 50,
          colSpan: c,
          rowSpan: d,
          align: h,
          isHeader: a.tagName.toLowerCase() === "th",
          cellStyle: u
        }) : s.push({
          content: a.innerHTML || " ",
          isHeader: a.tagName.toLowerCase() === "th",
          colSpan: c,
          rowSpan: d,
          align: h,
          cellStyle: u
        });
      }), i.push(s);
    }), this.addElement({
      type: "table",
      width: r.width || _.CONTENT_WIDTH,
      rows: i,
      style: r
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
      const e = parseInt(i[1]).toString(16).padStart(2, "0"), r = parseInt(i[2]).toString(16).padStart(2, "0"), o = parseInt(i[3]).toString(16).padStart(2, "0");
      return `#${e}${r}${o}`;
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
    const i = t.src || t.getAttribute("src"), e = parseInt(t.width) || 50, r = parseInt(t.height) || 50, o = Math.min(e * 0.264, _.CONTENT_WIDTH), s = r * 0.264;
    this.addElement({
      type: "image",
      // Content-flow: No x,y - renderer will calculate
      width: o,
      height: s,
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
    const r = e.match(/color:\s*([^;"]+)/);
    r && (i.color = r[1]);
    const o = e.match(/font-size:\s*(\d+)/);
    o && (i.fontSize = parseInt(o[1]));
    const s = (c = t.style.marginLeft) == null ? void 0 : c.match(/(\d+)/);
    s && (i.marginLeft = parseFloat(s[1]) * 0.264);
    const n = (d = t.style.textIndent) == null ? void 0 : d.match(/(\d+)/);
    n && (i.indent = parseFloat(n[1]) * 0.264);
    const a = (h = t.style.paddingLeft) == null ? void 0 : h.match(/(\d+)/);
    return a && (i.indent = (i.indent || 0) + parseFloat(a[1]) * 0.264), i;
  }
  /**
   * Add text element with rich text tokenization (content-flow approach)
   * No x,y coordinates - renderer will calculate based on layout hints
   */
  addTextElement(t, i) {
    const e = this.tokenizer.tokenize(t), r = e.map((l) => l.text).join("");
    if (!r.trim()) {
      this.addElement({
        type: "space",
        height: (i.fontSize || C.DEFAULT_SIZE) * C.LINE_HEIGHT * 0.352778
        // line height in mm
      });
      return;
    }
    const o = i.fontSize || C.DEFAULT_SIZE, s = o * C.LINE_HEIGHT * 0.352778, n = (i.indent || 0) + (i.marginLeft || 0), a = _.CONTENT_WIDTH - n;
    this.addElement({
      type: "richtext",
      // Content-flow: No x,y - use layout hints instead
      indent: i.indent || 0,
      marginLeft: i.marginLeft || 0,
      width: a,
      segments: e,
      content: r,
      // Fallback plain text
      style: {
        fontSize: o,
        fontWeight: i.fontWeight || "normal",
        fontStyle: i.fontStyle || "normal",
        color: i.color || "#000000",
        align: i.align || "left",
        underline: i.underline || !1,
        lineHeight: s
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
    const r = e.trim().startsWith("// eval") || e.trim().startsWith("/* eval */") || e.trim().startsWith("//eval"), s = (i.className || "").match(/language-(\w+)/), n = s ? s[1] : "javascript", a = {
      type: r ? "evalblock" : "codeblock",
      code: e.trim(),
      language: n,
      isEval: r
    };
    this.addElement(a), console.log("[CKEditorParser] Code block:", r ? "EVAL" : "DISPLAY", n);
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
    let r = t;
    for (const o of e) {
      if (r == null) return;
      r = r[o];
    }
    return r;
  }
  /**
   * Evaluate simple condition expression
   * Supports: ===, !==, >, <, >=, <=, truthy check
   * @param {string} expression - Condition expression
   * @param {Object} data - Data context
   * @returns {boolean}
   */
  static evaluateCondition(t, i) {
    const e = t.trim(), r = ["===", "!==", ">=", "<=", ">", "<"];
    for (const s of r)
      if (e.includes(s)) {
        const [n, a] = e.split(s).map((d) => d.trim()), l = this.resolveValue(n, i), c = this.resolveValue(a, i);
        switch (s) {
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
    return t.replace(e, (r, o, s) => {
      const n = this.evaluateCondition(o, i), a = s.indexOf("{{else}}");
      if (a !== -1) {
        const l = s.substring(0, a), c = s.substring(a + 8);
        return n ? l : c;
      }
      return n ? s : "";
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
    return t.replace(e, (r, o, s) => {
      const n = o.trim(), a = this.getNestedValue(i, n);
      if (console.log("[TemplateEngine] #each:", n, "array:", a), !Array.isArray(a) || a.length === 0)
        return console.log("[TemplateEngine] #each: array not found or empty"), "";
      const l = s.trim();
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
        let g = this.processIfBlocks(l, h);
        return g = this.processFormatHelpers(g, h), g = this.processDateHelpers(g), g = this.replaceVariables(g, h), g = this.processLayoutTags(g), g.trim();
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
    return e = e.replace(/\{\{formatNumber\s+([^}]+)\}\}/g, (r, o) => {
      const s = this.getNestedValue(i, o.trim());
      return s == null ? r : this.formatNumber(s);
    }), e = e.replace(/\{\{formatCurrency\s+([^}]+)\}\}/g, (r, o) => {
      const s = this.getNestedValue(i, o.trim());
      return s == null ? r : this.formatCurrency(s);
    }), e = e.replace(/\{\{formatDate\s+([^}]+)\}\}/g, (r, o) => {
      const s = this.getNestedValue(i, o.trim());
      return s == null ? r : this.formatDate(s);
    }), e = e.replace(/\{\{uppercase\s+([^}]+)\}\}/g, (r, o) => {
      const s = this.getNestedValue(i, o.trim());
      return s == null ? r : String(s).toUpperCase();
    }), e = e.replace(/\{\{lowercase\s+([^}]+)\}\}/g, (r, o) => {
      const s = this.getNestedValue(i, o.trim());
      return s == null ? r : String(s).toLowerCase();
    }), e = e.replace(/\{\{capitalize\s+([^}]+)\}\}/g, (r, o) => {
      const s = this.getNestedValue(i, o.trim());
      return s == null ? r : String(s).replace(/\b\w/g, (n) => n.toUpperCase());
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
    const i = String(t.getDate()).padStart(2, "0"), e = String(t.getMonth() + 1).padStart(2, "0"), r = t.getFullYear();
    return `${i}/${e}/${r}`;
  }
  /**
   * Replace {{variable}} placeholders with values
   * Supports nested paths: {{user.address.city}}
   * @param {string} text - Template text
   * @param {Object} data - Data context
   * @returns {string}
   */
  static replaceVariables(t, i) {
    return !t || typeof t != "string" ? t || "" : t.replace(/\{\{([^#\/][^}]*?)\}\}/g, (e, r) => {
      const o = r.trim();
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
      ].includes(o.toLowerCase()) || o.startsWith("formatNumber") || o.startsWith("formatCurrency") || o.startsWith("formatDate") || o.startsWith("uppercase") || o.startsWith("lowercase") || o.startsWith("capitalize"))
        return e;
      if (o.startsWith("@")) {
        const a = i[o];
        return a !== void 0 ? String(a) : e;
      }
      const n = this.getNestedValue(i, o);
      return n !== void 0 ? String(n) : e;
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
    ], r = /\{\{([^#\/][^}]*?)\}\}/g;
    let o;
    for (; (o = r.exec(t)) !== null; ) {
      const a = o[1].trim();
      if (!a.startsWith("@") && !e.includes(a.toLowerCase())) {
        if (a.startsWith("formatNumber ") || a.startsWith("formatCurrency ") || a.startsWith("formatDate ") || a.startsWith("uppercase ") || a.startsWith("lowercase ") || a.startsWith("capitalize ")) {
          const l = a.split(" ");
          l[1] && i.add(l[1].trim());
          continue;
        }
        i.add(a);
      }
    }
    const s = /\{\{#each\s+([^}]+)\}\}/g;
    for (; (o = s.exec(t)) !== null; )
      i.add(o[1].trim());
    const n = /\{\{#if\s+([^}]+)\}\}/g;
    for (; (o = n.exec(t)) !== null; )
      o[1].trim().split(/[=!<>]+/).map((c) => c.trim()).forEach((c) => {
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
}, { jsPDF: k } = window.jspdf;
M(k);
typeof window < "u" && !window.jspdf && (window.jspdf = { jsPDF: k });
class N {
  /**
   * Create JsPdfService instance
   * @param {Object} fontConfig - Font configuration
   * @param {string} fontConfig.defaultFont - Primary font name (default: 'Roboto')
   * @param {string} fontConfig.fallback - Fallback font name (default: 'helvetica')
   */
  constructor(t = {}) {
    const {
      defaultFont: i,
      fallback: e,
      register: r,
      // Font config keys
      format: o,
      orientation: s,
      unit: n,
      // Page config keys
      margins: a,
      // Margins
      ...l
    } = t;
    this.fontConfig = {
      ...P,
      ...i ? { defaultFont: i } : {},
      ...e ? { fallback: e } : {},
      ...r ? { register: r } : {}
    }, this.defaultFont = this.fontConfig.defaultFont, this.fallbackFont = this.fontConfig.fallback;
    const c = {
      orientation: s || "portrait",
      unit: n || "mm",
      format: o || "a4"
    };
    this.doc = new k(c), this.pageHeight = this.doc.internal.pageSize.height, this.pageWidth = this.doc.internal.pageSize.width, this.margins = { left: 15, right: 15, top: 20, bottom: 20 }, a && (this.margins = { ...this.margins, ...a }), this.currentY = this.margins.top, this.lineHeight = 1, this._setupDefaultFont();
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
    for (const [r, o] of Object.entries(e))
      i = i.split(r).join(o);
    return i = i.replace(/&#(\d+);/g, (r, o) => {
      const s = parseInt(o, 10);
      return s === 160 ? " " : String.fromCharCode(s);
    }), i = i.replace(/&#x([0-9a-fA-F]+);/g, (r, o) => {
      const s = parseInt(o, 16);
      return s === 160 ? " " : String.fromCharCode(s);
    }), i = i.replace(/\u00A0/g, " "), i;
  }
  // Wrapper method để vẽ text với auto-decode HTML entities
  _drawText(t, i, e, r = {}) {
    const o = this._decodeHtmlEntities(t);
    this.doc.text(o, i, e, r);
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
      const e = parseInt(i.substring(0, 2), 16) || 0, r = parseInt(i.substring(2, 4), 16) || 0, o = parseInt(i.substring(4, 6), 16) || 0;
      return [e, r, o];
    }
    if (typeof t == "string") {
      const i = t.match(/rgb[a]?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
      if (i)
        return [parseInt(i[1]), parseInt(i[2]), parseInt(i[3])];
    }
    return [0, 0, 0];
  }
  // Insert text to PDF với hỗ trợ tiếng Việt và xuống dòng
  addText(t, i = null, e = null, r = {}) {
    t = this._decodeHtmlEntities(t);
    const s = { ...{
      fontSize: 12,
      fontStyle: "normal",
      color: [0, 0, 0],
      maxWidth: this.pageWidth - this.margins.left - this.margins.right,
      align: "left",
      lineHeight: this.lineHeight
    }, ...r }, n = i !== null ? i : this.margins.left;
    e !== null || this.currentY, this.doc.setFontSize(s.fontSize), this._setFont(null, s.fontStyle), this.doc.setTextColor(s.color[0], s.color[1], s.color[2]);
    const a = this.doc.splitTextToSize(t, s.maxWidth), l = a.length * s.lineHeight;
    this.checkPageBreak(l + 5);
    let c = this.currentY;
    a.forEach((h, g) => {
      if (s.align === "center") {
        const u = this.doc.getTextWidth(h), f = (this.pageWidth - u) / 2;
        this._drawText(h, f, c);
      } else if (s.align === "right") {
        const u = this.doc.getTextWidth(h), f = this.pageWidth - this.margins.right - u;
        this._drawText(h, f, c);
      } else s.align === "justify" ? !(g === a.length - 1) && h.trim().length > 0 ? this.drawJustifiedText(h, n, c, s.maxWidth, s) : this._drawText(h, n, c) : this._drawText(h, n, c);
      c += s.lineHeight;
    });
    const d = r.spacing !== void 0 ? r.spacing : 1;
    return this.currentY = c + d, this;
  }
  // Hàm vẽ text canh đều (justify)
  drawJustifiedText(t, i, e, r, o) {
    const s = t.trim().split(" ");
    if (s.length <= 1) {
      this._drawText(t, i, e);
      return;
    }
    let n = 0;
    s.forEach((h) => {
      n += this.doc.getTextWidth(h);
    });
    const a = s.length - 1, c = (r - n) / a;
    let d = i;
    s.forEach((h, g) => {
      this._drawText(h, d, e), d += this.doc.getTextWidth(h), g < s.length - 1 && (d += c);
    });
  }
  // Thêm bảng với jspdf-autotable
  addTable(t, i, e = {}) {
    if (!this.doc.autoTable)
      return console.warn("jspdf-autotable is not loaded"), this;
    const r = e.y !== void 0 ? e.y : this.currentY, o = {
      font: this.defaultFont,
      fontSize: 10,
      cellPadding: 3,
      overflow: "linebreak"
    };
    e.lineWidth !== void 0 && (o.lineWidth = e.lineWidth), e.lineColor && (o.lineColor = e.lineColor), e.fillColor && (o.fillColor = e.fillColor);
    const s = {
      ...o,
      ...e.styles || {}
    }, n = {
      fillColor: !1,
      textColor: [0, 0, 0],
      halign: "center",
      ...e.headStyles || {}
    };
    let a = {
      top: this.margins.top,
      right: this.margins.right,
      bottom: this.margins.bottom,
      left: this.margins.left
    };
    e.margin && (a = { ...a, ...e.margin });
    let l = e.tableWidth || "auto";
    if (e.tableAlign === "center" && e.tableWidth) {
      const W = (this.pageWidth - this.margins.left - this.margins.right - e.tableWidth) / 2;
      a.left = this.margins.left + W;
    } else if (e.tableAlign === "right" && e.tableWidth) {
      const W = this.pageWidth - this.margins.left - this.margins.right - e.tableWidth;
      a.left = this.margins.left + W;
    }
    const {
      y: c,
      lineWidth: d,
      lineColor: h,
      fillColor: g,
      tableWidth: u,
      tableAlign: f,
      styles: p,
      headStyles: S,
      margin: m,
      ...b
    } = e, y = {
      startY: r,
      head: Array.isArray(t) && t.length > 0 && Array.isArray(t[0]) ? t : [t],
      body: i,
      theme: "grid",
      styles: s,
      headStyles: n,
      columnStyles: {},
      margin: a,
      tableWidth: typeof l == "number" ? l : "auto",
      didDrawPage: (T) => {
        this.currentY = T.cursor.y + 5;
      },
      ...b
    };
    return this.doc.autoTable(y), this.doc.lastAutoTable && (this.currentY = this.doc.lastAutoTable.finalY + 10), this;
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
    const r = t, o = {
      ...e,
      maxWidth: e.maxWidth - 10
    };
    return this.addText(r, this.margins.left + 8, this.currentY, o), this;
  }
  // Insert image to PDF với nhiều tính năng
  addImage(t, i = null, e = null, r = 100, o = 100, s = {}) {
    const n = {
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
      ...s
    };
    let a = i !== null ? i : this.margins.left;
    e !== null || this.currentY, n.align === "center" ? a = (this.pageWidth - r) / 2 : n.align === "right" && (a = this.pageWidth - this.margins.right - r), this.checkPageBreak(o + 15);
    try {
      let l = n.format;
      if (typeof t == "string" && t.startsWith("data:") && (t.includes("data:image/png") ? l = "PNG" : t.includes("data:image/jpeg") || t.includes("data:image/jpg") ? l = "JPEG" : t.includes("data:image/gif") ? l = "GIF" : t.includes("data:image/webp") && (l = "WEBP")), this.doc.addImage(
        t,
        l,
        a,
        this.currentY,
        r,
        o,
        "",
        // alias (để trống)
        n.compression,
        n.rotation
      ), n.border) {
        this.doc.setLineWidth(n.borderOptions.width);
        const c = Array.isArray(n.borderOptions.color) ? n.borderOptions.color : [0, 0, 0];
        this.doc.setDrawColor(...c), this.doc.rect(a, this.currentY, r, o);
      }
      this.currentY += o + 5, n.caption ? this.addText(n.caption, null, null, {
        ...n.captionOptions,
        align: n.align
      }) : this.currentY += 5;
    } catch (l) {
      console.error("Lỗi khi thêm ảnh:", l), this.addText(`[Lỗi hiển thị ảnh: ${l.message}]`, a, null, {
        fontSize: 10,
        color: [255, 0, 0],
        align: n.align
      });
    }
    return this;
  }
  // Thêm ảnh từ file path
  async addImageFromPath(t, i = null, e = null, r = 100, o = 100, s = {}) {
    try {
      const n = await this.loadImageFromPath(t);
      if (n)
        return this.addImage(n, i, e, r, o, s);
      throw new Error(`Không thể load ảnh từ ${t}`);
    } catch (n) {
      console.error("Lỗi khi thêm ảnh từ path:", n), this.addText(`[Không thể load ảnh: ${t}]`, i, e, {
        fontSize: 10,
        color: [255, 0, 0]
      });
    }
    return this;
  }
  // Thêm ảnh với auto-resize để fit trong khung
  addImageFit(t, i = null, e = null, r = 150, o = 150, s = {}) {
    return new Promise((n) => {
      const a = new Image();
      a.onload = () => {
        let { width: l, height: c } = this.calculateFitSize(
          a.naturalWidth,
          a.naturalHeight,
          r,
          o
        );
        this.addImage(t, i, e, l, c, s), n(this);
      }, a.onerror = () => {
        console.error("Không thể load ảnh để tính kích thước"), this.addImage(t, i, e, r, o, s), n(this);
      }, a.src = t;
    });
  }
  // Tính toán kích thước fit
  calculateFitSize(t, i, e, r) {
    const o = e / t, s = r / i, n = Math.min(o, s);
    return {
      width: t * n,
      height: i * n
    };
  }
  // Thêm đường kẻ ngang
  addLine(t = null, i = null, e = null, r = null, o = {}) {
    const s = t !== null ? t : this.margins.left, n = i !== null ? i : this.currentY, a = e !== null ? e : this.pageWidth - this.margins.right, l = r !== null ? r : n, c = {
      lineWidth: 0.5,
      color: [0, 0, 0],
      ...o
    };
    return this.doc.setLineWidth(c.lineWidth), this.doc.setDrawColor(c.color[0], c.color[1], c.color[2]), this.doc.line(s, n, a, l), this.currentY = n + 8, this;
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
    const e = this.margins.left, r = e + i.width;
    return this.doc.setDrawColor(...i.color), this.doc.setLineWidth(i.thickness), this.doc.line(e, this.currentY, r, this.currentY), this.currentY += i.thickness + i.marginBottom, this;
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
    }, r = this.doc.internal.getNumberOfPages(), o = this.doc.internal.getCurrentPageInfo().pageNumber, s = this.doc.internal.getCurrentPageInfo().color || [0, 0, 0];
    for (let n = 1; n <= r; n++) {
      this.doc.setPage(n), this.doc.setFontSize(e.fontSize), this.doc.setTextColor(e.color[0], e.color[1], e.color[2]), this._setFont(null, e.fontStyle);
      let a;
      const l = this.doc.getTextWidth(t);
      e.align === "center" ? a = (this.pageWidth - l) / 2 : e.align === "right" ? a = this.pageWidth - this.margins.right - l : a = this.margins.left, this._drawText(t, a, e.y);
    }
    return this.doc.setTextColor(s[0] || 0, s[1] || 0, s[2] || 0), this.doc.setPage(o), this;
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
    }, r = this.doc.internal.getNumberOfPages(), o = this.doc.internal.getCurrentPageInfo().pageNumber;
    for (let s = 1; s <= r; s++) {
      this.doc.setPage(s), this.doc.setFontSize(e.fontSize), this._setFont(null, e.fontStyle);
      const n = Array.isArray(e.color) ? e.color : [0, 0, 0];
      this.doc.setTextColor(n[0], n[1], n[2]);
      const a = t.replace("{pageNumber}", s).replace("{totalPages}", r);
      if (e.align === "center") {
        const l = this.doc.getTextWidth(a), c = (this.pageWidth - l) / 2;
        this._drawText(a, c, e.y);
      } else if (e.align === "right") {
        const l = this.doc.getTextWidth(a);
        this._drawText(a, this.pageWidth - this.margins.right - l, e.y);
      } else
        this._drawText(a, this.margins.left, e.y);
    }
    return this.doc.setPage(o), this;
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
      const r = this.exportPDFFile(i);
      if (!r)
        throw new Error("Không thể tạo PDF file");
      const o = new FormData();
      o.append(e.fieldName || "pdf", r), e.additionalData && Object.keys(e.additionalData).forEach((l) => {
        o.append(l, e.additionalData[l]);
      });
      const s = {
        method: "POST",
        body: o,
        ...e.fetchOptions
      };
      console.log(`Đang upload PDF tới: ${t}`);
      const n = await fetch(t, s);
      if (!n.ok)
        throw new Error(`HTTP error! status: ${n.status}`);
      const a = await n.json();
      return console.log("Upload thành công:", a), a;
    } catch (r) {
      throw console.error("Lỗi khi upload PDF:", r), r;
    }
  }
  // Thêm chữ ký đẹp mắt với nội dung căn giữa theo khối
  addSignature(t, i, e = null, r = {}) {
    const o = {
      align: "right",
      fontSize: 11,
      titleFontSize: 10,
      nameFontSize: 12,
      spacing: 8,
      signatureHeight: 20,
      blockWidth: 100,
      // Độ rộng khối chữ ký
      ...r
    }, s = e || (/* @__PURE__ */ new Date()).toLocaleDateString("vi-VN");
    let n;
    o.align === "right" ? n = this.pageWidth - this.margins.right - o.blockWidth : o.align === "center" ? n = (this.pageWidth - o.blockWidth) / 2 : n = this.margins.left;
    const a = n + o.blockWidth / 2;
    this.doc.setFontSize(o.fontSize);
    try {
      this._setFont(null, "normal");
    } catch {
      this.doc.setFont("helvetica", "normal");
    }
    this.doc.setTextColor(0, 0, 0);
    const l = this.doc.getTextWidth(s), c = a - l / 2;
    this._drawText(s, c, this.currentY), this.currentY += o.spacing, this.doc.setFontSize(o.titleFontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }
    const d = this.doc.getTextWidth(i), h = a - d / 2;
    this._drawText(i, h, this.currentY), this.currentY += 5;
    const g = "(Ký và ghi rõ họ tên)";
    this.doc.setFontSize(9);
    try {
      this._setFont(null, "italic");
    } catch {
      this.doc.setFont("helvetica", "italic");
    }
    this.doc.setTextColor(100, 100, 100);
    const u = this.doc.getTextWidth(g), f = a - u / 2;
    this._drawText(g, f, this.currentY), this.currentY += o.spacing, this.addSpace(o.signatureHeight), this.doc.setFontSize(o.nameFontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }
    this.doc.setTextColor(0, 0, 0);
    const p = this.doc.getTextWidth(t), S = a - p / 2;
    return this._drawText(t, S, this.currentY), this.currentY += 15, this;
  }
  // Load hình từ file path
  async loadImageFromPath(t) {
    try {
      const i = await fetch(t);
      if (!i.ok) throw new Error(`Không thể load hình từ ${t}`);
      const e = await i.blob();
      return new Promise((r, o) => {
        const s = new FileReader();
        s.onload = function(n) {
          r(n.target.result);
        }, s.onerror = function(n) {
          o(new Error("Lỗi khi đọc file"));
        }, s.readAsDataURL(e);
      });
    } catch (i) {
      return console.warn(`Không thể load hình từ ${t}:`, i.message), null;
    }
  }
  // Thêm chữ ký có hình ảnh với nội dung căn giữa theo khối
  async addSignatureWithImage(t, i, e, r = null, o = {}) {
    const s = {
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
      ...o
    }, n = r || (/* @__PURE__ */ new Date()).toLocaleDateString("vi-VN");
    let a;
    s.align === "right" ? a = this.pageWidth - this.margins.right - s.blockWidth : s.align === "center" ? a = (this.pageWidth - s.blockWidth) / 2 : a = this.margins.left;
    const l = a + s.blockWidth / 2;
    this.doc.setFontSize(s.fontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }
    this.doc.setTextColor(0, 0, 0), this.doc.setFontSize(s.dateFontSize);
    const c = this._decodeHtmlEntities(n), d = this.doc.getTextWidth(c), h = l - d / 2;
    this._drawText(c, h, this.currentY), this.currentY += s.spacing, this.doc.setFontSize(s.titleFontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }
    const g = this._decodeHtmlEntities(i), u = this.doc.getTextWidth(g), f = l - u / 2;
    this._drawText(g, f, this.currentY), this.currentY += 5;
    const p = s.noteText ?? "(Ký và ghi rõ họ tên)";
    this.doc.setFontSize(9);
    try {
      this._setFont(null, "italic");
    } catch {
      this.doc.setFont("helvetica", "italic");
    }
    this.doc.setTextColor(100, 100, 100);
    const S = this._decodeHtmlEntities(p), m = this.doc.getTextWidth(S), b = l - m / 2;
    this._drawText(S, b, this.currentY), this.currentY += s.spacing, this.addSpace(5);
    let y = null;
    if (e && (typeof e == "string" ? e.startsWith("data:") ? y = e : y = await this.loadImageFromPath(e) : y = e), y) {
      const F = l - s.imageWidth / 2;
      this.addImage(
        y,
        F,
        this.currentY,
        s.imageWidth,
        s.imageHeight,
        {
          format: "JPEG"
        }
      );
    } else if (s.nameTag && s.nameTag.trim()) {
      const F = this.doc.internal.getCurrentPageInfo().color || [0, 0, 0];
      this.doc.setTextColor(255, 255, 255), this.doc.setFontSize(9);
      try {
        this._setFont(null, "italic");
      } catch {
        this.doc.setFont("helvetica", "italic");
      }
      const H = this._decodeHtmlEntities(s.nameTag), A = this.doc.getTextWidth(H), O = l - A / 2;
      this._drawText(H, O, this.currentY + s.imageHeight / 2), this.doc.setTextColor(
        F[0] || 0,
        F[1] || 0,
        F[2] || 0
      ), this.addSpace(s.imageHeight + 10);
    } else
      this.addSpace(s.imageHeight + 10);
    this.doc.setFontSize(s.nameFontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }
    this.doc.setTextColor(0, 0, 0);
    const T = this._decodeHtmlEntities(t), W = this.doc.getTextWidth(T), D = l - W / 2;
    return this._drawText(T, D, this.currentY), this.currentY += 15, this;
  }
  // Thêm chữ ký từ file path (phương thức tiện lợi)
  async addSignatureFromFile(t, i, e, r = null, o = {}) {
    return await this.addSignatureWithImage(t, i, e, r, o);
  }
  // Thêm chữ ký với nhiều tùy chọn hình ảnh
  async addSmartSignature(t, i, e = {}, r = null, o = {}) {
    const {
      imagePath: s = null,
      imageData: n = null,
      fallbackText: a = null,
      createFallback: l = !0
    } = e;
    let c = null;
    return s && (c = await this.loadImageFromPath(s)), !c && n && (c = n), !c && l && (c = this.createTextSignature(a || t)), await this.addSignatureWithImage(t, i, c, r, o);
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
    }, ...t }, r = ["top-left", "top-right", "bottom-left", "bottom-right"], s = (Array.isArray(e.positions) ? e.positions : [e.positions]).filter((a) => r.includes(a));
    if (s.length === 0)
      return console.warn("No valid positions provided for secondary signature"), this;
    this.secondarySignatures || (this.secondarySignatures = []), this.secondarySignatures.push({
      imageData: e.imageData,
      nameTag: e.nameTag,
      positions: s,
      width: e.width,
      height: e.height,
      margin: e.margin,
      fontSize: e.fontSize,
      showPageNumber: e.showPageNumber
    });
    const n = this.doc.internal.getNumberOfPages();
    for (let a = 1; a <= n; a++)
      this.doc.setPage(a), this._renderSecondarySignature(e, a);
    return this;
  }
  /**
   * Render chữ ký nháy ở các vị trí đã chọn (internal method)
   * @private
   */
  _renderSecondarySignature(t, i = null) {
    const e = this.doc.internal.pageSize.width, r = this.doc.internal.pageSize.height;
    i === null && (i = this.doc.internal.getCurrentPageInfo().pageNumber);
    for (const o of t.positions) {
      let s, n;
      switch (o) {
        case "top-left":
          s = t.margin, n = t.margin;
          break;
        case "top-right":
          s = e - t.width - t.margin, n = t.margin;
          break;
        case "bottom-left":
          s = t.margin, n = r - t.height - t.margin;
          break;
        case "bottom-right":
          s = e - t.width - t.margin, n = r - t.height - t.margin;
          break;
        default:
          continue;
      }
      if (t.imageData)
        try {
          this.doc.addImage(
            t.imageData,
            "PNG",
            s,
            n,
            t.width,
            t.height
          );
        } catch (a) {
          console.warn("Failed to add secondary signature image:", a), this._renderSecondarySignatureNameTag(s, n, t, i);
        }
      else
        this._renderSecondarySignatureNameTag(s, n, t, i);
    }
  }
  /**
   * Render nameTag dạng watermark cho chữ ký nháy (internal method)
   * @private
   */
  _renderSecondarySignatureNameTag(t, i, e, r) {
    const o = this.doc.getTextColor(), s = this.doc.internal.getFontSize(), n = this.doc.getFont();
    this.doc.setTextColor(154, 166, 178), this.doc.setFontSize(e.fontSize);
    try {
      this._setFont(null, "italic");
    } catch {
      this.doc.setFont("helvetica", "italic");
    }
    let a = e.nameTag;
    e.showPageNumber && r && (a = `${e.nameTag}_${r}`);
    const l = this._decodeHtmlEntities(a), c = this.doc.getTextWidth(l), d = t + (e.width - c), h = i + e.height / 2 + e.fontSize / 2 + 3;
    this._drawText(l, d, h), this.doc.setTextColor(o), this.doc.setFontSize(s), this.doc.setFont(n.fontName, n.fontStyle);
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
    const r = document.createElement("canvas"), o = r.getContext("2d");
    r.width = i, r.height = e, o.fillStyle = "white", o.fillRect(0, 0, i, e), o.fillStyle = "#1a5490", o.font = 'italic bold 14px cursive, "Times New Roman", serif';
    const s = this._decodeHtmlEntities(t), n = o.measureText(s).width, a = (i - n) / 2, l = e / 2 + 5;
    return o.fillText(s, a, l), o.strokeStyle = "#1a5490", o.lineWidth = 1.5, o.beginPath(), o.moveTo(a - 5, l + 8), o.lineTo(a + n + 5, l + 8), o.stroke(), r.toDataURL("image/png");
  }
  // Thêm chữ ký đơn giản với đường gạch
  addSimpleSignature(t, i, e = null, r = {}) {
    const o = {
      fontSize: 11,
      lineWidth: 100,
      spacing: 8,
      ...r
    }, s = e || this.margins.left;
    return this.addText(i, s, null, {
      fontSize: o.fontSize,
      fontStyle: "bold"
    }), this.addSpace(o.spacing), this.doc.setLineWidth(0.5), this.doc.line(s, this.currentY, s + o.lineWidth, this.currentY), this.addSpace(5), this.addText(t, s, null, {
      fontSize: o.fontSize - 1
    }), this.addSpace(15), this;
  }
  // Tạo bố cục chữ ký hai cột với nội dung căn giữa theo khối
  addDualSignature(t, i) {
    const r = this.margins.left, o = this.pageWidth / 2 + 10, s = r + 90 / 2, n = o + 90 / 2, a = this.currentY;
    this.currentY = a;
    const l = t.date || "";
    this.renderCenteredText(l, s, this.currentY, 11, "normal"), this.currentY += 8, this.renderCenteredText(t.title, s, this.currentY, 10, "bold"), this.currentY += 5;
    const c = t.note || "(Ký và ghi rõ họ tên)";
    if (this.renderCenteredText(c, s, this.currentY, 9, "italic", [100, 100, 100]), this.currentY += 25, t.signaturePath && t.signaturePath.trim())
      try {
        this.doc.addImage(
          t.signaturePath,
          "PNG",
          s - 15,
          this.currentY - 20,
          30,
          15
        );
      } catch (u) {
        console.warn("Không thể thêm chữ ký trái:", u);
      }
    else if (t.nameTag && t.nameTag.trim()) {
      const u = this.doc.internal.getCurrentPageInfo().color || [0, 0, 0];
      this.doc.setTextColor(255, 255, 255);
      const f = this._decodeHtmlEntities(t.nameTag);
      this._drawText(f, s - this.doc.getTextWidth(f) / 2, this.currentY - 15), this.doc.setTextColor(
        u[0] || 0,
        u[1] || 0,
        u[2] || 0
      );
    }
    this.renderCenteredText(t.name, s, this.currentY, 11, "bold");
    const d = this.currentY;
    this.currentY = a;
    const h = i.date || "";
    this.renderCenteredText(h, n, this.currentY, 11, "normal"), this.currentY += 8, this.renderCenteredText(i.title, n, this.currentY, 10, "bold"), this.currentY += 5;
    const g = i.note || "(Ký và ghi rõ họ tên)";
    if (this.renderCenteredText(g, n, this.currentY, 9, "italic", [100, 100, 100]), this.currentY += 25, i.signaturePath && i.signaturePath.trim())
      try {
        this.doc.addImage(
          i.signaturePath,
          "PNG",
          n - 15,
          this.currentY - 20,
          30,
          15
        );
      } catch (u) {
        console.warn("Không thể thêm chữ ký phải:", u);
      }
    else if (i.nameTag && i.nameTag.trim()) {
      const u = this.doc.internal.getCurrentPageInfo().color || [0, 0, 0];
      this.doc.setTextColor(255, 255, 255);
      const f = this._decodeHtmlEntities(i.nameTag);
      this._drawText(f, n - this.doc.getTextWidth(f) / 2, this.currentY - 15), this.doc.setTextColor(
        u[0] || 0,
        u[1] || 0,
        u[2] || 0
      );
    }
    return this.renderCenteredText(i.name, n, this.currentY, 11, "bold"), this.currentY = Math.max(d, this.currentY) + 10, this;
  }
  // Hàm helper để render text căn giữa (hỗ trợ cả text và mixed text)
  renderCenteredText(t, i, e, r = 11, o = "normal", s = [0, 0, 0]) {
    if (Array.isArray(t)) {
      const n = this.currentY;
      this.currentY = e;
      let a = 0;
      t.forEach((c) => {
        let d = typeof c == "string" ? c : c.text;
        d = this._decodeHtmlEntities(d);
        const h = typeof c == "object" && c.fontSize ? c.fontSize : r, g = typeof c == "object" && c.style ? c.style : o;
        this.doc.setFontSize(h), this._setFont(null, g), a += this.doc.getTextWidth(d);
      });
      let l = i - a / 2;
      t.forEach((c) => {
        const d = typeof c == "string" ? c : c.text, h = typeof c == "object" && c.fontSize ? c.fontSize : r, g = typeof c == "object" && c.style ? c.style : o, u = typeof c == "object" && c.color ? c.color : s;
        this.doc.setFontSize(h), this._setFont(null, g), this.doc.setTextColor(u[0], u[1], u[2]), this._drawText(d, l, e), l += this.doc.getTextWidth(d);
      }), this.currentY = n;
    } else if (typeof t == "object" && t.text) {
      const n = t.text, a = t.fontSize || r, l = t.style || o, c = t.color || s;
      this.doc.setFontSize(a), this._setFont(null, l), this.doc.setTextColor(c[0], c[1], c[2]);
      const d = this._decodeHtmlEntities(n), h = this.doc.getTextWidth(d);
      this._drawText(d, i - h / 2, e);
    } else {
      let n = t.toString();
      n = this._decodeHtmlEntities(n), this.doc.setFontSize(r), this._setFont(null, o), this.doc.setTextColor(s[0], s[1], s[2]);
      const a = this.doc.getTextWidth(n);
      this._drawText(n, i - a / 2, e);
    }
  }
  // Thêm leader dots (dấu chấm dẫn)
  addLeaderDots(t, i, e = {}) {
    t = this._decodeHtmlEntities(t), i = this._decodeHtmlEntities(i);
    const r = {
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
    this.doc.setFontSize(r.fontSize), this._setFont(null, r.fontStyle);
    const o = Array.isArray(r.color) ? r.color : [0, 0, 0];
    this.doc.setTextColor(...o);
    const s = this.doc.getTextWidth(t), n = this.doc.getTextWidth(i), a = this.doc.getTextWidth(r.dotChar), l = this.margins.left, c = this.pageWidth - this.margins.right - n, d = l + s + r.leftPadding, h = c - r.rightPadding, g = h - d, u = Math.max(
      r.minDots,
      Math.floor(g / (a + r.dotSpacing))
    );
    this.checkPageBreak(r.lineHeight + 3), this._drawText(t, l, this.currentY);
    let f = d;
    for (let p = 0; p < u; p++)
      f + a <= h && (this._drawText(r.dotChar, f, this.currentY), f += a + r.dotSpacing);
    return this._drawText(i, c, this.currentY), this.currentY += r.lineHeight, this;
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
    return e.title && (this.addText(e.title, null, null, e.titleOptions), this.addSpace(10)), t.forEach((r) => {
      let o = typeof r == "string" ? r : r.title;
      o = this._decodeHtmlEntities(o);
      const s = typeof r == "object" ? r.page : "", a = typeof r == "object" && r.isSubItem ? e.subItemOptions : e.itemOptions, l = a.indent || 0, c = " ".repeat(l / 3) + o;
      this.addLeaderDots(c, s.toString(), {
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
    return e.title && (this.addText(e.title, null, null, e.titleOptions), this.addSpace(10)), t.forEach((r) => {
      const o = r.name || r.title, s = r.price || r.cost || 0, n = this._decodeHtmlEntities(o), a = this.formatPrice(s, e.currency), l = this._decodeHtmlEntities(a);
      this.addLeaderDots(n, l, {
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
    return e.title && (this.addText(e.title, null, null, e.titleOptions), this.addSpace(15)), t.forEach((r) => {
      this.addText(r.name, null, null, e.sectionOptions), this.addSpace(8), r.items.forEach((o) => {
        const s = `${o.name}${o.description ? ` - ${o.description}` : ""}`, n = this.formatPrice(o.price, e.currency), a = this._decodeHtmlEntities(s), l = this._decodeHtmlEntities(n);
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
      t.forEach((r) => {
        const o = this._decodeHtmlEntities(r.term), s = this._decodeHtmlEntities(r.pages.join(", "));
        this.addLeaderDots(o, s, {
          ...e.itemOptions,
          leftPadding: 5,
          rightPadding: 5,
          lineHeight: 5
        });
      });
    else {
      const r = Math.ceil(t.length / e.columns), o = (this.pageWidth - this.margins.left - this.margins.right) / e.columns;
      for (let s = 0; s < e.columns; s++) {
        const n = s * r, a = Math.min(n + r, t.length), l = t.slice(n, a), c = this.currentY, d = this.margins.left + s * o;
        s > 0 && (this.currentY = c), l.forEach((h) => {
          const g = this._decodeHtmlEntities(h.term), u = this._decodeHtmlEntities(h.pages.join(", ")), f = this.doc.getTextWidth(g), p = this.doc.getTextWidth(u);
          this.doc.setFontSize(e.itemOptions.fontSize);
          const S = this.doc.getTextWidth("."), m = o - f - p - 15, b = Math.max(3, Math.floor(m / (S + 2)));
          this._drawText(g, d, this.currentY);
          let y = d + f + 5;
          for (let W = 0; W < b; W++)
            this._drawText(".", y, this.currentY), y += S + 2;
          const T = d + o - p - 5;
          this._drawText(u, T, this.currentY), this.currentY += 5;
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
    }, r = {
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
    let o;
    if (this.currentY, r.align === "center" ? o = (this.pageWidth - r.lineLength) / 2 : r.align === "right" ? o = this.pageWidth - this.margins.right - r.lineLength : o = this.margins.left, t && r.labelPosition !== "none") {
      this.doc.setFontSize(r.labelOptions.fontSize), this._setFont(null, r.labelOptions.fontStyle);
      const a = Array.isArray(r.labelOptions.color) ? r.labelOptions.color : [0, 0, 0];
      this.doc.setTextColor(...a);
      const l = this.doc.getTextWidth(t);
      if (r.labelPosition === "above") {
        const c = r.align === "center" ? (this.pageWidth - l) / 2 : r.align === "right" ? this.pageWidth - this.margins.right - l : this.margins.left;
        this._drawText(t, c, this.currentY), this.currentY += r.labelOptions.spacing;
      } else r.labelPosition === "left" && (this._drawText(t, this.margins.left, this.currentY), o = this.margins.left + l + r.labelOptions.spacing, r.lineLength = Math.min(
        r.lineLength,
        this.pageWidth - this.margins.right - o
      ));
    }
    const s = (r.lineCount - 1) * r.lineSpacing + 10;
    this.checkPageBreak(s), this.doc.setLineWidth(r.lineWidth);
    const n = Array.isArray(r.lineColor) ? r.lineColor : [0, 0, 0];
    this.doc.setDrawColor(...n);
    for (let a = 0; a < r.lineCount; a++) {
      const l = this.currentY + a * r.lineSpacing;
      if (r.lineStyle === "dots") {
        this.doc.setFontSize(r.labelOptions.fontSize);
        try {
          this._setFont(null, "normal");
        } catch {
          this.doc.setFont("helvetica", "normal");
        }
        const c = Array.isArray(r.lineColor) ? r.lineColor : [0, 0, 0];
        this.doc.setTextColor(...c);
        const d = this.doc.getTextWidth(r.dotChar), h = Math.floor(r.lineLength / (d + r.dotSpacing));
        for (let g = 0; g < h; g++) {
          const u = o + g * (d + r.dotSpacing);
          u + d <= o + r.lineLength && this._drawText(r.dotChar, u, l);
        }
      } else
        r.lineStyle === "dashed" ? this.doc.setLineDashPattern([3, 2], 0) : r.lineStyle === "dotted" ? this.doc.setLineDashPattern([1, 2], 0) : this.doc.setLineDashPattern([], 0), this.doc.line(o, l, o + r.lineLength, l);
      if (r.showPlaceholder && r.placeholderText) {
        this.doc.setFontSize(r.placeholderOptions.fontSize), this._setFont(null, r.placeholderOptions.fontStyle);
        const c = Array.isArray(r.placeholderOptions.color) ? r.placeholderOptions.color : [150, 150, 150];
        this.doc.setTextColor(...c);
        const d = l - 2;
        this._drawText(r.placeholderText, o + 5, d);
      }
    }
    if (this.doc.setLineDashPattern([], 0), t && r.labelPosition === "right") {
      this.doc.setFontSize(r.labelOptions.fontSize), this._setFont(null, r.labelOptions.fontStyle);
      const a = Array.isArray(r.labelOptions.color) ? r.labelOptions.color : [0, 0, 0];
      this.doc.setTextColor(...a);
      const l = o + r.lineLength + r.labelOptions.spacing;
      this._drawText(t, l, this.currentY);
    }
    if (t && r.labelPosition === "below") {
      const a = this.currentY + (r.lineCount - 1) * r.lineSpacing;
      this.currentY = a + r.labelOptions.spacing;
      const l = this.doc.getTextWidth(t), c = r.align === "center" ? (this.pageWidth - l) / 2 : r.align === "right" ? this.pageWidth - this.margins.right - l : this.margins.left;
      this._drawText(t, c, this.currentY);
    }
    return this.currentY += (r.lineCount - 1) * r.lineSpacing + 10, this;
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
      t.forEach((r) => {
        const o = {
          lineLength: 150,
          labelPosition: "left",
          ...r.options
        };
        this.addFillInLine(r.label || "", o), this.addSpace(e.fieldSpacing - 10);
      });
    else {
      const r = Math.ceil(t.length / e.columns), o = (this.pageWidth - this.margins.left - this.margins.right) / e.columns;
      for (let s = 0; s < t.length; s += r) {
        const n = t.slice(s, s + r), a = Math.floor(s / r), l = this.currentY;
        n.forEach((c, d) => {
          a > 0 && (this.currentY = l + d * e.fieldSpacing);
          const h = {
            lineLength: o - 20,
            labelPosition: "above",
            align: "left",
            ...c.options
          }, g = this.margins.left + a * o, u = this.margins.left;
          this.margins.left = g, this.addFillInLine(c.label || "", h), this.margins.left = u, a === 0 && this.addSpace(e.fieldSpacing - 10);
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
      const r = t.length * (e.signatureWidth + e.spacing) - e.spacing;
      let o = (this.pageWidth - r) / 2;
      t.forEach((s, n) => {
        const a = o + n * (e.signatureWidth + e.spacing), l = this.margins.left;
        this.margins.left = a, e.showDate && this.addFillInLine(e.dateLabel, {
          lineLength: e.dateWidth,
          labelPosition: "left",
          align: "left"
        }), s.title && this.addText(
          s.title,
          a + (e.signatureWidth - this.doc.getTextWidth(s.title)) / 2,
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
      t.forEach((r) => {
        r.title && this.addText(r.title, null, null, {
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
    }, r = t.map((o) => ({
      ...o,
      options: {
        ...e.fieldDefaults,
        ...o.options
      }
    }));
    return this.addFillInForm(r, e);
  }
  // Thêm signature với dotted lines
  addDottedSignature(t = [], i = {}) {
    const e = {
      lineStyle: "dots",
      dotChar: ".",
      dotSpacing: 2,
      ...i
    }, r = this.addFillInLine.bind(this);
    this.addFillInLine = (s, n = {}) => r(s, {
      lineStyle: "dots",
      dotChar: ".",
      dotSpacing: 2,
      ...n
    });
    const o = this.addSignatureFillIn(t, e);
    return this.addFillInLine = r, o;
  }
  // Thêm custom dotted pattern
  addCustomDottedLine(t = "", i = ".", e = 2, r = 100, o = {}) {
    return this.addFillInLine(t, {
      lineStyle: "dots",
      dotChar: i,
      dotSpacing: e,
      lineLength: r,
      ...o
    });
  }
  // Thêm text với định dạng hỗn hợp (bold, italic trong cùng dòng)
  addMixedText(t, i = {}) {
    const r = { ...{
      fontSize: 12,
      color: [0, 0, 0],
      maxWidth: this.pageWidth - this.margins.left - this.margins.right,
      align: "left",
      lineHeight: this.lineHeight
    }, ...i };
    r.lineHeight = parseFloat(r.lineHeight) || 5, r.fontSize = parseFloat(r.fontSize) || 12, r.maxWidth = parseFloat(r.maxWidth) || this.pageWidth - this.margins.left - this.margins.right;
    let o = r.x || this.margins.left, s = this.currentY, n = [], a = 0;
    return this.checkPageBreak(r.lineHeight + 10), s = this.currentY, t.forEach((l, c) => {
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
      const g = typeof l == "object" && l.color ? l.color : typeof l == "object" && l.style && l.style.color ? l.style.color : r.color;
      let u = typeof l == "object" && l.fontSize ? l.fontSize : typeof l == "object" && l.style && l.style.fontSize ? l.style.fontSize : r.fontSize;
      if (u = parseFloat(u) || r.fontSize || 12, this.doc.setFontSize(u), this._setFont(null, h), !d) return;
      const f = String(d).split(" ");
      f.forEach((p, S) => {
        const m = S < f.length - 1 ? p + " " : p, b = this.doc.getTextWidth(m);
        if (a + b > r.maxWidth && n.length > 0) {
          this.renderMixedLine(n, o, s, r, !1), s += r.lineHeight;
          const W = this.currentY;
          this.checkPageBreak(r.lineHeight + 5), this.currentY < W && (s = this.currentY), o = r.x || this.margins.left, n = [], a = 0;
        }
        const y = typeof l == "object" && l.style && typeof l.style == "object" ? l.style.underline : !1, T = typeof l == "object" && l.style && typeof l.style == "object" ? l.style.strikethrough : !1;
        n.push({
          text: m,
          style: h,
          color: this._parseColorToArray(g),
          fontSize: u,
          width: b,
          underline: y,
          strikethrough: T
        }), a += b;
      });
    }), n.length > 0 && (this.renderMixedLine(n, o, s, r, !0), s += r.lineHeight), r.spacing !== void 0 && r.spacing, this.currentY = s, this;
  }
  // Helper function để render một dòng mixed text
  renderMixedLine(t, i, e, r, o = !1) {
    if (!t || t.length === 0) return;
    let s = i;
    if (r.align === "center") {
      const n = t.reduce((a, l) => a + l.width, 0);
      s = (this.pageWidth - n) / 2;
    } else if (r.align === "right") {
      const n = t.reduce((a, l) => a + l.width, 0);
      s = this.pageWidth - this.margins.right - n;
    } else if (r.align === "justify" && !o && t.length > 1) {
      this.renderJustifiedMixedLine(t, i, e, r);
      return;
    }
    t.forEach((n) => {
      if (this.doc.setFontSize(n.fontSize), this._setFont(null, n.style), this.doc.setTextColor(n.color[0], n.color[1], n.color[2]), this._drawText(n.text, s, e), n.underline) {
        const a = this.doc.getTextWidth(n.text.trimEnd()), l = e + 1;
        this.doc.setDrawColor(n.color[0], n.color[1], n.color[2]), this.doc.setLineWidth(0.3), this.doc.line(s, l, s + a, l);
      }
      if (n.strikethrough) {
        const a = this.doc.getTextWidth(n.text.trimEnd()), l = e - n.fontSize * 0.12;
        this.doc.setDrawColor(n.color[0], n.color[1], n.color[2]), this.doc.setLineWidth(0.3), this.doc.line(s, l, s + a, l);
      }
      s += n.width;
    });
  }
  // Hàm vẽ mixed text canh đều
  renderJustifiedMixedLine(t, i, e, r) {
    if (t.length <= 1) {
      this.renderMixedLine(t, i, e, { ...r, align: "left" });
      return;
    }
    let o = 0;
    t.forEach((c) => {
      this.doc.setFontSize(c.fontSize), this._setFont(null, c.style), o += this.doc.getTextWidth(c.text.trimEnd());
    });
    const s = t.length - 1, a = (r.maxWidth - o) / s;
    let l = i;
    t.forEach((c, d) => {
      this.doc.setFontSize(c.fontSize), this._setFont(null, c.style), this.doc.setTextColor(c.color[0], c.color[1], c.color[2]);
      const h = c.text.trimEnd(), g = this.doc.getTextWidth(h);
      if (this._drawText(h, l, e), c.underline) {
        const u = e + 1;
        this.doc.setDrawColor(c.color[0], c.color[1], c.color[2]), this.doc.setLineWidth(0.3), this.doc.line(l, u, l + g, u);
      }
      if (c.strikethrough) {
        const u = e - c.fontSize * 0.12;
        this.doc.setDrawColor(c.color[0], c.color[1], c.color[2]), this.doc.setLineWidth(0.3), this.doc.line(l, u, l + g, u);
      }
      l += g, d < t.length - 1 && (l += a);
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
  createTextPart(t, i = "normal", e = null, r = null) {
    const o = { text: t, style: i };
    return e && (o.color = Array.isArray(e) ? e : [0, 0, 0]), r && (o.fontSize = r), o;
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
  colored(t, i, e = "normal", r = null) {
    return this.createTextPart(t, e, i, r);
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
    const r = this.currentNumberByStyle[e.numberStyle];
    let o = "";
    switch (e.numberStyle) {
      case "decimal":
        o = r.toString();
        break;
      case "roman":
        o = this.toRomanNumeral(r);
        break;
      case "alpha":
        o = this.toAlphaNumeral(r);
        break;
      case "bullet":
        o = "•";
        break;
      default:
        o = r.toString();
    }
    const s = e.numberFormat.replace("{number}", o);
    this.doc.setFontSize(e.fontSize), this._setFont(null, e.fontStyle);
    const n = Array.isArray(e.color) ? e.color : [0, 0, 0];
    this.doc.setTextColor(...n);
    const a = this.doc.splitTextToSize(t, e.maxWidth);
    if (e.skipPageBreakCheck !== !0) {
      const h = a.length * (3 + e.lineHeight);
      this.checkPageBreak(h + 10);
    }
    let l = this.margins.left, c = this.margins.left + e.indent, d = this.currentY;
    return a.forEach((h, g) => {
      if (a.length > 5 && e.skipPageBreakCheck !== !0 && (this.checkPageBreak(3 + e.lineHeight + 5), d = this.currentY), g === 0 && e.showIndex) {
        if (e.align === "center") {
          const u = this.doc.getTextWidth(s + " " + h), f = (this.pageWidth - u) / 2;
          l = f, c = f + this.doc.getTextWidth(s) + 5;
        } else if (e.align === "right") {
          const u = this.doc.getTextWidth(s + " " + h), f = this.pageWidth - this.margins.right - u;
          l = f, c = f + this.doc.getTextWidth(s) + 5;
        } else
          l = this.margins.left, c = this.margins.left + e.indent;
        this._drawText(s, l, d);
      }
      if (e.align === "center")
        if (g === 0 && e.showIndex)
          this._drawText(h, c, d);
        else {
          const u = this.doc.getTextWidth(h), f = (this.pageWidth - u) / 2;
          this._drawText(h, f, d);
        }
      else if (e.align === "right")
        if (g === 0 && e.showIndex)
          this._drawText(h, c, d);
        else {
          const u = this.doc.getTextWidth(h), f = this.pageWidth - this.margins.right - u;
          this._drawText(h, f, d);
        }
      else if (e.align === "justify") {
        const u = g === a.length - 1;
        g === 0 ? (c = this.margins.left + e.indent, !u && h.trim().length > 0 ? this.drawJustifiedText(
          h,
          c,
          d,
          e.maxWidth,
          e
        ) : this._drawText(h, c, d)) : (c = this.margins.left + e.indent, !u && h.trim().length > 0 ? this.drawJustifiedText(
          h,
          c,
          d,
          e.maxWidth,
          e
        ) : this._drawText(h, c, d));
      } else
        g === 0 ? c = this.margins.left + e.indent : c = this.margins.left + e.indent, this._drawText(h, c, d);
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
    return e.title && (this.addText(e.title, null, null, e.titleOptions), this.addSpace(5)), e.resetNumbers && this.resetNumbering(e.itemOptions.numberStyle, 1), t.forEach((r, o) => {
      const s = typeof r == "string" ? r : r.text, n = typeof r == "object" ? { ...e.itemOptions, ...r.options } : e.itemOptions;
      this.doc.setFontSize(n.fontSize || 11);
      const a = n.maxWidth || this.pageWidth - this.margins.left - this.margins.right - (n.indent || 20), c = this.doc.splitTextToSize(s, a).length * ((n.lineHeight || this.lineHeight) + 3) + (e.spacing || 0.5) + 10;
      this.checkPageBreak(c);
      const d = { ...n, skipPageBreakCheck: !0 };
      this.addNumberedText(s, d), o < t.length - 1 && this.addSpace(e.spacing);
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
    const r = (o, s = 1) => {
      const n = `level${Math.min(s, 4)}`, a = e[n];
      o.forEach((l, c) => {
        if (typeof l == "string")
          this.addNumberedText(l, a);
        else if (l.text) {
          const d = { ...a, ...l.options };
          this.addNumberedText(l.text, d), l.subItems && Array.isArray(l.subItems) && (this.addSpace(e.spacing), r(l.subItems, s + 1));
        }
        c < o.length - 1 && this.addSpace(e.spacing);
      });
    };
    return r(t), this;
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
    for (let [r, o] of i) {
      const s = Math.floor(t / o);
      e += r.repeat(s), t -= o * s;
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
    const r = (o, s = 1, n = []) => {
      o.forEach((a) => {
        const l = typeof a == "string" ? a : a.title, c = typeof a == "object" ? a.page : "", d = typeof a == "object" ? a.subItems : null;
        let h = `h${Math.min(s, 3)}`, g = e[`${h}Options`], u = this.currentNumberByStyle[h] || 1, f = u.toString();
        g.numberFormat.includes("{parent}") && n.length > 0 && (f = f + "." + n[n.length - 1]), g.numberFormat.includes("{grandparent}") && n.length > 1 && (f = f + "." + n[n.length - 2]);
        const p = g.numberFormat.replace("{number}", u).replace("{parent}", n[n.length - 1] || "").replace("{grandparent}", n[n.length - 2] || "");
        if (e.showPageNumbers && c ? this.addLeaderDots(p + " " + l, c.toString(), {
          fontSize: g.fontSize,
          fontStyle: g.fontStyle,
          leftPadding: g.indent
        }) : this.addText(p + " " + l, this.margins.left + g.indent, null, {
          fontSize: g.fontSize,
          fontStyle: g.fontStyle
        }), this.currentNumberByStyle || (this.currentNumberByStyle = {}), this.currentNumberByStyle[h] = u + 1, d && Array.isArray(d)) {
          const S = [...n, u];
          this.resetNumbering(`h${s + 1}`, 1), r(d, s + 1, S);
        }
      });
    };
    return r(t), this;
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
    const e = t.map((s) => {
      const [n, a] = s.split(":");
      return { left: n ?? "", right: a ?? "" };
    }), r = Math.max(...e.map((s) => s.left.trimEnd().length)), o = " ".repeat(i);
    return e.map((s) => {
      const n = " ".repeat(r - s.left.trimEnd().length);
      return `${s.left.trimEnd()}${n} :${o}${s.right.trimStart()}`;
    });
  }
}
class z {
  /**
   * Create PDFRenderer instance
   * @param {Object} fontConfig - Font configuration (optional)
   * @param {string} fontConfig.defaultFont - Primary font name
   * @param {string} fontConfig.fallback - Fallback font name
   */
  constructor(t = {}) {
    this.options = { ...t }, this.fontConfig = { ...P, ...t.fonts, ...t }, this.pdfService = null, this.margins = t.margins || {
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
    return this.pdfService = new N(this.options), t.margins && (this.margins = { ...this.margins, ...t.margins }, this.contentWidth = this.pageWidth - this.margins.left - this.margins.right), t.pages.forEach((e, r) => {
      r > 0 && this.pdfService.addNewPage(), this.pdfService.resetPosition(this.margins.top), this.renderPage(e, i);
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
    const e = t.segments || [], r = t.style || {}, o = e.map((h) => ({
      text: this.replaceVariables(h.text, i),
      style: h.style
    })), s = this.calculateX(t), n = r.lineHeight || 5, a = {
      fontSize: r.fontSize || 12,
      color: this.parseColor(r.color),
      align: r.align || "left",
      lineHeight: n,
      x: s,
      maxWidth: t.width || this.contentWidth
    };
    if (!o.some(
      (h) => h.text && (h.text.includes("___BR___") || h.text.includes("___HR___") || h.text.includes("___PAGEBREAK___"))
    )) {
      const h = o.map((g) => ({
        ...g,
        text: g.text ? g.text.replace(/___TAB___/g, "    ") : g.text
      }));
      this.pdfService.addMixedParagraph(h, a);
      return;
    }
    let c = o.map((h) => h.text || "").join("");
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
        const g = [{ text: h.trim(), style: {} }];
        this.pdfService.addMixedParagraph(g, a);
      }
  }
  /**
   * Render text element using JsPdfService (content-flow)
   * Handles layout markers: ___BR___, ___HR___, ___PAGEBREAK___, ___TAB___
   */
  renderText(t, i) {
    let e = this.replaceVariables(t.content, i);
    const r = t.style || {}, o = r.lineHeight || 5, s = {
      fontSize: r.fontSize || 12,
      fontStyle: this.mapFontStyle(r),
      color: this.parseColor(r.color),
      align: r.align || "left",
      lineHeight: o
    }, n = this.calculateX(t);
    if (e = e.replace(/___TAB___/g, "    "), !e.includes("___BR___") && !e.includes("___HR___") && !e.includes("___PAGEBREAK___")) {
      this.pdfService.addText(e, n, null, s);
      return;
    }
    const a = e.split(/(___BR___|___HR___|___PAGEBREAK___)/);
    for (const l of a)
      l === "___BR___" ? this.pdfService.addSpace(o) : l === "___HR___" ? this.pdfService.addHorizontalLine() : l === "___PAGEBREAK___" ? this.pdfService.addNewPage() : l.trim() && this.pdfService.addText(l.trim(), n, null, s);
  }
  /**
   * Render heading element (content-flow)
   */
  renderHeading(t, i) {
    var o, s, n;
    const e = this.replaceVariables(t.content, i);
    switch (t.level || 1) {
      case 1:
        this.pdfService.addTitle(e, { align: ((o = t.style) == null ? void 0 : o.align) || "center" });
        break;
      case 2:
        this.pdfService.addSubTitle(e, { align: ((s = t.style) == null ? void 0 : s.align) || "left" });
        break;
      default:
        this.pdfService.addText(e, null, null, {
          fontSize: 14,
          fontStyle: "bold",
          align: ((n = t.style) == null ? void 0 : n.align) || "left"
        });
    }
  }
  /**
   * Render table element with styles
   */
  renderTable(t, i) {
    var g, u;
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
    const r = [], o = t.style || {}, s = (f, p, S) => {
      if (!f) return { content: "" };
      const m = f.cellStyle || {}, b = {
        halign: f.align || "left",
        valign: m.verticalAlign === "top" ? "top" : m.verticalAlign === "bottom" ? "bottom" : "middle"
      };
      if (m.backgroundColor && (b.fillColor = this.parseColorToArray(m.backgroundColor)), m.borderColor && (b.lineColor = this.parseColorToArray(m.borderColor)), m.borderWidth && (b.lineWidth = m.borderWidth), m.padding && (b.cellPadding = m.padding), f.type === "image")
        return r.push({
          rowIndex: p,
          cellIndex: S,
          src: f.src,
          width: f.width,
          height: f.height
        }), {
          content: "[IMG]",
          colSpan: f.colSpan || 1,
          rowSpan: f.rowSpan || 1,
          styles: b
        };
      const y = typeof f == "object" ? this.replaceVariables(f.content, i) : f;
      return {
        content: this.cleanContent(y),
        colSpan: f.colSpan || 1,
        rowSpan: f.rowSpan || 1,
        styles: b
      };
    };
    let n = 0;
    for (let f = 0; f < e.length && e[f].some((S) => S.isHeader); f++)
      n++;
    n === 0 && e.length > 0 && (n = 1);
    const a = e.slice(0, n).map(
      (f, p) => f.map((S, m) => s(S, p, m))
    ), l = (g = e[0]) == null ? void 0 : g[0], c = (u = l == null ? void 0 : l.cellStyle) == null ? void 0 : u.backgroundColor, d = e.slice(n).map(
      (f, p) => f.map((S, m) => s(S, p + n, m))
    ), h = {
      tableWidth: t.width
    };
    o.borderWidth !== void 0 && (h.lineWidth = o.borderWidth), o.borderColor && (h.lineColor = this.parseColorToArray(o.borderColor)), o.backgroundColor && (h.fillColor = this.parseColorToArray(o.backgroundColor)), o.align === "center" ? h.tableAlign = "center" : o.align === "right" && (h.tableAlign = "right"), c && (h.headStyles = {
      fillColor: this.parseColorToArray(c)
    }), typeof this.pdfService.addTable == "function" ? this.pdfService.addTable(a, d, h) : this.drawTableManually(t, i);
  }
  /**
   * Parse color string to RGB array for jspdf-autotable
   */
  parseColorToArray(t) {
    if (!t) return [0, 0, 0];
    if (t.startsWith("#")) {
      const e = t.slice(1), r = parseInt(e.substr(0, 2), 16), o = parseInt(e.substr(2, 2), 16), s = parseInt(e.substr(4, 2), 16);
      return [r, o, s];
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
    const r = e.map((s) => s.label || s), o = i.map(
      (s) => e.map((n) => {
        const a = n.key || n;
        return String(s[a] || "");
      })
    );
    typeof this.pdfService.addTable == "function" && this.pdfService.addTable(r, o, t.style || {});
  }
  /**
   * Manual table drawing when addTable is not available
   */
  drawTableManually(t, i) {
    var d;
    const e = t.rows || [], r = t.x || this.pdfService.margins.left, o = t.width || this.pdfService.pageWidth - r - this.pdfService.margins.right, s = t.rowHeight || 8, n = ((d = e[0]) == null ? void 0 : d.length) || 1, a = o / n, l = this.pdfService.doc;
    let c = this.pdfService.getCurrentY();
    l.setLineWidth(0.5), l.setFontSize(10), e.forEach((h, g) => {
      h.forEach((u, f) => {
        const p = r + f * a, S = typeof u == "object" ? this.replaceVariables(u.content, i) : this.replaceVariables(String(u), i), m = typeof u == "object" ? u.isHeader : g === 0;
        m && (l.setFillColor(240, 240, 240), l.rect(p, c, a, s, "F")), l.setDrawColor(0, 0, 0), l.rect(p, c, a, s);
        try {
          l.setFont(this.fontConfig.defaultFont, m ? "bold" : "normal");
        } catch {
          l.setFont(this.fontConfig.fallback || "helvetica", m ? "bold" : "normal");
        }
        l.setTextColor(0, 0, 0);
        const b = S.replace(/<[^>]*>/g, ""), y = c + s / 2 + 2;
        l.text(b, p + 2, y, { maxWidth: a - 4 });
      }), c += s;
    }), this.pdfService.resetPosition(c + 5);
  }
  /**
   * Render image element (content-flow)
   */
  renderImage(t, i) {
    let e = this.replaceVariables(t.src, i);
    if (e && (e.startsWith("data:") || e.startsWith("http"))) {
      const r = t.x !== void 0 ? t.x : this.margins.left;
      this.pdfService.addImage(
        e,
        r,
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
    const r = e.includes("___BR___"), o = e.includes("___HR___"), s = e.includes("___PAGEBREAK___");
    if (!r && !o && !s)
      return e;
    const n = e.split(/(___BR___|___HR___|___PAGEBREAK___)/);
    for (let a = 0; a < n.length; a++) {
      const l = n[a];
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
    const r = t.replace(/___TAB___/g, "    ").split(/(___BR___|___HR___|___PAGEBREAK___)/), o = i.x || this.margins.left, s = i.fontSize || 12, n = i.lineHeight || s * 0.5;
    for (const a of r)
      a === "___BR___" ? this.pdfService.addSpace(n) : a === "___HR___" ? this.pdfService.addHorizontalLine ? this.pdfService.addHorizontalLine() : this.pdfService.addSpace(5) : a === "___PAGEBREAK___" ? this.pdfService.addNewPage() : a.trim() && this.pdfService.addText(a.trim(), o, null, {
        fontSize: s,
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
      const r = {
        // Direct PDF service access
        pdf: this.pdfService,
        // Data context
        data: i,
        // Renderer reference
        renderer: this,
        // Helper functions
        formatNumber: (n) => w.formatNumber(n),
        formatCurrency: (n) => w.formatCurrency(n),
        formatDate: (n) => w.formatDate(n),
        today: () => w.formatDateObject(/* @__PURE__ */ new Date()),
        now: () => (/* @__PURE__ */ new Date()).toLocaleString("vi-VN"),
        year: () => (/* @__PURE__ */ new Date()).getFullYear(),
        sum: (n, a) => Array.isArray(n) ? n.reduce((l, c) => l + (Number(c[a]) || 0), 0) : 0,
        count: (n) => Array.isArray(n) ? n.length : 0,
        filter: (n, a) => Array.isArray(n) ? n.filter(a) : [],
        map: (n, a) => Array.isArray(n) ? n.map(a) : [],
        join: (n, a = ", ") => Array.isArray(n) ? n.join(a) : "",
        // Shortcuts aliases
        addText: (n, a, l, c) => this.pdfService.addText(n, a, l, c),
        addTitle: (n, a) => this.pdfService.addTitle(n, a),
        addTable: (n, a, l) => this.pdfService.addTable(n, a, l),
        addSpace: (n) => this.pdfService.addSpace(n),
        addLine: () => this.pdfService.addHorizontalLine(),
        addImage: (n, a, l, c, d) => this.pdfService.addImage(n, a, l, c, d),
        newPage: () => this.pdfService.addNewPage(),
        // Extended features requested by user
        addHeader: (n, a) => this.pdfService.addHeader(n, a),
        addFooter: (n, a) => this.pdfService.addFooter(n, a),
        addPageNumbers: (n) => this.pdfService.addFooter(n.format || "{pageNumber}", n),
        // Compatibility
        addFilter: (n, a) => this.pdfService.addFillInLine(n, a),
        // Alias for addFillInLine
        addFiller: (n, a) => this.pdfService.addFillInLine(n, a),
        // Clearer alias
        addSign: (n, a) => this.pdfService.addDottedSignature(n, a),
        // Alias for addDottedSignature
        addSignature: (n, a) => this.pdfService.addSignatureFillIn(n, a),
        // Safe default      
        // Full Signature Suite
        addDualSignature: (...n) => this.pdfService.addDualSignature(...n),
        addSimpleSignature: (...n) => this.pdfService.addSimpleSignature(...n),
        addSecondarySignature: (...n) => this.pdfService.addSecondarySignature(...n),
        addSmartSignature: (...n) => this.pdfService.addSmartSignature(...n),
        addSignatureFromFile: (...n) => this.pdfService.addSignatureFromFile(...n),
        addSignatureWithImage: (...n) => this.pdfService.addSignatureWithImage(...n),
        // Generic alias defaulting to Smart Signature if robust, or FillIn if form-based. 
        // User listed 'addSignature' separately. Let's map it to addSignatureFillIn as a safe default block.
        addSignature: (...n) => this.pdfService.addSignatureFillIn(...n)
      }, s = new Function(...Object.keys(r), `
        "use strict";
        ${e}
      `)(...Object.values(r));
      console.log("[PDFRenderer] Eval completed, result:", s), typeof s == "string" && s.trim() && this.pdfService.addText(s, this.margins.left, null, {
        fontSize: 12,
        maxWidth: this.contentWidth
      });
    } catch (r) {
      console.error("[PDFRenderer] Eval error:", r), this.pdfService.addText(`[Eval Error: ${r.message}]`, this.margins.left, null, {
        fontSize: 10,
        color: [255, 0, 0]
      });
    }
  }
  /**
   * Render code block - display code as formatted text (not evaluated)
   */
  renderCodeBlock(t, i) {
    const e = t.code || "", r = t.language || "text";
    console.log("[PDFRenderer] Rendering code block:", r, e.length, "chars"), this.pdfService.addText(e, this.margins.left, null, {
      fontSize: 10,
      fontStyle: "normal",
      maxWidth: this.contentWidth
    });
  }
}
const E = class E {
  constructor() {
    this.editor = null, this.parser = new v(), this.renderer = null, this.blueprint = null, this._initialized = !1, this.fontConfig = { ...P };
  }
  /**
   * Initialize CKEditor into a container element
   * @param {string|HTMLElement} elementOrSelector - DOM element or CSS selector
   * @param {Object} options - CKEditor configuration options
   * @returns {Promise<DrawPDF>} This instance (chainable)
   */
  async init(t, i = {}) {
    var f, p, S, m;
    const e = typeof t == "string" ? document.querySelector(t) : t;
    if (!e)
      throw new Error(`DrawPDF: Element not found: ${t}`);
    const r = window.CKEDITOR ?? ((f = window.DrawPDF) == null ? void 0 : f.CKEDITOR), o = (r == null ? void 0 : r.DecoupledEditor) || (r == null ? void 0 : r.ClassicEditor) || window.DecoupledEditor || window.ClassicEditor;
    if (!o)
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
    }, {
      fonts: n,
      format: a,
      orientation: l,
      margins: c,
      unit: d,
      ...h
    } = i, g = { ...s, ...h };
    n && (this.fontConfig = { ...P, ...n }), this.fontConfig.register && this.fontConfig.register.length > 0 && await this._loadFontFiles(this.fontConfig.register);
    const u = {
      ...this.fontConfig,
      // Flat font props if any
      fonts: this.fontConfig,
      // Nested fonts prop
      ...i
      // Pass format, orientation, margins directly
    };
    this.renderer = new z(u);
    try {
      if (this.editor = await o.create(e, g), (m = (S = (p = this.editor.ui) == null ? void 0 : p.view) == null ? void 0 : S.toolbar) != null && m.element)
        if (i.toolbarContainer) {
          const b = typeof i.toolbarContainer == "string" ? document.querySelector(i.toolbarContainer) : i.toolbarContainer;
          b && b.appendChild(this.editor.ui.view.toolbar.element);
        } else
          e instanceof HTMLElement && e.parentNode && (this._toolbarElement = this.editor.ui.view.toolbar.element, e.parentNode.insertBefore(this._toolbarElement, e));
      this._initialized = !0, console.log("✅ DrawPDF initialized with font:", this.fontConfig.defaultFont);
    } catch (b) {
      throw console.error("DrawPDF init failed:", b), b;
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
      const r = document.createElement("script");
      r.src = t, r.onload = i, r.onerror = () => e(new Error(`Failed to load font script: ${t}`)), document.head.appendChild(r);
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
    this.editor && (this._toolbarElement && this._toolbarElement.parentNode && this._toolbarElement.parentNode.removeChild(this._toolbarElement), this._toolbarElement = null, this.editor.destroy(), this.editor = null, this._initialized = !1), this.blueprint = null;
  }
  /**
   * Static factory method - create and initialize in one call
   * @param {string|HTMLElement} element - DOM element or selector
   * @param {Object} options - CKEditor options
   * @returns {Promise<DrawPDF>} Initialized DrawPDF instance
   */
  static async create(t, i = {}) {
    const e = new E();
    return await e.init(t, i), e;
  }
  /**
   * Static method - parse HTML to blueprint without editor
   * @param {string} html - HTML content
   * @returns {Object} JSON Blueprint
   */
  static parseHtml(t) {
    const e = new v().parse(t);
    return e.sourceHtml = t, e.createdAt = (/* @__PURE__ */ new Date()).toISOString(), e;
  }
  /**
   * Static method - render PDF from blueprint (headless)
   * @param {Object} blueprint - JSON Blueprint
   * @param {Object} data - Variable data
   * @returns {string} PDF as data URL
   */
  static renderBlueprint(t, i = {}) {
    const e = new z();
    return e.render(t, i), e.getDataUrl();
  }
  /**
   * Static method - download PDF from blueprint (headless)
   * @param {Object} blueprint - JSON Blueprint
   * @param {string} filename - Output filename
   * @param {Object} data - Variable data
   */
  static downloadBlueprint(t, i = "document.pdf", e = {}) {
    const r = new z();
    r.render(t, e), r.download(i);
  }
};
I(E, "JsPdfService", N);
let L = E;
const V = "2.1.0";
export {
  v as CKEditorParser,
  L as DrawPDF,
  C as FONTS,
  P as FONT_CONFIG,
  N as JsPdfService,
  _ as PAGE,
  z as PDFRenderer,
  R as RichTextTokenizer,
  w as TemplateEngine,
  V as VERSION,
  L as default
};
