$(document).ready(function(){

    var DragHandler = {

        pos: {
            x: 0,
            y: 0
        },
        el: null,

        mouseDown: function(e) {
            DragHandler.el = document.elementFromPoint(e.clientX, e.clientY);

            if(!$(DragHandler.el).hasClass("job")) {
                return;
            }

            DragHandler.pos.x = e.clientX - $(DragHandler.el).position().left;
            DragHandler.pos.y = e.clientY - $(DragHandler.el).position().top;

            $(document).mousemove( DragHandler.mouseMove );
            $(document).mouseup( DragHandler.mouseUp );
        },

        mouseUp: function(e) {
            var currentColumn = null;

            $(document).unbind("mousemove");
            $(document).unbind("mouseup");

            $(".column").each(function(){
                if( e.clientX > $(this).position().left &&
                    e.clientX < $(this).position().left + $(this).width() &&
                    e.clientY > $(this).position().top &&
                    e.clientY < $(this).position().top + $(this).height()
                ) {
                    currentColumn = this;
                }
            });

            $(currentColumn).append(DragHandler.el);

            $(DragHandler.el).css({
                position: '',
                top: '',
                left: ''
            })

            DragHandler.el = null;
        },

        mouseMove: function(e) {
            $(DragHandler.el).css({
                position: 'absolute',
                left: e.clientX - DragHandler.pos.x,
                top: e.clientY - DragHandler.pos.y
            });
        }
    }


    $(document).mousedown( DragHandler.mouseDown )

    console.log("added");
})
