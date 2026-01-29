import 'jspdf';
const { jsPDF } = window.jspdf;
import 'jspdf-autotable';
import { FONT_CONFIG } from '../utils/constants.js';

// Ensure window.jspdf exists for font file compatibility
// Font .js files use window.jspdf.jsPDF.API to register themselves
if (typeof window !== 'undefined' && !window.jspdf) {
  window.jspdf = { jsPDF };
}

class JsPdfService {
  /**
   * Create JsPdfService instance
   * @param {Object} fontConfig - Font configuration
   * @param {string} fontConfig.defaultFont - Primary font name (default: 'Roboto')
   * @param {string} fontConfig.fallback - Fallback font name (default: 'helvetica')
   */
  constructor(fontConfig = {}) {
    // Merge with default font config
    this.fontConfig = { ...FONT_CONFIG, ...fontConfig };
    this.defaultFont = this.fontConfig.defaultFont;
    this.fallbackFont = this.fontConfig.fallback;

    this.doc = new jsPDF();
    this.currentY = 20; // Vị trí Y hiện tại để tự động xuống dòng
    this.lineHeight = 1; // Khoảng cách giữa các dòng (giảm từ 7 xuống 4.5)
    this.pageHeight = this.doc.internal.pageSize.height;
    this.pageWidth = this.doc.internal.pageSize.width;
    this.margins = { left: 15, right: 15, top: 20, bottom: 20 };

    // Setup default font
    this._setupDefaultFont();
  }

  /**
   * Setup default font with fallback logic
   * @private
   */
  _setupDefaultFont() {
    try {
      const fonts = this.doc.getFontList();
      if (fonts[this.defaultFont]) {
        this.doc.setFont(this.defaultFont, 'normal');
      } else if (fonts[this.fallbackFont]) {
        console.warn(`Font '${this.defaultFont}' not found, using fallback '${this.fallbackFont}'`);
        this.doc.setFont(this.fallbackFont, 'normal');
        // Update defaultFont to the actual font being used
        this.defaultFont = this.fallbackFont;
      } else {
        console.warn(`Neither '${this.defaultFont}' nor '${this.fallbackFont}' found, using 'helvetica'`);
        this.doc.setFont('helvetica', 'normal');
        this.defaultFont = 'helvetica';
      }
    } catch (error) {
      console.warn('Error setting up font, using helvetica:', error.message);
      this.doc.setFont('helvetica', 'normal');
      this.defaultFont = 'helvetica';
    }
  }

  /**
   * Set font with automatic fallback
   * @param {string} fontName - Font name to use (optional, uses defaultFont if not provided)
   * @param {string} style - Font style: 'normal', 'bold', 'italic', 'bolditalic'
   */
  _setFont(fontName = null, style = 'normal') {
    const targetFont = fontName || this.defaultFont;
    try {
      this.doc.setFont(targetFont, style);
    } catch {
      try {
        this.doc.setFont(this.fallbackFont, style);
      } catch {
        this.doc.setFont('helvetica', style);
      }
    }
  }

  // Kiểm tra và tự động xuống trang
  checkPageBreak(requiredHeight = 10) {
    if (this.currentY + requiredHeight > this.pageHeight - this.margins.bottom) {
      this.addNewPage();
    }
  }

  // Helper: Decode HTML entities
  _decodeHtmlEntities(text) {
    if (!text || typeof text !== 'string') return text;

    // First, replace all non-breaking spaces with standard spaces to avoid font issues
    let result = text.replace(/\u00A0/g, ' ');

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
      '&cent;': '¢',
      '&pound;': '£',
      '&euro;': '€',
      '&yen;': '¥',
      '&sect;': '§',
      '&bull;': '•',
    };

    for (const [entity, char] of Object.entries(entities)) {
      result = result.split(entity).join(char);
    }

    // Handle numeric entities like &#160; &#8217;
    result = result.replace(/&#(\d+);/g, (match, dec) => {
      const charCode = parseInt(dec, 10);
      // Special handling for char 160 (nbsp) -> convert to space 32
      if (charCode === 160) return ' ';
      return String.fromCharCode(charCode);
    });

    result = result.replace(/&#x([0-9a-fA-F]+);/g, (match, hex) => {
      const charCode = parseInt(hex, 16);
      // Special handling for char 160 (nbsp) -> convert to space 32
      if (charCode === 160) return ' ';
      return String.fromCharCode(charCode);
    });

    // Final sweep to ensure no NBSP remains (in case it was introduced by decoding)
    result = result.replace(/\u00A0/g, ' ');

    return result;
  }

  // Wrapper method để vẽ text với auto-decode HTML entities
  _drawText(text, x, y, options = {}) {
    const decodedText = this._decodeHtmlEntities(text);
    this.doc.text(decodedText, x, y, options);
  }

  // Helper: Convert any color format to RGB array [r, g, b]
  _parseColorToArray(color) {
    // Already an array
    if (Array.isArray(color)) {
      return color;
    }

    // Null or undefined -> default black
    if (!color) {
      return [0, 0, 0];
    }

    // Hex color string #RRGGBB or #RGB
    if (typeof color === 'string' && color.startsWith('#')) {
      let hex = color.slice(1);
      if (hex.length === 3) {
        hex = hex[0] + hex[0] + hex[1] + hex[1] + hex[2] + hex[2];
      }
      const r = parseInt(hex.substring(0, 2), 16) || 0;
      const g = parseInt(hex.substring(2, 4), 16) || 0;
      const b = parseInt(hex.substring(4, 6), 16) || 0;
      return [r, g, b];
    }

    // RGB string "rgb(r, g, b)"
    if (typeof color === 'string') {
      const match = color.match(/rgb[a]?\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/i);
      if (match) {
        return [parseInt(match[1]), parseInt(match[2]), parseInt(match[3])];
      }
    }

    // Default black
    return [0, 0, 0];
  }

  // Insert text to PDF với hỗ trợ tiếng Việt và xuống dòng
  addText(text, x = null, y = null, options = {}) {
    // Decode HTML entities
    text = this._decodeHtmlEntities(text);

    // Cấu hình mặc định
    const defaultOptions = {
      fontSize: 12,
      fontStyle: "normal",
      color: [0, 0, 0],
      maxWidth: this.pageWidth - this.margins.left - this.margins.right,
      align: "left",
      lineHeight: this.lineHeight,
    };

    const config = { ...defaultOptions, ...options };
    const xPos = x !== null ? x : this.margins.left;
    const yPos = y !== null ? y : this.currentY;

    // Thiết lập font và màu
    this.doc.setFontSize(config.fontSize);
    this._setFont(null, config.fontStyle);
    this.doc.setTextColor(config.color[0], config.color[1], config.color[2]);

    // Chia text thành các dòng với độ rộng tối đa
    const lines = this.doc.splitTextToSize(text, config.maxWidth);

    // Tính toán chiều cao cần thiết
    const totalHeight = lines.length * config.lineHeight;
    this.checkPageBreak(totalHeight + 5);

    // Vẽ từng dòng
    let currentLineY = this.currentY;
    lines.forEach((line, index) => {
      if (config.align === "center") {
        const textWidth = this.doc.getTextWidth(line);
        const centerX = (this.pageWidth - textWidth) / 2;
        this._drawText(line, centerX, currentLineY);
      } else if (config.align === "right") {
        const textWidth = this.doc.getTextWidth(line);
        const rightX = this.pageWidth - this.margins.right - textWidth;
        this._drawText(line, rightX, currentLineY);
      } else if (config.align === "justify") {
        // Canh đều - chỉ áp dụng cho các dòng không phải dòng cuối
        const isLastLine = index === lines.length - 1;
        if (!isLastLine && line.trim().length > 0) {
          this.drawJustifiedText(line, xPos, currentLineY, config.maxWidth, config);
        } else {
          // Dòng cuối hoặc dòng trống thì canh trái bình thường
          this._drawText(line, xPos, currentLineY);
        }
      } else {
        this._drawText(line, xPos, currentLineY);
      }
      currentLineY += config.lineHeight;
    });

    // Cập nhật vị trí Y với spacing được điều chỉnh
    const defaultSpacing = options.spacing !== undefined ? options.spacing : 1;
    this.currentY = currentLineY + defaultSpacing;

    return this;
  }

  // Hàm vẽ text canh đều (justify)
  drawJustifiedText(text, startX, y, maxWidth, config) {
    const words = text.trim().split(" ");

    // Nếu chỉ có 1 từ thì canh trái bình thường
    if (words.length <= 1) {
      this._drawText(text, startX, y);
      return;
    }

    // Tính tổng độ rộng của các từ
    let totalWordsWidth = 0;
    words.forEach((word) => {
      totalWordsWidth += this.doc.getTextWidth(word);
    });

    // Tính khoảng cách giữa các từ
    const totalSpaces = words.length - 1;
    const availableSpaceWidth = maxWidth - totalWordsWidth;
    const spaceWidth = availableSpaceWidth / totalSpaces;

    // Vẽ từng từ với khoảng cách được tính toán
    let currentX = startX;
    words.forEach((word, index) => {
      this._drawText(word, currentX, y);
      currentX += this.doc.getTextWidth(word);

      // Thêm khoảng cách (trừ từ cuối cùng)
      if (index < words.length - 1) {
        currentX += spaceWidth;
      }
    });
  }

  // Thêm bảng với jspdf-autotable
  addTable(headers, data, options = {}) {
    if (!this.doc.autoTable) {
      console.warn("jspdf-autotable is not loaded");
      return this;
    }

    const startY = options.y !== undefined ? options.y : this.currentY;

    // Build styles from options
    const tableStyles = {
      font: this.defaultFont,
      fontSize: 10,
      cellPadding: 3,
      overflow: 'linebreak'
    };

    // Apply table-level border
    if (options.lineWidth !== undefined) {
      tableStyles.lineWidth = options.lineWidth;
    }
    if (options.lineColor) {
      tableStyles.lineColor = options.lineColor;
    }
    if (options.fillColor) {
      tableStyles.fillColor = options.fillColor;
    }

    // Calculate table position based on alignment
    let tableMargin = {
      top: this.margins.top,
      right: this.margins.right,
      bottom: this.margins.bottom,
      left: this.margins.left
    };

    // Table width and alignment
    let tableWidth = options.tableWidth || 'auto';
    if (options.tableAlign === 'center' && options.tableWidth) {
      const pageContentWidth = this.pageWidth - this.margins.left - this.margins.right;
      const offset = (pageContentWidth - options.tableWidth) / 2;
      tableMargin.left = this.margins.left + offset;
    } else if (options.tableAlign === 'right' && options.tableWidth) {
      const pageContentWidth = this.pageWidth - this.margins.left - this.margins.right;
      const offset = pageContentWidth - options.tableWidth;
      tableMargin.left = this.margins.left + offset;
    }

    // Merge headStyles with defaults
    const headStyles = {
      fillColor: false, // No default - let user control via CKEditor
      textColor: [0, 0, 0],
      // fontStyle: 'bold', // Theo config của CKEditor
      halign: 'center',
      ...(options.headStyles || {})
    };

    const defaultOptions = {
      startY: startY,
      head: [headers],
      body: data,
      theme: 'grid',
      styles: tableStyles,
      headStyles: headStyles,
      columnStyles: {},
      margin: tableMargin,
      tableWidth: typeof tableWidth === 'number' ? tableWidth : 'auto',
      didDrawPage: (data) => {
        this.currentY = data.cursor.y + 5;
      },
      ...options
    };

    this.doc.autoTable(defaultOptions);

    if (this.doc.lastAutoTable) {
      this.currentY = this.doc.lastAutoTable.finalY + 10;
    }

    return this;
  }

  // Thêm tiêu đề với style đặc biệt
  addTitle(title, options = {}) {
    const titleOptions = {
      fontSize: 18,
      fontStyle: "bold",
      color: [0, 0, 0],
      align: "center",
      lineHeight: 7, // Giảm từ 10 xuống 7
      ...options,
    };

    this.addText(title, null, null, titleOptions);
    this.currentY += 3; // Giảm khoảng trống sau tiêu đề từ 5 xuống 3

    return this;
  }

  // Thêm tiêu đề phụ
  addSubTitle(subtitle, options = {}) {
    const subtitleOptions = {
      fontSize: 14,
      fontStyle: "bold",
      color: [0, 0, 0],
      lineHeight: 5.5, // Giảm từ 8 xuống 5.5
      ...options,
    };

    this.addText(subtitle, null, null, subtitleOptions);
    this.currentY += 2; // Giảm từ 3 xuống 2

    return this;
  }

  // Thêm đoạn văn với các option linh hoạt
  addParagraph(paragraph, options = {}) {
    const paragraphOptions = {
      fontSize: 10,
      fontStyle: "normal",
      color: [0, 0, 0],
      lineHeight: 4, // Giảm từ 6 xuống 4
      spacing: 1, // Khoảng cách sau paragraph (thay vì cộng thêm 3)
      ...options,
    };

    this.addText(paragraph, null, null, paragraphOptions);
    // this.currentY += paragraphOptions.spacing; // Chỉ thêm spacing được định nghĩa

    return this;
  }

  // Thêm text với bullet point
  addBulletPoint(text, options = {}) {
    const bulletOptions = {
      fontSize: 11,
      fontStyle: "normal",
      color: [0, 0, 0],
      lineHeight: 4, // Giảm từ 6 xuống 4
      ...options,
    };

    // Thêm bullet
    this.doc.setFontSize(bulletOptions.fontSize);
    this._drawText("•", this.margins.left, this.currentY);

    // Thêm text với indent
    const indentedText = text;
    const textOptions = {
      ...bulletOptions,
      maxWidth: bulletOptions.maxWidth - 10,
    };

    this.addText(indentedText, this.margins.left + 8, this.currentY, textOptions);

    return this;
  }

  // Insert image to PDF với nhiều tính năng
  addImage(imageData, x = null, y = null, width = 100, height = 100, options = {}) {
    const defaultOptions = {
      format: "JPEG",
      align: "left",
      caption: null,
      captionOptions: {
        fontSize: 9,
        fontStyle: "italic",
        color: [100, 100, 100],
      },
      border: false,
      borderOptions: {
        width: 1,
        color: [0, 0, 0],
      },
      compression: "MEDIUM",
      rotation: 0,
      ...options,
    };

    let xPos = x !== null ? x : this.margins.left;
    const yPos = y !== null ? y : this.currentY;

    // Căn chỉnh hình ảnh
    if (defaultOptions.align === "center") {
      xPos = (this.pageWidth - width) / 2;
    } else if (defaultOptions.align === "right") {
      xPos = this.pageWidth - this.margins.right - width;
    }

    // Kiểm tra có đủ chỗ không
    this.checkPageBreak(height + 15);

    try {
      // Auto-detect format từ data URL
      let format = defaultOptions.format;
      if (typeof imageData === "string" && imageData.startsWith("data:")) {
        if (imageData.includes("data:image/png")) format = "PNG";
        else if (imageData.includes("data:image/jpeg") || imageData.includes("data:image/jpg"))
          format = "JPEG";
        else if (imageData.includes("data:image/gif")) format = "GIF";
        else if (imageData.includes("data:image/webp")) format = "WEBP";
      }

      // Thêm hình ảnh với jsPDF addImage
      this.doc.addImage(
        imageData,
        format,
        xPos,
        this.currentY,
        width,
        height,
        "", // alias (để trống)
        defaultOptions.compression,
        defaultOptions.rotation
      );

      // Thêm border nếu cần
      if (defaultOptions.border) {
        this.doc.setLineWidth(defaultOptions.borderOptions.width);
        const borderColor = Array.isArray(defaultOptions.borderOptions.color)
          ? defaultOptions.borderOptions.color
          : [0, 0, 0];
        this.doc.setDrawColor(...borderColor);
        this.doc.rect(xPos, this.currentY, width, height);
      }

      // Cập nhật vị trí Y
      this.currentY += height + 5;

      // Thêm caption nếu có
      if (defaultOptions.caption) {
        this.addText(defaultOptions.caption, null, null, {
          ...defaultOptions.captionOptions,
          align: defaultOptions.align,
        });
      } else {
        this.currentY += 5;
      }
    } catch (error) {
      console.error("Lỗi khi thêm ảnh:", error);
      // Thêm placeholder nếu lỗi
      this.addText(`[Lỗi hiển thị ảnh: ${error.message}]`, xPos, null, {
        fontSize: 10,
        color: [255, 0, 0],
        align: defaultOptions.align,
      });
    }

    return this;
  }

  // Thêm ảnh từ file path
  async addImageFromPath(imagePath, x = null, y = null, width = 100, height = 100, options = {}) {
    try {
      const imageData = await this.loadImageFromPath(imagePath);
      if (imageData) {
        return this.addImage(imageData, x, y, width, height, options);
      } else {
        throw new Error(`Không thể load ảnh từ ${imagePath}`);
      }
    } catch (error) {
      console.error("Lỗi khi thêm ảnh từ path:", error);
      // Thêm placeholder
      this.addText(`[Không thể load ảnh: ${imagePath}]`, x, y, {
        fontSize: 10,
        color: [255, 0, 0],
      });
    }
    return this;
  }

  // Thêm ảnh với auto-resize để fit trong khung
  addImageFit(imageData, x = null, y = null, maxWidth = 150, maxHeight = 150, options = {}) {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => {
        // Tính toán kích thước fit
        let { width, height } = this.calculateFitSize(
          img.naturalWidth,
          img.naturalHeight,
          maxWidth,
          maxHeight
        );

        this.addImage(imageData, x, y, width, height, options);
        resolve(this);
      };
      img.onerror = () => {
        console.error("Không thể load ảnh để tính kích thước");
        this.addImage(imageData, x, y, maxWidth, maxHeight, options);
        resolve(this);
      };
      img.src = imageData;
    });
  }

  // Tính toán kích thước fit
  calculateFitSize(originalWidth, originalHeight, maxWidth, maxHeight) {
    const widthRatio = maxWidth / originalWidth;
    const heightRatio = maxHeight / originalHeight;
    const ratio = Math.min(widthRatio, heightRatio);

    return {
      width: originalWidth * ratio,
      height: originalHeight * ratio,
    };
  }

  // Thêm đường kẻ ngang
  addLine(x1 = null, y1 = null, x2 = null, y2 = null, options = {}) {
    const startX = x1 !== null ? x1 : this.margins.left;
    const startY = y1 !== null ? y1 : this.currentY;
    const endX = x2 !== null ? x2 : this.pageWidth - this.margins.right;
    const endY = y2 !== null ? y2 : startY;

    const lineOptions = {
      lineWidth: 0.5,
      color: [0, 0, 0],
      ...options,
    };

    this.doc.setLineWidth(lineOptions.lineWidth);
    this.doc.setDrawColor(lineOptions.color[0], lineOptions.color[1], lineOptions.color[2]);
    this.doc.line(startX, startY, endX, endY);

    this.currentY = startY + 8;

    return this;
  }

  // Thêm trang mới
  addNewPage() {
    this.doc.addPage();
    this.currentY = this.margins.top;

    // Tự động thêm chữ ký nháy vào trang mới
    this._addSecondarySignaturesToNewPage();

    return this;
  }

  // Thêm khoảng trống
  addSpace(height = 10) {
    this.currentY += height;
    this.checkPageBreak();
    return this;
  }

  // Thêm đường kẻ ngang
  addHorizontalLine(options = {}) {
    const lineOptions = {
      width: options.width || (this.pageWidth - this.margins.left - this.margins.right),
      thickness: options.thickness || 0.5,
      color: options.color || [0, 0, 0],
      marginTop: options.marginTop || 3,
      marginBottom: options.marginBottom || 3,
      ...options
    };

    this.currentY += lineOptions.marginTop;
    this.checkPageBreak(lineOptions.thickness + lineOptions.marginBottom);

    const startX = this.margins.left;
    const endX = startX + lineOptions.width;

    this.doc.setDrawColor(...lineOptions.color);
    this.doc.setLineWidth(lineOptions.thickness);
    this.doc.line(startX, this.currentY, endX, this.currentY);

    this.currentY += lineOptions.thickness + lineOptions.marginBottom;

    return this;
  }

  // Reset vị trí
  resetPosition(y = null) {
    this.currentY = y !== null ? y : this.margins.top;
    return this;
  }

  // Lấy vị trí hiện tại
  getCurrentY() {
    return this.currentY;
  }

  // Thêm header cho tất cả trang
  addHeader(text, options = {}) {
    const headerOptions = {
      fontSize: 10,
      fontStyle: "normal",
      align: "center", // "left", "center", "right"
      color: [0, 0, 0], // Màu text [R, G, B]
      y: 10,
      ...options,
    };

    const totalPages = this.doc.internal.getNumberOfPages();
    const currentPage = this.doc.internal.getCurrentPageInfo().pageNumber;

    // Lưu màu text hiện tại
    const originalTextColor = this.doc.internal.getCurrentPageInfo().color || [0, 0, 0];

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(headerOptions.fontSize);

      // Thiết lập màu text
      this.doc.setTextColor(headerOptions.color[0], headerOptions.color[1], headerOptions.color[2]);

      this._setFont(null, headerOptions.fontStyle);

      let xPos;
      const textWidth = this.doc.getTextWidth(text);

      if (headerOptions.align === "center") {
        xPos = (this.pageWidth - textWidth) / 2;
      } else if (headerOptions.align === "right") {
        xPos = this.pageWidth - this.margins.right - textWidth;
      } else {
        // left alignment (default)
        xPos = this.margins.left;
      }

      this._drawText(text, xPos, headerOptions.y);
    }

    // Khôi phục màu text gốc
    this.doc.setTextColor(originalTextColor[0] || 0, originalTextColor[1] || 0, originalTextColor[2] || 0);

    // Quay lại trang hiện tại
    this.doc.setPage(currentPage);

    return this;
  }

  // Thêm footer cho tất cả trang
  addFooter(text, options = {}) {
    const footerOptions = {
      fontSize: 8,
      fontStyle: "normal",
      align: "center",
      y: this.pageHeight - 10,
      color: [0, 0, 0], // Thêm màu đen mặc định
      ...options,
    };

    const totalPages = this.doc.internal.getNumberOfPages();
    const currentPage = this.doc.internal.getCurrentPageInfo().pageNumber;

    for (let i = 1; i <= totalPages; i++) {
      this.doc.setPage(i);
      this.doc.setFontSize(footerOptions.fontSize);
      this._setFont(null, footerOptions.fontStyle);

      // Thêm thiết lập màu
      const footerColor = Array.isArray(footerOptions.color) ? footerOptions.color : [0, 0, 0];
      this.doc.setTextColor(footerColor[0], footerColor[1], footerColor[2]);

      const footerText = text.replace("{pageNumber}", i).replace("{totalPages}", totalPages);

      if (footerOptions.align === "center") {
        const textWidth = this.doc.getTextWidth(footerText);
        const centerX = (this.pageWidth - textWidth) / 2;
        this._drawText(footerText, centerX, footerOptions.y);
      } else if (footerOptions.align === "right") {
        const textWidth = this.doc.getTextWidth(footerText);
        this._drawText(footerText, this.pageWidth - this.margins.right - textWidth, footerOptions.y);
      } else {
        this._drawText(footerText, this.margins.left, footerOptions.y);
      }
    }

    // Quay lại trang hiện tại
    this.doc.setPage(currentPage);

    return this;
  }

  // Save PDF
  savePDF(filename = "document.pdf") {
    try {
      this.doc.save(filename);
      console.log(`PDF đã được lưu: ${filename}`);
    } catch (error) {
      console.error("Lỗi khi lưu PDF:", error);
    }
  }

  // Gen blob PDF
  generateBlob() {
    try {
      return this.doc.output("blob");
    } catch (error) {
      console.error("Lỗi khi tạo blob:", error);
      return null;
    }
  }

  // Tạo Data URL
  generateDataURL() {
    try {
      return this.doc.output("dataurlstring");
    } catch (error) {
      console.error("Lỗi khi tạo data URL:", error);
      return null;
    }
  }

  // Preview PDF
  previewPDF() {
    try {
      const pdfDataUrl = this.doc.output("dataurlstring");
      window.open(pdfDataUrl, "_blank");
    } catch (error) {
      console.error("Lỗi khi preview PDF:", error);
    }
  }

  // Export PDF thành File để upload lên server
  exportPDFFile(filename = "document.pdf") {
    try {
      const pdfBlob = this.doc.output("blob");
      const file = new File([pdfBlob], filename, {
        type: "application/pdf",
        lastModified: Date.now(),
      });

      console.log(`PDF file đã được tạo: ${filename}, Size: ${file.size} bytes`);
      return file;
    } catch (error) {
      console.error("Lỗi khi tạo PDF file:", error);
      return null;
    }
  }

  // Export PDF thành ArrayBuffer để upload
  exportPDFArrayBuffer() {
    try {
      const arrayBuffer = this.doc.output("arraybuffer");
      console.log(`PDF ArrayBuffer đã được tạo, Size: ${arrayBuffer.byteLength} bytes`);
      return arrayBuffer;
    } catch (error) {
      console.error("Lỗi khi tạo PDF ArrayBuffer:", error);
      return null;
    }
  }

  // Export PDF với nhiều format khác nhau
  exportPDF(format = "file", filename = "document.pdf") {
    try {
      switch (format.toLowerCase()) {
        case "file":
          return this.exportPDFFile(filename);

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
          console.warn(`Format không hỗ trợ: ${format}. Sử dụng format 'file' mặc định.`);
          return this.exportPDFFile(filename);
      }
    } catch (error) {
      console.error(`Lỗi khi export PDF với format ${format}:`, error);
      return null;
    }
  }

  // Upload PDF lên server (hàm tiện ích)
  async uploadPDFToServer(url, filename = "document.pdf", options = {}) {
    try {
      const file = this.exportPDFFile(filename);
      if (!file) {
        throw new Error("Không thể tạo PDF file");
      }

      const formData = new FormData();
      formData.append(options.fieldName || "pdf", file);

      // Thêm các field khác nếu có
      if (options.additionalData) {
        Object.keys(options.additionalData).forEach((key) => {
          formData.append(key, options.additionalData[key]);
        });
      }

      const uploadOptions = {
        method: "POST",
        body: formData,
        ...options.fetchOptions,
      };

      console.log(`Đang upload PDF tới: ${url}`);
      const response = await fetch(url, uploadOptions);

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const result = await response.json();
      console.log("Upload thành công:", result);
      return result;
    } catch (error) {
      console.error("Lỗi khi upload PDF:", error);
      throw error;
    }
  }

  // Thêm chữ ký đẹp mắt với nội dung căn giữa theo khối
  addSignature(name, title, date = null, options = {}) {
    const signatureOptions = {
      align: "right",
      fontSize: 11,
      titleFontSize: 10,
      nameFontSize: 12,
      spacing: 8,
      signatureHeight: 20,
      blockWidth: 100, // Độ rộng khối chữ ký
      ...options,
    };

    const currentDate = date || new Date().toLocaleDateString("vi-VN");

    // Tính vị trí X của khối chữ ký
    let blockX;
    if (signatureOptions.align === "right") {
      blockX = this.pageWidth - this.margins.right - signatureOptions.blockWidth;
    } else if (signatureOptions.align === "center") {
      blockX = (this.pageWidth - signatureOptions.blockWidth) / 2;
    } else {
      blockX = this.margins.left;
    }

    // Tính X căn giữa trong khối
    const centerX = blockX + signatureOptions.blockWidth / 2;

    // Ngày tháng - căn giữa trong khối
    this.doc.setFontSize(signatureOptions.fontSize);
    try {
      this._setFont(null, "normal");
    } catch {
      this.doc.setFont("helvetica", "normal");
    }
    this.doc.setTextColor(0, 0, 0);

    const dateWidth = this.doc.getTextWidth(currentDate);
    const dateX = centerX - dateWidth / 2;
    this._drawText(currentDate, dateX, this.currentY);
    this.currentY += signatureOptions.spacing;

    // Tiêu đề chức vụ - căn giữa trong khối
    this.doc.setFontSize(signatureOptions.titleFontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }

    const titleWidth = this.doc.getTextWidth(title);
    const titleX = centerX - titleWidth / 2;
    this._drawText(title, titleX, this.currentY);
    this.currentY += 5;

    // Ghi chú ký tên - căn giữa trong khối
    const noteText = "(Ký và ghi rõ họ tên)";
    this.doc.setFontSize(9);
    try {
      this._setFont(null, "italic");
    } catch {
      this.doc.setFont("helvetica", "italic");
    }
    this.doc.setTextColor(100, 100, 100);

    const noteWidth = this.doc.getTextWidth(noteText);
    const noteX = centerX - noteWidth / 2;
    this._drawText(noteText, noteX, this.currentY);
    this.currentY += signatureOptions.spacing;

    // Vùng trống cho chữ ký
    this.addSpace(signatureOptions.signatureHeight);

    // Tên người ký - căn giữa trong khối
    this.doc.setFontSize(signatureOptions.nameFontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }
    this.doc.setTextColor(0, 0, 0);

    const nameWidth = this.doc.getTextWidth(name);
    const nameX = centerX - nameWidth / 2;
    this._drawText(name, nameX, this.currentY);
    this.currentY += 15;

    return this;
  }

  // Load hình từ file path
  async loadImageFromPath(imagePath) {
    try {
      const response = await fetch(imagePath);
      if (!response.ok) throw new Error(`Không thể load hình từ ${imagePath}`);

      const blob = await response.blob();
      return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = function (e) {
          resolve(e.target.result);
        };
        reader.onerror = function (e) {
          reject(new Error("Lỗi khi đọc file"));
        };
        reader.readAsDataURL(blob);
      });
    } catch (error) {
      console.warn(`Không thể load hình từ ${imagePath}:`, error.message);
      return null;
    }
  }

  // Thêm chữ ký có hình ảnh với nội dung căn giữa theo khối
  async addSignatureWithImage(name, title, imageSource, date = null, options = {}) {
    const signatureOptions = {
      align: "right",
      fontSize: 11,
      titleFontSize: 10,
      nameFontSize: 12,
      dateFontSize: 10,
      spacing: 8,
      imageWidth: 60,
      imageHeight: 20,
      blockWidth: 100, // Độ rộng khối chữ ký
      ...options,
    };

    const currentDate = date || new Date().toLocaleDateString("vi-VN");

    // Tính vị trí X của khối chữ ký
    let blockX;
    if (signatureOptions.align === "right") {
      blockX = this.pageWidth - this.margins.right - signatureOptions.blockWidth;
    } else if (signatureOptions.align === "center") {
      blockX = (this.pageWidth - signatureOptions.blockWidth) / 2;
    } else {
      blockX = this.margins.left;
    }

    // Tính X căn giữa trong khối
    const centerX = blockX + signatureOptions.blockWidth / 2;

    // Ngày tháng - căn giữa trong khối
    this.doc.setFontSize(signatureOptions.fontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }
    this.doc.setTextColor(0, 0, 0);

    this.doc.setFontSize(signatureOptions.dateFontSize);
    const decodedDate = this._decodeHtmlEntities(currentDate);
    const dateWidth = this.doc.getTextWidth(decodedDate);
    const dateX = centerX - dateWidth / 2;
    this._drawText(decodedDate, dateX, this.currentY);
    this.currentY += signatureOptions.spacing;

    // Tiêu đề chức vụ - căn giữa trong khối
    this.doc.setFontSize(signatureOptions.titleFontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }

    const decodedTitle = this._decodeHtmlEntities(title);
    const titleWidth = this.doc.getTextWidth(decodedTitle);
    const titleX = centerX - titleWidth / 2;
    this._drawText(decodedTitle, titleX, this.currentY);
    this.currentY += 5;

    // Ghi chú ký tên - căn giữa trong khối
    const noteText = signatureOptions.noteText ?? "(Ký và ghi rõ họ tên)";
    this.doc.setFontSize(9);
    try {
      this._setFont(null, "italic");
    } catch {
      this.doc.setFont("helvetica", "italic");
    }
    this.doc.setTextColor(100, 100, 100);

    const decodedNoteText = this._decodeHtmlEntities(noteText);
    const noteWidth = this.doc.getTextWidth(decodedNoteText);
    const noteX = centerX - noteWidth / 2;
    this._drawText(decodedNoteText, noteX, this.currentY);
    this.currentY += signatureOptions.spacing;

    this.addSpace(5);

    // Xử lý imageSource (có thể là path hoặc data)
    let imageData = null;

    if (imageSource) {
      if (typeof imageSource === "string") {
        // Nếu là string, kiểm tra xem là path hay data URL
        if (imageSource.startsWith("data:")) {
          // Là data URL
          imageData = imageSource;
        } else {
          // Là file path, load từ path
          imageData = await this.loadImageFromPath(imageSource);
        }
      } else {
        // Đã là imageData
        imageData = imageSource;
      }
    }

    // Thêm hình chữ ký - căn giữa trong khối
    if (imageData) {
      const imageX = centerX - signatureOptions.imageWidth / 2;

      this.addImage(
        imageData,
        imageX,
        this.currentY,
        signatureOptions.imageWidth,
        signatureOptions.imageHeight,
        {
          format: "JPEG",
        }
      );
    } else if (signatureOptions.nameTag && signatureOptions.nameTag.trim()) {
      // Không có đường dẫn chữ ký - ghi chìm nameTag màu trắng
      const originalTextColor = this.doc.internal.getCurrentPageInfo().color || [0, 0, 0];
      this.doc.setTextColor(255, 255, 255); // Màu trắng (chìm)
      this.doc.setFontSize(9);
      try {
        this._setFont(null, "italic");
      } catch {
        this.doc.setFont("helvetica", "italic");
      }
      const decodedNameTag = this._decodeHtmlEntities(signatureOptions.nameTag);
      const nameTagWidth = this.doc.getTextWidth(decodedNameTag);
      const nameTagX = centerX - nameTagWidth / 2;
      this._drawText(decodedNameTag, nameTagX, this.currentY + signatureOptions.imageHeight / 2);
      this.doc.setTextColor(
        originalTextColor[0] || 0,
        originalTextColor[1] || 0,
        originalTextColor[2] || 0
      ); // Khôi phục màu gốc
      this.addSpace(signatureOptions.imageHeight + 10);
    } else {
      // Nếu không có hình và không có nameTag, tạo vùng trống
      this.addSpace(signatureOptions.imageHeight + 10);
    }

    // Tên người ký - căn giữa trong khối
    this.doc.setFontSize(signatureOptions.nameFontSize);
    try {
      this._setFont(null, "bold");
    } catch {
      this.doc.setFont("helvetica", "bold");
    }
    this.doc.setTextColor(0, 0, 0);

    const decodedName = this._decodeHtmlEntities(name);
    const nameWidth = this.doc.getTextWidth(decodedName);
    const nameX = centerX - nameWidth / 2;
    this._drawText(decodedName, nameX, this.currentY);
    this.currentY += 15;

    return this;
  }

  // Thêm chữ ký từ file path (phương thức tiện lợi)
  async addSignatureFromFile(name, title, imagePath, date = null, options = {}) {
    return await this.addSignatureWithImage(name, title, imagePath, date, options);
  }

  // Thêm chữ ký với nhiều tùy chọn hình ảnh
  async addSmartSignature(name, title, imageOptions = {}, date = null, options = {}) {
    const {
      imagePath = null,
      imageData = null,
      fallbackText = null,
      createFallback = true,
    } = imageOptions;

    let finalImageData = null;

    // Thử load từ path trước
    if (imagePath) {
      finalImageData = await this.loadImageFromPath(imagePath);
    }

    // Nếu không được, dùng imageData
    if (!finalImageData && imageData) {
      finalImageData = imageData;
    }

    // Nếu vẫn không có và cho phép tạo fallback
    if (!finalImageData && createFallback) {
      finalImageData = this.createTextSignature(fallbackText || name);
    }

    return await this.addSignatureWithImage(name, title, finalImageData, date, options);
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
  addSecondarySignature(options = {}) {
    const defaultOptions = {
      imageData: null,
      nameTag: "Secondary Signature",
      positions: ["top-right"],
      width: 15,
      height: 15,
      margin: 5,
      fontSize: 8,
      showPageNumber: false,
    };

    const config = { ...defaultOptions, ...options };

    // Validate positions
    const validPositions = ["top-left", "top-right", "bottom-left", "bottom-right"];
    const positions = Array.isArray(config.positions) ? config.positions : [config.positions];
    const filteredPositions = positions.filter((pos) => validPositions.includes(pos));

    if (filteredPositions.length === 0) {
      console.warn("No valid positions provided for secondary signature");
      return this;
    }

    // Lưu cấu hình để áp dụng cho tất cả các trang
    if (!this.secondarySignatures) {
      this.secondarySignatures = [];
    }

    this.secondarySignatures.push({
      imageData: config.imageData,
      nameTag: config.nameTag,
      positions: filteredPositions,
      width: config.width,
      height: config.height,
      margin: config.margin,
      fontSize: config.fontSize,
      showPageNumber: config.showPageNumber,
    });

    // Áp dụng chữ ký nháy cho tất cả các trang hiện có
    const totalPages = this.doc.internal.getNumberOfPages();
    for (let pageNum = 1; pageNum <= totalPages; pageNum++) {
      this.doc.setPage(pageNum);
      this._renderSecondarySignature(config, pageNum);
    }

    return this;
  }

  /**
   * Render chữ ký nháy ở các vị trí đã chọn (internal method)
   * @private
   */
  _renderSecondarySignature(config, pageNum = null) {
    const pageWidth = this.doc.internal.pageSize.width;
    const pageHeight = this.doc.internal.pageSize.height;

    // Lấy số trang hiện tại nếu không được truyền vào
    if (pageNum === null) {
      pageNum = this.doc.internal.getCurrentPageInfo().pageNumber;
    }

    for (const position of config.positions) {
      let x, y;

      // Tính toán vị trí dựa trên position
      switch (position) {
        case "top-left":
          x = config.margin;
          y = config.margin;
          break;
        case "top-right":
          x = pageWidth - config.width - config.margin;
          y = config.margin;
          break;
        case "bottom-left":
          x = config.margin;
          y = pageHeight - config.height - config.margin;
          break;
        case "bottom-right":
          x = pageWidth - config.width - config.margin;
          y = pageHeight - config.height - config.margin;
          break;
        default:
          continue;
      }

      // Render hình ảnh hoặc nameTag
      if (config.imageData) {
        // Có hình - hiển thị hình ảnh
        try {
          this.doc.addImage(
            config.imageData,
            "PNG",
            x,
            y,
            config.width,
            config.height
          );
        } catch (error) {
          console.warn("Failed to add secondary signature image:", error);
          // Fallback to nameTag if image fails
          this._renderSecondarySignatureNameTag(x, y, config, pageNum);
        }
      } else {
        // Không có hình - hiển thị nameTag dạng watermark
        this._renderSecondarySignatureNameTag(x, y, config, pageNum);
      }
    }
  }

  /**
   * Render nameTag dạng watermark cho chữ ký nháy (internal method)
   * @private
   */
  _renderSecondarySignatureNameTag(x, y, config, pageNum) {
    // Lưu trạng thái hiện tại
    const originalColor = this.doc.getTextColor();
    const originalFontSize = this.doc.internal.getFontSize();
    const originalFont = this.doc.getFont();

    // Set style cho watermark
    this.doc.setTextColor(154, 166, 178); // Màu trắng
    this.doc.setFontSize(config.fontSize);

    try {
      this._setFont(null, "italic");
    } catch {
      this.doc.setFont("helvetica", "italic");
    }

    // Tạo text với hoặc không có số trang
    let displayText = config.nameTag;
    if (config.showPageNumber && pageNum) {
      displayText = `${config.nameTag}_${pageNum}`;
    }

    // Tính toán vị trí text (căn giữa trong vùng chữ ký)
    const decodedDisplayText = this._decodeHtmlEntities(displayText);
    const textWidth = this.doc.getTextWidth(decodedDisplayText);
    const textX = x + (config.width - textWidth);
    const textY = y + config.height / 2 + config.fontSize / 2 + 3; // Căn giữa theo chiều dọc

    // Vẽ text
    this._drawText(decodedDisplayText, textX, textY);

    // Khôi phục trạng thái
    this.doc.setTextColor(originalColor);
    this.doc.setFontSize(originalFontSize);
    this.doc.setFont(originalFont.fontName, originalFont.fontStyle);
  }

  /**
   * Override addPage để tự động thêm chữ ký nháy vào trang mới
   */
  _addSecondarySignaturesToNewPage() {
    if (this.secondarySignatures && this.secondarySignatures.length > 0) {
      for (const config of this.secondarySignatures) {
        this._renderSecondarySignature(config);
      }
    }
  }

  // Tạo chữ ký text đơn giản
  createTextSignature(text, width = 120, height = 40) {
    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    canvas.width = width;
    canvas.height = height;

    // Nền trắng
    ctx.fillStyle = "white";
    ctx.fillRect(0, 0, width, height);

    // Viết chữ ký
    ctx.fillStyle = "#1a5490";
    ctx.font = 'italic bold 14px cursive, "Times New Roman", serif';

    // Căn giữa text
    const decodedText = this._decodeHtmlEntities(text);
    const textWidth = ctx.measureText(decodedText).width;
    const x = (width - textWidth) / 2;
    const y = height / 2 + 5;

    ctx.fillText(decodedText, x, y);

    // Thêm đường gạch dưới
    ctx.strokeStyle = "#1a5490";
    ctx.lineWidth = 1.5;
    ctx.beginPath();
    ctx.moveTo(x - 5, y + 8);
    ctx.lineTo(x + textWidth + 5, y + 8);
    ctx.stroke();

    return canvas.toDataURL("image/png");
  }

  // Thêm chữ ký đơn giản với đường gạch
  addSimpleSignature(name, title, x = null, options = {}) {
    const sigOptions = {
      fontSize: 11,
      lineWidth: 100,
      spacing: 8,
      ...options,
    };

    const xPos = x || this.margins.left;

    // Tiêu đề
    this.addText(title, xPos, null, {
      fontSize: sigOptions.fontSize,
      fontStyle: "bold",
    });

    this.addSpace(sigOptions.spacing);

    // Đường kẻ cho chữ ký
    this.doc.setLineWidth(0.5);
    this.doc.line(xPos, this.currentY, xPos + sigOptions.lineWidth, this.currentY);

    this.addSpace(5);

    // Tên
    this.addText(name, xPos, null, {
      fontSize: sigOptions.fontSize - 1,
    });

    this.addSpace(15);

    return this;
  }

  // Tạo bố cục chữ ký hai cột với nội dung căn giữa theo khối
  addDualSignature(leftSig, rightSig) {
    const blockWidth = 90;
    const leftBlockX = this.margins.left;
    const rightBlockX = this.pageWidth / 2 + 10;
    const leftCenterX = leftBlockX + blockWidth / 2;
    const rightCenterX = rightBlockX + blockWidth / 2;

    // Lưu vị trí Y ban đầu
    const originalY = this.currentY;

    // Chữ ký bên trái - căn giữa trong khối
    this.currentY = originalY;

    // Date trái - hỗ trợ mixed text
    const leftDate = leftSig.date || "";
    this.renderCenteredText(leftDate, leftCenterX, this.currentY, 11, "normal");
    this.currentY += 8;

    // Title trái - hỗ trợ mixed text
    this.renderCenteredText(leftSig.title, leftCenterX, this.currentY, 10, "bold");
    this.currentY += 5;

    // Note trái
    const leftNote = leftSig.note || "(Ký và ghi rõ họ tên)";
    this.renderCenteredText(leftNote, leftCenterX, this.currentY, 9, "italic", [100, 100, 100]);
    this.currentY += 25;
    // Xử lý chữ ký trái - thêm image hoặc nameTag
    if (leftSig.signaturePath && leftSig.signaturePath.trim()) {
      // Có đường dẫn chữ ký - thêm ảnh chữ ký
      try {
        this.doc.addImage(
          leftSig.signaturePath,
          "PNG",
          leftCenterX - 15,
          this.currentY - 20,
          30,
          15
        );
      } catch (error) {
        console.warn("Không thể thêm chữ ký trái:", error);
      }
    } else if (leftSig.nameTag && leftSig.nameTag.trim()) {
      // Không có đường dẫn chữ ký - ghi chìm nameTag màu trắng
      const originalTextColor = this.doc.internal.getCurrentPageInfo().color || [0, 0, 0];
      this.doc.setTextColor(255, 255, 255); // Màu trắng (chìm)
      const decodedNameTag = this._decodeHtmlEntities(leftSig.nameTag);
      this._drawText(decodedNameTag, leftCenterX - this.doc.getTextWidth(decodedNameTag) / 2, this.currentY - 15);
      this.doc.setTextColor(
        originalTextColor[0] || 0,
        originalTextColor[1] || 0,
        originalTextColor[2] || 0
      ); // Khôi phục màu gốc
    }

    // Name trái - hỗ trợ mixed text
    this.renderCenteredText(leftSig.name, leftCenterX, this.currentY, 11, "bold");

    const leftEndY = this.currentY;

    // Chữ ký bên phải - căn giữa trong khối
    this.currentY = originalY;

    // Date phải - hỗ trợ mixed text
    const rightDate = rightSig.date || "";
    this.renderCenteredText(rightDate, rightCenterX, this.currentY, 11, "normal");
    this.currentY += 8;

    // Title phải - hỗ trợ mixed text
    this.renderCenteredText(rightSig.title, rightCenterX, this.currentY, 10, "bold");
    this.currentY += 5;

    // Note phải
    const rightNote = rightSig.note || "(Ký và ghi rõ họ tên)";
    this.renderCenteredText(rightNote, rightCenterX, this.currentY, 9, "italic", [100, 100, 100]);
    this.currentY += 25;

    // Xử lý chữ ký phải - thêm image hoặc nameTag
    if (rightSig.signaturePath && rightSig.signaturePath.trim()) {
      // Có đường dẫn chữ ký - thêm ảnh chữ ký
      try {
        this.doc.addImage(
          rightSig.signaturePath,
          "PNG",
          rightCenterX - 15,
          this.currentY - 20,
          30,
          15
        );
      } catch (error) {
        console.warn("Không thể thêm chữ ký phải:", error);
      }
    } else if (rightSig.nameTag && rightSig.nameTag.trim()) {
      // Không có đường dẫn chữ ký - ghi chìm nameTag màu trắng
      const originalTextColor = this.doc.internal.getCurrentPageInfo().color || [0, 0, 0];
      this.doc.setTextColor(255, 255, 255); // Màu trắng (chìm)
      const decodedNameTag = this._decodeHtmlEntities(rightSig.nameTag);
      this._drawText(decodedNameTag, rightCenterX - this.doc.getTextWidth(decodedNameTag) / 2, this.currentY - 15);
      this.doc.setTextColor(
        originalTextColor[0] || 0,
        originalTextColor[1] || 0,
        originalTextColor[2] || 0
      ); // Khôi phục màu gốc
    }

    // Name phải - hỗ trợ mixed text
    this.renderCenteredText(rightSig.name, rightCenterX, this.currentY, 11, "bold");

    // Điều chỉnh Y về vị trí thấp nhất
    this.currentY = Math.max(leftEndY, this.currentY) + 10;

    return this;
  }

  // Hàm helper để render text căn giữa (hỗ trợ cả text và mixed text)
  renderCenteredText(content, centerX, y, fontSize = 11, fontStyle = "normal", color = [0, 0, 0]) {
    // Kiểm tra nếu content là mixed text (array hoặc object có thuộc tính text)
    if (Array.isArray(content)) {
      // Xử lý mixed text array
      const tempY = this.currentY;
      this.currentY = y;

      // Tính tổng độ rộng để căn giữa
      let totalWidth = 0;
      content.forEach((part) => {
        let text = typeof part === "string" ? part : part.text;
        // Decode text
        text = this._decodeHtmlEntities(text);

        const partFontSize = typeof part === "object" && part.fontSize ? part.fontSize : fontSize;
        const partStyle = typeof part === "object" && part.style ? part.style : fontStyle;

        this.doc.setFontSize(partFontSize);
        this._setFont(null, partStyle);
        totalWidth += this.doc.getTextWidth(text);
      });

      // Vẽ mixed text căn giữa
      let currentX = centerX - totalWidth / 2;
      content.forEach((part) => {
        const text = typeof part === "string" ? part : part.text;
        const partFontSize = typeof part === "object" && part.fontSize ? part.fontSize : fontSize;
        const partStyle = typeof part === "object" && part.style ? part.style : fontStyle;
        const partColor = typeof part === "object" && part.color ? part.color : color;

        this.doc.setFontSize(partFontSize);
        this._setFont(null, partStyle);
        this.doc.setTextColor(partColor[0], partColor[1], partColor[2]);

        this._drawText(text, currentX, y);
        currentX += this.doc.getTextWidth(text);
      });

      this.currentY = tempY;
    } else if (typeof content === "object" && content.text) {
      // Xử lý single text part object
      const text = content.text;
      const partFontSize = content.fontSize || fontSize;
      const partStyle = content.style || fontStyle;
      const partColor = content.color || color;

      this.doc.setFontSize(partFontSize);
      this._setFont(null, partStyle);
      this.doc.setTextColor(partColor[0], partColor[1], partColor[2]);

      // Decode trước khi tính width và draw
      const decodedText = this._decodeHtmlEntities(text);
      const textWidth = this.doc.getTextWidth(decodedText);
      this._drawText(decodedText, centerX - textWidth / 2, y);
    } else {
      // Xử lý text đơn giản
      let text = content.toString();
      text = this._decodeHtmlEntities(text); // Decode

      this.doc.setFontSize(fontSize);
      this._setFont(null, fontStyle);
      this.doc.setTextColor(color[0], color[1], color[2]);

      const textWidth = this.doc.getTextWidth(text);
      this._drawText(text, centerX - textWidth / 2, y);
    }
  }

  // Thêm leader dots (dấu chấm dẫn)
  addLeaderDots(leftText, rightText, options = {}) {
    // Decode text trước
    leftText = this._decodeHtmlEntities(leftText);
    rightText = this._decodeHtmlEntities(rightText);

    const leaderOptions = {
      fontSize: 11,
      fontStyle: "normal",
      color: [0, 0, 0],
      dotChar: ".",
      dotSpacing: 3, // Khoảng cách giữa các dấu chấm
      minDots: 3, // Số chấm tối thiểu
      leftPadding: 5, // Khoảng cách sau text trái
      rightPadding: 5, // Khoảng cách trước text phải
      lineHeight: 6,
      ...options,
    };

    // Thiết lập font
    this.doc.setFontSize(leaderOptions.fontSize);
    this._setFont(null, leaderOptions.fontStyle);
    const leaderColor = Array.isArray(leaderOptions.color) ? leaderOptions.color : [0, 0, 0];
    this.doc.setTextColor(...leaderColor);

    // Tính toán vị trí
    const leftTextWidth = this.doc.getTextWidth(leftText);
    const rightTextWidth = this.doc.getTextWidth(rightText);
    const dotWidth = this.doc.getTextWidth(leaderOptions.dotChar);

    const leftX = this.margins.left;
    const rightX = this.pageWidth - this.margins.right - rightTextWidth;
    const leftEndX = leftX + leftTextWidth + leaderOptions.leftPadding;
    const rightStartX = rightX - leaderOptions.rightPadding;

    // Tính số lượng chấm
    const availableWidth = rightStartX - leftEndX;
    const dotsCount = Math.max(
      leaderOptions.minDots,
      Math.floor(availableWidth / (dotWidth + leaderOptions.dotSpacing))
    );

    // Kiểm tra page break
    this.checkPageBreak(leaderOptions.lineHeight + 3);

    // Vẽ text trái
    this._drawText(leftText, leftX, this.currentY);

    // Vẽ các dấu chấm
    let dotX = leftEndX;
    for (let i = 0; i < dotsCount; i++) {
      if (dotX + dotWidth <= rightStartX) {
        this._drawText(leaderOptions.dotChar, dotX, this.currentY);
        dotX += dotWidth + leaderOptions.dotSpacing;
      }
    }

    // Vẽ text phải
    this._drawText(rightText, rightX, this.currentY);

    this.currentY += leaderOptions.lineHeight;

    return this;
  }

  // Thêm table of contents với leader dots
  addTableOfContents(items, options = {}) {
    const tocOptions = {
      title: "MỤC LỤC",
      titleOptions: {
        fontSize: 16,
        fontStyle: "bold",
        align: "center",
      },
      itemOptions: {
        fontSize: 11,
        fontStyle: "normal",
        indent: 0,
      },
      subItemOptions: {
        fontSize: 10,
        fontStyle: "normal",
        indent: 15,
      },
      ...options,
    };

    // Thêm tiêu đề mục lục
    if (tocOptions.title) {
      this.addText(tocOptions.title, null, null, tocOptions.titleOptions);
      this.addSpace(10);
    }

    // Thêm các mục
    items.forEach((item) => {
      let itemText = typeof item === "string" ? item : item.title;
      // Decode text
      itemText = this._decodeHtmlEntities(itemText);
      const pageNum = typeof item === "object" ? item.page : "";
      const isSubItem = typeof item === "object" && item.isSubItem;

      const itemOpts = isSubItem ? tocOptions.subItemOptions : tocOptions.itemOptions;
      const leftPadding = itemOpts.indent || 0;

      // Tạo text với indent
      const paddedText = " ".repeat(leftPadding / 3) + itemText;

      this.addLeaderDots(paddedText, pageNum.toString(), {
        ...itemOpts,
        leftPadding: 5,
        rightPadding: 5,
      });
    });

    return this;
  }

  // Thêm price list với leader dots
  addPriceList(items, options = {}) {
    const priceOptions = {
      title: "BẢNG GIÁ",
      titleOptions: {
        fontSize: 16,
        fontStyle: "bold",
        align: "center",
      },
      itemOptions: {
        fontSize: 11,
        fontStyle: "normal",
      },
      currency: "VNĐ",
      ...options,
    };

    // Thêm tiêu đề
    if (priceOptions.title) {
      this.addText(priceOptions.title, null, null, priceOptions.titleOptions);
      this.addSpace(10);
    }

    // Thêm các mục giá
    items.forEach((item) => {
      const itemName = item.name || item.title;
      const price = item.price || item.cost || 0;
      // Decode itemName và priceText
      const decodedItemName = this._decodeHtmlEntities(itemName);
      const priceText = this.formatPrice(price, priceOptions.currency);
      const decodedPriceText = this._decodeHtmlEntities(priceText);

      this.addLeaderDots(decodedItemName, decodedPriceText, {
        ...priceOptions.itemOptions,
        leftPadding: 8,
        rightPadding: 8,
      });
    });

    return this;
  }

  // Thêm menu với leader dots
  addMenu(sections, options = {}) {
    const menuOptions = {
      title: "THỰC ĐƠN",
      titleOptions: {
        fontSize: 18,
        fontStyle: "bold",
        align: "center",
        color: [139, 0, 0],
      },
      sectionOptions: {
        fontSize: 14,
        fontStyle: "bold",
        color: [0, 0, 139],
      },
      itemOptions: {
        fontSize: 11,
        fontStyle: "normal",
      },
      currency: "VNĐ",
      ...options,
    };

    // Thêm tiêu đề menu
    if (menuOptions.title) {
      this.addText(menuOptions.title, null, null, menuOptions.titleOptions);
      this.addSpace(15);
    }

    // Thêm các section
    sections.forEach((section) => {
      // Tên section
      this.addText(section.name, null, null, menuOptions.sectionOptions);
      this.addSpace(8);

      // Các món trong section
      section.items.forEach((item) => {
        const dishName = `${item.name}${item.description ? ` - ${item.description}` : ""}`;
        const priceText = this.formatPrice(item.price, menuOptions.currency);

        // Decode texts
        const decodedDishName = this._decodeHtmlEntities(dishName);
        const decodedPriceText = this._decodeHtmlEntities(priceText);

        this.addLeaderDots(decodedDishName, decodedPriceText, {
          ...menuOptions.itemOptions,
          leftPadding: 10,
          rightPadding: 10,
          dotChar: ".",
          dotSpacing: 2,
        });
      });

      this.addSpace(12);
    });

    return this;
  }

  // Thêm index với leader dots
  addIndex(entries, options = {}) {
    const indexOptions = {
      title: "CHỈ MỤC",
      titleOptions: {
        fontSize: 16,
        fontStyle: "bold",
        align: "center",
      },
      itemOptions: {
        fontSize: 10,
        fontStyle: "normal",
      },
      columns: 2, // Số cột
      ...options,
    };

    // Thêm tiêu đề
    if (indexOptions.title) {
      this.addText(indexOptions.title, null, null, indexOptions.titleOptions);
      this.addSpace(10);
    }

    if (indexOptions.columns === 1) {
      // Single column
      entries.forEach((entry) => {
        const term = this._decodeHtmlEntities(entry.term);
        const pages = this._decodeHtmlEntities(entry.pages.join(", "));

        this.addLeaderDots(term, pages, {
          ...indexOptions.itemOptions,
          leftPadding: 5,
          rightPadding: 5,
          lineHeight: 5,
        });
      });
    } else {
      // Multiple columns
      const itemsPerColumn = Math.ceil(entries.length / indexOptions.columns);
      const columnWidth =
        (this.pageWidth - this.margins.left - this.margins.right) / indexOptions.columns;

      for (let col = 0; col < indexOptions.columns; col++) {
        const startIdx = col * itemsPerColumn;
        const endIdx = Math.min(startIdx + itemsPerColumn, entries.length);
        const columnItems = entries.slice(startIdx, endIdx);

        const originalY = this.currentY;
        const columnX = this.margins.left + col * columnWidth;

        // Reset Y cho cột mới (trừ cột đầu tiên)
        if (col > 0) this.currentY = originalY;

        columnItems.forEach((entry) => {
          const term = this._decodeHtmlEntities(entry.term);
          const pages = this._decodeHtmlEntities(entry.pages.join(", "));

          const termWidth = this.doc.getTextWidth(term);
          const pagesWidth = this.doc.getTextWidth(pages);

          // Tính toán leader dots cho cột
          this.doc.setFontSize(indexOptions.itemOptions.fontSize);
          const dotWidth = this.doc.getTextWidth(".");
          const availableWidth = columnWidth - termWidth - pagesWidth - 15;
          const dotsCount = Math.max(3, Math.floor(availableWidth / (dotWidth + 2)));

          // Vẽ term
          this._drawText(term, columnX, this.currentY);

          // Vẽ dots
          let dotX = columnX + termWidth + 5;
          for (let i = 0; i < dotsCount; i++) {
            this._drawText(".", dotX, this.currentY);
            dotX += dotWidth + 2;
          }

          // Vẽ pages
          const pageX = columnX + columnWidth - pagesWidth - 5;
          this._drawText(pages, pageX, this.currentY);

          this.currentY += 5;
        });
      }
    }

    return this;
  }

  // Format giá tiền
  formatPrice(price, currency = "VNĐ") {
    if (typeof price === "number") {
      return price.toLocaleString("vi-VN") + " " + currency;
    }
    return price.toString() + " " + currency;
  }

  // Thêm Fill-in line (đường kẻ để điền thông tin)
  addFillInLine(label = "", options = {}) {
    // Decode label
    label = this._decodeHtmlEntities(label);

    const defaultFillOptions = {
      lineCount: 1, // Số dòng kẻ
      lineLength: 100, // Độ dài mỗi dòng
      lineSpacing: 8, // Khoảng cách giữa các dòng
      lineStyle: "dots", // 'solid', 'dashed', 'dotted', 'dots'
      lineWidth: 0.5, // Độ dày đường kẻ
      lineColor: [0, 0, 0], // Màu đường kẻ
      dotSpacing: 1, // Khoảng cách giữa các dấu chấm (cho style 'dots')
      dotChar: ".", // Ký tự dùng cho dots
      labelPosition: "left", // 'left', 'right', 'above', 'below', 'none'
      labelOptions: {
        fontSize: 11,
        fontStyle: "normal",
        color: [0, 0, 0],
        spacing: 5, // Khoảng cách từ label đến line
      },
      align: "left", // 'left', 'center', 'right'
      showPlaceholder: false, // Hiển thị placeholder text
      placeholderText: "(điền thông tin)",
      placeholderOptions: {
        fontSize: 9,
        fontStyle: "italic",
        color: [150, 150, 150],
      },
    };

    // Merge options safely
    const fillOptions = {
      ...defaultFillOptions,
      ...options,
      labelOptions: {
        ...defaultFillOptions.labelOptions,
        ...(options.labelOptions || {}),
      },
      placeholderOptions: {
        ...defaultFillOptions.placeholderOptions,
        ...(options.placeholderOptions || {}),
      },
    };

    let startX, startY;
    const yPos = this.currentY;

    // Tính toán vị trí X dựa trên align
    if (fillOptions.align === "center") {
      startX = (this.pageWidth - fillOptions.lineLength) / 2;
    } else if (fillOptions.align === "right") {
      startX = this.pageWidth - this.margins.right - fillOptions.lineLength;
    } else {
      startX = this.margins.left;
    }

    // Xử lý label
    if (label && fillOptions.labelPosition !== "none") {
      this.doc.setFontSize(fillOptions.labelOptions.fontSize);
      this._setFont(null, fillOptions.labelOptions.fontStyle);
      const labelColor = Array.isArray(fillOptions.labelOptions.color)
        ? fillOptions.labelOptions.color
        : [0, 0, 0];
      this.doc.setTextColor(...labelColor);

      const labelWidth = this.doc.getTextWidth(label);

      if (fillOptions.labelPosition === "above") {
        // Label ở trên
        const labelX =
          fillOptions.align === "center"
            ? (this.pageWidth - labelWidth) / 2
            : fillOptions.align === "right"
              ? this.pageWidth - this.margins.right - labelWidth
              : this.margins.left;
        this._drawText(label, labelX, this.currentY);
        this.currentY += fillOptions.labelOptions.spacing;
      } else if (fillOptions.labelPosition === "left") {
        // Label ở bên trái
        this._drawText(label, this.margins.left, this.currentY);
        startX = this.margins.left + labelWidth + fillOptions.labelOptions.spacing;
        fillOptions.lineLength = Math.min(
          fillOptions.lineLength,
          this.pageWidth - this.margins.right - startX
        );
      } else if (fillOptions.labelPosition === "right") {
        // Label ở bên phải (vẽ line trước)
        // Sẽ vẽ sau khi vẽ line
      }
    }

    // Kiểm tra page break
    const totalHeight = (fillOptions.lineCount - 1) * fillOptions.lineSpacing + 10;
    this.checkPageBreak(totalHeight);

    // Thiết lập style đường kẻ
    this.doc.setLineWidth(fillOptions.lineWidth);
    const drawColor = Array.isArray(fillOptions.lineColor) ? fillOptions.lineColor : [0, 0, 0];
    this.doc.setDrawColor(...drawColor);

    // Vẽ các đường kẻ hoặc dots
    for (let i = 0; i < fillOptions.lineCount; i++) {
      const lineY = this.currentY + i * fillOptions.lineSpacing;

      if (fillOptions.lineStyle === "dots") {
        // Vẽ bằng dấu chấm
        this.doc.setFontSize(fillOptions.labelOptions.fontSize);
        try {
          this._setFont(null, "normal");
        } catch {
          this.doc.setFont("helvetica", "normal");
        }
        const lineColor = Array.isArray(fillOptions.lineColor) ? fillOptions.lineColor : [0, 0, 0];
        this.doc.setTextColor(...lineColor);

        const dotWidth = this.doc.getTextWidth(fillOptions.dotChar);
        const totalDots = Math.floor(fillOptions.lineLength / (dotWidth + fillOptions.dotSpacing));

        for (let j = 0; j < totalDots; j++) {
          const dotX = startX + j * (dotWidth + fillOptions.dotSpacing);
          if (dotX + dotWidth <= startX + fillOptions.lineLength) {
            this._drawText(fillOptions.dotChar, dotX, lineY);
          }
        }
      } else {
        // Vẽ bằng đường kẻ thông thường
        if (fillOptions.lineStyle === "dashed") {
          this.doc.setLineDashPattern([3, 2], 0);
        } else if (fillOptions.lineStyle === "dotted") {
          this.doc.setLineDashPattern([1, 2], 0);
        } else {
          this.doc.setLineDashPattern([], 0); // solid
        }

        this.doc.line(startX, lineY, startX + fillOptions.lineLength, lineY);
      }

      // Thêm placeholder text nếu có
      if (fillOptions.showPlaceholder && fillOptions.placeholderText) {
        this.doc.setFontSize(fillOptions.placeholderOptions.fontSize);
        this._setFont(null, fillOptions.placeholderOptions.fontStyle);
        const placeholderColor = Array.isArray(fillOptions.placeholderOptions.color)
          ? fillOptions.placeholderOptions.color
          : [150, 150, 150];
        this.doc.setTextColor(...placeholderColor);

        const placeholderY = lineY - 2; // Hơi trên đường kẻ một chút
        this._drawText(fillOptions.placeholderText, startX + 5, placeholderY);
      }
    }

    // Reset line dash
    this.doc.setLineDashPattern([], 0);

    // Xử lý label bên phải (sau khi vẽ line)
    if (label && fillOptions.labelPosition === "right") {
      this.doc.setFontSize(fillOptions.labelOptions.fontSize);
      this._setFont(null, fillOptions.labelOptions.fontStyle);
      const rightLabelColor = Array.isArray(fillOptions.labelOptions.color)
        ? fillOptions.labelOptions.color
        : [0, 0, 0];
      this.doc.setTextColor(...rightLabelColor);

      const labelX = startX + fillOptions.lineLength + fillOptions.labelOptions.spacing;
      this._drawText(label, labelX, this.currentY);
    }

    // Xử lý label bên dưới
    if (label && fillOptions.labelPosition === "below") {
      const finalLineY = this.currentY + (fillOptions.lineCount - 1) * fillOptions.lineSpacing;
      this.currentY = finalLineY + fillOptions.labelOptions.spacing;

      const labelWidth = this.doc.getTextWidth(label);
      const labelX =
        fillOptions.align === "center"
          ? (this.pageWidth - labelWidth) / 2
          : fillOptions.align === "right"
            ? this.pageWidth - this.margins.right - labelWidth
            : this.margins.left;
      this._drawText(label, labelX, this.currentY);
    }

    // Cập nhật currentY
    this.currentY += (fillOptions.lineCount - 1) * fillOptions.lineSpacing + 10;

    return this;
  }

  // Tạo form fill-in nhanh
  addFillInForm(fields, options = {}) {
    const formOptions = {
      title: null,
      titleOptions: {
        fontSize: 14,
        fontStyle: "bold",
        color: [0, 0, 0],
      },
      fieldSpacing: 12,
      columns: 1, // Số cột
      ...options,
    };

    // Thêm tiêu đề form nếu có
    if (formOptions.title) {
      this.addText(formOptions.title, null, null, formOptions.titleOptions);
      this.addSpace(8);
    }

    if (formOptions.columns === 1) {
      // Single column
      fields.forEach((field) => {
        const fieldOptions = {
          lineLength: 150,
          labelPosition: "left",
          ...field.options,
        };

        this.addFillInLine(field.label || "", fieldOptions);
        this.addSpace(formOptions.fieldSpacing - 10);
      });
    } else {
      // Multi-column
      const fieldsPerColumn = Math.ceil(fields.length / formOptions.columns);
      const columnWidth =
        (this.pageWidth - this.margins.left - this.margins.right) / formOptions.columns;

      for (let i = 0; i < fields.length; i += fieldsPerColumn) {
        const columnFields = fields.slice(i, i + fieldsPerColumn);
        const colIndex = Math.floor(i / fieldsPerColumn);
        const originalY = this.currentY;

        columnFields.forEach((field, fieldIndex) => {
          if (colIndex > 0) {
            this.currentY = originalY + fieldIndex * formOptions.fieldSpacing;
          }

          const fieldOptions = {
            lineLength: columnWidth - 20,
            labelPosition: "above",
            align: "left",
            ...field.options,
          };

          const startX = this.margins.left + colIndex * columnWidth;

          // Override startX calculation
          const originalMarginLeft = this.margins.left;
          this.margins.left = startX;

          this.addFillInLine(field.label || "", fieldOptions);

          // Restore margins
          this.margins.left = originalMarginLeft;

          if (colIndex === 0) {
            // Chỉ increment Y cho cột đầu tiên
            this.addSpace(formOptions.fieldSpacing - 10);
          }
        });
      }
    }

    return this;
  }

  // Tạo signature line với fill-in
  addSignatureFillIn(signers = [], options = {}) {
    const sigOptions = {
      layout: "horizontal", // 'horizontal', 'vertical'
      signatureWidth: 120,
      dateWidth: 80,
      spacing: 20,
      showDate: true,
      dateLabel: "Ngày:",
      signatureLabel: "Chữ ký:",
      nameLabel: "Họ tên:",
      titleLabel: "Chức vụ:",
      ...options,
    };

    if (sigOptions.layout === "horizontal") {
      // Horizontal layout
      const totalWidth =
        signers.length * (sigOptions.signatureWidth + sigOptions.spacing) - sigOptions.spacing;
      let startX = (this.pageWidth - totalWidth) / 2;

      signers.forEach((signer, index) => {
        const signerX = startX + index * (sigOptions.signatureWidth + sigOptions.spacing);
        const originalMarginLeft = this.margins.left;

        // Tạm thời thay đổi margin
        this.margins.left = signerX;

        // Ngày
        if (sigOptions.showDate) {
          this.addFillInLine(sigOptions.dateLabel, {
            lineLength: sigOptions.dateWidth,
            labelPosition: "left",
            align: "left",
          });
        }

        // Chức vụ/Title
        if (signer.title) {
          this.addText(
            signer.title,
            signerX + (sigOptions.signatureWidth - this.doc.getTextWidth(signer.title)) / 2,
            null,
            {
              fontSize: 10,
              fontStyle: "bold",
            }
          );
        }

        // Chữ ký
        this.addFillInLine(sigOptions.signatureLabel, {
          lineLength: sigOptions.signatureWidth,
          labelPosition: "above",
          align: "left",
        });

        // Họ tên
        this.addFillInLine(sigOptions.nameLabel, {
          lineLength: sigOptions.signatureWidth,
          labelPosition: "left",
          align: "left",
        });

        // Restore margin
        this.margins.left = originalMarginLeft;
      });
    } else {
      // Vertical layout
      signers.forEach((signer) => {
        if (signer.title) {
          this.addText(signer.title, null, null, {
            fontSize: 12,
            fontStyle: "bold",
            align: "center",
          });
        }

        if (sigOptions.showDate) {
          this.addFillInLine(sigOptions.dateLabel, {
            lineLength: sigOptions.dateWidth,
            labelPosition: "left",
            align: "center",
          });
        }

        this.addFillInLine(sigOptions.signatureLabel, {
          lineLength: sigOptions.signatureWidth,
          labelPosition: "above",
          align: "center",
        });

        this.addFillInLine(sigOptions.nameLabel, {
          lineLength: sigOptions.signatureWidth,
          labelPosition: "left",
          align: "center",
        });

        this.addSpace(sigOptions.spacing);
      });
    }

    return this;
  }

  // Thêm dotted fill-in line (dấu chấm thay vì đường kẻ)
  addDottedFillIn(label = "", options = {}) {
    const dottedOptions = {
      lineStyle: "dots",
      dotChar: ".",
      dotSpacing: 2,
      lineLength: 100,
      labelPosition: "left",
      ...options,
    };

    return this.addFillInLine(label, dottedOptions);
  }

  // Thêm form với dotted lines
  addDottedForm(fields, options = {}) {
    const dottedFormOptions = {
      fieldDefaults: {
        lineStyle: "dots",
        dotChar: ".",
        dotSpacing: 2,
      },
      ...options,
    };

    // Áp dụng dotted style cho tất cả fields
    const processedFields = fields.map((field) => ({
      ...field,
      options: {
        ...dottedFormOptions.fieldDefaults,
        ...field.options,
      },
    }));

    return this.addFillInForm(processedFields, dottedFormOptions);
  }

  // Thêm signature với dotted lines
  addDottedSignature(signers = [], options = {}) {
    const dottedSigOptions = {
      lineStyle: "dots",
      dotChar: ".",
      dotSpacing: 2,
      ...options,
    };

    // Override các fill-in methods tạm thời
    const originalAddFillInLine = this.addFillInLine.bind(this);
    this.addFillInLine = (label, opts = {}) => {
      return originalAddFillInLine(label, {
        lineStyle: "dots",
        dotChar: ".",
        dotSpacing: 2,
        ...opts,
      });
    };

    const result = this.addSignatureFillIn(signers, dottedSigOptions);

    // Restore original method
    this.addFillInLine = originalAddFillInLine;

    return result;
  }

  // Thêm custom dotted pattern
  addCustomDottedLine(label = "", pattern = ".", spacing = 2, length = 100, options = {}) {
    return this.addFillInLine(label, {
      lineStyle: "dots",
      dotChar: pattern,
      dotSpacing: spacing,
      lineLength: length,
      ...options,
    });
  }

  // Thêm text với định dạng hỗn hợp (bold, italic trong cùng dòng)
  addMixedText(textParts, options = {}) {
    const defaultOptions = {
      fontSize: 12,
      color: [0, 0, 0],
      maxWidth: this.pageWidth - this.margins.left - this.margins.right,
      align: "left",
      lineHeight: this.lineHeight,
    };

    const config = { ...defaultOptions, ...options };

    // Validate config values
    config.lineHeight = parseFloat(config.lineHeight) || 5;
    config.fontSize = parseFloat(config.fontSize) || 12;
    config.maxWidth = parseFloat(config.maxWidth) || (this.pageWidth - this.margins.left - this.margins.right);

    let currentX = config.x || this.margins.left;
    let currentLineY = this.currentY;
    let wordsOnLine = [];
    let currentLineWidth = 0;

    // Đảm bảo có đủ không gian
    this.checkPageBreak(config.lineHeight + 10);
    // Sync currentLineY after potential page break
    currentLineY = this.currentY;

    // Xử lý từng phần text
    textParts.forEach((part, partIndex) => {
      let text = typeof part === "string" ? part : part.text;
      // Decode entities trước khi xử lý
      text = this._decodeHtmlEntities(text);

      // Handle both object style { bold: true, italic: false } and string style "bold"
      let style = "normal";
      if (typeof part === "object" && part.style) {
        if (typeof part.style === "string") {
          style = part.style;
        } else if (typeof part.style === "object") {
          // Convert object style to jsPDF font style string
          const s = part.style;
          if (s.bold && s.italic) style = "bolditalic";
          else if (s.bold) style = "bold";
          else if (s.italic) style = "italic";
          else style = "normal";
        }
      }

      const partColor = typeof part === "object" && part.color ? part.color :
        (typeof part === "object" && part.style && part.style.color ? part.style.color : config.color);
      let fontSize = typeof part === "object" && part.fontSize ? part.fontSize :
        (typeof part === "object" && part.style && part.style.fontSize ? part.style.fontSize : config.fontSize);
      // Ensure fontSize is a valid number
      fontSize = parseFloat(fontSize) || config.fontSize || 12;

      // Thiết lập font để tính toán kích thước
      this.doc.setFontSize(fontSize);
      this._setFont(null, style);

      // Tách text thành từng từ (với null check)
      if (!text) return; // Skip empty parts
      const words = String(text).split(" ");

      words.forEach((word, wordIndex) => {
        const wordWithSpace = wordIndex < words.length - 1 ? word + " " : word;
        const wordWidth = this.doc.getTextWidth(wordWithSpace);

        // Kiểm tra xem từ có vừa trong dòng hiện tại không
        if (currentLineWidth + wordWidth > config.maxWidth && wordsOnLine.length > 0) {
          // Render dòng hiện tại (không phải dòng cuối)
          this.renderMixedLine(wordsOnLine, currentX, currentLineY, config, false);

          // Chuyển sang dòng mới
          currentLineY += config.lineHeight;
          const yBeforeCheck = this.currentY;
          this.checkPageBreak(config.lineHeight + 5);
          // Detect if page break happened (currentY reset to top of new page)
          if (this.currentY < yBeforeCheck) {
            currentLineY = this.currentY; // Reset to top of new page
          }
          currentX = config.x || this.margins.left;
          wordsOnLine = [];
          currentLineWidth = 0;
        }

        // Thêm từ vào dòng hiện tại
        const underline = typeof part === "object" && part.style && typeof part.style === "object" ? part.style.underline : false;
        const strikethrough = typeof part === "object" && part.style && typeof part.style === "object" ? part.style.strikethrough : false;

        wordsOnLine.push({
          text: wordWithSpace,
          style: style,
          color: this._parseColorToArray(partColor),
          fontSize: fontSize,
          width: wordWidth,
          underline: underline,
          strikethrough: strikethrough
        });
        currentLineWidth += wordWidth;
      });
    });

    // Render dòng cuối cùng nếu có
    if (wordsOnLine.length > 0) {
      this.renderMixedLine(wordsOnLine, currentX, currentLineY, config, true);
      currentLineY += config.lineHeight;
    }

    // Cập nhật vị trí Y với spacing được điều chỉnh
    const defaultSpacing = config.spacing !== undefined ? config.spacing : 1;
    this.currentY = currentLineY;
    // this.currentY = currentLineY + defaultSpacing;
    return this;
  }

  // Helper function để render một dòng mixed text
  renderMixedLine(words, startX, y, config, isLastLine = false) {
    // Guard: skip if no words
    if (!words || words.length === 0) return;

    let xPos = startX;

    // Điều chỉnh vị trí X theo alignment
    if (config.align === "center") {
      const totalWidth = words.reduce((sum, word) => sum + word.width, 0);
      xPos = (this.pageWidth - totalWidth) / 2;
    } else if (config.align === "right") {
      const totalWidth = words.reduce((sum, word) => sum + word.width, 0);
      xPos = this.pageWidth - this.margins.right - totalWidth;
    } else if (config.align === "justify" && !isLastLine && words.length > 1) {
      // Canh đều cho mixed text
      this.renderJustifiedMixedLine(words, startX, y, config);
      return;
    }

    // Vẽ từng từ (cho left, center, right hoặc dòng cuối của justify)
    words.forEach((word) => {
      // Thiết lập font và màu cho từng từ
      this.doc.setFontSize(word.fontSize);
      this._setFont(null, word.style);
      this.doc.setTextColor(word.color[0], word.color[1], word.color[2]);

      // Vẽ text
      this._drawText(word.text, xPos, y);

      // Vẽ underline nếu có
      if (word.underline) {
        const textWidth = this.doc.getTextWidth(word.text.trimEnd());
        const lineY = y + 1; // Vị trí gạch chân dưới text
        this.doc.setDrawColor(word.color[0], word.color[1], word.color[2]);
        this.doc.setLineWidth(0.3);
        this.doc.line(xPos, lineY, xPos + textWidth, lineY);
      }

      // Vẽ strikethrough nếu có
      if (word.strikethrough) {
        const textWidth = this.doc.getTextWidth(word.text.trimEnd());
        const lineY = y - (word.fontSize * 0.12); // Vị trí gạch ngang giữa text
        this.doc.setDrawColor(word.color[0], word.color[1], word.color[2]);
        this.doc.setLineWidth(0.3);
        this.doc.line(xPos, lineY, xPos + textWidth, lineY);
      }

      // Cập nhật vị trí x
      xPos += word.width;
    });
  }

  // Hàm vẽ mixed text canh đều
  renderJustifiedMixedLine(words, startX, y, config) {
    if (words.length <= 1) {
      this.renderMixedLine(words, startX, y, { ...config, align: "left" });
      return;
    }

    // Tính tổng độ rộng các từ (không tính khoảng trắng)
    let totalWordsWidth = 0;
    words.forEach((word) => {
      // Tạm thời thiết lập font để tính độ rộng chính xác
      this.doc.setFontSize(word.fontSize);
      this._setFont(null, word.style);
      totalWordsWidth += this.doc.getTextWidth(word.text.trimEnd());
    });

    // Tính khoảng cách giữa các từ
    const totalSpaces = words.length - 1;
    const availableSpaceWidth = config.maxWidth - totalWordsWidth;
    const spaceWidth = availableSpaceWidth / totalSpaces;

    // Vẽ từng từ với khoảng cách được tính toán
    let currentX = startX;
    words.forEach((word, index) => {
      // Thiết lập font và màu
      this.doc.setFontSize(word.fontSize);
      this._setFont(null, word.style);
      this.doc.setTextColor(word.color[0], word.color[1], word.color[2]);

      // Vẽ text
      const cleanText = word.text.trimEnd();
      const textWidth = this.doc.getTextWidth(cleanText);
      this._drawText(cleanText, currentX, y);

      // Vẽ underline nếu có
      if (word.underline) {
        const lineY = y + 1;
        this.doc.setDrawColor(word.color[0], word.color[1], word.color[2]);
        this.doc.setLineWidth(0.3);
        this.doc.line(currentX, lineY, currentX + textWidth, lineY);
      }

      // Vẽ strikethrough nếu có
      if (word.strikethrough) {
        const lineY = y - (word.fontSize * 0.12);
        this.doc.setDrawColor(word.color[0], word.color[1], word.color[2]);
        this.doc.setLineWidth(0.3);
        this.doc.line(currentX, lineY, currentX + textWidth, lineY);
      }

      currentX += textWidth;

      // Thêm khoảng cách (trừ từ cuối cùng)
      if (index < words.length - 1) {
        currentX += spaceWidth;
      }
    });
  }

  // Thêm paragraph với định dạng hỗn hợp
  addMixedParagraph(textParts, options = {}) {
    const paragraphOptions = {
      fontSize: 10,
      color: [0, 0, 0],
      lineHeight: 5,
      align: "left",
      maxWidth: this.pageWidth - this.margins.left - this.margins.right,
      spacing: 1, // Giảm khoảng cách sau paragraph từ 3 xuống 1
      ...options,
    };

    // Kiểm tra input
    if (!Array.isArray(textParts) || textParts.length === 0) {
      console.warn("addMixedParagraph: textParts phải là array không rỗng");
      return this;
    }

    // Thêm mixed text
    this.addMixedText(textParts, paragraphOptions);

    // Thêm khoảng cách sau paragraph
    this.currentY += paragraphOptions.spacing;

    return this;
  }

  // Helper functions cho mixed text
  createTextPart(text, style = "normal", color = null, fontSize = null) {
    const part = { text, style };
    if (color) part.color = Array.isArray(color) ? color : [0, 0, 0];
    if (fontSize) part.fontSize = fontSize;
    return part;
  }

  // Tạo bold text part
  bold(text, color = null, fontSize = null) {
    return this.createTextPart(text, "bold", color, fontSize);
  }

  // Tạo italic text part
  italic(text, color = null, fontSize = null) {
    return this.createTextPart(text, "italic", color, fontSize);
  }

  // Tạo bold italic text part
  boldItalic(text, color = null, fontSize = null) {
    return this.createTextPart(text, "bolditalic", color, fontSize);
  }

  // Tạo normal text part
  normal(text, color = null, fontSize = null) {
    return this.createTextPart(text, "normal", color, fontSize);
  }

  // Tạo colored text part
  colored(text, color, style = "normal", fontSize = null) {
    return this.createTextPart(text, style, color, fontSize);
  }

  // Thêm paragraph với helper functions
  addStyledParagraph(textParts, options = {}) {
    // Nếu textParts không phải array, convert thành array
    if (!Array.isArray(textParts)) {
      textParts = [textParts];
    }

    return this.addMixedParagraph(textParts, options);
  }

  // Thêm text có đánh số tự động với thụt lề
  addNumberedText(text, options = {}) {
    // Decode text trước khi xử lý layout
    text = this._decodeHtmlEntities(text);

    const numberOptions = {
      fontSize: 11,
      fontStyle: "normal",
      color: [0, 0, 0],
      numberStyle: "decimal", // 'decimal', 'roman', 'alpha', 'bullet'
      numberFormat: "{number}.", // Format của số: '{number}.', '{number})', '({number})', etc.
      startNumber: 1, // Số bắt đầu
      indent: 20, // Khoảng cách thụt lề cho text
      numberWidth: 15, // Độ rộng vùng số
      lineHeight: null, // Sẽ tính toán động
      maxWidth: null, // Tự tính toán nếu null
      align: "left",
      showIndex: true, // Hiển thị số hay không
      lineSpacing: 1.3, // Hệ số cho khoảng cách dòng
      ...options,
    };

    // Tính toán lineHeight nếu không được cung cấp
    if (numberOptions.lineHeight === null) {
      // Tính lineHeight dựa trên fontSize
      numberOptions.lineHeight = Math.max(
        this.lineHeight,
        Math.ceil(numberOptions.fontSize * numberOptions.lineSpacing)
      );
    }

    // Tính toán maxWidth nếu không được cung cấp
    if (!numberOptions.maxWidth) {
      numberOptions.maxWidth =
        this.pageWidth - this.margins.left - this.margins.right - numberOptions.indent;
    }

    // Lấy số hiện tại (lưu trong instance để duy trì qua các lần gọi)
    if (!this.currentNumberByStyle) {
      this.currentNumberByStyle = {};
    }
    if (!this.currentNumberByStyle[numberOptions.numberStyle]) {
      this.currentNumberByStyle[numberOptions.numberStyle] = numberOptions.startNumber;
    }

    const currentNumber = this.currentNumberByStyle[numberOptions.numberStyle];

    // Tạo text số theo style
    let numberText = "";
    switch (numberOptions.numberStyle) {
      case "decimal":
        numberText = currentNumber.toString();
        break;
      case "roman":
        numberText = this.toRomanNumeral(currentNumber);
        break;
      case "alpha":
        numberText = this.toAlphaNumeral(currentNumber);
        break;
      case "bullet":
        numberText = "•";
        break;
      default:
        numberText = currentNumber.toString();
    }

    // Áp dụng format
    const formattedNumber = numberOptions.numberFormat.replace("{number}", numberText);

    // Thiết lập font
    this.doc.setFontSize(numberOptions.fontSize);
    this._setFont(null, numberOptions.fontStyle);
    const textColor = Array.isArray(numberOptions.color) ? numberOptions.color : [0, 0, 0];
    this.doc.setTextColor(...textColor);

    // Chia text thành các dòng với độ rộng tối đa (trừ đi phần indent)
    const lines = this.doc.splitTextToSize(text, numberOptions.maxWidth);

    // Kiểm tra page break cho toàn bộ item (nếu chưa được kiểm tra từ bên ngoài)
    if (numberOptions.skipPageBreakCheck !== true) {
      const totalHeight = lines.length * (3 + numberOptions.lineHeight);
      this.checkPageBreak(totalHeight + 10);
    }

    // Tính toán vị trí X cho số và text dựa trên alignment
    let numberX = this.margins.left;
    let textX = this.margins.left + numberOptions.indent;

    // Vẽ từng dòng với alignment
    let currentLineY = this.currentY;
    lines.forEach((line, index) => {
      // Chỉ kiểm tra page break cho mỗi dòng nếu item rất dài (> 5 dòng)
      if (lines.length > 5 && numberOptions.skipPageBreakCheck !== true) {
        this.checkPageBreak(3 + numberOptions.lineHeight + 5);
        currentLineY = this.currentY; // Cập nhật sau khi có thể chuyển trang
      }

      if (index === 0) {
        // Dòng đầu tiên: vẽ số trước
        if (numberOptions.showIndex) {
          if (numberOptions.align === "center") {
            const totalWidth = this.doc.getTextWidth(formattedNumber + " " + line);
            const startX = (this.pageWidth - totalWidth) / 2;
            numberX = startX;
            textX = startX + this.doc.getTextWidth(formattedNumber) + 5;
          } else if (numberOptions.align === "right") {
            const totalWidth = this.doc.getTextWidth(formattedNumber + " " + line);
            const startX = this.pageWidth - this.margins.right - totalWidth;
            numberX = startX;
            textX = startX + this.doc.getTextWidth(formattedNumber) + 5;
          } else {
            // Left alignment (default)
            numberX = this.margins.left;
            textX = this.margins.left + numberOptions.indent;
          }
          this._drawText(formattedNumber, numberX, currentLineY);
        }
      }

      // Vẽ text với alignment
      if (numberOptions.align === "center") {
        if (index === 0 && numberOptions.showIndex) {
          // Dòng đầu tiên đã được tính toán ở trên
          this._drawText(line, textX, currentLineY);
        } else {
          // Các dòng tiếp theo canh giữa
          const lineWidth = this.doc.getTextWidth(line);
          const centerX = (this.pageWidth - lineWidth) / 2;
          this._drawText(line, centerX, currentLineY);
        }
      } else if (numberOptions.align === "right") {
        if (index === 0 && numberOptions.showIndex) {
          // Dòng đầu tiên đã được tính toán ở trên
          this._drawText(line, textX, currentLineY);
        } else {
          // Các dòng tiếp theo canh phải
          const lineWidth = this.doc.getTextWidth(line);
          const rightX = this.pageWidth - this.margins.right - lineWidth;
          this._drawText(line, rightX, currentLineY);
        }
      } else if (numberOptions.align === "justify") {
        // Canh đều - chỉ áp dụng cho các dòng không phải dòng cuối
        const isLastLine = index === lines.length - 1;
        if (index === 0) {
          // Dòng đầu tiên có số
          textX = this.margins.left + numberOptions.indent;
          if (!isLastLine && line.trim().length > 0) {
            this.drawJustifiedText(
              line,
              textX,
              currentLineY,
              numberOptions.maxWidth,
              numberOptions
            );
          } else {
            // Dòng cuối hoặc dòng trống thì canh trái bình thường
            this._drawText(line, textX, currentLineY);
          }
        } else {
          // Các dòng tiếp theo thụt lề như nhau
          textX = this.margins.left + numberOptions.indent;
          if (!isLastLine && line.trim().length > 0) {
            this.drawJustifiedText(
              line,
              textX,
              currentLineY,
              numberOptions.maxWidth,
              numberOptions
            );
          } else {
            // Dòng cuối hoặc dòng trống thì canh trái bình thường
            this._drawText(line, textX, currentLineY);
          }
        }
      } else {
        // Left alignment (default)
        if (index === 0) {
          textX = this.margins.left + numberOptions.indent;
        } else {
          // Các dòng tiếp theo thụt lề như nhau
          textX = this.margins.left + numberOptions.indent;
        }
        this._drawText(line, textX, currentLineY);
      }

      // Cập nhật vị trí Y cho dòng tiếp theo
      currentLineY += 3 + numberOptions.lineHeight;
    });

    // Cập nhật this.currentY sau khi hoàn thành toàn bộ item
    this.currentY = currentLineY;

    // Cập nhật số đếm
    this.currentNumberByStyle[numberOptions.numberStyle]++;

    return this;
  }

  // Reset số đếm
  resetNumbering(style = "decimal", startNumber = 1) {
    if (!this.currentNumberByStyle) {
      this.currentNumberByStyle = {};
    }
    this.currentNumberByStyle[style] = startNumber;
    return this;
  }

  // Thêm danh sách có đánh số
  addNumberedList(items, options = {}) {
    const listOptions = {
      title: null,
      titleOptions: {
        fontSize: 14,
        fontStyle: "bold",
        color: [0, 0, 0],
        align: "left", // Alignment cho title
      },
      itemOptions: {
        fontSize: 11,
        fontStyle: "normal",
        color: [0, 0, 0],
        numberStyle: "decimal",
        indent: 20,
        align: "left", // Alignment cho items
      },
      spacing: 0.5, // Khoảng cách giữa các item
      resetNumbers: true, // Reset số đếm khi bắt đầu list mới
      ...options,
    };

    // Thêm tiêu đề nếu có
    if (listOptions.title) {
      this.addText(listOptions.title, null, null, listOptions.titleOptions);
      this.addSpace(5);
    }

    // Reset số đếm nếu cần
    if (listOptions.resetNumbers) {
      this.resetNumbering(listOptions.itemOptions.numberStyle, 1);
    }

    // Thêm từng item với kiểm tra page break cho mỗi item
    items.forEach((item, index) => {
      const itemText = typeof item === "string" ? item : item.text;
      const itemOpts =
        typeof item === "object"
          ? { ...listOptions.itemOptions, ...item.options }
          : listOptions.itemOptions;

      // Tính toán chiều cao ước tính của item này để kiểm tra page break
      this.doc.setFontSize(itemOpts.fontSize || 11);
      const maxWidth =
        itemOpts.maxWidth ||
        this.pageWidth - this.margins.left - this.margins.right - (itemOpts.indent || 20);
      const lines = this.doc.splitTextToSize(itemText, maxWidth);
      const estimatedHeight =
        lines.length * ((itemOpts.lineHeight || this.lineHeight) + 3) +
        (listOptions.spacing || 0.5) +
        10; // thêm buffer

      // Kiểm tra page break cho toàn bộ item
      this.checkPageBreak(estimatedHeight);

      // Render item với flag để không kiểm tra page break lại
      const optimizedOpts = { ...itemOpts, skipPageBreakCheck: true };
      this.addNumberedText(itemText, optimizedOpts);

      // Thêm spacing giữa các item
      if (index < items.length - 1) {
        this.addSpace(listOptions.spacing);
      }
    });

    return this;
  }

  // Thêm danh sách có nhiều cấp độ (nested list)
  addMultiLevelList(items, options = {}) {
    const mlOptions = {
      level1: {
        numberStyle: "decimal",
        numberFormat: "{number}.",
        indent: 20,
        fontSize: 11,
      },
      level2: {
        numberStyle: "alpha",
        numberFormat: "{number})",
        indent: 35,
        fontSize: 10,
      },
      level3: {
        numberStyle: "roman",
        numberFormat: "({number})",
        indent: 50,
        fontSize: 10,
      },
      level4: {
        numberStyle: "bullet",
        numberFormat: "{number}",
        indent: 65,
        fontSize: 9,
      },
      spacing: 2,
      ...options,
    };

    // Reset tất cả numbering styles
    this.resetNumbering("decimal", 1);
    this.resetNumbering("alpha", 1);
    this.resetNumbering("roman", 1);

    const processItems = (itemList, currentLevel = 1) => {
      const levelKey = `level${Math.min(currentLevel, 4)}`;
      const levelOptions = mlOptions[levelKey];

      itemList.forEach((item, index) => {
        if (typeof item === "string") {
          // Simple text item
          this.addNumberedText(item, levelOptions);
        } else if (item.text) {
          // Item với text và có thể có sub-items
          const itemOptions = { ...levelOptions, ...item.options };
          this.addNumberedText(item.text, itemOptions);

          // Xử lý sub-items nếu có
          if (item.subItems && Array.isArray(item.subItems)) {
            this.addSpace(mlOptions.spacing);
            processItems(item.subItems, currentLevel + 1);
          }
        }

        if (index < itemList.length - 1) {
          this.addSpace(mlOptions.spacing);
        }
      });
    };

    processItems(items);
    return this;
  }

  // Convert số thành Roman numeral
  toRomanNumeral(num) {
    const romanNumerals = [
      ["M", 1000],
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
      ["I", 1],
    ];

    let result = "";
    for (let [letter, value] of romanNumerals) {
      const count = Math.floor(num / value);
      result += letter.repeat(count);
      num -= value * count;
    }
    return result.toLowerCase();
  }

  // Convert số thành chữ cái
  toAlphaNumeral(num) {
    let result = "";
    while (num > 0) {
      num--; // Adjust for 0-based indexing
      result = String.fromCharCode(97 + (num % 26)) + result;
      num = Math.floor(num / 26);
    }
    return result;
  }

  // Thêm outline/table of contents với auto-numbering
  addOutline(items, options = {}) {
    const outlineOptions = {
      title: "OUTLINE",
      titleOptions: {
        fontSize: 16,
        fontStyle: "bold",
        align: "center",
      },
      h1Options: {
        numberStyle: "decimal",
        numberFormat: "{number}.",
        fontSize: 12,
        fontStyle: "bold",
        indent: 15,
      },
      h2Options: {
        numberStyle: "decimal",
        numberFormat: "{number}.{parent}.",
        fontSize: 11,
        fontStyle: "normal",
        indent: 25,
      },
      h3Options: {
        numberStyle: "decimal",
        numberFormat: "{number}.{parent}.{grandparent}.",
        fontSize: 10,
        fontStyle: "normal",
        indent: 35,
      },
      showPageNumbers: true,
      ...options,
    };

    // Thêm tiêu đề
    if (outlineOptions.title) {
      this.addText(outlineOptions.title, null, null, outlineOptions.titleOptions);
      this.addSpace(10);
    }

    // Reset numbering
    this.resetNumbering("h1", 1);
    this.resetNumbering("h2", 1);
    this.resetNumbering("h3", 1);

    const processOutlineItems = (itemList, level = 1, parentNumbers = []) => {
      itemList.forEach((item) => {
        const text = typeof item === "string" ? item : item.title;
        const page = typeof item === "object" ? item.page : "";
        const subItems = typeof item === "object" ? item.subItems : null;

        let levelKey = `h${Math.min(level, 3)}`;
        let options = outlineOptions[`${levelKey}Options`];

        // Tạo số thứ tự cho level hiện tại
        let currentNum = this.currentNumberByStyle[levelKey] || 1;
        let numberText = currentNum.toString();

        // Xử lý format phức tạp cho multi-level
        if (options.numberFormat.includes("{parent}") && parentNumbers.length > 0) {
          numberText = numberText + "." + parentNumbers[parentNumbers.length - 1];
        }
        if (options.numberFormat.includes("{grandparent}") && parentNumbers.length > 1) {
          numberText = numberText + "." + parentNumbers[parentNumbers.length - 2];
        }

        const formattedNumber = options.numberFormat
          .replace("{number}", currentNum)
          .replace("{parent}", parentNumbers[parentNumbers.length - 1] || "")
          .replace("{grandparent}", parentNumbers[parentNumbers.length - 2] || "");

        // Vẽ outline item
        if (outlineOptions.showPageNumbers && page) {
          this.addLeaderDots(formattedNumber + " " + text, page.toString(), {
            fontSize: options.fontSize,
            fontStyle: options.fontStyle,
            leftPadding: options.indent,
          });
        } else {
          this.addText(formattedNumber + " " + text, this.margins.left + options.indent, null, {
            fontSize: options.fontSize,
            fontStyle: options.fontStyle,
          });
        }

        // Cập nhật số đếm
        if (!this.currentNumberByStyle) this.currentNumberByStyle = {};
        this.currentNumberByStyle[levelKey] = currentNum + 1;

        // Xử lý sub-items
        if (subItems && Array.isArray(subItems)) {
          const newParentNumbers = [...parentNumbers, currentNum];
          this.resetNumbering(`h${level + 1}`, 1); // Reset sub-level numbering
          processOutlineItems(subItems, level + 1, newParentNumbers);
        }
      });
    };

    processOutlineItems(items);
    return this;
  }

  // Lấy thông tin trang
  getPageInfo() {
    return {
      currentPage: this.doc.internal.getCurrentPageInfo().pageNumber,
      totalPages: this.doc.internal.getNumberOfPages(),
      pageSize: this.doc.internal.pageSize,
      currentY: this.currentY,
    };
  }
  /**
   * Căn đều dấu ":" trong danh sách các dòng mô tả (kiểu biểu mẫu hành chính)
   * @param {string[]} lines - danh sách các dòng (mỗi dòng chứa 1 dấu ":")
   * @param {number} [padSize=1] - số khoảng trắng thêm sau dấu ":" (mặc định 1)
   * @returns {string[]} danh sách dòng đã căn đều
   */
  alignColons(lines, padSize = 1) {
    // Tách phần trước và sau dấu ":", đo độ dài phần trước dài nhất
    const parts = lines.map((l) => {
      const [left, right] = l.split(":");
      return { left: left ?? "", right: right ?? "" };
    });
    const maxLen = Math.max(...parts.map((p) => p.left.trimEnd().length));

    // Gắn lại với số khoảng trắng phù hợp
    const pad = " ".repeat(padSize);
    return parts.map((p) => {
      const spaces = " ".repeat(maxLen - p.left.trimEnd().length);
      return `${p.left.trimEnd()}${spaces} :${pad}${p.right.trimStart()}`;
    });
  }
}

export default JsPdfService;
