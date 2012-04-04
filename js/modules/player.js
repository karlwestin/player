define([
  'jquery',     
  'underscore', 
  'backbone',
  'mustache',
  'modules/common',
  'text!templates/player.html'
], function($, _, Backbone, Mustache, Common, playingTmpl) {

    /*
     * Views:
     * The player is basically a view 
     * for the current song
     */

    var Player = Backbone.View.extend({

       initialize: function() {
          _.bindAll(this, "playNext")
          Common.PubSub.on("/player/next", this.playNext)
          Common.PubSub.on("/player/play", this.animatePointer)
          Common.PubSub.on("/player/pause", this.pausePointer)
          this.render()
       },

       playNext: function() {
          this.song = this.collection.shift()
          this.render(this.song)
       },

       render: function(model) {
          var data

          if(!model) {
            this.$el.html(Mustache.render(playingTmpl, { title: "No songs queued" }))
            return this
          }

          data = model.toJSON()
          data.client_id = Common.apiKey
          data.artwork_url = data.artwork_url ? data.artwork_url.replace("-large", "-t300x300") : ""

          this.$el.html(Mustache.render(playingTmpl, data))
          this.setAudioEvents()
          Common.PubSub.trigger("/message", "Now playing: " + model.get("title"))

          return this
       },

       setAudioEvents: function() {
          this.audio = this.el.querySelector("audio")
          this.audio.addEventListener("ended", this.playNext)

          if(!Common.testing)
              this.audio.play()
       },

    })

    return Player
})
