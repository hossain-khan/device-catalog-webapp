import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { DeviceFiltersPanel } from './DeviceFiltersPanel';
import { DeviceFilters } from '@/types/device';

const mockFilters: DeviceFilters = {
  search: '',
  formFactor: 'all',
  manufacturer: 'all',
  manufacturers: [],
  minRam: 'all',
  sdkVersion: 'all',
  ramRange: [0, 32],
  sdkVersionRange: [1, 34],
};

const placeholderText = "Search devices, manufacturers, processors...";

describe('DeviceFiltersPanel', () => {
  it('should render all filter controls', () => {
    render(
      <DeviceFiltersPanel
        filters={mockFilters}
        onFiltersChange={vi.fn()}
        manufacturers={['Samsung', 'Google']}
        formFactors={['Phone', 'Tablet']}
        sdkVersions={['13', '14']}
        deviceCount={10}
        totalDevices={100}
        ramRange={[0, 32]}
        sdkVersionRange={[1, 34]}
        isFiltering={false}
      />
    );

    expect(screen.getByPlaceholderText(placeholderText)).toBeInTheDocument();
    expect(screen.getByText('All Form Factors')).toBeInTheDocument();
    expect(screen.getByText('All Manufacturers')).toBeInTheDocument();
  });

  it('should call onFiltersChange when search input changes', () => {
    const onFiltersChange = vi.fn();
    render(
        <DeviceFiltersPanel
            filters={mockFilters}
            onFiltersChange={onFiltersChange}
            manufacturers={[]}
            formFactors={[]}
            sdkVersions={[]}
            deviceCount={0}
            totalDevices={0}
            ramRange={[0, 32]}
            sdkVersionRange={[1, 34]}
            isFiltering={false}
        />
    );

    const searchInput = screen.getByPlaceholderText(placeholderText);
    fireEvent.change(searchInput, { target: { value: 'test' } });

    expect(onFiltersChange).toHaveBeenCalledWith(expect.objectContaining({ search: 'test' }));
  });
});
