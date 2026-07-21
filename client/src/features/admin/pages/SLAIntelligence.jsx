import React, { useState, useEffect } from 'react';
import { 
  getWorkflowSlaHealth, 
  getWorkflowDepartmentScorecard, 
  getWorkflowFunnel, 
  getAutomationMetrics, 
  getOverdueApprovals 
} from '../../../api/analytics.api';
import './SLAIntelligence.css'; // We will create this

const SLAIntelligence = () => {
  const [range, setRange] = useState('30d');
  const [loading, setLoading] = useState(true);
  
  const [slaHealth, setSlaHealth] = useState(null);
  const [scorecard, setScorecard] = useState([]);
  const [funnel, setFunnel] = useState(null);
  const [automation, setAutomation] = useState(null);
  const [overdue, setOverdue] = useState([]);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [slaRes, scoreRes, funnelRes, autoRes, overdueRes] = await Promise.all([
        getWorkflowSlaHealth(range),
        getWorkflowDepartmentScorecard(range),
        getWorkflowFunnel(range),
        getAutomationMetrics(range),
        getOverdueApprovals()
      ]);
      
      setSlaHealth(slaRes.data);
      setScorecard(scoreRes.data);
      setFunnel(funnelRes.data);
      setAutomation(autoRes.data);
      setOverdue(overdueRes.data);
    } catch (error) {
      console.error('Failed to fetch SLA data', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [range]);

  if (loading) {
    return <div className="sla-loading">Loading Operations Dashboard...</div>;
  }

  return (
    <div className="sla-dashboard">
      <div className="sla-header">
        <h1>Operations & SLA Intelligence</h1>
        <select value={range} onChange={(e) => setRange(e.target.value)}>
          <option value="30d">Last 30 Days</option>
          <option value="90d">Last 90 Days</option>
          <option value="12m">Last 12 Months</option>
        </select>
      </div>

      <div className="sla-kpis">
        <div className="kpi-card highlight">
          <h3>SLA Adherence</h3>
          <div className="kpi-value">{slaHealth?.slaAdherence}%</div>
          <div className="kpi-subtext">{slaHealth?.breachedProcesses} breaches / {slaHealth?.totalProcesses} processes</div>
        </div>
        <div className="kpi-card">
          <h3>Overdue Approvals</h3>
          <div className="kpi-value text-danger">{overdue?.length}</div>
          <div className="kpi-subtext">Active bottlenecks</div>
        </div>
        <div className="kpi-card highlight">
          <h3>Automation Success</h3>
          <div className="kpi-value">{automation?.successRate}%</div>
          <div className="kpi-subtext">{automation?.successCount} successful executions</div>
        </div>
        <div className="kpi-card">
          <h3>Total Escalations</h3>
          <div className="kpi-value text-warning">{slaHealth?.escalatedProcesses}</div>
          <div className="kpi-subtext">Requires manual intervention</div>
        </div>
      </div>

      <div className="sla-grid">
        <div className="sla-card">
          <h2>Approval Funnel</h2>
          <div className="funnel-chart">
            <div className="funnel-step">
              <span className="label">Submitted</span>
              <span className="value">{funnel?.submitted}</span>
            </div>
            <div className="funnel-step">
              <span className="label">Pending</span>
              <span className="value">{funnel?.pending}</span>
            </div>
            <div className="funnel-step">
              <span className="label">Approved</span>
              <span className="value text-success">{funnel?.approved}</span>
            </div>
            <div className="funnel-step">
              <span className="label">Rejected</span>
              <span className="value text-danger">{funnel?.rejected}</span>
            </div>
          </div>
        </div>

        <div className="sla-card">
          <h2>Automation Top Rules</h2>
          <table className="sla-table">
            <thead>
              <tr>
                <th>Rule Name</th>
                <th>Executions</th>
                <th>Failures</th>
              </tr>
            </thead>
            <tbody>
              {automation?.topRules?.map(r => (
                <tr key={r._id}>
                  <td>{r.ruleName}</td>
                  <td>{r.executions}</td>
                  <td className={r.failures > 0 ? 'text-danger' : 'text-success'}>{r.failures}</td>
                </tr>
              ))}
              {automation?.topRules?.length === 0 && (
                <tr>
                  <td colSpan="3" className="text-center">No automation rules triggered</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <div className="sla-card full-width">
        <h2>Department Scorecard (Bottleneck Analysis)</h2>
        <table className="sla-table">
          <thead>
            <tr>
              <th>Department</th>
              <th>Avg Approval Time (Hrs)</th>
              <th>SLA Adherence</th>
              <th>Breaches</th>
              <th>Escalations</th>
            </tr>
          </thead>
          <tbody>
            {scorecard?.map(d => (
              <tr key={d.departmentName}>
                <td>{d.departmentName}</td>
                <td>{d.avgDurationHours ? d.avgDurationHours.toFixed(1) : '-'}</td>
                <td>
                  <div className="progress-bar-container">
                    <div 
                      className={`progress-bar ${d.slaAdherence < 90 ? 'bg-danger' : 'bg-success'}`} 
                      style={{ width: `${d.slaAdherence}%` }}
                    ></div>
                    <span>{d.slaAdherence.toFixed(1)}%</span>
                  </div>
                </td>
                <td>{d.breaches}</td>
                <td>{d.escalations}</td>
              </tr>
            ))}
            {scorecard?.length === 0 && (
              <tr>
                <td colSpan="5" className="text-center">No departmental workflow data found</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="sla-card full-width">
        <h2>Active Overdue Approvals</h2>
        <table className="sla-table">
          <thead>
            <tr>
              <th>Entity</th>
              <th>Current Sequence</th>
              <th>Deadline</th>
              <th>Pending Approvers</th>
            </tr>
          </thead>
          <tbody>
            {overdue?.map(o => (
              <tr key={o._id}>
                <td>{o.entityType} ({o.entityId})</td>
                <td>Level {o.currentSequence}</td>
                <td className="text-danger">{new Date(o.slaDeadline).toLocaleString()}</td>
                <td>{o.pendingApprovers.map(a => a.fullName).join(', ')}</td>
              </tr>
            ))}
            {overdue?.length === 0 && (
              <tr>
                <td colSpan="4" className="text-center">No overdue approvals</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default SLAIntelligence;
