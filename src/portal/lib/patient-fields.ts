type Field = { key?: string; name?: string; options?: unknown[] };

export function isBloodGroupField(field: Field): boolean {
  const labels = [field.key, field.name].filter(Boolean).join(' ').toLowerCase().replace(/[_-]/g, ' ');
  return /blood\s*(group|type)|রক্তের?\s*গ্রুপ|রক্তের ধরন/.test(labels)
    || (Array.isArray(field.options) && ['A+', 'B+', 'AB+', 'O+'].every(group => field.options?.includes(group)));
}

export function allowedPatientFields<T extends Field>(fields: T[]): T[] {
  return fields.filter(field => !isBloodGroupField(field));
}

export function appendPatientProblem(value: string, problem: string): string {
  const entry = problem.trim();
  if (!entry) return value;
  const parts = value.split(',').map(part => part.trim()).filter(Boolean);
  if (parts.some(part => part.toLowerCase() === entry.toLowerCase())) return value;
  return [...parts, entry].join(', ');
}