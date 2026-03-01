"use client"

import { Button } from "@/components/ui/button"
import { Share2, Download } from "lucide-react"
import { useState } from "react"
// Note: html2pdf is a client-side library. Implemented as dynamic import for Next.js
import dynamic from 'next/dynamic'

export function PlanActions({ planTitle, isArabic }: { planTitle: string, isArabic: boolean }) {
    const [isExporting, setIsExporting] = useState(false)
    const [copied, setCopied] = useState(false)

    const handleShare = async () => {
        try {
            if (navigator.share) {
                await navigator.share({
                    title: planTitle,
                    text: `Check out my new action plan on Dream Catalyst!`,
                    url: window.location.href,
                })
            } else {
                await navigator.clipboard.writeText(window.location.href)
                setCopied(true)
                setTimeout(() => setCopied(false), 2000)
            }
        } catch (err) {
            console.error("Error sharing:", err)
        }
    }

    const handleExportPDF = async () => {
        setIsExporting(true)
        try {
            const html2pdf = (await import('html2pdf.js')).default;
            const element = document.getElementById('plan-content-wrapper');

            if (!element) return;

            const opt = {
                margin: 10,
                filename: `${planTitle.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.pdf`,
                image: { type: 'jpeg' as const, quality: 0.98 },
                html2canvas: { scale: 2, useCORS: true },
                jsPDF: { unit: 'mm' as const, format: 'a4' as const, orientation: 'portrait' as const }
            };

            await html2pdf().from(element).set(opt).save();
        } catch (error) {
            console.error("Failed to generate PDF", error)
        } finally {
            setIsExporting(false)
        }
    }

    return (
        <div className="flex gap-4 justify-center md:justify-end print:hidden">
            <Button variant="outline" onClick={handleShare} className="gap-2">
                <Share2 className="w-4 h-4" />
                {copied ? (isArabic ? 'تم النسخ!' : 'Copied!') : (isArabic ? 'شارك الخطّة' : 'Share Plan')}
            </Button>
            <Button onClick={handleExportPDF} disabled={isExporting} className="gap-2">
                <Download className="w-4 h-4" />
                {isExporting ? (isArabic ? 'جاري التصدير...' : 'Exporting...') : (isArabic ? 'حفظ كـ PDF' : 'Save as PDF')}
            </Button>
        </div>
    )
}
