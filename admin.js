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
            
            const hpName = data.hp_name_1 || '—';
            const statusClass = data.is_active ? 'status-active' : 'status-inactive';
            const statusText = data.is_active ? '公開中' : '非公開';
            
            row.innerHTML = `
                <td>${data.company_name || '—'}</td>
                <td>${hpName}</td>
                <td>${data.position_level || '—'}</td>
                <td><span class="level-tag level-${(data.introduction_level || '').toLowerCase().replace('-', '-minus').replace('+', '-plus')}">${data.introduction_level || '—'}</span></td>
                <td>${data.sales_contact || '—'}</td>
                <td><span class="status-badge ${statusClass}">${statusText}</span></td>
                <td>
                    <div class="action-buttons">
                        <button class="btn-edit" onclick="editHP('${doc.id}')">編集</button>
                        <button class="btn-delete" onclick="deleteHP('${doc.id}', '${data.company_name}')">削除</button>
                    </div>
                </td>
            `;
            
            tbody.appendChild(row);
        });
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
            document.getElementById('companyName').value = data.company_name || '';
            document.getElementById('companySize').value = data.company_size || '';
            document.getElementById('industry').value = data.industry || '';
            document.getElementById('hpName1').value = data.hp_name_1 || '';
            document.getElementById('hpRole1').value = data.hp_role_1 || '';
            document.getElementById('hpName2').value = data.hp_name_2 || '';
            document.getElementById('hpRole2').value = data.hp_role_2 || '';
            document.getElementById('positionLevel').value = data.position_level || '';
            document.getElementById('ageRange').value = data.age_range || '';
            document.getElementById('background').value = data.background || '';
            document.getElementById('achievements').value = data.achievements || '';
            document.getElementById('introductionLevel').value = data.introduction_level || '';
            document.getElementById('educationReq').value = data.education_requirement || '';
            document.getElementById('experienceReq').value = data.experience_requirement || '';
            document.getElementById('mindsetReq').value = data.student_mindset || '';
            document.getElementById('contactFormat').value = data.contact_format || '';
            document.getElementById('contactDetail').value = data.contact_format_detail || '';
            document.getElementById('insights').value = data.insights || '';
            document.getElementById('salesContact').value = data.sales_contact || '';
            document.getElementById('leadTime').value = data.lead_time || '';
            document.getElementById('introFlow').value = data.introduction_flow || '';
            document.getElementById('isActive').value = data.is_active ? 'true' : 'false';
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
        company_name: document.getElementById('companyName').value,
        company_size: document.getElementById('companySize').value,
        industry: document.getElementById('industry').value,
        hp_name_1: document.getElementById('hpName1').value,
        hp_role_1: document.getElementById('hpRole1').value,
        hp_name_2: document.getElementById('hpName2').value,
        hp_role_2: document.getElementById('hpRole2').value,
        position_level: document.getElementById('positionLevel').value,
        age_range: document.getElementById('ageRange').value,
        background: document.getElementById('background').value,
        achievements: document.getElementById('achievements').value,
        introduction_level: document.getElementById('introductionLevel').value,
        education_requirement: document.getElementById('educationReq').value,
        experience_requirement: document.getElementById('experienceReq').value,
        student_mindset: document.getElementById('mindsetReq').value,
        contact_format: document.getElementById('contactFormat').value,
        contact_format_detail: document.getElementById('contactDetail').value,
        insights: document.getElementById('insights').value,
        sales_contact: document.getElementById('salesContact').value,
        lead_time: document.getElementById('leadTime').value,
        introduction_flow: document.getElementById('introFlow').value,
        is_active: document.getElementById('isActive').value === 'true',
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

