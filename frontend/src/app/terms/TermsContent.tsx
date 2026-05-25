"use client";

import { useState, useEffect } from "react";
import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function TermsContent() {
  const defaultHtml = `<h2>1. Предмет соглашения</h2>
<p>Добро пожаловать в интернет-магазин Liberty Wear. Настоящие Условия использования регулируют порядок доступа к сайту, правила оформления заказов, покупки товаров и взаимодействия пользователей с ресурсом. Заходя на сайт и совершая покупки, вы соглашаетесь с данными условиями в полном объеме.</p>

<h2>2. Оформление заказа и регистрация</h2>
<p>Для оформления покупок на сайте вы можете зарегистрироваться или оформить заказ как гость. Пользователь обязуется соблюдать следующие правила:</p>
<ul>
  <li>Предоставлять только достоверную и актуальную контактную информацию (Имя, телефон, E-mail).</li>
  <li>Не передавать свои учетные данные третьим лицам во избежание несанкционированного доступа.</li>
  <li>Своевременно отвечать на подтверждающие звонки или сообщения службы доставки для координации отправки.</li>
</ul>

<h2>3. Интеллектуальная собственность</h2>
<p>Весь контент, размещенный на сайте Liberty Wear — включая дизайн страниц, логотипы, товарные знаки, оригинальные фотографии товаров, видеоматериалы и тексты — является исключительной интеллектуальной собственностью бренда Liberty Wear (ООО «Халса»). Любое копирование, воспроизведение или коммерческое использование материалов без предварительного письменного согласия правообладателя строго запрещено.</p>

<h2>4. Ограничение ответственности</h2>
<p>Liberty Wear делает все возможное для обеспечения бесперебойной работы сайта. Тем не менее, мы не несем ответственности за технические сбои на стороне интернет-провайдеров, платежных систем, а также за задержки доставки курьерскими службами, вызванные форс-мажорными обстоятельствами (погодные условия, дорожная обстановка и т.д.).</p>`;

  const [title, setTitle] = useState("Условия использования");
  const [htmlContent, setHtmlContent] = useState(defaultHtml);

  useEffect(() => {
    const fetchContent = async () => {
      try {
        const res = await fetch(`/api/v1/pages/terms?t=${Date.now()}`);
        if (res.ok) {
          const json = await res.json();
          if (json.data && json.data.htmlContent) {
            setTitle(json.data.title || "Условия использования");
            setHtmlContent(json.data.htmlContent);
          }
        }
      } catch (err) {
        console.error("Failed to fetch terms dynamic content:", err);
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
