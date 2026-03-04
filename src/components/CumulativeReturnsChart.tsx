import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    CartesianGrid,
    Area,
    AreaChart,
} from "recharts";
import { Card } from "@/components/ui/card";
import { Activity } from "lucide-react";

export interface CumulativeReturnPoint {
    date: string;
    value: number;
}

interface CumulativeReturnsChartProps {
    data: CumulativeReturnPoint[] | null;
}

const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
        const val = payload[0].value;
        const isPositive = val >= 0;
        return (
            <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
                <p className="font-mono text-xs text-muted-foreground">{label}</p>
                <p className={`font-mono text-sm font-semibold ${isPositive ? "text-emerald-400" : "text-red-400"}`}>
                    {isPositive ? "+" : ""}{(val * 100).toFixed(2)}%
                </p>
            </div>
        );
    }
    return null;
};

const CumulativeReturnsChart = ({ data }: CumulativeReturnsChartProps) => {
    if (!data || data.length === 0) {
        return (
            <Card className="glass-card flex h-72 flex-col items-center justify-center gap-2">
                <Activity className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                    Rendements cumulés du portefeuille
                </p>
                <p className="text-xs text-muted-foreground/60">
                    Disponible après le calcul
                </p>
            </Card>
        );
    }

    // Sample data to max 200 points for performance
    const sampled =
        data.length > 200
            ? data.filter((_, i) => i % Math.ceil(data.length / 200) === 0 || i === data.length - 1)
            : data;

    const lastValue = sampled[sampled.length - 1]?.value ?? 0;
    const lineColor = lastValue >= 0 ? "hsl(152, 60%, 45%)" : "hsl(0, 72%, 55%)";
    const gradientId = "cumulativeGradient";

    return (
        <Card className="glass-card p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Rendements cumulés du portefeuille
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={sampled}>
                        <defs>
                            <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                                <stop offset="0%" stopColor={lineColor} stopOpacity={0.3} />
                                <stop offset="100%" stopColor={lineColor} stopOpacity={0} />
                            </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 15%)" />
                        <XAxis
                            dataKey="date"
                            tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }}
                            axisLine={{ stroke: "hsl(220, 14%, 18%)" }}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }}
                            axisLine={{ stroke: "hsl(220, 14%, 18%)" }}
                            tickLine={false}
                            tickFormatter={(v: number) => `${(v * 100).toFixed(0)}%`}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Area
                            type="monotone"
                            dataKey="value"
                            stroke={lineColor}
                            strokeWidth={2}
                            fill={`url(#${gradientId})`}
                            dot={false}
                            animationDuration={800}
                        />
                    </AreaChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default CumulativeReturnsChart;
