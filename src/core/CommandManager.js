/**
 * CommandManager - Undo/Redo System
 * Implements Command Pattern for reversible operations
 */

import { eventBus, Events } from './EventBus.js';

class CommandManager {
  constructor(maxHistory = 50) {
    this.undoStack = [];
    this.redoStack = [];
    this.maxHistory = maxHistory;
    
    this.init();
  }

  /**
   * Initialize command manager
   */
  init() {
    this.setupEventListeners();
    console.log('✅ CommandManager initialized');
  }

  /**
   * Setup event listeners
   */
  setupEventListeners() {
    eventBus.on(Events.COMMAND_UNDO, () => this.undo());
    eventBus.on(Events.COMMAND_REDO, () => this.redo());
  }

  /**
   * Execute a command
   * @param {Object} command - { execute: Function, undo: Function, description: string }
   */
  execute(command) {
    if (typeof command.execute !== 'function') {
      console.error('Invalid command: missing execute function');
      return;
    }

    // Execute the command
    command.execute();

    // Add to undo stack
    this.undoStack.push(command);

    // Limit stack size
    if (this.undoStack.length > this.maxHistory) {
      this.undoStack.shift();
    }

    // Clear redo stack
    this.redoStack = [];

    eventBus.emit(Events.COMMAND_EXECUTE, { 
      description: command.description,
      canUndo: this.canUndo(),
      canRedo: this.canRedo()
    });
  }

  /**
   * Undo last command
   */
  undo() {
    if (!this.canUndo()) return;

    const command = this.undoStack.pop();
    
    if (command && typeof command.undo === 'function') {
      command.undo();
      this.redoStack.push(command);
      
      eventBus.emit(Events.COMMAND_UNDO, {
        description: command.description,
        canUndo: this.canUndo(),
        canRedo: this.canRedo()
      });
    }
  }

  /**
   * Redo last undone command
   */
  redo() {
    if (!this.canRedo()) return;

    const command = this.redoStack.pop();
    
    if (command && typeof command.execute === 'function') {
      command.execute();
      this.undoStack.push(command);
      
      eventBus.emit(Events.COMMAND_REDO, {
        description: command.description,
        canUndo: this.canUndo(),
        canRedo: this.canRedo()
      });
    }
  }

  /**
   * Check if undo is available
   */
  canUndo() {
    return this.undoStack.length > 0;
  }

  /**
   * Check if redo is available
   */
  canRedo() {
    return this.redoStack.length > 0;
  }

  /**
   * Clear all history
   */
  clear() {
    this.undoStack = [];
    this.redoStack = [];
  }

  /**
   * Get history length
   */
  getHistoryLength() {
    return {
      undo: this.undoStack.length,
      redo: this.redoStack.length
    };
  }
}

// Command factory helpers
export const createCommand = (execute, undo, description = 'Command') => ({
  execute,
  undo,
  description
});

export default CommandManager;
