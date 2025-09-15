<!-- ARCHIVED: moved from repo root on 2025-09-15 for cleanliness -->
# Persian Legal AI Training System - API Reference

## 🌐 Base URL

```
Development: http://localhost:3001
Production: https://your-domain.com
```

## 🔐 Authentication

Currently, the API does not require authentication. In future versions, JWT tokens will be used.

## 📊 Response Format

All API responses follow this format:

```json
{
  "success": true,
  "data": { ... },
  "message": "Operation completed successfully",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

Error responses:

```json
{
  "success": false,
  "error": "Error message",
  "code": "ERROR_CODE",
  "timestamp": "2025-01-01T00:00:00Z"
}
```

## 🤖 Models API

### Get All Models

```http
GET /api/models
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "Persian Legal BERT",
    "type": "bert",
    "status": "completed",
    "dataset_id": "iran-legal-qa",
    "accuracy": 0.92,
    "current_epoch": 10,
    "epochs": 10,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### Create New Model

```http
POST /api/models
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "New Model",
  "type": "bert",
  "dataset_id": "iran-legal-qa",
  "config": {
    "epochs": 10,
    "batch_size": 32,
    "learning_rate": 0.001,
    "optimizer": "adam",
    "scheduler": "cosine"
  }
}
```

**Response:**
```json
{
  "id": 2,
  "name": "New Model",
  "type": "bert",
  "status": "pending",
  "dataset_id": "iran-legal-qa",
  "config": {
    "epochs": 10,
    "batch_size": 32,
    "learning_rate": 0.001,
    "optimizer": "adam",
    "scheduler": "cosine"
  },
  "created_at": "2025-01-01T00:00:00Z"
}
```

### Get Specific Model

```http
GET /api/models/:id
```

**Response:**
```json
{
  "id": 1,
  "name": "Persian Legal BERT",
  "type": "bert",
  "status": "completed",
  "dataset_id": "iran-legal-qa",
  "accuracy": 0.92,
  "current_epoch": 10,
  "epochs": 10,
  "config": {
    "epochs": 10,
    "batch_size": 32,
    "learning_rate": 0.001
  },
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Update Model

```http
PUT /api/models/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "Updated Model Name",
  "config": {
    "epochs": 15,
    "batch_size": 64
  }
}
```

### Delete Model

```http
DELETE /api/models/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Model deleted successfully"
}
```

### Start Training

```http
POST /api/models/:id/train
Content-Type: application/json
```

**Request Body:**
```json
{
  "epochs": 10,
  "batch_size": 32,
  "learning_rate": 0.001
}
```

**Response:**
```json
{
  "success": true,
  "message": "Training started",
  "session_id": "session_123"
}
```

### Pause Training

```http
POST /api/models/:id/pause
```

**Response:**
```json
{
  "success": true,
  "message": "Training paused"
}
```

### Resume Training

```http
POST /api/models/:id/resume
```

**Response:**
```json
{
  "success": true,
  "message": "Training resumed"
}
```

## 📊 Datasets API

### Get All Datasets

```http
GET /api/datasets
```

**Response:**
```json
[
  {
    "id": "iran-legal-qa",
    "name": "پرسش و پاسخ حقوقی ایران",
    "source": "huggingface",
    "huggingface_id": "PerSets/iran-legal-persian-qa",
    "samples": 10247,
    "size_mb": 15.2,
    "status": "available",
    "local_path": null,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  },
  {
    "id": "legal-laws",
    "name": "متون قوانین ایران",
    "source": "huggingface",
    "huggingface_id": "QomSSLab/legal_laws_lite_chunk_v1",
    "samples": 50000,
    "size_mb": 125.8,
    "status": "available",
    "local_path": null,
    "created_at": "2025-01-01T00:00:00Z",
    "updated_at": "2025-01-01T00:00:00Z"
  }
]
```

### Get Specific Dataset

```http
GET /api/datasets/:id
```

**Response:**
```json
{
  "id": "iran-legal-qa",
  "name": "پرسش و پاسخ حقوقی ایران",
  "source": "huggingface",
  "huggingface_id": "PerSets/iran-legal-persian-qa",
  "samples": 10247,
  "size_mb": 15.2,
  "status": "available",
  "local_path": null,
  "created_at": "2025-01-01T00:00:00Z",
  "updated_at": "2025-01-01T00:00:00Z"
}
```

### Download Dataset from HuggingFace

```http
POST /api/datasets/:id/download
```

**Response:**
```json
{
  "success": true,
  "message": "Download started",
  "progress": {
    "downloaded": 0,
    "total": 10247,
    "percentage": 0
  }
}
```

### Create New Dataset

```http
POST /api/datasets
Content-Type: application/json
```

**Request Body:**
```json
{
  "id": "custom-dataset",
  "name": "Custom Dataset",
  "source": "upload",
  "samples": 1000,
  "size_mb": 5.2
}
```

### Delete Dataset

```http
DELETE /api/datasets/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Dataset deleted successfully"
}
```

## 📈 Monitoring API

### Get System Metrics

```http
GET /api/monitoring
```

**Response:**
```json
{
  "cpu": 25.5,
  "memory": {
    "used": 2048,
    "total": 8192,
    "percentage": 25
  },
  "process_memory": {
    "used": 128,
    "total": 512,
    "percentage": 25
  },
  "uptime": 3600,
  "system_uptime": 86400,
  "platform": "linux",
  "arch": "x64",
  "timestamp": "2025-01-01T00:00:00Z",
  "active_training": 1,
  "training": {
    "active": 1,
    "total": 5,
    "completed": 3,
    "failed": 1,
    "success_rate": "75%"
  },
  "datasets": {
    "available": 3,
    "downloading": 0,
    "total": 3
  },
  "activity": {
    "info": 2,
    "warning": 2,
    "error": 0
  }
}
```

### Get Analytics Data

```http
GET /api/analytics
```

**Response:**
```json
{
  "modelStats": [
    {
      "type": "bert",
      "count": 3,
      "avgAccuracy": 0.89,
      "totalTrainingTime": 7200
    }
  ],
  "trainingStats": [
    {
      "date": "2025-01-01",
      "sessions": 5,
      "completed": 3,
      "failed": 1,
      "avgDuration": 1200
    }
  ],
  "recentActivity": [
    {
      "level": "info",
      "count": 2
    },
    {
      "level": "warning",
      "count": 2
    }
  ],
  "summary": {
    "totalModels": 5,
    "activeTraining": 1,
    "completedModels": 3,
    "totalDatasets": 3
  }
}
```

### Get System Logs

```http
GET /api/logs?level=info&limit=100&offset=0
```

**Query Parameters:**
- `level` (optional): Filter by log level (info, warning, error)
- `limit` (optional): Number of logs to return (default: 100)
- `offset` (optional): Number of logs to skip (default: 0)

**Response:**
```json
[
  {
    "id": 1,
    "level": "info",
    "component": "server",
    "message": "Server started on port 3001",
    "metadata": null,
    "timestamp": "2025-01-01T00:00:00Z"
  },
  {
    "id": 2,
    "level": "info",
    "component": "training",
    "message": "Training started for model 1",
    "metadata": {
      "modelId": 1,
      "epochs": 10
    },
    "timestamp": "2025-01-01T00:01:00Z"
  }
]
```

## 👥 Team API

### Get Team Members

```http
GET /api/team
```

**Response:**
```json
[
  {
    "id": 1,
    "name": "احمد محمدی",
    "email": "ahmad@example.com",
    "role": "مدیر پروژه",
    "avatar_url": null,
    "last_login": "2025-01-01T00:00:00Z",
    "is_active": true,
    "created_at": "2025-01-01T00:00:00Z"
  }
]
```

### Add Team Member

```http
POST /api/team
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "فاطمه احمدی",
  "email": "fateme@example.com",
  "role": "توسعه‌دهنده"
}
```

**Response:**
```json
{
  "id": 2,
  "name": "فاطمه احمدی",
  "email": "fateme@example.com",
  "role": "توسعه‌دهنده",
  "avatar_url": null,
  "last_login": null,
  "is_active": true,
  "created_at": "2025-01-01T00:00:00Z"
}
```

### Update Team Member

```http
PUT /api/team/:id
Content-Type: application/json
```

**Request Body:**
```json
{
  "name": "فاطمه احمدی",
  "role": "مدیر فنی"
}
```

### Delete Team Member

```http
DELETE /api/team/:id
```

**Response:**
```json
{
  "success": true,
  "message": "Team member removed successfully"
}
```

## 🔌 WebSocket Events

### Connection

```javascript
const socket = io('http://localhost:3001');

socket.on('connect', () => {
  console.log('Connected to server');
});
```

### Training Events

#### Training Progress

```javascript
socket.on('training_progress', (data) => {
  console.log('Training progress:', data);
  // {
  //   modelId: 1,
  //   epoch: 5,
  //   totalEpochs: 10,
  //   accuracy: 0.85,
  //   loss: 0.15,
  //   eta: 1200
  // }
});
```

#### Training Completed

```javascript
socket.on('training_completed', (data) => {
  console.log('Training completed:', data);
  // {
  //   modelId: 1,
  //   finalAccuracy: 0.92,
  //   duration: 3600,
  //   epochs: 10
  // }
});
```

#### Training Failed

```javascript
socket.on('training_failed', (data) => {
  console.log('Training failed:', data);
  // {
  //   modelId: 1,
  //   error: "Out of memory",
  //   reason: "Insufficient GPU memory"
  // }
});
```

#### Training Paused

```javascript
socket.on('training_paused', (data) => {
  console.log('Training paused:', data);
  // {
  //   modelId: 1,
  //   epoch: 5,
  //   reason: "User requested pause"
  // }
});
```

#### Training Resumed

```javascript
socket.on('training_resumed', (data) => {
  console.log('Training resumed:', data);
  // {
  //   modelId: 1,
  //   epoch: 5
  // }
});
```

### System Events

#### System Metrics

```javascript
socket.on('system_metrics', (data) => {
  console.log('System metrics:', data);
  // {
  //   cpu: 25.5,
  //   memory: { used: 2048, total: 8192, percentage: 25 },
  //   activeTraining: 1
  // }
});
```

#### Dataset Download Progress

```javascript
socket.on('dataset_download_progress', (data) => {
  console.log('Download progress:', data);
  // {
  //   id: "iran-legal-qa",
  //   downloaded: 5000,
  //   total: 10247,
  //   percentage: 48.8
  // }
});
```

#### Log Updates

```javascript
socket.on('log_update', (data) => {
  console.log('New log entry:', data);
  // {
  //   id: 123,
  //   level: "info",
  //   component: "training",
  //   message: "Epoch 5 completed",
  //   timestamp: "2025-01-01T00:00:00Z"
  // }
});
```

### Client Events

#### Start Training

```javascript
socket.emit('start_training', {
  modelId: 1,
  config: {
    epochs: 10,
    batchSize: 32,
    learningRate: 0.001
  }
});
```

#### Pause Training

```javascript
socket.emit('pause_training', {
  modelId: 1
});
```

#### Resume Training

```javascript
socket.emit('resume_training', {
  modelId: 1
});
```

## 🚨 Error Codes

| Code | Description |
|------|-------------|
| `MODEL_NOT_FOUND` | Model with specified ID not found |
| `DATASET_NOT_FOUND` | Dataset with specified ID not found |
| `TRAINING_ALREADY_RUNNING` | Model is already being trained |
| `TRAINING_NOT_RUNNING` | No active training to pause/resume |
| `INVALID_CONFIG` | Invalid training configuration |
| `HF_TOKEN_MISSING` | HuggingFace token not configured |
| `HF_API_ERROR` | HuggingFace API error |
| `DATABASE_ERROR` | Database operation failed |
| `VALIDATION_ERROR` | Request validation failed |

## 📝 Rate Limits

Currently, there are no rate limits implemented. Future versions will include:

- **API Requests**: 1000 requests per hour per IP
- **Training Sessions**: 5 concurrent training sessions
- **Dataset Downloads**: 1 download at a time per dataset

## 🔧 SDK Examples

### JavaScript/TypeScript

```typescript
import axios from 'axios';

const api = axios.create({
  baseURL: 'http://localhost:3001/api',
  timeout: 10000
});

// Get all models
const models = await api.get('/models');

// Create new model
const newModel = await api.post('/models', {
  name: 'My Model',
  type: 'bert',
  dataset_id: 'iran-legal-qa',
  config: {
    epochs: 10,
    batch_size: 32,
    learning_rate: 0.001
  }
});

// Start training
await api.post(`/models/${newModel.data.id}/train`, {
  epochs: 10,
  batch_size: 32,
  learning_rate: 0.001
});
```

### Python

```python
import requests
import json

BASE_URL = 'http://localhost:3001/api'

# Get all models
response = requests.get(f'{BASE_URL}/models')
models = response.json()

# Create new model
model_data = {
    'name': 'My Model',
    'type': 'bert',
    'dataset_id': 'iran-legal-qa',
    'config': {
        'epochs': 10,
        'batch_size': 32,
        'learning_rate': 0.001
    }
}
response = requests.post(f'{BASE_URL}/models', json=model_data)
new_model = response.json()

# Start training
training_config = {
    'epochs': 10,
    'batch_size': 32,
    'learning_rate': 0.001
}
response = requests.post(f'{BASE_URL}/models/{new_model["id"]}/train', json=training_config)
```

---

*This API reference is maintained by the Persian Legal AI development team. Last updated: January 2025*