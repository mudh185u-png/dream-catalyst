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
                const result = await generateText({
                    model: google('gemini-1.5-flash'),
                    prompt: promptText,
                })
                generatedContentText = result.text;
            } else {
                const result = await generateText({
                    model: anthropic('claude-3-5-sonnet-20241022'),
                    prompt: promptText,
                })
                generatedContentText = result.text;
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
