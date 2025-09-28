import { z } from 'zod';
const DatasetQuerySchema = z.object({
    q: z.string().min(1).max(64).default('persian'),
    limit: z.number().min(1).max(50).default(12),
});
export async function searchDatasets(query, limit = 12) {
    const validated = DatasetQuerySchema.parse({ q: query, limit });
    const url = `https://huggingface.co/api/datasets?search=${encodeURIComponent(validated.q)}&limit=${validated.limit}`;
    let lastError;
    for (let attempt = 1; attempt <= 3; attempt++) {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), 10000);
        try {
            const response = await fetch(url, {
                headers: { 'Accept': 'application/json' },
                signal: controller.signal,
            });
            clearTimeout(timeoutId);
            if (!response.ok) {
                throw new Error(`HuggingFace API error: ${response.status}`);
            }
            const data = await response.json();
            return { items: data, query: validated.q, timestamp: Date.now() };
        }
        catch (error) {
            clearTimeout(timeoutId);
            lastError = error;
            if (attempt < 3) {
                await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
            }
        }
    }
    throw lastError;
}
//# sourceMappingURL=huggingface.js.map