import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateText } from "ai"
import { google } from "@ai-sdk/google"
import { anthropic } from "@ai-sdk/anthropic"
import { buildPrompt } from "@/lib/prompts"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        const user = await prisma.user.findUnique({
            where: { email: session.user.email }
        })

        if (!user) {
            return NextResponse.json({ error: "User not found" }, { status: 404 })
        }

        const body = await req.json()
        const { goal, language, complexity, model } = body

        const promptText = buildPrompt(goal, language, complexity)

        let generatedContentText = "";

        try {
            if (model === 'GEMINI') {
                if (process.env.GOOGLE_GENERATIVE_AI_API_KEY === 'mock_key') {
                    generatedContentText = getMockPlanJson(language);
                } else {
                    const result = await generateText({
                        model: google('gemini-1.5-flash'),
                        prompt: promptText,
                    })
                    generatedContentText = result.text;
                }
            } else {
                if (process.env.ANTHROPIC_API_KEY === 'mock_key') {
                    generatedContentText = getMockPlanJson(language);
                } else {
                    const result = await generateText({
                        model: anthropic('claude-3-5-sonnet-20241022'),
                        prompt: promptText,
                    })
                    generatedContentText = result.text;
                }
            }

            // Cleanup JSON payload to ensure safe parsing later by stripping markdown backticks
            const cleanedJSON = generatedContentText.replace(/```json/g, "").replace(/```/g, "").trim();

            // Save valid output to database
            const plan = await prisma.plan.create({
                data: {
                    userId: user.id,
                    goal,
                    language,
                    modelUsed: model,
                    complexity,
                    generatedContent: cleanedJSON
                }
            })

            return NextResponse.json({ planId: plan.id })

        } catch (aiError) {
            console.error("AI Generation Error: ", aiError);
            return NextResponse.json({ error: "Failed to generate plan." }, { status: 500 });
        }

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Something went wrong" }, { status: 500 })
    }
}
function getMockPlanJson(language: string) {
    const isAr = language === 'AR';
    return JSON.stringify({
        weekTitle: isAr ? "أسبوع الإنجاز المذهل المبدئي" : "Initial Incredible Achievement Week",
        days: Array.from({ length: 7 }).map((_, i) => ({
            day: i + 1,
            title: isAr ? `اليوم ${i + 1}: انطلاقة مميزة` : `Day ${i + 1}: Special Start`,
            tasks: isAr ? ["مهمة افتراضية 1", "مهمة افتراضية 2", "مهمة افتراضية 3"] : ["Mock Task 1", "Mock Task 2", "Mock Task 3"],
            resource: "https://example.com",
            quote: isAr ? "النجاح يبدأ بخطوة صغيرة." : "Success begins with a small step."
        }))
    });
}
