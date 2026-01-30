# DrawPDF (masax-drawpdf)

📄 **PDF Template Builder** - Convert HTML templates to PDF with Vietnamese support, variables, loops, and conditionals.

[![npm version](https://img.shields.io/npm/v/masax-drawpdf.svg)](https://www.npmjs.com/package/masax-drawpdf)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

## ✨ Features

- **HTML to PDF** - Parse CKEditor/HTML content to structured JSON, then render to PDF
- **Template Engine** - Variables `{{name}}`, loops `{{#each}}`, conditionals `{{#if}}`
- **Vietnamese Support** - Full Unicode support with Roboto/Tahoma fonts
- **Rich Text** - Bold, italic, underline, colors, font sizes
- **Tables** - With colspan, rowspan, borders, colors
- **Code Eval** - Execute JavaScript in templates for dynamic content
- **Dual Mode** - Design mode (UI) and Print mode (Headless)

---

## 📦 Installation

```bash
npm install masax-drawpdf
```

---

## 🚀 Quick Start

### 1. Design Mode (Create Templates)

Use this mode to let users design templates with CKEditor.

```javascript
import DrawPDF from 'masax-drawpdf';

// 1. Initialize CKEditor
const pdf = await DrawPDF.create('#editor');

// 2. Data for preview
const data = { name: "Nguyen Van A", salary: 25000000 };

// 3. User edits content...
// 4. Get Blueprint JSON
const blueprint = pdf.getData();
console.log(blueprint); // Save this to database!

// 5. Preview PDF
pdf.preview(data);
```

### 2. Print Mode (Render from JSON)

Use this mode to generate PDFs from saved blueprints (no editor UI required).

```javascript
import DrawPDF from 'masax-drawpdf';

// Load blueprint from DB/File
const blueprint = await fetch('/models/invoice.json').then(r => r.json());

// Render and Download
DrawPDF.downloadBlueprint(blueprint, 'invoice.pdf', {
  name: "Tran Van B",
  items: [
    { name: "Laptop", price: 15000000 },
    { name: "Mouse", price: 500000 }
  ]
});
```

### Workflow Comparison

```
┌─────────────────────────────────────────────────────────────────┐
│  🎨 DESIGN MODE (With CKEditor)                                 │
│  ───────────────────────────────                                │
│  DrawPDF.create('#editor')                                      │
│    → User edits content                                         │
│    → pdf.getData() → Get Blueprint                              │
│    → Save blueprint.json to DB                                  │
└─────────────────────────────────────────────────────────────────┘
                              ↓ blueprint.json
┌─────────────────────────────────────────────────────────────────┐
│  🖨️ PRINT MODE (Headless)                                       │
│  ─────────────────────────────────                              │
│  DrawPDF.downloadBlueprint(                                     │
│     blueprint,              ← Load saved blueprint              │
│     'file.pdf',             ← Output filename                   │
│     {...data}               ← Inject variables                  │
│  );                                                             │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📝 Template Syntax

You can use these in the editor directly.

### Variables & Formatters

| Syntax | Example Input | Output |
|--------|---------------|--------|
| `{{name}}` | `World` | `World` |
| `{{customer.phone}}` | `{customer: {phone: '0909...'}}` | `0909...` |
| `{{formatNumber val}}` | `1000000` | `1.000.000` |
| `{{formatCurrency val}}` | `500000` | `500.000đ` |
| `{{formatDate val}}` | `2024-01-30` | `30/01/2024` |
| `{{uppercase val}}` | `abc` | `ABC` |

### Loops & Conditionals

```handlebars
{{#each items}}
  - Product: {{name}} | Price: {{formatCurrency price}}
{{/each}}

{{#if total > 1000000}}
  <strong>VIP Customer</strong>
{{else}}
  Regular Customer
{{/if}}
```

### Layout Helpers

- `{{pageBreak}}`: New page.

- `{{br}}`: Line break.
- `{{tab}}`: Tab indentation.

---

## 📚 API Reference (DrawPDF Class)

### Instance Methods

| Method | Description |
|--------|-------------|
| `init(el, options)` | Initialize CKEditor. |
| `getData()` | Get JSON Blueprint. |
| `setData(blueprint)` | Load JSON Blueprint. |
| `render(data)` | Return Data URL (base64). |
| `download(name, data)` | Download PDF file. |
| `getBlob(data)` | Return Blob object (for API upload). |
| `preview(data)` | Open PDF in new tab. |
| `registerFont(url)` | Load custom font dynamically. |

### Static Methods (Headless)

| Method | Description |
|--------|-------------|
| `DrawPDF.renderBlueprint(bp, data, opts)` | Render to Data URL. |
| `DrawPDF.downloadBlueprint(bp, name, data)` | Direct download. |

---

## 🧩 Blueprint JSON Structure

The **Blueprint** is the intermediate format between HTML and PDF.

```json
{
  "version": "1.0",
  "pageSize": { "width": 210, "height": 297, "unit": "mm" },
  "margins": { "top": 20, "bottom": 20, "left": 15, "right": 15 },
  "pages": [
    {
      "pageNumber": 1,
      "elements": [
        { 
          "type": "richtext", 
          "x": 15, 
          "segments": [
             { "text": "Hello ", "style": { "bold": false } },
             { "text": "{{name}}", "style": { "bold": true } }
          ]
        },
        { 
          "type": "table", 
          "rows": [...] 
        }
      ]
    }
  ],
  "sourceHtml": "<p>Original HTML...</p>"
}
```

---

## ⚡ Advanced Config

### Font Configuration

```javascript
const pdf = new DrawPDF({
  fonts: {
    defaultFont: 'Roboto', // Default
    fallback: 'helvetica',
    // Register custom fonts (ES Module format)
    register: [
      'https://cdn.com/fonts/MyFont-Regular.js',
      'https://cdn.com/fonts/MyFont-Bold.js'
    ]
  }
});
```

### Eval Block (Scripting)

Write JavaScript in a code block starting with `// eval` to execute complex logic.

```javascript
// eval
const total = sum(data.items, 'price');
if (total > 1000000) {
    pdf.addText('High Value Order', null, null, { color: [255, 0, 0] });
}
pdf.addTable(['Item', 'Price'], data.items.map(i => [i.name, i.price]));
```

---

## 📄 License

MIT License
