/* ==========================================
   CSV一括インポート機能
   ========================================== */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, addDoc, serverTimestamp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
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

let parsedData = [];

/* ==========================================
   ドラッグ&ドロップ対応
   ========================================== */
const uploadArea = document.getElementById('uploadArea');

uploadArea.addEventListener('dragover', (e) => {
    e.preventDefault();
    uploadArea.classList.add('dragover');
});

uploadArea.addEventListener('dragleave', () => {
    uploadArea.classList.remove('dragover');
});

uploadArea.addEventListener('drop', (e) => {
    e.preventDefault();
    uploadArea.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    if (files.length > 0) {
        handleFile(files[0]);
    }
});

/* ==========================================
   ファイル選択
   ========================================== */
window.handleFileSelect = function(event) {
    const file = event.target.files[0];
    if (file) {
        handleFile(file);
    }
};

/* ==========================================
   CSVファイル処理
   ========================================== */
function handleFile(file) {
    if (!file.name.endsWith('.csv')) {
        alert('CSVファイルを選択してください');
        return;
    }
    
    const reader = new FileReader();
    
    reader.onload = function(e) {
        const text = e.target.result;
        parseCSV(text);
    };
    
    reader.readAsText(file, 'UTF-8');
}

/* ==========================================
   CSVパース
   ========================================== */
function parseCSV(text) {
    const lines = text.split('\n');
    const headers = lines[0].split(',').map(h => h.trim());
    
    parsedData = [];
    
    for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        
        const values = line.split(',').map(v => v.trim());
        
        const row = {};
        headers.forEach((header, index) => {
            row[header] = values[index] || '';
        });
        
        parsedData.push(row);
    }
    
    displayPreview();
}

/* ==========================================
   プレビュー表示
   ========================================== */
function displayPreview() {
    const previewArea = document.getElementById('previewArea');
    const previewTableBody = document.getElementById('previewTableBody');
    const totalRecords = document.getElementById('totalRecords');
    
    previewTableBody.innerHTML = '';
    totalRecords.textContent = parsedData.length;
    
    parsedData.forEach((row, index) => {
        const tr = document.createElement('tr');
        
        tr.innerHTML = `
            <td>${row['企業名'] || '—'}</td>
            <td>${row['HP氏名1'] || '—'}</td>
            <td>${row['役職レベル'] || '—'}</td>
            <td>${row['紹介レベル'] || '—'}</td>
            <td>${row['接触形式'] || '—'}</td>
            <td>${row['担当セールス'] || '—'}</td>
            <td>${row['公開中'] === 'TRUE' ? '✅' : '❌'}</td>
        `;
        
        previewTableBody.appendChild(tr);
    });
    
    previewArea.classList.add('show');
}

/* ==========================================
   Firestoreにインポート
   ========================================== */
window.importData = async function() {
    if (parsedData.length === 0) {
        alert('インポートするデータがありません');
        return;
    }
    
    if (!confirm(`${parsedData.length}件のデータをFirestoreにインポートしますか？`)) {
        return;
    }
    
    const importBtn = document.getElementById('importBtn');
    const progressBar = document.getElementById('progressBar');
    const progressFill = document.getElementById('progressFill');
    
    importBtn.disabled = true;
    importBtn.textContent = 'インポート中...';
    progressBar.classList.add('show');
    
    const user = getCurrentUser();
    const userEmail = user ? user.email : 'unknown';
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < parsedData.length; i++) {
        const row = parsedData[i];
        
        try {
            const data = {
                company_name: row['企業名'] || '',
                company_size: row['企業規模'] || '',
                industry: row['業界'] || '',
                hp_name_1: row['HP氏名1'] || '',
                hp_role_1: row['HP役職1'] || '',
                hp_name_2: row['HP氏名2'] || '',
                hp_role_2: row['HP役職2'] || '',
                position_level: row['役職レベル'] || '',
                age_range: row['年齢層'] || '',
                background: row['経歴'] || '',
                achievements: row['成果・特徴'] || '',
                introduction_level: row['紹介レベル'] || '',
                education_requirement: row['学歴要件'] || '',
                experience_requirement: row['経験要件'] || '',
                selection_status: row['選考状況要件'] || '',
                student_mindset: row['志向性要件'] || '',
                additional_notes: row['補足条件'] || '',
                contact_format: row['接触形式'] || '',
                contact_format_detail: row['接触形式詳細'] || '',
                first_contact_person: row['初回対応者'] || '',
                special_contact_note: row['特記事項'] || '',
                insights: row['得られる知見'] || '',
                learning_points: row['学べるポイント（カンマ区切り）'] || '',
                recommended_for: row['推奨学生タイプ'] || '',
                sales_contact: row['担当セールス'] || '',
                sales_email: row['セールスメール'] || '',
                introduction_flow: row['紹介フロー'] || '',
                lead_time: row['リードタイム'] || '',
                is_active: row['公開中'] === 'TRUE',
                created_at: serverTimestamp(),
                created_by: userEmail,
                updated_at: serverTimestamp(),
                updated_by: userEmail
            };
            
            await addDoc(collection(db, 'high_performers'), data);
            successCount++;
            
        } catch (error) {
            console.error(`行${i + 1}のインポートエラー:`, error);
            errorCount++;
        }
        
        // プログレスバー更新
        const progress = Math.round(((i + 1) / parsedData.length) * 100);
        progressFill.style.width = progress + '%';
        progressFill.textContent = progress + '%';
    }
    
    // 完了
    importBtn.disabled = false;
    importBtn.textContent = 'インポート完了！';
    
    setTimeout(() => {
        alert(`インポート完了！\n\n✅ 成功: ${successCount}件\n❌ 失敗: ${errorCount}件`);
        
        if (successCount > 0) {
            if (confirm('HP一覧ページに移動しますか？')) {
                window.location.href = 'index.html';
            } else {
                // ページをリロード
                window.location.reload();
            }
        }
    }, 500);
};

