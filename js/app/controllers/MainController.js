app.controller('MainController', function($scope, $timeout, $mdDialog, $interval) {
	var newsData = "";
	var picsData = "";	
	$scope.mainPageLoading = true;
	$scope.sections = []; //array to prepare for future expansion to multiple sections
	
	$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent('http://www.backchina.com/news/?piclist=1')) + '&callback=?', function(data){
		$scope.mainPageLoading = false;
		let picNewsExp = /class="eis_picnews"([\s\S]*?)<\/ul>/g;
		let picNews = data.contents.match(picNewsExp);
		let pNews = scrapePicPage(picNews[0]);
		$scope.sections.push(pNews)
	});

	$.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent('http://www.backchina.com/news')) + '&callback=?', function(data){
		$scope.mainPageLoading = false;
		newsData = data.contents;
		let mainNewsExp = /waterfall([\s\S]*?)listloopbottom/g;
		let mainNews = newsData.match(mainNewsExp);
		let sNews = scrapeNewsLinks(mainNews[0]);
		$scope.sections.push(sNews)
	});

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
		$scope.loading = true;
		var contents = "";
	    $scope.cancel = function() {
	      $mdDialog.cancel();
	    };

	    $scope.newsLink = link;
	    $scope.newsTitle = title;

	    $.getJSON('http://www.whateverorigin.org/get?url=' + unescape(encodeURIComponent(link)) + '&callback=?', function(data){
			$scope.loading = false;
			contents = data.contents;
			$scope.news = scrapePage(contents);
		});
	}	
});

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
}

//if scraping for main is true, return topic as main, link as main page
function scrapeNewsLinks(rawData){
	var newsLinkTitle = /href([\s\S]*?)\<\/a>/g;
	var news = [];
	var newsLink = /news\/[0-9/]*\.html/g;
	var newsTitle = /blank"([\s\S]*?)\<\/a>/g; 
	var rawNews = rawData.match(newsLinkTitle);
	
	//skpping first 20 news, already covered by picture news section
	for (i = 34; i < rawNews.length; i++){
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
	var titleExp = /xi2">([\s\S]*?)\</g;
	var picsInfo = rawData.match(linksExp);
	var news = [];

	for (i = 0; i < picsInfo.length; i++){
		if(picsInfo[i].includes('href="/news')){
			let link = 'http://backchina.com/' + picsInfo[i].match(newsLink)[0];
			let pic = picsInfo[i].match(picLink)[0].slice(5, -1);
			let title = picsInfo[i].match(titleExp)[0].slice(5, -1).replace(/&quot;/g,'"');
			news.push({"link": link, "title": title, "pic": pic});
		}
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


