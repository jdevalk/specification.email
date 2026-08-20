export type Status = "required" | "recommended" | "optional" | "avoid";
export interface Source {
  title: string;
  url: string;
  publisher?: string;
}
export interface Topic {
  slug: string;
  category: string;
  title: string;
  summary: string;
  status: Status;
  order: number;
  sources: Source[];
  url: string;
  mdUrl: string;
  body: string;
}
export interface Category {
  slug: string;
  title: string;
  summary: string;
  order: number;
}
export interface Change {
  title: string;
  date: string;
  type: "added" | "changed" | "status" | "removed";
  relatedSlugs: string[];
  body: string;
}
export interface Manifest {
  generatedAt: string;
  site: string;
  categories: Category[];
  topics: Topic[];
  changelog: Change[];
}
export interface RpcRequest {
  jsonrpc: "2.0";
  id?: string | number | null;
  method: string;
  params?: Record<string, unknown>;
}
export type RpcResponse = {
  jsonrpc: "2.0";
  id: string | number | null;
  result?: unknown;
  error?: { code: number; message: string; data?: unknown };
};
