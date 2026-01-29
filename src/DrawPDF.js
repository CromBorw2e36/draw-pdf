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
 * @module drawpdf
 */

import CKEditorParser from './parser/CKEditorParser.js';
import PDFRenderer from './renderer/PDFRenderer.js';

class DrawPDF {
    constructor() {
        this.editor = null;
        this.parser = new CKEditorParser();
        this.renderer = new PDFRenderer();
        this.blueprint = null;  // JSON Blueprint storage
        this._initialized = false;
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
        const EditorClass = window.CKEDITOR?.DecoupledEditor
            || window.CKEDITOR?.ClassicEditor
            || window.DecoupledEditor
            || window.ClassicEditor;

        if (!EditorClass) {
            throw new Error('DrawPDF: CKEditor not loaded. Please include CKEditor script before using DrawPDF.');
        }

        // Default CKEditor config
        const defaultConfig = {
            toolbar: {
                items: [
                    'undo', 'redo', '|',
                    'heading', '|',
                    'bold', 'italic', 'underline', '|',
                    'fontFamily', 'fontSize', 'fontColor', '|',
                    'alignment', '|',
                    'bulletedList', 'numberedList', '|',
                    'insertTable', '|',
                    'sourceEditing'
                ],
                shouldNotGroupWhenFull: true
            },
            fontSize: {
                options: [10, 11, 12, 13, 14, 16, 18, 20, 22, 24, 26, 28, 32, 36, 42, 48, 72],
                supportAllValues: true
            },
            language: 'vi',
            removePlugins: [
                'CKBox', 'CKFinder', 'EasyImage',
                'RealTimeCollaborativeComments', 'RealTimeCollaborativeTrackChanges',
                'Comments', 'TrackChanges', 'RevisionHistory',
                'AIAssistant', 'AI', 'MultiLevelList',
                'RestrictedEditingMode', 'StandardEditingMode'
            ]
        };

        // Merge user options
        const config = { ...defaultConfig, ...options };

        try {
            this.editor = await EditorClass.create(element, config);

            // For DecoupledEditor, append toolbar if toolbar container provided
            if (options.toolbarContainer && this.editor.ui?.view?.toolbar?.element) {
                const toolbarEl = typeof options.toolbarContainer === 'string'
                    ? document.querySelector(options.toolbarContainer)
                    : options.toolbarContainer;
                if (toolbarEl) {
                    toolbarEl.appendChild(this.editor.ui.view.toolbar.element);
                }
            }

            this._initialized = true;
            console.log('✅ DrawPDF initialized');
        } catch (error) {
            console.error('DrawPDF init failed:', error);
            throw error;
        }

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
