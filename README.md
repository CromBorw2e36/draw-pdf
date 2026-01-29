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

## 🚀 Quick Start

### Design Mode (Thiết kế template với CKEditor)

```javascript
import DrawPDF from 'drawpdf';

// 1. Khởi tạo CKEditor
const pdf = await DrawPDF.create('#editor');

// 2. User soạn thảo trong editor...

// 3. Lấy JSON Blueprint từ editor
const blueprint = pdf.getData();

// 4. Save blueprint để dùng sau
localStorage.setItem('myTemplate', JSON.stringify(blueprint));

// 5. Preview PDF
pdf.preview({ name: 'Test', salary: 25000000 });
```

---

### Print Mode (In PDF từ blueprint có sẵn)

```javascript
import DrawPDF from 'drawpdf';

// Không cần CKEditor! Dùng method chaining:
const blueprint = JSON.parse(localStorage.getItem('myTemplate'));

new DrawPDF()
  .setData(blueprint)
  .download('output.pdf', { name: 'Nguyễn Văn An', salary: 25000000 });
```

Hoặc dùng static method:

```javascript
DrawPDF.downloadBlueprint(blueprint, 'output.pdf', { name: 'Test' });
```

---

## 📦 NPM Publish Guide

```bash
# 1. Login npm (chỉ cần lần đầu)
npm login

# 2. Build library
npm run build

# 3. Kiểm tra files sẽ publish
npm pack --dry-run

# 4. Publish lên npm
npm publish

# 5. Hoặc publish với tag
npm publish --tag beta
```

---

## 📖 Advanced API

### CKEditorParser

```javascript
import { CKEditorParser, PDFRenderer } from 'drawpdf';

const parser = new CKEditorParser();
const renderer = new PDFRenderer();

const blueprint = parser.parse('<h1>Hello</h1>');
renderer.render(blueprint, { name: 'World' });
renderer.download('output.pdf');
```

### CKEditorParser

```javascript
import { CKEditorParser, PAGE, FONTS } from 'drawpdf';

const parser = new CKEditorParser();
const blueprint = parser.parse(htmlString);

// Constants
console.log(PAGE.WIDTH);  // 210 (A4 mm)
console.log(FONTS.DEFAULT_SIZE);  // 12
```

### PDFRenderer

```javascript
import { PDFRenderer } from 'drawpdf';

const renderer = new PDFRenderer();

// Render blueprint with data
renderer.render(blueprint, data);

// Output methods
renderer.download('file.pdf');     // Download file
renderer.getDataUrl();             // Get data URL for preview
renderer.getBlob();                // Get Blob for upload
renderer.preview();                // Open in new tab
```

### JsPdfService

Low-level wrapper with 88+ methods for direct PDF manipulation.

```javascript
import { JsPdfService } from 'drawpdf';

const pdf = new JsPdfService();

pdf.addTitle('Document Title');
pdf.addText('Hello World', null, null, { fontSize: 14 });
pdf.addTable(['Col1', 'Col2'], [['A', 'B'], ['C', 'D']]);
pdf.addSpace(10);
pdf.addHorizontalLine();
pdf.addNewPage();
pdf.savePDF('output.pdf');
```

### TemplateEngine

Process template syntax independently.

```javascript
import { TemplateEngine } from 'drawpdf';

const result = TemplateEngine.process(
  'Hello {{name}}!',
  { name: 'World' }
);
// "Hello World!"
```

---

## 📝 Template Syntax

### Variables

```html
{{name}}                    <!-- Simple -->
{{employee.department.name}} <!-- Nested -->
```

### Loops

```html
{{#each items}}
  - {{name}}: {{formatCurrency price}}{{br}}
{{/each}}
```

**Loop variables:** `{{@index}}`, `{{@first}}`, `{{@last}}`

### Conditionals

```html
{{#if isActive}}Active{{else}}Inactive{{/if}}
{{#if salary > 10000000}}High salary{{/if}}
```

### Format Helpers

| Helper | Example |
|--------|---------|
| `{{formatNumber num}}` | `1000000` → `1.000.000` |
| `{{formatCurrency num}}` | `1000000` → `1.000.000đ` |
| `{{formatDate date}}` | `2026-01-29` → `29/01/2026` |
| `{{uppercase text}}` | `hello` → `HELLO` |
| `{{capitalize text}}` | `hello world` → `Hello World` |

### Date Helpers

| Helper | Output |
|--------|--------|
| `{{today}}` | `29/01/2026` |
| `{{now}}` | `29/01/2026, 13:45` |
| `{{year}}` | `2026` |

### Layout Tags

| Tag | Effect |
|-----|--------|
| `{{br}}` | Line break |
| `{{tab}}` | Tab (4 spaces) |
| `{{hr}}` | Horizontal line |
| `{{pageBreak}}` | New page |

---

## 🔥 Code Block Eval

Execute JavaScript directly in templates with `// eval`:

```javascript
// eval
const total = sum(data.items, 'price');
pdf.addText('Total: ' + formatCurrency(total));

pdf.addTable(
  ['Item', 'Price'],
  data.items.map(i => [i.name, formatCurrency(i.price)])
);
```

**Available in eval:**
- `pdf` - JsPdfService instance
- `data` - Template data
- `formatNumber()`, `formatCurrency()`, `sum()`, `count()`

---

## 🛠 Development

```bash
# Clone
git clone https://github.com/masax/DrawPDF.git
cd DrawPDF/pdf-builder

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
│   │   └── jspdf-service.js  # jsPDF wrapper (3000+ lines)
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
