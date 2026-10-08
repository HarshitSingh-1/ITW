import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "YOUR_TEST_KEY_SECRET";

    // Create HMAC SHA256 string
    const generated_signature = crypto
        .createHmac('sha256', KEY_SECRET)
        .update("${razorpay_order_id}|${razorpay_payment_id}")
        .digest('hex');

    if (generated_signature === razorpay_signature) {
        // Signature matches! Payment is legit.
        res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
        res.status(400).json({ success: false, error: 'Invalid signature' });
    }
}
