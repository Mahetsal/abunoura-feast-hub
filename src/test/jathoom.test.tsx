import { describe, it, expect, vi } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import { AlJathoomGame } from '../components/games/AlJathoomGame';
import { AppProvider } from '../context/AppContext';

describe('AlJathoomGame Component', () => {
  it('should render the start screen and transition to playing on button click', async () => {
    vi.useFakeTimers();

    const { container } = render(
      <AppProvider>
        <AlJathoomGame isActive={true} />
      </AppProvider>
    );

    // Verify start screen renders
    expect(screen.getByText(/الجاثوم: ملك الخط/i)).toBeInTheDocument();
    expect(screen.getByText(/دعس بنزين!/i)).toBeInTheDocument();

    // Click start button
    const startBtn = screen.getByText(/دعس بنزين!/i);
    await act(async () => {
      startBtn.click();
    });

    // Playing screen shows the high-beam flash button
    const flashBtn = screen.getByText(/كبّس بالعالي/i);
    expect(flashBtn).toBeInTheDocument();

    // Run many frames and flash repeatedly — must not throw or freeze
    for (let i = 0; i < 20; i++) {
      await act(async () => {
        vi.advanceTimersByTime(200);
      });
      await act(async () => {
        flashBtn.click();
      });
    }

    expect(container).toBeTruthy();
    vi.useRealTimers();
  });
});
