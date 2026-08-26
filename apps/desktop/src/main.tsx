import React from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

function App() {
  const isDemo = !["127.0.0.1", "localhost"].includes(window.location.hostname);
  const [name, setName] = React.useState("");
  const [profile, setProfile] = React.useState("HASL");
  const [concept, setConcept] = React.useState("");
  const [assets, setAssets] = React.useState("product.jpg");
  const [files, setFiles] = React.useState<File[]>([]);
  const [uploadedAssets, setUploadedAssets] = React.useState<string[]>([]);
  const [message, setMessage] = React.useState(isDemo ? "Demo Mode: backend не требуется" : "");
  const [plan, setPlan] = React.useState<Array<{fileName: string; width: number; height: number}>>([]);
  const [sourceSize, setSourceSize] = React.useState({ width: "1200", height: "900" });
  const [crop, setCrop] = React.useState<{x: number; y: number; width: number; height: number; scale: number} | null>(null);
  const [rendered, setRendered] = React.useState<Array<{fileName: string; url: string; width: number; height: number}>>([]);
  const [archiveUrl, setArchiveUrl] = React.useState("");
  const [workspaces, setWorkspaces] = React.useState<Array<{id: string; name: string; profile: string}>>([]);
  const [currentWorkspaceId, setCurrentWorkspaceId] = React.useState("");
  const [workspaceAssets, setWorkspaceAssets] = React.useState<Array<{name: string; size: number}>>([]);
  React.useEffect(() => { if (isDemo) { const items = JSON.parse(localStorage.getItem("banneros-workspaces") ?? "[]"); const savedId = localStorage.getItem("banneros-active-workspace"); setWorkspaces(items); setCurrentWorkspaceId(items.some((item: {id: string}) => item.id === savedId) ? savedId : items[0]?.id ?? ""); return; } fetch("http://127.0.0.1:8000/health").then((response) => { if (!response.ok) throw new Error(); setMessage("Local API подключён"); return fetch("http://127.0.0.1:8000/api/workspaces"); }).then((response) => response.ok ? response.json() : []).then((items) => { const savedId = localStorage.getItem("banneros-active-workspace"); setWorkspaces(items); setCurrentWorkspaceId(items.some((item: {id: string}) => item.id === savedId) ? savedId : items[0]?.id ?? ""); }).catch(() => setMessage("API не запущен. Запустите start-banneros.bat")); fetch("http://127.0.0.1:8000/api/exports").then((response) => response.ok ? response.json() : []).then((items: unknown[]) => { if (items.length > 0) setMessage(`Сохранённых экспортов: ${items.length}`); }).catch(() => undefined); }, [isDemo]);
  React.useEffect(() => { if (currentWorkspaceId) localStorage.setItem("banneros-active-workspace", currentWorkspaceId); }, [currentWorkspaceId]);
  React.useEffect(() => { if (!currentWorkspaceId || isDemo) return; fetch(`http://127.0.0.1:8000/api/workspaces/${currentWorkspaceId}`).then((response) => response.ok ? response.json() : null).then((workspace) => { if (workspace) setMessage(`Активный workspace: ${workspace.name} · ассетов ${workspace.assetCount}`); }).catch(() => undefined); }, [currentWorkspaceId, isDemo]);
  React.useEffect(() => { if (!currentWorkspaceId || isDemo) { setWorkspaceAssets([]); return; } fetch(`http://127.0.0.1:8000/api/workspaces/${currentWorkspaceId}/assets`).then((response) => response.ok ? response.json() : []).then((items: Array<{name: string; size: number}>) => setWorkspaceAssets(items)).catch(() => setWorkspaceAssets([])); }, [currentWorkspaceId, isDemo, uploadedAssets]);
  const createWorkspace = async () => {
    if (!name.trim()) { setMessage("Введите название workspace"); return; }
    if (isDemo) { const workspace = { id: crypto.randomUUID(), name: name.trim(), profile }; const next = [workspace, ...workspaces]; setWorkspaces(next); setCurrentWorkspaceId(workspace.id); localStorage.setItem("banneros-workspaces", JSON.stringify(next)); setMessage(`Demo workspace «${workspace.name}» создан · профиль ${workspace.profile}`); setName(""); return; }
    try {
      const response = await fetch("http://127.0.0.1:8000/api/workspaces", {
        method: "POST", headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, profile })
      });
      if (!response.ok) throw new Error("API error");
      const workspace = await response.json();
      setWorkspaces((current) => [workspace, ...current]);
      setCurrentWorkspaceId(workspace.id);
      setMessage(`Workspace «${workspace.name}» создан · профиль ${workspace.profile}`);
      setName("");
    } catch { setMessage("Не удалось подключиться к API. Запустите start-banneros.bat"); }
  };
  const previewCrop = async () => {
    const format = plan[0] ?? (profile === "HASL" ? { width: 1080, height: 1080 } : { width: 1920, height: 720 });
    if (isDemo) { const sourceWidth = Number(sourceSize.width); const sourceHeight = Number(sourceSize.height); const sourceRatio = sourceWidth / sourceHeight; const targetRatio = format.width / format.height; const crop = sourceRatio > targetRatio ? { x: Math.round((sourceWidth - sourceHeight * targetRatio) / 2), y: 0, width: Math.round(sourceHeight * targetRatio), height: sourceHeight, scale: format.height / sourceHeight } : { x: 0, y: Math.round((sourceHeight - sourceWidth / targetRatio) / 2), width: sourceWidth, height: Math.round(sourceWidth / targetRatio), scale: format.width / sourceWidth }; setCrop(crop); setMessage(`Demo Smart Crop рассчитан под ${format.width} × ${format.height}`); return; }
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
    if (isDemo) { const formats = profile === "HASL" ? [{ name: "square", width: 1080, height: 1080 }, { name: "landscape", width: 1920, height: 1080 }, { name: "portrait", width: 1080, height: 1350 }] : [{ name: "wide", width: 1920, height: 720 }, { name: "standard", width: 1200, height: 628 }, { name: "vertical", width: 1080, height: 1920 }]; setPlan(formats.map((format) => ({ fileName: `${profile.toLowerCase()}-${format.name}.png`, ...format }))); setMessage(`Demo-план готов: ${formats.length} формата для ${profile}`); return; }
    try {
      const response = await fetch("http://127.0.0.1:8000/api/exports/plan", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile, concept, assets: assetNames, workspaceId: currentWorkspaceId || null }) });
      if (!response.ok) throw new Error("API error");
      const result = await response.json();
      setPlan(result.outputs);
      setMessage(`План готов: ${result.outputs.length} формата для ${result.profile}`);
    } catch { setMessage("Не удалось подключиться к API. Запустите start-banneros.bat"); }
  };
  const uploadAssets = async () => {
    if (files.length === 0) { setMessage("Выберите хотя бы один файл"); return; }
    if (isDemo) { const names = files.map((file) => file.name); setUploadedAssets(names); setAssets(names.join(", ")); setMessage(`Demo: выбрано файлов: ${names.length}`); return; }
    try {
      const names: string[] = [];
      for (const file of files) {
        const form = new FormData();
        form.append("file", file);
        if (currentWorkspaceId) form.append("workspace_id", currentWorkspaceId);
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
    if (isDemo) { const outputs = plan.map((output) => { const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${output.width}" height="${output.height}"><rect width="100%" height="100%" fill="#181614"/><text x="50%" y="45%" fill="#ff9d4d" font-family="Arial" font-size="48" text-anchor="middle">BannerOS DEMO</text><text x="50%" y="55%" fill="#f4f1ea" font-family="Arial" font-size="30" text-anchor="middle">${concept.slice(0, 40)}</text></svg>`; return { ...output, url: `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svg)}` }; }); setRendered(outputs); setMessage(`Demo-экспорт готов: ${outputs.length} PNG preview`); return; }
    try {
      const response = await fetch("http://127.0.0.1:8000/api/exports/render", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ profile, concept, assets: assetNames, workspaceId: currentWorkspaceId || null }) });
      if (!response.ok) throw new Error("Render failed");
      const result = await response.json();
      setRendered(result.outputs.map((output: {fileName: string; url: string; width: number; height: number}) => ({ ...output, url: `http://127.0.0.1:8000${output.url}` })));
      setArchiveUrl(`http://127.0.0.1:8000/api/exports/${result.id}/download`);
      setMessage(`Экспорт готов: ${result.outputs.length} PNG`);
    } catch { setMessage("Сначала загрузите изображение и заполните идею"); }
  };
  return <main><p className="eyebrow">BANNEROS · SPRINT 3</p><h1>Создайте комплект баннеров быстрее.</h1><p className="muted">Workspace, исходник и идея превращаются в PNG-комплект.</p>{workspaces.length > 0 && <section className="recent"><h2>Последние workspace</h2><select className="workspace-select" value={currentWorkspaceId} onChange={(event) => setCurrentWorkspaceId(event.target.value)}>{workspaces.map((workspace) => <option key={workspace.id} value={workspace.id}>{workspace.name} · {workspace.profile}</option>)}</select>{workspaces.slice(0, 3).map((workspace) => <div className="recent-row" key={workspace.id}><span>{workspace.name}</span><small>{workspace.id === currentWorkspaceId ? "активный" : workspace.profile}</small></div>)}</section>}<section className="card"><label>Название workspace<input value={name} onChange={(event) => setName(event.target.value)} placeholder="Например, Кроссовки · август" /></label><label>Профиль<select value={profile} onChange={(event) => setProfile(event.target.value)}><option value="HASL">HASL</option><option value="OUTMAX">OUTMAX</option></select></label><button onClick={createWorkspace}>Создать workspace</button><label>Идея баннера<textarea value={concept} onChange={(event) => setConcept(event.target.value)} placeholder="Минималистичная летняя кампания" /></label><label>Исходники<input type="file" multiple accept="image/*" onChange={(event) => setFiles(Array.from(event.target.files ?? []))} /></label><button onClick={uploadAssets}>Загрузить исходники</button>{workspaceAssets.length > 0 && <div className="asset-list"><h2>Ассеты workspace</h2>{workspaceAssets.map((asset) => <div className="recent-row" key={asset.name}><span>{asset.name}</span><small>{Math.max(1, Math.round(asset.size / 1024))} КБ</small></div>)}</div>}<label>Имена ассетов<input value={assets} onChange={(event) => setAssets(event.target.value)} placeholder="product.jpg, logo.svg" /></label><button onClick={createPlan}>Сформировать план экспорта</button>{plan.length > 0 && <><h2>Форматы</h2><ul className="outputs">{plan.map((output) => <li key={output.fileName}>{output.fileName}<span>{output.width} × {output.height}</span></li>)}</ul><button onClick={renderExport}>Экспортировать PNG</button></>}{rendered.length > 0 && <><h2>Готовые баннеры</h2><div className="gallery">{rendered.map((output) => <a className="preview" key={output.fileName} href={output.url} target="_blank" rel="noreferrer"><img src={output.url} alt={output.fileName} /><span>{output.fileName} · {output.width} × {output.height}</span></a>)}</div></>}{archiveUrl && <a className="download" href={archiveUrl}>Скачать комплект ZIP</a>}<h2>Smart Crop</h2><div className="dimensions"><label>Ширина<input type="number" value={sourceSize.width} onChange={(event) => setSourceSize({...sourceSize, width: event.target.value})} /></label><label>Высота<input type="number" value={sourceSize.height} onChange={(event) => setSourceSize({...sourceSize, height: event.target.value})} /></label></div><button onClick={previewCrop}>Рассчитать кадрирование</button>{crop && <p className="message">Crop: {crop.width} × {crop.height} px, отступы x:{crop.x} y:{crop.y}</p>}{message && <p className="message">{message}</p>}</section></main>;
}

createRoot(document.getElementById("root")!).render(<React.StrictMode><App /></React.StrictMode>);
