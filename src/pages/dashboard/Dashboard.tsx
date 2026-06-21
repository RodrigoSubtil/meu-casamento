import "./dashboard.css";

import { useEffect, useMemo, useState } from "react";
import {
   getGifts,
   getMessages,
   getPurchases,
   getRsvp
} from "../../services/dashboardService";

type RsvpItem = {
   id?: number;
   name?: string;
   attending?: string;
   category?: string;
   created_at?: string;
};

type MessageItem = {
   id?: number;
   name?: string;
   message?: string;
   created_at?: string;
};

type GiftItem = {
   id?: number;
   title?: string;
   price?: number;
   image?: string;
   category?: string;
   is_reserved?: boolean;
};

type PurchaseItem = {
   id?: number;
   gift_id?: number;
   title?: string;
   price_brl?: number;
   price_eur?: number;
   method?: "pix" | "mbway";
   payer_name?: string;
   status?: string;
   created_at?: string;
};

const currencyBRL = new Intl.NumberFormat("pt-BR", {
   style: "currency",
   currency: "BRL"
});

const currencyEUR = new Intl.NumberFormat("pt-PT", {
   style: "currency",
   currency: "EUR"
});

const FALLBACK_BRL_TO_EUR_RATE = 1 / 6.3;

function isAttending(value?: string) {
   return value?.toLowerCase().includes("sim") ?? false;
}

function formatDate(value?: string) {
   if (!value) return "Sem data";

   return new Intl.DateTimeFormat("pt-PT", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit"
   }).format(new Date(value));
}

function getPurchaseValue(item: PurchaseItem) {
   if (item.method === "mbway") {
      return currencyEUR.format(Number(item.price_eur || 0));
   }

   return currencyBRL.format(Number(item.price_brl || 0));
}

export default function Dashboard() {
   const [rsvps, setRsvps] = useState<RsvpItem[]>([]);
   const [messages, setMessages] = useState<MessageItem[]>([]);
   const [gifts, setGifts] = useState<GiftItem[]>([]);
   const [purchases, setPurchases] = useState<PurchaseItem[]>([]);
   const [loading, setLoading] = useState(true);
   const [error, setError] = useState("");
   const [brlToEurRate, setBrlToEurRate] = useState(FALLBACK_BRL_TO_EUR_RATE);

   useEffect(() => {
      async function loadDashboard() {
         try {
            setLoading(true);
            setError("");

            const [rsvpData, messageData, giftData, purchaseData] =
               await Promise.all([
                  getRsvp(),
                  getMessages(),
                  getGifts(),
                  getPurchases()
               ]);

            setRsvps(rsvpData);
            setMessages(messageData);
            setGifts(giftData);
            setPurchases(purchaseData);
         } catch (err) {
            console.error(err);
            setError("Nao foi possivel carregar os dados do dashboard.");
         } finally {
            setLoading(false);
         }
      }

      loadDashboard();
   }, []);

   useEffect(() => {
      const controller = new AbortController();

      async function loadExchangeRate() {
         try {
            const response = await fetch(
               "https://api.frankfurter.dev/v2/rates?base=BRL&quotes=EUR",
               { signal: controller.signal }
            );

            if (!response.ok) throw new Error("Erro ao buscar cotacao");

            const data = await response.json();
            const rate = Number(data?.rates?.EUR);

            if (!Number.isFinite(rate) || rate <= 0) {
               throw new Error("Cotacao invalida");
            }

            setBrlToEurRate(rate);
         } catch {
            if (controller.signal.aborted) return;

            setBrlToEurRate(FALLBACK_BRL_TO_EUR_RATE);
         }
      }

      loadExchangeRate();

      return () => controller.abort();
   }, []);

   const stats = useMemo(() => {
      const confirmed = rsvps.filter((item) => isAttending(item.attending));
      const declined = rsvps.filter((item) => !isAttending(item.attending));
      const adults = confirmed.filter((item) =>
         item.category?.toLowerCase().includes("adulto")
      );
      const children = confirmed.filter((item) =>
         item.category?.toLowerCase().includes("crianca")
      );
      const paidPurchases = purchases.filter(
         (item) => item.status !== "cancelled"
      );
      const purchasedGiftIds = new Set(
         paidPurchases
            .map((item) => item.gift_id)
            .filter((id): id is number => Boolean(id) && id !== 999999)
      );
      const totalBRL = paidPurchases.reduce(
         (sum, item) =>
            item.method === "pix"
               ? sum + Number(item.price_brl || 0)
               : sum,
         0
      );
      const totalEUR = paidPurchases.reduce(
         (sum, item) =>
            item.method === "mbway"
               ? sum + Number(item.price_eur || 0)
               : sum,
         0
      );
      const totalConvertedBRL = totalBRL + (totalEUR / brlToEurRate);
      const totalConvertedEUR = totalEUR + (totalBRL * brlToEurRate);

      return {
         totalGuests: rsvps.length,
         confirmed: confirmed.length,
         declined: declined.length,
         adults: adults.length,
         children: children.length,
         messages: messages.length,
         gifts: gifts.length,
         purchasedGifts: paidPurchases.length,
         availableGifts: gifts.filter((item) => !purchasedGiftIds.has(Number(item.id))).length,
         totalBRL,
         totalEUR,
         totalConvertedBRL,
         totalConvertedEUR
      };
   }, [brlToEurRate, gifts, messages, purchases, rsvps]);

   const sortedRsvps = useMemo(
      () => [...rsvps].sort((a, b) =>
         (a.name || "").localeCompare(b.name || "", "pt", {
            sensitivity: "base"
         })
      ),
      [rsvps]
   );

   return (
      <main className="dashboard-page">
         <section className="dashboard">
            <div className="container">
               <div className="dashboard-container">
                  <header className="dashboard-header">
                     <div className="luxury-title-main">
                        <span>Dashboard</span>
                     </div>

                     <p className="section-subtitle">
                        Visao geral dos convidados, mensagens e presentes do casamento.
                     </p>
                  </header>

                  {loading && (
                     <div className="dashboard-state">
                        Carregando dados do casamento...
                     </div>
                  )}

                  {error && !loading && (
                     <div className="dashboard-state error">
                        {error}
                     </div>
                  )}

                  {!loading && !error && (
                     <>
                        <section className="dashboard-summary">
                           <article>
                              <span>Respostas RSVP</span>
                              <strong>{stats.totalGuests}</strong>
                              <small>{stats.confirmed} sim / {stats.declined} nao</small>
                           </article>

                           <article>
                              <span>Presencas confirmadas</span>
                              <strong>{stats.confirmed}</strong>
                              <small>pessoas que vao</small>
                           </article>

                           <article>
                              <span>Adultos confirmados</span>
                              <strong>{stats.adults}</strong>
                              <small>confirmaram presenca</small>
                           </article>

                           <article>
                              <span>Criancas confirmadas</span>
                              <strong>{stats.children}</strong>
                              <small>confirmaram presenca</small>
                           </article>
                        </section>

                        <section className="dashboard-money">
                           <div>
                              <span>Total recebido em real</span>
                              <strong>{currencyBRL.format(stats.totalBRL)}</strong>
                           </div>

                           <div>
                              <span>Total recebido em euro</span>
                              <strong>{currencyEUR.format(stats.totalEUR)}</strong>
                           </div>

                           <div className="dashboard-money-total">
                              <span>Total recebido</span>
                              <strong>
                                 {currencyBRL.format(stats.totalConvertedBRL)}
                                 <span aria-hidden="true">/</span>
                                 <small>{currencyEUR.format(stats.totalConvertedEUR)}</small>
                              </strong>
                           </div>
                        </section>

                        <div className="dashboard-grid">
                           <section className="dashboard-panel">
                              <div className="dashboard-panel-header">
                                 <div>
                                    <span>RSVP</span>
                                    <h2>Confirmacoes</h2>
                                 </div>
                              </div>

                              <div className="dashboard-list rsvp-list">
                                 {rsvps.length === 0 && (
                                    <p className="dashboard-empty">Nenhum RSVP recebido ainda.</p>
                                 )}

                                 {sortedRsvps.map((item) => (
                                    <article key={item.id ?? item.name}>
                                       <div>
                                          <strong>{item.name || "Sem nome"}</strong>
                                          <span className="rsvp-details">
                                             <time dateTime={item.created_at}>
                                                {formatDate(item.created_at)}
                                             </time>
                                             <span aria-hidden="true">·</span>
                                             {item.category || "Sem categoria"}
                                          </span>
                                       </div>
                                       <em className={isAttending(item.attending) ? "yes" : "no"}>
                                          {isAttending(item.attending) ? "Sim" : "Nao"}
                                       </em>
                                    </article>
                                 ))}
                              </div>
                           </section>

                           <section className="dashboard-panel">
                              <div className="dashboard-panel-header">
                                 <div>
                                    <span>Presentes</span>
                                    <h2>Comprados</h2>
                                 </div>
                              </div>

                              <div className="dashboard-list gift-list">
                                 {purchases.length === 0 && (
                                    <p className="dashboard-empty">Nenhum presente comprado ainda.</p>
                                 )}

                                 {purchases.map((item) => (
                                    <article key={item.id ?? `${item.gift_id}-${item.created_at}`}>
                                       <div>
                                          <strong>{item.title || "Presente"}</strong>
                                          <span>
                                             {item.payer_name || "Sem nome"} · {formatDate(item.created_at)} · {item.method?.toUpperCase() || "Metodo"}
                                          </span>
                                       </div>
                                       <div className="dashboard-price">
                                          <strong>{getPurchaseValue(item)}</strong>
                                       </div>
                                    </article>
                                 ))}
                              </div>
                           </section>
                        </div>

                        <section className="dashboard-panel messages-panel">
                           <div className="dashboard-panel-header">
                              <div>
                                 <span>Mensagens</span>
                                 <h2>Recados dos convidados</h2>
                              </div>
                           </div>

                           <div className="dashboard-messages">
                              {messages.length === 0 && (
                                 <p className="dashboard-empty">Nenhuma mensagem recebida ainda.</p>
                              )}

                              {messages.map((item) => (
                                 <article key={item.id ?? `${item.name}-${item.created_at}`}>
                                    <div>
                                       <strong>{item.name || "Convidado"}</strong>
                                       <span>{formatDate(item.created_at)}</span>
                                    </div>
                                    <p>{item.message || "Mensagem sem texto."}</p>
                                 </article>
                              ))}
                           </div>
                        </section>
                     </>
                  )}
               </div>
            </div>
         </section>
      </main>
   );
}
