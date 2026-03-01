"use client"

import { useEffect, useState } from "react"
import { Skeleton } from "@/components/ui/skeleton"
import Image from "next/image"

export function PlanHeroImage({ planId, goal, isArabic }: { planId: string, goal: string, isArabic: boolean }) {
    const [imageUrl, setImageUrl] = useState<string | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState(false)

    useEffect(() => {
        async function fetchImage() {
            try {
                const res = await fetch("/api/generate-image", {
                    method: "POST",
                    headers: { "Content-Type": "application/json" },
                    body: JSON.stringify({ planId, goal, isArabic })
                })
                const data = await res.json()
                if (data?.imageUrl) {
                    setImageUrl(`data:image/jpeg;base64,${data.imageUrl}`)
                } else {
                    setError(true)
                }
            } catch (err) {
                setError(true)
            } finally {
                setLoading(false)
            }
        }

        fetchImage()
    }, [planId, goal, isArabic])

    if (error) return null; // Gracefully degrade if DALL-E fails

    return (
        <div className="w-full aspect-video md:aspect-[21/9] relative rounded-2xl overflow-hidden shadow-2xl mb-8 border border-primary/20">
            {loading ? (
                <Skeleton className="w-full h-full bg-muted/60 absolute inset-0 rounded-2xl" />
            ) : (
                imageUrl && (
                    <Image
                        src={imageUrl}
                        alt="Dream Visualization"
                        fill
                        className="object-cover"
                        priority
                    />
                )
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-background/90 via-background/20 to-transparent flex items-end justify-center pb-6">
                <span className="bg-background/40 backdrop-blur-md px-4 py-1.5 rounded-full text-xs font-semibold tracking-wider uppercase text-foreground/80 border border-white/10 shadow-sm">
                    {isArabic ? "رؤية الذكاء الاصطناعي لحلمك" : "AI Dream Visualization"}
                </span>
            </div>
        </div>
    )
}
