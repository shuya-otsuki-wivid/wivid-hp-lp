import { getFirestore, collection, query, where, getDocs } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getCurrentUser } from './auth.js';

// 初期管理者（永久アクセス可能）
const SUPER_ADMINS = [
    'shuya_otsuki@wivid.co.jp'
];

/**
 * 現在のユーザーが管理者かどうかをチェック
 * @returns {Promise<boolean>}
 */
export async function isAdmin() {
    const user = getCurrentUser();
    if (!user || !user.email) {
        return false;
    }
    
    const userEmail = user.email;
    console.log('🔍 管理者チェック:', userEmail);
    
    // 初期管理者チェック
    if (SUPER_ADMINS.includes(userEmail)) {
        console.log('✅ 初期管理者です');
        return true;
    }
    
    // Firestoreの管理者リストをチェック
    try {
        const db = getFirestore();
        const q = query(collection(db, 'admins'), where('email', '==', userEmail), where('is_active', '==', true));
        const querySnapshot = await getDocs(q);
        
        if (!querySnapshot.empty) {
            console.log('✅ Firestore管理者です');
            return true;
        }
    } catch (error) {
        console.error('❌ Firestore管理者チェックエラー:', error);
    }
    
    console.log('❌ 管理者ではありません');
    return false;
}

/**
 * 管理者ページへのアクセスをチェック（管理者でない場合はリダイレクト）
 */
export async function requireAdmin() {
    const admin = await isAdmin();
    if (!admin) {
        alert('このページへのアクセス権限がありません。管理者に連絡してください。');
        window.location.href = 'index.html';
    }
}

/**
 * 全ての管理者を取得
 * @returns {Promise<Array>}
 */
export async function getAllAdmins() {
    const admins = [];
    
    // 初期管理者を追加
    SUPER_ADMINS.forEach(email => {
        admins.push({
            email: email,
            type: '初期管理者',
            is_active: true,
            can_delete: false
        });
    });
    
    // Firestoreの管理者を取得
    try {
        const db = getFirestore();
        const querySnapshot = await getDocs(collection(db, 'admins'));
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            admins.push({
                id: doc.id,
                email: data.email,
                type: '追加管理者',
                is_active: data.is_active,
                can_delete: true,
                created_at: data.created_at,
                created_by: data.created_by
            });
        });
    } catch (error) {
        console.error('❌ 管理者リスト取得エラー:', error);
    }
    
    return admins;
}

