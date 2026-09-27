document.getElementById('review-form').addEventListener('submit', function(event) {
  event.preventDefault(); // Запрещаем стандартную перезагрузку страницы

  const form = event.target;
  const btn = document.getElementById('submit-btn');
  const statusDiv = document.getElementById('form-status');

  // Показываем статус отправки клиенту
  btn.disabled = true;
  statusDiv.style.display = 'block';
  statusDiv.style.backgroundColor = '#e1f5fe';
  statusDiv.style.color = '#0288d1';
  statusDiv.innerHTML = 'Ваш отзыв обрабатывается и отправляется на модерацию...';

  // Собираем данные формы напрямую (это самый надежный формат для сети)
  const formData = new FormData(form);

  // Отправляем в API Web3Forms
  fetch('https://web3forms.com', {
    method: 'POST',
    body: formData
  })
  .then(async (response) => {
    const result = await response.json();
    
    if (result.success) {
      statusDiv.style.backgroundColor = '#e8f5e9';
      statusDiv.style.color = '#2e7d32';
      statusDiv.innerHTML = 'Спасибо! Ваш отзыв успешно отправлен и появится на сайте после проверки.';
      form.reset(); // Полностью очищаем форму
    } else {
      statusDiv.style.backgroundColor = '#ffebee';
      statusDiv.style.color = '#c62828';
      statusDiv.innerHTML = result.message || 'Произошла ошибка при отправке формы.';
    }
  })
  .catch(error => {
    statusDiv.style.backgroundColor = '#ffebee';
    statusDiv.style.color = '#c62828';
    statusDiv.innerHTML = 'Не удалось отправить. Проверьте подключение к интернету.';
    console.error('Ошибка:', error);
  })
  .finally(() => {
    btn.disabled = false; // Возвращаем кнопку в активное состояние
  });
});
