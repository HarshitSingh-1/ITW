/**
 * =========================================================================
 * Vercel Serverless Function: Create Razorpay Order
 * Route: POST /api/create-order
 * =========================================================================
 * ARCHITECTURAL RATIONALE:
 * 1. Secret Protection:
 *    Orders MUST be initialized on the backend. Exposing the Razorpay Key Secret
 *    in client-side code would allow any user to tamper with order pricing or drain funds.
 * 2. Paise Precision:
 *    Razorpay expects currency values in sub-units (1 INR = 100 paise).
 * 3. Flow:
 *    Client -> POST /api/create-order { amount, receipt } -> Razorpay REST API
 *    Response -> Returns `orderId` -> Client opens Razorpay Checkout modal.
 */

export default async function handler(req, res) {
    // Only accept POST requests
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, receipt } = req.body;
    
    // Razorpay Test Mode Credentials
    const KEY_ID = "rzp_test_TlHHyvp8triN6e";
    const KEY_SECRET = "8dozc6Ch4EQnyh0XIlBMB0jN";

    // Encode Basic Authentication token
    const auth = Buffer.from(KEY_ID + ':' + KEY_SECRET).toString('base64');

    try {
        // Request order creation from official Razorpay API
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // Convert INR to Paise (e.g. ₹50 -> 5000 paise)
                currency: 'INR',
                receipt: receipt || 'receipt_' + Date.now()
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.description || 'Failed to create order');
        }

        // Return orderId back to client
        res.status(200).json({ orderId: data.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
