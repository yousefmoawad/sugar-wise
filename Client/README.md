# واجهة Sugar Wise

واجهة Sugar Wise مبنية باستخدام React وCreate React App. التوثيق الكامل لمعمارية المشروع وإعداد الواجهة والخادم موجود في [README الرئيسي](../README.md).

## التشغيل

```bash
npm install
npm start
```

تعمل الواجهة افتراضيًا على `http://localhost:3000`، وتستخدم إعداد `proxy` في `package.json` لتوجيه طلبات التطوير إلى خادم API على `http://localhost:5000`.

لضبط عنوان مختلف للخادم، انسخ `.env.example` إلى `.env` وعدّل `REACT_APP_API_BASE_URL`، ثم أعد تشغيل خادم التطوير.
