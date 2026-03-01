"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ArrowRight, Sparkles, Moon, Sun, Zap, Brain, Loader2 } from "lucide-react";

export function ClientPageRoot() {
    const router = useRouter();
    const [goal, setGoal] = useState("");
    const [language, setLanguage] = useState<"en" | "ar">("ar");
    const [model, setModel] = useState<"gemini" | "claude">("gemini");
    const [complexity, setComplexity] = useState<"simple" | "detailed" | "genius">("simple");
    const [isLoading, setIsLoading] = useState(false);
    const [faceOffMode, setFaceOffMode] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);

        try {
            const apiModel = faceOffMode ? 'BOTH' : (model === 'gemini' ? 'GEMINI' : 'CLAUDE');
            const apiLanguage = language.toUpperCase();
            const apiComplexity = complexity.toUpperCase();
            const endpoint = apiModel === 'BOTH' ? '/api/generate-faceoff' : '/api/generate-plan';

            const res = await fetch(endpoint, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ goal, language: apiLanguage, complexity: apiComplexity, model: apiModel })
            })

            const data = await res.json()
            if (apiModel === 'BOTH' && data?.faceoffId) {
                router.push(`/plan/compare/${data.faceoffId}`)
            } else if (data?.planId) {
                router.push(`/plan/${data.planId}`)
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gradient-to-b from-gray-50 to-white dark:from-gray-950 dark:to-gray-900" dir={language === "ar" ? "rtl" : "ltr"}>
            {/* Hero Section - متجاوب تماماً */}
            <div className="relative overflow-hidden bg-gradient-to-br from-purple-600 via-pink-500 to-orange-400 dark:from-purple-900 dark:via-pink-800 dark:to-orange-800">
                <div className="absolute inset-0 bg-grid-white/10 [mask-image:radial-gradient(ellipse_at_center,white,transparent)]" />

                <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 sm:py-16 lg:py-20">
                    <div className="text-center">
                        {/* أيقونة متحركة - تظهر بشكل جميل على الجوال */}
                        <div className="inline-flex animate-bounce mb-4 sm:mb-6">
                            <div className="p-2 sm:p-3 bg-white/20 backdrop-blur-lg rounded-2xl">
                                <Sparkles className="w-6 h-6 sm:w-8 sm:h-8 text-white" />
                            </div>
                        </div>

                        {/* عنوان رئيسي - حجم خط متغير حسب الشاشة */}
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-3 sm:mb-4 px-2">
                            {language === "ar" ? "حلل حلمك الجديد" : "New Dream Analysis"}
                        </h1>

                        {/* وصف - مخفي على الشاشات الصغيرة جداً */}
                        <p className="text-base sm:text-lg text-white/90 max-w-2xl mx-auto hidden sm:block">
                            {language === "ar"
                                ? "أخبرنا بهدفك وسنقوم بإنشاء خطة أسبوعية منظمة لك باستخدام أقوى نماذج الذكاء الاصطناعي"
                                : "Tell us your goal and we'll create a structured weekly plan for you using the power of AI"}
                        </p>

                        {/* وصف مختصر للجوال فقط */}
                        <p className="text-sm text-white/90 sm:hidden mt-2">
                            {language === "ar" ? "هدفك + ذكاء اصطناعي = خطة أسبوعية" : "Your goal + AI = Weekly plan"}
                        </p>
                    </div>
                </div>
            </div>

            {/* بطاقة الإدخال الرئيسية - متجاوبة بشكل رائع */}
            <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 -mt-8 sm:-mt-12 pb-12 sm:pb-16">
                <Card className="border-0 shadow-2xl bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm">
                    <form onSubmit={handleSubmit}>
                        <CardHeader className="space-y-1 p-4 sm:p-6">
                            <CardTitle className="text-xl sm:text-2xl">
                                {language === "ar" ? "ما هو هدفك؟" : "What is your goal?"}
                            </CardTitle>
                            <CardDescription className="text-sm sm:text-base">
                                {language === "ar"
                                    ? "كن محدداً قدر الإمكان للحصول على أفضل النتائج"
                                    : "Be as specific as possible for best results"}
                            </CardDescription>
                        </CardHeader>

                        <CardContent className="space-y-4 sm:space-y-6 p-4 sm:p-6 pt-0 sm:pt-0">
                            {/* Toggle Language - بحجم مناسب للجوال */}
                            <div className="flex justify-center sm:justify-end">
                                <Tabs value={language} onValueChange={(v) => setLanguage(v as "en" | "ar")} className="w-full sm:w-auto">
                                    <TabsList className="grid grid-cols-2 w-full sm:w-[200px]">
                                        <TabsTrigger value="en" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                                            <Sun className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="hidden sm:inline">English</span>
                                            <span className="sm:hidden">EN</span>
                                        </TabsTrigger>
                                        <TabsTrigger value="ar" className="text-xs sm:text-sm flex items-center gap-1 sm:gap-2">
                                            <Moon className="w-3 h-3 sm:w-4 sm:h-4" />
                                            <span className="hidden sm:inline">العربية</span>
                                            <span className="sm:hidden">AR</span>
                                        </TabsTrigger>
                                    </TabsList>
                                </Tabs>
                            </div>

                            {/* Textarea - أكبر على الجوال لسهولة الكتابة */}
                            <div className="space-y-2">
                                <Label htmlFor="goal" className="text-sm sm:text-base">
                                    {language === "ar" ? "هدفك" : "Your Goal"}
                                </Label>
                                <Textarea
                                    id="goal"
                                    placeholder={language === "ar" ? "مثال: أتعلم Next.js في شهر..." : "Example: Learn Next.js in a month..."}
                                    value={goal}
                                    onChange={(e) => setGoal(e.target.value)}
                                    className="min-h-[100px] sm:min-h-[120px] text-sm sm:text-base"
                                    dir={language === "ar" ? "rtl" : "ltr"}
                                />
                            </div>

                            {/* Grid للاختيارات - تتحول من عمودي على الجوال إلى أفقي على سطح المكتب */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                {/* اختيار النموذج */}
                                <div className="space-y-2">
                                    <Label className="text-sm sm:text-base">
                                        {language === "ar" ? "نموذج الذكاء الاصطناعي" : "AI Model"}
                                    </Label>
                                    <Select value={model} onValueChange={(v) => setModel(v as "gemini" | "claude")}>
                                        <SelectTrigger className="w-full">
                                            <SelectValue>
                                                <div className="flex items-center gap-2">
                                                    {model === "gemini" ? (
                                                        <>
                                                            <Zap className="w-4 h-4 text-yellow-500" />
                                                            <span>Gemini 1.5 Flash</span>
                                                            <span className="text-xs text-gray-500 ml-2 hidden sm:inline">(Fast)</span>
                                                        </>
                                                    ) : (
                                                        <>
                                                            <Brain className="w-4 h-4 text-purple-500" />
                                                            <span>Claude 3.5 Sonnet</span>
                                                            <span className="text-xs text-gray-500 ml-2 hidden sm:inline">(Deep)</span>
                                                        </>
                                                    )}
                                                </div>
                                            </SelectValue>
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="gemini">
                                                <div className="flex items-center gap-2">
                                                    <Zap className="w-4 h-4 text-yellow-500" />
                                                    <span>Gemini 1.5 Flash</span>
                                                    <span className="text-xs text-gray-500">(Fast)</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="claude">
                                                <div className="flex items-center gap-2">
                                                    <Brain className="w-4 h-4 text-purple-500" />
                                                    <span>Claude 3.5 Sonnet</span>
                                                    <span className="text-xs text-gray-500">(Deep)</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                {/* اختيار التعقيد */}
                                <div className="space-y-2">
                                    <Label className="text-sm sm:text-base">
                                        {language === "ar" ? "مستوى التفاصيل" : "Complexity"}
                                    </Label>
                                    <Select value={complexity} onValueChange={(v) => setComplexity(v as "simple" | "detailed" | "genius")}>
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value="simple">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
                                                    <span>Simple</span>
                                                    <span className="text-xs text-gray-500">({language === "ar" ? "بسيط" : "2-3 tasks/day"})</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="detailed">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
                                                    <span>Detailed</span>
                                                    <span className="text-xs text-gray-500">({language === "ar" ? "مفصل" : "4-5 tasks/day"})</span>
                                                </div>
                                            </SelectItem>
                                            <SelectItem value="genius">
                                                <div className="flex flex-col sm:flex-row sm:items-center gap-0 sm:gap-2">
                                                    <span>Genius</span>
                                                    <span className="text-xs text-gray-500">({language === "ar" ? "عبقري" : "Strategic"})</span>
                                                </div>
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            {/* Face-Off Mode Toggle - تصميم جميل للجوال */}
                            <div className="flex items-center justify-between p-3 sm:p-4 bg-purple-50 dark:bg-purple-950/30 rounded-lg">
                                <div className="flex items-center gap-2 sm:gap-3">
                                    <div className="p-1.5 sm:p-2 bg-purple-100 dark:bg-purple-900 rounded-lg">
                                        <Sparkles className="w-3 h-3 sm:w-4 sm:h-4 text-purple-600 dark:text-purple-300" />
                                    </div>
                                    <div>
                                        <p className="text-xs sm:text-sm font-medium">
                                            {language === "ar" ? "وضع المواجهة" : "Face-Off Mode"}
                                        </p>
                                        <p className="text-[10px] sm:text-xs text-gray-500">
                                            {language === "ar"
                                                ? "قارن خطط Gemini و Claude جنباً إلى جنب"
                                                : "Compare Gemini vs Claude side by side"}
                                        </p>
                                    </div>
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setFaceOffMode(!faceOffMode)}
                                    className={`relative inline-flex h-5 sm:h-6 w-9 sm:w-11 items-center rounded-full transition-colors focus:outline-none ${faceOffMode ? "bg-purple-600" : "bg-gray-200 dark:bg-gray-700"
                                        }`}
                                >
                                    <span
                                        className={`inline-block h-4 sm:h-5 w-4 sm:w-5 transform rounded-full bg-white transition-transform ${faceOffMode ? "translate-x-5 sm:translate-x-6" : "translate-x-0.5"
                                            }`}
                                    />
                                </button>
                            </div>
                        </CardContent>

                        <CardFooter className="p-4 sm:p-6 pt-0 sm:pt-0">
                            <Button
                                type="submit"
                                disabled={!goal || isLoading}
                                className="w-full h-11 sm:h-12 text-sm sm:text-base bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="w-4 h-4 sm:w-5 sm:h-5 animate-spin ml-2" />
                                        {language === "ar" ? "جاري التحليل..." : "Analyzing..."}
                                    </>
                                ) : (
                                    <>
                                        {language === "ar" ? "إنشاء خطة العمل" : "Generate Action Plan"}
                                        <ArrowRight className={`w-4 h-4 sm:w-5 sm:h-5 ${language === "ar" ? "mr-2 rotate-180" : "ml-2"}`} />
                                    </>
                                )}
                            </Button>
                        </CardFooter>
                    </form>
                </Card>

                {/* شعارات الثقة - تظهر فقط على الشاشات المتوسطة فما فوق */}
                <div className="mt-6 sm:mt-8 text-center hidden sm:block">
                    <p className="text-xs text-gray-500">
                        {language === "ar"
                            ? "مدعوم من Gemini, Claude, و DALL-E • خطتك في ثوانٍ"
                            : "Powered by Gemini, Claude & DALL-E • Your plan in seconds"}
                    </p>
                </div>

                {/* نسخة مبسطة للجوال */}
                <div className="mt-4 text-center sm:hidden">
                    <p className="text-[10px] text-gray-400">
                        Gemini • Claude • DALL-E
                    </p>
                </div>
            </div>
        </div>
    );
}
