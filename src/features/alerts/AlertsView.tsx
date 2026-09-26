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
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-1 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Bell className="w-5 h-5 text-rose-500" />
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-white">
              Alerts & Notifications
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Real-time warnings for depleted stock, low inventory thresholds, and logistics checkpoints
          </p>
        </div>

        <Button variant="outline" size="sm" onClick={handleMarkAllRead}>
          <CheckCheck size={13} />
          <span>Mark All as Read</span>
        </Button>
      </div>

      <div className="space-y-2.5">
        {alerts.map((alert) => (
          <div
            key={alert.id}
            onClick={() => handleToggleRead(alert)}
            className={`enterprise-card p-4 transition-all cursor-pointer flex items-start gap-3.5 ${
              alert.isRead
                ? 'opacity-60'
                : alert.severity === 'CRITICAL'
                ? 'border-rose-200 dark:border-rose-900/60 bg-rose-50/40 dark:bg-rose-950/10'
                : alert.severity === 'WARNING'
                ? 'border-amber-200 dark:border-amber-900/60 bg-amber-50/40 dark:bg-amber-950/10'
                : 'border-sky-200 dark:border-sky-900/60 bg-sky-50/40 dark:bg-sky-950/10'
            }`}
          >
            <div className="mt-0.5">
              {alert.severity === 'CRITICAL' ? (
                <div className="w-7 h-7 rounded-md bg-rose-100 dark:bg-rose-950/60 text-rose-600 dark:text-rose-400 flex items-center justify-center">
                  <AlertCircle size={16} />
                </div>
              ) : alert.severity === 'WARNING' ? (
                <div className="w-7 h-7 rounded-md bg-amber-100 dark:bg-amber-950/60 text-amber-600 dark:text-amber-400 flex items-center justify-center">
                  <AlertTriangle size={16} />
                </div>
              ) : (
                <div className="w-7 h-7 rounded-md bg-sky-100 dark:bg-sky-950/60 text-sky-600 dark:text-sky-400 flex items-center justify-center">
                  <Info size={16} />
                </div>
              )}
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between gap-2 mb-1">
                <div className="flex items-center gap-2">
                  <h4 className="text-xs font-semibold text-slate-900 dark:text-white">{alert.title}</h4>
                  {!alert.isRead && (
                    <span className="w-1.5 h-1.5 rounded-full bg-rose-500" />
                  )}
                </div>
                <span className="text-[10px] font-mono text-slate-400 whitespace-nowrap">
                  {formatDate(alert.createdAt)}
                </span>
              </div>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">{alert.message}</p>

              <div className="mt-2 flex items-center gap-2">
                <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 text-slate-500 dark:text-slate-400">
                  {alert.type}
                </span>
                {alert.warehouseName && (
                  <span className="text-[10px] font-mono text-slate-400">
                    {alert.warehouseName}
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
