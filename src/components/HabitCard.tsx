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
import { Habit, HabitLog, JournalNote, StreakFreeze, CATEGORIES, DailyStatus } from '../types';
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
    switch (habit.category) {
      case 'fitness':
        return <Dumbbell className="w-3.5 h-3.5 text-amber-400" />;
      case 'mind':
        return <Brain className="w-3.5 h-3.5 text-sky-400" />;
      case 'productivity':
        return <Zap className="w-3.5 h-3.5 text-emerald-400" />;
      case 'learning':
        return <BookOpen className="w-3.5 h-3.5 text-indigo-400" />;
      case 'health':
        return <HeartPulse className="w-3.5 h-3.5 text-rose-400" />;
      default:
        return <Zap className="w-3.5 h-3.5 text-slate-400" />;
    }
  };

  const handleCheckboxClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleComplete(habit.id, selectedDate);
  };

  return (
    <div
      className={`group relative rounded-2xl border transition-all duration-200 ${
        isCompleted
          ? 'bg-slate-900/60 border-emerald-500/30'
          : isFrozen
          ? 'bg-slate-900/40 border-sky-500/30'
          : isRest
          ? 'bg-slate-900/30 border-slate-800/60'
          : status === 'missed'
          ? 'bg-slate-900/80 border-amber-500/20'
          : 'bg-slate-900/90 border-slate-800 hover:border-slate-700 shadow-sm'
      }`}
    >
      <div className="p-3.5 sm:p-4 flex items-start gap-3.5">
        {/* Animated Tap Checkbox (Touch target >= 44x44px) */}
        <button
          type="button"
          onClick={handleCheckboxClick}
          aria-label={`Mark ${habit.title} as ${isCompleted ? 'incomplete' : 'complete'}`}
          className="min-w-[44px] min-h-[44px] flex items-center justify-center shrink-0 -m-2 cursor-pointer focus:outline-none"
        >
          <div
            className={`w-7 h-7 rounded-xl flex items-center justify-center border-2 transition-all duration-200 ${
              isCompleted
                ? 'bg-emerald-500 border-emerald-500 text-slate-950 scale-105 shadow-md shadow-emerald-500/25'
                : isFrozen
                ? 'bg-sky-500/10 border-sky-500/40 text-sky-400'
                : isRest
                ? 'border-slate-700 bg-slate-800/40 text-slate-500'
                : 'border-slate-600 bg-slate-800/60 group-hover:border-slate-500 hover:scale-105'
            }`}
          >
            {isCompleted ? (
              <Check className="w-4 h-4 stroke-[3]" />
            ) : isFrozen ? (
              <ShieldAlert className="w-4 h-4" />
            ) : isRest ? (
              <Moon className="w-3.5 h-3.5" />
            ) : null}
          </div>
        </button>

        {/* Habit Content */}
        <div className="flex-1 min-w-0 pt-0.5">
          <div className="flex items-start justify-between gap-2">
            <div className="flex items-center gap-2 flex-wrap min-w-0">
              <span
                className={`text-sm font-semibold transition ${
                  isCompleted
                    ? 'text-slate-400 line-through decoration-slate-600'
                    : 'text-white'
                }`}
              >
                {habit.title}
              </span>

              {habit.targetUnit && (
                <span className="text-[11px] font-mono text-slate-400 bg-slate-800/80 px-2 py-0.5 rounded-md border border-slate-700/50 shrink-0">
                  {habit.targetUnit}
                </span>
              )}
            </div>

            {/* Menu button & Streak pill */}
            <div className="flex items-center gap-1.5 shrink-0 ml-1">
              {streak.currentStreak > 0 && (
                <div
                  className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-amber-500/10 border border-amber-500/20 text-amber-300 text-xs font-semibold font-mono tabular-nums"
                  title={`${streak.currentStreak} ${streak.streakUnit} streak (${streak.longestStreak} best)`}
                >
                  <Flame className="w-3.5 h-3.5 text-amber-400 fill-amber-400/20" />
                  <span>{streak.currentStreak}</span>
                  <span className="text-[11px] text-amber-400/70 font-normal">{streak.streakUnit === 'weeks' ? 'w' : 'd'}</span>
                </div>
              )}

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setShowMenu((prev) => !prev)}
                  aria-label="Habit options"
                  className="w-8 h-8 rounded-lg flex items-center justify-center text-slate-400 hover:text-white hover:bg-slate-800 transition cursor-pointer"
                >
                  <MoreVertical className="w-4 h-4" />
                </button>

                {showMenu && (
                  <div
                    className="absolute right-0 top-9 z-30 w-48 rounded-xl bg-slate-900 border border-slate-700 shadow-2xl py-1 text-xs animate-in fade-in zoom-in-95"
                    onMouseLeave={() => setShowMenu(false)}
                  >
                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onOpenNoteModal(habit, selectedDate, journalEntry?.note);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-400" />
                      <span>{journalEntry?.note ? 'Edit Daily Note' : 'Add Daily Note'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onToggleHabitFreeze(habit.id, selectedDate);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <ShieldAlert className="w-3.5 h-3.5 text-sky-400" />
                      <span>{isFrozen ? 'Unfreeze Day' : 'Freeze / Skip Day'}</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onEditHabit(habit);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Edit2 className="w-3.5 h-3.5 text-slate-400" />
                      <span>Edit Habit</span>
                    </button>

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onArchiveHabit(habit.id);
                      }}
                      className="w-full px-3 py-2 text-left text-slate-200 hover:bg-slate-800 flex items-center gap-2 cursor-pointer"
                    >
                      <Archive className="w-3.5 h-3.5 text-amber-400" />
                      <span>{habit.archived ? 'Restore Habit' : 'Archive Habit'}</span>
                    </button>

                    <div className="h-px bg-slate-800 my-1" />

                    <button
                      type="button"
                      onClick={() => {
                        setShowMenu(false);
                        onDeleteHabit(habit.id);
                      }}
                      className="w-full px-3 py-2 text-left text-rose-400 hover:bg-rose-500/10 flex items-center gap-2 cursor-pointer"
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
          <div className="flex items-center gap-2 text-xs text-slate-400 mt-1.5 flex-wrap">
            <span className="flex items-center gap-1 text-slate-300">
              {renderCategoryIcon()}
              <span>{cat.name}</span>
            </span>

            {habit.reminderTime && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="flex items-center gap-1 text-slate-400 font-mono">
                  <Clock className="w-3 h-3 text-slate-500" />
                  <span>{habit.reminderTime}</span>
                </span>
              </>
            )}

            {/* Distinguishable 4-State Badges */}
            {isFrozen && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-sky-300 font-medium bg-sky-500/10 px-1.5 py-0.5 rounded border border-sky-500/20 text-[11px]">
                  Streak Frozen
                </span>
              </>
            )}

            {isRest && !isCompleted && !isFrozen && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400 bg-slate-800 px-1.5 py-0.5 rounded text-[11px]">
                  Planned Rest
                </span>
              </>
            )}

            {status === 'missed' && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-amber-400/90 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20 text-[11px]">
                  Missed
                </span>
              </>
            )}
          </div>

          {/* Micro-Journaling Note Display or Add Button */}
          <div className="mt-2.5 pt-2 border-t border-slate-800/60">
            {journalEntry?.note ? (
              <div
                onClick={() => onOpenNoteModal(habit, selectedDate, journalEntry.note)}
                className="flex items-start gap-2 p-2 rounded-xl bg-slate-800/50 hover:bg-slate-800 border border-slate-700/40 text-xs text-slate-300 cursor-pointer transition"
                title="Click to edit or delete daily note"
              >
                <MessageSquare className="w-3.5 h-3.5 text-emerald-400 shrink-0 mt-0.5" />
                <span className="italic flex-1 break-words">"{journalEntry.note}"</span>
                <Edit2 className="w-3 h-3 text-slate-500 opacity-60 hover:opacity-100 shrink-0 ml-1" />
              </div>
            ) : (
              <button
                type="button"
                onClick={() => onOpenNoteModal(habit, selectedDate)}
                className="inline-flex items-center gap-1.5 text-[11px] text-slate-400 hover:text-emerald-300 transition cursor-pointer py-1"
              >
                <Plus className="w-3 h-3 text-slate-500" />
                <span>Add 1-line daily note</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
