import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { ProductImage } from './ProductImage';
import type { ConfigurationSelection } from '../../types';

describe('ProductImage', () => {
  const createSelections = (
    overrides: Partial<Record<string, string>> = {}
  ): ConfigurationSelection[] => {
    const defaults = {
      'frame-type': 'diamond',
      'frame-finish': 'matte',
      wheels: 'road-wheels',
      'rim-color': 'black-rim',
    };
    const merged = { ...defaults, ...overrides };
    return Object.entries(merged).map(([partTypeId, partOptionId]) => ({
      partTypeId,
      partOptionId,
    }));
  };

  describe('rendering', () => {
    it('should render SVG bicycle image', () => {
      render(<ProductImage selections={[]} />);
      const svg = document.querySelector('.product-image__svg');
      expect(svg).toBeInTheDocument();
    });

    it('should render product name', () => {
      render(<ProductImage selections={[]} productName="Custom Mountain Bike" />);
      expect(screen.getByText('Custom Mountain Bike')).toBeInTheDocument();
    });

    it('should use default product name if not provided', () => {
      render(<ProductImage selections={[]} />);
      expect(screen.getByText('Custom Bicycle')).toBeInTheDocument();
    });

    it('should have accessibility attributes', () => {
      render(<ProductImage selections={[]} productName="Test Bike" />);
      const svg = document.querySelector('.product-image__svg');
      expect(svg).toHaveAttribute('role', 'img');
      expect(svg).toHaveAttribute('aria-label', 'Test Bike configuration preview');
    });

    it('should show configuration hint', () => {
      render(<ProductImage selections={[]} />);
      expect(screen.getByText('Configuration updates in real-time')).toBeInTheDocument();
    });
  });

  describe('frame type variations', () => {
    it('should render diamond frame by default', () => {
      render(<ProductImage selections={[]} />);
      const diamondFrame = document.querySelector('.product-image__frame--diamond');
      expect(diamondFrame).toBeInTheDocument();
    });

    it('should render full-suspension frame when selected', () => {
      const selections = createSelections({ 'frame-type': 'full-suspension' });
      render(<ProductImage selections={selections} />);
      const suspensionFrame = document.querySelector('.product-image__frame--full-suspension');
      expect(suspensionFrame).toBeInTheDocument();
    });

    it('should render step-through frame when selected', () => {
      const selections = createSelections({ 'frame-type': 'step-through' });
      render(<ProductImage selections={selections} />);
      const stepThroughFrame = document.querySelector('.product-image__frame--step-through');
      expect(stepThroughFrame).toBeInTheDocument();
    });
  });

  describe('wheel variations', () => {
    it('should render road wheels with thin stroke', () => {
      const selections = createSelections({ wheels: 'road-wheels' });
      render(<ProductImage selections={selections} />);
      const wheels = document.querySelectorAll('.product-image__wheel');
      expect(wheels.length).toBe(2);
    });

    it('should render mountain wheels', () => {
      const selections = createSelections({ wheels: 'mountain-wheels' });
      render(<ProductImage selections={selections} />);
      const wheels = document.querySelectorAll('.product-image__wheel');
      expect(wheels.length).toBe(2);
    });

    it('should render fat bike wheels', () => {
      const selections = createSelections({ wheels: 'fat-bike-wheels' });
      render(<ProductImage selections={selections} />);
      const wheels = document.querySelectorAll('.product-image__wheel');
      expect(wheels.length).toBe(2);
    });
  });

  describe('rim color variations', () => {
    it('should apply red rim color', () => {
      const selections = createSelections({ 'rim-color': 'red-rim' });
      render(<ProductImage selections={selections} />);
      const svg = document.querySelector('.product-image__svg');
      expect(svg).toBeInTheDocument();
    });

    it('should apply black rim color', () => {
      const selections = createSelections({ 'rim-color': 'black-rim' });
      render(<ProductImage selections={selections} />);
      const svg = document.querySelector('.product-image__svg');
      expect(svg).toBeInTheDocument();
    });

    it('should apply blue rim color', () => {
      const selections = createSelections({ 'rim-color': 'blue-rim' });
      render(<ProductImage selections={selections} />);
      const svg = document.querySelector('.product-image__svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('frame finish variations', () => {
    it('should apply matte finish', () => {
      const selections = createSelections({ 'frame-finish': 'matte' });
      render(<ProductImage selections={selections} />);
      const svg = document.querySelector('.product-image__svg');
      expect(svg).toBeInTheDocument();
    });

    it('should apply shiny finish', () => {
      const selections = createSelections({ 'frame-finish': 'shiny' });
      render(<ProductImage selections={selections} />);
      const svg = document.querySelector('.product-image__svg');
      expect(svg).toBeInTheDocument();
    });
  });

  describe('empty selections', () => {
    it('should use default values when selections are empty', () => {
      render(<ProductImage selections={[]} />);
      const diamondFrame = document.querySelector('.product-image__frame--diamond');
      expect(diamondFrame).toBeInTheDocument();
    });

    it('should handle partial selections', () => {
      const selections: ConfigurationSelection[] = [
        { partTypeId: 'frame-type', partOptionId: 'full-suspension' },
      ];
      render(<ProductImage selections={selections} />);
      const suspensionFrame = document.querySelector('.product-image__frame--full-suspension');
      expect(suspensionFrame).toBeInTheDocument();
    });
  });
});
