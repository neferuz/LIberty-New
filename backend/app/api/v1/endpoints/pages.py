from typing import Any
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session

from app import crud, models, schemas
from app.api import deps

router = APIRouter()

@router.get("/{page_name}", response_model=schemas.PageContent)
def read_page_content(
    page_name: str,
    db: Session = Depends(deps.get_db)
) -> Any:
    """
    Retrieve page content by name. Create default if not found.
    """
    content = db.query(models.PageContent).filter(models.PageContent.page_name == page_name).first()
    if not content:
        if page_name == "home":
            # Create default home content
            default_data = {
                "hero": {
                    "slides": [
                        {
                            "titleFirst": "Вневременной",
                            "titleSecond": "Минимализм",
                            "titleThird": "Новая Коллекция 2026",
                            "subtitle": "Откройте для себя нашу кураторскую коллекцию архитектурных силуэтов и премиальных тканей.",
                            "primaryBtn": "В магазин",
                            "secondaryBtn": "Лукбук",
                            "imageUrl": "https://images.unsplash.com/photo-1490481651871-ab68de25d43d?q=80&w=2070&auto=format&fit=crop"
                        },
                        {
                            "titleFirst": "Эссенциальные",
                            "titleSecond": "Слои",
                            "titleThird": "Эдиториал Образ",
                            "subtitle": "Продуманные вещи, которые плавно переходят из сезона в сезон.",
                            "primaryBtn": "В магазин",
                            "secondaryBtn": "Лукбук",
                            "imageUrl": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop"
                        },
                        {
                            "titleFirst": "Искусство",
                            "titleSecond": "Простоты",
                            "titleThird": "Премиальная Одежда",
                            "subtitle": "Исключительное мастерство встречается с современным дизайном для современного человека.",
                            "primaryBtn": "В магазин",
                            "secondaryBtn": "Лукбук",
                            "imageUrl": "https://images.unsplash.com/photo-1539109136881-3be0616acf4b?q=80&w=1974&auto=format&fit=crop"
                        }
                    ]
                },
                "categories": {
                    "title": "Наши Коллекции.",
                    "description": "Мы верим в качество, а не в количество. Каждое изделие тщательно разработано, чтобы обеспечить идеальный баланс комфорта и изысканности."
                },
                "newArrivals": {
                    "title": "Новинки.",
                    "description": "Откройте для себя последние пополнения нашей коллекции, где современный дизайн встречается с непревзойденным качеством."
                },
                "editorial": {
                    "overline": "Эдиториал Образ",
                    "title1": "Искусство",
                    "title2": "Простоты",
                    "description": "Продуманные вещи, которые плавно переходят из сезона в сезон.",
                    "button1": "В магазин",
                    "button2": "Лукбук",
                    "imageUrl": "https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?q=80&w=2040&auto=format&fit=crop"
                },
                "newsletter": {
                    "title": "Подпишитесь на рассылку.",
                    "description": "Будьте в курсе новых коллекций и эксклюзивных предложений."
                },
                "press": {
                    "title": "О нас пишут.",
                    "description": "Наш бренд представлен в ведущих мировых модных изданиях и журналах о роскошном образе жизни.",
                    "brands": ["VOGUE", "HARPER'S BAZAAR", "ELLE", "TATLER", "GQ"]
                }
            }
            content = models.PageContent(page_name="home", data=default_data)
            db.add(content)
            db.commit()
            db.refresh(content)
        elif page_name == "about":
            # Create default about content
            default_data = {
                "hero": {
                    "title": "Liberty Wear.",
                    "subtitle": "Архитектурный подход к моде. Эстетика чистоты и функциональности с 2018 года."
                },
                "philosophy": {
                    "overline": "Наша философия",
                    "title": "Меньше значит больше.",
                    "description": "Мы верим, что одежда должна быть продолжением архитектуры пространства. Liberty Wear создает вещи, которые не кричат, а подчеркивают индивидуальность через идеальный крой и безупречные материалы.",
                    "stats": [
                        {"value": "100%", "label": "Натурально"},
                        {"value": "2018", "label": "Основано"},
                        {"value": "UZB", "label": "Производство"}
                    ]
                },
                "craftsmanship": {
                    "overline": "Мастерство",
                    "title": "Внимание к деталям.",
                    "cards": [
                        {"title": "Материалы", "desc": "Мы используем только сертифицированный хлопок, шерсть мериноса и кашемир высшего качества."},
                        {"title": "Конструкция", "desc": "Каждое лекало разрабатывается архитекторами кроя для обеспечения идеальной посадки."},
                        {"title": "Этика", "desc": "Справедливое производство и экологическая ответственность на каждом этапе создания коллекции."}
                    ]
                },
                "visualStory": {
                    "title": "Создано для жизни. Спроектировано для вечности."
                },
                "cta": {
                    "title": "Начните свою историю с нами."
                }
            }
            content = models.PageContent(page_name="about", data=default_data)
            db.add(content)
            db.commit()
            db.refresh(content)
        elif page_name == "contact":
            # Create default contact content
            default_data = {
                "info": {
                    "overline": "Связь с нами",
                    "title": "Контакты.",
                    "address": "г. Ташкент, ул. Амира Темура, Бизнес-центр \"Liberty\", 1 этаж",
                    "phones": ["+998 71 200 00 00", "+998 90 123 45 67"],
                    "workHours": {
                        "weekdays": "ПН — СБ: 10:00 - 21:00",
                        "sunday": "ВС: 11:00 - 19:00"
                    }
                },
                "form": {
                    "title": "Обратная связь",
                    "button": "Отправить сообщение"
                }
            }
            content = models.PageContent(page_name="contact", data=default_data)
            db.add(content)
            db.commit()
            db.refresh(content)
        elif page_name == "faq":
            # Create default faq content
            default_data = {
                "categories": [
                    {
                        "category": "Доставка",
                        "questions": [
                            {
                                "q": "Как долго осуществляется доставка?",
                                "a": "Стандартная доставка по Ташкенту осуществляется в течение 24 часов. Доставка по регионам Узбекистана занимает от 2 до 4 рабочих дней."
                            },
                            {
                                "q": "Сколько стоит доставка?",
                                "a": "Доставка по Ташкенту бесплатна при заказе на сумму свыше 500 000 сум. В остальных случаях стоимость рассчитывается согласно тарифам курьерской службы."
                            }
                        ]
                    },
                    {
                        "category": "Оплата",
                        "questions": [
                            {
                                "q": "Какие способы оплаты доступны?",
                                "a": "Мы принимаем оплату наличными при получении, а также через платежные системы Click, Payme и банковские карты Uzcard/Humo."
                            }
                        ]
                    }
                ],
                "cta": {
                    "title": "Не нашли ответ?",
                    "subtitle": "Наша служба поддержки готова помочь вам в любое время.",
                    "telegram": "https://t.me/liberty_wear",
                    "phone": "+998 71 200 00 00"
                }
            }
            content = models.PageContent(page_name="faq", data=default_data)
            db.add(content)
            db.commit()
            db.refresh(content)
        else:
            # Create empty default content for any other page_name
            content = models.PageContent(page_name=page_name, data={})
            db.add(content)
            db.commit()
            db.refresh(content)
    return content

from sqlalchemy.orm.attributes import flag_modified

@router.put("/{page_name}", response_model=schemas.PageContent)
def update_page_content(
    *,
    db: Session = Depends(deps.get_db),
    page_name: str,
    content_in: schemas.PageContentUpdate,
    current_user: models.User = Depends(deps.get_current_active_user),
) -> Any:
    """
    Update page content.
    """
    print(f"Updating page {page_name} with data: {content_in.data}")
    content = db.query(models.PageContent).filter(models.PageContent.page_name == page_name).first()
    if not content:
        # Create if not exists
        content = models.PageContent(page_name=page_name, data=content_in.data)
        db.add(content)
        db.commit()
        db.refresh(content)
        print(f"Created new page content for {page_name}")
        return content
    
    content.data = content_in.data
    flag_modified(content, "data") # Explicitly flag JSON as modified
    db.add(content)
    db.commit()
    db.refresh(content)
    print(f"Updated existing page content for {page_name}")
    return content
