import React from 'react';
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElements= screen.queryAllByText(/График/i);
  expect(linkElements.length).toBe(3)
});
