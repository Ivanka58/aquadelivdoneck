// script.js - Таймер акции + кнопка вызова (открывает телефонную книгу)
document.addEventListener('DOMContentLoaded', function() {

    // Устанавливаем дату окончания акции (через 3 дня от текущего момента)
    let targetDate = new Date();
    targetDate.setDate(targetDate.getDate() + 3);
    targetDate.setHours(23, 59, 59, 999);

    function updateCountdown() {
        const now = new Date();
        const diff = targetDate - now;

        if (diff <= 0) {
            document.getElementById('hours').innerText = '00';
            document.getElementById('minutes').innerText = '00';
            document.getElementById('seconds').innerText = '00';
            return;
        }

        const hours = Math.floor((diff / (1000 * 60 * 60)) % 24);
        const minutes = Math.floor((diff / (1000 * 60)) % 60);
        const seconds = Math.floor((diff / 1000) % 60);

        document.getElementById('hours').innerText = hours < 10 ? '0' + hours : hours;
        document.getElementById('minutes').innerText = minutes < 10 ? '0' + minutes : minutes;
        document.getElementById('seconds').innerText = seconds < 10 ? '0' + seconds : seconds;
    }

    updateCountdown();
    setInterval(updateCountdown, 1000);

    // Бонус: все кнопки с tel: и так работают, 
    // при клике на любую ссылку с номером откроется набор номера на телефоне
    // Дополнительно отслеживаем клик по кнопке "Оформить заказ" — но href уже есть,
    // можно добавить аналитику, но не обязательно.
    console.log("Сайт готов — акция тикает, номер сразу открывает книгу");
});
