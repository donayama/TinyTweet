//n//
var win = Titanium.UI.currentWindow;

// ライブラリの読み込み
Titanium.include("titwitter.js");

// SearchBarとTableViewの追加
var searchBar = Titanium.UI.createSearchBar({
	showCancel:true,
	height:43,
	top:0
});
// TableViewの追加
TiTwitter.UI.tableView.top = 43;
win.add(searchBar);
win.add(TiTwitter.UI.tableView);

// タイムラインの更新を行う関数
function refreshTimeline() {
	TiTwitter.loadSearchResult(searchBar.value);
}

// Android環境か否かの判定
if(Titanium.Platform.osname === 'android') {
	var activity = Titanium.Android.currentActivity;
	if(activity) {
		activity.onCreateOptionsMenu = function(e) {
			var menu = e.menu;
			var menuItem = menu.add({
				title: "再読込"
			});
			menuItem.setIcon("dark_refresh.png");
			menuItem.addEventListener("click", function(e) {
				refreshTimeline();
			});
		};
	}
} else {
	// ウィンドウの左上のボタンを設定します
	var rightButton = Titanium.UI.createButton({
		//title: '再読込'
		systemButton: Titanium.UI.iPhone.SystemButton.REFRESH
	});
	win.rightNavButton = rightButton;
	rightButton.addEventListener('click', function() {
		refreshTimeline();
	});
}

// 検索開始とキーボードを閉じるイベントを設定する
searchBar.addEventListener('cancel', function() {
	searchBar.blur();
});
searchBar.addEventListener('return', function() {
	// 検索語の保存
	Titanium.App.Properties.setString('query_string', searchBar.value);
	searchBar.blur();
	refreshTimeline();
});
// 保存された検索語があれば初期表示
if(Titanium.App.Properties.getString('query_string', null) != null) {
	searchBar.value = Titanium.App.Properties.getString('query_string');
	refreshTimeline();
}