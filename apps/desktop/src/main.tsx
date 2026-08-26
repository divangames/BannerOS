import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  return <main><p className="eyebrow">BANNEROS · FOUNDATION</p><h1>Создайте комплект баннеров быстрее.</h1><p className="muted">Sprint 0 готов. Следующий шаг — подключить workspace и Export Engine.</p><button>Создать workspace</button></main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
