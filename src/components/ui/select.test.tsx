import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from './select';

describe('Select', () => {
  it('should render with a placeholder', () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
      </Select>
    );
    expect(screen.getByText('Select a fruit')).toBeInTheDocument();
  });

  it('should open the select menu on trigger click', async () => {
    render(
      <Select>
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );

    fireEvent.click(screen.getByText('Select a fruit'));
    expect(await screen.findByText('Apple')).toBeInTheDocument();
  });

  it('should call onValueChange when an item is selected', async () => {
    const onValueChange = vi.fn();
    render(
      <Select onValueChange={onValueChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );

    fireEvent.click(screen.getByText('Select a fruit'));
    const appleOption = await screen.findByText('Apple');
    fireEvent.click(appleOption);

    expect(onValueChange).toHaveBeenCalledWith('apple');
  });

  it('should display the selected value', async () => {
    render(
      <Select defaultValue="apple">
        <SelectTrigger>
          <SelectValue placeholder="Select a fruit" />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="apple">Apple</SelectItem>
        </SelectContent>
      </Select>
    );

    expect(screen.getByText('Apple')).toBeInTheDocument();
  });
});
