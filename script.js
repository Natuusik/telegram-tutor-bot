document.getElementById('review-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Останавливаем стандартную перезагрузку страницы

  const form = event.target;
  const btn = document.getElementById('submit-btn');
  const statusDiv = document.getElementById('form-status');

  // 1. Включаем режим ожидания для клиента
  btn.disabled = true;
  statusDiv.style.display = 'block';
  statusDiv.style.backgroundColor = '#e1f5fe';
  statusDiv.style.color = '#0288d1';
  statusDiv.innerHTML = 'Ваш отзыв обрабатывается и отправляется на модерацию...';

  // 2. Собираем данные полей из HTML формы
  const formData = new FormData(form);

  // 3. Формируем правильный JSON формат, который требует Web3Forms
  const object = Object.fromEntries(formData);
  const json = JSON.stringify(object);

  // 4. Отправляем запрос на сервера Web3Forms
  fetch('https://web3forms.com', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Accept': 'application/json'
    },
    body: json
  })
  .then(async (response) => {
    const result = await response.json();
    
    if (response.ok && result.success) {
      // Если всё улетело успешно — перекрашиваем плашку в зелёный
      statusDiv.style.backgroundColor = '#e8f5e9';
      statusDiv.style.color = '#2e7d32';
      statusDiv.innerHTML = 'Спасибо! Ваш отзыв успешно отправлен и появится на сайте после проверки.';
      form.reset(); // Очищаем поля формы для нового отзыва
    } else {
      // Если сервис вернул ошибку обработки
      statusDiv.style.backgroundColor = '#ffebee';
      statusDiv.style.color = '#c62828';
      statusDiv.innerHTML = result.message || 'Произошла ошибка при отправке.';
    }
  })
  .catch(error => {
    // Если заблокировал браузер при file:/// или упал интернет
    statusDiv.style.backgroundColor = '#ffebee';
    statusDiv.style.color = '#c62828';
    statusDiv.innerHTML = 'Произошла сетевая ошибка. Пожалуйста, запустите сайт через локальный сервер или загрузите на GitHub.';
  })
  .finally(() => {
    // В любом случае возвращаем кнопку в рабочее состояние
    btn.disabled = false;
  });
});
