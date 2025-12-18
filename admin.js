/* ==========================================
   管理画面 - ハイパフォーマー CRUD
   ========================================== */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, getDoc, addDoc, updateDoc, deleteDoc, doc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { getCurrentUser } from './auth.js';

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

let editingId = null;

/* ==========================================
   データ読み込み
   ========================================== */
async function loadHighPerformers() {
    const tbody = document.getElementById('hpTableBody');
    tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">データを読み込み中...</td></tr>';
    
    try {
        const querySnapshot = await getDocs(collection(db, 'high_performers'));
        
        if (querySnapshot.empty) {
            tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #999;">データがありません。「新規追加」ボタンから追加してください。</td></tr>';
            return;
        }
        
        tbody.innerHTML = '';
        
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            const row = document.createElement('tr');
            
            const name = data.name || '—';
            const company = data.company || '—';
            const roleLevel = getRoleLevelLabel(data.roleLevel);
            const statusClass = data.is_active !== false ? 'status-active' : 'status-inactive';
            const statusText = data.is_active !== false ? '公開中' : '非公開';
            
            row.innerHTML = `
                <td>${company}</td>
                <td>${name}</td>
                <td>${roleLevel}</td>
                <td><span class="level-tag level-${(data.introductionLevel || '').toLowerCase().replace('-', '-minus').replace('+', '-plus')}">${data.introductionLevel || '—'}</span></td>
                <td>${data.salesPerson || '—'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editHP('${doc.id}')">編集</button>
                        <button class="btn-delete" onclick="deleteHP('${doc.id}', '${name}')">削除</button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
        
        function getRoleLevelLabel(roleLevel) {
            const labels = {
                'executive': '経営層',
                'hr': '人事責任者',
                'business': '事業責任者',
                'manager': 'マネージャー',
                'leader': 'リーダー',
                'award': '特別表彰受賞者'
            };
            return labels[roleLevel] || roleLevel || '—';
        }
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        tbody.innerHTML = '<tr><td colspan="7" style="text-align: center; padding: 40px; color: #E4007F;">データの読み込みに失敗しました。</td></tr>';
    }
}

/* ==========================================
   モーダル操作
   ========================================== */
window.openModal = function(id = null) {
    editingId = id;
    const modal = document.getElementById('hpModal');
    const modalTitle = document.getElementById('modalTitle');
    const form = document.getElementById('hpForm');
    
    if (id) {
        modalTitle.textContent = 'ハイパフォーマー編集';
        loadHPData(id);
    } else {
        modalTitle.textContent = '新規ハイパフォーマー追加';
        form.reset();
    }
    
    modal.classList.add('show');
};

window.closeModal = function() {
    const modal = document.getElementById('hpModal');
    modal.classList.remove('show');
    editingId = null;
};

/* ==========================================
   データ読み込み（編集時）
   ========================================== */
async function loadHPData(id) {
    try {
        const docRef = doc(db, 'high_performers', id);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
            const data = docSnap.data();
            
            document.getElementById('hpId').value = id;
            document.getElementById('name').value = data.name || '';
            document.getElementById('company').value = data.company || '';
            document.getElementById('position').value = data.position || '';
            document.getElementById('age').value = data.age || '';
            document.getElementById('roleLevel').value = data.roleLevel || '';
            document.getElementById('background').value = data.background || '';
            document.getElementById('achievements').value = data.achievements || '';
            document.getElementById('introductionDestination').value = data.introductionDestination || '';
            document.getElementById('introductionLevel').value = data.introductionLevel || '';
            document.getElementById('introductionConditions').value = data.introductionConditions || '';
            document.getElementById('introductionOperation').value = data.introductionOperation || '';
            document.getElementById('contactType').value = data.contactType || '';
            document.getElementById('contactTypeDetail').value = data.contactTypeDetail || '';
            document.getElementById('insightsBrief').value = data.insightsBrief || '';
            document.getElementById('insights').value = data.insights || '';
            document.getElementById('salesPerson').value = data.salesPerson || '';
            document.getElementById('tags').value = data.tags || '';
        }
    } catch (error) {
        console.error('データ読み込みエラー:', error);
        alert('データの読み込みに失敗しました。');
    }
}

/* ==========================================
   フォーム送信
   ========================================== */
document.getElementById('hpForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const user = getCurrentUser();
    const userEmail = user ? user.email : 'unknown';
    
    const data = {
        name: document.getElementById('name').value,
        company: document.getElementById('company').value,
        position: document.getElementById('position').value,
        age: document.getElementById('age').value,
        roleLevel: document.getElementById('roleLevel').value,
        background: document.getElementById('background').value,
        achievements: document.getElementById('achievements').value,
        introductionDestination: document.getElementById('introductionDestination').value,
        introductionLevel: document.getElementById('introductionLevel').value,
        introductionConditions: document.getElementById('introductionConditions').value,
        introductionOperation: document.getElementById('introductionOperation').value,
        contactType: document.getElementById('contactType').value,
        contactTypeDetail: document.getElementById('contactTypeDetail').value,
        insightsBrief: document.getElementById('insightsBrief').value,
        insights: document.getElementById('insights').value,
        salesPerson: document.getElementById('salesPerson').value,
        tags: document.getElementById('tags').value,
        is_active: true, // デフォルトで公開
        updated_at: serverTimestamp(),
        updated_by: userEmail
    };
    
    try {
        if (editingId) {
            // 更新
            await updateDoc(doc(db, 'high_performers', editingId), data);
            alert('更新しました！');
        } else {
            // 新規追加
            data.created_at = serverTimestamp();
            data.created_by = userEmail;
            await addDoc(collection(db, 'high_performers'), data);
            alert('追加しました！');
        }
        
        closeModal();
        loadHighPerformers();
    } catch (error) {
        console.error('保存エラー:', error);
        alert('保存に失敗しました: ' + error.message);
    }
});

/* ==========================================
   編集
   ========================================== */
window.editHP = async function(id) {
    openModal(id);
};

/* ==========================================
   削除
   ========================================== */
window.deleteHP = async function(id, companyName) {
    if (!confirm(`「${companyName}」を削除しますか？\nこの操作は取り消せません。`)) {
        return;
    }
    
    try {
        await deleteDoc(doc(db, 'high_performers', id));
        alert('削除しました。');
        loadHighPerformers();
    } catch (error) {
        console.error('削除エラー:', error);
        alert('削除に失敗しました: ' + error.message);
    }
};

/* ==========================================
   初期化
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    loadHighPerformers();
});

