import { useState } from "react";
import { AVAILABLE_STOCKS, Stock } from "@/data/stocks";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Search, X, Plus } from "lucide-react";

interface StockSelectorProps {
  selected: Stock[];
  onSelect: (stocks: Stock[]) => void;
  maxStocks?: number;
}

const StockSelector = ({ selected, onSelect, maxStocks = 20 }: StockSelectorProps) => {
  const [search, setSearch] = useState("");
  const [filterIndex, setFilterIndex] = useState<string>("Tous");

  const indices = ["Tous", "CAC40", "SP500", "EUROSTOXX50", "SBF120"];

  const filtered = AVAILABLE_STOCKS.filter((s) => {
    const matchSearch =
      s.name.toLowerCase().includes(search.toLowerCase()) ||
      s.ticker.toLowerCase().includes(search.toLowerCase());
    const matchIndex = filterIndex === "Tous" || s.index === filterIndex;
    return matchSearch && matchIndex;
  });

  const isSelected = (ticker: string) => selected.some((s) => s.ticker === ticker);

  const toggle = (stock: Stock) => {
    if (isSelected(stock.ticker)) {
      onSelect(selected.filter((s) => s.ticker !== stock.ticker));
    } else if (selected.length < maxStocks) {
      onSelect([...selected, stock]);
    }
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 rounded-md border border-border bg-secondary/50 px-3">
        <Search className="h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Rechercher une action..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="border-0 bg-transparent px-0 focus-visible:ring-0"
        />
      </div>

      <div className="flex flex-wrap gap-1.5">
        {indices.map((idx) => (
          <button
            key={idx}
            onClick={() => setFilterIndex(idx)}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${filterIndex === idx
              ? "bg-primary text-primary-foreground"
              : "bg-secondary text-secondary-foreground hover:bg-secondary/80"
              }`}
          >
            {idx}
          </button>
        ))}
      </div>

      {selected.length > 0 && (
        <div className="flex flex-wrap gap-1.5">
          {selected.map((s) => (
            <Badge
              key={s.ticker}
              variant="outline"
              className="cursor-pointer gap-1 border-primary/30 bg-primary/10 text-primary hover:bg-primary/20"
              onClick={() => toggle(s)}
            >
              {s.ticker}
              <X className="h-3 w-3" />
            </Badge>
          ))}
        </div>
      )}

      <ScrollArea className="h-48 rounded-md border border-border">
        <div className="space-y-0.5 p-1">
          {filtered.map((stock) => (
            <button
              key={`${stock.ticker}-${stock.index}`}
              onClick={() => toggle(stock)}
              disabled={!isSelected(stock.ticker) && selected.length >= maxStocks}
              className={`flex w-full items-center justify-between rounded-md px-3 py-2 text-sm transition-colors ${isSelected(stock.ticker)
                ? "bg-primary/15 text-primary"
                : "hover:bg-secondary text-foreground disabled:opacity-40"
                }`}
            >
              <span>
                <span className="font-mono font-semibold">{stock.ticker}</span>
                <span className="ml-2 text-muted-foreground">{stock.name}</span>
              </span>
              <span className="flex items-center gap-2">
                <span className="text-xs text-muted-foreground">{stock.index}</span>
                {!isSelected(stock.ticker) && <Plus className="h-3 w-3 text-muted-foreground" />}
              </span>
            </button>
          ))}
        </div>
      </ScrollArea>

      <p className="text-xs text-muted-foreground">
        {selected.length}/20 actions sélectionnées (min. 10)
      </p>
    </div>
  );
};

export default StockSelector;
