// 🛡️ Security Middleware for Express
// استخدم هذا في server.js

const helmet = require('helmet');
const cors = require('cors');
const rateLimit = require('express-rate-limit');

/**
 * تفعيل جميع رؤوس الأمان
 */
function setupSecurityHeaders(app) {
  // 1. Helmet: يضيف رؤوس أمان مختلفة
  app.use(helmet());

  // 2. CORS: تحديد الـ domains المسموح لها
  const allowedOrigins = (process.env.ALLOWED_ORIGINS || 'http://localhost:3000').split(',');
  app.use(cors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  }));

  // 3. Rate Limiting: منع Brute Force Attacks
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 دقيقة
    max: 100, // حد أقصى 100 طلب
    message: 'عدد الطلبات كثير جداً من هذا الـ IP، الرجاء المحاولة لاحقاً',
    standardHeaders: true,
    legacyHeaders: false,
  });

  app.use('/api/', limiter);

  // 4. منع Parameter Pollution
  app.use((req, res, next) => {
    // Check for suspicious patterns that could indicate fuzzing attacks
    const suspiciousPatterns = [
      /\.\.\//, // Directory traversal attempts
      /\x00/, // Null bytes
      /\\/g, // Backslashes in weird contexts
    ];

    const queryString = JSON.stringify(req.query) + JSON.stringify(req.body);
    
    for (const pattern of suspiciousPatterns) {
      if (pattern.test(queryString)) {
        console.warn('⚠️ Suspicious request detected:', req.ip);
        return res.status(400).json({ error: 'Invalid request' });
        
      }
    }
    next();
  });

  // 5. Hide Express version
  app.disable('x-powered-by');

  // 6. Security Headers
  app.use((req, res, next) => {
    res.setHeader('X-Content-Type-Options', 'nosniff');
    res.setHeader('X-Frame-Options', 'DENY');
    res.setHeader('X-XSS-Protection', '1; mode=block');
    res.setHeader('Strict-Transport-Security', 'max-age=31536000; includeSubDomains');
    next();
  });
}

module.exports = { setupSecurityHeaders };
