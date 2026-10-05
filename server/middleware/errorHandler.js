// 🛡️ Enhanced Error Handling Middleware
// معالج أخطاء آمن - يخفي البيانات الحساسة في production

const errorHandler = (err, req, res, next) => {
    const isDevelopment = process.env.NODE_ENV === 'development';
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // تسجيل الخطأ بشكل آمن
    console.error(`[ERROR] ${new Date().toISOString()}:`, {
        message: err.message,
        status: statusCode,
        path: req.path,
        ip: req.ip,
        timestamp: new Date().toISOString(),
    });

    // في production: إخفاء البيانات الحساسة
    if (!isDevelopment) {
        // لا نُرسل stack trace أو تفاصيل الأخطاء الداخلية
        return res.status(statusCode).json({
            success: false,
            message: statusCode === 401 || statusCode === 403 
                ? 'Access denied' 
                : 'An error occurred while processing your request',
            // عدم كشف معلومات النظام
        });
    }

    // في development: نُرسل التفاصيل كاملة للمساعدة في التطوير
    res.status(statusCode).json({
        success: false,
        message: err.message || 'Internal Server Error',
        stack: err.stack,
        details: err.details || {},
    });
};

/**
 * معالج الـ 404
 */
const notFoundHandler = (req, res) => {
    res.status(404).json({
        success: false,
        message: 'Endpoint not found',
        // لا نكشف structure الـ routes
    });
};

module.exports = { errorHandler, notFoundHandler };
