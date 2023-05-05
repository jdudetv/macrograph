import { invoke } from "@tauri-apps/api/tauri";

await invoke('greet')
const invoker = window.__TAURI__.invoke;

