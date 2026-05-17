import { initializeApp } from 'firebase/app';
import { getAuth, GoogleAuthProvider, signInWithPopup } from 'firebase/auth';
import { getFirestore, doc, getDocFromServer } from 'firebase/firestore';
import firebaseConfig from '../../firebase-applet-config.json';

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app, (firebaseConfig as any).firestoreDatabaseId || '(default)');
export const auth = getAuth(app);
export const googleProvider = new GoogleAuthProvider();

export const signInWithGoogle = async () => {
  try {
    // Attempt to sign in with a popup
    const result = await signInWithPopup(auth, googleProvider);
    return result.user;
  } catch (error: any) {
    console.error("Error signing in with Google", error);
    
    // Check for common iframe/popup issues
    if (error.code === 'auth/popup-blocked') {
      alert("Popup blocked! Please allow popups for this site or open the app in a new tab.");
    } else if (error.code === 'auth/popup-closed-by-user') {
      // User closed it, no action needed
    } else if (error.code === 'auth/internal-error' || error.code === 'auth/network-request-failed') {
       alert("Sign in failed. This is likely due to browser privacy settings in the preview iframe. Please try opening the app in a new tab if this persists.");
    } else {
      alert(`Login Error: ${error.message}. Try opening the app in a new tab.`);
    }
    throw error;
  }
};

// Connection test
async function testConnection() {
  try {
    await getDocFromServer(doc(db, 'test', 'connection'));
  } catch (error) {
    if(error instanceof Error && error.message.includes('the client is offline')) {
      console.error("Please check your Firebase configuration.");
    }
  }
}
testConnection();
