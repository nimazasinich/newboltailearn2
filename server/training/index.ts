import Database from "better-sqlite3";
import path from "path";
import fs from "fs";
import { RealTrainingEngine, LabeledSample } from "./RealTrainingEngine";

type DB = Database.Database;

function tableExists(db: DB, name: string): boolean {
  const row = db.prepare(
    `SELECT name FROM sqlite_master WHERE type='table' AND name=?`
  ).get(name);
  return !!row;
}

function loadDatasetFromDb(db: DB, datasetId: string): LabeledSample[] {
  // حالت 1: جدول dataset_items(text,label)
  if (tableExists(db, "dataset_items")) {
    const rows = db.prepare(
      `SELECT text, label FROM dataset_items WHERE dataset_id = ?`
    ).all(datasetId);
    if (rows?.length) {
      return rows.map((r: any) => ({ text: String(r.text), label: Number(r.label) }));
    }
  }

  // حالت 2: جدول datasets با مسیر فایل JSON/JSONL
  if (tableExists(db, "datasets")) {
    const ds = db.prepare(`SELECT * FROM datasets WHERE id = ?`).get(datasetId) as any;
    if (ds?.file_path && fs.existsSync(ds.file_path)) {
      // JSON Lines: {"text":"...","label":0}
      const lines = fs.readFileSync(ds.file_path, "utf8").split(/\r?\n/).filter(Boolean);
      const samples: LabeledSample[] = [];
      for (const ln of lines) {
        try {
          const obj = JSON.parse(ln);
          if (obj.text != null && obj.label != null) {
            samples.push({ text: String(obj.text), label: Number(obj.label) });
          }
        } catch { /* skip */ }
      }
      if (samples.length) return samples;
    }
  }

  // اگر چیزی پیدا نشد
  if (process.env.USE_FAKE_DATA === "true") {
    // داده‌ی فیک کنترل‌شده (صرفاً در حالت Demo/Fake)
    const templates = [
      { t: "این قرارداد بین طرفین منعقد شده است طبق قانون مدنی", l: 0 },
      { t: "دادگاه کیفری حکم مجازات برای سرقت صادر کرد", l: 1 },
      { t: "دادگاه خانواده حکم طلاق و حضانت صادر نمود", l: 2 },
    ];
    const arr: LabeledSample[] = [];
    for (let i = 0; i < 300; i++) {
      const k = i % 3;
      arr.push({ text: templates[k].t, label: templates[k].l });
    }
    return arr;
  }

  throw new Error("Dataset not found in DB and USE_FAKE_DATA is not enabled");
}

/** فکتوری: موتور واقعی + یکپارچگی با DB و ثبت پیشرفت/چک‌پوینت/لاگ */
export function getRealTrainingEngine(db: DB) {
  const engine = new RealTrainingEngine();

  return {
    /** آموزش یک مدل با دیتاست */
    async train(
      modelId: number,
      datasetId: string,
      config: {
        epochs?: number;
        batch_size?: number;
        learning_rate?: number;
        validation_split?: number;
      },
      progressCallback: (p: any) => void
    ) {
      // واکشی مدل
      const model = db.prepare(`SELECT * FROM models WHERE id = ?`).get(modelId) as any;
      if (!model) throw new Error("Model not found");

      const samples = loadDatasetFromDb(db, datasetId);
      const numClasses = Math.max(...samples.map(s => s.label)) + 1;

      // مسیر چک‌پوینت و ثبت DB
      const ckptDir = path.join(process.cwd(), "checkpoints", `model_${modelId}`);
      if (!fs.existsSync(ckptDir)) fs.mkdirSync(ckptDir, { recursive: true });

      let lastLoss = Number.POSITIVE_INFINITY;

      await engine.trainOnSamples(samples, {
        numClasses,
        epochs: Math.max(1, config.epochs ?? 3),
        batchSize: Math.max(1, config.batch_size ?? 8),
        learningRate: Math.max(1e-6, config.learning_rate ?? 1e-3),
        validationSplit: config.validation_split ?? 0.2,
        checkpointDir: ckptDir,
        saveEveryNEpochs: 5,
        onProgress: (pg) => {
          const loss = pg.loss ?? 0;
          const acc  = pg.accuracy ?? 0;

          // آپدیت مدل
          db.prepare(`
            UPDATE models
            SET status='training', current_epoch=?, loss=?, accuracy=?, updated_at=CURRENT_TIMESTAMP
            WHERE id=?
          `).run(pg.epoch, loss, acc, modelId);

          // ثبت لاگ
          db.prepare(`
            INSERT INTO training_logs(model_id, level, message, epoch, loss, accuracy, timestamp)
            VALUES (?, 'info', ?, ?, ?, ?, CURRENT_TIMESTAMP)
          `).run(modelId, `Epoch ${pg.epoch} completed`, pg.epoch, loss, acc);

          // کال‌بک بیرونی
          progressCallback({
            modelId,
            epoch: pg.epoch,
            loss,
            accuracy: acc,
            val_loss: pg.val_loss,
            val_accuracy: pg.val_accuracy,
          });

          lastLoss = loss;
        },
        onComplete: () => {
          db.prepare(`UPDATE models SET status='completed', updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(modelId);
          db.prepare(`
            INSERT INTO training_logs(model_id, level, message, epoch, timestamp)
            VALUES (?, 'info', 'Training completed successfully', (SELECT current_epoch FROM models WHERE id=?), CURRENT_TIMESTAMP)
          `).run(modelId, modelId);

          progressCallback({ modelId, type: "complete" });
        },
        onError: (err) => {
          db.prepare(`UPDATE models SET status='failed', updated_at=CURRENT_TIMESTAMP WHERE id=?`).run(modelId);
          db.prepare(`
            INSERT INTO training_logs(model_id, level, message, epoch, timestamp)
            VALUES (?, 'error', ?, 0, CURRENT_TIMESTAMP)
          `).run(modelId, `Training failed: ${err}`);
          progressCallback({ modelId, type: "error", error: err });
        },
      });
    },

    /** توقف آموزش جاری (ایمن) */
    stop() {
      engine.stopTraining();
    },

    /** آزادسازی منابع */
    dispose() {
      engine.dispose();
    },
  };
}

export default getRealTrainingEngine;