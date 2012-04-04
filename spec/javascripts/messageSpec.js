define([
  'mustache',
  'modules/message',
  'modules/common'
  ], function(Mustache, Message, Common) {

  describe("Message module", function() {

      beforeEach(function() {
          this.message = new Message()
      })

      it("should render on /message", function() {
          Common.PubSub.trigger("/message", "New message!!")
          expect(this.message.$el.html()).toMatch(/new message/i)
      })
      
  })
  
})
