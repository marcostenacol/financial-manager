import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle } from 'lucide-react';

export interface DangerAction {
  label: string;
  description: string;
  onClick: () => void | Promise<void>;
}

interface ConfirmDangerModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  warning: string;
  confirmWord?: string;
  actions: DangerAction[];
}

export const ConfirmDangerModal = ({
  isOpen,
  onClose,
  title,
  warning,
  confirmWord = 'EXCLUIR',
  actions,
}: ConfirmDangerModalProps) => {
  const [typedWord, setTypedWord] = useState('');
  const [runningIndex, setRunningIndex] = useState<number | null>(null);

  const handleClose = () => {
    if (runningIndex !== null) return;
    setTypedWord('');
    onClose();
  };

  const handleAction = async (action: DangerAction, index: number) => {
    if (typedWord !== confirmWord || runningIndex !== null) return;

    setRunningIndex(index);
    try {
      await action.onClick();
    } finally {
      setRunningIndex(null);
      setTypedWord('');
    }
  };

  if (!isOpen) return null;

  const isConfirmed = typedWord === confirmWord;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleClose}
          className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        />

        <motion.div
          initial={{ opacity: 0, scale: 0.9, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          className="relative w-full max-w-lg bg-app-surface border border-red-500/20 rounded-3xl shadow-2xl overflow-y-auto max-h-[90vh]"
        >
          <div className="p-6 border-b border-app-border flex justify-between items-center">
            <h2 className="text-xl font-bold text-app-ink flex items-center gap-2">
              <AlertTriangle className="w-5 h-5 text-red-400" />
              {title}
            </h2>
            <button onClick={handleClose} className="p-2 hover:bg-app-surface-2 rounded-xl transition-colors text-app-muted">
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-8 space-y-6">
            <p className="text-app-ink/80 text-sm leading-relaxed">{warning}</p>

            <div className="space-y-3">
              {actions.map((action, index) => (
                <button
                  key={action.label}
                  type="button"
                  disabled={!isConfirmed || runningIndex !== null}
                  onClick={() => handleAction(action, index)}
                  className="w-full text-left p-4 rounded-2xl border border-red-500/20 bg-red-500/5 hover:bg-red-500/10 transition-all disabled:opacity-40 disabled:cursor-not-allowed"
                >
                  <p className="font-bold text-red-400">
                    {runningIndex === index ? 'Executando...' : action.label}
                  </p>
                  <p className="text-xs text-app-muted mt-1">{action.description}</p>
                </button>
              ))}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-app-muted ml-1">
                Digite <span className="font-mono text-red-400">{confirmWord}</span> para habilitar
              </label>
              <input
                type="text"
                value={typedWord}
                onChange={(e) => setTypedWord(e.target.value)}
                placeholder={confirmWord}
                className="w-full bg-app-surface-2 border border-app-border rounded-2xl py-3 px-4 text-app-ink focus:outline-none focus:ring-2 focus:ring-red-500/50 transition-all font-mono"
              />
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
