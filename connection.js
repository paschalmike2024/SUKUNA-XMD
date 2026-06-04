/**
 * SUKUNA MD — connection.js
 * Thin wrapper around lib/sessionManager.js. The real Baileys logic
 * (socket, pairing code, reconnect, command dispatch) lives there.
 * This file exposes a clean API for main.js.
 */

'use strict';

const fs   = require('fs');
const path = require('path');

const sessionManager = require('./lib/sessionManager');

function log(msg, color = '36') {
    console.log(`\x1b[${color}m${msg}\x1b[0m`);
}

function printBanner(config) {
    console.log('\x1b[35m\x1b[1m');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    S U K U N A   M D                         ║');
    console.log('║                      Bot Loader                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('\x1b[0m');

    log(`📱 Owner: ${config.ownerNumber}`, '36');
    log(`🤖 Bot:   ${config.botName}\n`, '36');

    log('🚀 Starting SUKUNA MD...\n', '36');
    log('📱 Open WhatsApp > Settings > Linked Devices', '33');
    log('🔗 Tap "Link a Device"', '33');
    log('✨ Enter the pairing code when prompted\n', '33');
}

/**
 * Decode a SESSION_ID string and write it to sessions/<pairNumber>/creds.json.
 * Accepts:
 *   - raw JSON creds
 *   - base64-encoded JSON creds
 *   - prefixed forms like "SUKUNA~<base64>" (anything before the first "~" is stripped)
 * Returns true if a session was restored, false otherwise.
 */
function writeSessionFromString(sessionId, pairNumber) {
    if (!sessionId || typeof sessionId !== 'string' || !sessionId.trim()) {
        return false;
    }
    if (!pairNumber) {
        log('⚠ SESSION_ID provided but PAIR_NUMBER is empty — skipping', '33');
        return false;
    }

    const sessionDir  = path.join(__dirname, 'sessions', String(pairNumber));
    const sessionFile = path.join(sessionDir, 'creds.json');

    if (fs.existsSync(sessionFile)) {
        log('✓ Existing session found — reusing', '32');
        return true;
    }

    let raw = sessionId.trim();
    if (raw.includes('~')) raw = raw.split('~').slice(1).join('~');

    try {
        let creds;
        try {
            creds = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
        } catch {
            creds = JSON.parse(raw);
        }
        fs.mkdirSync(sessionDir, { recursive: true });
        fs.writeFileSync(sessionFile, JSON.stringify(creds, null, 2));
        log('✓ Session loaded successfully from SESSION_ID', '32');
        return true;
    } catch (e) {
        log(`⚠ Invalid SESSION_ID (${e.message}) — falling back to pairing code`, '33');
        return false;
    }
}

/**
 * Start the WhatsApp connection for the given pair number.
 * sessionManager handles pairing-code requests, reconnects and command dispatch.
 */
async function start(pairNumber) {
    if (!pairNumber) {
        throw new Error('PAIR_NUMBER is required to start the bot (set it in .env or config.js)');
    }
    return sessionManager.startSession(String(pairNumber), true);
}

/**
 * Install global safety nets so a single command error never crashes the bot.
 */
function installCrashGuards() {
    process.on('uncaughtException', (err) => {
        console.error('\x1b[31m[uncaughtException]\x1b[0m', err);
    });
    process.on('unhandledRejection', (reason) => {
        console.error('\x1b[31m[unhandledRejection]\x1b[0m', reason);
    });
}

module.exports = {
    printBanner,
    writeSessionFromString,
    start,
    installCrashGuards,
    sessionManager
};
