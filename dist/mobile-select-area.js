/*
 * Created with Sublime Text 2.
 * User: 田想兵
 * Date: 2015-03-31
 * Time: 09:49:11
 * Contact: 55342775@qq.com
 */
function MobileSelectArea() {
	var rnd = Math.random().toString().replace('.', '');
	this.id = 'scroller_' + rnd;
	this.scroller;
	this.data ;
	this.index = 0;
	this.value = [0, 0, 0];
	this.oldvalue;
	this.text = ['', '', ''];
	this.level = 3;
	this.mtop = 30;
};
MobileSelectArea.prototype = {
	init: function(settings) {
		this.settings = $.extend({}, settings);
		this.trigger = this.settings.trigger;
		this.trigger.attr("readonly", "readonly");
		this.value = (this.settings.value && this.settings.value.split(",")) || [0, 0, 0];
		this.oldvalue = this.value.concat([]);
		this.getData();
		this.bindEvent();
	},
	getData: function() {
		var _this = this;
		if (typeof this.settings.data == "object") {
			this.data = this.settings.data;
		} else {
			$.ajax({
				dataType:'json',
				cache:true,
				url:this.settings.data,
				type:'GET',
				success:function(result){
					_this.data =result.data;
				},
				accepts:{
					json:"application/json, text/javascript, */*; q=0.01"
				}
			});
		}
	},
	bindEvent: function() {
		var _this = this;
		this.trigger.tap(function(e) {
			$.confirm('<div class="ui-scroller-mask"><div id="' + _this.id + '" class="ui-scroller"><div></div><div ></div><div></div><p></p></div></div>', null, function(t, c) {
				if (t == "yes") {
					_this.submit()
				}
				if (t = 'no') {
					_this.cancel();
				}
				this.dispose();
			});
			_this.scroller = $('#' + _this.id);
			_this.format();
			var start = 0,
				end = 0
			_this.scroller.children().bind('touchstart', function(e) {
				start = e.changedTouches[0].pageY;
			});
			_this.scroller.children().bind('touchmove', function(e) {
				end = e.changedTouches[0].pageY;
				var diff = end - start;
				var dl = $(e.target).parent();
				var top = parseInt(dl.css('top') || 0) + diff;
				dl.css('top', top);
				start = end;
				return false;
			});
			_this.scroller.children().bind('touchend', function(e) {
				end = e.changedTouches[0].pageY;
				var diff = end - start;
				var dl = $(e.target).parent();
				var i = $(dl.parent()).index();
				var top = parseInt(dl.css('top') || 0) + diff;
				if (top > _this.mtop) {
					top = _this.mtop;
				}
				if (top < -$(dl).height() + 60) {
					top = -$(dl).height() + 60;
				}
				var mod = top / _this.mtop;
				var mode = Math.round(mod);
				var index = Math.abs(mode) + 1;
				if (mode == 1) {
					index = 0;
				}
				_this.value[i] = $(dl.children().get(index)).attr('ref');
				_this.value[i] == 0 ? _this.text[i] = "" : _this.text[i] = $(dl.children().get(index)).html();
				for (var j = _this.data.length - 1; j > i; j--) {
					_this.value[j] = 0;
					_this.text[j] = "";
				}
				$(dl.children().get(index)).addClass('focus').siblings().removeClass('focus');
				dl.css('top', mode * _this.mtop);
				// _this.index = i + 1;
				_this.format();
				return false;
			});
			return false;
		});
	},
	format: function() {
		var _this = this;
		var child = _this.scroller.children();
		this.f(this.data);
	},
	f: function(data) {
		var _this = this;
		var item = data;
		if (!item) {
			item = [];
		};
		var str = '<dl><dd ref="0">——</dd>';
		var focus = 0,
			childData, top = _this.mtop;
		if (_this.index !== 0 && _this.value[_this.index - 1] == "0") {
			str = '<dl><dd ref="0" class="focus">——</dd>';
			_this.value[_this.index] = 0;
			_this.text[_this.index] = "";
			focus = 0;
		} else {
			if (_this.value[_this.index] == "0") {
				str = '<dl><dd ref="0" class="focus">——</dd>';
				focus = 0;
			}
			for (var j = 0, len = item.length; j < len; j++) {
				var pid = item[j].pid || 0;
				var id = item[j].id || 0;
				var cls = '';
				if (_this.value[_this.index] == id) {
					cls = "focus";
					focus = id;
					childData = item[j].child;
					top = _this.mtop * (-j);
				};
				str += '<dd pid="' + pid + '" class="' + cls + '" ref="' + id + '">' + item[j].name + '</dd>';
			}
		}
		str += "</dl>";
		var newdom = $(str);
		newdom.css('top', top);
		var child = _this.scroller.children();
		$(child[_this.index]).html(newdom);
		_this.index++;
		if (_this.index > _this.level - 1) {
			_this.index = 0;
			return;
		}
		_this.f(childData);
	},
	submit: function() {
		this.oldvalue = this.value.concat([]);
		if (this.trigger[0].nodeType == 1) {
			//input
			this.trigger.val(this.text.join(' '));
			this.trigger.attr('data-value', this.value.join(','));
		}
		this.trigger.next(':hidden').val(this.value.join(','));
		this.settings.callback && this.settings.callback(this.scroller);
	},
	cancel: function() {
		this.value = this.oldvalue.concat([]);
	}
};