import React, { useEffect, useRef } from 'react';
import { AlertTriangle, Trash2, CheckCircle2, Loader2, X } from 'lucide-react';

export interface ConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void | Promise<void>;
  title: string;
  message: React.ReactNode;
  confirmText?: string;
  cancelText?: string;
  variant?: 'danger' | 'warning' | 'primary';
  isLoading?: boolean;
  loadingText?: string;
  icon?: React.ReactNode;
}

export function ConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title,
  message,
  confirmText = 'पुष्टि करें (Confirm)',
  cancelText = 'रद्द करें (Cancel)',
  variant = 'danger',
  isLoading = false,
  loadingText,
  icon,
}: ConfirmModalProps) {
  const confirmBtnRef = useRef<HTMLButtonElement>(null);
  const modalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (isOpen) {
      // Focus on confirm button or modal container
      setTimeout(() => {
        confirmBtnRef.current?.focus();
      }, 50);

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && !isLoading) {
          onClose();
        }
      };

      window.addEventListener('keydown', handleKeyDown);
      return () => {
        window.removeEventListener('keydown', handleKeyDown);
      };
    }
  }, [isOpen, isLoading, onClose]);

  if (!isOpen) return null;

  const handleBackdropClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (modalRef.current && !modalRef.current.contains(e.target as Node) && !isLoading) {
      onClose();
    }
  };

  const variantStyles = {
    danger: {
      bgIcon: 'bg-rose-100 text-rose-600 border-rose-200',
      confirmBtn: 'bg-rose-600 hover:bg-rose-700 text-white focus-visible:ring-rose-500 shadow-rose-200',
      badge: 'bg-rose-50 text-rose-700 border-rose-200',
    },
    warning: {
      bgIcon: 'bg-amber-100 text-amber-600 border-amber-200',
      confirmBtn: 'bg-amber-600 hover:bg-amber-700 text-white focus-visible:ring-amber-500 shadow-amber-200',
      badge: 'bg-amber-50 text-amber-700 border-amber-200',
    },
    primary: {
      bgIcon: 'bg-blue-100 text-blue-600 border-blue-200',
      confirmBtn: 'bg-blue-600 hover:bg-blue-700 text-white focus-visible:ring-blue-500 shadow-blue-200',
      badge: 'bg-blue-50 text-blue-700 border-blue-200',
    },
  }[variant];

  const defaultIcon = {
    danger: <Trash2 className="w-6 h-6 text-rose-600" />,
    warning: <AlertTriangle className="w-6 h-6 text-amber-600" />,
    primary: <CheckCircle2 className="w-6 h-6 text-blue-600" />,
  }[variant];

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in duration-200"
      onClick={handleBackdropClick}
      role="dialog"
      aria-modal="true"
      aria-labelledby="confirm-modal-title"
      aria-describedby="confirm-modal-desc"
    >
      <div
        ref={modalRef}
        className="w-full max-w-md bg-white rounded-3xl shadow-2xl border border-slate-100 overflow-hidden transform transition-all animate-in zoom-in-95 duration-200"
      >
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 pt-6 pb-2">
          <div className="flex items-center gap-3">
            <div className={`p-2.5 rounded-2xl border ${variantStyles.bgIcon}`}>
              {icon || defaultIcon}
            </div>
            <h3 id="confirm-modal-title" className="text-lg font-black text-slate-900">
              {title}
            </h3>
          </div>
          <button
            onClick={onClose}
            disabled={isLoading}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors disabled:opacity-50 cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Message Body */}
        <div id="confirm-modal-desc" className="px-6 py-4 text-sm text-slate-600 font-medium leading-relaxed">
          {typeof message === 'string' ? <p>{message}</p> : message}
        </div>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-3 px-6 py-4 bg-slate-50 border-t border-slate-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2.5 rounded-xl text-sm font-bold text-slate-700 hover:bg-slate-200/70 border border-slate-200 transition-all cursor-pointer disabled:opacity-50 min-h-[44px]"
          >
            {cancelText}
          </button>
          <button
            ref={confirmBtnRef}
            type="button"
            disabled={isLoading}
            onClick={async () => {
              await onConfirm();
            }}
            className={`inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-bold shadow-md transition-all cursor-pointer disabled:opacity-50 min-h-[44px] ${variantStyles.confirmBtn}`}
          >
            {isLoading ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                <span>{loadingText || 'प्रक्रिया जारी है...'}</span>
              </>
            ) : (
              <span>{confirmText}</span>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
