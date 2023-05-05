// Prevents additional console window on Windows in release, DO NOT REMOVE!!
#![cfg_attr(not(debug_assertions), windows_subsystem = "windows")]


use websocket;

// Learn more about Tauri commands at https://tauri.app/v1/guides/features/command
#[tauri::command]
async fn http(url: String, headers: String, body: Option<String>) -> String{
    let res = http_lib::httpget(url, headers, body).await;
    res.into()
}

fn main() {
    tauri::async_runtime::spawn(websocket::start_server());
    tauri::Builder::default()
        .invoke_handler(tauri::generate_handler![http])
        .run(tauri::generate_context!())
        .expect("error while running tauri application");
}
