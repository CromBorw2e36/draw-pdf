// Load hình chữ ký mẫu (sửa lỗi CORS)
async function loadSignatureImage() {
    try {
        // Cách 1: Sử dụng fetch để load hình
        const response = await fetch('../image/chu-ki-mau.jpg');
        if (!response.ok) throw new Error('Không thể load hình');
        
        const blob = await response.blob();
        return new Promise((resolve) => {
            const reader = new FileReader();
            reader.onload = function(e) {
                resolve(e.target.result);
            };
            reader.readAsDataURL(blob);
        });
    } catch (error) {
        console.warn('Không thể load hình chữ ký, sử dụng chữ ký thường');
        return null;
    }
}

// Tạo hình chữ ký mẫu bằng canvas (backup method)
function createSampleSignature() {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = 120;
    canvas.height = 50;
    
    // Nền trắng
    ctx.fillStyle = 'white';
    ctx.fillRect(0, 0, 120, 50);
    
    // Viết chữ ký mẫu
    ctx.fillStyle = 'blue';
    ctx.font = 'italic 16px cursive';
    ctx.fillText('Nguyễn Văn A', 10, 30);
    
    // Thêm một số đường cong để giống chữ ký
    ctx.strokeStyle = 'blue';
    ctx.lineWidth = 2;
    ctx.beginPath();
    ctx.moveTo(10, 35);
    ctx.quadraticCurveTo(60, 45, 110, 35);
    ctx.stroke();
    
    return canvas.toDataURL('image/jpeg');
}

// Upload hình chữ ký từ user
function uploadSignatureImage() {
    return new Promise((resolve) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        
        input.onchange = function(event) {
            const file = event.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    resolve(e.target.result);
                };
                reader.readAsDataURL(file);
            } else {
                resolve(null);
            }
        };
        
        input.click();
    });
}

// Tạo PDF với chữ ký tùy chọn
async function createPDFWithCustomSignature() {
    console.log('Chọn hình chữ ký của bạn...');
    const customSignature = await uploadSignatureImage();
    
    if (customSignature) {
        const pdf = new JsPdfService();
        pdf.addTitle('PDF VỚI CHỮ KÝ TÙY CHỌN')
            .addSpace(30)
            .addParagraph('Đây là PDF với chữ ký được upload từ máy tính của bạn.')
            .addSpace(30);
            
        await pdf.addSignatureWithImage('Tên của bạn', 'CHỨC VỤ', customSignature, new Date().toLocaleDateString('vi-VN'));
        pdf.savePDF();
    } else {
        console.log('Không có hình được chọn');
    }
}

// Demo đơn xin nghỉ phép - Test tự động sang trang
async function createLeaveRequestDemo() {
    const pdf = new JsPdfService();
    
    // Header - Thông tin công ty
    pdf.addText('CÔNG TY TNHH ABC TECHNOLOGY', null, null, {
            fontSize: 14,
            fontStyle: 'bold',
            align: 'center'
        })
        .addText('Địa chỉ: 123 Đường Nguyễn Văn Linh, Quận 7, TP.HCM', null, null, {
            fontSize: 10,
            align: 'center'
        })
        .addText('Điện thoại: 028-1234-5678 | Email: contact@abc.com', null, null, {
            fontSize: 10,
            align: 'center'
        })
        .addLine()
        .addSpace(6)
        
        // Tiêu đề chính
        .addTitle('ĐƠN XIN NGHỈ PHÉP', {
            fontSize: 20,
            fontStyle: 'bold',
            color: [220, 20, 60]
        })
        .addSpace(8)
        
        // Thông tin người xin nghỉ
        .addText('Kính gửi: Ban Giám đốc Công ty TNHH ABC Technology', null, null, {
            fontSize: 12,
            fontStyle: 'bold'
        })
        .addSpace(6)
        
        .addText('Tôi tên là: Nguyễn Văn Nam', null, null, { fontSize: 12 })
        .addText('Chức vụ: Nhân viên Phát triển Phần mềm', null, null, { fontSize: 12 })
        .addText('Phòng ban: Phòng Công nghệ Thông tin', null, null, { fontSize: 12 })
        .addText('Mã số nhân viên: NV001234', null, null, { fontSize: 12 })
        .addSpace(8)
        
        // Nội dung đơn
        .addSubTitle('NỘI DUNG ĐƠN XIN NGHỈ PHÉP')
        .addParagraph('Do có việc gia đình đột xuất cần giải quyết gấp, tôi xin được phép nghỉ làm từ ngày 15/11/2025 đến ngày 20/11/2025 (tổng cộng 6 ngày làm việc).')
        
        .addParagraph('Trong thời gian nghỉ phép, tôi đã sắp xếp và bàn giao công việc như sau:')
        
        .addBulletPoint('Hoàn thành tất cả các task được giao trong dự án WebApp trước ngày 14/11/2025')
        .addBulletPoint('Bàn giao code và tài liệu kỹ thuật cho anh Trần Văn B (Team Lead)')
        .addBulletPoint('Cập nhật tiến độ dự án lên hệ thống quản lý JIRA')
        .addBulletPoint('Thông báo với khách hàng về lịch trình tạm dừng và ngày quay lại làm việc')
        .addBulletPoint('Hướng dẫn anh Lê Văn C xử lý các vấn đề kỹ thuật có thể phát sinh')
        
        .addSpace(6)
        .addParagraph('Tôi cam kết sẽ hoàn thành toàn bộ công việc còn dang dở sau khi trở lại làm việc vào ngày 21/11/2025. Trong trường hợp khẩn cấp, tôi có thể được liên hệ qua số điện thoại: 0901-234-567.')
        
        .addSpace(6)
        .addParagraph('Kính mong Ban Giám đốc xem xét và chấp thuận đơn xin nghỉ phép của tôi.')
        
        .addSpace(20);
        
        // Chữ ký người xin nghỉ - Sử dụng file path trực tiếp
        await pdf.addSignatureFromFile('Nguyễn Văn Nam', 'NGƯỜI XIN NGHỈ PHÉP', '../image/chu-ki-mau.jpg', 'TP.HCM, ngày 10 tháng 11 năm 2025');
        
        pdf.addSpace(30)
        
        // Phần ý kiến phê duyệt
        .addLine()
        .addSubTitle('Ý KIẾN PHÊ DUYỆT CỦA CẤP TRÊN TRỰC TIẾP')
        .addSpace(10)
        
        .addText('□ Đồng ý cho nghỉ phép', null, null, { fontSize: 12 })
        .addText('□ Không đồng ý', null, null, { fontSize: 12 })
        .addText('□ Khác: ________________________', null, null, { fontSize: 12 })
        
        .addSpace(15);
        
        // Chữ ký với fallback thông minh
        await pdf.addSmartSignature('Trần Văn Bình', 'TRƯỞNG PHÒNG IT', {
            imagePath: '../image/chu-ki-mau.jpg',
            fallbackText: 'T.V.Bình',
            createFallback: true
        }, 'Ngày ___/___/2025');
        
        pdf.addSpace(30)
        
        // Phần HR
        .addLine()
        .addSubTitle('Ý KIẾN CỦA PHÒNG NHÂN SỰ')
        .addSpace(10)
        
        .addText('Ghi chú về ngày phép năm còn lại: _______ ngày', null, null, { fontSize: 12 })
        .addText('Tình trạng lương: □ Có lương □ Không lương', null, null, { fontSize: 12 })
        .addText('Ghi chú khác: ________________________________________', null, null, { fontSize: 12 })
        
        .addSpace(15)
        .addSignature('Lê Thị Mai', 'TRƯỞNG PHÒNG NHÂN SỰ', 'Ngày ___/___/2025')
        
        .addSpace(20)
        
        // Phần ban giám đốc
        .addLine()
        .addSubTitle('QUYẾT ĐỊNH CỦA BAN GIÁM ĐỐC')
        .addSpace(10)
        
        .addText('□ Chấp thuận nghỉ phép theo đúng thời gian đề xuất', null, null, { fontSize: 12 })
        .addText('□ Chấp thuận nhưng điều chỉnh thời gian: Từ ___/___/___ đến ___/___/___', null, null, { fontSize: 12 })
        .addText('□ Không chấp thuận', null, null, { fontSize: 12 })
        .addText('Lý do: ________________________________________', null, null, { fontSize: 12 })
        .addText('_____________________________________________', null, null, { fontSize: 12 })
        
        .addSpace(15);
        
        // Chữ ký giám đốc - sử dụng text fallback
        await pdf.addSmartSignature('Phạm Minh Đức', 'GIÁM ĐỐC CÔNG TY', {
            imagePath: '../image/chu-ki-giam-doc.jpg', // File không tồn tại
            fallbackText: 'P.M.Đức',
            createFallback: true
        }, 'Ngày ___/___/2025');
        
        // Footer với số trang
        pdf.addFooter('Trang {pageNumber} / {totalPages} - Mẫu đơn xin nghỉ phép', {
            fontSize: 8,
            align: 'center'
        });
    
    return pdf;
}

// Demo chữ ký đôi
function createDualSignatureDemo() {
    const pdf = new JsPdfService();
    
    pdf.addTitle('BIÊN BẢN GIAO NHẬN CÔNG VIỆC')
        .addSpace(20)
        .addParagraph('Hôm nay, ngày 10 tháng 11 năm 2025, tại Công ty ABC Technology, chúng tôi gồm có:')
        .addSpace(10)
        
        .addText('BÊN GIAO: Anh Nguyễn Văn A - Nhân viên cũ', null, null, { fontSize: 12 })
        .addText('BÊN NHẬN: Anh Trần Văn B - Nhân viên mới', null, null, { fontSize: 12 })
        .addSpace(15)
        
        .addParagraph('Tiến hành giao nhận các công việc sau:')
        .addBulletPoint('Dự án WebApp ABC - 80% hoàn thành')
        .addBulletPoint('Database và tài liệu kỹ thuật')  
        .addBulletPoint('Tài khoản hệ thống và mật khẩu')
        .addBulletPoint('Danh sách khách hàng và liên hệ')
        .addSpace(30)
        
        // Chữ ký đôi
        .addDualSignature(
            {
                name: 'Nguyễn Văn A',
                title: 'BÊN GIAO',
                date: 'Ngày 10/11/2025'
            },
            {
                name: 'Trần Văn B', 
                title: 'BÊN NHẬN',
                date: 'Ngày 10/11/2025'
            }
        )
        .addSpace(30)
        
        .addLine()
        .addSpace(20)
        .addSignature('Phạm Minh Đức', 'GIÁM ĐỐC XÁC NHẬN', 'TP.HCM, ngày 10/11/2025');
        
    return pdf;
}

// Demo so sánh các loại chữ ký
async function createSignatureComparisonDemo() {
    const pdf = new JsPdfService();
    let signatureImage = await loadSignatureImage();
    if (!signatureImage) {
        signatureImage = createSampleSignature();
    }
    
    pdf.addTitle('SO SÁNH CÁC LOẠI CHỮ KÝ')
        .addSpace(20)
        
        .addSubTitle('1. Chữ ký thường (văn bản)')
        .addSignature('Nguyễn Văn A', 'NHÂN VIÊN', 'Ngày 10/11/2025')
        .addSpace(20)
        
        .addSubTitle('2. Chữ ký có hình ảnh')
        await pdf.addSignatureWithImage('Nguyễn Văn A', 'NHÂN VIÊN', signatureImage, 'Ngày 10/11/2025');
        
        pdf.addSpace(20)
        
        .addSubTitle('3. Chữ ký đơn giản với đường kẻ')
        .addSimpleSignature('Nguyễn Văn A', 'NHÂN VIÊN')
        .addSpace(20)
        
        .addSubTitle('4. Chữ ký đôi')
        .addDualSignature(
            { name: 'Người ký 1', title: 'CHỨC VỤ 1', date: '10/11/2025' },
            { name: 'Người ký 2', title: 'CHỨC VỤ 2', date: '10/11/2025' }
        );
        
    return pdf;
}

// Demo các cách thêm chữ ký khác nhau
async function createSignatureMethodsDemo() {
    const pdf = new JsPdfService();
    
    pdf.addTitle('DEMO CÁC CÁCH THÊM CHỮ KÝ')
        .addSpace(15)
        
        .addSubTitle('1. Chữ ký từ file path')
        .addParagraph('Sử dụng addSignatureFromFile() để load trực tiếp từ đường dẫn file:');
        
    // Method 1: Từ file path
    await pdf.addSignatureFromFile('Nguyễn Văn A', 'NHÂN VIÊN', '../image/chu-ki-mau.jpg', 'Ngày 10/11/2025');
    
    pdf.addSpace(15)
        .addSubTitle('2. Chữ ký thông minh với fallback')
        .addParagraph('Sử dụng addSmartSignature() - tự động fallback nếu không load được hình:');
    
    // Method 2: Smart signature với fallback
    await pdf.addSmartSignature('Trần Văn B', 'TRƯỞNG PHÒNG', {
        imagePath: '../image/chu-ki-khong-ton-tai.jpg', // File không tồn tại
        fallbackText: 'T.V.B',
        createFallback: true
    }, 'Ngày 10/11/2025');
    
    pdf.addSpace(15)
        .addSubTitle('3. Chữ ký text được tạo tự động')
        .addParagraph('Sử dụng createTextSignature() để tạo chữ ký từ text:');
        
    // Method 3: Text signature
    const textSignature = pdf.createTextSignature('Lê Thị C');
    await pdf.addSignatureWithImage('Lê Thị C', 'PHÒNG NHÂN SỰ', textSignature, 'Ngày 10/11/2025');
    
    pdf.addSpace(15)
        .addSubTitle('4. Chữ ký với nhiều tùy chọn')
        .addParagraph('Kết hợp nhiều option trong một lần gọi:');
        
    // Method 4: Full options
    await pdf.addSmartSignature('Phạm Minh D', 'GIÁM ĐỐC', {
        imagePath: '../image/chu-ki-mau.jpg',
        fallbackText: 'P.M.D - CEO',
        createFallback: true
    }, 'TP.HCM, ngày 10/11/2025', {
        align: 'center',
        imageWidth: 80,
        imageHeight: 25
    });
    
    return pdf;
}

// Demo các tính năng ảnh của jsPDF
async function createImageFeaturesDemo() {
    const pdf = new JsPdfService();
    
    pdf.addTitle('DEMO TÍNH NĂNG ẢNH JSPDF')
        .addSpace(15)
        
        .addSubTitle('1. Ảnh cơ bản với caption')
        .addParagraph('Thêm ảnh với caption và căn chỉnh:');
    
    // Test ảnh có sẵn
    try {
        await pdf.addImageFromPath('../image/chu-ki-mau.jpg', null, null, 100, 60, {
            align: 'center',
            caption: 'Hình 1: Chữ ký mẫu',
            border: true
        });
    } catch (error) {
        console.log('Sẽ tạo ảnh demo');
    }
    
    pdf.addSpace(15)
        .addSubTitle('2. Ảnh với border và alignment')
        .addParagraph('Căn giữa, có viền, caption tùy chỉnh:');
    
    // Tạo ảnh demo bằng canvas
    const demoImage = createDemoImage('DEMO IMAGE', 'green');
    pdf.addImage(demoImage, null, null, 120, 80, {
        align: 'center',
        border: true,
        borderOptions: {
            width: 2,
            color: [0, 100, 0]
        },
        caption: 'Hình 2: Ảnh demo với border xanh',
        captionOptions: {
            fontSize: 10,
            fontStyle: 'bold',
            color: [0, 100, 0]
        }
    });
    
    pdf.addSpace(15)
        .addSubTitle('3. Ảnh auto-fit kích thước')
        .addParagraph('Tự động resize để vừa khung:');
    
    // Test auto-fit
    const largeImage = createDemoImage('LARGE IMAGE\n200x200', 'red', 200, 200);
    await pdf.addImageFit(largeImage, null, null, 100, 60, {
        align: 'left',
        caption: 'Hình 3: Ảnh lớn được resize tự động'
    });
    
    pdf.addSpace(15)
        .addSubTitle('4. Multiple images in row')
        .addParagraph('Nhiều ảnh trên cùng một dòng:');
    
    const currentY = pdf.getCurrentY();
    
    // Ảnh 1
    const img1 = createDemoImage('IMG 1', 'blue', 80, 50);
    pdf.addImage(img1, 20, currentY, 70, 45, {
        caption: 'Ảnh 1'
    });
    
    // Reset Y để vẽ ảnh 2 cùng dòng
    pdf.currentY = currentY;
    const img2 = createDemoImage('IMG 2', 'orange', 80, 50);
    pdf.addImage(img2, 110, currentY, 70, 45, {
        caption: 'Ảnh 2'
    });
    
    pdf.addSpace(15)
        .addSubTitle('5. Supported formats')
        .addParagraph('jsPDF hỗ trợ: JPEG, PNG, GIF, WEBP');
    
    // Test PNG
    const pngImage = createDemoImage('PNG FORMAT', 'purple', 100, 60, 'png');
    pdf.addImage(pngImage, null, null, 100, 60, {
        align: 'right',
        caption: 'Hình 4: PNG format'
    });
    
    return pdf;
}

// Tạo ảnh demo bằng canvas
function createDemoImage(text, color = 'blue', width = 120, height = 80, format = 'jpeg') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    canvas.width = width;
    canvas.height = height;
    
    // Background gradient
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, 'white');
    gradient.addColorStop(1, color);
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // Border
    ctx.strokeStyle = color;
    ctx.lineWidth = 3;
    ctx.strokeRect(0, 0, width, height);
    
    // Text
    ctx.fillStyle = 'white';
    ctx.font = 'bold 14px Arial';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    
    const lines = text.split('\n');
    const lineHeight = 20;
    const startY = (height - (lines.length - 1) * lineHeight) / 2;
    
    lines.forEach((line, index) => {
        ctx.fillText(line, width / 2, startY + (index * lineHeight));
    });
    
    // Return appropriate format
    return canvas.toDataURL(`image/${format}`);
}

// Functions để handle button clicks
async function generateLeaveRequestPDF() {
    try {
        console.log('Đang tạo PDF đơn nghỉ phép...');
        const pdf = await createLeaveRequestDemo();
        pdf.savePDF();
    } catch (error) {
        console.error('Lỗi khi tạo PDF:', error);
        alert('Có lỗi xảy ra khi tạo PDF: ' + error.message);
    }
}

async function generateDualSignaturePDF() {
    try {
        console.log('Đang tạo PDF biên bản giao nhận...');
        const pdf = createDualSignatureDemo();
        pdf.savePDF();
    } catch (error) {
        console.error('Lỗi khi tạo PDF:', error);
        alert('Có lỗi xảy ra khi tạo PDF: ' + error.message);
    }
}

async function generateSignatureComparisonPDF() {
    try {
        console.log('Đang tạo PDF so sánh chữ ký...');
        const pdf = await createSignatureComparisonDemo();
        pdf.savePDF();
    } catch (error) {
        console.error('Lỗi khi tạo PDF:', error);
        alert('Có lỗi xảy ra khi tạo PDF: ' + error.message);
    }
}

async function generateSignatureMethodsPDF() {
    try {
        console.log('Đang tạo PDF demo phương thức chữ ký...');
        const pdf = await createSignatureMethodsDemo();
        pdf.savePDF();
    } catch (error) {
        console.error('Lỗi khi tạo PDF:', error);
        alert('Có lỗi xảy ra khi tạo PDF: ' + error.message);
    }
}

async function generateImageFeaturesPDF() {
    try {
        console.log('Đang tạo PDF demo tính năng ảnh...');
        const pdf = await createImageFeaturesDemo();
        pdf.savePDF();
    } catch (error) {
        console.error('Lỗi khi tạo PDF:', error);
        alert('Có lỗi xảy ra khi tạo PDF: ' + error.message);
    }
}

async function generateAllPDFs() {
    try {
        console.log('Đang tạo tất cả PDF...');
        
        // Tạo đơn nghỉ phép
        const leaveRequestPDF = await createLeaveRequestDemo();
        
        // Tạo biên bản giao nhận
        const dualSigPDF = createDualSignatureDemo();
        
        // Tạo so sánh chữ ký
        const comparisonPDF = await createSignatureComparisonDemo();
        
        // Tạo demo methods
        const methodsPDF = await createSignatureMethodsDemo();
        
        // Log thông tin
        console.log('Thông tin PDF đơn nghỉ phép:', leaveRequestPDF.getPageInfo());
        console.log('Thông tin PDF biên bản:', dualSigPDF.getPageInfo());
        console.log('Thông tin PDF so sánh:', comparisonPDF.getPageInfo());
        console.log('Thông tin PDF methods:', methodsPDF.getPageInfo());
        
        // Preview PDF chính (đơn nghỉ phép)
        leaveRequestPDF.savePDF();
        
        console.log('Đã tạo xong tất cả PDF!');
        
    } catch (error) {
        console.error('Lỗi khi tạo PDF:', error);
        alert('Có lỗi xảy ra: ' + error.message);
    }
}

// Auto-run khi tải trang (chỉ chạy console log)
// Demo Leader Dots
function createLeaderDotsDemo() {
    const pdfService = new JsPdfService();
    
    pdfService.addTitle('Demo Leader Dots')
        .addSpace(15);
    
    // 1. Leader dots cơ bản
    pdfService.addSubTitle('1. Leader Dots Cơ Bản')
        .addLeaderDots('Chương 1: Giới thiệu', '5')
        .addLeaderDots('Chương 2: Phát triển', '15')
        .addLeaderDots('Chương 3: Kết luận và khuyến nghị', '25')
        .addSpace(15);
    
    // 2. Table of Contents
    const tocItems = [
        { title: 'Lời nói đầu', page: 3 },
        { title: 'Chương 1: Tổng quan', page: 5 },
        { title: '1.1 Khái niệm cơ bản', page: 7, isSubItem: true },
        { title: '1.2 Phạm vi ứng dụng', page: 12, isSubItem: true },
        { title: 'Chương 2: Thực hiện', page: 18 },
        { title: '2.1 Chuẩn bị', page: 20, isSubItem: true },
        { title: '2.2 Triển khai', page: 25, isSubItem: true },
        { title: 'Kết luận', page: 35 },
        { title: 'Tài liệu tham khảo', page: 40 }
    ];
    
    pdfService.addTableOfContents(tocItems)
        .addNewPage();
    
    // 3. Price List
    const priceItems = [
        { name: 'Combo A - Gà rán + Khoai tây + Nước ngọt', price: 85000 },
        { name: 'Combo B - Burger bò + Khoai tây + Trà đá', price: 95000 },
        { name: 'Combo C - Pizza cỡ vừa + Salad + Nước cam', price: 125000 },
        { name: 'Gà rán (1 miếng)', price: 25000 },
        { name: 'Khoai tây chiên (size M)', price: 20000 },
        { name: 'Nước ngọt các loại', price: 15000 },
        { name: 'Trà đá', price: 10000 }
    ];
    
    pdfService.addPriceList(priceItems, {
        title: 'BẢNG GIÁ THỨC ĂN NHANH'
    }).addNewPage();
    
    // 4. Restaurant Menu
    const menuSections = [
        {
            name: 'KHAI VỊ',
            items: [
                { name: 'Salad trộn', description: 'Rau xanh tươi, sốt mayonnaise', price: 45000 },
                { name: 'Chả cá Lã Vọng', description: 'Đặc sản Hà Nội truyền thống', price: 85000 },
                { name: 'Gỏi cuốn tôm thịt', description: '2 cuốn, kèm tương chấm', price: 35000 }
            ]
        },
        {
            name: 'MÓN CHÍNH',
            items: [
                { name: 'Phở bò tái chín', description: 'Nước dùng niêu 12 tiếng', price: 55000 },
                { name: 'Cơm tấm sườn nướng', description: 'Kèm chả trứng, bì', price: 65000 },
                { name: 'Bún bò Huế', description: 'Đậm đà hương vị cố đô', price: 50000 },
                { name: 'Mì Quảng tôm cua', description: 'Bánh tráng nướng, rau thơm', price: 60000 }
            ]
        },
        {
            name: 'TRÁNG MIỆNG',
            items: [
                { name: 'Chè ba màu', description: 'Đậu xanh, đậu đỏ, thạch', price: 25000 },
                { name: 'Kem flan', description: 'Làm tại nhà, thơm béo', price: 20000 },
                { name: 'Trái cây tươi', description: 'Theo mùa', price: 30000 }
            ]
        }
    ];
    
    pdfService.addMenu(menuSections, {
        title: 'THỰC ĐƠN NHÀ HÀNG VIỆT NAM'
    });
    
    pdfService.addFooter('Trang {pageNumber} / {totalPages}', {
        align: 'center'
    });
    
    pdfService.savePDF('leader-dots-demo.pdf');
}

// Demo Index
function createIndexDemo() {
    const pdfService = new JsPdfService();
    
    pdfService.addTitle('Demo Chỉ Mục (Index)')
        .addSpace(15);
    
    const indexEntries = [
        { term: 'API', pages: ['15', '23', '45'] },
        { term: 'Authentication', pages: ['8', '12'] },
        { term: 'Database', pages: ['25', '30', '35'] },
        { term: 'Error Handling', pages: ['18', '42'] },
        { term: 'Framework', pages: ['5', '10', '20'] },
        { term: 'Git', pages: ['2', '7'] },
        { term: 'HTML', pages: ['12', '15', '18', '22'] },
        { term: 'JavaScript', pages: ['20', '25', '30', '35', '40'] },
        { term: 'JSON', pages: ['28', '32'] },
        { term: 'Node.js', pages: ['35', '38', '42'] },
        { term: 'OAuth', pages: ['8', '13'] },
        { term: 'PDF', pages: ['45', '48', '50'] },
        { term: 'REST API', pages: ['15', '18', '22'] },
        { term: 'Security', pages: ['8', '12', '16'] },
        { term: 'Testing', pages: ['40', '43', '46'] },
        { term: 'Validation', pages: ['18', '25'] },
        { term: 'WebSocket', pages: ['32', '36'] },
        { term: 'XML', pages: ['28', '31'] }
    ];
    
    pdfService.addIndex(indexEntries, {
        title: 'CHỈ MỤC THUẬT NGỮ',
        columns: 2
    });
    
    pdfService.addFooter('Trang {pageNumber} / {totalPages}');
    pdfService.savePDF('index-demo.pdf');
}

// Demo chỉ Table of Contents
function createTableOfContentsDemo() {
    const pdfService = new JsPdfService();
    
    const tocItems = [
        'Lời nói đầu',
        { title: 'Chương I: TỔNG QUAN VỀ DỰ ÁN', page: 5 },
        { title: '1.1. Mục tiêu dự án', page: 7, isSubItem: true },
        { title: '1.2. Phạm vi thực hiện', page: 9, isSubItem: true },
        { title: '1.3. Đối tượng hưởng lợi', page: 12, isSubItem: true },
        { title: 'Chương II: KẾ HOẠCH THỰC HIỆN', page: 15 },
        { title: '2.1. Giai đoạn chuẩn bị', page: 17, isSubItem: true },
        { title: '2.2. Giai đoạn triển khai', page: 22, isSubItem: true },
        { title: '2.3. Giai đoạn nghiệm thu', page: 28, isSubItem: true },
        { title: 'Chương III: NGÂN SÁCH VÀ NGUỒN LỰC', page: 32 },
        { title: '3.1. Dự toán chi phí', page: 34, isSubItem: true },
        { title: '3.2. Nguồn kinh phí', page: 38, isSubItem: true },
        { title: '3.3. Nhân lực thực hiện', page: 41, isSubItem: true },
        { title: 'Chương IV: QUẢN LÝ RỦI RO', page: 45 },
        { title: 'KẾT LUẬN VÀ KHUYẾN NGHỊ', page: 50 },
        { title: 'PHỤ LỤC', page: 55 },
        { title: 'TÀI LIỆU THAM KHẢO', page: 60 }
    ];
    
    pdfService.addTableOfContents(tocItems, {
        title: 'MỤC LỤC ĐỀ ÁN',
        titleOptions: {
            fontSize: 18,
            fontStyle: 'bold',
            align: 'center',
            color: [0, 0, 139]
        }
    });
    
    pdfService.savePDF('table-of-contents-demo.pdf');
}

// Demo Restaurant Menu
function createRestaurantMenuDemo() {
    const pdfService = new JsPdfService();
    
    const menuSections = [
        {
            name: '🥗 SALAD & KHAI VỊ',
            items: [
                { name: 'Caesar Salad', description: 'Xà lách romaine, phô mai parmesan, crouton', price: 150000 },
                { name: 'Salad Nga', description: 'Khoai tây, cà rốt, trứng, mayonnaise', price: 120000 },
                { name: 'Gỏi cuốn tôm thịt', description: 'Bánh tráng tươi, rau thơm, tôm tươi', price: 80000 },
                { name: 'Nem nướng Nha Trang', description: 'Bánh tráng, bún, rau sống', price: 95000 }
            ]
        },
        {
            name: '🍜 PHỞ & BÚN',
            items: [
                { name: 'Phở bò tái chín', description: 'Nước dùng niêu 24h, thịt bò Úc', price: 85000 },
                { name: 'Phở gà', description: 'Gà ta thả vườn, nước dùng ngọt thanh', price: 75000 },
                { name: 'Bún bò Huế', description: 'Đặc sản cố đô, chua cay đậm đà', price: 80000 },
                { name: 'Bún chả Hà Nội', description: 'Thịt nướng than hoa, nem cua bể', price: 90000 },
                { name: 'Bún riêu cua', description: 'Cua đồng tươi, cà chua, tóp mỡ', price: 70000 }
            ]
        },
        {
            name: '🍛 CỠM & MÌ',
            items: [
                { name: 'Cơm tấm sườn nướng', description: 'Sườn non nướng than, chả trứng, bì', price: 95000 },
                { name: 'Cơm gà Hải Nam', description: 'Gà luộc, cơm nấu nước gà, nước mắm gừng', price: 85000 },
                { name: 'Mì Quảng tôm cua', description: 'Bánh tráng nướng, quẹt ớt tôm', price: 90000 },
                { name: 'Cao lầu Hội An', description: 'Mì vàng đặc biệt, char siu, rau thơm', price: 85000 }
            ]
        },
        {
            name: '🍹 THỨC UỐNG',
            items: [
                { name: 'Cà phê đen đá', description: 'Robusta Buôn Ma Thuột nguyên chất', price: 25000 },
                { name: 'Cà phê sữa đá', description: 'Pha phin truyền thống, sữa đặc', price: 30000 },
                { name: 'Trà đá chanh', description: 'Trà tươi, chanh tươi vắt', price: 20000 },
                { name: 'Sinh tố bơ', description: 'Bơ 034 Đắk Lắk, sữa tươi', price: 45000 },
                { name: 'Nước dừa tươi', description: 'Dừa xiêm xanh Bến Tre', price: 35000 }
            ]
        },
        {
            name: '🍰 TRÁNG MIỆNG',
            items: [
                { name: 'Chè ba màu', description: 'Đậu xanh, đậu đỏ, thạch lá cẩm', price: 35000 },
                { name: 'Kem flan', description: 'Làm tại nhà, caramen đắng', price: 30000 },
                { name: 'Bánh flan nướng', description: 'Trứng gà ta, vanilla Madagascar', price: 40000 },
                { name: 'Trái cây theo mùa', description: 'Tùy theo mùa vụ', price: 50000 }
            ]
        }
    ];
    
    pdfService.addMenu(menuSections, {
        title: '🍽️ THỰC ĐƠN NHÀ HÀNG SÓNG VIỆT',
        titleOptions: {
            fontSize: 20,
            fontStyle: 'bold',
            align: 'center',
            color: [220, 20, 60]
        },
        sectionOptions: {
            fontSize: 14,
            fontStyle: 'bold',
            color: [0, 100, 0]
        }
    });
    
    pdfService.addSpace(20)
        .addText('🏠 Địa chỉ: 123 Phố Cổ, Hoàn Kiếm, Hà Nội', null, null, {
            fontSize: 10,
            align: 'center',
            color: [100, 100, 100]
        })
        .addText('📞 Hotline: 0987.654.321 | 🌐 Website: sóngviet.vn', null, null, {
            fontSize: 10,
            align: 'center',
            color: [100, 100, 100]
        });
    
    pdfService.savePDF('restaurant-menu-demo.pdf');
}

// Demo Fill-in Lines
function createFillInLinesDemo() {
    const pdfService = new JsPdfService();
    
    pdfService.addTitle('Demo Fill-in Lines (Đường kẻ điền thông tin)')
        .addSpace(20);
    
    // 1. Fill-in line cơ bản
    pdfService.addSubTitle('1. Fill-in Lines Cơ Bản')
        .addSpace(10);
    
    pdfService.addFillInLine('Họ và tên:', {
        lineLength: 150,
        labelPosition: 'left'
    });
    
    pdfService.addFillInLine('Số điện thoại:', {
        lineLength: 100,
        labelPosition: 'left'
    });
    
    pdfService.addFillInLine('', {
        lineCount: 3,
        lineLength: 180,
        labelPosition: 'above',
        align: 'center'
    });
    pdfService.addText('(Địa chỉ chi tiết)', null, null, {
        fontSize: 9,
        fontStyle: 'italic',
        align: 'center',
        color: [100, 100, 100]
    });
    
    pdfService.addSpace(20);
    
    // 2. Các style khác nhau
    pdfService.addSubTitle('2. Các Style Đường Kẻ')
        .addSpace(10);
    
    pdfService.addFillInLine('Solid line:', {
        lineStyle: 'dots',
        lineWidth: 0.8,
        lineLength: 120
    });
    
    pdfService.addFillInLine('Dashed line:', {
        lineStyle: 'dashed',
        lineWidth: 0.8,
        lineLength: 120
    });
    
    pdfService.addFillInLine('Dotted line:', {
        lineStyle: 'dotted',
        lineWidth: 1,
        lineLength: 120
    });
    
    pdfService.addFillInLine('Dots pattern:', {
        lineStyle: 'dots',
        dotChar: '.',
        dotSpacing: 2,
        lineLength: 120
    });
    
    pdfService.addFillInLine('Custom dots:', {
        lineStyle: 'dots',
        dotChar: '_',
        dotSpacing: 1,
        lineLength: 120
    });
    
    pdfService.addSpace(20);
    
    // 3. Căn chỉnh khác nhau
    pdfService.addSubTitle('3. Căn Chỉnh Khác Nhau')
        .addSpace(10);
    
    pdfService.addFillInLine('Left align:', {
        align: 'left',
        lineLength: 100
    });
    
    pdfService.addFillInLine('Center align:', {
        align: 'center',
        lineLength: 100
    });
    
    pdfService.addFillInLine('Right align:', {
        align: 'right',
        lineLength: 100
    });
    
    pdfService.addSpace(20);
    
    // 4. Label positions
    pdfService.addSubTitle('4. Vị Trí Label Khác Nhau')
        .addSpace(10);
    
    pdfService.addFillInLine('Label Above', {
        labelPosition: 'above',
        align: 'center',
        lineLength: 120
    });
    
    pdfService.addFillInLine('Label Left:', {
        labelPosition: 'left',
        lineLength: 100
    });
    
    pdfService.addFillInLine('', {
        labelPosition: 'right',
        lineLength: 100
    });
    pdfService.addText(': Label Right', this.pageWidth - this.margins.right - 80, this.currentY - 15);
    
    pdfService.addFillInLine('Label Below', {
        labelPosition: 'below',
        align: 'center',
        lineLength: 120
    });
    
    pdfService.addSpace(20);
    
    // 5. Dotted Fill-in tiện ích
    pdfService.addSubTitle('5. Dotted Fill-in Tiện Ích')
        .addSpace(10);
    
    pdfService.addDottedFillIn('Sử dụng addDottedFillIn():', {
        lineLength: 140
    });
    
    pdfService.addCustomDottedLine('Custom pattern:', '_', 1, 120, {
        labelPosition: 'left'
    });
    
    pdfService.addCustomDottedLine('Dots xa nhau:', '.', 5, 120, {
        labelPosition: 'left'
    });
    
    pdfService.addNewPage();
    
    // 6. Form hoàn chỉnh với Line
    pdfService.addSubTitle('6. Form Điền Thông Tin (Lines)')
        .addSpace(15);
    
    const formFields = [
        { label: 'Họ và tên đầy đủ:' },
        { label: 'Ngày sinh:' },
        { label: 'CMND/CCCD:' },
        { label: 'Số điện thoại:' },
        { label: 'Email:' },
        { 
            label: 'Địa chỉ thường trú:', 
            options: { 
                lineCount: 2,
                lineLength: 160 
            } 
        },
        { label: 'Nghề nghiệp:' },
        { label: 'Nơi làm việc:' }
    ];
    
    pdfService.addFillInForm(formFields, {
        title: 'THÔNG TIN CÁ NHÂN (LINES)',
        fieldSpacing: 15
    });
    
    pdfService.addSpace(25);
    
    // 7. Form với Dotted style
    pdfService.addSubTitle('7. Form Với Dotted Style')
        .addSpace(15);
    
    const dottedFields = [
        { label: 'Tên sản phẩm:' },
        { label: 'Số lượng:' },
        { label: 'Đơn giá:' },
        { label: 'Ghi chú:', options: { lineCount: 2 } }
    ];
    
    pdfService.addDottedForm(dottedFields, {
        title: 'THÔNG TIN SẢN PHẨM (DOTS)',
        fieldSpacing: 12
    });
    
    pdfService.addSpace(30);
    
    // 8. Signature lines - Lines vs Dots
    pdfService.addSubTitle('8. Chữ Ký Fill-in - So Sánh')
        .addSpace(15);
    
    pdfService.addText('Chữ ký với Lines (truyền thống):', null, null, {
        fontSize: 11,
        fontStyle: 'bold'
    });
    
    const signers = [
        { title: 'NGƯỜI KÝ (LINES)' },
        { title: 'NGƯỜI XÁC NHẬN' }
    ];
    
    pdfService.addSignatureFillIn(signers, {
        layout: 'horizontal',
        showDate: true
    });
    
    pdfService.addSpace(20);
    
    pdfService.addText('Chữ ký với Dots (phong cách mới):', null, null, {
        fontSize: 11,
        fontStyle: 'bold'
    });
    
    const dottedSigners = [
        { title: 'NGƯỜI KÝ (DOTS)' },
        { title: 'NGƯỜI XÁC NHẬN' }
    ];
    
    pdfService.addDottedSignature(dottedSigners, {
        layout: 'horizontal',
        showDate: true
    });
    
    pdfService.savePDF('fill-in-lines-demo.pdf');
}

// Demo Form đăng ký
function createRegistrationFormDemo() {
    const pdfService = new JsPdfService();
    
    pdfService.addTitle('PHIẾU ĐĂNG KÝ THAM GIA KHÓA HỌC')
        .addSpace(20);
    
    // Thông tin cá nhân
    const personalFields = [
        { label: 'Họ và tên:' },
        { label: 'Ngày sinh:' },
        { label: 'Giới tính:' },
        { label: 'CMND/CCCD:' },
        { label: 'Số điện thoại:' },
        { label: 'Email:' },
        { 
            label: 'Địa chỉ:', 
            options: { 
                lineCount: 2,
                lineLength: 160 
            } 
        }
    ];
    
    pdfService.addFillInForm(personalFields, {
        title: 'I. THÔNG TIN CÁ NHÂN',
        fieldSpacing: 12
    });
    
    pdfService.addSpace(20);
    
    // Thông tin khóa học
    pdfService.addSubTitle('II. THÔNG TIN KHÓA HỌC')
        .addSpace(10);
    
    pdfService.addText('Khóa học đăng ký: □ Lập trình Web  □ Mobile App  □ Data Science  □ AI/ML', null, null, {
        fontSize: 11
    });
    
    pdfService.addSpace(10);
    
    pdfService.addFillInLine('Thời gian học mong muốn:', {
        lineLength: 120,
        labelPosition: 'left'
    });
    
    pdfService.addFillInLine('Ghi chú thêm:', {
        lineCount: 3,
        lineLength: 160,
        labelPosition: 'above'
    });
    
    pdfService.addSpace(30);
    
    // Cam kết
    pdfService.addSubTitle('III. CAM KẾT')
        .addSpace(10);
    
    pdfService.addText('Tôi cam kết:', null, null, { fontSize: 11 })
        .addText('□ Tham gia đầy đủ các buổi học', null, null, { fontSize: 10 })
        .addText('□ Hoàn thành đúng hạn các bài tập', null, null, { fontSize: 10 })
        .addText('□ Tuân thủ nội quy của trung tâm', null, null, { fontSize: 10 });
    
    pdfService.addSpace(30);
    
    // Chữ ký
    const registrationSigners = [
        { title: 'HỌC VIÊN' },
        { title: 'PHÒNG ĐÀO TẠO' }
    ];
    
    pdfService.addSignatureFillIn(registrationSigners, {
        layout: 'horizontal',
        showDate: true,
        signatureWidth: 100
    });
    
    pdfService.savePDF('registration-form-demo.pdf');
}

// Demo Contract Template
function createContractTemplateDemo() {
    const pdfService = new JsPdfService();
    
    pdfService.addTitle('HỢP ĐỒNG DỊCH VỤ')
        .addSpace(15);
    
    // Bên A
    pdfService.addSubTitle('BÊN A (Bên cung cấp dịch vụ):')
        .addSpace(8);
    
    const partyAFields = [
        { label: 'Tên công ty/tổ chức:' },
        { label: 'Người đại diện:' },
        { label: 'Chức vụ:' },
        { label: 'Địa chỉ:', options: { lineCount: 2 } },
        { label: 'Điện thoại:' },
        { label: 'Email:' }
    ];
    
    pdfService.addFillInForm(partyAFields, { fieldSpacing: 10 });
    
    pdfService.addSpace(15);
    
    // Bên B
    pdfService.addSubTitle('BÊN B (Bên sử dụng dịch vụ):')
        .addSpace(8);
    
    const partyBFields = [
        { label: 'Tên khách hàng:' },
        { label: 'CMND/CCCD/MST:' },
        { label: 'Địa chỉ:', options: { lineCount: 2 } },
        { label: 'Điện thoại:' },
        { label: 'Email:' }
    ];
    
    pdfService.addFillInForm(partyBFields, { fieldSpacing: 10 });
    
    pdfService.addSpace(20);
    
    // Nội dung hợp đồng
    pdfService.addSubTitle('NỘI DUNG HỢP ĐỒNG:')
        .addSpace(10);
    
    pdfService.addFillInLine('1. Dịch vụ cung cấp:', {
        lineCount: 3,
        lineLength: 160,
        labelPosition: 'above'
    });
    
    pdfService.addSpace(10);
    
    pdfService.addFillInLine('2. Thời gian thực hiện: Từ ngày', {
        lineLength: 60,
        labelPosition: 'left'
    });
    
    pdfService.addFillInLine('đến ngày', {
        lineLength: 60,
        labelPosition: 'left'
    });
    
    pdfService.addSpace(10);
    
    pdfService.addFillInLine('3. Tổng giá trị hợp đồng:', {
        lineLength: 100,
        labelPosition: 'left'
    });
    
    pdfService.addFillInLine('Bằng chữ:', {
        lineCount: 2,
        lineLength: 160,
        labelPosition: 'left'
    });
    
    pdfService.addSpace(30);
    
    // Chữ ký hợp đồng
    const contractSigners = [
        { title: 'ĐẠI DIỆN BÊN A' },
        { title: 'ĐẠI DIỆN BÊN B' }
    ];
    
    pdfService.addSignatureFillIn(contractSigners, {
        layout: 'horizontal',
        showDate: true
    });
    
    pdfService.savePDF('contract-template-demo.pdf');
}

// Demo chuyên về Dotted Patterns
function createDottedPatternsDemo() {
    const pdfService = new JsPdfService();
    
    pdfService.addTitle('DEMO DOTTED FILL-IN PATTERNS')
        .addSpace(20);
    
    // 1. Các loại dots pattern
    pdfService.addSubTitle('1. Các Loại Dots Pattern')
        .addSpace(10);
    
    pdfService.addCustomDottedLine('Classic dots:', '.', 2, 150);
    pdfService.addCustomDottedLine('Underscore:', '_', 1, 150);
    pdfService.addCustomDottedLine('Dash pattern:', '-', 1, 150);
    pdfService.addCustomDottedLine('Mixed pattern:', '.-', 1, 150);
    pdfService.addCustomDottedLine('Space out:', '.', 8, 150);
    
    pdfService.addSpace(20);
    
    // 2. Different spacing
    pdfService.addSubTitle('2. Khoảng Cách Khác Nhau')
        .addSpace(10);
    
    for (let spacing = 1; spacing <= 6; spacing++) {
        pdfService.addCustomDottedLine(`Spacing ${spacing}:`, '.', spacing, 120);
    }
    
    pdfService.addSpace(20);
    
    // 3. Ứng dụng thực tế
    pdfService.addSubTitle('3. Ứng Dụng Thực Tế - Phiếu Khám Bệnh')
        .addSpace(10);
    
    const medicalFields = [
        { label: 'Họ và tên bệnh nhân:' },
        { label: 'Năm sinh:' },
        { label: 'Địa chỉ:', options: { lineCount: 2 } },
        { label: 'Triệu chứng:', options: { lineCount: 3 } },
        { label: 'Chuẩn đoán:' },
        { label: 'Đơn thuốc:', options: { lineCount: 4 } }
    ];
    
    pdfService.addDottedForm(medicalFields, {
        title: 'PHIẾU KHÁM BỆNH',
        fieldSpacing: 12,
        fieldDefaults: {
            dotChar: '.',
            dotSpacing: 2,
            lineLength: 160
        }
    });
    
    pdfService.addSpace(25);
    
    // Chữ ký bác sĩ
    pdfService.addDottedSignature([
        { title: 'BÁC SĨ KHÁM' }
    ], {
        layout: 'vertical',
        showDate: true
    });
    
    pdfService.addNewPage();
    
    // 4. Invoice với dots
    pdfService.addSubTitle('4. Hóa Đơn Với Dotted Lines')
        .addSpace(15);
    
    pdfService.addText('CÔNG TY TNHH ABC', null, null, {
        fontSize: 14,
        fontStyle: 'bold',
        align: 'center'
    });
    
    pdfService.addText('HÓA ĐơN BÁN HÀNG', null, null, {
        fontSize: 16,
        fontStyle: 'bold',
        align: 'center',
        color: [200, 0, 0]
    });
    
    pdfService.addSpace(15);
    
    const invoiceFields = [
        { label: 'Khách hàng:' },
        { label: 'Địa chỉ:' },
        { label: 'Số điện thoại:' },
        { label: 'Ngày mua:' }
    ];
    
    pdfService.addDottedForm(invoiceFields, {
        fieldSpacing: 10,
        fieldDefaults: {
            dotChar: '.',
            dotSpacing: 3,
            lineLength: 140
        }
    });
    
    pdfService.addSpace(20);
    
    // Bảng sản phẩm đơn giản
    pdfService.addText('CHI TIẾT SẢN PHẨM:', null, null, {
        fontSize: 12,
        fontStyle: 'bold'
    });
    
    for (let i = 1; i <= 5; i++) {
        pdfService.addCustomDottedLine(`${i}. Sản phẩm:`, '.', 2, 100, {
            labelPosition: 'left'
        });
        pdfService.addCustomDottedLine('SL:', '.', 2, 30, {
            labelPosition: 'left'
        });
        pdfService.addCustomDottedLine('Giá:', '.', 2, 60, {
            labelPosition: 'left'
        });
        pdfService.addSpace(5);
    }
    
    pdfService.addSpace(15);
    
    pdfService.addCustomDottedLine('TỔNG CỘNG:', '.', 3, 100, {
        labelPosition: 'left',
        labelOptions: {
            fontSize: 12,
            fontStyle: 'bold'
        }
    });
    
    pdfService.addSpace(25);
    
    // Chữ ký hóa đơn
    pdfService.addDottedSignature([
        { title: 'NGƯỜI BÁN' },
        { title: 'NGƯỜI MUA' }
    ], {
        layout: 'horizontal',
        showDate: true
    });
    
    pdfService.savePDF('dotted-patterns-demo.pdf');
}

console.log('📄 PDF Service đã sẵn sàng! Nhấn các button để test.');
console.log('✍️ Các phương thức chữ ký mới:');
console.log('- addSignatureFromFile(name, title, imagePath, date, options)');
console.log('- addSmartSignature(name, title, imageOptions, date, options)');
console.log('- createTextSignature(text, width, height)');
console.log('🖼️ Các phương thức ảnh mới:');
console.log('- addImageFromPath(path, x, y, w, h, options)');
console.log('- addImageFit(imageData, x, y, maxW, maxH, options)');
console.log('- addImage() với options: align, caption, border, format');
console.log('📑 Các phương thức Leader Dots mới:');
console.log('- addLeaderDots(leftText, rightText, options)');
console.log('- addTableOfContents(items, options)');
console.log('- addPriceList(items, options)');
console.log('- addMenu(sections, options)');
console.log('- addIndex(entries, options)');
console.log('📝 Các phương thức Fill-in Lines mới:');
console.log('- addFillInLine(label, options) - lineStyle: "solid"|"dashed"|"dotted"|"dots"');
console.log('- addFillInForm(fields, options)');
console.log('- addSignatureFillIn(signers, options)');
console.log('🔹 Các phương thức Dotted mới:');
console.log('- addDottedFillIn(label, options) - Dễ dùng cho dots');
console.log('- addDottedForm(fields, options) - Form với dots');
console.log('- addDottedSignature(signers, options) - Chữ ký dots');
console.log('- addCustomDottedLine(label, pattern, spacing, length, options)');
console.log('🎨 Các phương thức Mixed Text mới:');
console.log('- addMixedText(textParts, options) - Text với định dạng hỗn hợp');
console.log('- addMixedParagraph(textParts, options) - Paragraph với định dạng hỗn hợp');
console.log('📝 Các phương thức Auto-Numbering & Indentation mới:');
console.log('- addNumberedText(text, options) - Text có số thứ tự với auto-indent');
console.log('- addNumberedList(items, options) - Danh sách đánh số');
console.log('- addMultiLevelList(items, options) - Danh sách nhiều cấp độ');
console.log('- addOutline(items, options) - Mục lục tự động');
console.log('- resetNumbering(style, startNumber) - Reset số đếm');
console.log('- Hỗ trợ: decimal, roman, alpha, bullet numbering');
console.log('- Tự động thụt lề và word wrapping cho text dài');

// Test function cho Mixed Text
function createMixedTextDemo() {
    const pdfService = new JsPdfService();
    
    pdfService.addTitle('Demo Mixed Text & Paragraph', {
        fontSize: 18,
        color: [0, 0, 139]
    });
    
    pdfService.addSpace(10);
    
    // Demo 1: Mixed text với helper functions
    pdfService.addSubTitle('Demo 1: Sử dụng Helper Functions');
    
    const textParts1 = [
        pdfService.normal('Đây là text '),
        pdfService.bold('bold', [255, 0, 0]),
        pdfService.normal(' và '),
        pdfService.italic('italic', [0, 128, 0]),
        pdfService.normal(' và '),
        pdfService.boldItalic('bold italic', [0, 0, 255]),
        pdfService.normal(' trong cùng một dòng.')
    ];
    
    pdfService.addStyledParagraph(textParts1);
    
    // Demo 2: Mixed text với object format
    pdfService.addSubTitle('Demo 2: Định dạng Object');
    
    const textParts2 = [
        { text: 'Công ty: ', style: 'bold', fontSize: 12 },
        { text: 'ABC Corporation', style: 'normal', color: [0, 100, 200], fontSize: 14 },
        { text: ' - Địa chỉ: ', style: 'bold' },
        { text: '123 Nguyễn Văn Linh, TP.HCM', style: 'italic', color: [100, 100, 100] }
    ];
    
    pdfService.addMixedParagraph(textParts2);
    
    // Demo 3: Text dài với word wrapping
    pdfService.addSubTitle('Demo 3: Text Dài với Word Wrapping');
    
    const longTextParts = [
        pdfService.bold('Lorem ipsum dolor sit amet, '),
        pdfService.normal('consectetur adipiscing elit, sed do eiusmod tempor incididunt ut '),
        pdfService.italic('labore et dolore magna aliqua. ', [200, 0, 0]),
        pdfService.normal('Ut enim ad minim veniam, quis nostrud exercitation '),
        pdfService.boldItalic('ullamco laboris nisi ut aliquip ex ea commodo consequat. ', [0, 150, 0]),
        pdfService.normal('Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.')
    ];
    
    pdfService.addMixedParagraph(longTextParts, {
        align: 'justify',
        lineHeight: 6
    });
    
    // Demo 4: Căn chỉnh center và right
    pdfService.addSubTitle('Demo 4: Các Kiểu Căn Chỉnh');
    
    const centerText = [
        pdfService.bold('Text căn giữa với '),
        pdfService.colored('màu đỏ', [255, 0, 0], 'italic'),
        pdfService.normal(' và '),
        pdfService.colored('màu xanh', [0, 0, 255], 'bold')
    ];
    
    pdfService.addMixedParagraph(centerText, { align: 'center' });
    
    const rightText = [
        pdfService.normal('Text căn phải: '),
        pdfService.bold('Tổng cộng: '),
        pdfService.colored('1,000,000 VNĐ', [255, 0, 0], 'bold', 14)
    ];
    
    pdfService.addMixedParagraph(rightText, { align: 'right' });
    
    // Demo 5: Sử dụng trong hóa đơn/báo cáo
    pdfService.addSpace(10);
    pdfService.addSubTitle('Demo 5: Ứng Dụng Thực Tế - Hóa Đơn');
    
    const invoiceHeader = [
        pdfService.bold('HÓA ĐƠN BÁN HÀNG', null, 16)
    ];
    pdfService.addMixedParagraph(invoiceHeader, { align: 'center' });
    
    const invoiceInfo = [
        pdfService.bold('Số HĐ: '),
        pdfService.colored('HD-2024-001', [255, 0, 0], 'normal', 12),
        pdfService.normal(' | '),
        pdfService.bold('Ngày: '),
        pdfService.normal(new Date().toLocaleDateString('vi-VN'))
    ];
    pdfService.addMixedParagraph(invoiceInfo);
    
    const customerInfo = [
        pdfService.bold('Khách hàng: '),
        pdfService.normal('Nguyễn Văn A'),
        pdfService.normal(' - '),
        pdfService.italic('Điện thoại: '),
        pdfService.colored('0123456789', [0, 100, 0], 'normal')
    ];
    pdfService.addMixedParagraph(customerInfo);
    
    const total = [
        pdfService.bold('TỔNG TIỀN: '),
        pdfService.colored('2,500,000 VNĐ', [255, 0, 0], 'bold', 16)
    ];
    pdfService.addMixedParagraph(total, { align: 'right' });
    
    // Save PDF
    pdfService.savePDF('mixed-text-demo.pdf');
    
    console.log('✅ Mixed Text Demo PDF đã được tạo!');
}

// Demo Auto-Numbering và Indentation
function createAutoNumberingDemo() {
    const pdfService = new JsPdfService();
    
    pdfService.addTitle('Demo Auto-Numbering & Indentation', {
        fontSize: 18,
        color: [0, 0, 139]
    });
    
    pdfService.addSpace(10);
    
    // Demo 1: Simple numbered list
    pdfService.addSubTitle('Demo 1: Danh Sách Đánh Số Đơn Giản');
    
    const items1 = [
        'Đây là mục đầu tiên với text dài có thể xuống nhiều dòng để test tính năng auto-wrap và indent đúng cách',
        'Mục thứ hai ngắn hơn',
        'Mục thứ ba với nội dung trung bình để kiểm tra spacing và alignment',
        'Mục cuối cùng trong danh sách này'
    ];
    
    pdfService.addNumberedList(items1, {
        title: 'Danh sách công việc:',
        itemOptions: {
            numberStyle: 'decimal',
            fontSize: 11,
            indent: 25
        }
    });
    
    pdfService.addSpace(15);
    
    // Demo 2: Different numbering styles
    pdfService.addSubTitle('Demo 2: Các Kiểu Đánh Số Khác Nhau');
    
    // Roman numerals
    pdfService.addText('Đánh số La Mã:', null, null, { fontSize: 12, fontStyle: 'bold' });
    const romanItems = [
        'Chương giới thiệu',
        'Chương phát triển', 
        'Chương kết luận'
    ];
    
    pdfService.addNumberedList(romanItems, {
        itemOptions: {
            numberStyle: 'roman',
            numberFormat: '{number})',
            indent: 30
        },
        resetNumbers: true
    });
    
    pdfService.addSpace(10);
    
    // Alpha numbering
    pdfService.addText('Đánh số chữ cái:', null, null, { fontSize: 12, fontStyle: 'bold' });
    const alphaItems = [
        'Phương án A: Sử dụng công nghệ mới',
        'Phương án B: Nâng cấp hệ thống hiện tại',
        'Phương án C: Thuê ngoài dịch vụ'
    ];
    
    pdfService.addNumberedList(alphaItems, {
        itemOptions: {
            numberStyle: 'alpha',
            numberFormat: '{number}.',
            indent: 25
        },
        resetNumbers: true
    });
    
    pdfService.addSpace(10);
    
    // Bullet points
    pdfService.addText('Bullet Points:', null, null, { fontSize: 12, fontStyle: 'bold' });
    const bulletItems = [
        'Điểm quan trọng số một',
        'Điểm quan trọng số hai với text dài hơn để test word wrapping',
        'Điểm cuối cùng'
    ];
    
    pdfService.addNumberedList(bulletItems, {
        itemOptions: {
            numberStyle: 'bullet',
            indent: 20
        },
        resetNumbers: true
    });
    
    pdfService.addNewPage();
    
    // Demo 3: Multi-level lists
    pdfService.addSubTitle('Demo 3: Danh Sách Nhiều Cấp Độ');
    
    const multiLevelItems = [
        {
            text: 'Mục chính thứ nhất',
            subItems: [
                'Mục con 1.1',
                'Mục con 1.2 với text dài hơn để test indentation',
                {
                    text: 'Mục con 1.3 có sub-sub items',
                    subItems: [
                        'Mục con cấp 3 đầu tiên',
                        'Mục con cấp 3 thứ hai',
                        {
                            text: 'Mục con cấp 3 có cấp 4',
                            subItems: [
                                'Bullet point cấp 4',
                                'Bullet point cấp 4 thứ hai'
                            ]
                        }
                    ]
                }
            ]
        },
        {
            text: 'Mục chính thứ hai',
            subItems: [
                'Mục con 2.1',
                'Mục con 2.2'
            ]
        },
        'Mục chính thứ ba không có sub-items'
    ];
    
    pdfService.addMultiLevelList(multiLevelItems);
    
    pdfService.addSpace(15);
    
    // Demo 4: Outline/Table of Contents
    pdfService.addSubTitle('Demo 4: Outline/Mục Lục Tự Động');
    
    const outlineItems = [
        {
            title: 'Giới thiệu',
            page: 1,
            subItems: [
                { title: 'Mục đích', page: 1 },
                { title: 'Phạm vi', page: 2 }
            ]
        },
        {
            title: 'Nội dung chính',
            page: 3,
            subItems: [
                { 
                    title: 'Phần lý thuyết', 
                    page: 3,
                    subItems: [
                        { title: 'Khái niệm cơ bản', page: 3 },
                        { title: 'Phương pháp', page: 5 }
                    ]
                },
                { title: 'Phần thực hành', page: 8 }
            ]
        },
        { title: 'Kết luận', page: 12 },
        { title: 'Tài liệu tham khảo', page: 15 }
    ];
    
    pdfService.addOutline(outlineItems, {
        title: 'MỤC LỤC CHI TIẾT',
        showPageNumbers: true
    });
    
    pdfService.addSpace(15);
    
    // Demo 5: Custom formatting
    pdfService.addSubTitle('Demo 5: Định Dạng Tùy Chỉnh');
    
    const customItems = [
        {
            text: 'Mục với font size lớn hơn',
            options: {
                fontSize: 13,
                fontStyle: 'bold',
                color: [255, 0, 0],
                numberFormat: '[{number}]',
                indent: 30
            }
        },
        {
            text: 'Mục với màu xanh và italic',
            options: {
                fontSize: 11,
                fontStyle: 'italic',
                color: [0, 128, 0],
                numberFormat: '({number})',
                indent: 25
            }
        }
    ];
    
    pdfService.addNumberedList(customItems, {
        title: 'Danh sách tùy chỉnh:',
        resetNumbers: true
    });
    
    // Save PDF
    pdfService.savePDF('auto-numbering-demo.pdf');
    
    console.log('✅ Auto-Numbering Demo PDF đã được tạo!');
}

// Demo cho các ứng dụng thực tế
function createRealWorldNumberingDemo() {
    const pdfService = new JsPdfService();
    
    pdfService.addTitle('Ứng Dụng Thực Tế - Tài Liệu Kỹ Thuật', {
        fontSize: 16,
        color: [0, 0, 139]
    });
    
    pdfService.addSpace(10);
    
    // Outline document structure
    const docStructure = [
        {
            title: 'Tổng quan hệ thống',
            page: 1,
            subItems: [
                { title: 'Kiến trúc tổng thể', page: 1 },
                { title: 'Các thành phần chính', page: 2 }
            ]
        },
        {
            title: 'Hướng dẫn cài đặt',
            page: 3,
            subItems: [
                { title: 'Yêu cầu hệ thống', page: 3 },
                { title: 'Các bước cài đặt', page: 4 },
                { title: 'Cấu hình ban đầu', page: 6 }
            ]
        },
        {
            title: 'Hướng dẫn sử dụng',
            page: 8,
            subItems: [
                {
                    title: 'Chức năng cơ bản',
                    page: 8,
                    subItems: [
                        { title: 'Đăng nhập', page: 8 },
                        { title: 'Quản lý dữ liệu', page: 9 }
                    ]
                },
                { title: 'Chức năng nâng cao', page: 12 }
            ]
        }
    ];
    
    pdfService.addOutline(docStructure, {
        title: 'MỤC LỤC',
        titleOptions: {
            fontSize: 14,
            fontStyle: 'bold',
            align: 'center',
            color: [0, 0, 139]
        }
    });
    
    pdfService.addNewPage();
    
    // Technical requirements
    pdfService.addTitle('1. Yêu Cầu Hệ Thống', { fontSize: 14, fontStyle: 'bold' });
    
    const requirements = [
        {
            text: 'Yêu cầu phần cứng:',
            subItems: [
                'CPU: Intel Core i5 hoặc tương đương',
                'RAM: Tối thiểu 8GB, khuyến nghị 16GB',
                'Ổ cứng: 100GB dung lượng trống',
                'Kết nối mạng: Băng thông tối thiểu 10Mbps'
            ]
        },
        {
            text: 'Yêu cầu phần mềm:',
            subItems: [
                'Hệ điều hành: Windows 10/11, macOS 10.15+, Ubuntu 20.04+',
                'Trình duyệt: Chrome 90+, Firefox 88+, Safari 14+',
                'Runtime: Node.js 16+, Python 3.8+',
                {
                    text: 'Cơ sở dữ liệu:',
                    subItems: [
                        'PostgreSQL 12+ (Production)',
                        'MySQL 8.0+ (Development)',
                        'SQLite 3.35+ (Testing)'
                    ]
                }
            ]
        }
    ];
    
    pdfService.addMultiLevelList(requirements);
    
    pdfService.addSpace(15);
    
    // Installation steps
    pdfService.addTitle('2. Các Bước Cài Đặt', { fontSize: 14, fontStyle: 'bold' });
    
    const installSteps = [
        'Tải xuống package cài đặt từ trang web chính thức tại https://example.com/download',
        'Giải nén file vào thư mục mong muốn (khuyến nghị: C:\\Program Files\\AppName)',
        'Mở Command Prompt với quyền Administrator',
        'Chạy lệnh cài đặt: setup.exe /S /D=C:\\Program Files\\AppName',
        'Đợi quá trình cài đặt hoàn tất (khoảng 5-10 phút)',
        'Khởi động lại máy tính để hoàn tất cài đặt',
        'Chạy ứng dụng lần đầu và làm theo hướng dẫn setup wizard'
    ];
    
    pdfService.addNumberedList(installSteps, {
        title: 'Quy trình cài đặt chi tiết:',
        itemOptions: {
            fontSize: 11,
            indent: 25,
            numberFormat: 'Bước {number}:'
        }
    });
    
    pdfService.addSpace(10);
    
    // Troubleshooting section
    pdfService.addTitle('3. Xử Lý Sự Cố', { fontSize: 14, fontStyle: 'bold' });
    
    const troubleshooting = [
        {
            text: 'Lỗi cài đặt không thành công:',
            subItems: [
                'Kiểm tra quyền Administrator',
                'Tắt antivirus tạm thời',
                'Đảm bảo đủ dung lượng ổ cứng',
                'Xem log file tại: %TEMP%\\AppName_Install.log'
            ]
        },
        {
            text: 'Ứng dụng không khởi động:',
            subItems: [
                'Kiểm tra file cấu hình: config/app.json',
                'Xác minh kết nối database',
                'Kiểm tra port 8080 có bị chiếm không',
                'Chạy ở chế độ debug: app.exe --debug'
            ]
        },
        {
            text: 'Lỗi kết nối mạng:',
            subItems: [
                'Kiểm tra firewall settings',
                'Xác minh proxy configuration',
                'Test kết nối: ping api.example.com',
                'Kiểm tra SSL certificate'
            ]
        }
    ];
    
    pdfService.addMultiLevelList(troubleshooting, {
        level1: {
            numberStyle: 'alpha',
            numberFormat: '{number})',
            fontSize: 11,
            fontStyle: 'bold',
            indent: 20
        }
    });
    
    pdfService.savePDF('technical-document-demo.pdf');
    
    console.log('✅ Technical Document Demo PDF đã được tạo!');
}

async function createPhieuDanhGiaUngVien(data = {}) {
  const pdf = new JsPdfService();
  const doc = pdf.doc;

  // Thiết lập font Roboto mặc định cho toàn bộ document
  doc.setFont('Roboto', 'normal');

  // tiện dùng
  const M = pdf.margins;
  const pageW = pdf.pageWidth;
  const usableW = pageW - M.left - M.right;

  // ====== helpers nội bộ ======
  const setRoboto = (style='normal') => doc.setFont('Roboto', style);
  const box = (x, y, w, h) => doc.rect(x, y, w, h);
  const tick = (x, y, checked) => {
    doc.rect(x, y, 4, 4);
    if (checked) {
      const lw = doc.getLineWidth(); doc.setLineWidth(0.5);
      doc.line(x+0.7, y+0.7, x+3.3, y+3.3);
      doc.line(x+3.3, y+0.7, x+0.7, y+3.3);
      doc.setLineWidth(lw);
    }
  };

  // =========================================================
  // HEADER
  pdf.addTitle('BẢNG ĐÁNH GIÁ ỨNG VIÊN', { fontFamily: 'Roboto' }).addSpace(4);
  setRoboto('normal');

  // =========================================================
  // 1. THÔNG TIN ỨNG VIÊN
  pdf.addSubTitle('1. THÔNG TIN ỨNG VIÊN', { fontSize: 12, fontFamily: 'Roboto', lineHeight: 6 });
  doc.autoTable({
    startY: pdf.getCurrentY()+2,
    theme: 'grid',
    margin: { left: M.left, right: M.right },
    tableWidth: usableW,
    styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 10, cellPadding: 2, valign: 'middle' },
    headStyles: { font: 'Roboto', fontStyle: 'bold' },
    body: [
      ['Họ tên ứng viên', { content: data.hoTen || '', colSpan: 3 }],
      ['Ngày tháng năm sinh', { content: data.ngaySinh || '', colSpan: 3 }],
      ['Trình độ chuyên môn', data.trinhDo || '', 'Giới tính:', data.gioiTinh || ''],
      [{ content: 'Vị trí /chức danh ứng tuyển', colSpan: 3, styles: { halign: 'left' } }, data.viTri || ''],
      [{ content: 'Điểm Bài kiểm tra năng lực chuyên môn (nếu có):', colSpan: 3, styles: { halign: 'left' } }, data.diemTest ?? ''],
    ],
    columnStyles: {
      0: { cellWidth: 55 }, 1: { cellWidth: 60 }, 2: { cellWidth: 25 }, 3: { cellWidth: 45 },
    },
  });
  pdf.resetPosition(doc.lastAutoTable.finalY + 3);

  // =========================================================
  // 2. ĐÁNH GIÁ ỨNG VIÊN
  pdf.addSubTitle('2. ĐÁNH GIÁ ỨNG VIÊN', { fontSize: 12, fontFamily: 'Roboto' });

  const bodyDanhGia = [
    ['1  Trình độ học vấn', 'Bằng cấp/Chứng chỉ …………………………………………………………………………………………………….', data.d1 ?? ''],
    ['2  Thâm niên', 'Xác nhận qua hồ sơ, lý lịch cá nhân …………………………………………………………………………………………………….', data.d2 ?? ''],
    ['3  Ngoại ngữ', 'Bằng cấp/Chứng chỉ hoặc qua kỳ thi do Công ty tổ chức …………………………………………………………………………………………………….', data.d3 ?? ''],
    ['4  Tin học', 'Bằng cấp/Chứng chỉ hoặc qua kỳ thi do Công ty tổ chức …………………………………………………………………………………………………….', data.d4 ?? ''],
    ['5  Kinh nghiệm', 'Xác nhận qua hồ sơ, lý lịch cá nhân và quá trình làm việc …………………………………………………………………………………………………….', data.d5 ?? ''],
    ['6  Năng lực giải quyết vấn đề', 'Xác nhận qua quá trình làm việc tại Công ty hoặc các Đơn vị khác trước khi tuyển dụng …………………………………………………………………………………………………….', data.d6 ?? ''],
    ['7  Năng lực tư vấn, đào tạo', 'Xác nhận qua quá trình làm việc tại Công ty hoặc các Đơn vị khác trước khi tuyển dụng …………………………………………………………………………………………………….', data.d7 ?? ''],
    ['8  Năng lực nghiên cứu, sáng tạo',
     'Xác nhận qua:\n+ Công bố bài báo hoặc công trình nghiên cứu trên các tạp chí khoa học hoặc các hội đồng nghiệm thu;\n+ Hoặc, kết quả thực hiện các sáng kiến cải tiến mang lại hiệu quả cao cho Công ty;\n+ Hoặc, kết quả ứng dụng các kỹ thuật chuyên môn cao tại Bệnh viện.\n………………………………………………………………………………………………….',
     data.d8 ?? ''],
  ];

  doc.autoTable({
    startY: pdf.getCurrentY()+2,
    theme: 'grid',
    margin: { left: M.left, right: M.right },
    tableWidth: usableW,
    head: [['Tiêu chí đánh giá', 'Bằng chứng đánh giá', 'Điểm đánh giá (Từ 0 đến 3 điểm)']],
    body: bodyDanhGia,
    styles: { font: 'Roboto', fontStyle: 'normal', fontSize: 10, cellPadding: 2, valign: 'middle' },
    headStyles: { font: 'Roboto', fontStyle: 'bold' },
    columnStyles: { 0: { cellWidth: 60 }, 1: { cellWidth: 100 }, 2: { cellWidth: 25, halign: 'center' } },
  });
  pdf.resetPosition(doc.lastAutoTable.finalY + 4);

  // Tổng điểm & ghi chú
  const total = bodyDanhGia.reduce((s, r) => s + Number(r[2] || 0), 0);
  setRoboto('bold'); doc.text(`TỔNG ĐIỂM: ${total}`, M.left, pdf.getCurrentY()); setRoboto('normal');
  pdf.addParagraph([
    'Kết quả điểm đánh giá:',
    '- Đạt 22 - 24 điểm: Xem xét xếp ngạch chuyên gia;',
    '- Đạt 14 - 21 điểm: Xem xét xếp ngạch chuyên viên;',
    '- Đạt 06 - 13 điểm: Xem xét xếp ngạch nhân viên;',
    '- Đạt dưới 06 điểm: Không tuyển dụng.',
  ], { fontSize: 9, lineHeight: 3, spacing: 0.5, fontFamily: 'Roboto' });

  // =========================================================
  // TRANG 2
  pdf.addNewPage();
  pdf.addTitle('BẢNG ĐÁNH GIÁ ỨNG VIÊN', { fontFamily: 'Roboto' }).addSpace(4);

  // ---- block phỏng vấn: nhãn trái + khung phải
  function drawInterviewBlock(label, pass, fail, height) {
    const col1W = 42;
    const x1 = M.left, y1 = pdf.getCurrentY()+2;
    box(x1, y1, col1W, height);                        // khung trái
    setRoboto('bold'); doc.text(label, x1+2, y1+6); setRoboto('normal');

    const x2 = x1 + col1W, w2 = usableW - col1W;
    box(x2, y1, w2, height);                           // khung phải

    // nội dung
    doc.text('Nội dung nhận xét: (kiến thức chuyên môn, kinh nghiệm, kỹ năng, thái độ...)', x2+2, y1+6);
    
    // vẽ các đường gạch chấm thủ công để tránh chồng lấp
    for (let i = 0; i < 2; i++) {
      const lineY = y1 + 12 + (i * 5);
      // vẽ đường chấm
      let dotX = x2 + 4;
      while (dotX < x2 + w2 - 8) {
        doc.circle(dotX, lineY, 0.3, 'F');
        dotX += 3;
      }
    }

    // ký tên & họ tên
    doc.text('Ký tên:', x2+2, y1 + height - 10);
    doc.text('Họ và tên: ........................................................', x2+2, y1 + height - 4);

    // kết quả checkbox
    const baseY = y1 + height - 4;
    let cx = x2 + w2 - 120;
    doc.text('Kết quả :', cx, baseY);
    cx += 14; tick(cx, baseY-4, !!pass); doc.text('Đạt/Phù hợp', cx+6, baseY);
    cx += 50; tick(cx, baseY-4, !!fail); doc.text('Không đạt/Không phù hợp', cx+6, baseY);

    // cập nhật vị trí currentY chính xác
    pdf.currentY = y1 + height + 2;
  }

  drawInterviewBlock('Phỏng vấn viên 1', data.pv1Pass, data.pv1Fail, 40);
  drawInterviewBlock('Phỏng vấn viên 2', data.pv2Pass, data.pv2Fail, 40);

  // Phòng nhân sự (cao hơn)
  drawInterviewBlock(
    'Phòng Nhân sự',
    data.nsPass,
    data.nsFail,
    45
  );

  // =========================================================
  // 3. PHÊ DUYỆT KẾT QUẢ TUYỂN CHỌN VÀ CHẾ ĐỘ NHÂN SỰ
  pdf.addSubTitle('3. PHÊ DUYỆT KẾT QUẢ TUYỂN CHỌN VÀ CHẾ ĐỘ NHÂN SỰ', { fontSize: 12, fontFamily: 'Roboto' });

  const leftW = usableW/2 - 2, rightW = usableW/2 - 2;
  const leftX = M.left, rightX = M.left + leftW + 4;
  const topY = pdf.getCurrentY()+2, blockH = 65;

  // khối trái
  box(leftX, topY, leftW, blockH);
  let ly = topY + 6;
  tick(leftX+2, ly-4, !!data.approveHire); doc.text('Đồng ý tuyển dụng', leftX+8, ly);
  ly += 6;
  tick(leftX+2, ly-4, !!data.returnFile); doc.text('Trả hồ sơ (không đạt)', leftX+8, ly);

  ly += 8; doc.text(`Ngày nhận việc: ${data.ngayNhanViec || '......./....../........'}`, leftX+2, ly);
  ly += 5;  doc.text(`Cấp bậc nhân sự: ${data.capBac || ''}`, leftX+2, ly);
  ly += 5;  doc.text(`Ngạch lương: ${data.ngachLuong || ''}`, leftX+2, ly);
  ly += 5;  doc.text(`Nhóm chức danh: ${data.nhomChucDanh || ''}`, leftX+2, ly);
  ly += 5;  doc.text(`Bậc: ${data.bac || ''}`, leftX+2, ly);

  ly += 6;  doc.text('(Chọn 1 trong 2 lựa chọn)', leftX+2, ly);
  ly += 6;  tick(leftX+2, ly-4, !!data.hdtv); doc.text('Ký HĐTV và đánh giá thử việc: ... tháng', leftX+8, ly);
  ly += 6;  tick(leftX+2, ly-4, !!data.hdlc); doc.text('Ký HĐLĐ xác định thời hạn (theo đề xuất của Công ty)', leftX+8, ly);

  // khối phải: cấp thẩm quyền phê duyệt
  box(rightX, topY, rightW, blockH);
  setRoboto('bold');
  doc.text('CẤP THẨM QUYỀN PHÊ DUYỆT', rightX + rightW/2, topY + 6, { align: 'center' });
  setRoboto('normal');
  doc.text('Họ tên:', rightX+8, topY + 18);
  doc.text('Ngày: ......./....../.........', rightX+8, topY + 25);
  // vùng ký tên
  doc.text('(Ký và ghi rõ họ tên)', rightX + rightW/2, topY + 35, { align:'center' });
  // đường gạch ký
  doc.line(rightX + 14, topY + 50, rightX + rightW - 14, topY + 50);

  pdf.resetPosition(topY + blockH + 4);

  // Footer (số trang)
  pdf.addFooter('Trang {pageNumber}/{totalPages}', { fontFamily: 'Roboto' });

  // Lưu
  pdf.savePDF('phieu-danh-gia-ung-vien.pdf');
}
