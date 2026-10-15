export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { payment_id, amount, reason } = req.body;
    if (!payment_id) return res.status(400).json({ error: 'Payment ID is required for refund' });

    // Hardcoded Test Keys
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
