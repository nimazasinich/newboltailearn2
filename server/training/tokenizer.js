/**
 * Persian Text Tokenizer
 * Handles Persian text tokenization for BERT models
 */
export class PersianTokenizer {
    constructor(maxLength = 512) {
        // Special tokens
        this.CLS_TOKEN = '[CLS]';
        this.SEP_TOKEN = '[SEP]';
        this.PAD_TOKEN = '[PAD]';
        this.UNK_TOKEN = '[UNK]';
        this.MASK_TOKEN = '[MASK]';
        this.maxLength = maxLength;
        this.vocab = new Map();
        this.reverseVocab = new Map();
        this.initializeVocab();
    }
    /**
     * Initialize vocabulary with Persian characters and common tokens
     */
    initializeVocab() {
        // Special tokens
        this.addToken(this.PAD_TOKEN, 0);
        this.addToken(this.UNK_TOKEN, 1);
        this.addToken(this.CLS_TOKEN, 2);
        this.addToken(this.SEP_TOKEN, 3);
        this.addToken(this.MASK_TOKEN, 4);
        // Persian alphabet
        const persianChars = 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی';
        let tokenId = 5;
        // Add Persian characters
        for (const char of persianChars) {
            this.addToken(char, tokenId++);
        }
        // Add Arabic numerals
        for (let i = 0; i <= 9; i++) {
            this.addToken(i.toString(), tokenId++);
        }
        // Add Persian numerals
        const persianNumerals = '۰۱۲۳۴۵۶۷۸۹';
        for (const num of persianNumerals) {
            this.addToken(num, tokenId++);
        }
        // Common Persian words (simplified vocabulary)
        const commonWords = [
            'و', 'در', 'به', 'از', 'که', 'این', 'با', 'را', 'برای', 'است',
            'یک', 'آن', 'هم', 'می', 'یا', 'اما', 'اگر', 'بر', 'تا', 'هر',
            'قانون', 'ماده', 'حکم', 'دادگاه', 'قاضی', 'وکیل', 'حق', 'جرم',
            'مجازات', 'دعوی', 'خواهان', 'خوانده', 'رای', 'قرار', 'اجرا'
        ];
        for (const word of commonWords) {
            this.addToken(word, tokenId++);
        }
        // Add space and punctuation
        this.addToken(' ', tokenId++);
        this.addToken('.', tokenId++);
        this.addToken('،', tokenId++);
        this.addToken('؟', tokenId++);
        this.addToken('!', tokenId++);
        this.addToken('؛', tokenId++);
        this.addToken(':', tokenId++);
        this.addToken('(', tokenId++);
        this.addToken(')', tokenId++);
        this.addToken('«', tokenId++);
        this.addToken('»', tokenId++);
    }
    addToken(token, id) {
        this.vocab.set(token, id);
        this.reverseVocab.set(id, token);
    }
    /**
     * Tokenize Persian text
     */
    tokenize(text) {
        // Normalize Persian text
        text = this.normalizeText(text);
        // Simple word-based tokenization
        const words = text.split(/\s+/);
        const tokens = [this.CLS_TOKEN];
        for (const word of words) {
            if (this.vocab.has(word)) {
                tokens.push(word);
            }
            else {
                // Character-level tokenization for unknown words
                for (const char of word) {
                    if (this.vocab.has(char)) {
                        tokens.push(char);
                    }
                    else {
                        tokens.push(this.UNK_TOKEN);
                    }
                }
            }
        }
        tokens.push(this.SEP_TOKEN);
        // Truncate if necessary
        if (tokens.length > this.maxLength) {
            tokens.length = this.maxLength - 1;
            tokens.push(this.SEP_TOKEN);
        }
        return tokens;
    }
    /**
     * Convert tokens to IDs
     */
    encode(text) {
        const tokens = this.tokenize(text);
        const ids = tokens.map(token => this.vocab.get(token) || this.vocab.get(this.UNK_TOKEN));
        // Pad to max length
        while (ids.length < this.maxLength) {
            ids.push(this.vocab.get(this.PAD_TOKEN));
        }
        return ids.slice(0, this.maxLength);
    }
    /**
     * Convert IDs back to tokens
     */
    decode(ids) {
        const tokens = ids
            .map(id => this.reverseVocab.get(id) || this.UNK_TOKEN)
            .filter(token => token !== this.PAD_TOKEN && token !== this.CLS_TOKEN && token !== this.SEP_TOKEN);
        return tokens.join(' ');
    }
    /**
     * Create attention mask
     */
    getAttentionMask(ids) {
        return ids.map(id => id === this.vocab.get(this.PAD_TOKEN) ? 0 : 1);
    }
    /**
     * Normalize Persian text
     */
    normalizeText(text) {
        // Normalize Persian characters
        text = text
            .replace(/ك/g, 'ک') // Arabic kaf to Persian kaf
            .replace(/ي/g, 'ی') // Arabic yeh to Persian yeh
            .replace(/ى/g, 'ی') // Alef maksura to Persian yeh
            .replace(/ۀ/g, 'ه') // Heh with yeh to heh
            .replace(/ؤ/g, 'و') // Waw with hamza to waw
            .replace(/إ/g, 'ا') // Alef with hamza below to alef
            .replace(/أ/g, 'ا') // Alef with hamza above to alef
            .replace(/آ/g, 'ا') // Alef with madda to alef (simplified)
            .replace(/ء/g, '') // Remove standalone hamza
            .replace(/\u200c/g, ' ') // Replace ZWNJ with space
            .trim();
        return text.toLowerCase();
    }
    /**
     * Get vocabulary size
     */
    getVocabSize() {
        return this.vocab.size;
    }
}
// Export singleton instance
export const persianTokenizer = new PersianTokenizer();
