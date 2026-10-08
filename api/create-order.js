export default async function handler(req, res) {
    if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

    const { amount, receipt } = req.body;
    
    // In Vercel, you set these in the dashboard: Settings -> Environment Variables
    const KEY_ID = process.env.RAZORPAY_KEY_ID || "YOUR_TEST_KEY_ID";
    const KEY_SECRET = process.env.RAZORPAY_KEY_SECRET || "YOUR_TEST_KEY_SECRET";

    const auth = Buffer.from("${KEY_ID}:${KEY_SECRET}").toString('base64');

    try {
        const response = await fetch('https://api.razorpay.com/v1/orders', {
            method: 'POST',
            headers: {
                'Authorization': "Basic ${auth}",
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                amount: Math.round(amount * 100), // Razorpay takes amount in paise (1 INR = 100 paise)
                currency: "INR",
                receipt: receipt || "receipt_" + Date.now()
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
