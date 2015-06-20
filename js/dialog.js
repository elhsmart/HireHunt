var AppTypes = {
    "applied_to": 1,
    "testing": 2,
    "interviewing": 3,
    "job_offered": 4,
    "trash": 5
}

var AppStorage = {
    storage: [],

    init: function() {
        var self = this;

        chrome.storage.local.get("apps-map", function(result){
            if(result['apps-map'] instanceof Array) {
                self.storage = result['apps-map'];

                var storageLoadedEvent = new CustomEvent("storageLoaded", {});
                window.dispatchEvent(storageLoadedEvent);
            }
        });
    },

    set: function(data) {
        var self = this;

        self.storage.push(data.id);

        var dataObj = {"apps-map": this.storage};
        var databag_name = "app-"+data.id;
        dataObj[databag_name] = data

        chrome.storage.local.set(dataObj, function(e) {
            console.log(e);
        });
    },

    get: function(app_id, callback) {
        var self = this;
        if(self.storage.indexOf(app_id) != -1) {
            chrome.storage.local.get("app-" + app_id, callback);
        }
    },

    update: function(app_id, data,  callback) {
        var self = this;
        if(self.storage.indexOf(app_id) != -1) {
            chrome.storage.local.set(data, callback);
        }
    },

    getAll: function(callback) {
        var self = this;
        var ids = [];
        if(self.storage.length > 0) {
            for(i = 0; i < self.storage.length; i++) {
                ids.push("app-" + self.storage[i]);
            }

            chrome.storage.local.get(ids, callback);
        }
    }
};

AppStorage.init();

var Dialog = function(tpl, element) {
    var obj = {
        tpl: null,
            element: null,
        id: null,

        displayModal: function() {
        var self = this;

        $(".blackout").css({
            "display": "block"
        })

        $(".blackout .dialog-tpl").html(
            Ashe.parse(self.tpl.html(), {})
        )

        TemplateEnv[$(self.tpl).attr("id")](self);
    },

        hideModal: function (e) {
            if(e && $(document.elementFromPoint(e.clientX, e.clientY)).hasClass("blackout")) {
                $(".blackout").css({
                    "display": "none"
                })
            }
        },

        init: function(tpl, element) {
            var self = this;

            self.element = element;
            self.tpl = tpl;
            self.id = new Date().getTime() | 0;

            $(element).click(function(){
                self.displayModal();
            })

            $(".blackout").click(function(e){self.hideModal(e)});

            return self;
        }
    }

    return obj.init(tpl, element);
};

// Template-related code

var TemplateEnv = {
    "add-app": function(self) {

        function gcd (a, b) {
            return a/b;
        }

        $(".blackout .dialog-tpl input[type=file]").fileinput({
            showCaption: false,
            showPreview: false,
            showRemove: false,
            showUpload: false,
            removeIcon: true,
            allowedFileTypes: ['image']
        });

        $('.blackout .dialog-tpl input[type=file]').on('fileloaded', function(e, file, preview, id, reader) {
            reader.onload = function(e) {
                console.log(reader);
                var dataURL = reader.result;
                var img = new Image();

                img.onload = function() {
                    this.onload = function() {};

                    $(img).css({
                        "width":"63px",
                        "height":"63px"
                    });

                    var canvas = document.createElement("canvas");
                    var ctx = canvas.getContext("2d");

                    canvas.width = 64;
                    canvas.height = 64;

                    var aspect = gcd(this.width, this.height);

                    if(aspect > 1) {
                        //width > height
                        var wh = this.height / (this.width / 64);
                        ctx.drawImage(this, 0, parseInt((64 - wh) / 2), 64, wh);
                        this.src = canvas.toDataURL("image/png");
                    } else {
                        //width > height
                        var wh = this.width / (this.height / 64);
                        ctx.drawImage(this, parseInt((64 - wh) / 2) ,0, 64, wh);
                        this.src = canvas.toDataURL("image/png");
                    }

                    $(".uploaded-image").html("").append($(img));
                }

                img.src = dataURL;
            }
            reader.readAsDataURL(file)
        });

        $(".blackout .dialog-tpl .company-logo-fromurl").click(function(){
            var regex = new RegExp("^(http[s]?:\\/\\/(www\\.)?|ftp:\\/\\/(www\\.)?|www\\.){1}([0-9A-Za-z-\\.@:%_\+~#=]+)+((\\.[a-zA-Z]{2,3})+)(/(.)*)?(\\?(.)*)?");

            if(!regex.test($(".image-input").val())){
                $(".image-input").popover({
                    title: "Validation Error",
                    content: "Sorry, this image URL is not valid",
                    placement: 'top',
                    trigger: 'manual'
                }).popover('show');
                setTimeout(function(){
                    $(".image-input").popover('hide');
                }, 3000);
                return;
            }

            $(".uploaded-image").html("<img src='assets/preloader.gif' style='margin-top:16px;'/>");

            var xhr = new XMLHttpRequest();
            xhr.open('GET', "http://crossorigin.me/" + $(".image-input").val(), true);
            xhr.responseType = 'blob';
            xhr.onload = function(e) {
                var img = document.createElement('img');

                img.onerror = function(){
                    $(".image-input").popover({
                        title: "Validation Error",
                        content: "Sorry, this image cannot be loaded",
                        placement: 'top',
                        trigger: 'manual'
                    }).popover('show');
                    setTimeout(function(){
                        $(".image-input").popover('hide');
                    }, 3000);

                    $(".uploaded-image").html('<i class="icon-large icon-film"></i>');
                };

                img.onload = function() {
                    this.onload = function() {};

                    $(img).css({
                        "width":"63px",
                        "height":"63px"
                    });

                    var canvas = document.createElement("canvas");
                    var ctx = canvas.getContext("2d");

                    canvas.width = 64;
                    canvas.height = 64;

                    var aspect = gcd(this.width, this.height);

                    if(aspect > 1) {
                        //width > height
                        var wh = this.height / (this.width / 64);
                        ctx.drawImage(this, 0, parseInt((64 - wh) / 2), 64, wh);
                        this.src = canvas.toDataURL("image/png");
                    } else {
                        //width > height
                        var wh = this.width / (this.height / 64);
                        ctx.drawImage(this, parseInt((64 - wh) / 2) ,0, 64, wh);
                        this.src = canvas.toDataURL("image/png");
                    }

                    $(".uploaded-image").html("").append($(img));
                }

                img.src = window.webkitURL.createObjectURL(this.response);
            };

            xhr.send();
        });

        $('.blackout .dialog-tpl input[type=file]').on('fileerror', function(event, data) {
            $(".image-input").popover({
                title: "Validation Error",
                content: "Sorry, this type of file is not allowed. Please upload only images",
                placement: 'top',
                trigger: 'manual'
            }).popover('show');
            setTimeout(function(){
                $(".image-input").popover('hide');
            }, 3000);
        });

        $(".btn-create-app").click(function(){

            if($(".company-input").val().length < 3) {

                $(".company-input").popover({
                    title: "Validation Error",
                    content: "Sorry, at least 3 characters must be in company name.",
                    placement: 'left',
                    trigger: 'manual'
                }).popover('show');
                setTimeout(function(){
                    $(".company-input").popover('hide');
                }, 3000);

                return;
            }

            if($(".position-name-input").val().length < 3) {

                $(".position-name-input").popover({
                    title: "Validation Error",
                    content: "Sorry, Position name must be provided.",
                    placement: 'left',
                    trigger: 'manual'
                }).popover('show');
                setTimeout(function(){
                    $(".position-name-input").popover('hide');
                }, 3000);

                return;
            }

            if($(".uploaded-image img").length == 0) {
                $(".image-input").popover({
                    title: "Validation Error",
                    content: "Please provide image for this position.",
                    placement: 'left',
                    trigger: 'manual'
                }).popover('show');
                setTimeout(function(){
                    $(".image-input").popover('hide');
                }, 3000);

                return;
            }

            var img = new Image();
            img.src = $(".uploaded-image img")[0].src;

            var canvas = document.createElement("canvas");
            canvas.width = img.width;
            canvas.height = img.height;

            var ctx = canvas.getContext("2d");
            ctx.drawImage(img, 0, 0);
            var imageDataURL = canvas.toDataURL("image/png");

            var storageData = {
                company_name: $(".company-input").val(),
                company_position: $(".position-name-input").val(),
                company_contact: $(".contact-input").val().length ? $(".contact-input").val() : "@onsite",
                company_image: imageDataURL,
                apply_date: $(".date-input").val().length ? new Date($(".date-input").val()).format("j F Y") : new Date().format("j F Y"),
                create_date: (new Date() / 1000 | 0),
                update_date: null,
                position: 0,
                type: AppTypes.applied_to,
                id:( new Date() / 1000 | 0).toString(16)
            }

            AppStorage.set(storageData);

            var newApp = Ashe.parse($("#columned-app").html(), storageData);

            $(newApp).find("img").attr('src', storageData.company_image);
            $(".joblist.joblist-appliedto .joblist-inner").append($(newApp));

            self.hideModal({clientX: 0, clientY: 0});
        });

        $('.date-input').datepicker({
            endDate: new Date()
        });

        $('.close-button .icon-remove-sign').click(function(){
            self.hideModal({clientX: 0, clientY: 0});
        })
    },

    "columned-app": function(self) {

    },

    "credits": function(self) {
        $(".blackout .about-contents a").each(function(){
            $(this).click(function(){
                window.open($(this).attr('href'));
            })
        });

        $('.close-button .icon-remove-sign').click(function(){
            self.hideModal({clientX: 0, clientY: 0});
        })
    }
}