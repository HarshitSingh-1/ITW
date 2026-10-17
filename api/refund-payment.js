/**
 * =========================================================================
 * Vercel Serverless Function: Automatic Instant Payment Refund
 * Route: POST /api/refund-payment
 * =========================================================================
 * ARCHITECTURAL RATIONALE (RACE CONDITION RESOLUTION):
 * When two students initiate payment simultaneously for the last remaining ticket:
 * 1. Both gateways may capture payment before the database lock is evaluated.
 * 2. When PostgreSQL executes `book_ticket_safe` with `FOR UPDATE` row lock,
 *    only ONE user succeeds, while the other is rejected with `CAPACITY_EXCEEDED`.
 * 3. Instead of leaving the student with deducted money and no ticket, the client
 *    immediately calls this endpoint to trigger an automatic instant refund via
 *    the Razorpay Refunds API (`POST /v1/payments/{payment_id}/refund`).
 * 4. The student receives an instant on-screen receipt with their live Razorpay `refundId`.
 */

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { payment_id, amount, reason } = req.body;
    if (!payment_id) return res.status(400).json({ error: 'Payment ID is required for refund' });

    // Razorpay Test Mode Credentials
    const KEY_ID = "rzp_test_TlHHyvp8triN6e";
    const KEY_SECRET = "8dozc6Ch4EQnyh0XIlBMB0jN";
    const auth = Buffer.from(KEY_ID + ':' + KEY_SECRET).toString('base64');

    try {
        const payload = {
            notes: {
                reason: reason || 'Booking capacity exceeded / race condition'
            }
        };
        // If specific amount provided, include it (in paise)
        if (amount) payload.amount = Math.round(amount);

        // Execute refund against Razorpay Payments API
        const response = await fetch(`https://api.razorpay.com/v1/payments/${payment_id}/refund`, {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(payload)
        });

        const data = await response.json();

        if (!response.ok) {
            throw new Error(data.error?.description || 'Failed to process refund with Razorpay');
        }

        // Return verified refund metadata to client
        res.status(200).json({
            success: true,
            refundId: data.id,
            paymentId: data.payment_id,
            amount: data.amount ? data.amount / 100 : amount / 100,
            status: data.status
        });
    } catch (error) {
        console.error('Razorpay Refund API error:', error);
        res.status(500).json({ success: false, error: error.message });
    }
}
