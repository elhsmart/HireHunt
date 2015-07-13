$(document).ready(function(){

    var manifest = chrome.runtime.getManifest();

    var DragHandler = {

        pos: {
            x: 0,
            y: 0
        },

        moveThrottler: 0,

        el: null,

        getCurrentColumn: function(e) {
            var currentColumn = null;

            $(".column").each(function(){
                if(currentColumn != null) {
                    return;
                }
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

            return currentColumn;
        },

        getCurrentBlock: function(column, e) {
            var currentBlock = null;

            $(column).find(".job").each(function(){
                if(currentBlock != null) {
                    return;
                }

                if($(this).hasClass("job-moved")) {
                    return;
                }

                pos = {
                    x: $(this).position().left,
                    y: $(this).position().top
                };

                pos.x = pos.x + $(column).position().left;
                if( e.clientX > pos.x &&
                    e.clientX < pos.x + $(this).width() &&
                    e.clientY > pos.y &&
                    e.clientY < pos.y + $(this).height()
                ) {
                    currentBlock = this;
                }
            });

            return currentBlock;
        },

        mouseDown: function(e) {
            DragHandler.el = document.elementFromPoint(e.clientX, e.clientY);
            if(!$(DragHandler.el).hasClass("job")) {

                if($(DragHandler.el).parents(".job").length > 0) {
                    DragHandler.el = $(DragHandler.el).parents(".job")[0];
                } else {
                    return;
                }

                if($(DragHandler.el).hasClass("removed-job")) {
                    return;
                }
            }

            DragHandler.pos.x = e.clientX - $(DragHandler.el).position().left;
            DragHandler.pos.y = e.clientY - $(DragHandler.el).position().top;

            $(DragHandler.el).after("<div class='job-placeholder'></div>");
            $(DragHandler.el).addClass("job-moved");
            $(DragHandler.el).css({
                position: 'absolute',
                zIndex: 10,
                left: e.clientX - DragHandler.pos.x,
                top: e.clientY - DragHandler.pos.y
            });

            $(document).mousemove( DragHandler.mouseMove );
            $(document).mouseup( DragHandler.mouseUp );
        },

        mouseUp: function(e) {
            var currentColumn = DragHandler.getCurrentColumn(e);

            $(document).unbind("mousemove");
            $(document).unbind("mouseup");

            $(currentColumn).find(".job-placeholder").before(DragHandler.el);

            var app_id = $(DragHandler.el).attr("app_id");
            var col_type = parseInt($(currentColumn).attr("col_type"));

            AppStorage.get(app_id, function(data) {
                var old_type = data['app-' + app_id].type;
                data['app-' + app_id].type = col_type;
                data['app-' + app_id].update_date = (new Date() / 1000 | 0);
                AppStorage.update(app_id, data, function(){});

                if($(currentColumn).hasClass("rejected-can")) {
                    $(".rejected-can-total .total-items").html(parseInt($(".rejected-can-total .total-items").html())+1);
                    $(DragHandler.el).remove();
                    return;
                }

                var position = 0;
                //Update positions in new column
                $(currentColumn).find(".job").each(function() {
                    var app_id = $(this).attr("app_id");
                    AppStorage.get(app_id, function(data) {
                        data['app-' + app_id].position = position;
                        AppStorage.update(app_id, data, function(){});
                        position++;
                    });
                });

                //Update positions in old column
                position = 0;
                $(".column[col_type="+old_type+"]").find(".job").each(function() {
                    var app_id = $(this).attr("app_id");
                    AppStorage.get(app_id, function(data) {
                        data['app-' + app_id].position = position;
                        AppStorage.update(app_id, data, function(){});
                        position++;
                    });
                });

                $(DragHandler.el).css({
                    position: '',
                    top: '',
                    left: '',
                    zIndex: 0
                })

                $(".job-placeholder").remove();

                $(DragHandler.el).removeClass("job-moved");
                DragHandler.el = null;
            });
        },

        mouseMove: function(e) {
            var block;
            $(DragHandler.el).css({
                position: 'absolute',
                zIndex: 10,
                left: e.clientX - DragHandler.pos.x,
                top: e.clientY - DragHandler.pos.y
            });

            //Creepy, yeah. But my laptop helicopting with all this stuff
            //FIXME optimize this shit! Please!
            if(DragHandler.moveThrottler < 3) {
                DragHandler.moveThrottler++;
                return;
            } else {
                DragHandler.moveThrottler = 0;
            }

            var column = DragHandler.getCurrentColumn(e);

            if($(column).find(".job").length == 0) {
                if($(column).find(".job-placeholder").length == 0) {
                    $(".job-placeholder").remove();
                    if(!$(column).hasClass("rejected-can")) {
                        $(column).find(".joblist-inner").append("<div class='job-placeholder'></div>");
                    }
                }
            } else {
                block = DragHandler.getCurrentBlock(column, e);
                if(!block) {
                    if($(column).find(".job-placeholder").length == 0) {
                        $(".job-placeholder").remove();
                        $(column).find(".joblist-inner").append("<div class='job-placeholder'></div>");
                    }
                    return;
                }

                pos = {
                    x: $(block).position().left,
                    y: $(block).position().top
                };

                pos.x = pos.x + $(column).position().left;
                if( e.clientX > pos.x &&
                    e.clientX < pos.x + $(block).width()) {

                    if(e.clientY > pos.y && e.clientY < pos.y + $(block).height()/2) {
                        $(".job-placeholder").remove();
                        $(block).before("<div class='job-placeholder'></div>");
                    }

                    if(e.clientY > pos.y + $(block).height()/2 && e.clientY < pos.y + $(block).height()) {
                        $(".job-placeholder").remove();
                        $(block).after("<div class='job-placeholder'></div>");
                    }

                    if(e.clientY > pos.y + $(block).height()) {
                        $(".job-placeholder").remove();
                        $(this).after("<div class='job-placeholder'></div>");
                    }
                }
            }
        }
    }


    $(document).mousedown( DragHandler.mouseDown )

    document.buttons = {
        addApp: Dialog($("#add-app"), $(".joblist-appliedto .icon-plus-sign")),
        credits: Dialog($("#credits"), $(".credits"), manifest),
        trashCan: Dialog($("#rejected-can"), $(".column .rejected-can"))
    }
})

window.addEventListener('storageLoaded', function() {
    AppStorage.getAll(function(data){
        var appBlock, trashCanCount = 0;
        var apps = {};
        var nData = {};


        //Dumb start sorting, uhhh...
        for (var app in data) {
            if (data.hasOwnProperty(app)) {
                if(typeof apps[data[app].type] == "undefined") {
                    apps[data[app].type] = [];
                }
                apps[data[app].type].push(data[app]);
            }
        }

        for(var type in apps) {
            if (data.hasOwnProperty(app)) {
                apps[type].sort(function(a, b) {
                    return parseInt(a.position) - parseFloat(b.position);
                });

                for(var key in apps[type]) {
                    if (data.hasOwnProperty(app)) {
                        nData['app-' + apps[type][key].id] = apps[type][key];
                    }
                }
            }
        }

        data = nData;

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
                    case AppTypes.trash: {
                        trashCanCount++;
                    }
                }
            }
        }

        $(".rejected-can-total .total-items").html(trashCanCount);
    });
});