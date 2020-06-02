mod utils;
use utils::set_panic_hook;
use std::collections::HashMap;
use std::collections::HashSet;

use priority_queue::PriorityQueue;

use wasm_bindgen::prelude::*;

use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};

#[macro_use]
extern crate serde_derive;

// When the `wee_alloc` feature is enabled, use `wee_alloc` as the global
// allocator.
#[cfg(feature = "wee_alloc")]
#[global_allocator]
static ALLOC: wee_alloc::WeeAlloc = wee_alloc::WeeAlloc::INIT;

#[wasm_bindgen]
extern {
    fn alert(s: &str);
}

#[wasm_bindgen]
pub fn greet() {
    alert("Hello, finder-v2-wasm!");
}

#[derive(Serialize, Deserialize)]
struct Trie {
    pub chars: HashMap<u8, Trie>,
    pub val: Option<HashSet<String>>,
}

impl Trie {
    fn new() -> Self {
        Self {
            chars: HashMap::new(),
            val: None,
        }
    }

    fn insert(&mut self, string: String, val: HashSet<String>) {
        let mut current_node = self;
        if string.len() > 50
        {
            return;
        }
        for c in string.as_bytes()
        {
            current_node = moving(current_node).chars
                .entry(*c)
                .or_insert( Trie::new());
        }
        current_node.val = Some(val);
    }

    fn get(&mut self, query: &String) -> Option<&HashSet<String>> {
        let mut current_node = self;
        for letter in query.as_bytes()
        {
            if let Some(x) = current_node.chars.get_mut(&letter)
            {
                current_node = x;
            }
            else
            {
                return None;
            }
        }
        current_node.val.as_ref()
    }

    fn get_mut(&mut self, query: &String) -> Option<&mut HashSet<String>> {
        let mut current_node = self;
        for letter in query.as_bytes()
        {
            if let Some(x) = current_node.chars.get_mut(&letter)
            {
                current_node = x;
            }
            else
            {
                return None;
            }
        }
        current_node.val.as_mut()
    }
}

fn moving<T>(t: T) -> T { t }

#[wasm_bindgen]
#[derive(Serialize, Deserialize)]
pub struct DictData {
    dictionary: Trie,
    // file_paths: Vec<String>
    file_paths: HashMap<String, String>
}

fn calculate_hash<T: Hash>(t: &T) -> String {
    let mut s = DefaultHasher::new();
    t.hash(&mut s);
    s.finish().to_string()
}

#[wasm_bindgen]
impl DictData {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        set_panic_hook();
        Self {
            dictionary: Trie::new(),
            // file_paths: Vec::new()
            file_paths: HashMap::new()
        }
    }

    pub fn populate_from_buffer(&mut self, val: &JsValue) -> JsValue {
        let serde_dict = val.into_serde();
        if serde_dict.is_ok()
        {
            let dict_data: DictData = serde_dict.unwrap();
            *self = dict_data;
            JsValue::from_serde("Ok").unwrap()
        }
        else
        {
            let error = &serde_dict.err().unwrap();
            if error.is_io()
            {
                JsValue::from_serde("IO error").unwrap()
            }
            else if error.is_syntax()
            {
                JsValue::from_serde("Syntax error").unwrap()
            }
            else if error.is_data()
            {
                JsValue::from_serde("Data error").unwrap()
            }
            else if error.is_eof()
            {
                JsValue::from_serde("EOF error").unwrap()
            }
            else
            {
                JsValue::from_serde("Other error").unwrap()
            }
        }
    }

    fn add_file_path(&mut self, key:String, word: &str) {
        // self.file_paths.insert(word.to_string());
        self.file_paths.entry(key).or_insert(word.to_string());
    }

    fn get_file_path(&self, key: String) -> &String {
        // &self.file_paths[key]
        &self.file_paths.get(&key).unwrap()
    }

    pub fn write_to_buffer(&self) -> JsValue {
        JsValue::from_serde(self).unwrap()
    }

    pub fn insert(&mut self, raw_words: &str, file_path: &str) {
        let raw_words = raw_words.to_lowercase();
        // self.file_paths.push(file_path.to_string());
        // let file_index = self.file_paths.len() - 1;
        let file_index = calculate_hash(&file_path.to_string());
        self.add_file_path(file_index.clone(), file_path);

        let tokens: Vec<&str> = raw_words.split(
            |c| c == ' ' || c == '-' || c == '_' || c == '/' || c == '.'
            ).collect();

        for token in tokens
        {
            let mut dict_elem = self.dictionary.get_mut(&token.to_string());
            if dict_elem.is_none()
            {
                self.dictionary.insert(token.to_string(), HashSet::new());
                dict_elem = self.dictionary.get_mut(&token.to_string());
            }
            if dict_elem.is_some()
            {
                dict_elem.unwrap().insert(file_index.clone());
            }
        }
    }

    pub fn search(&mut self, query: &str) -> JsValue {
       let mut results = HashSet::new();
       let mut v = Vec::new();
       let mut i = 50;
       let query = query.to_lowercase();
       let dict_elems = self.dictionary.get(&query).cloned();

       if dict_elems.is_none()
       {
           return JsValue::from_serde(&v).unwrap();
       }
       for elem in dict_elems.unwrap()
       {
        //    let file_path = &self.file_paths[elem];
           let file_path = self.get_file_path(elem);
           results.insert(file_path.to_string());
       }

       for elem in &results
       {
           if i == 0 {
               break;
           }
           v.push((elem, 0));
           i -= 1;
       }
       JsValue::from_serde(&v).unwrap()
    }

    pub fn fuzzy_search(&self, query: &str) -> JsValue {
        let mut results = PriorityQueue::new();
        let query = query.to_lowercase();
        let tokens: Vec<&str> = query.split(
            |c| c == ' ' || c == '.'
            ).collect();

        for token in tokens
        {
            let dl_row = vec![0; token.len() + 1];

            for (child, sub_trie) in &self.dictionary.chars
            {
                self.fuzzy_search_helper(&sub_trie, &token.to_string(), child, &dl_row, &mut results);
            }
        }

        let mut v = Vec::new();
        let mut i = 50;

        for (elem, score) in results.into_sorted_iter()
        {
            if i == 0 {
                break;
            }
            v.push((elem, score));
            i -= 1;
        }
        JsValue::from_serde(&v).unwrap()
    }

    fn fuzzy_search_helper(&self, sub_trie: &Trie, query: &String,
                           letter: &u8, previous_row: &Vec<i64>,
                           results: &mut PriorityQueue<String, i64>) {
        let mut current_row = previous_row.to_vec();
        const MATCH_SCORE: i64 = 3;
        const GAP_SCORE: i64 = 2;
        let mut max_val = 0;

        for i in 1..(current_row.len())
        {
            current_row[i] = std::cmp::max(
                previous_row[i - 1] + (if query.as_bytes()[i - 1] == *letter { 1 }  else { -1 }) * MATCH_SCORE,
                std::cmp::max(current_row[i - 1] - GAP_SCORE,
                    std::cmp::max(previous_row[i] - GAP_SCORE, 0
                        )
                    )
                );
            max_val = std::cmp::max(max_val, current_row[i]);
        }

        if max_val > ((query.len() as i64 * MATCH_SCORE * 15) / 20)
            && sub_trie.val.as_ref().is_some()
        {
            for elem in sub_trie.val.as_ref().unwrap()
            {
                // let file_path = &self.file_paths[*elem];
                let file_path = self.get_file_path(elem.to_string());
                if let Some(priority) = results.get_priority(file_path)
                {
                    let new_priority = priority + max_val;
                    results.change_priority(file_path, new_priority);
                }
                else
                {
                    results.push(file_path.clone(), max_val);
                }
            }
        }

        for (child, next_sub_trie) in &sub_trie.chars
        {
            self.fuzzy_search_helper(&next_sub_trie, query, child, &current_row, results);
        }
    }
}
