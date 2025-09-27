const $ = (s) => document.querySelector(s);

(async () => {
  const { openaiKey = "", anthropicKey = "" } = await chrome.storage.local.get([
    "openaiKey",
    "anthropicKey",
  ]);
  $("#openaiKey").value = openaiKey;
  $("#anthropicKey").value = anthropicKey;
})();

$("#save").addEventListener("click", async () => {
  await chrome.storage.local.set({
    openaiKey: document.querySelector("#openaiKey").value.trim(),
    anthropicKey: document.querySelector("#anthropicKey").value.trim(),
  });
  document.querySelector("#status").textContent = "Saved.";
});
