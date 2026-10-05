const express = require('express');
const cors = require('cors');
const dotenv = require('dotenv');
const path = require('path');

// ✅ Best Practice: Load env variables FIRST
dotenv.config();

const connectDB = require('./config/db');
const { startNotificationCleanupScheduler } = require('./services/notificationCleanupService');
const { startMessageRetentionScheduler } = require('./services/messageRetentionService');
const userRoutes = require('./routes/userRoutes');
const doctorRoutes = require('./routes/doctorRoutes');
const patientRoutes = require('./routes/patientRoutes');
const productRoutes = require('./routes/productRoutes');
const shopRoutes = require('./routes/shopRoutes');
const productviewRoutes = require('./routes/productviewRoutes');
const promocodeRoutes = require('./routes/promocodeRoutes');
const cartRoutes = require('./routes/cartRoutes');
const adminRoutes = require('./routes/adminRoutes');
const insulinunitsRoutes = require('./routes/insulinunitsRoutes');
const superadminRoutes = require('./routes/superadminRoutes');
const billingRoutes = require('./routes/BillingRoutes');
const paymentRoutes = require('./routes/PaymentRoutes');
const contactRoutes = require('./routes/ContactUsRoutes');
const sellingRoutes = require('./routes/SellingRoutes');
const verificationDoctorRoutes = require('./routes/VerificationDoctorRoutes');
const ordersRoutes = require('./routes/OrdersRoutes');
const messagesRoutes = require('./routes/MessagesRoutes');
const aiChatRoutes = require('./routes/AIChatRoutes');
const labTestRoutes = require('./routes/LabTestRoutes');
const fileRoutes = require('./routes/FileRoutes');
const bookDoctorRoutes = require('./routes/BookDoctorRoutes');
const diabetesMonitoringRoutes = require('./routes/DiabetesMonitoringRoutes');
const dietlySystemRoutes = require('./routes/DietlySystemRoutes');
const myClinicRoutes = require('./routes/MyClinicRoutes');
  const myPatientRoutes = require('./routes/MyPatientRoutes');
  const notificationRoutes = require('./routes/NotificationRoutes');
  const sinsorRoutes = require('./routes/SinsorRoutes');
  const presenceRoutes = require('./routes/presenceRoutes');
  const mobileRoutes = require('./routes/mobile');
  const { errorHandler } = require('./middleware/errorHandler');

// ✅ Connect to Database
connectDB();

// ✅ Start Notification Cleanup Scheduler (runs every 1 hour)
startNotificationCleanupScheduler(3600000);
startMessageRetentionScheduler(24 * 60 * 60 * 1000);

const app = express();

// Middleware
app.use(cors({
    origin: true,
    credentials: true,
}));
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));
app.use('/images', express.static(path.join(__dirname, 'public', 'images')));
app.use('/uploads', express.static(path.join(__dirname, 'public', 'uploads')));

// Routes
app.get('/', (req, res) => {
    res.json({ message: '🚀 API is running...' });
});

app.use('/api/users', userRoutes);
app.use('/api/doctors', doctorRoutes);
app.use('/api/patients', patientRoutes);
app.use('/api/products', productRoutes);
app.use('/api/shop', shopRoutes);
app.use('/api/productview', productviewRoutes);
app.use('/api/promocodes', promocodeRoutes);
app.use('/api/cart', cartRoutes);
app.use('/api/admins', adminRoutes);
app.use('/api/insulinunits', insulinunitsRoutes);
app.use('/api/superadmins', superadminRoutes);
app.use('/api/billings', billingRoutes);
app.use('/api/payments', paymentRoutes);
app.use('/api/contacts', contactRoutes);
app.use('/api/selling', sellingRoutes);
app.use('/api/verification-doctor', verificationDoctorRoutes);
app.use('/api/orders', ordersRoutes);
app.use('/api/messages', messagesRoutes);
app.use('/api/ai-chat', aiChatRoutes);
app.use('/api/lab-test', labTestRoutes);
app.use('/api/files', fileRoutes);
app.use('/api/book-doctor', bookDoctorRoutes);
app.use('/api/diabetes-monitoring', diabetesMonitoringRoutes);
app.use('/api/dietly-system', dietlySystemRoutes);
app.use('/api/myclinic', myClinicRoutes);
app.use('/api/my-patient', myPatientRoutes);
  app.use('/api/notifications', notificationRoutes);
  app.use('/api/sinsors', sinsorRoutes);
  app.use('/api/presence', presenceRoutes);
  app.use('/api/mobile', mobileRoutes);

// 404 Handler
app.use((req, res) => {
    res.status(404).json({ success: false, message: 'Route not found' });
});

// Global Error Handler
app.use(errorHandler);

// Start Server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
});
