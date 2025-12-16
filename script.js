/* ==========================================
   Wivid HP Tool - JavaScript
   ========================================== */

document.addEventListener('DOMContentLoaded', function() {
    // フィルター機能
    initFilters();
    
    // スムーススクロール
    initSmoothScroll();
    
    // スクロールアニメーション
    initScrollAnimations();
});

/* ==========================================
   詳細表示トグル
   ========================================== */
function toggleDetails(button) {
    const card = button.closest('.hp-card');
    const requirements = card.querySelector('.card-requirements');
    
    if (requirements.classList.contains('show')) {
        requirements.classList.remove('show');
        button.textContent = '詳細を見る';
    } else {
        requirements.classList.add('show');
        button.textContent = '閉じる';
    }
}

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
    const noResultsMsg = document.querySelector('.no-results');
    if (visibleCount === 0) {
        if (!noResultsMsg) {
            const grid = document.querySelector('.hp-grid');
            const msg = document.createElement('div');
            msg.className = 'no-results';
            msg.innerHTML = '<p>条件に合うハイパフォーマーが見つかりません。フィルターを変更してください。</p>';
            msg.style.cssText = 'text-align: center; padding: 40px; color: #a0a0a0; grid-column: 1 / -1;';
            grid.appendChild(msg);
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
