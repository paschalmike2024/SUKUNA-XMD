/**
 * textmakerFetch — shared helper for prexzyvilla text-effect APIs.
 */
'use strict';
const axios = require('axios');

const IMG_RE = /\.(jpe?g|png|gif|webp|bmp)(\?|$)/i;
const URL_RE = /^https?:\/\//i;

function walkImage(node, out) {
    if (!node) return;
    if (typeof node === 'string') {
        if (URL_RE.test(node) && IMG_RE.test(node)) out.push(node);
        return;
    }
    if (Array.isArray(node)) { for (const v of node) walkImage(v, out); return; }
    if (typeof node === 'object') { for (const v of Object.values(node)) walkImage(v, out); }
}

async function fetchImage(endpoint, text) {
    const url = `https://apis.prexzyvilla.site${endpoint}?text=${encodeURIComponent(text)}`;
    const r = await axios.get(url, {
        timeout: 25000,
        headers: { 'User-Agent': 'Mozilla/5.0 (SUKUNA-MD)' },
        validateStatus: () => true,
    });
    if (r.status >= 400) throw new Error(`API ${r.status}`);
    const urls = [];
    walkImage(r.data, urls);
    if (!urls.length) throw new Error('No image URL in response');
    return urls[0];
}

function makeTextmakerCommand({ name, endpoint, label, emoji = '✨', aliases = [] }) {
    return {
        name,
        aliases,
        description: `${label} text effect`,
        category: 'textmaker',
        async execute({ sock, msg, from, reply, args }) {
            if (!args.length) {
                return reply(
                    `${emoji} *${label}*\n\n` +
                    `Usage: .${name} <text>\n` +
                    `Example: .${name} SUKUNA`
                );
            }
            const text = args.join(' ').trim().slice(0, 60);
            try {
                await sock.sendMessage(from, { react: { text: '⏳', key: msg.key } });
                const imageUrl = await fetchImage(endpoint, text);
                const caption = `${emoji} *${label}* — ${text}\n\n> SUKUNA MD`;
                try {
                    await sock.sendMessage(from, { image: { url: imageUrl }, caption }, { quoted: msg });
                } catch (e) {
                    await reply(`${caption}\n\n${imageUrl}`);
                }
                await sock.sendMessage(from, { react: { text: '✅', key: msg.key } });
            } catch (err) {
                console.error(`[${name}] error:`, err.message);
                try { await sock.sendMessage(from, { react: { text: '❌', key: msg.key } }); } catch {}
                reply(`❌ ${label} failed. Try a shorter text or try again later.`);
            }
        },
    };
}

module.exports = { fetchImage, makeTextmakerCommand };

