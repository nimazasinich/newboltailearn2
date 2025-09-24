
// Reliability API Endpoints
// Server-side endpoints for reliability monitoring

app.get('/api/reliability/status', (req, res) => {
  try {
    const reliabilityMonitor = global.reliabilityMonitor;
    const fallbackSystemManager = global.fallbackSystemManager;
    
    if (!reliabilityMonitor || !fallbackSystemManager) {
      return res.status(503).json({ 
        error: 'Reliability systems not initialized' 
      });
    }
    
    const reliabilityReport = reliabilityMonitor.getReliabilityStatus();
    const fallbackReport = fallbackSystemManager.getFallbackReport();
    
    res.json({
      reliability: reliabilityReport,
      fallbacks: fallbackReport,
      timestamp: new Date().toISOString()
    });
    
  } catch (error) {
    console.error('❌ Reliability status endpoint error:', error);
    res.status(500).json({ error: 'Failed to get reliability status' });
  }
});

app.get('/api/reliability/component/:name', (req, res) => {
  try {
    const { name } = req.params;
    const reliabilityMonitor = global.reliabilityMonitor;
    
    if (!reliabilityMonitor) {
      return res.status(503).json({ 
        error: 'Reliability monitor not initialized' 
      });
    }
    
    const componentStatus = reliabilityMonitor.getComponentStatus(name);
    
    if (!componentStatus) {
      return res.status(404).json({ 
        error: 'Component not found' 
      });
    }
    
    res.json(componentStatus);
    
  } catch (error) {
    console.error('❌ Component status endpoint error:', error);
    res.status(500).json({ error: 'Failed to get component status' });
  }
});

app.post('/api/reliability/fallback/:name/activate', (req, res) => {
  try {
    const { name } = req.params;
    const fallbackSystemManager = global.fallbackSystemManager;
    
    if (!fallbackSystemManager) {
      return res.status(503).json({ 
        error: 'Fallback system manager not initialized' 
      });
    }
    
    fallbackSystemManager.activateFallbackManually(name)
      .then(success => {
        if (success) {
          res.json({ 
            message: `Fallback ${name} activated successfully`,
            timestamp: new Date().toISOString()
          });
        } else {
          res.status(400).json({ 
            error: `Failed to activate fallback ${name}` 
          });
        }
      })
      .catch(error => {
        console.error('❌ Fallback activation error:', error);
        res.status(500).json({ error: 'Failed to activate fallback' });
      });
    
  } catch (error) {
    console.error('❌ Fallback activation endpoint error:', error);
    res.status(500).json({ error: 'Failed to activate fallback' });
  }
});

app.post('/api/reliability/fallback/:name/deactivate', (req, res) => {
  try {
    const { name } = req.params;
    const fallbackSystemManager = global.fallbackSystemManager;
    
    if (!fallbackSystemManager) {
      return res.status(503).json({ 
        error: 'Fallback system manager not initialized' 
      });
    }
    
    fallbackSystemManager.deactivateFallbackManually(name)
      .then(success => {
        if (success) {
          res.json({ 
            message: `Fallback ${name} deactivated successfully`,
            timestamp: new Date().toISOString()
          });
        } else {
          res.status(400).json({ 
            error: `Failed to deactivate fallback ${name}` 
          });
        }
      })
      .catch(error => {
        console.error('❌ Fallback deactivation error:', error);
        res.status(500).json({ error: 'Failed to deactivate fallback' });
      });
    
  } catch (error) {
    console.error('❌ Fallback deactivation endpoint error:', error);
    res.status(500).json({ error: 'Failed to deactivate fallback' });
  }
});

app.get('/api/reliability/health', (req, res) => {
  try {
    const reliabilityMonitor = global.reliabilityMonitor;
    const fallbackSystemManager = global.fallbackSystemManager;
    
    const healthStatus = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      systems: {
        reliabilityMonitor: !!reliabilityMonitor,
        fallbackSystemManager: !!fallbackSystemManager
      }
    };
    
    if (!reliabilityMonitor || !fallbackSystemManager) {
      healthStatus.status = 'degraded';
    }
    
    res.json(healthStatus);
    
  } catch (error) {
    console.error('❌ Reliability health endpoint error:', error);
    res.status(500).json({ 
      status: 'failed',
      error: 'Reliability health check failed',
      timestamp: new Date().toISOString()
    });
  }
});
