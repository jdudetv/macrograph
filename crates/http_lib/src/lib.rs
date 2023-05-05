use std::collections::HashMap;
use serde_json::{Value};
use reqwest::header::*;
use reqwest;


pub async fn httpget(url: String, headers: String, body: Option<String>) -> String{
    let client = reqwest::Client::new();
    let headerTypes: HashMap<String, HeaderName> = HashMap::from([
        ("Content-Type".to_string(), CONTENT_TYPE),
        ("Authorization".to_string(), AUTHORIZATION)
    ]);

    let head: HashMap<String, String> = serde_json::from_str(&headers).unwrap();
    let mut headerMap = HeaderMap::new();
    for (key, value) in head.iter() {
        headerMap.insert(headerTypes.get(key).unwrap(), value.parse().unwrap());
    }
    let res = client.get(url)
        .headers(headerMap)
        .send()
        .await
        .unwrap()
        .text()
        .await
        .unwrap();
    
    res.into()
}


