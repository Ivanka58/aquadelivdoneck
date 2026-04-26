// reviews.js — полная версия с Supabase, режимом разработчика, удалением отзывов

// ========== НАСТРОЙКИ SUPABASE (заполняются через GitHub Secrets) ==========
window.SUPABASE_URL = '';
window.SUPABASE_ANON_KEY = '';

// ========== ГЛОБАЛЬНЫЕ ПЕРЕМЕННЫЕ ==========
let devMode = false;
let supabaseClient = null;

// ========== ИНИЦИАЛИЗАЦИЯ SUPABASE ==========
async function initSupabase() {
    if (!window.SUPABASE_URL || !window.SUPABASE_ANON_KEY) {
        console.warn('Supabase не настроен. Используется localStorage.');
        return false;
    }
    
    if (typeof window.supabase === 'undefined') {
        console.error('Supabase SDK не загружен');
        return false;
    }
    
    supabaseClient = window.supabase.createClient(
        window.SUPABASE_URL,
        window.SUPABASE_ANON_KEY
    );
    
    // Проверяем соединение
    const { error } = await supabaseClient.from('reviews').select('count', { count: 'exact', head: true });
    if (error) {
        console.error('Ошибка подключения к Supabase:', error);
        return false;
    }
    
    console.log('Supabase подключён');
    return true;
}

// ========== API ДЛЯ РАБОТЫ С ОТЗЫВАМИ ==========
window.ReviewsAPI = {
    usingSupabase: false,
    
    async init() {
        const supabaseOk = await initSupabase();
        if (supabaseOk && supabaseClient) {
            this.usingSupabase = true;
        }
        return this.usingSupabase;
    },
    
    // Получение IP пользователя (для удаления своих отзывов в режиме без разработчика)
    async getUserIP() {
        try {
            const response = await fetch('https://api.ipify.org?format=json');
            const data = await response.json();
            return data.ip;
        } catch (e) {
            return 'unknown';
        }
    },
    
    // Загрузка отзывов
    async fetchReviews() {
        if (this.usingSupabase && supabaseClient) {
            const { data, error } = await supabaseClient
                .from('reviews')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });
            
            if (error) {
                console.error('Ошибка Supabase:', error);
                return this.fetchReviewsLocal();
            }
            return data;
        } else {
            return this.fetchReviewsLocal();
        }
    },
    
    fetchReviewsLocal() {
        const stored = localStorage.getItem('site_reviews');
        if (stored) {
            return JSON.parse(stored);
        }
        return [];
    },
    
    saveReviewsLocal(reviews) {
        localStorage.setItem('site_reviews', JSON.stringify(reviews));
    },
    
    // Добавление отзыва
    async addReview(username, rating, comment, userIP = null) {
        if (!userIP) userIP = await this.getUserIP();
        
        if (this.usingSupabase && supabaseClient) {
            const { data, error } = await supabaseClient
                .from('reviews')
                .insert([{
                    username: username.trim(),
                    rating: rating,
                    comment: comment?.trim() || null,
                    user_ip: userIP,
                    is_deleted: false
                }])
                .select();
            
            if (error) return { success: false, error: error.message };
            return { success: true, data: data[0] };
        } else {
            const reviews = this.fetchReviewsLocal();
            const newReview = {
                id: Date.now(),
                username: username.trim(),
                rating: rating,
                comment: comment?.trim() || '',
                created_at: new Date().toISOString(),
                user_ip: userIP,
                is_deleted: false
            };
            reviews.unshift(newReview);
            this.saveReviewsLocal(reviews);
            return { success: true, data: newReview };
        }
    },
    
    // Удаление отзыва
    async deleteReview(reviewId, currentUserIP = null, forceDev = false) {
        if (!currentUserIP) currentUserIP = await this.getUserIP();
        
        if (this.usingSupabase && supabaseClient) {
            // Проверяем права (в режиме разработчика — можно удалять любые)
            if (forceDev) {
                // Принудительное удаление (режим разработчика)
                const { error } = await supabaseClient
                    .from('reviews')
                    .update({ is_deleted: true })
                    .eq('id', reviewId);
                
                if (error) return { success: false, error: error.message };
                return { success: true };
            } else {
                // Обычное удаление — только свои
                const { data: review, error: fetchError } = await supabaseClient
                    .from('reviews')
                    .select('user_ip')
                    .eq('id', reviewId)
                    .single();
                
                if (fetchError || !review) return { success: false, error: 'Отзыв не найден' };
                if (review.user_ip !== currentUserIP) return { success: false, error: 'Можно удалять только свои отзывы' };
                
                const { error } = await supabaseClient
                    .from('reviews')
                    .update({ is_deleted: true })
                    .eq('id', reviewId);
                
                if (error) return { success: false, error: error.message };
                return { success: true };
            }
        } else {
            // LocalStorage режим
            let reviews = this.fetchReviewsLocal();
            const reviewExists = reviews.find(r => r.id == reviewId);
            if (!reviewExists) return { success: false, error: 'Отзыв не найден' };
            
            if (!forceDev && reviewExists.user_ip !== currentUserIP) {
                return { success: false, error: 'Можно удалять только свои отзывы' };
            }
            
            reviews = reviews.filter(r => r.id != reviewId);
            this.saveReviewsLocal(reviews);
            return { success: true };
        }
    }
};

// ========== РЕЖИМ РАЗРАБОТЧИКА (Ctrl + Z + I) ==========
function showDevNotification(message, isError = false) {
    const notif = document.createElement('div');
    notif.textContent = message;
    notif.style.cssText = `
        position: fixed;
        top: 20px;
        left: 50%;
        transform: translateX(-50%);
        background: ${isError ? '#dc2626' : '#10b981'};
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        font-weight: 600;
        z-index: 10000;
        font-size: 16px;
        box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: fadeInDown 0.3s ease;
    `;
    document.body.appendChild(notif);
    setTimeout(() => {
        notif.style.opacity = '0';
        setTimeout(() => notif.remove(), 300);
    }, 2500);
}

let keysPressed = {};

document.addEventListener('keydown', (e) => {
    keysPressed[e.key.toLowerCase()] = true;
    
    if (e.ctrlKey && keysPressed['z'] && keysPressed['i']) {
        e.preventDefault();
        devMode = !devMode;
        
        if (devMode) {
            showDevNotification('🔧 Режим разработчика АКТИВИРОВАН. Три точки — удалить любой отзыв.');
        } else {
            showDevNotification('🔒 Режим разработчика ВЫКЛЮЧЕН.');
        }
        
        if (typeof loadReviews === 'function') {
            loadReviews();
        }
        
        keysPressed = {};
    }
});

document.addEventListener('keyup', (e) => {
    delete keysPressed[e.key.toLowerCase()];
});

// ========== ВСПОМОГАТЕЛЬНЫЕ ФУНКЦИИ ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

function formatDate(dateString) {
    const date = new Date(dateString);
    return date.toLocaleDateString('ru-RU');
}

// ========== ОТРИСОВКА ОТЗЫВОВ ==========
async function loadReviews() {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    container.innerHTML = '<div class="reviews-loading">Загрузка отзывов...</div>';
    
    const reviews = await window.ReviewsAPI.fetchReviews();
    const currentUserIP = await window.ReviewsAPI.getUserIP();
    
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<div class="reviews-loading">Пока нет отзывов. Будьте первым!</div>';
        return;
    }
    
    container.innerHTML = reviews.map(review => {
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const date = formatDate(review.created_at);
        
        // В режиме разработчика — удаление доступно всем
        // В обычном режиме — только свои
        const canDelete = devMode || (review.user_ip === currentUserIP);
        
        return `
            <div class="review-card" data-id="${review.id}">
                <div class="review-header">
                    <span class="review-name">${escapeHtml(review.username)}</span>
                    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                        <span class="review-stars">${stars}</span>
                        <span class="review-date">${date}</span>
                        ${canDelete ? `
                        <div class="review-menu" style="position: relative;">
                            <button class="review-menu-btn" style="background: none; border: none; font-size: 20px; cursor: pointer; padding: 0 8px;">⋯</button>
                            <div class="review-menu-dropdown" style="display: none; position: absolute; right: 0; top: 25px; background: white; border-radius: 12px; box-shadow: 0 4px 12px rgba(0,0,0,0.15); z-index: 10; overflow: hidden;">
                                <button class="review-menu-delete" data-id="${review.id}" style="background: #fff5f5; border: none; padding: 8px 16px; color: #dc2626; cursor: pointer; font-weight: 600; width: 100%;">🗑️ Удалить</button>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ${review.comment ? `<div class="review-comment">${escapeHtml(review.comment)}</div>` : ''}
            </div>
        `;
    }).join('');
    
    // Вешаем обработчики на кнопки меню
    attachMenuHandlers();
}

// Обработчики для меню "три точки"
function attachMenuHandlers() {
    document.querySelectorAll('.review-menu-btn').forEach(btn => {
        btn.removeEventListener('click', toggleMenu);
        btn.addEventListener('click', toggleMenu);
    });
    
    document.querySelectorAll('.review-menu-delete').forEach(btn => {
        btn.removeEventListener('click', handleDelete);
        btn.addEventListener('click', handleDelete);
    });
}

function toggleMenu(e) {
    e.stopPropagation();
    const dropdown = this.nextElementSibling;
    document.querySelectorAll('.review-menu-dropdown').forEach(d => {
        if (d !== dropdown) d.style.display = 'none';
    });
    dropdown.style.display = dropdown.style.display === 'none' ? 'block' : 'none';
}

async function handleDelete(e) {
    e.stopPropagation();
    const id = parseInt(this.dataset.id);
    const message = devMode ? '⚠️ РЕЖИМ РАЗРАБОТЧИКА\nУдалить этот отзыв?' : 'Удалить свой отзыв?';
    if (!confirm(message)) return;
    
    this.closest('.review-menu-dropdown').style.display = 'none';
    
    const currentUserIP = await window.ReviewsAPI.getUserIP();
    const result = await window.ReviewsAPI.deleteReview(id, currentUserIP, devMode);
    
    if (result.success) {
        showDevNotification(result.success, false);
        await loadReviews();
    } else {
        showDevNotification('❌ Ошибка: ' + (result.error || 'неизвестная'), true);
    }
}

document.addEventListener('click', () => {
    document.querySelectorAll('.review-menu-dropdown').forEach(d => {
        d.style.display = 'none';
    });
});

// ========== ФОРМА ОТЗЫВА ==========
function setupReviewForm() {
    const form = document.getElementById('reviewForm');
    if (!form) return;
    
    let selectedRating = 0;
    const stars = document.querySelectorAll('.star-rating span');
    const ratingError = document.getElementById('ratingError');
    const nameInput = document.getElementById('reviewName');
    const nameError = document.getElementById('nameError');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.value);
            updateStars(selectedRating);
            if (ratingError) ratingError.classList.remove('show');
        });
        
        star.addEventListener('mouseenter', () => {
            const val = parseInt(star.dataset.value);
            stars.forEach((s, i) => {
                s.textContent = i < val ? '★' : '☆';
            });
        });
        
        star.addEventListener('mouseleave', () => {
            updateStars(selectedRating);
        });
    });
    
    function updateStars(rating) {
        stars.forEach((star, idx) => {
            star.textContent = idx < rating ? '★' : '☆';
        });
    }
    
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;
        
        const name = nameInput.value.trim();
        if (!name) {
            nameError.classList.add('show');
            nameInput.classList.add('error');
            isValid = false;
        } else {
            nameError.classList.remove('show');
            nameInput.classList.remove('error');
        }
        
        if (selectedRating === 0) {
            ratingError.classList.add('show');
            isValid = false;
        } else {
            ratingError.classList.remove('show');
        }
        
        if (!isValid) return;
        
        const comment = document.getElementById('reviewComment').value;
        const result = await window.ReviewsAPI.addReview(name, selectedRating, comment);
        
        if (result.success) {
            form.reset();
            selectedRating = 0;
            updateStars(0);
            showDevNotification('✅ Спасибо за отзыв!', false);
            await loadReviews();
        } else {
            showDevNotification('❌ Ошибка: ' + result.error, true);
        }
    });
}

// ========== ЗАПУСК ПРИ ЗАГРУЗКЕ ==========
document.addEventListener('DOMContentLoaded', async () => {
    await window.ReviewsAPI.init();
    setupReviewForm();
    await loadReviews();
});
