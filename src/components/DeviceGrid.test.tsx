import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen } from '@testing-library/react';
import { DeviceGrid } from '@/components/DeviceGrid';
import type { AndroidDevice } from '@/types/device';
import type { PaginationInfo } from '@/lib/paginationUtils';

// Simple mock for testing core functionality without complex lazy loading
vi.mock('@/components/DeviceCard', () => ({
  DeviceCard: ({ device }: { device: AndroidDevice }) => (
    <div data-testid={`device-card-${device.device}`}>
      {device.modelName}
    </div>
  )
}));

vi.mock('@/components/DeviceCardSkeleton', () => ({
  DeviceCardSkeleton: ({ count }: { count: number }) => (
    <div data-testid="device-skeleton">Loading {count} devices...</div>
  )
}));

vi.mock('@/components/PaginationControls', () => ({
  PaginationControls: ({ pagination }: { pagination: PaginationInfo }) => (
    <div data-testid="pagination-controls">
      Page {pagination.currentPage} of {pagination.totalPages}
    </div>
  )
}));

vi.mock('@/components/ColorModeControls', () => ({
  ColorModeControls: ({ colorMode }: { colorMode: string }) => (
    <div data-testid="color-mode-controls">
      Color Mode: {colorMode}
    </div>
  )
}));

// Mock lazy components to avoid Suspense issues in tests
vi.mock('@/components/DeviceJsonModal', () => ({
  DeviceJsonModal: () => <div data-testid="json-modal">JSON Modal</div>
}));

vi.mock('@/components/DeviceColorInfo', () => ({
  DeviceColorInfo: () => <div data-testid="color-info">Color Info</div>
}));

vi.mock('@/components/CategoryDistribution', () => ({
  CategoryDistribution: () => <div data-testid="category-distribution">Category Distribution</div>
}));

describe('DeviceGrid', () => {
  const mockDevices: AndroidDevice[] = [
    {
      brand: 'Google',
      device: 'pixel_8',
      manufacturer: 'Google',
      modelName: 'Pixel 8',
      ram: '8192MB',
      formFactor: 'phone',
      processorName: 'Google Tensor G3',
      gpu: 'Mali-G715 MC10',
      screenSizes: ['1080x2400'],
      screenDensities: [420],
      abis: ['arm64-v8a', 'armeabi-v7a'],
      sdkVersions: [33, 34],
      openGlEsVersions: ['3.2']
    },
    {
      brand: 'Samsung',
      device: 'galaxy_s23',
      manufacturer: 'Samsung',
      modelName: 'Galaxy S23',
      ram: '8192MB',
      formFactor: 'phone',
      processorName: 'Qualcomm Snapdragon 8 Gen 2',
      gpu: 'Adreno 740',
      screenSizes: ['1080x2340'],
      screenDensities: [425],
      abis: ['arm64-v8a', 'armeabi-v7a'],
      sdkVersions: [33, 34],
      openGlEsVersions: ['3.2']
    }
  ];

  const mockPagination: PaginationInfo = {
    currentPage: 1,
    totalPages: 5,
    totalItems: 100,
    itemsPerPage: 24,
    startIndex: 0,
    endIndex: 24,
    hasNextPage: true,
    hasPreviousPage: false
  };

  const mockOnDeviceClick = vi.fn();
  const mockOnPageChange = vi.fn();
  const mockOnItemsPerPageChange = vi.fn();
  const mockOnColorModeChange = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should render device cards when devices are provided', () => {
    render(
      <DeviceGrid
        devices={mockDevices}
        onDeviceClick={mockOnDeviceClick}
      />
    );

    expect(screen.getByTestId('device-card-pixel_8')).toBeInTheDocument();
    expect(screen.getByTestId('device-card-galaxy_s23')).toBeInTheDocument();
    expect(screen.getByText('Pixel 8')).toBeInTheDocument();
    expect(screen.getByText('Galaxy S23')).toBeInTheDocument();
  });

  it('should show loading skeleton when isLoading is true', () => {
    render(
      <DeviceGrid
        devices={mockDevices}
        onDeviceClick={mockOnDeviceClick}
        isLoading={true}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
        onItemsPerPageChange={mockOnItemsPerPageChange}
      />
    );

    expect(screen.getByTestId('device-skeleton')).toBeInTheDocument();
    expect(screen.getByText('Loading 24 devices...')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
  });

  it('should show "No devices found" message when devices array is empty', () => {
    render(
      <DeviceGrid
        devices={[]}
        onDeviceClick={mockOnDeviceClick}
        totalDevices={1000}
      />
    );

    expect(screen.getByText('No devices found')).toBeInTheDocument();
    expect(screen.getByText('Try adjusting your search terms or filters to find the devices you\'re looking for.')).toBeInTheDocument();
    expect(screen.getByText('1,000 devices available in total')).toBeInTheDocument();
  });

  it('should render pagination controls when pagination props are provided', () => {
    render(
      <DeviceGrid
        devices={mockDevices}
        onDeviceClick={mockOnDeviceClick}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
        onItemsPerPageChange={mockOnItemsPerPageChange}
      />
    );

    expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
    expect(screen.getByText('Page 1 of 5')).toBeInTheDocument();
  });

  it('should render color mode controls when onColorModeChange is provided', () => {
    render(
      <DeviceGrid
        devices={mockDevices}
        onDeviceClick={mockOnDeviceClick}
        colorMode="formFactor"
        onColorModeChange={mockOnColorModeChange}
      />
    );

    expect(screen.getByTestId('color-mode-controls')).toBeInTheDocument();
    expect(screen.getByText('Color Mode: formFactor')).toBeInTheDocument();
  });

  it('should not render color mode controls when onColorModeChange is not provided', () => {
    render(
      <DeviceGrid
        devices={mockDevices}
        onDeviceClick={mockOnDeviceClick}
      />
    );

    expect(screen.queryByTestId('color-mode-controls')).not.toBeInTheDocument();
  });

  it('should handle default props correctly', () => {
    render(
      <DeviceGrid
        devices={mockDevices}
        onDeviceClick={mockOnDeviceClick}
      />
    );

    // Should not show loading (default isLoading = false)
    expect(screen.queryByTestId('device-skeleton')).not.toBeInTheDocument();
    
    // Should show device cards
    expect(screen.getByTestId('device-card-pixel_8')).toBeInTheDocument();
  });

  it('should render with minimal required props', () => {
    render(
      <DeviceGrid
        devices={mockDevices}
        onDeviceClick={mockOnDeviceClick}
      />
    );

    expect(screen.getByTestId('device-card-pixel_8')).toBeInTheDocument();
    expect(screen.getByTestId('device-card-galaxy_s23')).toBeInTheDocument();
  });

  it('should handle empty devices array in loading state', () => {
    render(
      <DeviceGrid
        devices={[]}
        onDeviceClick={mockOnDeviceClick}
        isLoading={true}
        pagination={mockPagination}
        onPageChange={mockOnPageChange}
        onItemsPerPageChange={mockOnItemsPerPageChange}
      />
    );

    expect(screen.getByTestId('device-skeleton')).toBeInTheDocument();
    expect(screen.getByTestId('pagination-controls')).toBeInTheDocument();
  });

  it('should show color coding information button when onColorModeChange is provided', () => {
    render(
      <DeviceGrid
        devices={mockDevices}
        onDeviceClick={mockOnDeviceClick}
        onColorModeChange={mockOnColorModeChange}
      />
    );

    expect(screen.getByText('Color Coding Information')).toBeInTheDocument();
  });
});