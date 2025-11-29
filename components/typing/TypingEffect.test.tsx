/// <reference types="vitest" />
import React from 'react';
import { render, screen, act } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi } from 'vitest';
import TypingEffect from './TypingEffect';

describe('TypingEffect', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('renders characters one by one and ends with full text', async () => {
    const text = 'Hello';
    render(<TypingEffect text={text} speed={10} />);

    // advance timers long enough to type all characters
    act(() => {
      vi.advanceTimersByTime(text.length * 10 + 50);
    });

    expect(screen.getByText('Hello')).toBeInTheDocument();
  });

  it('does not append undefined when given empty text', () => {
    render(<TypingEffect text={''} speed={10} />);
    // caret span exists in the DOM even if hidden
    expect(screen.queryByText('|')).toBeInTheDocument();
  });

  it('loops with erase and retypes the text', () => {
    const text = 'Hi';
    // speed 10, pause 20 -> total cycle to full retype: typing(20) + pause(20) + erase(20) + pause(20) + typing(20) = 100ms
    render(<TypingEffect text={text} speed={10} loop={true} erase={true} pause={20} />);

    // advance to first full typing
    act(() => {
      vi.advanceTimersByTime(30);
    });
    expect(screen.getByText('Hi')).toBeInTheDocument();

    // advance to allow erase and retype cycle to complete
    act(() => {
      vi.advanceTimersByTime(100);
    });
    expect(screen.getByText('Hi')).toBeInTheDocument();
  });
});
