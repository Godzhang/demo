window.onload = function(){
	var container = document.querySelector(".container"),
		box = container.querySelector(".box"),	    //列表外层容器
		list = container.querySelector(".list"),    //列表
		li = list.getElementsByTagName("li"),	    //列表项
		frame = container.querySelector(".frame"),  //选中框
		result = document.querySelector(".result"),
		frameTop = frame.offsetTop,		            //中间框的top值
		lineHeight = li[0].offsetHeight || 32,
		listHeight = list.clientHeight,
		frameHeight = frame.clientHeight,
		isDown = false,
		timer = null,
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
			list.style.transform = "translateY(" + y + "px) translateZ(0)";
		}

		container.onmousedown = function(e){
			if (isInTransition) return;//如果在滚动中，则中止执行
            clearTimeout(this.timer);
            vy = 0;
			startY = e.clientY;
			diffY = startY - cur;
			startTime = e.timeStamp;
			isDown = true;
		};
		container.onmousemove = function(e){
			if(!isDown) return;
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
		container.addEventListener("mouseleave", mleave, false);

        container.addEventListener("mouseup", mleave, false);

        function ease(target){
        	isInTransition = true;
            list.timer = setInterval(function () {
                cur -= (cur - target) * 0.2;
                if (Math.abs(cur - target) < 1) {
                    cur = target;
                    clearInterval(list.timer);
                    isInTransition = false;
                    check();
                }
                setPos(cur);
            }, 20);
        }

		function mleave(e){
			if(isDown){
				isDown = false;	
				var t = this,
					friction = ((vy >> 31) * 2 + 1) * 0.5,
					oh = listHeight - frameHeight;

				t.timer = setInterval(function(){
					vy -= friction;//力度按 惯性的大小递减
                    cur += vy;//转换为额外的滑动距离
                    setPos(cur);//滑动列表

                    if (-cur - oh > offset) {//如果列表底部超出了
                        clearTimeout(t.timer);
                        ease(-oh);//回弹
                        return;
                    }
                    if (cur > offset) {//如果列表顶部超出了
                        clearTimeout(t.timer);
                        ease(0);//回弹
                        return;
                    }
                    if (Math.abs(vy) < 1) {//如果力度减小到小于1了,再做超出回弹
                        clearTimeout(t.timer);
                        if (cur > 0) {
                            ease(0);
                            return;
                        }
                        if (-cur > oh) {
                            ease(-oh);
                            return;
                        }
                    }
                    check();
				}, 20);
			}
		}

		function check(){
			var diffVal = Math.floor(Math.abs(cur) / lineHeight);
			if(diffVal < 0 || diffVal >= li.length) return;
			//初始判断
			if(!prevNode){
				prevNode = li[diffVal];
				prevNode.classList.add("act");
			}

			if(prevNode != li[diffVal]){
				prevNode.classList.remove("act");
				li[diffVal].classList.add("act");
				prevNode = li[diffVal];		//保存选中元素
			}
			
			result.innerHTML = li[diffVal].innerHTML;
		}













}