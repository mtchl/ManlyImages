/// item box
///  TODO - 

function addItemBox($clicked, clusters){
  var nextclusters = $clicked.nextAll(); 
  var nextrow_cluster;
  var lastdiv = false; // are we adding the box after the last div?
  if (nextclusters.size() > 0 ){
    for (var i =0; i<nextclusters.size(); i++){
      //console.log($(nextclusters[i]).position().top);
      if ($(nextclusters[i]).position().top > $clicked.position().top && $(nextclusters[i]).position().left < 30){
        nextrow_cluster = $(nextclusters[i]);
        break;
      }
     if (i == nextclusters.size()-1){
        lastdiv = true; // we got to the end, must be adding after the last div
        nextrow_cluster = $(nextclusters[i]);
     } 
    }
  } else {
    lastdiv = true;
    nextrow_cluster = $clicked; 
  }
  // build the item box
  var itembox = $('<div id="itembox" data-term="'+ $clicked.attr("data-term") + '" data-idx="0" />');
  $(itembox).append('<ul id="pics"> </ul>');
  var prevbutton = $('<div class="button" id="leftbutton"> </div>').text(' <').on("click", function() { itemBoxPrev(clusters); });
  var nextbutton = $('<div class="button" id="rightbutton"> </div>').text(' >').on("click", function() { itemBoxNext(clusters); });
  $(itembox).append(prevbutton).append(nextbutton);
  $(itembox).hide();
  // append it to the display
  if (!lastdiv) {
    $(nextrow_cluster).before(itembox);
  } else {
    $(nextrow_cluster).after(itembox); // last div, so add the box after the final div
  } 
  // build date links within the item box
  addDateLinks($clicked, clusters);
  $(itembox).slideDown(500);
  // load the box content
  loadBoxItems(clusters[ $clicked.attr('data-term') ], 0);
}

function addDateLinks($clicked, clusters){
  var datelinks = $('<ul class="datelinks" />');

  var clusterHisto = clusterDateHistos[$clicked.attr('data-term')]; 
  //console.log(clusterHisto);
  var totalcount = clusters[$clicked.attr('data-term')].length;
  for (var d=0; d<clusterHisto.length; d++){
     var datelabel = clusterHisto[d].date;
     if (clusterHisto[d].date == 0) datelabel = "ND";
      datelinks.append('<li style="width:' +  Math.floor(($('#itembox').width()-80) * clusterHisto[d].count/totalcount)  + 'px" data-dateidx="'+ clusterHisto[d].startindex +'">' +
      datelabel + '</li>')
  }

  $('#itembox').append(datelinks);

  $('.datelinks li').on('click', function(){
    loadBoxItems(clusters[$('#itembox').attr('data-term')], parseInt($(this).attr('data-dateidx')) );
  });

}



function loadBoxItems(boxitems, newindex){

  if (newindex > boxitems.length || newindex < 0 ) return; // hit the end
  var currentindex = parseInt($('#itembox').attr('data-idx'));
  if (newindex != 0 && currentindex == newindex) return; // no need to do anything - same index
  var firstload = true;
  if ($('#pics').children().length != 0){  // is this the first time the box has been loaded?
     firstload = false;
  }

  newpics = $('<div id="newpics" />');

  var loaddiv = newpics;
  if (firstload) loaddiv = $('#pics');

  for (var i = newindex; i < Math.min(newindex+6, boxitems.length); i++) {
    var w = workmap[boxitems[i]];
    var li = $('<li class="itemli" data-id="' + w.id + '"/>');
    var imgurl = thumbprefix +  w.thumb;
    var titlestring = w.title;

    if (w.title.match(/(17|18|19|20)\d{2}/g) == null){ // no year in the title
      if (w.year == 0)  titlestring = titlestring + ' &middot; ND'; // and no year in the metadata - so label it ND
      else  titlestring = titlestring + ' &middot; ' + w.year; // otherwise add the year from the metadata
    }

    $(li).css('background-image','url('+ imgurl +')');
    var title = $('<span class="pictitle">' + titlestring  +'</span>');
    $(li).append(title);
//    $(li).on('click', function(){loadBigItem($(this))});
    $(li).on('click', function(){ 
      loadBigItem($(this));
    });
    

    $(loaddiv).append(li);
    
  }

  if (firstload){
    $('#itembox').append(loaddiv);
  } else {
    $('#itembox').append(newpics);

    if (newindex > currentindex ){ // next button - going to the right
      if (newindex > currentindex+6){ // nav from the decade histo - so fade the existing pics out
        $('#pics').fadeOut(500, function(){$(this).remove();}); 
      } else {
        $('#pics').animate({'left':'-980px'},1500, function(){$(this).remove();});
      }
      $('#newpics').animate({'left':'0px'},1500, function(){$(this).attr('id','pics');});
    } else {
      if (newindex < currentindex-6){
        $('#pics').fadeOut(500, function(){$(this).remove();});
      } else {
        $('#pics').animate({'left':'980px'},1500, function(){$(this).remove();});
      }
      $('#newpics').css('left','-980px'); // position the new images to the left
      $('#newpics').animate({'left':'0px'},1500, function(){$(this).attr('id','pics');});
    }

    $('#itembox').attr('data-idx',newindex);
  }

}


function itemBoxNext(clusters){
  loadBoxItems(clusters[ $('#itembox').attr('data-term') ], parseInt($('#itembox').attr('data-idx'))+6);
}

function itemBoxPrev(clusters){
    loadBoxItems(clusters[ $('#itembox').attr('data-term') ],parseInt( $('#itembox').attr('data-idx'))-6);
}

///key interaction handlers
document.onkeydown = function (e){
  e = e || event;
  var clusters;
  if (displaymode == "title") clusters = titleclusters;
  else clusters = decadeclusters;
  if (e.keyCode == 39) itemBoxNext(clusters);
  if (e.keyCode == 37) itemBoxPrev(clusters);
};




function loadBigItem($clicked){

  var wpadding = 20;
  var minwidth = 400;
  var minheight = 400;

  var i = new Image;
  var wk = workmap[$clicked.attr('data-id')];
  i.src = bigprefix + wk.thumb;
  i.onload = function(){

    var bigdiv = $('<div id="bigitem">');
    var divwidth = Math.max(minwidth, ((wpadding*2) + i.width));
    var divheight = Math.max(minheight, (i.height + 60 + 40));
    //bigdiv.css('width',divwidth + 'px');
    bigdiv.css('left',( ((window.innerWidth - divwidth)/2)) + 'px');
    bigdiv.css('top',( ((window.innerHeight - divheight)/2)) + 'px');
    var bigimg = $('<img src="' + bigprefix + wk.thumb + '">');
    var bigtitle = $('<div class="bigworkinfo"><h3>' + wk.title + '</h3></div>');

    bigdiv.hide();
    bigdiv.append(bigimg);
    bigdiv.append(bigtitle);
    bigimg.on('click', function(){closeBigItem()});
    $('body').append('<div id="backdrop" />');
    $('#wrapper').append(bigdiv);

    if (i.width < bigdiv.width()){
      bigimg.css('margin-left', ((bigdiv.width() - i.width)/2) + 'px');
    }
    if (i.height < bigdiv.height() - 60){
      bigimg.css('margin-top', ((bigdiv.height()- 60 - i.height)/2) + 'px');
    }

    bigdiv.fadeIn();


   var workurl = 'http://api.trove.nla.gov.au/work/' + wk.id + '?key=vl6ahuf5l47j4vaq&encoding=json&callback=?';  
   $.getJSON(workurl, function(data){
      if (data.work.issued != null) $('#bigitem .bigworkinfo').append('<h4> date: ' + data.work.issued + '</h4>');
      if (data.work.contributor != null) $('#bigitem .bigworkinfo').append('<h4> creator: ' + data.work.contributor[0] + '</h4>');
      $('#bigitem .bigworkinfo').append('<h4> View at <a target="new" href="' +  data.work.troveUrl +  '">Trove</a> |  <a target="new" href="' + data.work.identifier[0].value + '"> Manly Library</a></h4>');
      var closebutton = $('<span class="closebutton">X</span>');
      $('#bigitem .bigworkinfo').append(closebutton);
      closebutton.on('click',function(){closeBigItem()});

    }); 
  };

}

function closeBigItem(){
  $('#bigitem').fadeOut(250, function(){$(this).remove(); $('#backdrop').fadeOut(250, function(){$(this).remove()});});
  
}