import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const [name, setName] = React.useState("");
  const [profile, setProfile] = React.useState("HASL");
  const [message, setMessage] = React.useState("");
  const createWorkspace = async () => {
    if (!name.trim()) { setMessage("Введите название workspace"); return; }
    try {
      const response = await fetch("http://127.0.0.1:8000/api/workspaces", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profile })
      });
      if (!response.ok) throw new Error("API error");
      const workspace = await response.json();
      setMessage(`Workspace «${workspace.name}» создан · профиль ${workspace.profile}`);
      setName("");
    } catch { setMessage("Не удалось подключиться к API. Запустите start-banneros.bat"); }
  };
  return <main><p className="eyebrow">BANNEROS · SPRINT 1</p><h1>Создайте комплект баннеров быстрее.</h1><p className="muted">Начните с workspace и выберите профиль рекламной площадки.</p><section className="card"><label>Название workspace<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Кроссовки · август" /></label><label>Профиль<select value={profile} onChange={(event) => setProfile(event.target.value)}><option value="HASL">HASL</option><option value="OUTMAX">OUTMAX</option></select></label><button onClick={createWorkspace}>Создать workspace</button>{message && <p className="message">{message}</p>}</section></main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
