import { Module } from '@nitrostack/core';
import { WatchlistTools } from './watchlist.tools.js';

@Module({
    name: 'watchlist',
    description: 'Track and review tickers in your watchlist',
    controllers: [WatchlistTools]
})
export class WatchlistModule { }
