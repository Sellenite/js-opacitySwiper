# opacitySwiper
A swiper switcher with opacity base on JavaScript.

Also support IE8

### usage

载入opacitySwiper.css文件，修改成想要的样式

html需要以下结构，list内容为轮播内容：

```html
<div class="swiper">
    <div class="list-wrapper">
        <div class="list">...</div>
        <div class="list">...</div>
        <div class="list">...</div>
        <div class="list">...</div>
    </div>
    <div class="switch-wrapper"></div>
    <span class="arrow-left">&lt;</span>
    <span class="arrow-right">&gt;</span>
</div>
```

> 初始化，参数实例：

- 参数一：传入className或idName

- 参数二：轮播间隔

- 参数三：透明度渐变速度，范围1到100，1最慢，100最快

- 参数四：回调函数，每次轮播透明度结束后触发，绑定this为当前轮播元素dom，在dom上绑定了index这个属性，可以通过访问this.index拿到当前元素的索引

```javascript
var swiper = new opacitySwiper('.swiper', 2000, 4, function () {
    console.log(this.index)
})

swiper.init()
```
