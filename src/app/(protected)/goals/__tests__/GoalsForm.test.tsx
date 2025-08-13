import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GoalsForm from '../GoalsForm';
import { GoalType } from '../types';

// Mock tRPC
jest.mock('../../../../lib/trpc-client', () => ({
  trpc: {
    goals: {
      get: {
        useQuery: jest.fn(),
      },
      getRecommendations: {
        useQuery: jest.fn(),
      },
      upsert: {
        useMutation: jest.fn(),
      },
      delete: {
        useMutation: jest.fn(),
      },
    },
    useUtils: jest.fn(),
  },
}));

// Mock useOnlineStatus
jest.mock('../../../../hooks/use-online-status', () => ({
  useOnlineStatus: jest.fn(),
}));

// Mock UnifiedDataService
jest.mock('../../../../lib/unified-data-service', () => ({
  UnifiedDataService: {
    getInstance: jest.fn(),
  },
}));

const MockTrpc = require('../../../../lib/trpc-client').trpc;
const MockUseOnlineStatus = require('../../../../hooks/use-online-status').useOnlineStatus;
const MockUnifiedDataService = require('../../../../lib/unified-data-service').UnifiedDataService;

describe('GoalsForm', () => {
  let mockDataService: any;
  let mockSaveGoalsMutation: any;
  let mockDeleteGoalsMutation: any;
  let mockGetQuery: any;
  let mockGetRecommendationsQuery: any;
  let mockUtils: any;

  beforeEach(() => {
    jest.clearAllMocks();

    mockDataService = {
      createNutritionGoals: jest.fn(),
      updateNutritionGoals: jest.fn(),
    };

    mockSaveGoalsMutation = {
      mutate: jest.fn(),
      isPending: false,
      error: null,
    };

    mockDeleteGoalsMutation = {
      mutate: jest.fn(),
      isPending: false,
      error: null,
    };

    mockGetQuery = {
      data: null,
      isLoading: false,
    };

    mockGetRecommendationsQuery = {
      data: null,
      isLoading: false,
    };

    mockUtils = {
      goals: {
        get: {
          invalidate: jest.fn(),
        },
      },
    };

    MockUnifiedDataService.getInstance = jest.fn().mockReturnValue(mockDataService);
    MockUseOnlineStatus.mockReturnValue(true);
    MockTrpc.goals.get.useQuery.mockReturnValue(mockGetQuery);
    MockTrpc.goals.getRecommendations.useQuery.mockReturnValue(mockGetRecommendationsQuery);
    MockTrpc.goals.upsert.useMutation.mockReturnValue(mockSaveGoalsMutation);
    MockTrpc.goals.delete.useMutation.mockReturnValue(mockDeleteGoalsMutation);
    MockTrpc.useUtils.mockReturnValue(mockUtils);
  });

  const defaultProps = {
    userId: 1,
  };

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<GoalsForm {...defaultProps} />);

      expect(screen.getByTestId('goals-form')).toBeInTheDocument();
      expect(screen.getByTestId('goals-dailyCalories')).toBeInTheDocument();
      expect(screen.getByTestId('goals-dailyProtein')).toBeInTheDocument();
      expect(screen.getByTestId('goals-dailyFat')).toBeInTheDocument();
      expect(screen.getByTestId('goals-dailyCarbs')).toBeInTheDocument();
      expect(screen.getByTestId('goals-goalType')).toBeInTheDocument();
      expect(screen.getByTestId('goals-submit')).toBeInTheDocument();
    });

    it('should show loading state when submitting', () => {
      mockSaveGoalsMutation.isPending = true;
      render(<GoalsForm {...defaultProps} />);

      const submitButton = screen.getByTestId('goals-submit');
      expect(submitButton).toHaveTextContent('Saving...');
      expect(submitButton).toBeDisabled();
    });

    it('should show "Set Your Goals" when no current goals', () => {
      render(<GoalsForm {...defaultProps} />);

      expect(screen.getByText('Set Your Goals')).toBeInTheDocument();
    });

    it('should show "Edit Your Goals" when current goals exist', () => {
      mockGetQuery.data = {
        id: 1,
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyFat: 65,
        dailyCarbs: 250,
        goalType: GoalType.Maintain,
      };

      render(<GoalsForm {...defaultProps} />);

      expect(screen.getByText('Edit Your Goals')).toBeInTheDocument();
    });

    it('should show loading state when fetching goals', () => {
      mockGetQuery.isLoading = true;
      render(<GoalsForm {...defaultProps} />);

      expect(screen.getByText('Loading...')).toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should update form data when fields change', () => {
      render(<GoalsForm {...defaultProps} />);

      const caloriesInput = screen.getByTestId('goals-dailyCalories');
      const proteinInput = screen.getByTestId('goals-dailyProtein');

      fireEvent.change(caloriesInput, { target: { value: '2500' } });
      fireEvent.change(proteinInput, { target: { value: '180' } });

      expect(caloriesInput).toHaveValue(2500);
      expect(proteinInput).toHaveValue(180);
    });

    it('should update goal type when changed', () => {
      render(<GoalsForm {...defaultProps} />);

      const goalTypeSelect = screen.getByTestId('goals-goalType');
      fireEvent.change(goalTypeSelect, { target: { value: GoalType.Lose } });

      expect(goalTypeSelect).toHaveValue(GoalType.Lose);
    });

    it('should call save mutation when form is submitted online', async () => {
      render(<GoalsForm {...defaultProps} />);

      const form = screen.getByTestId('goals-form').querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockSaveGoalsMutation.mutate).toHaveBeenCalled();
      });
    });
  });

  describe('Online Mode', () => {
    it('should use tRPC mutation when online', async () => {
      MockUseOnlineStatus.mockReturnValue(true);
      render(<GoalsForm {...defaultProps} />);

      const form = screen.getByTestId('goals-form').querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockSaveGoalsMutation.mutate).toHaveBeenCalled();
      });
    });

    it('should show delete button when goals exist', () => {
      mockGetQuery.data = {
        id: 1,
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyFat: 65,
        dailyCarbs: 250,
        goalType: GoalType.Maintain,
      };

      render(<GoalsForm {...defaultProps} />);

      expect(screen.getByText('Delete Goals')).toBeInTheDocument();
    });

    it('should call delete mutation when delete button is clicked', () => {
      mockGetQuery.data = {
        id: 1,
        dailyCalories: 2000,
        dailyProtein: 150,
        dailyFat: 65,
        dailyCarbs: 250,
        goalType: GoalType.Maintain,
      };

      render(<GoalsForm {...defaultProps} />);

      const deleteButton = screen.getByText('Delete Goals');
      fireEvent.click(deleteButton);

      expect(mockDeleteGoalsMutation.mutate).toHaveBeenCalled();
    });
  });

  describe('Offline Mode', () => {
    beforeEach(() => {
      MockUseOnlineStatus.mockReturnValue(false);
    });

    it('should use UnifiedDataService when offline', async () => {
      mockDataService.createNutritionGoals.mockResolvedValue({});

      render(<GoalsForm {...defaultProps} />);

      // Fill in valid form data
      const caloriesInput = screen.getByTestId('goals-dailyCalories');
      const proteinInput = screen.getByTestId('goals-dailyProtein');
      const fatInput = screen.getByTestId('goals-dailyFat');
      const carbsInput = screen.getByTestId('goals-dailyCarbs');

      fireEvent.change(caloriesInput, { target: { value: '2000' } });
      fireEvent.change(proteinInput, { target: { value: '150' } });
      fireEvent.change(fatInput, { target: { value: '65' } });
      fireEvent.change(carbsInput, { target: { value: '250' } });

      const form = screen.getByTestId('goals-form').querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockDataService.createNutritionGoals).toHaveBeenCalled();
      });
    });

    it('should handle offline save errors', async () => {
      mockDataService.createNutritionGoals.mockRejectedValue(new Error('Offline error'));

      // Mock alert
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<GoalsForm {...defaultProps} />);

      const form = screen.getByTestId('goals-form').querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith(
          expect.stringContaining('Error saving goals offline'),
        );
      });

      mockAlert.mockRestore();
    });

    it('should require user authentication for offline save', async () => {
      // Mock alert
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<GoalsForm userId={null} />);

      const form = screen.getByTestId('goals-form').querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('User not authenticated');
      });

      mockAlert.mockRestore();
    });
  });

  describe('Form Validation', () => {
    it('should have proper input attributes', () => {
      render(<GoalsForm {...defaultProps} />);

      const caloriesInput = screen.getByTestId('goals-dailyCalories');
      expect(caloriesInput).toHaveAttribute('type', 'number');
      expect(caloriesInput).toHaveAttribute('min', '500');
      expect(caloriesInput).toHaveAttribute('max', '10000');
      expect(caloriesInput).toHaveAttribute('step', '1');
      expect(caloriesInput).toHaveAttribute('required');
    });

    it('should have proper goal type options', () => {
      render(<GoalsForm {...defaultProps} />);

      const goalTypeSelect = screen.getByTestId('goals-goalType');
      expect(goalTypeSelect).toHaveValue(GoalType.Maintain);

      const options = goalTypeSelect.querySelectorAll('option');
      expect(options).toHaveLength(3);
      expect(options[0]).toHaveValue(GoalType.Maintain);
      expect(options[1]).toHaveValue(GoalType.Lose);
      expect(options[2]).toHaveValue(GoalType.Gain);
    });
  });

  describe('Recommendations', () => {
    it('should show recommendations when available', () => {
      mockGetRecommendationsQuery.data = {
        dailyCalories: 2200,
        dailyProtein: 165,
        dailyFat: 73,
        dailyCarbs: 275,
        goalType: GoalType.Lose,
      };

      render(<GoalsForm {...defaultProps} />);

      // The RecommendationForm component should be rendered
      expect(screen.getByTestId('goals-form')).toBeInTheDocument();
    });

    it('should handle recommendation loading state', () => {
      mockGetRecommendationsQuery.isLoading = true;

      render(<GoalsForm {...defaultProps} />);

      // The form should still render even when recommendations are loading
      expect(screen.getByTestId('goals-form')).toBeInTheDocument();
    });
  });

  describe('Navigation', () => {
    it('should have back to dashboard link', () => {
      render(<GoalsForm {...defaultProps} />);

      const backLink = screen.getByText('Back to Dashboard');
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/');
    });
  });
});
