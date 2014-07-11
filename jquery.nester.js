(function( $ ){
	
	var runNester = function(options){
		
		var $this,
			children,
			origin,
			previous,
			grabY,
			grabX,
			pageY,
			pageX,
			helper,
			target,
			offset,
			height,
			mouse;
		
		$this = $(this);
		
		children = $this.find('li');
		children.dragg();
		
		$this.on('dragstart', 'li', function(e){
			
			e.stopPropagation();
			
			origin = $(this);
			helper = $('#helper');
			target = '';
			grabY = pageY;
			grabX = pageX;
			mouse = "down";
			
			origin.css('visibility', '');
			origin.css('opacity', 0.5);
			
			origin.toggleClass('no-target').find('li').toggleClass('no-target');
			
			if($.isFunction(options.onStart)) {
				options.onStart.call($this);
			}
			
			$this.find('li').on('dragin', function(e){
				e.stopPropagation();
				if(!$(this).hasClass('no-target')){
						target = $(this);
						offset = target.offset();
						height = target.height();
						bottom = offset.top+height;
				}
			});

			$this.find('li').on('dragout', function(e){
				
			});
		});
		
		$(document).on('drag', function(e){
			if(target){
				
				var parents_limit = target.parents('li').length;
				var children_limit = origin.find(options.listType+' li').length+parents_limit;
				
				
				if(
				(helper.offset().left>=(offset.left+10)) &&
				(parents_limit<(options.maxLevels-1)) &&
				(children_limit<(options.maxLevels-1))
				)
				{
					if(target.children(options.listType).length==0){
						target.append('<'+options.listType+'></'+options.listType+'>').children(options.listType).append(origin);
					}
				}
				else {
					if(pageY>(offset.top+(height/2))){
						target.after(origin);
					}
					else if(pageY<bottom){
						target.before(origin);
					}
					else target.after(origin);
				}
			}
			if($.isFunction(options.onDrag)) {
				options.onDrag.call($this);
			}
		});
		
		$(document).on('mousemove', $this, function(e){
			pageY = e.pageY;
			pageX = e.pageX;
			if(mouse=='down'){
				$this.find('li').children(options.listType).each(function(index, element) {
					if($(this).children('li').length==0) $(this).remove();
				});
			}
		});
		
		$(document).on('drop', function(e){
			mouse = 'up';
			origin.toggleClass('no-target').find('li').toggleClass('no-target');
			$(document).off('dragin, dragout');
			origin.css('opacity', '');
			if($.isFunction(options.onDrop)) {
				options.onDrop.call($this);
			}
		});
		
	}
	
		
	var getHierarchy = function(options){
		
		var root = $(this).children('li').not('#helper');
		var elements = jQuery.makeArray(root);
		var finalArray = new Array();
		
		$(elements).each(function(index, element) {
			
			var subArray = {};
			
			if($.isFunction(options.parser)) {
				options.parser.call(element);
			}
			
			subArray.item = options.parser.call(this);
			
			var children = $(this).children(options.listType);
			if(children.length>0) subArray.children = getHierarchy.call(children, options);
			
			finalArray.push(subArray);
			
        });
		
		return finalArray;
		
	}
	
	var getArray = function(options){
		
		var root = $(this).find('li').not('#helper');
		var elements = jQuery.makeArray(root);
		var finalArray = new Array();
		
		$(elements).each(function(index, element) {
			
			var subArray = {};
			
			if($.isFunction(options.parser)) {
				options.parser.call(element);
			}
			
			subArray.item = options.parser.call(element);
			subArray.parent = options.parser.call($(element).parent(options.listType).parent('li')) || 'root';
		
			finalArray.push(subArray);
			
        });
		
		return finalArray;
		
	}
	
	var getSerialized = function(options){
		
		var root = $(this).find('li').not('#helper');
		var elements = jQuery.makeArray(root);
		var serialized = '';
		
		$(elements).each(function(index, element) {
			
			if(index>0) serialized +='&';
			
			if($.isFunction(options.parser)) {
				options.parser.call(element);
			}
			
			serialized += 'item['+options.parser.call(element)+']=';
			serialized += options.parser.call($(element).parent(options.listType).parent('li')) || null;
			
        });
		
		return serialized;
		
	}
	
	
	var methods = {
		
		init : function(options){
			return this.each(function(e){
				runNester.call(this, options);
			});
		},
		destroy: function(options) {
			return $(this).each(function() {
				var $this = $(this);
				$this.find('li').dragg('destroy');
			});
		},
		toHierarchy: function(options) {
			return getHierarchy.call(this, options);
		},
		toArray: function(options) {
			return getArray.call(this, options);
		},
		serialize: function(options) {
			return getSerialized.call(this, options);
		}
		
		
	}

	
	
	
	$.fn.nester = function(method, options) { 
		
		if(!method || jQuery.isPlainObject(method) || !methods[method]){
			options = method;
			method = 'init';
		}
		
		var defaults = {
			maxLevels : 3,
			listType : 'ul',
			parser: function(){return $(this).index();},
			onStart : function(){},
			onDrag : function(){},
			onDrop : function(){}
		}; 
		
		var options = $.extend({}, defaults, options);
		
		return methods[method].call(this, options);
		
	}
	
	
	
	
	
})( jQuery );