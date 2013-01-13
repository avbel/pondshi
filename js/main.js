function HomeCtrl($scope, $http){
    $http.get("news.json").success(function(data){
        $scope.items = data || [];
    });
}

function DocumentsCtrl($scope, $http){
    $http.get("documents.json").success(function(data){
        $scope.documents = data || [];
    });
}



function youtube(url){
    var youtubeRegexs = [/https?:\/\/www\.youtube\.com\/embed\/([\w_]+)/gi, /https?:\/\/youtu\.be\/([\w_]+)/gi];
    var youtubeReplaceText = '<div><iframe style="min-height: 480px; width: 100%; frameborder: 0" src="http://www.youtube.com/embed/$1" allowfullscreen></iframe></div>';
    var i, u;
    for (i = 0; i < youtubeRegexs.length; i++) {
        if ((u = youtubeRegexs[i].exec(url)) != null) {
           return youtubeReplaceText.replace("$1", u[1]);
        }
    }
    if((/^https?:\/\/www\.youtube\.com\/watch\?/gi).test(url)){
     if ((u = (/v=([\w_]+)/gi).exec(url)) != null) {
           return youtubeReplaceText.replace("$1", u[1]);
        }
    }
    return null;

}

function simpleImageLinkProcessor(url){
    var regex = /\.(jpe?g|gif|png)($|\?)/gi;
    if (url.match(regex)) {
        return '<div><a href="' + url +'" target="blank"><img alt="image" src="' + url + '" style="max-height: 480px;" /></a></div>';
    }
    return null;
}


var urlRegex = /(https?:\/\/[^\s]+)/gi;
var processors = [youtube,  simpleImageLinkProcessor];


function processLinks($sanitize, text) {
    var urls = [];
    var u, i, l;

    text = $sanitize(text);

    while ((u = urlRegex.exec(text)) != null) {
        urls.push(u[1]);
    }

    l = urls.length;

    for(i = 0; i < l; i ++){
        var url = urls[i];
        var txt = processUrl(url);
        //console.log("Processed " + url + " by " + txt);
        text = text.replace(url, txt || url);
    }
    text =  text.replace(/&#1(0|3)\;/g, "<br/>");
    return text;

}

function processUrl(url) {
    var i, l = processors.length;
    for(i =0; i<l; i++){
        var r = processors[i](url);
        if(r && r.length > 0){
            return r;
        }
    }
    return "<a href=\"" + url + "\" target=\"blank\">" + url + "</a>";
}



angular.module('app', ['ngSanitize']).
  config(['$routeProvider', '$locationProvider', function($routeProvider, $locationProvider) {
    //$locationProvider.html5Mode(true);
    $routeProvider.
      when('/home', {templateUrl: 'partials/home.html',   controller: HomeCtrl}).
      when('/docs', {templateUrl: 'partials/documents.html', controller: DocumentsCtrl}).
      otherwise({redirectTo: '/home'});
}]).filter('processLinks', function($q, $sanitize){
    return function(text){
        return processLinks($sanitize, text);
    };
}).filter('toDocUrl', function(){
  return function(doc){
    var a = document.createElement('a');
    a.href = "docs/" + doc;
    return a.href;
  };
}).filter('viewInGoogleDoc', function(){
  return function(url){
    if((/\.(docx?|xlsx?|pptx?|odt|ods|odp|pdf|tiff)$/gi).test(url)){
        return "http://docs.google.com/viewer?hl=ru&url=" + encodeURIComponent(url);
    }
    return url;
  };


});
