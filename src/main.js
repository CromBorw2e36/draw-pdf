/**
 * PDF Template Builder - CKEditor + JSON Blueprint + PDF Renderer
 * PRO approach: CKEditor → JSON → jsPDF direct draw
 */

import CKEditorParser from './parser/CKEditorParser.js';
import PDFRenderer from './renderer/PDFRenderer.js';

// Variable pattern
const VARIABLE_PATTERN = /\{\{([^}]+)\}\}/g;

class TemplateEditor {
  constructor() {
    this.editor = null;
    this.parser = new CKEditorParser();
    this.renderer = new PDFRenderer();
    this.detectedVariables = new Set();
    this.variableData = {};
    this.templateName = 'Untitled Template';
    this.currentBlueprint = null;

    this.init();
  }

  async init() {
    await this.initCKEditor();
    this.setupEventListeners();
    this.setupVariableButtons();
    this.loadFromLocalStorage();

    console.log('✅ PDF Template Builder - PRO Mode Ready!');
    console.log('📋 Flow: CKEditor → JSON Blueprint → jsPDF Direct Draw');
  }

  async initCKEditor() {
    try {
      // Super Build uses CKEDITOR global
      const EditorClass = window.CKEDITOR?.DecoupledEditor || window.DecoupledEditor;

      if (!EditorClass) {
        throw new Error('CKEditor not loaded');
      }

      this.editor = await EditorClass.create(document.getElementById('editor'), {
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
      });

      document.getElementById('toolbarContainer').appendChild(this.editor.ui.view.toolbar.element);

      this.editor.model.document.on('change:data', () => {
        this.onContentChange();
      });

      console.log('✅ CKEditor Super Build loaded');
      console.log('📝 Available plugins:', this.editor.plugins.names ? [...this.editor.plugins.names].length : 'N/A');

    } catch (error) {
      console.error('CKEditor init failed:', error);
      // Fallback message
      document.getElementById('editor').innerHTML = '<p style="color:red;padding:20px;">CKEditor failed to load. Error: ' + error.message + '</p>';
    }
  }

  onContentChange() {
    this.detectVariables();
    this.updateWordCount();
    this.autoSave();
  }

  detectVariables() {
    const text = this.editor.getData();
    const matches = text.matchAll(VARIABLE_PATTERN);

    this.detectedVariables.clear();
    for (const match of matches) {
      this.detectedVariables.add(match[1].trim());
    }

    this.renderVariableList();
    document.getElementById('varCount').textContent = this.detectedVariables.size;
  }

  renderVariableList() {
    const container = document.getElementById('variableList');

    if (this.detectedVariables.size === 0) {
      container.innerHTML = '<p class="info-text">Gõ {{tênBiến}} trong editor để thêm biến.</p>';
      return;
    }

    container.innerHTML = Array.from(this.detectedVariables).map(varName => `
      <div class="variable-item">
        <span class="variable-name">{{${varName}}}</span>
        <input 
          type="text" 
          class="variable-input" 
          data-var="${varName}"
          value="${this.variableData[varName] || ''}"
          placeholder="Nhập giá trị..."
        >
      </div>
    `).join('');

    container.querySelectorAll('.variable-input').forEach(input => {
      input.addEventListener('input', (e) => {
        this.variableData[e.target.dataset.var] = e.target.value;
      });
    });
  }

  updateWordCount() {
    const text = this.editor.getData().replace(/<[^>]*>/g, ' ').trim();
    const words = text ? text.split(/\s+/).filter(w => w.length > 0).length : 0;
    document.getElementById('wordCount').textContent = words;
  }

  setupEventListeners() {
    // New
    document.getElementById('btnNew')?.addEventListener('click', () => {
      if (confirm('Tạo mới? Nội dung chưa lưu sẽ mất.')) {
        this.editor.setData('');
        this.detectedVariables.clear();
        this.variableData = {};
        this.renderVariableList();
        localStorage.removeItem('ckeditor_autosave');
      }
    });

    // Save JSON Blueprint
    document.getElementById('btnSaveJson')?.addEventListener('click', () => {
      this.saveAsJson();
    });

    // Load JSON
    document.getElementById('btnLoadJson')?.addEventListener('click', () => {
      this.loadFromJson();
    });

    // Export PDF (Direct Draw)
    document.getElementById('btnExportPdf')?.addEventListener('click', () => {
      this.exportPdf();
    });

    // Preview PDF
    document.getElementById('btnPreview')?.addEventListener('click', () => {
      this.showPreview();
    });

    // View JSON Blueprint
    document.getElementById('btnViewJson')?.addEventListener('click', () => {
      this.showJsonBlueprint();
    });

    // Modal close handlers
    document.getElementById('closePreview')?.addEventListener('click', () => {
      document.getElementById('previewModal').classList.remove('show');
    });
    document.getElementById('closePreviewBtn')?.addEventListener('click', () => {
      document.getElementById('previewModal').classList.remove('show');
    });
    document.getElementById('downloadPdf')?.addEventListener('click', () => {
      this.downloadPdf();
    });

    // Paper Size Change
    document.getElementById('paperSizeSelect')?.addEventListener('change', (e) => {
      this.changePaperSize(e.target.value);
    });

    // JSON Modal
    document.getElementById('closeJsonModal')?.addEventListener('click', () => {
      document.getElementById('jsonModal').classList.remove('show');
    });
    document.getElementById('copyJson')?.addEventListener('click', () => {
      this.copyJsonToClipboard();
    });
    document.getElementById('downloadJson')?.addEventListener('click', () => {
      this.downloadJsonBlueprint();
    });
  }

  setupVariableButtons() {
    document.querySelectorAll('.quick-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        this.insertVariable(btn.dataset.var);
      });
    });
  }

  insertVariable(varName) {
    const text = `{{${varName}}}`;
    this.editor.model.change(writer => {
      this.editor.model.insertContent(writer.createText(text));
    });
    this.editor.editing.view.focus();
  }

  /**
   * Generate JSON Blueprint from CKEditor content
   */
  generateBlueprint() {
    const html = this.editor.getData();
    this.currentBlueprint = this.parser.parse(html);

    // Add metadata
    this.currentBlueprint.templateId = 'tpl_' + Date.now();
    this.currentBlueprint.name = this.templateName;
    this.currentBlueprint.createdAt = new Date().toISOString();
    this.currentBlueprint.variables = Array.from(this.detectedVariables);
    this.currentBlueprint.sourceHtml = html;

    return this.currentBlueprint;
  }

  /**
   * Show JSON Blueprint modal
   */
  showJsonBlueprint() {
    const blueprint = this.generateBlueprint();
    const jsonStr = JSON.stringify(blueprint, null, 2);

    document.getElementById('jsonOutput').textContent = jsonStr;
    document.getElementById('jsonModal').classList.add('show');
  }

  changePaperSize(size) {
    const paper = document.querySelector('.paper');
    paper.className = 'paper ' + size;
    console.log('Paper size changed to:', size);
  }

  getPaperSize() {
    return document.getElementById('paperSizeSelect')?.value || 'a4';
  }

  /**
   * Export PDF using direct jsPDF draw
   */
  exportPdf() {
    const loading = document.getElementById('loading');
    loading.classList.add('show');

    try {
      const blueprint = this.generateBlueprint();
      const options = {
        format: this.getPaperSize(),
        orientation: 'portrait'
      };

      this.renderer.render(blueprint, this.variableData, options);
      this.renderer.download(`${this.templateName}.pdf`);

      console.log('✅ PDF exported successfully (Direct Draw)');
    } catch (error) {
      console.error('PDF export failed:', error);
      alert('Export thất bại: ' + error.message);
    } finally {
      loading.classList.remove('show');
    }
  }

  /**
   * Show PDF Preview
   */
  showPreview() {
    const loading = document.getElementById('loading');
    loading.classList.add('show');
    console.log(this.variableData);
    try {
      const blueprint = this.generateBlueprint();
      const options = {
        format: this.getPaperSize(),
        orientation: 'portrait'
      };

      this.renderer.render(blueprint, this.variableData, options);

      const dataUrl = this.renderer.getDataUrl();
      document.getElementById('pdfPreview').src = dataUrl;
      document.getElementById('previewModal').classList.add('show');

      console.log('✅ Preview generated (Direct Draw)');
    } catch (error) {
      console.error('Preview failed:', error);
      alert('Preview thất bại: ' + error.message);
    } finally {
      loading.classList.remove('show');
    }
  }

  downloadPdf() {
    if (this.renderer.pdf) {
      this.renderer.download(`${this.templateName}.pdf`);
    }
  }

  copyJsonToClipboard() {
    const json = document.getElementById('jsonOutput').textContent;
    navigator.clipboard.writeText(json);
    alert('Đã copy JSON!');
  }

  downloadJsonBlueprint() {
    const blueprint = this.generateBlueprint();
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.templateName}_blueprint.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  /**
   * Save template with blueprint
   */
  saveAsJson() {
    const blueprint = this.generateBlueprint();
    const blob = new Blob([JSON.stringify(blueprint, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${this.templateName.replace(/\s+/g, '_')}.json`;
    a.click();
    URL.revokeObjectURL(url);
  }

  loadFromJson() {
    const input = document.createElement('input');
    input.type = 'file';
    input.accept = '.json';

    input.onchange = async (e) => {
      const file = e.target.files[0];
      if (file) {
        try {
          const text = await file.text();
          const template = JSON.parse(text);
          this.loadTemplate(template);
        } catch (err) {
          alert('Load thất bại: ' + err.message);
        }
      }
    };

    input.click();
  }

  loadTemplate(template) {
    // Load source HTML if available
    if (template.sourceHtml) {
      this.editor.setData(template.sourceHtml);
    }

    this.templateName = template.name || 'Loaded Template';
    this.currentBlueprint = template;

    this.detectVariables();
    console.log('📂 Template loaded:', template.name);
  }

  autoSave() {
    const template = {
      name: this.templateName,
      sourceHtml: this.editor.getData(),
      variableData: this.variableData
    };
    localStorage.setItem('ckeditor_autosave', JSON.stringify(template));
  }

  loadFromLocalStorage() {
    try {
      const saved = localStorage.getItem('ckeditor_autosave');
      if (saved) {
        const template = JSON.parse(saved);
        setTimeout(() => {
          if (template.sourceHtml) {
            this.editor.setData(template.sourceHtml);
          }
          this.variableData = template.variableData || {};
          this.detectVariables();
          console.log('📂 Auto-restored');
        }, 500);
      }
    } catch (err) {
      console.error('Restore failed:', err);
    }
  }
}

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  window.templateEditor = new TemplateEditor();

  // Load sample data (optional - only if file exists)
  // async function loadSampleData() {
  //   try {
  //     const response = await fetch('sample-data.json');
  //     if (!response.ok) {
  //       console.log('ℹ️ No sample-data.json found (optional)');
  //       return;
  //     }
  //     const data = await response.json();
  //     templateEditor.variableData = data;
  //     templateEditor.detectVariables();
  //     console.log('📂 Sample data loaded');
  //   } catch (err) {
  //     console.log('ℹ️ sample-data.json not available:', err.message);
  //   }
  // }

  // await loadSampleData();
});

export default TemplateEditor;
