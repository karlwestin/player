define([
  'jquery',     
  'underscore', 
  'backbone',
  'mustache'
], function($, _, Backbone, Mustache){
  
   var testing = !!window.jasmine

   /*
    * PubSub all the way down
    */

   var PubSub = _.extend({}, Backbone.Events)

   /*
    * API Key
    */

   var apiKey = "2f321c743d86b3e9547ad87c50a2f8d7"

   /*
    * Views for showing and updating an entire collection
    */

   var CollectionView = Backbone.View.extend({

       add: function(model) {
          var childView = new this.subView({ 
                                  model: model, 
                                  template: this.subTemplate,
                                  collection: this.collection,
                                  playlists: this.playlists, 
                              })
          this.childViews.push(childView)
          this.$el.append(childView.render().$el)
       },

       bindCollections: function() {
          this.collection.on('reset',   this.reset_collection)
          this.collection.on('add',     this.reset_collection)
          this.collection.on('remove',  this.reset_collection)
          this.collection.on('shift',   this.reset_collection)
          this.collection.on('unshift', this.reset_collection)
       },

       extraContent: function() {
          if(!!this.template)
            this.$el.append(Mustache.render(this.template))

          if(!this.collection.length)
            this.$el.append("<li>Nothing to see here</li>")
       },

       initialize: function(config) {
          _.bindAll(this, 'add', 'reset_collection')
          this.subView = config.subView || ItemView
          this.subTemplate = config.subTemplate || ""
          this.template = config.template
          this.playlists = config.playlists

          this.bindCollections()
       },

       render: function() {
          this.reset_collection()
          return this
       },

       reset_collection: function() {
          _.each(this.childViews, function(cv) { cv.off() })
          
          this.$el.empty()
          this.extraContent()

          this.childViews = []
          _.each(this.collection.models, this.add)
       },
        
       tagName: "ul"

   })

   var ItemView = Backbone.View.extend({
    
     initialize: function(config) {
       this.template = config.template || "{{name}}"
       this.collection = config.collection
       this.playlists = config.playlists || []
     },
 
     render: function() {
       var content = Mustache.render(this.template, this.model.toJSON())
       this.$el.append(content)
       return this
     },

     tagName: "li"

   })

   return {
     apiKey: apiKey,
     CollectionView: CollectionView,
     ItemView: ItemView,
     PubSub: PubSub,
     testing: testing
   }

})
