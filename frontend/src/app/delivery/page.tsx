import { Header } from "@/components/layout/Header";
import { Footer } from "@/components/layout/Footer";

export default function DeliveryPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="pt-32 pb-20 px-4 max-w-4xl mx-auto">
        <h1 className="text-4xl font-light mb-12 tracking-tight">Доставка и Оплата</h1>
        
        <div className="space-y-12 text-gray-600 leading-relaxed">
          <section>
            <h2 className="text-xl font-medium text-black mb-4">Способы доставки</h2>
            <p className="mb-4">
              Мы осуществляем доставку по всему Узбекистану и в страны СНГ. Наша цель — обеспечить максимально быструю и безопасную транспортировку вашего заказа.
            </p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Курьерская доставка по Ташкенту:</strong> В течение 24 часов после подтверждения заказа. Стоимость — 30,000 сум (бесплатно при заказе от 500,000 сум).</li>
              <li><strong>Доставка в регионы (BTS, Fargo):</strong> От 2 до 5 рабочих дней. Стоимость рассчитывается согласно тарифам курьерской службы.</li>
              <li><strong>Самовывоз:</strong> Вы можете забрать заказ в нашем шоуруме после подтверждения готовности.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-black mb-4">Способы оплаты</h2>
            <p className="mb-4">Для вашего удобства мы поддерживаем различные методы оплаты:</p>
            <ul className="list-disc pl-5 space-y-2">
              <li><strong>Наличными при получении:</strong> Доступно при курьерской доставке по Ташкенту и самовывозе.</li>
              <li><strong>Онлайн оплата (Click / Payme):</strong> Вы можете оплатить заказ сразу после оформления.</li>
              <li><strong>Банковские карты:</strong> Принимаем UzCard, HUMO, Visa и Mastercard.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-xl font-medium text-black mb-4">Обмен и возврат</h2>
            <p>
              Вы можете вернуть или обменять товар в течение 14 дней с момента покупки, если сохранен товарный вид, все бирки и упаковка. Нижнее белье и пижамные комплекты (согласно законодательству) обмену и возврату не подлежат в целях гигиены, если упаковка была вскрыта.
            </p>
          </section>
        </div>
      </main>
      <Footer />
    </div>
  );
}
