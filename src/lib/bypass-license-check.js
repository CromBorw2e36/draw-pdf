// bypass-license-check.js
(function () {
    window.verifyLicenseKey = function(editor) {
        console.log('[Khánh Custom Build] License bypassed 100% 🐱‍💻');
        
        // Force GPL để skip logic gốc
        editor.config.set('licenseKey', 'GPL');
        
        // Vô hiệu hóa block read-only
        const originalEnable = editor.enableReadOnlyMode;
        editor.enableReadOnlyMode = function(mode) {
            if (String(mode).includes('invalidLicense') || String(mode).includes('expired') || String(mode).includes('domainLimit')) {
                console.log('[Bypass] Blocked read-only activation');
                return;
            }
            return originalEnable.apply(editor, arguments);
        };
        
        // Suppress warning & timer
        window.CKEDITOR_WARNING_SUPPRESSIONS = { development: true, evaluation: true, trial: true };
        
        // Mock usage request nếu có (tránh gọi server)
        editor._sendUsageRequest = function() {
            console.log('[Bypass] Usage request mocked - status ok');
            return Promise.resolve({ status: 'ok' });
        };
    };
    
    // Nếu có logo "Powered by", hide CSS (nếu mày muốn "ẩn" nó)
    const style = document.createElement('style');
    style.textContent = '.ck-powered-by { display: none !important; }';
    document.head.appendChild(style);
})();