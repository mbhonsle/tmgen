        // Expose a global function usable from sw.js after importScripts
        self.buildUserPrompt = function({ task, tabUrl }) {
          return `You are a senior web automation engineer. Write ONLY JavaScript code for a Tampermonkey userscript BODY that runs on ${tabUrl}.
Rules:
- DO NOT include the metadata header. I'll wrap it.
- Use plain DOM APIs.
- Wait for dynamic content if needed.
- Add small console.log lines.
- Put all code between EXACT markers: /*BEGIN*/ and /*END*/.

Task: ${task}`;
        };
