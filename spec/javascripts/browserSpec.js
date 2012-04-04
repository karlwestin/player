define(function() {

describe("Browser functions", function() {
    beforeEach(function () {
        this.audio = document.createElement("audio")
    })

    it('should be able to play mp3 sounds', function() {
        expect(this.audio.canPlayType("audio/mpeg")).not.toEqual("")
    })
})

})
