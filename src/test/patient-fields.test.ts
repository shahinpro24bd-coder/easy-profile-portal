import { describe, expect, it } from 'vitest';
import { allowedPatientFields, appendPatientProblem } from '@/portal/lib/patient-fields';

describe('Patient registration rules', () => {
  it('excludes blood-group definitions, including required fields', () => {
    expect(allowedPatientFields([
      { key: 'blood_group', name: 'Blood Group', required: true },
      { key: 'bloodType', name: 'Blood Type' },
      { key: 'রক্ত', name: 'রক্তের গ্রুপ' },
      { key: 'occupation', name: 'Occupation' },
    ])).toEqual([{ key: 'occupation', name: 'Occupation' }]);
  });
  it('allows a manually written Bangla complaint alongside a selected tag', () => {
    expect(appendPatientProblem('Toothache', '  দাঁতে পুঁজ  ')).toBe('Toothache, দাঁতে পুঁজ');
  });
});