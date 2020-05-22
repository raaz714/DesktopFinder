import { DictData } from "fuzzy-finder";

let dict = new DictData();

document.getElementById('inputfile').addEventListener('change', function() {
   var fr = new FileReader();
   fr.onload = function() {
      //document.getElementById('output').textContent=fr.result;
      let json_obj = JSON.parse(fr.result);
      //console.log(json_obj);
      for (let key in json_obj)
      {
         dict.insert(key, key);
      }
      console.log("Done, loading database");
   }
   fr.readAsText(this.files[0]);
});

document.getElementById('searchbar').addEventListener('change', function() {
   let query = document.getElementById("searchbar").value;
   console.log("Query : ", query);
   if (query)
   {
      console.log(dict.fuzzy_search(query));
   }
});
