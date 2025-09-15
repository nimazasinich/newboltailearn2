/**
 * Focus Management Utilities
 * Provides focus trapping, restoration, and keyboard navigation helpers
 */

class FocusManager {
  constructor() {
    this.focusableSelectors = [
      'a[href]',
      'button:not([disabled])',
      'textarea:not([disabled])',
      'input:not([type="hidden"]):not([disabled])',
      'select:not([disabled])',
      '[tabindex]:not([tabindex="-1"])',
      '[contenteditable="true"]'
    ].join(', ');
    
    this.trapStack = [];
  }
  
  /**
   * Get all focusable elements within a container
   */
  getFocusableElements(container) {
    const elements = Array.from(container.querySelectorAll(this.focusableSelectors));
    return elements.filter(element => {
      return this.isVisible(element) && !this.isInert(element);
    });
  }
  
  /**
   * Check if an element is visible
   */
  isVisible(element) {
    const style = window.getComputedStyle(element);
    return style.display !== 'none' && 
           style.visibility !== 'hidden' && 
           element.offsetWidth > 0 && 
           element.offsetHeight > 0;
  }
  
  /**
   * Check if an element is inert (inside an inert container)
   */
  isInert(element) {
    let current = element;
    while (current) {
      if (current.hasAttribute && current.hasAttribute('inert')) {
        return true;
      }
      current = current.parentElement;
    }
    return false;
  }
  
  /**
   * Trap focus within a container
   */
  trapFocus(container, options = {}) {
    const {
      initialFocus = null,
      returnFocus = true,
      escapeDeactivates = true
    } = options;
    
    const focusableElements = this.getFocusableElements(container);
    
    if (focusableElements.length === 0) {
      console.warn('FocusManager: No focusable elements found in container');
      return null;
    }
    
    const firstFocusable = focusableElements[0];
    const lastFocusable = focusableElements[focusableElements.length - 1];
    const previousActiveElement = document.activeElement;
    
    // Set initial focus
    const elementToFocus = initialFocus && focusableElements.includes(initialFocus) 
      ? initialFocus 
      : firstFocusable;
    
    elementToFocus.focus();
    
    const handleKeyDown = (e) => {
      if (e.key === 'Tab') {
        if (e.shiftKey) {
          // Shift + Tab
          if (document.activeElement === firstFocusable) {
            e.preventDefault();
            lastFocusable.focus();
          }
        } else {
          // Tab
          if (document.activeElement === lastFocusable) {
            e.preventDefault();
            firstFocusable.focus();
          }
        }
      } else if (e.key === 'Escape' && escapeDeactivates) {
        this.releaseFocus();
      }
    };
    
    const handleFocusIn = (e) => {
      if (!container.contains(e.target)) {
        e.preventDefault();
        firstFocusable.focus();
      }
    };
    
    // Add event listeners
    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('focusin', handleFocusIn);
    
    // Store trap info
    const trap = {
      container,
      handleKeyDown,
      handleFocusIn,
      previousActiveElement: returnFocus ? previousActiveElement : null,
      deactivate: () => {
        document.removeEventListener('keydown', handleKeyDown);
        document.removeEventListener('focusin', handleFocusIn);
        
        if (returnFocus && previousActiveElement && previousActiveElement.focus) {
          previousActiveElement.focus();
        }
        
        // Remove from stack
        const index = this.trapStack.indexOf(trap);
        if (index !== -1) {
          this.trapStack.splice(index, 1);
        }
      }
    };
    
    this.trapStack.push(trap);
    
    return trap;
  }
  
  /**
   * Release the most recent focus trap
   */
  releaseFocus() {
    if (this.trapStack.length > 0) {
      const currentTrap = this.trapStack[this.trapStack.length - 1];
      currentTrap.deactivate();
    }
  }
  
  /**
   * Release all focus traps
   */
  releaseAllTraps() {
    while (this.trapStack.length > 0) {
      this.releaseFocus();
    }
  }
  
  /**
   * Move focus to the next focusable element
   */
  focusNext(container = document.body) {
    const focusableElements = this.getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(document.activeElement);
    
    if (currentIndex !== -1) {
      const nextIndex = (currentIndex + 1) % focusableElements.length;
      focusableElements[nextIndex].focus();
    } else if (focusableElements.length > 0) {
      focusableElements[0].focus();
    }
  }
  
  /**
   * Move focus to the previous focusable element
   */
  focusPrevious(container = document.body) {
    const focusableElements = this.getFocusableElements(container);
    const currentIndex = focusableElements.indexOf(document.activeElement);
    
    if (currentIndex !== -1) {
      const prevIndex = (currentIndex - 1 + focusableElements.length) % focusableElements.length;
      focusableElements[prevIndex].focus();
    } else if (focusableElements.length > 0) {
      focusableElements[focusableElements.length - 1].focus();
    }
  }
  
  /**
   * Announce text to screen readers
   */
  announce(message, priority = 'polite') {
    const announcer = document.createElement('div');
    announcer.setAttribute('aria-live', priority);
    announcer.setAttribute('aria-atomic', 'true');
    announcer.className = 'sr-only';
    announcer.textContent = message;
    
    document.body.appendChild(announcer);
    
    // Remove after announcement
    setTimeout(() => {
      if (announcer.parentNode) {
        announcer.parentNode.removeChild(announcer);
      }
    }, 1000);
  }
  
  /**
   * Set up roving tabindex for a group of elements
   */
  setupRovingTabindex(container, options = {}) {
    const {
      selector = '[role="tab"], [role="option"], [role="menuitem"]',
      orientation = 'horizontal',
      wrap = true
    } = options;
    
    const elements = Array.from(container.querySelectorAll(selector));
    
    if (elements.length === 0) return null;
    
    // Set initial tabindex values
    elements.forEach((element, index) => {
      element.setAttribute('tabindex', index === 0 ? '0' : '-1');
    });
    
    const handleKeyDown = (e) => {
      const currentIndex = elements.indexOf(e.target);
      if (currentIndex === -1) return;
      
      let nextIndex = currentIndex;
      
      switch (e.key) {
        case 'ArrowRight':
          if (orientation === 'horizontal') {
            nextIndex = wrap 
              ? (currentIndex + 1) % elements.length 
              : Math.min(currentIndex + 1, elements.length - 1);
            e.preventDefault();
          }
          break;
          
        case 'ArrowLeft':
          if (orientation === 'horizontal') {
            nextIndex = wrap 
              ? (currentIndex - 1 + elements.length) % elements.length 
              : Math.max(currentIndex - 1, 0);
            e.preventDefault();
          }
          break;
          
        case 'ArrowDown':
          if (orientation === 'vertical') {
            nextIndex = wrap 
              ? (currentIndex + 1) % elements.length 
              : Math.min(currentIndex + 1, elements.length - 1);
            e.preventDefault();
          }
          break;
          
        case 'ArrowUp':
          if (orientation === 'vertical') {
            nextIndex = wrap 
              ? (currentIndex - 1 + elements.length) % elements.length 
              : Math.max(currentIndex - 1, 0);
            e.preventDefault();
          }
          break;
          
        case 'Home':
          nextIndex = 0;
          e.preventDefault();
          break;
          
        case 'End':
          nextIndex = elements.length - 1;
          e.preventDefault();
          break;
      }
      
      if (nextIndex !== currentIndex) {
        // Update tabindex
        elements[currentIndex].setAttribute('tabindex', '-1');
        elements[nextIndex].setAttribute('tabindex', '0');
        elements[nextIndex].focus();
      }
    };
    
    container.addEventListener('keydown', handleKeyDown);
    
    return {
      destroy: () => {
        container.removeEventListener('keydown', handleKeyDown);
      }
    };
  }
}

// Create global instance
const focusManager = new FocusManager();

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = FocusManager;
}

// Global namespace
window.FocusManager = FocusManager;
window.focusManager = focusManager;