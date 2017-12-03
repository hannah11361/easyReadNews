var newsData = "";
var testData = "";

$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent('http://www.backchina.com/news')) + '&callback=?', function(data){
	newsData = data.contents;
});

app.controller('MainController', function($scope, $timeout, $mdDialog) {
	$scope.name = 'hannah';

	$timeout(function (){
		$scope.newsData = newsData;
		$scope.sections = scrapeSections(newsData);
	}, 1000);

	$scope.openNews = function (link, title){
		
		$mdDialog.show({
		  locals:{link: link, title: title},
	      controller: DialogController,
          controllerAs: 'dialogCtrl',
	      templateUrl: 'news.html',
	      parent: angular.element(document.body),
	      clickOutsideToClose:true,
	      fullscreen: true
	    });
	}

	$scope.scrollTop = function(){
		$("html, body").animate({ scrollTop: 0 }, 1000);
	}

	function DialogController($scope, $mdDialog, $timeout, link, title) {
		var contents = "";
		$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent(link)) + '&callback=?', function(data){
			contents = data.contents;
		});

	    $scope.cancel = function() {
	      $mdDialog.cancel();
	    };

	    $scope.newsLink = link;
	    $scope.newsTitle = title;
	    $scope.news = ["loading awesomeness ... "];

		$timeout(function (){
			$scope.news = scrapePage(contents);
		}, 1000);


	}
	
});

/* main page news titles, link json setup:
	[
		{topic: xxx, link: xxx, news: [{link: xxx, title: xxx}, ...] },
	 ...]
*/
function scrapeSections(rawData){
	var exp = /<div class="hot_topic">\n*.*<a hre.*\n*.*\n*.*/g;
	var sections = [];

	rawData.match(exp).forEach(function(x, idx) {
			if (idx !== 1){
				sections.push(scrapeNewsLinks(x)); 
			};
	});
	return sections;
}

function scrapeNewsLinks(rawData){
	var topicName = /<strong>[^<]*</g;
	var topicLink = /\/news\/\w+\//g;
	var news = [];
	var newsLink = /news\/[0-9/]*\.html/g;
	var newsTitle = /blank"[^li]*<\/li>/g;
	var titles = rawData.match(newsTitle);
	var links = rawData.match(newsLink);
	for (i = 0; i < titles.length; i++){
		news.push({"link": `http://backchina.com/${links[i]}`,
			"title": titles[i].slice(7,-9)});
	}

	return {"topic": rawData.match(topicName)[0].slice(8,-1), 
			"link": `http://backchina.com${rawData.match(topicLink)}`,
			"news": news
			};

}

function scrapePage(rawData){
	var sourceExp = /<\/span>\n来源[^s]*/g; //.slice(0,-1);
	var source = rawData.match(sourceExp)[0].slice(7,-1);

	var mainExp =  /main_content([\s\S]*?)specialnews">/g;
	 //each array content
	var picWordExp = /<div style="text-align: center;"><img([\s\S]*?)border="0">|<p([\s\S]*?)<\/p>/g;
	var newsExp = /<p([\s\S]*?)<\/p>/g;
	var news = rawData.match(mainExp)[0].match(picWordExp);


	//clean up data
	
	for (i=0; i < news.length; i++){
		news[i] = cleanHTML(news[i]);
	}
	
	return {
		"source": source,
		"content": news
	};
}

function cleanHTML(str){
	if (str.includes("<img src")){
		return {"isImage": str.match(/src=([\s\S]*?)border/g)[0].slice(5,-8)};
	} else {
		return str.replace(/<(?:.|\n)*?>/gm, '').trim();
	}
}
