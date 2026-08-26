import { useMemo, useState } from "react";
import PdfCanvas from "./PdfCanvas";
import type { PageState, Tool } from "./types";

const API = "http://localhost:8000";

export default function App() {
  const [file, setFile] = useState<File | null>(null);
  const [pages, setPages] = useState(1);
  const [page, setPage] = useState(1);
  const [scale, setScale] = useState(1.2);
  const [tool, setTool] = useState<Tool>("select");
  const [pageState, setPageState] = useState<PageState>({});
  const [calibration, setCalibration] = useState(1);
  const [unit, setUnit] = useState("ft");
  const current = useMemo(() => pageState[page] ?? [], [pageState, page]);

  function updateCurrent(markups: any[]) {
    setPageState(s => ({ ...s, [page]: markups }));
  }

  async function saveProject() {
    const name = window.prompt("Project name", file?.name ?? "project");
    if (!name) return;
    const res = await fetch(`${API}/projects`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name, source_file: file?.name ?? null, markups: pageState })
    });
    if (!res.ok) alert("Save failed");
    else alert("Project saved");
  }

  function exportJson() {
    const blob = new Blob([JSON.stringify(pageState, null, 2)], { type: "application/json" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "markups.json";
    a.click();
    URL.revokeObjectURL(a.href);
  }

  return (
    <div className="app">
      <header>
        <strong>Engineering PDF Markup</strong>
        <input type="file" accept="application/pdf" onChange={e => {
          setFile(e.target.files?.[0] ?? null);
          setPage(1);
          setPageState({});
        }} />
        <button onClick={saveProject}>Save Project</button>
        <button onClick={exportJson}>Export Markups</button>
      </header>

      <div className="toolbar">
        {(["select","pen","line","rect","text","measure"] as Tool[]).map(t =>
          <button className={tool === t ? "active" : ""} key={t} onClick={() => setTool(t)}>{t}</button>
        )}
        <span>Scale:</span>
        <input
          type="number"
          step="0.001"
          value={calibration}
          onChange={e => setCalibration(Number(e.target.value))}
          title="Drawing units per screen pixel"
        />
        <select value={unit} onChange={e => setUnit(e.target.value)}>
          <option>ft</option><option>in</option><option>m</option><option>mm</option>
        </select>
        <span>Zoom</span>
        <button onClick={() => setScale(s => Math.max(0.25, s - .2))}>−</button>
        <span>{Math.round(scale * 100)}%</span>
        <button onClick={() => setScale(s => Math.min(4, s + .2))}>+</button>
        <button onClick={() => updateCurrent(current.slice(0, -1))}>Undo</button>
        <button onClick={() => updateCurrent([])}>Clear page</button>
      </div>

      <main>
        <aside>
          <h3>Pages</h3>
          {Array.from({ length: pages }, (_, i) => i + 1).map(n =>
            <button key={n} className={page === n ? "active" : ""} onClick={() => setPage(n)}>Page {n}</button>
          )}
        </aside>

        <section className="workspace">
          {file ? (
            <PdfCanvas
              file={file}
              pageNumber={page}
              scale={scale}
              tool={tool}
              markups={current}
              calibration={calibration}
              unit={unit}
              onPageCount={setPages}
              onChange={updateCurrent}
            />
          ) : (
            <div className="empty">Choose a PDF to begin.</div>
          )}
        </section>
      </main>
    </div>
  );
}
