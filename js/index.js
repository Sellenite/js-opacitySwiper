var swiper = new opacitySwiper('.swiper', 2000, 4, function () {
    console.log(this.index)
})

swiper.init()