// === Анимация печати для слоганов ===
const slogansList = [
    "💪 Доставка воды без боли в спине",
    "🚿 Доставка без лишних хлопот",
    "🏠 Вода в дом — чисто и удобно",
    "⚡ Быстрая доставка, честные цены",
    "💧 Чистая техвода от 100 литров"
];
let sloganIdx = 0;
const sloganElement = document.getElementById('typingSlogan');

function typeSlogan(text, callback) {
    if (!sloganElement) return;
    sloganElement.innerHTML = '';
    let i = 0;
    function typeChar() {
        if (i < text.length) {
            sloganElement.innerHTML += text.charAt(i);
            i++;
            setTimeout(typeChar, 50);
        } else if (callback) callback();
    }
    typeChar();
}

function rotateSlogan() {
    typeSlogan(slogansList[sloganIdx], () => {
        sloganIdx = (sloganIdx + 1) % slogansList.length;
        setTimeout(rotateSlogan, 5000);
    });
}
if (sloganElement) rotateSlogan();

// === Таймер акции (3 дня) ===
let targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 3);
targetDate.setHours(23, 59, 59);

function updateCountdown() {
    const diff = targetDate - new Date();
    if (diff <= 0) {
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
        return;
    }
    const h = Math.floor((diff / (1000 * 60 * 60)) % 24);
    const m = Math.floor((diff / (1000 * 60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    document.getElementById('hours').innerText = h < 10 ? '0' + h : h;
    document.getElementById('minutes').innerText = m < 10 ? '0' + m : m;
    document.getElementById('seconds').innerText = s < 10 ? '0' + s : s;
}
updateCountdown();
setInterval(updateCountdown, 1000);

// === Модалки ===
const waterModal = document.getElementById('waterModal');
const cargoModal = document.getElementById('cargoModal');
const cityModal = document.getElementById('cityModal');
const openWater = document.getElementById('openWaterModalBtn');
const openCargo = document.getElementById('openCargoModalBtn');
const closes = document.querySelectorAll('.close');

if (openWater) openWater.onclick = () => waterModal.style.display = 'flex';
if (openCargo) openCargo.onclick = () => cargoModal.style.display = 'flex';

closes.forEach(close => {
    close.onclick = () => {
        if (waterModal) waterModal.style.display = 'none';
        if (cargoModal) cargoModal.style.display = 'none';
        if (cityModal) cityModal.style.display = 'none';
    };
});

window.onclick = (e) => {
    if (e.target === waterModal) waterModal.style.display = 'none';
    if (e.target === cargoModal) cargoModal.style.display = 'none';
    if (e.target === cityModal) cityModal.style.display = 'none';
};

// === Города (межгород) с точными ценами ===
const cityPrices = {
    'donetsk-mariupol': { title: 'Донецк → Мариуполь', price: 'от 8 999 ₽' },
    'donetsk-urzuf': { title: 'Донецк → Урзуф', price: 'от 12 999 ₽' },
    'donetsk-berdyansk': { title: 'Донецк → Бердянск', price: 'от 13 999 ₽' },
    'donetsk-rostov': { title: 'Донецк → Ростов-на-Дону', price: 'от 14 999 ₽' },
    'donetsk-starobeshevo': { title: 'Донецк → Старобешевский р-н', price: 'от 3 999 ₽' },
    'donetsk-krasnodar': { title: 'Донецк → Краснодар', price: 'от 34 999 ₽' }
};

document.querySelectorAll('.city-modal-trigger').forEach(el => {
    el.addEventListener('click', () => {
        const key = el.getAttribute('data-city');
        if (cityPrices[key]) {
            const modalTitle = document.getElementById('cityModalTitle');
            const modalPrice = document.getElementById('cityModalPrice');
            if (modalTitle) modalTitle.innerText = cityPrices[key].title;
            if (modalPrice) modalPrice.innerText = `💰 Стоимость: ${cityPrices[key].price}`;
            if (cityModal) cityModal.style.display = 'flex';
        }
    });
});

// === Кнопки ВК (заглушки) ===
const vkBtn = document.getElementById('vkTempBtn');
const vkCargoBtn = document.getElementById('vkCargoTempBtn');
if (vkBtn) vkBtn.addEventListener('click', () => alert('Скоро появится! Следите за обновлениями'));
if (vkCargoBtn) vkCargoBtn.addEventListener('click', () => alert('Скоро появится! Следите за обновлениями'));

// === FAQ аккордеон (раскрытие ответов) ===
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.closest('.faq-item');
        if (!item) return;
        const isOpen = item.classList.contains('open');
        // Закрываем все
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) {
            item.classList.add('open');
        }
    });
});

// === Анимация печати для сообщения техподдержки ===
const supportMessage = "Возникли вопросы с работой сайта? Обратитесь в поддержку.";
let supportPrinted = false;

function typeSupportMessage() {
    const bubble = document.getElementById('supportBubble');
    if (!bubble) return;
    bubble.innerHTML = '';
    let i = 0;
    function type() {
        if (i < supportMessage.length) {
            bubble.innerHTML += supportMessage.charAt(i);
            i++;
            setTimeout(type, 40);
        }
    }
    type();
}

// === Кружок поддержки (появляется при скролле) ===
let supportCircle = document.getElementById('supportCircle');
if (!supportCircle) {
    const div = document.createElement('div');
    div.id = 'supportCircle';
    div.className = 'support-circle';
    div.innerHTML = `<div class="support-bubble" id="supportBubble"></div><div class="support-icon">🎧</div>`;
    document.body.appendChild(div);
    supportCircle = document.getElementById('supportCircle');
}

const supportBubble = document.getElementById('supportBubble');
let bubbleVisible = false;

window.addEventListener('scroll', () => {
    if (!supportCircle) return;
    const scrollY = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    if (scrollY > docHeight * 0.7) {
        if (supportCircle.style.display !== 'block') {
            supportCircle.style.display = 'block';
            if (!supportPrinted && supportBubble) {
                typeSupportMessage();
                supportPrinted = true;
            }
        }
    } else {
        supportCircle.style.display = 'none';
    }
});

if (supportCircle) {
    supportCircle.addEventListener('click', () => {
        window.open('https://t.me/Ivanka58', '_blank');
    });
}

// === Добавляем стили для кружка (на всякий случай, если их нет в CSS) ===
if (!document.querySelector('#supportCircleStyle')) {
    const style = document.createElement('style');
    style.id = 'supportCircleStyle';
    style.textContent = `
        .support-circle {
            position: fixed;
            bottom: 20px;
            right: 20px;
            z-index: 100;
            cursor: pointer;
            display: none;
        }
        .support-icon {
            background: #2ecc71;
            width: 60px;
            height: 60px;
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 30px;
            box-shadow: 0 4px 15px rgba(0,0,0,0.2);
        }
        .support-bubble {
            position: absolute;
            bottom: 70px;
            right: 0;
            background: white;
            padding: 12px 18px;
            border-radius: 20px;
            font-size: 14px;
            font-weight: 500;
            white-space: normal;
            max-width: 260px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.2);
            color: #1f3b45;
        }
    `;
    document.head.appendChild(style);
}

// === Отзывы: работа с Supabase ===
let currentReviews = [];

// Загрузка отзывов из базы
async function loadReviews() {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    container.innerHTML = '<div class="reviews-loading">Загрузка отзывов...</div>';
    
    try {
        const reviews = await window.ReviewsAPI.fetchReviews();
        currentReviews = reviews;
        renderReviews(reviews);
    } catch (e) {
        console.error('Ошибка загрузки отзывов:', e);
        container.innerHTML = '<div class="reviews-loading">Не удалось загрузить отзывы</div>';
    }
}

// Отображение отзывов
function renderReviews(reviews) {
    const container = document.getElementById('reviewsList');
    if (!container) return;
    
    if (!reviews || reviews.length === 0) {
        container.innerHTML = '<div class="reviews-loading">Пока нет отзывов. Будьте первым!</div>';
        return;
    }
    
    container.innerHTML = reviews.map(review => {
        const isOwner = review.user_ip === window.ReviewsAPI.currentUserIP;
        const stars = '★'.repeat(review.rating) + '☆'.repeat(5 - review.rating);
        const date = new Date(review.created_at).toLocaleDateString('ru-RU');
        
        return `
            <div class="review-card" data-id="${review.id}">
                <div class="review-header">
                    <span class="review-name">${escapeHtml(review.username)}</span>
                    <div style="display: flex; align-items: center; gap: 12px;">
                        <span class="review-stars">${stars}</span>
                        <span class="review-date">${date}</span>
                        ${isOwner ? `
                        <div class="review-menu">
                            <button class="review-menu-btn" onclick="toggleReviewMenu(this)">⋯</button>
                            <div class="review-menu-dropdown">
                                <button class="review-menu-delete" onclick="deleteReview(${review.id})">🗑️ Удалить</button>
                            </div>
                        </div>
                        ` : ''}
                    </div>
                </div>
                ${review.comment ? `<div class="review-comment">${escapeHtml(review.comment)}</div>` : ''}
            </div>
        `;
    }).join('');
}

// Удаление отзыва
window.deleteReview = async (id) => {
    const confirmed = confirm('Вы уверены, что хотите удалить свой отзыв?');
    if (!confirmed) return;
    
    const result = await window.ReviewsAPI.deleteReview(id);
    if (result.success) {
        await loadReviews();
        showToast('Отзыв удалён', 'success');
    } else {
        showToast(result.error || 'Ошибка удаления', 'error');
    }
};

// Переключение меню трёх точек
window.toggleReviewMenu = (btn) => {
    const dropdown = btn.nextElementSibling;
    document.querySelectorAll('.review-menu-dropdown').forEach(d => {
        if (d !== dropdown) d.classList.remove('show');
    });
    dropdown.classList.toggle('show');
};

// Закрываем меню при клике вне
document.addEventListener('click', (e) => {
    if (!e.target.closest('.review-menu')) {
        document.querySelectorAll('.review-menu-dropdown').forEach(d => d.classList.remove('show'));
    }
});

// Экранирование HTML для безопасности
function escapeHtml(str) {
    if (!str) return '';
    return str.replace(/[&<>]/g, function(m) {
        if (m === '&') return '&amp;';
        if (m === '<') return '&lt;';
        if (m === '>') return '&gt;';
        return m;
    });
}

// Уведомление (тост)
function showToast(message, type = 'info') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        bottom: 30px;
        left: 50%;
        transform: translateX(-50%);
        background: ${type === 'success' ? '#27ae60' : '#e74c3c'};
        color: white;
        padding: 12px 24px;
        border-radius: 50px;
        z-index: 1000;
        font-weight: 600;
        animation: fadeInUp 0.3s ease;
    `;
    document.body.appendChild(toast);
    setTimeout(() => toast.remove(), 3000);
}

// === Настройка формы отзыва ===
function setupReviewForm() {
    const form = document.getElementById('reviewForm');
    if (!form) return;
    
    // Звёздный рейтинг
    let selectedRating = 0;
    const stars = document.querySelectorAll('.star-rating span');
    const ratingError = document.getElementById('ratingError');
    const nameInput = document.getElementById('reviewName');
    const nameError = document.getElementById('nameError');
    
    stars.forEach(star => {
        star.addEventListener('click', () => {
            selectedRating = parseInt(star.dataset.value);
            stars.forEach((s, i) => {
                if (i < selectedRating) {
                    s.textContent = '★';
                    s.classList.add('active');
                } else {
                    s.textContent = '☆';
                    s.classList.remove('active');
                }
            });
            if (ratingError) ratingError.classList.remove('show');
            star.closest('.form-group')?.querySelector('.form-input')?.classList.remove('error');
        });
        
        star.addEventListener('mouseenter', () => {
            const val = parseInt(star.dataset.value);
            stars.forEach((s, i) => {
                s.textContent = i < val ? '★' : '☆';
            });
        });
        
        star.addEventListener('mouseleave', () => {
            stars.forEach((s, i) => {
                s.textContent = i < selectedRating ? '★' : '☆';
            });
        });
    });
    
    // Валидация и отправка
    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        let isValid = true;
        
        // Проверка имени
        const name = nameInput.value.trim();
        if (!name) {
            nameError.classList.add('show');
            nameInput.classList.add('error');
            isValid = false;
        } else {
            nameError.classList.remove('show');
            nameInput.classList.remove('error');
        }
        
        // Проверка рейтинга
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
            stars.forEach(s => {
                s.textContent = '☆';
                s.classList.remove('active');
            });
            showToast('Спасибо за отзыв!', 'success');
            await loadReviews();
        } else {
            showToast('Ошибка: ' + result.error, 'error');
        }
    });
}

// === Инициализация при загрузке страницы ===
document.addEventListener('DOMContentLoaded', async () => {
    // Ждём, пока Supabase загрузится
    if (typeof window.supabase !== 'undefined') {
        // Эти значения будут подставлены через GitHub Secrets
        const SUPABASE_URL = window.SUPABASE_URL || '';
        const SUPABASE_ANON_KEY = window.SUPABASE_ANON_KEY || '';
        
        if (SUPABASE_URL && SUPABASE_ANON_KEY) {
            const initialized = await window.ReviewsAPI.init(SUPABASE_URL, SUPABASE_ANON_KEY);
            if (initialized) {
                setupReviewForm();
                await loadReviews();
            }
        } else {
            console.error('Supabase настройки не найдены');
        }
    }
});
