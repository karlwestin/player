require.config({
  paths: {
    jquery:     'libs/jquery.1.7.1',
    underscore: 'libs/underscore',
    backbone:   'libs/backbone',
    backboneLS: 'libs/backbone.localStorage',
    mustache:   'libs/mustache'
  }
})

define([
  'backboneLS',
  'modules/player',
  'modules/playlists',
  'modules/common',
  'modules/message'
], function(Backbone, Player, Playlist, Common, Message) {
    

  var lists = Playlist.initialize($("#sidebar")),
      PLAYLISTS = lists.playlists,
      QUEUE = lists.queue,
      MESSAGE = new Message($("#message"))

  var Router = Backbone.Router.extend({
    routes: {
      "playlist/:name": "playlist"
    },

    playlist: function(name) {
      var playlist = PLAYLISTS.findByName(name)

      if(!playlist)
          Common.PubSub.trigger("/message", "Sorry alter, there's no such playlist")
      else
          playlist.render($("#main"))
    }
  })

  var ROUTER = new Router(),
      PLAYER = new Player({ el: $("#player"), collection: QUEUE.tracks })

  if(!window.jasmine)
      Backbone.history.start({ root: "./" })
  
  return {
      ROUTER: ROUTER
  }
})
