import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Archive, ListTodo, Pencil, Trash2, Search } from 'lucide-react';
import { Habit, HabitCategory, CATEGORIES } from '../types';
import { useAppState } from '../state/AppStateContext';

type SortMode = 'recent' | 'alpha' | 'category';

const CAT_TEXT: Record<HabitCategory, string> = {
  fitness: 'text-cat-fitness-ink',
  mind: 'text-cat-mind-ink',
  productivity: 'text-cat-productivity-ink',
  learning: 'text-cat-learning-ink',
  health: 'text-cat-health-ink'
};

/**
 * STAGE 4 — Habits library route. Search, category filter, sorting, archived
 * toggle, plus edit / archive / delete (delete is confirmation-gated in App).
 */
export const HabitsPage: React.FC = () => {
  const { habits, showArchived, setShowArchived, archivedCount, handleArchiveHabit, handleDeleteHabit } =
    useAppState();
  const navigate = useNavigate();

  const [query, setQuery] = useState('');
  const [catFilter, setCatFilter] = useState<'all' | HabitCategory>('all');
  const [sort, setSort] = useState<SortMode>('recent');

  const base = habits.filter((h) => (showArchived ? true : !h.archived));

  const filtered = base
    .filter((h) => (catFilter === 'all' ? true : h.category === catFilter))
    .filter((h) => h.title.toLowerCase().includes(query.trim().toLowerCase()));

  const sorted = [...filtered].sort((a, b) => {
    if (sort === 'alpha') return a.title.localeCompare(b.title);
    if (sort === 'category') return CATEGORIES[a.category].name.localeCompare(CATEGORIES[b.category].name);
    return (b.updatedAt || '').localeCompare(a.updatedAt || '');
  });

  return (
    <div className="mx-auto w-full max-w-5xl space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-1">
        <div>
          <h1 className="text-xl font-bold text-ink tracking-tight">Habits Library</h1>
          <p className="text-xs text-ink-secondary mt-0.5">Configure frequencies, reminders and goals</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setShowArchived((prev: boolean) => !prev)}
            aria-pressed={showArchived}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold border transition cursor-pointer min-h-[40px] ${
              showArchived
                ? 'bg-warning-bg border-warning-border text-warning'
                : 'bg-surface border-border text-ink-secondary hover:text-ink hover:border-border-strong'
            }`}
          >
            <Archive className="w-3.5 h-3.5 text-warning" />
            <span>{showArchived ? 'Showing Archived' : `Archived (${archivedCount})`}</span>
          </button>
          <button
            type="button"
            onClick={() => navigate('/habits/new', { state: { from: 'habits' } })}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-accent hover:bg-accent-hover active:scale-95 text-ink-on-accent text-xs font-bold shadow-card transition cursor-pointer whitespace-nowrap min-h-[40px]"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>New Habit</span>
          </button>
        </div>
      </div>

      {/* Search + sort controls */}
      <div className="flex flex-col sm:flex-row gap-2">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-ink-muted absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search habits..."
            aria-label="Search habits"
            className="w-full pl-9 pr-3 py-2 rounded-xl bg-surface border border-border-strong text-ink placeholder-ink-muted focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 text-sm transition min-h-[40px]"
          />
        </div>
        <select
          value={catFilter}
          onChange={(e) => setCatFilter(e.target.value as 'all' | HabitCategory)}
          aria-label="Filter by category"
          className="px-3 py-2 rounded-xl bg-surface border border-border-strong text-ink-secondary text-sm focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 cursor-pointer min-h-[40px]"
        >
          <option value="all">All Categories</option>
          {(Object.keys(CATEGORIES) as HabitCategory[]).map((c) => (
            <option key={c} value={c}>
              {CATEGORIES[c].name}
            </option>
          ))}
        </select>
        <select
          value={sort}
          onChange={(e) => setSort(e.target.value as SortMode)}
          aria-label="Sort habits"
          className="px-3 py-2 rounded-xl bg-surface border border-border-strong text-ink-secondary text-sm focus:outline-none focus:border-forest focus:ring-2 focus:ring-forest/15 cursor-pointer min-h-[40px]"
        >
          <option value="recent">Recently Updated</option>
          <option value="alpha">Name (A-Z)</option>
          <option value="category">Category</option>
        </select>
      </div>

      {sorted.length === 0 ? (
        <div className="p-10 text-center rounded-3xl bg-surface border border-border shadow-card space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-bg-secondary flex items-center justify-center text-ink-muted mx-auto">
            <ListTodo className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-ink">
              {query || catFilter !== 'all'
                ? 'No habits match your filters'
                : showArchived
                ? 'No archived habits'
                : 'Your library is empty'}
            </h3>
            <p className="text-xs text-ink-secondary mt-1">
              {query || catFilter !== 'all'
                ? 'Try clearing the search or choosing a different category.'
                : showArchived
                ? 'Habits you archive will appear here.'
                : 'Create a habit to start building your routine and streaks.'}
            </p>
          </div>
          {!showArchived && !query && catFilter === 'all' && (
            <button
              onClick={() => navigate('/habits/new', { state: { from: 'habits' } })}
              className="px-4 py-2 rounded-xl bg-accent hover:bg-accent-hover text-ink-on-accent text-xs font-bold transition cursor-pointer inline-flex items-center gap-1.5 shadow-card"
            >
              <Plus className="w-3.5 h-3.5 stroke-[2.5]" />
              <span>Create Habit</span>
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {sorted.map((h) => (
            <HabitLibraryCard
              key={h.id}
              habit={h}
              onEdit={() => navigate(`/habits/${h.id}/edit`, { state: { from: 'habits' } })}
              onArchive={() => handleArchiveHabit(h.id)}
              onDelete={() => handleDeleteHabit(h.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const HabitLibraryCard: React.FC<{
  habit: Habit;
  onEdit: () => void;
  onArchive: () => void;
  onDelete: () => void;
}> = ({ habit, onEdit, onArchive, onDelete }) => {
  const cat = CATEGORIES[habit.category];
  return (
    <div
      className={`p-4 rounded-2xl border transition flex items-start justify-between gap-3 shadow-card ${
        habit.archived
          ? 'bg-bg-secondary border-border opacity-70'
          : 'bg-surface border-border hover:border-border-strong'
      }`}
    >
      <div className="space-y-1 min-w-0">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-sm font-bold text-ink truncate">{habit.title}</span>
          {habit.archived && (
            <span className="text-[11px] uppercase font-bold text-warning bg-warning-bg px-2 py-0.5 rounded border border-warning-border">
              Archived
            </span>
          )}
          {habit.targetUnit && (
            <span className="text-[11px] text-ink-secondary bg-bg-secondary px-2 py-0.5 rounded-md border border-border">
              {habit.targetUnit}
            </span>
          )}
        </div>
        <div className="text-xs text-ink-secondary flex items-center gap-1.5 flex-wrap">
          <span className={`font-semibold ${CAT_TEXT[habit.category]}`}>{cat.name}</span>
          <span aria-hidden="true">·</span>
          <span className="capitalize">
            {habit.schedule.type === 'daily'
              ? 'Every Day'
              : habit.schedule.type === 'specific_days'
              ? `${habit.schedule.days?.length} specific days`
              : `${habit.schedule.targetCount} days/wk`}
          </span>
          {habit.reminderTime && (
            <>
              <span aria-hidden="true">·</span>
              <span className="text-ink-secondary tabular-nums">⏰ {habit.reminderTime}</span>
            </>
          )}
        </div>
        {habit.notes && <p className="text-xs text-ink-muted italic mt-1 truncate">"{habit.notes}"</p>}
      </div>

      <div className="flex items-center gap-1 shrink-0">
        <button
          onClick={onArchive}
          className="p-2 rounded-xl hover:bg-warning-bg text-ink-muted hover:text-warning transition cursor-pointer"
          title={habit.archived ? 'Restore Habit' : 'Archive Habit'}
          aria-label={habit.archived ? 'Restore Habit' : 'Archive Habit'}
        >
          <Archive className="w-4 h-4" />
        </button>
        <button
          onClick={onEdit}
          className="p-2 rounded-xl hover:bg-bg-secondary text-ink-muted hover:text-ink transition cursor-pointer"
          title="Edit Habit"
          aria-label="Edit Habit"
        >
          <Pencil className="w-4 h-4" />
        </button>
        <button
          onClick={onDelete}
          className="p-2 rounded-xl hover:bg-error-bg text-ink-muted hover:text-error transition cursor-pointer"
          title="Delete Habit"
          aria-label="Delete Habit"
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
