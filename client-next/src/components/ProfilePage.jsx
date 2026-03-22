import { useState } from 'react';
import firebase from '../firebase.js';

function ProfilePage({ user, navigateTo }) {
  const [deleting, setDeleting] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);

  const handleLogout = async () => {
    await firebase.auth().signOut();
    navigateTo('welcome');
  };

  const handleDeleteAccount = async () => {
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    setDeleting(true);
    try {
      // Re-authenticate then delete
      const provider = new firebase.auth.GoogleAuthProvider();
      await firebase.auth().currentUser.reauthenticateWithPopup(provider);
      await firebase.auth().currentUser.delete();
      navigateTo('welcome');
    } catch (err) {
      console.error(err);
      alert('Could not delete account. Please sign in again and try.');
    } finally {
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  if (!user) {
    if (typeof window !== 'undefined') navigateTo('welcome');
    return null;
  }

  return (
    <div className="profile-page">
      <div className="profile-card">
        <div className="profile-avatar-wrap">
          {user.photoURL
            ? <img src={user.photoURL} alt={user.displayName} className="profile-avatar" />
            : <div className="profile-avatar-fallback">{user.displayName?.[0] ?? '?'}</div>
          }
        </div>

        <h2 className="profile-name">{user.displayName}</h2>
        <p className="profile-email">{user.email}</p>

        <div className="profile-actions">
          <button className="profile-btn profile-btn--logout" onClick={handleLogout}>
            Sign Out
          </button>

          {!confirmDelete ? (
            <button className="profile-btn profile-btn--delete" onClick={() => setConfirmDelete(true)}>
              Delete Account
            </button>
          ) : (
            <div className="profile-delete-confirm">
              <p>This will permanently delete your account. Are you sure?</p>
              <div className="profile-delete-btns">
                <button className="profile-btn profile-btn--delete-confirm" onClick={handleDeleteAccount} disabled={deleting}>
                  {deleting ? 'Deleting…' : 'Yes, Delete'}
                </button>
                <button className="profile-btn profile-btn--cancel" onClick={() => setConfirmDelete(false)}>
                  Cancel
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default ProfilePage;
