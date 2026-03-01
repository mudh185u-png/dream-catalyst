import { NextResponse } from "next/server"
import { getServerSession } from "next-auth/next"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateImage } from "ai"
import { openai } from "@ai-sdk/openai"

export async function POST(req: Request) {
    try {
        const session = await getServerSession(authOptions)
        if (!session?.user?.email) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

        const body = await req.json()
        const { planId, goal, isArabic } = body

        // Safety check - wait for OpenAI key if missing in actual prod
        const prompt = isArabic
            ? `A cinematic, highly detailed, inspiring scene representing the feeling of achieving this goal: ${goal}. High quality, motivational style, photorealistic.`
            : `A cinematic, highly detailed, inspiring scene representing the feeling of achieving this goal: ${goal}. High quality, motivational style, photorealistic.`;

        try {
            const { image } = await generateImage({
                model: openai.image('dall-e-3'),
                prompt: prompt,
                size: '1024x512',
                providerOptions: {
                    openai: { style: 'vivid' }
                }
            });

            // In a real app we might save this URL to the database linked to the plan
            return NextResponse.json({ imageUrl: image.base64 })

        } catch (imageError: any) {
            console.warn("Image generation failed (likely mock key or rate limit)", imageError.message)
            // Return a 500 or a mock image so it doesn't break the UI
            return NextResponse.json({ imageUrl: null }, { status: 500 })
        }

    } catch (error) {
        console.error(error)
        return NextResponse.json({ error: "Failure generating image" }, { status: 500 })
    }
}
