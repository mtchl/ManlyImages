
///TITLE clusters

var clusterscale = 0.9;
var minclusterwidth = 39;
var module_height = 72;
var module_margin = 4;

var titleitems = []; // container for the titleitems

var titleclusters = [];

//var totalclustercount = 0;


function setupClusters(callback){
   wordmap = {};
   for (var i = items.length - 1; i >= 0; i--) {
      addToWordMap(workmap[items[i]],wordmap);
    //  if (items[i] == "37762683") console.log("found " + workmap[items[i]].title);
    };
    //console.log(wordmap);
    titleitems = items.slice(0); // grab a copy of the whole item list
    buildTitleCluster(callback);

}


function buildTitleCluster(callback){

  console.log(titleitems.length + " items remaining");
  var sortedmap = bySortedValue(wordmap); // sort map by array length
  var topword = sortedmap[0][0];
  console.log(topword + " is the most common word - making a cluster with "  + wordmap[topword].length + " items")
  var clusterIDs = wordmap[topword];
  titleclusters[topword] = sortClusterItems(clusterIDs); // store this list of items in the clusters map


 var clustermap = {}; // new map for this cluster's words
  for (var ci=0; ci<clusterIDs.length; ci++){
    addToWordMap(workmap[clusterIDs[ci]],clustermap);
  }

  var sortedclustermap = bySortedValue(clustermap);
  var topterms = sortedclustermap.slice(1,11); 
 
  
  for (var i = clusterIDs.length - 1; i >= 0; i--) {
   workmap[clusterIDs[i]].cluster = topword;
    var idx = titleitems.indexOf(clusterIDs[i]); // find the index of this item in the array
    if (idx < 0) console.log("error - could not find item to remove");
    titleitems.remove(idx); // remove it
  }

  // now rebuild the wordmap
  wordmap = {}; // clear the wordmap
  for (var i = titleitems.length - 1; i >= 0; i--) {
    addToWordMap(workmap['' + titleitems[i]], wordmap); // rebuild the wordmap
  };

  buildClusterDateHisto(topword,10,titleclusters);
  buildClusterDiv( topword, clusterIDs, topterms ); // build the cluster div

 if (clusterIDs.length > minClusterSize ) { // more than the min items in the cluster
    buildTitleCluster(callback); // build another cluster
  } else { // make the "others" box and finish up
    titleclusters["others"] = sortClusterItems(titleitems); // stick all the rest in an "others" cluster 

    for (var i = titleitems.length - 1; i >= 0; i--) {
    workmap[titleitems[i]].cluster = "others";
  }

    topterms = sortedmap.slice(1,11); // use the top level term list for the "others" cluster
    buildClusterDateHisto("others",10,titleclusters);
    buildClusterDiv("others", titleitems, topterms);
    $('#container div.clusterdiv').tsort({order:'desc', attr:'data-itemcount'});// sort by name
    
   $('#container').removeClass("loading");
   
    callback();
 }

}



function buildClusterDiv( topword, clusterItems, topterms ){
  var rownum = 3;
  if (clusterItems.length > 500) rownum = 1;
  //if (clusterItems.length / items.length > 0.1) rownum = 1;
  else if (clusterItems.length > 100) rownum = 2;
 //   else if (clusterItems.length / items.length > 0.05) rownum = 2;

  var divwidth = minclusterwidth +  Math.floor(clusterItems.length * clusterscale/(Math.pow( 2, 3-rownum )));
  var divheight = module_height;
  //if (rownum == 3) divwidth += 80;
  if (rownum == 2) {
   // divwidth += 40;
    divheight = 2*module_height + module_margin; // two rows
  }

  if (rownum == 1){ 
    divheight = 4 * module_height + 3*module_margin; // four rows
  //  divwidth += 20;
  }
  var clusterdiv = $('<div class="clusterdiv" data-term="' + topword + '" data-bgindex="0" data-itemcount="' + clusterItems.length + '">').css('width',  divwidth + 'px').css('height',  divheight + 'px');
  var clusterlabel = $('<span class = "clusterlabel">').text(topword); //  
  var clustercount = $('<span class = "clustercount">').text(clusterItems.length);
  clusterlabel.css('font-size', (minlabelsize + (Math.floor(0.75 * Math.sqrt(clusterItems.length)))) + 'px')
  var clusterimg = $('<img class="clusterimg showme">');
  var clusterimgnext = $('<img class="clusterimg">')
  var clustercaption = $('<span class="clustercaption" />').text(workmap[clusterItems[0]].title); 

  var clusterterms = $('<ul class="clusterterms" />');
  var numterms = Math.floor( 10 / rownum );
  for (var i=0; i<Math.min(numterms, topterms.length); i++){
     $(clusterterms).append('<li style="font-size:' +  (mintermsize + Math.floor(0.6 * Math.sqrt(topterms[i][1].length)))  + 'px">' + topterms[i][0] + '</li>'); 
  }



 $(clusterlabel).on('mouseenter',function(){ // show cluster terms on mouseover the label
      $(this).parent().children('.clusterterms').addClass('showterms');
      //$(this).parent().children('.clusterdecades').addClass('showterms');
      $(this).parent().children('.clustercaption').removeClass('showcaption');
 });

  $(clusterlabel).on('mouseleave', function(){ // remove cluster terms when mouse off the label
    $(this).parent().children('.clusterterms').removeClass('showterms');
    //$(this).parent().children('.clusterdecades').removeClass('showterms');
     $(this).parent().children('.clustercaption').addClass('showcaption');
  });

 $(clusterdiv).on('mouseleave', function(){ // remove cluster terms when mouse off the cluster
    $(this).children('.clustercaption').removeClass('showcaption');
 });

  $(clusterdiv).on('mouseenter', function(){
     $(this).children('.clustercaption').addClass('showcaption');
  });

  $(clusterdiv).on('click',function(){clickCluster(titleclusters, $(this))});

  $(clusterlabel).append(clustercount);
  $(clusterdiv).append(clusterlabel);
  $(clusterdiv).append(clusterimg);
  $(clusterdiv).append(clusterimgnext);
  if (rownum < 3){ // put the terms and decades in the larger clusters only
    $(clusterdiv).append(clusterterms);
   // $(clusterdiv).append(clusterdecades);
  } 
  $(clusterdiv).append(clustercaption);

  // $(clusterdiv).on('click',rebuildCluster);

   $('#container').append(clusterdiv);
   //$(clusterdiv).on('click',clickCluster(titleclusters));
   rotateBackground(titleclusters,clusterdiv);
}

