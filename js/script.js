//Model
var Model = {
	locations: [{
		title: '泰山',//地点
		location: [117.12906647, 36.19496918],//坐标
		cityname: 'taian',//该地区对应的城市名拼音，用于获取API天气时使用
		//weather: '天气读取中'//若天气API读取失败则显示该文本信息
	},
	{
		title: '衡山',
		location: [112.60769653, 26.9003582],
		cityname: 'hengyang',
		//weather: '天气读取中'
	},
	{
		title: '华山',
		location: [110.08952332, 34.56535721],
		cityname: 'huayin',
		//weather: '天气读取中'
	},
	{
		title: '恒山',
		location: [113.6980896, 39.69910049],
		cityname: 'hunyuan',
		//weather: '天气读取中'
	},
	{
		title: '嵩山',
		location: [113.0377655, 34.45993805],
		cityname: 'dengfeng',
		//weather: '天气读取中'
	},
	]
};

//ViewModel，方法参考论坛 https://discussions.youdaxue.com/t/marker/56374/10
var ViewModel = function () {
	var self = this;
	self.menuHide = ko.observable(false);
	
	self.hbClick = function () {
		self.menuHide(!self.menuHide());
	};

	self.menu-hide = ko.pureComputed (function() {
	  var value = self.menuHide;
	  console.log(value);
	  return value;
	},self);
    	
	//绑定输入框，输入框初始数值为空
	self.locInput = ko.observable('');
	//绑定locations数组
	self.locList = ko.observableArray(Model.locations);
	//返回触发点击事件元素的innerHTML，循环markers列表,如果innerHTML与marker的title相同，则将地图中心设定在该marker位置，并使用call指向对应marker的mkClick事件；
	self.findMarker = function () {
		var titleInfo = event.target.innerHTML;
		//console.log(titleInfo);
		for (let i = 0; i < markers.length; i++) {
			if (titleInfo == markers[i].getTitle()) {
				map.setZoomAndCenter(8, Model.locations[i].location);//设置地图中心点为location坐标且缩放比例为8
				mkClick.call(markers[i]);//指向maker点击事件
			}
		}
	};
	//使用knockout的computed计算功能，检索输入框内内容是否与监测的列表title匹配，如有则显示该列表项的marker，反之则不显示
	self.listShow = ko.computed(function () {
		return ko.utils.arrayFilter(self.locList(), function (location) {//回调函数，使用指定函数测试所有元素，并创建一个包含所有通过测试的元素的新数组
			if (infoWindow.getIsOpen()){
				infoWindow.close(); // 如果 infowindow 已经打开，则关闭它。
		    };
			if (location.title.indexOf(self.locInput()) >= 0) {
				location.marker.show()//如有匹配则显示marker
				return true;//通过测试,显示列表项
			} else {
				location.marker.hide()//否则不显示marker
				return false;//未通过测试，不显示列表项
			}
		})
	});


};
//定义地图变量；
var map;
//定义信息窗变量；
var infoWindow;
//定义markers标记数组（初始值为空数组）；
var markers = [];
//初始化地图；
function initMap() {
	//创建地图实例
	map = new AMap.Map('map', {
		zoom: 6,//设置地图缩放比例
		center: [113.0377655, 34.45993805]//设置地图初始中心点坐标
	});
	//插入控件
	//map.plugin(["AMap.ToolBar"], function () {
	//	map.addControl(new AMap.ToolBar());
	//});

	//创建信息窗实例；
	infoWindow = new AMap.InfoWindow({
		offset: new AMap.Pixel(0, -30)//设置信息窗位置
	});

	//获取天气
	//getWeather();

	//循环创建marker实例，写入数组
	for (let i = 0; i < Model.locations.length; i++) {

		let title = Model.locations[i].title;//从locations数组获取title
		let position = Model.locations[i].location;//从locations数组获取坐标
		//let weatherInfo = Model.locations[i].weather;//从locations数组获取天气
		//创建marker实例
		var marker = new AMap.Marker({
			position: position,//将坐标传入marker的position
			title: title,//将坐标传入marker的titie
			map: map//定义map
		});

		//marker.content = title + "天气:" + weatherInfo;//设置信息窗内容；
		Model.locations[i].marker = marker;//给locations数组写入marker;
		markers.push(marker);//给markers数组添加新marker
		//设置点击事件；
		marker.on('click', mkClick);
		// 关闭信息窗
		infoWindow.close();
		//调整地图使marker都在视野中
		map.setFitView();
	};
	ko.applyBindings(ViewModel);//实现knockout监听功能
};

//设置点击marker的事件
function mkClick() {
var position = this.getPosition()
var weatherUrl = "https://free-api.heweather.com/s6/weather/forecast?location=" + position + "&key=30962604458e42ffbaaf4c54ec3e27d4";
var self = this; // 用 self 保存 this，方便下方引用

// 在这里发起异步请求
$.ajax({
	async: true,
	url: weatherUrl,
	dataType: "json",
	success: function (response) {
		if (response.HeWeather6[0].status == "ok") {//官方文档里ok是小写的，是我之前写错了
			var weatherTxt = response.HeWeather6[0].daily_forecast[0].cond_txt_d;
			// 在这里设置信息窗的内容
			infoWindow.setContent(self.getTitle() + '天气：' + weatherTxt);
			infoWindow.open(map, position);
		} else {
			// 在这里设置信息窗的内容：天气信息获取失败
			infoWindow.setContent(self.getTitle() + '天气：信息获取失败');
			infoWindow.open(map, position);
		}
	},
	error: function (error) {//错误处理
		// 在这里设置信息窗的内容：天气信息获取失败
		infoWindow.setContent(self.getTitle() + '天气：信息获取失败');
		infoWindow.open(map, position);
	}
});
};

/*
function mkClick() {
	infoWindow.setContent(this.content);
	infoWindow.open(map, this.getPosition());
};
//使用jquery的$ajax()从和风天气API循环获取json数据，将对应天气文本赋值给locations下数组的weather;
function getWeather() {
	for (let i = 0; i < Model.locations.length; i++) {
		var weatherUrl = "https://free-api.heweather.com/s6/weather/forecast?location=" + Model.locations[i].cityname + "&key=30962604458e42ffbaaf4c54ec3e27d4";
		$.ajax({
			async: false,//取消异步以赋值给weather
			url: weatherUrl,
			dataType: "json",
			success: function (response) {
				if (response.HeWeather6[0].status =="OK") {
				var weatherTxt = response.HeWeather6[0].daily_forecast[0].cond_txt_d;
				Model.locations[i].weather = weatherTxt;
			    } else {
				Model.locations[i].weather = "HeWeather has failed to load";
				}
			},
			error: function (error) {//错误处理
				Model.locations[i].weather = "HeWeather has failed to load";
			}
		});
	}
}
*/