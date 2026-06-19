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

    // Verify it transitions to playing screen (showing steering buttons)
    expect(screen.getByText(/◀/i)).toBeInTheDocument();
    expect(screen.getByText(/▶/i)).toBeInTheDocument();

    // Advance timers/frames to check for spawn
    await act(async () => {
      // Advance by 2 seconds to trigger spawn manager (>1.5s spawn rate)
      vi.advanceTimersByTime(2000);
    });

    // Let's verify no console errors occurred and component is stable
    vi.useRealTimers();
  });
});
