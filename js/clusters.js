
// common Cluster stuff

var minClusterSize = 5;
var clustertotal = 0;


var items = []; // item IDs
var workmap = {}; // associative array of works, indexed by ID
var wordmap = {};
var stopwords = ["The","and","the","Manly","length","from","for","For","with","title","North","north","South","south","East","east","West","west"]; // ouch - gotta include "length" because it's a special property... this is why we need to use a proper data structure...

var clusterDateHistos = [];

var rotatedClusters = [];
var rotateBg;
var rotateBgInterval;

var minlabelsize = 10; // min font size for labels
var mintermsize = 10; // min font size for cluster terms


// build date histo for within clusters

function buildClusterDateHisto(term,yearinterval, clusters){ // year interval = 10 for decade, 1 for year
  var items = clusters[term];
  var dateHisto = [];
  var currentdate = Math.floor(workmap[items[0]].year/yearinterval)*yearinterval; // first decade
  var currentcount = 0; // count of items per decade
  var datestartindex = 0; // index at which each new decade starts
  for (var i=0; i<items.length; i++){
    var workdate = Math.floor(workmap[items[i]].year/yearinterval)*yearinterval;
    if (workdate != currentdate || i == items.length-1){
      dateHisto.push({date: currentdate, count: currentcount, startindex: datestartindex});
      currentdate = workdate;
      datestartindex = i;
      currentcount = 1; 
    } else {
      currentcount++;
    }
  }
  clusterDateHistos[term] = dateHisto;
}

function sortClusterItems(items){
 var sorteditems = items.sort(function(a,b){
    if (workmap[a].year == 0 ) return 1;
    if (workmap[b].year == 0 ) return -1;
    return workmap[a].year - workmap[b].year;
 })
 return sorteditems;
}

/// Cluster image stuff

function rotateBackground(divclusters, $div){
  
  var $d;

  if ($div != undefined){ // if a div has been passed in
    $d = $div;
  } else {
    if (rotatedClusters.length == 0){ // got no cluster indexes left, rebuild them
      var numdivs = $('.clusterdiv').length;
      for (var i=0; i<numdivs; i++){
         rotatedClusters.push(i); // array of cluster indexes to keep track of bg rotation
      }  
    }

    if (loadcount == maxloads) return; // check to see how many images we have loaded
    var randomdiv = Math.floor(Math.random() * rotatedClusters.length); // pick a random div
    $d = $('#container .clusterdiv').eq(rotatedClusters[randomdiv]); 
    rotatedClusters.remove(randomdiv); // remove this cluster - it's had its turn
  }

  var divitems = divclusters[ $d.attr('data-term') ]; // get the IDs of the items that belong to this div

  if (divitems == null) {
    console.log("got no items - failing at " + $d.attr('data-term'));
    return;
  } 
  var bgindex = $d.attr('data-bgindex');
  if (bgindex == divitems.length-1 ) bgindex = 0;  else bgindex++;
  $d.attr('data-bgindex', bgindex);
  $d.children('.clustercaption').text(  workmap[divitems[bgindex]].title );
  var i = new Image;
  var newimgurl = thumbprefix + workmap[divitems[bgindex]].thumb;
  if ($d.height() > 100 || $d.width() > 100) {
    newimgurl = newimgurl.replace("Jthumb","jsmall"); // get a bigger image
  }

  if ($d.width() > 200){
    newimgurl = newimgurl.replace("jsmall","jpeg"); // get a bigger image
  }

  i.src = newimgurl;
  i.onload = function(){ 
    toggleImg($d, newimgurl, i);
  };

  loadcount++;

}

function toggleImg($d,newurl,i){
      var $hiddenimg = $d.children('img').not('.showme');
      $hiddenimg.removeAttr('height');
      $hiddenimg.removeAttr('width');
      $hiddenimg.attr('src', newurl); // update the url of the hidden image
      //$hiddenimg.attr('height',$d.height()); // scale the image to be the same height as the div
      $hiddenimg.attr('height','100%'); // scale the image to be the same height as the div
      if ($hiddenimg.width() < $d.width()){ // if it's too narrow
          $hiddenimg.removeAttr('height'); // remove the height attribute
          //$hiddenimg.attr('width', $d.width()); // set the width to match the div
          $hiddenimg.attr('width','100%'); // set the width to match the div
          $hiddenimg.css('margin-top', Math.floor(($d.height() - $hiddenimg.height())/2) + "px"); // set the top margin
          $hiddenimg.css('margin-right', '0px');
      } else {
          $hiddenimg.css('margin-right', Math.floor(($d.width() - $hiddenimg.width())/2) + "px"  ); // set the right margin
          $hiddenimg.css('margin-top', '0px');
      }

      $d.children('img').toggleClass('showme'); // flip the class around
}



/// Cluster interaction


function clickCluster(clusters, $clickeddiv){
  
  if ($clickeddiv.hasClass("focused")){ // if it's the focused div
    $clickeddiv.removeClass("focused");
     $('#container .clusterdiv').removeClass("unfocused");
     $('#itembox').slideUp(500, function(){ $(this).remove() }); // remove any existing box
     rotateBg = setInterval(function () { rotateBackground(clusters);}, rotateBgInterval);// turn the transitions back on
    return;
  }

  else if ( $('#container div.focused').size() > 0 ){ // got an existing focused div
    $('#container div.focused').removeClass("focused");
    $('#container div.clusterdiv').removeClass("unfocused");
    clearInterval(rotateBg); // stop the transitions
      $('#itembox').slideUp(500, function(){ 
            $(this).remove(); 
            $clickeddiv.addClass("focused"); 
            $('#container .clusterdiv').not($clickeddiv).addClass("unfocused"); 
          addItemBox($clickeddiv, clusters); 
        }); // remove any existing box
      return;
  }

  else {
    $clickeddiv.addClass("focused");
   $('#container .clusterdiv').not($clickeddiv).addClass("unfocused");
   clearInterval(rotateBg); // stop the transitions
    addItemBox($clickeddiv, clusters);
  }

}



////Word Map functions


function addToWordMap(item,wordmap){ // pass this function an item and it will add it to the word map
  var re = /\W+/;
  var titlewords = item.title.split(re);
  titlewords = titlewords.getUnique(); // NB getUnique to eliminate repeated words in titles - but not different cases of the same word!
  titlewords = titlewords.filter(function(element, index, array){
    return (element.length > 2); // filter out short words
  });
  //if (titlewords.length == 0) console.log("no titlewords");

 for (var i = titlewords.length - 1; i >= 0; i--) {
      var tw = titlewords[i];
       if (stopwords.contains(tw) == false && tw.search('[0-9][0-9][0-9][0-9]') == -1){
        var altcase;
        var lowercase = tw.toLowerCase();
        var titlecase = tw.substring(0,1).toUpperCase() + tw.substring(1,tw.length);
        if (titlecase != tw) {
          altcase = titlecase;
        } else {
          altcase = lowercase;
        }

        if ( wordmap.hasOwnProperty(altcase) && ! wordmap[altcase].contains(item.id) ){ // if the other version of this is in the map 
          addWord(wordmap,altcase,item.id);
         // if(item.id == "151682935") console.log ("added altcase " + altcase);
        } 
        else {
          addWord(wordmap,tw,item.id); // neither is in the map, add it
         // if(item.id == "151682935") console.log ("added normal " + tw);
        }
      }
  };
}

function addWord(map,key,item){
  if (key == null) return;
  //if (map.hasOwnProperty(key) && ! map[key].contains(item)){
  if (map.hasOwnProperty(key)){
    map[key].push(item);
  } else {
    map[key] = [];
    map[key].push(item);
  }
}


//// UTILS


function bySortedValue(array) { // convert object to 2d array, then sort and return 2d array - for sorting assoc array 
    var tuples = [];
    for (var key in array) tuples.push([key, array['' + key]]);
    tuples.sort(function(a, b) { return b[1].length - a[1].length });
    var length = tuples.length;
   // console.log(tuples);
    return tuples;
}



Array.prototype.getUnique = function(){
   var u = {}, a = [];
   for(var i = 0, l = this.length; i < l; ++i){
      if(this[i] in u)
         continue;
      a.push(this[i]);
      u[this[i]] = 1;
   }
   return a;
}

Array.prototype.contains = function(e){
   for(var i = 0, l = this.length; i < l; ++i){
      if(this[i] == e) return true;   
   }
   return false;
}

Array.prototype.remove = function(from, to) {
  var rest = this.slice((to || from) + 1 || this.length);
  this.length = from < 0 ? this.length + from : from;
  return this.push.apply(this, rest);
};


