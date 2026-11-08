import React from 'react';
import { useNavigate } from 'react-router-dom';
import { BarChart3 } from 'lucide-react';
import { useAppState } from '../state/AppStateContext';
import { HeatmapAnalytics } from '../components/HeatmapAnalytics';
import { formatDisplayDate, toLocalDateString } from '../domain/date';

/**
 * STAGE 2 — Dedicated full-width Analytics experience.
 * Section A (header) is rendered here; Sections B (heatmap), C (period
 * comparisons) and D (category breakdown) are delivered by HeatmapAnalytics,
 * which consumes the corrected quota-aware analytics engine.
 */
export const AnalyticsPage: React.FC = () => {
  const { habits, logs, freezes } = useAppState();
  const navigate = useNavigate();

  const today = toLocalDateString();
  const timeZone = Intl.DateTimeFormat().resolvedOptions().timeZone || 'local time';

  return (
    <div className="mx-auto w-full max-w-7xl space-y-6">
      {/* SECTION A — Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
            <BarChart3 className="w-5 h-5" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Your Progress</h1>
            <p className="text-sm text-slate-400 mt-0.5 max-w-xl leading-relaxed">
              Consistency, period trends and category breakdown — measured in scheduled check-ins,
              not habits created.
            </p>
          </div>
        </div>
        <div className="text-xs text-slate-500 sm:text-right shrink-0">
          <div>
            Reporting through <span className="text-slate-300 font-medium">{formatDisplayDate(today, { includeYear: true })}</span>
          </div>
          <div className="mt-0.5">Timezone: <span className="font-mono text-slate-400">{timeZone}</span></div>
        </div>
      </div>

      {/* SECTIONS B / C / D */}
      <HeatmapAnalytics
        habits={habits}
        logs={logs}
        freezes={freezes}
        onSelectDate={(d) => navigate(`/?date=${d}`)}
      />
    </div>
  );
};
