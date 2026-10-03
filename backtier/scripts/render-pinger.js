#!/usr/bin/env node

/**
 * Render Keep-Alive & Health Checker
 * 
 * Render Free Tier services spin down after 15 minutes of inactivity.
 * This script runs every 9 minutes (configurable) to ping your Render backend,
 * keeping it alive 24/7 or waking it up automatically if it has gone to sleep.
 * 
 * Usage:
 *   node scripts/render-pinger.js https://your-app.onrender.com
 *   OR
 *   RENDER_URL="https://your-app.onrender.com" node scripts/render-pinger.js
 */

const targetUrlArg = process.argv[2];
const BASE_URL = (targetUrlArg || process.env.RENDER_URL || 'https://meridian-h8ke.onrender.com').trim();
const HEALTH_PATH = (process.env.HEALTH_PATH || '/health').trim();
const INTERVAL_MINUTES = parseFloat(process.env.INTERVAL_MINUTES || '9');
const INTERVAL_MS = INTERVAL_MINUTES * 60 * 1000;
const TIMEOUT_SECONDS = parseInt(process.env.TIMEOUT_SECONDS || '75', 10);
const MAX_WAKEUP_RETRIES = 3;

if (!BASE_URL) {
  console.error('\x1b[31m[ERROR] No Render URL provided!\x1b[0m');
  console.log('\nUsage:');
  console.log('  node scripts/render-pinger.js https://your-service.onrender.com');
  console.log('  or set RENDER_URL="https://your-service.onrender.com"');
  process.exit(1);
}

// Normalize target URL
const normalizedBase = BASE_URL.replace(/\/+$/, '');
const fullHealthUrl = `${normalizedBase}${HEALTH_PATH.startsWith('/') ? HEALTH_PATH : '/' + HEALTH_PATH}`;

console.log('\x1b[36m=====================================================\x1b[0m');
console.log('\x1b[1m🚀 Render Keep-Alive / Health Monitor Started\x1b[0m');
console.log(`📡 Target URL:     \x1b[33m${fullHealthUrl}\x1b[0m`);
console.log(`⏱️  Check Interval: Every \x1b[32m${INTERVAL_MINUTES} minutes\x1b[0m`);
console.log(`⏳ Request Timeout: \x1b[32m${TIMEOUT_SECONDS}s\x1b[0m (allows cold boot if sleeping)`);
console.log('\x1b[36m=====================================================\x1b[0m\n');

/**
 * Perform a single HTTP request with timeout
 */
async function ping(url, timeoutSec = TIMEOUT_SECONDS) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutSec * 1000);
  const startTime = Date.now();

  try {
    const res = await fetch(url, {
      method: 'GET',
      headers: {
        'User-Agent': 'RenderKeepAlive/1.0 (+https://render.com)',
        'Accept': 'application/json, text/plain, */*',
      },
      signal: controller.signal,
    });

    clearTimeout(timer);
    const duration = Date.now() - startTime;
    let data = null;
    try {
      data = await res.json();
    } catch {
      // not json, fallback
    }

    return {
      ok: res.ok,
      status: res.status,
      duration,
      data,
    };
  } catch (err) {
    clearTimeout(timer);
    const duration = Date.now() - startTime;
    return {
      ok: false,
      status: null,
      duration,
      error: err.name === 'AbortError' ? `Timeout after ${timeoutSec}s` : err.message,
    };
  }
}

/**
 * Check health and wake up if sleeping
 */
async function runHealthCheck() {
  const now = new Date().toLocaleTimeString();
  console.log(`[${now}] 🔍 Checking Render status at ${fullHealthUrl}...`);

  let attempt = 1;
  while (attempt <= MAX_WAKEUP_RETRIES) {
    const result = await ping(fullHealthUrl);

    if (result.ok) {
      console.log(
        `  \x1b[32m✅ UP (${result.status}) [${result.duration}ms]\x1b[0m` +
        (result.data ? ` - ${JSON.stringify(result.data)}` : '')
      );
      return;
    }

    // If 404, it means server is up, but /health route isn't deployed yet -> check root '/'
    if (result.status === 404) {
      console.log(`  ℹ️ /health returned 404. Checking root endpoint (${normalizedBase}/)...`);
      const fallback = await ping(`${normalizedBase}/`, 45);
      if (fallback.ok) {
        console.log(`  \x1b[32m✅ UP (${fallback.status}) [${fallback.duration}ms] - Root endpoint active!\x1b[0m`);
        return;
      }
    }

    // If timed out or 5xx, Render is likely spinning up from cold boot
    console.log(
      `  \x1b[33m⚠️ Attempt ${attempt}/${MAX_WAKEUP_RETRIES} failed or wake-up in progress (${result.error || `HTTP ${result.status}`}, took ${result.duration}ms)\x1b[0m`
    );

    if (attempt < MAX_WAKEUP_RETRIES) {
      console.log(`  ⏳ Waiting 15s for Render container to finish waking up...`);
      await new Promise((r) => setTimeout(r, 15000));
    }
    attempt++;
  }

  console.log(`\x1b[31m❌ Render service could not be verified after ${MAX_WAKEUP_RETRIES} attempts.\x1b[0m`);
}

// Run immediately once
runHealthCheck().then(() => {
  // Then schedule every 9 minutes
  setInterval(runHealthCheck, INTERVAL_MS);
});

// Graceful exit handlers
process.on('SIGINT', () => {
  console.log('\n\x1b[33m🛑 Keep-alive monitor stopped by user.\x1b[0m');
  process.exit(0);
});

process.on('SIGTERM', () => {
  console.log('\n\x1b[33m🛑 Keep-alive monitor terminated.\x1b[0m');
  process.exit(0);
});
