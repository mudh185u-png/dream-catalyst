"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardFooter } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export function GoalForm() {
    const router = useRouter()
    const [goal, setGoal] = useState("")
    const [language, setLanguage] = useState("EN")
    const [complexity, setComplexity] = useState("SIMPLE")
    const [model, setModel] = useState("GEMINI")
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setLoading(true)

        try {
            const endpoint = model === 'BOTH' ? '/api/generate-faceoff' : '/api/generate-plan';
            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goal, language, complexity, model })
            })

            const data = await res.json()
            if (model === 'BOTH' && data?.faceoffId) {
                router.push(`/plan/compare/${data.faceoffId}`)
            } else if (data?.planId) {
                router.push(`/plan/${data.planId}`)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className={language === 'AR' ? 'dir-rtl' : ''} dir={language === 'AR' ? 'rtl' : 'ltr'}>
            <form onSubmit={handleSubmit}>
                <CardContent className="space-y-6 pt-6">
                    <div className="space-y-2">
                        <Label>Language / اللغة</Label>
                        <Select value={language} onValueChange={setLanguage}>
                            <SelectTrigger>
                                <SelectValue placeholder="Select language" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="EN">English</SelectItem>
                                <SelectItem value="AR">العربية (Arabic)</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    <div className="space-y-2">
                        <Label>Your Goal / هدفك</Label>
                        <Textarea
                            placeholder={language === 'EN' ? "e.g., Learn Next.js in a month..." : "مثال: تعلم Next.js في شهر..."}
                            value={goal}
                            onChange={(e) => setGoal(e.target.value)}
                            required
                            className="min-h-[100px]"
                        />
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label>Complexity</Label>
                            <Select value={complexity} onValueChange={setComplexity}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Complexity" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="SIMPLE">Simple</SelectItem>
                                    <SelectItem value="DETAILED">Detailed</SelectItem>
                                    <SelectItem value="GENIUS">Genius</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                        <div className="space-y-2">
                            <Label>AI Model</Label>
                            <Select value={model} onValueChange={setModel}>
                                <SelectTrigger>
                                    <SelectValue placeholder="Model" />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value="GEMINI">Gemini 1.5 Flash (Fast)</SelectItem>
                                    <SelectItem value="CLAUDE">Claude 3.5 Sonnet (Deep)</SelectItem>
                                    <SelectItem value="BOTH">Face-Off Mode (Compare Both)</SelectItem>
                                </SelectContent>
                            </Select>
                        </div>
                    </div>
                </CardContent>
                <CardFooter>
                    <Button type="submit" className="w-full" disabled={loading}>
                        {loading ? "Generating Plan..." : "Generate Action Plan"}
                    </Button>
                </CardFooter>
            </form>
        </Card>
    )
}
