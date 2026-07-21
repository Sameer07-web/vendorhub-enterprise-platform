import React, { useState, useEffect } from 'react';
import { Card, CardHeader, CardBody } from '../../../../components/common/Card';
import Loader from '../../../../components/common/Loader';
import api from '../../../../api/axios';
import { formatDistanceToNow } from 'date-fns';
import { toast } from 'react-hot-toast';

const InsightIcon = ({ type, severity }) => {
  let icon = '💡';
  let color = 'text-blue-500';
  
  if (severity === 'CRITICAL' || severity === 'HIGH') color = 'text-red-500';
  else if (severity === 'POSITIVE') color = 'text-green-500';
  else if (severity === 'MEDIUM') color = 'text-yellow-500';

  if (type === 'BOTTLENECK') icon = '🚧';
  if (type === 'ANOMALY') icon = '⚠️';
  if (type === 'TREND') icon = '📈';
  if (type === 'PERFORMANCE' && severity === 'POSITIVE') icon = '🚀';
  if (type === 'RISK') icon = '🚨';
  if (type === 'OPPORTUNITY') icon = '🎯';
  if (type === 'RECOMMENDATION') icon = '📋';

  return <span className={`text-xl ${color}`}>{icon}</span>;
};

const AIInsightsWidget = () => {
  const [insights, setInsights] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [generating, setGenerating] = useState(false);

  const fetchInsights = async () => {
    try {
      const res = await api.get('/ai/insights');
      setInsights(res.data.data);
      setError('');
    } catch (err) {
      console.error(err);
      setError('Failed to load AI Insights.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchInsights();
  }, []);

  const handleGenerate = async () => {
    setGenerating(true);
    try {
      await api.post('/ai/insights/generate');
      toast.success('Insights generated successfully');
      await fetchInsights();
    } catch (err) {
      toast.error('Failed to generate insights');
    } finally {
      setGenerating(false);
    }
  };

  const handleStatusUpdate = async (id, status) => {
    try {
      await api.put(`/ai/insights/${id}/status`, { status });
      toast.success(`Insight marked as ${status}`);
      await fetchInsights(); // Refresh list
    } catch (err) {
      toast.error(`Failed to update status`);
    }
  };

  if (loading) return <Card className="h-full min-h-[300px]" noPadding><CardBody className="flex justify-center items-center h-full"><Loader /></CardBody></Card>;

  return (
    <Card className="h-full flex flex-col shadow-lg border-t-4 border-t-purple-500">
      <CardHeader className="flex justify-between items-center bg-purple-50">
        <div>
          <h3 className="text-lg font-bold text-purple-900 flex items-center gap-2">
            ✨ AI Operations Intelligence
          </h3>
          <p className="text-xs text-purple-700 mt-1">Proactive platform analysis</p>
        </div>
        <button 
          onClick={handleGenerate} 
          disabled={generating}
          className="text-xs bg-purple-600 text-white px-3 py-1.5 rounded hover:bg-purple-700 disabled:opacity-50 transition-colors"
        >
          {generating ? 'Analyzing...' : 'Generate Now'}
        </button>
      </CardHeader>
      
      <CardBody className="flex-1 overflow-auto p-0">
        {error ? (
          <div className="p-4 text-sm text-red-500">{error}</div>
        ) : insights.length === 0 ? (
          <div className="p-8 text-center text-surface-500 text-sm">
            <p>No active insights found.</p>
            <p className="mt-2 text-xs">The platform is operating optimally.</p>
          </div>
        ) : (
          <div className="divide-y divide-surface-100">
            {insights.map(insight => (
              <div key={insight._id} className="p-4 hover:bg-surface-50 transition-colors">
                <div className="flex gap-3">
                  <div className="mt-1 flex-shrink-0">
                    <InsightIcon type={insight.type} severity={insight.severity} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start mb-1">
                      <h4 className="font-semibold text-surface-900 text-sm">{insight.title}</h4>
                      <span className="text-[10px] bg-surface-200 text-surface-700 px-2 py-0.5 rounded-full font-medium ml-2 shrink-0">
                        {insight.confidenceScore}% Confidence
                      </span>
                    </div>
                    
                    <p className="text-xs text-surface-600 mb-2 leading-relaxed">
                      <strong>Why?</strong> {insight.description}
                    </p>
                    
                    {insight.actionableAdvice && (
                      <div className="bg-blue-50 border border-blue-100 p-2 rounded text-xs text-blue-800 mb-2">
                        <strong>Recommendation:</strong> {insight.actionableAdvice}
                      </div>
                    )}
                    
                    <div className="flex items-center justify-between mt-3 pt-2 border-t border-surface-100 border-dashed">
                      <div className="text-[10px] text-surface-400">
                        {insight.affectedModule} • {formatDistanceToNow(new Date(insight.generatedAt), { addSuffix: true })}
                        {insight.occurrences > 1 && ` • Seen ${insight.occurrences} times`}
                      </div>
                      
                      <div className="flex gap-2">
                        {insight.status === 'NEW' && (
                          <button 
                            onClick={() => handleStatusUpdate(insight._id, 'ACKNOWLEDGED')}
                            className="text-[10px] font-medium text-blue-600 hover:text-blue-800"
                          >
                            Acknowledge
                          </button>
                        )}
                        <button 
                          onClick={() => handleStatusUpdate(insight._id, 'RESOLVED')}
                          className="text-[10px] font-medium text-green-600 hover:text-green-800"
                        >
                          Mark Resolved
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
};

export default AIInsightsWidget;
