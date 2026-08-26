import { useEffect, useRef, useState } from "react";
import * as pdfjsLib from "pdfjs-dist";
import pdfWorker from "pdfjs-dist/build/pdf.worker.min.mjs?url";
import { Stage, Layer, Line, Rect, Text } from "react-konva";
import type { Markup, Tool } from "./types";

pdfjsLib.GlobalWorkerOptions.workerSrc = pdfWorker;

type Props = {
  file: File | null;
  pageNumber: number;
  scale: number;
  tool: Tool;
  markups: Markup[];
  calibration: number;
  unit: string;
  onPageCount: (count: number) => void;
  onChange: (markups: Markup[]) => void;
};

const uid = () => crypto.randomUUID();

export default function PdfCanvas({
  file, pageNumber, scale, tool, markups, calibration, unit, onPageCount, onChange
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const [size, setSize] = useState({ width: 800, height: 1000 });
  const [draft, setDraft] = useState<Markup | null>(null);

  useEffect(() => {
    if (!file || !canvasRef.current) return;
    let cancelled = false;

    (async () => {
      const data = new Uint8Array(await file.arrayBuffer());
      const pdf = await pdfjsLib.getDocument({ data }).promise;
      if (cancelled) return;
      onPageCount(pdf.numPages);

      const page = await pdf.getPage(pageNumber);
      const viewport = page.getViewport({ scale });
      const canvas = canvasRef.current!;
      const ctx = canvas.getContext("2d")!;
      canvas.width = viewport.width;
      canvas.height = viewport.height;
      canvas.style.width = `${viewport.width}px`;
      canvas.style.height = `${viewport.height}px`;
      setSize({ width: viewport.width, height: viewport.height });

      await page.render({ canvasContext: ctx, viewport }).promise;
    })();

    return () => { cancelled = true; };
  }, [file, pageNumber, scale, onPageCount]);

  function pos(e: any) {
    return e.target.getStage().getPointerPosition();
  }

  function down(e: any) {
    if (!file || tool === "select") return;
    const p = pos(e);
    if (!p) return;

    if (tool === "pen")
      setDraft({ id: uid(), type: "pen", points: [p.x, p.y] });
    if (tool === "line")
      setDraft({ id: uid(), type: "line", points: [p.x, p.y, p.x, p.y] });
    if (tool === "rect")
      setDraft({ id: uid(), type: "rect", x: p.x, y: p.y, width: 0, height: 0 });
    if (tool === "measure")
      setDraft({ id: uid(), type: "measure", points: [p.x, p.y, p.x, p.y], distance: 0, unit });
    if (tool === "text") {
      const value = window.prompt("Enter annotation text:");
      if (value) onChange([...markups, { id: uid(), type: "text", x: p.x, y: p.y, text: value }]);
    }
  }

  function move(e: any) {
    if (!draft) return;
    const p = pos(e);
    if (!p) return;

    if (draft.type === "pen") {
      setDraft({ ...draft, points: [...draft.points, p.x, p.y] });
    } else if (draft.type === "line") {
      setDraft({ ...draft, points: [draft.points[0], draft.points[1], p.x, p.y] });
    } else if (draft.type === "rect") {
      setDraft({ ...draft, width: p.x - draft.x, height: p.y - draft.y });
    } else if (draft.type === "measure") {
      const [x1, y1] = draft.points;
      const dx = p.x - x1, dy = p.y - y1;
      const pixels = Math.sqrt(dx * dx + dy * dy);
      setDraft({
        ...draft,
        points: [x1, y1, p.x, p.y],
        distance: pixels * calibration,
        unit
      });
    }
  }

  function up() {
    if (!draft) return;
    onChange([...markups, draft]);
    setDraft(null);
  }

  const all = draft ? [...markups, draft] : markups;

  return (
    <div className="page-shell" style={{ width: size.width, height: size.height }}>
      <canvas ref={canvasRef} className="pdf-layer" />
      <Stage
        width={size.width}
        height={size.height}
        className="markup-layer"
        onMouseDown={down}
        onMouseMove={move}
        onMouseUp={up}
        onTouchStart={down}
        onTouchMove={move}
        onTouchEnd={up}
      >
        <Layer>
          {all.map(m => {
            if (m.type === "pen")
              return <Line key={m.id} points={m.points} stroke="red" strokeWidth={2} lineCap="round" lineJoin="round" />;
            if (m.type === "line")
              return <Line key={m.id} points={m.points} stroke="blue" strokeWidth={2} />;
            if (m.type === "rect")
              return <Rect key={m.id} x={m.x} y={m.y} width={m.width} height={m.height} stroke="orange" strokeWidth={2} />;
            if (m.type === "text")
              return <Text key={m.id} x={m.x} y={m.y} text={m.text} fontSize={18} fill="purple" />;
            if (m.type === "measure") {
              const [x1, y1, x2, y2] = m.points;
              return (
                <>
                  <Line key={m.id} points={m.points} stroke="green" strokeWidth={2} dash={[8, 4]} />
                  <Text
                    key={`${m.id}-label`}
                    x={(x1 + x2) / 2}
                    y={(y1 + y2) / 2}
                    text={`${m.distance.toFixed(2)} ${m.unit}`}
                    fontSize={16}
                    fill="green"
                  />
                </>
              );
            }
            return null;
          })}
        </Layer>
      </Stage>
    </div>
  );
}
