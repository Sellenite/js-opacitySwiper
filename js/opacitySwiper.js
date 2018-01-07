(function () {
    var dependences = {
        /* 获取元素方式 */
        getElement: function (element) {
            if (element.charAt(0) === '#') {
                return document.getElementById(element.substring(1))
            } else {
                return this.getByClass(element)
            }
        },
        getByClass: function (element) {
            var className = element.substring(1)
            if (document.getElementsByClassName) {
                return document.getElementsByClassName(className)
            } else {
                var result = []
                var tags = document.getElementsByTagName('*')
                for (var i = 0, len1 = tags.length; i < len1; i++) {
                    var classNames = tags[i].className.split(' ')
                    for (var j = 0, len2 = classNames.length; j < len2; j++) {
                        if (className === classNames[j]) {
                            result.push(tags[i])
                        }
                    }
                }
                return result
            }
        },
        /* 获取dom的子元素 */
        getChildren: function (el) {
            var childrenAll = el.childNodes
            var ret = []
            for (var i = 0; i < childrenAll.length; i++) {
                if (childrenAll[i].nodeType === 1) {
                    ret.push(childrenAll[i])
                }
            }
            return ret
        },
        /* 绑定事件兼容 */
        bindEvent: function (el, type, fn, capture) {
            // 兼容性，以webkit为标准
            var _eventCompat = function (event) {
                var type = event.type
                // firefox
                if (type === 'DOMMouseScroll' || type === 'mousewheel') {
                    event.delta = event.wheelDelta ? event.wheelDelta / 120 : -(event.detail || 0) / 3
                }
                // IE8
                if (event.srcElement && !event.target) {
                    event.target = event.srcElement
                }
                if (!event.preventDefault) {
                    event.preventDefault = function () {
                        event.returnValue = false
                    }
                }
                if (!event.stopPropagation) {
                    event.stopPropagation = function () {
                        event.cancelBubble = true
                    }
                }
                return event
            }
            if (window.addEventListener) {
                // firefox
                if (type === 'mousewheel' && document.mozFullScreen !== undefined) {
                    type = 'DOMMouseScroll'
                }
                el.addEventListener(type, function (event) {
                    fn.call(this, _eventCompat(event))
                }, capture || false)
            } else if (window.attachEvent) {
                el.attachEvent('on' + type, function (event) {
                    event = event || window.event
                    // attachEvent下的this指向window
                    fn.call(el, _eventCompat(event))
                })
            }
        },
        /**
         * @param {*dom} element 原生元素
         * @param {*number} transparency 0为透明，100为不透明
         * @param {*number} speed 1-100，数值越大，渐变速度越快
         * @param {*function} callback 回调
         */
        setOpacity: function (element, transparency, speed, callback) {
            //透明度渐变：transparency:透明度 0(全透)-100(不透)；speed:速度1-100，默认为1  
            if (!element.effect) {
                element.effect = {};
                element.effect.fade = 0;
            }
            clearInterval(element.effect.fade);
            var speed = speed || 1;
            var start = (function (elem) {
                var alpha;
                if (navigator.userAgent.toLowerCase().indexOf('msie') != -1) {
                    alpha = elem.currentStyle.filter.indexOf("opacity=") >= 0 ? (parseFloat(elem.currentStyle
                            .filter.match(/opacity=([^)]*)/)[1])) + '' :
                        '100';
                } else {
                    alpha = 100 * elem.ownerDocument.defaultView.getComputedStyle(elem, null)['opacity'];
                }
                return alpha;
            })(element);
            element.effect.fade = setInterval(function () {
                start = start < transparency ? Math.min(start + speed, transparency) : Math.max(start -
                    speed, transparency);
                element.style.opacity = start / 100;
                element.style.filter = 'alpha(opacity=' + start + ')';
                if (Math.round(start) == transparency) {
                    element.style.opacity = transparency / 100;
                    element.style.filter = 'alpha(opacity=' + transparency + ')';
                    clearInterval(element.effect.fade);
                    callback && callback.call(element);
                }
            }, 20);
        }
    }

    function opacitySwiper(el, delay, diff, callback) {
        // 用于记录鼠标进入后的标志
        this.flag = false
        this.callback = callback
        this.diff = diff || 2
        this.delay = delay
        this.root = dependences.getElement(el)[0]
        this.lists = dependences.getChildren(dependences.getChildren(this.root)[0])
        this.switchWrapper = dependences.getChildren(this.root)[1]
        this.switchs = null
        this.timer = null
        this.count = 0
        this.switchLeft = dependences.getChildren(this.root)[2]
        this.switchRight = dependences.getChildren(this.root)[3]
    }

    opacitySwiper.prototype.init = function () {
        var html = ''
        for (var i = 0; i < this.lists.length; i++) {
            this.lists[i].index = i
            this.lists[i].zIndex = 100 - i
            dependences.setOpacity(this.lists[i], 0, 100)
            html += '<span class="switch"></span>'
        }
        this.switchWrapper.innerHTML = html
        this.switchs = dependences.getChildren(dependences.getChildren(this.root)[1])
        dependences.setOpacity(this.lists[0], 100, 100)
        this.switchs[0].className = 'switch active'
        for (var i = 0; i < this.switchs.length; i++) {
            this.switchs[i].index = i
        }
        this.startAction()
        this.bindEvent()
    }

    opacitySwiper.prototype.startAction = function () {
        this.move()
    }

    opacitySwiper.prototype.move = function () {
        var _this = this
        this.timer = setInterval(function () {
            _this.count++;
            if (_this.count > _this.lists.length - 1) {
                _this.count = 0
            }
            _this.setOpacity(_this.count)
        }, this.delay)
    }

    opacitySwiper.prototype.setOpacity = function (index) {
        for (var i = 0; i < this.lists.length; i++) {
            dependences.setOpacity(this.lists[i], 0, this.diff)
            this.switchs[i].className = 'switch'
        }
        dependences.setOpacity(this.lists[index], 100, this.diff, this.callback)
        this.switchs[index].className = 'switch active'
    }

    opacitySwiper.prototype.bindEvent = function () {
        var _this = this
        /* switchs绑定 */
        for (var i = 0; i < this.switchs.length; i++) {
            dependences.bindEvent(this.switchs[i], 'click', function (e) {
                clearInterval(_this.timer)
                _this.count = this.index
                _this.setOpacity(_this.count);
                !_this.flag && _this.move()
            })
        }
        /* arrows绑定 */
        dependences.bindEvent(this.switchLeft, 'click', function (e) {
            clearInterval(_this.timer)
            _this.count--
                if (_this.count < 0) _this.count = _this.lists.length - 1
            _this.setOpacity(_this.count);
            !_this.flag && _this.move()
        })
        dependences.bindEvent(this.switchRight, 'click', function (e) {
            clearInterval(_this.timer)
            _this.count++
                if (_this.count > _this.lists.length - 1) _this.count = 0
            _this.setOpacity(_this.count);
            !_this.flag && _this.move()
        })
        /* 鼠标进入进出绑定 */
        dependences.bindEvent(this.root, 'mouseenter', function () {
            clearInterval(_this.timer)
            _this.flag = true
        })
        dependences.bindEvent(this.root, 'mouseleave', function () {
            _this.move()
            _this.flag = false
        })
    }

    _globals = (function () {
        return this || (0, eval)("this");
    }())

    if (typeof module !== "undefined" && module.exports) {
        module.exports = opacitySwiper
    } else if (typeof define === "function" && define.amd) {
        define(function () {
            return opacitySwiper
        })
    } else {
        _globals.opacitySwiper = opacitySwiper
    }
})();