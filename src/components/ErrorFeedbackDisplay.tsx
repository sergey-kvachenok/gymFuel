'use client';

import React, { useEffect, useState } from 'react';
import { errorFeedbackManager, ErrorFeedback } from '../lib/error-feedback';
import { X, AlertCircle, AlertTriangle, Info, CheckCircle } from 'lucide-react';

interface ErrorFeedbackDisplayProps {
  maxVisible?: number;
  position?:
    | 'top-right'
    | 'top-left'
    | 'bottom-right'
    | 'bottom-left'
    | 'top-center'
    | 'bottom-center';
}

const getIcon = (type: ErrorFeedback['type']) => {
  switch (type) {
    case 'error':
      return <AlertCircle className="w-5 h-5 text-red-500" />;
    case 'warning':
      return <AlertTriangle className="w-5 h-5 text-yellow-500" />;
    case 'info':
      return <Info className="w-5 h-5 text-blue-500" />;
    case 'success':
      return <CheckCircle className="w-5 h-5 text-green-500" />;
    default:
      return <Info className="w-5 h-5 text-gray-500" />;
  }
};

const getBackgroundColor = (type: ErrorFeedback['type']) => {
  switch (type) {
    case 'error':
      return 'bg-red-50 border-red-200';
    case 'warning':
      return 'bg-yellow-50 border-yellow-200';
    case 'info':
      return 'bg-blue-50 border-blue-200';
    case 'success':
      return 'bg-green-50 border-green-200';
    default:
      return 'bg-gray-50 border-gray-200';
  }
};

const getTextColor = (type: ErrorFeedback['type']) => {
  switch (type) {
    case 'error':
      return 'text-red-800';
    case 'warning':
      return 'text-yellow-800';
    case 'info':
      return 'text-blue-800';
    case 'success':
      return 'text-green-800';
    default:
      return 'text-gray-800';
  }
};

const getPositionClasses = (position: string) => {
  switch (position) {
    case 'top-right':
      return 'top-4 right-4';
    case 'top-left':
      return 'top-4 left-4';
    case 'bottom-right':
      return 'bottom-4 right-4';
    case 'bottom-left':
      return 'bottom-4 left-4';
    case 'top-center':
      return 'top-4 left-1/2 transform -translate-x-1/2';
    case 'bottom-center':
      return 'bottom-4 left-1/2 transform -translate-x-1/2';
    default:
      return 'top-4 right-4';
  }
};

export const ErrorFeedbackDisplay: React.FC<ErrorFeedbackDisplayProps> = ({
  maxVisible = 5,
  position = 'top-right',
}) => {
  const [feedbacks, setFeedbacks] = useState<ErrorFeedback[]>([]);

  useEffect(() => {
    // Get initial feedbacks
    setFeedbacks(errorFeedbackManager.getFeedbacks());

    // Subscribe to feedback changes
    const unsubscribe = errorFeedbackManager.subscribe((newFeedbacks) => {
      setFeedbacks(newFeedbacks);
    });

    return unsubscribe;
  }, []);

  const visibleFeedbacks = feedbacks.slice(0, maxVisible);

  if (visibleFeedbacks.length === 0) {
    return null;
  }

  return (
    <div className={`fixed z-50 ${getPositionClasses(position)} space-y-2 max-w-sm`}>
      {visibleFeedbacks.map((feedback) => (
        <div
          key={feedback.id}
          className={`${getBackgroundColor(feedback.type)} ${getTextColor(
            feedback.type,
          )} border rounded-lg p-4 shadow-lg transition-all duration-300 ease-in-out`}
        >
          <div className="flex items-start space-x-3">
            <div className="flex-shrink-0 mt-0.5">{getIcon(feedback.type)}</div>
            <div className="flex-1 min-w-0">
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <h4 className="text-sm font-medium mb-1">{feedback.title}</h4>
                  <p className="text-sm mb-2">{feedback.message}</p>
                  {feedback.details && (
                    <details className="text-xs opacity-75">
                      <summary className="cursor-pointer hover:opacity-100">Show details</summary>
                      <pre className="mt-1 whitespace-pre-wrap">{feedback.details}</pre>
                    </details>
                  )}
                  {feedback.action && (
                    <button
                      onClick={feedback.action.onClick}
                      className="mt-2 text-xs font-medium underline hover:no-underline"
                    >
                      {feedback.action.label}
                    </button>
                  )}
                </div>
                {feedback.dismissible && (
                  <button
                    onClick={() => errorFeedbackManager.removeFeedback(feedback.id)}
                    className="flex-shrink-0 ml-2 text-gray-400 hover:text-gray-600 transition-colors"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
};

// Hook for easy access to error feedback manager
export const useErrorFeedback = () => {
  const [feedbacks, setFeedbacks] = useState<ErrorFeedback[]>([]);

  useEffect(() => {
    setFeedbacks(errorFeedbackManager.getFeedbacks());
    const unsubscribe = errorFeedbackManager.subscribe(setFeedbacks);
    return unsubscribe;
  }, []);

  return {
    feedbacks,
    addError: errorFeedbackManager.addErrorFeedback.bind(errorFeedbackManager),
    addWarning: errorFeedbackManager.addWarningFeedback.bind(errorFeedbackManager),
    addInfo: errorFeedbackManager.addInfoFeedback.bind(errorFeedbackManager),
    addSuccess: errorFeedbackManager.addSuccessFeedback.bind(errorFeedbackManager),
    remove: errorFeedbackManager.removeFeedback.bind(errorFeedbackManager),
    clear: errorFeedbackManager.clearFeedbacks.bind(errorFeedbackManager),
  };
};
