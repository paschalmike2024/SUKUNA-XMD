/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    S U K U N A   M D                         ║
 * ║                      Bot Entry                               ║
 * ╚══════════════════════════════════════════════════════════════╝
 *
 * This is the real entry point. Panel/PM2/Pterodactyl should run:
 *     node main.js
 */

'use strict';

try { require('dotenv').config(); } catch (_) { /* dotenv optional */ }

let config;
try {
    config = require('./config.js');
} catch (err) {
    console.error('\x1b[31m[FATAL] Could not load config.js:\x1b[0m', err.message);
    process.exit(1);
}

const connection = require('./connection.js');

async function main() {
    connection.installCrashGuards();
    connection.printBanner(config);

    // Optional one-shot session restore from SESSION_ID env var
    connection.writeSessionFromString(
        process.env.SESSION_ID || config.sessionId || '',
        config.pairNumber
    );

    try {
        await connection.start(config.pairNumber);
    } catch (err) {
        console.error('\x1b[31m[FATAL] Failed to start session:\x1b[0m', err);
        process.exit(1);
    }

    // sessionManager owns the socket lifecycle (reconnects, keepalive).
    // Keep the process alive explicitly so Node doesn't exit when the
    // initial async work returns.
    setInterval(() => {}, 1 << 30);
}

main();
