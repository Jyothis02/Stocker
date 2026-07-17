/**
 * Calculator MCP Server
 * 
 * Main entry point for the MCP server.
 * Uses the @McpApp decorator pattern for clean, NestJS-style architecture.
 * 
 * Transport Configuration:
 * - Development (NODE_ENV=development): STDIO only
 * - Production (NODE_ENV=production): Dual transport (STDIO + HTTP SSE)
 */

import 'dotenv/config';
import express from 'express';
import { McpApplicationFactory } from '@nitrostack/core';
import { AppModule } from './app.module.js';

// Temporary store for mock authorization codes (expires in 10 minutes)
const authCodes = new Map<string, { clientId: string; redirectUri: string; expiresAt: number }>();

function generateRandomCode(): string {
  return 'auth_' + Math.random().toString(36).substring(2, 11);
}

function generateAccessToken(): string {
  return 'token_' + Math.random().toString(36).substring(2, 22);
}

/**
 * Bootstrap the application
 */
async function bootstrap() {
  // Create and start the MCP server
  const server = await McpApplicationFactory.create(AppModule);

  // Expose mock OAuth endpoints on the Express instance if HTTP transport is enabled
  const httpTransport = server.getHttpTransport();
  if (httpTransport && typeof httpTransport.getApp === 'function') {
    const app = httpTransport.getApp();

    // Enable body parsing for incoming OAuth requests
    app.use(express.json());
    app.use(express.urlencoded({ extended: true }));

    // Authorization endpoint - AUTO-APPROVE (Bypass user login prompt)
    app.get('/oauth/authorize', (req: express.Request, res: express.Response) => {
      const { client_id, redirect_uri, state } = req.query;

      if (!client_id || !redirect_uri) {
        return res.status(400).send('Missing client_id or redirect_uri');
      }

      // Generate mock authorization code
      const authCode = generateRandomCode();

      // Store the code
      authCodes.set(authCode, {
        clientId: String(client_id),
        redirectUri: String(redirect_uri),
        expiresAt: Date.now() + 10 * 60 * 1000
      });

      // Redirect immediately with the code
      const sep = String(redirect_uri).includes('?') ? '&' : '?';
      let redirectUrl = `${redirect_uri}${sep}code=${authCode}`;
      if (state) {
        redirectUrl += `&state=${state}`;
      }

      res.redirect(redirectUrl);
    });

    // Token exchange endpoint
    app.post('/oauth/token', (req: express.Request, res: express.Response) => {
      const { code } = req.body;

      if (!code) {
        return res.status(400).json({ error: 'invalid_request', error_description: 'Missing authorization code' });
      }

      // Verify the code
      const authData = authCodes.get(code);
      if (!authData) {
        return res.status(400).json({ error: 'invalid_grant', error_description: 'Invalid authorization code' });
      }

      if (authData.expiresAt < Date.now()) {
        authCodes.delete(code);
        return res.status(400).json({ error: 'invalid_grant', error_description: 'Authorization code expired' });
      }

      // Delete code after single use
      authCodes.delete(code);

      // Generate access token
      const accessToken = generateAccessToken();

      res.json({
        access_token: accessToken,
        token_type: 'Bearer',
        expires_in: 3600
      });
    });
  }

  await server.start();
}

// Start the application
bootstrap().catch((error) => {
  console.error('❌ Failed to start server:', error);
  process.exit(1);
});

