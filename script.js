// === Анимация печати для слоганов ===
const slogansList = [
    "💪 Доставка воды без боли в спине",
    "🚿 Доставка без лишних хлопот",
    "🏠 Вода в дом — чисто и удобно",
    "⚡ Быстрая доставка, честные цены",
    "💧 Свежая вода от 100 литров"
];
let sloganIdx = 0;
const sloganElement = document.getElementById('typingSlogan');

function typeSlogan(text, callback) {
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
rotateSlogan();

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

// === Таймер акции ===
let targetDate = new Date();
targetDate.setDate(targetDate.getDate() + 3);
targetDate.setHours(23,59,59);
function updateCountdown() {
    const diff = targetDate - new Date();
    if (diff <= 0) {
        document.getElementById('hours').innerText = '00';
        document.getElementById('minutes').innerText = '00';
        document.getElementById('seconds').innerText = '00';
        return;
    }
    const h = Math.floor((diff / (1000*60*60)) % 24);
    const m = Math.floor((diff / (1000*60)) % 60);
    const s = Math.floor((diff / 1000) % 60);
    document.getElementById('hours').innerText = h < 10 ? '0'+h : h;
    document.getElementById('minutes').innerText = m < 10 ? '0'+m : m;
    document.getElementById('seconds').innerText = s < 10 ? '0'+s : s;
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

openWater.onclick = () => waterModal.style.display = 'flex';
openCargo.onclick = () => cargoModal.style.display = 'flex';
closes.forEach(close => {
    close.onclick = () => {
        waterModal.style.display = 'none';
        cargoModal.style.display = 'none';
        cityModal.style.display = 'none';
    };
});
window.onclick = (e) => {
    if (e.target === waterModal) waterModal.style.display = 'none';
    if (e.target === cargoModal) cargoModal.style.display = 'none';
    if (e.target === cityModal) cityModal.style.display = 'none';
};

// === Города с ценами ===
const cityPrices = {
    'donetsk-mariupol': { title: 'Донецк → Мариуполь', price: '≈ 5 500 ₽' },
    'donetsk-urzuf': { title: 'Донецк → Урзуф', price: '≈ 6 200 ₽' },
    'donetsk-berdyansk': { title: 'Донецк → Бердянск', price: '≈ 7 000 ₽' },
    'donetsk-rostov': { title: 'Донецк → Ростов-на-Дону', price: '≈ 9 500 ₽' },
    'donetsk-krasnodar': { title: 'Донецк → Краснодар', price: '≈ 14 000 ₽' }
};
document.querySelectorAll('.city-modal-trigger').forEach(el => {
    el.addEventListener('click', () => {
        const key = el.getAttribute('data-city');
        if (cityPrices[key]) {
            document.getElementById('cityModalTitle').innerText = cityPrices[key].title;
            document.getElementById('cityModalPrice').innerText = `Приблизительная стоимость: ${cityPrices[key].price}`;
            cityModal.style.display = 'flex';
        }
    });
});

// === Кнопки ВК (заглушка) ===
document.getElementById('vkTempBtn')?.addEventListener('click', () => alert('Скоро появится! Следите за обновлениями'));
document.getElementById('vkCargoTempBtn')?.addEventListener('click', () => alert('Скоро появится! Следите за обновлениями'));

// === Поддержка: кружок справа внизу с анимацией печати ===
const supportCircle = document.getElementById('supportCircle');
// Создаём элемент, если его нет в HTML (добавляем динамически)
if (!supportCircle) {
    const div = document.createElement('div');
    div.id = 'supportCircle';
    div.className = 'support-circle';
    div.innerHTML = `<div class="support-bubble" id="supportBubble"></div><div class="support-icon">🎧</div>`;
    document.body.appendChild(div);
}
const finalSupportCircle = document.getElementById('supportCircle');
const supportBubble = document.getElementById('supportBubble');

let bubbleVisible = false;
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    if (scrollY > docHeight * 0.7) {
        if (finalSupportCircle && finalSupportCircle.style.display !== 'block') {
            finalSupportCircle.style.display = 'block';
            if (!supportPrinted) {
                typeSupportMessage();
                supportPrinted = true;
            }
        }
    } else {
        if (finalSupportCircle) finalSupportCircle.style.display = 'none';
    }
});
finalSupportCircle.addEventListener('click', () => {
    window.open('https://t.me/Ivanka58', '_blank');
});

// === Добавляем стили для кружка прямо в скрипте (на всякий случай) ===
const style = document.createElement('style');
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
