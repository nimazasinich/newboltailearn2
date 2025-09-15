/**
 * Accessible Modal Component
 * Implements WCAG 2.1 AA compliant modal with focus trapping and keyboard navigation
 */

class AccessibleModal {
  constructor(modalElement, options = {}) {
    this.modal = modalElement;
    this.options = {
      closeOnEscape: true,
      closeOnBackdropClick: true,
      restoreFocus: true,
      preventScroll: true,
      ...options
    };
    
    this.isOpen = false;
    this.triggerElement = null;
    this.focusTrap = null;
    this.previousBodyOverflow = '';
    
    this.init();
  }
  
  init() {
    // Ensure proper ARIA attributes
    this.modal.setAttribute('role', 'dialog');
    this.modal.setAttribute('aria-modal', 'true');
    this.modal.setAttribute('tabindex', '-1');
    
    // Hide modal initially
    this.modal.style.display = 'none';
    this.modal.setAttribute('aria-hidden', 'true');
    
    // Set up event listeners
    this.setupEventListeners();
    
    console.log('AccessibleModal: Initialized');
  }
  
  setupEventListeners() {
    // Close button(s)
    const closeButtons = this.modal.querySelectorAll('[data-modal-close]');
    closeButtons.forEach(button => {
      button.addEventListener('click', (e) => {
        e.preventDefault();
        this.close();
      });
    });
    
    // Backdrop click
    if (this.options.closeOnBackdropClick) {
      this.modal.addEventListener('click', (e) => {
        if (e.target === this.modal) {
          this.close();
        }
      });
    }
    
    // Escape key
    if (this.options.closeOnEscape) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen) {
          this.close();
        }
      });
    }
  }
  
  open(triggerElement = null) {
    if (this.isOpen) return;
    
    this.triggerElement = triggerElement || document.activeElement;
    this.isOpen = true;
    
    // Prevent body scroll
    if (this.options.preventScroll) {
      this.previousBodyOverflow = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
    }
    
    // Show modal
    this.modal.style.display = 'block';
    this.modal.removeAttribute('aria-hidden');
    
    // Force reflow for animations
    this.modal.offsetHeight;
    
    // Add open class for CSS transitions
    this.modal.classList.add('modal--open');
    
    // Set up focus trap
    this.setupFocusTrap();
    
    // Dispatch open event
    this.modal.dispatchEvent(new CustomEvent('modalopen', {
      detail: { modal: this.modal, trigger: this.triggerElement }
    }));
    
    // Announce to screen readers
    if (window.focusManager) {
      const title = this.modal.querySelector('[data-modal-title]');
      if (title) {
        window.focusManager.announce(`باز شد: ${title.textContent}`, 'assertive');
      }
    }
    
    console.log('AccessibleModal: Opened');
  }
  
  close() {
    if (!this.isOpen) return;
    
    this.isOpen = false;
    
    // Release focus trap
    if (this.focusTrap) {
      this.focusTrap.deactivate();
      this.focusTrap = null;
    }
    
    // Restore body scroll
    if (this.options.preventScroll) {
      document.body.style.overflow = this.previousBodyOverflow;
    }
    
    // Hide modal with animation
    this.modal.classList.remove('modal--open');
    
    // Wait for animation before hiding
    const animationDuration = parseFloat(getComputedStyle(this.modal).transitionDuration) * 1000;
    
    setTimeout(() => {
      this.modal.style.display = 'none';
      this.modal.setAttribute('aria-hidden', 'true');
    }, animationDuration || 300);
    
    // Restore focus
    if (this.options.restoreFocus && this.triggerElement && this.triggerElement.focus) {
      this.triggerElement.focus();
    }
    
    // Dispatch close event
    this.modal.dispatchEvent(new CustomEvent('modalclose', {
      detail: { modal: this.modal, trigger: this.triggerElement }
    }));
    
    // Announce to screen readers
    if (window.focusManager) {
      window.focusManager.announce('بسته شد', 'polite');
    }
    
    console.log('AccessibleModal: Closed');
  }
  
  setupFocusTrap() {
    if (!window.focusManager) {
      console.warn('AccessibleModal: FocusManager not available');
      return;
    }
    
    // Find initial focus element
    let initialFocus = this.modal.querySelector('[data-modal-initial-focus]');
    if (!initialFocus) {
      // Try close button
      initialFocus = this.modal.querySelector('[data-modal-close]');
    }
    if (!initialFocus) {
      // Try first heading
      initialFocus = this.modal.querySelector('h1, h2, h3, h4, h5, h6');
    }
    
    this.focusTrap = window.focusManager.trapFocus(this.modal, {
      initialFocus,
      returnFocus: this.options.restoreFocus,
      escapeDeactivates: false // We handle escape ourselves
    });
  }
  
  toggle(triggerElement = null) {
    if (this.isOpen) {
      this.close();
    } else {
      this.open(triggerElement);
    }
  }
  
  destroy() {
    if (this.isOpen) {
      this.close();
    }
    
    // Remove event listeners would go here if we stored references
    console.log('AccessibleModal: Destroyed');
  }
}

// Auto-initialize modals on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  // Find all modal elements
  const modalElements = document.querySelectorAll('[data-modal]');
  
  modalElements.forEach(modalElement => {
    // Get options from data attributes
    const options = {
      closeOnEscape: modalElement.dataset.closeOnEscape !== 'false',
      closeOnBackdropClick: modalElement.dataset.closeOnBackdropClick !== 'false',
      restoreFocus: modalElement.dataset.restoreFocus !== 'false',
      preventScroll: modalElement.dataset.preventScroll !== 'false'
    };
    
    // Initialize modal
    const modal = new AccessibleModal(modalElement, options);
    
    // Store reference on element
    modalElement._accessibleModal = modal;
  });
  
  // Set up modal triggers
  document.addEventListener('click', (e) => {
    const trigger = e.target.closest('[data-modal-trigger]');
    if (trigger) {
      e.preventDefault();
      
      const targetSelector = trigger.dataset.modalTrigger;
      const targetModal = document.querySelector(targetSelector);
      
      if (targetModal && targetModal._accessibleModal) {
        targetModal._accessibleModal.open(trigger);
      }
    }
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibleModal;
}

// Global namespace
window.AccessibleModal = AccessibleModal;