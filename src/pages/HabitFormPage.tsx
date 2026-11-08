import React from 'react';
import { useNavigate, useParams, useLocation } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useAppState } from '../state/AppStateContext';
import { HabitForm } from '../components/HabitForm';
import { NotFoundPage } from './NotFoundPage';

/**
 * STAGE 4 — Genuine dedicated page for /habits/new and /habits/:habitId/edit.
 * Reuses the exact HabitForm (fields + validation) as the quick-add dialog.
 * Edit loads the persisted habit (ID, logs, journals, freezes and schedule
 * history are preserved by handleSaveHabit); invalid IDs render not-found.
 */
export const HabitFormPage: React.FC = () => {
  const { habitId } = useParams<{ habitId: string }>();
  const isEdit = Boolean(habitId);
  const navigate = useNavigate();
  const location = useLocation();
  const { habits, handleSaveHabit, showToast } = useAppState();

  const from = (location.state as { from?: string } | null)?.from;
  const returnTo = from === 'habits' ? '/habits' : '/';

  const editingHabit = isEdit ? habits.find((h) => h.id === habitId) : undefined;

  // Editing an ID that does not exist in storage -> not found.
  if (isEdit && !editingHabit) {
    return <NotFoundPage message="We couldn't find that habit. It may have been deleted." />;
  }

  return (
    <div className="mx-auto w-full max-w-lg space-y-4">
      <button
        type="button"
        onClick={() => navigate(returnTo)}
        className="inline-flex items-center gap-1.5 text-xs font-semibold text-ink-secondary hover:text-ink transition cursor-pointer min-h-[44px]"
      >
        <ArrowLeft className="w-4 h-4" />
        Back
      </button>

      <div className="p-6 rounded-3xl bg-surface border border-border shadow-card">
        <h1 className="text-xl font-bold text-ink tracking-tight mb-5">
          {isEdit ? 'Edit Habit' : 'Create New Habit'}
        </h1>
        <HabitForm
          key={editingHabit?.id ?? 'new'}
          initialHabit={editingHabit ?? null}
          autoFocus={false}
          onCancel={() => navigate(returnTo)}
          onSubmit={(data) => {
            handleSaveHabit(data);
            showToast(isEdit ? 'Habit updated' : 'Habit created', 'success');
            navigate(returnTo, { replace: true });
          }}
        />
      </div>
    </div>
  );
};
