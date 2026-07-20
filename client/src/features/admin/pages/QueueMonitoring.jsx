import React, { useState, useEffect } from 'react';
import api from '../../../api/axios';
import PageHeader from '../../../components/common/PageHeader';
import { Card, CardBody } from '../../../components/common/Card';
import { Database, Activity, RefreshCw } from 'lucide-react';

const QueueMonitoring = () => {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHealth = async () => {
    try {
      const res = await api.get('/queues/health');
      setHealth(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchHealth();
    const interval = setInterval(fetchHealth, 10000);
    return () => clearInterval(interval);
  }, []);

  if (loading && !health) {
    return <div className="p-8 text-center text-gray-500">Loading Queue Metrics...</div>;
  }

  const renderQueueMetrics = (name, metrics) => (
    <Card className="mb-6">
      <CardBody className="p-6">
        <h3 className="text-lg font-bold text-gray-900 mb-4 capitalize">{name} Queue</h3>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          <div className="bg-gray-50 p-4 rounded-lg flex items-center justify-between">
            <div className="text-gray-500 text-sm font-medium">Waiting</div>
            <div className="text-xl font-bold text-gray-900">{metrics?.waiting || 0}</div>
          </div>
          <div className="bg-blue-50 p-4 rounded-lg flex items-center justify-between">
            <div className="text-blue-600 text-sm font-medium">Active</div>
            <div className="text-xl font-bold text-blue-900">{metrics?.active || 0}</div>
          </div>
          <div className="bg-green-50 p-4 rounded-lg flex items-center justify-between">
            <div className="text-green-600 text-sm font-medium">Completed</div>
            <div className="text-xl font-bold text-green-900">{metrics?.completed || 0}</div>
          </div>
          <div className="bg-red-50 p-4 rounded-lg flex items-center justify-between">
            <div className="text-red-600 text-sm font-medium">Failed</div>
            <div className="text-xl font-bold text-red-900">{metrics?.failed || 0}</div>
          </div>
          <div className="bg-yellow-50 p-4 rounded-lg flex items-center justify-between">
            <div className="text-yellow-600 text-sm font-medium">Delayed</div>
            <div className="text-xl font-bold text-yellow-900">{metrics?.delayed || 0}</div>
          </div>
        </div>
      </CardBody>
    </Card>
  );

  return (
    <div className="max-w-7xl mx-auto space-y-6">
      <PageHeader 
        title="Queue Monitoring" 
        subtitle="Real-time background processing metrics"
        action={
          <button onClick={fetchHealth} className="btn-secondary flex items-center gap-2">
            <RefreshCw size={16} /> Refresh
          </button>
        }
      />
      
      {/* System Status */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardBody className="p-6 flex items-center gap-4">
            <div className={`p-3 rounded-xl ${health?.redis === 'ready' ? 'bg-green-100 text-green-600' : 'bg-red-100 text-red-600'}`}>
              <Database size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Redis Connection</p>
              <p className="text-lg font-bold text-gray-900 capitalize">{health?.redis || 'Unknown'}</p>
            </div>
          </CardBody>
        </Card>
        
        <Card>
          <CardBody className="p-6 flex items-center gap-4">
            <div className="p-3 rounded-xl bg-indigo-100 text-indigo-600">
              <Activity size={24} />
            </div>
            <div>
              <p className="text-sm font-medium text-gray-500">Active Workers (Export Queue)</p>
              <p className="text-lg font-bold text-gray-900">{health?.workers || 0}</p>
            </div>
          </CardBody>
        </Card>
      </div>

      {/* Queue Metrics */}
      <div className="mt-8">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Queue Pipelines</h2>
        {renderQueueMetrics('Exports', health?.queues?.exports)}
        {renderQueueMetrics('Scheduled Reports', health?.queues?.schedules)}
        {renderQueueMetrics('Cleanup', health?.queues?.cleanup)}
      </div>

    </div>
  );
};

export default QueueMonitoring;
