export function buildUserPrompt({ task, tabUrl }) {
  return `You are a senior web automation engineer. Write ONLY JavaScript code for a Tampermonkey userscript BODY that runs on ${tabUrl}.
Rules:\n- DO NOT include the metadata header. I'll wrap it.\n- Use plain DOM APIs.\n- Wait for dynamic content if needed.\n- Add small console.log lines.\n- Put all code between EXACT markers: /*BEGIN*/ and /*END*/.\n\nTask: ${task}`;
}
