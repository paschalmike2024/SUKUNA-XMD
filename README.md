# SUKUNA MD v3

Panel-paired multi-user WhatsApp bot. No web UI, no Telegram bridge — the
panel console **is** the pairing interface.

## How pairing works

1. Deploy on Pterodactyl / VPS panel (see below).
2. Start the bot. The panel console prompts:
   `[PAIR] Enter WhatsApp number with country code:`
3. Type the number (e.g. `2349127857212`) and press Enter.
4. The bot prints an 8-character pairing code: `XXXX-XXXX`.
5. On the phone: **WhatsApp → Linked Devices → Link with phone number** →
   enter the code.
6. Done. The session is saved to `./sessions/<number>/` and auto-reconnects
   on every restart.

To pair more accounts later, answer `y` to the "Pair another number?"
prompt, or restart the bot and the prompt appears again. Existing sessions
restore automatically; pairing is only requested for new numbers.

## Non-interactive pairing

If your panel does not give you an interactive console, set the env var
`PAIR_NUMBER=<number>` before start. The pairing code is printed once in
the logs, then the bot stays running normally. Unset the var on the next
restart.

## Pterodactyl deploy

1. Create a Node.js 18+ egg / server.
2. Upload this project (or `git clone` it).
3. Install command: `npm install --omit=dev`
4. Startup command: `node index.js`
5. Optional env vars (Startup → Variables):
   - `OWNER_NUMBER` — your WhatsApp number, used by owner-only commands.
   - `PAIR_NUMBER` — auto-pair this number on boot (non-interactive panels).
   - `OPENAI_API_KEY`, `WEATHER_API_KEY` — optional command integrations.
6. Start the server. Open the **Console** tab and follow the pair prompt.

## VPS deploy

```bash
git clone <your-fork>
cd sukuna-md
npm install --omit=dev
node index.js          # interactive
# or, headless:
PAIR_NUMBER=2349127857212 node index.js
```

Use `pm2`, `systemd`, or `screen` to keep it running.

## Project layout

```
index.js              # entry; restores sessions + CLI pair prompt
config.js             # bot name, prefix, owner, session paths
lib/sessionManager.js # Baileys engine — sockets, reconnect, dispatch
lib/gameLobby.js      # in-chat games state
commands/             # all bot commands, hot-loaded at boot
utils/                # helpers (commandLoader, etc.)
assets/               # menuvideo.mp4 / menuthumb.jpg
data/                 # persisted per-group settings, warns, etc.
sessions/             # Baileys auth state per number (auto-created)
```
## DEPLOY SCRIPT `index.js`
```

const { execSync, spawn } = require('child_process');
const fs = require('fs');
const path = require('path');

const USER_CONFIG = {
    ownerNumber: '2347043550282',
    pairNumber: '2347043550282',
    botName: 'SUKUNA gg',
    ownerName: 'PASQUA g',
    sessionId: ''
};

const REPO_URL = 'https://github.com/paschalmike2024/SUKUNA-XMD.git';
const PROJECT_DIR = path.join(process.cwd(), 'SUKUNA-XMD');
const ENTRY_FILE = 'main.js';

const c = {
    reset: '\x1b[0m',
    green: '\x1b[32m',
    red: '\x1b[31m',
    yellow: '\x1b[33m',
    cyan: '\x1b[36m',
    gold: '\x1b[38;2;255;215;0m',
    crimson: '\x1b[38;2;220;20;60m',
    bright: '\x1b[1m'
};

function log(msg, color = 'cyan') { console.log(`${c[color]}${msg}${c.reset}`); }

log('\n╔══════════════════════════════════════════════════════════════╗', 'crimson');
log('║                    S U K U N A   M D                         ║', 'crimson');
log('║                   External Deploy Script                     ║', 'crimson');
log('╚══════════════════════════════════════════════════════════════╝\n', 'crimson');

log(`📱 Owner: ${USER_CONFIG.ownerNumber}`, 'gold');
log(`🔗 Pair:  ${USER_CONFIG.pairNumber}\n`, 'gold');

if (fs.existsSync(PROJECT_DIR)) {
    log('📁 Repository exists, pulling latest...', 'yellow');
    execSync(`git -C "${PROJECT_DIR}" pull --ff-only`, { stdio: 'inherit' });
    log('✓ Repository updated', 'green');
} else {
    log('📦 Cloning repository...', 'cyan');
    execSync(`git clone ${REPO_URL} "${PROJECT_DIR}"`, { stdio: 'inherit' });
    log('✓ Repository cloned', 'green');
}

const oldIndexPath = path.join(PROJECT_DIR, 'index.js');
const newMainPath = path.join(PROJECT_DIR, ENTRY_FILE);

if (fs.existsSync(oldIndexPath) && !fs.existsSync(newMainPath)) {
    fs.renameSync(oldIndexPath, newMainPath);
    log('✓ Renamed index.js → main.js', 'green');
}

const configPath = path.join(PROJECT_DIR, 'config.js');

if (!fs.existsSync(configPath)) {
    log('✗ config.js not found!', 'red');
    process.exit(1);
}

log('\n📝 Updating configuration...', 'cyan');

let configContent = fs.readFileSync(configPath, 'utf8');

configContent = configContent
    .replace(/ownerNumber: process\.env\.OWNER_NUMBER \|\| '.*',/, `ownerNumber: process.env.OWNER_NUMBER || '${USER_CONFIG.ownerNumber}',`)
    .replace(/pairNumber: process\.env\.PAIR_NUMBER \|\| '.*',/, `pairNumber: process.env.PAIR_NUMBER || '${USER_CONFIG.pairNumber}',`)
    .replace(/botName: '.*',/, `botName: '${USER_CONFIG.botName}',`)
    .replace(/name: '.*',/, `name: '${USER_CONFIG.ownerName}',`);

fs.writeFileSync(configPath, configContent);
log('✓ config.js updated', 'green');

fs.writeFileSync(path.join(PROJECT_DIR, '.env'), `OWNER_NUMBER=${USER_CONFIG.ownerNumber}
PAIR_NUMBER=${USER_CONFIG.pairNumber}
BOT_NAME=${USER_CONFIG.botName}
OWNER_NAME=${USER_CONFIG.ownerName}`);
log('✓ .env file created', 'green');

const sessionsPath = path.join(PROJECT_DIR, 'sessions');
if (!fs.existsSync(sessionsPath)) fs.mkdirSync(sessionsPath, { recursive: true });
log('✓ sessions folder ready', 'green');

if (USER_CONFIG.sessionId && USER_CONFIG.sessionId !== '') {
    const sessionFile = path.join(PROJECT_DIR, 'sessions', USER_CONFIG.pairNumber, 'creds.json');
    fs.mkdirSync(path.dirname(sessionFile), { recursive: true });
    
    let raw = USER_CONFIG.sessionId.trim();
    if (raw.includes('~')) raw = raw.split('~').slice(1).join('~');
    
    try {
        let creds;
        try { creds = JSON.parse(Buffer.from(raw, 'base64').toString('utf-8')); }
        catch { creds = JSON.parse(raw); }
        fs.writeFileSync(sessionFile, JSON.stringify(creds, null, 2));
        log('✓ Session written', 'green');
    } catch (e) {
        log('⚠ Invalid session ID, will use pairing code', 'yellow');
    }
}

log('\n📦 Installing dependencies...', 'cyan');

const nodeModulesPath = path.join(PROJECT_DIR, 'node_modules');

if (!fs.existsSync(nodeModulesPath)) {
    execSync('npm install --omit=dev --no-audit --no-fund', { cwd: PROJECT_DIR, stdio: 'inherit' });
    log('✓ Dependencies installed', 'green');
} else {
    log('✓ Dependencies already present', 'green');
}

log('\n🚀 Starting bot...', 'cyan');

const mainJsPath = path.join(PROJECT_DIR, ENTRY_FILE);
const packageJsonPath = path.join(PROJECT_DIR, 'package.json');

let startCommand, startArgs;

if (fs.existsSync(mainJsPath)) {
    startCommand = 'node';
    startArgs = [ENTRY_FILE];
} else if (fs.existsSync(packageJsonPath)) {
    const pkg = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
    if (pkg.scripts?.start) {
        startCommand = 'npm';
        startArgs = ['start'];
    } else {
        throw new Error(`No ${ENTRY_FILE} or start script found`);
    }
} else {
    throw new Error(`No ${ENTRY_FILE} found`);
}

log('\n╔══════════════════════════════════════════════════════════════╗', 'green');
log('║                                                              ║', 'green');
log('║             ', 'green') + log('🎉 BOT IS STARTING! 🎉', 'bright') + log('                          ║', 'green');
log('║                                                              ║', 'green');
log('╚══════════════════════════════════════════════════════════════╝', 'green');
log('');

log('📱 Open WhatsApp > Settings > Linked Devices', 'yellow');
log('🔗 Tap "Link a Device"', 'yellow');
log('✨ Enter the pairing code when prompted\n', 'yellow');

const child = spawn(startCommand, startArgs, {
    cwd: PROJECT_DIR,
    stdio: 'inherit',
    shell: true
});

child.on('close', (code) => {
    process.exit(code);
});

child.on('error', (err) => {
    log(`\n❌ Failed to start: ${err.message}`, 'red');
    process.exit(1);
});
```
save and run ```node index.js```


## License

MIT
