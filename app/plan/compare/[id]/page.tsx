import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

function PlanColumn({ content, isRtl, title, colorPrimary }: any) {
    return (
        <div className="space-y-6">
            <h2 className={`text-2xl font-bold tracking-tight text-center ${colorPrimary}`}>{title}</h2>
            {content.days && content.days.map((day: any) => (
                <Card key={day.day} className="overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                    <CardHeader className="bg-muted/50 pb-3">
                        <CardTitle className="text-lg">
                            {isRtl ? 'اليوم' : 'Day'} {day.day}: {day.title}
                        </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-4 pt-4">

                        <div className="space-y-2">
                            <h4 className="font-semibold text-xs uppercase tracking-wider text-muted-foreground">
                                {isRtl ? 'المهام' : 'Tasks'}
                            </h4>
                            <ul className="space-y-2 text-sm">
                                {day.tasks.map((task: string, i: number) => (
                                    <li key={i} className="flex items-start gap-2">
                                        <CheckCircle2 className="w-4 h-4 text-green-500 shrink-0 mt-0.5" />
                                        <span className="leading-relaxed">{task}</span>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        {day.resource && (
                            <div className="bg-muted p-3 rounded-md text-sm">
                                <p className="font-medium mb-1">
                                    {isRtl ? 'المصدر:' : 'Resource:'}
                                </p>
                                <Link href={day.resource} target="_blank" rel="noopener noreferrer" className="text-blue-500 flex items-center hover:underline">
                                    <LinkIcon className="w-3 h-3 mr-1" />
                                    {day.resource.substring(0, 40)}...
                                </Link>
                            </div>
                        )}

                        {day.quote && (
                            <blockquote className="border-l-2 pl-3 py-1 italic text-muted-foreground text-sm bg-muted/20">
                                &quot;{day.quote}&quot;
                            </blockquote>
                        )}

                    </CardContent>
                </Card>
            ))}
        </div>
    )
}

export default async function FaceOffPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    // Custom logic: ID is GEMINI_ID---CLAUDE_ID
    const [geminiId, claudeId] = id.split("---")

    if (!geminiId || !claudeId) notFound()

    const [geminiPlan, claudePlan] = await Promise.all([
        prisma.plan.findUnique({ where: { id: geminiId } }),
        prisma.plan.findUnique({ where: { id: claudeId } })
    ])

    if (!geminiPlan || !claudePlan) notFound()

    let geminiContent: any = null;
    let claudeContent: any = null;

    try {
        geminiContent = JSON.parse(geminiPlan.generatedContent)
        claudeContent = JSON.parse(claudePlan.generatedContent)
    } catch (e) {
        return <div className="text-center mt-20 text-red-500">Error parsing AI responses.</div>
    }

    const isRtl = geminiPlan.language === 'AR'

    return (
        <div className="container max-w-7xl mx-auto py-12 px-4" dir={isRtl ? 'rtl' : 'ltr'}>
            <div className="space-y-8">

                <div className="text-center space-y-4">
                    <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight">
                        {isRtl ? "مواجهة النماذج" : "Model Face-Off"}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {isRtl ? 'هدف:' : 'Goal:'} <span className="font-semibold text-foreground">{geminiPlan.goal}</span>
                    </p>
                </div>

                {/* Side-by-side comparison layout */}
                <div className="grid md:grid-cols-2 gap-8 lg:gap-12">
                    <PlanColumn
                        content={geminiContent}
                        isRtl={isRtl}
                        title="Gemini 1.5 Flash"
                        colorPrimary="text-blue-500"
                    />
                    <PlanColumn
                        content={claudeContent}
                        isRtl={isRtl}
                        title="Claude 3.5 Sonnet"
                        colorPrimary="text-orange-500"
                    />
                </div>

            </div>
        </div>
    )
}
