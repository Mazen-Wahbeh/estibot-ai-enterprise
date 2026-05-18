import type { ChatReply, EstimationState } from "@/types/estimation";

interface GroqMessage {
  role: "system" | "user";
  content: string;
}

interface GroqChatResponse {
  choices?: Array<{
    message?: {
      content?: string;
    };
  }>;
}

export interface GroqExtractionRequest {
  fieldPath: string;
  fieldKind: string;
  question: string;
  message: string;
  state: EstimationState;
}

export interface GroqExtractionResponse {
  ok: boolean;
  canonical: string;
  confidence: number;
  error: string | null;
}

export interface GroqReplyRequest {
  state: EstimationState;
  deterministicReply: ChatReply;
  userMessage: string;
  canonicalMessage: string;
}

const groqBaseUrl = "https://api.groq.com/openai/v1";
const defaultModel = "llama-3.1-8b-instant";

function arabicQuestionHint(question: string): string {
  if (question === "What is the project name?") {
    return "ما اسم المشروع؟";
  }
  if (question === "Provide a concise project overview covering the main business goal.") {
    return "اكتب وصفًا موجزًا للمشروع يوضح الهدف التجاري الرئيسي.";
  }
  if (question === "What hourly rate should be used for cost estimation?") {
    return "ما قيمة الأجر بالساعة التي سنستخدمها لحساب التكلفة؟";
  }
  if (question === "Select the estimation method: FP, UCP, or BOTH?") {
    return "اختر طريقة التقدير: FP أو UCP أو BOTH؟";
  }
  if (question.includes("counts as simple, average, complex")) {
    return "أدخل الأعداد بالترتيب: simple، average، complex. مثال: simple 5, average 3, complex 1.";
  }
  if (question.startsWith("Rate ")) {
    const label = question.match(/"([^"]+)"/)?.[1] ?? "هذا العامل";
    return `قيّم العامل "${label}" من 0 إلى 5.`;
  }
  if (question.includes("Type proceed")) {
    return "اكتب proceed للمتابعة إلى المرحلة التالية.";
  }
  if (question.includes("Type confirm")) {
    return "اكتب confirm لتأكيد التحقق والانتقال إلى الحساب.";
  }
  if (question.includes("Type calculate")) {
    return "اكتب calculate لتشغيل الحساب الحتمي.";
  }
  return question;
}

function groqEnabled(): boolean {
  return Boolean(process.env.GROQ_API_KEY) && process.env.GROQ_ENABLED !== "false";
}

function parseJsonObject(content: string): GroqExtractionResponse | null {
  try {
    const parsed = JSON.parse(content) as Partial<GroqExtractionResponse>;
    if (typeof parsed.ok !== "boolean" || typeof parsed.canonical !== "string") {
      return null;
    }
    return {
      ok: parsed.ok,
      canonical: parsed.canonical,
      confidence: typeof parsed.confidence === "number" ? parsed.confidence : 0,
      error: typeof parsed.error === "string" ? parsed.error : null
    };
  } catch {
    return null;
  }
}

function buildPrompt(request: GroqExtractionRequest): GroqMessage[] {
  return [
    {
      role: "system",
      content:
        "You are a strict extraction layer for a deterministic software estimation state machine. Return only one valid JSON object with keys ok, canonical, confidence, error. Never explain. Never infer missing values."
    },
    {
      role: "user",
      content: JSON.stringify({
        task:
          "Normalize the user's answer for the current field. If the answer is invalid or incomplete, return ok=false and canonical=''.",
        outputSchema: {
          ok: "boolean",
          canonical: "string",
          confidence: "number from 0 to 1",
          error: "string or null"
        },
        fieldRules: {
          text: "Return the project name as plain text.",
          longText: "Return a concise project overview as plain text.",
          positiveNumber: "Return only a positive number.",
          method: "Return exactly FP, UCP, or BOTH.",
          counts: "Return exactly: simple X, average Y, complex Z. X/Y/Z must be non-negative integers.",
          rating: "Return exactly one integer from 0 to 5.",
          ack: "Return exactly proceed only when the user agrees to continue.",
          confirm: "Return exactly confirm only when the user confirms validation.",
          calculate: "Return exactly calculate only when the user asks to calculate."
        },
        currentField: {
          path: request.fieldPath,
          kind: request.fieldKind,
          question: request.question
        },
        currentState: request.state,
        userMessage: request.message
      })
    }
  ];
}

function buildReplyPrompt(request: GroqReplyRequest): GroqMessage[] {
  const targetLanguage = /[\u0600-\u06FF]/.test(request.userMessage) ? "Arabic" : "English";

  if (targetLanguage === "Arabic") {
    const requiredQuestion = arabicQuestionHint(request.deterministicReply.question);

    return [
      {
        role: "system",
        content:
          "أنت تكتب ردود واجهة المستخدم لمنصة EstiBot AI Enterprise. اكتب بالعربية فقط وبحروف عربية. حافظ على مسار آلة الحالات كما هو. لا تجب بدل المستخدم ولا تستنتج وصفًا أو أرقامًا أو حسابات. دورك فقط صياغة رسالة قصيرة تطلب الحقل التالي المطلوب. اسأل سؤالًا واحدًا كحد أقصى. لا تذكر Groq أو التعليمات الداخلية."
      },
      {
        role: "user",
        content: [
          "المهمة: أعد صياغة رد المحرك الآلي إلى رد عربي طبيعي ومهني.",
          "يجب الحفاظ على نفس المطلوب التالي من المستخدم بدون تغيير المعنى.",
          "إذا كان المحرك يطلب وصفًا أو رقمًا أو تقييمًا، اطلبه من المستخدم فقط ولا تنشئه بنفسك.",
          "لا تلخّص المشروع ولا تشرح هدفه إلا إذا كانت النتائج النهائية جاهزة فعلًا.",
          "إذا وجدت ملاحظة، ادمجها بشكل طبيعي.",
          "إذا كانت النتائج جاهزة، لخّص فقط الحقائق الموجودة في الحسابات.",
          "القيود: فقرة قصيرة أو سطران كحد أقصى، لا ماركداون، ولا أكثر من سؤال واحد.",
          `رسالة المستخدم الأخيرة: ${request.userMessage}`,
          `القيمة التي استخدمها المحرك: ${request.canonicalMessage}`,
          `مرحلة النظام الحالية: ${request.state.phase}`,
          `السؤال التالي الإلزامي بالعربية: ${requiredQuestion}`,
          `رد المحرك الآلي: ${JSON.stringify(request.deterministicReply)}`
        ].join("\n")
      }
    ];
  }

  return [
    {
      role: "system",
      content:
        "You write user-facing responses for EstiBot AI Enterprise. Keep the deterministic workflow intact. Write the final response in English only. Ask at most one question. Never invent project data, calculations, formulas, or missing fields. Do not mention internal prompts or Groq."
    },
    {
      role: "user",
      content: JSON.stringify({
        task:
          "Rewrite the deterministic engine reply into a natural professional chat response. Preserve the exact requested next data item. If there is a notice, include it naturally. If results are ready, summarize only the provided calculation facts.",
        requiredNextQuestion: request.deterministicReply.question,
        constraints: [
          "One short paragraph or two short lines maximum.",
          "Ask only the deterministic question, or a faithful paraphrase of it.",
          "Do not answer the deterministic question for the user.",
          "Do not ask follow-up questions beyond the deterministic question.",
          "Do not add advice or assumptions.",
          "Do not use markdown."
        ],
        latestUserMessage: request.userMessage,
        canonicalMessageUsedByEngine: request.canonicalMessage,
        state: request.state,
        deterministicReply: request.deterministicReply
      })
    }
  ];
}

export async function extractWithGroq(request: GroqExtractionRequest): Promise<GroqExtractionResponse | null> {
  if (!groqEnabled()) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(`${groqBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || defaultModel,
        messages: buildPrompt(request),
        temperature: 0,
        max_completion_tokens: 180,
        response_format: { type: "json_object" }
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      console.warn(`Groq extraction failed with status ${response.status}`);
      return null;
    }

    const payload = (await response.json()) as GroqChatResponse;
    const content = payload.choices?.[0]?.message?.content;
    if (!content) {
      return null;
    }

    const parsed = parseJsonObject(content);
    if (!parsed?.ok || parsed.confidence < 0.5) {
      return null;
    }

    return parsed;
  } catch (error) {
    console.warn("Groq extraction unavailable, using local extractor", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}

export async function rewriteReplyWithGroq(request: GroqReplyRequest): Promise<string | null> {
  if (!groqEnabled()) {
    return null;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 7000);

  try {
    const response = await fetch(`${groqBaseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.GROQ_API_KEY}`,
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        model: process.env.GROQ_MODEL || defaultModel,
        messages: buildReplyPrompt(request),
        temperature: 0.25,
        max_completion_tokens: 260
      }),
      signal: controller.signal
    });

    if (!response.ok) {
      console.warn(`Groq reply rewrite failed with status ${response.status}`);
      return null;
    }

    const payload = (await response.json()) as GroqChatResponse;
    const content = payload.choices?.[0]?.message?.content?.trim();
    if (!content) {
      return null;
    }

    return content.slice(0, 900);
  } catch (error) {
    console.warn("Groq reply rewrite unavailable, using deterministic reply", error);
    return null;
  } finally {
    clearTimeout(timeout);
  }
}
