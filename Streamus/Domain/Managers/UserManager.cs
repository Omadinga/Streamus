<<<<<<< HEAD
﻿using System;
using System.Reflection;
using Autofac;
using Streamus.Dao;
=======
﻿using Streamus.Dao;
>>>>>>> origin/Development
using Streamus.Domain.Interfaces;
using System;

namespace Streamus.Domain.Managers
{
    /// <summary>
    ///     Provides a common spot for methods against Users which require transactions (Creating, Updating, Deleting)
    /// </summary>
    public class UserManager : AbstractManager
    {
<<<<<<< HEAD
        private static readonly ILog Logger = LogManager.GetLogger(MethodBase.GetCurrentMethod().DeclaringType);
        private readonly ILifetimeScope Scope;
        private readonly IDaoFactory DaoFactory;

=======
>>>>>>> origin/Development
        private IUserDao UserDao { get; set; }

        public UserManager()
        {
<<<<<<< HEAD
            Scope = AutofacRegistrations.Container.BeginLifetimeScope();
            DaoFactory = Scope.Resolve<IDaoFactory>();

=======
>>>>>>> origin/Development
            UserDao = DaoFactory.GetUserDao();
        }

        /// <summary>
        ///     Creates a new User and saves it to the DB. As a side effect, also creates a new, empty
        ///     Folder (which has a new, empty Playlist) for the created User and saves it to the DB.
        /// </summary>
        /// <returns>The created user with a generated GUID</returns>
        public User CreateUser()
        {
            User user;

            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                user = new User();
                user.ValidateAndThrow();
                UserDao.Save(user);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }

            return user;
        }

        public void Save(User user)
        {
            try
            {
                NHibernateSessionManager.Instance.BeginTransaction();

                user.ValidateAndThrow();
                UserDao.Save(user);

                NHibernateSessionManager.Instance.CommitTransaction();
            }
            catch (Exception exception)
            {
                Logger.Error(exception);
                NHibernateSessionManager.Instance.RollbackTransaction();
                throw;
            }
        }
    }
}