﻿//  TODO: Exposed globally for the foreground. Is there a better way?
var BackgroundManager = null;

//  BackgroundManager is a denormalization point for the Background's selected models.
//  NOTE: It is important to understand that the activePlaylistItem is NOT guaranteed to be in the activePlaylist.
//  The same applies for activePlaylist being under the activeStream. The user can click around, but this shouldn't affect state
//  until they make a decision.
define(['user', 'player', 'localStorageManager', 'playlistItems', 'playlists', 'streams'],
    function (user, player, localStorageManager, PlaylistItems, Playlists, Streams) {
    'use strict';

    var backgroundManagerModel = Backbone.Model.extend({
        defaults: {
            activePlaylistItem: null,
            activePlaylist: null,
            activeStream: null,
            allPlaylistItems: new PlaylistItems(),
            allPlaylists: new Playlists(),
            allStreams: new Streams()
        },
        initialize: function () {

            var self = this;
            //  TODO:  What if user's loaded state gets set before backgroundManager initializes? Not really possible unless instant response, but still.
            user.once('change:loaded', function() {
                if (user.get('streams').length === 0) {
                    throw "User should be initialized and have at least 1 stream before loading backgroundManager.";
                }

                //  TODO: I hate this whole concept of having to check if its ready else wait for it to be ready.
                //  Do not initialize the backgroundManager until player is ready to go.
                if (player.get('ready')) {
                    initialize.call(self);
                } else {
                    player.once('change:ready', function() {
                        initialize.call(self);
                    });
                }
            });

        },
        
        getPlaylistById: function(playlistId) {
            return this.get('allPlaylists').find(function(playlist) {
                return playlist.get('id') === playlistId;
            });
        },
        
        getPlaylistItemById: function(playlistItemId) {
            return this.get('allPlaylistItems').find(function(playlistItem) {
                return playlistItem.get('id') === playlistItemId;
            });
        },
        
        getStreamById: function(streamId) {
            return this.get('allStreams').find(function(stream) {
                return stream.get('id') === streamId;
            });
        }
    });
    
    function initialize() {
        this.get('allStreams').add(user.get('streams').models);
        this.get('allPlaylists').add(getAllPlaylists());
        this.get('allPlaylistItems').add(getAllPlaylistItems());

        loadActiveStream.call(this);
        loadActivePlaylist.call(this);
        loadActivePlaylistItem.call(this);

        var self = this;

        this.get('allPlaylists').on('change:active', function(playlist, isActive) {

            if (self.get('activePlaylist') === playlist && !isActive) {
                self.set('activePlaylist', null);
            } else if (isActive) {
                self.set('activePlaylist', playlist);
            }

        });

        this.get('allPlaylists').each(function(playlist) {
            bindEventsToPlaylist.call(self, playlist);
        });

        this.get('allStreams').on('change:active', function(stream, isActive) {

            if (self.get('activeStream') === stream && !isActive) {
                self.set('activeStream', null);
            } else if (isActive) {
                self.set('activeStream', stream);
            }

        });

        //  TODO: This isn't fully implemented yet. My intention is to send a message to any
        //  listening YouTube pages to ensure that Streamus data loaded on the YouTube page stays up to date.
        this.get('allStreams').on('add', function (stream) {
            chrome.runtime.sendMessage({ method: "streamAdded", stream: stream });
        });

        this.get('allStreams').on('remove', function (stream) {
            chrome.runtime.sendMessage({ method: "streamRemoved", stream: stream });
        });

        this.get('allStreams').each(function(stream) {

            stream.get('playlists').on('add', function (playlist) {
                self.get('allPlaylists').add(playlist);
                bindEventsToPlaylist.call(self, playlist);
            });

            stream.get('playlists').on('remove', function (playlist) {

                self.get('allPlaylists').remove(playlist);

                if (self.get('activePlaylist') === playlist) {
                    self.set('activePlaylist', null);

                    var streamId = playlist.get('streamId');
                    var stream = self.getStreamById(streamId);
                    
                    //  Update activePlaylist to the next playlist if there is another.
                    if (stream.get('playlists').length > 0) {

                        var newlyActivePlaylist = stream.getPlaylistById(playlist.get('nextListId'));
                        self.set('activePlaylist', newlyActivePlaylist);
                    }
                }

                //  If the currently playing item was in the playlist that has been removed - stop the music / refresh the UI.
                var activePlaylistItem = self.get('activePlaylistItem');
                if (activePlaylistItem !== null && activePlaylistItem.get('playlistId') === playlist.id) {
                    player.pause();
                    self.set('activePlaylistItem', null);
                }
            });

        });

        //  TODO: Support adding Stream here.
        //  TODO: Support removing Stream here.
    }
    
    function bindEventsToPlaylist(playlist) {
        var self = this;
        playlist.get('items').on('add', function (playlistItem) {
            
            self.get('allPlaylistItems').add(playlistItem);

            if (self.get('activePlaylistItem') === null) {
                self.set('activePlaylistItem', playlistItem);
                playlist.selectItem(playlistItem);
            }

        });

        playlist.get('items').on('remove', function (playlistItem) {

            self.get('allPlaylistItems').remove(playlistItem);

            if (self.get('activePlaylistItem') === playlistItem) {
                self.set('activePlaylistItem', null);
                
                var playlistId = playlistItem.get('playlistId');
                var playlist = self.getPlaylistById(playlistId);
                
                if (playlist.get('items').length > 0) {
                    var newlyActiveItem = playlist.skipItem('next');
                    self.set('activePlaylistItem', newlyActiveItem);
                } else {
                    player.pause();
                }
            }
        });
    }
    
    function loadActiveStream() {
 
        this.on('change:activeStream', function (model, activeStream) {

            if (activeStream === null) {
                localStorageManager.setActiveStreamId(null);
            } else {
                localStorageManager.setActiveStreamId(activeStream.get('id'));
            }
        });
        
        var activeStreamId = localStorageManager.getActiveStreamId();
        var activeStream = this.get('allStreams').get(activeStreamId);

        if (typeof (activeStream) === 'undefined') {
            this.set('activeStream', this.get('allStreams').at(0));
        } else {
            this.set('activeStream', activeStream);
        }
    }

    function loadActivePlaylist() {
 
        this.on('change:activePlaylist', function (model, activePlaylist) {

            if (activePlaylist == null) {
                
                //  TODO: I was experiencing some client side errors where this was undefined, trying to track down.
                if (activePlaylist !== null) {
                    window && console.error("This really should've been null and not undefined.");
                    window && console.trace();
                }

                localStorageManager.setActivePlaylistId(null);
            } else {
                localStorageManager.setActivePlaylistId(activePlaylist.get('id'));
            }

        });
        
        var activePlaylistId = localStorageManager.getActivePlaylistId();

        //  There is no guarantee that activePlaylist is in activeStream because a user could be looking
        //  at another stream without having selected a playlist in that stream.
        var activePlaylist = _.find(getAllPlaylists(), function (playlist) {
            return playlist.get('id') === activePlaylistId;
        }) || null;
        
        if (activePlaylist === null) {
            activePlaylist = this.get('activeStream').get('playlists').at(0) || null;
        }

        this.set('activePlaylist', activePlaylist);
    }
    
    function loadActivePlaylistItem() {

        this.on('change:activePlaylistItem', function (model, activePlaylistItem) {

            if (activePlaylistItem == null) {
                localStorageManager.setActivePlaylistItemId(null);
            } else {
                localStorageManager.setActivePlaylistItemId(activePlaylistItem.get('id'));
                
                //  Make sure that the player keeps its video in sync with the activePlaylistItem's video.
                var videoId = activePlaylistItem.get('video').get('id');
                if (player.isPlaying()) {
                    player.loadVideoById(videoId);
                } else {
                    player.cueVideoById(videoId);
                }
            }
        });

        var activePlaylistItemId = localStorageManager.getActivePlaylistItemId();
        
        //  There is no guarantee that activePlaylistItem is in activePlaylist because a user could be looking
        //  at another playlist without having selected an item in that playlist.
        var activePlaylistItem = _.find(getAllPlaylistItems(), function (playlistItem) {
            return playlistItem.get('id') === activePlaylistItemId;
        }) || null;

        if (activePlaylistItem === null) {
            var activePlaylist = this.get('activePlaylist');
            
            if (activePlaylist !== null) {
                var activePlaylistItems = activePlaylist.get('items');

                if (activePlaylistItems.length > 0) {
                    this.set('activePlaylistItem', activePlaylistItems.at(0));
                }
            }

        } else {
            this.set('activePlaylistItem', activePlaylistItem);
        }

        //  Need to inform the playlist to select the item so playlist history can update.
        if (this.get('activePlaylistItem') !== null) {
            var playlist = this.getPlaylistById(activePlaylistItem.get('playlistId'));
            playlist.selectItem(activePlaylistItem);
        }
    }

    //  Takes all streams, retrieves all playlists from streams and then all items from playlists.
    function getAllPlaylistItems() {
        var allPlaylists = getAllPlaylists();

        var allPlaylistItems = _.flatten(_.map(allPlaylists, function (playlist) {
            return playlist.get('items').models;
        }));

        return allPlaylistItems;
    }

    //  Takes all streams and retrieves all playlists from the streams.
    function getAllPlaylists() {
        var allPlaylists = _.flatten(BackgroundManager.get('allStreams').map(function (stream) {
            return stream.get('playlists').models;
        }));

        return allPlaylists;
    }

    BackgroundManager = new backgroundManagerModel();

    return BackgroundManager;
});