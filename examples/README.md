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

### Full Bundle (Recommended)

Dùng bản `full` để có sẵn mọi thứ: **Core + jsPDF + autoTable + CKEditor** trong 1 file duy nhất.

```javascript
/* ES Module (Vite/Webpack) */
import DrawPDF from 'drawpdf/dist/drawpdf.full.js';

// Init CKEditor Design Mode
const pdf = await DrawPDF.create('#editor');

// Or just print
const blueprint = DrawPDF.parseHtml(html);
DrawPDF.downloadBlueprint(blueprint, 'doc.pdf');
```

```html
<!-- Browser (Direct Link) -->
<script type="module">
  import DrawPDF from './dist/drawpdf.full.js';
  
  // Tự động có sẵn window.CKEDITOR
  // Tự động có sẵn window.jspdf
  
  // Design mode
  DrawPDF.create('#editor');
</script>
```

### Browser (UMD - Legacy)

Lưu ý: Bản UMD `drawpdf.umd.cjs` chỉ chứa core logic. Bạn phải tự nhúng dependencies:

```html
<!-- Chỉ cần 1 file duy nhất -->
<script src="dist/drawpdf.standalone.umd.cjs"></script>

<script>
  (async () => {
    // DrawPDF sẽ được expose vào window.DrawPDF
    const DrawPDF = window.DrawPDF.default;
    
    // Design Mode (Async)
    const pdf = await DrawPDF.create('#editor');
  })();
</script>
```

---

### Advanced API (Low-level)

Nếu bạn cần kiểm soát chi tiết từng bước (VD: tùy chỉnh jsPDF instance):

```javascript
import { CKEditorParser, PDFRenderer } from 'drawpdf';

const parser = new CKEditorParser();
const renderer = new PDFRenderer();

// 1. Parse manual HTML
const blueprint = parser.parse('<h1>Hello {{name}}</h1>');

// 2. Render
renderer.render(blueprint, { name: 'World' });

// 3. Access internal jsPDF
const doc = renderer.pdf.doc;
doc.addPage();
doc.text('Extra page', 10, 10);

// 4. Download
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
