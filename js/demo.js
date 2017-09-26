window.onload = function(){
	if (typeof(document.body.onselectstart) != "undefined") {        
	    // IE下禁止元素被选取        
	    document.body.onselectstart = new Function("return false");        
	}

	var container = document.querySelector(".container"),
		box = container.querySelector(".box"),	    //列表外层容器
		list = container.querySelector(".list"),    //列表
		li = list.getElementsByTagName("li"),	    //列表项
		frame = container.querySelector(".frame"),  //选中框
		result = document.querySelector(".result"),
		frameTop = frame.offsetTop,		            //中间框的top值
		lineHeight = li[0].offsetHeight || 32,		//单行高度
		listHeight = list.clientHeight,				//列表高度
		frameHeight = frame.clientHeight,
		isDown = false,
		scrollTimer = null,
		easeTimer = null,
		prevNode = null; //保存前一个元素

	//初始化列表位置
	box.style.top = frameTop + "px";
	
	var startY,
		diffY = 0,
		offset = 50,//最大溢出值
		fl = 150,
		startTime = null,
		vy = 0,
		isInTransition = false,
		cur = 0; //列表初始位置
	
	//检测选中项
	check();

	function setPos(y){
		var style = "translateY(" + y + "px) translateZ(0)";
		list.style.webkitTransform = style;
		list.style.MozTransform = style;
		list.style.msTransform = style;
		list.style.OTransform = style;
		list.style.transform = style;
	}

	function mousedown(e){
		if (isInTransition) return;//如果在滚动中，则中止执行
        clearTimeout(scrollTimer);
        vy = 0;
        //兼容touch事件
        e.clientY = e.clientY || e.changedTouches[0].clientY;
		startY = e.clientY;
		diffY = startY - cur;
		startTime = e.timeStamp;
		isDown = true;
	};

	function mousemove(e){
		if(!isDown) return;
		e.preventDefault();
		//兼容touch事件
		e.clientY = e.clientY || e.changedTouches[0].clientY;

		if(e.timeStamp - startTime > 40){
			startTime = e.timeStamp;
			cur = e.clientY - diffY;

			if(cur > 0){
				cur *= fl / (fl + cur);
			}else if(cur < frameHeight - listHeight){
				cur += listHeight - frameHeight;
				cur = cur * fl / (fl - cur) - listHeight + frameHeight;
			}

			setPos(cur);
			check();
		}
		vy = e.clientY - startY;
		startY = e.clientY;
	};

    function ease(target){
    	isInTransition = true;

        easeTimer = setInterval(function () {
            cur -= (cur - target) * 0.2;
            if (Math.abs(cur - target) < 1) {
                cur = target;
                clearInterval(easeTimer);
                isInTransition = false;
                check();
            }
            setPos(cur);
        }, 20);
    }

	function mleave(e){
		if(isDown){
			isDown = false;	
			var friction = ((vy >> 31) * 2 + 1) * 0.5,
				oh = listHeight - frameHeight;

			scrollTimer = setInterval(function(){
				vy -= friction;//力度按 惯性的大小递减
                cur += vy;//转换为额外的滑动距离
                setPos(cur);//滑动列表

                if (-cur - oh > offset) {//如果列表底部超出了
                    clearTimeout(scrollTimer);
                    ease(-oh);//回弹
                    return;
                }
                if (cur > offset) {//如果列表顶部超出了
                    clearTimeout(scrollTimer);
                    ease(0);//回弹
                    return;
                }
                if (Math.abs(vy) < 1) {//如果力度减小到小于1了,再做超出回弹
                    clearTimeout(scrollTimer);
                    if (cur > 0) {
                        ease(0);
                        return;
                    }
                    if (-cur > oh) {
                        ease(-oh);
                        return;
                    }
                    correct();
                }
                check();
			}, 20);
		}
	}
	//检查选中项
	function check(){
		if(cur > 0 || cur < frameHeight - listHeight) return;
		var diffVal = Math.round(Math.abs(cur) / lineHeight);
		if(diffVal < 0 || diffVal >= li.length) return;
		//初始判断
		if(!prevNode){
			prevNode = li[diffVal];
			// prevNode.classList.add("act");
			prevNode.className = "act";
		}

		if(prevNode != li[diffVal]){
			// prevNode.classList.remove("act");
			prevNode.className = "";
			// li[diffVal].classList.add("act");
			li[diffVal].className = "act";
			prevNode = li[diffVal];		//保存选中元素
		}
		
		result.innerHTML = li[diffVal].innerHTML;
	}
	//矫正位置
	function correct(){
		var diffVal = 0,
			half = lineHeight/2,
			newPos = null;
		
		diffVal = Math.abs(cur % lineHeight);

		if(diffVal < half){
			newPos = cur + diffVal;
		}else if(diffVal > half){				
			newPos = cur - (lineHeight - diffVal);
		}
		ease(newPos);
	}

	var wheelTimer = null;

	function wheelDelta(event){
		//清除运动相关的定时器
		clearTimeout(wheelTimer);
		clearInterval(easeTimer);

		event = event || window.event;
		event.preventDefault();  //阻止页面滚动

		var delta = event.wheelDelta || -event.detail * 40;

		if(delta < 0 && cur > frameHeight - listHeight + lineHeight){
			cur -= 50;
		}else if(delta > 0 && cur < -lineHeight){
			cur += 50;
		}

		setPos(cur);
		wheelTimer = setTimeout(function(){
			correct();
		},200);
		check();
	}

	container.addEventListener("mousewheel", wheelDelta, false);
	container.addEventListener("DOMMouseScroll", wheelDelta, false);
	container.addEventListener("mousedown", mousedown, false);
	container.addEventListener("mousemove", mousemove, false);
	container.addEventListener("mouseleave", mleave, false);
    container.addEventListener("mouseup", mleave, false);
    container.addEventListener("touchstart", mousedown, false);
	container.addEventListener("touchmove", mousemove, false);
	container.addEventListener("touchend", mleave, false);
}