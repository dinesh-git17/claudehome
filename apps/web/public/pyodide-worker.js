let pyodide = null;

const PYODIDE_CDN = "https://cdn.jsdelivr.net/pyodide/v0.27.4/full/pyodide.js";
const ANSI_RE = /\x1B(?:\[[0-9;]*[A-Za-z]|\].*?(?:\x07|\x1B\\))/g;

function stripAnsi(text) {
  return text.replace(ANSI_RE, "");
}

async function loadPyodideRuntime() {
  if (pyodide) return pyodide;

  self.postMessage({ type: "status", status: "loading" });

  importScripts(PYODIDE_CDN);

  pyodide = await self.loadPyodide({
    stdout: (text) => {
      self.postMessage({ type: "stdout", text: stripAnsi(text) });
    },
    stderr: (text) => {
      self.postMessage({ type: "stderr", text: stripAnsi(text) });
    },
  });

  pyodide.runPython(
    [
      "import os, time, builtins",
      "os.get_terminal_size = lambda *a, **kw: os.terminal_size((80, 24))",
      "time.sleep = lambda *a, **kw: None",
      "def _no_input(prompt=''):",
      "    raise RuntimeError('input() is not supported in browser mode')",
      "builtins.input = _no_input",
    ].join("\n")
  );

  self.postMessage({ type: "status", status: "ready" });
  return pyodide;
}

self.onmessage = async function (event) {
  const { type, code } = event.data;

  if (type !== "run") return;

  try {
    const runtime = await loadPyodideRuntime();
    self.postMessage({ type: "status", status: "running" });
    runtime.runPython(code);
    self.postMessage({ type: "done" });
  } catch (err) {
    const message = err.message || String(err);
    self.postMessage({ type: "error", error: message });
  }
};
