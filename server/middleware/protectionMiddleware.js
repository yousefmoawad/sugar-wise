// 🛡️ Protection Middleware - حماية الملفات الحساسة
// منع الوصول المباشر للملفات والمجلدات الحساسة

/**
 * منع الوصول للملفات الحساسة
 * لا نكشف عن وجودها أصلاً - نرجع 404 generic
 */
function protectSensitiveFiles(req, res, next) {
  const sensitivePatterns = [
    /^\/api\//i,
    /^\/services\//i,
    /^\/middleware\//i,
    /^\/config\//i,
    /^\/admin\//i,
    /^\/\.env/i,
    /^\/\.git/i,
    /^\/node_modules\//i,
    /^\/build\//i,
    /^\/dist\//i,
    /^\/package\.json/i,
    /^\/package-lock\.json/i,
    /^\/\.gitignore/i,
    /^\/\.secrets\//i,
    /^\/security\//i,
    /\.pem$/i,
    /\.key$/i,
    /\.crt$/i,
  ];

  // التحقق من المسار
  const path = req.path.toLowerCase();
  
  for (const pattern of sensitivePatterns) {
    if (pattern.test(path)) {
      // لا نكشف أن الملف يوجد - نرجع generic 404
      return res.status(404).json({
        error: 'Not Found',
        // بدون تفاصيل أخرى
      });
    }
  }

  next();
}

/**
 * منع الوصول بـ techniques معينة
 * (Directory Traversal, etc.)
 */
function preventTraversal(req, res, next) {
  // منع ../../../ و \..\ patterns
  if (req.path.includes('..') || req.path.includes('\\')) {
    console.warn(`⚠️ Traversal attempt detected: ${req.path} from ${req.ip}`);
    return res.status(400).json({ error: 'Invalid request' });
  }

  next();
}

/**
 * منع الوصول من أدوات معروفة للـ scanning
 */
function blockScanners(req, res, next) {
  const userAgent = (req.headers['user-agent'] || '').toLowerCase();
  
  // User-Agents المشهورة للـ scanning
  const scannerPatterns = [
    'sqlmap',
    'nikto',
    'nmap',
    'masscan',
    'nessus',
    'qualys',
    'burp',
    'zap',
    'metasploit',
    'acunetix',
    'nessusagent',
    'nuclei',
  ];

  for (const scanner of scannerPatterns) {
    if (userAgent.includes(scanner)) {
      console.warn(`⚠️ Scanner detected: ${req.headers['user-agent']} from ${req.ip}`);
      return res.status(403).json({ error: 'Access denied' });
    }
  }

  next();
}

module.exports = {
  protectSensitiveFiles,
  preventTraversal,
  blockScanners,
};
