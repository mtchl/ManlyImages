
//DECADE view 



var decadeWordMaps = [];

var firstdecade = 1880;
var lastdecade = 2010;
var decadeclusters = [];

  var wscale = 0.85; // scale item numbers to box width


function buildDecadeHisto(){
  console.log("building decades");
  decadeclusters = []; // reset the clusters

  decadeclusters["no date"] = []; // undated works 
  decadeclusters["pre-" + firstdecade] = []; // early works

  for (var y=firstdecade; y<lastdecade; y+=10){
    decadeclusters[ y ] = [];
  }

  for (var i = items.length - 1; i >= 0; i--) {
    var wk =  items[i];
    //console.log(wk);
    var workdecade = Math.floor(workmap[items[i]].year/10)*10;
    if (workdecade == 0) {
      decadeclusters["no date"].push( wk);
    }
    else if (workdecade < firstdecade){
      decadeclusters["pre-" + firstdecade].push(wk);
    } else {
      decadeclusters[workdecade].push(wk);
    }
  };

  
processDecade("pre-"+firstdecade);

for (var y=firstdecade; y<lastdecade; y+=10){ // step through the decades
  processDecade(y);
}

 processDecade("no date");
 
 clusters = decadeclusters;
 $('#container').removeClass("loading");
}

function processDecade(decadename){
  decadeclusters[decadename] = sortDecadeItems(decadeclusters[decadename]);
  var clusteritems = decadeclusters[decadename];
  //console.log(clusteritems);
  var clustermap = {};
  for (var i = clusteritems.length - 1; i >= 0; i--) {
    addToWordMap(workmap[clusteritems[i]],clustermap);
  };
  decadeWordMaps[decadename] = clustermap;
  buildDecade(decadename, decadeclusters[decadename]); // first the early items
  buildClusterDateHisto(decadename, 1,decadeclusters);
}

function sortDecadeItems(items){
 var sorteditems = items.sort(function(a,b){
    return workmap[a].year - workmap[b].year;
 })
 return sorteditems;
}


function buildDecade(label, items){

  var rowmargin = 4; // space between rows in px
  var minwidth = 40;
  var rowheight = 1;
  var moduleheight = 90;


  if (items.length > 0) rowheight = 2;

  var w = minwidth + Math.floor(wscale * items.length / rowheight);
  var h = moduleheight*rowheight + (rowheight-1)*rowmargin; // height of this element

  var $ddiv = $('<div class="clusterdiv" data-term="' + label + '" data-bgindex="0" data-itemcount="' + items.length + '">').css('width',  w + 'px').css('height',  h + 'px');
  var clusterlabel = $('<span class = "clusterlabel">').text(label); //  
  var clustercount = $('<span class = "clustercount">').text(items.length);
  clusterlabel.css('font-size', (minlabelsize + (Math.floor(0.75 * Math.sqrt(items.length)))) + 'px')
  var clusterimg = $('<img class="clusterimg showme">');
  var clusterimgnext = $('<img class="clusterimg">')
  var clustercaption = $('<span class="clustercaption" />').text(workmap[items[0]].title); 

  var sortedclustermap = bySortedValue(decadeWordMaps[label]);
  var topterms = sortedclustermap.slice(0,10); 

  var clusterterms = $('<ul class="clusterterms" />');
  var numterms = 5;
  for (var i=0; i<Math.min(numterms, topterms.length); i++){
     $(clusterterms).append('<li style="font-size:' +  (mintermsize + Math.floor(0.6 * Math.sqrt(topterms[i][1].length)))  + 'px">' + topterms[i][0] + '</li>'); 
  }



  if ($('#container').children().last().height() < h ){ // if you are taller than the last tile
    $ddiv.css('clear','left'); // start a new row
  }


$(clusterlabel).on('mouseenter',function(){ // show cluster terms on mouseover the label
      $(this).parent().children('.clustercaption').removeClass('showcaption');
      $(this).parent().children('.clusterterms').addClass('showterms');
 });

$(clusterlabel).on('mouseleave',function(){ // show cluster terms on mouseover the label
      $(this).parent().children('.clusterterms').removeClass('showterms');
 });


 $ddiv.on('mouseleave', function(){ // remove cluster terms when mouse off the cluster
    $(this).children('.clustercaption').removeClass('showcaption');
 });

  $ddiv.on('mouseenter', function(){
     $(this).children('.clustercaption').addClass('showcaption');
  });

  $(clusterlabel).append(clustercount);
  $ddiv.append(clusterlabel);
  $ddiv.append(clusterterms);
  $ddiv.append(clusterimg);
  $ddiv.append(clusterimgnext);
  $ddiv.append(clustercaption);
  $ddiv.on('click',function(event){clickCluster(decadeclusters, $(this))});


  $('#container').append($ddiv);
 
  // rotateBackground(); // start rotating bgs
  rotateBackground(decadeclusters, $ddiv);

}