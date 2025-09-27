importScripts("prompt-templates.js");

const OPENAI_URL = "https://api.openai.com/v1/responses";
const ANTHROPIC_URL = "https://api.anthropic.com/v1/messages";

chrome.runtime.onMessage.addListener((msg, _sender, sendResponse) => {
  (async () => {
    if (msg.type !== "GENERATE_USER_SCRIPT") return;
    try {
      const { task, tabUrl, provider, model } = msg.payload;
      const prompt = self.buildUserPrompt({ task, tabUrl });

      const keys = await chrome.storage.local.get([
        "openaiKey",
        "anthropicKey",
      ]);

      const aiText =
        provider === "anthropic"
          ? await callAnthropic({
              key: keys.anthropicKey,
              model: model || "claude-3-5-sonnet",
              prompt,
            })
          : await callOpenAI({
              key: keys.openaiKey,
              model: model || "gpt-4.1-mini",
              prompt,
            });

      const body = extractBody(aiText);
      if (!body) throw new Error("Model did not return a valid body.");

      // Build full userscript
      const host = new URL(tabUrl).origin.replace(/\$/g, "");
      const userscript = makeUserscript({ host, body });

      // Open a data URL so Tampermonkey shows the install screen.
      const blob = new Blob([userscript], { type: "text/javascript" });
      const url = URL.createObjectURL(blob);
      await chrome.tabs.create({ url });

      sendResponse({ ok: true });
    } catch (e) {
      console.error(e);
      sendResponse({ ok: false, error: e?.message || String(e) });
    }
  })();
  // keep channel open for async
  return true;
});

function extractBody(text) {
  // try to pull between markers
  const m = /\/\*BEGIN\*\/[\s\S]*?\/\*END\*\//.exec(text);
  if (m) {
    return m[0].replace("/*BEGIN*/", "").replace("/*END*/", "");
  }
  // fallback: try to grab first JS code block
  const m2 = /```(?:js|javascript)?\n([\s\S]*?)```/.exec(text);
  return m2 ? m2[1] : text;
}

function makeUserscript({ host, body }) {
  const safeHost = host.endsWith("/") ? host + "*" : host + "/*";
  return (
    `// ==UserScript==\n` +
    `// @name         TM Auto Script (${new Date()
      .toISOString()
      .slice(0, 10)})\n` +
    `// @namespace    tmgen\n` +
    `// @version      0.1\n` +
    `// @match        ${safeHost}\n` +
    `// @run-at       document-idle\n` +
    `// @grant        none\n` +
    `// ==/UserScript==\n\n` +
    `(function(){\n  'use strict';\n  try {\n${indent(
      body,
      2
    )}\n  } catch (e) { console.error('TM script error', e); }\n})();\n`
  );
}

function indent(code, n) {
  const pad = "  ".repeat(n);
  return String(code)
    .split("\n")
    .map((l) => pad + l)
    .join("\n");
}

async function callOpenAI({ key, model, prompt }) {
  if (!key) throw new Error("Missing OpenAI API key.");
  const r = await fetch(OPENAI_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${key}`,
    },
    body: JSON.stringify({
      model,
      input: [
        { role: "system", content: "You write clean, safe JavaScript." },
        { role: "user", content: prompt },
      ],
    }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || "OpenAI error");
  return j.output_text || j.choices?.[0]?.message?.content || JSON.stringify(j);
}

async function callAnthropic({ key, model, prompt }) {
  if (!key) throw new Error("Missing Anthropic API key.");
  const r = await fetch(ANTHROPIC_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "x-api-key": key,
      "anthropic-version": "2023-06-01",
    },
    body: JSON.stringify({
      model,
      max_tokens: 1024,
      messages: [{ role: "user", content: prompt }],
    }),
  });
  const j = await r.json();
  if (!r.ok) throw new Error(j?.error?.message || "Anthropic error");
  const blocks = j.content || [];
  const text = blocks.map((b) => b.text).join("\n");
  return text || JSON.stringify(j);
}
