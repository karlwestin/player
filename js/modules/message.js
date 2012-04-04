define([
  'jquery',     
  'underscore', 
  'backbone',
  'modules/common',
], function($, _, Backbone, Common){

    var Message = Backbone.View.extend({

        close: function() {
            this.$el
                .removeClass()
                .addClass("closed")
                .hide()
        },
      
        error: function(message) {
            this.$el
                .show()
                .html(message)
                .removeClass()
                .addClass("error open")
        },

        initialize: function($el) {
            if($el) {
                $el.append(this.$el)
                this.$el = $el
            }
            _.bindAll(this, "show", "close", "error")
            Common.PubSub.on("/message", this.show)    
            Common.PubSub.on("/message/error", this.error)    
            this.$el.click(this.close)
        },

        show: function(message) {
            this.$el
                .show()
                .html(message)
                .removeClass()
                .addClass("normal open")

            setTimeout(this.close, 3000)
        },
        
        tagName: "div"
   })

   return Message
})
