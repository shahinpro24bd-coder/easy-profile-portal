type PaymentReference = { id?: string; _id?: string };

export function createPaymentReversalRequest(
  receiptNumber: number,
  payment: PaymentReference,
  reason: string,
) {
  const text = reason.trim();
  if (!text) throw new Error('কারণ লিখুন।');
  const paymentId = payment.id || payment._id;
  if (!paymentId || !Number.isFinite(receiptNumber) || receiptNumber <= 0) {
    throw new Error('এই পেমেন্টের পরিচয় পাওয়া যায়নি। প্রোফাইল আবার খুলে চেষ্টা করুন।');
  }
  return {
    endpoint: `/receipts/${receiptNumber}/payments/${encodeURIComponent(paymentId)}/revert`,
    options: {
      method: 'POST',
      body: JSON.stringify({ reason: text, reversalReason: text }),
    },
  };
}