import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { redirect } from "next/navigation"
import { GoalForm } from "@/components/goal-form"

export default async function NewGoalPage() {
    const session = await getServerSession(authOptions)
    if (!session?.user) {
        redirect("/login")
    }

    return (
        <div className="container max-w-2xl mx-auto py-10 px-4">
            <div className="space-y-6">
                <div>
                    <h1 className="text-3xl font-bold tracking-tight">New Dream Analysis</h1>
                    <p className="text-muted-foreground">
                        What is your goal? We&apos;ll create a structured weekly plan for you.
                    </p>
                </div>
                <GoalForm />
            </div>
        </div>
    )
}
