import React from 'react';
import { act, fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import NewPatientPage from '@/portal/app/patients/new/page';
import { apiFetch } from '@/portal/lib/api/client';

vi.mock('@/portal/shims/next-navigation', () => ({ useRouter: () => ({ push: vi.fn(), back: vi.fn() }) }));
vi.mock('@/portal/app/dashboard/layout', () => ({ default: ({ children }: { children: React.ReactNode }) => <>{children}</> }));
vi.mock('@/portal/components/ui/toast', () => ({ useToast: () => ({ showToast: vi.fn() }) }));
vi.mock('@/portal/lib/api/client', () => ({ apiFetch: vi.fn().mockResolvedValue({ success: true, data: [] }) }));

describe('New patient form', () => {
  it('opens and allows selecting a patient complaint', async () => {
    await act(async () => { render(<NewPatientPage />); });
    fireEvent.click(screen.getByRole('button', { name: 'দাঁতে ব্যথা Toothache' }));
    expect(screen.getByPlaceholderText(/উপরে থেকে সমস্যা বেছে নিন/)).toHaveValue('Toothache');
  });
  it('sends the single location as the permanent address and daily location', async () => {
    vi.mocked(apiFetch).mockImplementation(async (path) => ({ success: true, status: 200, data: path === '/patients' ? { patientNumber: 123 } : [] }));
    await act(async () => { render(<NewPatientPage />); });
    fireEvent.change(screen.getByLabelText('Full Name *'), { target: { value: 'Test Patient' } });
    fireEvent.change(screen.getByLabelText('Age *'), { target: { value: '25' } });
    fireEvent.change(screen.getByLabelText('Phone Number *'), { target: { value: '01700000000' } });
    fireEvent.change(screen.getByLabelText('লোকেশন / Location (Optional)'), { target: { value: 'কুষ্টিয়া' } });
    fireEvent.change(screen.getByLabelText('নিজে সমস্যা লিখুন / Add manually'), { target: { value: 'দাঁতে পুঁজ' } });
    fireEvent.click(screen.getByRole('button', { name: 'যোগ করুন' }));
    await act(async () => { fireEvent.click(screen.getByRole('button', { name: /^Save Patient$/ })); });
    const calls = vi.mocked(apiFetch).mock.calls;
    const permanent = calls.find(([path]) => path === '/patients');
    const daily = calls.find(([path]) => path === '/daily-patients');
    expect(JSON.parse(String(permanent?.[1]?.body))).toMatchObject({ address: 'কুষ্টিয়া', patientProblem: 'দাঁতে পুঁজ' });
    expect(JSON.parse(String(daily?.[1]?.body))).toMatchObject({ location: 'কুষ্টিয়া' });
  });
});