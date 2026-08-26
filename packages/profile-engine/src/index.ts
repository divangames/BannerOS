import type { BannerProfileId } from "@banneros/common";

export interface BannerProfile {
  id: BannerProfileId;
  displayName: string;
  formats: Array<{ width: number; height: number; name: string }>;
}

export const profiles: Record<BannerProfileId, BannerProfile> = {
  HASL: { id: "HASL", displayName: "HASL", formats: [
    { name: "square", width: 1080, height: 1080 },
    { name: "landscape", width: 1920, height: 1080 },
    { name: "portrait", width: 1080, height: 1350 }
  ] },
  OUTMAX: { id: "OUTMAX", displayName: "OUTMAX", formats: [
    { name: "wide", width: 1920, height: 720 },
    { name: "standard", width: 1200, height: 628 },
    { name: "vertical", width: 1080, height: 1920 }
  ] }
};
