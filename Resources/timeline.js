// timeline.jsのwindowを変数にセット
var win = Titanium.UI.currentWindow;

// ライブラリの読み込み
Titanium.include("titwitter.js");

// TableViewの追加
win.add(TiTwitter.UI.tableView);

// 再読込の設定
TiTwitter.UI.setRefreshButton( function() {
	TiTwitter.loadHomeTimeline();
});
// 初回読み込み
TiTwitter.loadHomeTimeline();

// Android環境か否かの判定
if(Titanium.Platform.osname === 'android') {
	// Android
	var activity = Titanium.Android.currentActivity;
	if(activity) {
		activity.onCreateOptionsMenu = function(e) {
			var menu = e.menu;
			var menuItem = menu.add({
				title: "Tweetする"
			});
			menuItem.setIcon("dark_pencil.png");
			menuItem.addEventListener("click", function(e) {
				// Windowを生成し、モーダル表示する。
				var tweetWindow = Ti.UI.createWindow({
					title: '新規Tweet',
					url: 'post.js',
					backgroundColor:'#fff'
				});
				tweetWindow.open({
					modal: true
				});
			});
			// 再読込
			var menuItemRefresh = menu.add({
				title: "再読込"
			});
			menuItemRefresh.setIcon("dark_refresh.png");
			menuItemRefresh.addEventListener("click", function() {
				TiTwitter.loadHomeTimeline();
			});
		};
	}
} else {
	// iOS
	win.leftNavButton = (function() {
		var button = Titanium.UI.createButton({
			systemButton: Titanium.UI.iPhone.SystemButton.COMPOSE
		});
		button.addEventListener('click', function() {
			// Windowを生成し、モーダル表示する。
			var tweetWindow = Ti.UI.createWindow({
				title: '新規Tweet',
				url: 'post.js',
				backgroundColor:'#fff'
			});
			tweetWindow.open({
				modal: true,
				modalTransitionStyle: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
				modalStyle: Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET
			});
		});
		return button;
	})();
}