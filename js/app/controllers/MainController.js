var newsData = "";
var picsData = "";

$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent('http://www.backchina.com/news')) + '&callback=?', function(data){
	newsData = data.contents;
});

$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent('http://www.backchina.com/news/picture/index.php?page=1')) + '&callback=?', function(data){
	picsData = data.contents;
});

app.controller('MainController', function($scope, $timeout, $mdDialog, $interval) {
	$timeout(function (){
		var mainNewsExp = /waterfall([\s\S]*?)listloopbottom/g;
		var mainNews = newsData.match(mainNewsExp);
		var sNews = scrapeNewsLinks(mainNews[0]);
		$scope.sections = []; //array to prepare for future expansion to multiple sections

		var picNewsExp = /<ul class="bkpicnews">([\s\S]*?)<\/ul>/g;
		var picNews = picsData.match(picNewsExp);
		var pNews = scrapePicPage(picNews[0]);

		// var n = $scopes.sections[0].news.length;
		// for (i = 0; i < n; i ++){
		// 	if (pNews.find($scope.section[0].news[i].link == )
		// }
	
		$scope.sections.push(pNews);
		$scope.sections.push(sNews)

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
		$("html, body").animate({ scrollTop: 0 }, 500);
	}

	$scope.showMenu = false;
	$scope.clickHome = function(){
		$("html, body").animate({ scrollTop: 0 }, 500);
		$scope.showMenu = !$scope.showMenu;

	}
	$interval(function(){
		$scope.showMenu = false;
	}, 5000);

	function DialogController($scope, $mdDialog, $timeout, $interval, link, title) {
		var contents = "";
		$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent(link)) + '&callback=?', function(data){
			contents = data.contents;
		});

		$scope.news = "";
	    $scope.cancel = function() {
	      $mdDialog.cancel();
	    };

	    $scope.newsLink = link;
	    $scope.newsTitle = title;
	    // $scope.news = ["loading awesomeness ... "];

		$timeout(function (){
			$scope.news = scrapePage(contents);
			$interval(function(){
				if ($scope.news == ""){
					$scope.news = scrapePage(contents);
				}
			}, 100);
		}, 1000);
	}	
});

/* main page news titles, link json setup:
	[
		{topic: xxx, link: xxx, news: [{link: xxx, title: xxx}, ...] },
	 ...]  151 news; 164 title
*/
function scrapeSections(rawData){
	var exp = /<div class="hot_topic">\n*.*<a hre.*\n*.*\n*.*/g;
	var topicName = /<strong>[^<]*</g;
	var topicLink = /\/news\/\w+\//g;
	var sections = [];

	rawData.match(exp).forEach(function(x, idx) {
			if (idx !== 1 && idx !== 3){
				sections.push(scrapeNewsLinks(x)); 
			};
	});
	return sections;

		// } else {
	// 	return {"topic": rawData.match(topicName)[0].slice(8,-1), 
	// 			"link": `http://backchina.com${rawData.match(topicLink)}`,
	// 			"news": news
	// 			};
	// }
}

//if scraping for main is true, return topic as main, link as main page
function scrapeNewsLinks(rawData){
	var newsLinkTitle = /href([\s\S]*?)\<\/a>/g;
	var news = [];
	var newsLink = /news\/[0-9/]*\.html/g;
	var newsTitle = /blank"([\s\S]*?)\<\/a>/g; 
	var rawNews = rawData.match(newsLinkTitle);
	
	for (i = 0; i < rawNews.length; i++){
		if(rawNews[i].includes('href="/news'))
		{	
			let link = rawNews[i].match(newsLink)[0];
			let title = rawNews[i].match(newsTitle)[0].slice(7,-4).replace(/&quot;/g,'"');
			news.push({"link": 'http://backchina.com/'+link, "title": title});
		}
	}	
	return {"topic": "滚动直播", "link": 'http://backchina.com／news', "news": news};
}

function scrapePicPage(rawData){
	var linksExp = /<img([\s\S]*?)<\/p>/g;
	var newsLink = /news\/[0-9/]*\.html/g;
	var picLink = /src="([\s\S]*?)"/g;
	var titleExp = /_blank">([\s\S]*?)<\/a>/g;
	var picsInfo = rawData.match(linksExp);
	var news = [];

	for (i = 0; i < picsInfo.length; i++){
		let link = 'http://backchina.com/' + picsInfo[i].match(newsLink)[0];
		let pic = picsInfo[i].match(picLink)[0].slice(5, -1);
		let title = picsInfo[i].match(titleExp)[0].slice(8, -4).replace(/&quot;/g,'"');

		news.push({"link": link, "title": title, "pic": pic});
	}

	return {"topic": "图片新闻", "link": "http://www.backchina.com/news/picture/", "news": news};
}

function scrapePage(rawData){
	var sourceExp = /<\/span>\n来源[^s]*/g; //.slice(0,-1);
	var source = rawData.match(sourceExp)[0].slice(7,-1);
	var timeExp = /京港台[^s]*/g;
	var timeStamp = rawData.match(timeExp)[0].slice(0, -1);

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
		"timeStamp": timeStamp,
		"content": news
	};
}


function cleanHTML(str){
	if (str.includes("<img src")){
		return {"isImage": str.match(/src=([\s\S]*?)border/g)[0].slice(5,-8)};
	} else {
		return str.replace(/<(?:.|\n)*?>/gm, '').trim().replace(/&quot;/g,'"');
		
	}
}


