var Dialog = {

    tpl: null,
    element: null,

    displayModal: function() {
        $(",blackout").css({
            "display": "block"
        })
    },

    hideModal: function () {
        $(".blackout").fadeOut(500);
    },

    init: function(tpl, element) {
        var self = this;

        self.element = element;
        self.tpl = tpl;

        $(element).click(function(){
            self.displayModal();
        })
    }
};