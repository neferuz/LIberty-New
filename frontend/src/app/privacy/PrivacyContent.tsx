"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function PrivacyContent() {
  const defaultHtml = `<h2>1. Общие положения</h2>
<p>Настоящая Политика конфиденциальности определяет порядок сбора, хранения, защиты и обработки персональных данных пользователей интернет-магазина Liberty Wear. Мы с глубоким уважением относимся к конфиденциальности ваших данных и гарантируем соблюдение действующего законодательства.</p>

<h2>2. Сбор персональных данных</h2>
<p>Мы собираем только ту информацию, которая необходима для качественного обслуживания и выполнения ваших заказов. К такой информации относятся:</p>
<ul>
  <li><strong>Личные данные:</strong> Ваше имя и фамилия.</li>
  <li><strong>Контактные данные:</strong> Номер мобильного телефона и адрес электронной почты (E-mail).</li>
  <li><strong>Адрес доставки:</strong> Для осуществления курьерской отправки по Ташкенту и регионам.</li>
  <li><strong>Технические данные:</strong> Файлы cookie (включая языковые настройки) и IP-адреса для улучшения работы сайта.</li>
</ul>

<h2>3. Использование информации</h2>
<p>Все собранные данные используются нами исключительно в следующих целях:</p>
<ul>
  <li>Оформление, обработка и отправка ваших заказов.</li>
  <li>Информирование вас о статусе доставки посредством SMS или электронной почты.</li>
  <li>Предоставление персональной клиентской поддержки и обработка ваших запросов.</li>
  <li>Анализ работы сайта для повышения удобства использования.</li>
</ul>

<h2>4. Безопасность и передача третьим лицам</h2>
<p>Мы принимаем все необходимые организационные и технические меры для защиты ваших личных данных от несанкционированного доступа. Ваши данные передаются третьим лицам (например, логистическим службам BTS или Fargo) исключительно для осуществления доставки ваших заказов и ни в каких иных коммерческих целях не используются.</p>`;

  const [title, setTitle] = useState("Политика конфиденциальности");
  const [htmlContent, setHtmlContent] = useState(defaultHtml);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/v1/pages/privacy?t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.htmlContent) {
            setTitle(json.data.title || "Политика конфиденциальности");
            setHtmlContent(json.data.htmlContent);
          }
        }
      } catch (err) {
        console.error("Failed to fetch privacy dynamic content:", err);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between font-sans">
      <Header />
      <main className="pt-24 md:pt-36 pb-16 px-6 max-w-4xl mx-auto flex-1 w-full">
        <h1 className="text-2xl md:text-4xl font-light mb-6 md:mb-12 tracking-tight text-black">
          {title}
        </h1>
        
        {/* Dynamic HTML parsing layout container */}
        <div 
          dangerouslySetInnerHTML={{ __html: htmlContent }} 
          className="space-y-8 md:space-y-12 text-slate-600 text-xs md:text-sm leading-relaxed page-content-container"
        />
      </main>
      <Footer />

      {/* Cross-compatible inline style overrides to ensure premium dynamic formatting */}
      <style dangerouslySetInnerHTML={{ __html: `
        .page-content-container h2 {
          font-size: 1.125rem;
          font-weight: 500;
          color: #000;
          margin-top: 2.5rem;
          margin-bottom: 1rem;
        }
        @media (min-width: 768px) {
          .page-content-container h2 {
            font-size: 1.25rem;
          }
        }
        .page-content-container h3 {
          font-size: 1rem;
          font-weight: 500;
          color: #000;
          margin-top: 1.75rem;
          margin-bottom: 0.75rem;
        }
        .page-content-container p {
          margin-bottom: 1rem;
        }
        .page-content-container ul {
          list-style-type: disc;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .page-content-container ol {
          list-style-type: decimal;
          padding-left: 1.5rem;
          margin-bottom: 1.25rem;
        }
        .page-content-container li {
          margin-bottom: 0.5rem;
        }
        .page-content-container strong {
          font-weight: 700;
          color: #000;
        }
        .page-content-container em {
          font-style: italic;
        }
        .page-content-container u {
          text-decoration: underline;
        }
      `}} />
    </div>
  );
}
