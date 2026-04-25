import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import HomePage from './HomePage';

describe('HomePage', () => {
  it('renders the project heading', () => {
    render(<HomePage />);

    expect(screen.getByRole('heading', { name: '경북대학교 80주년 대동제' })).toBeTruthy();
  });
});
