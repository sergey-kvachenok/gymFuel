export interface ErrorFeedback {
  id: string;
  type: 'error' | 'warning' | 'info' | 'success';
  title: string;
  message: string;
  details?: string;
  action?: {
    label: string;
    onClick: () => void;
  };
  dismissible: boolean;
  autoDismiss?: number; // milliseconds
  timestamp: Date;
  category: 'database' | 'sync' | 'validation' | 'network' | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
}

export interface ErrorContext {
  operation: string;
  tableName?: string;
  userId?: number;
  recordId?: number;
  data?: unknown;
  error: Error;
}

export class ErrorFeedbackManager {
  private static instance: ErrorFeedbackManager | null = null;
  private feedbacks: ErrorFeedback[] = [];
  private listeners: Set<(feedbacks: ErrorFeedback[]) => void> = new Set();
  private maxFeedbacks = 50;

  static getInstance(): ErrorFeedbackManager {
    if (!ErrorFeedbackManager.instance) {
      ErrorFeedbackManager.instance = new ErrorFeedbackManager();
    }
    return ErrorFeedbackManager.instance;
  }

  // Add error feedback
  addErrorFeedback(
    context: ErrorContext,
    options?: {
      title?: string;
      message?: string;
      details?: string;
      action?: { label: string; onClick: () => void };
      dismissible?: boolean;
      autoDismiss?: number;
      severity?: 'low' | 'medium' | 'high' | 'critical';
    },
  ): string {
    const feedback: ErrorFeedback = {
      id: this.generateId(),
      type: 'error',
      title: options?.title || this.getDefaultTitle(context),
      message: options?.message || this.getDefaultMessage(context),
      details: options?.details || this.getDefaultDetails(context),
      action: options?.action,
      dismissible: options?.dismissible ?? true,
      autoDismiss: options?.autoDismiss,
      timestamp: new Date(),
      category: this.getCategory(context),
      severity: options?.severity || this.getSeverity(context),
    };

    this.feedbacks.unshift(feedback); // Add to beginning

    // Keep only the last maxFeedbacks
    if (this.feedbacks.length > this.maxFeedbacks) {
      this.feedbacks = this.feedbacks.slice(0, this.maxFeedbacks);
    }

    // Auto-dismiss if specified
    if (feedback.autoDismiss) {
      setTimeout(() => {
        this.removeFeedback(feedback.id);
      }, feedback.autoDismiss);
    }

    this.notifyListeners();
    return feedback.id;
  }

  // Add warning feedback
  addWarningFeedback(
    context: ErrorContext,
    options?: {
      title?: string;
      message?: string;
      details?: string;
      action?: { label: string; onClick: () => void };
      dismissible?: boolean;
      autoDismiss?: number;
    },
  ): string {
    const feedback: ErrorFeedback = {
      id: this.generateId(),
      type: 'warning',
      title: options?.title || this.getDefaultTitle(context),
      message: options?.message || this.getDefaultMessage(context),
      details: options?.details || this.getDefaultDetails(context),
      action: options?.action,
      dismissible: options?.dismissible ?? true,
      autoDismiss: options?.autoDismiss || 10000, // Auto-dismiss warnings after 10s
      timestamp: new Date(),
      category: this.getCategory(context),
      severity: 'medium',
    };

    this.feedbacks.unshift(feedback);
    this.notifyListeners();

    if (feedback.autoDismiss) {
      setTimeout(() => {
        this.removeFeedback(feedback.id);
      }, feedback.autoDismiss);
    }

    return feedback.id;
  }

  // Add info feedback
  addInfoFeedback(
    title: string,
    message: string,
    options?: {
      details?: string;
      action?: { label: string; onClick: () => void };
      dismissible?: boolean;
      autoDismiss?: number;
    },
  ): string {
    const feedback: ErrorFeedback = {
      id: this.generateId(),
      type: 'info',
      title,
      message,
      details: options?.details,
      action: options?.action,
      dismissible: options?.dismissible ?? true,
      autoDismiss: options?.autoDismiss || 5000, // Auto-dismiss info after 5s
      timestamp: new Date(),
      category: 'general',
      severity: 'low',
    };

    this.feedbacks.unshift(feedback);
    this.notifyListeners();

    if (feedback.autoDismiss) {
      setTimeout(() => {
        this.removeFeedback(feedback.id);
      }, feedback.autoDismiss);
    }

    return feedback.id;
  }

  // Add success feedback
  addSuccessFeedback(
    title: string,
    message: string,
    options?: {
      details?: string;
      action?: { label: string; onClick: () => void };
      dismissible?: boolean;
      autoDismiss?: number;
    },
  ): string {
    const feedback: ErrorFeedback = {
      id: this.generateId(),
      type: 'success',
      title,
      message,
      details: options?.details,
      action: options?.action,
      dismissible: options?.dismissible ?? true,
      autoDismiss: options?.autoDismiss || 3000, // Auto-dismiss success after 3s
      timestamp: new Date(),
      category: 'general',
      severity: 'low',
    };

    this.feedbacks.unshift(feedback);
    this.notifyListeners();

    if (feedback.autoDismiss) {
      setTimeout(() => {
        this.removeFeedback(feedback.id);
      }, feedback.autoDismiss);
    }

    return feedback.id;
  }

  // Remove feedback
  removeFeedback(id: string): void {
    this.feedbacks = this.feedbacks.filter((f) => f.id !== id);
    this.notifyListeners();
  }

  // Clear all feedbacks
  clearFeedbacks(): void {
    this.feedbacks = [];
    this.notifyListeners();
  }

  // Get all feedbacks
  getFeedbacks(): ErrorFeedback[] {
    return [...this.feedbacks];
  }

  // Get feedbacks by type
  getFeedbacksByType(type: ErrorFeedback['type']): ErrorFeedback[] {
    return this.feedbacks.filter((f) => f.type === type);
  }

  // Get feedbacks by category
  getFeedbacksByCategory(category: ErrorFeedback['category']): ErrorFeedback[] {
    return this.feedbacks.filter((f) => f.category === category);
  }

  // Get feedbacks by severity
  getFeedbacksBySeverity(severity: ErrorFeedback['severity']): ErrorFeedback[] {
    return this.feedbacks.filter((f) => f.severity === severity);
  }

  // Subscribe to feedback changes
  subscribe(listener: (feedbacks: ErrorFeedback[]) => void): () => void {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  }

  // Notify listeners
  private notifyListeners(): void {
    this.listeners.forEach((listener) => listener([...this.feedbacks]));
  }

  // Generate unique ID
  private generateId(): string {
    return `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  // Get default title based on context
  private getDefaultTitle(context: ErrorContext): string {
    const operationMap: Record<string, string> = {
      createProduct: 'Product Creation Failed',
      updateProduct: 'Product Update Failed',
      deleteProduct: 'Product Deletion Failed',
      getProducts: 'Failed to Load Products',
      createConsumption: 'Consumption Creation Failed',
      updateConsumption: 'Consumption Update Failed',
      deleteConsumption: 'Consumption Deletion Failed',
      getConsumptions: 'Failed to Load Consumptions',
      createNutritionGoals: 'Goals Creation Failed',
      updateNutritionGoals: 'Goals Update Failed',
      getNutritionGoals: 'Failed to Load Goals',
      markAsSynced: 'Sync Failed',
      markAsSyncError: 'Sync Error',
      validateAndRepairDataIntegrity: 'Data Integrity Issue',
    };

    return operationMap[context.operation] || 'Operation Failed';
  }

  // Get default message based on context
  private getDefaultMessage(context: ErrorContext): string {
    const errorMessage = context.error.message.toLowerCase();

    if (errorMessage.includes('database connection failed')) {
      return 'Unable to access local data. Please check your device storage.';
    }

    if (errorMessage.includes('quota exceeded') || errorMessage.includes('quotaexceedederror')) {
      return 'Storage space is full. Please free up some space and try again.';
    }

    if (errorMessage.includes('not found')) {
      return 'The requested item could not be found.';
    }

    if (errorMessage.includes('validation')) {
      return 'The data you entered is invalid. Please check your input and try again.';
    }

    if (errorMessage.includes('network') || errorMessage.includes('connection')) {
      return "Network connection is unavailable. Your data will be saved locally and synced when you're back online.";
    }

    if (errorMessage.includes('sync')) {
      return 'Unable to sync with the server. Your data is saved locally and will sync when possible.';
    }

    return 'An unexpected error occurred. Please try again.';
  }

  // Get default details based on context
  private getDefaultDetails(context: ErrorContext): string {
    return `Operation: ${context.operation}\nError: ${context.error.message}`;
  }

  // Get category based on context
  private getCategory(context: ErrorContext): ErrorFeedback['category'] {
    if (context.operation.includes('sync') || context.operation.includes('Sync')) {
      return 'sync';
    }

    if (
      context.operation.includes('Product') ||
      context.operation.includes('Consumption') ||
      context.operation.includes('Goals')
    ) {
      return 'database';
    }

    if (context.error.message.toLowerCase().includes('validation')) {
      return 'validation';
    }

    if (
      context.error.message.toLowerCase().includes('network') ||
      context.error.message.toLowerCase().includes('connection')
    ) {
      return 'network';
    }

    return 'general';
  }

  // Get severity based on context
  private getSeverity(context: ErrorContext): ErrorFeedback['severity'] {
    const errorMessage = context.error.message.toLowerCase();

    if (
      errorMessage.includes('quota exceeded') ||
      errorMessage.includes('quotaexceedederror') ||
      errorMessage.includes('database connection failed')
    ) {
      return 'critical';
    }

    if (errorMessage.includes('not found') || errorMessage.includes('validation')) {
      return 'medium';
    }

    if (errorMessage.includes('network') || errorMessage.includes('sync')) {
      return 'low';
    }

    return 'medium';
  }

  // Get user-friendly error message for specific operations
  getOperationErrorMessage(operation: string, error: Error): string {
    const context: ErrorContext = { operation, error };
    return this.getDefaultMessage(context);
  }

  // Get actionable error message with suggestions
  getActionableErrorMessage(
    operation: string,
    error: Error,
  ): {
    message: string;
    suggestions: string[];
  } {
    const errorMessage = error.message.toLowerCase();
    const suggestions: string[] = [];

    if (errorMessage.includes('database connection failed')) {
      suggestions.push('Check if your device has sufficient storage space');
      suggestions.push('Try refreshing the page');
      suggestions.push('Clear browser cache and try again');
    } else if (errorMessage.includes('quota exceeded')) {
      suggestions.push('Delete some old data to free up space');
      suggestions.push('Clear browser storage');
      suggestions.push('Export and delete old records');
    } else if (errorMessage.includes('validation')) {
      suggestions.push('Check that all required fields are filled');
      suggestions.push('Ensure numeric values are positive numbers');
      suggestions.push('Verify date formats are correct');
    } else if (errorMessage.includes('network')) {
      suggestions.push('Check your internet connection');
      suggestions.push('Your data is saved locally and will sync when online');
      suggestions.push('Try again when you have a stable connection');
    } else if (errorMessage.includes('sync')) {
      suggestions.push('Your data is saved locally');
      suggestions.push('Sync will retry automatically when possible');
      suggestions.push('Check your internet connection');
    } else {
      suggestions.push('Try refreshing the page');
      suggestions.push('Check your internet connection');
      suggestions.push('Contact support if the problem persists');
    }

    return {
      message: this.getOperationErrorMessage(operation, error),
      suggestions,
    };
  }
}

export const errorFeedbackManager = ErrorFeedbackManager.getInstance();
