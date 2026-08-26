import type { BannerProfileId, SourceAsset } from "@banneros/common";
import { profiles } from "@banneros/profile-engine";

export interface ExportRequest {
  profile: BannerProfileId;
  assets: SourceAsset[];
  concept: string;
}

export interface ExportPlan {
  profile: BannerProfileId;
  outputs: string[];
  concept: string;
  status: "planned";
}

export function createExportPlan(request: ExportRequest): ExportPlan {
  if (request.assets.length === 0) throw new Error("At least one source asset is required");
  if (!request.concept.trim()) throw new Error("Concept is required");
  const profile = profiles[request.profile];
  return {
    profile: request.profile,
    concept: request.concept.trim(),
    outputs: profile.formats.map((format) => `${request.profile.toLowerCase()}-${format.name}.png`),
    status: "planned"
  };
}
