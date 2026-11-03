import { describe, expect, it } from 'vitest';
import { createPaymentReversalRequest } from '@/portal/lib/api/payment-reversal';

describe('Patient payment reversal', () => {
  it.each(['ভুল', 'ক', 'x', 'নিজের মতো যেকোনো কারণ'])('accepts free text: %s', (reason) => {
    const request = createPaymentReversalRequest(1248, { id: 'pay-1' }, reason);
    expect(JSON.parse(request.options.body)).toEqual({ reason, reversalReason: reason });
  });

  it('uses the payment database identifier when id is absent', () => {
    expect(createPaymentReversalRequest(1248, { _id: 'payment-7' }, 'ভুল').endpoint)
      .toBe('/receipts/1248/payments/payment-7/revert');
  });

  it('rejects whitespace-only reasons', () => {
    expect(() => createPaymentReversalRequest(1248, { id: 'pay-1' }, '  ')).toThrow('কারণ লিখুন।');
  });

  it('does not send a request for a payment without an identifier', () => {
    expect(() => createPaymentReversalRequest(1248, {}, 'ভুল')).toThrow('এই পেমেন্টের পরিচয় পাওয়া যায়নি।');
  });
});