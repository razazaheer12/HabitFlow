import React, { useEffect } from 'react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, CheckCircle2, ArrowRight } from 'lucide-react';
import { HabitCategory, CATEGORIES } from '../types';
import { useAppState } from '../state/AppStateContext';
import { HeroHeader } from '../components/HeroHeader';
import { DateCarousel } from '../components/DateCarousel';
import { HabitCard } from '../components/HabitCard';
import { FirstRunEmptyState } from '../components/FirstRunEmptyState';
import { toLocalDateString } from '../domain/date';

const DATE_PARAM = /^\d{4}-\d{2}-\d{2}$/;

/**
 * STAGE 1 — Simplified Today dashboard.
 * Contains ONLY: greeting + quick stats + freeze action (HeroHeader), the date
 * carousel, category filter chips, today's scheduled checklist, a contextual
 * empty state, and a small "View Analytics" link. All heatmap / comparison /
 * category-breakdown analytics live exclusively on the Analytics route.
 */
export const TodayPage: React.FC = () => {
  const app = useAppState();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const {
    profile,
    habits,
    logs,
    notes,
    freezes,
    selectedDate,
    setSelectedDate,
    categoryFilter,
    setCategoryFilter,
    globalStreak,
    activeHabits,
    dueHabits,
    completedDueCount,
    isSelectedDateFrozen,
    visibleHabits,
    handleToggleComplete,
    handleToggleHabitFreeze,
    handleArchiveHabit,
    handleDeleteHabit,
    openNoteModal,
    openFreezeModal
  } = app;

  // Sync ?date=YYYY-MM-DD -> selectedDate on first load / external navigation.
  useEffect(() => {
    const param = searchParams.get('date');
    if (param && DATE_PARAM.test(param) && param !== selectedDate) {
      setSelectedDate(param);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const handleSelectDate = (d: string) => {
    setSelectedDate(d);
    const next = new URLSearchParams(searchParams);
    if (d === toLocalDateString()) next.delete('date');
    else next.set('date', d);
    setSearchParams(next, { replace: true });
  };

  return (
    <div className="mx-auto w-full max-w-[720px] space-y-6">
      <HeroHeader
        userName={profile.name}
        selectedDate={selectedDate}
        completionRate={globalStreak.todayRate}
        currentStreak={globalStreak.currentStreak}
        activeHabitsCount={activeHabits.length}
        dueTodayCount={dueHabits.length}
        completedTodayCount={completedDueCount}
        isHolidayMode={isSelectedDateFrozen}
        onOpenFreezeModal={openFreezeModal}
      />

      {activeHabits.length === 0 ? (
        <FirstRunEmptyState userName={profile.name} onCreateFirstHabit={() => navigate('/habits/new', { state: { from: 'today' } })} />
      ) : (
        <>
          {/* Date carousel + analytics shortcut */}
          <div className="space-y-3">
            <div className="p-2.5 rounded-2xl bg-bg-secondary">
              <DateCarousel
                selectedDate={selectedDate}
                onSelectDate={handleSelectDate}
                habits={habits}
                logs={logs}
                freezes={freezes}
              />
            </div>

            <div className="flex justify-end">
              <Link
                to="/analytics"
                className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-accent-text transition-colors"
              >
                View Analytics
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Category filter chips */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 no-scrollbar text-xs">
            <button
              type="button"
              onClick={() => setCategoryFilter('all')}
              className={`px-3.5 rounded-xl font-semibold transition cursor-pointer whitespace-nowrap min-h-[44px] ${
                categoryFilter === 'all'
                  ? 'bg-accent text-ink-on-accent shadow-card'
                  : 'bg-surface text-ink-secondary hover:text-ink border border-border hover:border-border-strong'
              }`}
            >
              All ({dueHabits.length})
            </button>

            {(Object.keys(CATEGORIES) as HabitCategory[]).map((catKey) => {
              const count = dueHabits.filter((h) => h.category === catKey).length;
              const isSelected = categoryFilter === catKey;
              return (
                <button
                  key={catKey}
                  type="button"
                  onClick={() => setCategoryFilter(catKey)}
                  className={`px-3.5 rounded-xl font-semibold transition cursor-pointer whitespace-nowrap min-h-[44px] ${
                    isSelected
                      ? 'bg-accent text-ink-on-accent shadow-card'
                      : 'bg-surface text-ink-secondary hover:text-ink border border-border hover:border-border-strong'
                  }`}
                >
                  {CATEGORIES[catKey].name} ({count})
                </button>
              );
            })}
          </div>

          {/* Today's scheduled checklist — the visual focus */}
          <div className="space-y-3">
            {visibleHabits.length === 0 ? (
              <div className="p-8 text-center rounded-2xl bg-surface border border-border shadow-card space-y-3">
                <div className="w-12 h-12 rounded-2xl bg-accent-soft flex items-center justify-center text-accent-text mx-auto">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-ink">No habits scheduled for this date</h3>
                  <p className="text-xs text-ink-secondary mt-1">
                    {categoryFilter !== 'all'
                      ? `No habits in the ${CATEGORIES[categoryFilter]?.name} category.`
                      : 'You have a free schedule, or habits are set for different days of the week.'}
                  </p>
                </div>
                <button
                  onClick={() => navigate('/habits/new', { state: { from: 'today' } })}
                  className="cta-primary px-4 py-2 rounded-xl text-xs font-semibold cursor-pointer inline-flex items-center gap-1.5"
                >
                  <Plus className="w-3.5 h-3.5" strokeWidth={2.5} />
                  <span>Add a New Habit</span>
                </button>
              </div>
            ) : (
              visibleHabits.map((habit) => (
                <HabitCard
                  key={habit.id}
                  habit={habit}
                  selectedDate={selectedDate}
                  logs={logs}
                  notes={notes}
                  freezes={freezes}
                  onToggleComplete={handleToggleComplete}
                  onOpenNoteModal={(h, d, note) => openNoteModal(h, d, note)}
                  onToggleHabitFreeze={handleToggleHabitFreeze}
                  onEditHabit={(h) => navigate(`/habits/${h.id}/edit`, { state: { from: 'today' } })}
                  onArchiveHabit={handleArchiveHabit}
                  onDeleteHabit={handleDeleteHabit}
                />
              ))
            )}
          </div>
        </>
      )}
    </div>
  );
};
