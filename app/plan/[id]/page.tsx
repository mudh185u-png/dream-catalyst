import { prisma } from "@/lib/prisma"
import { notFound } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle2, Link as LinkIcon } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { PlanHeroImage } from "@/components/plan-hero-image"
import { PlanActions } from "@/components/plan-actions"

export default async function PlanDisplayPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params

    const plan = await prisma.plan.findUnique({
        where: { id: id },
        include: { user: true }
    })

    if (!plan) notFound()

    let content: any = null;
    try {
        content = JSON.parse(plan.generatedContent)
    } catch (e) {
        return <div className="text-center mt-20 text-red-500">Error parsing AI response.</div>
    }

    const isRtl = plan.language === 'AR'

    return (
        <div className="container max-w-4xl mx-auto py-12 px-4" dir={isRtl ? 'rtl' : 'ltr'}>

            <div className="flex justify-between items-center mb-6">
                <Link href="/dashboard/new" className="text-sm text-muted-foreground hover:text-foreground hover:underline">
                    &larr; {isRtl ? 'عودة للرئيسية' : 'Back to Dashboard'}
                </Link>
                <PlanActions planTitle={content.weekTitle || plan.goal} isArabic={isRtl} />
            </div>

            <div id="plan-content-wrapper" className="space-y-8 bg-background p-4 rounded-xl">

                <PlanHeroImage planId={plan.id} goal={plan.goal} isArabic={isRtl} />

                <div className="text-center space-y-4">
                    <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                        {content.weekTitle || (isRtl ? "خطة العمل الخاصة بك" : "Your Action Plan")}
                    </h1>
                    <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
                        {isRtl ? 'الهدف:' : 'Goal:'} <span className="font-semibold text-foreground">{plan.goal}</span>
                    </p>
                    <div className="flex flex-wrap items-center justify-center gap-2 text-sm text-muted-foreground">
                        <span className="px-3 py-1 bg-muted rounded-full">Model: {plan.modelUsed}</span>
                        <span className="px-3 py-1 bg-muted rounded-full">Level: {plan.complexity}</span>
                        <span className="px-3 py-1 bg-muted rounded-full">By: {plan.user.name || plan.user.email}</span>
                    </div>
                </div>

                <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
                    {content.days && content.days.map((day: any) => (
                        <Card key={day.day} className="overflow-hidden border-primary/10 shadow-md hover:shadow-lg transition-shadow">
                            <CardHeader className="bg-primary/5 pb-4">
                                <div className="flex items-center justify-between">
                                    <CardTitle className="text-xl text-primary">
                                        {isRtl ? 'اليوم' : 'Day'} {day.day}: {day.title}
                                    </CardTitle>
                                </div>
                            </CardHeader>
                            <CardContent className="space-y-5 pt-6">

                                <div className="space-y-3">
                                    <h4 className="font-semibold text-sm uppercase tracking-wider text-muted-foreground">
                                        {isRtl ? 'المهام' : 'Tasks'}
                                    </h4>
                                    <ul className="space-y-3">
                                        {day.tasks.map((task: string, i: number) => (
                                            <li key={i} className="flex items-start gap-3">
                                                <CheckCircle2 className="w-5 h-5 text-green-500 shrink-0 mt-0.5" />
                                                <span className="leading-relaxed">{task}</span>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {day.resource && (
                                    <div className="bg-blue-50 dark:bg-blue-950/30 p-4 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-4 border border-blue-100 dark:border-blue-900">
                                        <div>
                                            <p className="font-medium text-sm text-blue-800 dark:text-blue-300 mb-1">
                                                {isRtl ? 'المصدر المقترح:' : 'Recommended Resource:'}
                                            </p>
                                            <p className="text-sm text-blue-700 dark:text-blue-400 line-clamp-1">
                                                {day.resource}
                                            </p>
                                        </div>
                                        <Button variant="outline" size="sm" asChild className="shrink-0">
                                            <Link href={day.resource} target="_blank" rel="noopener noreferrer">
                                                <LinkIcon className="w-4 h-4 mr-2" />
                                                {isRtl ? 'تصفح المورد' : 'View Resource'}
                                            </Link>
                                        </Button>
                                    </div>
                                )}

                                {day.quote && (
                                    <blockquote className="border-l-4 pl-4 py-1 italic text-muted-foreground border-primary/50 bg-muted/30 rounded-r-lg">
                                        &quot;{day.quote}&quot;
                                    </blockquote>
                                )}

                            </CardContent>
                        </Card>
                    ))}
                </div>

            </div>
        </div>
    )
}
