export function buildPrompt(goal: string, language: string, complexity: string): string {
    const isArabic = language === 'AR';

    const persona = isArabic
        ? "أنت خبير عالمي في التخطيط الاستراتيجي، ومدرب تنمية شخصية، ومستشار إنتاجية مخضرم."
        : "You are a world-class strategic planner, life coach, and veteran productivity consultant.";

    const complexityInstruction = getComplexityInstruction(complexity, isArabic);

    return `
${persona}

The user has the following goal / الهدف:
"${goal}"

Your task is to create a highly structured, motivational, and detailed 7-day action plan to help the user achieve or make significant progress toward this goal.
The language of your response MUST BE ONLY in ${isArabic ? 'Arabic (العربية)' : 'English'}.

${complexityInstruction}

CRITICAL REQUIREMENT:
You MUST respond EXCLUSIVELY with a valid JSON object. Do not include any markdown formatting like \`\`\`json, do not include any preamble, and do not include any postscript. JUST the raw, parsable JSON string.

The JSON MUST exactly match this schema:
{
  "weekTitle": "A catchy, motivating title for the week's plan",
  "days": [
    {
      "day": 1,
      "title": "Title for the day's focus",
      "tasks": [ "Task 1", "Task 2", "Task 3" ],
      "resource": "A specific link or search term to help with the day's tasks",
      "quote": "A powerful, relevant motivational quote"
    },
    // ... exactly 7 days
  ]
}
`;
}

function getComplexityInstruction(complexity: string, isArabic: boolean): string {
    if (complexity === 'SIMPLE') {
        return isArabic
            ? "اجعل الخطة بسيطة ومباشرة وسهلة التنفيذ لا تتطلب الكثير من الوقت يومياً (حوالي 15-30 دقيقة)."
            : "Make the plan simple, direct, and easy to execute. It should not require a lot of time daily (approx 15-30 mins).";
    }

    if (complexity === 'GENIUS') {
        return isArabic
            ? "تجاوز المألوف. قدم خطة عبقرية، غير تقليدية، تتضمن استراتيجيات متقدمة، قراءة سريعة، وتقنيات اختراق النمو (Growth Hacking) للوصول للهدف بأسرع وقت وأعلى كفاءة."
            : "Go beyond the ordinary. Provide a genius, unconventional plan including advanced strategies, speed learning, and growth hacking techniques to reach the goal as fast and efficiently as possible.";
    }

    // DETAILED (Default)
    return isArabic
        ? "اجعل الخطة مفصلة وشاملة، مع خطوات واضحة ومحددة جيداً لكل يوم تؤدي إلى تحولات ملموسة بنهاية الأسبوع."
        : "Make the plan detailed and comprehensive, with clear, well-defined steps for each day that lead to tangible transformations by the end of the week.";
}
