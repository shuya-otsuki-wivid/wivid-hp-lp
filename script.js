/* ==========================================
   Wivid HP Tool - JavaScript
   ========================================== */

import { initializeApp } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-app.js';
import { getFirestore, collection, getDocs, query, where } from 'https://www.gstatic.com/firebasejs/10.7.1/firebase-firestore.js';
import { isAdmin } from './admin-check.js';

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
window.hpInsightsData = []; // 詳細表示用のデータ保存（グローバル公開）

/* ==========================================
   管理者チェックして管理者専用リンクを追加
   ========================================== */
async function checkAndAddAdminLinks() {
    try {
        const adminStatus = await isAdmin();
        
        if (adminStatus) {
            console.log('✅ 管理者です。管理者専用リンクを追加します。');
            
            // ナビゲーションリンクの親要素を取得
            const navLinks = document.getElementById('navLinks');
            const logoutBtn = document.getElementById('signOutBtn');
            
            if (navLinks && logoutBtn) {
                // ログアウトボタンの前に管理者専用リンクを挿入
                const adminLinks = [
                    { href: 'admin.html', text: '管理画面' },
                    { href: 'import.html', text: 'CSV一括インポート' },
                    { href: 'login-history.html', text: 'ログイン履歴' },
                    { href: 'admin-management.html', text: '管理者管理' },
                    { href: 'prototype.html', text: '新デザイン確認', style: 'color: #FFF100;' }
                ];
                
                adminLinks.forEach(link => {
                    const li = document.createElement('li');
                    const a = document.createElement('a');
                    a.href = link.href;
                    a.textContent = link.text;
                    if (link.style) {
                        a.setAttribute('style', link.style);
                    }
                    li.appendChild(a);
                    logoutBtn.parentElement.parentElement.insertBefore(li, logoutBtn.parentElement);
                });
            }
        } else {
            console.log('ℹ️ 一般ユーザーです。管理者専用リンクは表示しません。');
        }
    } catch (error) {
        console.error('❌ 管理者チェックエラー:', error);
    }
}

document.addEventListener('DOMContentLoaded', async function() {
    // 管理者チェックして管理者専用リンクを追加
    await checkAndAddAdminLinks();
    
    // Firestoreからデータを読み込み
    loadHighPerformers();
    
    // スムーススクロール
    initSmoothScroll();
    
    // モーダルのイベントリスナー設定
    const modal = document.getElementById('insightsModal');
    const closeBtn = document.getElementById('modalCloseBtn');
    
    if (modal) {
        // 背景クリックで閉じる
        modal.addEventListener('click', function(e) {
            if (e.target === modal) {
                window.closeInsightsModal();
            }
        });
    }
    
    if (closeBtn) {
        closeBtn.addEventListener('click', function() {
            window.closeInsightsModal();
        });
    }
    
    // ESCキーでモーダルを閉じる
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            window.closeInsightsModal();
        }
    });
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
    console.log('🔍 createHPCard called:', {
        name: data.name,
        roleLevel: data.roleLevel,
        introductionLevel: data.introductionLevel,
        contactType: data.contactType,
        hasInsights: !!data.insights,
        insightsLength: data.insights ? data.insights.length : 0
    });
    
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
            
            ${data.introductionConditions ? `
            <div class="section-v2 cd-only">
                <div class="section-title-v2">📊 紹介可能条件（CD向け）</div>
                <div class="section-content-v2 intro-conditions-box">
                    <strong>紹介レベル：</strong><span class="level-tag ${levelClass}">${data.introductionLevel || '—'}</span><br><br>
                    ${data.introductionConditions.split('｜').map(item => item.trim()).join('<br>')}
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
            ${data.insights ? (() => {
                // データをグローバル配列に保存
                const idx = window.hpInsightsData.length;
                window.hpInsightsData.push({ name: data.name, insights: data.insights });
                return `<button class="detail-btn-v2" onclick="window.openHPInsights(${idx})">詳細を見る</button>`;
            })() : ''}
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
window.openHPInsights = function(idx) {
    console.log('🔍 openHPInsights called with idx:', idx);
    
    // グローバル配列からデータを取得
    const data = window.hpInsightsData[idx];
    if (!data) {
        console.error('❌ データが見つかりません:', idx);
        alert('データが見つかりません');
        return;
    }
    
    const displayName = data.name;
    const displayInsights = data.insights;
    console.log('✅ データ取得成功:', { name: displayName, insightsLength: displayInsights.length });
    
    // HTMLエスケープ関数
    const escapeHtml = (str) => {
        const div = document.createElement('div');
        div.textContent = str;
        return div.innerHTML;
    };
    
    // 静的モーダルの内容を更新
    const modal = document.getElementById('insightsModal');
    const modalTitle = document.getElementById('modalTitle');
    const modalContent = document.getElementById('modalInsightsContent');
    
    if (!modal || !modalTitle || !modalContent) {
        console.error('❌ モーダル要素が見つかりません');
        alert('モーダル要素が見つかりません');
        return;
    }
    
    // タイトルと内容を設定
    modalTitle.textContent = `💡 ${displayName}さんと話すことで得られる知見`;
    
    // HTMLタグが含まれているかチェック
    const hasHTML = /<[a-z][\s\S]*>/i.test(displayInsights);
    
    if (hasHTML) {
        // HTMLが含まれている場合はそのまま表示
        modalContent.innerHTML = displayInsights;
    } else {
        // プレーンテキストの場合は【見出し】本文 形式をHTMLに変換
        const sections = displayInsights.split('｜').map(item => {
            const trimmed = item.trim();
            if (!trimmed) return '';
            
            // 【見出し】本文 形式をパース
            const match = trimmed.match(/^【(.+?)】(.*)$/s);
            if (match) {
                const title = match[1];
                const content = match[2].trim();
                // 「。」で区切られた文を箇条書きに
                const sentences = content.split('。').filter(s => s.trim());
                const listItems = sentences.map(s => `<li>${escapeHtml(s.trim())}。</li>`).join('');
                return `
                    <div class="insights-subsection">
                        <h4 class="insights-subtitle">🔹 ${escapeHtml(title)}</h4>
                        <ul class="insights-list">${listItems}</ul>
                    </div>
                `;
            } else {
                // 通常のテキスト
                return `<p>${escapeHtml(trimmed)}</p>`;
            }
        }).join('');
        
        modalContent.innerHTML = sections;
    }
    
    // モーダルを表示（CSSクラスで制御）
    modal.classList.add('show');
    document.body.style.overflow = 'hidden';
    console.log('✅ モーダル表示完了');
};

window.closeInsightsModal = function() {
    const modal = document.getElementById('insightsModal');
    if (modal) {
        modal.classList.remove('show');
        document.body.style.overflow = 'auto';
        console.log('✅ モーダル閉じる');
    }
};

/* ==========================================
   フィルター機能
   ========================================== */
function initFilters() {
    console.log('🎬 initFilters() 実行開始');
    const filterButtons = document.querySelectorAll('.filter-btn');
    console.log('🔘 フィルターボタン数:', filterButtons.length);
    
    // 現在のフィルター状態
    const activeFilters = {
        role: 'all',
        level: 'all',
        contact: 'all'
    };
    
    filterButtons.forEach(button => {
        button.addEventListener('click', function() {
            console.log('🖱️ フィルターボタンがクリックされました:', this.dataset.value);
            
            const filterGroup = this.closest('.filter-buttons');
            const filterType = filterGroup.dataset.filter;
            const filterValue = this.dataset.value;
            
            console.log('📊 フィルタータイプ:', filterType, 'フィルター値:', filterValue);
            
            // ボタンのアクティブ状態を更新
            filterGroup.querySelectorAll('.filter-btn').forEach(btn => {
                btn.classList.remove('active');
            });
            this.classList.add('active');
            
            // フィルター状態を更新
            activeFilters[filterType] = filterValue;
            
            // カードを動的に取得してフィルタリング
            const hpCards = document.querySelectorAll('.hp-card, .hp-card-v2');
            console.log('🎴 カード数:', hpCards.length);
            filterCards(hpCards, activeFilters);
        });
    });
    
    console.log('✅ initFilters() 完了');
}

function filterCards(cards, filters) {
    console.log('🔍 フィルター実行:', filters);
    let visibleCount = 0;
    
    cards.forEach(card => {
        const cardRole = card.dataset.role;
        const cardLevel = card.dataset.level;
        const cardContact = card.dataset.contact;
        
        console.log('カードデータ:', {
            name: card.querySelector('.hp-name')?.textContent || '不明',
            role: cardRole,
            level: cardLevel,
            contact: cardContact
        });
        
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
