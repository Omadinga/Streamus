﻿using System;
using System.Collections.Generic;
using System.Web.Mvc;
using Streamus.Backend.Dao;
using Streamus.Backend.Domain;
using Streamus.Backend.Domain.Interfaces;
using Streamus.Backend.Domain.Managers;

namespace Streamus.Controllers
{
    public class PlaylistController : Controller
    {
        private readonly IPlaylistDao PlaylistDao = new PlaylistDao();
        private readonly IPlaylistItemDao PlaylistItemDao = new PlaylistItemDao();

        [HttpPost]
        public ActionResult Create(Playlist playlist)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
            playlistManager.Save(playlist);

            return new JsonDataContractActionResult(playlist);
        }

        //[HttpPut]
        //public ActionResult Update(Playlist playlist)
        //{
        //    var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
        //    playlistManager.Update(playlist);

        //    return new JsonDataContractActionResult(playlist);
        //}

        [HttpGet]
        public ActionResult Get(Guid id)
        {
            Playlist playlist = PlaylistDao.Get(id);

            return new JsonDataContractActionResult(playlist);
        }

        [HttpDelete]
        public EmptyResult Delete(Guid id)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
            playlistManager.DeletePlaylistById(id);

            return new EmptyResult();
        }

        [HttpPost]
        public EmptyResult UpdateItemPosition(Guid playlistId, List<PlaylistItem> detachedItems)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
            playlistManager.UpdateItemPosition(playlistId, detachedItems);

            return new EmptyResult();
        }

        [HttpPost]
        public EmptyResult UpdateTitle(Guid playlistId, string title)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
            playlistManager.UpdateTitle(playlistId, title);

            return new EmptyResult();
        }

        [HttpGet]
        public ActionResult GetPlaylistsByUserId(Guid userId)
        {
            IList<Playlist> playlists = PlaylistDao.GetByUserId(userId);

            return new JsonDataContractActionResult(playlists);
        }

        [HttpPost]
        public ActionResult CreateItem(PlaylistItem playlistItem)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
            playlistManager.CreatePlaylistItem(playlistItem);

            return new JsonDataContractActionResult(playlistItem);
        }

        [HttpPost]
        public ActionResult CreateItems(IEnumerable<PlaylistItem> playlistItems)
        {
            var playlistManager = new PlaylistManager(PlaylistDao, PlaylistItemDao);
            playlistManager.CreatePlaylistItems(playlistItems);

            return new JsonDataContractActionResult(playlistItems);
        }
    }
}