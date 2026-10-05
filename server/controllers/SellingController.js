const Selling = require('../models/Selling');
const Payment = require('../models/Payment');

const syncSellingsFromPayments = async () => {
    const payments = await Payment.find({})
        .sort({ createdAt: -1 })
        .lean();

    for (const payment of payments) {
        const selling = await Selling.findOne({ payment: payment._id });
        const fallbackName = payment.name || 'Shop Purchase';
        const fallbackPrice = Number(payment.amount || payment.price || 0);

        if (!selling) {
            await Selling.create({
                payment: payment._id,
                product: payment.product || null,
                paymentMethod: payment.paymentMethod || '',
                fullName: payment.fullName || '',
                orderId: payment.orderId || '',
                Date: payment.Date || payment.createdAt || new Date(),
                name: fallbackName,
                price: fallbackPrice,
                status: 'Not yet shipping',
            });
            continue;
        }

        let changed = false;
        if (String(selling.paymentMethod || '') !== String(payment.paymentMethod || '')) {
            selling.paymentMethod = payment.paymentMethod || '';
            changed = true;
        }
        if (String(selling.fullName || '') !== String(payment.fullName || '')) {
            selling.fullName = payment.fullName || '';
            changed = true;
        }
        if (String(selling.orderId || '') !== String(payment.orderId || '')) {
            selling.orderId = payment.orderId || '';
            changed = true;
        }
        if (String(selling.name || '') !== String(fallbackName)) {
            selling.name = fallbackName;
            changed = true;
        }
        if (Number(selling.price || 0) !== fallbackPrice) {
            selling.price = fallbackPrice;
            changed = true;
        }
        if (String(selling.product || '') !== String(payment.product || '')) {
            selling.product = payment.product || null;
            changed = true;
        }
        if (String(selling.Date || '') !== String(payment.Date || '')) {
            selling.Date = payment.Date || payment.createdAt || new Date();
            changed = true;
        }
        if (changed) await selling.save();
    }
};

const createSelling = async (req, res) => {
    try {
        const { payment, product, status } = req.body;
        const newSelling = new Selling({ payment, product, status });
        const savedSelling = await newSelling.save();
        res.status(201).json({ success: true, data: savedSelling });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const getSellings = async (req, res) => {
    try {
        await syncSellingsFromPayments();
        const sellings = await Selling.find().populate('payment').populate('product');
        res.status(200).json({ success: true, count: sellings.length, data: sellings });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getSellingById = async (req, res) => {
    try {
        const selling = await Selling.findById(req.params.id).populate('payment').populate('product');
        if (!selling) {
            return res.status(404).json({ success: false, error: 'Selling record not found' });
        }
        res.status(200).json({ success: true, data: selling });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const updateSelling = async (req, res) => {
    try {
        const selling = await Selling.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true });
        if (!selling) {
            return res.status(404).json({ success: false, error: 'Selling record not found' });
        }
        res.status(200).json({ success: true, data: selling });
    } catch (error) {
        res.status(400).json({ success: false, error: error.message });
    }
};

const deleteSelling = async (req, res) => {
    try {
        const selling = await Selling.findByIdAndDelete(req.params.id);
        if (!selling) {
            return res.status(404).json({ success: false, error: 'Selling record not found' });
        }
        res.status(200).json({ success: true, data: {} });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

const getSellingStats = async (req, res) => {
    try {
        await syncSellingsFromPayments();
        const stats = await Selling.getDashboardStats();
        res.status(200).json({ success: true, data: stats });
    } catch (error) {
        res.status(500).json({ success: false, error: error.message });
    }
};

module.exports = {
    createSelling,
    getSellings,
    getSellingById,
    updateSelling,
    deleteSelling,
    getSellingStats
};
