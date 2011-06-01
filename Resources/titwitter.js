// 初期化
//Ti.include(Ti.App.appURLToPath("app://lib/twitter_api.js"));
if(Titanium.Platform.osname !== 'android') {
	path_lib  = 'lib/';
} else {
	path_lib = '';
}
Ti.include("lib/twitter_api.js");
Ti.App.twitterApi = new TwitterApi({
	consumerKey:    'xqxJ15L3fLykZs7Lwfn23Q',
	consumerSecret: 'RnLuB9upMIP98tH16Czyq7qNuDdAftApCxRPFNs4GqI'
});
var twitterApi = Ti.App.twitterApi;
twitterApi.init();

// titwitter.js
var TiTwitter = {};
(function() {
	// UI関連
	TiTwitter.UI = {};
	// 本体となるTableViewはここで宣言しておく。
	TiTwitter.UI.tableView = Titanium.UI.createTableView();
	// 単独Tweet表示Windowを生成する。
	TiTwitter.UI.createTweetWindow = function(thisTweet) {
		// 新しいWindowを生成し、現在のTabにぶら下げて表示
		var newWindow = Ti.UI.createWindow({
			title: 'Tweet',
			backgroundColor: '#fff'
		});
		// 上部のUser情報表示
		newWindow.add((function() {
			var view = Titanium.UI.createView({
				top:0,
				height:80,
				backgroundColor: '#ccc'
			});
			view.add(Titanium.UI.createImageView({
				image: thisTweet.user.profile_image_url,
				top:8,
				left:8,
				width:64,
				height:64
			}));
			view.add(Titanium.UI.createLabel({
				top:8,
				left:80,
				right:8,
				height:'auto',
				text: thisTweet.user.name
			}));
			view.add(Titanium.UI.createLabel({
				top:30,
				left:80,
				height:'auto',
				text: '@' + thisTweet.user.screen_name,
				font: {
					fontSize:12
				}
			}));
			view.add(Titanium.UI.createLabel({
				bottom:8,
				left:80,
				height:'auto',
				text: thisTweet.user.url,
				font: {
					fontSize:11
				}
			}));
			return view;
		})());
		// 下段のTweet表示
		newWindow.add((function() {
			var webView = Titanium.UI.createWebView({
				top:80
			});
			webView.html = '<html><body style="padding:8px"><div>' + thisTweet.text + '</div>'
			+ ' <div>' + String.formatDate(new Date(thisTweet.created_at), "long") + " "
			+ String.formatTime(new Date(thisTweet.created_at)) + '</div></body></html>' ;
			return webView;
		})());

		var url = 'http://twitter.com/' + thisTweet.user.screen_name + '/status/' + thisTweet.id_str;
		if(Titanium.Platform.osname !== 'android') {
			// 右Navigationとしてアクション表示(Androidはメニューを別途実装する)
			newWindow.rightNavButton = (function() {
				var button = Titanium.UI.createButton({
					systemButton: Titanium.UI.iPhone.SystemButton.ACTION
				});
				button.addEventListener('click', function() {
					TiTwitter.UI.showOptionDialog(thisTweet, url);
				});
				return button;
			})();
		}
		return newWindow;
	};
	TiTwitter.UI.showOptionDialog = function(thisTweet, url) {
		var dialog = Titanium.UI.createOptionDialog({
			// タイトル（プロンプト）
			title: '処理を選択してください。',
			// ボタンの配置
			options: ['返信', '引用', 'Retweet', 'お気に入り','キャンセル'],
			// キャンセルボタンは見た目を変えることができます。
			cancel: 4
		});
		// ボタン選択時の処理はイベントハンドラを記述します。
		// 第一引数のindexプロパティで選択されたボタンのindexが設定されます。
		dialog.addEventListener('click', function(e) {
			
			// 返信 or 引用
			 if((e.index == 0) || (e.index == 1)){
				 // Windowを生成し、モーダル表示する。
				 var postWindow = Titanium.UI.createWindow({
					 title: '返信する',
					 url: 'post.js',
					 backgroundColor:'#fff'
				 });
				 // 返信・引用データの引渡し
				 postWindow.init_text = '@' + thisTweet.user.screen_name + ' ' + ((e.index == 1) ? thisTweet.text : '');
				 postWindow.in_reply_to_status_id = thisTweet.id_str;
				 postWindow.open({
					 modal: true,
					 modalTransitionStyle: Ti.UI.iPhone.MODAL_TRANSITION_STYLE_COVER_VERTICAL,
					 modalStyle: Ti.UI.iPhone.MODAL_PRESENTATION_FORMSHEET
				 });
			 }
			 // RT or お気に入り
			 else if((e.index == 2) || (e.index == 3)){
				 var params = {
					 onSuccess: function(responce) {
						 Ti.API.info(responce);
					 },
					 onError: function(error) {
						 Ti.API.error(error);
					 },
					 id: thisTweet.id_str
				 };
				 if(e.index == 2){
					 twitterApi.statuses_retweet(params);
				 }
				 else{
				 	twitterApi.favorites_create(params);
				 }
			}
		});
		dialog.show();
	};
	// 個々のTableViewRowを生成する
	TiTwitter.UI.createTableViewRow = function(tweet) {
		var row = Titanium.UI.createTableViewRow();
		row.height = 180;
		row.add(Titanium.UI.createLabel({
			text: tweet.user.screen_name,
			top: 8,
			left: 64,
			height: 16
		}));
		row.add(Titanium.UI.createLabel({
			text: tweet.text,
			top: 32,
			left: 64,
			width: 256,
			height: 'auto',
			font: {
				fontsize:12
			}
		}));
		row.add(Titanium.UI.createImageView({
			image: tweet.user.profile_image_url,
			top:8,
			left:8,
			width:48,
			height:48
		}));
		row.tweet = tweet;
		row.addEventListener('click', function(e) {
			// 新しいWindowを生成し、現在のTabにぶら下げて表示
			var thisTweet = e.rowData.tweet;
			Titanium.UI.currentTab.open(
			TiTwitter.UI.createTweetWindow(thisTweet)
			);
		});
		return row;
	};
	// プラットフォーム依存部を場合分けで記述する
	TiTwitter.UI.setRefreshButton = function(callback) {
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
						callback();
					});
				};
			}
		} else {
			// (iOS) ウィンドウの右上のボタンを設定します
			var rightButton = Titanium.UI.createButton({
				systemButton: Titanium.UI.iPhone.SystemButton.REFRESH
			});
			Titanium.UI.currentWindow.rightNavButton = rightButton;
			rightButton.addEventListener('click', function() {
				callback();
			});
		}
	};
	// TwitterAPIを非同期で呼び出す
	TiTwitter.callAPI = function(method, url, params, callbackOnLoad) {
		// ネットワークが使用できないときはエラーメッセージを表示する
		if(Titanium.Network.online == false) {
			// エラー表示
			alert('オフラインなのでデータを取得できません。');
			return;
		}
		// HTTPClientオブジェクトを生成します。
		var xhr = Titanium.Network.createHTTPClient();
		xhr.open(method, url, false);
		// レスポンスを受け取るイベント(非同期に実行される)
		xhr.onload = function() {
			callbackOnLoad(xhr.status, xhr.responseText);
		}
		// エラー発生時のイベント
		xhr.onerror = function(error) {
			// errorにはエラー事由の文字列オブジェクトが入ってくる。
			alert(error);
		};
		// リクエスト送信します。
		if(params) {
			xhr.send(params);
		} else {
			xhr.send();
		}
	};
	// ユーザタイムラインを取得する。
	TiTwitter.loadUserTimeline = function(screenName) {
		var url = 'http://api.twitter.com/1/statuses/user_timeline.json?screen_name=' + screenName;
		TiTwitter.callAPI('GET', url, null, function(status, responseText) {
			// データをクリア
			TiTwitter.UI.tableView.data = [];
			// 受け取ったJSONデータをパース
			var json = JSON.parse(responseText);
			for(var i = 0; i< json.length; i++) {
				TiTwitter.UI.tableView.appendRow(TiTwitter.UI.createTableViewRow(json[i]));
			}
		});
	};
	// 検索結果を取得する。
	TiTwitter.loadSearchResult = function(queryString) {
		var url = 'http://search.twitter.com/search.json';
		TiTwitter.callAPI('GET', url, {
			q: queryString
		}, function(status, responseText) {
			// データをクリア
			TiTwitter.UI.tableView.data = [];
			// 受け取ったJSONデータをパース
			var json = JSON.parse(responseText);
			for(var i = 0; i< json.results.length; i++) {
				// レイアウトの違いを吸収
				var tweet = json.results[i];
				tweet.user = {};
				tweet.user.screen_name = tweet.from_user;
				tweet.user.name = tweet.from_user;
				tweet.user.profile_image_url = tweet.profile_image_url;
				TiTwitter.UI.tableView.appendRow(TiTwitter.UI.createTableViewRow(tweet));
			}
		});
	};
	// ユーザホームタイムラインを取得する。
	TiTwitter.loadHomeTimeline = function() {
		twitterApi.statuses_home_timeline({
			onSuccess: function(tweets) {
				// データをクリア
				TiTwitter.UI.tableView.data = [];
				for(var i=0;i<tweets.length;i++) {
					TiTwitter.UI.tableView.appendRow(TiTwitter.UI.createTableViewRow(tweets[i]));
				}
			},
			onError: function(error) {
				Ti.API.error(error);
			}
		});
	};
	// Tweetをポストする
	TiTwitter.postTweet = function(newStatus, in_reply_to_status_id) {
		var params = {
			onSuccess: function(responce) {
				Ti.API.info(responce);
			},
			onError: function(error) {
				Ti.API.error(error);
			},
			parameters: {
				status: newStatus
			}
		};
		params.url = 'http://api.twitter.com/1/statuses/update.json';
		params.method = 'POST';
		if(in_reply_to_status_id != null && in_reply_to_status_id > 0) {
			params.url = params.url + '?in_reply_to_status_id=' + in_reply_to_status_id;
		}
		return twitterApi.callApi(params);
	};
	// Twitpicへの投稿
	TiTwitter.postTwitPic = function(photo, message, callbackOnSuccess, callbackOnError) {
		//		var apiKey = "取得したTwitPic APIキー";
		var apiKey = "5c20af5048fe6e1abe0562bfd830e4f1";
		var client = Titanium.Network.createHTTPClient();
		client.open('POST', 'http://api.twitpic.com/1/upload.json', false);
		client.setRequestHeader('User-Agent','titwitter.js');
		var postData = twitterApi.oAuthAdapter.getParamatersForTwitPic(apiKey);
		postData.media = photo;
		postData.message = message;
		client.onload = function() {
			callbackOnSuccess(client);
		};
		client.onerror = function() {
			callbackOnError(client);
		}
		client.send(postData);
	};
})();