import React, { useState, useEffect } from 'react';
import { X, MessageSquare, Trash2, Sparkles, Check } from 'lucide-react';
import { Habit } from '../types';
import { formatDisplayDate } from '../domain/date';
import { useModalA11y } from './useModalA11y';

interface MicroJournalModalProps {
  isOpen: boolean;
  onClose: () => void;
  habit: Habit | null;
  dateStr: string;
  initialNote?: string;
  onSaveNote: (habitId: string, date: string, note: string) => void;
  onDeleteNote: (habitId: string, date: string) => void;
}

const QUICK_STARTERS = [
  'Felt energized and smooth',
  'Tough start, but finished strong',
  '15 mins quick session',
  'Great focus with music',
  'Overcame resistance today',
  'Kept it simple and consistent'
];

export const MicroJournalModal: React.FC<MicroJournalModalProps> = ({
  isOpen,
  onClose,
  habit,
  dateStr,
  initialNote = '',
  onSaveNote,
  onDeleteNote
}) => {
  const [noteText, setNoteText] = useState('');

  useEffect(() => {
    setNoteText(initialNote || '');
  }, [initialNote, isOpen]);

  const dialogRef = useModalA11y<HTMLDivElement>(isOpen && !!habit, onClose);

  if (!isOpen || !habit) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!noteText.trim()) {
      onDeleteNote(habit.id, dateStr);
    } else {
      onSaveNote(habit.id, dateStr, noteText.trim());
    }
    onClose();
  };

  const handleDelete = () => {
    onDeleteNote(habit.id, dateStr);
    onClose();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="micro-journal-title"
        tabIndex={-1}
        className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-2xl relative animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
              <MessageSquare className="w-4 h-4" />
            </div>
            <div>
              <h3 id="micro-journal-title" className="text-base font-bold text-white tracking-tight">Micro-Journal Note</h3>
              <p className="text-xs text-slate-400">
                {habit.title} · {formatDisplayDate(dateStr)}
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close"
            className="w-8 h-8 rounded-xl bg-slate-800 text-slate-400 hover:text-white flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label htmlFor="micro-journal-input" className="text-xs font-semibold text-slate-300">
                1-Line Daily Reflection
              </label>
              <span className="text-[11px] text-slate-500 font-mono">
                {noteText.length}/160
              </span>
            </div>
            <textarea
              id="micro-journal-input"
              rows={3}
              maxLength={160}
              autoFocus
              placeholder="e.g. Felt great, finished in 15 mins without distraction"
              value={noteText}
              onChange={(e) => setNoteText(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-xl bg-slate-800/80 border border-slate-700/80 text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 text-sm resize-none transition"
            />
          </div>

          {/* Quick Prompts */}
          <div className="space-y-1.5">
            <span className="text-[11px] font-medium text-slate-400 flex items-center gap-1">
              <Sparkles className="w-3 h-3 text-emerald-400" />
              Quick Prompts
            </span>
            <div className="flex flex-wrap gap-1.5">
              {QUICK_STARTERS.map((prompt) => (
                <button
                  key={prompt}
                  type="button"
                  onClick={() => setNoteText(prompt)}
                  className="px-2.5 py-1 rounded-lg bg-slate-800 hover:bg-slate-750 text-[11px] text-slate-300 hover:text-white border border-slate-700/60 transition cursor-pointer"
                >
                  {prompt}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 pt-3 border-t border-slate-800/80">
            {initialNote ? (
              <button
                type="button"
                onClick={handleDelete}
                className="px-3 py-2 rounded-xl text-rose-400 hover:bg-rose-500/10 text-xs font-semibold flex items-center gap-1.5 transition cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Delete Note</span>
              </button>
            ) : (
              <button
                type="button"
                onClick={onClose}
                className="px-3 py-2 rounded-xl text-slate-400 hover:text-white text-xs font-semibold transition cursor-pointer"
              >
                Cancel
              </button>
            )}

            <button
              type="submit"
              className="px-5 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-semibold shadow-md shadow-emerald-500/20 active:scale-95 transition cursor-pointer flex items-center gap-1.5"
            >
              <Check className="w-3.5 h-3.5 stroke-[3]" />
              <span>{initialNote ? 'Update Note' : 'Save Note'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
