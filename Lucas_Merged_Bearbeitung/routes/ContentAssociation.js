// Das Ranking basiert auf der Annahme, dass der am besten passendste Inhalt nur Tags enthält, die alle zur durchsuchten Liste gehören + die meisten Tags enthält + die Tags des Inhalts häufig in der Liste vorkommen
var databaseHandler = require('./databaseHandler');
//var fpgrowth = require("/Users/maria/node_modules/node-fpgrowth/dist/fpgrowth");
var _ = require('underscore');

//Content erschaffen und Ähnlichkeit ausrechnen
function Content(id, Description, Title, ContentType, ContentData, tags){
    this.ContentID = id;
    this.Description = Description;
    this.Title = Title;
    this.ContentType = ContentType;
    this.ContentData = ContentData;
    this.tags = _.uniq(tags);
    this.similarity;
    this.addTag = function(str){
        this.tags.push(str);
    }
    this.setSimilarity = function(tagList){
        var tagFreq = 0;
        for (let e of this.tags){
            for (let e2 of tagList){
                if(e == e2){
                    tagFreq ++
                }
            }
        }
        //gesamtzahl der tags - Anzahl der nicht übereinstimmenden Tags/gesamtzahl der Tags --> Übereinstimmung * Häufigkeitsfaktor
        this.similarity = ((this.tags.length - _.difference(this.tags,tagList).length)/this.tags.length)*tagFreq;
    }

    this.getSimilarity = function(){
        return this.similarity
    }
}

var ContentAssociation = {}

// Liste von Tags zu denen Ähnlichkeit gesucht wird
ContentAssociation.CalculateSimilarity = function (chapterId, func) {


    databaseHandler.sql('SELECT tagTitle FROM vtaglist WHERE ChapterID =' + chapterId + ';', function (chapTags) {
        databaseHandler.sql('Select tagTitle, ContentID, Description, Title, ContentType, ContentData FROM vtaglist WHERE ContentID NOT IN (SELECT ContentID FROM vcontent WHERE ChapterID =' + chapterId + ');', function (data) {
            var arrCont = [];
            var tmpId = 0;
            var tmpCont;

            for (let i = 0; i < data.length; i++) {
                if (data[i].ContentID === tmpId) {
                    tmpCont.addTag(data[i].tagTitle);
                } else {
                    if (typeof tmpCont == "undefined") {
                        tmpId = data[i].ContentID;
                        tmpCont = new Content(tmpId, data[i].Description, data[i].Title, data[i].ContentType, data[i].ContentData, [data[i].tagTitle]);
                    } else {
                        tmpId = data[i].ContentID;
                        arrCont.push(tmpCont);
                        tmpCont = new Content(tmpId, data[i].Description, data[i].Title, data[i].ContentType, data[i].ContentData, [data[i].tagTitle]);
                    }
                }
            }
            arrCont.push(tmpCont);

            var chapterTags = [];
            for (let e of chapTags) {
                chapterTags.push(e.tagTitle);
            }

            //Durchlaufen der zu prüfenden Arrays und berechnen der Ähnlichkeit
            for (let e of arrCont) {
                e.setSimilarity(chapterTags);
            }

            //Sortieren der zu prüfenden Arrays nach Ähnlichkeit & Anzahl der Tags
            arrCont.sort(matchSort);

            func(arrCont);
        });
    });
}

//Liste der verglichenen Contents sortieren nach Ähnlichkeit & Anzahl der passenden Tags
var matchSort = function(a,b){
    if (a.getSimilarity() < b.getSimilarity()){
        return 1;
    }else if (a.getSimilarity() > b.getSimilarity()){
        return -1;
    }else if (a.getSimilarity() == b.getSimilarity()){
        //ziemlich sicher, dass es mathematisch unmöglich ist, die gleiche Ähnlichkeit und mehr treffende tags zu haben aber insgesamt weniger tags hat
        if (a.tags.length < b.tags.length) {
            return 1;
        }else if (a.tags.length > b.tags.length){
            return -1;
        }else {
            return 0;
        }
    }else {
        return 0;
    }
}

ContentAssociation.generateNetflixSmall = function(id, wantedSimilarity, callback){
      ContentAssociation.CalculateSimilarity(id, function(data){
      var numberOfItems = 4
      var tmp = "";
      var arr = [];
      var modalhtml = "";
      var modalarr = [];
      var i = 0;
      var path = "";
      var route = ""; 
      var tmparr = [];

      for (let e of data) {
          if (e.similarity >= wantedSimilarity) {
              tmparr.push(e);
          }
      }

      data = tmparr;

      for (let e of data) {
          path = e.ContentData.replace('./', '%2E%2F');
          path = path.replace('/', '%2F');

          tmp = "";

          if (i % numberOfItems == 0) {//html-code, der pro neuem Slide oder ganz am Anfang benötigt wird
              if (i == 0) {
                      //tmp += '<div class="container">';
                      //tmp += '<hr>';
                      //tmp += '<div class="col-sm-12">';
                    tmp += '<hr/>'
                    tmp += '<h3>Diese Inhalte könnten Sie auch interessieren:</h3>';
                    tmp += '<br/>'
                    tmp += '<br/>'
                      //tmp += '</div>';
                      //tmp += '<div class="col-sm-12">';
                    tmp += '<div id="carouselExampleIndicators" class="carousel slide" data-ride="carousel" data-interval="false">';
                    tmp += '<div class="carousel-inner" role="listbox">';

                  tmp += '<div class="carousel-item active">';
                  tmp += '<div class="row">';
              } else {
                  tmp += '<div class="carousel-item">';
                  tmp += '<div class="row">';
              }
              tmp += '<div class="col-sm-3">';
          } else {
              tmp += '<div class="col-sm-3">';
          }

          tmp += '<div class="card mb-2">';

          switch (e.ContentType.toLowerCase()) {
              case 'png':
              case 'jpg':
                  route = "../media/image/";
                  tmp += '<img style="cursor:pointer" class="img-fluid" src="' + route + path + '" alt="' + e.Title + '" data-toggle="modal" data-target="#' + e.ContentID + 'Modal"/>';

                  modalhtml += '<div id="' + e.ContentID + 'Modal" class="modal fade" role="dialog" style="text-align:center">\n';
                  modalhtml += '<div class="modal-dialog modal-lg" style="display:inline-block">\n';
                  modalhtml += '<div class="modal-content">\n';
                  modalhtml += '<div class="modal-header">\n';
                  modalhtml += '<h4 class="modal-title">' + e.Title + '</h4>\n';
                  modalhtml += '<button type="button" class="close" data-dismiss="modal">&times;</button>\n';
                  modalhtml += '</div>\n';
                  modalhtml += '<div class="modal-body">\n';
                  modalhtml += '<img class="img-fluid" src="' + route + path + '" alt="' + e.Title + '"/>\n';
                  modalhtml += '</div>\n';
                  modalhtml += '<div class="modal-footer">\n';
                  modalhtml += '<h6>' + e.Description + '</h6>\n';
                  modalhtml += '</div>\n';
                  modalhtml += '</div>\n';
                  modalhtml += '</div>\n';
                  modalhtml += '</div>\n';
                  break;
              case 'mp4':
                  route = "../media/stream/";
                  tmp += '<video class="img-fluid" onmouseover="play()" onmouseout="pause()" onclick="webkitRequestFullscreen()">';
                  tmp += '<source src="' + route + path + '" type="video/mp4">';
                  tmp += '</video>';
                  break;
              case 'mp3':
                  route = "../media/stream/";
                  tmp += '<img class="img-fluid" src="../media/image/%2E%2Fupload%2F3_MP3ICON.png" />';
                  tmp += '<audio style="width:auto" class="img-audio" controls>';
                  tmp += '<source src="' + route + path + '" type="audio/mp3">';
                  tmp += '</audio>';
                  break;
              case 'pdf':
                  route = "../media/document/";
                  tmp += '<div style="height:300px" width="auto">';
                  tmp += '<iframe style="height:100%;width:100%" src="' + route + path + '"></iframe>';
                  tmp += '<button style="position:relative;float:left;bottom:60%;opacity:0.8;width:90%" type="button" class="btn btn-info btn-lg" data-toggle="modal" data-target="#' + e.ContentID + 'Modal">Open Fullscreen</button>';
                  tmp += '</div>';

                  modalhtml += '<div id="' + e.ContentID + 'Modal" class="modal fade" role="dialog" style="text-align:center">\n';
                  modalhtml += '<div class="modal-dialog modal-lg" style="display:inline-block">\n';
                  modalhtml += '<div class="modal-content">\n';
                  modalhtml += '<div class="modal-header">\n';
                  modalhtml += '<h4 class="modal-title">' + e.Title + '</h4>\n';
                  modalhtml += '<button type="button" class="close" data-dismiss="modal">&times;</button>\n';
                  modalhtml += '</div>\n';
                  modalhtml += '<div class="modal-body">\n';
                  modalhtml += '<iframe width="1000" height="700" src="' + route + path + '#zoom=75"></iframe>';
                  modalhtml += '</div>\n';
                  modalhtml += '<div class="modal-footer">\n';
                  modalhtml += '<h6>' + e.Description + '</h6>\n';
                  modalhtml += '</div>\n';
                  modalhtml += '</div>\n';
                  modalhtml += '</div>\n';
                  modalhtml += '</div>\n';
                  break;
              default:
          }

          tmp += '<div class="card-body">';
          tmp += '<h4 class="card-title"> ' + e.Title + ' </h4>';
          tmp += '<p class="card-text">' + e.Description + '</p>';
          tmp += '<a class="btn btn-primary" href="' + route + path + '" download="' + e.Title + '">Download</a>';
          tmp += '<button class="btn btn-primary btn-rate-content" onclick="openRateModal(this)" data-contentid="'+e.ContentID+'" data-chapterid="'+e.ChapterID+'">Rate Me</button>';
          tmp += '</div>';
          tmp += '</div>';
          tmp += '</div>';
          if (i % numberOfItems == numberOfItems - 1) {
              tmp += '</div>'
              tmp += '</div>';
          } else if (i == data.length-1) {
              tmp += '</div>'
              tmp += '</div>';
          }
          //console.log(data);
          //console.log(data.length + '  ' + i + '  ' + (i == data.length - 1));
          if (i == data.length - 1) {
            console.log('if (i == data.length - 1)   '+i)
            tmp += '</div>';
            tmp += '<a class="carousel-control-prev" href="#carouselExampleIndicators" role="button" data-slide="prev">';
            tmp += '<span class="carousel-control-prev-icon" aria-hidden="true"></span>';
            tmp += '<span class="sr-only">Previous</span>';
            tmp += '</a>';
            tmp += '<a class="carousel-control-next" href="#carouselExampleIndicators" role="button" data-slide="next">';
            tmp += '<span class="carousel-control-next-icon" aria-hidden="true"></span>';
            tmp += '<span class="sr-only">Next</span>';
            tmp += '</a>';
            //tmp += '</div>';
            //tmp += '</div>';
            tmp += '</div>';
            tmp += '<hr>';
          }

          modalarr.push(modalhtml);
          arr.push(tmp);
          i++;
        
      }
      arr = arr.concat(modalarr);
      return callback(arr);
  });
}
/*
//Frequent Itemsets finden mithilfe des FPGrowth Algorithmus
var transactions = [
    [1, 2, 3, 4],
    [2, 3, 5],
    [1, 2, 3, 5],
    [2, 5],
    [1, 2, 3, 5],
    [1, 2, 3],
    [1, 2, 3]
];

// Execute FPGrowth with a minimum support of 40%.
function executeFPG(data, checkvalue, func){
    var fpgHandler = new fpgrowth.FPGrowth(.4);
    var arr = [];
    var tmp = [];

    fpgHandler.exec(data).then(function (result) {
        for(let e of result.itemsets){
            if(e.items.includes(checkvalue)){
                arr.push(e.items);
            }
        }

        for(let e of arr){
            for(let o of e){
                tmp.push(o);
            }
        }

        func(_.difference(tmp, [checkvalue]));
    });
}
*/
module.exports = ContentAssociation;
