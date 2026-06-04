/**
 * SUKUNA MD — Configuration
 * Multi-User WhatsApp Bot
 *
 * Every key in this file is consumed by commands/ and utils/.
 * Do NOT rename existing keys — only edit values.
 */

'use strict';

module.exports = {
    // ============================================
    //  BOT IDENTITY
    // ============================================
    botName: 'SUKUNA MD',
    version: '3.0.0',
    prefix:  '.',

    // ============================================
    //  ASSETS  (drop files into ./assets/)
    // ============================================
    assets: {
        menuVideo: './assets/menuvideo.mp4',
        menuThumb: './assets/menuthumb.jpg' // optional thumbnail
    },

    // ============================================
    //  OWNER / PAIRING
    //  ownerNumber → main admin of the bot
    //  pairNumber  → WhatsApp number paired on boot
    //  Put numbers here (country code, no +) or override
    //  via OWNER_NUMBER / PAIR_NUMBER env vars.
    // ============================================
    ownerNumber: process.env.OWNER_NUMBER || '2349127857212',
    pairNumber:  process.env.PAIR_NUMBER  || '2349127857212',

    owner: {
        name:    'PASQUA',
        number:  process.env.OWNER_NUMBER || '2349127857212',
        github:  'https://github.com/pasquawisdom2007-beep/Sukuna-MD-V3',
        channel: 'https://whatsapp.com/channel/0029VbCJho147XeEEuR1LA3s'
    },

    // ============================================
    //  SESSION
    //  sessionId → optional base64/JSON creds string
    //              (consumed by connection.js on boot)
    // ============================================
    sessionId: process.env.SESSION_ID || '',
    sessions: {
        folder: './sessions/',
        autoReconnect: true
    },

    // ============================================
    //  GROUP DEFAULTS
    // ============================================
    groupDefaults: {
        antilink: false,
        antilinkAction: 'delete',
        antimention: false,
        antimentionMode: 'normal',
        antimentionAction: 'warn',
        antimentionMax: 5,
        welcome: false,
        welcomeMessage: '👋 Welcome @user to @group!',
        goodbye: false,
        goodbyeMessage: '👋 Goodbye @user!',
        mute: false
    },

    // ============================================
    //  API KEYS (optional, for extra commands)
    // ============================================
    apiKeys: {
        openai:  process.env.OPENAI_API_KEY  || '',
        weather: process.env.WEATHER_API_KEY || ''
    },

    // ============================================
    //  BOT MESSAGES
    // ============================================
    messages: {
        wait:           '⏳ Processing...',
        success:        '✅ Success!',
        error:          '❌ Error occurred!',
        adminOnly:      '🛡️ This command is only for admins!',
        groupOnly:      '👥 This command can only be used in groups!',
        botAdminNeeded: '🤖 Bot needs to be admin to execute this command!'
    }
};
