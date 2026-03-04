import { useState } from "react";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { Calculator, TrendingDown, Code2, ChevronDown, ChevronUp } from "lucide-react";
import PortfolioChart from "@/components/PortfolioChart";
import StockSelector from "@/components/StockSelector";
import WeightsEditor from "@/components/WeightsEditor";
import VarResults, { VarResultData } from "@/components/VarResults";
import { Stock } from "@/data/stocks";
import { toast } from "sonner";

const UNIVERSE_OPTIONS = ["CAC40", "SP500", "EUROSTOXX50", "SBF120"] as const;

const Index = () => {
  const [selectedStocks, setSelectedStocks] = useState<Stock[]>([]);
  const [weights, setWeights] = useState<Record<string, number>>({});
  const [amount, setAmount] = useState<string>("1000000");
  const [quantile, setQuantile] = useState<string>("99");
  const [startDate, setStartDate] = useState<string>("2023-01-01");
  const [endDate, setEndDate] = useState<string>("2024-12-31");
  const [universe, setUniverse] = useState<string>("CAC40");
  const [result, setResult] = useState<VarResultData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [showPayload, setShowPayload] = useState(false);

  const handleStocksChange = (stocks: Stock[]) => {
    setSelectedStocks(stocks);
    const newWeights = { ...weights };
    stocks.forEach((s) => {
      if (!(s.ticker in newWeights)) newWeights[s.ticker] = 0;
    });
    Object.keys(newWeights).forEach((k) => {
      if (!stocks.some((s) => s.ticker === k)) delete newWeights[k];
    });
    setWeights(newWeights);
  };

  const totalWeight = Object.values(weights).reduce((sum, w) => sum + w, 0);

  const buildPayload = () => {
    const tickers = selectedStocks.map((s) => s.ticker);
    const weightsArray = tickers.map((t) => weights[t] || 0);
    const q = parseFloat(quantile) || 99;

    return {
      tickers: tickers,
      weights: weightsArray,
      invested_amount: parseFloat(amount) || 0,
      var_quantile: q > 1 ? q / 100 : q,
      start_date: startDate,
      end_date: endDate,
      universe: universe,
    };
  };

  const validate = (): boolean => {
    if (selectedStocks.length < 10) {
      toast.error("Sélectionnez au moins 10 actions");
      return false;
    }
    if (selectedStocks.length > 20) {
      toast.error("Maximum 20 actions");
      return false;
    }
    if (Math.abs(totalWeight - 1) > 0.01) {
      toast.error("La somme des pondérations doit être égale à 1");
      return false;
    }
    if (!amount || parseFloat(amount) <= 0) {
      toast.error("Le montant investi doit être positif");
      return false;
    }
    const q = parseFloat(quantile);
    if (q <= 0 || q >= 100) {
      toast.error("Le quantile doit être entre 0 et 100");
      return false;
    }
    if (!startDate || !endDate || startDate >= endDate) {
      toast.error("Les dates sont invalides");
      return false;
    }
    return true;
  };

  const handleCalculate = async () => {
    if (!validate()) return;

    const payload = buildPayload();

    setIsLoading(true);
    setResult(null);

    try {
      const res = await fetch("/api/var", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(`Erreur ${res.status}: ${errText}`);
      }

      const data = await res.json();

      if (data.error) {
        throw new Error(data.error);
      }

      setResult({
        var_1d: data.var_1d ?? null,
        cvar_1d: data.cvar_1d ?? null,
        invested_amount: data.invested_amount ?? parseFloat(amount),
        var_quantile: data.var_quantile ?? (parseFloat(quantile) / 100),
        n_obs: data.n_obs ?? 0,
        returns_histogram: data.returns_histogram ?? undefined,
        cumulative_returns: data.cumulative_returns ?? undefined,
      });
      toast.success("Calcul VAR terminé !");
    } catch (err: any) {
      toast.error(err.message || "Erreur lors du calcul de la VAR");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-background bg-grid p-4 sm:p-6 lg:p-8">
      <div className="mx-auto max-w-6xl">
        {/* Header */}
        <div className="mb-8 flex items-center gap-3 animate-fade-in">
          <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-primary/15 ring-1 ring-primary/20">
            <TrendingDown className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-gradient">
              VAR Historique 1D
            </h1>
            <p className="text-sm text-muted-foreground">
              Calcul de Value at Risk via script Python local
            </p>
          </div>
        </div>

        <div className="grid gap-6 lg:grid-cols-5">
          {/* Left: Form */}
          <div className="space-y-5 lg:col-span-2">
            {/* Universe selector */}
            <Card className="glass-card p-4 animate-fade-in animate-fade-in-delay-1">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                Univers
              </h2>
              <div className="flex flex-wrap gap-1.5">
                {UNIVERSE_OPTIONS.map((u) => (
                  <button
                    key={u}
                    onClick={() => setUniverse(u)}
                    className={`rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${universe === u
                        ? "bg-primary text-primary-foreground"
                        : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
                      }`}
                  >
                    {u}
                  </button>
                ))}
              </div>
            </Card>

            {/* Stocks */}
            <Card className="glass-card p-4 animate-fade-in animate-fade-in-delay-2">
              <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                1. Sélection des actions (10–20)
              </h2>
              <StockSelector selected={selectedStocks} onSelect={handleStocksChange} />
            </Card>

            {/* Parameters */}
            <Card className="glass-card space-y-4 p-4 animate-fade-in animate-fade-in-delay-3">
              <h2 className="text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                2. Paramètres
              </h2>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Montant investi (€)</Label>
                  <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Quantile (%)</Label>
                  <Input type="number" min="1" max="99" value={quantile} onChange={(e) => setQuantile(e.target.value)} className="font-mono" />
                </div>
              </div>
              <Separator className="bg-border/50" />
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Date de début</Label>
                  <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} className="font-mono" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs text-muted-foreground">Date de fin</Label>
                  <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} className="font-mono" />
                </div>
              </div>
            </Card>

            {/* Weights */}
            {selectedStocks.length > 0 && (
              <Card className="glass-card p-4 animate-fade-in animate-fade-in-delay-4">
                <h2 className="mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  3. Pondérations
                </h2>
                <WeightsEditor stocks={selectedStocks} weights={weights} onWeightsChange={setWeights} />
              </Card>
            )}

            {/* Payload Preview */}
            <div className="animate-fade-in animate-fade-in-delay-4">
              <button
                onClick={() => setShowPayload(!showPayload)}
                className="flex w-full items-center justify-between rounded-md border border-border/60 bg-secondary/30 px-3 py-2 text-xs text-muted-foreground transition-colors hover:bg-secondary/50"
              >
                <span className="flex items-center gap-1.5">
                  <Code2 className="h-3.5 w-3.5" />
                  Aperçu du payload JSON
                </span>
                {showPayload ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
              </button>
              {showPayload && (
                <pre className="mt-2 max-h-60 overflow-auto rounded-md border border-border bg-background/80 p-3 font-mono text-[11px] text-muted-foreground">
                  {JSON.stringify(buildPayload(), null, 2)}
                </pre>
              )}
            </div>

            {/* Calculate */}
            <Button onClick={handleCalculate} disabled={isLoading} className="w-full gap-2 animate-fade-in" size="lg">
              <Calculator className="h-4 w-4" />
              {isLoading ? "Calcul en cours..." : "Calculer la VAR"}
            </Button>
          </div>

          {/* Right: Results + Charts */}
          <div className="lg:col-span-3 space-y-5 animate-fade-in animate-fade-in-delay-2">
            {/* Portfolio Allocation Chart */}
            {selectedStocks.length > 0 && Object.values(weights).some((w) => w > 0) && (
              <PortfolioChart
                stocks={selectedStocks}
                weights={weights}
                amount={parseFloat(amount) || 0}
              />
            )}

            {/* VAR Results + Charts */}
            <VarResults result={result} isLoading={isLoading} />
          </div>
        </div>

        {/* Footer */}
        <footer className="mt-12 border-t border-border/40 pt-6 text-center text-xs text-muted-foreground/60 animate-fade-in">
          <p>VAR Historique 1D — Projet universitaire • Calcul local via Python</p>
          <p className="mt-1">CAC40 • SP500 • EUROSTOXX50 • SBF120</p>
        </footer>
      </div>
    </div>
  );
};

export default Index;
