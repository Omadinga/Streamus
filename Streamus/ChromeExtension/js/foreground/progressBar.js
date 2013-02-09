﻿//  A progress bar which shows the elapsed time as compared to the total time of the current video.
//  Changes colors based on player state -- yellow when paused, green when playing.
define(function( ){
    'use strict';
    var selector = $('#VideoTimeProgressBar');
    var mousewheelTimeout = null, mousewheelValue = -1;

    var events = {
        onManualTimeChange: 'onManualTimeChange'
    };
    
    var youtubePlayer = chrome.extension.getBackgroundPage().YoutubePlayer;
    
    selector.mousewheel(function(event, delta){
        clearTimeout(mousewheelTimeout);
        youtubePlayer.seekStart();

        if(mousewheelValue === -1){
            mousewheelValue = parseInt(selector.val(), 10);
        }

        mousewheelValue += delta;

        selector.val(mousewheelValue);
        repaint();

        mousewheelTimeout = setTimeout(function(){
            youtubePlayer.seekTo(mousewheelValue);
            mousewheelValue = -1;
        }, 250);

        selector.trigger(events.onManualTimeChange, mousewheelValue);
    });

    selector.mousedown(function(){
        youtubePlayer.seekStart();
    }).mouseup(function(){
        //Bind to selector mouse-up to support dragging as well as clicking.
        //I don't want to send a message until drag ends, so mouseup works nicely. 
        youtubePlayer.seekTo(selector.val());
    }).change(function(){
        repaint();
    });

    //  Repaints the progress bar's filled-in amount based on the % of time elapsed for current video.
    var repaint = function(){
        var elapsedTime = selector.val();
        var totalTime = selector.prop('max');

        //  Don't divide by 0.
        var fill = totalTime !== '0' ? elapsedTime / totalTime : 0;

        console.log("fill:", fill);

        var backgroundImage = '-webkit-gradient(linear,left top, right top, from(#ccc), color-stop('+ fill +',#ccc), color-stop('+ fill+',rgba(0,0,0,0)), to(rgba(0,0,0,0)))';
        selector.css('background-image', backgroundImage);
    };

    //  If a video is currently playing when the GUI opens then initialize with those values.
    var currentTime = youtubePlayer.currentTime;

    //  Only need to update totalTime whenever the playlistItem changes.
    youtubePlayer.items.on('change:selected', function (item, isSelected) {
        if (isSelected) {
            setTotalTime(item);
        }
    });

    var selectedItem = youtubePlayer.items.find(function(item) {
        return item.get('selected');
    });
    
    if (selectedItem) {
        setTotalTime(selectedItem);
    }
    
    function setTotalTime(playlistItem) {
        var videoId = playlistItem.get('videoId');
        var currentVideo = chrome.extension.getBackgroundPage().VideoManager.getLoadedVideoById(videoId);
        var totalTime = currentVideo.get('duration');

        selector.prop('max', totalTime);
        repaint();
    }

    if(currentTime){
        selector.val(currentTime);
        repaint();
    }

    //  Pause the GUI's refreshes for updating the timers while the user is dragging the video time slider around.
    var update = function () {
        var playerIsSeeking = youtubePlayer.isSeeking;

        if(!playerIsSeeking) {
            selector.val(youtubePlayer.currentTime);
            repaint();
        }
    };
    
    //  A nieve way of keeping the progress bar up to date. 
    setInterval(update, 500);

    return {
        id: selector.prop('id'),
        onManualTimeChange: function (event) {
            selector.on(events.onManualTimeChange, event);
        },
        onChange: function (event) {
            selector.change(event);
        },
        get value(){
            return selector.val();
        }
    };
});