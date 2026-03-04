#!/usr/bin/env python3
"""
VAR Historique 1D — Calculateur autonome
Lit un payload JSON depuis stdin et écrit le résultat JSON sur stdout.
Utilise le code de calcul VAR fourni (var_historical_1d) + génération de données graphiques.
"""

import sys
import json
from datetime import date

import numpy as np
import pandas as pd
import yfinance as yf


# Univers d'actions autorisées
UNIVERSES = {
    "CAC40": {
        "OR.PA", "AIR.PA", "MC.PA", "BNP.PA", "SAN.PA",
        "SU.PA", "DG.PA", "KER.PA", "CAP.PA", "VIE.PA",
        "RI.PA", "RMS.PA", "TTE.PA", "ENGI.PA", "VIV.PA",
    },
    "SP500": {
        "AAPL", "MSFT", "AMZN", "GOOGL", "META",
        "NVDA", "JPM", "JNJ", "XOM", "PG",
        "HD", "KO", "PEP", "CSCO", "ADBE",
    },
    "EUROSTOXX50": {
        "AIR.PA", "BN.PA", "MC.PA", "OR.PA", "SAN.PA",
        "SIE.DE", "SAP.DE", "ALV.DE", "BAS.DE", "BMW.DE",
        "INGA.AS", "AD.AS", "UNA.AS", "IBE.MC", "ENEL.MI",
    },
    "SBF120": {
        "OR.PA", "AIR.PA", "MC.PA", "BNP.PA", "SAN.PA",
        "DG.PA", "KER.PA", "CAP.PA", "VIE.PA", "RNO.PA",
        "PUB.PA", "ACA.PA", "GLE.PA", "SAF.PA", "SGO.PA",
    },
}


def list_universes():
    """Affiche les univers disponibles."""
    return {k: sorted(list(v)) for k, v in UNIVERSES.items()}


def var_historical_1d(tickers, weights, invested_amount, var_quantile, start_date, end_date, universe="CAC40"):
    """
    Calcule la VaR 1 jour historique d'un portefeuille.
    Retourne un dictionnaire avec VaR et CVaR.
    """

    # 1) Nettoyage simple
    tickers = [t.strip().upper() for t in tickers]
    universe = universe.strip().upper()

    # 2) Vérifications (simples)
    if not (1 <= len(tickers) <= 20):
        raise ValueError("Il faut au moins 1 ticker (max 20).")

    if len(weights) != len(tickers):
        raise ValueError("weights doit avoir la même taille que tickers.")

    if start_date >= end_date:
        raise ValueError("start_date doit être < end_date.")

    if invested_amount <= 0:
        raise ValueError("invested_amount doit être > 0.")

    if not (0 < var_quantile < 1):
        raise ValueError("var_quantile doit être entre 0 et 1 (ex: 0.99).")

    w = np.array(weights, dtype=float)

    if (w < 0).any():
        raise ValueError("Les poids ne peuvent pas être négatifs.")

    if abs(w.sum() - 1.0) > 1e-6:
        raise ValueError(f"La somme des poids doit faire 1. (actuel={w.sum()})")

    if universe == "MIXED":
        # Mode mélange : pas de vérification d'appartenance à un univers
        pass
    elif universe not in UNIVERSES:
        raise ValueError("Universe inconnu (CAC40, SP500, EUROSTOXX50, SBF120, MIXED).")
    else:
        # vérifier que les tickers sont bien dans l'univers
        allowed = UNIVERSES[universe]
        not_in = [t for t in tickers if t not in allowed]
        if not_in:
            raise ValueError(f"Tickers pas dans {universe}: {not_in}")

    # 3) Télécharger les prix ajustés (Adj Close)
    end_plus = pd.Timestamp(end_date) + pd.Timedelta(days=1)
    data = yf.download(tickers, start=pd.Timestamp(start_date), end=end_plus, progress=False)

    # Compatibilité yfinance : v0.2.18+ utilise 'Close' (auto_adjust=True par défaut)
    if "Adj Close" in data.columns:
        adj = data["Adj Close"].copy()
    elif "Close" in data.columns:
        adj = data["Close"].copy()
    else:
        raise ValueError("yfinance n'a renvoyé ni 'Adj Close' ni 'Close'.")

    # 4) Nettoyage simple des données
    adj = adj.ffill()         # remplit les trous avec la dernière valeur connue
    adj = adj.dropna()        # enlève les lignes restantes avec NaN

    if len(adj) < 30:
        raise ValueError("Pas assez de jours d'historique (moins de 30).")

    # 5) Rendements journaliers
    rets = adj.pct_change().dropna()

    # 6) Rendement portefeuille -> PnL
    port_ret = rets.values @ w
    pnl = invested_amount * port_ret

    # 7) VaR / CVaR
    alpha = 1 - var_quantile
    q_alpha = np.quantile(pnl, alpha)          # quantile (négatif en général)
    var_1d = -q_alpha                          # VaR positive = perte potentielle
    cvar_1d = -pnl[pnl <= q_alpha].mean()      # perte moyenne dans la "queue"

    # 8) Résultat de base
    result = {
        "universe": universe,
        "tickers": tickers,
        "start_date": str(start_date),
        "end_date": str(end_date),
        "n_obs": int(len(rets)),
        "invested_amount": float(invested_amount),
        "var_quantile": float(var_quantile),
        "var_1d": float(var_1d),
        "cvar_1d": float(cvar_1d),
    }

    # 9) Données supplémentaires pour les graphiques du frontend

    # Histogramme des rendements du portefeuille
    hist_counts, bin_edges = np.histogram(port_ret, bins=40)
    returns_histogram = []
    for i in range(len(hist_counts)):
        low = bin_edges[i]
        high = bin_edges[i + 1]
        midpoint = (low + high) / 2
        returns_histogram.append({
            "range": f"{low * 100:.2f}%",
            "count": int(hist_counts[i]),
            "midpoint": float(midpoint),
        })
    result["returns_histogram"] = returns_histogram

    # Rendements cumulés du portefeuille
    cumulative = (1 + pd.Series(port_ret, index=rets.index)).cumprod() - 1
    dates_list = cumulative.index.strftime("%Y-%m-%d").tolist()
    result["cumulative_returns"] = [
        {"date": d, "value": float(v)}
        for d, v in zip(dates_list, cumulative.values)
    ]

    return result


def main():
    try:
        raw = sys.stdin.read()
        payload = json.loads(raw)
    except json.JSONDecodeError as e:
        print(json.dumps({"error": f"JSON invalide : {str(e)}"}))
        sys.exit(0)

    try:
        result = var_historical_1d(
            tickers=payload["tickers"],
            weights=payload["weights"],
            invested_amount=payload["invested_amount"],
            var_quantile=payload["var_quantile"],
            start_date=payload["start_date"],
            end_date=payload["end_date"],
            universe=payload.get("universe", "CAC40"),
        )
        print(json.dumps(result))
    except ValueError as e:
        print(json.dumps({"error": str(e)}))
        sys.exit(0)
    except Exception as e:
        print(json.dumps({"error": f"Erreur inattendue : {str(e)}"}))
        sys.exit(0)


if __name__ == "__main__":
    main()
