import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  sendPasswordResetEmail,
  User as FirebaseUser,
  onAuthStateChanged,
} from 'firebase/auth';
import { auth, isFirebaseConfigured } from '../firebase/config';
import { COLLECTIONS } from '../firebase/collections';
import { dbService } from './databaseService';
import { UserProfile, UserRole } from '../types';
import { SEED_USERS } from '../data/seedData';

const SESSION_STORAGE_KEY = 'stocksense_auth_user';

export const authService = {
  /**
   * Logs in with email and password.
   */
  async login(email: string, pass: string): Promise<UserProfile> {
    if (isFirebaseConfigured() && auth) {
      const userCredential = await signInWithEmailAndPassword(auth, email, pass);
      const fbUser = userCredential.user;
      let profile = await dbService.getById<UserProfile>(COLLECTIONS.USERS, fbUser.uid);

      if (!profile) {
        // Fallback profile if Firestore user document wasn't yet created
        profile = {
          id: fbUser.uid,
          email: fbUser.email || email,
          displayName: fbUser.displayName || email.split('@')[0],
          role: 'INVENTORY_MANAGER',
          createdAt: new Date().toISOString(),
          lastLoginAt: new Date().toISOString(),
        };
        await dbService.set<UserProfile>(COLLECTIONS.USERS, fbUser.uid, profile);
      } else {
        await dbService.update<UserProfile>(COLLECTIONS.USERS, fbUser.uid, {
          lastLoginAt: new Date().toISOString(),
        });
      }

      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      return profile;
    }

    // Local / Demo Mode matching
    const matchingUser = SEED_USERS.find(
      (u) => u.email.toLowerCase() === email.trim().toLowerCase()
    );

    if (matchingUser) {
      const updated = { ...matchingUser, lastLoginAt: new Date().toISOString() };
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    }

    // Default dynamic user for testing
    const defaultUser: UserProfile = {
      id: `usr-${Date.now()}`,
      email: email.trim(),
      displayName: email.split('@')[0],
      role: 'INVENTORY_MANAGER',
      department: 'Operations',
      createdAt: new Date().toISOString(),
      lastLoginAt: new Date().toISOString(),
    };
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(defaultUser));
    return defaultUser;
  },

  /**
   * Quick Switcher / Demo Login helper for hackathon presentations.
   */
  async quickDemoLogin(role: UserRole): Promise<UserProfile> {
    const user = SEED_USERS.find((u) => u.role === role) || SEED_USERS[0];
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(user));
    return user;
  },

  /**
   * Registers a new user.
   */
  async signup(
    email: string,
    pass: string,
    displayName: string,
    role: UserRole = 'WAREHOUSE_STAFF',
    department = 'Logistics'
  ): Promise<UserProfile> {
    const now = new Date().toISOString();

    if (isFirebaseConfigured() && auth) {
      const cred = await createUserWithEmailAndPassword(auth, email, pass);
      const profile: UserProfile = {
        id: cred.user.uid,
        email,
        displayName,
        role,
        department,
        createdAt: now,
        lastLoginAt: now,
      };
      await dbService.set<UserProfile>(COLLECTIONS.USERS, cred.user.uid, profile);
      localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
      return profile;
    }

    // Local/Demo Mode signup
    const profile: UserProfile = {
      id: `usr-${Date.now()}`,
      email,
      displayName,
      role,
      department,
      createdAt: now,
      lastLoginAt: now,
    };
    await dbService.set<UserProfile>(COLLECTIONS.USERS, profile.id, profile);
    localStorage.setItem(SESSION_STORAGE_KEY, JSON.stringify(profile));
    return profile;
  },

  /**
   * Sends password reset email.
   */
  async resetPassword(email: string): Promise<void> {
    if (isFirebaseConfigured() && auth) {
      await sendPasswordResetEmail(auth, email);
    } else {
      console.info(`[authService] Password reset link simulated for ${email}`);
    }
  },

  /**
   * Logs out current user.
   */
  async logout(): Promise<void> {
    if (isFirebaseConfigured() && auth) {
      await signOut(auth);
    }
    localStorage.removeItem(SESSION_STORAGE_KEY);
  },

  /**
   * Retrieves active session user profile from localStorage or Firebase Auth.
   */
  getCurrentUser(): UserProfile | null {
    const raw = localStorage.getItem(SESSION_STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as UserProfile;
    } catch {
      return null;
    }
  },

  /**
   * Subscribes to authentication state changes.
   */
  onAuthState(callback: (user: UserProfile | null) => void): () => void {
    if (isFirebaseConfigured() && auth) {
      return onAuthStateChanged(auth, async (fbUser: FirebaseUser | null) => {
        if (fbUser) {
          const profile = await dbService.getById<UserProfile>(COLLECTIONS.USERS, fbUser.uid);
          callback(profile);
        } else {
          callback(null);
        }
      });
    }

    // Return current stored user
    callback(this.getCurrentUser());
    return () => {};
  },
};
