import { Module } from '@nitrostack/core';
import { DiscoverTools } from './discover.tools.js';

@Module({
  name: 'discover',
  description: 'Search and compare stock quotes',
  controllers: [DiscoverTools]
})
export class DiscoverModule {}
