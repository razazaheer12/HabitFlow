import React, { useState, useRef } from 'react';
import {
  X,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle2,
  FileJson,
  Layers,
  RefreshCw,
  Check
} from 'lucide-react';
import { BackupPayload, BackupValidationResult } from '../types';
import { validateBackupPayload, migrateBackupPayload, mergeBackupWithState } from '../storage/schema';
import { LocalStorageRepository } from '../storage/localStorage';
import { useModalA11y } from './useModalA11y';

interface BackupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onDataRestored: () => void;
}

export const BackupModal: React.FC<BackupModalProps> = ({
  isOpen,
  onClose,
  onDataRestored
}) => {
  const [fileContent, setFileContent] = useState<string | null>(null);
  const [validationResult, setValidationResult] = useState<BackupValidationResult | null>(null);
  const [importMode, setImportMode] = useState<'merge' | 'replace'>('merge');
  const [isProcessing, setIsProcessing] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);
  const [confirmReplace, setConfirmReplace] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const dialogRef = useModalA11y<HTMLDivElement>(isOpen, onClose);

  if (!isOpen) return null;

  const handleDownload = () => {
    LocalStorageRepository.triggerDownloadBackup();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const text = await file.text();
      setFileContent(text);
      const validation = validateBackupPayload(text);
      setValidationResult(validation);
      setFeedbackMessage(null);
    } catch {
      setFeedbackMessage({ text: 'Failed to read the selected backup file.', type: 'error' });
      setValidationResult(null);
    }
  };

  const handleExecuteImport = () => {
    if (!fileContent || !validationResult?.valid) return;

    if (importMode === 'replace' && !confirmReplace) {
      setConfirmReplace(true);
      return;
    }

    // Atomic snapshot before performing writes
    const snapshot = LocalStorageRepository.createStorageSnapshot();

    try {
      setIsProcessing(true);
      const parsed = JSON.parse(fileContent);
      const migrated: BackupPayload = migrateBackupPayload(parsed);

      if (importMode === 'replace') {
        LocalStorageRepository.saveProfile(migrated.profile);
        LocalStorageRepository.saveHabits(migrated.habits);
        LocalStorageRepository.saveLogs(migrated.logs);
        LocalStorageRepository.saveNotes(migrated.notes);
        LocalStorageRepository.saveFreezes(migrated.freezes);
      } else {
        // Merge mode: preserves existing habits and adds non-duplicate incoming items
        const existingHabits = LocalStorageRepository.loadHabits();
        const existingLogs = LocalStorageRepository.loadLogs();
        const existingNotes = LocalStorageRepository.loadNotes();
        const existingFreezes = LocalStorageRepository.loadFreezes();

        const merged = mergeBackupWithState(
          { habits: existingHabits, logs: existingLogs, notes: existingNotes, freezes: existingFreezes },
          migrated
        );

        LocalStorageRepository.saveHabits(merged.habits);
        LocalStorageRepository.saveLogs(merged.logs);
        LocalStorageRepository.saveNotes(merged.notes);
        LocalStorageRepository.saveFreezes(merged.freezes);
      }

      setFeedbackMessage({
        text: `Successfully ${importMode === 'replace' ? 'replaced' : 'merged'} data from backup!`,
        type: 'success'
      });
      setConfirmReplace(false);

      setTimeout(() => {
        onDataRestored();
        onClose();
      }, 1200);
    } catch (err: unknown) {
      // Automatic rollback on failure
      LocalStorageRepository.rollbackToSnapshot(snapshot);
      const msg = err instanceof Error ? err.message : 'Unknown error during import.';
      setFeedbackMessage({ text: `Import failed and rolled back safely: ${msg}`, type: 'error' });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-ink/40 backdrop-blur-sm"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby="backup-modal-title"
        tabIndex={-1}
        className="w-full max-w-lg bg-surface border border-border rounded-3xl p-6 shadow-modal relative max-h-[90vh] overflow-y-auto animate-in fade-in zoom-in-95"
      >
        <div className="flex items-center justify-between pb-3 border-b border-border mb-5">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-accent-soft border border-accent-border flex items-center justify-center text-accent-text">
              <FileJson className="w-4 h-4" />
            </div>
            <div>
              <h2 id="backup-modal-title" className="text-lg font-bold text-ink tracking-tight">Backup & Data Recovery</h2>
              <p className="text-xs text-ink-secondary">100% offline, local-first JSON backup</p>
            </div>
          </div>

          <button
            onClick={onClose}
            aria-label="Close modal"
            className="w-8 h-8 rounded-xl bg-bg-secondary text-ink-muted hover:text-ink flex items-center justify-center transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-6">
          {/* Export Section */}
          <div className="p-4 rounded-2xl bg-bg-secondary border border-border space-y-2.5">
            <h3 className="text-xs font-bold uppercase tracking-wider text-accent-text flex items-center gap-1.5">
              <Download className="w-3.5 h-3.5" />
              Export Local Backup
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Download your entire habit library, historical completion logs, journal reflections, and streak freezes as a validated JSON file.
            </p>
            <button
              onClick={handleDownload}
              className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-bg-secondary text-ink border border-border-strong text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Download className="w-4 h-4 text-accent-text" />
              <span>Download Backup (.JSON)</span>
            </button>
          </div>

          {/* Import Section */}
          <div className="p-4 rounded-2xl bg-bg-secondary border border-border space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-info flex items-center gap-1.5">
              <Upload className="w-3.5 h-3.5" />
              Restore from Backup
            </h3>
            <p className="text-xs text-ink-secondary leading-relaxed">
              Select a valid HabitFlow backup file. You can preview its contents and choose whether to merge or fully replace existing records.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              accept=".json"
              onChange={handleFileChange}
              className="hidden"
            />

            <button
              onClick={() => fileInputRef.current?.click()}
              className="w-full py-2.5 px-4 rounded-xl bg-surface hover:bg-bg-secondary text-ink border border-border-strong text-xs font-semibold flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <Upload className="w-4 h-4 text-info" />
              <span>Choose Backup File...</span>
            </button>

            {/* Validation & Preview Card */}
            {validationResult && (
              <div className="mt-3 p-3.5 rounded-xl border border-border space-y-3 bg-surface text-xs transition">
                {validationResult.valid && validationResult.summary ? (
                  <>
                    <div className="flex items-center gap-2 text-success font-semibold">
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Valid HabitFlow Backup (Schema v{validationResult.summary.schemaVersion})</span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-ink-secondary bg-bg-secondary p-2.5 rounded-lg border border-border font-mono text-[11px]">
                      <div>User: <span className="text-ink font-bold">{validationResult.summary.userName}</span></div>
                      <div>Habits: <span className="text-ink font-bold">{validationResult.summary.habitsCount}</span></div>
                      <div>Logs: <span className="text-ink font-bold">{validationResult.summary.logsCount}</span></div>
                      <div>Notes: <span className="text-ink font-bold">{validationResult.summary.notesCount}</span></div>
                    </div>

                    {/* Merge vs Replace Mode Selector */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-xs font-semibold text-ink-secondary block">Import Mode</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => setImportMode('merge')}
                          aria-pressed={importMode === 'merge'}
                          className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                            importMode === 'merge'
                              ? 'bg-accent-soft border-accent text-accent-text font-semibold shadow-card'
                              : 'bg-surface border-border text-ink-secondary hover:border-border-strong'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <Layers className="w-3.5 h-3.5" />
                            <span>Merge</span>
                          </div>
                          <span className="text-[11px] text-ink-muted block mt-0.5 font-normal">
                            Keep existing, append new
                          </span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setImportMode('replace')}
                          aria-pressed={importMode === 'replace'}
                          className={`p-2 rounded-xl border text-left transition cursor-pointer ${
                            importMode === 'replace'
                              ? 'bg-error-bg border-error text-error font-semibold shadow-card'
                              : 'bg-surface border-border text-ink-secondary hover:border-border-strong'
                          }`}
                        >
                          <div className="flex items-center gap-1.5">
                            <RefreshCw className="w-3.5 h-3.5" />
                            <span>Full Replace</span>
                          </div>
                          <span className="text-[11px] text-ink-muted block mt-0.5 font-normal">
                            Overwrite current data
                          </span>
                        </button>
                      </div>
                    </div>

                    <button
                      onClick={handleExecuteImport}
                      disabled={isProcessing}
                      className={`w-full min-h-[44px] py-2.5 rounded-xl text-xs font-semibold shadow-card transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-60 ${
                        importMode === 'replace'
                          ? 'bg-error hover:brightness-110 text-white'
                          : 'bg-accent hover:bg-accent-hover text-ink-on-accent font-bold'
                      }`}
                    >
                      <Check className="w-4 h-4 stroke-[2.5]" />
                      <span>{importMode === 'replace' ? 'Confirm Full Overwrite' : 'Merge Backup Records'}</span>
                    </button>
                  </>
                ) : (
                  <div className="flex items-start gap-2 text-error">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <span>{validationResult.error}</span>
                  </div>
                )}
              </div>
            )}

            {feedbackMessage && (
              <div
                className={`p-3 text-xs rounded-xl border ${
                  feedbackMessage.type === 'success'
                    ? 'bg-success-bg border-success-border text-success'
                    : 'bg-error-bg border-error-border text-error'
                }`}
              >
                {feedbackMessage.text}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
