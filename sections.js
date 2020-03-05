// Global Variables
// Array of the names of each of the Democratic candidates
// for the 2020 presidential election
var names;
// Object in which the keys are the names of the candidates
// for the 2020 presidential election and the values are
// links to corresponding images for each of the candidates
var names_obj = {};
// Array of keys for names_obj
var names_keys;
// Data on candidates regarding key facts, stances on key
// issues, and criticisms
var candidates;
// Main SVG used for visualization
var vis;
// Group appended to vis that will be used as a container
// for all elements in the visualizations 
var g = null;
// Width of the SVG
var w = 600;
// Height of the SVG
var h = 520;

// Global Functions
/**
 * Add a new function to String that replaces all instances
 * of the matched RegEx instead of only the first
 *  @param search String to be matched
 *  @param replace String to replace the matched RegEx of
 *                 search
 */
String.prototype.replaceAll = function(search, replace)
{
  // If replace is not defined, return original string 
  // otherwise it will replace search string with 'undefined'.
  if (replace === undefined) {
      return this.toString();
  }
  // Replace all instances of search with replace
  return this.replace(new RegExp('[' + search + ']', 'g'), replace);
};
/**
 * Function to determine if the current element is also the 
 * target of the d3 event (used by other functions to
 * determine whether the user has clicked inside the 
 * visualization
 */
function equalToEventTarget(){
  return this == d3.event.target;
}
/**
 * Function to determine the elements not contained in the
 * intersection of two arrays
 *  @param a1 First array
 *  @param a2 Second array
 */
function arr_diff(a1, a2){
  // Instantiate arrays
  var a = [], diff = [];
  // a contains element from a1 and associates each of these
  // elements with boolean "true"
  for (var i = 0; i < a1.length; i++) {
      a[a1[i]] = true;
  }
  // If elements from a2 are in a, delete them from a.
  // Otherwise, add them to a
  for (var i = 0; i < a2.length; i++) {
      if (a[a2[i]]) {
          delete a[a2[i]];
      } else {
          a[a2[i]] = true;
      }
  }
  // Add all elements not in the intersection between a1 and
  // a2 to diff and return
  for (var k in a) {
      diff.push(k);
  }
  return diff;
}
/**
 * Function to format d3 text element to include line breaks
 * when the width of a line of text exceeds an input width
 *  @param text String to format
 *  @param width Maximum width of a line
 */
function wrap(text, width) {
  text.each(function () {
      var text = d3.select(this),
          // Split the text into an array of words 
          words = text.text().split(/\s+/).reverse(),
          word,
          // The "line" array will hold the words to be 
          // included in the current line of text
          line = [],
          // Current line number
          lineNumber = 0,
          // Line height
          lineHeight = 1.1,
          // Position of text in the visualization
          x = text.attr("x"),
          y = text.attr("y"),
          dy = 0, 
          // Append a tspan element
          tspan = text.text(null)
                      .append("tspan")
                      .attr("x", x)
                      .attr("y", y)
                      .attr("dy", dy + "em");
      // While there are still words perform the following
      while (word = words.pop()) {
          // Add the current word to the "line" array
          line.push(word);
          // Join all the elements of the "line" array using
          // spaces
          tspan.text(line.join(" "));
          // If the tspan element exceeds the input width or
          // the first element of the word is '*' perform
          // the following. (Note that the '*' characters
          // were added by a previously executed function to 
          // indicate where line breaks should also occur
          // regardless of the width of a line ('*' indicates
          // the beginning of a title)
          if ((tspan.node().getComputedTextLength() > width)||(word[0]=='*')){
              // Pop off the last word in the "line" array
              // since it exceeds the width
              line.pop();
              tspan.text(line.join(" "));
              // If the first character of a word is '*'
              // perform the following
              if(word[0]=='*'){
                // Remove the '*' character from the word
                line = [word.slice(1)];
                // If a '*' character is present, this
                // indicates the presence of a title, which
                // typically contains a few words and ends 
                // with a colon. In the desired formatting,
                // line breaks occur after the colon in a 
                // title. Therefore, wordFlag is used to 
                // continue adding words to the "line" array,
                // after addition of the first word that 
                // originally contained the '*' character, 
                // until a colon is identified.
                // wordFlag indicates when to break out of the
                // while loop that adds words to the "line"
                // array
                var wordFlag = 0;
                while(wordFlag==0){
                  // Break the while loop if the last
                  // character of a word is a colon
                  if(word[word.length-1]==':'){
                    wordFlag = 1;
                    // Add the last word to the "line" array
                    // without the colon
                    var last_word = line[line.length-1];
                    line[line.length-1] = last_word.slice(0,last_word.length-1)
                    break;
                  }
                  word = words.pop();
                  line.push(word);
                }
                // Append a new tspan element with the
                // contents of the "line" array
                tspan = text.append("tspan")
                  .attr("x", x)
                  .attr("y", y)
                  .attr("dy", ++lineNumber * lineHeight + dy + "em")
                  .attr("font-weight","bold")
                  .text(line.join(" "));
                line = [];
                // Append a new tspan element to indicate
                // the creation of a new line (after the 
                // title)
                tspan = text.append("tspan")
                  .attr("x",x)
                  .attr("y",y)
                  .attr("dy", ++lineNumber * lineHeight + dy + "em")
                  .text("");
              }
              // If the first character of the word is not a
              // '*', append a new tspan element to indicate
              // the creation of a new line starting with the
              // word
              else{
                line = [word];
                tspan = text.append("tspan")
                .attr("x", x)
                .attr("y", y)
                .attr("dy", ++lineNumber * lineHeight + dy + "em")
                .text(word);
              }
          }
      }
  });
}
/**
 * Function to find a random number between min_num and
 * max_num
 *  @param min_num Minimum number in the desired range
 *  @param max_num Maximum number in the desired range
 */
function rand_in_range(min_num,max_num){
  return Math.floor(Math.random() * (max_num - min_num)) + min_num;
}
/**
 * Function to extract and transform raw data from 'names.csv'
 * to be used in the d3 visualization
 *  @param csvdata Raw data from 'names.csv'
 */
function getNames(csvdata){
  // 'names.csv' consists of one row of the names of all
  // candidates
  // "names" is an array of all the candidate names
  names = csvdata.columns;
  // "names_obj" will be an object in which keys are the names
  // of candidates and values are links to corresponding 
  // images
  for(i=0;i<names.length;i++){
      names_obj[names[i]] = "portraits/"+names[i].toLowerCase().replace(/'/g, '')+'.png';
  }
}
/**
 * Function to modify the candidates array containing 
 * data on key facts, stances on critical issues, and key
 * criticisms for each candidate to be used in the 
 * corresponding d3 visualization 
 */
function getCandidates(){
  // Adds data for the nodes array of experience_obj
  setup_experience_obj();
  // Define and insert an arrowhead defs element 
  var defs = g.insert("svg:defs")
      .data(["end"]);
  defs.enter().append("svg:path")
      .attr("d","M0,-5L10,0L0,5");
  for(i=0;i<names.length;i++){
      var name = names[i];
      // The website from which the data for the candidates
      // array is derived contained headings for each bullet
      // point made about the candidate. "candidate_keys"
      // refers to these headings, with the values associated
      // with "candidate_keys" being the text content for
      // the heading
      var candidate_keys = Object.keys(candidates[name]);
      // The headings and corresponding text content will
      // be subsequently split into different issues 
      // categories depending on patterns contained in the 
      // text. In order to ensure that headings and
      // corresponding text content split uniquely into 
      // categories, "used_keys" contains the headings 
      // already placed into categories for a particular 
      // candidate
      var used_keys = [];
      // "experience_keys" is an array of the experience
      // categories
      for(j=0;j<experience_keys.length;j++){
          var experience_key = experience_keys[j];
          // The "experience" object contains the RegEx 
          // expression patterns associated with each of the
          // experience categories
          for(k=0;k<experience[experience_key].patterns.length;k++){
              if(candidate_keys.includes('Current position')){
                  // "value_arr" is the array of words
                  // associated with the heading "Current 
                  // position" for the candidate
                  var value_arr = candidates[name]['Current position'].split(',');
                  // "pattern" is the current RegEx expression
                  // pattern used for matching with the 
                  // current experience category
                  var pattern = experience[experience_key].patterns[k];
                  // Add names of candidates to the relevant 
                  // key of experience_obj.dict if their raw 
                  // data descriptions contain "pattern"
                  // using the check_experience function
                  check_experience(value_arr,pattern,j,name);
              }
              // Repeat the procedure for the "Previous roles"
              // heading for the candidate
              if(candidate_keys.includes('Previous roles')){
                  var value_arr = candidates[name]['Previous roles'].split(',');
                  var pattern = experience[experience_key].patterns[k];
                  check_experience(value_arr,pattern,j,name);
              }
          }
      }
      for(m=0;m<issues_keys.length;m++){
          // "issues_key" is the current key in the issues
          // object, corresponding to one of the critical
          // issues
          var issues_key = issues_keys[m];
          for(n=0;n<issues[issues_key].patterns.length;n++){
              for (o=0;o<candidate_keys.length;o++){
                  // "value" is one of the critical issues
                  // for the current candidate
                  var value = candidate_keys[o];
                  // "pattern" is the RegEx expression pattern
                  // associated with one of the critical
                  // issues. In the for loops of this function,
                  // every pattern for every critical issue
                  // is matched with every critical issue
                  // associated with every candidate to see
                  // which critical issues each candidate has
                  // a stance on
                  var pattern = issues[issues_key].patterns[n];
                  // issuesFlag indicates whether issues_obj 
                  // contains information about a candidate 
                  // for a specific critical issue category.
                  // If the flag is equal to 0, information is
                  // not present and a new object 
                  // corresponding to the candidate is made 
                  // and added to issues_obj.
                  // If the flag is equal to 1, information
                  // is already present and text regarding
                  // the current critical issue category
                  // is added to the pre-existing text for
                  // the candidate in issues_obj
                  issuesFlag = 0;
                  // If the pattern matches the text for
                  // the current critial issue associated 
                  // with the current candidate and the 
                  // critical issue heading is not already
                  // in "used_keys", perform the
                  // following
                  if(pattern.test(value.toLowerCase())&&!used_keys.includes(value)){
                      // Check to make sure the match does
                      // not fall into one special case
                      // (which would place data in the wrong
                      // category)
                      if((pattern.toString().replaceAll('/','')=='college' && value.toLowerCase()!='electoral college')||(pattern.toString().replaceAll('/','')!='college')){
                        // curr_child is an array of the candidates associated
                        // with the current critial issue category
                        var curr_child = issues_obj.children[m].children;
                        for(p=0;p<curr_child.length;p++){
                          // If the name of the current
                          // element of curr_child matches
                          // the name of the current 
                          // candidate, add the current text
                          // data to the relevant entry of
                          // issues_obj
                          if(curr_child[p]["name"]==name){
                            // If the critical issue category also corresponds
                            // to a key criticism, the heading will have an
                            // additional '*' prefix. Remove that '*' prefix
                            // when adding the text data to the relevant entry
                            // of issues_obj
                            if(value[0]=='*'){
                              curr_child[p]["text"] += (' *'+value.slice(1)+': '+candidates[name][value]);
                            }
                            else{
                              curr_child[p]["text"] += (' *'+value+': '+candidates[name][value]);
                            }
                            issuesFlag = 1;
                            break;
                          }
                        }
                        // If data for the current candidate
                        // for the current critical issue 
                        // category does not exist, add a
                        // new entry to issues_obj 
                        if(issuesFlag==0){
                          // If the critical issue category also corresponds
                          // to a key criticism, the heading will have an
                          // additional '*' prefix. Remove that '*' prefix
                          // when adding the text data to the relevant entry
                          // of issues_obj
                          if(value[0]=='*'){
                            issues_obj.children[m].children.push({
                              "name":name,
                              "img":names_obj[name],
                              "size":3000,
                              "text":'*'+value.slice(1)+': '+candidates[name][value]
                             });
                          }
                          else{
                            issues_obj.children[m].children.push({
                              "name":name,
                              "img":names_obj[name],
                              "size":3000,
                              "text":'*'+value+': '+candidates[name][value]
                             });
                          }
                        }
                      // Add the current critical issue
                      // heading to "used_keys" to ensure
                      // the current heading and corresponding
                      // text content are not re-used in 
                      // other critical issue categories
                      used_keys.push(value);
                      }
                    }
                }
            }
        }
      // The website from which the data for the candidates
      // array is derived contains headings for each of the
      // bullet points in the "Key Criticisms" section for
      // each candidate. "crit_keys" is an array of these
      // headings and "crit_values" is an array of the text
      // associated with these headings
      var crit_keys = [];
      var crit_values = [];
      for(q=0;q<candidate_keys.length;q++){
        // While "crit_keys" contains headings for the "Key
        // Criticisms" section for each candidate, 
        // "candidate_keys" contains headings for all 
        // subsections for each candidate. "value" is one 
        // of these headings.
        var value = candidate_keys[q];
        // The '*' character was inserted by a previously
        // executed function to indicate which of the
        // headings in "candidate_keys" belongs to the "Key
        // Criticisms" subsection. If '*' is the first 
        // character of a heading, add the heading without
        // the '*' character to crit_keys and add the 
        // corresponding text to crit_values
        if(value[0]=='*'){
          crit_keys.push(value.slice(1));
          crit_values.push(candidates[name][value]);
        }
      }
      // "criticism_obj" is an array of objects containing
      // information about the key criticisms associated 
      // with each candidate
      criticism_obj.push({
        // Name of the candidate
        "name":name,
        // Link to an image of the candidate
        "img":names_obj[name],
        // Number of criticisms associated with the candidate
        "size":crit_keys.length,
        // Headings for the criticisms associated with the
        // candidate
        "crit_keys":crit_keys,
        // Text associated with the headings for critcisms
        // associated with the candidate 
        "crit_values":crit_values,
      })
  }
  // Create a link between every experience category node and
  // candidate node according to the arrays defined in 
  // experience_obj.dict for the "Tree" Visualization
  experience_links();
  // Modify the dictionary data in the experience_obj object
  // for the "Tree" Visualization
  setup_experience_candidates();
}
/**
 * experience_obj.dict contains keys with names of experience
 * categories and values with names of candidates that have
 * experience in those categories. This function adds names
 * of candidates to the relevant key of experience_obj.dict if 
 * their raw data descriptions contain pre-defined string 
 * patterns associated with an experience category
 *  @param value_arr Raw string description for a candidate
 *  @param pattern String pattern to match within value_arr
 *  @param ind Current index into the array of keys in
 *             experience_obj.dict indicates which experience
 *             category is currently being matched
 *  @param name Name of the current candidate who should be 
 *              associated with the current experience 
 *              category if pattern is found in value_arr
 */
function check_experience(value_arr,pattern,ind,name){
  // For every word in value_arr perform the following
  for(l=0;l<value_arr.length;l++){
      // If the pattern matches the current word, then the
      // candidate has experience in the current experience
      // category. Add their name to the relevant set in 
      // experience_obj.dict
      if(pattern.test(value_arr[l].toLowerCase())){
          experience_obj.dict[experience_keys[ind]].add(name);
      }
  }
}
/**
 * Adds data for the nodes array of the experience_obj 
 * object
 */
function setup_experience_obj(){
  // For the force layout, coordinates for a node can
  // be specified (instead of calculated via the physics 
  // simulation) by defining the values "fx" and "fy" for 
  // the node
  // Fixed x coordinate for a node
  var fx;
  // Fixed y coordinate for a node
  var fy;
  // For every key corresponding to an experience category
  // (i.e. legal, entrepreneurial, political, military), 
  // perform the following
  for(i=0;i<experience_keys.length;i++){
      // The desired coordinates for each node corresponding
      // to an experience category are already pre-defined
      // in the tree_nodes_locs object.
      fx = tree_nodes_locs[experience_keys[i]][0];
      fy = tree_nodes_locs[experience_keys[i]][1];
      // Add an object to the nodes array in experience_obj
      // containing information about the name of the 
      // experience category, a link to a corresponding 
      // image, an instantiated array of candidates with
      // experience in this category, size of the node, 
      // and the fixed x and y coordinates of the node
      experience_obj.nodes.push({
          "id":experience_keys[i],
          "img":"experience/"+experience_keys[i]+".png",
          "candidates":[],
          "size":100000,
          "fx":fx,
          "fy":fy
      })
      // Add a new key to the dictionary in experience_obj
      // whose value is an instantiated set
      experience_obj.dict[experience_keys[i]] = new Set();
  }
  // For every candidate with name in names_keys perform
  // the following
  for(i=0;i<names.length;i++){
    // Instantiate the final string (to be displayed via 
    // tooltip when a candidate's node is clicked) with a 
    // <ul> tag to begin definition of the unordered list
      final_text = "<ul>";
      // If the raw data corresponding to a candidate contains
      // information for 'Current position', perform the
      // following
      if(Object.keys(candidates[names[i]]).includes('Current position')){    
          var curr_text = candidates[names[i]]['Current position'];
          // Remove trailing whitespace
          curr_text = curr_text.trim();
          if(curr_text!='n/a'){
              // Add the string description between <li>
              // tags to final_text
              final_text += "<li>"+curr_text+"</li>";
          }
      }
      // If the raw data corresponding to a candidate contains
      // information for 'Previous roles', perform the 
      // following
      if(Object.keys(candidates[names[i]]).includes('Previous roles')){
          var curr_text = candidates[names[i]]['Previous roles'];
          // Modify the string using format_html_text() and
          // add to final_text
          final_text += format_html_text(curr_text);
      }
      // Close the HTML formatting with a </ul> tag
      final_text += "</ul>";
      // Add a new node to the nodes array in experience_obj
      // with the name of a candidate, link to a corresponding
      //image, the final_text string, size of the node, and
      // initial opacity of 1.0
      experience_obj.nodes.push({
          "id":names[i],
          "img":names_obj[names[i]],
          "text":final_text,
          "size":40000,
          "opacity":1.0
      })
  }
}
/**
 * Format for HTML text displayed in the tooltip when nodes
 * corresponding to candidates are clicked by the user
 *  @param curr_text String description of previous roles
 *                   the candidate has had from raw data
 */
function format_html_text(curr_text){
  // Instantiate string to be returned by function
  var return_text = "";
  // Remove trailing whitespace
  curr_text = curr_text.trim();
  // The following RegEx manipulations split up the raw string
  // description into "bullet points" to be displayed in HTML
  // as an unordered list using the separator character '|'
  // to indicate where each bullet point shoudl start
  // The first RegEx manipulation identifies a new bullet 
  // point by the presence of a period (which often indicates
  // a new sentence). To ensure that the period corresponds 
  // to a new sentence (and not to the periods present in 
  // abbreviations for example), the RegEx makes sure that the
  // period is followed by at least three words, as opposed
  // to a single letter in the case of an abbreviation. 
  curr_text = curr_text.replace(/(\s[A-Za-z0-9]+)([.?!])(\s[A-Z]{1}[a-z-]+\s[A-Za-z-]+\s[A-Za-z-]+\s)/g, "$1$2|$3")
  // The second RegEx manipualation identifies a new bullet
  // point by the presence of a comma (which often indicates
  // a new idea in a list of ideas). Again to ensure that the
  // comma corresponds to a new idea (and not to a location
  // such as "Queens, New York"), the RegEx makes sure that
  // the comma is followed by at least two words, as opposed
  // to a single word in the case of a location for example.
  curr_text = curr_text.replace(/([A-Za-z0-9)])([;,])(\s[a-zA-Z0-9-.]+\s[a-zA-Z0-9-]+\s)/g, "$1 |$3")
  // Split up the raw string by the inserted separator 
  // characters '|'
  curr_arr = curr_text.split("|");
  // Each element of curr_arr is therefore a new idea to be
  // displayed as a separate <li> element in an unordered list
  for(j=0;j<curr_arr.length;j++){
      // If the content of the element in curr_arr is not
      // 'n/a' perform the following
      if(curr_arr[j]!='n/a'){
          // Remove trailing whitespace
          curr_arr[j] = curr_arr[j].trim();
          // Make the first letter of the bullet point
          // uppercase
          if(curr_arr[j][0]!=curr_arr[j][0].toUpperCase()){
              curr_arr[j] = curr_arr[j][0].toUpperCase()+curr_arr[j].slice(1);
          }
          // Place the <li> tags around the bullet point
          // for HTML formatting
          return_text += "<li>"+curr_arr[j]+"</li>";
      }
  }
  return return_text;
}
/**
 * Modifies the dictionary data in the experience_obj object
 */
function setup_experience_candidates(){
  // dict_keys holds all the keys in experience_obj.dict
  // (corresponding to the names of experience categories).
  // The values of experience_obj.dict are the names of 
  // candidates with experience in those categories
  var dict_keys = Object.keys(experience_obj.dict);
  for(i=0;i<dict_keys.length;i++){
      // dict_key holds the name of the current experience
      // category 
      var dict_key = dict_keys[i];
      for(j=0;j<experience_obj.nodes.length;j++){
          var curr_node = experience_obj.nodes[j];
          // If the id of the current node is equal to the 
          // current experience category perform the following
          if(curr_node.id==dict_key){
              // Convert the set defined in the relevant key
              // of experience_obj.dict into an array and
              // set the empty candidates array of the current
              // node equal to this array
              curr_node.candidates = Array.from(experience_obj.dict[dict_key]);
          }
      }
  }
}

// Variables for "Voter Choice Percentages" section (with
// visualization subsequently denoted "Pie")
// Data regarding which candidates are leading among 
// Democratic primary voters, as well as tracking name and
// favorability for each candidate. 
var pierankdata;
// Data derived from pierankdata regarding the choices of 
// Democratic primary voters for the 2020 presidential 
// election
var piedata;
// Data derived from piedata, but filtered to only contain
// results for candidates receiving 2% or more of the votes
// from Democratic primary voters
var piedataLarge;
// Array of objects containing the name and link to a
// corresponding image for each of the candidates 
// that received less than 2% of the votes from Democratic 
// primary voters
var pieimagesSmall = [];
// Object containing data derived from piedata, in which
// each key is the name of a candidate that received less
// than 2% of the votes from Democratic primary voters. The
// values contain information about the voting results for 
// the candidate specified in the key as well as the other
// candidates taht received 2% or more of votes from
// Democratic primary voters
var piedataSmall = {};

// Functions for "Voter Choice Percentages" section
/**
 * Function to convert each row of the 'ranks.csv' file into 
 * an object with the specified properties
 *  @param data Raw data from 'ranks.csv'
 */
function transformPieData(data){
  return data.map(function(row) {
      return {
        // Name of candidate
        name: row.Name,
        // Percentage of Democratic primary voters who
        // selected this candidate as their top choice
        primary: parseInt(row.Primary.replace('%','')),
      }
  })
}
/**
 * Function to modify the piedata array containing 
 * top voter choice percentages for candidates to be used in 
 * the corresponding d3 visualization 
 */
function getPieData(){
  // Add the link to the corresponding image for a candidate
  // to piedata using data from names_obj
  for(var i=0;i<piedata.length;i++){
    piedata[i].img = names_obj[piedata[i].name];
  }
  // "piedataLarge" will derive data from piedata but be 
  // filtered to only contain information for candidates
  // who are a top choice for 2% or more of voters
  // Initialize "piedataLarge" to be a copy of "piedata"
  piedataLarge = JSON.parse(JSON.stringify(piedata));
  // "piedataSmallTemp" will derive data from piedata but 
  // be filtered to only contain information for candidates
  // who are a top choice for less than 2% of voters
  piedataSmallTemp = [];
  // "small_primary_sum" is the sum of top choice percentages
  // for all candidates who are a top choice for less than
  // 2% of voters. This sum is used to create an "Other"
  // category when data for candidates who are a top choice
  // for 2% or more of voters is visualized 
  var small_primary_sum = 0;
  for(var i=0;i<piedataLarge.length;i++){
    // If the candidate is a top choice for less than 2% of 
    // candidates perform the following
    if(piedataLarge[i].primary<=1){
      // Add the top choice percentage for the candidate to
      // small_primary_sum
      small_primary_sum = small_primary_sum + piedataLarge[i].primary;
      if(piedataLarge[i].img!=undefined){
        // "pieimagesSmall" is an array of objects containing
        // information about the names of candidates who are
        // a top choice for less than 2% of candidates 
        // as well as links to corresponding images
        pieimagesSmall.push({
          name:piedataLarge[i].name,
          img:piedataLarge[i].img
        });
        // Add information for a candidate to piedataSmallTemp
        // if the candidate is a top choice for less than 2%
        // of voters
        piedataSmallTemp.push(piedataLarge[i]);
      }
      // Since piedataLarge contains data for only candidates
      // who are a top choice for 2% or more of voters, 
      // remove the current data entry from piedataLarge
      piedataLarge.splice(i,1);
      i = i-1;
    }
    else{
    }
  }
  // Add an "Other" category to piedataLarge summarizing
  // information about candidates who are a top choice for
  // less than 2% of voters
  piedataLarge.push({
    name:"Other",
    // According to the raw data, 2% of voters prefer 
    // "Someone else" not listed in the array of candidates
    // Add 2% to the "Other Category" to reflect this 
    // additional category
    primary:small_primary_sum+2,
    img:null
  })
  // In the corresponding visualization, when the "Other"
  // category is clicked by the user, images of all 
  // candidates corresponding to this category are displayed.
  // The user can then click on one of these images to 
  // display the top choice percentage for the associated
  // candidate within the "Other" category. In order to 
  // execute this component of the visualization, separate
  // objects are created to reflect all possible states of
  // the visualization. Each object contains data for 
  // the candidates who are a top choice for 2% or more of 
  // voters, as well as data for one of the candidates in the
  // 'Other' category. In this way, when the user clicks on
  // one of the images associated with the 'Other' category,
  // the relevant data object is used to display the correct
  // state of the d3 visualization (with each state showing
  // information for candidates who are a top choice for 2% 
  // or more of voters, the 'Other' category, and the 
  // candidate from the 'Other' category that the user
  // selected)
  // piedataSmallTemp is an object of all these data objects
  for(var i=0;i<piedataSmallTemp.length;i++){
    // adj_data is one of the data objects for a state of the
    // d3 visualization corresponding to one of the candidates
    // in the 'Other' category
    // Initialize adj_data to be a copy of piedataLarge
    var adj_data = JSON.parse(JSON.stringify(piedataLarge));
    // Add data to adj_data corresponding to one of the 
    // candidates in the 'Other' category
    adj_data.push(piedataSmallTemp[i]);
    for(var j=0;j<adj_data.length;j++){
      if(adj_data[j].name=='Other'){
        // In the original state of the visualization, the
        // 'Other' category displays the total top choice
        // percentage for candidates who are a top choice for
        // less than 2% of voters. However, when the user
        // clicks a candidate from the 'Other' category, both
        // data for the 'Other' category as well as data for
        // the selected candidate are displayed. Therefore
        // the top choice percentage for the candidate must
        // be subtracted from the top choice percentage of
        // the 'Other' category so that the sum of the two
        // is equal to the total top choice percentage for
        // the 'Other' category in the original state of the
        // visualization. 
        adj_data[j].primary -= piedataSmallTemp[i].primary;
      }
    }
    // Add adj_data to piedataSmall as a value, with key
    // being the name of the corresponding candidate from
    // the 'Other' category
    piedataSmall[piedataSmallTemp[i].name] = adj_data;
  }
}

// Variables for "Favorability Percentages" section (with
// visualization subsequently denoted "Rank")
// Data derived from pierankdata regarding the favorability 
// of each candidate
var rankdata;

// Functions for "Favorability Percentages" section
/**
 * Function to convert each row of the 'ranks.csv' file into 
 * an object with the specified properties
 *  @param data Raw data from 'ranks.csv'
 *  @param color d3 color scale
 */
function transformRankData(data,color){
  return data.map(function(row) {
      // Percentage of voters who have an unfavorable
      // impression of the candidate
      var d_unfavorable = parseInt(row.Unfavorability.replace('%',''));
      // Percentage of voters who have no impression of the 
      // candidate
      var d_none = 100-(parseInt(row.Favorability.replace('%',''))+parseInt(row.Unfavorability.replace('%','')));
      // Percentage of voters who have a favorable impression
      // of the candidate
      var d_favorable = parseInt(row.Favorability.replace('%',''));
      // Left-most x position of the stacked bars in the row 
      // corresponding to the candidate in the diverging
      // stacked bar chart
      var d_x0 = -1*(d_none/2+d_unfavorable);
      /**
       * Function to determine what data to return depending
       * on the input name
       *  @param name String name of the desired data to
       *              return
       */
      function which_rank(name){
        if(name=='Unfavorable'){
          return d_unfavorable;
        }
        else if(name=='None'){
          return d_none;
        }
        else if(name=='Favorable'){
          return d_favorable;
        }
      }
      return {
        // Name of the candidate
        name: row.Name,
        // Percentage unfavorability of the candidate
        Unfavorable: d_unfavorable,
        // Percentage favorability of the candidate
        Favorable: d_favorable,
        // Percentage no impression of the candidate
        None: d_none,
        // Left-most x position of the stacked bars
        // associated with the candidate
        x0: d_x0,
        // Information about the location, length, and 
        // data of the associated bar
        boxes: color.domain().map(function(name){
          return {
            // Name of the color from d3 color scale
            rank:name,
            // Name of the candidate
            name:row.Name,
            // Left-most x position of the associated bar
            x0:d_x0,
            // Right-most x position of the associated bar
            x1:d_x0+=which_rank(name),
            // Sum total for all associated bars
            N:100,
            // Length of associated bar
            n:which_rank(name)
          }
        })
      }
  })
}
/**
 * Function to modify the rankdata array containing 
 * favorability percentages for candidates to be used in the
 * corresponding d3 visualization 
 */
function getRankData(){
  for(var i=0;i<rankdata.length;i++){
    // If rankdata contains information for a candidate 
    // whose name is not in names_obj, remove the
    // corresponding data entry from rankdata
    if(!Object.keys(names_obj).includes(rankdata[i].name)){
      rankdata.splice(i,1);
      i = i-1;
    }
    // Add the link to the corresponding image for a
    // candidate to rankdata using data from names_obj
    else{
      rankdata[i].img = names_obj[rankdata[i].name];
    }
  }
}

// Variables for "State Ties" section (with visualization
// subsequently denoted "Map")
// Data regarding the electoral college results by state 
// for the presidential election in 2016
var mapdata;
// GeoJSON data for the US states
var us;
// Store features from GeoJSON data in the variable 
// "map_features"
var map_features;
// Object in which keys are integers corresponding to each
// state. The values are in turn objects in which the keys 
// are abbreviations for each state (as RegEx expressions)
// and the values are the names of each state
var state_names = {};
// Array of objects, each containing information about the
// name of a candidate, a link to a corresponding image of
// the candidate, the state in which the candidate was born,
// the state in which the candidate had significant work 
// experience, as well as additional information about the 
// position and size of images of the candidates to display
// on the US map
var map_obj = [];
// Array derived from map_obj but filtered to contain only
// information about the states in which candidates were 
// born
var map_obj_born = [];
// Array derived from map_obj but filtered to contain only
// information about the states in which candidates had
// significant work experience
var map_obj_role = [];
// Array of names of candidates that have been selected by 
// the user for display
var map_icons_selected = [];
// Array derived from map_obj_born but filtered to contain 
// only information about candidates whose names are included
// in map_icons_selected
var map_obj_born_temp;
// Array derived from map_obj_role but filtered to contain
// only information about candidates whose names are included
// in map_icons_selected
var map_obj_role_temp;
// Tooltip for the US States of the "Map" Visualization
var tooltipMapStates = d3.select("#vis").append("div")
  .style("position","absolute")
  .style("z-index","10")
  // The div is set by default to be hidden
  .style("visibility","hidden")
  .style("color","black")
  .style("padding","8px")
  .style("background-color","white")
  .style("border-radius","6px")
  .style("font","12px sans-serif")
  .text("tooltip");
// Tooltip for the Images of the "Map" Visualization
var tooltipMapImages = d3.select("#vis").append("div")
  .style("position","absolute")
  .style("z-index","10")
  // The div is set by default to be hidden
  .style("visibility","hidden")
  .style("color","white")
  .style("padding","8px")
  .style("background-color","black")
  .style("border-radius","6px")
  .style("font","12px sans-serif")
  .text("tooltip");

// Functions for "State Ties" section
/**
 * Function to convert each row of the 
 * '1976-2016-president.csv' file into an object with the
 * specified properties
 *  @param data Raw data from '1976-2016-president.csv'
 */
function transformMapData(data){
  return data.map(function(row) {
      return {
          // Year 
          year: row.year,
          // State
          state: row.state,
          // State Abbreviation
          state_po: row.state_po,
          // Electoral college result for state (i.e. 
          // Democrat or Republican)
          party: row.party,
          // How many votes a candidate received
          candidatevotes: row.candidatevotes,
          // How many votes total received by the state
          totalvotes: row.totalvotes
      }
  })
}
/**
 * Function to calculate the center of a polygon given an 
 * array of coordinates of the corners
 *  @param coord_arr_orig Coordinates from GeoJSON data
 */
function center_polygon(coord_arr_orig){
  // Set "coord_arr" to the array of coordinates of the
  // polygon, which are identified differently in
  // coord_arr_orig depending on whether the GeoJSON data is
  // of a Polygon or Multipolyon
  // Note for simplicity that if the GeoJSON data is of a 
  // Multipolygon, the center coordinates returned by this
  // function are of the first polygon in the many polygons
  // that comprise the Multipolygon
  var coord_arr;
  if(coord_arr_orig.length==1){
    coord_arr = coord_arr_orig[0];
  }
  else{
    coord_arr = coord_arr_orig[0][0];
  }
  // Minimum x extent of the polygon
  var min_x = null;
  // Minimum y extent of the polygon
  var min_y = null;
  // Maximum x extent of the polygon
  var max_x = null;
  // Maximum y extent of the polygon
  var max_y = null;
  // Center x coordinate of the polygon
  var center_x = null;
  // Center y coordinate of the polygon
  var center_y = null;
  for(var i=0;i<coord_arr.length;i++){
    // If min_x is null, set the minimum and maximum x and
    // y coordinates of the polygon temporarily to the 
    // first coordinates of coord_arr. Subsequently check
    // all of the other coordinates in coord_arr and change
    // min_x, max_x, min_y, and max_y to the correct minimum
    // and maximum values
    if(min_x==null){
        min_x = coord_arr[i][0];
        max_x = coord_arr[i][0];
        min_y = coord_arr[i][1];
        max_y = coord_arr[i][1];
    }
    // Set the minimum x coordinate
    if(coord_arr[i][0]<min_x){
      min_x = coord_arr[i][0];
    }
    // Set the maximum x coordinate
    else if(coord_arr[i][0]>max_x){
      max_x = coord_arr[i][0];
    }
    // Set the minimum y coordinate
    if(coord_arr[i][1]<min_y){
      min_y = coord_arr[i][1];
    }
    // Set the maximum y coordinate
    else if(coord_arr[i][1]>max_y){
      max_y = coord_arr[i][1];
    }
  }
  // Calculate the center x coordinate of the polygon 
  // depending on the minimum and maximum x coordinates
  center_x = min_x + ((max_x-min_x)/2);
  // Calculate the center y coordinate of the polygon 
  // depending on the minimum and maximum y coordinates
  center_y = min_y + ((max_y-min_y)/2);
  return [center_x,center_y];
}
/**
 * Function to modify the mapdata array containing 
 * electoral college results for states to be used in 
 * the corresponding d3 visualization 
 */
function getMapFeatures(){
  for(var i=0;i<mapdata.length;i++){
    // State
    var csvState = null;
    // Electoral college result for state (i.e. Democrat or 
    // Republican)
    var csvParty = null;
    // Year
    var csvYear = null;
    // Total votes received by state
    var csvTotalVotes = null;
    // Total Democratic votes received by state
    var csvDemVotes = null;
    // Total Republican votes received by state
    var csvRepVotes = null;
    // If the data does not correspond to the Democrat or 
    // Republican parties, or does not belong to the year
    // 2016, remove the data entry from mapdata
    if((mapdata[i].party!='democrat'&&mapdata[i].party!='republican')||mapdata[i].year!='2016'){
      mapdata.splice(i,1);
      i = i-1;
    }
    else{
      // Set the variables to their relevant values from the
      // current data entry
      csvState = mapdata[i].state;
      csvParty = mapdata[i].party;
      csvYear = mapdata[i].year;
      csvTotalVotes = mapdata[i].totalvotes;
      // State abbreviation
      // Replace the state abbreviation (ex. N.Y.) with a 
      // corresponding RegEx expression for use by a 
      // subsequent function
      csvState_Po = mapdata[i].state_po.replace(/(.{1})/g,'$1\\.');
      // Set the csvDemVotes or csvRepVotes variables to the
      // value associated with the candidatevotes key 
      // depending on the party associated with the data
      // entry
      if(csvParty=='democrat'){
        csvDemVotes = mapdata[i].candidatevotes;
      }
      else if(csvParty=='republican'){
        csvRepVotes = mapdata[i].candidatevotes;
      }
      // In order to display the data in d3, add the data
      // to the map_features GeoJSON coordinate data used
      // to draw the states on the US map of the visualization
      for(var j=0;j<map_features.length;j++){
        var jsonState = map_features[j].properties.name
        // If the current state of map_features is equal to
        // the current state of mapdata, add the data to the
        // current data entry of map_features
        if(csvState == jsonState){
          map_features[j].properties.year = csvYear;
          map_features[j].properties.state_po = csvState_Po;
          map_features[j].properties.TotalVotes = csvTotalVotes;
          if(csvDemVotes){
            // If 'DemVotes' is not a key, initialize the 
            // value of the DemVotes key to csvDemVotes.
            // Otherwise, add the value of csvDemVotes to the
            // current value associated with the DemVotes key
            if(!Object.keys(map_features[j].properties).includes('DemVotes')){
              map_features[j].properties.DemVotes = csvDemVotes;
            }
            else{
              map_features[j].properties.DemVotes = parseInt(map_features[j].properties.DemVotes)+parseInt(csvDemVotes);
            }
          }
          // Repeat the procedure for 'RepVotes'
          else if(csvRepVotes){
            if(!Object.keys(map_features[j].properties).includes('RepVotes')){
              map_features[j].properties.RepVotes = csvRepVotes;
            }
            else{
              map_features[j].properties.RepVotes = parseInt(map_features[j].properties.RepVotes)+parseInt(csvRepVotes);
            }
          }
        }
      }
    }
  }
  for(var j=0;j<map_features.length;j++){
    // If there are more votes for the democratic party than
    // the Republican party for a state, set the color of
    // the state to blue. Otherwise, set it to red.
    if(Object.keys(map_features[j].properties).includes('DemVotes')){
      if(parseInt(map_features[j].properties.DemVotes) > parseInt(map_features[j].properties.RepVotes)){
        map_features[j].properties.color = '#3377FF';
      }
      else{
        map_features[j].properties.color = 'FF4633';
      }
    }
    // Calculate the center coordinates of a state using the
    // center_polygon function
    var center_coord = center_polygon(map_features[j].geometry.coordinates);
    // Add the center coordinate data to map_features
    map_features[j].properties.center_x = center_coord[0];
    map_features[j].properties.center_y = center_coord[1];
  }
}
/**
 * Function to find the state a candidate is born in and the
 * state a candidate had significant work experience in
 *  @param name Name of the candidate
 *  @param state_obj Object in which keys are abbreviations
 *                   for a state (as RegEx expressions) and
 *                   values are the name of the state
 */
function find_states(name,state_obj){
  // state_born stores the name of the state in which the 
  // candidate was born
  var state_born;
  // state_role is a set that stores the name of states 
  // in which the candidate had significant work experience
  var state_role = new Set();
  /**
   * Helper function to test RegEx expressions for state
   * abbreviations and RegEx expressions for state names
   * against the text content associated with a candidate
   *  @param state_name String name of a state or RegEx
   *                    expression for a state abbreviation
   */
  function find_states_helper(state_name){
    // RegEx expression
    var regex_obj;
    // Result of testing the RegEx expression against text
    // content
    var regex_test;
    // Create a RegEx expression using the name of the state
    regex_obj = new RegExp(state_name);
    // Test the RegEx expression against the text content
    // associated with the 'Born' key for a candidate
    regex_test = regex_obj.test(candidates[name]['Born']);
    // If there is a match, store the name of the state in
    // the state_born variable
    if(regex_test){
        state_born = Object.values(state_obj)[0];
    }
    // Test the RegEx expression against the text content
    // associated with the 'Current position' key for a 
    // candidate
    regex_test = regex_obj.test(candidates[name]['Current position']);
    // If there is a match, add the name of the state to the
    // state_role set
    if(regex_test){
      state_role.add(Object.values(state_obj)[0]);
      return;
    }
    // Test the RegEx expression against the text content
    // associated with the 'Previous roles' key for a 
    // candidate
    regex_test = regex_obj.test(candidates[name]['Previous roles']);
    // If there is a match, add the name of the state to the
    // state_role set
    if(regex_test){
        state_role.add(Object.values(state_obj)[0]);
      return;
    }
    return;
  }
  // Execute the find_states_helper function using the state
  // abbreviation RegEx expression as input
  find_states_helper(Object.keys(state_obj)[0]);
  // Execute the find_states_helper function using the name
  // of the state as input
  find_states_helper(Object.values(state_obj)[0]);
  // Due to the text formatting used in the website from which
  // the data was derived, additional RegEx expressions must
  // be tested to ensure that data for all candidates is 
  // read in correctly 
  if(Object.values(state_obj)[0]=='Pennsylvania'){
    find_states_helper('Pa\\.');
  }
  else if(Object.values(state_obj)[0]=='Massachusetts'){
    find_states_helper('Mass\\.');
  }
  else if(Object.values(state_obj)[0]=='California'){
    find_states_helper('Oakland');
  }
  else if(Object.values(state_obj)[0]=='Florida'){
    find_states_helper('Fla\\.');
  }
  else if(Object.values(state_obj)[0]=='Texas'){
    find_states_helper('Houston');
    find_states_helper('San Antonio');
  }
  // Return an array in which the first element is the name
  // of the state in which the candidate was born and the
  // second element is the first element of the set of 
  // states in which the candidate had significant work
  // experience
  return [state_born,Array.from(state_role)[0]];
}
/**
 * For the "Map" Visualization, images of candidates are
 * placed on the US map to indicate where candidates were
 * born and where they had significant work experience. This
 * function determines the coordinates for the images of 
 * candidates within each state
 */
function getMapObj(){
  for(var i=0;i<map_features.length;i++){
    // "state_name_key" is the state abbreviation
    var state_name_key = map_features[i].properties.state_po;
    if(state_name_key==undefined){
      state_name_key = null;
    }
    // "state_name_value" is the name of the state
    var state_name_value = map_features[i].properties.name;
    // state_names is an object in which keys are integers 
    // corresponding to each state. The values are objects in
    // which the keys are abbreviations for each state 
    // (as RegEx expressions) and the values are the names of 
    // each state
    state_names[i.toString()] = {
      [state_name_key]: state_name_value
    }
  }
  for(var i=0;i<names.length;i++){
    // Name of the candidate
    var name = names[i];
    // Array of states in which the candidate was born
    var state_born = [];
    // Array of states in which the candidate had significant
    // work experience
    var state_role = [];
    // Center coordinates of the state in which the candidate
    // was born
    var state_born_center = [];
    // Center coordinates of the state in which the candidate
    // had significant work experience
    var state_role_center = [];
    // In order to ensure that images for different candidates
    // who are displayed in the same state do not overlap,
    // a random coordinate is calculated to be the position
    // for each candidate. This random coordinate is based
    // on the center coordiantes for the state and a random
    // corner of the polygon defining the shape of the state
    // "rand_coords_born" are the coordinates of the random
    // corner of the polygon for the state in which the 
    // candidate was born
    var rand_coords_born = [];
    // "rand_coords_role" are the coordinates of the random
    // corner of the polygon for the state in which the 
    // candidate had significant work experience
    var rand_coords_role = [];
    // "state_born_coords" is the "random" coordinate 
    // assigned as the position of an image of a candidate
    // for the state in which the candidate was born, based
    // on the center coordinates of the state and the random
    // corner of the polygon defining the shape of the state
    var state_born_coords = [];
    // "state_role_coords" is the "random" coordinate
    // assigned as the position of an image of a candidate
    // for the state in which the candidate had significant
    // work experience, based on the center coordinates of
    // the state and the random corner of the polygon defining
    // the shape of the state
    var state_role_coords = [];
    for(var j=0;j<map_features.length;j++){
      // Use the find_states function to find the name of
      // the state in which the candidate was born and the
      // name of the state in which the candidate had 
      // significant work experience
      var check_state = find_states(name,state_names[j]);
      if(check_state[0]!=undefined){
        state_born.push(check_state[0]);
      }
      if(check_state[1]!=undefined){
        state_role.push(check_state[1]);
      }
    }
    for(var k=0;k<map_features.length;k++){
      // "coord_arr" are the coordinates from the GeoJSON
      // data defining the shape of the polygon
      var coord_arr;
      // "rand_num" is a random index into the array of
      // coordinates stored in "coord_arr"
      var rand_num;
      // The coordinates from the GeoJSON data are identified
      // in map_features differently depending on whether
      // the shape is a polygon or Multipolygon
      // Note for simplicity that if the shape is a
      // Multipolygon, the coordinates correspond to the first
      // polygon in the group of polygons constituting the
      // Multipolygon
      if(map_features[k].geometry.coordinates.length==1){
        coord_arr = map_features[k].geometry.coordinates[0];
      }
      else{
        coord_arr = map_features[k].geometry.coordinates[0][0];
      }
      // Find a random number corresponding to an index into
      // coord_arr
      rand_num = rand_in_range(0,coord_arr.length);
      // Add the center coordinates of the state and 
      // coordinates for a random corner of the polygon 
      // defining the state to the relevant state's data entry 
      // in map_features. Perform this action for both the
      // state in which the candidate was born and the state
      // in which the candidate had significant work 
      // experience. Note for simplicity that only the first
      // element in the array "state_born" and first element
      // in the array "state_role" are assigned to each
      // candidate (other elements are ignored)
      if(map_features[k].properties.name==state_born[0]){
        state_born_center.push(map_features[k].properties.center_x);
        state_born_center.push(map_features[k].properties.center_y);
        rand_coords_born.push(coord_arr[rand_num]);
        rand_coords_born = rand_coords_born[0];
      }
      if(map_features[k].properties.name==state_role[0]){
        state_role_center.push(map_features[k].properties.center_x);
        state_role_center.push(map_features[k].properties.center_y);
        rand_coords_role.push(coord_arr[rand_num]);
        rand_coords_role = rand_coords_role[0];
      }
    }
    // The actual coordinates for the image of a candidate
    // on the US state map are the average of the center
    // coordiantes for the state and the coordinates for a 
    // corner of a random polygon defining the state
    if(state_born_center.length!=0){
      state_born_coords = [(state_born_center[0]+rand_coords_born[0])/2,(state_born_center[1]+rand_coords_born[1])/2];
    }
    if(state_role_center.length!=0){
      state_role_coords = [(state_role_center[0]+rand_coords_role[0])/2,(state_role_center[1]+rand_coords_role[1])/2];
    }
    // Add a new object to map_obj specifying the position of
    // a candidate's image for the state in which the
    // candidate was born and the state in which the 
    // candidate had significant work experience
    map_obj.push({
      // Name of the candidate
      "name":name,
      // Link to an image of the candidate
      "img":names_obj[name],
      // X-coordinate offset for the image
      "loc_x":10,
      // Y-coordinate offset for the image
      "loc_y":10,
      // Size of the image 
      "size":20,
      // State in which the candidate was born
      "state_born":state_born[0],
      // State in which the candidate had significant work
      // experience
      "state_role":state_role[0],
      // Center coordinates of the state in which the 
      // candidate was born
      "state_born_center":state_born_center,
      // Center coordinates for the state in wnich the
      // candidate had significant work experience
      "state_role_center":state_role_center,
      // Coordinates for a random corner of the polygon
      // defining the state in which the candidate was born
      "rand_coords_born":rand_coords_born,
      // Coordinates for a random corner of the polygon 
      // defining the state in which the candidate had 
      // significant work experience
      "rand_coords_role":rand_coords_role,
      // Actual coordinates for the position of the image of
      // a candidate on the state in which the candidate
      // was born
      "state_born_coords":state_born_coords,
      // Actual coordinates for the position of the image of
      // a candidate on the state in which the candidate
      // had significant work experience
      "state_role_coords":state_role_coords
    });
  }
  for(var i=0;i<map_obj.length;i++){
    // map_obj_born contains data derived from map_obj, but
    // filtered to contain only data for states in which the
    // candidates were born 
    if(map_obj[i].state_born_center.length != 0){
      map_obj_born.push(map_obj[i]);
    }
    // map_obj_role contains data derived from map_obj, but
    // filtered to contain only data for states in which the
    // candidates had significant work experience
    if(map_obj[i].state_role_center.length != 0){
      map_obj_role.push(map_obj[i]);
    }
  }
}
/**
 * This function adjusts data in global variables 
 * map_obj_born_temp or map_obj_role_temp to include data 
 * only for candidates who have been selected by the user 
 * (the names of which are stored in the global variable 
 * map_icons_selected)
 *  @param flag Integer indicates which "mode" the "Map"
 *              Visualization is in, either "0" to display
 *              data for states in which candidates were 
 *              born or "1" to display data for states in
 *              which candidates had significant work
 *              experience
 */
function adj_map_obj(flag){
  if(flag==0){
    // Initialize map_obj_born_temp to be a copy of 
    // map_obj_born
    map_obj_born_temp = map_obj_born.slice();
    for(var i=0;i<map_obj_born_temp.length;i++){
      // If map_icons_selected does not include a name in
      // map_obj_born_temp, delete the corresponding data
      // entry from map_obj_born_temp
      if(!map_icons_selected.includes(map_obj_born_temp[i].name)){
        map_obj_born_temp.splice(i,1);
        i = i-1;
      }
    }
  }
  // Repeat the same procedure for map_obj_role_temp if 
  // flag is equal to 1
  else if(flag==1){
    map_obj_role_temp = map_obj_role.slice();
    for(var i=0;i<map_obj_role_temp.length;i++){
      if(!map_icons_selected.includes(map_obj_role_temp[i].name)){
        map_obj_role_temp.splice(i,1);
        i = i-1;
      }
    }
  }
}

// Variables for "Background/Experience" section (with
// visualization subsequently denoted "Tree")
// d3 selection of all the groups corresponding to nodes for
// the force layout
var nodeEnter;
// Unique integer identifer for each link in the force layout
var experience_links_id = 0;
// Create a series of objects containing RegEx expressions
// for the categories corresponding to experience
// RegEx expressions for the "military" category 
var military = {patterns:['navy','army','marine'].map(x => new RegExp(x))};
// RegEx expressions for the "legal" category
var legal = {patterns:['prosecutor','lawyer','attorney'].map(x => new RegExp(x))};
// RegEx expressions for the "entrepreneurial" category
var entrepreneurial = {patterns:['co-found','ceo','chair','founder','vp','chairman','director'].map(x => new RegExp(x))};
// RegEx expressions for the "political" category
var political = {patterns:['mayor','city','legislature','house','representative','senate','senator','congress','governor','secretary'].map(x => new RegExp(x))};
// Object containing the RegEx expressions for the
// "military", "legal", "entrepreneurial", and "political"
// categories. 
var experience = {legal,entrepreneurial,political,military};
// Keys for the experience_keys object
var experience_keys = Object.keys(experience);
// Instantiate object to contain array of nodes for the force
// layout, array of links for the force layout, and dictionary
// in which keys are the categories corresponding to
// experience and the values are the names of candidates 
// with a background in those categories 
var experience_obj = {
  "nodes":[],
  "links":[],
  "dict":{}
}
// Initial fixed Locations for the "legal" category node,
// "entrepreneurial" category node, "political" category node, 
// and "military" category node om the force layout
var tree_nodes_locs = {
  "legal":[0,0],
  "entrepreneurial":[0,h],
  "political":[w*0.8,h*0.45],
  "military":[w,h]
}
// Tooltip for the "Tree" Visualization
var tooltipTree = d3.select("#vis").append("div")
  .style("position","absolute")
  .style("z-index","10")
  // The div is set by default to be hidden
  .style("visibility","hidden")
  .style("color","white")
  .style("padding","8px")
  .style("background-color","rgba(0,0,0,0.75)")
  .style("border-radius","6px")
  .style("font","12px sans-serif")
  .text("tooltip");
// Max node size for the force layout
var maxNodeSize = 50;

// Functions for the "Background/Experience" section
/**
 * Associates every experience category with a specific color
 * to be displayed in the visualization (as the color of 
 * links connected to the experience category node)
 *  @param experience_icon Current experience category (one
 *                         of the keys of experience_obj.dict)
 */
function experience_colors(experience_icon){
  // Color for military node
  if(experience_icon == 'military'){
      return '#FF4633';
  }
  // Color for legal node
  else if(experience_icon == 'legal'){
      return '#FFBE33';
  }
  // Color for entrepreneurial node
  else if(experience_icon == 'entrepreneurial'){
      return '#10CDA3';
  }
  // Color for political node
  else if(experience_icon == 'political'){
      return '#3377FF';
  }
}
/**
 * experience_obj.dict contains keys corresponding to 
 * experience categories and values corresponding to arrays
 * of names of candidates who have experience in those 
 * categories. This function creates a link between every 
 * experience category node and candidate node according to 
 * the arrays defined in experience_obj.dict
 */
function experience_links(){
  // Keys of experience_obj.dict (corresponding to names
  // of experience categories)
  experience_dict_keys = Object.keys(experience_obj.dict);
  for(i=0;i<experience_dict_keys.length;i++){
      // experience_dict_icon holds the current experience
      // category
      var experience_dict_icon = experience_dict_keys[i];
      // For the set in experience_obj.dict correspnding to
      // the current experience category, convert it into an
      // array
      var experience_dict_set = Array.from(experience_obj.dict[experience_dict_icon]);
      // For every candidate name in experience_dict_set 
      // perform the following
      for(j=0;j<experience_dict_set.length;j++){
          // Add a new object to the links array of 
          // experience_obj using the unique integer 
          // identifier experience_links_id as the id, the
          // source as the experience category node and the
          // target as the candidate node, with color defined
          // using experience_colors, and opacity set by 
          // default to 1.0
          experience_obj.links.push({
              "id":"link"+experience_links_id.toString(),
              "source":experience_dict_icon,
              "target":experience_dict_set[j],
              "color":experience_colors(experience_dict_icon),
              "opacity":1.0
          })
          // Increment the unique integer identifier 
          // experience_links_id by 1 so that every link 
          // has a unique id
          experience_links_id = experience_links_id + 1;
      }
  }
}
/**
 * Links exist between experience category nodes and all 
 * nodes for candidates who have experience in those
 * categories. This function takes as input the name of an
 * experience category (icon_name) and identifies all the
 * links connected to the corresponding experience category
 * node
 *  @param icon_name One of the experience categories
 */
function experience_links_icon(icon_name){
  // Instantiate array to contain ID numbers of links 
  // connected to the node for icon_name
  var index_arr = [];
  for(i=0;i<experience_obj.links.length;i++){
      // Add the ID number of a link to index_arr if the 
      // source of the links is icon_name
      if(experience_obj.links[i]["source"].id == icon_name){
          index_arr.push(experience_obj.links[i].id);
      }
  }
  return index_arr;
}
/**
 * Links exist between experience category nodes and all 
 * nodes for candidates who have experience in those
 * categories. This function takes as input the name of 
 * a candidate (cand_name) and identifies all the links 
 * links connected to the corresponding candidate node
 *  @param cand_name One of the candidates
 */
function experience_links_cand(cand_name){
  // Instantiate array to contain ID numbers of links 
  // connected to the node for icon_name
  var index_arr = [];
  for(i=0;i<experience_obj.links.length;i++){
      // Add the ID number of a link to index_arr if the 
      // source of the links is cand_name
      if(experience_obj.links[i]["target"].id == cand_name){
          index_arr.push(experience_obj.links[i].id);
      }
  }
  return index_arr;
}
/**
 * Used in the tick() function called during every iteration
 * of the force simulation to update the position of nodes
 *  @param d d3 current data element
 */
function nodeTransform(d){
  d.x = Math.max(maxNodeSize,Math.min(w-(d.imgwidth/2 || 16),d.x));
  d.y = Math.max(maxNodeSize,Math.min(h-(d.imgheight/2 || 16),d.y));
  return "translate("+d.x+","+d.y+")";
}

// Variables for "Stances on Critical Issues" section (with
// visualization subsequently denoted "Zoom")
// Create a series of objects containing RegEx expressions
// and corresponding images for the categories corresponding 
// to critical issues
// Object in which the key is "patterns" and the values are
// RegEx expressions for the "education" category
var education = {patterns:['college','education','debt','pre-k','teacher'].map(x => new RegExp(x))};
// Add a key to the "education" object in which the value is
// a link to a corresponding image
education.image = "issues/education.png";
// Object in which the key is "patterns" and the values are
// RegEx expressions for the "environment" category
var environment = {patterns:['climate','carbon','renewable','energy','green new deal','public lands'].map(x => new RegExp(x))};
// Add a key to the "environment" object in which the value is
// a link to a corresponding image
environment.image = "issues/environment.png";
// Object in which the key is "patterns" and the values are
// RegEx expressions for the "economy" category
var economy = {patterns:['capitalism','economy','jobs','tax','minimum wage','income','credit','bonds','social security'].map(x => new RegExp(x))};
// Add a key to the "economy" object in which the value is
// a link to a corresponding image
economy.image = "issues/economy.png";
// Object in which the key is "patterns" and the values are
// RegEx expressions for the "gun_control" category
var gun_control = {patterns:['gun'].map(x => new RegExp(x))};
// Add a key to the "gun_control" object in which the value is
// a link to a corresponding image
gun_control.image = "issues/gun_control.png";
// Object in which the key is "patterns" and the values are
// RegEx expressions for the "health_care" category
var health_care = {patterns:['health care','medicare'].map(x => new RegExp(x))};
// Add a key to the "health_care" object in which the value is
// a link to a corresponding image
health_care.image = "issues/health_care.png";
// Object in which the key is "patterns" and the values are
// RegEx expressions for the "immigration" category
var immigration = {patterns:['immigration'].map(x => new RegExp(x))};
// Add a key to the "immigration" object in which the value is
// a link to a corresponding image
immigration.image = "issues/immigration.png";
// Object in which the key is "patterns" and the values are
// RegEx expressions for the "abortion" category
var abortion = {patterns:['abortion'].map(x => new RegExp(x))};
// Add a key to the "immigration" object in which the value is
// a link to a corresponding image
abortion.image = "issues/abortion.png";
// Object in which the key is "patterns" and the values are
// RegEx expressions for the "justice" category
var justice = {patterns:['criminal','death penalty'].map(x => new RegExp(x))};
// Add a key to the "justice" object in which the value is
// a link to a corresponding image
justice.image = "issues/justice.png";
// Object in which the key is "patterns" and the values are
// RegEx expressions for the "drugs" category
var drugs = {patterns:['marijuana','drug','opioid'].map(x => new RegExp(x))};
// Add a key to the "drugs" object in which the value is
// a link to a corresponding image
drugs.image = "issues/drugs.png";
// Object in which the key is "patterns" and the values are
// RegEx expressions for the "technology" category
var technology = {patterns:['automation','big tech','social media','data'].map(x => new RegExp(x))};
// Add a key to the "technology" object in which the value is
// a link to a corresponding image
technology.image = "issues/technology.png";
// Object in which the key is "patterns" and the values are
// RegEx expressions for the "social_issues" category
var social_issues = {patterns:['sexual','sex','discrimination'].map(x => new RegExp(x))};
// Add a key to the "social_issues" object in which the value 
// is a link to a corresponding image
social_issues.image = "issues/social_issues.png";
// Object containing the RegEx expressions and corresponding
// images for all categories corresponding to critical issues
var issues = {education,environment,economy,gun_control,health_care,immigration,abortion,justice,drugs,technology,social_issues};
// Keys for the issues object
var issues_keys = Object.keys(issues);
// Nested object demonstrating hierarchy for circle packing
// layout. Contains information about critical issue
// categories, the candidates who have stances on these 
// critical issues, as well as descriptions of these stances
var issues_obj = {
  "name":"Candidates",
  "children":[
      {
          "name":"education",
          "img":"issues/education.png",
          "children":[]
      },
      {
          "name":"environment",
          "img":"issues/environment.png",
          "children":[]
      },
      {
          "name":"economy",
          "img":"issues/economy.png",
          "children":[]
      },
      {
          "name":"gun_control",
          "img":"issues/gun_control.png",
          "children":[]
      },
      {
          "name":"health_care",
          "img":"issues/health_care.png",
          "children":[]
      },
      {
          "name":"immigration",
          "img":"issues/immigration.png",
          "children":[]
      },
      {
          "name":"abortion",
          "img":"issues/abortion.png",
          "children":[]
      },
      {
          "name":"justice",
          "img":"issues/justice.png",
          "children":[]
      },
      {
          "name":"drugs",
          "img":"issues/drugs.png",
          "children":[]
      },
      {
          "name":"technology",
          "img":"issues/technology.png",
          "children":[]
      },
      {
          "name":"social_issues",
          "img":"issues/social_issues.png",
          "children":[]
      }
  ]
}
// The node in the "Zoom" visualization clicked by the user
// and currently being zoomed into
var zoomNode;
// Flag indicates whether the last, i.e. most focused, level
// of zoom is currently active, determining whether
// text is displayed corresponding to the candidate of the 
// node that is being zoomed into
var zoomFlag = 0;
// Flag indicates whether issues_obj contains information
// about a candidate for a specific critical issue category.
// If so, information is added to that candidate's 
// corresponding object in issues_obj. Otherwise, a new object
// corresponding to the candidate is made and added to 
// issues_obj
var issuesFlag = 0;
// Integer used to identify related circles, images, and text
// in the "Zoom" visualization. Each related circle, image,
// and text has an id prefixed by the element type (i.e. 
// image, circle, or text) and ending with this common integer
// identifier
var circle_text_id = 0;
// Radius of the layout for the "Zoom" visualization and grid 
// for the "Grid" Visualization
var r = 500;
// zoom_x and zoom_y are the modifiable domain and range, 
// respectively, used to zoom into nodes of the "Zoom" 
// Visualization. Initialize them here:
var zoom_x = d3.scaleLinear().range([0,r]);
var zoom_y = d3.scaleLinear().range([0,r]);

// Functions for "Stances on Critical Issues" section
/**
 * Function used by the "Zoom" Visualization to zoom into 
 * a node clicked by the user
 *  @param d d3 current data element
 */
function zoom(d){
  // Scale factor for the zoom
  var k = r / d.r / 2;
  // Change the x and y domains to display the zoom
  zoom_x.domain([d.x - d.r,d.x + d.r]);
  zoom_y.domain([d.y - d.r,d.y + d.r]);
  var t = vis.transition()
    .duration(d3.event.altKey ? 7500 : 750);
  // Modfiy the positions and sizes of all circles using the
  // new x and y domains, and scale factor, to account for
  // the zoom
  t.selectAll("circle.zoom")
    .attr("cx",function(d){
      return zoom_x(d.x);
    })
    .attr("cy",function(d){
      return zoom_y(d.y);
    })
    .attr("r",function(d){
      return k*d.r;
    })
  // Modfiy the positions and sizes of all text
  t.selectAll("text.zoom")
    .attr("x",function(d){
      return zoom_x(d.x);
    })
    .attr("y",function(d){
      return zoom_y(d.y);
    })
    // Text is only visible if the corresponding node is 
    // zoomed into 
    .style("opacity",function(d){
      return k*d.r > 20 ? 1 : 0;
    })
  // Adjust size of titles of nodes depending on level of 
  // zoom
  t.selectAll("tspan.zoomtext_head")
    .style("font-size",function(d){
      if(d.depth==2){
        return "22px";
      }
    })
    .attr("text-decoration",function(d){
      if(d.depth==2){
        return "underline";
      }
    })
  // Adjust size of text depending on level of zoom
  t.selectAll("tspan.zoomtext_body")
    .style("font-size",function(d){
      if(d.depth==2){
        return "16px";
      }
    })
  // Modify the positions and sizes of all images
  t.selectAll("image.zoom")
    .attr("transform",function(d){
      return "translate("+zoom_x(d.x)+","+zoom_y(d.y)+")";
    })
    .attr("x",function(d){
      return -d.r*k;
    })
    .attr("y",function(d){
      return -d.r*k;
    })
    .attr("height",function(d){
      return d.r*2*k;
    })
    .attr("width",function(d){
      return d.r*2*k;
    })
    // Images are only visible if the corresponding image is
    // zoomed into
    .style("opacity",function(d){
      return k*d.r > 20 ? 1 : 0;
    })
    zoomNode = d;
    d3.event.stopPropagation();
}

// Variables for "Key Criticisms" section (with visualization
// subsequently denoted "Grid")
// Array of objects, each containing information about the
// name of a candidate, a link to a corresponding image of
// the candidate, the number of criticisms, the name of each
// criticism, and a description of each criticism
var criticism_obj = [];
// Instantiate force layout
var force_grid = d3.forceSimulation();
// Define collision force to prevent elements from overlapping
var forceCollide_grid = d3.forceCollide(function(d){
  return d.r+1;
});
// The node in the "Grid" visualization clicked by the user,
// which subsequently moves to the center of the screen and
// enlarges to display information about the candidate 
// corresponding to the node
var focusedNode;

// Functions for "Key Criticisms" section
/**
 * Function to execute in the "Grid" Visualization when the
 * user clicks outside the grid of nodes. Returns all nodes
 * to their original size in the grid
 */
function grid_out_click(){
  // Target of the click
  var target = d3.event.target;
  // If the closest ancestor of the click was not the 
  // foreignObject associated with a node, perform the 
  // following
  if(!target.closest('#circle-overlay')&&focusedNode){
    // Remove the "fx" and "fy" properties of focusedNode
    // so that its position is no longer fixed to the center
    // of the grid
    focusedNode.fx = null;
    focusedNode.fy = null;
    // Restart the simulation to adjust the position of 
    // all nodes
    force_grid.alphaTarget(0.2).restart();
    d3.transition("grid_out_click")
      .duration(2000)
      .ease(d3.easePolyOut)
      // Define a tween to transition the size of 
      // focusedNode back to its original size in the grid
      .tween("moveOut",function(){
        var ir = d3.interpolateNumber(focusedNode.r,focusedNode.radius);
        return function(t){
          focusedNode.r = ir(t);
          force_grid.force('collide',forceCollide_grid);
        };
      })
      // At the end of the transition, focusedNode is
      // assigned to null since no node is in focus
      .on('end',function(){
        focusedNode = null;
        force_grid.alphaTarget(0);
      })
      .on('interrupt',function(){
        force_grid.alphaTarget(0);
      });
  // Hide all text in foreignObjects
  d3.selectAll('.circle-overlay').classed('hidden',true);
  // d3.selectAll('.node-icon').classed('node-icon-faded',false);
  // Set the opacity of all images to 1
  d3.selectAll('.node-icon')
      .transition("grid_out_click_icon_faded")
      .duration(0)
      .style('opacity',1);
  }
}

// Series of "update" functions used to initialize all 
// elements for each section's visualization
/**
 * Function to initialize all elements for the "Pie"
 * Visualization in the main SVG
 */
function update_pie(){
  // Function to modify the piedata array containing top
  // voter choice percentages for candidates 
  getPieData();
  // When the "Other" category is clicked on the pie chart,
  // a grid of images of the candidates corresponding to this
  // category are displayed in the center of the pie chart.
  // "numCols" and "numRows" determine the number of rows
  // and columns for this grid of images
  var numCols = 3;
  var numRows = 3;
  // "xPadding" and "yPadding" define x and y padding for 
  // the border of the grid of images
  var xPadding = 3;
  var yPadding = 3;
  // "hBuffer" and "wBuffer" define x and y buffer distance
  // respectively between images in the grid 
  var hBuffer = 25;
  var wBuffer = 25;
  // For the grid of images "imageOffsetSmallGroup" is the 
  // offset distance to translate the grid so that it is 
  // centered in the pie chart
  var imageOffsetSmallGroup = -40;
  // Size of images in the grid
  var imageSizeSmall = 25;
  // Radius for the pie chart
  var radius = Math.min(w,h)/2-70;
  // The pie chart is an annulus with inner radius equal to
  // 30% of the total radius of the chart
  var innerRadius = 0.3*radius;
  // Size of images in the center of the pie chart for 
  // candidates that do not belong to the 'Other' category
  var imageSizeLarge = 100;
  // Image offset distance to translate images of candidates
  // that do not belong to the 'Other' category
  var imageOffsetLarge = -50;
  // Distance from the outer circumference of the pie chart
  // that the labels for each arc should be positioned
  var textDistance = 10;
  // Append a group to contain all elements of the "Pie"
  // Visualization
  var pie_layer = g.append("g")
      .attr("id","pie_layer")
      // Set all elements in the group so that the opacity
      // is 0 and all elements cannot be clicked
      .style("opacity",0)
      .classed("no_click",true)
      // Translate the group so that the pie chart is centered
      .attr("transform","translate("+(w/2+10)+","+(h/2)+")");
  // d3 color scale to use for the pie chart
  var colorScale = d3.scaleSequential(d3.interpolateYlGnBu)
  // Minimum value for primary (top choice percentage per 
  // candidate) for all objects in piedataLarge
  var min_val = d3.min(piedataLarge,function(d){
    return d.primary;
  });
  // Maximum value for size (top choice percentage per 
  // candidate) for all objects in piedataLarge
  var max_val = d3.max(piedataLarge,function(d){
    return d.primary;
  });
  // Domain for the color scale is determined by min_val and
  // max_val
  colorScale.domain([min_val,max_val+25]);
  // Create a d3 pie chart where the value is set to the 
  // value of the top choice percentage for each candidate
  var pie = d3.pie()
    .sort(null)
    .value(function(d){
      return d.primary;
    });
  // Add images to the pie chart for each candidate that
  // does not belong to the 'Other' category
  var pie_images = pie_layer.selectAll("image.pie")
    .data(pie(piedataLarge))
    .enter()
    .append("image")
    .attr("id",function(d){
      return "pie_image_"+d.data.name.replace(/'/g, '');
    })
    .style("opacity",0)
    .attr("class","pie")
    .attr("xlink:href",function(d){
      return d.data.img;
    })
    // Positioning and size for the images
    .attr("x",function(d){
      return imageOffsetLarge;
    })
    .attr("y",function(d){
      return imageOffsetLarge;
    })
    .attr("height",function(d){
      return imageSizeLarge;
    })
    .attr("width",function(d){
      return imageSizeLarge;
    });
// Append a group for the grid of images of candidates that 
// belong to the 'Other' category
var iconsSmall = pie_layer.append("g")
  .attr("id","iconsSmallLayer")
  .attr('transform',function(d){
    return "translate("+imageOffsetSmallGroup+","+imageOffsetSmallGroup+")";
  })
// Add a group for each image in the grid of images
iconsSmallGroups = iconsSmall.selectAll("g.smallGroups")
  .data(pieimagesSmall)
  .enter()
  .append("g")
  .attr("class","smallGroups")
  .on("click",function(d){
    d3.event.stopPropagation();
    // If an image in the grid is clicked, call the 
    // switch_data function to adjust the visualization to
    // display data for the candidate corresponding to the
    // clicked image
    switch_data(piedataSmall[d.name]);
  })
  // When hovering over one of the images, reduce the opacity
  // to indicate it is clickable
  .on("mouseenter",function(d){
    d3.select(this).style("opacity",0.5);
  })
  // When the cursor leaves the image, return the opacity to
  // full opacity
  .on("mouseleave",function(d){
    d3.select(this).style("opacity",1);
  })
// Append an image to each group corresponding to the 
// candidate
iconsSmallGroups.append("image")
    .classed("smallGroups",true)
    .classed("no_click",true)
    .attr("xlink:href",function(d){
      return d.img;
    })
    .attr("x",function(d,i){
      // x coordinate is calculated using the index and 
      // other pre-defined properties of the grid of images,
      // and the value assigned to the loc_x property of d
      var remainder = i % numCols;
      return d.loc_x = xPadding+(remainder*wBuffer);
    })
    .attr("y",function(d,i){
      // y coordinate is calculated using the index and 
      // other pre-defined properties of the grid of images,
      // and the value assigned to the loc_y property of d
      var whole = Math.floor(i/numCols);
      return d.loc_y = yPadding+(whole*hBuffer);
    })
    // Size of images
    .attr("height",function(d){
      return imageSizeSmall;
    })
    .attr("width",function(d){
      return imageSizeSmall;
    })
    .style("opacity",0);
// Append a marker defs for the shape of a circle to attach
// to the end of a line connecting a label with its 
// corresponding arc
g.append("defs").append("marker")
  .attr("id","rank_label_circ")
  .attr("markerWidth",6)
  .attr("markerHeight",6)
  .attr("refX",3)
  .attr("refY",3)
  .append("circle")
  .attr("cx",3)
  .attr("cy",3)
  .attr("r",3);
  /**
   * Function to calculate the mid-angle given a start 
   * angle and end angle
   *  @param d d3 current data element
   */
  function midAngle(d){
    return d.startAngle + (d.endAngle-d.startAngle)/2;
  }
  /**
   * Function to change the visualization to display data
   * for a candidate (belonging to the 'Other' category)
   * when the user clicks the corresponding image 
   *  @param data Data to display in the d3 visualization
   */
  function switch_data(data){
    // Data to use in the pie chart
    var piedata = pie(data);
    // Defines inner and outer radius for arcs in the pie 
    // chart
    var innerArc = d3.arc()
      .innerRadius(innerRadius)
      .outerRadius(radius);
    // Defines distance from the center of the pie chart at
    // which to display labels corresponding to arcs
    var externalArc = d3.arc()
      .innerRadius(radius+textDistance)
      .outerRadius(radius+textDistance);
    // Defines location of the outer radius of the pie chart
    var outerArc = d3.arc()
      .innerRadius(radius)
      .outerRadius(radius)
    // Draw arcs for the pie chart
    var arcPath = pie_layer.selectAll("path.solidArc")
      .data(piedata);
    arcPath
      .enter()
      .append("path")
      .merge(arcPath)
      // Color the arcs using the d3 color scale
      .attr("fill",function(d){
        return colorScale(d.data.primary);
      })
      .attr("stroke","gray")
      .attr("class","solidArc")
      .on("click",function(d){
        d3.event.stopPropagation()
        // On click, change the opacity of all images to 0 
        // and change the opacity of only the image
        // corresponding to the clicked arc to 1
        d3.selectAll("image.pie")
          .transition()
          .duration(0)
          .style("opacity",0);
        d3.select("#pie_image_"+d.data.name.replace(/'/g, ''))
          .transition()
          .duration(0)
          .style("opacity",1);
        // If the clicked arc does not belong to the 'Other'
        // category, set the opacity of all images in the
        // grid of images corresponding to the 'Other' 
        // category to 0 and call the switch_data function
        // on piedataLarge (to only display data for 
        // candidates not belonging to the 'Other' category)
        if(!Object.keys(piedataSmall).includes(d.data.name)&&d.data.name!='Other'){
          d3.selectAll("image.smallGroups")
            .classed("no_click",true)
            .transition()
            .duration(0)
            .style("opacity",0)
          switch_data(piedataLarge);
        }
        // If the clicked arc belongs to the 'Other' category,
        // set the opacity of all images in the grid of images
        // to 1
        else if(d.data.name=='Other'){
          d3.selectAll("image.smallGroups")
            .classed("no_click",false)
            .transition()
            .duration(0)
            .style("opacity",1)
        }
      })
      .transition("draw_arcs")
      .duration(1000)
      .attr("d",innerArc);
    arcPath.exit()
      .remove();
    // Draw the labels corresponding to each arc
    var arcText = pie_layer.selectAll("text.text_percent")
      .data(piedata)
    arcText
      .enter()
      .append("text")
      .merge(arcText)
      .attr("class","text_percent")
      .attr("dy",".35em")
      .attr("font-size","11px")
      .attr("fill","black")
      .attr("text-anchor","middle")
      // The label itself is the top choice percentage for
      // each candidate
      .text(function(d){
        return d.data.primary+'%';
      })
      // Transform the label to the correct position near 
      // its corresponding arc by calculating the centroid 
      // of the corresponding arc
      .attr("transform",function(d,i){
        var pos = innerArc.centroid(d);
        return 'translate('+pos+')';
      })
    arcText.exit()
          .remove();
    // Labels will be placed on the right side of the pie 
    // chart if their positions are calculated to be from 
    // (2*pi)-epsilon to 2*pi or from 0 to pi+epsilon. 
    // Otherwise, labels are placed on the left side of the
    // pie chart
    var epsilon = 0.2;
    // Add text to the visualization
    var pie_text = pie_layer.selectAll("text.pie")
      .data(piedata);
    pie_text.enter()
      .append("text")
      .merge(pie_text)
      .attr("class","pie")
      .attr("font-size","14px")
      .attr("dy",".35em")
      .attr("fill","black")
      // The labels will be the names of the candidates 
      // corresponding to the arcs
      .text(function(d){
        return d.data.name.replace('_',' ');
      })
      // If the label is on the right side of the chart, the 
      // text-anchor property is set to "start." Otherwise,
      // it is set to "end."
      .style('text-anchor',function(d){
        return ((midAngle(d))<Math.PI+epsilon || midAngle(d)>2*Math.PI-epsilon)? "start" : "end";
      })
      .transition("text_arcs")
      .duration(1000)
      // Translate the label to the appropriate side of the
      // pie chart
      .attr("transform",function(d,i){
        var pos = externalArc.centroid(d);
        pos[0] = radius*1.1*((midAngle(d)<Math.PI+epsilon || midAngle(d)>2*Math.PI-epsilon) ? 1 : -1);
        return 'translate('+pos+')';
      });
    pie_text.exit()
            .transition("remove_text")
            .style("opacity",0)
            .remove();
    // Draw polylines connecting labels to their corresponding
    // arcs
    var pie_lines = pie_layer.selectAll("polyline.pie")
      .data(piedata);
    pie_lines.enter()
      .append("polyline")
      .merge(pie_lines)
      .attr("class","pie")
      // Attach a circle marker to the end of a polyline
      // within the corresponding arc
      .attr("marker-start","url(#rank_label_circ")
      .attr("points",function(d,i){
        // Points defining the polyline are calculated using
        // the same definitions used to place labels on the
        // left and right side of the pie chart, as well as
        // the pre-defined arcs (identifying locations at
        // fixed distances from the center of the pie chart)
        var pos = externalArc.centroid(d);
        pos[0] = radius*1.1*((midAngle(d)<Math.PI+epsilon || midAngle(d) > 2*Math.PI-epsilon)? 1 : -1);
        return [outerArc.centroid(d),externalArc.centroid(d),pos];
      })
    pie_lines.exit()
            .remove();
    }
    // Add an explanatory note at the bottom of the
    // visualization, consisting of explanatory text and a 
    // rectangle surrounding the text
    // Horizontal margin between the rectangle border and
    // text
    var note_margin_x = 20;
    // Vertical margin between the rectangle border and text
    var note_margin_y = 15;
    // Append a group for the explanatory note and translate
    // to the bottom of the visualization
    var note = pie_layer.append("g")
      .attr("transform","translate("+(-(w/2)+130)+","+((h/2)-25)+")");
    // Add a text description
    var note_text = note.append("text")
      .attr("font-size","12px")
      .attr("dy", "0.35em")
      .text("Click the 'Other' category to reveal more interactive elements");
    // Offset for the text to be centered in the surrounding
    // rectangle
    note_text
      .attr("x",note_margin_x)
      .attr("y", note.node().getBBox().height)
    // Create a rectangle centered around the explanatory
    // note
    note.append("rect")
      .attr("stroke","black")
      .attr("stroke-width",1)
      .attr("width",note.node().getBBox().width+(note_margin_x*2))
      .attr("height",note.node().getBBox().height+note_margin_y)
      .attr("fill-opacity",0)
    // Call switch_data using piedataLarge so that the default
    // state of the visualization shows only candidates with
    // a top choice percentage of 2% or higher as well as the
    // 'Other' category
    switch_data(piedataLarge);
    // Change the opacity of the image of Joe Biden to 1 
    // so that the default image displayed in the center of
    // the pie chart is that of Joe Biden (the current top
    // choice for Democratic primary voters)
    d3.select("#pie_image_Joe_Biden")
      .transition()
      .duration(0)
      .style("opacity",1);
}

/**
 * Function to initialize all elements for the "Map"
 * Visualization in the main SVG
 */
function update_map(){
  /**
   * Function to execute when a button is clicked to adjust
   * the colors of all buttons
   *  @param button Selection of the button that was clicked
   *  @param parent Selection of the parent of the button
   */
  function updateButtonColors(button,parent){
    // Change the color of all buttons to the default color
    parent.selectAll("rect")
      .attr("fill",defaultColor);
    // Change the color of the clicked button to the 
    // pressed color
    button.selectAll("rect")
      .attr("fill",pressedColor);
  }
  /**
   * Function to execute when an image is clicked to adjust
   * the opacity of the image
   *  @param image Selection of the image that was clicked
   *  @param parent Selection of the parent of the image
   *  @param flag Integer indicating whether the image had
   *              hover opacity when clicked (0) or pressed
   *              opacity when clicked (1)
   */
  function updateImageOpacity(image,parent,flag){
    // If flag is equal to 0, the image had hover opacity
    // when clicked. Therefore, its opacity should be changed
    // to pressed opacity to indicate it was selected by the
    // user. 
    if(flag==0){
      image.selectAll("image")
        .transition()
        .duration(0)
        .style("opacity",pressedOpacity)
    }
    // If the flag is equal to 1, the image had pressed
    // opacity when clicked. Therefore, its opacity should
    // be changed to default opacity to indicate it was 
    // selected by the user.
    else if(flag==1){
      image.selectAll("image")
        .transition()
        .duration(0)
        .style("opacity",defaultOpacity)
    }
  }
  // Projection for geographical data with translation and 
  // scaling to see the entire United States in the center of
  // the screen
  var projection = d3.geoAlbersUsa()
                      .translate([w/2,h/2+50])
                      .scale([800]);
  // Path generator that converts GeoJSON data to SVG paths 
  // and uses geoAlbersUSA projection
  var path;
  // d3 selection for all states on the map
  var states;
  // Path generator to convert GeoJSON data to SVG paths uses
  // albersUsa projection
  path = d3.geoPath().projection(projection);
  // Store features from GeoJSON data in the variable 
  // "map_features"
  map_features = us.features;
  // Function to modify the mapdata array containing electoral 
  // college results for states
  getMapFeatures();
  // Function to determine the coordinates for the images of 
  // candidates within each state
  getMapObj();
  // Append a group to contain all elements of the "Map"
  // Visualization
  var map_layer = g.append("g")
      .attr("id","map_layer")
      // Set all elements in the group so that the opacity
      // is 0 and all elements cannot be clicked
      .style("opacity",0)
      .classed("no_click",true)
  // Append paths corresponding to polygons defining the 
  // shape of the states
  states = map_layer.selectAll("path.map")
      .data(map_features);
  states
      .enter()
      .append("path")
      .attr("d",path)
      .classed("map",true)
      .style("stroke","#fff")
      .style("stroke-width","1")
      // Color each state according to the color property
      // (determined by the electoral college results for
      // each state)
      .style("fill",function(d){
          return d.properties.color;
      })
      .on("mouseover",function(d){
          // On mouseover for a state, display a tooltip
          // (positioned at the center coordinates of the 
          // state using "projection") containing text of
          // the name of the state
          tooltipMapStates
            .style("left",(projection([d.properties.center_x,d.properties.center_y])[0])+"px")
            .style("top",(projection([d.properties.center_x,d.properties.center_y])[1])+"px")
            .text(d.properties.name)
            .transition()
            .duration(200)
            .style("visibility","visible")
      })
      .on("mouseout",function(d){
          // On mouseout from a state, transition the tooltip
          // so that its visibility becomes hidden
          tooltipMapStates.transition()
              .duration(500)
              .style("visibility","hidden");
      });
  // Width of a button
  var bWidth = 110;
  // Height of a button 
  var bHeight = 35;
  // Space between buttons
  var bSpace = 10;
  // x and y offset for the position of the buttons
  var x0 = 55;
  var y0 = 20;
  // Default button color
  var defaultColor = '#7777BB';
  // Color to display when hovering over a button
  var hoverColor = '#0000ff';
  // Color to display when button is pressed/clicked
  var pressedColor = '#000077';
  // Default opacity for images in the grid above the US
  // state map
  var defaultOpacity = 0.5;
  // Opacity to display when an image in the grid is pressed/
  // clicked
  var pressedOpacity = 1;
  // Opacity to display when an image in the grid is hovered
  // over
  var hoverOpacity = 0.2;
  // Append a group to contain all button elements
  var allButtons = map_layer.append("g")
      .attr("id","allButtons")
      // Translate the buttons to be located below the US
      // state map
      .attr('transform',function(d){
        return 'translate(160,480)';
      })
  // Append two buttons, one with value 'States Born' and one
  // with value 'States Worked'
  var buttonGroups = allButtons.selectAll("g.button")
    .data(['States Born','States Worked'])
    .enter()
    .append("g")
    .attr("class","button")
    .style("cursor","pointer")
    .on("click",function(d){
      // When a button is clicked, update the colors of both
      // buttons
      updateButtonColors(d3.select(this),d3.select(this.parentNode));
      // If the 'States Born' button is clicked, this indicates
      // only data corresponding to the states in which 
      // candidates were born should be displayed.
      // Set the opacity of all image icons on the US state
      // map corresponding to states in which candidates 
      // were born to 0.85
      if(d=='States Born'){
        map_layer.selectAll("image.born")
          .classed("no_click",false)
          .transition()
          .duration(0)
          .style("opacity",0.85)
        // Change the opacity of all image icons on the US
        // state map corresponding to states in which
        // candidates had significant work experience to 0
        map_layer.selectAll("image.role")
          .classed("no_click",true)
          .transition()
          .duration(0)
          .style("opacity",0)
      }
      // If the 'States Worked' button is clicked, this
      // indicates only data corresponding to the states in
      // which candidates had significant work experience
      // should be displayed.
      // Set the opacity of all image icons on the US state
      // map corresponding to states in which candidates
      // had significant work experience to 0.85
      else if(d=='States Worked'){
        map_layer.selectAll("image.role")
          .classed("no_click",false)
          .transition()
          .duration(0)
          .style("opacity",0.85)
        // Change the opacity of all image icons on the US 
        // state map corresponding to states in which 
        // candidates were born to 0
        map_layer.selectAll("image.born")
          .classed("no_click",true)
          .transition()
          .duration(0)
          .style("opacity",0)
      }
      // Function to draw image icons on the US state map
      // depending on which button is currently selected
      draw_images();
    })
    .on("mouseover",function(){
      // On mouseover for a button, if the button is not 
      // pressed, change the fill to the hover color
      if(d3.select(this).select("rect").attr("fill")!=pressedColor){
        d3.select(this)
          .select("rect")
          .transition()
          .duration(0)
          .attr("fill",hoverColor);
      }
    })
    // On mouseout for a button, if the button is not pressed,
    // change the fill to the default color
    .on("mouseout",function(){
      if(d3.select(this).select("rect").attr("fill")!=pressedColor){
        d3.select(this)
          .select("rect")
          .transition()
          .duration(0)
          .attr("fill",defaultColor);
      }
    })
  // Append rectangles representing the buttons
  buttonGroups.append("rect")
      .attr("id",function(d,i){
        return "states_button"+i;
      })
      .attr("class","buttonRect")
      // Position of the buttons is calculated using the 
      // padding, width, height, and space defined previously
      .attr("x",function(d,i){
        return x0+(bWidth+bSpace)*i;
      })
      .attr("y",function(d,i){
        return y0;
      })
      // Rounding of the corners of the buttons
      .attr("rx",5)
      .attr("ry",5)
      .attr("width",bWidth)
      .attr("height",bHeight)
      // The default visualization will have the "States Born"
      // button pressed
      .attr("fill",function(d,i){
        if(i==0){
          return pressedColor;
        }
        else{
          return defaultColor;
        }
      })
  // Append text to the buttons
  buttonGroups.append("text")
      .attr("class","buttonText")
      .attr("fill","white")
      // Center the text in the middle of the buttons
      .attr("x",function(d,i){
        return x0+(bWidth+bSpace)*i+bWidth/2;
      })
      .attr("y",function(d,i){
        return y0+bHeight/2;
      })
      .attr("text-anchor","middle")
      .attr("dominant-baseline","central")
      // The text is the data bound to the button group
      .text(function(d){
        return d;
      })
  // The top of the "Map" Visualization contains a grid of 
  // images of the candidates (available for selection by the
  // user to manually filter the image icons displayed on 
  // the US state map) 
  // Set the properties for the grid of images
  // Number of columns
  var numCols = 7;
  // Number of rows
  var numRows = 3;
  // x and y padding (offset)
  var xPadding = 7;
  var yPadding = 3;
  // Vertical space between images
  var hBuffer = 45;
  // Horizontal space between images
  var wBuffer = 45;
  // Size of the images
  var imageSize = 45;
  // Array in which each element is a two-element array,
  // the first element of which is the name of a candidate
  // and the second element of which is a link to a 
  // corresponding image
  var icons_grid_data = Object.entries(names_obj);

  /**
   * Function to draw image icons on the US state map
   * depending on which button is currently selected by 
   * the user
   */
  function draw_images(){
    // Set the opacity of all images corresponding to 
    // states in which candidates were born to 0
    d3.selectAll("image.born")
      .transition()
      .duration(0)
      .style("opacity",0);
    // Set the opacity of all images corresponding to 
    // states in which candidates had significant work 
    // experience to 0
    d3.selectAll("image.role")
      .transition()
      .duration(0)
      .style("opacity",0);
    // Remove all images corresponding to states in which 
    // candidates were born 
    d3.selectAll("image.born").remove();
    // Remove all images corresponding to states in which 
    // candidates had significant work experience
    d3.selectAll("image.role").remove();
    // If the 'States Born' button is selected by the user,
    // perform the following
    if(d3.select("#states_button0").attr("fill")==pressedColor){
      // Function to adjust data in global variable
      // map_obj_born_temp to include data only for candidates
      // who have been selected by the user 
      adj_map_obj(0);
      // Append images to the US state map corresponding to
      // the state in which each candidate was born
      var icons_born = map_layer.selectAll("image.born")
        .data(map_obj_born_temp)
        .enter()
        .append("image")
        .classed("born",true)
        .attr("xlink:href",function(d){
          return d.img;
        })
        // Translate the image to the state in which the 
        // candidate was born
        .attr("transform",function(d){
          return "translate("+projection(d.state_born_coords)[0]+","+projection(d.state_born_coords)[1]+")";
        })
        // x and y offset
        .attr("x",function(d){
          return -d.loc_x;
        })
        .attr("y",function(d){
          return -d.loc_y;
        })
        // Height and width of the image
        .attr("height",function(d){
          return d.size;
        })
        .attr("width",function(d){
          return d.size;
        })
        .on("mouseenter",function(d){
          // When hovering over the image, make all other
          // images hidden. This effect is achieved by first
          // making all images hidden, then making only the
          // image being hovered over visible.
          d3.selectAll("image.born")
            .transition()
            .duration(500)
            .style("opacity",0)
          // When hovering over the image, also increase the 
          // image size and translate slightly to create an 
          // enlarging effect
          d3.select(this)
              .transition()
              .duration(0)
              .style("opacity",1)
              .attr("x",function(d){
                  return -d.loc_x*3;
              })
              .attr("y",function(d){
                  return -d.loc_y*3;
              })
              .attr("height",d.size*3)
              .attr("width",d.size*3);
          // When hovering over the image, display a tooltip
          // showing the name of the candidate 
          tooltipMapImages
            .transition()
            .duration(0)
            // Location of the tooltip 
            .style("left",parseInt((projection(d.state_born_coords)[0]))-45+"px")
            .style("top",parseInt(projection(d.state_born_coords)[1])+30+"px")
            // Text of the tooltip is the name of a candidate
            .text(d.name.replace('_',' '))
          tooltipMapImages.transition()
            .duration(200)
            .style("visibility","visible")
        })
        // When the mouse leaves the image, return the image
        // to its original size and location
        .on("mouseleave",function(d){
            d3.selectAll("image.born")
              .transition()
              .duration(500)
              .style("opacity",1);
            d3.select(this)
                .transition()
                .duration(0)
                .attr("x",function(d){
                    return -d.loc_x;
                })
                .attr("y",function(d){
                    return -d.loc_y;
                })
                .attr("height",d.size)
                .attr("width",d.size);
            // Change the tooltip visibility to hidden
            tooltipMapImages.transition()
                .duration(500)
                .style("visibility","hidden");
        })
        // Change the opacity of all images corresponding 
        // to states in which candidates were born to 1
        .transition()
        .duration(0)
        .style("opacity",1)
    }
    // Repeat the procedure for images corresponding to 
    // states in which candidates had significant work 
    // experience if the 'States Worked' button is clicked
    else if(d3.select("#states_button1").attr("fill")==pressedColor){
      adj_map_obj(1);
      var icons_role = map_layer.selectAll("image.role")
        .data(map_obj_role_temp)
        .enter()
        .append("image")
        .classed("role",true)
        .attr("xlink:href",function(d){
          return d.img;
        })
        .attr("transform",function(d){
          return "translate("+projection(d.state_role_coords)[0]+","+projection(d.state_role_coords)[1]+")";
        })
        .attr("x",function(d){
          return -d.loc_x;
        })
        .attr("y",function(d){
          return -d.loc_y;
        })
        .attr("height",function(d){
          return d.size;
        })
        .attr("width",function(d){
          return d.size;
        })
        .on("mouseenter",function(d){
          d3.selectAll("image.role")
            .transition()
            .duration(500)
            .style("opacity",0);
          d3.select(this)
              .transition()
              .duration(0)
              .style("opacity",1)
              .attr("x",function(d){
                  return -d.loc_x*3;
              })
              .attr("y",function(d){
                  return -d.loc_y*3;
              })
              .attr("height",d.size*3)
              .attr("width",d.size*3);
          tooltipMapImages
              .transition()
              .duration(0)
              .style("left",parseInt((projection(d.state_role_coords)[0]))-45+"px")
              .style("top",parseInt(projection(d.state_role_coords)[1])+30+"px")
              .text(d.name.replace('_',' '))
          tooltipMapImages.transition()
              .duration(200)
              .style("visibility","visible")
        })
        .on("mouseleave",function(d){
            d3.selectAll("image.role")
              .transition()
              .duration(500)
              .style("opacity",1);
            d3.select(this)
                .transition()
                .duration(0)
                .attr("x",function(d){
                    return -d.loc_x;
                })
                .attr("y",function(d){
                    return -d.loc_y;
                })
                .attr("height",d.size)
                .attr("width",d.size);
            tooltipMapImages.transition()
                .duration(500)
                .style("visibility","hidden");
      })
    }
  }
  // Append a group to contain elements corresponding to the
  // grid of images of candidates above the US state map
  // (images can be clicked by the user to filter the icons
  // displayed on the US state map)
  var icons_grid = map_layer.append("g")
      .attr("id","pictoLayer")
      // Translate grid of images above the US state map
      .attr('transform',function(d){
        return 'translate(90,0)';
      })
  // Append a group for each image to be added to the grid
  icons_gridGroups = icons_grid.selectAll("g.select_grid")
      .data(icons_grid_data)
      .enter()
      .append("g")
      .attr("class","select_grid")
      .on("click",function(d){
        // If the clicked image has hover opacity, change
        // the opacity to pressed opacity using
        // updateImageOpacity and add the name of the
        // candidate corresponding to the image to 
        // map_icons_selected. In this way, data for the 
        // selected candidate will be displayed on the US 
        // state map
        if(d3.select(this).select("image").style("opacity")==hoverOpacity){
          map_icons_selected.push(d[0]);
          updateImageOpacity(d3.select(this),d3.select(this.parentNode),0);
        }
        // If the clicked image has pressed opacity, change
        // the opacity to the default opacity using 
        // updateImageOpacity and remove the name of the 
        // candidate corresponding to the image from
        // map_icons_selected. In this way, data for the 
        // de-selected candidate will no longer be displayed
        // on the US state map
        else if(d3.select(this).select("image").style("opacity")==pressedOpacity){
          for(var i=0;i<map_icons_selected.length;i++){
            if(map_icons_selected[i]==d[0]){
              map_icons_selected.splice(i,1);
              break;
            }
          }
          updateImageOpacity(d3.select(this),d3.select(this.parentNode),1);
        }
      // Function to draw image icons on the US state map
      // depending on which button is currently selected
        draw_images();
      })
      .on("mouseover",function(d){
        // When hovering over an image, if the opacity is not
        // pressed opacity, change the opacity to hover 
        // opacity
        if(d3.select(this).select("image").style("opacity")!=pressedOpacity){
          d3.select(this)
            .select("image")
            .transition()
            .duration(0)
            .style("opacity",hoverOpacity);
        }
        // Display a tooltip of the name of the candidate
        tooltipMapImages
            .transition()
            .duration(0)
            // Location of the tooltip
            .style("left",parseInt(d3.select(this).select("image").attr("x"))+imageSize*2+"px")
            .style("top",parseInt(d3.select(this).select("image").attr("y"))+imageSize+"px")
            .text(d[0].replace('_',' '))
        tooltipMapImages.transition()
            .duration(200)
            .style("visibility","visible")
      })
      .on("mouseout",function(d){
        // When the mouse leaves the image, if the opacity
        // is not pressed opacity, change the opacity to
        // the default opacity
        if(d3.select(this).select("image").style("opacity")!=pressedOpacity){
          d3.select(this)
            .select("image")
            .transition()
            .duration(0)
            .style("opacity",defaultOpacity);
        }
        // Change the visibility of the tooltip to hidden
        tooltipMapImages.transition()
          .duration(500)
          .style("visibility","hidden");
      })
  // Append an image corresponding to the candidate
  icons_gridGroups.append("image")
        .classed("select_grid",true)
        .attr("xlink:href",function(d){
          return d[1];
        })
        // Location of the image in the grid depends on the
        // index as well as the padding, height, width, and
        // spacing defined previously
        .attr("x",function(d,i){
          var remainder = i % numCols;
          return xPadding+(remainder*wBuffer);
        })
        .attr("y",function(d,i){
          var whole = Math.floor(i/numCols);
          return yPadding+(whole*hBuffer);
        })
        .attr("height",function(d){
          return imageSize;
        })
        .attr("width",function(d){
          return imageSize;
        })
        // The default visualization will have all images
        // in the grid with pressedOpacity so that data for
        // all candidates will be displayed
        .style("opacity",pressedOpacity);
  // Add an explanatory note at the top of the visualization,
  // consisting of explanatory text and a rectangle 
  // surrounding the text
  // Horizontal margin between the rectangle border and
  // text
  var note_margin_x = 10;
  // Vertical margin between the rectangle border and text
  var note_margin_y = 15;
  // Append a group for the explanatory note and surrounding
  // rectangle
  var note = map_layer.append("g")
  // Add a text description
  var note_text = note.append("text")
    .attr("font-size","12px")
    .attr("dy", "0.35em")
    .attr("text-anchor","middle")
    .text("Click an image in the grid to add/remove a candidate from the map. The two buttons below the map are also available to toggle between.")
    // The wrap function will be called to format the text 
    // element to include line breaks when the width of a line 
    // of text exceeds an input width via appended tspan
    // elements.
    // In order to ensure that each tspan element is placed
    // below the previous one, the text element must have
    // an x and y attribute specified.
    .attr("x",492)
    .attr("y",35)
    .call(wrap,125);
  // Create a rectangle centered around the explanatory
  // note
  note.append("rect")
    // Location for the rectangle
    .attr("x",420)
    .attr("y",18)
    .attr("stroke","black")
    .attr("stroke-width",1)
    .attr("width",note.node().getBBox().width+(note_margin_x*2))
    .attr("height",note.node().getBBox().height+note_margin_y)
    .attr("fill-opacity",0)
  // For the default visualization, display data for the 
  // states in which all candidates were born. In order to
  // achieve this initialization, add the names of all 
  // candidates to "map_icons_selected." (Previously, the
  // opacity of all images in the grid was set to
  // pressedOpacity to indicate data for all candidates is
  // being shown, and the button "States Born" was set to
  // pressedColor to indicate data for states in which 
  // candidates were born is being shown). Then call the
  // "draw_images()" function to add the icons for each 
  // candidate to the US state map
  for(var i=0;i<names.length;i++){
    map_icons_selected.push(names[i]);
  }
  draw_images();
}

/**
 * Function to initialize all elements for the "Grid"
 * Visualization in the main SVG
 */
function update_grid(){
  // Center x coordinate of the grid
  var centerX = w*0.5;
  // Center y coordinate of the grid
  var centerY = h*0.5;
  // Strength of the forceX and forceY forces of the simulation
  var strength = 0.05;
  // d3 color scale
  var scaleColor = d3.scaleSequential(d3.interpolateBlues)
  // Minimum value for size (number of criticisms per 
  // candidate) for all objects in criticism_obj
  var min_val = d3.min(criticism_obj,function(d){
    return d.size;
  });
  // Maximum value for size (number of criticisms per 
  // candidate) for all objects in criticism_obj
  var max_val = d3.max(criticism_obj,function(d){
    return d.size;
  });
  // Domain for the color scale is determined by min_val and
  // max_val
  scaleColor.domain([min_val-1,max_val+4]);
  // Use d3.pack() to create a pack layout assigning positions
  // and sizes to all nodes in the diagram according to the
  // data
  var gridLayout = d3.pack().size([w,h])
                            .padding(1.5);
  // Force to simulate repulsion between nodes
  force_grid.force("charge",d3.forceManyBody())
    // Force to simulate collisions between nodes
    .force("collide",forceCollide_grid)
    // Force to simulate attraction in the x direction
    // toward centerX
    .force("x",d3.forceX(centerX).strength(strength))
    // Force to simulate attraction in the y direction 
    // toward centerY
    .force("y",d3.forceY(centerY).strength(strength));
  // Construct a root node from the hierarchical data 
  // in criticism_obj
  var root = d3.hierarchy({children: criticism_obj})
    .sum(function(d){
      return d.size;
    })
  // Obtain the leaves of the pack layout and map an object
  // to each node
  var nodes = gridLayout(root).leaves().map(function(node){
    const data = node.data;
    return{
      // Location of the node
      x: centerX + (node.x-centerX)*3,
      y: centerY + (node.y-centerY)*3,
      // Initial radius
      r: 0,
      // Radius assigned by pack layout
      radius: node.r,
      id: "grid_"+data.name,
      name: data.name,
      value: data.size,
      img: data.img,
      // Critical issues headings
      crit_keys: data.crit_keys,
      // Critical issues text
      crit_values: data.crit_values
    }
  });
  // The tick() function is called during every iteration
  // of the force simulation to update the position of nodes
  force_grid.nodes(nodes).on("tick",tick)
  // Append a group to contain all elements of the "Grid"
  // Visualization
  var grid_layer = g.append("g")
      .attr("id","grid_layer")
      // Set all elements in the group so that the opacity
      // is 0 and all elements cannot be clicked
      .style("opacity",0)
      .classed("no_click",true) 
  // Append a group for each node
  var nodeGrid = grid_layer.selectAll('g.grid')
    .data(nodes)
    .enter()
    .append('g')
    .attr('class','grid')
    // Functions to call on drag
    .call(d3.drag()
      .on("start",function(d){
        // Restart the simulation 
        if (!d3.event.active) force_grid.alphaTarget(0.2).restart();
          d.fx = d.x;
          d.fy = d.y;
        })
      // Update the position of the node to follow the cursor
      .on("drag",function(d){
          d.fx = d3.event.x;
          d.fy = d3.event.y;
        })
      // Cool the simulation
      .on("end",function(d){
        if (!d3.event.active) force_grid.alphaTarget(0);
          d.fx = null;
          d.fy = null;
        })
    )
  // Append a circle for each node
  nodeGrid.append('circle')
        .attr("id",function(d){
          return d.id;
        })
        .attr("class","grid")
        .attr('r',0)
        .style('fill',function(d){
          return scaleColor(d.value);
        })
        .transition("circle_in")
        .duration(2000)
        .ease(d3.easeElasticOut)
          // Define tween to transition size of circles from
          // 0 to the radius specified by the pack layout
          .tween("circleIn",function(d){
            var i = d3.interpolateNumber(0,d.radius);
            return function(t){
              d.r = i(t);
              force_grid.force('collide',forceCollide_grid);
            }
          })
  // Append clipPaths for the images
  nodeGrid.append('clipPath')
        .attr('id',function(d){
          return `clip-${d.id}`;
        })
        .append('use')
        .attr('xlink:href',function(d){
          return `#${d.id}`;
        })
  // Append an image for each node
  nodeGrid.append('image')
        .attr("class","grid")
        .classed('node-icon',true)
        // Use the clipPath
        .attr('clip-path',function(d){
          return `url(#clip-${d.id})`;
        })
        .attr('xlink:href',function(d){
          return d.img;
        })
        // Position of the image
        .attr('x',function(d){
          return -d.radius*0.8;
        })
        .attr('y',function(d){
          return -d.radius*0.8;
        })
        // Size of the image
        .attr('height',function(d){
          return d.radius*2*0.8;
        })
        .attr('width',function(d){
          return d.radius*2*0.8;
        })
  // Append a foreignObject for each node
  var infoBox = nodeGrid.append('foreignObject')
        .classed('circle-overlay hidden',true)
        .on("click",function(d){
        // The equalToEventTarget() and d3 filter() functions 
        // are used to determine if the user's click event was 
        // inside or outside "infoBox." If the user's click 
        // event was outside "infoBox", perform the following
          var outside = infoBox_ul.filter(equalToEventTarget).empty();
          if(outside){
              // Set the opacity of all tooltips to 0
              d3.selectAll("div.tooltip")
                  .transition("outside_div_tooltip_hidden")
                  .duration(0)
                  .style("opacity",0);
              // Each node in the grid initially displays 
              // bullet points for each of the key criticism
              // headings for a candidate. Upon clicking 
              // a bullet point, a tooltip will be displayed
              // with additional information about the key
              // criticism selected and all other bullet
              // points will no longer be visible. When the
              // user clicks outside the unordered list, all
              // bullet points (<li> elements) will once 
              // again become visible.
              // Display the <li> elements in the 
              // foreignObject when the user clicks outside
              // the unordered list
              d3.selectAll("foreignObject li")
                  .classed("no_display",false);
          }
        })
        .attr('x',-250*0.5*0.8)
        .attr('y',-325*0.5*0.8)
        .attr('height',350*0.8)
        .attr('width',375*0.8)
          // Append a div
          .append('xhtml:div')
          .classed('circle-overlay_inner',true);
  // Append a header
  infoBox.append('h2')
        .classed('circle-overlay_title',true)
        .text(function(d){
          // The text of the header will be the name of the
          // candidate
          return d.name.replace('_',' ');
        })
        .attr('text-decoration','underline');
  // Append an unordered list
  var infoBox_ul = infoBox.append('ul');
  infoBox_ul.each(function(d,i){
    for(var i=0;i<d.crit_keys.length;i++){
      // Append an <li> element for every key criticism 
      // heading associated with a candidate
      d3.select(this).append('li')
        .attr("id",function(d){
          return d.id.replace(/'/g, '')+'_li'+i;
        })
        .classed('circle-overlay_body',true)
        .html(function(d){
          // The text will be the key criticism heading
          return d.crit_keys[i];
        })
        // When the user mouses over an <li< element, its 
        // opacity will reduce to indicate it is a clickable
        // element. 
        .on("mouseenter",function(d){
          d3.select(this).style("opacity",0.5);
        })
        // When the user's cursor leaves an <li> element, its
        // opacity will return to full opacity 
        .on("mouseleave",function(d){
          d3.selectAll("foreignObject li").style("opacity",1);
        })
        .on("click",function(d){
          // On clicking the <li> element, a tooltip will
          // be displayed with additional information about
          // only the associated key criticism. In order to
          // determine which tooltip to display, the index of 
          // the <li> element in the "children" array of its 
          // parent element must be determined.
          // This index of the <li> element (used within its
          // id) corresponds to the id of the corresponding
          // tooltip to be displayed.
          d3.event.stopPropagation();
          // Identify the index of the selected element in 
          // its parent's "children" array
          var child = d3.select(this)._groups[0][0];
          var childNum = Array.from(child.parentNode.children).indexOf(child);
          // Change the opacity of all tooltips to 0
          d3.selectAll("foreignObject div.tooltip")
            .transition("div_tooltip_hidden")
            .duration(0)
            .style("opacity",0);
          // Hide all <li> elements. In addition, remove 
          // all mouseenter and mouseleave pointer events.
          d3.selectAll("foreignObject li")
            .classed("no_display",true)
            .on("mouseenter",null)
            .on("mouseleave",null);
          // Make visible only the <li> element that was 
          // selected by the user using the childNum index
          // previously obtained. In addition, since the 
          // opacity of the selected <li> element was 
          // previously reduced upon mouseover, return the 
          // opacity to full opacity
          d3.select("#"+d.id.replace(/'/g, '')+"_li"+childNum)
            .style("opacity",1)
            .classed("no_display",false);
          // Make visible the tooltip with id containing the
          // childNum index previously obtained
          d3.select("#"+d.id.replace(/'/g, '')+'_div'+childNum)
            .transition("this_not_hidden")
            .duration(0)
            .style("opacity",1);
        })
        // Append tooltips, one for each node, with text
        // corresponding to each key criticism
        .append('div')
          .attr("id",function(d){
            return d.id.replace(/'/g, '')+'_div'+i;
          })
          .classed('tooltip',true)
          .html(function(d){
            return d.crit_values[i];
          })
          .style("opacity",0);
    }
  })

  // Add an explanatory note to the bottom of the 
  // visualization, consisting of explanatory text and a 
  // rectangle surrounding the text
  // Horizontal margin between the rectangle border and
  // text
  var note_margin_x = 20;
  // Vertical margin between the rectangle border and text
  var note_margin_y = 10;
  // Append a group for the explanatory note and surrounding
  // rectangle
  var note = grid_layer.append("g")
    .attr("id","zoom_note")
  // Add a text description
  var note_text = note.append("text")
    .attr("font-size","12px")
    .attr("dy", "0.35em")
    .attr("text-anchor","middle")
    .text("Click an image of a candidate to zoom in and reveal a list of key criticisms. Click a criticism to reveal more detail or click the background of the current circle to return to the original list. Click outside the current circle to zoom back out")
    // The wrap function will be called to format the text 
    // element to include line breaks when the width of a line 
    // of text exceeds an input width via appended tspan
    // elements.
    // In order to ensure that each tspan element is placed
    // below the previous one, the text element must have
    // an x and y attribute specified.
    .attr("x",300)
    .attr("y",h)
    .call(wrap,450);
  // Create a rectangle centered around the explanatory
  // note
  note.append("rect")
    // Location for the rectangle
    .attr("x",55)
    .attr("y",h-15)
    .attr("stroke","black")
    .attr("stroke-width",1)
    .attr("width",note.node().getBBox().width+(note_margin_x*2))
    .attr("height",note.node().getBBox().height+note_margin_y)
    .attr("fill-opacity",0)

  nodeGrid.on("click",function(currentNode){
    d3.event.stopPropagation();
    // When the grid of nodes is clicked, enlarge the node
    // that was clicked and move it to the center of the 
    // grid. Text for the node is displayed and text for all
    // other nodes must be made hidden.
    // On click, make visible all <li> elements. (Note that 
    // divs for other nodes will be made hidden in subsequent
    // steps, so that only the <li> elements for the clicked
    // node will ultimately be visible).
    d3.selectAll("foreignObject li")
        .classed("no_display",false)
        // Add the mouseenter and mouseleave pointer events
        // (that change opacity of <li> elements to indicate
        // they are clickable) back to all <li> elements
        .on("mouseenter",function(d){
          d3.select(this).style("opacity",0.5);
        })
        .on("mouseleave",function(d){
          d3.selectAll("foreignObject li").style("opacity",1);
        });
    // Target of the click event
    var currentTarget = d3.event.currentTarget;
    // Return if there is no focusedNode or the clicked node
    // (currentNode) is the same as focusedNode
    if(currentNode===focusedNode){
      return;
    }
    // Set focusedNode to the node that was clicked on
    var lastNode = focusedNode;
    focusedNode = currentNode;
    // Restart the simulation
    force_grid.alphaTarget(0.2).restart();
    // Hide all foreignObjects/divs for all nodes. The 
    // foreignObject/div for the clicked node will be made
    // visible in a subsequent step
    d3.selectAll('.circle-overlay').classed('hidden',true);
    // Make visible all images
    d3.selectAll('.node-icon')
      .transition("click_icon_faded")
      .duration(0)
      .style('opacity',1);
    // For the last node that was in focus, remove the fixed
    // x and y properties (i.e. fx and fy) so that its
    // position in the grid can be adjusted by the force
    // simulation. 
    if(lastNode){
      lastNode.fx = null;
      lastNode.fy = null;
      nodeGrid.filter(function(d,i){
        return i===lastNode.index;
      })
        // For the last node that was in focus, decrease the
        // size to its original size
        .transition("circles_grow")
        .duration(2000)
        .ease(d3.easePolyOut)
        .tween('circleOut',function(){
          var irl = d3.interpolateNumber(lastNode.r,lastNode.radius);
          return function(t){
            lastNode.r = irl(t);
          }
        })
        .on('interrupt',function(){
          lastNode.r = lastNode.radius;
        });
    }
    // Move the clicked node to the center of the grid and
    // increase its size 
    d3.transition("circles_center")
      .duration(2000)
      .ease(d3.easePolyOut)
      .tween("moveIn",function(){
        var ix = d3.interpolateNumber(currentNode.x,centerX);
        var iy = d3.interpolateNumber(currentNode.y,centerY);
        var ir = d3.interpolateNumber(currentNode.r,centerY*0.5);
        return function(t){
          currentNode.fx = ix(t);
          currentNode.fy = iy(t);
          currentNode.r = ir(t);
          force_grid.force('collide',forceCollide_grid);
        }
      })
      // Make visible the foreignObject/div for the clicked
      // node and make the opacity of the image in the node 
      // hidden so that the text is visible
      .on("end",function(){
        force_grid.alphaTarget(0);
        var $currentGroup = d3.select(currentTarget);
        $currentGroup.select('.circle-overlay')
          .classed('hidden',false);
        $currentGroup.select('.node-icon')
          .transition("end_icon_faded")
          .duration(0)
          .style('opacity',0);
      })
      .on('interrupt',function(){
        currentNode.fx = null;
        currentNode.fy = null;
        force_grid.alphaTarget(0);
      });
  });
  // If the SVG is clicked, call the grid_out_click function
  // which returns all nodes to their original size and 
  // restarts the force simulation to adjust positions in the
  // grid
  vis.on("click",grid_out_click);
  // tick() function to call on every iteration of the 
  // simulation to move all nodes to their new positions
  // and ensure they are the correct size
  function tick(){
    nodeGrid.attr('transform',function(d){
      return `translate(${d.x},${d.y})`;
    })
      .select('circle.grid')
        .attr('r',function(d){
          return d.r;
        })
  }
}

/**
 * Function to initialize all elements for the "Zoom"
 * Visualization in the main SVG
 */
function update_zoom(){
  // d3 color scale
  var color = d3.scaleLinear()
    .domain([0,5])
    .range(["hsl(152,80%,80%)", "hsl(228,30%,40%)"])
    .interpolate(d3.interpolateHcl);
  // Use d3.pack() to create a pack layout assigning positions
  // and sizes to all nodes in the diagram according to the
  // data
  var packLayout = d3.pack().size([r,r]);
                            // .padding(3);
  // Construct a root node from the hierarchical data 
  // in issues_obj
  var root = d3.hierarchy(issues_obj)
    .sum(function(d){
      return d.size;
    });
  // Call packLayout on the root to obtai positions/sizes
  // for all nodes
  packLayout(root); 
  // The node in the "Zoom" visualization currently being 
  // zoomed into is by default the root node
  zoomNode = root;
  // circle_text_id is used to identify related circles, 
  // images, and text. Each related circle, image,
  // and text has an id prefixed by the element type (i.e. 
  // image, circle, or text) and ending with this common 
  // integer identifier
  // Initialize circle_text_id to 0 when beginning to 
  // assign ids for either circles, images, or text
  circle_text_id = 0;
  // Append a group to contain all elements of the "Grid"
  // Visualization
  var zoom_layer = g.append("g")
      .attr("id","zoom_layer")
      .attr("transform","translate("+50+",0)")
      // Set all elements in the group so that the opacity
      // is 0 and all elements cannot be clicked
      .style("opacity",0)
      .classed("no_click",true) 
  // Append images to the group
  zoom_layer.selectAll("image.zoom")
      .data(root.descendants())
      .enter()
      .append("image")
      .classed("zoom",true)
      // Assign ids based on circle_text_id, which increments
      // with each assignment
      .attr("id",function(d){
        circle_text_id = circle_text_id + 1;
        return "image"+(circle_text_id - 1).toString();
      })
      .attr("xlink:href",function(d){
        return d.data.img;
      })
      .attr("transform",function(d){
        return "translate("+d.x+","+d.y+")";
      })
      .attr("x",function(d){
        return -d.r;
      })
      .attr("y",function(d){
        return -d.r;
      })
      .attr("height",function(d){
        return d.r*2;
      })
      .attr("width",function(d){
        return d.r*2;
      })
      .on("click",click_zoom)
        
  circle_text_id = 0;
  zoom_layer.selectAll("circle.zoom")
    .data(root.descendants())
    .enter()
    .append("circle")
      .attr("class",function(d){
        return d.children ? "parent" : "child";
      })
      .classed("zoom",true)
      .attr("id",function(d){
        d.circle_text_id = circle_text_id;
        circle_text_id = circle_text_id + 1;
        return "circle"+(circle_text_id - 1).toString();
      })
      .attr("cx",function(d){return d.x})
      .attr("cy",function(d){return d.y})
      .attr("r",function(d){return d.r})
      .on("click",click_zoom);
  circle_text_id = 0;
  var text_zoom = zoom_layer.selectAll("text.zoom")
    .data(root.descendants())
    .enter()
    .append("text")
      .attr("class",function(d){
        return d.children ? "parent" : "child";
      })
      .attr("id",function(d){
        circle_text_id = circle_text_id + 1;
        return "text"+(circle_text_id - 1).toString();
      })
      .classed("zoom",true)
      .attr("text-anchor","middle")
      .attr("x",function(d){
        return d.x;
      })
      .attr("y",function(d){
        return d.y;
      })
      .attr("dy",".35em")
  text_zoom.append("tspan")
    // Assign one class for the text headings of critical 
    // issue categories (corresponding to a depth of 1) and
    // one class for the text headings corresponding to 
    // candidate names so that they may be styled differently
    .attr("class",function(d){
      if(d.depth==1){
        return "zoomtext_main";
      }
      else{
        return "zoomtext_head";
      }
    })
    .style("font-size",function(d){
      return "16px";
    })
    .style("font-weight",function(d){
      return "bold";
    })
    .text(function(d){
      if(d.children){
        if(d.depth==0){
          return "";
        }
        else{
          var curr_name = d.data.name;
          curr_name = curr_name[0].toUpperCase()+curr_name.slice(1);
          curr_name = curr_name.replace('_',' ');
          return curr_name;
        }
      }
      else{
        return "";
      }
    })
  text_zoom.append("tspan")
    .classed("zoomtext_body",true)
    .style("font-size",function(d){
      return "14px";
    })
    .style("font-weight",function(d){
      return "";
    })
    .text(function(d){
      return "";
    });
  // Add an explanatory note to the bottom of the 
  // visualization, consisting of explanatory text and a 
  // rectangle surrounding the text
  // Horizontal margin between the rectangle border and
  // text
  var note_margin_x = 20;
  // Vertical margin between the rectangle border and text
  var note_margin_y = 10;
  // Append a group for the explanatory note and surrounding
  // rectangle
  var note = zoom_layer.append("g")
    .attr("id","zoom_note")
  // Add a text description
  var note_text = note.append("text")
    .attr("font-size","12px")
    .attr("dy", "0.35em")
    .attr("text-anchor","middle")
    .text("Click the background of one of the large, colored circles to zoom into a critical issue category and reveal images of candidates with stances on the relevant critical issue. Click the image of a candidate for more detail or click outside the large, colored circle to zoom out")
    // The wrap function will be called to format the text 
    // element to include line breaks when the width of a line 
    // of text exceeds an input width via appended tspan
    // elements.
    // In order to ensure that each tspan element is placed
    // below the previous one, the text element must have
    // an x and y attribute specified.
    .attr("x",255)
    .attr("y",h)
    .call(wrap,450);
  // Create a rectangle centered around the explanatory
  // note
  note.append("rect")
    // Location for the rectangle
    .attr("x",10)
    .attr("y",h-15)
    .attr("stroke","black")
    .attr("stroke-width",1)
    .attr("width",note.node().getBBox().width+(note_margin_x*2))
    .attr("height",note.node().getBBox().height+note_margin_y)
    .attr("fill-opacity",0)

  /**
   * Function to execute when a node is clicked to zoom in
   *  @param d d3 current data element
   */
  function click_zoom(d){
    // Only display the critical issue category headings 
    // (corresponding to class "zoomtext_main") and 
    // explanatory note text with rectangle if the 
    // visualization is in the default level of zoom. Make 
    // the critical issue category headings and explanatory
    // note text with rectangle hidden for all
    // other levels of zoom.
    if(zoomNode.depth==1&&d.depth==0){
      // Critial issue category headings visible in default
      // level of zoom
      d3.selectAll("tspan.zoomtext_main")
        .transition()
        .duration(500)
        .style("opacity",1);
      // Explanatory note text with rectangle visible in 
      // default level of zoom
      d3.select("#zoom_note")
        .transition()
        .duration(500)
        .style("opacity",1);
    }
    else{
      // Critial issue category headings hidden in all other
      // levels of zoom
      d3.selectAll("tspan.zoomtext_main")
        .transition()
        .duration(500)
        .style("opacity",0);
      // Explanatory note text with rectangle hidden in all
      // other levels of zoom
      d3.select("#zoom_note")
        .transition()
        .duration(500)
        .style("opacity",0);
    }
    // If the zoomNode is the current data element and the 
    // depth of the zoom is 2 (most focused level of zoom), 
    // perform the following
    if(zoomNode==d && d.depth==2){
      // Flag value of 1 indicates the most focused level of 
      // zoom has been reached. Text is displayed
      // corresponding to the candidate of the node that is 
      // being zoomed into
      zoomFlag = 1;
      // Select the circle with the corresponding
      // circle_text_id to the node that was clicked on and
      // change the opacity to 1
      d3.select("#circle"+d.circle_text_id)
        .transition("circle_on")
        .duration(300)
        .style("opacity",1);
      // Get the x and y attributes of the text corresponding
      // to the node that was clicked on so that the original
      // position of the text is known 
      var prev_x = document.getElementById("text"+d.circle_text_id).getAttribute("x");
      var prev_y = document.getElementById("text"+d.circle_text_id).getAttribute("y");
      // Move the header for the text upward to make room
      // for additional text below
      d3.select("#text"+(d.circle_text_id)+" tspan.zoomtext_head")
        .attr("y",function(d){
          return prev_y-160;
        })
        .attr("x",function(d){
          return prev_x;
        })
        // The text for the header is the name of the 
        // candidate
        .text(function(d){
          var curr_name = d.data.name;
          curr_name = curr_name[0].toUpperCase()+curr_name.slice(1);
          curr_name = curr_name.replace('_',' ');
          return curr_name;
        })
      // Add text below the header with more information about
      // the key criticism described in the header
      d3.select("#text"+(d.circle_text_id)+" tspan.zoomtext_body")
        .attr("y",function(d){
          return prev_y-140;
        })
        .attr("x",function(d){
          return prev_x;
        })
        .text(function(d){
          return d.data.text;
        })
        // Call the "wrap" function on the text body so that
        // the widths of each line are a maximum of 325 
        // pixels
        .call(wrap,325);
    }
    // If the zoomNode is not the current data element and the 
    // depth of the zoom is not 2 (most focused level of zoom), 
    // perform the following
    else{
      // Change the opacity of all circles as follows
      d3.selectAll("circle.zoom")
        .transition("circle_off")
        .duration(300)
        .style("opacity",function(d){
          // There are three levels of zoom: the 0th-level
          // of zoom is the default level displayed in the
          // visualization, in which all key issues categories
          // are visible. The 1st-level of zoom involves a 
          // zoom into one of these key issue categories. 
          // Images of all the candidates who have a stance
          // on the current key issue category are visible.
          // The 2nd-level of zoom involves a zoom into one
          // of the candidates. A header and text body 
          // describing the candidate's stance on the current
          // key issue category are visible.
          // Set the opacity of all circles in the 0th-level
          // of zoom to 1
          if(d.depth==0){
            return 1;
          }
          // Set the opacity of all circles in the 1st-level
          // of zoom to 0.1
          else if(d.depth==1){
            return 0.1;
          }
          // Set the opacity of all circles in the 2nd-level
          // of zoom to 0.5
          else{
            return 0.5;
          }
      });
      // If zoomFlag is equal to 1 (but the node that was
      // clicked by the user is not in the 2nd-level of 
      // zoom), this indicates the user is zooming out of
      // the most focused level of zoom (showing text for
      // a candidate on a key issue category), and into
      // the 1st-level of zoom which shows images of
      // candidates who have stances on the current key issue
      // category. Therefore select the text header and body
      // previously displayed in the most focused level of
      // zoom and remove all text so that it is no longer 
      // displayed once the visualization returns to the 
      // 1st-level of zoom
      if(zoomFlag==1){
        d3.select("#text"+(zoomNode.circle_text_id)+" tspan.zoomtext_head")
          .attr("y",function(d){
            return null;
          })
          .attr("x",function(d){
            return null;
          })
          .text(function(d){
            return "";
          })
        d3.select("#text"+(zoomNode.circle_text_id)+" tspan.zoomtext_body")
          .attr("y",function(d){
            return prev_y;
          })
          .attr("x",function(d){
            return prev_x;
          })
          .text(function(d){
            return "";
          });
        zoomFlag = 0;
      }
      // Call the zoom function to execute the zoom itself
      zoom(d);
    }
  }
}

/**
 * Function to initialize all elements for the "Rank"
 * Visualization in the main SVG
 */
function update_rank(){
  // Original size of images displayed on the left-hand side
  // of the diverging stacked bar chart
  var imageSizeOrig = 25;
  // Original offset for images displayed on the left-hand 
  // side of the diverging stacked bar chart
  var imageOffsetXOrig = -40;
  var imageOffsetYOrig = 0;
  // Enlarged size of images when hovered over
  var imageSizeLarge = 50;
  // New offset for images when hovered over
  var imageOffsetXLarge = -60;
  var imageOffsetYLarge = -10;
  // Margin for the chart
  var margin = {
    top:50,
    right:20,
    bottom:10,
    left:95
  }
  // x and y d3 scales 
  var y = d3.scaleBand()
    .rangeRound([0,h])
  var x = d3.scaleLinear()
    .rangeRound([0,w])
  // d3 color scale
  var color = d3.scaleOrdinal()
    .range(["#E0F0B5","#9FE5BF","#3B97E2"])
  // Initialize the x and y axes at the top and left sides
  // of the chart, respectively
  var xAxis = d3.axisTop(x);
  var yAxis = d3.axisLeft(y);
  // Append a group to contain all elements of the "Rank"
  // Visualization
  var rank_layer = g.append("g")
    .attr("transform","translate("+margin.left+","+margin.top+")")
    .attr("id","rank_layer")
    // Set all elements in the group so that the opacity
    // is 0 and all elements cannot be clicked
    .style("opacity",0)
    .classed("no_click",true);
  // Domain for d3 color scale
  color.domain(["Unfavorable","None","Favorable"])
  // Function to convert each row of the 'ranks.csv' file into 
  // an object with the specified properties
  rankdata = transformRankData(pierankdata,color);
  // Function to modify the rankdata array containing 
  // favorability percentages for candidates
  getRankData();
  // Minimum x0 value of all the rows of the chart (the 
  // left-most position of bars on the chart)
  var min_val = d3.min(rankdata,function(d){
    return d.boxes["0"].x0;
  });
  // Maximum x1 value of all the rows of the chart (the
  // right-most position of bars on the chart)
  var max_val = d3.max(rankdata,function(d){
    return d.boxes["2"].x1;
  });
  // Domain for the x axis is determined by the min_val and
  // max_val
  x.domain([min_val,max_val]).nice();
  // Domain for the y axis is determined by the names of all
  // candidates
  y.domain(rankdata.map(function(d){
    return d.name.replace('_',' ');
  }));
  // Append a group for the x axis
  var g_xAxis = rank_layer.append("g")
    .attr("class","rank_x axis")
    .call(xAxis);
  // Append a group for the y axis
  var g_yAxis = rank_layer.append("g")
    .attr("class","rank_y axis")
    .call(yAxis);
  // Append a group for each bar of the chart
  var vakken = rank_layer.selectAll("g.bar")
    .data(rankdata)
    .enter()
    .append("g")
      .attr("class","bar")
      // Translate the bar to the correct position using 
      // the name of the corresponding candidate, which 
      // has a unique position on the y axis
      .attr("transform",function(d){
        return "translate(0,"+y(d.name.replace('_',' '))+")";
      })
  // Append a subgroup with data for the position and size
  // of each bar
  var bars = vakken.selectAll("g.subbar")
      .data(function(d){
        return d.boxes;
      })
      .enter()
      .append("g")
      .attr("class","subbar");
  // Append a rect for each group
  bars.append("rect")
      .attr("class","rank")
      // Height of a bar is determined by the bandwidth
      // of the y axis
      .attr("height",y.bandwidth())
      // The left-most position of a bar is determined by
      // the value of x0
      .attr("x",function(d){
        return x(d.x0);
      })
      // The width of a bar is determined by the difference
      // between the value of x1 and x0
      .attr("width",function(d){
        return x(d.x1)-x(d.x0);
      })
      .on("mouseover",function(d){
        // When the user mouses over a bar on the chart, the
        // image of the corresponding candidate is displayed
        // instead of the text label on the y-axis.
        // To achieve this change in the visualizationm first
        // change the opacity of text for all labels on the
        // y axis to 1.
        g_yAxis.selectAll("text")
          .transition()
          .duration(0)
          .style("opacity",1);
        // Change the opacity of images on the left side of
        // the y axis to 0
        d3.selectAll("image.rank")
          .transition()
          .duration(0)
          .style("opacity",0);
        // Change the opacity of only the image for the 
        // candidate corresponding to the bar being moused
        // over to 1
        d3.select("#rank_image_"+d.name.replace(/'/g, ''))
          .transition()
          .duration(0)
          .style("opacity",1);
        // Change the opacity of only the text label on the
        // y-axis for the candidate corresponding to the
        // bar being moused over to 0
        d3.select("#axistext_"+d.name.replace(/'/g, ''))
          .transition()
          .duration(0)
          .style("opacity",0);
      })
      // Fill color for the bar is determined by the d3
      // color scale and rank property of the data
      .style("fill",function(d){
        return color(d.rank);
      });
  // Append text to a bar showing the percentage favorability
  // corresponding to the bar
  bars.append("text")
      // The x position of the text is determined by the
      // value of x0
      .attr("x",function(d){
        return x(d.x0);
      })
      .attr("class","rank")
      // The y position of the text is determined by the
      // bandwidth of the y axis
      .attr("y",y.bandwidth()/2)
      .attr("dy","0.5em")
      .attr("dx","0.5em")
      .style("font","10px sans-serif")
      .style("text-anchor","begin")
      // Only display text for the percentage favorability
      // of a bar if the width of a bar is greater than 3
      .text(function(d){
        return d.n !== 0 && (d.x1-d.x0)>3 ? d.n+'%' : "";
      });
   // Append an image to the group
   vakken.append("image")
      .attr("id",function(d){
        return "rank_image_"+d.name.replace(/'/g, '');
      })
      .style("opacity",0)
      .classed("no_click",true)
      .attr("class","rank")
      .on("mouseenter",function(){
        // When mousing over an image, enlarge its size 
        // and offset slightly for ease of visualization
        d3.select(this)
            .transition()
            .duration(0)
            .attr("x",function(d){
                return imageOffsetXLarge;
            })
            .attr("y",function(d){
                return imageOffsetYLarge;
            })
            .attr("height",imageSizeLarge)
            .attr("width",imageSizeLarge);
        })
      // When the mouse leaves an image, return it to its
      // original size and offset
      .on("mouseleave",function(){
          d3.select(this)
              .transition()
              .duration(0)
              .attr("x",function(d){
                  return imageOffsetXOrig;
              })
              .attr("y",function(d){
                  return imageOffsetYOrig;
              })
              .attr("height",imageSizeOrig)
              .attr("width",imageSizeOrig);
      })
      .attr("xlink:href",function(d){
        return d.img;
      })
      .attr("x",function(d){
        return -40;
      })
      .attr("y",function(d){
        return 0;
      })
      .attr("height",function(d){
        return imageSizeOrig;
      })
      .attr("width",function(d){
        return imageSizeOrig;
      });
  // Insert a rectangle for each row of the chart with 
  // width equal to the width of the SVG to demonstrate the
  // horizontal extent of the chart
  vakken.insert("rect",":first-child")
      .attr("height",y.bandwidth())
      .attr("x","1")
      .attr("width",w)
      .attr("fill-opacity","0.5")
      .style("fill","#F5F5F5")
  // Append a group with vertical line indicating the '0'
  // position of the chart
  rank_layer.append("g")
      .attr("class","rank_y axis")
      .append("line")
        .attr("x1",x(0))
        .attr("x2",x(0))
        .attr("y2",h);
  // Append a group for the legend
  var startp = rank_layer.append("g")
      .attr("class","legendbox")
      .attr("id","mylegendbox");
  // Use the bounding box for the "vakken" selection to
  // determine the location of each element of the legend
  legend_tab_unfavorable = 0; 
  legend_tab_none = w/2 - vakken.node().getBBox().width/5;
  legend_tab_favorable = w - vakken.node().getBBox().width/3;
  var legend_tabs = [legend_tab_unfavorable,legend_tab_none,legend_tab_favorable];
  // Append a group for each element of the legend
  var legend = startp.selectAll("g.rank_legend")
      .data(['Unfavorable','Never Heard Of / No Opinion','Favorable'])
      .enter()
      .append("g")
      .attr("class","rank_legend")
      .attr("transform",function(d,i){
        return "translate("+legend_tabs[i]+",-45)"
      });
  // Append a rectangle for each element of the legend to 
  // correspond to the color of a category on the chart
  legend.append("rect")
      .attr("x",0)
      .attr("width",18)
      .attr("height",18)
      .style("fill",function(d,i){
        return color.range()[i];
      });
  // Append text for each element of the legend describing
  // the corresponding category on the chart
  legend.append("text")
      .attr("x",22)
      .attr("y",9)
      .attr("dy",".35em")
      .style("text-anchor","begin")
      .style("font","10px sans-serif")
      .text(function(d){
        return d;
      });
  // Modify style properties for paths and lines on the chart
  d3.selectAll(".axis path")
      .style("fill","none")
      .style("stroke","#000")
      .style("shape-rendering","crispEdges");
  d3.selectAll(".axis line")
      .style("fill","none")
      .style("stroke","#000")
      .style("shape-rendering","crispEdges");
  // Associate an id with each text label on the y-axis
  var temp = g_yAxis.selectAll("text")
      .attr("id",function(d){
        return "axistext_"+d.replace(/'/g, '').replace(' ','_');
      })
}

/**
 * Function to initialize all elements for the "Tree"
 * Visualization in the main SVG
 */
function update_tree(){
  /**
   * Function determining the value of the forceX force in the 
   * simulation
   *  @param d d3 current data element
   */
  var forceXLoc = function(d){
    // "tree_nodes_locs" contains information about the
    // location of the experience category nodes. Set the 
    // forceX force for these nodes such that they are 
    // attracted to their original positions 
    if(experience_keys.includes(d.id)){
      return tree_nodes_locs[d.id][0];
    }
    // Otherwise set the point of attraction for the forceX
    // force to the center of the visualization 
    else{
      return w/2;
    }
  }

  /**
   * Function determining the strength of the forceX force in 
   * the simulation
   *  @param d d3 current data element
   */
  var forceXStrength = function(d){
    // If the node under consideration is the node
    // corresponding to the "political" experience category,
    // set the strength to 1. For all other experience
    // category nodes, set the strength to 0.5. 
    if(experience_keys.includes(d.id)){
      if(d.id=='political'){
        return 1;
      }
      else{
        return 0.5;
      }
    }
    // For all other nodes set the strength to 0.1
    else{
      return 0.1;
    }
  }

  /**
   * Function determining the value of the forceY force in the 
   * simulation
   *  @param d d3 current data element
   */
  var forceYLoc = function(d){
      // "tree_nodes_locs" contains information about the
    // location of the experience category nodes. Set the 
    // forceY force for these nodes such that they are 
    // attracted to their original positions 
    if(experience_keys.includes(d.id)){
      return tree_nodes_locs[d.id][1];
    }
    // Otherwise set the point of attraction for the forceY
    // force to slightly above the center of the visualization 
    else{
      return (h/2)-100;
    }
  }

  /**
   * Function determining the strength of the forceY force in 
   * the simulation
   *  @param d d3 current data element
   */
  var forceYStrength = function(d){
    // If the node under consideration is the node
    // corresponding to the "political" experience category,
    // set the strength to 1. For all other experience
    // category nodes, set the strength to 0.5. 
    if(experience_keys.includes(d.id)){
      if(d.id=='political'){
        return 1;
      }
      else{
        return 0.5;
      }
    }
    // For all other nodes set the strength to 0.1
    else{
      return 0.1;
    }
  }
  // Original size of images displayed in the visualization
  var imageSizeOrig = 50;
  // Enlarged size of images in the visualization upon 
  // mouse over
  var imageSizeLarge = 100;
  // Original offset of images displayed in the visualization
  var imageOffsetOrig = -25;
  // Offset of images when enlarged upon mouse over
  var imageOffsetLarge = -60;
  // Initialize force simulation 
  var force_tree = d3.forceSimulation();
  // Nodes for the force simulation 
  var nodes = experience_obj.nodes;
  // Links for the force simulation
  var links = experience_obj.links;
  force_tree
      // Force determines how far the nodes are pushed apart
      .force("charge",d3.forceManyBody().strength(-2500))
      // Force determines how long the links should be
      .force("link",d3.forceLink().id(function(d){return d.id}).distance(40))
      // Force determines what x coordinate the nodes should
      // be attracted to and with what strength
      .force("x",d3.forceX(forceXLoc).strength(forceXStrength))
      // Force determines what y coordinate the nodes should
      // be attracted to and with what strength
      .force("y",d3.forceY(forceYLoc).strength(forceYStrength))
      // Force determines with what strength nodes should
      // collide away from each other and the radius at which
      // the collision force should begin to occur
      .force("collision",d3.forceCollide().strength(1).radius(50))
      // Call the tick function on every iteration of the 
      // simulation
      .on("tick",tick)
      // Define the nodes of the simulation
      .nodes(nodes)
      // Define the links of the simulation
      .force("link").links(links);
  // Append a group to contain all elements of the "Tree"
  // Visualization
  var tree_layer = g.append("g")
      .attr("id","tree_layer")
      // Set all elements in the group so that the opacity
      // is 0 and all elements cannot be clicked
      .style("opacity",0)
      .classed("no_click",true) 
  // Draw paths for the links of the simulation
  var path = tree_layer.selectAll("path.link")
      .data(links,function(d){
          return d.target.id;
      });
  path.enter().insert("svg:path")
      // Color the links according to the color property
      // of the data
      .attr("class",function(d){
          return d.color;
      })
      .classed("link",true)
      .attr("id",function(d){
          return d.id;
      })
      .attr("marker-end","url(#end)")
      .style("opacity",0)
      .style("stroke",function(d){
          return d.color;
      });
  path.exit().remove();
  // Append groups for each node
  var node = tree_layer.selectAll("g.node")
      .data(nodes,function(d){
          return d.id;
      });
  nodeEnter = node.enter().append("svg:g")
      // The nodes corresponding to experience categories
      // will always have an opacity of 1 and will be
      // assigned the class "full_opacity" to indicate this
      // property. 
      // When a node is clicked in general, it will have an 
      // opacity of 1 while all other nodes will have a lower
      // opacity. The "full_opacity" class will be assigned to
      // the class that wasc clicked so that it can be given 
      // an opacity of 1
      .attr("class",function(d){
          if(d.id[0]==d.id[0].toLowerCase()){
              return "full_opacity";
          }
      })
      .classed("node",true)
      .attr("transform",function(d){
          return "translate("+d.x+","+d.y+")"
      })
      .attr("id",function(d){
          return d.id.replace(/'/g, '');
      })
      // Call the click_tree function on click
      .on("click",click_tree)
      // Functions to call on drag
      .call(d3.drag()
          // Restart the simulation
          .on("start",function(d){
            if (!d3.event.active) force_tree.alphaTarget(0.3).restart();
            d.fx = d.x;
            d.fy = d.y;
          })
          // Update the position of the node to follow the 
          // cursor
          .on("drag",function(d){
            d.fx = d3.event.x;
            d.fy = d3.event.y;
          })
          // Cool the simulation
          .on("end",function(d){
            if (!d3.event.active) force_tree.alphaTarget(0);
            d.fx = null;
            d.fy = null;
          })
      );
  // Append a circle to each group
  nodeEnter.append("svg:circle")
      .attr("r",function(d){
          return Math.sqrt(d.size) / 10 || 4.5;
      })
      .style("opacity",0)
      .classed("tree",true)
      .style("fill","black");
  // Append an image to each group
  var images = nodeEnter.append("svg:image")
      .attr("xlink:href",function(d){
          return d.img;
      })
      .attr("x",function(d){
          return imageOffsetOrig;
      })
      .attr("y",function(d){
          return imageOffsetOrig;
      })
      .attr("opacity",0)
      .classed("tree",true)
      .attr("height",imageSizeOrig)
      .attr("width",imageSizeOrig);
  var setEvents = images
      .on("mouseenter",function(){
          // On mousing over an image, enlarge its size and
          // change its offset
          d3.select(this)
              .transition()
              .attr("x",function(d){
                  return imageOffsetLarge;
              })
              .attr("y",function(d){
                  return imageOffsetLarge;
              })
              .attr("height",imageSizeLarge)
              .attr("width",imageSizeLarge);
      })
      // When the mouse leaves the image, return it to its
      // original size and offset
      .on("mouseleave",function(){
          d3.select(this)
              .transition()
              .attr("x",function(d){
                  return imageOffsetOrig;
              })
              .attr("y",function(d){
                  return imageOffsetOrig;
              })
              .attr("height",imageSizeOrig)
              .attr("width",imageSizeOrig);
      })
  node.exit().remove();
  path = tree_layer.selectAll("path.link");
  node = tree_layer.selectAll("g.node");

  // Add an explanatory note for the visualization,
  // consisting of explanatory text and a rectangle 
  // surrounding the text
  // Horizontal margin between the rectangle border and
  // text
  var note_margin_x = 10;
  // Vertical margin between the rectangle border and text
  var note_margin_y = 14;
  // Append a group for the explanatory note and surrounding
  // rectangle
  var note = tree_layer.append("g")
  // Add a text description
  var note_text = note.append("text")
    .attr("font-size","12px")
    .attr("dy", "0.35em")
    .attr("text-anchor","middle")
    .text("Click an image to filter the display and reveal more information. Click the white background to return")
    // The wrap function will be called to format the text 
    // element to include line breaks when the width of a line 
    // of text exceeds an input width via appended tspan
    // elements.
    // In order to ensure that each tspan element is placed
    // below the previous one, the text element must have
    // an x and y attribute specified.
    .attr("x",185)
    .attr("y",h-310)
    .call(wrap,135);
  // Create a rectangle centered around the explanatory
  // note
  note.append("rect")
    // Location for the rectangle
    .attr("x",110)
    .attr("y",h-325)
    .attr("stroke","black")
    .attr("stroke-width",1)
    .attr("width",note.node().getBBox().width+(note_margin_x*2))
    .attr("height",note.node().getBBox().height+note_margin_y)
    .attr("fill-opacity",0)

  /**
   * Function to execute in the "Tree" Visualization when the
   * user clicks a node. Changes opacity of all nodes and
   * displays a tooltip for the node that was clicked.
   *  @param d d3 current data element
   */
  function click_tree(d){
    // "index_arr" contains the ids of all the links connected
    // to the input node
    var index_arr;
    // For all experience category nodes perform the following
    if(Object.keys(d).includes('candidates')){
        // "candidates_show" is an array of all the candidates
        // associated with the current experience category
        // node. The nodes corresponding to these candidates
        // will be fully visible
        var candidates_show = d.candidates;
        // "candidates_hide" is an array of all other 
        // candidates. The nodes corresponding to these 
        // candidates will be hidden
        var candidates_hide = arr_diff(candidates_show,names)
        for(i=0;i<candidates_hide.length;i++){
            // Change the opacity of every node that should
            // be hidden to 0.2
            d3.select("g#"+candidates_hide[i].replace(/'/g, ''))
                .transition()
                .duration(0)
                .style("opacity",0.2);
        }
        for(i=0;i<candidates_show.length;i++){
            // Change the opacity of every node that should
            // be visible to 1
            d3.select("g#"+candidates_show[i].replace(/'/g, ''))
                .transition()
                .duration(0)
                .style("opacity",1.0);
        }
        // Create an array of all links that are connected
        // to the current experience category node
        index_arr = experience_links_icon(d.id);
        // The current id of the clicked node contains the
        // name of the candidate or experience category 
        // corresponding to the node. Display this name
        // in a tooltip
        var curr_id = d.id;
        curr_id = curr_id.charAt(0).toUpperCase()+curr_id.slice(1);
        tooltipTree.html(curr_id.replace('_',' '))
            .style("visibility","visible")
            .style("top",d.y+'px')
            .style("left",d.x+'px');
    }
    // For candidate nodes that are clicked perform the 
    // following
    else{
        var curr_node = this;
        // Change the class of the clicked node to 
        // full_opacity so that it will be displayed with full
        // opacity
        d3.select(curr_node).classed("full_opacity",true);
        // Select all nodes and change the opacity to 0.2
        d3.selectAll("g.node")
            .transition()
            .duration(0)
            .style("opacity",0.2);
        // For the clicked node with class "full_opacity"
        // change the opacity to 1
        d3.selectAll("g.full_opacity")
            .transition()
            .duration(0)
            .style("opacity",1.0);
        // Remove the "full_opacity" class from the clicked
        // node as it is no longer necessary for identifying
        // the node as requiring an opacity of 1
        d3.select(curr_node).classed("full_opacity",false);
        // Create an array of all links that are connected
        // to the current candidate node
        index_arr = experience_links_cand(d.id);
        // Display a tooltip with the name of the candidate
        // corresponding to the current node
        tooltipTree.html("<strong>"+d.id.replace('_',' ')+"</strong>"+"<br>"+d.text)
        .style("visibility","visible")
        .style("top",d.y-100+'px')
        .style("left",d.x+'px');
    }
    // Change the opacity of all links to 0.2
    d3.selectAll("path.link")
        .transition()
        .duration(0)
        .style("opacity",0.2);
    // Change the opacity of all links connected to the 
    // current candidate node to 1
    for(i=0;i<index_arr.length;i++){
        d3.select("path#"+index_arr[i].toString())
            .transition()
            .duration(0)
            .style("opacity",1.0);
    }
    d3.event.stopPropagation();
  }
  // tick() function to call on every iteration of the 
  // simulation to move all nodes and links to their new
  // positions
  function tick(){
      path.attr("d",function(d){
          var dx = d.target.x - d.source.x;
          var dy = d.target.y - d.source.y;
          var dr = Math.sqrt(dx*dx+dy*dy);
          return "M"+d.source.x+","+d.source.y+"A"+dr+","+dr+" 0 0,1 "+d.target.x+","+d.target.y;
      });
      node.attr("transform",nodeTransform);
      // When the "Tree" Visualization is initialized, the
      // experience category nodes will have fixed positions
      // to ensure an ideal initial layout for the force 
      // simulation. These fixed positions must be removed
      // to enable the nodes to move as required by the 
      // force simulation. When the alpha level of the force
      // simulation has cooled to 0.4, perform the following
      if(force_tree.alpha()<0.4){
        // Remove the fixed x and y positions of the
        // experience category nodes
        experience_obj.nodes[0].fx = null;
        experience_obj.nodes[0].fy = null;
        experience_obj.nodes[1].fx = null;
        experience_obj.nodes[1].fy = null;
        // Display all circles in the visualization
        d3.selectAll("circle.tree")
          .transition("circle_tree_appear")
          .duration(100)
          .style("opacity",1);
        // Display all images in the visualization
        d3.selectAll("image.tree")
          .transition("image_tree_appear")
          .duration(100)
          .style("opacity",1);
      }
      // When the alpha level of the force simulation has
      // cooled to 0.2, perform the following
      if(force_tree.alpha()<0.2){
        // Remove the fixed x and y positions of the 
        // experience category nodes
        experience_obj.nodes[0].fx = null;
        experience_obj.nodes[0].fy = null;
        experience_obj.nodes[1].fx = null;
        experience_obj.nodes[1].fy = null;
        // Display all links in the visualization
        d3.selectAll("path.link")
          .transition("path_link_appear")
          .duration(100)
          .style("opacity",1);
      }
  }
}

// Functions used to set up the visualization
/**
 * scrollVis encapsulates all the code for the visualization
 * using a reusable charts pattern
 */
var scrollVis = function(){
    // Constants to define the size and margins of the
    // visualization area
    var width = 600;
    var height = 520;
    var margin = { top: 0, left: 20, bottom: 40, right: 10 };
    // "lastindex" and "activeIndex" keep track of which 
    // visualization we are on and which was the last index
    // activated. When user scrolls quickly, we want to call 
    // all the activate functions that they pass.
    var lastIndex = -1;
    var activeIndex = 0;
    // When scrolling to a new section, the activation 
    // function for that section is called. "activateFunctions"
    // is an array of the functions to call
    var activateFunctions = [];
    // If a section has an update function then it is called 
    // while scrolling through the section with the current
    // progress through the section. "updateFunctions" is
    // an array of the functions to call
    var updateFunctions = [];
  
    /**
     * Append the main SVG and call functions to set up the
     * elements of each of the charts in the visualization 
     * @param selection The current d3 selection(s) to draw
     *                  the visualization in. For this
     *                  example, we will be drawing it in 
     *                  #vis
     */
    var chart = function(selection){
      // Margins
      var margin = {top:0,left:20,bottom:40,right:10};
      // Main SVG
      vis = d3.select("#vis").append("svg").attr("width",w+margin.left+margin.right).attr("height",h+margin.top+margin.bottom);
      selection.each(function(rawData){
        // Append a group to the SVG
        vis.append('g');
        // This group element will be used to contain all
        // other elements of charts in the visualization
        g = vis.select('g');
        // Creates initial elements for all charts of the 
        // visualization 
        setupVis();
        // Sets up functions to call when sections are
        // scrolled over
        setupSections();
      });
    };
    /**
     * setupVis creates initial elements for all charts of
     * the visualization.
     */
    var setupVis = function () {
      // Function to modify the candidates array containing 
      // data on key facts, stances on critical issues, and 
      // key criticisms for each candidate
      getCandidates();
      // Initialize all elements for the "Pie" Visualization
      update_pie();
      // Initialize all elements for the "Rank" Visualization
      update_rank();
      // Initialize all elements for the "Map" Visualization
      update_map();
      // Initialize all elements for the "Tree" Visualization
      update_tree();
      // Initialize all elements for the "Zoom" Visualization
      update_zoom();
      // Initialize all elements for the "Grid" Visualization
      update_grid();
    };
    /**
     * Associate functions to be called with each section 
     * based on the section's index
     */
    var setupSections = function(){
      // activateFunctions are called each time the active 
      // section changes
      // Function to call when the "Pie" section is scrolled
      // over
      activateFunctions[0] = showPie;
      // Function to call when the "Rank" section is scrolled
      // over
      activateFunctions[1] = showRank;
      // Function to call when the "Map" section is scrolled
      // over
      activateFunctions[2] = showMap;
      // Function to call when the "Tree" section is scrolled
      // over
      activateFunctions[3] = showTree;
      // Function to call when the "Zoom" section is scrolled
      // over
      activateFunctions[4] = showZoom;
      // Function to call when the "Grid" section is scrolled
      // over
      activateFunctions[5] = showGrid;
      // updateFunctions are called while in a particular 
      // section to update the scroll progress in that section.
      // Most sections do not need to be updated for all 
      // scrolling and so are set to no-op functions.
      // For this visualization there are no update functions
      // to call
      for (var i=0;i<6;i++){
        updateFunctions[i] = function(){};
      }
    };
  
    /**
     * ACTIVATE FUNCTIONS
     * The following functions will be called when their
     * corresponding sections are scrolled over. The general 
     * pattern is to ensure all content for the current 
     * section is transitioned in, while hiding the content 
     * for the previous section as well as the next section 
     * (as the user may be scrolling up or down).
     */
     /**
     * Function to call when the "Pie" section is scrolled
     * over
     * Hides: "Rank" Visualization in the subsequent step
     * (no previous step to hide)
     * Shows: "Pie" Visualization 
     */
    function showPie() {
      g.select('#pie_layer')
        .classed("no_click",false)
        .transition()
        .duration(500)
        .style("opacity",1)
      g.select("#rank_layer")
        .classed("no_click",true)
        .transition()
        .duration(0)
        .style("opacity",0)
      // Removes click events for the main SVG
      vis.on("click",null);
    }
     /**
     * Function to call when the "Rank" section is scrolled
     * over
     * Hides: "Pie" Visualization in the previous step
     *        "Map" Visualization in the subsequent step
     * Shows: "Rank" Visualization 
     */
    function showRank() {
      g.select("#pie_layer")
        .classed("no_click",true)
        .transition()
        .duration(100)
        .style("opacity",0)
      g.select('#rank_layer')
        .classed("no_click",false)
        .transition()
        .duration(500)
        .style("opacity",1)
      g.select("#map_layer")
        .classed("no_click",true)
        .transition()
        .duration(0)
        .style("opacity",0)
      // Removes click events for the main SVG
      vis.on("click",null);
    }
     /**
     * Function to call when the "Map" section is scrolled
     * over
     * Hides: "Rank" Visualization in the previous step
     *        "Tree" Visualization in the subsequent step
     * Shows: "Map" Visualization 
     */
    function showMap() {
      g.select("#map_layer")
        .classed("no_click",false)
        .transition()
        .duration(500)
        .style("opacity",1)
      g.select("#rank_layer")
        .classed("no_click",true)
        .transition()
        .duration(0)
        .style("opacity",0)
      g.select("#tree_layer")
        .classed("no_click",true)
        .transition()
        .duration(0)
        .style("opacity",0)
      // Hide the tooltip for the "Tree" Visualization in
      // the subsequent step
      tooltipTree.style("visibility","hidden");
      // Removes click events for the main SVG
      vis.on("click",null);
    }
     /**
     * Function to call when the "Tree" section is scrolled
     * over
     * Hides: "Map" Visualization in the previous step
     *        "Zoom" Visualization in the subsequent step
     * Shows: "Tree" Visualization 
     */
    function showTree() {
      g.select("#map_layer")
        .classed("no_click",true)
        .transition()
        .duration(0)
        .style("opacity",0)
      g.select("#zoom_layer")
        .classed("no_click",true)
        .transition()
        .duration(0)
        .style("opacity",0)
      g.select("#tree_layer")
        .classed("no_click",false)
        .transition()
        .duration(500)
        .style("opacity",1)
      // Add a click event to the main SVG. Typically when
      // the user clicks a node, all other nodes become 
      // hidden and links not connected to the clicked node
      // become hidden. When the user clicks the main SVG
      // instead, this indicates they wish to return the 
      // visualization to its default state with all nodes
      // and links visible. This click callback function 
      // performs this change to the visualization.
      vis.on("click",function(){
        // The equalToEventTarget() and d3 filter() functions 
        // are used to determine if the user's click event was 
        // inside or outside "nodeEnter," which is a selection 
        // of all the groups corresponding to nodes for the 
        // force layout. If the user's click event was outside 
        // "nodeEnter", perform the following
          var outside = nodeEnter.filter(equalToEventTarget).empty();
          if(outside){
              // Set the opacity of all links to 1
              d3.selectAll("path.link")
                  .transition()
                  .duration(0)
                  .style("opacity",1.0);
              // Set the opacity of all nodes to 1
              d3.selectAll("g.node")
                  .transition()
                  .duration(0)
                  .style("opacity",1.0);
          }
          // Set the visibility in the tooltip for the "Tree"
          // visualization to hidden
          tooltipTree.style("visibility","hidden");
      })
    }
     /**
     * Function to call when the "Zoom" section is scrolled
     * over
     * Hides: "Tree" Visualization in the previous step
     *        "Grid" Visualization in the subsequent step
     * Shows: "Zoom" Visualization 
     */
    function showZoom() {
      g.select("#tree_layer")
        .classed("no_click",true)
        .transition()
        .duration(0)
        .style("opacity",0)
      g.select("#zoom_layer")
        .classed("no_click",false)
        .transition()
        .duration(500)
        .style("opacity",1)
      g.select("#grid_layer")
        .classed("no_click",true)
        .transition()
        .duration(0)
        .style("opacity",0)
      // For all images in the "Zoom" Visualization set the
      // opacity as follows, which is the desired default
      // state
      g.selectAll("image.zoom")
        .transition()
        .duration(0)
        .style("opacity",function(d){
          return d.r>20 ? 1 : 0;
        });
      // For all circles in the "Zoom" Visualization set the
      // opacity as follows, which is the desired default
      // state
      g.selectAll("circle.zoom")
        .transition()
        .duration(0)
        .style("opacity",function(d){
          if(d.depth==0){
            return 1;
          }
          else if(d.depth==1){
            return 0.1;
          }
          else{
            return 0.5;
          }
        });
      // For all text in the "Zoom" Visualization set the
      // opacity as follows, which is the desired default
      // state
      g.selectAll("text.zoom")
        .transition()
        .duration(0)
        .style("opacity",function(d){
          return d.r > 20 ? 1 : 0;
        });
      // Removes click events for the main SVG
      vis.on("click",null);
      // Set the visibility of the tooltip in the "Tree"
      // Visualization to hidden
      tooltipTree.style("visibility","hidden");
    }
    /**
     * Function to call when the "Grid" section is scrolled
     * over
     * Hides: "Zoom" Visualization in the previous step
     * (no subsequent step to hide)
     * Shows: "Grid" Visualization 
     */
    function showGrid() {
      g.select("#zoom_layer")
        .classed("no_click",true)
        .transition()
        .duration(0)
        .style("opacity",0)
      g.select("#grid_layer")
        .classed("no_click",false)
        .transition()
        .duration(500)
        .style("opacity",1)
      // Add a click event to the main SVG. Returns all nodes
      // to their original size in the grid
      vis.on("click",grid_out_click);
    }
  
    /**
     * UPDATE FUNCTIONS
     * These functions will be called within a section
     * as the user scrolls through it. An immediate transition 
     * is used to update visual elements based on how far the 
     * user has scrolled.
     * For this visualization, there are no update functions
     * to call.
     */

     /**
     * Call activateFunctions as the user scrolls based on the
     * current index of the activated section
     * @param index Index of the activated section
     */
    chart.activate = function (index) {
      activeIndex = index;
      // Ensure that the correct activate Functions are called
      // regardless of whether the user scrolls up or down
      // "sign" and "scrolledSections" keep track of which
      // activateFunctions should be called depending on the
      // direction of scroll. 
      var sign = (activeIndex - lastIndex) < 0 ? -1 : 1;
      var scrolledSections = d3.range(lastIndex + sign, activeIndex + sign, sign);
      scrolledSections.forEach(function (i) {
        activateFunctions[i]();
      });
      lastIndex = activeIndex;
    };
     /**
     * Call updateFunctions as the user scrolls based on the
     * current index of the activated section and progress
     * through the section 
     * @param index Index of the activated section
     * @param progress Progress through the activated section
     */
    chart.update = function(index, progress){
      updateFunctions[index](progress);
    };
    // Return chart function
    return chart;
};
/**
 * Function called once data has been loaded. Sets up the
 * scroller and displays the visualization
 * @param data Data on candidates regarding key facts, 
 *             stances on key issues, and criticisms
 */
function display(data) {
  // Create a new plot and display it
  var plot = scrollVis();
  d3.select('#vis')
    .datum(data)
    .call(plot);
  // Setup scroll functionality
  var scroll = scroller()
    .container(d3.select('#graphic'));
  // Pass in .step selection as the steps
  scroll(d3.selectAll('.step'));
  // Setup event handling
  scroll.on('active', function(index) {
    // Highlight current step text
    d3.selectAll('.step')
      .style('opacity',function(d,i){ 
        return i===index ? 1 : 0.1; 
      });
    // Activate current section
    plot.activate(index);
  });
  scroll.on('progress',function(index,progress){
    plot.update(index, progress);
  });
}
  
// Load all data files into global variables and display
d3.csv("data/names.csv",function(csvdata){
  getNames(csvdata);
  d3.json("data/candidates.json",function(jsondata){
      candidates = jsondata;
      d3.csv("data/1976-2016-president.csv",function(csvdata2){
        mapdata = transformMapData(csvdata2);
        d3.csv("data/ranks.csv",function(csvdata3){
          piedata = transformPieData(csvdata3);
          pierankdata = csvdata3;
          d3.json("data/us-states.json",function(jsondata2){
            us = jsondata2;
            display(jsondata);
            })
        })
      })
  })
})
