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
    card.className = 'hp-card';
    
    // data-属性を設定
    const roleMap = {
        '経営層': 'executive',
        '人事責任者': 'hr'
    };
    const contactMap = {
        '個別面談': 'individual',
        '座談会': 'group',
        'イベント': 'group'
    };
    
    card.dataset.role = roleMap[data.position_level] || 'executive';
    card.dataset.level = data.introduction_level || 'C';
    card.dataset.contact = contactMap[data.contact_format] || 'individual';
    
    // カードヘッダーのクラス
    const headerClass = data.position_level === '経営層' ? 'executive' : 'hr';
    
    // HP氏名を構築
    let hpNamesHTML = '';
    if (data.hp_name_1) {
        hpNamesHTML += `<h3>${data.hp_name_1}${data.hp_role_1 ? 'さん（' + data.hp_role_1 + '）' : 'さん'}</h3>`;
    }
    if (data.hp_name_2) {
        hpNamesHTML += `<h3>${data.hp_name_2}${data.hp_role_2 ? 'さん（' + data.hp_role_2 + '）' : 'さん'}</h3>`;
    }
    if (!hpNamesHTML) {
        hpNamesHTML = '<h3>担当者</h3>';
    }
    
    // 役職バッジ
    let roleBadge = data.position_detail || data.position_level || '—';
    
    // 接触形式アイコン
    const contactIcon = data.contact_format === '個別面談' ? '📍' : '👥';
    
    // 紹介レベルのクラス
    const levelClass = `level-${(data.introduction_level || 'c').toLowerCase().replace('-', '-minus').replace('+', '-plus')}`;
    
    card.innerHTML = `
        <div class="card-header ${headerClass}">
            <div class="company-info">
                <span class="company-name">${data.company_name || '企業名不明'}</span>
                <span class="company-size">${data.company_size || '規模不明'}</span>
            </div>
            <div class="role-badge">${roleBadge}</div>
        </div>
        <div class="card-body">
            <div class="hp-names">
                ${hpNamesHTML}
            </div>
            ${data.background ? `
            <div class="hp-profile">
                <p class="profile-item"><strong>経歴：</strong>${data.background}</p>
                ${data.age_range ? `<p class="profile-item"><strong>年齢層：</strong>${data.age_range}</p>` : ''}
            </div>
            ` : ''}
            ${data.achievements ? `
            <div class="hp-features">
                <p class="profile-item"><strong>成果・特徴：</strong>${data.achievements}</p>
            </div>
            ` : ''}
            <div class="contact-info">
                <span class="contact-type">${contactIcon} ${data.contact_format || '—'}${data.contact_format_detail ? ' (' + data.contact_format_detail + ')' : ''}</span>
                <span class="sales-person">担当：${data.sales_contact || '—'}</span>
            </div>
            ${data.insights ? `
            <div class="special-note">
                <p>⭐ ${data.insights}</p>
            </div>
            ` : ''}
        </div>
        <div class="card-requirements">
            <h4>紹介可能条件</h4>
            <div class="req-grid">
                ${data.education_requirement ? `
                <div class="req-item">
                    <span class="req-label">学歴</span>
                    <span class="req-value">${data.education_requirement}</span>
                </div>
                ` : ''}
                <div class="req-item">
                    <span class="req-label">レベル</span>
                    <span class="level-tag ${levelClass}">${data.introduction_level || '—'}</span>
                </div>
                ${data.experience_requirement ? `
                <div class="req-item">
                    <span class="req-label">経験</span>
                    <span class="req-value">${data.experience_requirement}</span>
                </div>
                ` : ''}
                ${data.student_mindset ? `
                <div class="req-item">
                    <span class="req-label">志向性</span>
                    <span class="req-value">${data.student_mindset}</span>
                </div>
                ` : ''}
                ${data.introduction_flow ? `
                <div class="req-item">
                    <span class="req-label">紹介フロー</span>
                    <span class="req-value">${data.introduction_flow}</span>
                </div>
                ` : ''}
            </div>
        </div>
        <div class="card-footer">
            <button class="detail-btn" onclick="toggleDetails(this)">詳細を見る</button>
        </div>
    `;
    
    return card;
}

/* ==========================================
   詳細表示トグル
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
   フィルター機能
   ========================================== */
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const hpCards = document.querySelectorAll('.hp-card');
    
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
