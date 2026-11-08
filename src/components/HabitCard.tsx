import React, { useState } from 'react';
import {
  Check,
  Flame,
  MessageSquare,
  Clock,
  MoreVertical,
  ShieldAlert,
  Dumbbell,
  Brain,
  Zap,
  BookOpen,
  HeartPulse,
  Edit2,
  Trash2,
  Archive,
  Plus,
  Moon
} from 'lucide-react';
import { Habit, HabitCategory, HabitLog, JournalNote, StreakFreeze, CATEGORIES, DailyStatus } from '../types';
import { calculateHabitStreak, isHabitCompleted, isHabitFrozen, resolveHabitDailyStatus } from '../domain/streak';
import { isPlannedRestDay } from '../domain/schedule';

interface HabitCardProps {
  habit: Habit;
  selectedDate: string;
  logs: HabitLog[];
  notes: JournalNote[];
  freezes: StreakFreeze[];
  onToggleComplete: (habitId: string, date: string) => void;
  onOpenNoteModal: (habit: Habit, date: string, currentNote?: string) => void;
  onToggleHabitFreeze: (habitId: string, date: string) => void;
  onEditHabit: (habit: Habit) => void;
  onArchiveHabit: (habitId: string) => void;
  onDeleteHabit: (habitId: string) => void;
}

/* Pastel category chips + icon colors (Section 5.6 of the design foundation). */
const CAT_CHIP: Record<HabitCategory, string> = {
  fitness: 'bg-cat-fitness-bg text-cat-fitness-ink border-cat-fitness-border',
  mind: 'bg-cat-mind-bg text-cat-mind-ink border-cat-mind-border',
  productivity: 'bg-cat-productivity-bg text-cat-productivity-ink border-cat-productivity-border',
  learning: 'bg-cat-learning-bg text-cat-learning-ink border-cat-learning-border',
  health: 'bg-cat-health-bg text-cat-health-ink border-cat-health-border'
};
const CAT_ICON: Record<HabitCategory, string> = {
  fitness: 'text-cat-fitness-icon',
  mind: 'text-cat-mind-icon',
  productivity: 'text-cat-productivity-icon',
  learning: 'text-cat-learning-icon',
  health: 'text-cat-health-icon'
};

export const HabitCard: React.FC<HabitCardProps> = ({
  habit,
  selectedDate,
  logs,
  notes,
  freezes,
  onToggleComplete,
  onOpenNoteModal,
  onToggleHabitFreeze,
  onEditHabit,
  onArchiveHabit,
  onDeleteHabit
}) => {
  const [showMenu, setShowMenu] = useState(false);

  const isCompleted = isHabitCompleted(habit.id, selectedDate, logs);
  const isFrozen = isHabitFrozen(habit.id, selectedDate, freezes);
  const isRest = isPlannedRestDay(habit, selectedDate);
  const status: DailyStatus = resolveHabitDailyStatus(habit, selectedDate, logs, freezes);

  // Find note independently of logs
  const journalEntry = notes.find((n) => n.habitId === habit.id && n.date === selectedDate);
  const streak = calculateHabitStreak(habit, logs, freezes, selectedDate);
  const cat = CATEGORIES[habit.category];

  const renderCategoryIcon = () => {
    const cls = `w-3.5 h-3.5 ${CAT_ICON[habit.category]}`;
    switch (habit.category) {
      case 'fitness':
        return <Dumbbell className={cls} />;
      case 'mind':
        return <Brain className={cls} />;
      case 'productivity':
        return <Zap className={cls} />;
      case 'learning':
        return <BookOpen className={cls} />;
      case 'health':
        return <HeartPulse className={cls} />;
      default:
        return <Zap className="w-3.5 h-3.5 text-ink-muted" />;
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(habit.id, selectedDate);
  };

  return (
    <div
      className={`group relative rounded-2xl border shadow-card transition-all duration-200 hover:shadow-elevated ${
        habit.archived ? 'opacity-60 ' : ''
      }${
        isCompleted
          ? 'bg-accent-soft border-accent-border'
          : isFrozen
          ? 'bg-info-bg border-info-border'
          : isRest
          ? 'bg-neutral-bg border-border'
          : status === 'missed'
          ? 'bg-warning-bg border-warning-border'
          : 'bg-surface border-border hover:border-border-strong'
      }`}
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3.5">
        {/* Animated Tap Checkbox (Touch target >= 44x44px) */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          aria-label={`Mark ${habit.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
          aria-pressed={isCompleted}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 -m-2 cursor-pointer"
        >
          <div
            className={`w-7 h-7 rounded-[10px] flex items-center justify-center border-2 transition-all duration-150 ${
              isCompleted
                ? 'bg-accent border-accent text-ink-on-accent animate-pop'
                : isFrozen
                ? 'bg-info-bg border-info-border text-info-fill'
                : isRest
                ? 'bg-neutral-bg border-border text-ink-muted'
                : 'bg-surface border-border-strong text-transparent group-hover:border-ink-muted hover:scale-105'
            }`}
          >
            {isCompleted ? (
              <Check className="w-4 h-4" strokeWidth={3} />
            ) : isFrozen ? (
              <ShieldAlert className="w-4 h-4" />
            ) : isRest ? (
              <Moon className="w-3.5 h-3.5" />
            ) : (
              <Check className="w-4 h-4" strokeWidth={3} />
            )}
          </div>
        </button>

        {/* Habit Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span
                className={`text-sm font-semibold transition ${
                  isCompleted
                    ? 'text-ink-secondary line-through decoration-border-strong'
                    : 'text-ink'
                }`}
              >
                {habit.title}
              </span>

              {habit.targetUnit && (
                <span className="text-xs font-medium text-ink-secondary bg-bg-secondary px-2 py-0.5 rounded-md border border-border shrink-0">
                  {habit.targetUnit}
                </span>
              )}
            </div>

            {/* Menu button & Streak pill */}
            <div className="flex items-center gap-1.5 shrink-0 ml-1">
              {streak.currentStreak > 0 && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-warning-bg border border-warning-border text-warning text-xs font-semibold tabular-nums"
                  title={`${streak.currentStreak} ${streak.streakUnit} streak (${streak.longestStreak} best)`}
                >
                  <Flame className="w-3.5 h-3.5 text-warning-fill" />
                  <span>{streak.currentStreak}</span>
                  <span className="text-xs text-warning font-normal">{streak.streakUnit === 'weeks' ? 'w' : 'd'}</span>
                </div>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  aria-label="Habit options"
                  aria-expanded={showMenu}
                  aria-haspopup="menu"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-ink-muted hover:text-ink hover:bg-bg-secondary transition cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div
                    role="menu"
                    className="absolute right-0 top-9 z-30 w-48 rounded-xl bg-surface border border-border shadow-dropdown py-1 text-xs animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setShowMenu(false)}
                  >
                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        onOpenNoteModal(habit, selectedDate, journalEntry?.note);
                      }}
                      className="w-full px-3 py-2 text-left text-ink-secondary hover:bg-bg-secondary hover:text-ink flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-accent-text" />
                      <span>{journalEntry?.note ? 'Edit Daily Note' : 'Add Daily Note'}</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        onToggleHabitFreeze(habit.id, selectedDate);
                      }}
                      className="w-full px-3 py-2 text-left text-ink-secondary hover:bg-bg-secondary hover:text-ink flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-info-fill" />
                      <span>{isFrozen ? 'Unfreeze Day' : 'Freeze / Skip Day'}</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        onEditHabit(habit);
                      }}
                      className="w-full px-3 py-2 text-left text-ink-secondary hover:bg-bg-secondary hover:text-ink flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-ink-muted" />
                      <span>Edit Habit</span>
                    </button>

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        onArchiveHabit(habit.id);
                      }}
                      className="w-full px-3 py-2 text-left text-ink-secondary hover:bg-bg-secondary hover:text-ink flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Archive className="w-3.5 h-3.5 text-warning-fill" />
                      <span>{habit.archived ? 'Restore Habit' : 'Archive Habit'}</span>
                    </button>

                    <div className="h-px bg-border my-1" />

                    <button
                      type="button"
                      role="menuitem"
                      onClick={() => {
                        setShowMenu(false);
                        onDeleteHabit(habit.id);
                      }}
                      className="w-full px-3 py-2 text-left text-error hover:bg-error-bg flex items-center gap-2 cursor-pointer transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Delete Habit</span>
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Distinguishable Daily Status & Category Row */}
          <div className="flex items-center gap-2 text-xs mt-2 flex-wrap">
            <span className={`flex items-center gap-1 px-1.5 py-0.5 rounded-md border font-medium ${CAT_CHIP[habit.category]}`}>
              {renderCategoryIcon()}
              <span>{cat.name}</span>
            </span>

            {habit.reminderTime && (
              <>
                <span aria-hidden="true" className="text-border-strong">·</span>
                <span className="flex items-center gap-1 text-ink-muted tabular-nums">
                  <Clock className="w-3 h-3" />
                  <span>{habit.reminderTime}</span>
                </span>
              </>
            )}

            {/* Distinguishable 4-State Badges */}
            {isFrozen && (
              <>
                <span aria-hidden="true" className="text-border-strong">·</span>
                <span className="text-info bg-info-bg px-1.5 py-0.5 rounded border border-info-border text-xs font-medium">
                  Streak Frozen
                </span>
              </>
            )}

            {isRest && !isCompleted && !isFrozen && (
              <>
                <span aria-hidden="true" className="text-border-strong">·</span>
                <span className="text-ink-secondary bg-neutral-bg px-1.5 py-0.5 rounded border border-border text-xs font-medium">
                  Planned Rest
                </span>
              </>
            )}

            {status === 'missed' && (
              <>
                <span aria-hidden="true" className="text-border-strong">·</span>
                <span className="text-warning bg-warning-bg px-1.5 py-0.5 rounded border border-warning-border text-xs font-medium">
                  Missed
                </span>
              </>
            )}
          </div>

          {/* Micro-Journaling Note Display or Add Button */}
          <div className="mt-2.5 pt-2 border-t border-border">
            {journalEntry?.note ? (
              <div
                onClick={() => onOpenNoteModal(habit, selectedDate, journalEntry.note)}
                className="flex items-start gap-2 p-2 rounded-xl bg-bg-secondary hover:bg-border/50 border border-border text-xs text-ink-secondary cursor-pointer transition"
                title="Click to edit or delete daily note"
              >
                <MessageSquare className="w-3.5 h-3.5 text-accent-text shrink-0 mt-0.5" />
                <span className="italic flex-1 break-words">"{journalEntry.note}"</span>
                <Edit2 className="w-3 h-3 text-ink-muted opacity-70 hover:opacity-100 shrink-0 ml-1" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenNoteModal(habit, selectedDate)}
                className="inline-flex items-center gap-1.5 text-xs text-ink-muted hover:text-accent-text transition cursor-pointer py-1"
              >
                <Plus className="w-3 h-3" />
                <span>Add 1-line daily note</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
