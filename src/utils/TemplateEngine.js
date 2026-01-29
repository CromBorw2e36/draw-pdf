/**
 * Template Engine for PDF Builder
 * Supports: nested objects, loops (#each), conditionals (#if), helper tags
 */

export class TemplateEngine {
  /**
   * Get nested value from object using dot notation
   * @param {Object} obj - Data object
   * @param {string} path - Dot notation path (e.g., "user.address.city")
   * @returns {*} Value at path or undefined
   */
  static getNestedValue(obj, path) {
    if (!obj || !path) return undefined;
    
    const parts = path.trim().split('.');
    let current = obj;
    
    for (const part of parts) {
      if (current === null || current === undefined) return undefined;
      current = current[part];
    }
    
    return current;
  }

  /**
   * Evaluate simple condition expression
   * Supports: ===, !==, >, <, >=, <=, truthy check
   * @param {string} expression - Condition expression
   * @param {Object} data - Data context
   * @returns {boolean}
   */
  static evaluateCondition(expression, data) {
    const expr = expression.trim();
    
    // Check for comparison operators
    const operators = ['===', '!==', '>=', '<=', '>', '<'];
    
    for (const op of operators) {
      if (expr.includes(op)) {
        const [left, right] = expr.split(op).map(s => s.trim());
        const leftVal = this.resolveValue(left, data);
        const rightVal = this.resolveValue(right, data);
        
        switch (op) {
          case '===': return leftVal === rightVal;
          case '!==': return leftVal !== rightVal;
          case '>': return leftVal > rightVal;
          case '<': return leftVal < rightVal;
          case '>=': return leftVal >= rightVal;
          case '<=': return leftVal <= rightVal;
        }
      }
    }
    
    // Simple truthy check
    const value = this.resolveValue(expr, data);
    return Boolean(value);
  }

  /**
   * Resolve a value - could be a variable path or literal
   * @param {string} token - Value token
   * @param {Object} data - Data context
   * @returns {*}
   */
  static resolveValue(token, data) {
    const trimmed = token.trim();
    
    // String literal (single or double quotes)
    if ((trimmed.startsWith("'") && trimmed.endsWith("'")) ||
        (trimmed.startsWith('"') && trimmed.endsWith('"'))) {
      return trimmed.slice(1, -1);
    }
    
    // Number literal
    if (!isNaN(trimmed) && trimmed !== '') {
      return parseFloat(trimmed);
    }
    
    // Boolean literals
    if (trimmed === 'true') return true;
    if (trimmed === 'false') return false;
    if (trimmed === 'null') return null;
    if (trimmed === 'undefined') return undefined;
    
    // Variable path
    return this.getNestedValue(data, trimmed);
  }

  /**
   * Process {{#if condition}}...{{/if}} blocks
   * Also supports {{#if}}...{{else}}...{{/if}}
   * @param {string} text - Template text
   * @param {Object} data - Data context
   * @returns {string}
   */
  static processIfBlocks(text, data) {
    // Pattern: {{#if condition}}content{{/if}} or {{#if condition}}content{{else}}altContent{{/if}}
    const ifPattern = /\{\{#if\s+([^}]+)\}\}([\s\S]*?)\{\{\/if\}\}/g;
    
    return text.replace(ifPattern, (match, condition, content) => {
      const result = this.evaluateCondition(condition, data);
      
      // Check for else block
      const elseIndex = content.indexOf('{{else}}');
      if (elseIndex !== -1) {
        const ifContent = content.substring(0, elseIndex);
        const elseContent = content.substring(elseIndex + 8); // 8 = '{{else}}'.length
        return result ? ifContent : elseContent;
      }
      
      return result ? content : '';
    });
  }

  /**
   * Process {{#each array}}...{{/each}} blocks
   * Also supports {{~#each}} tilde syntax for whitespace control
   * Special vars: @index, @first, @last
   * Auto-adds newline between items
   * Supports multi-line template content
   * @param {string} text - Template text
   * @param {Object} data - Data context
   * @returns {string}
   */
  static processEachBlocks(text, data) {
    // Pattern: {{#each arrayName}}content{{/each}} or {{~#each arrayName~}}content{{~/each~}}
    // The ~? makes tilde optional at various positions
    const eachPattern = /\{\{~?#each\s+([^}~]+)~?\}\}([\s\S]*?)\{\{~?\/each~?\}\}/g;
    
    return text.replace(eachPattern, (match, arrayPath, content) => {
      const trimmedPath = arrayPath.trim();
      const array = this.getNestedValue(data, trimmedPath);
      
      console.log('[TemplateEngine] #each:', trimmedPath, 'array:', array);
      
      if (!Array.isArray(array) || array.length === 0) {
        console.log('[TemplateEngine] #each: array not found or empty');
        return '';
      }
      
      // Trim leading/trailing whitespace from content to support multi-line templates
      // This allows writing:
      // {{#each items}}
      //   - {{name}}
      // {{/each}}
      const trimmedContent = content.trim();
      
      return array.map((item, index) => {
        // Create context for this iteration
        const itemContext = {
          ...data,          // Parent data
          ...item,          // Item properties (if object)
          '@index': index,
          '@first': index === 0,
          '@last': index === array.length - 1,
          '@item': item     // Reference to current item
        };
        
        // Process nested if blocks within each
        let processed = this.processIfBlocks(trimmedContent, itemContext);
        
        // Process format helpers within each
        processed = this.processFormatHelpers(processed, itemContext);
        
        // Process date helpers within each
        processed = this.processDateHelpers(processed);
        
        // Replace variables in this iteration
        processed = this.replaceVariables(processed, itemContext);
        
        // Process layout tags within each
        processed = this.processLayoutTags(processed);
        
        return processed.trim();
      }).join('\n'); // Auto-newline between items
    });
  }

  /**
   * Process helper tags: {{br}}, {{tab}}, {{space}}, {{hr}}, {{pageBreak}}
   * Converts to markers that renderer will handle
   * @param {string} text - Template text
   * @returns {string}
   */
  static processLayoutTags(text) {
    let result = text;
    
    // {{br}} - Line break marker (renderer will increase currentY)
    result = result.replace(/\{\{br\}\}/gi, '___BR___');
    
    // {{tab}} - Tab/Indent marker
    result = result.replace(/\{\{tab\}\}/gi, '___TAB___');
    
    // {{space}} - Non-breaking space (actual character is fine)
    result = result.replace(/\{\{space\}\}/gi, '\u00A0');
    
    // {{hr}} - Horizontal rule marker
    result = result.replace(/\{\{hr\}\}/gi, '___HR___');
    
    // {{pageBreak}} - Page break marker
    result = result.replace(/\{\{pageBreak\}\}/gi, '___PAGEBREAK___');
    
    return result;
  }

  /**
   * Process format helpers
   * @param {string} text - Template text
   * @param {Object} data - Data context
   * @returns {string}
   */
  static processFormatHelpers(text, data) {
    let result = text;
    
    // {{formatNumber value}} - Format number with thousand separators
    result = result.replace(/\{\{formatNumber\s+([^}]+)\}\}/g, (match, varPath) => {
      const value = this.getNestedValue(data, varPath.trim());
      if (value === undefined || value === null) return match;
      return this.formatNumber(value);
    });
    
    // {{formatCurrency value}} - Format as Vietnamese currency
    result = result.replace(/\{\{formatCurrency\s+([^}]+)\}\}/g, (match, varPath) => {
      const value = this.getNestedValue(data, varPath.trim());
      if (value === undefined || value === null) return match;
      return this.formatCurrency(value);
    });
    
    // {{formatDate value}} - Format date string
    result = result.replace(/\{\{formatDate\s+([^}]+)\}\}/g, (match, varPath) => {
      const value = this.getNestedValue(data, varPath.trim());
      if (value === undefined || value === null) return match;
      return this.formatDate(value);
    });
    
    // {{uppercase value}} - Convert to uppercase
    result = result.replace(/\{\{uppercase\s+([^}]+)\}\}/g, (match, varPath) => {
      const value = this.getNestedValue(data, varPath.trim());
      if (value === undefined || value === null) return match;
      return String(value).toUpperCase();
    });
    
    // {{lowercase value}} - Convert to lowercase
    result = result.replace(/\{\{lowercase\s+([^}]+)\}\}/g, (match, varPath) => {
      const value = this.getNestedValue(data, varPath.trim());
      if (value === undefined || value === null) return match;
      return String(value).toLowerCase();
    });
    
    // {{capitalize value}} - Capitalize first letter of each word
    result = result.replace(/\{\{capitalize\s+([^}]+)\}\}/g, (match, varPath) => {
      const value = this.getNestedValue(data, varPath.trim());
      if (value === undefined || value === null) return match;
      return String(value).replace(/\b\w/g, l => l.toUpperCase());
    });
    
    return result;
  }

  /**
   * Process date helpers: {{now}}, {{today}}, {{year}}, {{month}}, {{day}}
   * @param {string} text - Template text
   * @returns {string}
   */
  static processDateHelpers(text) {
    const now = new Date();
    let result = text;
    
    // {{now}} - Full datetime
    result = result.replace(/\{\{now\}\}/gi, now.toLocaleString('vi-VN'));
    
    // {{today}} - Today's date (dd/MM/yyyy)
    result = result.replace(/\{\{today\}\}/gi, this.formatDateObject(now));
    
    // {{year}} - Current year
    result = result.replace(/\{\{year\}\}/gi, String(now.getFullYear()));
    
    // {{month}} - Current month (01-12)
    result = result.replace(/\{\{month\}\}/gi, String(now.getMonth() + 1).padStart(2, '0'));
    
    // {{day}} - Current day (01-31)
    result = result.replace(/\{\{day\}\}/gi, String(now.getDate()).padStart(2, '0'));
    
    // {{time}} - Current time (HH:mm)
    result = result.replace(/\{\{time\}\}/gi, 
      `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`);
    
    return result;
  }

  /**
   * Format number with thousand separators (Vietnamese style: 1.000.000)
   */
  static formatNumber(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return String(value);
    return num.toLocaleString('vi-VN');
  }

  /**
   * Format as Vietnamese currency (25.000.000đ)
   */
  static formatCurrency(value) {
    const num = parseFloat(value);
    if (isNaN(num)) return String(value);
    return num.toLocaleString('vi-VN') + 'đ';
  }

  /**
   * Format date string or object to dd/MM/yyyy
   */
  static formatDate(value) {
    if (!value) return '';
    
    // If already formatted as dd/MM/yyyy, return as is
    if (typeof value === 'string' && /^\d{2}\/\d{2}\/\d{4}$/.test(value)) {
      return value;
    }
    
    // Try to parse as date
    const date = new Date(value);
    if (isNaN(date.getTime())) return String(value);
    
    return this.formatDateObject(date);
  }

  /**
   * Format Date object to dd/MM/yyyy
   */
  static formatDateObject(date) {
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Replace {{variable}} placeholders with values
   * Supports nested paths: {{user.address.city}}
   * @param {string} text - Template text
   * @param {Object} data - Data context
   * @returns {string}
   */
  static replaceVariables(text, data) {
    if (!text || typeof text !== 'string') return text || '';
    
    // Pattern: {{variableName}} or {{path.to.value}}
    // Exclude special blocks (#if, #each, /if, /each, else, @index, etc.)
    // Exclude format helpers (formatNumber, formatCurrency, etc.)
    return text.replace(/\{\{([^#\/][^}]*?)\}\}/g, (match, varPath) => {
      const trimmed = varPath.trim();
      
      // Skip layout tags and format helpers (already processed)
      const skipPatterns = ['br', 'tab', 'space', 'hr', 'pageBreak', 
        'now', 'today', 'year', 'month', 'day', 'time'];
      if (skipPatterns.includes(trimmed.toLowerCase())) {
        return match;
      }
      
      // Skip format helpers
      if (trimmed.startsWith('formatNumber') || 
          trimmed.startsWith('formatCurrency') ||
          trimmed.startsWith('formatDate') ||
          trimmed.startsWith('uppercase') ||
          trimmed.startsWith('lowercase') ||
          trimmed.startsWith('capitalize')) {
        return match;
      }
      
      // Skip special tokens that start with @
      if (trimmed.startsWith('@')) {
        const value = data[trimmed];
        return value !== undefined ? String(value) : match;
      }
      
      const value = this.getNestedValue(data, trimmed);
      return value !== undefined ? String(value) : match;
    });
  }

  /**
   * Main process function - processes all template features
   * Order: if blocks → each blocks → format helpers → date helpers → variables → layout tags
   * @param {string} text - Template text
   * @param {Object} data - Data context
   * @returns {string}
   */
  static process(text, data) {
    if (!text || typeof text !== 'string') return text || '';
    
    let result = text;
    
    // 1. Process conditionals first (they might contain loops or vars)
    result = this.processIfBlocks(result, data);
    
    // 2. Process loops (they contain variables)
    result = this.processEachBlocks(result, data);
    
    // 3. Process format helpers
    result = this.processFormatHelpers(result, data);
    
    // 4. Process date helpers
    result = this.processDateHelpers(result);
    
    // 5. Replace remaining simple variables
    result = this.replaceVariables(result, data);
    
    // 6. Process layout tags last
    result = this.processLayoutTags(result);
    
    return result;
  }

  /**
   * Extract all variable names from template
   * @param {string} text - Template text
   * @returns {string[]} Array of variable paths
   */
  static extractVariables(text) {
    if (!text || typeof text !== 'string') return [];
    
    const variables = new Set();
    
    // Skip list for helper tags
    const skipPatterns = ['br', 'tab', 'space', 'hr', 'pageBreak', 
      'now', 'today', 'year', 'month', 'day', 'time', 'else'];
    
    // Simple variables
    const varPattern = /\{\{([^#\/][^}]*?)\}\}/g;
    let match;
    while ((match = varPattern.exec(text)) !== null) {
      const varPath = match[1].trim();
      
      // Skip special tokens
      if (varPath.startsWith('@')) continue;
      if (skipPatterns.includes(varPath.toLowerCase())) continue;
      
      // Extract variable from format helpers
      if (varPath.startsWith('formatNumber ') || 
          varPath.startsWith('formatCurrency ') ||
          varPath.startsWith('formatDate ') ||
          varPath.startsWith('uppercase ') ||
          varPath.startsWith('lowercase ') ||
          varPath.startsWith('capitalize ')) {
        const parts = varPath.split(' ');
        if (parts[1]) variables.add(parts[1].trim());
        continue;
      }
      
      variables.add(varPath);
    }
    
    // Variables in #each - the array name
    const eachPattern = /\{\{#each\s+([^}]+)\}\}/g;
    while ((match = eachPattern.exec(text)) !== null) {
      variables.add(match[1].trim());
    }
    
    // Variables in #if conditions
    const ifPattern = /\{\{#if\s+([^}]+)\}\}/g;
    while ((match = ifPattern.exec(text)) !== null) {
      const condition = match[1].trim();
      // Extract variable names from condition
      const condVars = condition.split(/[=!<>]+/).map(s => s.trim());
      condVars.forEach(v => {
        if (v && !v.startsWith("'") && !v.startsWith('"') && isNaN(v) && 
            v !== 'true' && v !== 'false' && v !== 'null') {
          variables.add(v);
        }
      });
    }
    
    return Array.from(variables);
  }
}

export default TemplateEngine;

