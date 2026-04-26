// reviews.js — Supabase + режим разработчика (Ctrl+Z+I)
// ========== НАСТРОЙКИ SUPABASE (заполняются через GitHub Secrets) ==========
window.SUPABASE_URL = 'https://ewmfkxcdguaopinwqrvp.supabase.co';
window.SUPABASE_ANON_KEY = 'sb_publishable_Tyn0nXY3Qw2iKgVk8FnVKw_MdsNCDL3';

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

    const { error } = await supabaseClient
        .from('reviews')
        .select('count', { count: 'exact', head: true });

    if (error) {
        console.error('Ошибка подключения к Supabase:', error);
        return false;
    }

    console.log('✅ Supabase подключён');
    return true;
}

// ========== API РАБОТЫ С ОТЗЫВАМИ ==========
window.ReviewsAPI = {
    usingSupabase: false,

    async init() {
        const ok = await initSupabase();
        this.usingSupabase = ok && supabaseClient !== null;
        return this.usingSupabase;
    },

    async getUserIP() {
        try {
            const res = await fetch('https://api.ipify.org?format=json');
            const data = await res.json();
            return data.ip;
        } catch {
            return 'unknown';
        }
    },

    async fetchReviews() {
        if (this.usingSupabase && supabaseClient) {
            const { data, error } = await supabaseClient
                .from('reviews')
                .select('*')
                .eq('is_deleted', false)
                .order('created_at', { ascending: false });

            if (!error && data) return data;
        }

        // fallback localStorage
        const local = localStorage.getItem('site_reviews');
        return local ? JSON.parse(local) : [];
    },

    async addReview(username, rating, comment, userIP = null) {
        if (!userIP) userIP = await this.getUserIP();

        if (this.usingSupabase && supabaseClient) {
            const { data, error } = await supabaseClient
                .from('reviews')
                .insert([{
                    username: username.trim(),
                    rating,
                    comment: comment?.trim() || null,
                    user_ip: userIP,
                    is_deleted: false
                }])
                .select();

            if (!error && data) return { success: true, data: data[0] };
            return { success: false, error: error?.message };
        }

        // localStorage fallback
        const reviews = JSON.parse(localStorage.getItem('site_reviews') || '[]');
        const newReview = {
            id: Date.now(),
            username: username.trim(),
            rating,
            comment: comment?.trim() || '',
            created_at: new Date().toISOString(),
            user_ip: userIP,
            is_deleted: false
        };
        reviews.unshift(newReview);
        localStorage.setItem('site_reviews', JSON.stringify(reviews));
        return { success: true, data: newReview };
    },

    async deleteReview(reviewId, currentUserIP = null, forceDev = false) {
        if (!currentUserIP) currentUserIP = await this.getUserIP();

        if (this.usingSupabase && supabaseClient) {
            if (forceDev) {
                const { error } = await supabaseClient
                    .from('reviews')
                    .update({ is_deleted: true })
                    .eq('id', reviewId);
                if (error) return { success: false, error: error.message };
                return { success: true };
            }

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

        // localStorage fallback
        let reviews = JSON.parse(localStorage.getItem('site_reviews') || '[]');
        const idx = reviews.findIndex(r => r.id == reviewId);
        if (idx === -1) return { success: false, error: 'Отзыв не найден' };
        if (!forceDev && reviews[idx].user_ip !== currentUserIP) {
            return { success: false, error: 'Можно удалять только свои отзывы' };
        }
        reviews.splice(idx, 1);
        localStorage.setItem('site_reviews', JSON.stringify(reviews));
        return { success: true };
    }
};

// ========== РЕЖИМ РАЗРАБОТЧИКА ==========
function showDevNotification(msg, isErr = false) {
    const div = document.createElement('div');
    div.textContent = msg;
    div.style.cssText = `
        position: fixed; top: 20px; left: 50%; transform: translateX(-50%);
        background: ${isErr ? '#dc2626' : '#10b981'}; color: white;
        padding: 12px 24px; border-radius: 50px; font-weight: 600;
        z-index: 10000; font-size: 16px; box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        animation: fadeInDown 0.3s ease;
    `;
    document.body.appendChild(div);
    setTimeout(() => div.remove(), 2500);
}

let pressed = {};
document.addEventListener('keydown', (e) => {
    pressed[e.key.toLowerCase()] = true;
    if (e.ctrlKey && pressed['z'] && pressed['i']) {
        e.preventDefault();
        devMode = !devMode;
        showDevNotification(devMode ? '🔧 Режим разработчика ВКЛЮЧЁН' : '🔒 Режим разработчика ВЫКЛЮЧЕН');
        if (typeof loadReviews === 'function') loadReviews();
        pressed = {};
    }
});
document.addEventListener('keyup', (e) => delete pressed[e.key.toLowerCase()]);

// ========== ОТРИСОВКА ==========
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, (m) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[m]));
}

function formatDate(d) {
    return new Date(d).toLocaleDateString('ru-RU');
}

async function loadReviews() {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    container.innerHTML = '<div class="reviews-loading">Загрузка отзывов...</div>';

    const reviews = await window.ReviewsAPI.fetchReviews();
    const currentIP = await window.ReviewsAPI.getUserIP();

    if (!reviews.length) {
        container.innerHTML = '<div class="reviews-loading">Пока нет отзывов. Будьте первым!</div>';
        return;
    }

    container.innerHTML = reviews.map(r => {
        const stars = '★'.repeat(r.rating) + '☆'.repeat(5 - r.rating);
        const canDelete = devMode || (r.user_ip === currentIP);
        return `
            <div class="review-card" data-id="${r.id}">
                <div class="review-header">
                    <span class="review-name">${escapeHtml(r.username)}</span>
                    <div style="display: flex; align-items: center; gap: 12px; flex-wrap: wrap;">
                        <span class="review-stars">${stars}</span>
                        <span class="review-date">${formatDate(r.created_at)}</span>
                        ${canDelete ? `
                        <div class="review-menu" style="position: relative;">
                            <button class="review-menu-btn" style="background:none;border:none;font-size:20px;cursor:pointer;">⋯</button>
                            <div class="review-menu-dropdown" style="display:none;position:absolute;right:0;top:25px;background:white;border-radius:12px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10;">
                                <button class="review-menu-delete" data-id="${r.id}" style="background:#fff5f5;border:none;padding:8px 16px;color:#dc2626;cursor:pointer;font-weight:600;">🗑️ Удалить</button>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ${r.comment ? `<div class="review-comment">${escapeHtml(r.comment)}</div>` : ''}
            </div>
        `;
    }).join('');

    document.querySelectorAll('.review-menu-btn').forEach(btn => {
        btn.onclick = (e) => {
            e.stopPropagation();
            const dd = btn.nextElementSibling;
            document.querySelectorAll('.review-menu-dropdown').forEach(d => { if (d !== dd) d.style.display = 'none'; });
            dd.style.display = dd.style.display === 'none' ? 'block' : 'none';
        };
    });

    document.querySelectorAll('.review-menu-delete').forEach(btn => {
        btn.onclick = async (e) => {
            e.stopPropagation();
            const id = parseInt(btn.dataset.id);
            if (!confirm(devMode ? '⚠️ Режим разработчика\nУдалить отзыв?' : 'Удалить свой отзыв?')) return;
            btn.closest('.review-menu-dropdown').style.display = 'none';
            const ip = await window.ReviewsAPI.getUserIP();
            const res = await window.ReviewsAPI.deleteReview(id, ip, devMode);
            showDevNotification(res.success ? '✅ Отзыв удалён' : `❌ ${res.error}`, !res.success);
            if (res.success) loadReviews();
        };
    });
}

document.addEventListener('click', () => {
    document.querySelectorAll('.review-menu-dropdown').forEach(d => d.style.display = 'none');
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

    const updateStars = (rating) => {
        stars.forEach((s, i) => {
            s.textContent = i < rating ? '★' : '☆';
        });
    };

    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.value);
            updateStars(selectedRating);
            ratingError?.classList.remove('show');
        });
        star.addEventListener('mouseenter', () => {
            const val = parseInt(star.dataset.value);
            stars.forEach((s, i) => s.textContent = i < val ? '★' : '☆');
        });
        star.addEventListener('mouseleave', () => updateStars(selectedRating));
    });
    updateStars(0);

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let ok = true;
        const name = nameInput.value.trim();
        if (!name) {
            nameError.classList.add('show');
            nameInput.classList.add('error');
            ok = false;
        } else {
            nameError.classList.remove('show');
            nameInput.classList.remove('error');
        }
        if (selectedRating === 0) {
            ratingError.classList.add('show');
            ok = false;
        } else {
            ratingError.classList.remove('show');
        }
        if (!ok) return;

        const res = await window.ReviewsAPI.addReview(name, selectedRating, document.getElementById('reviewComment').value);
        if (res.success) {
            form.reset();
            selectedRating = 0;
            updateStars(0);
            showDevNotification('Спасибо за отзыв!');
            loadReviews();
        } else {
            showDevNotification(`Ошибка: ${res.error}`, true);
        }
    });
}

// ========== СТАРТ ==========
document.addEventListener('DOMContentLoaded', async () => {
    await window.ReviewsAPI.init();
    setupReviewForm();
    loadReviews();
});
