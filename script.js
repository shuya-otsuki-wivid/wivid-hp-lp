/* ==========================================
   Wivid HP Tool - JavaScript
   ========================================== */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';

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

let allHighPerformers = [];

document.addEventListener('DOMContentLoaded', function() {
    // Firestoreからデータを読み込み
    loadHighPerformers();
    
    // スムーススクロール
    initSmoothScroll();
});

/* ==========================================
   Firestoreからハイパフォーマー情報を読み込み
   ========================================== */
async function loadHighPerformers() {
    const hpGrid = document.querySelector('.hp-grid');
    
    if (!hpGrid) return;
    
    try {
        const q = query(collection(db, 'high_performers'), where('is_active', '==', true));
        const querySnapshot = await getDocs(q);
        
        // 既存の静的カード数を取得
        const existingCards = hpGrid.querySelectorAll('.hp-card').length;
        
        // Firestoreからのデータを追加
        querySnapshot.forEach((doc) => {
            const data = doc.data();
            allHighPerformers.push(data);
            
            const card = createHPCard(data);
            hpGrid.appendChild(card);
        });
        
        // ハイパフォーマー数を更新（静的 + 動的）
        const totalCountEl = document.getElementById('totalHPCount');
        if (totalCountEl) {
            const totalCount = existingCards + querySnapshot.size;
            totalCountEl.textContent = totalCount;
        }
        
        console.log(`✅ 静的データ: ${existingCards}件, Firestoreデータ: ${querySnapshot.size}件`);
        
        // フィルター機能を初期化
        initFilters();
        
        // スクロールアニメーション
        initScrollAnimations();
        
    } catch (error) {
        console.error('❌ データ読み込みエラー:', error);
        // エラーが出ても静的データは表示されたまま
        
        // フィルター機能を初期化（静的データ用）
        initFilters();
        initScrollAnimations();
    }
}

/* ==========================================
   HPカードを生成
   ========================================== */
function createHPCard(data) {
    const card = document.createElement('div');
    card.className = 'hp-card-v2';
    
    // data-属性を設定（フィルター用）
    card.dataset.role = data.roleLevel || 'executive';
    card.dataset.level = data.introductionLevel || 'C';
    card.dataset.contact = data.contactType || 'individual';
    card.dataset.company = data.company || '';
    card.dataset.position = data.position || '';
    card.dataset.age = data.age || '';
    
    // 経歴をリスト化
    const backgroundList = data.background ? data.background.split('｜').map(item => `<li>${item}</li>`).join('') : '';
    
    // 得られる知見（簡潔版）をリスト化
    const insightsBriefList = data.insightsBrief ? data.insightsBrief.split('｜').map(item => `<li>${item}</li>`).join('') : '';
    
    // タグを配列化
    const tagsArray = data.tags ? data.tags.split('｜') : [];
    const tagsHTML = tagsArray.map(tag => `<span class="tag-badge">🏷️ ${tag}</span>`).join('');
    
    // 紹介レベルのクラス
    const levelClass = `level-${(data.introductionLevel || 'c').toLowerCase().replace('-', '-minus').replace('+', '-plus')}`;
    
    // 接触形式のラベルを取得
    function getContactTypeLabel(contactType) {
        const labels = {
            'individual': '📍 個別面談',
            'interview': '🎤 面接',
            'group': '👥 座談会/イベント'
        };
        return labels[contactType] || contactType || '—';
    }
    
    card.innerHTML = `
        <div class="card-header-v2">
            <div class="hp-name-large">${data.name || '氏名不明'}さん</div>
            <div class="company-info-row">${data.company || '企業名不明'}</div>
            <div class="position-info-row">
                <span class="position-badge-v2">💼 ${data.position || '役職不明'}</span>
                ${data.age ? `<span class="age-badge">👤 ${data.age}</span>` : ''}
            </div>
        </div>
        
        <div class="card-body-v2">
            ${backgroundList ? `
            <div class="section-v2">
                <div class="section-title-v2">📚 経歴</div>
                <div class="section-content-v2">
                    <ul class="background-list">${backgroundList}</ul>
                </div>
            </div>
            ` : ''}
            
            ${data.introductionDestination ? `
            <div class="section-v2">
                <div class="section-title-v2">🎯 紹介先</div>
                <div class="section-content-v2">
                    <span class="intro-destination-badge">${data.introductionDestination}</span>
                </div>
            </div>
            ` : ''}
            
            ${data.introductionConditions ? `
            <div class="section-v2 cd-only">
                <div class="section-title-v2">📊 紹介可能条件（CD向け）</div>
                <div class="section-content-v2 intro-conditions-box">
                    <strong>紹介レベル：</strong><span class="level-tag ${levelClass}">${data.introductionLevel || '—'}</span><br>
                    ${data.introductionConditions}
                </div>
            </div>
            ` : ''}
            
            ${data.introductionOperation ? `
            <div class="section-v2 cd-only">
                <div class="section-title-v2">📋 紹介オペレーション</div>
                <div class="section-content-v2">${data.introductionOperation}</div>
            </div>
            ` : ''}
            
            ${data.contactType || data.contactTypeDetail ? `
            <div class="section-v2">
                <div class="section-title-v2">📞 接触形式</div>
                <div class="section-content-v2">
                    ${getContactTypeLabel(data.contactType)}${data.contactTypeDetail ? `<br><small style="color: var(--color-text-muted);">${data.contactTypeDetail}</small>` : ''}
                </div>
            </div>
            ` : ''}
            
            ${insightsBriefList ? `
            <div class="section-v2">
                <div class="section-title-v2">💡 得られる知見</div>
                <div class="section-content-v2 insights-preview">
                    <ul>${insightsBriefList}</ul>
                </div>
            </div>
            ` : ''}
            
            ${tagsHTML ? `
            <div class="tags-row">${tagsHTML}</div>
            ` : ''}
        </div>
        
        <div class="card-footer-v2">
            <span class="sales-info">担当：${data.salesPerson || '—'}</span>
            ${data.insights ? `<button class="detail-btn-v2" onclick="showInsights('${encodeURIComponent(data.name)}', '${encodeURIComponent(data.insights || '')}')">詳細を見る</button>` : ''}
        </div>
    `;
    
    return card;
}

/* ==========================================
   詳細表示トグル（旧カード用）
   ========================================== */
window.toggleDetails = function(button) {
    const card = button.closest('.hp-card');
    const requirements = card.querySelector('.card-requirements');
    
    if (requirements.classList.contains('show')) {
        requirements.classList.remove('show');
        button.textContent = '詳細を見る';
    } else {
        requirements.classList.add('show');
        button.textContent = '閉じる';
    }
};

/* ==========================================
   得られる知見の詳細表示（新カード用）
   ========================================== */
window.showInsights = function(name, insights) {
    const decodedName = decodeURIComponent(name);
    const decodedInsights = decodeURIComponent(insights);
    
    // モーダルが既に存在する場合は削除
    const existingModal = document.getElementById('insightsModal');
    if (existingModal) {
        existingModal.remove();
    }
    
    // モーダルを作成
    const modal = document.createElement('div');
    modal.id = 'insightsModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
        <div class="modal-content-large" onclick="event.stopPropagation()">
            <div class="modal-header-large">
                <h2>💡 ${decodedName}さんと話すことで得られる知見</h2>
                <button class="modal-close-btn" onclick="closeInsightsModal()">&times;</button>
            </div>
            <div class="modal-body-large">
                <div class="insights-section">
                    ${decodedInsights.split('｜').map(item => `<p>${item}</p>`).join('')}
                </div>
            </div>
        </div>
    `;
    
    document.body.appendChild(modal);
    
    // モーダルを表示
    setTimeout(() => {
        modal.classList.add('show');
    }, 10);
    
    // 背景クリックで閉じる
    modal.addEventListener('click', function() {
        closeInsightsModal();
    });
};

window.closeInsightsModal = function() {
    const modal = document.getElementById('insightsModal');
    if (modal) {
        modal.classList.remove('show');
        setTimeout(() => {
            modal.remove();
        }, 300);
    }
};

/* ==========================================
   フィルター機能
   ========================================== */
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const hpCards = document.querySelectorAll('.hp-card, .hp-card-v2');
    
    // 現在のフィルター状態
    const activeFilters = {
        role: 'all',
        level: 'all',
        contact: 'all'
    };
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            const filterGroup = this.closest('.filter-buttons');
            const filterType = filterGroup.dataset.filter;
            const filterValue = this.dataset.value;
            
            // ボタンのアクティブ状態を更新
            filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // フィルター状態を更新
            activeFilters[filterType] = filterValue;
            
            // カードをフィルタリング
            filterCards(hpCards, activeFilters);
        });
    });
}

function filterCards(cards, filters) {
    let visibleCount = 0;
    
    cards.forEach(card => {
        const cardRole = card.dataset.role;
        const cardLevel = card.dataset.level;
        const cardContact = card.dataset.contact;
        
        const matchRole = filters.role === 'all' || filters.role === cardRole;
        const matchLevel = filters.level === 'all' || filters.level === cardLevel;
        const matchContact = filters.contact === 'all' || filters.contact === cardContact;
        
        if (matchRole && matchLevel && matchContact) {
            card.classList.remove('hidden');
            visibleCount++;
            // アニメーション付きで表示
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            setTimeout(() => {
                card.style.transition = 'opacity 0.3s ease, transform 0.3s ease';
                card.style.opacity = '1';
                card.style.transform = 'translateY(0)';
            }, 50);
        } else {
            card.classList.add('hidden');
        }
    });
    
    // フィルター結果が0件の場合のメッセージ
    const hpGrid = document.querySelector('.hp-grid');
    let noResultsMsg = hpGrid.querySelector('.no-results');
    
    if (visibleCount === 0) {
        if (!noResultsMsg) {
            const msg = document.createElement('div');
            msg.className = 'no-results';
            msg.innerHTML = '<p>条件に合うハイパフォーマーが見つかりません。フィルターを変更してください。</p>';
            msg.style.cssText = 'text-align: center; padding: 40px; color: #a0a0a0; grid-column: 1 / -1;';
            hpGrid.appendChild(msg);
        }
    } else {
        if (noResultsMsg) {
            noResultsMsg.remove();
        }
    }
}

/* ==========================================
   スムーススクロール
   ========================================== */
function initSmoothScroll() {
    const links = document.querySelectorAll('a[href^="#"]');
    
    links.forEach(link => {
        link.addEventListener('click', function(e) {
            const href = this.getAttribute('href');
            
            if (href === '#') return;
            
            e.preventDefault();
            
            const target = document.querySelector(href);
            
            if (target) {
                const headerOffset = 80;
                const elementPosition = target.getBoundingClientRect().top;
                const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
                
                window.scrollTo({
                    top: offsetPosition,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/* ==========================================
   スクロールアニメーション
   ========================================== */
function initScrollAnimations() {
    const observerOptions = {
        root: null,
        rootMargin: '0px',
        threshold: 0.1
    };
    
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('animate-in');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);
    
    const animateElements = document.querySelectorAll(
        '.step-card, .level-card, .hp-card'
    );
    
    animateElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `opacity 0.5s ease ${index * 0.05}s, transform 0.5s ease ${index * 0.05}s`;
        observer.observe(el);
    });
}

// アニメーションクラスのスタイル
document.head.insertAdjacentHTML('beforeend', `
    <style>
        .animate-in {
            opacity: 1 !important;
            transform: translateY(0) !important;
        }
    </style>
`);

/* ==========================================
   ナビゲーションのスクロール効果
   ========================================== */
window.addEventListener('scroll', function() {
    const navbar = document.querySelector('.navbar');
    
    if (window.scrollY > 50) {
        navbar.style.background = 'rgba(2, 46, 73, 0.98)';
    } else {
        navbar.style.background = 'rgba(2, 46, 73, 0.95)';
    }
});
