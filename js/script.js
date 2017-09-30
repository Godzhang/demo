var UI = UI || {};
!function(){
	function Scroll(options){
		this.opt = Object.assign({
			el: '',
			change: function(){}
		},options);

		//dom
		this.el = this.opt.el;
		this.ul = this.el.querySelector('ul');
		this.li = this.ul.querySelectorAll('li');

		//初始化变量
		this.h = parseInt(getComputedStyle(this.li[0])['height']);  //选项元素高度
		this.f = ( parseInt(getComputedStyle(this.el)['height']) - this.h ) / 2;  //初始化偏移量
		this.ul.style['margin-top'] = this.f + 'px';

		//过程选项
		this.p; 						//onstart ul的起始位置 
		this._p;						//onend   ul结束位置或者目标位置
		this.t;							//鼠标点击或touch开始 的 时间
		this.start;						//鼠标或touch 起点位置
		this.stop;						//鼠标或touch 终点位置

		//可设置选项
		this.change = this.opt.change;	//触发选项 change 事件 function
		this.min = 0;					//可选项的起点索引
		this.max = this.li.length -1;	//可选项的终点索引
		this.index = 0 ;				//当前选中值的索引

		if(this.el){
			this._startHandler = this._onStart.bind(this);
			this._moveHandler = this._onMove.bind(this);
			this._endHandler = this._onEnd.bind(this);

			this.el.addEventListener('mousedown', this._startHandler, false);
			this.el.addEventListener('touchstart', this._startHandler, false);
			this.el.addEventListener('touchmove', this._moveHandler, false);
			this.el.addEventListener('touchend', this._endHandler, false);
		}

		var _this = this;
		this.ul.addEventListener('transitionend', this._onChange.bind(this));
	}

	Scroll.prototype._onStart = function(e){
		e.preventDefault();
		e.stopPropagation();

		this.start = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;  //记录起点坐标
		this.t = new Date(); 												  //记录开始点击时间
		this.p = this._getPosition() || 0;

		this._onScroll(this.p); // 处理移动中点击定位

		if(e.type === 'mousedown'){
			document.addEventListener('mousemove', this._moveHandler, false);
			document.addEventListener('mouseup', this._endHandler, false);
		}

	}

	Scroll.prototype._onMove = function(e){
		e.preventDefault();
		e.stopPropagation();

		this.stop = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;

		if(Math.abs( this.stop - this.start ) > 3){
			//处理拖拽中ul的定位
			this._onScroll( this._adjustPosition( this.p + (this.start - this.stop) / this.h, this.min - 1, this.max + 1 ) );
		}
	}

	Scroll.prototype._onEnd = function(e){
		e.preventDefault();
		e.stopPropagation();

		if(e.type === 'mouseup'){
			document.removeEventListener('mousemove', this._moveHandler, false);
			document.removeEventListener('mouseup', this._endHandler, false);
		}

		this.stop = e.changedTouches ? e.changedTouches[0].pageY : e.pageY;

		var speed,
			dist = this.stop - this.start,   //鼠标滑动距离
			time = new Date() - this.t;      //滑动时间

		// if(time < 300){
		// 	speed = dist / time;

		// }

		val	= this._adjustPosition( Math.round( this.p - dist / this.h ), this.min, this.max);
console.log(val)
		time = speed ? Math.max(0.1, Math.abs( (val - this.p) / speed ) * 0.1) : 0.1;

		this._p = val;

		this._onScroll(val, time, dist == 0);
	}


	Scroll.prototype._onScroll = function(val, time, noAnimation){
		var px = - val * this.h;  //计算移动距离

		this.ul.style['transition'] = 'transform ' + (time ? time.toFixed(3) : 0) + 's ease-out';
		this.ul.style['transform'] = 'translate3d(0,' + px + 'px, 0)';
	
		if(time && noAnimation){
			this._onChange();
		}
	}


	Scroll.prototype._onChange = function(){
		if(this.index != this._p){
			this.index = this._p;
			this.change(this);
		}
	}
	Scroll.prototype._adjustPosition = function(val, min, max){
		return Math.max(min, Math.min(val, max));
	}
	Scroll.prototype._getPosition = function(){
		var matrix = getComputedStyle(this.ul)['transform'].split(')')[0].split(', ');
		var y = matrix[13] || matrix[5];
		return Math.round(- y / this.h);
	}

	window.UI.TouchScroll = Scroll;

	var s = new Scroll({
		el: document.getElementById('sc'),
		change: function(value){
			document.getElementById('result').innerHTML = value.index + 1;
		}
	});
}();
