var newsData = "";
var testData = "";
$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent('http://www.backchina.com/news')) + '&callback=?', function(data){
	newsData = data.contents;
});


$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent('http://backchina.com/news/2017/12/03/530637.html')) + '&callback=?', function(data){
	testData = data.contents;
});

app.controller('MainController', function($scope, $timeout, $mdDialog) {
	$scope.name = 'hannah';

	$timeout(function (){
      $scope.trans = true;

      $scope.demo = {
        isOpen: true,
        count: 0,
        selectedDirection: 'right'
      };

		$scope.newsData = newsData;
		$scope.sections = scrapeSections(newsData);
	}, 1000);

	$scope.scrapeNews = function (link, title){
		
		$mdDialog.show({
		  locals:{link: link, title: title},
	      controller: DialogController,
          controllerAs: 'dialogCtrl',
	      templateUrl: 'news.html',
	      parent: angular.element(document.body),
	      clickOutsideToClose:true
	    });
	}

	$scope.scrollTop = function(){
		$("html, body").animate({ scrollTop: 0 }, 1000);
	}

	function DialogController($scope, $mdDialog, $timeout, link, title) {
		var content = "";
		$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent(link)) + '&callback=?', function(data){
			content = data.contents;
		});

	    $scope.cancel = function() {
	      $mdDialog.cancel();
	    };

	    $scope.newsLink = link;
	    $scope.newsTitle = title;
	    $scope.content = "loading awesomeness ... ";

		$timeout(function (){
			$scope.content = content;
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
				sections.push(scrapeNewsLink(x)); 
			};
	});
	return sections;
}

function scrapeNewsLink(rawData){
	var topicName = /<strong>[^<]*</g;
	var topicLink = /\/news\/\w+\//g;
	var news = [];
	var newsLink = /news\/[0-9/]*\.html/g;
	var newsTitle = /blank"[^li]*<\/li>/g;
	var titles = rawData.match(newsTitle);
	var links = rawData.match(newsLink);
	for (i = 0; i < titles.length; i++){
		news.push({"link": `http://backchina.com/${links[i]}`,
			"title": titles[i].substring(7,titles[i].length-9)});
	}
	return {"topic": rawData.match(topicName)[0].substring(8).slice(0,-1), 
			"link": `http://backchina.com${rawData.match(topicLink)}`,
			"news": news
			};

}
