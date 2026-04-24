// Слоганы ротация
const slogans = [
    "💪 Доставка воды без боли в спине",
    "🚿 Доставка без лишних хлопот",
    "🏠 Вода в дом — чисто и удобно",
    "⚡ Быстрая доставка, честные цены",
    "💧 Свежая вода от 100 литров"
];
let sloganIndex = 0;
const sloganElem = document.querySelector('#sloganRotator .slogan-text');
if (sloganElem) {
    setInterval(() => {
        sloganIndex = (sloganIndex + 1) % slogans.length;
        sloganElem.textContent = slogans[sloganIndex];
    }, 5000);
}

// Таймер акции
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

// Модалки
const waterModal = document.getElementById('waterModal');
const cargoModal = document.getElementById('cargoModal');
const cityModal = document.getElementById('cityModal');
const openWaterBtn = document.getElementById('openWaterModalBtn');
const openCargoBtn = document.getElementById('openCargoModalBtn');
const closes = document.querySelectorAll('.close');

openWaterBtn.onclick = () => waterModal.style.display = 'flex';
openCargoBtn.onclick = () => cargoModal.style.display = 'flex';
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

// Города с модалкой и ценами
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

// Кнопки ВК (заглушка)
document.getElementById('vkTempBtn')?.addEventListener('click', () => alert('Скоро появится! Следите за обновлениями'));
document.getElementById('vkCargoTempBtn')?.addEventListener('click', () => alert('Скоро появится! Следите за обновлениями'));

// Круг техподдержки при скролле вниз
const supportCircle = document.getElementById('supportCircle');
const supportIcon = document.getElementById('supportIcon');
const supportBubble = document.getElementById('supportBubble');
let bubbleTimeout;
window.addEventListener('scroll', () => {
    const scrollY = window.scrollY;
    const docHeight = document.body.scrollHeight - window.innerHeight;
    if (scrollY > docHeight * 0.7) {
        if (supportCircle.style.display === 'none') {
            supportCircle.style.display = 'block';
            supportBubble.style.display = 'block';
            if (bubbleTimeout) clearTimeout(bubbleTimeout);
            bubbleTimeout = setTimeout(() => {
                supportBubble.style.display = 'none';
            }, 5000);
        }
    } else {
        supportCircle.style.display = 'none';
    }
});
supportCircle.addEventListener('click', () => {
    window.open('https://t.me/Ivanka58', '_blank');
});
// Имитация печати в пузыре
const messages = ["Есть вопросы по сайту?", "Обратитесь в нашу поддержку!"];
let msgIndex = 0;
setInterval(() => {
    if (supportCircle.style.display === 'block' && supportBubble.style.display !== 'none') {
        msgIndex = (msgIndex + 1) % messages.length;
        supportBubble.textContent = messages[msgIndex];
    }
}, 4000);

// Плавающие иконки уже есть
console.log("Сайт обновлён по всем требованиям!");
