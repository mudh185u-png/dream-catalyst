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
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const user = await prisma.user.findUnique({ where: { email: session.user.email } })
        if (!user) return NextResponse.json({ error: "User not found" }, { status: 404 })

        const { goal, language, complexity } = await req.json()
        const promptText = buildPrompt(goal, language, complexity)

        // Call BOTH models concurrently
        const [geminiResult, claudeResult] = await Promise.all([
            process.env.GOOGLE_GENERATIVE_AI_API_KEY === 'mock_key' ? Promise.resolve({ text: getMockPlanJson(language) }) : generateText({ model: google('gemini-1.5-flash'), prompt: promptText }).catch(e => ({ text: getMockPlanJson(language) })),
            process.env.ANTHROPIC_API_KEY === 'mock_key' ? Promise.resolve({ text: getMockPlanJson(language) }) : generateText({ model: anthropic('claude-3-5-sonnet-20241022'), prompt: promptText }).catch(e => ({ text: getMockPlanJson(language) }))
        ])

        const cleanGemini = geminiResult.text.replace(/```json/g, "").replace(/```/g, "").trim()
        const cleanClaude = claudeResult.text.replace(/```json/g, "").replace(/```/g, "").trim()

        // Save Gemini Plan
        const geminiPlan = await prisma.plan.create({
            data: { userId: user.id, goal, language, modelUsed: 'GEMINI', complexity, generatedContent: cleanGemini }
        })

        // Save Claude Plan
        const claudePlan = await prisma.plan.create({
            data: { userId: user.id, goal, language, modelUsed: 'CLAUDE', complexity, generatedContent: cleanClaude }
        })

        // In a full implementation, we might create a specific FaceOff schema to link them. 
        // Here we return both IDs to compare on the frontend, using Gemini ID as the base reference link.
        return NextResponse.json({ faceoffId: `${geminiPlan.id}---${claudePlan.id}` })

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failure generating face-off." }, { status: 500 })
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
