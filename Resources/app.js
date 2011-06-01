// ベース色は黒
Titanium.UI.setBackgroundColor('#000');

// TabGroupを作成する
var tabGroup = Titanium.UI.createTabGroup();

var tab1 = Titanium.UI.createTab({
	icon: 'dark_home.png',
	title: 'タイムライン',
	window: Titanium.UI.createWindow({
		title: 'タイムライン',
		backgroundColor: '#fff',
		url: 'timeline.js'
	})
});
var tab2 = Titanium.UI.createTab({
	icon: 'dark_search.png',
	title: '検索',
	window: Titanium.UI.createWindow({
		title: '検索',
		backgroundColor: '#fff',
		url: 'search.js'
	})
});
var tab4 =  Titanium.UI.createTab({
	icon: 'dark_wrench.png',
	title: '設定',
	window: Titanium.UI.createWindow({
		title: '設定',
		backgroundColor: '#fff',
		url: 'config.js',
		barColor: '#000'
	})
});

// タブを追加しTabGroupを表示する
tabGroup.addTab(tab1);
tabGroup.addTab(tab2);
tabGroup.addTab(tab4);
tabGroup.open();