# شرح مشروع EstiBot AI Enterprise

## 1. فكرة المشروع باختصار

**EstiBot AI Enterprise** هو نظام تقدير مشاريع برمجية يساعد الشركات وفرق التطوير على تحويل وصف المشروع إلى تقدير منظم للتكلفة والجهد والمدة، باستخدام طرق أكاديمية معروفة في هندسة البرمجيات:

- **Function Point Analysis - FPA**
- **Use Case Point Analysis - UCP**
- **Deterministic AI State Machine**
- **Groq AI API كطبقة فهم وصياغة اختيارية**
- **Dashboard + Charts + PDF Report**

الفكرة ليست أن النظام "يدردش فقط"، بل يقود المستخدم خطوة بخطوة لجمع بيانات التقدير، يتحقق من اكتمالها، ثم يحسب النتائج بشكل حتمي وقابل للمراجعة.

---

## 2. المشكلة التي يحلها المشروع

في كثير من الشركات، تقدير المشاريع يتم بطريقة تقريبية أو اعتمادًا على خبرة شخص واحد. هذا يسبب مشاكل مثل:

- تقديرات غير موحدة بين المشاريع.
- نسيان عوامل مهمة مثل التعقيد التقني أو خبرة الفريق.
- صعوبة تبرير السعر للعميل.
- صعوبة مقارنة أكثر من طريقة تقدير.
- غياب تقرير رسمي يمكن تسليمه للإدارة أو العميل.

EstiBot يحل هذه المشاكل عبر تحويل عملية التقدير إلى **منهجية منظمة، قابلة للتكرار، وموثقة بتقرير احترافي**.

---

## 3. القيمة التي تقدمها للشركة

يمكن إقناع الشركة بالمشروع من خلال التركيز على هذه النقاط:

### 3.1 تقليل المخاطر

النظام لا يسمح بالانتقال للحساب قبل اكتمال البيانات المطلوبة. هذا يقلل خطر إصدار تقدير ناقص أو مبني على افتراضات غير موثقة.

### 3.2 توحيد طريقة التقدير

كل موظف أو محلل يستخدم نفس المراحل ونفس القواعد ونفس المعادلات، لذلك تصبح تقديرات الشركة أكثر اتساقًا.

### 3.3 دعم القرار

النظام يعطي:

- الجهد المتوقع بالساعات.
- المدة المتوقعة بالأشهر.
- التكلفة.
- مقارنة FP مقابل UCP.
- مستوى الثقة بالتقدير.

هذه النتائج تساعد الإدارة في اتخاذ قرار السعر، الجدول الزمني، وحجم الفريق.

### 3.4 تقرير قابل للتسليم

النظام يولد PDF احترافي يحتوي على:

- معلومات المشروع.
- جداول FP.
- جداول UCP.
- العوامل التقنية والبيئية.
- التكلفة والمدة.
- درجة الثقة.

هذا التقرير يمكن استخدامه في العروض الفنية والمالية.

### 3.5 قابل للتطوير

المشروع مبني بمعمارية منظمة تسمح لاحقًا بإضافة:

- تسجيل دخول وصلاحيات.
- قاعدة بيانات SQLite أو PostgreSQL.
- حفظ عدة مشاريع.
- مقارنة عروض أسعار.
- تصدير Excel.
- تكامل مع CRM أو Jira.

---

## 4. لماذا المشروع ليس مجرد Chatbot؟

الفرق الأساسي أن EstiBot ليس نظام محادثة عشوائي. هو يعمل وفق **State Machine** صارمة.

أي أن النظام يمر بمراحل محددة:

1. `PROJECT_INTRODUCTION`
2. `METHOD_SELECTION`
3. `FUNCTION_POINT_COLLECTION`
4. `USE_CASE_COLLECTION`
5. `TECHNICAL_FACTORS_COLLECTION`
6. `ENVIRONMENTAL_FACTORS_COLLECTION`
7. `VALIDATION_PHASE`
8. `CALCULATION_PHASE`
9. `RESULT_GENERATION`

لا يتم تخطي المراحل، ولا يتم الحساب قبل التحقق، ولا يتم اختراع بيانات ناقصة.

Groq API مستخدم فقط لتحسين فهم وصياغة المحادثة، أما الحسابات والانتقالات فهي حتمية داخل النظام.

---

## 5. مكونات النظام

### 5.1 Frontend

الواجهة مبنية باستخدام:

- React
- TypeScript
- Tailwind CSS
- Recharts
- Lucide Icons

وتحتوي على:

- واجهة محادثة شبيهة بـ ChatGPT.
- شريط تقدم للمراحل.
- Live State Viewer.
- Dashboard للنتائج.
- Charts لمقارنة FP و UCP.
- أزرار Calculate و PDF و Reset.

### 5.2 Backend

الخلفية مبنية باستخدام Next.js API Routes.

الـ endpoints:

- `POST /api/chat`
- `POST /api/state`
- `POST /api/calculate`
- `POST /api/pdf`
- `POST /api/reset`

### 5.3 AI Engine

موجود في:

```text
src/ai-engine
```

وظيفته:

- تحديد المرحلة الحالية.
- معرفة السؤال التالي.
- استخراج القيم.
- التحقق من صحة المدخلات.
- منع تخطي المراحل.
- إدارة التصحيحات.

### 5.4 Calculation Engine

موجود في:

```text
src/calculation-engine
```

وظيفته:

- حساب Function Points.
- حساب Use Case Points.
- حساب الجهد والمدة والتكلفة.
- حساب مستوى الثقة.

### 5.5 PDF Report Generator

موجود في:

```text
src/services/pdfService.ts
```

ويستخدم:

- jsPDF
- jspdf-autotable

### 5.6 Persistence Layer

الحالة تحفظ في ملف JSON:

```text
data/estibot-state.json
```

هذا يسمح للنظام بالاحتفاظ بالتقدم حتى بعد تحديث الصفحة.

---

## 6. المدخلات المطلوبة من المستخدم

## 6.1 بيانات تعريف المشروع

### اسم المشروع

مثال:

```text
Smart Clinic Management System
```

### وصف المشروع

مثال:

```text
A web platform for patient registration, appointments, billing, medical records, and reporting.
```

### سعر الساعة

مثال:

```text
60
```

يستخدم لحساب التكلفة:

```text
Cost = Effort Hours × Hourly Rate
```

---

## 6.2 اختيار طريقة التقدير

المستخدم يختار واحدة من:

```text
FP
UCP
BOTH
```

### FP

استخدام Function Point Analysis فقط.

### UCP

استخدام Use Case Point Analysis فقط.

### BOTH

تشغيل الطريقتين معًا ثم مقارنة النتائج وحساب confidence.

---

## 6.3 مدخلات Function Point Analysis

يطلب النظام أعداد العناصر حسب درجة التعقيد:

```text
simple, average, complex
```

### External Inputs - EI

مدخلات خارجية للنظام، مثل:

- إنشاء مستخدم.
- تسجيل موعد.
- إدخال فاتورة.

الأوزان:

| Complexity | Weight |
|---|---:|
| Simple | 3 |
| Average | 4 |
| Complex | 6 |

### External Outputs - EO

مخرجات أو تقارير، مثل:

- تقرير مبيعات.
- فاتورة PDF.
- Dashboard summary.

الأوزان:

| Complexity | Weight |
|---|---:|
| Simple | 4 |
| Average | 5 |
| Complex | 7 |

### External Inquiries - EQ

استعلامات دون معالجة معقدة، مثل:

- البحث عن مريض.
- عرض تفاصيل طلب.

الأوزان:

| Complexity | Weight |
|---|---:|
| Simple | 3 |
| Average | 4 |
| Complex | 6 |

### Internal Logical Files - ILF

ملفات أو جداول داخلية يديرها النظام، مثل:

- Users
- Patients
- Orders
- Invoices

الأوزان:

| Complexity | Weight |
|---|---:|
| Simple | 7 |
| Average | 10 |
| Complex | 15 |

### External Interface Files - EIF

ملفات أو بيانات خارجية يتعامل معها النظام ولا يملكها، مثل:

- Payment gateway data.
- External HR system.
- Government API.

الأوزان:

| Complexity | Weight |
|---|---:|
| Simple | 5 |
| Average | 7 |
| Complex | 10 |

### مثال إدخال FP

```text
simple 8, average 5, complex 2
```

---

## 6.4 FP Technical Factors

بعد جمع عناصر FP، يطلب النظام تقييم 14 عاملًا من 0 إلى 5.

المعنى العام:

| Rating | Meaning |
|---:|---|
| 0 | لا تأثير |
| 1 | تأثير ضعيف جدًا |
| 2 | تأثير ضعيف |
| 3 | تأثير متوسط |
| 4 | تأثير قوي |
| 5 | تأثير قوي جدًا |

العوامل:

1. Data communications
2. Distributed data processing
3. Performance objectives
4. Heavily used configuration
5. Transaction rate
6. Online data entry
7. End-user efficiency
8. Online update
9. Complex processing
10. Reusability
11. Installation ease
12. Operational ease
13. Multiple sites
14. Facilitate change

---

## 6.5 مدخلات Use Case Point Analysis

### Actors

الممثلون الذين يتفاعلون مع النظام:

- Simple actor: نظام آخر عبر API.
- Average actor: نظام أو مستخدم عبر بروتوكول محدد.
- Complex actor: مستخدم بشري عبر واجهة UI.

الأوزان:

| Actor Type | Weight |
|---|---:|
| Simple | 1 |
| Average | 2 |
| Complex | 3 |

مثال:

```text
simple 3, average 4, complex 2
```

### Use Cases

حالات الاستخدام الرئيسية في النظام.

الأوزان:

| Use Case Type | Weight |
|---|---:|
| Simple | 5 |
| Average | 10 |
| Complex | 15 |

مثال:

```text
simple 6, average 8, complex 4
```

---

## 6.6 UCP Technical Factors

عددها 13 عاملًا، وكل عامل يقيم من 0 إلى 5:

1. Distributed system
2. Performance objectives
3. End-user efficiency
4. Complex internal processing
5. Reusable code
6. Easy to install
7. Easy to use
8. Portable
9. Easy to change
10. Concurrent
11. Security features
12. Third-party access
13. Training needs

---

## 6.7 UCP Environmental Factors

عددها 8 عوامل، وكل عامل يقيم من 0 إلى 5:

1. Familiar with process
2. Application experience
3. Object-oriented experience
4. Lead analyst capability
5. Team motivation
6. Stable requirements
7. Part-time workers
8. Difficult programming language

هذه العوامل تعكس بيئة الفريق وخبرته، وتؤثر على دقة وجهد المشروع.

---

## 7. المخرجات التي ينتجها النظام

## 7.1 مخرجات Function Point Analysis

النظام يحسب:

- UFP: Unadjusted Function Points
- TDI: Total Degree of Influence
- VAF: Value Adjustment Factor
- AFP: Adjusted Function Points
- Effort Hours
- Duration Months
- Cost

المعادلات:

```text
UFP = sum(all weighted components)
VAF = 0.65 + (0.01 × TDI)
AFP = UFP × VAF
Effort = AFP × 8
Duration = Effort / 160
Cost = Effort × HourlyRate
```

---

## 7.2 مخرجات Use Case Point Analysis

النظام يحسب:

- UAW: Unadjusted Actor Weight
- UUCW: Unadjusted Use Case Weight
- UUCP: Unadjusted Use Case Points
- TCF: Technical Complexity Factor
- ECF: Environmental Complexity Factor
- UCP: Use Case Points
- Effort Hours
- Duration Months
- Cost

المعادلات:

```text
UAW = sum(actors)
UUCW = sum(use cases)
UUCP = UAW + UUCW
TCF = 0.6 + (0.01 × TFactor)
ECF = 1.4 - (0.03 × EFactor)
UCP = UUCP × TCF × ECF
Effort = UCP × 20
Duration = Effort / 160
Cost = Effort × HourlyRate
```

---

## 7.3 Confidence Score

إذا اختار المستخدم `BOTH`، يقارن النظام بين نتائج FP و UCP.

القواعد:

| Difference | Confidence |
|---:|---|
| أقل من 15% | HIGH |
| من 15% إلى 35% | MEDIUM |
| أكثر من 35% | LOW |

الفائدة:

- إذا كانت النتيجتان متقاربتين، الثقة أعلى.
- إذا كان الفرق كبيرًا، يجب مراجعة المدخلات أو فهم المشروع.

---

## 7.4 Dashboard Outputs

الواجهة تعرض:

- Current Phase
- Input Completeness
- Schema Status
- FP Effort
- UCP Effort
- Estimated Cost
- Confidence
- Duration
- FP vs UCP charts

---

## 7.5 PDF Report

التقرير النهائي يحتوي على:

1. Cover page
2. Project overview
3. FP Analysis tables
4. UCP Analysis tables
5. Technical factors breakdown
6. Environmental factors breakdown
7. Cost estimation summary
8. Comparison chart
9. Confidence score
10. Footer pagination

---

## 8. دورة العمل داخل النظام

التدفق الكامل:

```text
User Input
  ↓
Chat UI
  ↓
Groq extraction/reply layer
  ↓
Deterministic State Machine
  ↓
Validation Layer
  ↓
State Store
  ↓
Calculation Engine
  ↓
Dashboard
  ↓
PDF Report
```

المهم أن Groq لا يحسب ولا يقرر النتائج. Groq يساعد فقط في:

- فهم صياغة المستخدم.
- تحويلها إلى قيمة منظمة.
- جعل الردود أكثر طبيعية.

أما القرارات والحسابات فتبقى داخل النظام.

---

## 9. كيف تشرح المشروع لشركة؟

يمكنك تقديمه بهذه الطريقة:

> EstiBot AI Enterprise is a structured estimation platform for software projects. It helps analysts and project managers collect estimation inputs through a guided AI conversation, validates the data, calculates project effort using Function Point and Use Case Point methods, compares the results, and generates a professional PDF report for decision makers.

وبالعربي:

> EstiBot هو نظام يساعد الشركة على تقدير تكلفة ومدة المشاريع البرمجية بطريقة منظمة وقابلة للتبرير، بدل الاعتماد على التخمين. النظام يجمع البيانات خطوة بخطوة، يتحقق منها، يطبق معادلات هندسية معروفة، ثم يعطي Dashboard وتقرير PDF يمكن استخدامه مع الإدارة أو العميل.

---

## 10. نقاط الإقناع الأساسية

### نقطة 1: التقدير يصبح قابلًا للتبرير

بدل أن تقول الشركة للعميل "السعر تقريبًا 20 ألف"، يمكنها تقديم تقرير يوضح كيف تم الوصول إلى الرقم.

### نقطة 2: النظام يقلل الاعتماد على الخبرة الفردية

حتى لو تغير مدير المشروع أو محلل النظام، تبقى طريقة التقدير موحدة.

### نقطة 3: مناسب قبل توقيع العقد

يمكن استخدامه في مرحلة pre-sales لتقييم حجم المشروع بسرعة قبل الالتزام مع العميل.

### نقطة 4: مناسب للإدارة

الإدارة تحصل على أرقام واضحة:

- عدد الساعات.
- التكلفة.
- المدة.
- مستوى الثقة.

### نقطة 5: يمكن تطويره داخليًا

الشركة تستطيع لاحقًا ربطه مع:

- CRM
- Jira
- ERP
- Time tracking
- Employee cost rates

---

## 11. سيناريو Demo مقترح

### الخطوة 1

افتح النظام واعرض واجهة المحادثة.

قل:

> النظام لا يبدأ بالحساب مباشرة، بل يجمع البيانات بشكل منظم.

### الخطوة 2

أدخل اسم مشروع:

```text
Smart Clinic Management System
```

### الخطوة 3

أدخل وصف المشروع:

```text
A healthcare platform for appointments, patient records, billing, notifications, and administrative reporting.
```

### الخطوة 4

أدخل سعر الساعة:

```text
60
```

### الخطوة 5

اختر:

```text
BOTH
```

اشرح أن النظام سيشغل الطريقتين ويقارن النتائج.

### الخطوة 6

أدخل بيانات FP و UCP.

### الخطوة 7

اعرض Dashboard.

### الخطوة 8

اضغط PDF وأظهر التقرير النهائي.

---

## 12. بيانات اختبار جاهزة

استخدم هذه البيانات للتجربة:

### Project Name

```text
Smart Clinic Management System
```

### Project Description

```text
A web-based healthcare platform for patient registration, appointment scheduling, doctor dashboards, billing, medical records, notifications, and administrative reporting.
```

### Hourly Rate

```text
60
```

### Method

```text
BOTH
```

### FP Inputs

External Inputs:

```text
simple 8, average 5, complex 2
```

External Outputs:

```text
simple 6, average 4, complex 2
```

External Inquiries:

```text
simple 5, average 3, complex 1
```

Internal Logical Files:

```text
simple 4, average 3, complex 2
```

External Interface Files:

```text
simple 3, average 2, complex 1
```

### UCP Inputs

Actors:

```text
simple 3, average 4, complex 2
```

Use Cases:

```text
simple 6, average 8, complex 4
```

### FP Technical Factors

أدخل القيم التالية واحدة تلو الأخرى:

```text
3
3
4
3
4
4
3
3
4
3
2
3
2
4
```

### UCP Technical Factors

```text
4
3
3
4
3
2
3
3
3
4
4
2
2
```

### UCP Environmental Factors

```text
4
3
3
4
4
4
2
2
```

### Validation

```text
confirm
```

### Calculation

```text
calculate
```

---

## 13. المعمارية التقنية

هيكل المشروع:

```text
src/
  ai-engine/
  calculation-engine/
  api/
  components/
  pages/
  services/
  state/
  utils/
  types/
  constants/
  database/
  hooks/
  styles/
```

### أهم الملفات

| File | Responsibility |
|---|---|
| `src/ai-engine/stateMachine.ts` | إدارة المراحل والأسئلة |
| `src/ai-engine/extractor.ts` | استخراج القيم محليًا |
| `src/ai-engine/validators.ts` | التحقق من اكتمال المدخلات |
| `src/services/groqService.ts` | ربط Groq API |
| `src/calculation-engine/functionPoint.ts` | حساب FP |
| `src/calculation-engine/useCasePoint.ts` | حساب UCP |
| `src/calculation-engine/confidence.ts` | حساب الثقة |
| `src/services/pdfService.ts` | توليد PDF |
| `src/database/jsonStore.ts` | حفظ الحالة |
| `src/components/ChatPanel.tsx` | واجهة المحادثة |
| `src/components/Dashboard.tsx` | لوحة النتائج |
| `src/components/StateSidebar.tsx` | عرض الحالة الحية |

---

## 14. API Contracts

### POST `/api/chat`

يرسل رسالة للمحرك.

Request:

```json
{
  "message": "Smart Clinic Management System"
}
```

Response:

```json
{
  "ok": true,
  "data": {
    "state": {},
    "reply": {}
  }
}
```

### POST `/api/state`

قراءة أو حفظ الحالة.

### POST `/api/calculate`

تشغيل الحساب بعد التحقق.

### POST `/api/pdf`

توليد تقرير PDF.

### POST `/api/reset`

إعادة النظام للبداية.

---

## 15. نقاط القوة التقنية

- TypeScript في كامل المشروع.
- فصل واضح بين الواجهة والحسابات والـ AI engine.
- حسابات deterministic وقابلة للاختبار.
- Groq API لا يتحكم بالحسابات.
- JSON persistence بسيط وواضح.
- PDF report قابل للتسليم.
- واجهة responsive.
- Error handling في API.
- Build system جاهز.

---

## 16. حدود النسخة الحالية

هذه النسخة تعمل جيدًا كـ MVP أو prototype قوي، لكنها يمكن أن تتطور أكثر.

الحدود الحالية:

- التخزين حاليًا JSON file وليس database متعددة المستخدمين.
- لا يوجد authentication.
- لا يوجد سجل لمشاريع متعددة.
- لا يوجد role-based access.
- لا يوجد export Excel.
- لا توجد اختبارات unit tests بعد.

هذه ليست نقاط ضعف قاتلة، بل فرص تطوير للنسخة التجارية.

---

## 17. Roadmap مقترح للشركة

### Phase 1

- اعتماد النظام داخليًا للتقدير الأولي.
- إضافة حفظ أكثر من مشروع.
- إضافة صفحة project history.

### Phase 2

- نقل التخزين إلى PostgreSQL أو SQLite.
- إضافة login وصلاحيات.
- إضافة templates حسب نوع المشروع.

### Phase 3

- ربط النظام مع Jira أو Linear.
- إضافة export Excel.
- إضافة مقارنة بين عدة سيناريوهات سعرية.

### Phase 4

- تدريب داخلي على بيانات الشركة السابقة.
- إضافة custom productivity rates.
- إضافة approval workflow.

---

## 18. صيغة Pitch قصيرة

استخدم هذه الصيغة إذا كان وقتك قصيرًا:

> EstiBot AI Enterprise helps companies estimate software projects using structured academic methods instead of guesswork. It guides the analyst through a deterministic conversation, validates all required inputs, calculates effort, duration, and cost using FP and UCP, compares both methods, and generates a professional PDF report that can be shared with management or clients.

---

## 19. الخلاصة

EstiBot AI Enterprise هو مشروع مناسب جدًا لعرضه على شركة لأنه يجمع بين:

- قيمة تجارية واضحة.
- مشكلة حقيقية في سوق البرمجيات.
- واجهة سهلة الاستخدام.
- معادلات تقدير معروفة.
- AI مساعد دون فقدان التحكم.
- تقرير نهائي احترافي.
- قابلية تطوير إلى منتج SaaS أو أداة داخلية.

أقوى نقطة في المشروع هي أنه لا يعتمد على الذكاء الاصطناعي للتخمين، بل يستخدمه لتحسين تجربة المستخدم فقط، بينما تبقى الحسابات والتحقق والنتائج مبنية على قواعد واضحة وقابلة للتدقيق.
