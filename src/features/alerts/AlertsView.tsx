import React, { useState, useEffect } from 'react';
import { dbService } from '../../services/databaseService';
import { COLLECTIONS } from '../../firebase/collections';
import { Alert } from '../../types';
import { Bell, AlertTriangle, AlertCircle, Info, CheckCheck } from 'lucide-react';
import { Button } from '../../components/ui/Button';
import { formatDate } from '../../utils/formatters';

export const AlertsView: React.FC = () => {
  const [alerts, setAlerts] = useState<Alert[]>([]);

  useEffect(() => {
    return dbService.subscribe<Alert>(COLLECTIONS.ALERTS, (all) => {
      setAlerts([...all].sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
    });
  }, []);

  const handleMarkAllRead = async () => {
    for (const a of alerts) {
      if (!a.isRead) {
        await dbService.update(COLLECTIONS.ALERTS, a.id, { isRead: true });
      }
    }
  };

  const handleToggleRead = async (alert: Alert) => {
    await dbService.update(COLLECTIONS.ALERTS, alert.id, { isRead: !alert.isRead });
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-2 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-400" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-white">
              Alerts & System Notifications
            </h1>
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Real-time triggers for critical stockouts, depleted reorder levels, and transit checkpoints
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          <CheckCheck size={14} />
          <span>Mark All as Read</span>
        </Button>
      </div>

      <div className="space-y-3">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => handleToggleRead(alert)}
            className={`glass-panel rounded-2xl p-4 border transition-all cursor-pointer flex items-start gap-3.5 ${
              alert.isRead
                ? 'opacity-60 border-slate-800'
                : alert.severity === 'CRITICAL'
                ? 'border-rose-500/40 bg-rose-950/10'
                : alert.severity === 'WARNING'
                ? 'border-amber-500/40 bg-amber-950/10'
                : 'border-cyan-500/40 bg-cyan-950/10'
            }`}
          >
            <div className="mt-0.5">
              {alert.severity === 'CRITICAL' ? (
                <div className="w-8 h-8 rounded-xl bg-rose-500/10 text-rose-400 flex items-center justify-center">
                  <AlertCircle size={18} />
                </div>
              ) : alert.severity === 'WARNING' ? (
                <div className="w-8 h-8 rounded-xl bg-amber-500/10 text-amber-400 flex items-center justify-center">
                  <AlertTriangle size={18} />
                </div>
              ) : (
                <div className="w-8 h-8 rounded-xl bg-cyan-500/10 text-cyan-400 flex items-center justify-center">
                  <Info size={18} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-sm font-semibold text-white">{alert.title}</h4>
                  {!alert.isRead && (
                    <span className="w-2 h-2 rounded-full bg-rose-500 shadow-[0_0_8px_#f43f5e]" />
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                  {formatDate(alert.createdAt)}
                </span>
              </div>

              <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>

              <div className="mt-2.5 flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                  {alert.type}
                </span>
                {alert.warehouseName && (
                  <span className="text-[10px] font-mono text-slate-400">
                    Location: {alert.warehouseName}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
