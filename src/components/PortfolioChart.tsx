import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend } from "recharts";
import { Card } from "@/components/ui/card";
import { Stock } from "@/data/stocks";

interface PortfolioChartProps {
    stocks: Stock[];
    weights: Record<string, number>;
    amount: number;
}

const COLORS = [
    "hsl(152, 60%, 45%)",
    "hsl(200, 65%, 50%)",
    "hsl(38, 92%, 50%)",
    "hsl(280, 55%, 55%)",
    "hsl(340, 65%, 55%)",
    "hsl(170, 55%, 45%)",
    "hsl(220, 60%, 55%)",
    "hsl(15, 75%, 55%)",
    "hsl(60, 65%, 45%)",
    "hsl(310, 50%, 50%)",
    "hsl(130, 50%, 45%)",
    "hsl(250, 55%, 55%)",
    "hsl(0, 60%, 50%)",
    "hsl(180, 50%, 50%)",
    "hsl(90, 50%, 45%)",
    "hsl(45, 70%, 50%)",
    "hsl(190, 60%, 45%)",
    "hsl(330, 55%, 50%)",
    "hsl(260, 50%, 55%)",
    "hsl(110, 55%, 40%)",
];

const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
        const data = payload[0].payload;
        return (
            <div className="rounded-lg border border-border bg-popover px-3 py-2 shadow-lg">
                <p className="font-mono text-xs font-semibold text-foreground">{data.ticker}</p>
                <p className="text-xs text-muted-foreground">{data.name}</p>
                <p className="mt-1 text-xs text-primary">
                    {(data.weight * 100).toFixed(2)}% — {data.value.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
                </p>
            </div>
        );
    }
    return null;
};

const PortfolioChart = ({ stocks, weights, amount }: PortfolioChartProps) => {
    const data = stocks
        .filter((s) => (weights[s.ticker] ?? 0) > 0)
        .map((s) => ({
            ticker: s.ticker,
            name: s.name,
            weight: weights[s.ticker] ?? 0,
            value: (weights[s.ticker] ?? 0) * amount,
        }))
        .sort((a, b) => b.weight - a.weight);

    if (data.length === 0) {
        return (
            <Card className="glass-card flex h-72 items-center justify-center">
                <p className="text-sm text-muted-foreground">
                    Sélectionnez des actions et définissez les pondérations
                </p>
            </Card>
        );
    }

    return (
        <Card className="glass-card p-4">
            <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Allocation du portefeuille
            </h3>
            <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                        <Pie
                            data={data}
                            cx="50%"
                            cy="50%"
                            innerRadius={60}
                            outerRadius={100}
                            paddingAngle={2}
                            dataKey="value"
                            stroke="none"
                            animationBegin={0}
                            animationDuration={800}
                        >
                            {data.map((_entry, index) => (
                                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                            ))}
                        </Pie>
                        <Tooltip content={<CustomTooltip />} />
                        <Legend
                            verticalAlign="bottom"
                            height={36}
                            formatter={(value: string, entry: any) => (
                                <span className="text-xs text-muted-foreground">
                                    {entry.payload.ticker}
                                </span>
                            )}
                        />
                    </PieChart>
                </ResponsiveContainer>
            </div>
        </Card>
    );
};

export default PortfolioChart;
