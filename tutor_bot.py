import os
from google import genai
from telegram import Update
from telegram.ext import ApplicationBuilder, CommandHandler, MessageHandler, filters, ContextTypes

# Считываем ключи из переменных окружения
GEMINI_KEY = os.environ.get("GEMINI_API_KEY")
BOT_TOKEN = os.environ.get("TELEGRAM_BOT_TOKEN")

gemini_client = genai.Client(api_key=GEMINI_KEY)

SYSTEM_PROMPT = """
Ты — терпеливый и доброжелательный репетитор английского языка.
Твоя задача:
1. Вести диалог на английском языке, подстраиваясь под уровень пользователя.
2. Если пользователь делает ошибки (в грамматике, словах или произношении/распознавании), мягко исправь их в начале сообщения на русском языке (формат: 💡 *Поправка: ...*), а затем продолжи диалог на английском.
3. В конце каждого сообщения задавай один открытый вопрос на английском, чтобы поддерживать беседу.
"""

user_chat_sessions = {}

def get_or_create_chat(user_id):
    if user_id not in user_chat_sessions:
        user_chat_sessions[user_id] = gemini_client.chats.create(
            model="gemini-3.6-flash",
            config={"system_instruction": SYSTEM_PROMPT}
        )
    return user_chat_sessions[user_id]

async def start(update: Update, context: ContextTypes.DEFAULT_TYPE):
    user_id = update.effective_user.id
    user_chat_sessions[user_id] = gemini_client.chats.create(
        model="gemini-3.6-flash",
        config={"system_instruction": SYSTEM_PROMPT}
    )
    await update.message.reply_text(
        "Hello! I'm your English tutor. You can send me text or voice messages! What did you do today?"
    )

async def handle_text(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat = get_or_create_chat(update.effective_user.id)
    status_msg = await update.message.reply_text("Thinking...")
    try:
        response = chat.send_message(update.message.text)
        await status_msg.edit_text(response.text)
    except Exception as e:
        await status_msg.edit_text(f"Error: {e}")

async def handle_voice(update: Update, context: ContextTypes.DEFAULT_TYPE):
    chat = get_or_create_chat(update.effective_user.id)
    status_msg = await update.message.reply_text("Слушаю и анализирую голос...")
    
    file_path = "user_voice.ogg"
    try:
        voice_file = await update.message.voice.get_file()
        await voice_file.download_to_drive(file_path)

        uploaded_audio = gemini_client.files.upload(file=file_path)

        response = chat.send_message([
            "Listen to my voice message and respond according to your role:",
            uploaded_audio
        ])

        await status_msg.edit_text(response.text)

    except Exception as e:
        await status_msg.edit_text(f"Error: {e}")
    finally:
        if os.path.exists(file_path):
            os.remove(file_path)

if __name__ == '__main__':
    app = ApplicationBuilder().token(BOT_TOKEN).build()
    
    app.add_handler(CommandHandler("start", start))
    app.add_handler(MessageHandler(filters.TEXT & ~filters.COMMAND, handle_text))
    app.add_handler(MessageHandler(filters.VOICE, handle_voice))
    
    print("Language Tutor Bot with Voice support is running...")
    app.run_polling()