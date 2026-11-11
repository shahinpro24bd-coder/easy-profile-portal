import React from 'react';
import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NewPatientPage from '@/portal/app/patients/new/page';

vi.mock('@/portal/shims/next-navigation', () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock('@/portal/app/dashboard/layout', () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('@/portal/components/ui/toast', () => ({ useToast: () => ({ showToast: vi.fn() }) }));
vi.mock('@/portal/lib/api/client', () => ({ apiFetch: vi.fn().mockResolvedValue({ success: true, data: [] }) }));

describe('New patient form', () => {
  it('opens and allows selecting a patient complaint', () => {
    render(<NewPatientPage />);
    fireEvent.click(screen.getByRole('button', { name: /দাঁতে ব্যথা/ }));
    expect(screen.getByPlaceholderText(/উপরে থেকে সমস্যা বেছে নিন/)).toHaveValue('Toothache');
  });
});