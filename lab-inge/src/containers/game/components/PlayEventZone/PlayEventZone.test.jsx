import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PlayEventZone from './PlayEventZone.jsx';

// Mock @dnd-kit/core
vi.mock('@dnd-kit/core', () => ({
  useDroppable: vi.fn(() => ({
    setNodeRef: vi.fn(),
    isOver: false,
  })),
}));

import { useDroppable } from '@dnd-kit/core';

describe('PlayEventZone', () => {
  const mockTurnData = {
    turn_owner_id: 'player1',
  };

  const mockEventCard = {
    card_name: 'Test Event Card',
    image_name: 'test_event',
  };

  beforeEach(() => {
    // Reset mocks before each test
    vi.clearAllMocks();
    useDroppable.mockReturnValue({
      setNodeRef: vi.fn(),
      isOver: false,
    });
  });

  describe('when no event card is present', () => {
    it('renders empty zone with event icon', () => {
      render(
        <PlayEventZone 
          eventCard={null}
          turnData={mockTurnData}
          myPlayerId="player1"
        />
      );

      const eventIcon = screen.getByAltText('Event Zone');
      expect(eventIcon).toBeInTheDocument();
      expect(eventIcon).toHaveAttribute('src', '/icons/event-icon.png');
    });

    it('shows default styling when not my turn', () => {
      render(
        <PlayEventZone 
          eventCard={null}
          turnData={mockTurnData}
          myPlayerId="player2"
        />
      );

      const container = screen.getByAltText('Event Zone').parentElement;
      expect(container).toHaveClass('border-2', 'border-dashed', 'border-white/40');
      expect(container).not.toHaveClass('border-[#facc15]', 'scale-105');
    });

    it('shows hover styling when it is my turn and isOver is true', () => {
      useDroppable.mockReturnValue({
        setNodeRef: vi.fn(),
        isOver: true,
      });

      render(
        <PlayEventZone 
          eventCard={null}
          turnData={mockTurnData}
          myPlayerId="player1"
        />
      );

      const container = screen.getByAltText('Event Zone').parentElement;
      expect(container).toHaveClass('border-[#facc15]', 'scale-105');
    });

    it('handles event icon hover effects', () => {
      render(
        <PlayEventZone 
          eventCard={null}
          turnData={mockTurnData}
          myPlayerId="player1"
        />
      );

      const eventIcon = screen.getByAltText('Event Zone');
      
      // Test mouse enter
      fireEvent.mouseEnter(eventIcon);
      expect(eventIcon.style.transform).toBe('scale(1.1)');

      // Test mouse leave
      fireEvent.mouseLeave(eventIcon);
      expect(eventIcon.style.transform).toBe('scale(1)');
    });

    it('works when turnData is null', () => {
      render(
        <PlayEventZone 
          eventCard={null}
          turnData={null}
          myPlayerId="player1"
        />
      );

      const eventIcon = screen.getByAltText('Event Zone');
      expect(eventIcon).toBeInTheDocument();
    });
  });

  describe('when event card is present', () => {
    it('renders event card image', () => {
      render(
        <PlayEventZone 
          eventCard={mockEventCard}
          turnData={mockTurnData}
          myPlayerId="player1"
        />
      );

      const cardImage = screen.getByAltText('Test Event Card');
      expect(cardImage).toBeInTheDocument();
      expect(cardImage).toHaveAttribute('src', '/cards/test_event.png');
      expect(cardImage).toHaveStyle({ pointerEvents: 'none' });
    });

    it('applies correct container styles when card is present', () => {
      render(
        <PlayEventZone 
          eventCard={mockEventCard}
          turnData={mockTurnData}
          myPlayerId="player1"
        />
      );

      const container = screen.getByAltText('Test Event Card').parentElement;
      expect(container).toHaveClass('relative', 'w-24', 'h-36', 'overflow-hidden');
      expect(container).toHaveStyle({
        padding: '0',
        transition: 'all 0.2s ease',
      });
    });
  });

  describe('droppable functionality', () => {
    it('calls useDroppable with correct id', () => {
      render(
        <PlayEventZone 
          eventCard={null}
          turnData={mockTurnData}
          myPlayerId="player1"
        />
      );

      expect(useDroppable).toHaveBeenCalledWith({
        id: 'play-event-zone',
      });
    });

    it('uses setNodeRef from useDroppable', () => {
      const mockSetNodeRef = vi.fn();
      useDroppable.mockReturnValue({
        setNodeRef: mockSetNodeRef,
        isOver: false,
      });

      render(
        <PlayEventZone 
          eventCard={null}
          turnData={mockTurnData}
          myPlayerId="player1"
        />
      );

      // The setNodeRef should be called during render
      expect(mockSetNodeRef).toHaveBeenCalled();
    });
  });

  describe('turn logic', () => {
    it('correctly identifies when it is my turn', () => {
      useDroppable.mockReturnValue({
        setNodeRef: vi.fn(),
        isOver: true,
      });

      render(
        <PlayEventZone 
          eventCard={null}
          turnData={{ turn_owner_id: 'player1' }}
          myPlayerId="player1"
        />
      );

      const container = screen.getByAltText('Event Zone').parentElement;
      expect(container).toHaveClass('border-[#facc15]', 'scale-105');
    });

    it('correctly identifies when it is not my turn', () => {
      useDroppable.mockReturnValue({
        setNodeRef: vi.fn(),
        isOver: true,
      });

      render(
        <PlayEventZone 
          eventCard={null}
          turnData={{ turn_owner_id: 'player2' }}
          myPlayerId="player1"
        />
      );

      const container = screen.getByAltText('Event Zone').parentElement;
      expect(container).not.toHaveClass('border-[#facc15]', 'scale-105');
    });
  });
});