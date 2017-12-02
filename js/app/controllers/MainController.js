var newsData = "";
$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent('http://www.backchina.com/news')) + '&callback=?', function(data){
// newsData = decodeURIComponent(escape(data.contents));
newsData = data.contents;
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

	$scope.scrapeNews = function (link){
		console.log(link);
	

		$mdDialog.show({
	      controller: DialogController,
	      templateUrl: 'news.html',
	      parent: angular.element(document.body),
	      clickOutsideToClose:true
	    })
	}

	function DialogController($scope, $mdDialog) {
	    $scope.hide = function() {
	      $mdDialog.hide();
	    };
	}
	
});

function scrapeMainPage(){
	let data = "";
	$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent('http://www.backchina.com')) + '&callback=?', function(data){
	
	data = data.contents;
	});
	return newsData;
}

function scrapeTopics(rawData){
	var exp = /\><a href="\/news\/\w+\/">[\u2E80-\u2FD5\u3400-\u4DBF\u4E00-\u9FCC]{4}/g;
	var topics = [];

	rawData.match(exp).forEach(function(x) {
			let topic = {
				"link": `http://backchina.com${x.substring(10, x.length-6)}`,
				"chnTopic": x.substring(x.length-4)}
			topics.push(topic);
	});
	return topics;
}

/*
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
		news.push({"link": `http://backchina.com${links[i]}`,
			"title": titles[i].substring(7,titles[i].length-9)});
	}
	return {"topic": rawData.match(topicName)[0].substring(8).slice(0,-1), 
			"link": `http://backchina.com${rawData.match(topicLink)}`,
			"news": news
			};

}
