import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import * as fs from 'fs';
import * as path from 'path';

export interface Stock {
    ticker: string;
    name: string;
    price: number;
    change: number;
    changePercent: number;
    imageUrl: string;
    description: string;
}

// Helper to load fixtures
export function loadStocksFixture(): Stock[] {
    try {
        const filePath = path.join(process.cwd(), 'fixtures', 'stocks.json');
        if (fs.existsSync(filePath)) {
            const content = fs.readFileSync(filePath, 'utf-8');
            return JSON.parse(content);
        }
    } catch (error) {
        console.error('Error loading stocks fixture:', error);
    }
    return [];
}

// Helper to fetch live quote if API key is available
export async function getLiveStockQuote(ticker: string, fallback: Partial<Stock>): Promise<Stock> {
    const apiKey = process.env.FINNHUB_API_KEY || process.env.FINNHUB_TOKEN;
    const stock: Stock = {
        ticker: ticker.toUpperCase(),
        name: fallback.name || ticker.toUpperCase(),
        price: fallback.price ?? 0,
        change: fallback.change ?? 0,
        changePercent: fallback.changePercent ?? 0,
        imageUrl: fallback.imageUrl || '',
        description: fallback.description || ''
    };

    if (!apiKey) {
        return stock;
    }

    try {
        const url = `https://finnhub.io/api/v1/quote?symbol=${encodeURIComponent(stock.ticker)}&token=${apiKey}`;
        const response = await fetch(url);
        if (response.ok) {
            const data = await response.json() as any;
            // Finnhub returns c (current price) as 0 if symbol doesn't exist
            if (data && typeof data.c === 'number' && data.c !== 0) {
                stock.price = data.c;
                stock.change = data.d || 0;
                stock.changePercent = data.dp || 0;
            }
        }
    } catch (error) {
        // Fail silently and use fallback/fixture values
    }

    return stock;
}

export class DiscoverTools {
    @Tool({
        name: 'search-stocks',
        description: 'Search for stocks by query (name or ticker)',
        inputSchema: z.object({
            query: z.string().describe('Search query (e.g., Tesla or TSLA)')
        }),
        examples: {
            request: {
                query: 'Tesla'
            },
            response: {
                stocks: [
                    {
                        ticker: 'TSLA',
                        name: 'Tesla, Inc.',
                        price: 248.5,
                        change: 5.2,
                        changePercent: 2.14,
                        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e8/Tesla_logo.png',
                        description: 'Tesla, Inc. designs, develops, manufactures...'
                    }
                ]
            }
        }
    })
    @Widget('stock-cards')
    async searchStocks(input: { query: string }, ctx: ExecutionContext) {
        ctx.logger.info(`Searching stocks with query: ${input.query}`);
        const stocks = loadStocksFixture();

        // Perform search matching on ticker or name
        const queryLower = input.query.toLowerCase();
        const matched = stocks.filter(
            (s) => s.ticker.toLowerCase().includes(queryLower) || s.name.toLowerCase().includes(queryLower)
        );

        // Fetch live quotes for matched stocks if api key is present
        const results = await Promise.all(
            matched.map(async (s) => await getLiveStockQuote(s.ticker, s))
        );

        return {
            stocks: results
        };
    }

    @Tool({
        name: 'compare-quotes',
        description: 'Compare multiple stock quotes side-by-side',
        inputSchema: z.object({
            tickers: z.array(z.string()).describe('List of tickers to compare (e.g., ["AAPL", "MSFT"])')
        }),
        examples: {
            request: {
                tickers: ['AAPL', 'MSFT']
            },
            response: {
                comparison: [
                    {
                        ticker: 'AAPL',
                        name: 'Apple Inc.',
                        price: 189.84,
                        change: -1.25,
                        changePercent: -0.65,
                        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg'
                    },
                    {
                        ticker: 'MSFT',
                        name: 'Microsoft Corporation',
                        price: 374.07,
                        change: 4.56,
                        changePercent: 1.23,
                        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg'
                    }
                ]
            }
        }
    })
    async compareQuotes(input: { tickers: string[] }, ctx: ExecutionContext) {
        ctx.logger.info(`Comparing quotes for tickers: ${input.tickers.join(', ')}`);
        const stocks = loadStocksFixture();

        const results = await Promise.all(
            input.tickers.map(async (ticker) => {
                const fallback = stocks.find((s) => s.ticker.toUpperCase() === ticker.toUpperCase()) || {
                    ticker: ticker.toUpperCase(),
                    name: ticker.toUpperCase(),
                    price: 0,
                    change: 0,
                    changePercent: 0,
                    imageUrl: '',
                    description: ''
                };
                return await getLiveStockQuote(ticker, fallback);
            })
        );

        return {
            comparison: results
        };
    }
}
