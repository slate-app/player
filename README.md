Slate Embedded Player SDK
======

Slate Embedded Player SDK allows websites to control the embedded Slate Player with JavaScript and relays the DOM events from inside the iframe to the parent window.

Include the `slate.player.min.js` file in your website and gain control over the embedded player (see **Usage** section for more info).

jQuery 1.6+ is required (but will potentially work with older versions as well).

All modern browsers including Internet Explorer 8+ are supported (thanks to `window.postMessage()` implementation).

## Usage

There are multiple ways to include this SDK on your website:

#### Use GitHub CDN

You can include this SDK directly from the GitHub CDN:

	<script type="text/javascript" src="//slate-app.github.io/player/slate.player.min.js"></script>

#### Install from Bower

You can install this SDK as a [Bower](http://www.bower.io) component.

	$ bower install slate-player
    
And then include in your page:

	<script type="text/javascript" src="/path/to/bower_components/slate-player/slate.player.min.js"></script>

#### Download the file to your server

If none of the above work for you, just download `slate.player.min.js` from this repository and save it somewhere on your server, and then include it on your website:

	<script type="text/javascript" src="/path/to/slate.player.min.js"></script>

## Features

After including the JS file on your page your embedded players will start triggering DOM events out of the box, without any additional configuration. See the **DOM Events** section for more info.

It will also register a jQuery plugin `.slatePlayer()` that will expose programmatic API with which you can control the player behavior.

### DOM events

All events from the original Slate Player bubble up to your website from inside the iframe. They are triggered on the embedding iframe and you can listen for them e.g. using jQuery's `.on()` method:

	$('#player').on('resume', function(ev, currentClip) {
		console.log('clip ' + currentClip.title + ' was resumed');
	});

Currently, the list of events is (called with the following additional parameters):

- `initialized` - when player has been initialized,
- `load` with `currentClip` - when the player is ready,
- `error` with `currentClip, error` - when error occurs,
- `finish` with `currentClip` - when clip finished playing,
- `mute` with `currentClip` - when the player has been muted,
- `pause` with `currentClip` - when the player was paused,
- `resume` with `currentClip` - when the player was resumed,
- `stop` with `currentClip` - when the player was stopped,
- `beforeseek` with `currentClip, position` - just before seeking happens,
- `fullscreen` with `currentClip` - when entered fullscreen mode,
- `fullscreen-exit` with `currentClip` - when left fullscreen mode,
- `progress` with `currentClip, position` - when video is playing, roughly every 250ms,
- `seek` with `currentClip, position` - when seeking,
- `speed` with `currentClip, speed` - when playback speed has changed,
- `volume` with `currentClip, level` - when volume level has changed.

### Player API

You can control the player via its JavaScript API accessible as a jQuery plugin. To call a method pass its name as the 1st argument of `.slatePlayer()` method on the embedded player element, e.g.:

	$('#player').slatePlayer('volume', 0.4);

Following methods are available (where `$player` in these examples is a jQuery object wrapping the embedded iframe, e.g. `var $player = $('#player')`):

- `$player.slatePlayer('load', clip)` - load a clip to the player where `clip` is an object containing clip data from Slate
- `$player.slatePlayer('play', index)` - play `index` position from the loaded playlist, if the player was initialized with a playlist (TBD)
- `$player.slatePlayer('stop')` - stop playback
- `$player.slatePlayer('pause')` - pause playback
- `$player.slatePlayer('resume')` - resume playback
- `$player.slatePlayer('mute')` - toggle mute/unmute
- `$player.slatePlayer('next')` - jump to next item in the playlist
- `$player.slatePlayer('prev')` - jump to previous item in the playlist
- `$player.slatePlayer('seek', time)` - seek to specified `time` in seconds
- `$player.slatePlayer('seekTo', position)` - seek to specified position where 1 = 10%, 2 = 20%, 3 = 30%, etc
- `$player.slatePlayer('speed', speed)` - play at the specified `speed` where 1 = 100%
- `$player.slatePlayer('toggle')` - toggle pause/resume the playback
- `$player.slatePlayer('volume', volume)` - set specified `volume`

None of these methods return any values.

## Issues

Please report any issues using this repository's GitHub issues.