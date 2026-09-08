import { render, screen } from '@testing-library/react';
import App from './App';
import api from './api';

jest.mock('./api', () => ({
  __esModule: true,
  default: { get: jest.fn(), post: jest.fn(), put: jest.fn(), delete: jest.fn() },
}));

// react-leaflet is ESM-only and isn't transformed by CRA's Jest setup.
// The map view is lazy-loaded and irrelevant to these tests, so stub it.
jest.mock('./components/MapView', () => ({
  __esModule: true,
  default: () => null,
}));

beforeEach(() => {
  // CRA's Jest config sets resetMocks:true, so re-apply implementations each test.
  api.get.mockResolvedValue({ data: [] });
  api.post.mockResolvedValue({ data: {} });
  api.put.mockResolvedValue({ data: {} });
  api.delete.mockResolvedValue({ data: {} });
  try {
    localStorage.clear();
    // Skip the landing/splash intro so tests land straight on the app.
    sessionStorage.setItem('introSeen', '1');
  } catch {
    /* ignore */
  }
});

test('shows the auth screen when no user is stored', () => {
  render(<App />);
  expect(screen.getByLabelText(/email address/i)).toBeInTheDocument();
  expect(screen.getByLabelText(/^password$/i)).toBeInTheDocument();
  // Both the tab and the submit button read "Sign in" in login mode.
  expect(screen.getAllByRole('button', { name: /^sign in$/i }).length).toBeGreaterThan(0);
});

test('renders the Sahay brand heading on the auth screen', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /^Sahay$/i, level: 1 })).toBeInTheDocument();
});

test('shows the landing screen on a fresh session', () => {
  try {
    sessionStorage.removeItem('introSeen');
  } catch {
    /* ignore */
  }
  render(<App />);
  expect(screen.getByRole('button', { name: /get started/i })).toBeInTheDocument();
});
