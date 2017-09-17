(function(){
	var camelRegExp = /-([a-z])/gi;
	var obj = Object.prototype;
	var toString = obj.toString;

	var pub = {
		addEvent: function(element, type, handler){
			if(element.addEventListener){
				element.addEventListener(type, handler, false);
			}else if(element.attachEvent){
				element.attachEvent('on' + type, handler);
			}else{
				element["on" + type] = handler;
			}
		},
		removeEvent: function(element, type, handler){
			if(element.removeEventListener){
				element.removeEventListener(type, handler, false);
			}else if(element.detachEvent){
				element.detachEvent('on' + type, handler);
			}else{
				element["on" + type] = null;
			}
		},
		getEvent: function(event){
			return event ? event : window.event;
		},
		getTarget: function(event){
			return event.target || event.srcElement;
		},
		preventDefault: function(event){
			if(event.preventDefault){
				event.preventDefault();
			}else{
				event.returnValue = false;
			}
		},
		stopPropagetion: function(event){
			if(event.stopPropagetion){
				event.stopPropagetion();
			}else{
				event.cancelBubble = true;
			}	
		},
		getRelatedTarget: function(event){
			if(event.relatedTarget){
				return event.relatedTarget;
			}else if(event.toElement){
				return event.toElement;
			}else if(event.fromElement){
				return event.fromElement;
			}else{
				return null;
			}
		},
		hasFeature: function(name, version){
			return document.implementation.hasFeature(name, version);
		},
		getButton: function(event){
			if(pub.hasFeature("MouseEvents", "2.0")){
				return event.button;
			}else{
				switch(event.button){
					case 0:
					case 1:
					case 3:
					case 5:
					case 7:
						return 0;
					case 2:
					case 6:
						return 2;
					case 4:
						return 1;
				}
			}
		},
		getWheelDelta: function(event){
			if(event.wheelDelta){
				return event.wheelDelta;
			}else{
				return -event.detail * 40;
			}
		},
		getCharCode: function(event){
			//触发keypress事件才有值
			if(typeof event.charCode === "number"){
				return event.charCode;
			}else{
				return event.keyCode;
			}
		},
		getCodeString: function(event){
			var keyCode = pub.getCharCode(event);
			return String.fromCharCode(keyCode);
		},
		//获取计算后的样式
		getComputedStyle: function(elem, pseudo){
			if(window.getComputedStyle){
				return window.getComputedStyle(elem, pseudo);
			}else{
				return elem.currentStyle;
			}
		},
		//获取具体样式，不支持驼峰写法
		getPropertyValue: function(elem, style, pseudo){
			if(window.getComputedStyle){
				return window.getComputedStyle(elem, pseudo).getPropertyValue(style);
			}else{
				style = pub.camelCase(style);
				//IE9+支持currentStyle.getPropertyValue方法
				return elem.currentStyle.getAttribute(style);
			}			
		},
		//阻止右键上下文菜单
		preventContextmenu: function(event){
			pub.addEvent(document, "contextmenu", function(event){
				event = pub.getEvent(event);
				pub.preventDefault(event);
			});
		},
		camelCase: function(str){
			return str.replace(/^-ms-/,"ms-").replace(camelRegExp, function(all, letter){
				return letter.toUpperCase();
			});
		},
		keys: function(obj){
			if(toString.call(obj) !== '[object Object]') return [];

			if(Object.keys){
				return Object.keys(obj);
			}

			var res = [];
			for(var key in obj){
				if(obj.hasOwnProperty(key)){
					res.push(key);
				}
			}
			return res;
		},
		//返回新对象
		extend: function(first, second){
			var result = {},
				i = 0,
				len = arguments.length;

			for(; i < len; i++){
				var obj = arguments[i],
					keys = pub.keys(obj),
					length = keys.length,
					j = 0, key;

				for(; j < length; j++){
					key = keys[j];

					if(obj[key] !== undefined){
						result[key] = obj[key];
					}
				}
			}
			return result;
		}

	}
	window.pub = pub;
})();