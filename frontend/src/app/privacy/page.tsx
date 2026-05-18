"use client";

import Link from "next/link";
import { ArrowLeft, Shield } from "lucide-react";

export default function PrivacyPage() {
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
            <Shield className="w-5 h-5" strokeWidth={1.5} />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em]">Юридический документ</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mb-2">Политика конфиденциальности</h1>
          <p className="text-[11px] text-slate-400 uppercase tracking-widest">Последнее обновление: 18 мая 2026</p>
        </div>

        {/* Content */}
        <div className="space-y-10 text-[13px] leading-relaxed text-slate-600 font-light">
          <section className="space-y-4">
            <h2 className="text-[14px] font-bold text-[#1a1f36] uppercase tracking-wider">1. Общие положения</h2>
            <p>
              Настоящая Политика конфиденциальности определяет порядок обработки и защиты персональной информации пользователей бренда Liberty Wear. Мы с глубоким уважением относимся к праву каждого клиента на конфиденциальность персональных данных.
            </p>
            <p>
              Используя наш сайт, вы соглашаетесь с правилами сбора и использования информации, описанными в данном документе.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-[14px] font-bold text-[#1a1f36] uppercase tracking-wider">2. Сбор информации</h2>
            <p>
              Мы собираем информацию, которую вы предоставляете непосредственно нам при создании учетной записи, оформлении заказа, подписке на новостную рассылку или при обращении в нашу службу поддержки.
            </p>
            <p className="pl-4 border-l border-[#e3e8ee] text-slate-500 italic">
              Собираемые данные могут включать: имя, фамилию, адрес электронной почты, контактный номер телефона, адрес доставки заказа и информацию о предпочтениях.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-[14px] font-bold text-[#1a1f36] uppercase tracking-wider">3. Использование данных</h2>
            <p>
              Собранные персональные данные используются исключительно в целях предоставления вам качественного сервиса:
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li>Обработка, сборка и отправка ваших заказов;</li>
              <li>Информирование о статусе доставки и деталях покупки;</li>
              <li>Предоставление ответов на ваши обращения через чат и форму связи;</li>
              <li>Персонализация пользовательского опыта и улучшение качества обслуживания.</li>
            </ul>
          </section>

          <section className="space-y-4">
            <h2 className="text-[14px] font-bold text-[#1a1f36] uppercase tracking-wider">4. Защита данных</h2>
            <p>
              Мы применяем самые строгие технические и организационные меры безопасности для предотвращения несанкционированного доступа, изменения или уничтожения вашей личной информации. Передача платежных данных осуществляется в зашифрованном виде.
            </p>
          </section>

          <section className="space-y-4">
            <h2 className="text-[14px] font-bold text-[#1a1f36] uppercase tracking-wider">5. Ваши права</h2>
            <p>
              Вы имеете право в любой момент запросить информацию о ваших хранящихся у нас персональных данных, изменить их или потребовать полного удаления из нашей базы данных, связавшись с нашей службой поддержки по электронной почте.
            </p>
          </section>
        </div>
      </div>
    </div>
  );
}
