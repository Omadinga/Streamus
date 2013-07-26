﻿using System;
using System.Collections.Generic;
using System.Linq;
<<<<<<< HEAD
using System.Reflection;
using Autofac;
=======
>>>>>>> origin/Development
using Streamus.Dao;
using Streamus.Domain.Interfaces;

namespace Streamus.Domain.Managers
{
    public class PlaylistManager : AbstractManager
    {
<<<<<<< HEAD
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly ILifetimeScope Scope;
        private readonly IDaoFactory DaoFactory;

=======
>>>>>>> origin/Development
        private IPlaylistDao PlaylistDao { get; set; }
        private IPlaylistItemDao PlaylistItemDao { get; set; }
        private IVideoDao VideoDao { get; set; }
        private IShareCodeDao ShareCodeDao { get; set; }

        public PlaylistManager()
        {
<<<<<<< HEAD
            Scope = AutofacRegistrations.Container.BeginLifetimeScope();
            DaoFactory = Scope.Resolve<IDaoFactory>();

=======
>>>>>>> origin/Development
            PlaylistDao = DaoFactory.GetPlaylistDao();
            PlaylistItemDao = DaoFactory.GetPlaylistItemDao();
            VideoDao = DaoFactory.GetVideoDao();
            ShareCodeDao = DaoFactory.GetShareCodeDao();
        }

        public void Save(Playlist playlist)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                DoSave(playlist);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public void Save(IEnumerable<Playlist> playlists)
<<<<<<< HEAD
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                foreach (Playlist playlist in playlists)
                {
                    playlist.ValidateAndThrow();
                    PlaylistDao.SaveOrUpdate(playlist);
                }

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public void Update(Playlist playlist)
=======
>>>>>>> origin/Development
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                playlists.ToList().ForEach(DoSave);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        /// <summary>
        ///     This is the work for saving a PlaylistItem without the Transaction wrapper.
        /// </summary>
        private void DoSave(Playlist playlist)
        {
            foreach (PlaylistItem playlistItem in playlist.Items)
            {
                //  This is a bit of a hack, but NHibernate pays attention to the "dirtyness" of immutable entities.
                //  As such, if two PlaylistItems reference the same Video object -- NonUniqueObjectException is thrown even though no changes
                //  can be persisted to the database.
                playlistItem.Video = VideoDao.Merge(playlistItem.Video);

                playlistItem.ValidateAndThrow();
                playlistItem.Video.ValidateAndThrow();
            }

            playlist.ValidateAndThrow();
            PlaylistDao.Save(playlist);
        }

        public void Update(Playlist playlist)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                playlist.ValidateAndThrow();

                Playlist knownPlaylist = PlaylistDao.Get(playlist.Id);

                if (knownPlaylist == null)
                {
                    PlaylistDao.Update(playlist);
                }
                else
                {
                    PlaylistDao.Merge(playlist);
                }

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public void Delete(Guid id)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                Playlist playlist = PlaylistDao.Get(id);
                playlist.Folder.RemovePlaylist(playlist);
                PlaylistDao.Delete(playlist);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public void UpdateTitle(Guid playlistId, string title)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                Playlist playlist = PlaylistDao.Get(playlistId);
                playlist.Title = title;
                PlaylistDao.Update(playlist);
                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public void UpdateFirstItem(Guid playlistId, Guid firstItemId)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();
                Playlist playlist = PlaylistDao.Get(playlistId);
                playlist.FirstItem = PlaylistItemDao.Get(firstItemId);
                PlaylistDao.Update(playlist);
                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public ShareCode GetShareCode(Guid playlistId)
        {
            ShareCode shareCode = null;

            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                Playlist playlist = PlaylistDao.Get(playlistId);

                if (playlist == null)
                {
                    string errorMessage = string.Format("No playlist found with id: {0}", playlistId);
                    throw new ApplicationException(errorMessage);
                }

                Playlist shareablePlaylistCopy = new Playlist();

                //  TODO: Reconsider this.
                shareablePlaylistCopy.NextPlaylist = shareablePlaylistCopy;
                shareablePlaylistCopy.PreviousPlaylist = shareablePlaylistCopy;

                shareablePlaylistCopy.ValidateAndThrow();
                PlaylistDao.Save(shareablePlaylistCopy);

                shareablePlaylistCopy.Copy(playlist);
                PlaylistDao.Update(shareablePlaylistCopy);

                //  Gotta do this manually.
                shareablePlaylistCopy.Items.ToList().ForEach(PlaylistItemDao.Save);

                shareCode = new ShareCode(shareablePlaylistCopy);

                shareCode.ValidateAndThrow();
                ShareCodeDao.Save(shareCode);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }

            return shareCode;
        }
    }
}