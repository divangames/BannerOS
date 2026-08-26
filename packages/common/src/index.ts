export type BannerProfileId = "HASL" | "OUTMAX";

export interface WorkspaceRef {
  id: string;
  name: string;
  root: string;
}

export interface SourceAsset {
  id: string;
  path: string;
  mimeType: string;
}

export interface BannerFormat {
  name: string;
  width: number;
  height: number;
}
