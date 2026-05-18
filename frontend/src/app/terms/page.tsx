"use client";

import Link from "next/link";
import { ArrowLeft, Scale } from "lucide-react";

export default function TermsPage() {
  return (
    <div className="bg-white min-h-screen text-[#1a1f36] py-16 md:py-24 selection:bg-[#f3f4f6]">
      <div className="container mx-auto px-6 max-w-3xl">
        {/* Back Link */}
        <Link 
          href="/" 
          className="inline-flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#1a1f36] hover:text-slate-400 transition-colors mb-12"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          На главную
        </Link>

        {/* Header */}
        <div className="border-b border-[#e3e8ee] pb-8 mb-10">
          <div className="flex items-center gap-3 text-slate-400 mb-4">
            <Scale className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Юридический документ</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2">Условия использования</h1>
          <p className="text-[11px] text-slate-400 uppercase tracking-widest">Последнее обновление: 18 мая 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-[13px] leading-relaxed text-slate-600 font-light">
          <section className="space-y-4">
            <h2 className="text-[14px] font-bold text-[#1a1f36] uppercase tracking-wider">1. Согласие с условиями</h2>
            <p>
              Добро пожаловать на сайт Liberty Wear. Получая доступ к сайту или совершая покупки, вы подтверждаете свое полное согласие с настоящими Условиями использования. Пожалуйста, внимательно ознакомьтесь с ними перед совершением заказа.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-[14px] font-bold text-[#1a1f36] uppercase tracking-wider">2. Интеллектуальная собственность</h2>
            <p>
              Все материалы, представленные на сайте — включая логотипы, тексты, дизайн-системы, элементы интерфейса, фотографии изделий, графику и программный код — являются объектами исключительных прав бренда Liberty Wear.
            </p>
            <p className="pl-4 border-l border-[#e3e8ee] text-slate-500 italic">
              Любое копирование, тиражирование, изменение или коммерческое использование контента без предварительного письменного согласия правообладателя строго запрещено.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-[14px] font-bold text-[#1a1f36] uppercase tracking-wider">3. Цены и наличие товаров</h2>
            <p>
              Мы стремимся предоставлять максимально актуальную информацию о ценах и складских остатках изделий. Однако, в редких случаях, из-за технических задержек в синхронизации с базой данных Bitrix24, информация может обновляться с задержкой.
            </p>
            <p>
              В случае обнаружения неточностей в цене или отсутствии товара после оформления заказа, наша служба поддержки свяжется с вами для оперативного решения вопроса.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-[14px] font-bold text-[#1a1f36] uppercase tracking-wider">4. Оформление заказа и доставка</h2>
            <p>
              Оформляя заказ на сайте, вы гарантируете корректность введенных контактных и адресных данных. Стоимость доставки рассчитывается согласно тарифам службы логистики, указанным на странице доставки, и зависит от вашего региона.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-[14px] font-bold text-[#1a1f36] uppercase tracking-wider">5. Изменение условий</h2>
            <p>
              Liberty Wear оставляет за собой право вносить изменения в настоящие Условия использования в одностороннем порядке. Новая редакция Условий вступает в силу с момента ее публикации на этой странице.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
