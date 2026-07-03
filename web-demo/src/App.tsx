import { useEffect, useState, type MouseEvent } from "react";

type Route = "/" | "/residential" | "/travel";

type LockerCell = {
  id: string;
  status: string;
  tone: "available" | "reserved" | "occupied" | "service";
};

type TimelineItem = {
  title: string;
  detail: string;
};

const routeTitles: Record<Route, string> = {
  "/": "QOLQA | Casilleros inteligentes para operación real",
  "/residential": "QOLQA Residential | Casilleros para edificios y condominios",
  "/travel": "QOLQA Travel | Casilleros para equipaje y objetos"
};

const residentialCells: LockerCell[] = [
  { id: "A1", status: "Libre", tone: "available" },
  { id: "A2", status: "Libre", tone: "available" },
  { id: "A3", status: "Ocupado", tone: "occupied" },
  { id: "A4", status: "Libre", tone: "available" },
  { id: "B1", status: "Reservado", tone: "reserved" },
  { id: "B2", status: "Ocupado", tone: "occupied" },
  { id: "B3", status: "Libre", tone: "available" },
  { id: "B4", status: "Libre", tone: "available" },
  { id: "C1", status: "Libre", tone: "available" },
  { id: "C2", status: "Ocupado", tone: "occupied" },
  { id: "C3", status: "Libre", tone: "available" },
  { id: "C4", status: "Mantención", tone: "service" }
];

const travelCells: LockerCell[] = [
  { id: "L1", status: "Libre", tone: "available" },
  { id: "L2", status: "Ocupado", tone: "occupied" },
  { id: "L3", status: "Libre", tone: "available" },
  { id: "M1", status: "Reservado", tone: "reserved" },
  { id: "M2", status: "Libre", tone: "available" },
  { id: "M3", status: "Ocupado", tone: "occupied" },
  { id: "XL1", status: "Libre", tone: "available" },
  { id: "XL2", status: "Libre", tone: "available" }
];

const residentialTimeline: TimelineItem[] = [
  { title: "Entrega registrada", detail: "Paquete asignado a Departamento 1208." },
  { title: "Compartimiento asignado", detail: "Casillero B1 queda reservado para el residente." },
  { title: "PIN/QR enviado", detail: "Credencial de retiro disponible para el residente." },
  { title: "Retiro completado", detail: "Evento registrado con fecha, hora y compartimiento." }
];

const travelTimeline: TimelineItem[] = [
  { title: "Reserva iniciada", detail: "Pasajero elige tamaño mediano por 4 horas." },
  { title: "Equipaje guardado", detail: "Compartimiento M1 queda cerrado y asociado al ticket." },
  { title: "PIN/QR emitido", detail: "Acceso personal para retiro dentro del periodo contratado." },
  { title: "Retiro realizado", detail: "El compartimiento vuelve a quedar disponible." }
];

const applications = [
  "Condominios",
  "Edificios residenciales",
  "Terminales de buses",
  "Hoteles",
  "Empresas",
  "Universidades",
  "Centros comerciales",
  "Bodegaje temporal"
];

const qrPattern = [
  1, 1, 1, 0, 1, 0, 1,
  1, 0, 1, 0, 0, 1, 0,
  1, 1, 1, 1, 0, 1, 1,
  0, 0, 1, 0, 1, 0, 0,
  1, 0, 0, 1, 1, 1, 1,
  0, 1, 1, 0, 0, 0, 1,
  1, 0, 1, 1, 1, 0, 1
];

function getRoute(): Route {
  const path = window.location.pathname.replace(/\/+$/, "") || "/";
  if (path === "/residential" || path === "/travel") {
    return path;
  }
  return "/";
}

export default function App() {
  const [route, setRoute] = useState<Route>(getRoute);

  useEffect(() => {
    const handlePopState = () => setRoute(getRoute());
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, []);

  useEffect(() => {
    document.title = routeTitles[route];
  }, [route]);

  const pushRoute = (path: Route) => {
    if (window.location.pathname !== path) {
      window.history.pushState(null, "", path);
    }
    setRoute(path);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handleNavigate = (path: Route) => (event: MouseEvent<HTMLAnchorElement>) => {
    if (event.metaKey || event.ctrlKey || event.shiftKey || event.altKey) {
      return;
    }
    event.preventDefault();
    pushRoute(path);
  };

  const handleContact = (event: MouseEvent<HTMLAnchorElement>) => {
    event.preventDefault();
    const scrollToContact = () => {
      document.getElementById("contacto")?.scrollIntoView({ behavior: "smooth" });
    };

    if (route !== "/") {
      window.history.pushState(null, "", "/#contacto");
      setRoute("/");
      window.setTimeout(scrollToContact, 0);
      return;
    }

    scrollToContact();
  };

  return (
    <div className="site-shell">
      <Header route={route} onNavigate={handleNavigate} />
      <main>
        {route === "/" && <Home onNavigate={handleNavigate} onContact={handleContact} />}
        {route === "/residential" && <ResidentialPage />}
        {route === "/travel" && <TravelPage />}
      </main>
    </div>
  );
}

function Header({
  route,
  onNavigate
}: {
  route: Route;
  onNavigate: (path: Route) => (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <header className="site-header">
      <a className="brand" href="/" onClick={onNavigate("/")}>
        <span className="brand-mark" aria-hidden="true">
          <span />
          <span />
          <span />
          <span />
        </span>
        <span>QOLQA</span>
      </a>
      <nav className="site-nav" aria-label="Navegación principal">
        <a href="/" onClick={onNavigate("/")} aria-current={route === "/" ? "page" : undefined}>
          Home
        </a>
        <a
          href="/residential"
          onClick={onNavigate("/residential")}
          aria-current={route === "/residential" ? "page" : undefined}
        >
          Residential
        </a>
        <a
          href="/travel"
          onClick={onNavigate("/travel")}
          aria-current={route === "/travel" ? "page" : undefined}
        >
          Travel
        </a>
      </nav>
    </header>
  );
}

function Home({
  onNavigate,
  onContact
}: {
  onNavigate: (path: Route) => (event: MouseEvent<HTMLAnchorElement>) => void;
  onContact: (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <>
      <section className="hero-section">
        <div className="hero-visual" aria-hidden="true">
          <LockerBank cells={residentialCells.slice(0, 8)} mode="hero" />
        </div>
        <div className="section-inner hero-inner">
          <p className="eyebrow">Gestión de custodia inteligente</p>
          <h1>QOLQA</h1>
          <p className="hero-title">Casilleros inteligentes para operación real</p>
          <p className="hero-copy">
            Soluciones para automatizar la recepción, custodia y retiro de objetos en
            comunidades, terminales, hoteles, empresas y puntos de alta afluencia.
          </p>
          <div className="hero-actions">
            <a className="button primary" href="/residential" onClick={onNavigate("/residential")}>
              Ver QOLQA Residential
            </a>
            <a className="button secondary" href="/travel" onClick={onNavigate("/travel")}>
              Ver QOLQA Travel
            </a>
            <a className="button quiet" href="#contacto" onClick={onContact}>
              Contacto comercial
            </a>
          </div>
        </div>
      </section>

      <SolutionsSection onNavigate={onNavigate} />
      <HowItWorksSection />
      <AdministrationSection />
      <ApplicationsSection />
      <FinalContact />
    </>
  );
}

function SolutionsSection({
  onNavigate
}: {
  onNavigate: (path: Route) => (event: MouseEvent<HTMLAnchorElement>) => void;
}) {
  return (
    <section className="section-block">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">Soluciones</p>
          <h2>Líneas comerciales para operación continua</h2>
        </div>
        <div className="solution-grid">
          <article className="solution-card">
            <div className="solution-kicker">QOLQA Residential</div>
            <h3>Casilleros inteligentes para edificios y condominios.</h3>
            <p>
              Recepción segura de encomiendas, notificaciones, retiro con PIN/QR y
              trazabilidad completa.
            </p>
            <a href="/residential" onClick={onNavigate("/residential")}>
              Ver flujo residencial
            </a>
          </article>
          <article className="solution-card">
            <div className="solution-kicker">QOLQA Travel</div>
            <h3>Casilleros inteligentes para terminales, hoteles y espacios de alto flujo.</h3>
            <p>Custodia temporal de equipaje y objetos mediante acceso autónomo.</p>
            <a href="/travel" onClick={onNavigate("/travel")}>
              Ver flujo travel
            </a>
          </article>
        </div>
      </div>
    </section>
  );
}

function HowItWorksSection() {
  const steps = [
    "Se instala el sistema.",
    "Se configura la operación.",
    "Los usuarios acceden mediante PIN/QR.",
    "Todo queda registrado.",
    "La operación se administra desde una plataforma central."
  ];

  return (
    <section className="section-block muted-band">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">Cómo funciona</p>
          <h2>Un flujo simple para usuarios y administradores</h2>
        </div>
        <ol className="step-grid">
          {steps.map((step, index) => (
            <li key={step}>
              <span>{index + 1}</span>
              <p>{step}</p>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}

function AdministrationSection() {
  return (
    <section className="section-block admin-section">
      <div className="section-inner admin-layout">
        <div className="section-heading compact-heading">
          <p className="eyebrow">Administración</p>
          <h2>Visibilidad clara de cada operación</h2>
          <p>
            Una vista central permite revisar ocupación, actividad reciente, incidentes
            y tareas de mantenimiento sin interrumpir la operación diaria.
          </p>
        </div>
        <DashboardMock />
      </div>
    </section>
  );
}

function ApplicationsSection() {
  return (
    <section className="section-block">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">Aplicaciones</p>
          <h2>Espacios donde QOLQA aporta control y autonomía</h2>
        </div>
        <div className="application-grid">
          {applications.map((application) => (
            <div className="application-item" key={application}>
              {application}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function ResidentialPage() {
  const benefits = [
    "menos carga para conserjería",
    "retiro 24/7",
    "mayor seguridad",
    "trazabilidad por paquete",
    "mejor experiencia para residentes"
  ];

  return (
    <>
      <PageHero
        eyebrow="QOLQA Residential"
        title="Casilleros inteligentes para edificios y condominios"
        copy="Recepción segura de encomiendas, notificaciones, retiro con PIN/QR y trazabilidad completa."
      />
      <section className="section-block">
        <div className="section-inner flow-layout">
          <div className="flow-copy">
            <div className="section-heading compact-heading">
              <p className="eyebrow">Flujo residencial</p>
              <h2>De recepción a retiro, con trazabilidad por paquete</h2>
            </div>
            <ol className="flow-list">
              <li>Administrador registra una entrega.</li>
              <li>Selecciona residente/departamento.</li>
              <li>Sistema asigna compartimiento.</li>
              <li>Residente recibe PIN/QR.</li>
              <li>Residente retira paquete.</li>
              <li>Estado queda auditado.</li>
            </ol>
          </div>
          <div className="visual-stack">
            <LockerBank cells={residentialCells} mode="residential" />
            <DeliveryCard />
            <CredentialPanel code="483921" title="PIN de retiro" label="Departamento 1208" />
          </div>
        </div>
      </section>

      <section className="section-block muted-band">
        <div className="section-inner detail-grid">
          <StatusPanel
            title="Estado del compartimiento"
            label="B1"
            value="Reservado para retiro"
            meta="Paquete en custodia, retiro pendiente"
          />
          <Timeline title="Timeline de trazabilidad" items={residentialTimeline} />
        </div>
      </section>

      <BenefitsSection
        eyebrow="Beneficios para administración"
        title="Menos fricción operativa, más control para la comunidad"
        benefits={benefits}
      />
      <FinalContact />
    </>
  );
}

function TravelPage() {
  const benefits = [
    "nuevo servicio para pasajeros",
    "ingreso por arriendo de espacio",
    "sin inversión del terminal",
    "operación autónoma",
    "mejora experiencia de viaje"
  ];

  return (
    <>
      <PageHero
        eyebrow="QOLQA Travel"
        title="Casilleros inteligentes para terminales, hoteles y espacios de alto flujo"
        copy="Custodia temporal de equipaje y objetos mediante acceso autónomo."
      />
      <section className="section-block">
        <div className="section-inner flow-layout">
          <div className="flow-copy">
            <div className="section-heading compact-heading">
              <p className="eyebrow">Flujo travel</p>
              <h2>Custodia temporal rápida para pasajeros y visitantes</h2>
            </div>
            <ol className="flow-list">
              <li>Pasajero selecciona tamaño/tiempo.</li>
              <li>Guarda equipaje.</li>
              <li>Recibe PIN/QR.</li>
              <li>Retira cuando lo necesite.</li>
            </ol>
          </div>
          <div className="visual-stack travel-stack">
            <LockerBank cells={travelCells} mode="travel" />
            <TicketCard />
            <CredentialPanel code="759204" title="PIN/QR de acceso" label="Reserva M1" />
          </div>
        </div>
      </section>

      <section className="section-block muted-band">
        <div className="section-inner detail-grid">
          <TimerPanel />
          <Timeline title="Timeline de uso" items={travelTimeline} />
        </div>
      </section>

      <BenefitsSection
        eyebrow="Beneficios para terminal"
        title="Un servicio adicional con operación autónoma"
        benefits={benefits}
      />
      <FinalContact />
    </>
  );
}

function PageHero({
  eyebrow,
  title,
  copy
}: {
  eyebrow: string;
  title: string;
  copy: string;
}) {
  return (
    <section className="page-hero">
      <div className="section-inner page-hero-inner">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
      </div>
    </section>
  );
}

function LockerBank({ cells, mode }: { cells: LockerCell[]; mode: "hero" | "residential" | "travel" }) {
  return (
    <div className={`locker-bank ${mode}`} aria-label="Representación visual de lockers QOLQA">
      <div className="locker-top">
        <strong>QOLQA</strong>
        <span>Acceso PIN/QR</span>
      </div>
      <div className="locker-grid">
        {cells.map((cell) => (
          <div className={`locker-cell ${cell.tone}`} key={cell.id}>
            <strong>{cell.id}</strong>
            <span>{cell.status}</span>
          </div>
        ))}
      </div>
      <div className="locker-footer">
        <span>Estado sincronizado</span>
      </div>
    </div>
  );
}

function DeliveryCard() {
  return (
    <article className="info-card delivery-card">
      <div>
        <span className="card-label">Tarjeta de entrega</span>
        <h3>Encomienda R-204</h3>
      </div>
      <dl>
        <div>
          <dt>Residente</dt>
          <dd>Departamento 1208</dd>
        </div>
        <div>
          <dt>Compartimiento</dt>
          <dd>B1</dd>
        </div>
        <div>
          <dt>Estado</dt>
          <dd>En custodia</dd>
        </div>
      </dl>
    </article>
  );
}

function TicketCard() {
  return (
    <article className="info-card ticket-card">
      <div>
        <span className="card-label">Ticket de reserva</span>
        <h3>Reserva TR-318</h3>
      </div>
      <dl>
        <div>
          <dt>Tamaño</dt>
          <dd>Mediano</dd>
        </div>
        <div>
          <dt>Tiempo</dt>
          <dd>4 horas</dd>
        </div>
        <div>
          <dt>Compartimiento</dt>
          <dd>M1</dd>
        </div>
      </dl>
    </article>
  );
}

function CredentialPanel({
  code,
  title,
  label
}: {
  code: string;
  title: string;
  label: string;
}) {
  return (
    <article className="credential-panel">
      <div>
        <span className="card-label">{title}</span>
        <strong>{code}</strong>
        <small>{label}</small>
      </div>
      <QrMock />
    </article>
  );
}

function QrMock() {
  return (
    <div className="qr-mock" aria-label="Código QR de ejemplo">
      {qrPattern.map((cell, index) => (
        <span className={cell ? "filled" : ""} key={`${cell}-${index}`} />
      ))}
    </div>
  );
}

function StatusPanel({
  title,
  label,
  value,
  meta
}: {
  title: string;
  label: string;
  value: string;
  meta: string;
}) {
  return (
    <article className="status-panel">
      <span className="card-label">{title}</span>
      <div className="status-main">
        <strong>{label}</strong>
        <div>
          <p>{value}</p>
          <small>{meta}</small>
        </div>
      </div>
    </article>
  );
}

function TimerPanel() {
  return (
    <article className="status-panel timer-panel">
      <span className="card-label">Temporizador de custodia</span>
      <div className="timer-value">02:45:00</div>
      <p>Tiempo restante para retiro sin extensión.</p>
    </article>
  );
}

function Timeline({ title, items }: { title: string; items: TimelineItem[] }) {
  return (
    <article className="timeline-panel">
      <span className="card-label">{title}</span>
      <ol className="timeline">
        {items.map((item) => (
          <li key={item.title}>
            <span className="timeline-dot" aria-hidden="true" />
            <div>
              <strong>{item.title}</strong>
              <p>{item.detail}</p>
            </div>
          </li>
        ))}
      </ol>
    </article>
  );
}

function BenefitsSection({
  eyebrow,
  title,
  benefits
}: {
  eyebrow: string;
  title: string;
  benefits: string[];
}) {
  return (
    <section className="section-block">
      <div className="section-inner">
        <div className="section-heading">
          <p className="eyebrow">{eyebrow}</p>
          <h2>{title}</h2>
        </div>
        <div className="benefit-grid">
          {benefits.map((benefit) => (
            <div className="benefit-item" key={benefit}>
              <span aria-hidden="true" />
              <p>{benefit}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function DashboardMock() {
  return (
    <div className="dashboard-mock" aria-label="Vista simplificada de administración QOLQA">
      <div className="dashboard-top">
        <div>
          <span className="card-label">Estado de lockers</span>
          <strong>86% operativos</strong>
        </div>
        <div>
          <span className="card-label">Ocupación</span>
          <strong>64%</strong>
        </div>
      </div>
      <div className="dashboard-body">
        <section className="dashboard-panel">
          <h3>Eventos recientes</h3>
          <ul>
            <li>
              <span className="dot success" />
              Retiro completado, Torre Norte
            </li>
            <li>
              <span className="dot info" />
              Nueva entrega registrada
            </li>
            <li>
              <span className="dot warn" />
              Reserva por vencer
            </li>
          </ul>
        </section>
        <section className="dashboard-panel">
          <h3>Incidentes</h3>
          <p>1 caso en seguimiento</p>
          <h3>Mantenimiento</h3>
          <p>2 tareas programadas</p>
        </section>
      </div>
    </div>
  );
}

function FinalContact() {
  return (
    <footer className="contact-section" id="contacto">
      <div className="section-inner contact-inner">
        <div>
          <p className="eyebrow">QOLQA</p>
          <h2>Contacto comercial</h2>
        </div>
        <address className="contact-list">
          <a href="mailto:admin@qolqa.cl">admin@qolqa.cl</a>
          <a href="https://www.qolqa.cl">www.qolqa.cl</a>
          <a href="tel:+56982257474">+56 9 8225 7474</a>
        </address>
      </div>
    </footer>
  );
}
