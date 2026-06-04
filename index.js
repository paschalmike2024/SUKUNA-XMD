
const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load configuration from config.js
let config;
try {
    config = require('./config.js');
} catch (err) {
    console.error('\x1b[31m[FATAL] config.js not found!\x1b[0m');
    console.error('Please run the deploy script first.\n');
    process.exit(1);
}

const BOT_DIR = __dirname;

function log(msg, color = '36') { 
    console.log(`\x1b[${color}m${msg}\x1b[0m`); 
}

function writeSession() {
    if (!config.sessionId || config.sessionId === '') return;
    
    const sessionDir = path.join(BOT_DIR, 'sessions', config.pairNumber);
    const sessionFile = path.join(sessionDir, 'creds.json');
    
    if (fs.existsSync(sessionFile)) {
        log('✓ Existing session found', '32');
        return true;
    }
    
    fs.mkdirSync(sessionDir, { recursive: true });
    
    let raw = config.sessionId.trim();
    if (raw.includes('~')) raw = raw.split('~').slice(1).join('~');
    
    try {
        let creds;
        try {
            creds = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8'));
        } catch {
            creds = JSON.parse(raw);
        }
        fs.writeFileSync(sessionFile, JSON.stringify(creds, null, 2));
        log('✓ Session loaded successfully', '32');
        return true;
    } catch (e) {
        log('⚠ Invalid session ID, will use pairing code', '33');
        return false;
    }
}

function startBot() {
    log('\n🚀 Starting SUKUNA MD...\n', '36');
    log('📱 Open WhatsApp > Settings > Linked Devices', '33');
    log('🔗 Tap "Link a Device"', '33');
    log('✨ Enter the pairing code when prompted\n', '33');
    
    const child = spawn('node', ['bot.js'], {
        cwd: BOT_DIR,
        stdio: 'inherit',
        env: {
            ...process.env,
            OWNER_NUMBER: config.ownerNumber,
            PAIR_NUMBER: config.pairNumber,
            BOT_PREFIX: config.prefix,
            BOT_MODE: config.mode,
            BOT_NAME: config.botName
        }
    });
    
    child.on('exit', (code) => {
        process.exit(code ?? 0);
    });
    
    child.on('error', (err) => {
        log(`\n✗ Failed to start: ${err.message}`, '31');
        process.exit(1);
    });
}

function main() {
    console.log('\x1b[35m\x1b[1m');
    console.log('╔══════════════════════════════════════════════════════════════╗');
    console.log('║                    S U K U N A   M D                         ║');
    console.log('║                      Bot Loader                              ║');
    console.log('╚══════════════════════════════════════════════════════════════╝');
    console.log('\x1b[0m');
    
    log(`📱 Owner: ${config.ownerNumber}`, '36');
    log(`🤖 Bot: ${config.botName}\n`, '36');
    
    writeSession();
    startBot();
}

main();
