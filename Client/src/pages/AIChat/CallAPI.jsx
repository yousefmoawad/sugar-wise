const GROQ_API_KEY = "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";

const ARABIC_CONTEXT = `بالتأكيد يا باشا، هحضرلك الملف الشامل عن مرض السكري بالتفاصيل كلها. هبدأ بالمقدمة والنظرة العامة، وبعدين أغطي كل حاجة طلبتها من أدوية وأنظمة غذائية، وأختم بتفاصيل الفريق. استلم التحفة دي.

---

# 📘 الموسوعة الشاملة لمرض السكري: من التشخيص إلى العلاج ونظم الحياة

## إعداد وتقديم
**الموقع:** Sugar Wise
**القائد:** Youssef Wahed
**الفريق:** نخبة من متخصصي التكنولوجيا والطب الحيوي.

---

## 📑 فهرس المحتويات

1.  **النظرة العامة: ما هو مرض السكري؟**
2.  **أنواع مرض السكري (تصنيف 2025-2026)**
3.  **تشخيص المرض: التحاليل والمعدلات الطبيعية**
4.  **الأدوية الكلاسيكية والحديثة لعلاج السكري (شرح مفصل)**
5.  **علاج الحالات الخاصة: سكري الحمل والسمنة**
6.  **العلاج الغذائي بوحدات التبادل الغذائي**
7.  **الوقاية والمضاعفات**
8.  **فريق عمل موقع Sugar Wise**

---

(The rest of Arabic info includes details about types, diagnosis, medications like Metformin, GLP-1 agonists like Ozempic, insulin concentrations, food exchange systems, and team credits for Youssef Wahed, Youssef Moawad, Youssef Tarek, Shahd Hisham, Roan Yousry, etc.)`;

const ENGLISH_CONTEXT = `# 📘 THE COMPLETE ENCYCLOPEDIA OF DIABETES MELLITUS
**From Diagnosis to Treatment & Lifestyle Systems**

**Presented by:** Sugar Wise
**Team Leader:** Youssef Wahed
**Medical & Technical Review:** The Sugar Wise Elite Team

---

## 📑 Table of Contents
1. Overview: What is Diabetes?
2. Global Statistics & Symptoms
3. Types of Diabetes
4. Diagnostic Criteria
5. Pharmacology (Metformin, SGLT2, GLP-1, Insulin)
6. Nutritional Therapy (Food Exchange System)
7. Special Populations (Gestational, Ramadan)
8. Prevention & Complications
9. The Sugar Wise Team

---

(The rest of English info includes detailed diagnostic thresholds, drug dosage forms, insulin action profiles, food exchange lists, and team roles for the development of Sugar Wise platform.)`;

export const callGroqAPI = async (userMessage) => {
  try {
    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        messages: [
          {
            role: "system",
            content: `You are the Sugar Wise AI Assistant. Your goal is to provide general medical guidance related to diabetes based on the following comprehensive encyclopedia. 
            
            Always prioritize the information provided in this context. 
            
            Team Credits:
            - Team Leader: Youssef Wahed (Full Stack)
            - Cyber Security: Youssef Moawad
            - Data Analysis: Youssef Tarek
            - UI/UX & Front-End: Shahd Hisham Fathy, Roan Yousry
            - Front-End: Alaa Gamal, Mai Mohamed, Sohaila
            - Mobile: Basel Ashraf, Mariam Mostafa, Fatma Mohamed
            
            Context (Arabic):
            ${ARABIC_CONTEXT}
            
            Context (English):
            ${ENGLISH_CONTEXT}
            
            If the user asks in Arabic, answer in Arabic using the style and terminology from the Arabic context. If English, answer in English. Always mention that you provide educational guidance only and users should consult a doctor.`,
          },
          {
            role: "user",
            content: userMessage,
          },
        ],
        temperature: 0.7,
        max_tokens: 1024,
      }),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error?.message || "Failed to call AI API");
    }

    const data = await response.json();
    return data.choices[0].message.content;
  } catch (error) {
    console.error("Error in callGroqAPI:", error);
    throw error;
  }
};
