define([
  'modules/common'
  ], function(Common) {

describe('Common Modules: ', function() {

  describe('Collection Views', function () {
      beforeEach(function () {
         this.collection = new Backbone.Collection()
         this.subView = Backbone.View.extend({ tagName: "li" })
         this.view = new Common.CollectionView({
             subView: this.subView,
             template: "Artists",
             collection: this.collection
         })
      })
  
      it('should take a collection and a subview as an argument', function () {
         expect(this.view.subView).toEqual(this.subView)
         expect(this.view.collection).toEqual(this.collection)
      })

      it('should render when the collection resets', function() {
          var x = new Backbone.Model({ name: "Steve" }),
              y = new Backbone.Model({ name: "Sergei" })

          this.collection.reset([x, y])
          expect(this.view.$el.children().length).toEqual(2)
      })
      
      it('should take a template on its own', function() {
          var x = new Backbone.Model({ name: "Steve" })

          var view = new Common.CollectionView({ 
                  template: "<h1>Artists</h1>",
                  collection: this.collection
              })
          this.collection.reset([x])
          expect(view.$el.html()).toMatch(/artist/i)
      })
      

  })

  describe('Item Views', function () {
      beforeEach(function () {
         this.view = new Common.ItemView({ 
              template: "{{name}} Yzerman", 
              model: new Backbone.Model({ name: "Steve" })
         })
      })
  
      it('should get the template on instantiation', function () {
          expect(this.view.template).toEqual("{{name}} Yzerman")
      })

      it('should render the mustache template', function() {
          this.view.render()
          expect(this.view.$el.html()).toEqual("Steve Yzerman")
      })
  })

  describe('Api key', function() {
      it('should have an API key', function() {
          expect(Common.apiKey).toBeDefined()
      })
      

  })


})
})
