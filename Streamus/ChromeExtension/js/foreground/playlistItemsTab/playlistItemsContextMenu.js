//  Responsible for showing options when interacting with a Video in PlaylistItemList.
define(['contextMenu', 'playlistManager'], function (contextMenu, playlistManager) {
    'use strict';
    var playlistItemsContextMenu = { };

    $.extend(playlistItemsContextMenu, contextMenu, {
        initialize: function(item) {
            this.empty();

            this.addContextMenuItem('Copy URL', function() {
                if (item != null) {
                    //  TODO: oh crap this might not work now cuz port isnt open.
                    chrome.extension.sendMessage({ text: 'http://youtu.be/' + item.get('videoId') });
                }
            });

            this.addContextMenuItem('Delete', function() {
                if (item != null) {
                    playlistManager.removeItem(item);
                }
            });
        }
    });

    return playlistItemsContextMenu;
});