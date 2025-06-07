import React from 'react';
import { render, screen } from '@testing-library/react';
import ResumeBuilderNew from '../pages/ResumeBuilder_new';
import axios from 'axios';

jest.mock('axios', () => ({
  get: jest.fn(),
  post: jest.fn(),
}));

describe('ResumeBuilder_new Component', () => {
  test('renders ResumeBuilder_new component without crashing', () => {
    render(<ResumeBuilderNew />);
    // Check for some text or element that should be present
    const headingElement = screen.getByText(/Resume Builder/i);
    expect(headingElement).toBeInTheDocument();
  });
});
