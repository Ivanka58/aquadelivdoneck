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

// === FAQ аккордеон ===
document.querySelectorAll('.faq-question').forEach(question => {
    question.addEventListener('click', () => {
        const item = question.closest('.faq-item');
        if (!item) return;
        const isOpen = item.classList.contains('open');
        document.querySelectorAll('.faq-item').forEach(i => i.classList.remove('open'));
        if (!isOpen) item.classList.add('open');
    });
});

// === Поддержка: кружок справа внизу ===
let supportCircle = document.getElementById('supportCircle');
if (!supportCircle) {
    const div = document.createElement('div');
    div.id = 'supportCircle';
    div.className = 'support-circle';
    div.innerHTML = `<div class="support-bubble" id="supportBubble"></div><div class="support-icon">🎧</div>`;
    document.body.appendChild(div);
    supportCircle = document.getElementById('supportCircle');
}

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

window.addEventListener('scroll', () => {
    if (!supportCircle) return;
    const scrollY = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    if (scrollY > docHeight * 0.7) {
        if (supportCircle.style.display !== 'block') {
            supportCircle.style.display = 'block';
            if (!supportPrinted) {
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

// === Добавляем стили для кружка ===
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
