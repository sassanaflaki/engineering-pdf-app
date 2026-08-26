export type Tool = "select" | "pen" | "line" | "rect" | "text" | "measure";

export type Markup =
  | { id: string; type: "pen"; points: number[] }
  | { id: string; type: "line"; points: number[] }
  | { id: string; type: "rect"; x: number; y: number; width: number; height: number }
  | { id: string; type: "text"; x: number; y: number; text: string }
  | { id: string; type: "measure"; points: number[]; distance: number; unit: string };

export type PageState = Record<number, Markup[]>;
