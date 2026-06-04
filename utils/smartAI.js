/**
 * Smart AI helper — Groq powered with conversation memory.
 */
const axios = require('axios');

const GROQ_API_KEY = process.env.GROQ_API_KEY || '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';
const GROQ_URL     = 'https://api.groq.com/openai/v1/chat/completions';
const GROQ_MODELS  = ['llama-3.3-70b-versatile', 'llama-3.1-8b-instant'];
const MAX_TURNS    = 12;
const TIMEOUT_MS   = 25000;

const memory = new Map();

function _hist(key) { if (!memory.has(key)) memory.set(key, []); return memory.get(key); }
function clearMemory(key) { if (key) memory.delete(key); else memory.clear(); }
function pushTurn(key, role, text) {
    if (!key || !text) return;
    const h = _hist(key);
    h.push({ role, content: String(text).slice(0, 1500) });
    while (h.length > MAX_TURNS * 2) h.shift();
}

async function _callGroq(model, messages) {
    try {
        const { data } = await axios.post(GROQ_URL, {
            model,
            messages,
            temperature: 0.8,
            max_tokens: 1024,
        }, {
            timeout: TIMEOUT_MS,
            headers: {
                'Authorization': `Bearer ${GROQ_API_KEY}`,
                'Content-Type': 'application/json',
            },
            validateStatus: () => true,
        });
        const txt = data?.choices?.[0]?.message?.content;
        return (txt && String(txt).trim()) || null;
    } catch (e) {
        console.error('[GROQ]', model, e.message);
        return null;
    }
}

async function ask({ key, system = '', user, remember = true }) {
    if (!user || !String(user).trim()) return null;
    const userText = String(user).trim();

    const history = key ? _hist(key).slice() : [];
    const messages = [];
    if (system) messages.push({ role: 'system', content: system });
    for (const t of history) messages.push({ role: t.role, content: t.content });
    messages.push({ role: 'user', content: userText });

    let reply = null;
    for (const model of GROQ_MODELS) {
        reply = await _callGroq(model, messages);
        if (reply) break;
    }

    if (reply && remember && key) {
        pushTurn(key, 'user', userText);
        pushTurn(key, 'assistant', reply);
    }
    return reply;
}

module.exports = { ask, pushTurn, clearMemory };

