	var newsData = "";
	$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent('http://www.backchina.com/news')) + '&callback=?', function(data){
	// newsData = decodeURIComponent(escape(data.contents));
	newsData = data.contents;
	});
	

	var ul = /<ul class="cl">/g;
	//  [\u2E80-\u2FD5\u3400-\u4DBF\u4E00-\u9FCC]{4}<\/a><\/li>

app.controller('MainController', function($scope, $timeout) {
	$scope.name = 'hannah';
	$timeout(function (){
		$scope.newsData = newsData;
		$scope.topics = scrapeTopics(newsData);
	}, 1000);
	
});

function scrapeMainPage(){
	var newsData = "";
	$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent('http://www.backchina.com')) + '&callback=?', function(data){
	// newsData = decodeURIComponent(escape(data.contents));
	newsData = data.contents;
	});
	console.log(newsData);
	return newsData;
}

function scrapeTopics (rawData){
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
