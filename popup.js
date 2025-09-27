const $ = (s) => document.querySelector(s);

$("#openOptions").addEventListener("click", () =>
  chrome.runtime.openOptionsPage()
);

$("#goBtn").addEventListener("click", async () => {
  const task = $("#task").value.trim();
  if (!task) {
    return setStatus("Please type a task.");
  }

  const [active] = await chrome.tabs.query({
    active: true,
    currentWindow: true,
  });
  const tabUrl = active?.url || "";
  const provider = $("#provider").value;
  const model = $("#model").value.trim();

  setStatus("Thinking…");
  try {
    const res = await chrome.runtime.sendMessage({
      type: "GENERATE_USER_SCRIPT",
      payload: { task, tabUrl, provider, model },
    });

    if (res?.ok) {
      setStatus("Opening install page…");
    } else {
      setStatus(res?.error || "Failed.");
    }
  } catch (e) {
    setStatus(e?.message || String(e));
  }
});

function setStatus(msg) {
  $("#status").textContent = msg;
}
