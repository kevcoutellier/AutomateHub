import React, { useEffect, useState } from 'react';
import { Activity, Zap, Clock, MemoryStick } from 'lucide-react';
import PerformanceOptimizer from '../utils/performanceOptimizer';

interface PerformanceStats {
  loadTime: number;
  memoryUsage: number;
  renderCount: number;
  lastUpdate: string;
}

interface PerformanceMonitorProps {
  enabled?: boolean;
  showDebugInfo?: boolean;
}

const PerformanceMonitor: React.FC<PerformanceMonitorProps> = ({ 
  enabled = true, 
  showDebugInfo = false 
}) => {
  const [stats, setStats] = useState<PerformanceStats>({
    loadTime: 0,
    memoryUsage: 0,
    renderCount: 0,
    lastUpdate: new Date().toISOString()
  });
  
  const [optimizer, setOptimizer] = useState<PerformanceOptimizer | null>(null);
  const [isVisible, setIsVisible] = useState(showDebugInfo);

  useEffect(() => {
    if (!enabled) return;

    // Initialize performance optimizer
    const perfOptimizer = new PerformanceOptimizer({
      enableLazyLoading: true,
      enableImageOptimization: true,
      enableCodeSplitting: true,
      enableCaching: true,
      enablePreloading: true
    });

    setOptimizer(perfOptimizer);

    // Update stats periodically
    const updateStats = () => {
      const metrics = perfOptimizer.getMetrics();
      setStats({
        loadTime: metrics.loadTime,
        memoryUsage: metrics.memoryUsage,
        renderCount: stats.renderCount + 1,
        lastUpdate: new Date().toISOString()
      });
    };

    // Initial stats update
    updateStats();

    // Set up periodic updates
    const interval = setInterval(updateStats, 5000);

    // Cleanup
    return () => {
      clearInterval(interval);
      perfOptimizer.destroy();
    };
  }, [enabled]);

  // Keyboard shortcut to toggle debug info
  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      if (event.ctrlKey && event.shiftKey && event.key === 'P') {
        setIsVisible(!isVisible);
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [isVisible]);

  const formatBytes = (bytes: number): string => {
    if (bytes === 0) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const formatTime = (ms: number): string => {
    if (ms < 1000) return `${ms.toFixed(0)}ms`;
    return `${(ms / 1000).toFixed(2)}s`;
  };

  const generateReport = () => {
    if (optimizer) {
      const report = optimizer.generatePerformanceReport();
      console.log('📊 Performance Report Generated:', report);
      
      // Download report as JSON
      const blob = new Blob([JSON.stringify(report, null, 2)], { 
        type: 'application/json' 
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `performance-report-${Date.now()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const clearCache = () => {
    if (optimizer) {
      optimizer.clearCache();
    }
  };

  if (!enabled || !isVisible) {
    return null;
  }

  return (
    <div className="fixed bottom-4 right-4 bg-white shadow-lg rounded-lg border p-4 z-50 min-w-[300px]">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-gray-800 flex items-center gap-2">
          <Activity className="w-4 h-4" />
          Performance Monitor
        </h3>
        <button
          onClick={() => setIsVisible(false)}
          className="text-gray-400 hover:text-gray-600"
        >
          ×
        </button>
      </div>

      <div className="space-y-3">
        {/* Load Time */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-blue-500" />
            <span className="text-sm text-gray-600">Load Time</span>
          </div>
          <span className="text-sm font-mono">
            {formatTime(stats.loadTime)}
          </span>
        </div>

        {/* Memory Usage */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <MemoryStick className="w-4 h-4 text-green-500" />
            <span className="text-sm text-gray-600">Memory</span>
          </div>
          <span className="text-sm font-mono">
            {formatBytes(stats.memoryUsage)}
          </span>
        </div>

        {/* Render Count */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-yellow-500" />
            <span className="text-sm text-gray-600">Renders</span>
          </div>
          <span className="text-sm font-mono">
            {stats.renderCount}
          </span>
        </div>

        {/* Last Update */}
        <div className="text-xs text-gray-400 border-t pt-2">
          Last update: {new Date(stats.lastUpdate).toLocaleTimeString()}
        </div>

        {/* Actions */}
        <div className="flex gap-2 pt-2 border-t">
          <button
            onClick={generateReport}
            className="flex-1 bg-blue-500 text-white text-xs py-1 px-2 rounded hover:bg-blue-600"
          >
            Export Report
          </button>
          <button
            onClick={clearCache}
            className="flex-1 bg-gray-500 text-white text-xs py-1 px-2 rounded hover:bg-gray-600"
          >
            Clear Cache
          </button>
        </div>
      </div>

      {/* Help text */}
      <div className="text-xs text-gray-400 mt-2 pt-2 border-t">
        Press Ctrl+Shift+P to toggle
      </div>
    </div>
  );
};

export default PerformanceMonitor;
