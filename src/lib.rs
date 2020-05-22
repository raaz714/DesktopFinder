mod utils;

use std::collections::HashMap;
use std::collections::HashSet;

use std::collections::hash_map::DefaultHasher;
use std::hash::{Hash, Hasher};
use priority_queue::PriorityQueue;
use std::cmp::Reverse;

use wasm_bindgen::prelude::*;

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

struct Trie {
    pub chars: HashMap<u8, Trie>,
    pub val: Option<HashSet<u64>>,
}

impl Trie {
    fn new() -> Self {
        Self {
            chars: HashMap::new(),
            val: None,
        }
    }

    fn insert(&mut self, string: String, val: HashSet<u64>) {
        let mut current_node = self;
        for c in string.as_bytes()
        {
            current_node = moving(current_node).chars
                .entry(*c)
                .or_insert( Trie::new());
        }
        current_node.val = Some(val);
    }

    fn get(&mut self, query: &String) -> Option<&HashSet<u64>> {
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

    fn get_mut(&mut self, query: &String) -> Option<&mut HashSet<u64>> {
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
pub struct DictData {
    dictionary: Trie,
    file_paths: HashMap<u64, String>,
}

fn calculate_hash<T: Hash>(t: &T) -> u64 {
    let mut s = DefaultHasher::new();
    t.hash(&mut s);
    s.finish()
}

#[wasm_bindgen]
impl DictData {
    #[wasm_bindgen(constructor)]
    pub fn new() -> Self {
        Self {
            dictionary: Trie::new(),
            file_paths: HashMap::new()
        }
    }

    pub fn insert(&mut self, raw_words: &str, file_path: &str) {
        let raw_words = raw_words.to_lowercase();
        let file_hash: u64 = calculate_hash(&raw_words);
        self.file_paths.insert(file_hash, file_path.to_string());

        let tokens: Vec<&str> = raw_words.split(
            |c| c == ' ' || c == '-' || c == '/' || c == '.'
            ).collect();

        for token in tokens
        {
            let mut dict_elem = self.dictionary.get_mut(&token.to_string());
            if dict_elem.is_none()
            {
                self.dictionary.insert(token.to_string(), HashSet::new());
                dict_elem = self.dictionary.get_mut(&token.to_string());
            }
            dict_elem.unwrap().insert(file_hash);
        }
    }

    //pub fn search(&mut self, query: &str, results: &mut HashSet<str>) {
    //    results.clear();
    //    let query = query.to_lowercase();
    //    let dict_elems = self.dictionary.get(&query);
    //    if dict_elems.is_none()
    //    {
    //        return;
    //    }
    //    for elem in dict_elems.unwrap()
    //    {
    //        let file_path = self.file_paths.get(&elem);
    //        results.insert(file_path.unwrap().to_string());
    //    }
    //}

    pub fn fuzzy_search(&self, query: &str) -> JsValue {
        //let mut results = HashSet::new();
        let mut results = PriorityQueue::new();
        results.clear();
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

        //for elem in &results
        for (elem, score) in results.into_sorted_iter()
        {
            v.push((elem, score));
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
                let file_path = self.file_paths.get(&elem);
                //results.insert(file_path.unwrap().to_string());
                if results.len() < 50
                {
                    results.push(file_path.unwrap().to_string(), max_val);
                }
                else if let Some((_, p)) = results.peek()
                {
                    if p <= &max_val
                    {
                        results.push(file_path.unwrap().to_string(), max_val);
                    }
                }
            }
        }

        for (child, next_sub_trie) in &sub_trie.chars
        {
            self.fuzzy_search_helper(&next_sub_trie, query, child, &current_row, results);
        }
    }
}

