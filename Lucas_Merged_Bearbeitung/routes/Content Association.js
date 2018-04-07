// Das Ranking basiert auf der Annahme, dass der am besten passendste Inhalt nur Tags enthält, die alle zur durchsuchten Liste gehören + die meisten Tags enthält + die Tags des Inhalts häufig in der Liste vorkommen
var fpgrowth = require("/Users/maria/node_modules/node-fpgrowth/dist/fpgrowth");
var _ = require('underscore');
//Content erschaffen und Ähnlichkeit ausrechnen
function Content(id, tags){
    this.id = id;
    this.tags = _.uniq(tags);
    this.similarity;
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

// Liste von Tags zu denen Ähnlichkeit gesucht wird
var chapter1T = ['swe', 'uml', 'oop', 'java', 'java', 'klassen', 'vererbung', 'klassen', 'klassendiagramm', 'uml', 'klassen', 'vererbung', 'oop'];
// Entfernen von Duplikaten aus der zuvergleichenden Tagliste
//chapter1T = _.uniq(chapter1T);

//Testobjekte
var content1 = new Content(1, ['swe', 'uml', 'entwurfmodelle']);
var content2 = new Content(2, ['oop', 'klassen', 'oop', 'vererbung', 'klassendiagramm']);
var content3 = new Content(3, ['oop', 'klassen', 'vererbung']);
var content4 = new Content(4, ['marketing', '7P']);
var content5 = new Content(5, ['swe', 'embeddedsystems', 'systemsofengagement']);
var content6 = new Content(6, ['uml']);

var arrCont = [content1, content2, content3, content4, content5, content6];

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

//Durchlaufen der zu prüfenden Arrays und berechnen der Ähnlichkeit
for (let e of arrCont){
    e.setSimilarity(chapter1T);
}

//Sortieren der zu prüfenden Arrays nach Ähnlichkeit & Anzahl der Tags
arrCont.sort(matchSort);

console.log(arrCont);

/*to do:
- Anbinden an Datenbank
- Ausschließen von dem Content der bereits in der Liste ist
 */

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

executeFPG(transactions, 2, function(Wurstgesicht){
    console.log(Wurstgesicht);
});

