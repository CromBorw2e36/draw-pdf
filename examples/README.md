# DrawPDF Examples

Các ví dụ sử dụng thư viện DrawPDF.

## Chạy Examples

```bash
# 1. Install & Build
npm install
npm run build

# 2. Start server
npm run dev

# 3. Mở: http://localhost:3000/examples/basic-usage.html
```

---

## Cách sử dụng

### Design Mode (Thiết kế với CKEditor)

```javascript
import DrawPDF from 'drawpdf';

// Khởi tạo CKEditor
const pdf = await DrawPDF.create('#editor');

// Lấy JSON Blueprint
const blueprint = pdf.getData();

// Save để dùng sau
localStorage.setItem('template', JSON.stringify(blueprint));

// Preview PDF
pdf.preview({ name: 'Test' });
```

---

### Print Mode (In PDF từ blueprint)

```javascript
import DrawPDF from 'drawpdf';

// Không cần CKEditor! Method chaining:
const blueprint = JSON.parse(localStorage.getItem('template'));

new DrawPDF()
  .setData(blueprint)
  .download('output.pdf', { name: 'Nguyễn Văn An' });
```

---

### Browser (UMD)

```html
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js"></script>
<script src="https://cdnjs.cloudflare.com/ajax/libs/jspdf-autotable/3.8.1/jspdf.plugin.autotable.min.js"></script>
<script src="dist/drawpdf.umd.cjs"></script>

<script>
  // Print Mode - từ blueprint có sẵn
  const blueprint = { /* JSON Blueprint */ };
  
  new DrawPDF.default()
    .setData(blueprint)
    .download('output.pdf', { name: 'Test' });
</script>
```

---

### Advanced API

```javascript
import { CKEditorParser, PDFRenderer } from 'drawpdf';

const parser = new CKEditorParser();
const renderer = new PDFRenderer();

const blueprint = parser.parse('<h1>Hello {{name}}</h1>');
renderer.render(blueprint, { name: 'World' });
renderer.download('output.pdf');
```

---

## 📝 Template Syntax

### Variables

```html
{{name}}                     <!-- Simple variable -->
{{employee.department.name}} <!-- Nested object -->
{{formatNumber salary}}      <!-- With helper -->
{{formatCurrency price}}     <!-- Currency format -->
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

Chèn code block với `// eval` để thực thi JavaScript trực tiếp trong template:

```javascript
// eval
const total = sum(data.items, 'price');
pdf.addText('Tổng cộng: ' + formatCurrency(total));

pdf.addTable(
  ['Tên', 'Giá'],
  data.items.map(i => [i.name, formatCurrency(i.price)])
);
```

**Các biến có sẵn trong eval:**

| Variable | Description |
|----------|-------------|
| `pdf` | JsPdfService instance |
| `data` | Template data object |
| `formatNumber()` | Format số |
| `formatCurrency()` | Format tiền tệ |
| `formatDate()` | Format ngày |
| `sum(arr, key)` | Tính tổng |
| `count(arr)` | Đếm phần tử |
| `today()` | Ngày hôm nay |
| `year()` | Năm hiện tại |

**PDF methods:**

```javascript
pdf.addText('Hello', x, y, options);
pdf.addTitle('Title');
pdf.addTable(headers, rows);
pdf.addSpace(10);
pdf.addHorizontalLine();
pdf.addNewPage();
```

---

## 📄 License

MIT License

Copyright (c) 2026 masax

Permission is hereby granted, free of charge, to any person obtaining a copy
of this software and associated documentation files (the "Software"), to deal
in the Software without restriction, including without limitation the rights
to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the Software is
furnished to do so, subject to the following conditions:

The above copyright notice and this permission notice shall be included in all
copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE
SOFTWARE.
