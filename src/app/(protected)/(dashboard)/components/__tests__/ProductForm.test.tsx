import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import ProductForm from '../ProductForm';
import { UnifiedDataService } from '../../../../../lib/unified-data-service';

// Mock dependencies
jest.mock('../../../../../lib/unified-data-service');
jest.mock('../../../../../hooks/use-online-status', () => ({
  useOnlineStatus: jest.fn(() => true),
}));
jest.mock('../../../../../lib/trpc-client', () => ({
  trpc: {
    useUtils: jest.fn(() => ({
      product: {
        getAll: {
          invalidate: jest.fn(),
        },
      },
    })),
    product: {
      create: {
        useMutation: jest.fn(() => ({
          mutate: jest.fn(),
          isPending: false,
          error: null,
        })),
      },
    },
  },
}));

const MockUnifiedDataService = UnifiedDataService as jest.MockedClass<typeof UnifiedDataService>;

describe('ProductForm', () => {
  let mockDataService: jest.Mocked<UnifiedDataService>;

  beforeEach(() => {
    jest.clearAllMocks();
    mockDataService = new MockUnifiedDataService() as jest.Mocked<UnifiedDataService>;
    MockUnifiedDataService.getInstance = jest.fn().mockReturnValue(mockDataService);

    // Mock navigator.onLine
    Object.defineProperty(navigator, 'onLine', {
      writable: true,
      value: true,
    });

    // Mock successful product creation
    mockDataService.createProduct.mockResolvedValue({
      id: 1,
      name: 'Test Product',
      calories: 100,
      protein: 10,
      fat: 5,
      carbs: 20,
      userId: 1,
      createdAt: new Date(),
      updatedAt: new Date(),
      _synced: false,
      _syncTimestamp: null,
      _syncError: null,
      _lastModified: new Date(),
      _version: 1,
    });
  });

  const defaultProps = {
    userId: 1,
    onSuccess: jest.fn(),
  };

  describe('Form Rendering', () => {
    it('should render all form fields', () => {
      render(<ProductForm {...defaultProps} />);

      expect(screen.getByTestId('product-name')).toBeInTheDocument();
      expect(screen.getByTestId('product-calories')).toBeInTheDocument();
      expect(screen.getByTestId('product-protein')).toBeInTheDocument();
      expect(screen.getByTestId('product-carbs')).toBeInTheDocument();
      expect(screen.getByTestId('product-fat')).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /add product/i })).toBeInTheDocument();
    });

    it('should not show offline mode indicator (simplified approach)', () => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });

      render(<ProductForm {...defaultProps} />);

      expect(screen.queryByText('(Offline Mode)')).not.toBeInTheDocument();
    });
  });

  describe('Form Validation', () => {
    it('should show error for empty name', async () => {
      render(<ProductForm {...defaultProps} />);

      // Fill in nutrition fields but leave name empty
      fireEvent.change(screen.getByTestId('product-calories'), { target: { value: '100' } });
      fireEvent.change(screen.getByTestId('product-protein'), { target: { value: '10' } });
      fireEvent.change(screen.getByTestId('product-fat'), { target: { value: '5' } });
      fireEvent.change(screen.getByTestId('product-carbs'), { target: { value: '20' } });

      const submitButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please fill all fields with valid numbers')).toBeInTheDocument();
      });
    });

    it('should show error for invalid numbers', async () => {
      render(<ProductForm {...defaultProps} />);

      // Fill in name but use invalid numbers
      fireEvent.change(screen.getByTestId('product-name'), { target: { value: 'Test Product' } });
      fireEvent.change(screen.getByTestId('product-calories'), { target: { value: '-100' } });
      fireEvent.change(screen.getByTestId('product-protein'), { target: { value: '-10' } });

      const submitButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Please fill all fields with valid numbers')).toBeInTheDocument();
      });
    });
  });

  describe('Unified Data Service', () => {
    it('should use UnifiedDataService for product creation', async () => {
      render(<ProductForm {...defaultProps} />);

      // Fill in form data
      fireEvent.change(screen.getByTestId('product-name'), { target: { value: 'Test Product' } });
      fireEvent.change(screen.getByTestId('product-calories'), { target: { value: '100' } });
      fireEvent.change(screen.getByTestId('product-protein'), { target: { value: '10' } });
      fireEvent.change(screen.getByTestId('product-fat'), { target: { value: '5' } });
      fireEvent.change(screen.getByTestId('product-carbs'), { target: { value: '20' } });

      const submitButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockDataService.createProduct).toHaveBeenCalledWith({
          name: 'Test Product',
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
          userId: 1,
        });
      });
    });

    it('should handle UnifiedDataService success', async () => {
      render(<ProductForm {...defaultProps} />);

      // Fill in form data
      fireEvent.change(screen.getByTestId('product-name'), { target: { value: 'Test Product' } });
      fireEvent.change(screen.getByTestId('product-calories'), { target: { value: '100' } });
      fireEvent.change(screen.getByTestId('product-protein'), { target: { value: '10' } });
      fireEvent.change(screen.getByTestId('product-fat'), { target: { value: '5' } });
      fireEvent.change(screen.getByTestId('product-carbs'), { target: { value: '20' } });

      const submitButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled();
        expect(screen.getByText('✓ Product saved and will sync when online')).toBeInTheDocument();
      });
    });

    it('should handle UnifiedDataService error', async () => {
      mockDataService.createProduct.mockRejectedValue(new Error('Database error'));

      render(<ProductForm {...defaultProps} />);

      // Fill in form data
      fireEvent.change(screen.getByTestId('product-name'), { target: { value: 'Test Product' } });
      fireEvent.change(screen.getByTestId('product-calories'), { target: { value: '100' } });
      fireEvent.change(screen.getByTestId('product-protein'), { target: { value: '10' } });
      fireEvent.change(screen.getByTestId('product-fat'), { target: { value: '5' } });
      fireEvent.change(screen.getByTestId('product-carbs'), { target: { value: '20' } });

      const submitButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error creating product: Database error')).toBeInTheDocument();
      });
    });
  });

  describe('Offline Mode', () => {
    beforeEach(() => {
      Object.defineProperty(navigator, 'onLine', {
        writable: true,
        value: false,
      });
    });

    it('should use UnifiedDataService when offline', async () => {
      render(<ProductForm {...defaultProps} />);

      // Fill in form data
      fireEvent.change(screen.getByTestId('product-name'), { target: { value: 'Test Product' } });
      fireEvent.change(screen.getByTestId('product-calories'), { target: { value: '100' } });
      fireEvent.change(screen.getByTestId('product-protein'), { target: { value: '10' } });
      fireEvent.change(screen.getByTestId('product-fat'), { target: { value: '5' } });
      fireEvent.change(screen.getByTestId('product-carbs'), { target: { value: '20' } });

      const submitButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(mockDataService.createProduct).toHaveBeenCalledWith({
          name: 'Test Product',
          calories: 100,
          protein: 10,
          fat: 5,
          carbs: 20,
          userId: 1,
        });
      });
    });

    it('should handle offline creation success', async () => {
      render(<ProductForm {...defaultProps} />);

      // Fill in form data
      fireEvent.change(screen.getByTestId('product-name'), { target: { value: 'Test Product' } });
      fireEvent.change(screen.getByTestId('product-calories'), { target: { value: '100' } });
      fireEvent.change(screen.getByTestId('product-protein'), { target: { value: '10' } });
      fireEvent.change(screen.getByTestId('product-fat'), { target: { value: '5' } });
      fireEvent.change(screen.getByTestId('product-carbs'), { target: { value: '20' } });

      const submitButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(defaultProps.onSuccess).toHaveBeenCalled();
        expect(screen.getByText('✓ Product saved and will sync when online')).toBeInTheDocument();
      });
    });

    it('should handle offline creation error', async () => {
      mockDataService.createProduct.mockRejectedValue(new Error('Offline error'));

      render(<ProductForm {...defaultProps} />);

      // Fill in form data
      fireEvent.change(screen.getByTestId('product-name'), { target: { value: 'Test Product' } });
      fireEvent.change(screen.getByTestId('product-calories'), { target: { value: '100' } });
      fireEvent.change(screen.getByTestId('product-protein'), { target: { value: '10' } });
      fireEvent.change(screen.getByTestId('product-fat'), { target: { value: '5' } });
      fireEvent.change(screen.getByTestId('product-carbs'), { target: { value: '20' } });

      const submitButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error creating product: Offline error')).toBeInTheDocument();
      });
    });

    it('should require userId for offline creation', async () => {
      render(<ProductForm userId={null} onSuccess={jest.fn()} />);

      // Fill in form data
      fireEvent.change(screen.getByTestId('product-name'), { target: { value: 'Test Product' } });
      fireEvent.change(screen.getByTestId('product-calories'), { target: { value: '100' } });
      fireEvent.change(screen.getByTestId('product-protein'), { target: { value: '10' } });
      fireEvent.change(screen.getByTestId('product-fat'), { target: { value: '5' } });
      fireEvent.change(screen.getByTestId('product-carbs'), { target: { value: '20' } });

      const submitButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('User ID is required for product creation')).toBeInTheDocument();
      });
    });
  });

  describe('Form State Management', () => {
    it('should show loading state during submission', async () => {
      // Mock a delayed response to test loading state
      mockDataService.createProduct.mockImplementation(
        () =>
          new Promise((resolve) =>
            setTimeout(
              () =>
                resolve({
                  id: 1,
                  name: 'Test Product',
                  calories: 100,
                  protein: 10,
                  fat: 5,
                  carbs: 20,
                  userId: 1,
                  createdAt: new Date(),
                  updatedAt: new Date(),
                  _synced: false,
                  _syncTimestamp: null,
                  _syncError: null,
                  _lastModified: new Date(),
                  _version: 1,
                }),
              100,
            ),
          ),
      );

      render(<ProductForm {...defaultProps} />);

      // Fill in form data
      fireEvent.change(screen.getByTestId('product-name'), { target: { value: 'Test Product' } });
      fireEvent.change(screen.getByTestId('product-calories'), { target: { value: '100' } });
      fireEvent.change(screen.getByTestId('product-protein'), { target: { value: '10' } });
      fireEvent.change(screen.getByTestId('product-fat'), { target: { value: '5' } });
      fireEvent.change(screen.getByTestId('product-carbs'), { target: { value: '20' } });

      const submitButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(submitButton);

      // Check that button shows loading state
      expect(screen.getByRole('button', { name: /adding/i })).toBeInTheDocument();
      expect(screen.getByRole('button', { name: /adding/i })).toBeDisabled();
    });

    it('should clear error when form is resubmitted', async () => {
      // First, trigger an error
      mockDataService.createProduct.mockRejectedValueOnce(new Error('First error'));

      render(<ProductForm {...defaultProps} />);

      // Fill in form data and submit
      fireEvent.change(screen.getByTestId('product-name'), { target: { value: 'Test Product' } });
      fireEvent.change(screen.getByTestId('product-calories'), { target: { value: '100' } });
      fireEvent.change(screen.getByTestId('product-protein'), { target: { value: '10' } });
      fireEvent.change(screen.getByTestId('product-fat'), { target: { value: '5' } });
      fireEvent.change(screen.getByTestId('product-carbs'), { target: { value: '20' } });

      const submitButton = screen.getByRole('button', { name: /add product/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText('Error creating product: First error')).toBeInTheDocument();
      });

      // Now mock success and resubmit
      mockDataService.createProduct.mockResolvedValue({
        id: 1,
        name: 'Test Product',
        calories: 100,
        protein: 10,
        fat: 5,
        carbs: 20,
        userId: 1,
        createdAt: new Date(),
        updatedAt: new Date(),
        _synced: false,
        _syncTimestamp: null,
        _syncError: null,
        _lastModified: new Date(),
        _version: 1,
      });

      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText('Error creating product: First error')).not.toBeInTheDocument();
        expect(screen.getByText('✓ Product saved and will sync when online')).toBeInTheDocument();
      });
    });
  });
});
