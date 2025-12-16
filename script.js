/* ==========================================
   Wivid LP - JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', function() {
    // フィルター機能
    initFilters();
    
    // FAQアコーディオン
    initFAQ();
    
    // フォーム送信
    initForm();
    
    // スムーススクロール
    initSmoothScroll();
    
    // スクロールアニメーション
    initScrollAnimations();
});

/* ==========================================
   フィルター機能
   ========================================== */
function initFilters() {
    const filterButtons = document.querySelectorAll('.filter-btn');
    const talentCards = document.querySelectorAll('.talent-card');
    
    // 現在のフィルター状態
    const activeFilters = {
        star: 'all',
        univ: 'all',
        major: 'all'
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
            filterCards(talentCards, activeFilters);
        });
    });
}

function filterCards(cards, filters) {
    cards.forEach(card => {
        const cardStar = card.dataset.star;
        const cardUniv = card.dataset.univ;
        const cardMajor = card.dataset.major;
        
        const matchStar = filters.star === 'all' || filters.star === cardStar;
        const matchUniv = filters.univ === 'all' || filters.univ === cardUniv;
        const matchMajor = filters.major === 'all' || filters.major === cardMajor;
        
        if (matchStar && matchUniv && matchMajor) {
            card.classList.remove('hidden');
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
    
    // フィルター結果が0件の場合のメッセージ（必要に応じて追加）
    const visibleCards = document.querySelectorAll('.talent-card:not(.hidden)');
    if (visibleCards.length === 0) {
        console.log('該当する人材がいません');
    }
}

/* ==========================================
   FAQアコーディオン
   ========================================== */
function initFAQ() {
    const faqItems = document.querySelectorAll('.faq-item');
    
    faqItems.forEach(item => {
        const question = item.querySelector('.faq-question');
        
        question.addEventListener('click', function() {
            // 他のFAQを閉じる
            faqItems.forEach(otherItem => {
                if (otherItem !== item) {
                    otherItem.classList.remove('active');
                }
            });
            
            // クリックしたFAQを開閉
            item.classList.toggle('active');
        });
    });
}

/* ==========================================
   フォーム送信
   ========================================== */
function initForm() {
    const form = document.getElementById('contactForm');
    
    if (form) {
        form.addEventListener('submit', function(e) {
            e.preventDefault();
            
            // フォームデータを取得
            const formData = new FormData(form);
            const data = Object.fromEntries(formData);
            
            // バリデーション
            if (!data.company || !data.name || !data.email) {
                alert('必須項目を入力してください');
                return;
            }
            
            // 送信処理（実際の実装では、ここでAPIに送信）
            console.log('送信データ:', data);
            
            // 送信完了メッセージ
            alert('お問い合わせありがとうございます。\n担当者より2営業日以内にご連絡いたします。');
            
            // フォームをリセット
            form.reset();
        });
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
    // Intersection Observerを使用したスクロールアニメーション
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
    
    // アニメーション対象の要素
    const animateElements = document.querySelectorAll(
        '.star-card, .talent-card, .testimonial-card, .comparison-table, .faq-item'
    );
    
    animateElements.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(30px)';
        el.style.transition = 'opacity 0.6s ease, transform 0.6s ease';
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
    
    if (window.scrollY > 100) {
        navbar.style.background = 'rgba(10, 10, 15, 0.95)';
    } else {
        navbar.style.background = 'rgba(10, 10, 15, 0.9)';
    }
});

/* ==========================================
   詳細ボタンのクリック処理
   ========================================== */
document.addEventListener('click', function(e) {
    if (e.target.classList.contains('detail-btn')) {
        // 実際の実装では、モーダルを開くか詳細ページに遷移
        alert('詳細情報は無料相談時にご確認いただけます。\n下部のフォームよりお問い合わせください。');
    }
});

