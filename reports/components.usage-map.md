# Components Usage Map

## Overview
This document maps existing `src` pages to candidate `components` UI elements and identifies required props, data sources, and implementation risks.

## Page → Component Mapping

### 1. Overview Page (`src/pages/Overview.tsx`)
**Candidate Components:**
- `ui/EnhancedCard` → System metrics cards
- `ui/DataTable` → Recent activities table
- `charts/EnhancedCharts` → Performance charts
- `ui/Progress` → System health indicators

**Required Props:**
- `EnhancedCard`: `title`, `value`, `trend`, `icon`
- `DataTable`: `data`, `columns`, `onRowClick`
- `PerformanceChart`: `data`, `options`
- `Progress`: `value`, `max`

**Data Sources:**
- `monitoring.status()` → System metrics
- `monitoring.logs()` → Recent activities
- `training.status()` → Training progress

**Risk Level:** LOW - Well-defined props, existing data services

---

### 2. Dashboard Page (`src/pages/Dashboard.tsx`)
**Candidate Components:**
- `ui/EnhancedCard` → Metric cards
- `charts/EnhancedCharts` → Multiple chart types
- `ui/DataTable` → Model performance table
- `ui/LoadableSection` → Async data loading

**Required Props:**
- `EnhancedCard`: `title`, `value`, `trend`, `icon`
- `CategoryDistribution`: `data`, `options`
- `DataTable`: `data`, `columns`, `searchable`
- `LoadableSection`: `loading`, `error`, `children`

**Data Sources:**
- `monitoring.status()` → System metrics
- `training.models()` → Model list
- `analytics.performance()` → Chart data

**Risk Level:** LOW - Standard dashboard patterns

---

### 3. Training Page (`src/pages/Training.tsx`)
**Candidate Components:**
- `TrainingManagement` → Main training interface
- `ui/DataTable` → Training sessions table
- `ui/Progress` → Training progress
- `ui/Button` → Action buttons

**Required Props:**
- `TrainingManagement`: `models`, `datasets`, `onStartTraining`
- `DataTable`: `data`, `columns`, `onRowClick`
- `Progress`: `value`, `max`
- `Button`: `variant`, `onClick`, `disabled`

**Data Sources:**
- `training.models()` → Available models
- `datasets.list()` → Available datasets
- `training.status()` → Training progress

**Risk Level:** MEDIUM - Complex training state management

---

### 4. Datasets Page (`src/pages/Datasets.tsx`)
**Candidate Components:**
- `DatasetGallery` → Dataset grid view
- `DatasetCard` → Individual dataset cards
- `ui/Button` → Upload/delete actions
- `ui/Input` → Search/filter inputs

**Required Props:**
- `DatasetGallery`: `datasets`, `onUpload`, `onDelete`
- `DatasetCard`: `dataset`, `onClick`, `onDelete`
- `Button`: `variant`, `onClick`, `disabled`
- `Input`: `type`, `placeholder`, `value`, `onChange`

**Data Sources:**
- `datasets.list()` → Dataset list
- `datasets.upload()` → Upload functionality

**Risk Level:** LOW - Standard CRUD operations

---

### 5. Models Page (`src/pages/Models.tsx`)
**Candidate Components:**
- `EnhancedModelsPage` → Main models interface
- `ui/DataTable` → Models table
- `ui/Button` → Model actions
- `charts/EnhancedCharts` → Model performance

**Required Props:**
- `EnhancedModelsPage`: (inherits from existing)
- `DataTable`: `data`, `columns`, `onRowClick`
- `Button`: `variant`, `onClick`, `disabled`
- `SystemMetrics`: `data`, `options`

**Data Sources:**
- `training.models()` → Model list
- `monitoring.status()` → Model metrics

**Risk Level:** LOW - Existing component reuse

---

### 6. Export Page (`src/pages/Export.tsx`)
**Candidate Components:**
- `ProjectDownloader` → Export interface
- `ui/Button` → Export actions
- `ui/Progress` → Export progress
- `ui/DataTable` → Export history

**Required Props:**
- `ProjectDownloader`: `onExport`, `onDownload`
- `Button`: `variant`, `onClick`, `disabled`
- `Progress`: `value`, `max`
- `DataTable`: `data`, `columns`

**Data Sources:**
- `exporter.create()` → Start export
- `exporter.status()` → Export progress
- `exporter.download()` → Download file

**Risk Level:** MEDIUM - File handling complexity

---

### 7. Monitoring Page (`src/pages/Monitoring.tsx`)
**Candidate Components:**
- `EnhancedMonitoringPage` → Main monitoring interface
- `charts/EnhancedCharts` → Real-time charts
- `ui/DataTable` → Logs table
- `SystemStatus` → System health

**Required Props:**
- `EnhancedMonitoringPage`: (inherits from existing)
- `RealTimeChart`: `data`, `options`
- `DataTable`: `data`, `columns`, `searchable`
- `SystemStatus`: `status`, `metrics`

**Data Sources:**
- `monitoring.logs()` → System logs
- `monitoring.status()` → System metrics
- WebSocket → Real-time updates

**Risk Level:** MEDIUM - Real-time data complexity

---

## Implementation Strategy

### Phase 1: Low Risk (Overview, Dashboard, Datasets, Models)
- Direct component wrapping with minimal prop mapping
- Use existing data services
- Apply glass/neo styling via wrapper classes

### Phase 2: Medium Risk (Training, Export, Monitoring)
- Enhanced error handling
- WebSocket integration for real-time updates
- File upload/download handling
- Progress tracking

### Phase 3: Advanced Features
- Virtualization for large datasets
- Advanced filtering and search
- Real-time notifications
- Performance optimization

## Data Flow Architecture

```
Pages → Services → API → Backend
  ↓
Components (via props)
  ↓
UI Rendering (glass/neo styling)
```

## Risk Mitigation

1. **Component Isolation**: Keep existing components unchanged
2. **Prop Validation**: Use TypeScript interfaces for all props
3. **Error Boundaries**: Wrap each page with error handling
4. **Loading States**: Use `LoadableSection` for async operations
5. **Fallback UI**: Provide skeleton/loading states
6. **Testing**: Unit tests for each wrapper page

## Success Metrics

- All existing functionality preserved
- New glass/neo styling applied
- Real-time data updates working
- Error handling comprehensive
- Performance maintained or improved