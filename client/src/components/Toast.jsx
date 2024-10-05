import { createPortal } from 'react-dom';
import { Check, X } from 'lucide-react';
import { useEffect } from 'react';

const Toast = ({ message, type = 'success', onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 3000);
    return () => clearTimeout(timer);
  }, [onClose]);

  return createPortal(
    <div className={`fixed bottom-4 right-4 z-50 transform transition-all duration-300 ease-in-out ${
      type === 'error' ? 'bg-red-100 border-red-400 text-red-700' : 'bg-green-100 border-green-400 text-green-700'
    } border-l-4 p-4 rounded shadow-lg`}>
      <div className="flex">
        <div className="py-1">
          {type === 'error' ? (
            <X className="h-6 w-6 text-red-500" />
          ) : (
            <Check className="h-6 w-6 text-green-500" />
          )}
        </div>
        <div className="ml-3">
          <p className="text-sm font-medium">{message}</p>
        </div>
        <div className="ml-auto pl-3">
          <button
            className="-mx-1.5 -my-1.5 rounded-lg p-1.5 inline-flex h-8 w-8 text-gray-500 hover:text-gray-700 focus:outline-none"
            onClick={onClose}
          >
            <X className="h-5 w-5" />
          </button>
        </div>
      </div>
    </div>,
    document.body
  );
};

export default Toast;