import { McpApp, Module, ConfigModule } from '@nitrostack/core';
import { DiscoverModule } from './modules/discover/discover.module.js';
import { WatchlistModule } from './modules/watchlist/watchlist.module.js';
import { SystemHealthCheck } from './health/system.health.js';

/**
 * Root Application Module
 * 
 * This is the main module that bootstraps the MCP server.
 * It registers all feature modules and health checks.
 */
@McpApp({
  module: AppModule,
  server: {
    name: 'finhub-stock-scout',
    version: '1.0.0'
  },
  logging: {
    level: 'info'
  }
})
@Module({
  name: 'app',
  description: 'Root application module',
  imports: [
    ConfigModule.forRoot(),
    DiscoverModule,
    WatchlistModule
  ],
  providers: [
    // Health Checks
    SystemHealthCheck,
  ]
})
export class AppModule { }


