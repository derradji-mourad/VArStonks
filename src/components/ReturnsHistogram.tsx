import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    ResponsiveContainer,
    Tooltip,
    ReferenceLine,
    CartesianGrid,
} from "recharts";
import { Card } from "@/components/ui/card";
import { BarChart3 } from "lucide-react";

export interface ReturnsBin {
    range: string;
    count: number;
    midpoint: number;
}

interface ReturnsHistogramProps {
    data: ReturnsBin[] | null;
    varPercent: number | null;
}

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const d = payload[0].payload;
        return (
            <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
                <p className="font-mono text-xs text-foreground">{d.range}</p>
                <p className="text-xs text-muted-foreground">{d.count} observations</p>
            </div>
        );
    }
    return null;
};

const ReturnsHistogram = ({ data, varPercent }: ReturnsHistogramProps) => {
    if (!data || data.length === 0) {
        return (
            <Card className="glass-card flex h-72 flex-col items-center justify-center gap-2">
                <BarChart3 className="h-8 w-8 text-muted-foreground/40" />
                <p className="text-sm text-muted-foreground">
                    Distribution des rendements
                </p>
                <p className="text-xs text-muted-foreground/60">
                    Disponible après le calcul
                </p>
            </Card>
        );
    }

    return (
        <Card className="glass-card p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Distribution des rendements journaliers
            </h3>
            <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={data} barCategoryGap={1}>
                        <CartesianGrid strokeDasharray="3 3" stroke="hsl(220, 14%, 15%)" />
                        <XAxis
                            dataKey="range"
                            tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }}
                            axisLine={{ stroke: "hsl(220, 14%, 18%)" }}
                            tickLine={false}
                            interval="preserveStartEnd"
                        />
                        <YAxis
                            tick={{ fontSize: 10, fill: "hsl(215, 15%, 55%)" }}
                            axisLine={{ stroke: "hsl(220, 14%, 18%)" }}
                            tickLine={false}
                        />
                        <Tooltip content={<CustomTooltip />} />
                        <Bar
                            dataKey="count"
                            fill="hsl(200, 65%, 50%)"
                            radius={[2, 2, 0, 0]}
                            animationDuration={600}
                        />
                        {varPercent !== null && (
                            <ReferenceLine
                                x={data.find((d) => d.midpoint <= -Math.abs(varPercent))?.range}
                                stroke="hsl(0, 72%, 55%)"
                                strokeWidth={2}
                                strokeDasharray="6 3"
                                label={{
                                    value: `VaR`,
                                    position: "top",
                                    fill: "hsl(0, 72%, 55%)",
                                    fontSize: 11,
                                    fontWeight: 600,
                                }}
                            />
                        )}
                    </BarChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default ReturnsHistogram;
