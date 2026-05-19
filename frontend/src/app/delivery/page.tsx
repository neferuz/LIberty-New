"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function DeliveryPage() {
  const defaultHtml = `<h2>Способы доставки</h2>
<p>Мы осуществляем доставку по всему Узбекистану и в страны СНГ. Наша цель — обеспечить максимально быструю и безопасную транспортировку вашего заказа.</p>
<ul>
  <li><strong>Курьерская доставка по Ташкенту:</strong> В течение 24 часов после подтверждения заказа. Стоимость — 30,000 сум (бесплатно при заказе от 500,000 сум).</li>
  <li><strong>Доставка в регионы (BTS, Fargo):</strong> От 2 до 5 рабочих дней. Стоимость рассчитывается согласно тарифам курьерской службы.</li>
  <li><strong>Самовывоз:</strong> Вы можете забрать заказ в нашем шоуруме после подтверждения готовности.</li>
</ul>

<h2>Способы оплаты</h2>
<p>Для вашего удобства мы поддерживаем различные методы оплаты:</p>
<ul>
  <li><strong>Наличными при получении:</strong> Доступно при курьерской доставке по Ташкенту и самовывозе.</li>
  <li><strong>Онлайн оплата (Click / Payme):</strong> Вы можете оплатить заказ сразу после оформления.</li>
  <li><strong>Банковские карты:</strong> Принимаем UzCard, HUMO, Visa и Mastercard.</li>
</ul>

<h2>Обмен и возврат</h2>
<p>Вы можете вернуть или обменять товар в течение 14 дней с момента покупки, если сохранен товарный вид, все бирки и упаковка. Нижнее белье и пижамные комплекты (согласно законодательству) обмену и возврату не подлежат в целях гигиены, если упаковка была вскрыта.</p>`;

  const [title, setTitle] = useState("Доставка и Оплата");
  const [htmlContent, setHtmlContent] = useState(defaultHtml);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/v1/pages/delivery?t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.htmlContent) {
            setTitle(json.data.title || "Доставка и Оплата");
            setHtmlContent(json.data.htmlContent);
          }
        }
      } catch (err) {
        console.error("Failed to fetch delivery dynamic content:", err);
      }
    };
    fetchContent();
  }, []);

  return (
    <div className="min-h-screen bg-white flex flex-col justify-between">
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
