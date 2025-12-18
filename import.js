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
   CSVパース（PapaParse使用）
   ========================================== */
function parseCSV(text) {
    // PapaParseを使用してCSVを正しくパース
    Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: function(results) {
            parsedData = results.data;
            console.log('✅ CSVパース完了:', parsedData.length, '件');
            console.log('最初のデータ:', parsedData[0]);
            displayPreview();
        },
        error: function(error) {
            console.error('❌ CSVパースエラー:', error);
            alert('CSVの解析に失敗しました: ' + error.message);
        }
    });
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
        
        // デバッグ: 各行のキーを表示
        console.log('行', index + 1, 'のキー:', Object.keys(row));
        console.log('行', index + 1, 'のデータ:', row);
        
        // 新形式（個人単位）対応
        const company = row['company'] || row['企業名'] || '—';
        const name = row['name'] || row['HP氏名1'] || '—';
        const roleLevel = getRoleLevelLabel(row['roleLevel'] || row['役職レベル']);
        const introLevel = row['introductionLevel'] || row['紹介レベル'] || '—';
        const contactType = getContactTypeLabel(row['contactType'] || row['接触形式']);
        const salesPerson = row['salesPerson'] || row['担当セールス'] || '—';
        
        console.log('変換後:', { company, name, roleLevel, introLevel, contactType, salesPerson });
        
        tr.innerHTML = `
            <td>${company}</td>
            <td>${name}</td>
            <td>${roleLevel}</td>
            <td>${introLevel}</td>
            <td>${contactType}</td>
            <td>${salesPerson}</td>
            <td>✅</td>
        `;
        
        previewTableBody.appendChild(tr);
    });
    
    previewArea.classList.add('show');
}

// 役職レベルのラベル変換
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

// 接触形式のラベル変換
function getContactTypeLabel(contactType) {
    const labels = {
        'individual': '個別面談',
        'interview': '面接',
        'group': '座談会/イベント'
    };
    return labels[contactType] || contactType || '—';
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
            // 新形式（個人単位）のデータ構造
            const data = {
                name: row['name'] || row['HP氏名1'] || '',
                company: row['company'] || row['企業名'] || '',
                position: row['position'] || row['役職'] || '',
                roleLevel: row['roleLevel'] || row['役職レベル'] || '',
                age: row['age'] || row['年齢層'] || '',
                background: row['background'] || row['経歴'] || '',
                achievements: row['achievements'] || row['成果・特徴'] || '',
                introductionLevel: row['introductionLevel'] || row['紹介レベル'] || '',
                introductionConditions: row['introductionConditions'] || row['紹介可能条件'] || '',
                introductionOperation: row['introductionOperation'] || row['紹介オペレーション'] || '',
                contactType: row['contactType'] || row['接触形式'] || '',
                contactTypeDetail: row['contactTypeDetail'] || row['接触形式の補足説明'] || '',
                insightsBrief: row['insightsBrief'] || row['得られる知見（簡潔版）'] || '',
                insights: row['insights'] || row['得られる知見'] || '',
                salesPerson: row['salesPerson'] || row['担当セールス'] || '',
                tags: row['tags'] || row['タグ'] || '',
                is_active: true,
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




