import { describe, it } from 'vitest';
import { render, screen, act } from '@testing-library/react';
import Index from '../pages/Index';
import { LoginScreen } from '../components/LoginScreen';
import { AppProvider } from '../context/AppContext';

describe('App Rendering', () => {
  it('should render index and transition', async () => {
    vi.useFakeTimers();
    render(<Index />);
    // Run timer to complete splash screen
    act(() => {
      vi.runAllTimers();
    });
    vi.useRealTimers();
  });

  it('should render LoginScreen directly', () => {
    render(
      <AppProvider>
        <LoginScreen onComplete={() => {}} />
      </AppProvider>
    );
  });
});

