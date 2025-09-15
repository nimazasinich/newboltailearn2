/**
 * Accessible Tabs Controller
 * Implements WCAG 2.1 AA compliant tab interface with keyboard navigation
 * and hash-based routing for deep linking
 */

class AccessibleTabs {
  constructor(container, options = {}) {
    this.container = container;
    this.options = {
      autoActivate: true,
      orientation: 'horizontal',
      hashRouting: true,
      focusOnActivate: true,
      ...options
    };
    
    this.tabs = [];
    this.panels = [];
    this.currentIndex = 0;
    this.isRTL = document.dir === 'rtl' || document.documentElement.dir === 'rtl';
    
    this.init();
  }
  
  init() {
    this.findTabsAndPanels();
    this.setupEventListeners();
    this.setupHashRouting();
    this.activateInitialTab();
  }
  
  findTabsAndPanels() {
    // Find all tabs and panels
    this.tabs = Array.from(this.container.querySelectorAll('[role="tab"]'));
    this.panels = Array.from(this.container.querySelectorAll('[role="tabpanel"]'));
    
    if (this.tabs.length === 0 || this.panels.length === 0) {
      console.warn('AccessibleTabs: No tabs or panels found');
      return;
    }
    
    // Ensure proper ARIA relationships
    this.tabs.forEach((tab, index) => {
      const panel = this.panels[index];
      if (!panel) return;
      
      // Set up IDs if not present
      if (!tab.id) {
        tab.id = `tab-${index}`;
      }
      if (!panel.id) {
        panel.id = `panel-${index}`;
      }
      
      // Set up ARIA relationships
      tab.setAttribute('aria-controls', panel.id);
      panel.setAttribute('aria-labelledby', tab.id);
      
      // Set initial states
      tab.setAttribute('tabindex', index === 0 ? '0' : '-1');
      tab.setAttribute('aria-selected', 'false');
      panel.setAttribute('hidden', '');
    });
    
    console.log(`AccessibleTabs: Initialized with ${this.tabs.length} tabs`);
  }
  
  setupEventListeners() {
    // Click events
    this.tabs.forEach((tab, index) => {
      tab.addEventListener('click', (e) => {
        e.preventDefault();
        this.activateTab(index);
      });
      
      // Keyboard events
      tab.addEventListener('keydown', (e) => {
        this.handleKeyDown(e, index);
      });
    });
    
    // Hash change for routing
    if (this.options.hashRouting) {
      window.addEventListener('hashchange', () => {
        this.handleHashChange();
      });
    }
  }
  
  setupHashRouting() {
    if (!this.options.hashRouting) return;
    
    // Map hash values to tab indices
    this.hashMap = new Map();
    this.tabs.forEach((tab, index) => {
      const hash = tab.dataset.hash || tab.getAttribute('aria-controls');
      if (hash) {
        this.hashMap.set(hash, index);
      }
    });
  }
  
  handleKeyDown(event, currentIndex) {
    const { key } = event;
    let newIndex = currentIndex;
    let preventDefault = false;
    
    switch (key) {
      case 'ArrowRight':
        newIndex = this.isRTL ? this.getPreviousIndex(currentIndex) : this.getNextIndex(currentIndex);
        preventDefault = true;
        break;
        
      case 'ArrowLeft':
        newIndex = this.isRTL ? this.getNextIndex(currentIndex) : this.getPreviousIndex(currentIndex);
        preventDefault = true;
        break;
        
      case 'ArrowDown':
        if (this.options.orientation === 'vertical') {
          newIndex = this.getNextIndex(currentIndex);
          preventDefault = true;
        }
        break;
        
      case 'ArrowUp':
        if (this.options.orientation === 'vertical') {
          newIndex = this.getPreviousIndex(currentIndex);
          preventDefault = true;
        }
        break;
        
      case 'Home':
        newIndex = 0;
        preventDefault = true;
        break;
        
      case 'End':
        newIndex = this.tabs.length - 1;
        preventDefault = true;
        break;
        
      case 'Enter':
      case ' ':
        this.activateTab(currentIndex);
        preventDefault = true;
        break;
    }
    
    if (preventDefault) {
      event.preventDefault();
      
      if (newIndex !== currentIndex) {
        if (this.options.autoActivate) {
          this.activateTab(newIndex);
        } else {
          this.focusTab(newIndex);
        }
      }
    }
  }
  
  getNextIndex(currentIndex) {
    return (currentIndex + 1) % this.tabs.length;
  }
  
  getPreviousIndex(currentIndex) {
    return (currentIndex - 1 + this.tabs.length) % this.tabs.length;
  }
  
  focusTab(index) {
    if (index < 0 || index >= this.tabs.length) return;
    
    // Update tabindex
    this.tabs.forEach((tab, i) => {
      tab.setAttribute('tabindex', i === index ? '0' : '-1');
    });
    
    // Focus the tab
    this.tabs[index].focus();
  }
  
  activateTab(index, updateHash = true) {
    if (index < 0 || index >= this.tabs.length) return;
    
    const previousIndex = this.currentIndex;
    this.currentIndex = index;
    
    // Update tab states
    this.tabs.forEach((tab, i) => {
      const isActive = i === index;
      tab.setAttribute('aria-selected', isActive ? 'true' : 'false');
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      
      // Add/remove active class for styling
      tab.classList.toggle('active', isActive);
    });
    
    // Update panel states
    this.panels.forEach((panel, i) => {
      const isActive = i === index;
      if (isActive) {
        panel.removeAttribute('hidden');
        panel.classList.remove('hidden');
      } else {
        panel.setAttribute('hidden', '');
        panel.classList.add('hidden');
      }
    });
    
    // Focus management
    if (this.options.focusOnActivate) {
      this.tabs[index].focus();
    }
    
    // Update URL hash
    if (this.options.hashRouting && updateHash) {
      const tab = this.tabs[index];
      const hash = tab.dataset.hash || tab.getAttribute('aria-controls');
      if (hash) {
        // Use replaceState to avoid adding to browser history
        history.replaceState(null, '', `#${hash}`);
      }
    }
    
    // Dispatch custom event
    this.container.dispatchEvent(new CustomEvent('tabchange', {
      detail: {
        previousIndex,
        currentIndex: index,
        previousTab: this.tabs[previousIndex],
        currentTab: this.tabs[index],
        currentPanel: this.panels[index]
      }
    }));
    
    console.log(`AccessibleTabs: Activated tab ${index}`);
  }
  
  handleHashChange() {
    const hash = window.location.hash.slice(1);
    if (hash && this.hashMap.has(hash)) {
      const index = this.hashMap.get(hash);
      this.activateTab(index, false); // Don't update hash to avoid loop
    }
  }
  
  activateInitialTab() {
    let initialIndex = 0;
    
    // Check for hash in URL
    if (this.options.hashRouting) {
      const hash = window.location.hash.slice(1);
      if (hash && this.hashMap.has(hash)) {
        initialIndex = this.hashMap.get(hash);
      }
    }
    
    // Check for pre-selected tab
    const preSelectedTab = this.tabs.find(tab => 
      tab.getAttribute('aria-selected') === 'true'
    );
    if (preSelectedTab) {
      initialIndex = this.tabs.indexOf(preSelectedTab);
    }
    
    this.activateTab(initialIndex, this.options.hashRouting);
  }
  
  // Public API methods
  getActiveIndex() {
    return this.currentIndex;
  }
  
  getActiveTab() {
    return this.tabs[this.currentIndex];
  }
  
  getActivePanel() {
    return this.panels[this.currentIndex];
  }
  
  activateTabById(id) {
    const index = this.tabs.findIndex(tab => tab.id === id);
    if (index !== -1) {
      this.activateTab(index);
    }
  }
  
  activateTabByHash(hash) {
    if (this.hashMap.has(hash)) {
      const index = this.hashMap.get(hash);
      this.activateTab(index);
    }
  }
  
  destroy() {
    // Remove event listeners
    this.tabs.forEach(tab => {
      tab.removeEventListener('click', this.handleClick);
      tab.removeEventListener('keydown', this.handleKeyDown);
    });
    
    if (this.options.hashRouting) {
      window.removeEventListener('hashchange', this.handleHashChange);
    }
    
    console.log('AccessibleTabs: Destroyed');
  }
}

// Auto-initialize tabs on DOM content loaded
document.addEventListener('DOMContentLoaded', () => {
  // Find all tab containers
  const tabContainers = document.querySelectorAll('[data-tabs]');
  
  tabContainers.forEach(container => {
    // Get options from data attributes
    const options = {
      autoActivate: container.dataset.autoActivate !== 'false',
      orientation: container.dataset.orientation || 'horizontal',
      hashRouting: container.dataset.hashRouting !== 'false',
      focusOnActivate: container.dataset.focusOnActivate !== 'false'
    };
    
    // Initialize tabs
    new AccessibleTabs(container, options);
  });
});

// Export for module usage
if (typeof module !== 'undefined' && module.exports) {
  module.exports = AccessibleTabs;
}

// Global namespace
window.AccessibleTabs = AccessibleTabs;