export interface Stock {
  ticker: string;
  name: string;
  index: string;
}

export const AVAILABLE_STOCKS: Stock[] = [
  // ═══════════════════════════════════════
  // CAC 40 (15 stocks)
  // ═══════════════════════════════════════
  { ticker: "OR.PA", name: "L'Oréal", index: "CAC40" },
  { ticker: "AIR.PA", name: "Airbus", index: "CAC40" },
  { ticker: "MC.PA", name: "LVMH", index: "CAC40" },
  { ticker: "BNP.PA", name: "BNP Paribas", index: "CAC40" },
  { ticker: "SAN.PA", name: "Sanofi", index: "CAC40" },
  { ticker: "SU.PA", name: "Schneider Electric", index: "CAC40" },
  { ticker: "DG.PA", name: "Vinci", index: "CAC40" },
  { ticker: "KER.PA", name: "Kering", index: "CAC40" },
  { ticker: "CAP.PA", name: "Capgemini", index: "CAC40" },
  { ticker: "VIE.PA", name: "Veolia Environnement", index: "CAC40" },
  { ticker: "RI.PA", name: "Pernod Ricard", index: "CAC40" },
  { ticker: "RMS.PA", name: "Hermès", index: "CAC40" },
  { ticker: "TTE.PA", name: "TotalEnergies", index: "CAC40" },
  { ticker: "ENGI.PA", name: "Engie", index: "CAC40" },
  { ticker: "VIV.PA", name: "Vivendi", index: "CAC40" },

  // ═══════════════════════════════════════
  // S&P 500 (15 stocks)
  // ═══════════════════════════════════════
  { ticker: "AAPL", name: "Apple", index: "SP500" },
  { ticker: "MSFT", name: "Microsoft", index: "SP500" },
  { ticker: "AMZN", name: "Amazon", index: "SP500" },
  { ticker: "GOOGL", name: "Alphabet", index: "SP500" },
  { ticker: "META", name: "Meta Platforms", index: "SP500" },
  { ticker: "NVDA", name: "NVIDIA", index: "SP500" },
  { ticker: "JPM", name: "JPMorgan Chase", index: "SP500" },
  { ticker: "JNJ", name: "Johnson & Johnson", index: "SP500" },
  { ticker: "XOM", name: "ExxonMobil", index: "SP500" },
  { ticker: "PG", name: "Procter & Gamble", index: "SP500" },
  { ticker: "HD", name: "Home Depot", index: "SP500" },
  { ticker: "KO", name: "Coca-Cola", index: "SP500" },
  { ticker: "PEP", name: "PepsiCo", index: "SP500" },
  { ticker: "CSCO", name: "Cisco", index: "SP500" },
  { ticker: "ADBE", name: "Adobe", index: "SP500" },

  // ═══════════════════════════════════════
  // Eurostoxx 50 (15 stocks)
  // ═══════════════════════════════════════
  { ticker: "AIR.PA", name: "Airbus", index: "EUROSTOXX50" },
  { ticker: "BN.PA", name: "Danone", index: "EUROSTOXX50" },
  { ticker: "MC.PA", name: "LVMH", index: "EUROSTOXX50" },
  { ticker: "OR.PA", name: "L'Oréal", index: "EUROSTOXX50" },
  { ticker: "SAN.PA", name: "Sanofi", index: "EUROSTOXX50" },
  { ticker: "SIE.DE", name: "Siemens", index: "EUROSTOXX50" },
  { ticker: "SAP.DE", name: "SAP", index: "EUROSTOXX50" },
  { ticker: "ALV.DE", name: "Allianz", index: "EUROSTOXX50" },
  { ticker: "BAS.DE", name: "BASF", index: "EUROSTOXX50" },
  { ticker: "BMW.DE", name: "BMW", index: "EUROSTOXX50" },
  { ticker: "INGA.AS", name: "ING Group", index: "EUROSTOXX50" },
  { ticker: "AD.AS", name: "Ahold Delhaize", index: "EUROSTOXX50" },
  { ticker: "UNA.AS", name: "Unilever", index: "EUROSTOXX50" },
  { ticker: "IBE.MC", name: "Iberdrola", index: "EUROSTOXX50" },
  { ticker: "ENEL.MI", name: "Enel", index: "EUROSTOXX50" },

  // ═══════════════════════════════════════
  // SBF 120 (15 stocks)
  // ═══════════════════════════════════════
  { ticker: "OR.PA", name: "L'Oréal", index: "SBF120" },
  { ticker: "AIR.PA", name: "Airbus", index: "SBF120" },
  { ticker: "MC.PA", name: "LVMH", index: "SBF120" },
  { ticker: "BNP.PA", name: "BNP Paribas", index: "SBF120" },
  { ticker: "SAN.PA", name: "Sanofi", index: "SBF120" },
  { ticker: "DG.PA", name: "Vinci", index: "SBF120" },
  { ticker: "KER.PA", name: "Kering", index: "SBF120" },
  { ticker: "CAP.PA", name: "Capgemini", index: "SBF120" },
  { ticker: "VIE.PA", name: "Veolia Environnement", index: "SBF120" },
  { ticker: "RNO.PA", name: "Renault", index: "SBF120" },
  { ticker: "PUB.PA", name: "Publicis Groupe", index: "SBF120" },
  { ticker: "ACA.PA", name: "Crédit Agricole", index: "SBF120" },
  { ticker: "GLE.PA", name: "Société Générale", index: "SBF120" },
  { ticker: "SAF.PA", name: "Safran", index: "SBF120" },
  { ticker: "SGO.PA", name: "Compagnie de Saint-Gobain", index: "SBF120" },
];
