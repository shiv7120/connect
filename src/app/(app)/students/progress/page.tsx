'use client';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    Legend,
    ResponsiveContainer,
} from 'recharts';
import { progressReports } from "@/lib/data";

export default function ProgressPage() {
    return (
        <div className="space-y-8">
            <h1 className="text-3xl font-headline font-bold">Progress Reports</h1>
             <Card>
                <CardHeader>
                <CardTitle>Your Progress Over Time</CardTitle>
                <CardDescription>Monthly average scores across subjects.</CardDescription>
                </CardHeader>
                <CardContent className="h-[400px]">
                <ResponsiveContainer width="100%" height="100%">
                        <BarChart
                            data={progressReports}
                            margin={{
                                top: 5,
                                right: 30,
                                left: 20,
                                bottom: 5,
                            }}
                            >
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis dataKey="month" />
                            <YAxis />
                            <Tooltip />
                            <Legend />
                            <Bar dataKey="Math" fill="hsl(var(--chart-1))" />
                            <Bar dataKey="Science" fill="hsl(var(--chart-2))" />
                            <Bar dataKey="English" fill="hsl(var(--chart-3))" />
                        </BarChart>
                </ResponsiveContainer>
                </CardContent>
            </Card>
        </div>
    )
}
