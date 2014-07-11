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
		children.dragg({ helper : options.helper });
		
		
		if(options.tolerateChild!=null) options.tolerateChild = ' > '+options.tolerateChild
		
		
		// pass the event down to the parent li
		$this.on('mousedown', 'li'+options.tolerateChild, function(e){
			$(this).parent('li').trigger('mousedown');
		});
		// pass the event drag to the parent li
		$this.on('drag', 'li'+options.tolerateChild, function(e){
			$(this).parent('li').trigger('drag');
		});
		
		$this.on('dragstart', 'li', function(e){
			
			e.stopPropagation();
			
			origin = $(this);
			helper = $('#'+options.helper);
			target = '';
			grabY = pageY;
			grabX = pageX;
			mouse = "down";
			
			helper.find('li').andSelf().css({
				'list-style' : origin.css('list-style'),
				'margin' : origin.css('margin')
			});
			
			if(options.collapse){
				helper.find(options.listType).slideUp('fast');
				origin.find(options.listType).hide();
			}
			
			origin.css('visibility', '');
			origin.css('opacity', 0.5);
			
			origin.toggleClass('no-target').find('li').toggleClass('no-target');
			
			if($.isFunction(options.onStart)) {
				options.onStart.call($this);
			}
			
			$this.find('li'+options.tolerateChild).on('dragin', function(e){
				e.stopPropagation();
				if(!$(this).parent().hasClass('no-target')){ //////// NEEDS REFACTORING
					
					var upperLevel = $(this).parent().parent().parent();
					
					if(helper.offset().left>=($(this).parent().offset().left) && (!$.contains(upperLevel, $this))){
						target = $(this).parent('li');
					}
					else{
						target = upperLevel;
					}
					//target = $(this).parent();
					offset = target.offset();
					height = target.height();
					bottom = offset.top+height;
					
				}
				
			});

			$this.find('li'+options.tolerateChild).on('dragout', function(e){
				//target = '';
			});
		});
		
		$(document).on('drag', function(e){
			
			if(target){
				var totalParents = target.parents('li').length;
				var totalChildren = origin.find(options.listType+' li').length+totalParents;
				
				if(
				(helper.offset().left>=(offset.left+options.treshold)) &&
				(totalParents<(options.maxLevels-1)) &&
				(totalChildren<(options.maxLevels-1))
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
				
				console.log(target);
				
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
		
		var root = $(this).children('li').not('#'+options.helper);
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
		
		var root = $(this).find('li').not('#'+options.helper);
		var elements = jQuery.makeArray(root);
		var finalArray = new Array();
		
		$(elements).each(function(index, element) {
			
			var subArray = {};
			
			if($.isFunction(options.parser)) {
				options.parser.call(element);
			}
			
			subArray.item = options.parser.call(element);
			subArray.parent = options.parser.call($(element).parent(options.listType).parent('li')) || options.root;
		
			finalArray.push(subArray);
			
        });
		
		return finalArray;
		
	}
	
	var getSerialized = function(options){
		
		var root = $(this).find('li').not('#'+options.helper);
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
			helper			: 'helper',
			maxLevels		: 3,
			treshold		: 20,
			listType 		: 'ul',
			tolerateChild 	: null, // Sometimes it's a challenge :P
			collapse		: true,
			parser			: function(){return $(this).index();},
			root			: 'root',
			onStart 		: function(){},
			onDrag 			: function(){},
			onDrop 			: function(){}
		}; 
		
		var options = $.extend({}, defaults, options);
		
		return methods[method].call(this, options);
		
	}
	
	
	
	
	
})( jQuery );