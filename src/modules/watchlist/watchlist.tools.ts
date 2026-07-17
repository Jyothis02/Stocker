import { ToolDecorator as Tool, Widget, ExecutionContext, z } from '@nitrostack/core';
import { watchlistService } from './watchlist.service.js';

export class WatchlistTools {
    @Tool({
        name: 'add-to-watchlist',
        description: 'Add a stock ticker to your watchlist',
        inputSchema: z.object({
            ticker: z.string().describe('Stock ticker symbol (e.g., TSLA, AAPL, MSFT)')
        }),
        examples: {
            request: {
                ticker: 'MSFT'
            },
            response: {
                success: true,
                message: 'MSFT added to watchlist',
                ticker: 'MSFT'
            }
        }
    })
    async addToWatchlist(input: { ticker: string }, ctx: ExecutionContext) {
        ctx.logger.info(`Adding ticker to watchlist: ${input.ticker}`);
        const tickerUpper = input.ticker.toUpperCase().trim();
        const success = await watchlistService.addTicker(tickerUpper);

        return {
            success,
            message: success
                ? `Successfully added ${tickerUpper} to your watchlist.`
                : `Failed to add ${tickerUpper} to watchlist.`,
            ticker: tickerUpper
        };
    }

    @Tool({
        name: 'view-watchlist',
        description: 'View your stock watchlist with live quotes',
        inputSchema: z.object({}),
        examples: {
            request: {},
            response: {
                stocks: [
                    {
                        ticker: 'MSFT',
                        name: 'Microsoft Corporation',
                        price: 374.07,
                        change: 4.56,
                        changePercent: 1.23,
                        imageUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/44/Microsoft_logo.svg',
                        description: 'Microsoft Corporation develops...'
                    }
                ]
            }
        }
    })
    @Widget('stock-cards')
    async viewWatchlist(input: Record<string, never>, ctx: ExecutionContext) {
        ctx.logger.info('Retrieving stock watchlist');
        const stocks = await watchlistService.getWatchlistStocks();
        return {
            stocks
        };
    }
}
