import type { BannerProfileId, SourceAsset } from "@banneros/common";

export interface ExportRequest {
  profile: BannerProfileId;
  assets: SourceAsset[];
  concept: string;
}

export interface ExportPlan {
  profile: BannerProfileId;
  outputs: string[];
  status: "planned";
}

export function createExportPlan(request: ExportRequest): ExportPlan {
  if (request.assets.length === 0) throw new Error("At least one source asset is required");
  if (!request.concept.trim()) throw new Error("Concept is required");
  return { profile: request.profile, outputs: [], status: "planned" };
}
