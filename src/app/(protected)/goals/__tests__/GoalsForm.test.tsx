import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import GoalsForm from '../GoalsForm';
import { GoalType } from '../types';

// Mock UnifiedDataService
jest.mock('../../../../lib/unified-data-service', () => ({
  UnifiedDataService: {
    getInstance: jest.fn(),
  },
}));

// Mock useNutritionGoals hook
jest.mock('../../../../hooks/use-nutrition-goals', () => ({
  useNutritionGoals: jest.fn(),
}));

const MockUnifiedDataService = jest.requireMock(
  '../../../../lib/unified-data-service',
).UnifiedDataService;
const MockUseNutritionGoals = jest.requireMock(
  '../../../../hooks/use-nutrition-goals',
).useNutritionGoals;

describe('GoalsForm', () => {
  let mockDataService: {
    createNutritionGoals: jest.MockedFunction<(data: unknown) => Promise<unknown>>;
    updateNutritionGoals: jest.MockedFunction<(id: number, data: unknown) => Promise<unknown>>;
    getNutritionGoals: jest.MockedFunction<(userId: number) => Promise<unknown>>;
  };

  beforeEach(() => {
    jest.clearAllMocks();

    mockDataService = {
      createNutritionGoals: jest.fn(),
      updateNutritionGoals: jest.fn(),
      getNutritionGoals: jest.fn(),
    };

    MockUnifiedDataService.getInstance = jest.fn().mockReturnValue(mockDataService);

    // Default mock for useNutritionGoals
    MockUseNutritionGoals.mockReturnValue({
      data: null,
      isLoading: false,
      error: null,
    });
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

    it('should show "Set Your Goals" when no current goals', () => {
      render(<GoalsForm {...defaultProps} />);

      expect(screen.getByText('Set Your Goals')).toBeInTheDocument();
    });

    it('should show "Edit Your Goals" when current goals exist', () => {
      MockUseNutritionGoals.mockReturnValue({
        data: {
          id: 1,
          dailyCalories: 2000,
          dailyProtein: 150,
          dailyFat: 65,
          dailyCarbs: 250,
          goalType: GoalType.Maintain,
        },
        isLoading: false,
        error: null,
      });

      render(<GoalsForm {...defaultProps} />);

      expect(screen.getByText('Edit Your Goals')).toBeInTheDocument();
    });

    it('should show loading state when fetching goals', () => {
      MockUseNutritionGoals.mockReturnValue({
        data: null,
        isLoading: true,
        error: null,
      });

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

    it('should call createNutritionGoals when form is submitted with no existing goals', async () => {
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
        expect(mockDataService.createNutritionGoals).toHaveBeenCalledWith({
          dailyCalories: 2000,
          dailyProtein: 150,
          dailyFat: 65,
          dailyCarbs: 250,
          goalType: GoalType.Maintain,
          userId: 1,
        });
      });
    });

    it('should call updateNutritionGoals when form is submitted with existing goals', async () => {
      mockDataService.updateNutritionGoals.mockResolvedValue({});

      MockUseNutritionGoals.mockReturnValue({
        data: {
          id: 1,
          dailyCalories: 2000,
          dailyProtein: 150,
          dailyFat: 65,
          dailyCarbs: 250,
          goalType: GoalType.Maintain,
        },
        isLoading: false,
        error: null,
      });

      render(<GoalsForm {...defaultProps} />);

      const form = screen.getByTestId('goals-form').querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockDataService.updateNutritionGoals).toHaveBeenCalledWith(1, {
          dailyCalories: 2000,
          dailyProtein: 150,
          dailyFat: 65,
          dailyCarbs: 250,
          goalType: GoalType.Maintain,
          userId: 1,
        });
      });
    });
  });

  describe('Error Handling', () => {
    it('should handle save errors', async () => {
      mockDataService.createNutritionGoals.mockRejectedValue(new Error('Save failed'));

      // Mock alert
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<GoalsForm {...defaultProps} />);

      const form = screen.getByTestId('goals-form').querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Error saving goals: Save failed');
      });

      mockAlert.mockRestore();
    });

    it('should require user authentication for save', async () => {
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

    it('should show success message when save succeeds', async () => {
      mockDataService.createNutritionGoals.mockResolvedValue({});

      // Mock alert
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<GoalsForm {...defaultProps} />);

      const form = screen.getByTestId('goals-form').querySelector('form');
      fireEvent.submit(form!);

      await waitFor(() => {
        expect(mockAlert).toHaveBeenCalledWith('Goals saved successfully!');
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

  describe('Navigation', () => {
    it('should have back to dashboard link', () => {
      render(<GoalsForm {...defaultProps} />);

      const backLink = screen.getByText('Back to Dashboard');
      expect(backLink).toBeInTheDocument();
      expect(backLink).toHaveAttribute('href', '/');
    });
  });

  describe('Delete Functionality', () => {
    it('should show delete button when goals exist', () => {
      MockUseNutritionGoals.mockReturnValue({
        data: {
          id: 1,
          dailyCalories: 2000,
          dailyProtein: 150,
          dailyFat: 65,
          dailyCarbs: 250,
          goalType: GoalType.Maintain,
        },
        isLoading: false,
        error: null,
      });

      render(<GoalsForm {...defaultProps} />);

      expect(screen.getByText('Delete Goals')).toBeInTheDocument();
    });

    it('should show alert when delete button is clicked', () => {
      MockUseNutritionGoals.mockReturnValue({
        data: {
          id: 1,
          dailyCalories: 2000,
          dailyProtein: 150,
          dailyFat: 65,
          dailyCarbs: 250,
          goalType: GoalType.Maintain,
        },
        isLoading: false,
        error: null,
      });

      // Mock alert
      const mockAlert = jest.spyOn(window, 'alert').mockImplementation(() => {});

      render(<GoalsForm {...defaultProps} />);

      const deleteButton = screen.getByText('Delete Goals');
      fireEvent.click(deleteButton);

      expect(mockAlert).toHaveBeenCalledWith(
        'Delete functionality not implemented in simplified version',
      );

      mockAlert.mockRestore();
    });
  });
});
