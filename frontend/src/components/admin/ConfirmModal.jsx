import { useState } from 'react';
import { AlertTriangle, HelpCircle, X } from 'lucide-react';

export const ConfirmModal = ({
  isOpen,
  onClose,
  onConfirm,
  title = 'Confirm Action',
  message = 'Are you sure you want to proceed?',
  confirmText = 'Confirm',
  cancelText = 'Cancel',
  variant = 'danger', // 'danger' | 'primary' | 'prompt'
  promptLabel = null,
  promptPlaceholder = '',
  promptInitialValue = '',
  isLoading = false,
}) => {
  const [inputValue, setInputValue] = useState(promptInitialValue);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    if (promptLabel !== null) {
      onConfirm(inputValue);
    } else {
      onConfirm();
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-in fade-in duration-150">
      <div 
        className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-neutral-100 relative space-y-4 animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          disabled={isLoading}
          className="absolute top-4 right-4 p-1 rounded-lg text-neutral-400 hover:text-neutral-700 hover:bg-neutral-100 transition-colors"
        >
          <X size={18} />
        </button>

        <div className="flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            variant === 'danger' 
              ? 'bg-rose-50 text-rose-600 border border-rose-100' 
              : 'bg-neutral-100 text-neutral-900 border border-neutral-200'
          }`}>
            {variant === 'danger' ? <AlertTriangle size={20} /> : <HelpCircle size={20} />}
          </div>
          <div className="flex-1 min-w-0 pr-4">
            <h3 className="text-base font-bold text-neutral-950 font-heading leading-tight">{title}</h3>
            <p className="text-xs text-neutral-500 mt-1 leading-relaxed">{message}</p>
          </div>
        </div>

        {promptLabel !== null && (
          <form onSubmit={handleSubmit} className="pt-1">
            <label className="block text-xs font-bold text-neutral-700 uppercase tracking-wider mb-1.5">
              {promptLabel}
            </label>
            <input
              type="text"
              autoFocus
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              placeholder={promptPlaceholder}
              className="w-full bg-neutral-50 border border-neutral-200 rounded-xl px-3.5 py-2.5 text-sm focus:bg-white focus:ring-2 focus:ring-black outline-none font-mono"
            />
          </form>
        )}

        <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-neutral-100">
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 rounded-xl text-xs font-bold text-neutral-600 hover:bg-neutral-100 border border-neutral-200 transition-colors disabled:opacity-50"
          >
            {cancelText}
          </button>
          <button
            type="button"
            onClick={handleSubmit}
            disabled={isLoading}
            className={`px-4 py-2 rounded-xl text-xs font-bold text-white transition-all shadow-sm disabled:opacity-50 flex items-center gap-2 ${
              variant === 'danger'
                ? 'bg-rose-600 hover:bg-rose-700 shadow-rose-200'
                : 'bg-black hover:bg-neutral-800'
            }`}
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : null}
            <span>{confirmText}</span>
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmModal;
