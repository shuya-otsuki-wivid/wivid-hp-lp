/* ==========================================
   Firebase Authentication
   @wivid.co.jp ドメイン限定認証
   ========================================== */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getAuth, GoogleAuthProvider, signInWithPopup, onAuthStateChanged, signOut } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-auth.js';
import { getAnalytics } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-analytics.js';

// Firebase設定
const firebaseConfig = {
  apiKey: "AIzaSyAWHDKSGNB4t0SF85lE9UNSwzdOJFFu4GA",
  authDomain: "wivid-hp-lp.firebaseapp.com",
  projectId: "wivid-hp-lp",
  storageBucket: "wivid-hp-lp.firebasestorage.app",
  messagingSenderId: "28034725256",
  appId: "1:28034725256:web:18bf22169697ff522df63d",
  measurementId: "G-MTT48T3EDP"
};

// Firebase初期化
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const analytics = getAnalytics(app);
const provider = new GoogleAuthProvider();

// 許可するドメイン
const ALLOWED_DOMAIN = 'wivid.co.jp';

/* ==========================================
   Googleサインイン
   ========================================== */
export function signInWithGoogle() {
  return signInWithPopup(auth, provider)
    .then((result) => {
      const user = result.user;
      const email = user.email;
      
      // @wivid.co.jpドメインチェック
      if (email.endsWith(`@${ALLOWED_DOMAIN}`)) {
        console.log('✅ 認証成功:', email);
        return { success: true, user: user };
      } else {
        // 許可されていないドメインの場合、サインアウト
        signOut(auth);
        console.error('❌ 許可されていないドメイン:', email);
        return { 
          success: false, 
          error: `@${ALLOWED_DOMAIN} のメールアドレスでログインしてください。` 
        };
      }
    })
    .catch((error) => {
      console.error('認証エラー:', error);
      return { 
        success: false, 
        error: 'ログインに失敗しました。もう一度お試しください。' 
      };
    });
}

/* ==========================================
   サインアウト
   ========================================== */
export function signOutUser() {
  return signOut(auth);
}

/* ==========================================
   認証状態の監視
   ========================================== */
export function checkAuthState(callback) {
  onAuthStateChanged(auth, (user) => {
    if (user && user.email.endsWith(`@${ALLOWED_DOMAIN}`)) {
      // 認証済み＆正しいドメイン
      callback({ authenticated: true, user: user });
    } else {
      // 未認証 or 不正なドメイン
      callback({ authenticated: false, user: null });
    }
  });
}

/* ==========================================
   現在のユーザーを取得
   ========================================== */
export function getCurrentUser() {
  return auth.currentUser;
}

