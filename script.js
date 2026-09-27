document.getElementById('review-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Отменяем перезагрузку страницы

  const form = event.target;
  const btn = document.getElementById('submit-btn');
  const statusDiv = document.getElementById('form-status');

  // Показываем клиенту статус
  btn.disabled = true;
  statusDiv.style.display = 'block';
  statusDiv.style.backgroundColor = '#e1f5fe';
  statusDiv.style.color = '#0288d1';
  statusDiv.innerHTML = 'Ваш отзыв обрабатывается и отправляется на модерацию...';

  // Собираем данные в стандартном формате формы (это обходит блокировщики)
  const formData = new FormData(form);

  // Отправляем запрос на сервера Web3Forms
  fetch('https://web3forms.com', {
    method: 'POST',
    body: formData // Отправляем напрямую formData, без JSON.stringify!
  })
  .then(async (response) => {
    const result = await response.json();
    
    if (result.success) {
      // Перекрашиваем плашку в зелёный при успехе
      statusDiv.style.backgroundColor = '#e8f5e9';
      statusDiv.style.color = '#2e7d32';
      statusDiv.innerHTML = 'Спасибо! Ваш отзыв успешно отправлен и появится на сайте после проверки.';
      form.reset(); // Очищаем поля формы
    } else {
      // Если Web3Forms сам вернул ошибку (например, не тот ключ)
      statusDiv.style.backgroundColor = '#ffebee';
      statusDiv.style.color = '#c62828';
      statusDiv.innerHTML = result.message || 'Произошла ошибка при отправке.';
    }
  })
  .catch(error => {
    // Если всё равно падает сеть
    statusDiv.style.backgroundColor = '#ffebee';
    statusDiv.style.color = '#c62828';
    statusDiv.innerHTML = 'Ошибка сети. Попробуйте отключить VPN/Блокировщик рекламы или проверьте ключ доступа в HTML.';
    console.error('Ошибка:', error);
  })
  .finally(() => {
    btn.disabled = false; // Возвращаем кнопку в рабочее состояние
  });
});
