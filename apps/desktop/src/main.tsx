import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const [name, setName] = React.useState("");
  const [profile, setProfile] = React.useState("HASL");
  const [concept, setConcept] = React.useState("");
  const [assets, setAssets] = React.useState("product.jpg");
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadedAssets, setUploadedAssets] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState("");
  const [plan, setPlan] = React.useState<Array<{fileName: string; width: number; height: number}>>([]);
  const [sourceSize, setSourceSize] = React.useState({ width: "1200", height: "900" });
  const [crop, setCrop] = React.useState<{x: number; y: number; width: number; height: number; scale: number} | null>(null);
  const [rendered, setRendered] = React.useState<Array<{fileName: string; url: string; width: number; height: number}>>([]);
  const [archiveUrl, setArchiveUrl] = React.useState("");
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
  const previewCrop = async () => {
    const format = plan[0] ?? (profile === "HASL" ? { width: 1080, height: 1080 } : { width: 1920, height: 720 });
    try {
      const response = await fetch("http://127.0.0.1:8000/api/crop/preview", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ sourceWidth: Number(sourceSize.width), sourceHeight: Number(sourceSize.height), targetWidth: format.width, targetHeight: format.height }) });
      if (!response.ok) throw new Error("API error");
      setCrop(await response.json());
      setMessage(`Smart Crop рассчитан под ${format.width} × ${format.height}`);
    } catch { setMessage("Не удалось рассчитать Smart Crop. Запустите start-banneros.bat"); }
  };
  const createPlan = async () => {
    const assetNames = uploadedAssets.length > 0 ? uploadedAssets : assets.split(",").map((asset) => asset.trim()).filter(Boolean);
    if (!concept.trim() || assetNames.length === 0) { setMessage("Добавьте идею и хотя бы один исходник"); return; }
    try {
      const response = await fetch("http://127.0.0.1:8000/api/exports/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile, concept, assets: assetNames }) });
      if (!response.ok) throw new Error("API error");
      const result = await response.json();
      setPlan(result.outputs);
      setMessage(`План готов: ${result.outputs.length} формата для ${result.profile}`);
    } catch { setMessage("Не удалось подключиться к API. Запустите start-banneros.bat"); }
  };
  const uploadAssets = async () => {
    if (files.length === 0) { setMessage("Выберите хотя бы один файл"); return; }
    try {
      const names: string[] = [];
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        const response = await fetch("http://127.0.0.1:8000/api/assets/upload", { method: "POST", body: form });
        if (!response.ok) throw new Error("Upload failed");
        names.push((await response.json()).name);
      }
      setUploadedAssets(names);
      setAssets(names.join(", "));
      setMessage(`Загружено файлов: ${names.length}`);
    } catch { setMessage("Не удалось загрузить файлы. Запустите start-banneros.bat"); }
  };
  const renderExport = async () => {
    const assetNames = uploadedAssets.length > 0 ? uploadedAssets : assets.split(",").map((asset) => asset.trim()).filter(Boolean);
    try {
      const response = await fetch("http://127.0.0.1:8000/api/exports/render", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile, concept, assets: assetNames }) });
      if (!response.ok) throw new Error("Render failed");
      const result = await response.json();
      setRendered(result.outputs.map((output: {fileName: string; url: string; width: number; height: number}) => ({ ...output, url: `http://127.0.0.1:8000${output.url}` })));
      setArchiveUrl(`http://127.0.0.1:8000/api/exports/${result.id}/download`);
      setMessage(`Экспорт готов: ${result.outputs.length} PNG`);
    } catch { setMessage("Сначала загрузите изображение и заполните идею"); }
  };
  return <main><p className="eyebrow">BANNEROS · SPRINT 3</p><h1>Создайте комплект баннеров быстрее.</h1><p className="muted">Workspace, исходник и идея превращаются в PNG-комплект.</p><section className="card"><label>Название workspace<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Кроссовки · август" /></label><label>Профиль<select value={profile} onChange={(event) => setProfile(event.target.value)}><option value="HASL">HASL</option><option value="OUTMAX">OUTMAX</option></select></label><button onClick={createWorkspace}>Создать workspace</button><label>Идея баннера<textarea value={concept} onChange={(event) => setConcept(event.target.value)} placeholder="Минималистичная летняя кампания" /></label><label>Исходники<input type="file" multiple accept="image/*" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label><button onClick={uploadAssets}>Загрузить исходники</button><label>Имена ассетов<input value={assets} onChange={(event) => setAssets(event.target.value)} placeholder="product.jpg, logo.svg" /></label><button onClick={createPlan}>Сформировать план экспорта</button>{plan.length > 0 && <><h2>Форматы</h2><ul className="outputs">{plan.map((output) => <li key={output.fileName}>{output.fileName}<span>{output.width} × {output.height}</span></li>)}</ul><button onClick={renderExport}>Экспортировать PNG</button></>}{rendered.length > 0 && <><h2>Готовые баннеры</h2><div className="gallery">{rendered.map((output) => <a className="preview" key={output.fileName} href={output.url} target="_blank" rel="noreferrer"><img src={output.url} alt={output.fileName} /><span>{output.fileName} · {output.width} × {output.height}</span></a>)}</div></>}{archiveUrl && <a className="download" href={archiveUrl}>Скачать комплект ZIP</a>}<h2>Smart Crop</h2><div className="dimensions"><label>Ширина<input type="number" value={sourceSize.width} onChange={(event) => setSourceSize({...sourceSize, width: event.target.value})} /></label><label>Высота<input type="number" value={sourceSize.height} onChange={(event) => setSourceSize({...sourceSize, height: event.target.value})} /></label></div><button onClick={previewCrop}>Рассчитать кадрирование</button>{crop && <p className="message">Crop: {crop.width} × {crop.height} px, отступы x:{crop.x} y:{crop.y}</p>}{message && <p className="message">{message}</p>}</section></main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
