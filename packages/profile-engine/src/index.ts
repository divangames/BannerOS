import type { BannerProfileId } from "@banneros/common";

export interface BannerProfile {
  id: BannerProfileId;
  displayName: string;
  formats: Array<{ width: number; height: number; name: string }>;
}

export const profiles: Record<BannerProfileId, BannerProfile> = {
  HASL: { id: "HASL", displayName: "HASL", formats: [] },
  OUTMAX: { id: "OUTMAX", displayName: "OUTMAX", formats: [] }
};
