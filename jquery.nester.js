(function( $ ){
	
	$.fn.nester = function(options) {
		
		this.each(function(e){
			nester(this, options);
		});
		
		
		function nester(element, options){
			
			var children,
				origin,
				previous,
				grabY,
				grabX,
				pageY,
				pageX,
				target,
				offset,
				height,
				mouse;
			
			children = $(element).find('li');
			
			children.dragg();
						
			$(element).on('dragstart', 'li', function(e){
				
				e.stopPropagation();
				
				origin 	= $(this);
				//parent	= origin.parent();
								
				grabY = pageY;
				grabX = pageX;
				
				mouse = "down";
				
				origin.find('li').toggleClass('no-target');
				
				
				$(element).find('li').not(origin).on('dragin', function(e){
					
					e.stopPropagation();
					
					if(!$(this).hasClass('no-target')){
					
						//$('#debug').append('dragin<br>');
						
						target = $(this);
						offset = target.offset();
						height = target.height();
						bottom = offset.top+height;
						
						
						$(document).on('drag', function(e){
													
							if($('#helper').offset().left>=(offset.left+10)){
								
								if(target.children('ul').length==0){
									target.append('<ul></ul>');
									target.children('ul').append(origin);
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
						});
						
					}
					
				});

				$(element).find('li').not(origin).on('dragout', function(e){
					
				});
				
				
				
				
				
				
			});
			
			
			
			
			$(document).on('mousemove', function(e){
				pageY = e.pageY;
				pageX = e.pageX;
				if(mouse=='down'){
					origin.css('visibility', '');
					origin.css('opacity', 0.5);
					
					$(element).find('li').children('ul').each(function(index, element) {
						if($(this).children('li').length==0) $(this).remove();
                    });
					
				}
			});
			
			
			$(document).on('drop', element, function(e){
				mouse = 'up';
				origin.find('li').toggleClass('no-target');
				$(document).off('dragin, dragout, drag');
				origin.css('opacity', 1);
			});
			
			
			
		}
				
	}
	
})( jQuery );