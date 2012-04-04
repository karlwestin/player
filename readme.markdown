The Bonanza Player
======

Thanks for checkin in on this,  
[See it in action here](http://karlwestin.com/sound/)

Short about the app:
--------

* It lets you create, change and save playlists to localstorage.

* Looked quite nice in Opera Mobile i think..

* Run specs by going to the /spec  in your browser  
  (running the specs will clear the localstorage, and thus your playlists)

A little bit about structure:
-----

The app consists of four modules: Playlists, which is at the core of everything,
Player, Messages and a Common structure that contains some things that the other modules use.

The idea is to keep the parts interchangable, for example we could build a new player, that falls
back to flashplayer when the browser lacks mp3 support, without touching the other parts. The parts and
templates can then easily be concatenated using require.js' build system.

Well, that's it for now.  
Thank you for looking at this!
