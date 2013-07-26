<<<<<<< HEAD
﻿using Autofac;
using log4net;
using Streamus.Dao;
using Streamus.Domain.Interfaces;
using System;
using System.Collections.Generic;
using System.Reflection;
=======
﻿using System;
using System.Collections.Generic;
using System.Linq;
using Streamus.Dao;
using Streamus.Domain.Interfaces;
>>>>>>> origin/Development

namespace Streamus.Domain.Managers
{
    public class VideoManager : AbstractManager
    {
<<<<<<< HEAD
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly ILifetimeScope Scope;
        private readonly IDaoFactory DaoFactory;
=======
>>>>>>> origin/Development
        private IVideoDao VideoDao { get; set; }

        public VideoManager()
        {
<<<<<<< HEAD
            Scope = AutofacRegistrations.Container.BeginLifetimeScope();
            DaoFactory = Scope.Resolve<IDaoFactory>();

=======
>>>>>>> origin/Development
            VideoDao = DaoFactory.GetVideoDao();
        }

        public void Save(Video video)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                DoSave(video);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public void Save(IEnumerable<Video> videos)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                videos.ToList().ForEach(DoSave);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }

        public void DoSave(Video video)
        {
            video.ValidateAndThrow();

            //  Merge instead of SaveOrUpdate because Video's ID is assigned, but the same Video
            //  entity can be referenced by many different Playlists. As such, it is common to have the entity
            //  loaded into the cache.
            VideoDao.Merge(video);
        }
    }
}