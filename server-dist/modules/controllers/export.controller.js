import archiver from 'archiver';
import { isDemoMode } from '../security/config';
export class ExportController {
    db;
    io;
    activeExports = new Map();
    constructor(db, io) {
        this.db = db;
        this.io = io;
    }
    async exportProject(req, res) {
        try {
            if (isDemoMode()) {
                res.status(403).json({ error: 'Project export is disabled in demo mode' });
                return;
            }
            const { format = 'zip', includeModels = true, includeData = true, includeLogs = true, includeConfig = true } = req.body;
            const exportId = `export_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
            // Initialize export status
            this.activeExports.set(exportId, { status: 'processing', progress: 0 });
            // Start export process in background
            this.processProjectExport(exportId, {
                format,
                includeModels,
                includeData,
                includeLogs,
                includeConfig
            }).catch(error => {
                console.error('Export process failed:', error);
                this.activeExports.set(exportId, {
                    status: 'failed',
                    progress: 0,
                    message: error.message
                });
            });
            res.json({
                success: true,
                exportId,
                status: 'processing',
                message: 'Export process started'
            });
        }
        catch (error) {
            console.error('Export project error:', error);
            res.status(500).json({ error: 'Failed to start export' });
        }
    }
    async exportModel(req, res) {
        try {
            const { id } = req.params;
            const { format = 'tensorflow' } = req.body;
            // Get model details
            const model = this.db.prepare('SELECT * FROM models WHERE id = ?').get(id);
            if (!model) {
                res.status(404).json({ error: 'Model not found' });
                return;
            }
            const exportId = `model_export_${id}_${Date.now()}`;
            res.json({
                success: true,
                message: 'Model export initiated',
                exportId,
                format,
                status: 'processing'
            });
        }
        catch (error) {
            console.error('Export model error:', error);
            res.status(500).json({ error: 'Failed to export model' });
        }
    }
    async getExportStatus(req, res) {
        try {
            const { exportId } = req.params;
            const exportStatus = this.activeExports.get(exportId);
            if (!exportStatus) {
                res.status(404).json({ error: 'Export not found' });
                return;
            }
            res.json({
                success: true,
                exportId,
                ...exportStatus
            });
        }
        catch (error) {
            console.error('Get export status error:', error);
            res.status(500).json({ error: 'Failed to get export status' });
        }
    }
    async downloadExport(req, res) {
        try {
            const { exportId } = req.params;
            const exportStatus = this.activeExports.get(exportId);
            if (!exportStatus || exportStatus.status !== 'completed') {
                res.status(404).json({ error: 'Export not ready for download' });
                return;
            }
            // In a real implementation, you would serve the actual file
            // For now, return a placeholder response
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', `attachment; filename="export_${exportId}.zip"`);
            // Create a simple ZIP with project info
            const archive = archiver('zip');
            archive.pipe(res);
            archive.append('Persian Legal AI Project Export', { name: 'README.txt' });
            archive.append(JSON.stringify({
                exportId,
                timestamp: new Date().toISOString(),
                version: '1.0.0'
            }, null, 2), { name: 'export-info.json' });
            await archive.finalize();
        }
        catch (error) {
            console.error('Download export error:', error);
            res.status(500).json({ error: 'Failed to download export' });
        }
    }
    async getProjectStructure(req, res) {
        try {
            const structure = {
                name: 'persian-legal-ai',
                version: '1.0.0',
                description: 'Persian Legal AI Training System',
                files: {
                    'package.json': JSON.stringify({
                        name: 'persian-legal-ai',
                        version: '1.0.0',
                        description: 'Persian Legal AI Training System',
                        scripts: {
                            dev: 'concurrently "npm run server" "npm run client"',
                            build: 'vite build',
                            start: 'node server.js'
                        }
                    }, null, 2),
                    'README.md': '# Persian Legal AI\n\nA comprehensive AI training system for Persian legal documents.',
                    'server.js': '// Express server implementation\nconsole.log("Persian Legal AI Server");'
                },
                dependencies: {
                    'react': '^18.3.1',
                    'typescript': '^5.5.3',
                    'express': '^4.19.2',
                    'better-sqlite3': '^12.2.0'
                },
                scripts: {
                    'dev': 'concurrently "npm run server" "npm run client"',
                    'build': 'vite build',
                    'start': 'node server.js'
                }
            };
            res.json(structure);
        }
        catch (error) {
            console.error('Get project structure error:', error);
            res.status(500).json({ error: 'Failed to get project structure' });
        }
    }
    async generateProjectZip(req, res) {
        try {
            const structure = req.body;
            res.setHeader('Content-Type', 'application/zip');
            res.setHeader('Content-Disposition', 'attachment; filename="persian-legal-ai.zip"');
            const archive = archiver('zip');
            archive.pipe(res);
            // Add files from structure
            if (structure.files) {
                for (const [filePath, content] of Object.entries(structure.files)) {
                    archive.append(content, { name: filePath });
                }
            }
            await archive.finalize();
        }
        catch (error) {
            console.error('Generate project ZIP error:', error);
            res.status(500).json({ error: 'Failed to generate project ZIP' });
        }
    }
    async exportLogs(req, res) {
        try {
            const { modelId, format = 'json' } = req.query;
            let query = 'SELECT * FROM system_logs ORDER BY timestamp DESC';
            const params = [];
            if (modelId) {
                query = 'SELECT * FROM training_logs WHERE model_id = ? ORDER BY timestamp DESC';
                params.push(modelId);
            }
            const logs = this.db.prepare(query).all(...params);
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', 'attachment; filename="logs.csv"');
                // Convert to CSV
                if (logs.length > 0) {
                    const headers = Object.keys(logs[0]).join(',');
                    const rows = logs.map(log => Object.values(log).join(','));
                    res.send([headers, ...rows].join('\n'));
                }
                else {
                    res.send('No logs found');
                }
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', 'attachment; filename="logs.json"');
                res.json(logs);
            }
        }
        catch (error) {
            console.error('Export logs error:', error);
            res.status(500).json({ error: 'Failed to export logs' });
        }
    }
    async exportDataset(req, res) {
        try {
            const { id } = req.params;
            const { format = 'json' } = req.query;
            // Get dataset info
            const dataset = this.db.prepare('SELECT * FROM datasets WHERE id = ?').get(id);
            if (!dataset) {
                res.status(404).json({ error: 'Dataset not found' });
                return;
            }
            // Get dataset records
            const records = this.db.prepare('SELECT * FROM dataset_records WHERE dataset_id = ?').all(id);
            if (format === 'csv') {
                res.setHeader('Content-Type', 'text/csv');
                res.setHeader('Content-Disposition', `attachment; filename="dataset_${id}.csv"`);
                if (records.length > 0) {
                    const headers = Object.keys(records[0]).join(',');
                    const rows = records.map(record => Object.values(record).join(','));
                    res.send([headers, ...rows].join('\n'));
                }
                else {
                    res.send('No records found');
                }
            }
            else {
                res.setHeader('Content-Type', 'application/json');
                res.setHeader('Content-Disposition', `attachment; filename="dataset_${id}.json"`);
                res.json({
                    dataset,
                    records
                });
            }
        }
        catch (error) {
            console.error('Export dataset error:', error);
            res.status(500).json({ error: 'Failed to export dataset' });
        }
    }
    async processProjectExport(exportId, options) {
        try {
            // Update progress
            this.activeExports.set(exportId, { status: 'processing', progress: 10 });
            this.io.emit('export_progress', { exportId, progress: 10 });
            // Simulate export process
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.activeExports.set(exportId, { status: 'processing', progress: 30 });
            this.io.emit('export_progress', { exportId, progress: 30 });
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.activeExports.set(exportId, { status: 'processing', progress: 60 });
            this.io.emit('export_progress', { exportId, progress: 60 });
            await new Promise(resolve => setTimeout(resolve, 1000));
            this.activeExports.set(exportId, { status: 'processing', progress: 90 });
            this.io.emit('export_progress', { exportId, progress: 90 });
            await new Promise(resolve => setTimeout(resolve, 500));
            this.activeExports.set(exportId, { status: 'completed', progress: 100 });
            this.io.emit('export_complete', { exportId });
        }
        catch (error) {
            this.activeExports.set(exportId, {
                status: 'failed',
                progress: 0,
                message: error.message
            });
            this.io.emit('export_failed', { exportId, error: error.message });
        }
    }
}
//# sourceMappingURL=export.controller.js.map