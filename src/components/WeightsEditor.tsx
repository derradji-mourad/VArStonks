import { Stock } from "@/data/stocks";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Scale, Shuffle } from "lucide-react";

interface WeightsEditorProps {
  stocks: Stock[];
  weights: Record<string, number>;
  onWeightsChange: (weights: Record<string, number>) => void;
}

const WeightsEditor = ({ stocks, weights, onWeightsChange }: WeightsEditorProps) => {
  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);
  const isValid = Math.abs(totalWeight - 1) < 0.001;

  const equalizeWeights = () => {
    const w = 1 / stocks.length;
    const newWeights: Record<string, number> = {};
    stocks.forEach((s) => (newWeights[s.ticker] = parseFloat(w.toFixed(4))));
    onWeightsChange(newWeights);
  };

  const randomizeWeights = () => {
    // Génère des poids aléatoires qui somment à 1
    const raw = stocks.map(() => Math.random());
    const total = raw.reduce((s, v) => s + v, 0);
    const newWeights: Record<string, number> = {};
    stocks.forEach((s, i) => {
      newWeights[s.ticker] = parseFloat((raw[i] / total).toFixed(4));
    });
    // Ajuste le dernier pour que la somme soit exactement 1
    const currentSum = Object.values(newWeights).reduce((s, v) => s + v, 0);
    const lastTicker = stocks[stocks.length - 1].ticker;
    newWeights[lastTicker] = parseFloat((newWeights[lastTicker] + (1 - currentSum)).toFixed(4));
    onWeightsChange(newWeights);
  };

  const updateWeight = (ticker: string, value: string) => {
    const num = parseFloat(value) || 0;
    onWeightsChange({ ...weights, [ticker]: num });
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span
            className={`inline-block h-2 w-2 rounded-full ${isValid ? "bg-success" : "bg-destructive"}`}
          />
          <span className={`font-mono text-sm ${isValid ? "text-success" : "text-destructive"}`}>
            Σ = {totalWeight.toFixed(4)}
          </span>
        </div>
        <div className="flex gap-1.5">
          <Button
            variant="outline"
            size="sm"
            onClick={randomizeWeights}
            className="gap-1.5 text-xs"
          >
            <Shuffle className="h-3 w-3" /> Aléatoire
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={equalizeWeights}
            className="gap-1.5 text-xs"
          >
            <Scale className="h-3 w-3" /> Équipondérer
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        {stocks.map((stock) => (
          <div key={stock.ticker} className="flex items-center gap-2 rounded-md border border-border bg-secondary/30 px-2 py-1.5">
            <span className="font-mono text-xs font-semibold text-primary min-w-[60px]">
              {stock.ticker}
            </span>
            <Input
              type="number"
              step="0.01"
              min="0"
              max="1"
              value={weights[stock.ticker] ?? 0}
              onChange={(e) => updateWeight(stock.ticker, e.target.value)}
              className="h-7 border-0 bg-transparent px-1 text-right font-mono text-sm focus-visible:ring-1"
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default WeightsEditor;
