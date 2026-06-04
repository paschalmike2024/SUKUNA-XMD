
/**
 * ╔══════════════════════════════════════════════════════════════╗
 * ║                    S U K U N A   M D                         ║
 * ║                      Bot Loader                              ║
 * ║                                                              ║
 * ╚══════════════════════════════════════════════════════════════╝
 */

const { spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

// Load configuration
let config;
try {
    config = require('./config.js');
} catch (err) {
    console.error('\x1b[31m[FATAL] config.js not found!\x1b[0m');
    process.exit(1);
}

const BOT_DIR = __dirname;

function log(msg, color = '36') { 
    console.log(`\x1b[${color}m${msg}\x1b[0m`); 
}

function findMainFile() {
    // Possible main file names
    const possibleFiles = ['bot.js', 'main.js', 'app.js', 'core.js', 'run.js'];
    
    for (const file of possibleFiles) {
        const filePath = path.join(BOT_DIR, file);
        if (fs.existsSync(filePath)) {
            return file;
        }
    }
    
    // If no main file found, check if index.js itself has the bot logic
    const indexPath = path.join(BOT_DIR, 'index.js');
    const content = fs.readFileSync(indexPath, 'utf8');
    
    // If index.js contains makeWASocket or Baileys, it's the main bot file
    if (content.includes('makeWASocket') || content.includes('@crysnovax/baileys') || content.includes('Baileys')) {
        return null; // Run index.js itself
    }
    
    return null;
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
    
    const mainFile = findMainFile();
    let botProcess;
    
    if (mainFile === null) {
        // Run current index.js as the bot
        log('📁 Starting bot from index.js', '36');
        botProcess = spawn('node', ['index.js'], {
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
    } else {
        // Run the found main file
        log(`📁 Starting bot from ${mainFile}`, '36');
        botProcess = spawn('node', [mainFile], {
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
    }
    
    botProcess.on('exit', (code) => {
        process.exit(code ?? 0);
    });
    
    botProcess.on('error', (err) => {
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
