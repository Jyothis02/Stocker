import { Stock, loadStocksFixture, getLiveStockQuote } from '../discover/discover.tools.js';

export class WatchlistService {
    private static watchlist = new Set<string>();

    async addTicker(ticker: string): Promise<boolean> {
        const cleanTicker = ticker.toUpperCase().trim();
        if (!cleanTicker) return false;

        // Check if the ticker exists in our fixture/database
        const stocks = loadStocksFixture();
        const exists = stocks.some((s) => s.ticker === cleanTicker);

        WatchlistService.watchlist.add(cleanTicker);
        return true;
    }

    async getWatchlistStocks(): Promise<Stock[]> {
        const list = Array.from(WatchlistService.watchlist);
        const stocks = loadStocksFixture();

        const results = await Promise.all(
            list.map(async (ticker) => {
                const fallback = stocks.find((s) => s.ticker === ticker) || {
                    ticker,
                    name: ticker,
                    price: 0,
                    change: 0,
                    changePercent: 0,
                    imageUrl: '',
                    description: ''
                };
                return await getLiveStockQuote(ticker, fallback);
            })
        );

        return results;
    }

    getWatchlistTickers(): string[] {
        return Array.from(WatchlistService.watchlist);
    }

    clearWatchlist(): void {
        WatchlistService.watchlist.clear();
    }
}

export const watchlistService = new WatchlistService();
