# DrawPDF (masax-drawpdf)

**DrawPDF** là thư viện mạnh mẽ giúp bạn tạo PDF từ nội dung HTML (thông qua CKEditor) hoặc từ dữ liệu JSON Blueprint. Thư viện hỗ trợ Template Engine đầy đủ (biến, vòng lặp, điều kiện), xử lý font tiếng Việt tốt và cho phép render PDF ngay trên trình duyệt.

## Tính Năng Nổi Bật

* 📝 **Trình soạn thảo trực quan**: Tích hợp sẵn CKEditor 5 để thiết kế mẫu PDF dễ dàng.
* 🚀 **Template Engine mạnh mẽ**: Hỗ trợ cú pháp giống Handlebars (`{{variable}}`, `{{#each}}`, `{{#if}}`).
* 🇻🇳 **Hỗ trợ Tiếng Việt**: Font Roboto mặc định, hỗ trợ Unicode đầy đủ, định dạng tiền tệ/ngày tháng Việt Nam.
* 📄 **Xuất PDF chất lượng cao**: Giữ nguyên định dạng, bảng biểu, hình ảnh từ trình soạn thảo.
* 🔧 **Linh hoạt**: Chạy được cả chế độ có giao diện (UI) và headless (chỉ render).

---

## Cài đặt

```bash
npm install masax-drawpdf
```

## Sử Dụng

### 1. Cách dùng cơ bản (ES Modules)

```javascript
import DrawPDF from 'masax-drawpdf';

// 1. Khởi tạo
const pdf = new DrawPDF();

// 2. Gắn vào DOM (kèm cấu hình CKEditor nếu muốn)
await pdf.init('#editor-container');

// ... Người dùng soạn thảo văn bản ...

// 3. Render ra PDF và tải xuống
// Bạn có thể truyền data vào để thay thế các biến {{variable}}
const data = {
    name: "Nguyễn Văn A",
    total: 5000000
};

// Tải xuống ngay
pdf.download('hoadon.pdf', data);

// Hoặc lấy Data URL để hiển thị
const url = pdf.render(data);
console.log(url); // data:application/pdf;base64,...
```

### 2. Dùng qua thẻ Script (CDN)

Nếu không dùng bundler (Webpack/Vite), bạn có thể nhúng trực tiếp:

```html
<!-- Import thư viện (đã bao gồm CKEditor và jsPDF) -->
<script src="https://unpkg.com/masax-drawpdf@2.1.0/dist/drawpdf.standalone.umd.cjs"></script>

<div id="editor"></div>

<script>
    // Truy cập qua biến toàn cục DrawPDF
    DrawPDF.create('#editor').then(instance => {
        console.log('Editor đã sẵn sàng!');
        
        // Nút tải PDF
        document.getElementById('btn-download').onclick = () => {
            instance.download('mau-don.pdf', {
                ngay: '30/01/2025'
            });
        };
    });
</script>
```

---

## Template Engine (Cú pháp mẫu)

Bạn có thể viết trực tiếp các cú pháp sau vào trong trình soạn thảo CKEditor.

### Biến (Variables)

```handlebars
Xin chào {{customer.name}}!
Số điện thoại: {{customer.phone}}
```

### Định dạng dữ liệu (Formatters)

Hỗ trợ sẵn các hàm định dạng phổ biến cho người Việt:

* **Số**: `{{formatNumber 1000000}}` -> `1.000.000`
* **Tiền tệ**: `{{formatCurrency 500000}}` -> `500.000đ`
* **Ngày tháng**: `{{formatDate "2024-01-30"}}` -> `30/01/2024`
* **Chữ cái**: `{{uppercase name}}`, `{{lowercase name}}`, `{{capitalize name}}`

### Vòng lặp (Loops)

Dùng để tạo bảng hoặc danh sách từ mảng dữ liệu.

```handlebars
{{#each items}}
  - Sản phẩm: {{name}} | Giá: {{formatCurrency price}}
{{/each}}
```

**Biến đặc biệt trong vòng lặp:**

* `{{@index}}`: Số thứ tự (bắt đầu từ 0).
* `{{@first}}`: `true` nếu là phần tử đầu.
* `{{@last}}`: `true` nếu là phần tử cuối.
* `{{this}}` hoặc `{{@item}}`: Lấy chính phần tử đó (nếu mảng là chuỗi/số).

### Điều kiện (Conditionals)

```handlebars
{{#if total > 1000000}}
  Khách hàng VIP
{{else}}
  Khách hàng thường
{{/if}}
```

Hỗ trợ các toán tử: `===`, `!==`, `>`, `<`, `>=`, `<=`.

### Thông tin ngày giờ hiện tại

* `{{now}}`: Ngày giờ hiện tại đầy đủ.
* `{{today}}`: Ngày hiện tại (dd/MM/yyyy).
* `{{year}}`, `{{month}}`, `{{day}}`, `{{time}}`.

### Layout

* `{{pageBreak}}`: Ngắt trang bắt buộc tại vị trí này.

---

## API Documentation

### Class `DrawPDF`

Khởi tạo đối tượng quản lý PDF.

```javascript
const instance = new DrawPDF(options);
```

**`options` (Object):**

* `format` (string): Khổ giấy. Mặc định `'a4'`. (Hỗ trợ 'a3', 'a5', 'letter'...)
* `orientation` (string): Hướng giấy. Mặc định `'portrait'` (dọc). Chọn `'landscape'` cho ngang.
* `fonts` (Object): Cấu hình font (xem phần Font bên dưới).

#### Các phương thức (Methods)

| Tên | Tham số | Mô tả |
| :--- | :--- | :--- |
| `init(el, config)` | `el`: Selector/Element<br>`config`: CKEditor config | Khởi tạo Editor vào element. |
| `getData()` | - | Lấy cấu trúc JSON Blueprint hiện tại từ Editor. |
| `setData(blueprint)` | `blueprint`: Object | Nạp dữ liệu JSON Blueprint vào Editor. |
| `download(name, data)` | `name`: Tên file<br>`data`: Dữ liệu biến | Render và tải xuống file PDF. |
| `render(data)` | `data`: Dữ liệu biến | Trả về Data URL (base64) của PDF. |
| `preview(data)` | `data`: Dữ liệu biến | Mở PDF trong tab mới để xem trước. |
| `getBlob(data)` | `data`: Dữ liệu biến | Trả về Blob object (dể gửi lên server). |
| `registerFont(url)` | `url`: Link file JS font | Đăng ký thêm font mới động. |

### Static Methods (Dùng không cần khởi tạo Editor)

Dùng cho trường hợp bạn đã có JSON Blueprint (lưu trong database) và muốn render lại mà không cần hiện UI editor.

```javascript
import DrawPDF from 'masax-drawpdf';

// Render từ blueprint có sẵn
const pdfUrl = DrawPDF.renderBlueprint(blueprintJson, data, {
    format: 'a4',
    fonts: { ... }
});

// Tải xuống trực tiếp
DrawPDF.downloadBlueprint(blueprintJson, 'filename.pdf', data);
```

---

## Quản lý Font (Custom Fonts)

Mặc định thư viện sử dụng font **Roboto** để hỗ trợ tiếng Việt.

Để thêm font khác (ví dụ: `OpenSans`), bạn cần file font đã được convert sang dạng JS module (dùng tool của jsPDF).

```javascript
const pdf = new DrawPDF({
    fonts: {
        // Tên font mặc định
        defaultFont: 'OpenSans',
        
        // Link tới các file font JS cần load
        register: [
            'https://your-cdn.com/fonts/OpenSans-Regular-normal.js',
            'https://your-cdn.com/fonts/OpenSans-Bold-bold.js'
        ]
    }
});
```

---

## License

MIT License.
