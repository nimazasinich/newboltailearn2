// Persian Language Processing Utilities

export class PersianUtils {
  // Persian numbers mapping
  private static readonly persianNumbers = {
    '۰': '0', '۱': '1', '۲': '2', '۳': '3', '۴': '4',
    '۵': '5', '۶': '6', '۷': '7', '۸': '8', '۹': '9'
  };

  private static readonly arabicNumbers = {
    '٠': '0', '١': '1', '٢': '2', '٣': '3', '٤': '4',
    '٥': '5', '٦': '6', '٧': '7', '٨': '8', '٩': '9'
  };

  // Persian months
  private static readonly persianMonths = [
    'فروردین', 'اردیبهشت', 'خرداد', 'تیر', 'مرداد', 'شهریور',
    'مهر', 'آبان', 'آذر', 'دی', 'بهمن', 'اسفند'
  ];

  // Common Persian legal terms with their English equivalents
  private static readonly legalTermTranslations = new Map([
    ['قرارداد', 'Contract'],
    ['متعهد', 'Obligated'],
    ['تعهد', 'Obligation'],
    ['طرف', 'Party'],
    ['شرط', 'Condition'],
    ['بند', 'Clause'],
    ['ماده', 'Article'],
    ['دادگاه', 'Court'],
    ['قاضی', 'Judge'],
    ['حکم', 'Judgment'],
    ['رای', 'Verdict'],
    ['قانون', 'Law'],
    ['مقررات', 'Regulations'],
    ['آیین‌نامه', 'Bylaw'],
    ['مجازات', 'Punishment'],
    ['جرم', 'Crime'],
    ['حق', 'Right'],
    ['وظیفه', 'Duty'],
    ['مالکیت', 'Ownership'],
    ['املاک', 'Real Estate']
  ]);

  /**
   * Normalize Persian text by converting Arabic characters to Persian
   */
  static normalizeText(text: string): string {
    return text
      // Convert Arabic Ya and Kaf to Persian
      .replace(/ي/g, 'ی')
      .replace(/ك/g, 'ک')
      // Convert Arabic numbers to Persian
      .replace(/[٠-٩]/g, (match) => 
        this.arabicNumbers[match as keyof typeof this.arabicNumbers] || match
      )
      .replace(/[0-9]/g, (match) => {
        const persianNum = Object.keys(this.persianNumbers).find(
          key => this.persianNumbers[key as keyof typeof this.persianNumbers] === match
        );
        return persianNum || match;
      })
      // Normalize whitespace
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Convert Persian numbers to English
   */
  static persianToEnglishNumbers(text: string): string {
    return text.replace(/[۰-۹]/g, (match) => 
      this.persianNumbers[match as keyof typeof this.persianNumbers] || match
    ).replace(/[٠-٩]/g, (match) => 
      this.arabicNumbers[match as keyof typeof this.arabicNumbers] || match
    );
  }

  /**
   * Convert English numbers to Persian
   */
  static englishToPersianNumbers(text: string): string {
    return text.replace(/[0-9]/g, (match) => {
      const persianNum = Object.keys(this.persianNumbers).find(
        key => this.persianNumbers[key as keyof typeof this.persianNumbers] === match
      );
      return persianNum || match;
    });
  }

  /**
   * Format Persian date
   */
  static formatPersianDate(date: Date, includeTime: boolean = false): string {
    // Simple Persian calendar conversion (for demonstration)
    // In production, use a proper Persian calendar library
    const persianYear = date.getFullYear() - 621;
    const month = date.getMonth();
    const day = date.getDate();
    
    const persianMonth = this.persianMonths[month % 12];
    const persianDay = this.englishToPersianNumbers(day.toString());
    const persianYearStr = this.englishToPersianNumbers(persianYear.toString());

    let result = `${persianDay} ${persianMonth} ${persianYearStr}`;
    
    if (includeTime) {
      const hours = this.englishToPersianNumbers(date.getHours().toString().padStart(2, '0'));
      const minutes = this.englishToPersianNumbers(date.getMinutes().toString().padStart(2, '0'));
      result += ` ساعت ${hours}:${minutes}`;
    }

    return result;
  }

  /**
   * Format duration in Persian
   */
  static formatPersianDuration(milliseconds: number): string {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) {
      return `${this.englishToPersianNumbers(days.toString())} روز`;
    } else if (hours > 0) {
      return `${this.englishToPersianNumbers(hours.toString())} ساعت`;
    } else if (minutes > 0) {
      return `${this.englishToPersianNumbers(minutes.toString())} دقیقه`;
    } else {
      return `${this.englishToPersianNumbers(seconds.toString())} ثانیه`;
    }
  }

  /**
   * Format Persian file size
   */
  static formatPersianFileSize(bytes: number): string {
    const units = ['بایت', 'کیلوبایت', 'مگابایت', 'گیگابایت', 'ترابایت'];
    let size = bytes;
    let unitIndex = 0;

    while (size >= 1024 && unitIndex < units.length - 1) {
      size /= 1024;
      unitIndex++;
    }

    const formattedSize = unitIndex === 0 
      ? size.toString() 
      : size.toFixed(1);

    return `${this.englishToPersianNumbers(formattedSize)} ${units[unitIndex]}`;
  }

  /**
   * Format Persian percentage
   */
  static formatPersianPercentage(value: number, decimals: number = 1): string {
    const formatted = value.toFixed(decimals);
    return `${this.englishToPersianNumbers(formatted)}٪`;
  }

  /**
   * Check if text is right-to-left
   */
  static isRTL(text: string): boolean {
    const rtlChars = /[\u0590-\u083F]|[\u08A0-\u08FF]|[\uFB1D-\uFDFF]|[\uFE70-\uFEFF]/;
    return rtlChars.test(text);
  }

  /**
   * Extract Persian words from text
   */
  static extractPersianWords(text: string): string[] {
    const persianWordRegex = /[\u0600-\u06FF\uFB8A\u067E\u0686\u06AF]+/g;
    const matches = text.match(persianWordRegex);
    return matches ? [...new Set(matches)] : [];
  }

  /**
   * Validate Persian national ID (کد ملی)
   */
  static validateNationalId(nationalId: string): boolean {
    const id = this.persianToEnglishNumbers(nationalId).replace(/\D/g, '');
    
    if (id.length !== 10) return false;
    if (/^(\d)\1{9}$/.test(id)) return false; // All same digits
    
    const checksum = parseInt(id[9]);
    let sum = 0;
    
    for (let i = 0; i < 9; i++) {
      sum += parseInt(id[i]) * (10 - i);
    }
    
    const remainder = sum % 11;
    return (remainder < 2 && checksum === remainder) || 
           (remainder >= 2 && checksum === 11 - remainder);
  }

  /**
   * Clean and prepare Persian text for search
   */
  static prepareForSearch(text: string): string {
    return this.normalizeText(text)
      .toLowerCase()
      .replace(/[^\u0600-\u06FF\uFB8A\u067E\u0686\u06AF\s]/g, ' ')
      .replace(/\s+/g, ' ')
      .trim();
  }

  /**
   * Highlight Persian text with search terms
   */
  static highlightSearchTerms(text: string, searchTerms: string[], className: string = 'highlight'): string {
    let highlightedText = text;
    
    searchTerms.forEach(term => {
      const normalizedTerm = this.prepareForSearch(term);
      if (normalizedTerm.length > 0) {
        const regex = new RegExp(`(${normalizedTerm})`, 'gi');
        highlightedText = highlightedText.replace(regex, `<span class="${className}">$1</span>`);
      }
    });
    
    return highlightedText;
  }

  /**
   * Generate Persian text summary
   */
  static generateSummary(text: string, maxLength: number = 200): string {
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0) return '';
    
    let summary = '';
    let currentLength = 0;
    
    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (currentLength + trimmedSentence.length > maxLength) {
        break;
      }
      summary += (summary ? ' ' : '') + trimmedSentence + '.';
      currentLength += trimmedSentence.length;
    }
    
    if (currentLength >= maxLength && sentences.length > 1) {
      summary += '...';
    }
    
    return summary;
  }

  /**
   * Translate common legal terms
   */
  static translateLegalTerm(persianTerm: string): string | undefined {
    return this.legalTermTranslations.get(persianTerm);
  }

  /**
   * Get all legal term translations
   */
  static getAllLegalTerms(): Map<string, string> {
    return new Map(this.legalTermTranslations);
  }

  /**
   * Sort Persian strings properly
   */
  static sortPersianStrings(strings: string[]): string[] {
    const persianCollator = new Intl.Collator('fa', {
      numeric: true,
      sensitivity: 'base'
    });
    
    return strings.sort(persianCollator.compare);
  }

  /**
   * Calculate Persian text complexity score
   */
  static calculateComplexityScore(text: string): number {
    const words = this.extractPersianWords(text);
    const sentences = text.split(/[.!?]/).filter(s => s.trim().length > 0);
    
    if (sentences.length === 0 || words.length === 0) return 0;
    
    const avgWordsPerSentence = words.length / sentences.length;
    const avgWordLength = words.reduce((sum, word) => sum + word.length, 0) / words.length;
    const legalTermCount = words.filter(word => this.legalTermTranslations.has(word)).length;
    const legalTermRatio = legalTermCount / words.length;
    
    // Complexity score calculation (0-100)
    const score = (avgWordsPerSentence * 2) + 
                  (avgWordLength * 3) + 
                  (legalTermRatio * 40);
    
    return Math.min(100, Math.max(0, score));
  }

  /**
   * Validate Persian text input
   */
  static validatePersianText(text: string): {
    isValid: boolean;
    errors: string[];
    suggestions: string[];
  } {
    const errors: string[] = [];
    const suggestions: string[] = [];
    
    // Check for mixed Arabic/Persian characters
    const hasArabicYa = text.includes('ي');
    const hasArabicKaf = text.includes('ك');
    const hasArabicNumbers = /[٠-٩]/.test(text);
    
    if (hasArabicYa || hasArabicKaf || hasArabicNumbers) {
      errors.push('متن شامل حروف عربی است');
      suggestions.push('حروف عربی را به فارسی تبدیل کنید');
    }
    
    // Check for English numbers in Persian context
    const hasMixedNumbers = /[0-9]/.test(text) && /[\u0600-\u06FF]/.test(text);
    if (hasMixedNumbers) {
      suggestions.push('اعداد انگلیسی را به فارسی تبدیل کنید');
    }
    
    // Check text direction
    const hasRTLChars = this.isRTL(text);
    const hasLTRChars = /[a-zA-Z]/.test(text);
    
    if (hasRTLChars && hasLTRChars) {
      suggestions.push('جهت نوشتار متن مختلط است');
    }
    
    return {
      isValid: errors.length === 0,
      errors,
      suggestions
    };
  }
}

// Export utility functions for easy import
export const {
  normalizeText,
  persianToEnglishNumbers,
  englishToPersianNumbers,
  formatPersianDate,
  formatPersianDuration,
  formatPersianFileSize,
  formatPersianPercentage,
  isRTL,
  extractPersianWords,
  validateNationalId,
  prepareForSearch,
  highlightSearchTerms,
  generateSummary,
  translateLegalTerm,
  sortPersianStrings,
  calculateComplexityScore,
  validatePersianText
} = PersianUtils;