define([
  'jquery',     
  'underscore', 
  'backboneLS',
  'mustache',
  'modules/common',
  'text!templates/sidebarHeader.html',
  'text!templates/playlistItem.html',
  'text!templates/playlistHeader.html',
  'text!templates/sidebarItem.html',
  'text!templates/sidebarQueue.html'
], function($, _, Backbone, Mustache, Common, collectionTmpl, trackTmpl, playlistTmpl, sidebarTmpl, sidebarQueue) {

   /*
    * Simple URL-checker/completer
    * Because typing complete URLs on mobile sucks
    */

   function checkURL(url) {
     var segments = url.split("/")
      
     if(segments[0] === "http:")
       return url
      
     if(segments[0] === "soundcloud.com")
       return "http://" + url
      
     return "http://soundcloud.com/" + url
   }

   /* 
    * Models & Collections
    */
   
   var TrackModel = Backbone.Model.extend({        
        
        validate: function(attrs) {
            var errors = []
            
            _.each(this.validations, function(prop) {
                if(!prop.check.test(attrs[prop.name])) {
                    errors.push(prop.message)
                }
            })
            
            if(errors.length) {
                return errors
            }
        },
        
        validations: {
            "stream_url": { check: /http:/i, name: "stream_url", message: "Track doesn't have any audio url" }
        }        
   })
    
   /*
    * The 'basic' collection,
    * The one who fetches and contains tracks
    */

   var PlayCollection = Backbone.Collection.extend({
        
      getTracks: function(query) {
        $.ajax({
            url: "http://api.soundcloud.com/resolve.json",
            data: {
                client_id: Common.apiKey,
                url: checkURL(query)
            },
            dataType: "jsonp",
            error: this.handleError,
            success: this.handleResult,
            timeout: 5000
        })
        Common.PubSub.trigger("/message", "Looking for your stuff!")
      },

      handleError: function(error) {
        Common.PubSub.trigger("/message/error", "It seems like we had the wrong URL?! :(")
      },

      handleResult: function(data) {
        var tracks = this.parse(data)
        if(tracks) {
          _.each(tracks, function(track) {
              this.create(track)
          }, this)
        }
        Common.PubSub.trigger("/message", "You got some new, hot, smokin tracks!")
      },

      initialize: function(config) {
        _.bindAll(this, "add", "handleResult")
      },

      model: TrackModel,
      
      parse: function(response) {

        if(!response || response.length === 0) return
        // make sure we're always dealin' with an array,
        // now we've got no (eeeh..) worries:
        response = _.flatten([response])
      
        // response == tracks, just go ahead )
        if(response[0].stream_url) {
            return response
        }
                    
        // response == list of playlists
        if(response[0].tracks) {
            return _.reduce(response, function(collected, el) { return collected.concat(el.tracks) }, [])
        }

        // response == artist
        if(response[0].username) {
            _.each(response, function(el) {
                this.getTracks(el.permalink_url + '/tracks')
            }, this)
            return
        }
        
        // response == WTF
        Common.PubSub("/message", "Sorry, I have no idea what you talkin' about")
        return
        
      },

      shift: function(options) {
        var model = this.at(0)
        this.remove(model, options)
        return model 
      },

      unshift: function(model, options) {
        model = this._prepareModel(model, options)
        this.add(model, _.extend({at: 0}, options))
        return model
      }

   })

   /*
    * Playlist model,
    * Contains a list of tracks, a name of the playlist, and a description
    */

   var Playlist = Backbone.Model.extend({

       add: function(models) {
          models = _.flatten([models])
          _.each(models, function(track) {
              this.tracks.create(track)
          }, this)
       },

       bindStuff: function() {},

       initialize: function(config) {
          config || (config = { name: "testCollection" })

          var C = PlayCollection.extend({
              localStorage: new Backbone.LocalStorage(config.name)
          })
          this.set("tracks", new C())
          this.tracks = this.get("tracks")
          this.tracks.fetch()

          this.view = new MainView({
                   collection: this.tracks,
                   model: this,
                   template: playlistTmpl,
                   subTemplate: trackTmpl,
                   subView: MainItemView
                }),

          this.bindStuff()
       },

       render: function($el) {
          $el.empty().append(this.view.render().$el)
       },

       size: function() {
          return this.tracks.size()
       }

   })
   
   /*
    * Queue,
    * Same as playlists model above, 
    * but with a few extra pubsub listeners 
    */

   var Queue = Playlist.extend({

       bindStuff: function() {
          _.bindAll(this, "play", "reset")
          Common.PubSub.on("/queue/reset", this.reset)
          Common.PubSub.on("/queue/play",  this.play)
       },

       play: function(models) {
          try {
              this.tracks.unshift(models)
          } catch (error) {
              if(/add the same model/.test(error.message)) {
                  this.tracks.remove(models)
                  this.tracks.unshift(models)
              }
          }
          Common.PubSub.trigger("/player/next")
       },

       reset: function(models) {
          this.tracks.reset(models)
          Common.PubSub.trigger("/player/next")
       }

   })

   /*
    * The collections that keeps the playlists,
    */

   var ListCollection = Backbone.Collection.extend({
       findByName: function(name) {
          return this.find(function(el) { return el.get("name") === name })
       },
                   
       initialize: function(config) {
          _.bindAll(this, "findByName")
          this.fetch()
       },

       localStorage: new Backbone.LocalStorage("playlists"),

       model: Playlist
   })


   /*
    * Views: Sidebar and Main view for playlists
    */

   var SidebarView = Common.CollectionView.extend({
       events: {
           "click #addPlaylist": "addPlaylist",
           "click #showListBox": "showListBox"
       },

       addPlaylist: function(e) {
           e.preventDefault()
           var name = $("#playlistName").val()
           this.collection.create({ name: name })
       },

       showListBox: function(e) {
           e.preventDefault()
           this.$("#addList").toggleClass("open")
           $("#playlistName").focus()
       }
   })

   var SidebarItemView = Common.ItemView.extend({
       events: {
           "click .more":           "showOptions",
           "click .removePlaylist": "removePlaylist",
           "click .updatePlaylist": "update"
       },

       isQueue: function() { return this.model.get("name") === "Queue" },

       queueTemplate: sidebarQueue,

       removePlaylist: function(e) {
           e.preventDefault()
           this.model.destroy()
       },

       render: function() {
           var template = this.isQueue() ? this.queueTemplate : this.template,
               content = Mustache.render(template, this.model.toJSON())

           this.$el.empty().append(content)
           return this
       },

       showOptions: function(e) {
           e.preventDefault()
           this.$(".options").toggleClass("open")
       },

       update: function(e) {
           var desc = this.$(".pldescription").val(),
               name = this.$(".plname").val()

           e.preventDefault()
           this.model.save({ name: name, description: desc })
           this.render()
       }
   })

   var MainView = Common.CollectionView.extend({
       events: {
           "click .playPlaylist": "playAll",
           "click .addPlaylist":  "getTracks"
       },

       extraContent: function() {
          if(!!this.template)
            this.$el.append(Mustache.render(this.template, this.model.toJSON()))

          if(!this.collection.length)
            this.$el.append("<li><div class='listing bar track'><p>Hey! What you waiting for? Add some tracks above now ;)</p></div></li>")
       },
       
       getTracks: function(e) {
            e.preventDefault()
            var searchVal = this.$("#urlField").val()
            this.collection.getTracks(searchVal)
       },

       playAll: function(e) {
           e.preventDefault()
           Common.PubSub.trigger("/queue/reset", this.collection.models)
       }

   })

   var MainItemView = Common.ItemView.extend({
       events: {
           "click .playNow": "playNow",
           "click .removeTrack": "remove"
       },

       playNow: function(e) {
         e.preventDefault()
         Common.PubSub.trigger("/queue/play", this.model)
       },

       remove: function(e) {
           e.preventDefault()
           this.model.destroy()
           this.collection.remove(this.model)
       }
   })

   /*
    * Initialize
    */

   var initialize = function($sidebar) {
   
      var playlists = new ListCollection(),
          collectionView = new SidebarView({
              collection: playlists,
              subTemplate: sidebarTmpl,
              subView: SidebarItemView,
              template: collectionTmpl,
              el: $sidebar
          })

      var queue = new Queue({ name: "Queue" })
      playlists.add(queue)

      return {
          playlists: playlists,
          queue:     queue
      }

   }

   return {
        initialize: initialize,
        ListCollection: ListCollection,
        Playlist: Playlist,
        PlayCollection: PlayCollection,
        Queue:    Queue
   }
})
