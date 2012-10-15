
///TITLE clusters

var clusterscale = 0.87;
var minclusterwidth = 38;
var module_height = 72;
var module_margin = 4;

var titleitems; // container for the titleitems

var titleclusters = [];

//var totalclustercount = 0;


function setupClusters(callback){
   wordmap = {};
   for (var i = items.length - 1; i >= 0; i--) {
      addToWordMap(workmap[items[i]],wordmap);
    };
    titleitems = items.slice(0); // grab a copy of the whole item list
    buildTitleCluster(callback);
}


function buildTitleClusters(callback){
  // group the items into clusters
  titleclusters = []; // reset the title clusters
  for (var i=0; i<items.length; i++){
    var wk = workmap[items[i]];
    if (titleclusters.hasOwnProperty(wk.cluster)){
      titleclusters[wk.cluster].push(wk.id);
    } else {
      titleclusters[wk.cluster] = [wk.id];
    }
  }
  var clusternames = Object.keys(titleclusters);

  for (var c=0; c<clusternames.length; c++){ // now generate cluster data and divs
      var clustermap = {}; // new map for this cluster's words
      titleclusters[clusternames[c]] = sortClusterItems(titleclusters[clusternames[c]]);
      var clusterIDs = titleclusters[clusternames[c]];
      for (var ci=0; ci<clusterIDs.length; ci++){
        addToWordMap(workmap[clusterIDs[ci]],clustermap);
      }

      var sortedclustermap = bySortedValue(clustermap);
      var topterms = sortedclustermap.slice(1,11); 

      buildClusterDateHisto(clusternames[c],10,titleclusters);
      buildClusterDiv( clusternames[c], clusterIDs, topterms ); // build the cluster div
  }

  $('#container div.clusterdiv').tsort({order:'desc', attr:'data-itemcount'});// sort by name
  $('#container').removeClass("loading");

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

