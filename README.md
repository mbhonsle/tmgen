# Tampermonkey Script Generator

## What this does

- Click the icon.
- Type a task.
- The extension asks OpenAI or Anthropic to write code.
- A new tab opens. Tampermonkey shows Install.
- Click Install.

## Setup

1. Install Tampermonkey (Chrome Web Store).
2. In Chrome: `chrome://extensions` → turn on **Developer mode** → **Load unpacked** → pick this folder.
3. Click **Details** → **Extension options** → paste your API key(s) → **Save**.

## Use

1. Go to the site you want.
2. Click the icon.
3. Write a task. Example:
   - "Click the 'Load more' button until end. Save all titles to CSV and download."
4. Click **Generate & Install**.
5. Tampermonkey opens. Click **Install**.
6. Refresh the site if needed.

## Tips

- Keep tasks small and clear.
- If the site loads data slowly, ask the bot to wait or to retry.
- You can edit the script later in Tampermonkey.

## Safety

- Do not put secrets or passwords in the task.
- The script runs on the sites you allow in `@match`.
