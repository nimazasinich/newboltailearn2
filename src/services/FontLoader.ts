/**
 * Font Loading Service with Error Handling
 * Handles font loading failures and provides fallbacks
 */

export interface FontLoadResult {
  success: boolean;
  fontFamily: string;
  error?: string;
  fallbackUsed: boolean;
}

export class FontLoader {
  private static instance: FontLoader;
  private loadedFonts = new Set<string>();
  private failedFonts = new Set<string>();
  private fallbackFonts = [
    'Segoe UI',
    'Tahoma',
    'Arial',
    'system-ui',
    'sans-serif'
  ];

  private constructor() {
    this.setupFontLoadingDetection();
  }

  public static getInstance(): FontLoader {
    if (!FontLoader.instance) {
      FontLoader.instance = new FontLoader();
    }
    return FontLoader.instance;
  }

  /**
   * Setup font loading detection
   */
  private setupFontLoadingDetection(): void {
    if (typeof window === 'undefined') return;

    // Check if FontFace API is available
    if ('FontFace' in window) {
      this.detectFontLoading();
    } else {
      // Fallback for older browsers
      this.detectFontLoadingFallback();
    }
  }

  /**
   * Detect font loading using FontFace API
   */
  private async detectFontLoading(): Promise<void> {
    try {
      const fontFace = new FontFace(
        'Vazirmatn',
        'url(/newboltailearn2/fonts/vazirmatn/Vazirmatn-Variable.woff2) format("woff2")'
      );

      await fontFace.load();
      document.fonts.add(fontFace);
      this.loadedFonts.add('Vazirmatn');
      this.updateFontClass('font-loaded');
      console.log('✅ Vazirmatn font loaded successfully');
    } catch (error) {
      console.warn('⚠️ Vazirmatn font loading failed, using fallback:', error);
      this.failedFonts.add('Vazirmatn');
      this.updateFontClass('font-loading');
    }
  }

  /**
   * Fallback font loading detection for older browsers
   */
  private detectFontLoadingFallback(): void {
    // Use a timeout to detect if font loading failed
    setTimeout(() => {
      if (this.isFontLoaded('Vazirmatn')) {
        this.loadedFonts.add('Vazirmatn');
        this.updateFontClass('font-loaded');
        console.log('✅ Vazirmatn font detected as loaded');
      } else {
        this.failedFonts.add('Vazirmatn');
        this.updateFontClass('font-loading');
        console.warn('⚠️ Vazirmatn font not detected, using fallback');
      }
    }, 3000);
  }

  /**
   * Check if a font is loaded
   */
  private isFontLoaded(fontFamily: string): boolean {
    if (typeof window === 'undefined') return false;

    // Create a test element
    const testElement = document.createElement('span');
    testElement.style.fontFamily = fontFamily;
    testElement.style.fontSize = '72px';
    testElement.style.position = 'absolute';
    testElement.style.left = '-9999px';
    testElement.style.visibility = 'hidden';
    testElement.textContent = 'Test';

    document.body.appendChild(testElement);

    // Get computed style
    const computedStyle = window.getComputedStyle(testElement);
    const fontFamilyComputed = computedStyle.fontFamily;

    document.body.removeChild(testElement);

    // Check if the font family includes our target font
    return fontFamilyComputed.includes(fontFamily);
  }

  /**
   * Update font class on document
   */
  private updateFontClass(className: string): void {
    if (typeof document === 'undefined') return;

    document.documentElement.classList.remove('font-loading', 'font-loaded');
    document.documentElement.classList.add(className);
  }

  /**
   * Load font with error handling
   */
  async loadFont(fontFamily: string, fontUrl: string): Promise<FontLoadResult> {
    try {
      if (this.loadedFonts.has(fontFamily)) {
        return {
          success: true,
          fontFamily,
          fallbackUsed: false
        };
      }

      if (this.failedFonts.has(fontFamily)) {
        return {
          success: false,
          fontFamily,
          error: 'Font previously failed to load',
          fallbackUsed: true
        };
      }

      // Try to load the font
      const fontFace = new FontFace(fontFamily, `url(${fontUrl})`);
      await fontFace.load();
      document.fonts.add(fontFace);
      
      this.loadedFonts.add(fontFamily);
      return {
        success: true,
        fontFamily,
        fallbackUsed: false
      };
    } catch (error) {
      this.failedFonts.add(fontFamily);
      return {
        success: false,
        fontFamily,
        error: error instanceof Error ? error.message : 'Unknown error',
        fallbackUsed: true
      };
    }
  }

  /**
   * Get current font status
   */
  getFontStatus(fontFamily: string): 'loaded' | 'failed' | 'unknown' {
    if (this.loadedFonts.has(fontFamily)) return 'loaded';
    if (this.failedFonts.has(fontFamily)) return 'failed';
    return 'unknown';
  }

  /**
   * Get fallback font stack
   */
  getFallbackFontStack(): string {
    return this.fallbackFonts.join(', ');
  }

  /**
   * Get current effective font family
   */
  getEffectiveFontFamily(): string {
    if (this.loadedFonts.has('Vazirmatn')) {
      return 'Vazirmatn, ' + this.getFallbackFontStack();
    }
    return this.getFallbackFontStack();
  }

  /**
   * Preload critical fonts
   */
  async preloadCriticalFonts(): Promise<void> {
    const criticalFonts = [
      {
        family: 'Vazirmatn',
        url: '/newboltailearn2/fonts/vazirmatn/Vazirmatn-Variable.woff2'
      }
    ];

    for (const font of criticalFonts) {
      try {
        await this.loadFont(font.family, font.url);
      } catch (error) {
        console.warn(`Failed to preload font ${font.family}:`, error);
      }
    }
  }

  /**
   * Handle font loading errors
   */
  handleFontError(error: Error, fontFamily: string): void {
    console.error(`Font loading error for ${fontFamily}:`, error);
    this.failedFonts.add(fontFamily);
    this.updateFontClass('font-loading');
  }
}

// Export singleton instance
export const fontLoader = FontLoader.getInstance();

// Auto-initialize when in browser environment
if (typeof window !== 'undefined') {
  fontLoader.preloadCriticalFonts().catch((error) => {
    console.warn('Failed to preload critical fonts:', error);
  });
}

export default fontLoader;