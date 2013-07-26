//  Responsible for controlling the volume indicator of the UI.
define(['player'], function (player) {
    'use strict';

    var volumeControlView = Backbone.View.extend({
        el: $('#VolumeControl'),

        events: {
            'change #VolumeSlider': 'setVolume',
            'click #MuteButton': 'toggleMute',
            //  TODO: Can I combine these two?
            'mousewheel': 'scrollVolume',
            'mousewheel .volumeControl': 'scrollVolume',
            'mouseenter .volumeControl': 'expand',
            'mouseleave': 'contract'
        },

        render: function () {
            var volume = player.get('volume');

            //  Repaint the amount of white filled in the bar showing the distance the grabber has been dragged.
            var backgroundImage = '-webkit-gradient(linear,left top, right top, from(#ccc), color-stop(' + volume / 100 + ',#ccc), color-stop(' + volume / 100 + ',rgba(0,0,0,0)), to(rgba(0,0,0,0)))';
            this.volumeSlider.css('background-image', backgroundImage);

            var activeBars = Math.ceil((volume / 25));
            this.muteButton.find('.MuteButtonBar:lt(' + (activeBars + 1) + ')').css('fill', '#fff');
            this.muteButton.find('.MuteButtonBar:gt(' + activeBars + ')').css('fill', '#666');

            if (activeBars === 0) {
                this.muteButton.find('.MuteButtonBar').css('fill', '#666');
            }

            var isMuted = player.get('muted');

            if (isMuted) {
                this.muteButton
                    .addClass('muted')
                    .attr('title', 'Click to unmute.');
            } else {
                this.muteButton
                    .removeClass('muted')
                    .attr('title', 'Click to mute.');
            }

            return this;
        },

        //  Initialize player's volume and muted state to last known information or 100 / unmuted.
        initialize: function () {
            this.volumeSliderWrapper = this.$('#VolumeSliderWrapper');
            this.volumeSlider = this.$('#VolumeSlider');
            this.muteButton = this.$('#MuteButton');

            //  Set the initial volume of the control based on what the YouTube player says is the current volume.
            var volume = player.get('volume');
            this.volumeSlider.val(volume).trigger('change');

            this.listenTo(player, 'change:muted', this.render);

            this.render();
        },

        //  Whenever the volume slider is interacted with by the user, change the volume to reflect.
<<<<<<< HEAD
        setVolume: function (a, e) {

            console.log("a, e,", a, e);
=======
        setVolume: function () {
>>>>>>> origin/Development

            var newVolume = parseInt(this.volumeSlider.val(), 10);
            player.set('volume', newVolume);

            this.render();
        },

        //  Adjust volume when user scrolls mousewheel while hovering over volumeControl.
        scrollVolume: function (event, delta) {
            //  Convert current value from string to int, then go an arbitrary, feel-good amount of volume points in a given direction (thus *3 on delta).
            var newVolume = parseInt(this.volumeSlider.val(), 10) + delta * 3;
            this.volumeSlider.val(newVolume).trigger('change');
        },

        toggleMute: function () {
            var isMuted = player.get('muted');
            player.set('muted', !isMuted);
        },

        //  Show the volume slider control by expanding its wrapper whenever any of the volume controls are hovered.
        expand: function () {
<<<<<<< HEAD
            this.volumeSliderWrapper.addClass('expanded');
        },

        contract: function () {
            this.volumeSliderWrapper.removeClass('expanded');
=======
            this.$el.addClass('expanded');
        },

        contract: function () {
            this.$el.removeClass('expanded');
>>>>>>> origin/Development
        }

    });

    var volumeControl = new volumeControlView;
})