// post.js
var win = Titanium.UI.currentWindow;

// post.jsの先頭に追記

// Tweet内容初期表示内容（値が引き渡されたいないときは初期値を採用するため || を使用している）
var init_text             = win.init_text || '';
// 返信元statusのid
var in_reply_to_status_id = win.in_reply_to_status_id || 0;

// キーボードツールバー用のボタンなどの定義
var btnFlexSpace = Titanium.UI.createButton({
	systemButton:Titanium.UI.iPhone.SystemButton.FLEXIBLE_SPACE
});
var btnCamera = Titanium.UI.createButton({
	backgroundImage:'dark_camera.png',
	height:24,
	width:25
});
var lblCount = Titanium.UI.createLabel({
	text: 'あと140文字'
});

// TextAreaを生成します。
var textarea = Titanium.UI.createTextArea({
	// 初期値
	value: init_text,
	// レイアウト指定
	height:146,
	left:4,
	right:4,
	top:4,
	// フォントの指定はヒラギノ角ゴシックにしてみます
	font: {
		fontSize:20,
		fontFamily: 'HiraKakuProN-W3',
		fontWeight: 'bold'
	},
	color:'#000',
	textAlign:'left',
	// 外枠の見た目
	borderWidth:2,
	borderColor:'#bbb',
	borderRadius:5,
	// キーボードツールバーの設定
	keyboardToolbar:[btnCamera, btnFlexSpace, lblCount],
	keyboardToolbarColor: '#999',
	keyboardToolbarHeight: 40
});
// キーボードツールバーにAndroidは対応していないので、
// 残り字数の表示をツールバー風のViewでごまかしておく。
if(Titanium.Platform.osname === 'android') {
	textarea.height = '200dp';
	textarea.softKeyboardOnFocus = Ti.UI.Android.SOFT_KEYBOARD_SHOW_ON_FOCUS;
	var toolbar = Titanium.UI.createView({
		backgroundColor : '#999',
		top: textarea.height,
		height : "40dp"
	});
	toolbar.add(lblCount);
	toolbar.hide();
	win.add(toolbar);
	textarea.addEventListener('focus', function(e) {
		toolbar.show();
	});
	textarea.addEventListener('blur', function(e) {
		toolbar.hide();
	});
}

// Tweet内容が変更されるたびに残り文字数を変化させる。
textarea.addEventListener('change', function(e) {
	var count = 140 - e.value.length;
	lblCount.text = String.format("あと%d文字", count);
	lblCount.color = (count < 0) ? "red" : "#000";
});
// 自分自身のwindowがフォーカスを得たときにテキスト入力可能状態にする
win.addEventListener('open', function(e) {
	textarea.focus();
});
win.add(textarea);

Ti.include("titwitter.js");
var postTweet = function() {
	// 発言内容を変数にセットし、画面の値をクリアする
	var status = textarea.value;
	// 発言内容が空の場合はなにもしない。
	if(status === '') {
		return;
	}
	// 140文字以上のときはエラーとする。
	if(status.length > 140) {
		textarea.value = status;
		Titanium.UI.createAlertDialog({
			title: 'TinyTweet',
			message: '発言内容が長すぎます。'
		}).show();
		return;
	}
	// textareaの内容をクリア(二重投稿対策)
	textarea.value = '';
	// Tweetを行います。
	TiTwitter.postTweet(status);
};
var attachPhoto = function() {
	// 投稿成功時のコールバック関数
	var callbackOnSuccess = function(client) {
		Ti.API.info(client.responseText);
		var json = JSON.parse(client.responseText);
		if(json.url) {
			// 投稿した画像のURLを末尾に足す
			textarea.value = textarea.value + ' ' + json.url;
		}
		textarea.focus();
	};
	// 投稿失敗時のコールバック関数
	var callbackOnError = function(client) {
		alert('エラーが発生しました。' + client.responseText);
	};
	// 選択ダイアログの生成
	var dialog = Titanium.UI.createOptionDialog({
		title: '画像データをどう取得しますか？',
		options: ["写真を撮る","既存の項目を選択","キャンセル"],
		cancel: 2
	});
	// ボタン選択時の処理はイベントハンドラを記述します。
	// 第一引数のindexプロパティで選択されたボタンのindexが設定されます。
	dialog.addEventListener('click', function(e) {
		// キャンセル時はe.cancel === trueとなる
		if(e.cancel === true) {
			return;
		}
		// ボタン選択時挙動
		if(e.index == 0) {
			// カメラボタンクリック時のイベント
			Titanium.Media.showCamera({
				success: function(event) {
					// 撮影されたデータはevent.mediaとして取得できる
					TiTwitter.postTwitPic(event.media, "Upload from TinyTweet", callbackOnSuccess, callbackOnError);
				},
				cancel: function() {
					textarea.focus();
				},
				error: function(error) {
					textarea.focus();
				}
				// (略)
			});
		} else if(e.index == 1) {
			// 写真選択ダイアログを表示します。
			Titanium.Media.openPhotoGallery({
				success: function(event) {
					// 撮影されたデータはevent.mediaとして取得できる
					TiTwitter.postTwitPic(event.media, "Upload from TinyTweet", callbackOnSuccess, callbackOnError);
				},
				cancel: function() {
					textarea.focus();
				},
				error: function(error) {
					textarea.focus();
				}
				// (略)
			});

		}
	});
	dialog.show();
};
// Android環境か否かの判定
if(Titanium.Platform.osname === 'android') {
	// 閉じる：AndroidはBack
	// 送信：
	var activity = Titanium.Android.currentActivity;
	if(activity) {
		activity.onCreateOptionsMenu = function(e) {
			var menu = e.menu;
			var menuItem = menu.add({
				title: "送信"
			});
			menuItem.setIcon("dark_pencil.png");
			menuItem.addEventListener("click", function(e) {
				// TweetをPostする
				postTweet();
			});
			var menuItemCamera = menu.add({
				title: "写真"
			});
			menuItemCamera.setIcon("dark_camera.png");
			menuItemCamera.addEventListener("click", function(e) {
				// TweetをPostする
				attachPhoto();
			});
		};
	}
} else {
	// 閉じる：ウィンドウの左上のボタン（閉じる）を設定します
	win.leftNavButton = (function() {
		var button = Titanium.UI.createButton({
			title: '閉じる'
		});
		button.addEventListener('click', function() {
			// ウィンドウを閉じる
			win.close();
		});
		return button;
	})();
	// 送信：ウィンドウの右上のボタン（送信）を設定します
	win.rightNavButton = (function() {
		var button = Titanium.UI.createButton({
			title: '送信'
		});
		button.addEventListener('click', function() {
			// TweetをPostする
			postTweet();
		});
		return button;
	})();
}
btnCamera.addEventListener('click', function() {
	attachPhoto();
});