import { useEffect, useState, type ReactNode } from "react";

type Route = "/residential" | "/travel" | "/kiosk" | "unknown";
type ResidentialDemoStep = "arrival" | "recipient" | "deposit" | "notice" | "pickup" | "done";
type TravelDemoStep = "choice" | "size" | "time" | "data" | "payment" | "confirmed" | "store-open" | "stored" | "pickup" | "pickup-open" | "done";
type TravelDemoMode = "store" | "pickup" | null;
type KioskExperience = "select" | "residential" | "travel";
type ResidentialKioskMode = "home" | "deliver-unit" | "deliver-confirm" | "deliver-open" | "deliver-done" | "pickup-code" | "pickup-confirm" | "pickup-open" | "pickup-done";
type TravelKioskMode = "home" | "store-size" | "store-time" | "store-data" | "store-summary" | "store-pay" | "store-confirmed" | "store-open" | "store-done" | "pickup-code" | "pickup-confirm" | "pickup-open" | "pickup-done";
type LockerSize = "Mediano" | "Grande";
type KioskTravelSize = "Mediano" | "Grande";
type TravelTime = "2 horas" | "6 horas" | "12 horas" | "24 horas";

type ResidentialKioskState = {
  mode: ResidentialKioskMode;
  unit: string;
  receiver: string;
  foundName: string;
  locker: string;
  pin: string;
};

type TravelPassenger = {
  name: string;
  whatsapp: string;
  email: string;
  documentType: string;
  document: string;
};

type TravelKioskState = {
  mode: TravelKioskMode;
  size: KioskTravelSize;
  time: TravelTime;
  passenger: TravelPassenger;
  payment: string;
  locker: string;
  pin: string;
};

const residentialLookup: Record<string, string> = {
  "1204": "María González",
  "803": "Claudio Pérez",
  "514": "Ana Rojas",
  "210": "Javier Soto"
};

const prices: Record<TravelTime, number> = {
  "2 horas": 2500,
  "6 horas": 5200,
  "12 horas": 7800,
  "24 horas": 12000
};

const defaultResidentialKiosk: ResidentialKioskState = {
  mode: "home",
  unit: "",
  receiver: "",
  foundName: "",
  locker: "B-12",
  pin: "482913"
};

const defaultTravelKiosk: TravelKioskState = {
  mode: "home",
  size: "Mediano",
  time: "6 horas",
  passenger: {
    name: "",
    whatsapp: "",
    email: "",
    documentType: "RUT",
    document: ""
  },
  payment: "Webpay",
  locker: "M-08",
  pin: "759204"
};

const qrCells = [
  1, 1, 1, 0, 1, 0, 1,
  1, 0, 1, 0, 0, 1, 0,
  1, 1, 1, 1, 0, 1, 1,
  0, 0, 1, 0, 1, 0, 0,
  1, 0, 0, 1, 1, 1, 1,
  0, 1, 1, 0, 0, 0, 1,
  1, 0, 1, 1, 1, 0, 1
];

function getRoute(): Route {
  const pathname = window.location.pathname.replace(/\/+$/, "");
  if (pathname === "/residential") return "/residential";
  if (pathname === "/travel") return "/travel";
  if (pathname === "/kiosk") return "/kiosk";
  return "unknown";
}

function formatPrice(value: number) {
  return new Intl.NumberFormat("es-CL", {
    style: "currency",
    currency: "CLP",
    maximumFractionDigits: 0
  }).format(value);
}

function travelPrice(size: LockerSize | KioskTravelSize, time: TravelTime) {
  const amount = prices[time];
  return size === "Grande" ? Math.round(amount * 1.45) : amount;
}

function saveFakeQr(name: string) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="320" height="320" viewBox="0 0 320 320"><rect width="320" height="320" fill="white"/><text x="160" y="34" text-anchor="middle" font-family="Arial" font-size="18" font-weight="700" fill="#071a2f">QOLQA</text>${qrCells.map((cell, index) => {
    const x = 42 + (index % 7) * 34;
    const y = 62 + Math.floor(index / 7) * 34;
    return `<rect x="${x}" y="${y}" width="28" height="28" rx="3" fill="${cell ? "#071a2f" : "#edf2f7"}"/>`;
  }).join("")}</svg>`;
  const url = URL.createObjectURL(new Blob([svg], { type: "image/svg+xml" }));
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
}

export default function App() {
  const [route] = useState<Route>(getRoute);

  useEffect(() => {
    document.title = route === "/residential"
      ? "QOLQA Residential | Experiencia de retiro"
      : route === "/travel"
        ? "QOLQA Travel | Experiencia de equipaje"
        : route === "/kiosk"
          ? "QOLQA Kiosk | Pantalla del locker"
          : "QOLQA";
  }, [route]);

  if (route === "/residential") return <ResidentialExperience />;
  if (route === "/travel") return <TravelExperience />;
  if (route === "/kiosk") return <KioskExperience />;

  return (
    <main className="route-empty">
      <p>Ruta no disponible.</p>
    </main>
  );
}

function ResidentialExperience() {
  const [step, setStep] = useState<ResidentialDemoStep>("arrival");
  const stepIndex = ["arrival", "recipient", "deposit", "notice", "pickup", "done"].indexOf(step);

  return (
    <DemoShell label="QOLQA Residential" title="Tu paquete, listo para retirar">
      <Progress current={stepIndex + 1} total={6} />
      {step === "arrival" && (
        <VisualScreen
          eyebrow="Edificio residencial"
          title="Estoy esperando un paquete"
          copy="El courier llega al edificio y usa la pantalla del locker para dejar la entrega."
          visual={<BuildingScene />}
          action={<button className="primary-action" onClick={() => setStep("recipient")}>Entregar paquete</button>}
        />
      )}
      {step === "recipient" && (
        <VisualScreen
          eyebrow="Datos de entrega"
          title="Departamento y residente"
          copy="El repartidor ingresa la unidad. El nombre ayuda a confirmar que el paquete va al destino correcto."
          visual={<RecipientFormPreview />}
          action={<button className="primary-action" onClick={() => setStep("deposit")}>Continuar</button>}
        />
      )}
      {step === "deposit" && (
        <VisualScreen
          eyebrow="Casillero asignado"
          title="Puerta abierta"
          copy="QOLQA asigna un compartimiento disponible. El repartidor deja el paquete y cierra la puerta."
          visual={<LockerScene active="B-12" open />}
          action={<button className="primary-action" onClick={() => setStep("notice")}>Paquete depositado</button>}
        />
      )}
      {step === "notice" && (
        <VisualScreen
          eyebrow="Notificación inmediata"
          title="Tu paquete ya se encuentra disponible"
          copy="El residente recibe sus datos de retiro según el plan contratado."
          visual={<NotificationScene />}
          action={<button className="primary-action" onClick={() => setStep("pickup")}>Ir al locker</button>}
        />
      )}
      {step === "pickup" && (
        <VisualScreen
          eyebrow="Retiro autónomo"
          title="PIN o QR"
          copy="El residente llega al locker, ingresa su PIN o escanea el QR. La puerta se abre."
          visual={<PickupScene />}
          action={<button className="primary-action" onClick={() => setStep("done")}>Retirar paquete</button>}
        />
      )}
      {step === "done" && (
        <VisualScreen
          eyebrow="Listo"
          title="Entrega completada"
          copy="El paquete fue retirado de forma segura, sin depender de la conserjería."
          visual={<CompletedScene label="Paquete retirado" />}
          action={<button className="secondary-action" onClick={() => setStep("arrival")}>Ver nuevamente</button>}
        />
      )}
      <BenefitStrip
        title="Beneficios Residential"
        items={[
          "No depender de la conserjería.",
          "Retiro 24/7.",
          "Notificación inmediata.",
          "Mayor seguridad.",
          "Historial completo.",
          "Sin pérdida de paquetes."
        ]}
      />
    </DemoShell>
  );
}

function TravelExperience() {
  const [step, setStep] = useState<TravelDemoStep>("choice");
  const [mode, setMode] = useState<TravelDemoMode>(null);
  const [size, setSize] = useState<LockerSize>("Mediano");
  const [time, setTime] = useState<TravelTime>("6 horas");
  const activeSteps = mode === "pickup"
    ? ["choice", "pickup", "pickup-open", "done"]
    : ["choice", "size", "time", "data", "payment", "confirmed", "store-open", "stored"];

  const resetTravel = () => {
    setMode(null);
    setStep("choice");
  };

  const selectSize = (nextSize: LockerSize) => {
    setSize(nextSize);
    setStep("time");
  };

  const selectTime = (nextTime: TravelTime) => {
    setTime(nextTime);
    setStep("data");
  };

  return (
    <DemoShell label="QOLQA Travel" title="Guarda tu equipaje y sigue tu viaje">
      <Progress current={activeSteps.indexOf(step) + 1} total={activeSteps.length} />
      {step === "choice" && (
        <VisualScreen
          eyebrow="Inicio"
          title="¿Qué quieres hacer?"
          copy="Elige la acción que usarías frente al locker."
          visual={<TravelChoiceScene />}
          action={(
            <div className="split-actions">
              <button className="primary-action" onClick={() => { setMode("store"); setStep("size"); }}>Guardar equipaje</button>
              <button className="secondary-action" onClick={() => { setMode("pickup"); setStep("pickup"); }}>Retirar equipaje</button>
            </div>
          )}
        />
      )}
      {step === "size" && (
        <VisualScreen
          eyebrow="Paso 1"
          title="Elige tamaño"
          copy="Selecciona el compartimiento según lo que llevas contigo. Al tocar una opción avanzas al siguiente paso."
          visual={<SizeSelector selected={size} onSelect={selectSize} />}
          action={<span className="screen-hint">Toca un tamaño para continuar</span>}
        />
      )}
      {step === "time" && (
        <VisualScreen
          eyebrow="Paso 2"
          title="Elige tiempo"
          copy="Puedes guardar tu equipaje por algunas horas o por todo el día."
          visual={<TimeSelector selected={time} onSelect={selectTime} />}
          action={<span className="screen-hint">Toca el tiempo que necesitas</span>}
        />
      )}
      {step === "data" && (
        <VisualScreen
          eyebrow="Paso 3"
          title="Datos del pasajero"
          copy="Estos datos se utilizan para seguridad, trazabilidad y contacto ante incidencias."
          visual={<PassengerDataScene />}
          action={<button className="primary-action" onClick={() => setStep("payment")}>Ver valor</button>}
        />
      )}
      {step === "payment" && (
        <VisualScreen
          eyebrow="Pago"
          title={formatPrice(travelPrice(size, time))}
          copy={`${size} por ${time}. Puedes continuar con los medios de pago disponibles. No se realiza cobro real.`}
          visual={<PaymentScene />}
          action={<button className="primary-action" onClick={() => setStep("confirmed")}>Continuar al pago</button>}
        />
      )}
      {step === "confirmed" && (
        <VisualScreen
          eyebrow="Reserva confirmada"
          title="Tu acceso está listo"
          copy="Guarda el PIN o QR. También puedes recibirlo por correo electrónico o SMS."
          visual={<TicketScene pin="759204" locker="M-08" time={time} />}
          action={<button className="primary-action" onClick={() => setStep("store-open")}>Abrir casillero</button>}
          extra={<button className="text-action" onClick={() => saveFakeQr("qolqa-travel-qr.svg")}>Guardar QR como imagen</button>}
        />
      )}
      {step === "store-open" && (
        <VisualScreen
          eyebrow="Guardar equipaje"
          title="Puerta abierta"
          copy="Deja el equipaje en el compartimiento asignado y cierra la puerta."
          visual={<TravelLockerVisual size={size} open />}
          action={<button className="primary-action" onClick={() => setStep("stored")}>Equipaje guardado</button>}
        />
      )}
      {step === "stored" && (
        <VisualScreen
          eyebrow="Listo"
          title="Equipaje guardado correctamente"
          copy="Tu equipaje queda seguro hasta que vuelvas a retirarlo con PIN o QR."
          visual={<CompletedScene label="Reserva activa" />}
          action={<button className="secondary-action" onClick={resetTravel}>Volver al inicio</button>}
        />
      )}
      {step === "pickup" && (
        <VisualScreen
          eyebrow="Retiro"
          title="Escanea QR o ingresa PIN"
          copy="Usa el acceso recibido para validar tu reserva y abrir el compartimiento."
          visual={<TravelPickupScene />}
          action={<button className="primary-action" onClick={() => setStep("pickup-open")}>Validar acceso</button>}
          extra={<button className="text-action" onClick={resetTravel}>Volver al inicio</button>}
        />
      )}
      {step === "pickup-open" && (
        <VisualScreen
          eyebrow="Retiro"
          title="Puerta abierta"
          copy="Retira tu equipaje y cierra la puerta para finalizar."
          visual={<TravelLockerVisual size={size} open />}
          action={<button className="primary-action" onClick={() => setStep("done")}>Retirar equipaje</button>}
        />
      )}
      {step === "done" && (
        <VisualScreen
          eyebrow="Listo"
          title="Gracias por usar QOLQA"
          copy="Equipaje retirado correctamente."
          visual={<CompletedScene label="Equipaje retirado" />}
          action={<button className="secondary-action" onClick={resetTravel}>Volver al inicio</button>}
        />
      )}
      <TravelInfoSection />
      <BenefitStrip
        title="Beneficios Travel"
        items={[
          "Equipaje seguro.",
          "PIN o QR.",
          "Disponible 24/7.",
          "Carga USB.",
          "Sin filas.",
          "Sin depender del personal."
        ]}
      />
    </DemoShell>
  );
}

function KioskExperience() {
  const [experience, setExperience] = useStoredState<KioskExperience>("qolqa:kiosk:experience", "select");
  const [residential, setResidential] = useStoredState<ResidentialKioskState>("qolqa:kiosk:residential", defaultResidentialKiosk);
  const [travel, setTravel] = useStoredState<TravelKioskState>("qolqa:kiosk:travel", defaultTravelKiosk);

  const reset = () => {
    setExperience("select");
    setResidential(defaultResidentialKiosk);
    setTravel(defaultTravelKiosk);
  };

  return (
    <main className="kiosk-shell">
      <div className="kiosk-frame">
        <header className="kiosk-header">
          <strong>QOLQA</strong>
          <span>Pantalla del locker</span>
        </header>
        {experience === "select" && (
          <section className="kiosk-selector">
            <p className="kiosk-eyebrow">Seleccione experiencia QOLQA</p>
            <h1>¿Qué quieres mostrar?</h1>
            <div className="kiosk-choice-grid">
              <button onClick={() => setExperience("residential")}>
                <span className="choice-illustration residential" />
                <strong>QOLQA Residential</strong>
                <small>Paquetes en edificios y condominios</small>
              </button>
              <button onClick={() => setExperience("travel")}>
                <span className="choice-illustration travel" />
                <strong>QOLQA Travel</strong>
                <small>Equipaje en terminales y hoteles</small>
              </button>
            </div>
          </section>
        )}
        {experience === "residential" && (
          <ResidentialKiosk
            state={residential}
            setState={setResidential}
            goHome={() => setResidential({ ...defaultResidentialKiosk })}
          />
        )}
        {experience === "travel" && (
          <TravelKiosk
            state={travel}
            setState={setTravel}
            goHome={() => setTravel({ ...defaultTravelKiosk })}
          />
        )}
        <footer className="kiosk-footer">
          <button className="ghost-control" onClick={() => setExperience("select")}>Volver al inicio</button>
          <button className="ghost-control" onClick={reset}>Reiniciar demo</button>
        </footer>
      </div>
    </main>
  );
}

function ResidentialKiosk({
  state,
  setState,
  goHome
}: {
  state: ResidentialKioskState;
  setState: (value: ResidentialKioskState) => void;
  goHome: () => void;
}) {
  const setMode = (mode: ResidentialKioskMode) => setState({ ...state, mode });
  const receiver = state.foundName || state.receiver || "Residente registrado";

  if (state.mode === "home") {
    return (
      <KioskPanel title="Residential" subtitle="El residente ya está previamente registrado.">
        <div className="kiosk-action-grid">
          <button className="touch-button" onClick={() => setMode("deliver-unit")}>Entregar paquete</button>
          <button className="touch-button secondary" onClick={() => setMode("pickup-code")}>Retirar paquete</button>
        </div>
        <p className="soft-note">QOLQA notifica automáticamente y no depende de conserjería.</p>
      </KioskPanel>
    );
  }

  if (state.mode === "deliver-unit") {
    return (
      <KioskPanel title="Entregar paquete" subtitle="Ingresa la unidad del residente.">
        <label className="field">
          Número de departamento/casa
          <input
            value={state.unit}
            placeholder="1204"
            onChange={(event) => setState({ ...state, unit: event.target.value })}
          />
        </label>
        <label className="field">
          Nombre del receptor, opcional
          <input
            value={state.receiver}
            placeholder="María González"
            onChange={(event) => setState({ ...state, receiver: event.target.value })}
          />
        </label>
        <button
          className="touch-button"
          disabled={!state.unit.trim()}
          onClick={() => {
            const foundName = residentialLookup[state.unit.trim()] || state.receiver || "Residente registrado";
            setState({ ...state, foundName, receiver: state.receiver || foundName, mode: "deliver-confirm" });
          }}
        >
          Buscar residente registrado
        </button>
      </KioskPanel>
    );
  }

  if (state.mode === "deliver-confirm") {
    return (
      <KioskPanel title="Confirmar destinatario" subtitle="Unidad asociada a una persona registrada.">
        <RecipientBadge unit={state.unit} name={receiver} />
        <button className="touch-button" onClick={() => setMode("deliver-open")}>Confirmar destinatario</button>
      </KioskPanel>
    );
  }

  if (state.mode === "deliver-open") {
    return (
      <KioskPanel title="Abriendo casillero" subtitle={`Casillero asignado ${state.locker}`}>
        <LockerScene active={state.locker} open />
        <button className="touch-button" onClick={() => setMode("deliver-done")}>Paquete depositado</button>
      </KioskPanel>
    );
  }

  if (state.mode === "deliver-done") {
    return (
      <KioskPanel title="Paquete depositado" subtitle="El residente recibirá sus datos de retiro.">
        <NotificationMini pin={state.pin} />
        <button className="touch-button" onClick={goHome}>Finalizar</button>
      </KioskPanel>
    );
  }

  if (state.mode === "pickup-code") {
    return (
      <KioskPanel title="Retirar paquete" subtitle="Ingresa PIN o escanea el QR recibido.">
        <label className="field">
          PIN
          <input
            value={state.pin}
            onChange={(event) => setState({ ...state, pin: event.target.value })}
          />
        </label>
        <div className="kiosk-action-grid two">
          <button className="touch-button" onClick={() => setMode("pickup-confirm")}>Ingresar PIN</button>
          <button className="touch-button secondary" onClick={() => setMode("pickup-confirm")}>Escanear QR</button>
        </div>
      </KioskPanel>
    );
  }

  if (state.mode === "pickup-confirm") {
    return (
      <KioskPanel title="Reserva encontrada" subtitle="Confirma el retiro.">
        <RecipientBadge unit={state.unit || "1204"} name={receiver} />
        <button className="touch-button" onClick={() => setMode("pickup-open")}>Abrir casillero</button>
      </KioskPanel>
    );
  }

  if (state.mode === "pickup-open") {
    return (
      <KioskPanel title="Abriendo casillero" subtitle={`Casillero ${state.locker}`}>
        <LockerScene active={state.locker} open />
        <button className="touch-button" onClick={() => setMode("pickup-done")}>Confirmar retiro</button>
      </KioskPanel>
    );
  }

  return (
    <KioskPanel title="Entrega completada" subtitle="Retiro realizado de forma segura.">
      <CompletedScene label="Paquete retirado" />
      <button className="touch-button" onClick={goHome}>Finalizar</button>
    </KioskPanel>
  );
}

function TravelKiosk({
  state,
  setState,
  goHome
}: {
  state: TravelKioskState;
  setState: (value: TravelKioskState) => void;
  goHome: () => void;
}) {
  const setMode = (mode: TravelKioskMode) => setState({ ...state, mode });
  const dataReady = Object.values(state.passenger).every((value) => value.trim().length > 2);

  if (state.mode === "home") {
    return (
      <KioskPanel title="Travel" subtitle="Guarda tu equipaje mientras esperas.">
        <div className="kiosk-action-grid">
          <button className="touch-button" onClick={() => setMode("store-size")}>Guardar equipaje</button>
          <button className="touch-button secondary" onClick={() => setMode("pickup-code")}>Retirar equipaje</button>
        </div>
        <p className="soft-note">PIN o QR, sin filas y sin depender del personal del terminal.</p>
      </KioskPanel>
    );
  }

  if (state.mode === "store-size") {
    return (
      <KioskPanel title="Selecciona tamaño" subtitle="Elige según tu equipaje.">
        <div className="size-cards kiosk-sizes">
          {(["Mediano", "Grande"] as KioskTravelSize[]).map((size) => (
            <button
              className={state.size === size ? "selected" : ""}
              key={size}
              onClick={() => setState({ ...state, size })}
            >
              <span className={`bag-illustration ${size.toLowerCase()}`} />
              <strong>{size}</strong>
              <small>{size === "Mediano" ? "mochila, bolso, carry-on" : "maleta grande, equipaje voluminoso"}</small>
            </button>
          ))}
        </div>
        <button className="touch-button" onClick={() => setMode("store-time")}>Continuar</button>
      </KioskPanel>
    );
  }

  if (state.mode === "store-time") {
    return (
      <KioskPanel title="Selecciona tiempo" subtitle="Elige cuánto tiempo necesitas.">
        <div className="time-grid">
          {(["2 horas", "6 horas", "12 horas", "24 horas"] as TravelTime[]).map((time) => (
            <button
              className={state.time === time ? "selected" : ""}
              key={time}
              onClick={() => setState({ ...state, time })}
            >
              {time}
            </button>
          ))}
        </div>
        <button className="touch-button" onClick={() => setMode("store-data")}>Continuar</button>
      </KioskPanel>
    );
  }

  if (state.mode === "store-data") {
    return (
      <KioskPanel title="Datos del pasajero" subtitle="Necesarios para seguridad y contacto.">
        <div className="form-grid">
          {[
            ["name", "Nombre completo"],
            ["whatsapp", "WhatsApp"],
            ["email", "Correo electrónico"],
            ["documentType", "Tipo documento"],
            ["document", "Numero documento"]
          ].map(([key, label]) => (
            <label className="field" key={key}>
              {label}
              <input
                value={state.passenger[key as keyof TravelPassenger]}
                onChange={(event) => setState({
                  ...state,
                  passenger: { ...state.passenger, [key]: event.target.value }
                })}
              />
            </label>
          ))}
        </div>
        <p className="privacy-note">Estos datos se utilizan para seguridad, trazabilidad y contacto ante incidencias.</p>
        <button className="touch-button" disabled={!dataReady} onClick={() => setMode("store-summary")}>Ver resumen</button>
      </KioskPanel>
    );
  }

  if (state.mode === "store-summary") {
    return (
      <KioskPanel title="Resumen" subtitle="Confirma antes de pagar.">
        <SummaryList
          rows={[
            ["Tamaño", state.size],
            ["Tiempo", state.time],
            ["Precio estimado", formatPrice(travelPrice(state.size, state.time))],
            ["Pasajero", state.passenger.name],
            ["Contacto", state.passenger.whatsapp]
          ]}
        />
        <button className="touch-button" onClick={() => setMode("store-pay")}>Continuar al pago</button>
      </KioskPanel>
    );
  }

  if (state.mode === "store-pay") {
    return (
      <KioskPanel title="Pago" subtitle="Selecciona medio de pago.">
        <div className="payment-row">
          {["Webpay", "Mercado Pago", "Tarjeta"].map((payment) => (
            <button
              className={state.payment === payment ? "selected" : ""}
              key={payment}
              onClick={() => setState({ ...state, payment })}
            >
              {payment}
            </button>
          ))}
        </div>
        <button className="touch-button" onClick={() => setMode("store-confirmed")}>Confirmar reserva</button>
      </KioskPanel>
    );
  }

  if (state.mode === "store-confirmed") {
    return (
      <KioskPanel title="Reserva confirmada" subtitle="Guarda tus datos de acceso.">
        <TicketScene pin={state.pin} locker={state.locker} time={state.time} />
        <div className="kiosk-action-grid two">
          <button className="touch-button secondary" onClick={() => saveFakeQr("qolqa-travel-qr.svg")}>Guardar QR como imagen</button>
          <button className="touch-button secondary">Enviar comprobante por correo</button>
        </div>
        <button className="touch-button" onClick={() => setMode("store-open")}>Abrir casillero</button>
      </KioskPanel>
    );
  }

  if (state.mode === "store-open") {
    return (
      <KioskPanel title="Abriendo casillero" subtitle={`Casillero ${state.locker}`}>
        <TravelLockerVisual size={state.size} open />
        <button className="touch-button" onClick={() => setMode("store-done")}>Equipaje guardado correctamente</button>
      </KioskPanel>
    );
  }

  if (state.mode === "store-done") {
    return (
      <KioskPanel title="Equipaje guardado correctamente" subtitle="Puedes esperar tu viaje sin cargar maletas.">
        <UsbChargeScene compact />
        <button className="touch-button" onClick={goHome}>Finalizar</button>
      </KioskPanel>
    );
  }

  if (state.mode === "pickup-code") {
    return (
      <KioskPanel title="Retirar equipaje" subtitle="Ingresa PIN o escanea QR.">
        <label className="field">
          PIN
          <input
            value={state.pin}
            onChange={(event) => setState({ ...state, pin: event.target.value })}
          />
        </label>
        <div className="kiosk-action-grid two">
          <button className="touch-button" onClick={() => setMode("pickup-confirm")}>Ingresar PIN</button>
          <button className="touch-button secondary" onClick={() => setMode("pickup-confirm")}>Escanear QR</button>
        </div>
      </KioskPanel>
    );
  }

  if (state.mode === "pickup-confirm") {
    return (
      <KioskPanel title="Reserva validada" subtitle="Confirma los datos antes de abrir.">
        <SummaryList
          rows={[
            ["Nombre", state.passenger.name || "Pasajero QOLQA"],
            ["Tiempo contratado", state.time],
            ["Casillero", state.locker]
          ]}
        />
        <button className="touch-button" onClick={() => setMode("pickup-open")}>Abrir casillero</button>
      </KioskPanel>
    );
  }

  if (state.mode === "pickup-open") {
    return (
      <KioskPanel title="Abriendo casillero" subtitle={`Casillero ${state.locker}`}>
        <TravelLockerVisual size={state.size} open />
        <button className="touch-button" onClick={() => setMode("pickup-done")}>Confirmar retiro</button>
      </KioskPanel>
    );
  }

  return (
    <KioskPanel title="Gracias por usar QOLQA" subtitle="Retiro completado.">
      <CompletedScene label="Equipaje retirado" />
      <button className="touch-button" onClick={goHome}>Finalizar</button>
    </KioskPanel>
  );
}

function useStoredState<T>(key: string, initialValue: T) {
  const [state, setState] = useState<T>(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) as T : initialValue;
    } catch {
      return initialValue;
    }
  });

  useEffect(() => {
    localStorage.setItem(key, JSON.stringify(state));
  }, [key, state]);

  return [state, setState] as const;
}

function DemoShell({ label, title, children }: { label: string; title: string; children: ReactNode }) {
  return (
    <main className="demo-shell">
      <header className="demo-header">
        <div>
          <strong>QOLQA</strong>
          <span>{label}</span>
        </div>
        <p>{title}</p>
      </header>
      {children}
    </main>
  );
}

function VisualScreen({
  eyebrow,
  title,
  copy,
  visual,
  action,
  extra
}: {
  eyebrow: string;
  title: string;
  copy: string;
  visual: ReactNode;
  action: ReactNode;
  extra?: ReactNode;
}) {
  return (
    <section className="visual-screen">
      <div className="screen-copy">
        <p className="eyebrow">{eyebrow}</p>
        <h1>{title}</h1>
        <p>{copy}</p>
        <div className="action-row">
          {action}
          {extra}
        </div>
      </div>
      <div className="screen-visual">{visual}</div>
    </section>
  );
}

function Progress({ current, total }: { current: number; total: number }) {
  return (
    <div className="progress-dots" aria-label={`Paso ${current} de ${total}`}>
      {Array.from({ length: total }, (_, index) => (
        <span className={index < current ? "active" : ""} key={index} />
      ))}
    </div>
  );
}

function BuildingScene() {
  return (
    <div className="scene building-scene">
      <div className="building">
        {Array.from({ length: 16 }, (_, index) => <span key={index} />)}
      </div>
      <div className="courier">
        <span className="person-head" />
        <span className="person-body" />
        <span className="package" />
      </div>
      <div className="screen-card">Entregar paquete</div>
    </div>
  );
}

function RecipientFormPreview() {
  return (
    <div className="phone-panel">
      <span className="panel-title">Entrega</span>
      <label>Departamento<input readOnly value="1204" /></label>
      <label>Residente<input readOnly value="María González" /></label>
      <div className="mini-confirm">Casillero disponible</div>
    </div>
  );
}

function TravelChoiceScene() {
  return (
    <div className="travel-choice-scene">
      <article>
        <span className="bag-illustration mediano" />
        <strong>Guardar equipaje</strong>
        <small>Elige tamaño, tiempo y recibe PIN/QR.</small>
      </article>
      <article>
        <QrCode />
        <strong>Retirar equipaje</strong>
        <small>Escanea QR o ingresa PIN para abrir.</small>
      </article>
    </div>
  );
}

function PassengerDataScene() {
  return (
    <div className="phone-panel">
      <span className="panel-title">Guardar equipaje</span>
      <label>Nombre completo<input readOnly value="Camila Torres" /></label>
      <label>WhatsApp<input readOnly value="+56 9 1111 2222" /></label>
      <label>Correo electronico<input readOnly value="camila@demo.qolqa" /></label>
      <label>Tipo documento<input readOnly value="RUT" /></label>
      <label>Documento<input readOnly value="12.345.678-9" /></label>
      <div className="mini-confirm">Seguridad, trazabilidad y contacto ante incidencias</div>
    </div>
  );
}

function LockerScene({ active, open }: { active: string; open?: boolean }) {
  return (
    <div className="locker-visual residential-locker">
      <div className="locker-brand">QOLQA</div>
      <div className="locker-cells">
        {["A-01", "A-02", "B-12", "B-14", "C-03", "C-08"].map((cell) => (
          <div className={cell === active ? `locker-door active ${open ? "open" : ""}` : "locker-door"} key={cell}>
            <strong>{cell}</strong>
          </div>
        ))}
      </div>
    </div>
  );
}

function NotificationScene() {
  return (
    <div className="notification-stack">
      <article className="message-card email">
        <span>Correo electrónico</span>
        <strong>Tu paquete ya se encuentra disponible.</strong>
        <small>Casillero B-12 · 48 horas disponibles</small>
      </article>
      <article className="message-card sms">
        <span>SMS</span>
        <strong>PIN 482913</strong>
        <small>Usa tu PIN o QR para retirar.</small>
      </article>
      <div className="credential-card">
        <QrCode />
        <div><span>PIN</span><strong>482913</strong></div>
      </div>
    </div>
  );
}

function PickupScene() {
  return (
    <div className="pickup-scene">
      <div className="person-large">
        <span className="person-head" />
        <span className="person-body" />
      </div>
      <div className="kiosk-mini">
        <button>Ingresar PIN</button>
        <button>Escanear QR</button>
      </div>
      <LockerScene active="B-12" open />
    </div>
  );
}

function SizeSelector({ selected, onSelect }: { selected: LockerSize; onSelect: (size: LockerSize) => void }) {
  return (
    <div className="size-cards">
      {(["Mediano", "Grande"] as LockerSize[]).map((size) => (
        <button className={selected === size ? "selected" : ""} key={size} onClick={() => onSelect(size)}>
          <span className={`bag-illustration ${size.toLowerCase()}`} />
          <strong>{size}</strong>
          <small>{size === "Mediano" ? "mochila, bolso, carry-on" : "maleta grande, equipaje voluminoso"}</small>
        </button>
      ))}
    </div>
  );
}

function TimeSelector({ selected, onSelect }: { selected: TravelTime; onSelect: (time: TravelTime) => void }) {
  return (
    <div className="time-grid">
      {(["2 horas", "6 horas", "12 horas", "24 horas"] as TravelTime[]).map((time) => (
        <button className={selected === time ? "selected" : ""} key={time} onClick={() => onSelect(time)}>
          {time}
        </button>
      ))}
    </div>
  );
}

function PaymentScene() {
  return (
    <div className="payment-scene">
      {["Webpay", "Mercado Pago", "Tarjetas"].map((item) => (
        <div className="payment-card" key={item}>{item}</div>
      ))}
      <p>No se realiza pago real en esta experiencia.</p>
    </div>
  );
}

function TicketScene({ pin, locker, time }: { pin: string; locker: string; time: TravelTime }) {
  return (
    <div className="ticket-scene">
      <QrCode />
      <div>
        <span>PIN</span>
        <strong>{pin}</strong>
        <small>Casillero {locker} · {time}</small>
        <small>También puede enviarse por correo electrónico o SMS.</small>
      </div>
    </div>
  );
}

function TravelPickupScene() {
  return (
    <div className="travel-pickup-scene">
      <TravelLockerVisual size="Mediano" open />
      <div className="scan-card">
        <QrCode />
        <strong>Escanear QR</strong>
        <span>o ingresar PIN</span>
      </div>
    </div>
  );
}

function CityFreedomScene() {
  return (
    <div className="freedom-grid">
      {["Comer", "Comprar", "Recorrer", "Trabajar", "Descansar"].map((item) => (
        <span key={item}>{item}</span>
      ))}
      <strong>Sin cargar maletas</strong>
    </div>
  );
}

function TravelInfoSection() {
  return (
    <section className="travel-info-section" aria-label="Información adicional Travel">
      <article className="travel-info-card">
        <div>
          <p className="eyebrow">Mientras esperas</p>
          <h2>Muévete sin cargar maletas</h2>
          <p>Puedes ir a comer, comprar, recorrer la ciudad, trabajar o descansar mientras tu equipaje queda seguro.</p>
        </div>
        <CityFreedomScene />
      </article>
      <article className="travel-info-card">
        <div>
          <p className="eyebrow">Carga USB</p>
          <h2>Algunos compartimientos incluyen USB-A y USB-C</h2>
          <p>Tus pertenencias permanecen seguras mientras cargas celulares o dispositivos pequeños.</p>
        </div>
        <UsbChargeScene compact />
      </article>
    </section>
  );
}

function UsbChargeScene({ compact }: { compact?: boolean }) {
  return (
    <div className={`usb-scene ${compact ? "compact" : ""}`}>
      <TravelLockerVisual size="Mediano" open={false} />
      <div className="usb-panel">
        <span>USB-A</span>
        <span>USB-C</span>
        <strong>Carga de celulares</strong>
      </div>
    </div>
  );
}

function TravelLockerVisual({ size, open }: { size: KioskTravelSize | LockerSize; open?: boolean }) {
  return (
    <div className="locker-visual travel-locker">
      <div className="locker-brand">QOLQA</div>
      <div className={`travel-door ${size.toLowerCase()} ${open ? "open" : ""}`}>
        <strong>{size}</strong>
      </div>
      <div className="travel-door small"><strong>USB</strong></div>
    </div>
  );
}

function CompletedScene({ label }: { label: string }) {
  return (
    <div className="completed-scene">
      <div className="checkmark">✓</div>
      <strong>{label}</strong>
    </div>
  );
}

function QrCode() {
  return (
    <div className="qr-code" aria-label="QR de ejemplo">
      {qrCells.map((cell, index) => <span className={cell ? "filled" : ""} key={index} />)}
    </div>
  );
}

function BenefitStrip({ title, items }: { title: string; items: string[] }) {
  return (
    <section className="benefit-strip">
      <h2>{title}</h2>
      <div>
        {items.map((item) => <span key={item}>{item}</span>)}
      </div>
    </section>
  );
}

function KioskPanel({ title, subtitle, children }: { title: string; subtitle: string; children: ReactNode }) {
  return (
    <section className="kiosk-panel">
      <div className="kiosk-title">
        <h1>{title}</h1>
        <p>{subtitle}</p>
      </div>
      {children}
    </section>
  );
}

function RecipientBadge({ unit, name }: { unit: string; name: string }) {
  return (
    <div className="recipient-badge">
      <span>Unidad {unit || "1204"}</span>
      <strong>{name}</strong>
      <small>Residente registrado</small>
    </div>
  );
}

function NotificationMini({ pin }: { pin: string }) {
  return (
    <div className="notification-mini">
      <div>Email</div>
      <div>SMS según plan</div>
      <div>PIN {pin}</div>
      <QrCode />
    </div>
  );
}

function SummaryList({ rows }: { rows: [string, string][] }) {
  return (
    <dl className="summary-list">
      {rows.map(([label, value]) => (
        <div key={label}>
          <dt>{label}</dt>
          <dd>{value}</dd>
        </div>
      ))}
    </dl>
  );
}
