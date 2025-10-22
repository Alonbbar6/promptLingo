import React from 'react';
import { AlertCircle, AlertTriangle, XCircle } from 'lucide-react';

interface ErrorDisplayProps {
  error: string | null;
  onDismiss: () => void;
}

interface ErrorInfo {
  title: string;
  message: string;
  type: 'warning' | 'error' | 'info';
  icon: React.ReactNode;
}

const getErrorInfo = (error: string): ErrorInfo => {
  // Model loading errors
  if (error.includes('Model is loading') || error.includes('model is loading')) {
    return {
      title: 'Model Loading',
      message: 'The AI model is warming up (30-60 seconds). Please try again in a moment.',
      type: 'warning',
      icon: <AlertTriangle className="h-5 w-5" />,
    };
  }

  // Connection errors
  if (error.includes('Cannot connect to server') || error.includes('ECONNREFUSED')) {
    return {
      title: 'Connection Error',
      message: 'Cannot reach the server. Make sure the backend is running on http://localhost:3001',
      type: 'error',
      icon: <XCircle className="h-5 w-5" />,
    };
  }

  // Timeout errors
  if (error.includes('timeout') || error.includes('ECONNABORTED')) {
    return {
      title: 'Request Timeout',
      message: 'The request took too long. If this is your first request, the model may be loading. Please try again.',
      type: 'warning',
      icon: <AlertTriangle className="h-5 w-5" />,
    };
  }

  // Network errors
  if (error.includes('Network') || error.includes('network')) {
    return {
      title: 'Network Error',
      message: 'Network connection issue. Please check your internet connection and try again.',
      type: 'error',
      icon: <XCircle className="h-5 w-5" />,
    };
  }

  // Audio errors
  if (error.includes('microphone') || error.includes('audio') || error.includes('MediaRecorder')) {
    return {
      title: 'Audio Error',
      message: 'Failed to access microphone. Please check your browser permissions and try again.',
      type: 'error',
      icon: <XCircle className="h-5 w-5" />,
    };
  }

  // API key errors
  if (error.includes('API key') || error.includes('unauthorized') || error.includes('401')) {
    return {
      title: 'Authentication Error',
      message: 'API authentication failed. Please check your API keys in the .env file.',
      type: 'error',
      icon: <XCircle className="h-5 w-5" />,
    };
  }

  // Rate limit errors
  if (error.includes('rate limit') || error.includes('429')) {
    return {
      title: 'Rate Limit Exceeded',
      message: 'Too many requests. Please wait a moment before trying again.',
      type: 'warning',
      icon: <AlertTriangle className="h-5 w-5" />,
    };
  }

  // Default error
  return {
    title: 'Translation Error',
    message: error,
    type: 'error',
    icon: <AlertCircle className="h-5 w-5" />,
  };
};

export const ErrorDisplay: React.FC<ErrorDisplayProps> = ({ error, onDismiss }) => {
  if (!error) return null;

  const { title, message, type, icon } = getErrorInfo(error);

  const bgColor = type === 'warning' 
    ? 'bg-yellow-50 border-yellow-200' 
    : type === 'info'
    ? 'bg-blue-50 border-blue-200'
    : 'bg-red-50 border-red-200';

  const textColor = type === 'warning'
    ? 'text-yellow-800'
    : type === 'info'
    ? 'text-blue-800'
    : 'text-red-800';

  const iconColor = type === 'warning'
    ? 'text-yellow-600'
    : type === 'info'
    ? 'text-blue-600'
    : 'text-red-600';

  return (
    <div className={`error-display p-4 rounded-lg mb-4 border ${bgColor}`}>
      <div className="flex items-start gap-3">
        <div className={iconColor}>
          {icon}
        </div>
        <div className="flex-1">
          <h4 className={`font-semibold ${textColor}`}>{title}</h4>
          <p className={`text-sm mt-1 ${textColor}`}>{message}</p>
        </div>
        <button 
          onClick={onDismiss}
          className="text-gray-400 hover:text-gray-600 transition-colors duration-200"
          aria-label="Dismiss error"
        >
          <XCircle className="h-5 w-5" />
        </button>
      </div>
    </div>
  );
};

export default ErrorDisplay;
