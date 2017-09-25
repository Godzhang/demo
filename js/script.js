window.onload = function(){
	var container = document.querySelector(".container"),
		box = container.querySelector(".box"),	    //列表外层容器
		list = container.querySelector(".list"),    //列表
		li = list.getElementsByTagName("li"),	    //列表项
		frame = container.querySelector(".frame"),  //选中框
		result = document.querySelector(".result"),
		frameTop = frame.offsetTop,		            //中间框的top值
		lineHeight = li[0].offsetHeight || 32;      
		flag = false,
		prevNode = null; //保存前一个元素

	//初始化列表位置
	box.style.top = frameTop + "px";
	//检测选中项
	check();

	var listTop,
		startY,  //初始坐标
		diffY = 0;  //坐标差

	function moveList(event){
		event = event || window.event;

		switch(event.type){
			case "mousedown":
				flag = true;
				startY = event.clientY;  //点击位置坐标
				listTop = list.offsetTop;//记录初始top
				break;
			case "mousemove":
				if(flag){
					diffY = event.clientY - startY;
					list.style.top = listTop + diffY + "px";
				}				
				break;
			case "mouseup":
				flag = false;
				correct();  //矫正位置
				check();    //确定选项
				break;
		}
	}

	function correct(){
		var listEndTop = list.offsetTop,     	   //列表top
			listHeight = list.offsetHeight,		   //列表height
			diffVal,							   //偏差距离
			halfVal = Math.round(lineHeight / 2);  //判断依据

		//保证列表内容在选中框内
		if(listEndTop > 0){
			list.style.top = '0px';
			return;
		}
		if(listEndTop - lineHeight < -listHeight){
			list.style.top = -(listHeight - lineHeight) + "px";
			return;
		}		
		//调整中间位置
		diffVal = Math.abs(listEndTop) % lineHeight;
		if(diffVal >= halfVal){
			list.style.top = listEndTop - (lineHeight - diffVal) + "px";
		}else if(diffVal < halfVal && diffVal !== 0){
			list.style.top = listEndTop + diffVal + "px";
		}
	}
	//利用调整位置后的数据计算选中项
	function check(){
		var listEndTop = list.offsetTop,
			diffVal = Math.abs(listEndTop) / lineHeight;

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

	function wheelDelta(event){
		event = event || window.event;
		if(event.preventDefault){
			event.preventDefault();
		}else{
			event.returnValue = false;
		}
		
		var listTop = list.offsetTop,
			delta = event.wheelDelta || -event.detail;

		if(delta < 0){
			listTop -= lineHeight;
			list.style.top = listTop + "px";			
		}else{
			listTop += lineHeight;
			list.style.top = listTop + "px";
		}
		
		correct();
		check();
	}

	container.addEventListener("mousewheel", wheelDelta, false);
	container.addEventListener("DOMMouseScroll", wheelDelta, false);
	container.addEventListener("mousedown", moveList, false);
	document.addEventListener("mousemove", moveList, false);
	document.addEventListener("mouseup", moveList, false);
}