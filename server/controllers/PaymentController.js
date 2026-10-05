const Payment = require('../models/Payment');
const Billing = require('../models/Billing');
const Selling = require('../models/Selling');

const syncSellingFromPayment = async (paymentDoc) => {
    if (!paymentDoc?._id) return null;

    const existing = await Selling.findOne({ payment: paymentDoc._id });
    if (existing) {
        const fallbackName = paymentDoc.name || paymentDoc.productName || 'Shop Purchase';
        const fallbackPrice = Number(paymentDoc.amount || paymentDoc.price || 0);
        existing.paymentMethod = paymentDoc.paymentMethod || existing.paymentMethod;
        existing.fullName = paymentDoc.fullName || existing.fullName;
        existing.orderId = paymentDoc.orderId || existing.orderId;
        existing.Date = paymentDoc.Date || existing.Date;
        existing.product = paymentDoc.product || existing.product;
        existing.name = fallbackName;
        existing.price = fallbackPrice;
        await existing.save();
        return existing;
    }

    const fallbackName = paymentDoc.name || paymentDoc.productName || 'Shop Purchase';
    const fallbackPrice = Number(paymentDoc.amount || paymentDoc.price || 0);
    const selling = new Selling({
        payment: paymentDoc._id,
        product: paymentDoc.product || null,
        status: 'Not yet shipping',
        paymentMethod: paymentDoc.paymentMethod || '',
        fullName: paymentDoc.fullName || '',
        orderId: paymentDoc.orderId || '',
        Date: paymentDoc.Date || new Date(),
        name: fallbackName,
        price: fallbackPrice,
    });
    await selling.save();
    return selling;
};

// Create new payment
exports.createPayment = async (req, res) => {
    try {
        const {
            paymentMethod,
            firstName,
            lastName,
            telephoneNumber,
            secondNumber,
            shippingAddress,
            walletNumber,
            cardholderName,
            cardNumber,
            expiryDate,
            cvvCvc,
            product,
            userId: bodyUserId,
            amount,
            name,
        } = req.body;

        const userId = bodyUserId || req.authUser?._id || null;

        let billingId = null;

        if (paymentMethod === 'Visa') {
            const newBilling = new Billing({
                userId,
                cardholderName,
                cardNumber,
                expiryDate,
                cvvCvc,
            });
            const savedBilling = await newBilling.save();
            billingId = savedBilling._id;
        }

        const newPayment = new Payment({
            userId,
            paymentMethod,
            firstName,
            lastName,
            telephoneNumber,
            secondNumber,
            shippingAddress,
            walletNumber,
            billingId,
            product,
            amount: Number(amount || 0),
            name: String(name || '').trim(),
        });

        const savedPayment = await newPayment.save();
        await syncSellingFromPayment(savedPayment);
        const populatedPayment = await Payment.findById(savedPayment._id).populate('billingId');

        res.status(201).json({ success: true, data: populatedPayment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error creating payment', error: error.message });
    }
};

// Get all payments (scoped to user when possible)
exports.getAllPayments = async (req, res) => {
    try {
        const userId = req.query.userId || req.authUser?._id;
        const filter = userId ? { userId } : {};
        const payments = await Payment.find(filter).populate('billingId');
        res.status(200).json({ success: true, data: payments, count: payments.length });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching payments', error: error.message });
    }
};

// Get payment by ID
exports.getPaymentById = async (req, res) => {
    try {
        const query = req.params.id.startsWith('#ORD_') ? { orderId: req.params.id } : { _id: req.params.id };
        const payment = await Payment.findOne(query).populate('billingId');
        if (!payment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        res.status(200).json({ success: true, data: payment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error fetching payment', error: error.message });
    }
};

// Update payment
exports.updatePayment = async (req, res) => {
    try {
        const query = req.params.id.startsWith('#ORD_') ? { orderId: req.params.id } : { _id: req.params.id };
        const updatedPayment = await Payment.findOneAndUpdate(
            query,
            req.body,
            { new: true, runValidators: true }
        ).populate('billingId');

        if (!updatedPayment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }

        await syncSellingFromPayment(updatedPayment);

        res.status(200).json({ success: true, data: updatedPayment });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error updating payment', error: error.message });
    }
};

// Delete payment
exports.deletePayment = async (req, res) => {
    try {
        const query = req.params.id.startsWith('#ORD_') ? { orderId: req.params.id } : { _id: req.params.id };
        const deletedPayment = await Payment.findOneAndDelete(query);
        if (!deletedPayment) {
            return res.status(404).json({ success: false, message: 'Payment not found' });
        }
        res.status(200).json({ success: true, message: 'Payment deleted successfully' });
    } catch (error) {
        res.status(500).json({ success: false, message: 'Error deleting payment', error: error.message });
    }
};
