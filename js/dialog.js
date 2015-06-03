
var Dialog = {
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

            $(".blackout .dialog-tpl input[type=file]").fileinput({
                showCaption: false,
                showPreview: false,
                showRemove: false,
                showUpload: false,
                removeIcon: true,
                allowedFileTypes: ['image'],
                elErrorContainer: "#errorBlock43"
            });

            $('.blackout .dialog-tpl input[type=file]').on('fileloaded', function(e, file, preview, id, reader) {
                reader.onload = function(e) {
                    var dataURL = reader.result;
                    $(".uploaded-image").html("<img style='width:63px; height:63px' src='" + dataURL + "'/>")
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
                    };

                    img.onload = function() {
                        $(img).css({
                            "width":"63px",
                            "height":"63px"
                        });

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
                    apply_date: $(".date-input").val().length ? new Date($(".date-input").val()).format("j F Y") : new Date().format("j F Y")
                }


                var newApp = Ashe.parse($("#columned-app").html(), storageData);
                $(newApp).find("img").attr('src', storageData.company_image);
                $(".joblist.joblist-appliedto .joblist-inner").append($(newApp));
                self.hideModal({clientX: 0, clientY: 0});
            });

            $('.date-input').datepicker({});
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
    };

