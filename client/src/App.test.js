import { render, screen } from '@testing-library/react';
import App from './App';
import api from './api';

jest.mock('./api', () => ({
  __esModule: true,
  default: {
    get: jest.fn(),
    post: jest.fn(),
    put: jest.fn(),
    delete: jest.fn(),
  },
}));

// CRA's Jest config sets resetMocks: true, so reapply implementations
// before every test.
beforeEach(() => {
  api.get.mockResolvedValue({ data: [] });
  api.post.mockResolvedValue({ data: {} });
  api.put.mockResolvedValue({ data: {} });
  api.delete.mockResolvedValue({ data: {} });
});

test('renders the Sahay heading', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Sahay/i, level: 1 })).toBeInTheDocument();
});

test('shows the login form when no user is stored', () => {
  render(<App />);
  expect(screen.getByRole('heading', { name: /Login to Sahay/i })).toBeInTheDocument();
});
