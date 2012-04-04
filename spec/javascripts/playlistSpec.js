define([
  'modules/common',
  'modules/playlists'
  ], function(Common, Playlists) {

describe("Playlists", function() {
  

 beforeEach(function() {
   this.tracks = _.map(
     mockData.tracks, 
     function(el) { return new Backbone.Model(el) }
   )
 })

 afterEach(function() {
   window.localStorage.clear()
 })
    
    describe('Fetching data from soundcloud', function() {
        
        describe('valid Soundcloud url:s', function() {
            
            beforeEach(function() {
                var model = new Playlists.Playlist()
                this.playlist = model.tracks
                this.fetchSpy = spyOn($, "ajax")
            })
            
            it("should make the server call", function() {
                this.playlist.getTracks("http://soundcloud.com/hmwl/tracks")
                expect($.ajax).toHaveBeenCalled()
                expect($.ajax.mostRecentCall.args[0].dataType).toEqual("jsonp")
            })
            
            it("should add the collections on the response", function() {
                this.fetchSpy.andCallFake(function(options) { options.success(mockData.tracks) })        
                this.playlist.getTracks("http://soundcloud.com/hmwl/tracks")
                expect(this.playlist.size()).toEqual(2)
            })
        
            it("should add an entire set if it gets sets as response", function() {
                this.fetchSpy.andCallFake(function(options) { options.success(mockData.set) })        
                this.playlist.getTracks("whatever")
                expect(this.playlist.size()).toEqual(13)
            })
            
            it("should make a new call if it gets an artist as response", function() {
                var tracks = this.playlist.parse(mockData.artist)
                expect(tracks).toBeUndefined()
                expect(this.fetchSpy).toHaveBeenCalled()
            })
            
            it("should not add invalid data", function() {
                expect(function() { this.playlist.add(mockData.artist) }).toThrow()
                expect(this.playlist.size()).toEqual(0)
            })
        })
    })


    describe('Play queue', function () {
        beforeEach(function () {
            this.queue = new Playlists.Queue()
        })

        afterEach(function() {
            Common.PubSub.trigger("/queue/reset")
        })

        it('should add be able to play tracks directly', function() {
            var spy = jasmine.createSpy("next track comin' up")
            Common.PubSub.on("/player/next", spy)
            Common.PubSub.trigger("/queue/play", this.tracks[1])
            expect(spy).toHaveBeenCalled()
        })

        it('should be able to reset the queue and add a new set of songs', function() {
            Common.PubSub.trigger("/queue/reset", this.tracks[1])
            expect(this.queue.size()).toEqual(1)
        })
    })

    describe('Playlist collection', function () {
        beforeEach(function () {
            this.collection = new Playlists.ListCollection() 
        })
    
        it('should create playlists', function () {
            this.collection.add({ name: "James Last goes Rock'n'Roll" })
            expect(this.collection.length).toEqual(1)
            expect(this.collection.at(0).tracks).toBeDefined()
        })

        it('should remove playlists', function() {
            this.collection.add({ name: "80's Power Ballads" })
            this.collection.remove(this.collection.at(0))
            expect(this.collection.length).toEqual(0)
        })
        
        describe('Persistence layer', function () {
            beforeEach(function() {
                this.collection.create({ name: "James Last goes Rock'n'Roll" })
            })

            it('Should save the playlists on creation', function () {
                this.collection.fetch()
                expect(this.collection.length).toEqual(1)
            })

            it('should only save the playlists at one place when adding track', function() {
                var list = this.collection.at(0)
                list.add(mockData.tracks)
                this.collection.fetch()
                expect(this.collection.length).toEqual(1)
            })

            it('should save the tracks', function() {
                var list = this.collection.at(0)
                list.add(mockData.tracks)
                this.collection.fetch()
                list = this.collection.at(0)
                expect(list.tracks.length).toEqual(2)
            })
        })
    
    })
    
    describe('Templates for the Main View', function() {
        beforeEach(function() {
            this.list = new Playlists.Playlist()
            this.list.add(mockData.tracks)
            this.content = this.list.view.render().$el.html()
        })
        
        it('should render the track names and artists', function() {
            expect(this.content).toMatch(/marphi/i)
            expect(this.content).toMatch(/hmwl/i)            
        })
        
        it('should have an "Add" field and button', function() {
            expect(this.content).toMatch(/input/i)
            expect(this.content).toMatch(/button/i)            
        })
        
        it('should be bound to fetch', function() {
            spyOn(this.list.tracks, "getTracks")
            this.list.view.$(".addPlaylist").click()
            expect(this.list.tracks.getTracks).toHaveBeenCalled()
        })
    })
  
})

})
