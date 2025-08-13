import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { ConsumptionForm } from '../ConsumptionForm';
import { ProductOption } from '../ProductCombobox';

// Mock the ProductCombobox component
jest.mock('../ProductCombobox', () => ({
  ProductCombobox: ({ value, onChange, userId }: any) => (
    <div data-testid="product-combobox">
      <select
        data-testid="product-select"
        value={value?.id || ''}
        onChange={(e) => {
          const product = e.target.value
            ? { id: parseInt(e.target.value), name: 'Test Product' }
            : null;
          onChange(product);
        }}
      >
        <option value="">Select a product</option>
        <option value="1">Test Product 1</option>
        <option value="2">Test Product 2</option>
      </select>
    </div>
  ),
  ProductOption: {} as ProductOption,
}));

describe('ConsumptionForm', () => {
  const defaultProps = {
    submitConsumption: jest.fn(),
    selectedProduct: null,
    setSelectedProduct: jest.fn(),
    amount: undefined,
    error: '',
    isPending: false,
    isProductsPresented: true,
    onAmountChange: jest.fn(),
    userId: 1,
  };

  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('Form Rendering', () => {
    it('should render all form fields when products are available', () => {
      render(<ConsumptionForm {...defaultProps} />);

      expect(screen.getByTestId('consumption-form')).toBeInTheDocument();
      expect(screen.getByTestId('product-combobox')).toBeInTheDocument();
      expect(screen.getByTestId('consumption-amount')).toBeInTheDocument();
      expect(screen.getByTestId('consumption-submit')).toBeInTheDocument();
      expect(screen.getByText("Add to Today's Meals")).toBeInTheDocument();
    });

    it('should show loading state when submitting', () => {
      render(<ConsumptionForm {...defaultProps} isPending={true} />);

      const submitButton = screen.getByTestId('consumption-submit');
      expect(submitButton).toBeInTheDocument();
      expect(submitButton).toHaveTextContent('Adding...');
      expect(submitButton).toBeDisabled();
    });

    it('should show message when no products are available', () => {
      render(<ConsumptionForm {...defaultProps} isProductsPresented={false} />);

      expect(
        screen.getByText(
          'No products available. Add some products first to track your consumption.',
        ),
      ).toBeInTheDocument();
      expect(screen.queryByTestId('product-combobox')).not.toBeInTheDocument();
      expect(screen.queryByTestId('consumption-amount')).not.toBeInTheDocument();
      expect(screen.queryByTestId('consumption-submit')).not.toBeInTheDocument();
    });
  });

  describe('Form Interaction', () => {
    it('should call submitConsumption when form is submitted', () => {
      const mockSubmitConsumption = jest.fn();
      render(<ConsumptionForm {...defaultProps} submitConsumption={mockSubmitConsumption} />);

      const form = screen.getByTestId('consumption-form').querySelector('form');
      fireEvent.submit(form!);

      expect(mockSubmitConsumption).toHaveBeenCalled();
    });

    it('should call onAmountChange when amount input changes', () => {
      const mockOnAmountChange = jest.fn();
      render(<ConsumptionForm {...defaultProps} onAmountChange={mockOnAmountChange} />);

      const amountInput = screen.getByTestId('consumption-amount');
      fireEvent.change(amountInput, { target: { value: '100' } });

      expect(mockOnAmountChange).toHaveBeenCalled();
    });

    it('should display selected product in combobox', () => {
      const selectedProduct = { id: 1, name: 'Test Product 1' };
      render(<ConsumptionForm {...defaultProps} selectedProduct={selectedProduct} />);

      const productSelect = screen.getByTestId('product-select');
      expect(productSelect).toHaveValue('1');
    });

    it('should display amount value in input', () => {
      render(<ConsumptionForm {...defaultProps} amount={150} />);

      const amountInput = screen.getByTestId('consumption-amount');
      expect(amountInput).toHaveValue(150);
    });
  });

  describe('Error Handling', () => {
    it('should display error message when error is present', () => {
      const errorMessage = 'Please select a product and enter a valid amount';
      render(<ConsumptionForm {...defaultProps} error={errorMessage} />);

      expect(screen.getByTestId('error-message')).toBeInTheDocument();
      expect(screen.getByText(errorMessage)).toBeInTheDocument();
    });

    it('should not display error message when no error', () => {
      render(<ConsumptionForm {...defaultProps} error="" />);

      expect(screen.queryByTestId('error-message')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should be able to submit form with valid data', () => {
      const mockSubmitConsumption = jest.fn();
      const selectedProduct = { id: 1, name: 'Test Product 1' };

      render(
        <ConsumptionForm
          {...defaultProps}
          submitConsumption={mockSubmitConsumption}
          selectedProduct={selectedProduct}
          amount={100}
        />,
      );

      const form = screen.getByTestId('consumption-form').querySelector('form');
      fireEvent.submit(form!);

      expect(mockSubmitConsumption).toHaveBeenCalled();
    });

    it('should show submit button as enabled when not pending', () => {
      render(<ConsumptionForm {...defaultProps} />);

      const submitButton = screen.getByTestId('consumption-submit');
      expect(submitButton).toBeEnabled();
      expect(submitButton).toHaveTextContent('Add to Meals');
    });
  });

  describe('Accessibility', () => {
    it('should have proper form structure', () => {
      render(<ConsumptionForm {...defaultProps} />);

      const form = screen.getByTestId('consumption-form').querySelector('form');
      expect(form).toBeInTheDocument();
      expect(form).toHaveClass('space-y-4', 'flex', 'flex-col');
    });

    it('should have proper input attributes', () => {
      render(<ConsumptionForm {...defaultProps} />);

      const amountInput = screen.getByTestId('consumption-amount');
      expect(amountInput).toHaveAttribute('type', 'number');
      expect(amountInput).toHaveAttribute('step', '0.5');
      expect(amountInput).toHaveAttribute('placeholder', 'Amount in grams');
    });
  });

  describe('Sync Status Indicators', () => {
    it('should show syncing status in title', () => {
      render(<ConsumptionForm {...defaultProps} syncStatus="syncing" />);

      expect(screen.getByText('(Syncing...)')).toBeInTheDocument();
    });

    it('should show synced status in title', () => {
      render(<ConsumptionForm {...defaultProps} syncStatus="synced" />);

      expect(screen.getByText('(Synced)')).toBeInTheDocument();
    });

    it('should show sync error status in title', () => {
      render(<ConsumptionForm {...defaultProps} syncStatus="error" />);

      expect(screen.getByText('(Sync Error)')).toBeInTheDocument();
    });

    it('should show sync success message when synced', () => {
      render(<ConsumptionForm {...defaultProps} syncStatus="synced" />);

      expect(screen.getByTestId('sync-success-message')).toBeInTheDocument();
      expect(screen.getByText('✓ Consumption saved and will sync when online')).toBeInTheDocument();
    });

    it('should not show sync success message when not synced', () => {
      render(<ConsumptionForm {...defaultProps} syncStatus="idle" />);

      expect(screen.queryByTestId('sync-success-message')).not.toBeInTheDocument();
    });
  });
});
