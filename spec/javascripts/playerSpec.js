define([
  'underscore',
  'backbone',   
  'mustache',
  'modules/common',
  'modules/playlists',
  'modules/player'
], function(_, Backbone, Mustache, Common, Playlist, Player) {

describe("Player", function() {
    

    beforeEach(function() {
        
        // Stop test suite from doing
        // calls to soundcloud server
        var track = mockData.track
        track.stream_url = "http://mock_stream_url"
        track.artwork_url = "http://mock_artwork_url"
    
        this.playlist = new Playlist.Playlist()
        this.playlist.add(mockData.track)
        this.player = new Player({ collection: this.playlist.tracks, el: document.createElement("div") })
    })

    afterEach(function() {
        window.localStorage.clear()
    })

    it('should have a collection', function() {
        expect(this.player.collection.size()).toEqual(1)
    })

    it('should get the next song on playNext', function() {
        var nextSong = this.playlist.tracks.at(0)
        this.player.playNext()
        expect(this.player.collection.size()).toEqual(0)
        expect(this.player.song).toEqual(nextSong)
    })

    it("should play the next song when the first one finished", function() {
        var v = document.createEvent("Event")
        v.initEvent("ended", true, false)
        this.player.playNext()
        spyOn(this.player, "render")
        this.player.audio.dispatchEvent(v)
        expect(this.player.render).toHaveBeenCalled()
    })
    

    it('should render a special view when no song is playing', function() {
        this.playlist.tracks.reset()
        this.player.playNext()
        expect(this.player.$el.html()).toMatch(/no song/i)
    })

    it('should listen for /player/next', function() {
        spyOn(this.player, "render")
        Common.PubSub.trigger("/player/next")
        expect(this.player.render).toHaveBeenCalled()
    })

    describe('Rendering', function () {
        beforeEach(function () {
           this.player.playNext()
           this.content = this.player.$el.html() 
        })
    
        it('should have the artist, song name and artwork', function () {
            expect(this.content).toMatch(/mute uk/i)
            expect(this.content).toMatch(/black veil/i)
            expect(this.content).toMatch(/artwork/i)
        })

        it("should have a stream url, including the API key", function() {
            expect(this.content).toMatch(mockData.track.stream_url)
            expect(this.content).toMatch(Common.apiKey)
        })
        
    })

    
    
})


})
