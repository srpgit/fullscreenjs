# fullscreenjs

*使任意元素全屏，只有部分浏览器才支持，只有用户操作事件才能触发全屏*

# 使用方式

1. 在页面引入：
```js
jQuery.fn.fullscreen.js
jQuery.fn.fullscreen.css
```
**注：**
>- 需要在jqgrid引入之后再引入

2. 方法说明：
```js
//全屏
$('#id').fullscreen(); 

//所有元素退出全屏
$('#id').exitFullScreen();

//判断是否有元素处于全屏状态
$('#id').isFullScreen();

//给当前元素绑定全屏状态改变时的事件
$('#id').onFullScreenChange(function(isClose){
   // 如果是关闭窗口，isClose参数为true 
});

//将本元素变成一个全屏控制器，可以控制其他元素全屏
$('#id').controllFullScreen(target, callback);
target:要全屏的元素
callback:全屏状态改变时回调，同onFullScreenChange
```
