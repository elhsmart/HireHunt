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

                if($(DragHandler.el).parents(".job").length > 0) {
                    DragHandler.el = $(DragHandler.el).parents(".job")[0];
                } else {
                    return;
                }
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

                // Trash can is not usual column, so this need to be adjusted a little.
                pos = {
                    x: $(this).position().left,
                    y: $(this).position().top
                };

                if(pos.x == 0 && $(this).parent().hasClass("column")) {
                    pos.x = $(this).parent().position().left;
                }

                if( e.clientX > pos.x &&
                    e.clientX < pos.x + $(this).width() &&
                    e.clientY > pos.y &&
                    e.clientY < pos.y + $(this).height()
                ) {
                    currentColumn = this;
                }
            });

            $(currentColumn).find(".joblist-inner").append(DragHandler.el);

            var app_id = $(DragHandler.el).attr("app_id");
            var col_type = parseInt($(currentColumn).attr("col_type"));

            //console.log(app_id, col_type, $(currentColumn));

            AppStorage.get(app_id, function(data) {
                data['app-' + app_id].type = col_type;
                AppStorage.update(app_id, data, function(){});
            });

            if($(currentColumn).hasClass("rejected-can")) {
                $(DragHandler.el).remove();
                return;
            }

            $(DragHandler.el).css({
                position: '',
                top: '',
                left: '',
                zIndex: 0
            })

            DragHandler.el = null;
        },

        mouseMove: function(e) {
            $(DragHandler.el).css({
                position: 'absolute',
                zIndex: 10,
                left: e.clientX - DragHandler.pos.x,
                top: e.clientY - DragHandler.pos.y
            });
        }
    }


    $(document).mousedown( DragHandler.mouseDown )

    document.buttons = {
        addApp: Dialog($("#add-app"), $(".joblist-appliedto .icon-plus-sign")),
        credits: Dialog($("#credits"), $(".credits"))
    }

    window.addEventListener('storageLoaded', function() {
        AppStorage.getAll(function(data){
            var appBlock
            for (var app in data) {
                if (data.hasOwnProperty(app)) {
                    var application = data[app];

                    appBlock = Ashe.parse($("#columned-app").html(), application);
                    $(appBlock).find("img").attr('src', application.company_image);

                    switch(application.type) {
                        case AppTypes.applied_to: {
                            $(".joblist-appliedto .joblist-inner").append(appBlock);
                            break;
                        }
                        case AppTypes.interviewing: {
                            $(".joblist-interviewing .joblist-inner").append(appBlock);
                            break;
                        }
                        case AppTypes.job_offered: {
                            $(".joblist-joboffered .joblist-inner").append(appBlock);
                            break;
                        }
                        case AppTypes.testing: {
                            $(".joblist-testing .joblist-inner").append(appBlock);
                            break;
                        }
                    }
                }
            }
        });
    });
})
