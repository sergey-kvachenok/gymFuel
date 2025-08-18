import { errorFeedbackManager, ErrorContext } from '../error-feedback';

describe('ErrorFeedbackManager', () => {
  beforeEach(() => {
    // Clear all feedbacks before each test
    errorFeedbackManager.clearFeedbacks();
  });

  describe('Singleton Pattern', () => {
    it('should maintain singleton instance', () => {
      const instance1 = errorFeedbackManager;
      const instance2 = errorFeedbackManager;
      expect(instance1).toBe(instance2);
    });
  });

  describe('Error Feedback', () => {
    it('should add error feedback with default values', () => {
      const context: ErrorContext = {
        operation: 'createProduct',
        tableName: 'products',
        userId: 123,
        error: new Error('Database connection failed'),
      };

      const feedbackId = errorFeedbackManager.addErrorFeedback(context);
      const feedbacks = errorFeedbackManager.getFeedbacks();

      expect(feedbacks).toHaveLength(1);
      expect(feedbacks[0].id).toBe(feedbackId);
      expect(feedbacks[0].type).toBe('error');
      expect(feedbacks[0].title).toBe('Product Creation Failed');
      expect(feedbacks[0].message).toBe(
        'Unable to access local data. Please check your device storage.',
      );
      expect(feedbacks[0].category).toBe('database');
      expect(feedbacks[0].severity).toBe('critical');
      expect(feedbacks[0].dismissible).toBe(true);
    });

    it('should add error feedback with custom options', () => {
      const context: ErrorContext = {
        operation: 'updateProduct',
        tableName: 'products',
        recordId: 456,
        error: new Error('Validation failed'),
      };

      const feedbackId = errorFeedbackManager.addErrorFeedback(context, {
        title: 'Custom Error Title',
        message: 'Custom error message',
        details: 'Custom error details',
        dismissible: false,
        autoDismiss: 5000,
        severity: 'high',
      });

      const feedbacks = errorFeedbackManager.getFeedbacks();
      expect(feedbacks).toHaveLength(1);
      expect(feedbacks[0].title).toBe('Custom Error Title');
      expect(feedbacks[0].message).toBe('Custom error message');
      expect(feedbacks[0].details).toBe('Custom error details');
      expect(feedbacks[0].dismissible).toBe(false);
      expect(feedbacks[0].autoDismiss).toBe(5000);
      expect(feedbacks[0].severity).toBe('high');
    });

    it('should auto-dismiss feedback after specified time', (done) => {
      const context: ErrorContext = {
        operation: 'createProduct',
        error: new Error('Test error'),
      };

      errorFeedbackManager.addErrorFeedback(context, { autoDismiss: 100 });

      setTimeout(() => {
        const feedbacks = errorFeedbackManager.getFeedbacks();
        expect(feedbacks).toHaveLength(0);
        done();
      }, 150);
    });
  });

  describe('Warning Feedback', () => {
    it('should add warning feedback', () => {
      const context: ErrorContext = {
        operation: 'syncData',
        error: new Error('Sync warning'),
      };

      errorFeedbackManager.addWarningFeedback(context);
      const feedbacks = errorFeedbackManager.getFeedbacks();

      expect(feedbacks).toHaveLength(1);
      expect(feedbacks[0].type).toBe('warning');
      expect(feedbacks[0].severity).toBe('medium');
      expect(feedbacks[0].autoDismiss).toBe(10000); // Default 10s for warnings
    });
  });

  describe('Info Feedback', () => {
    it('should add info feedback', () => {
      errorFeedbackManager.addInfoFeedback('Info Title', 'Info message', { autoDismiss: 2000 });

      const feedbacks = errorFeedbackManager.getFeedbacks();
      expect(feedbacks).toHaveLength(1);
      expect(feedbacks[0].type).toBe('info');
      expect(feedbacks[0].title).toBe('Info Title');
      expect(feedbacks[0].message).toBe('Info message');
      expect(feedbacks[0].autoDismiss).toBe(2000);
    });
  });

  describe('Success Feedback', () => {
    it('should add success feedback', () => {
      errorFeedbackManager.addSuccessFeedback('Success Title', 'Success message');

      const feedbacks = errorFeedbackManager.getFeedbacks();
      expect(feedbacks).toHaveLength(1);
      expect(feedbacks[0].type).toBe('success');
      expect(feedbacks[0].title).toBe('Success Title');
      expect(feedbacks[0].message).toBe('Success message');
      expect(feedbacks[0].autoDismiss).toBe(3000); // Default 3s for success
    });
  });

  describe('Feedback Management', () => {
    it('should remove specific feedback', () => {
      const context: ErrorContext = {
        operation: 'createProduct',
        error: new Error('Test error'),
      };

      const feedbackId = errorFeedbackManager.addErrorFeedback(context);
      expect(errorFeedbackManager.getFeedbacks()).toHaveLength(1);

      errorFeedbackManager.removeFeedback(feedbackId);
      expect(errorFeedbackManager.getFeedbacks()).toHaveLength(0);
    });

    it('should clear all feedbacks', () => {
      const context: ErrorContext = {
        operation: 'createProduct',
        error: new Error('Test error'),
      };

      errorFeedbackManager.addErrorFeedback(context);
      errorFeedbackManager.addInfoFeedback('Info', 'Message');
      expect(errorFeedbackManager.getFeedbacks()).toHaveLength(2);

      errorFeedbackManager.clearFeedbacks();
      expect(errorFeedbackManager.getFeedbacks()).toHaveLength(0);
    });

    it('should limit feedbacks to maxFeedbacks', () => {
      const context: ErrorContext = {
        operation: 'createProduct',
        error: new Error('Test error'),
      };

      // Add more feedbacks than the limit (50)
      for (let i = 0; i < 55; i++) {
        errorFeedbackManager.addErrorFeedback(context);
      }

      const feedbacks = errorFeedbackManager.getFeedbacks();
      expect(feedbacks).toHaveLength(50); // Should be limited to maxFeedbacks
    });
  });

  describe('Feedback Filtering', () => {
    beforeEach(() => {
      const context: ErrorContext = {
        operation: 'createProduct',
        error: new Error('Test error'),
      };

      errorFeedbackManager.addErrorFeedback(context);
      errorFeedbackManager.addWarningFeedback(context);
      errorFeedbackManager.addInfoFeedback('Info', 'Message');
      errorFeedbackManager.addSuccessFeedback('Success', 'Message');
    });

    it('should filter feedbacks by type', () => {
      const errorFeedbacks = errorFeedbackManager.getFeedbacksByType('error');
      const warningFeedbacks = errorFeedbackManager.getFeedbacksByType('warning');
      const infoFeedbacks = errorFeedbackManager.getFeedbacksByType('info');
      const successFeedbacks = errorFeedbackManager.getFeedbacksByType('success');

      expect(errorFeedbacks).toHaveLength(1);
      expect(warningFeedbacks).toHaveLength(1);
      expect(infoFeedbacks).toHaveLength(1);
      expect(successFeedbacks).toHaveLength(1);
    });

    it('should filter feedbacks by category', () => {
      const databaseFeedbacks = errorFeedbackManager.getFeedbacksByCategory('database');
      const generalFeedbacks = errorFeedbackManager.getFeedbacksByCategory('general');

      expect(databaseFeedbacks).toHaveLength(2); // error and warning
      expect(generalFeedbacks).toHaveLength(2); // info and success
    });

    it('should filter feedbacks by severity', () => {
      const criticalFeedbacks = errorFeedbackManager.getFeedbacksBySeverity('critical');
      const mediumFeedbacks = errorFeedbackManager.getFeedbacksBySeverity('medium');
      const lowFeedbacks = errorFeedbackManager.getFeedbacksBySeverity('low');

      // Check that we have feedbacks with different severities
      expect(criticalFeedbacks.length + mediumFeedbacks.length + lowFeedbacks.length).toBe(4);
    });
  });

  describe('Subscription System', () => {
    it('should notify subscribers when feedbacks change', (done) => {
      const mockListener = jest.fn();
      const unsubscribe = errorFeedbackManager.subscribe(mockListener);

      const context: ErrorContext = {
        operation: 'createProduct',
        error: new Error('Test error'),
      };

      errorFeedbackManager.addErrorFeedback(context);

      // Use setTimeout to allow for async notification
      setTimeout(() => {
        expect(mockListener).toHaveBeenCalled();
        expect(mockListener.mock.calls[0][0]).toHaveLength(1);
        unsubscribe();
        done();
      }, 0);
    });

    it('should allow unsubscribing', () => {
      const mockListener = jest.fn();
      const unsubscribe = errorFeedbackManager.subscribe(mockListener);

      const context: ErrorContext = {
        operation: 'createProduct',
        error: new Error('Test error'),
      };

      unsubscribe();
      errorFeedbackManager.addErrorFeedback(context);

      expect(mockListener).not.toHaveBeenCalled();
    });
  });

  describe('Error Message Generation', () => {
    it('should generate appropriate error messages for different error types', () => {
      const errorTypes = [
        {
          error: new Error('Database connection failed'),
          expected: 'Unable to access local data. Please check your device storage.',
        },
        {
          error: new Error('QuotaExceededError'),
          expected: 'Storage space is full. Please free up some space and try again.',
        },
        {
          error: new Error('Product with id 123 not found'),
          expected: 'The requested item could not be found.',
        },
        {
          error: new Error('Validation failed'),
          expected: 'The data you entered is invalid. Please check your input and try again.',
        },
        {
          error: new Error('Network connection failed'),
          expected:
            "Network connection is unavailable. Your data will be saved locally and synced when you're back online.",
        },
        {
          error: new Error('Sync failed'),
          expected:
            'Unable to sync with the server. Your data is saved locally and will sync when possible.',
        },
      ];

      errorTypes.forEach(({ error, expected }) => {
        const message = errorFeedbackManager.getOperationErrorMessage('createProduct', error);
        expect(message).toBe(expected);
      });
    });

    it('should generate actionable error messages with suggestions', () => {
      const error = new Error('Database connection failed');
      const actionable = errorFeedbackManager.getActionableErrorMessage('createProduct', error);

      expect(actionable.message).toBe(
        'Unable to access local data. Please check your device storage.',
      );
      expect(actionable.suggestions).toContain('Check if your device has sufficient storage space');
      expect(actionable.suggestions).toContain('Try refreshing the page');
      expect(actionable.suggestions).toContain('Clear browser cache and try again');
    });
  });

  describe('Operation Title Mapping', () => {
    it('should generate appropriate titles for different operations', () => {
      const operations = [
        { operation: 'createProduct', expected: 'Product Creation Failed' },
        { operation: 'updateProduct', expected: 'Product Update Failed' },
        { operation: 'deleteProduct', expected: 'Product Deletion Failed' },
        { operation: 'getProducts', expected: 'Failed to Load Products' },
        { operation: 'createConsumption', expected: 'Consumption Creation Failed' },
        { operation: 'updateConsumption', expected: 'Consumption Update Failed' },
        { operation: 'deleteConsumption', expected: 'Consumption Deletion Failed' },
        { operation: 'getConsumptions', expected: 'Failed to Load Consumptions' },
        { operation: 'createNutritionGoals', expected: 'Goals Creation Failed' },
        { operation: 'updateNutritionGoals', expected: 'Goals Update Failed' },
        { operation: 'getNutritionGoals', expected: 'Failed to Load Goals' },
        { operation: 'markAsSynced', expected: 'Sync Failed' },
        { operation: 'markAsSyncError', expected: 'Sync Error' },
        { operation: 'validateAndRepairDataIntegrity', expected: 'Data Integrity Issue' },
        { operation: 'unknownOperation', expected: 'Operation Failed' },
      ];

      operations.forEach(({ operation, expected }) => {
        const context: ErrorContext = {
          operation,
          error: new Error('Test error'),
        };

        const feedbackId = errorFeedbackManager.addErrorFeedback(context);
        const feedbacks = errorFeedbackManager.getFeedbacks();
        const feedback = feedbacks.find((f) => f.id === feedbackId);

        expect(feedback?.title).toBe(expected);
      });
    });
  });

  describe('Category Classification', () => {
    it('should classify operations into appropriate categories', () => {
      const testCases = [
        { operation: 'createProduct', expectedCategory: 'database' },
        { operation: 'createConsumption', expectedCategory: 'database' },
        { operation: 'createNutritionGoals', expectedCategory: 'database' },
        { operation: 'markAsSynced', expectedCategory: 'sync' },
        { operation: 'markAsSyncError', expectedCategory: 'sync' },
        { operation: 'unknownOperation', expectedCategory: 'general' },
      ];

      testCases.forEach(({ operation, expectedCategory }) => {
        const context: ErrorContext = {
          operation,
          error: new Error('Test error'),
        };

        const feedbackId = errorFeedbackManager.addErrorFeedback(context);
        const feedbacks = errorFeedbackManager.getFeedbacks();
        const feedback = feedbacks.find((f) => f.id === feedbackId);

        expect(feedback?.category).toBe(expectedCategory);
      });
    });
  });

  describe('Severity Classification', () => {
    it('should classify errors by severity', () => {
      const testCases = [
        { error: new Error('QuotaExceededError'), expectedSeverity: 'critical' },
        { error: new Error('Database connection failed'), expectedSeverity: 'critical' },
        { error: new Error('Product with id 123 not found'), expectedSeverity: 'medium' },
        { error: new Error('Validation failed'), expectedSeverity: 'medium' },
        { error: new Error('Network connection failed'), expectedSeverity: 'low' },
        { error: new Error('Sync failed'), expectedSeverity: 'low' },
        { error: new Error('Unknown error'), expectedSeverity: 'medium' },
      ];

      testCases.forEach(({ error, expectedSeverity }) => {
        const context: ErrorContext = {
          operation: 'createProduct',
          error,
        };

        const feedbackId = errorFeedbackManager.addErrorFeedback(context);
        const feedbacks = errorFeedbackManager.getFeedbacks();
        const feedback = feedbacks.find((f) => f.id === feedbackId);

        expect(feedback?.severity).toBe(expectedSeverity);
      });
    });
  });
});
