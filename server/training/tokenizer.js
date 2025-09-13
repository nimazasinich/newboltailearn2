import fs from "fs";
import path from "path";
/** توکنایزر ساده و واقعی فارسی با نرمال‌سازی و واژگان قابل رشد (Persist به دیسک) */
export class PersianTokenizer {
    constructor(opts) {
        this.vocab = new Map();
        this.invVocab = [];
        this.maxLen = opts?.maxLen ?? 128;
        this.vocabFile = opts?.vocabFile ?? path.join(process.cwd(), "checkpoints", "tokenizer_vocab.json");
        this.allowGrowth = opts?.allowGrowth ?? true;
        // حداقل واژگان ویژه
        this.ensureToken("<pad>");
        this.ensureToken("<unk>");
        // بارگذاری واژگان ذخیره‌شده (در صورت وجود)
        try {
            if (fs.existsSync(this.vocabFile)) {
                const json = JSON.parse(fs.readFileSync(this.vocabFile, "utf8"));
                this.vocab.clear();
                this.invVocab = [];
                for (const tok of json)
                    this.ensureToken(tok);
            }
            else {
                // اگر فایل واژگان وجود ندارد، واژگان پایه را اضافه کن
                this.initializeBaseVocabulary();
            }
        }
        catch (e) {
            // ادامه با واژگان حداقلی
            this.initializeBaseVocabulary();
        }
    }
    initializeBaseVocabulary() {
        // حروف فارسی
        const persianChars = 'ابپتثجچحخدذرزژسشصضطظعغفقکگلمنوهی';
        for (const char of persianChars) {
            this.ensureToken(char);
        }
        // اعداد
        for (let i = 0; i < 10; i++) {
            this.ensureToken(i.toString());
        }
        // کلمات رایج فارسی
        const commonWords = [
            'و', 'در', 'به', 'از', 'که', 'این', 'با', 'را', 'برای', 'است',
            'یک', 'آن', 'هم', 'می', 'یا', 'اما', 'اگر', 'بر', 'تا', 'هر',
            'قانون', 'ماده', 'حکم', 'دادگاه', 'قاضی', 'وکیل', 'حق', 'جرم',
            'مجازات', 'دعوی', 'خواهان', 'خوانده', 'رای', 'قرار', 'اجرا',
            'قرارداد', 'طرفین', 'منعقد', 'شده', 'طبق', 'مدنی', 'کیفری',
            'سرقت', 'صادر', 'کرد', 'خانواده', 'طلاق', 'حضانت', 'نمود'
        ];
        for (const word of commonWords) {
            this.ensureToken(word);
        }
    }
    normalize(text) {
        return text
            .replace(/\u064A/g, "\u06CC") // ي → ی
            .replace(/\u0643/g, "\u06A9") // ك → ک
            .replace(/[\u064B-\u065F]/g, "") // اعراب
            .replace(/[^\p{L}\p{N}\s]/gu, " ") // حذف علائم
            .replace(/\s+/g, " ")
            .trim();
    }
    ensureToken(tok) {
        if (!this.vocab.has(tok)) {
            const id = this.invVocab.length;
            this.vocab.set(tok, id);
            this.invVocab.push(tok);
        }
        return this.vocab.get(tok);
    }
    /** برش/پدینگ به maxLen و نگاشت به آیدی‌ها */
    encode(text) {
        const norm = this.normalize(text);
        const tokens = norm.length ? norm.split(" ") : [];
        const ids = [];
        for (const t of tokens) {
            if (this.vocab.has(t)) {
                ids.push(this.vocab.get(t));
            }
            else if (this.allowGrowth) {
                ids.push(this.ensureToken(t));
            }
            else {
                ids.push(this.vocab.get("<unk>"));
            }
            if (ids.length >= this.maxLen)
                break;
        }
        while (ids.length < this.maxLen)
            ids.push(this.vocab.get("<pad>"));
        // Ensure all IDs are within valid range
        const vocabSize = this.getVocabSize();
        return ids.map(id => Math.min(id, vocabSize - 1));
    }
    getVocabSize() {
        return this.invVocab.length;
    }
    save() {
        const dir = path.dirname(this.vocabFile);
        if (!fs.existsSync(dir))
            fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(this.vocabFile, JSON.stringify(this.invVocab, null, 0), "utf8");
    }
}
