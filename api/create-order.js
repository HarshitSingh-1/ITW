export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, receipt } = req.body;
    
    // Hardcoded Test Keys
    const KEY_ID = "rzp_test_TlHHyvp8triN6e";
    const KEY_SECRET = "8dozc6Ch4EQnyh0XIlBMB0jN";

    const auth = Buffer.from(KEY_ID + ':' + KEY_SECRET).toString('base64');

    try {
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': 'Basic ' + auth,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // Razorpay takes amount in paise (1 INR = 100 paise)
                currency: 'INR',
                receipt: receipt || 'receipt_' + Date.now()
            })
        });

        const data = await response.json();
        
        if (!response.ok) {
            throw new Error(data.error?.description || 'Failed to create order');
        }

        res.status(200).json({ orderId: data.id });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
}
