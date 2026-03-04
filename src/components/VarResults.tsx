import { Card } from "@/components/ui/card";
import { TrendingDown, BarChart3, Activity, ShieldAlert } from "lucide-react";
import ReturnsHistogram, { ReturnsBin } from "./ReturnsHistogram";
import CumulativeReturnsChart, { CumulativeReturnPoint } from "./CumulativeReturnsChart";

export interface VarResultData {
  var_1d: number | null;
  cvar_1d: number | null;
  invested_amount: number;
  var_quantile: number;
  n_obs: number;
  returns_histogram?: ReturnsBin[];
  cumulative_returns?: CumulativeReturnPoint[];
}

interface VarResultsProps {
  result: VarResultData | null;
  isLoading: boolean;
}

const VarResults = ({ result, isLoading }: VarResultsProps) => {
  if (!result && !isLoading) {
    return (
      <div className="space-y-4">
        <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-border py-16 text-center">
          <BarChart3 className="mb-4 h-12 w-12 text-muted-foreground/40" />
          <p className="text-lg font-medium text-muted-foreground">
            Résultats de la VAR
          </p>
          <p className="mt-1 text-sm text-muted-foreground/70">
            Configurez les paramètres et lancez le calcul
          </p>
        </div>
        {/* Show empty chart placeholders */}
        <ReturnsHistogram data={null} varPercent={null} />
        <CumulativeReturnsChart data={null} />
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-primary/30 py-16 text-center">
        <Activity className="mb-4 h-12 w-12 animate-pulse text-primary" />
        <p className="text-lg font-medium text-primary">Calcul en cours...</p>
        <p className="mt-1 text-sm text-muted-foreground">
          Téléchargement des données et traitement
        </p>
      </div>
    );
  }

  const varPercent = result!.var_1d !== null && result!.invested_amount > 0
    ? result!.var_1d / result!.invested_amount
    : null;

  return (
    <div className="space-y-4">
      {/* KPI Cards */}
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card className="glass-card glow-green p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            VaR 1D ({(result!.var_quantile * 100).toFixed(0)}%)
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-primary">
            {result!.var_1d !== null
              ? `${result!.var_1d.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`
              : "—"}
          </p>
        </Card>
        <Card className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            CVaR 1D
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-destructive">
            {result!.cvar_1d !== null
              ? `${result!.cvar_1d.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}`
              : "—"}
          </p>
        </Card>
        <Card className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            VaR en %
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-warning">
            {varPercent !== null ? `${(varPercent * 100).toFixed(2)}%` : "—"}
          </p>
        </Card>
        <Card className="glass-card p-5">
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">
            Observations
          </p>
          <p className="mt-2 font-mono text-2xl font-bold text-foreground">
            {result!.n_obs} jours
          </p>
        </Card>
      </div>

      {/* Interpretation */}
      <Card className="glass-card flex items-center gap-3 p-4">
        <TrendingDown className="h-5 w-5 text-warning" />
        <p className="text-sm text-muted-foreground">
          Avec un niveau de confiance de <span className="font-semibold text-foreground">{(result!.var_quantile * 100).toFixed(0)}%</span>,
          la perte maximale sur 1 jour ne devrait pas dépasser{" "}
          <span className="font-semibold text-primary">
            {result!.var_1d?.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </span>.
        </p>
      </Card>

      {/* CVaR explanation */}
      <Card className="glass-card flex items-center gap-3 p-4">
        <ShieldAlert className="h-5 w-5 text-destructive" />
        <p className="text-sm text-muted-foreground">
          En cas de dépassement de la VaR, la perte moyenne attendue (CVaR) serait de{" "}
          <span className="font-semibold text-destructive">
            {result!.cvar_1d?.toLocaleString("fr-FR", { style: "currency", currency: "EUR" })}
          </span>.
        </p>
      </Card>

      {/* Stonks / Not Stonks Meme */}
      {(() => {
        const lastCumReturn = result!.cumulative_returns?.[result!.cumulative_returns.length - 1]?.value;
        const isProfit = lastCumReturn !== undefined ? lastCumReturn >= 0 : (varPercent !== null && varPercent < 0.03);
        return (
          <Card className="glass-card overflow-hidden p-0">
            <div className="relative">
              <img
                src={isProfit ? "/stonks-meme.jpg" : "/unstonkes.jpg"}
                alt={isProfit ? "Stonks! 📈" : "Not Stonks 📉"}
                className="w-full object-contain"
                style={{ maxHeight: "280px" }}
              />
              <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
                <p className={`text-center text-lg font-bold ${isProfit ? "text-emerald-400" : "text-red-400"}`}>
                  {isProfit ? "📈 STONKS" : "📉 NOT STONKS"}
                </p>
              </div>
            </div>
          </Card>
        );
      })()}

      {/* Charts */}
      <ReturnsHistogram
        data={result!.returns_histogram ?? null}
        varPercent={varPercent}
      />
      <CumulativeReturnsChart
        data={result!.cumulative_returns ?? null}
      />
    </div>
  );
};

export default VarResults;
