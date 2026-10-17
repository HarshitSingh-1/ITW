/**
 * =========================================================================
 * Vercel Serverless Function: Cryptographic Payment Signature Verification
 * Route: POST /api/verify-payment
 * =========================================================================
 * SECURITY RATIONALE:
 * When a student pays on Razorpay, Razorpay returns:
 *   - razorpay_order_id
 *   - razorpay_payment_id
 *   - razorpay_signature
 * 
 * To prevent payment spoofing or malicious client-side response tampering,
 * this backend endpoint mathematically re-generates the signature:
 *   Signature = HMAC_SHA256(order_id + "|" + payment_id, KEY_SECRET)
 * 
 * If and only if the generated signature matches `razorpay_signature`,
 * the payment is certified authentic before a ticket is minted.
 */

import crypto from 'crypto';

export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { razorpay_order_id, razorpay_payment_id, razorpay_signature } = req.body;
    
    // Server-Side Secret Key
    const KEY_SECRET = "8dozc6Ch4EQnyh0XIlBMB0jN";

    // Create HMAC SHA256 string
    const generated_signature = crypto
        .createHmac('sha256', KEY_SECRET)
        .update(razorpay_order_id + '|' + razorpay_payment_id)
        .digest('hex');

    if (generated_signature === razorpay_signature) {
        // Signature matches! Payment is legit.
        res.status(200).json({ success: true, message: 'Payment verified successfully' });
    } else {
        res.status(400).json({ success: false, error: 'Invalid signature' });
    }
}
