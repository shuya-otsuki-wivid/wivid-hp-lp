import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, deleteDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getCurrentUser } from './auth.js';
import { getAllAdmins } from './admin-check.js';

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

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

// ページ読み込み時に管理者リストを表示
document.addEventListener('DOMContentLoaded', function() {
    loadAdmins();
    
    // 管理者追加ボタン
    document.getElementById('addAdminBtn').addEventListener('click', function() {
        document.getElementById('addAdminModal').classList.add('show');
    });
    
    // キャンセルボタン
    document.getElementById('cancelBtn').addEventListener('click', function() {
        document.getElementById('addAdminModal').classList.remove('show');
        document.getElementById('addAdminForm').reset();
    });
    
    // 管理者追加フォーム送信
    document.getElementById('addAdminForm').addEventListener('submit', async function(e) {
        e.preventDefault();
        await addAdmin();
    });
});

// 管理者リストを読み込み
async function loadAdmins() {
    const tableBody = document.getElementById('adminsTableBody');
    tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">読み込み中...</td></tr>';
    
    try {
        const admins = await getAllAdmins();
        
        if (admins.length === 0) {
            tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px;">管理者が登録されていません</td></tr>';
            return;
        }
        
        tableBody.innerHTML = '';
        admins.forEach(admin => {
            const row = document.createElement('tr');
            
            const typeBadgeClass = admin.type === '初期管理者' ? 'type-super' : 'type-normal';
            const createdAt = admin.created_at ? new Date(admin.created_at.seconds * 1000).toLocaleString('ja-JP') : '—';
            const createdBy = admin.created_by || '—';
            
            row.innerHTML = `
                <td>${admin.email}</td>
                <td><span class="type-badge ${typeBadgeClass}">${admin.type}</span></td>
                <td>${createdAt}</td>
                <td>${createdBy}</td>
                <td>
                    ${admin.can_delete ? 
                        `<button class="btn-delete" onclick="deleteAdmin('${admin.id}', '${admin.email}')">削除</button>` : 
                        `<button class="btn-delete" disabled>削除不可</button>`
                    }
                </td>
            `;
            
            tableBody.appendChild(row);
        });
        
        console.log(`✅ 管理者リスト表示: ${admins.length}件`);
    } catch (error) {
        console.error('❌ 管理者リスト読み込みエラー:', error);
        tableBody.innerHTML = '<tr><td colspan="5" style="text-align: center; padding: 40px; color: #dc3545;">エラーが発生しました</td></tr>';
    }
}

// 管理者を追加
async function addAdmin() {
    const emailInput = document.getElementById('newAdminEmail');
    const email = emailInput.value.trim();
    
    if (!email) {
        alert('メールアドレスを入力してください');
        return;
    }
    
    // @wivid.co.jpドメインチェック
    if (!email.endsWith('@wivid.co.jp')) {
        alert('メールアドレスは @wivid.co.jp ドメインである必要があります');
        return;
    }
    
    const user = getCurrentUser();
    
    try {
        await addDoc(collection(db, 'admins'), {
            email: email,
            is_active: true,
            created_at: serverTimestamp(),
            created_by: user ? user.email : 'unknown',
            updated_at: serverTimestamp()
        });
        
        alert(`✅ 管理者を追加しました: ${email}`);
        document.getElementById('addAdminModal').classList.remove('show');
        document.getElementById('addAdminForm').reset();
        loadAdmins();
    } catch (error) {
        console.error('❌ 管理者追加エラー:', error);
        alert('管理者の追加に失敗しました: ' + error.message);
    }
}

// 管理者を削除
window.deleteAdmin = async function(adminId, email) {
    if (!confirm(`管理者を削除しますか？\n\nメールアドレス: ${email}\n\n削除すると、このユーザーは管理画面にアクセスできなくなります。`)) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'admins', adminId));
        alert(`✅ 管理者を削除しました: ${email}`);
        loadAdmins();
    } catch (error) {
        console.error('❌ 管理者削除エラー:', error);
        alert('管理者の削除に失敗しました: ' + error.message);
    }
};

