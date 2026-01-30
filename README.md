# DrawPDF

DrawPDF is a powerful library for generating PDFs from HTML/CKEditor content using a JSON Blueprint approach. It decouples the editor from the renderer, allowing for high-performance client-side PDF generation using `jsPDF`.

## Features
- **CKEditor Integration**: WYSIWYG editing with variable support (`{{variable}}`).
- **JSON Blueprint**: Parses HTML into a structured JSON format, making templates portable and lightweight.
- **Direct PDF Drawing**: Renders PDFs by drawing text/images directly using `jsPDF`, avoiding `html2canvas` blurriness.
- **Paper Size Support**: Configurable paper sizes (A3, A4, A5, Letter, Legal) and orientation.
- **Custom Fonts**: Support for custom fonts (e.g., Roboto for Vietnamese).

## Installation

### 1. Using NPM
```bash
npm install draw-pdf
```

### 2. Browser (UMD)
Include the standalone bundle which includes DrawPDF, jsPDF, and CKEditor.

```html
<script src="path/to/dist/drawpdf.standalone.umd.cjs"></script>
```

## Usage

### 1. Browser (UMD) Example

```html
<!DOCTYPE html>
<html>
<head>
    <title>DrawPDF Example</title>
</head>
<body>
    <div id="editor"></div>
    <button id="downloadBtn">Download PDF</button>

    <!-- Load Library -->
    <script src="./dist/drawpdf.standalone.umd.cjs"></script>

    <script>
        document.addEventListener('DOMContentLoaded', async () => {
            const DrawPDF = window.DrawPDF.default;

            // 1. Initialize with Configuration
            const pdf = new DrawPDF({
                format: 'a3',          // 'a3', 'a4', 'a5', 'letter', 'legal'
                orientation: 'landscape', // 'portrait' or 'landscape'
                fonts: {
                    defaultFont: 'Roboto'
                }
            });

            // 2. Initialize Editor
            await pdf.init('#editor');

            // 3. Set Data (Optional - useful for loading templates)
            // pdf.setData(blueprintJson);

            // 4. Download on Click
            document.getElementById('downloadBtn').addEventListener('click', () => {
                const data = {
                    name: 'Nguyen Van A',
                    date: '30/01/2026'
                };
                
                // Downloads 'contract.pdf' with variables replaced
                pdf.download('contract.pdf', data);
            });
        });
    </script>
</body>
</html>
```

### 2. ES Modules (React/Vue/Vite)

```javascript
import DrawPDF from 'draw-pdf';

// 1. Create Instance
const pdf = new DrawPDF({
    format: 'a4',
    orientation: 'portrait'
});

// 2. Initialize in mounted hook
await pdf.init(document.querySelector('#editor'));

// 3. Generate PDF
const dataUrl = pdf.render({ name: 'Test' });
```

## API Reference

### `new DrawPDF(options)`
Creates a new instance.
- `options.format`: Paper size. Default: `'a4'`.
    - Values: `'a3'`, `'a4'`, `'a5'`, `'letter'`, `'legal'`
- `options.orientation`: Orientation. Default: `'portrait'`.
    - Values: `'portrait'`, `'landscape'`
- `options.fonts`: Font configuration.
    - `defaultFont`: Font name to use (default: `'Roboto'`).
    - `register`: Array of font URLs to load.

### `init(selector, editorOptions)`
Initializes CKEditor in the target element.
- `selector`: CSS selector or DOM element.
- `editorOptions`: Configuration object passed to CKEditor.

### `download(filename, data)`
Generates and downloads the PDF.
- `filename`: Name of the file (e.g., `'report.pdf'`).
- `data`: Object containing values for variables (e.g., `{ name: 'John' }`).

### `render(data)`
Generates PDF and returns it as a Data URL (base64 string).

### `getData()`
Returns the current JSON Blueprint from the editor content.

### Static Methods
- `DrawPDF.renderBlueprint(blueprint, data, options)`: Render PDF from JSON without an editor (headless mode).
- `DrawPDF.downloadBlueprint(blueprint, filename, data, options)`: Download PDF from JSON without an editor.

## Development

### Build
```bash
# Build all formats (UMD, ESM)
npm run build
```

### Run Example
```bash
npm run dev
```

## License
MIT
