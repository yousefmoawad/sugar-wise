const User = require('../models/User');
const DiabetesMonitoring = require('../models/DiabetesMonitoring');
const DietlySystem = require('../models/DietlySystem');

const TOPICS = [
  {
    id: 'hypoglycemia',
    keywords: [
      'low sugar',
      'low blood sugar',
      'hypo',
      'hypoglycemia',
      'bg low',
      'sugar low',
      'هبوط',
      'هبوط سكر',
      'انخفاض السكر',
      'انخفاض سكر',
      'سكر منخفض',
      'سكر واطي',
      'واطي',
      'نازل',
      'هبط',
      'هبطان',
    ],
    title: 'Low blood sugar support',
    sections: [
      'Low blood sugar often causes sweating, shakiness, hunger, dizziness, confusion, or fast heartbeat.',
      'If the patient is awake and able to swallow, give 15 grams of fast-acting sugar such as glucose tablets, juice, or regular soda.',
      'Recheck after 15 minutes. If the reading is still low, repeat the same fast sugar step.',
      'After recovery, eat a small snack or meal with carbs plus protein if the next meal is not soon.',
    ],
    urgent: 'Seek urgent medical help immediately if the person faints, has a seizure, cannot swallow safely, or does not improve.',
  },
  {
    id: 'hyperglycemia',
    keywords: [
      'high sugar',
      'high blood sugar',
      'hyperglycemia',
      'ketone',
      'ketones',
      'ketoacidosis',
      'dkA',
      'bg high',
      'sugar high',
      'ارتفاع السكر',
      'ارتفاع سكر',
      'سكر عالي',
      'سكر عاليه',
      'سكر مرتفع',
      'عالي',
      'مرتفع',
      'حماض',
      'كيتون',
      'كيتونات',
    ],
    title: 'High blood sugar guidance',
    sections: [
      'High blood sugar can cause thirst, frequent urination, fatigue, blurred vision, nausea, or headache.',
      'Encourage water intake unless a doctor has limited fluids for another reason.',
      'Review missed insulin doses, recent illness, stress, or unusually high carbohydrate intake.',
      'If the reading stays very high, follow the patient-specific correction plan from the treating doctor.',
    ],
    urgent: 'Get urgent medical help if vomiting, deep breathing, dehydration, abdominal pain, drowsiness, or ketones are present.',
  },
  {
    id: 'insulin',
    keywords: ['insulin', 'dose', 'units', 'lantus', 'novorapid', 'humalog', 'basal', 'bolus', 'جرعة', 'وحدات', 'أنسولين', 'انسولين'],
    title: 'Insulin basics',
    sections: [
      'Basal insulin usually supports blood sugar between meals and overnight, while rapid or bolus insulin is commonly used for meals or correction.',
      'Injection timing, meal timing, and site rotation all affect the result.',
      'Do not change the dose pattern suddenly without the treating doctor plan, especially in children or patients with frequent lows.',
      'Keep a record of glucose readings, insulin dose, meals, exercise, and symptoms to discuss with the medical team.',
    ],
    urgent: 'If insulin was missed and the patient now has very high glucose, vomiting, or ketones, seek urgent care.',
  },
  {
    id: 'diet',
    keywords: [
      'food',
      'diet',
      'meal',
      'carb',
      'carbs',
      'carbohydrate',
      'nutrition',
      'meal plan',
      'أكل',
      'الاكل',
      'الأكل',
      'غذاء',
      'غذائي',
      'نظام غذائي',
      'كربوهيدرات',
      'نشويات',
      'وجبة',
      'اكل',
    ],
    title: 'Nutrition support',
    sections: [
      'Balanced meals usually work better when they include measured carbohydrates, protein, vegetables, and healthy fats.',
      'Carbohydrate counting is useful because it helps match food amount with insulin plan when prescribed.',
      'Sugary drinks can raise glucose quickly, while fiber and protein often slow the rise after meals.',
      'A food log with meal time and glucose readings can help identify which meals trigger spikes or lows.',
    ],
    urgent: 'If the patient cannot eat, is vomiting repeatedly, or has signs of dehydration, contact urgent care.',
  },
  {
    id: 'exercise',
    keywords: ['exercise', 'sport', 'walking', 'training', 'gym', 'رياضة', 'تمرين', 'مشي', 'رياضه', 'جيم'],
    title: 'Exercise and diabetes',
    sections: [
      'Exercise can lower glucose during activity and for hours afterward, especially with insulin or some diabetes medicines.',
      'Check glucose before activity when the patient has a history of lows, long exercise sessions, or recent insulin dosing.',
      'Keep fast sugar available during sports in case symptoms of low blood sugar appear.',
      'Hydration matters, especially in hot weather or during prolonged activity.',
    ],
    urgent: 'Delay exercise and ask for medical advice if glucose is very high with ketones or if the patient feels unwell.',
  },
  {
    id: 'foot-care',
    keywords: ['foot', 'feet', 'wound', 'ulcer', 'infection', 'قدم', 'القدم', 'جرح', 'قرحة', 'التهاب', 'صديد'],
    title: 'Foot care basics',
    sections: [
      'Inspect feet daily for redness, blisters, cracks, swelling, or wounds.',
      'Keep feet clean and dry, especially between toes.',
      'Use properly fitting shoes and avoid walking barefoot if sensation is reduced.',
      'Any persistent wound should be assessed early to reduce the risk of infection.',
    ],
    urgent: 'Seek prompt medical review for spreading redness, pus, fever, severe pain, or a wound that is not healing.',
  },
];

const ARABIC_RE = /[\u0600-\u06FF]/;

function normalizeText(value) {
  return String(value || '').trim().toLowerCase();
}

function extractGlucoseReadingFromMessage(message) {
  const text = String(message || '');
  const hasSugarContext = /glucose|sugar|reading|mg\/dl|mmol|سكر|قراءة|قياس/i.test(text);
  if (!hasSugarContext) return null;

  const unit = /mmol/i.test(text) ? 'mmol/L' : 'mg/dL';
  const match = text.match(/(\d+(\.\d+)?)/);
  if (!match) return null;

  const value = Number(match[1]);
  if (!Number.isFinite(value)) return null;

  // Basic plausibility checks to avoid grabbing random numbers (phone/order/etc).
  if (unit === 'mmol/L') {
    if (value < 1 || value > 40) return null;
  } else {
    if (value < 18 || value > 600) return null;
  }

  const mgdl = unit === 'mmol/L' ? value * 18 : value;
  return { value, unit, mgdl };
}

function inferTopicFromReading(reading) {
  if (!reading) return null;
  if (reading.mgdl < 70) return 'hypoglycemia';
  if (reading.mgdl > 180) return 'hyperglycemia';
  return null;
}

function scoreTopic(message, topic) {
  const text = normalizeText(message);
  return topic.keywords.reduce((score, keyword) => {
    return score + (text.includes(normalizeText(keyword)) ? 1 : 0);
  }, 0);
}

function buildGenericResponse(message) {
  const isArabic = ARABIC_RE.test(message);
  if (isArabic) {
    return [
      'أقدر أساعدك بمعلومات طبية عامة مرتبطة بالسكر مثل: ارتفاع أو انخفاض السكر، الأنسولين، الوجبات، الرياضة، والجروح.',
      'اكتب سؤالك بشكل واضح مع العمر أو الأعراض أو قراءة السكر الحالية لو متاحة.',
      'إذا كان هناك فقدان وعي، قيء متكرر، صعوبة تنفس، ألم شديد، أو تشنجات، لازم تدخل طبي عاجل فورًا.',
      'هذه معلومات تثقيفية ولا تغني عن الطبيب المعالج أو الطوارئ.',
    ].join('\n');
  }
  return [
    'I can help with general diabetes-related medical information such as low sugar, high sugar, insulin, food, exercise, and wound care.',
    'Try asking with more detail such as age, symptoms, or the current glucose reading if available.',
    'If there is fainting, repeated vomiting, breathing trouble, severe pain, or seizures, seek urgent medical care immediately.',
    'This is educational guidance and does not replace the treating clinician.',
  ].join('\n');
}

async function getPatientContext(authUser) {
  const userId = authUser?._id || authUser?.id || null;
  if (!userId) return null;

  const user = await User.findById(userId).select('patient').lean();
  const patientId = user?.patient || authUser?.patient || null;
  if (!patientId) return null;

  // جلب أحدث قراءات السكر مع التأكد من تحديث البيانات
  const recentReadings = await DiabetesMonitoring.find({ patient: patientId })
    .sort({ date: -1, time: -1, createdAt: -1 })
    .limit(5)
    .lean();

  // جلب أحدث الوجبات مع التأكد من تحديث البيانات
  const recentMeals = await DietlySystem.find({ patientId })
    .sort({ createdAt: -1 })
    .limit(3)
    .lean();

  if (!recentReadings.length && !recentMeals.length) {
    return null;
  }

  const context = {
    readingsCount: recentReadings.length,
    mealsCount: recentMeals.length,
    latestReading: null,
    avgGlucose: null,
    avgGlucoseUnit: null,
    mealNames: [],
    avgCarbs: null,
    glucoseSummary: '',
    mealSummary: '',
  };

  if (recentReadings.length) {
    const latest = recentReadings[0];
    const avg =
      recentReadings.reduce((sum, item) => sum + Number(item.level || 0), 0) / recentReadings.length;
    context.latestReading = {
      level: Number(latest.level),
      unit: latest.unit || 'mg/dL',
      date: latest.date,
      time: latest.time,
    };
    context.avgGlucose = Number.isFinite(avg) ? avg : null;
    context.avgGlucoseUnit = latest.unit || 'mg/dL';
    context.glucoseSummary = `Latest glucose reading: ${latest.level} ${latest.unit} on ${latest.date} at ${latest.time}. Average of last ${recentReadings.length} readings: ${avg.toFixed(1)} ${latest.unit}.`;
  }

  if (recentMeals.length) {
    const names = recentMeals.map((meal) => meal.name).filter(Boolean);
    const avgCarbs =
      recentMeals.reduce((sum, item) => sum + Number(item.carbs || 0), 0) / recentMeals.length;
    context.mealNames = names;
    context.avgCarbs = Number.isFinite(avgCarbs) ? avgCarbs : null;
    context.mealSummary = `Recent saved meals: ${names.join(', ')}. Average carbs across recent meals: ${avgCarbs.toFixed(1)} g.`;
  }

  return context;
}

function buildPersonalizedAddOn(context, isArabic) {
  if (!context) return '';

  const parts = [];

  if (context.latestReading && context.avgGlucose != null) {
    if (isArabic) {
      parts.push(
        `آخر قراءة سكر محفوظة: ${context.latestReading.level} ${context.latestReading.unit} (${context.latestReading.date || 'مؤخرًا'} ${context.latestReading.time || ''}).`
      );
      parts.push(
        `متوسط آخر ${context.readingsCount || 0} قراءات: ${context.avgGlucose.toFixed(1)} ${context.avgGlucoseUnit || context.latestReading.unit}.`
      );
    } else {
      parts.push(context.glucoseSummary);
    }

    const inferred = inferTopicFromReading({
      mgdl: context.latestReading.unit === 'mmol/L' ? context.latestReading.level * 18 : context.latestReading.level,
    });
    if (inferred && isArabic) {
      parts.push('ملاحظة: حسب آخر قراءة، قد تحتاج إرشادات هبوط/ارتفاع السكر.');
    }
  }

  if (context.mealNames && context.mealNames.length) {
    if (isArabic) {
      const avgCarbsText = context.avgCarbs != null ? `${context.avgCarbs.toFixed(1)} جم` : 'غير متاح';
      parts.push(`آخر وجبات محفوظة: ${context.mealNames.join('، ')}.`);
      parts.push(`متوسط الكربوهيدرات في الوجبات الأخيرة: ${avgCarbsText}.`);
    } else {
      parts.push(context.mealSummary);
    }
  }

  if (!parts.length) return '';
  return isArabic
    ? ['ملخص من بياناتك الحالية:', ...parts].join('\n')
    : ['Personal context from your saved data:', ...parts].join('\n');
}

exports.chatWithMedicalAssistant = async (req, res) => {
  try {
    const message = String(req.body?.message || '').trim();
    if (!message) {
      return res.status(400).json({ success: false, error: 'Message is required' });
    }

    const ranked = TOPICS
      .map((topic) => ({ topic, score: scoreTopic(message, topic) }))
      .sort((a, b) => b.score - a.score);

    const best = ranked[0];
    const isArabic = ARABIC_RE.test(message);
    const readingFromMessage = extractGlucoseReadingFromMessage(message);
    
    // استخدام البيانات المحدثة من العميل إذا كانت متوفرة
    let patientContext = null;
    if (req.body?.patientData) {
      // استخدام البيانات المرسلة من العميل
      const patientData = req.body.patientData;
      
      // بناء ملخص من البيانات المرسلة
      let glucoseSummary = '';
      if (patientData.glucoseReadings && patientData.glucoseReadings.length > 0) {
        const latest = patientData.glucoseReadings[0];
        const avg = patientData.glucoseReadings.reduce((sum, item) => sum + Number(item.level || 0), 0) / patientData.glucoseReadings.length;
        glucoseSummary = `Latest glucose reading: ${latest.level} ${latest.unit || 'mg/dL'} on ${latest.date || 'recently'}. Average of last ${patientData.glucoseReadings.length} readings: ${avg.toFixed(1)} ${latest.unit || 'mg/dL'}.`;
      }
      
      let mealSummary = '';
      if (patientData.meals && patientData.meals.length > 0) {
        const names = patientData.meals.map((meal) => meal.name).filter(Boolean).join(', ');
        const avgCarbs = patientData.meals.reduce((sum, item) => sum + Number(item.carbs || 0), 0) / patientData.meals.length;
        mealSummary = `Recent saved meals: ${names}. Average carbs across recent meals: ${avgCarbs.toFixed(1)} g.`;
      }
      
      if (glucoseSummary || mealSummary) {
        patientContext = {
          glucoseSummary,
          mealSummary,
        };
      }
    }
    
    // إذا لم تكن هناك بيانات من العميل، جلبها من قاعدة البيانات
    if (!patientContext) {
      patientContext = await getPatientContext(req.authUser || req.user || null);
    }
    
    const personalizedAddOn = buildPersonalizedAddOn(patientContext, isArabic);

    const inferredFromMessage = inferTopicFromReading(readingFromMessage);
    const inferredFromContext =
      patientContext?.latestReading
        ? inferTopicFromReading({
          mgdl:
            patientContext.latestReading.unit === 'mmol/L'
              ? Number(patientContext.latestReading.level) * 18
              : Number(patientContext.latestReading.level),
        })
        : null;
    const inferredTopicId = inferredFromMessage || inferredFromContext || null;

    const bestTopic = best?.topic || null;
    const resolvedTopic =
      (best && best.score > 0 && bestTopic) || (inferredTopicId ? TOPICS.find((t) => t.id === inferredTopicId) : null);

    if (!resolvedTopic) {
      return res.status(200).json({
        success: true,
        data: {
          answer: [buildGenericResponse(message), personalizedAddOn].filter(Boolean).join('\n\n'),
          matchedTopic: 'generic',
        },
      });
    }

    let answer = '';

    if (isArabic) {
      const arabicTitleMap = {
        hypoglycemia: 'معلومات عن هبوط السكر',
        hyperglycemia: 'معلومات عن ارتفاع السكر',
        insulin: 'معلومات عن الأنسولين',
        diet: 'معلومات غذائية',
        exercise: 'معلومات عن الرياضة والسكر',
        'foot-care': 'معلومات عن العناية بالقدم',
      };
      answer = [
        arabicTitleMap[resolvedTopic.id] || 'معلومة طبية',
        ...resolvedTopic.sections.map((line, index) => `${index + 1}. ${line}`),
        personalizedAddOn,
        `تنبيه مهم: ${resolvedTopic.urgent}`,
        'هذه معلومات عامة للتثقيف الطبي وليست بديلاً عن تشخيص أو خطة الطبيب المعالج.',
      ]
        .filter(Boolean)
        .join('\n');
    } else {
      answer = [
        resolvedTopic.title,
        ...resolvedTopic.sections.map((line, index) => `${index + 1}. ${line}`),
        personalizedAddOn,
        `Important: ${resolvedTopic.urgent}`,
        'This is general educational medical information and not a substitute for the treating doctor.',
      ]
        .filter(Boolean)
        .join('\n');
    }

    return res.status(200).json({
      success: true,
      data: {
        answer,
        matchedTopic: resolvedTopic.id,
      },
    });
  } catch (error) {
    return res.status(500).json({ success: false, error: error.message });
  }
};
