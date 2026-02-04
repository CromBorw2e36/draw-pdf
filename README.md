# DrawPDF

📄 **PDF Template Builder** - Convert HTML templates to PDF with Vietnamese support, variables, loops, and conditionals.

[![npm version](https://img.shields.io/npm/v/drawpdf.svg)](https://www.npmjs.com/package/drawpdf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **HTML to PDF** - Parse CKEditor/HTML content to structured JSON, then render to PDF
- **Template Engine** - Variables `{{name}}`, loops `{{#each}}`, conditionals `{{#if}}`
- **Vietnamese Support** - Full Unicode support with Roboto/Tahoma fonts
- **Rich Text** - Bold, italic, underline, colors, font sizes
- **Tables** - With colspan, rowspan, borders, colors
- **Code Eval** - Execute JavaScript in templates for dynamic content

---

## 📦 Installation

```bash
# npm
npm install drawpdf jspdf jspdf-autotable

# or from git
npm install github:masax/DrawPDF#main
```

**Peer Dependencies:**

- `jspdf` ^2.5.1
- `jspdf-autotable` ^3.8.1

---

## 🔤 Font Configuration

### Default Behavior

By default, DrawPDF uses **Roboto** font (Vietnamese support built-in) with **helvetica** as fallback.

### Custom Font Configuration

```javascript
import DrawPDF from "drawpdf";

const pdf = await DrawPDF.create("#editor", {
  fonts: {
    defaultFont: "MyCustomFont", // Primary font name
    fallback: "helvetica", // Fallback if font not found
    register: [
      // Pre-converted font files (.js)
      "/fonts/MyCustomFont-Regular.js",
      "/fonts/MyCustomFont-Bold.js",
    ],
  },
});
```

### Dynamic Font Registration

```javascript
// Register font at runtime
await pdf.registerFont("/fonts/AnotherFont.js");
```

### Creating Custom Font Files

1. Download TTF font from [Font Squirrel](https://www.fontsquirrel.com/)
2. Convert using [jsPDF Font Converter](https://rawgit.com/MrRio/jsPDF/master/fontconverter/fontconverter.html)
3. Place the `.js` file in your project
4. Register via `fonts.register` array

---

## 🌐 Browser Usage (UMD)

For direct usage in the browser without a bundler, use the standalone build which includes all dependencies (`jspdf`, `jspdf-autotable`).

```html
<!-- Load the standalone script -->
<script src="./dist/drawpdf.standalone.umd.cjs"></script>

<script>
  // Access via global variable 'DrawPDF'
  const { DrawPDF } = window.DrawPDF;

  // Initialize
  DrawPDF.create("#editor").then((pdf) => {
    console.log("Ready!");
  });
</script>
```

---

## 🚀 Quick Start

### Design Mode (Thiết kế template với CKEditor)

```javascript
import DrawPDF from "drawpdf";

// 1. Khởi tạo CKEditor
const pdf = await DrawPDF.create("#editor");

// 2. User soạn thảo trong editor...

// 3. Lấy JSON Blueprint từ editor
const blueprint = pdf.getData();

// 4. Save blueprint để dùng sau
localStorage.setItem("myTemplate", JSON.stringify(blueprint));

// 5. Preview PDF
pdf.preview({ name: "Test", salary: 25000000 });
```

---

### Print Mode (In PDF từ blueprint có sẵn) ⭐

**Đây là use case phổ biến nhất:** Bạn đã có file `blueprint.json` và chỉ cần in ra PDF!

```javascript
import DrawPDF from "drawpdf";

// 📂 Cách 1: Load blueprint từ file/localStorage
const blueprint = JSON.parse(localStorage.getItem("myTemplate"));
// hoặc: const blueprint = await fetch('/templates/invoice.json').then(r => r.json());

// 🖨️ In ngay! Không cần CKEditor
new DrawPDF().setData(blueprint).download("document.pdf", {
  name: "Nguyễn Văn An",
  salary: 25000000,
  items: [
    { name: "Sản phẩm A", price: 100000 },
    { name: "Sản phẩm B", price: 200000 },
  ],
});
```

**Hoặc dùng Static Method (1 dòng):**

```javascript
DrawPDF.downloadBlueprint(blueprint, "output.pdf", { name: "Test" });
```

**Các cách xuất khác:**

```javascript
const pdf = new DrawPDF().setData(blueprint);

// Render và lấy data URL (để preview trong iframe)
const dataUrl = pdf.render(data);
document.getElementById("preview").src = dataUrl;

// Lấy Blob (để upload lên server)
const blob = pdf.getBlob(data);
await fetch("/api/upload", { method: "POST", body: blob });

// Mở preview trong tab mới
pdf.preview(data);
```

---

## 📚 API Reference - DrawPDF Class

### Instance Methods (Main API)

| Method                     | Description                              | Returns               |
| -------------------------- | ---------------------------------------- | --------------------- |
| `init(element, options)`   | Khởi tạo CKEditor vào element            | `Promise<DrawPDF>`    |
| `getData()`                | Parse HTML từ editor → JSON Blueprint    | `Object` (Blueprint)  |
| `setData(blueprint)`       | Load blueprint có sẵn để render          | `DrawPDF` (chainable) |
| `render(data)`             | Render PDF từ blueprint                  | `string` (data URL)   |
| `download(filename, data)` | Tải PDF xuống                            | `DrawPDF` (chainable) |
| `preview(data)`            | Mở PDF trong tab mới                     | `void`                |
| `getBlob(data)`            | Lấy Blob để upload                       | `Blob`                |
| `getBlueprint()`           | Lấy blueprint hiện tại (không parse lại) | `Object` or `null`    |
| `exportJson()`             | Xuất blueprint dạng JSON string          | `string`              |
| `importJson(jsonString)`   | Import blueprint từ JSON string          | `DrawPDF` (chainable) |
| `registerFont(url)`        | Đăng ký font tùy chỉnh                   | `Promise<DrawPDF>`    |
| `destroy()`                | Hủy editor instance                      | `void`                |

### Static Methods (Headless - Không cần CKEditor)

| Method                                                 | Description                            |
| ------------------------------------------------------ | -------------------------------------- |
| `DrawPDF.create(element, options)`                     | Factory method: `new DrawPDF().init()` |
| `DrawPDF.parseHtml(html)`                              | Parse HTML → Blueprint                 |
| `DrawPDF.renderBlueprint(blueprint, data)`             | Render blueprint → data URL            |
| `DrawPDF.downloadBlueprint(blueprint, filename, data)` | Download PDF ngay từ blueprint         |

### Workflow Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│  🎨 DESIGN MODE (Có CKEditor)                                   │
│  ───────────────────────────────                                │
│  DrawPDF.create('#editor')                                      │
│    → User soạn thảo trong editor                                │
│    → pdf.getData() → Lấy blueprint                              │
│    → Lưu blueprint.json                                         │
└─────────────────────────────────────────────────────────────────┘
                              ↓ blueprint.json
┌─────────────────────────────────────────────────────────────────┐
│  🖨️ PRINT MODE (Không cần CKEditor)                             │
│  ─────────────────────────────────                              │
│  new DrawPDF()                                                  │
│    .setData(blueprint)      ← Load blueprint có sẵn             │
│    .download('file.pdf', {  ← Truyền data vào                   │
│        name: 'Nguyễn Văn An',                                   │
│        salary: 25000000                                         │
│    });                                                          │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📖 Advanced API

### CKEditorParser

```javascript
import { CKEditorParser, PDFRenderer } from "drawpdf";

const parser = new CKEditorParser();
const renderer = new PDFRenderer();

const blueprint = parser.parse("<h1>Hello</h1>");
renderer.render(blueprint, { name: "World" });
renderer.download("output.pdf");
```

### CKEditorParser

```javascript
import { CKEditorParser, PAGE, FONTS } from "drawpdf";

const parser = new CKEditorParser();
const blueprint = parser.parse(htmlString);

// Constants
console.log(PAGE.WIDTH); // 210 (A4 mm)
console.log(FONTS.DEFAULT_SIZE); // 12
```

### PDFRenderer

```javascript
import { PDFRenderer } from "drawpdf";

const renderer = new PDFRenderer();

// Render blueprint with data
renderer.render(blueprint, data);

// Output methods
renderer.download("file.pdf"); // Download file
renderer.getDataUrl(); // Get data URL for preview
renderer.getBlob(); // Get Blob for upload
renderer.preview(); // Open in new tab
```

### JsPdfService

Low-level wrapper with 88+ methods for direct PDF manipulation.

```javascript
import { JsPdfService } from "drawpdf";

const pdf = new JsPdfService();

pdf.addTitle("Document Title");
pdf.addText("Hello World", null, null, { fontSize: 14 });
pdf.addTable(
  ["Col1", "Col2"],
  [
    ["A", "B"],
    ["C", "D"],
  ],
);
pdf.addSpace(10);
pdf.addHorizontalLine();
pdf.addNewPage();
pdf.savePDF("output.pdf");
```

### TemplateEngine

Process template syntax independently.

```javascript
import { TemplateEngine } from "drawpdf";

const result = TemplateEngine.process("Hello {{name}}!", { name: "World" });
// "Hello World!"
```

---

## 📝 Template Syntax

### Variables

```html
{{name}}
<!-- Simple -->
{{employee.department.name}}
<!-- Nested -->
```

### Loops

```html
{{#each items}} - {{name}}: {{formatCurrency price}}{{br}} {{/each}}
```

**Loop variables:** `{{@index}}`, `{{@first}}`, `{{@last}}`

### Conditionals

```html
{{#if isActive}}Active{{else}}Inactive{{/if}} {{#if salary > 10000000}}High
salary{{/if}}
```

### Format Helpers

| Helper                   | Example                       |
| ------------------------ | ----------------------------- |
| `{{formatNumber num}}`   | `1000000` → `1.000.000`       |
| `{{formatCurrency num}}` | `1000000` → `1.000.000đ`      |
| `{{formatDate date}}`    | `2026-01-29` → `29/01/2026`   |
| `{{uppercase text}}`     | `hello` → `HELLO`             |
| `{{capitalize text}}`    | `hello world` → `Hello World` |

### Date Helpers

| Helper      | Output              |
| ----------- | ------------------- |
| `{{today}}` | `29/01/2026`        |
| `{{now}}`   | `29/01/2026, 13:45` |
| `{{year}}`  | `2026`              |

### Layout Tags

| Tag             | Effect          |
| --------------- | --------------- |
| `{{br}}`        | Line break      |
| `{{tab}}`       | Tab (4 spaces)  |
| `{{hr}}`        | Horizontal line |
| `{{pageBreak}}` | New page        |

---

## � Blueprint JSON Structure

**Blueprint** là định dạng trung gian giữa HTML và PDF. Đây là output của `getData()` và input của `setData()`.

### Cấu trúc cơ bản

```json
{
  "version": "1.0",
  "pageSize": { "width": 210, "height": 297, "unit": "mm" },
  "margins": { "top": 20, "bottom": 20, "left": 15, "right": 15 },
  "pages": [
    {
      "pageNumber": 1,
      "elements": [
        { "type": "richtext", "x": 15, "y": 20, "segments": [...] },
        { "type": "table", "x": 15, "y": 50, "rows": [...] }
      ]
    }
  ],
  "sourceHtml": "<p>Original HTML...</p>",
  "createdAt": "2026-01-30T07:00:00Z"
}
```

### Element Types

| Type       | Description               | Key Properties                                 |
| ---------- | ------------------------- | ---------------------------------------------- |
| `richtext` | Đoạn văn bản có định dạng | `segments[]` (text, style), `content`, `style` |
| `table`    | Bảng với cells            | `rows[][]`, `style`, `rowHeight`               |
| `heading`  | Tiêu đề H1-H6             | `level`, `content`, `style`                    |
| `list`     | Danh sách ul/ol           | `items[]`, `listType`                          |
| `image`    | Hình ảnh                  | `src`, `width`, `height`                       |
| `code`     | Code block                | `code`, `language`                             |

### Ví dụ RichText Element

````json
{
  "type": "richtext",
  "x": 15,
  "y": 20,
  "width": 180,
  "segments": [
    { "text": "Xin chào ", "style": { "bold": false } },
    { "text": "{{name}}", "style": { "bold": true, "color": "#0000ff" } },
    { "text": "!", "style": { "bold": false } }
  ],
  "style": {
    "fontSize": 12,
    "align": "left",
    "lineHeight": 6.35
  }
}

---

## �🔥 Code Block Eval

Execute JavaScript directly in templates with `// eval`:

```javascript
// eval
const total = sum(data.items, 'price');
pdf.addText('Total: ' + formatCurrency(total));

pdf.addTable(
  ['Item', 'Price'],
  data.items.map(i => [i.name, formatCurrency(i.price)])
);
````

**Available in eval:**

- `pdf` - JsPdfService instance
- `data` - Template data
- `formatNumber()`, `formatCurrency()`, `sum()`, `count()`

---

## 🛠 Development

```bash
# Clone
# git clone https://github.com/masax/DrawPDF.git
# cd DrawPDF/pdf-builder

# Install
npm install

# Dev server
npm run dev

# Build library
npm run build
```

---

## 📁 Project Structure

```
pdf-builder/
├── src/
│   ├── index.js              # Library entry point
│   ├── parser/
│   │   ├── CKEditorParser.js # HTML → JSON Blueprint
│   │   └── RichTextTokenizer.js
│   ├── renderer/
│   │   └── PDFRenderer.js    # Blueprint → PDF
│   ├── service/
│   │   └── jspdf-service/main.js  # jsPDF wrapper (3000+ lines)
│   └── utils/
│       └── TemplateEngine.js # Template processing
├── examples/
│   └── basic-usage.html      # Demo page
├── dist/                     # Build output
│   ├── drawpdf.js           # ES Module
│   └── drawpdf.umd.cjs      # CommonJS
└── public/fonts/             # Vietnamese fonts
```

---

## 📄 License

MIT License
