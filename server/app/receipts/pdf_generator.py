from reportlab.lib.pagesizes import letter
from reportlab.pdfgen import canvas
from reportlab.pdfbase import pdfmetrics
from reportlab.lib.styles import getSampleStyleSheet
from reportlab.platypus import Paragraph, SimpleDocTemplate, Spacer
from reportlab.pdfbase.ttfonts import TTFont
from io import BytesIO
from datetime import datetime
import os

def register_fonts():
    try:
        # Попробуйте найти стандартный шрифт с кириллицей
        pdfmetrics.registerFont(TTFont('Arial', 'arial.ttf'))
    except:
        # Альтернативный вариант (для Docker/Linux)
        try:
            pdfmetrics.registerFont(TTFont('DejaVuSans', 'DejaVuSans.ttf'))
        except:
            # Самый надежный вариант - используем встроенный шрифт
            from reportlab.rl_config import TTFSearchPath
            TTFSearchPath.append("/usr/share/fonts/truetype/freefont")
            pdfmetrics.registerFont(TTFont('FreeSans', 'FreeSans.ttf'))

async def generate_receipt_pdf(receipt, property, user):
    register_fonts()  # Регистрируем шрифты
    
    buffer = BytesIO()
    c = canvas.Canvas(buffer, pagesize=letter)
    
    # Устанавливаем шрифт с поддержкой кириллицы
    try:
        c.setFont("Arial", 12)
    except:
        try:
            c.setFont("DejaVuSans", 12)
        except:
            c.setFont("FreeSans", 12)
    
    # Заголовок
    c.drawString(100, 750, f"Квитанция №{receipt.transaction_number}")
    
    # Информация о плательщике
    c.drawString(100, 720, f"Плательщик: {user.first_name} {user.last_name}")
    c.drawString(100, 700, f"Адрес: {property.address}")
    
    # Период    
    # Дата формирования
    from datetime import datetime
    c.drawString(100, 660, f"Дата формирования: {datetime.now().strftime('%d.%m.%Y %H:%M')}")
    
    # Сумма и статус
    c.drawString(100, 640, f"Сумма к оплате: {receipt.amount:.2f} руб.")
    c.drawString(100, 620, f"Статус: {receipt.status}")
    
    c.save()
    buffer.seek(0)
    return buffer