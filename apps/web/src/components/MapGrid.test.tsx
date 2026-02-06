import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import { vi, describe, it, expect, beforeEach } from 'vitest';
import MapGrid from './MapGrid';
import { supabase } from '../lib/supabase';

// Mock Supabase
vi.mock('../lib/supabase', () => ({
  supabase: {
    auth: {
      getSession: vi.fn(),
    },
  },
}));

describe('MapGrid', () => {
  beforeEach(() => {
    // Reset mocks
    const getSessionMock = supabase.auth.getSession as unknown as ReturnType<typeof vi.fn>;
    getSessionMock.mockResolvedValue({
      data: { session: { access_token: 'fake-token' } },
    });

    // Mock global fetch
    global.fetch = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => [
        { x: '0', y: '0', type: 'BUNKER' },
        { x: '0', y: '1', type: 'RESOURCE' },
      ],
    });
  });

  it('renders the grid and fetches data', async () => {
    render(<MapGrid initialCenterX="0" initialCenterY="0" />);

    // Check header
    expect(screen.getByText(/TACTICAL MAP/i)).toBeInTheDocument();
    
    // Check fetch call
    await waitFor(() => {
        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/map/sectors?x=0&y=0'),
            expect.anything()
        );
    });
  });

  it('updates coordinates on navigation', async () => {
    render(<MapGrid initialCenterX="0" initialCenterY="0" />);
    
    // Click North (y + 1)
    const northBtn = screen.getByText('N');
    fireEvent.click(northBtn);
    
    await waitFor(() => {
        expect(screen.getByText(/CENTER: 0, 1/i)).toBeInTheDocument();
    });
  });
});
