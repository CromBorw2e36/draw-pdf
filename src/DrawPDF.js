/**
 * DrawPDF - All-in-One API Wrapper
 * 
 * Simple API for CKEditor → JSON Blueprint → PDF workflow:
 * - init(element, options) - Initialize CKEditor
 * - getData() - Parse editor HTML → JSON Blueprint
 * - setData(blueprint) - Load JSON Blueprint for rendering
 * - render(data) - Render to PDF, returns data URL
 * - download(filename, data) - Download PDF file
 * 
 * Font Configuration:
 * - options.fonts.defaultFont - Primary font name (default: 'Roboto')
 * - options.fonts.fallback - Fallback font name (default: 'helvetica')
 * - options.fonts.register - Array of font file URLs to load
 * 
 * @module drawpdf
 */

import CKEditorParser from './parser/CKEditorParser.js';
import PDFRenderer from './renderer/PDFRenderer.js';
import { FONT_CONFIG } from './utils/constants.js';

class DrawPDF {
    constructor() {
        this.editor = null;
        this.parser = new CKEditorParser();
        this.renderer = null;  // Will be created with font config in init()
        this.blueprint = null;  // JSON Blueprint storage
        this._initialized = false;
        this.fontConfig = { ...FONT_CONFIG };  // Default font config
    }

    /**
     * Initialize CKEditor into a container element
     * @param {string|HTMLElement} elementOrSelector - DOM element or CSS selector
     * @param {Object} options - CKEditor configuration options
     * @returns {Promise<DrawPDF>} This instance (chainable)
     */
    async init(elementOrSelector, options = {}) {
        // Get the DOM element
        const element = typeof elementOrSelector === 'string'
            ? document.querySelector(elementOrSelector)
            : elementOrSelector;

        if (!element) {
            throw new Error(`DrawPDF: Element not found: ${elementOrSelector}`);
        }

        // Get CKEditor class (supports both Super Build and standard)
        const CKEDITOR = window.CKEDITOR ?? window.DrawPDF?.CKEDITOR;
        const EditorClass = CKEDITOR?.DecoupledEditor
            || CKEDITOR?.ClassicEditor
            || window.DecoupledEditor
            || window.ClassicEditor;

        if (!EditorClass) {
            throw new Error('DrawPDF: CKEditor not loaded. Please include CKEditor script before using DrawPDF.');
        }

        // Default CKEditor config derived from src/main.js
        const defaultConfig = {
            toolbar: {
                items: [
                    // History
                    'undo', 'redo', '|',
                    // Find
                    'findAndReplace', '|',
                    // Formatting
                    'heading', '|',
                    'bold', 'italic', 'underline', 'strikethrough',
                    'subscript', 'superscript', 'code', 'removeFormat', '|',
                    // Font
                    'fontFamily', 'fontSize', 'fontColor', 'fontBackgroundColor', 'highlight', '|',
                    // Alignment & Lists
                    'alignment', '|',
                    'bulletedList', 'numberedList', 'todoList', '|',
                    'outdent', 'indent', '|',
                    // Insert
                    'link', 'uploadImage', 'insertTable', 'blockQuote', 'codeBlock', '|',
                    'horizontalLine', 'pageBreak', 'specialCharacters'
                ],
                shouldNotGroupWhenFull: true
            },
            heading: {
                options: [
                    { model: 'paragraph', title: 'Paragraph', class: 'ck-heading_paragraph' },
                    { model: 'heading1', view: 'h1', title: 'Heading 1' },
                    { model: 'heading2', view: 'h2', title: 'Heading 2' },
                    { model: 'heading3', view: 'h3', title: 'Heading 3' },
                    { model: 'heading4', view: 'h4', title: 'Heading 4' },
                    { model: 'heading5', view: 'h5', title: 'Heading 5' },
                    { model: 'heading6', view: 'h6', title: 'Heading 6' }
                ]
            },
            fontSize: {
                options: [12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 42, 48, 72],
                supportAllValues: true
            },
            fontFamily: {
                options: [
                    'default',
                    'Roboto, sans-serif',
                    'Times New Roman, Times, serif',
                    'Arial, Helvetica, sans-serif',
                    'Georgia, serif',
                    'Verdana, Geneva, sans-serif',
                    'Courier New, Courier, monospace',
                    'Tahoma, Geneva, sans-serif',
                    'Trebuchet MS, sans-serif'
                ],
                supportAllValues: true
            },
            fontColor: {
                colors: [
                    { color: '#000000', label: 'Black' },
                    { color: '#4d4d4d', label: 'Dark Gray' },
                    { color: '#999999', label: 'Gray' },
                    { color: '#e6e6e6', label: 'Light Gray' },
                    { color: '#ffffff', label: 'White' },
                    { color: '#e64c4c', label: 'Red' },
                    { color: '#e6994c', label: 'Orange' },
                    { color: '#e6e64c', label: 'Yellow' },
                    { color: '#4ce64c', label: 'Green' },
                    { color: '#4c4ce6', label: 'Blue' },
                    { color: '#994ce6', label: 'Purple' }
                ]
            },
            table: {
                contentToolbar: [
                    'tableColumn', 'tableRow', 'mergeTableCells',
                    'tableProperties', 'tableCellProperties'
                ]
            },
            image: {
                toolbar: [
                    'imageTextAlternative', 'toggleImageCaption',
                    'imageStyle:inline', 'imageStyle:block', 'imageStyle:side',
                    'linkImage'
                ]
            },
            link: {
                addTargetToExternalLinks: true,
                defaultProtocol: 'https://'
            },
            placeholder: 'Soạn thảo văn bản ở đây...\n\nSử dụng {{tênBiến}} để chèn biến.',
            language: 'vi',
            // Remove plugins that might cause issues
            removePlugins: [
                // Premium plugins (require license)
                'CKBox', 'CKFinder', 'EasyImage',
                'RealTimeCollaborativeComments', 'RealTimeCollaborativeTrackChanges', 'RealTimeCollaborativeRevisionHistory',
                'PresenceList', 'Comments', 'TrackChanges', 'TrackChangesData', 'RevisionHistory',
                'Pagination', 'WProofreader', 'MathType', 'SlashCommand', 'Template',
                'DocumentOutline', 'FormatPainter', 'TableOfContents', 'PasteFromOfficeEnhanced', 'CaseChange',
                // AI features (require license)
                'AIAssistant', 'AI',
                // Multi-level list (require license)
                'MultiLevelList',
                // Restricted editing (causes read-only mode)
                'RestrictedEditingMode', 'StandardEditingMode'
            ]
        };

        // Merge user options (excluding fonts config which is handled separately)
        const { fonts: fontsConfig, ...editorOptions } = options;
        const config = { ...defaultConfig, ...editorOptions };

        // Handle font configuration
        if (fontsConfig) {
            this.fontConfig = { ...FONT_CONFIG, ...fontsConfig };
        }

        // Load custom font files if specified
        if (this.fontConfig.register && this.fontConfig.register.length > 0) {
            await this._loadFontFiles(this.fontConfig.register);
        }

        // Create renderer with font configuration
        this.renderer = new PDFRenderer(this.fontConfig);

        try {
            this.editor = await EditorClass.create(element, config);

            // For DecoupledEditor, handle toolbar
            if (this.editor.ui?.view?.toolbar?.element) {
                if (options.toolbarContainer) {
                    // Case 1: User provided a container
                    const toolbarEl = typeof options.toolbarContainer === 'string'
                        ? document.querySelector(options.toolbarContainer)
                        : options.toolbarContainer;
                    if (toolbarEl) {
                        toolbarEl.appendChild(this.editor.ui.view.toolbar.element);
                    }
                } else {
                    // Case 2: Auto-insert before the editor element
                    if (element instanceof HTMLElement && element.parentNode) {
                        element.parentNode.insertBefore(this.editor.ui.view.toolbar.element, element);
                    }
                }
            }

            this._initialized = true;
            console.log('✅ DrawPDF initialized with font:', this.fontConfig.defaultFont);
        } catch (error) {
            console.error('DrawPDF init failed:', error);
            throw error;
        }

        return this;
    }

    /**
     * Load custom font files (JS modules)
     * @param {string[]} fontUrls - Array of font file URLs
     * @private
     */
    async _loadFontFiles(fontUrls) {
        for (const url of fontUrls) {
            try {
                await this._loadFontScript(url);
                console.log(`✅ Font loaded: ${url}`);
            } catch (error) {
                console.warn(`⚠️ Failed to load font: ${url}`, error.message);
            }
        }
    }

    /**
     * Load a single font script file
     * @param {string} url - URL to font JS file
     * @private
     */
    _loadFontScript(url) {
        return new Promise((resolve, reject) => {
            const script = document.createElement('script');
            script.src = url;
            script.onload = resolve;
            script.onerror = () => reject(new Error(`Failed to load font script: ${url}`));
            document.head.appendChild(script);
        });
    }

    /**
     * Register a custom font dynamically
     * @param {string} fontUrl - URL to the font JS file (pre-converted from TTF)
     * @returns {Promise<DrawPDF>} This instance (chainable)
     */
    async registerFont(fontUrl) {
        await this._loadFontScript(fontUrl);
        console.log(`✅ Font registered: ${fontUrl}`);
        return this;
    }

    /**
     * Get JSON Blueprint from current editor content
     * Parses HTML → JSON Blueprint and stores internally
     * @returns {Object} JSON Blueprint
     */
    getData() {
        if (!this._initialized) {
            throw new Error('DrawPDF: Not initialized. Call init() first.');
        }
        const html = this.editor.getData();
        this.blueprint = this.parser.parse(html);

        // Add source HTML for reference
        this.blueprint.sourceHtml = html;
        this.blueprint.createdAt = new Date().toISOString();

        return this.blueprint;
    }

    /**
     * Set JSON Blueprint for later rendering
     * @param {Object} blueprint - JSON Blueprint object
     * @returns {DrawPDF} This instance (chainable)
     */
    setData(blueprint) {
        if (!blueprint || typeof blueprint !== 'object') {
            throw new Error('DrawPDF: setData expects a JSON Blueprint object.');
        }
        this.blueprint = blueprint;

        // If editor is initialized and blueprint has sourceHtml, load it
        if (this._initialized && blueprint.sourceHtml) {
            this.editor.setData(blueprint.sourceHtml);
        }

        return this;
    }

    /**
     * Render PDF from stored blueprint
     * @param {Object} data - Variable data for template replacement
     * @returns {string} PDF as data URL (base64)
     */
    render(data = {}) {
        // If no blueprint stored, get from editor
        if (!this.blueprint && this._initialized) {
            this.getData();
        }

        if (!this.blueprint) {
            throw new Error('DrawPDF: No blueprint. Call getData() or setData() first.');
        }

        this.renderer.render(this.blueprint, data);
        return this.renderer.getDataUrl();
    }

    /**
     * Download PDF from stored blueprint
     * @param {string} filename - Output filename
     * @param {Object} data - Variable data for template replacement
     * @returns {DrawPDF} This instance (chainable)
     */
    download(filename = 'document.pdf', data = {}) {
        // If no blueprint stored, get from editor
        if (!this.blueprint && this._initialized) {
            this.getData();
        }

        if (!this.blueprint) {
            throw new Error('DrawPDF: No blueprint. Call getData() or setData() first.');
        }

        this.renderer.render(this.blueprint, data);
        this.renderer.download(filename);
        return this;
    }

    /**
     * Get PDF as Blob (for custom handling)
     * @param {Object} data - Variable data for template replacement
     * @returns {Blob} PDF blob
     */
    getBlob(data = {}) {
        if (!this.blueprint && this._initialized) {
            this.getData();
        }
        if (!this.blueprint) {
            throw new Error('DrawPDF: No blueprint.');
        }
        this.renderer.render(this.blueprint, data);
        return this.renderer.getBlob();
    }

    /**
     * Preview PDF in new browser tab
     * @param {Object} data - Variable data for template replacement
     */
    preview(data = {}) {
        if (!this.blueprint && this._initialized) {
            this.getData();
        }
        if (!this.blueprint) {
            throw new Error('DrawPDF: No blueprint.');
        }
        this.renderer.render(this.blueprint, data);
        this.renderer.preview();
    }

    /**
     * Get current blueprint without re-parsing
     * @returns {Object|null} Stored blueprint or null
     */
    getBlueprint() {
        return this.blueprint;
    }

    /**
     * Export blueprint as JSON string
     * @returns {string} JSON string
     */
    exportJson() {
        if (!this.blueprint) {
            throw new Error('DrawPDF: No blueprint to export.');
        }
        return JSON.stringify(this.blueprint, null, 2);
    }

    /**
     * Import blueprint from JSON string
     * @param {string} jsonString - JSON string
     * @returns {DrawPDF} This instance (chainable)
     */
    importJson(jsonString) {
        const blueprint = JSON.parse(jsonString);
        return this.setData(blueprint);
    }

    /**
     * Destroy editor instance and cleanup
     */
    destroy() {
        if (this.editor) {
            this.editor.destroy();
            this.editor = null;
            this._initialized = false;
        }
        this.blueprint = null;
    }

    /**
     * Static factory method - create and initialize in one call
     * @param {string|HTMLElement} element - DOM element or selector
     * @param {Object} options - CKEditor options
     * @returns {Promise<DrawPDF>} Initialized DrawPDF instance
     */
    static async create(element, options = {}) {
        const instance = new DrawPDF();
        await instance.init(element, options);
        return instance;
    }

    /**
     * Static method - parse HTML to blueprint without editor
     * @param {string} html - HTML content
     * @returns {Object} JSON Blueprint
     */
    static parseHtml(html) {
        const parser = new CKEditorParser();
        const blueprint = parser.parse(html);
        blueprint.sourceHtml = html;
        blueprint.createdAt = new Date().toISOString();
        return blueprint;
    }

    /**
     * Static method - render PDF from blueprint (headless)
     * @param {Object} blueprint - JSON Blueprint
     * @param {Object} data - Variable data
     * @returns {string} PDF as data URL
     */
    static renderBlueprint(blueprint, data = {}) {
        const renderer = new PDFRenderer();
        renderer.render(blueprint, data);
        return renderer.getDataUrl();
    }

    /**
     * Static method - download PDF from blueprint (headless)
     * @param {Object} blueprint - JSON Blueprint
     * @param {string} filename - Output filename
     * @param {Object} data - Variable data
     */
    static downloadBlueprint(blueprint, filename = 'document.pdf', data = {}) {
        const renderer = new PDFRenderer();
        renderer.render(blueprint, data);
        renderer.download(filename);
    }
}

export default DrawPDF;
