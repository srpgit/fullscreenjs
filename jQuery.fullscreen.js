/**
 * 在jquery对象上绑定一个使其全屏的方法。调用方式：$('div').fullScreen()。注意，只有部分浏览器才支持，只有用户操作事件才能触发全屏
 * 
 * @author srp
 * @since 2017/1/19
 * @version 2017/5/15 by srp 添加全屏标记类，便于控制样式
 */
(function($) {

	var fs = getFullScreenAPI();

	$.extend($.prototype, {
		/**
		 * 使当前元素全屏
		 */
		fullScreen : function() {
			var ele = this[0];
			if (!ele) {
				return this;
			}
			// 将所有父级iframe设置为可以全屏allowfullscreen=true
			var topWindow = window;
			var iframe = topWindow.frameElement;
			while (iframe != null) {
				iframe.setAttribute('allowfullscreen', true);
				topWindow = iframe.contentWindow.parent;
				iframe = topWindow.frameElement;
			}

			if (!fs.supportFullScreen) {
				alert('该浏览器不支持全屏操作！');
				return this;
			}

			/**
			 * 为兼容360浏览器7。若无需支持360浏览器7时，将supportLowVersion改为false，调用下面的代码会自动关闭其他全屏窗口，无需提示
			 */
			var supportLowVersion = true;
			if (supportLowVersion) {
				if (hasFullScreen(window.top)) {
					alert('请先关闭其他全屏窗口');
				} else {
					// 在元素上应用全屏方法
					fs.fullScreenMethod.call(ele);
				}
			} else {
				// 将所有iframe退出全屏
				exitAllFullScreen(window.top);
				// 在元素上应用全屏方法
				setTimeout(function() {
					fs.fullScreenMethod.call(ele);
				}, 100);
			}

			return this;
		},

		/**
		 * 退出全屏
		 */
		exitFullScreen : function() {
			documentExitFullScreen(document);
			return this;
		},

		/**
		 * 判断是否处于全屏状态
		 */
		isFullScreen : function() {
			return hasFullScreen(window.top);
		},

		/**
		 * 全屏状态绑定时的回调。如果是关闭窗口，callback收到的第一个参数是true，否则为false
		 */
		onFullScreenChange : function(callback) {
			// 事件在全屏操作之后才被调用
			document.addEventListener(fs.fullScreenEvtName, function(e) {
				var isClose = true;
				if (isFullScreen(document)) {
					isClose = false;
				}

				// 添加标记类
				var target = $(e.srcElement);
				if (isClose) {
					target.removeClass('fs-is-fullscreen').addClass('fs-not-fullscreen');
				} else {
					target.removeClass('fs-not-fullscreen').addClass('fs-is-fullscreen');
				}

				callback(isClose);
			}, false);
			return this;
		},

		/**
		 * 将本元素变成一个全屏控制器，可以控制其他元素全屏。当目标元素被全屏时，会自动将overflow设为auto，取消全屏时，取消oveflow属性
		 * 
		 * @param callback 全屏状态时回调回调。参数：target, 被全屏的目标；isClose，是否为取消全屏
		 * @author srp
		 * @since 2017/4/14
		 */
		controllFullScreen : function(target, callback) {
			return new FullScreenController(this, target, callback);
		}
	});

	/**
	 * 封装一个全屏控制器
	 */
	function FullScreenController(element, target, callback) {
		if (!element) {
			return;
		}
		
		//如果是ie低版本，不支持。@2017/5/26
		if(!$.support.radioValue){
			return;
		}

		var self = this;

		this.element = element;

		this.element.addClass('fs-controller fs-off').attr('title', '进入全屏').empty();

		target.onFullScreenChange(function(isClose) {
			if (isClose) {
				self.element.removeClass('fs-on').addClass('fs-off').attr('title', '进入全屏');
			} else {
				self.element.removeClass('fs-off').addClass('fs-on').attr('title', '退出全屏');
			}
			if (isClose) {
				target.css({
					'overflow' : '',
				});
			} else {
				target.css({
					'overflow' : 'auto',
				});
			}
			if (callback && callback instanceof Function) {
				callback(target, isClose);
			}
		});

		this.element.click(function() {
			if (self.element.hasClass('fs-on')) {
				target.exitFullScreen();
			} else {
				target.fullScreen();
			}
		});
	}

	/**
	 * 封装全屏api
	 */
	function getFullScreenAPI() {
		var de = document.documentElement;
		var fullScreenMethod = de.requestFullScreen || de.webkitRequestFullScreen || de.mozRequestFullScreen
				|| de.msRequestFullscreen;

		var supportFullScreen = !!fullScreenMethod;

		var exitFullScreenMethod = document.exitFullScreen || document.webkitExitFullscreen
				|| document.mozCancelFullScreen || document.msExitFullscreen;

		var fullScreenEvtName;
		if (document.webkitExitFullscreen) {
			fullScreenEvtName = 'webkitfullscreenchange';
		} else if (document.mozCancelFullScreen) {
			fullScreenEvtName = 'mozfullscreenchange';
		} else if (document.msExitFullscreen) {
			fullScreenEvtName = 'MSFullscreenChange';
		} else {
			fullScreenEvtName = 'fullscreenchange';
		}

		return {
			'fullScreenMethod' : fullScreenMethod,
			'supportFullScreen' : supportFullScreen,
			'exitFullScreenMethod' : exitFullScreenMethod,
			'fullScreenEvtName' : fullScreenEvtName
		};
	}

	/**
	 * win下所有iframe退出全屏
	 */
	var exitAllFullScreen = function(win) {
		var frameWindows = win.frames;
		documentExitFullScreen(win.document);
		for (var i = 0; i < frameWindows.length; i++) {
			var iframe = frameWindows[i].frameElement; // window.frameElement拿到当前window所在的iframe，顶级窗口一定返回null
			var document = iframe.contentWindow.document;
			documentExitFullScreen(document);
			exitAllFullScreen(iframe.contentWindow);
		}
	};

	/**
	 * 退出document的全屏
	 */
	var documentExitFullScreen = function(document) {
		if (isFullScreen(document)) {
			fs.exitFullScreenMethod.call(document);
		}
	};

	/**
	 * document是否全屏
	 */
	var isFullScreen = function(document) {
		return document.webkitIsFullScreen || document.mozIsFullScreen || document.msIsFullScreen
				|| document.isFullScreen;
	};

	/**
	 * 是否有全屏窗口存在
	 */
	var hasFullScreen = function(win) {
		var frameWindows = win.frames;
		if (isFullScreen(win.document)) {
			return true;
		}
		for (var i = 0; i < frameWindows.length; i++) {
			var iframe = frameWindows[i].frameElement; // window.frameElement拿到当前window所在的iframe，顶级窗口一定返回null
			return hasFullScreen(iframe.contentWindow);
		}
	};
})(jQuery, window);