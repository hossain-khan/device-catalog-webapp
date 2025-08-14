import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import {
  Card,
  CardHeader,
  CardFooter,
  CardTitle,
  CardAction,
  CardDescription,
  CardContent,
} from './card';

describe('Card Components', () => {
  describe('Card', () => {
    it('should render children and apply custom className', () => {
      render(<Card className="custom-class">Child</Card>);
      const cardElement = screen.getByText('Child');
      expect(cardElement).toBeInTheDocument();
      expect(cardElement).toHaveClass('custom-class');
    });
  });

  describe('CardHeader', () => {
    it('should render children and apply custom className', () => {
      render(<CardHeader className="custom-header">Header</CardHeader>);
      const headerElement = screen.getByText('Header');
      expect(headerElement).toBeInTheDocument();
      expect(headerElement).toHaveClass('custom-header');
    });
  });

  describe('CardTitle', () => {
    it('should render children and apply custom className', () => {
      render(<CardTitle className="custom-title">Title</CardTitle>);
      const titleElement = screen.getByText('Title');
      expect(titleElement).toBeInTheDocument();
      expect(titleElement).toHaveClass('custom-title');
    });
  });

  describe('CardDescription', () => {
    it('should render children and apply custom className', () => {
      render(<CardDescription className="custom-description">Description</CardDescription>);
      const descriptionElement = screen.getByText('Description');
      expect(descriptionElement).toBeInTheDocument();
      expect(descriptionElement).toHaveClass('custom-description');
    });
  });

  describe('CardAction', () => {
    it('should render children and apply custom className', () => {
      render(<CardAction className="custom-action">Action</CardAction>);
      const actionElement = screen.getByText('Action');
      expect(actionElement).toBeInTheDocument();
      expect(actionElement).toHaveClass('custom-action');
    });
  });

  describe('CardContent', () => {
    it('should render children and apply custom className', () => {
      render(<CardContent className="custom-content">Content</CardContent>);
      const contentElement = screen.getByText('Content');
      expect(contentElement).toBeInTheDocument();
      expect(contentElement).toHaveClass('custom-content');
    });
  });

  describe('CardFooter', () => {
    it('should render children and apply custom className', () => {
      render(<CardFooter className="custom-footer">Footer</CardFooter>);
      const footerElement = screen.getByText('Footer');
      expect(footerElement).toBeInTheDocument();
      expect(footerElement).toHaveClass('custom-footer');
    });
  });
});
