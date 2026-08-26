export interface CropInput { sourceWidth: number; sourceHeight: number; targetWidth: number; targetHeight: number; }
export interface CropRect { x: number; y: number; width: number; height: number; scale: number; }

export function calculateCrop(input: CropInput): CropRect {
  if ([input.sourceWidth, input.sourceHeight, input.targetWidth, input.targetHeight].some((value) => value <= 0)) {
    throw new Error("All dimensions must be positive");
  }
  const sourceRatio = input.sourceWidth / input.sourceHeight;
  const targetRatio = input.targetWidth / input.targetHeight;
  if (sourceRatio > targetRatio) {
    const width = Math.round(input.sourceHeight * targetRatio);
    return { x: Math.round((input.sourceWidth - width) / 2), y: 0, width, height: input.sourceHeight, scale: input.targetHeight / input.sourceHeight };
  }
  const height = Math.round(input.sourceWidth / targetRatio);
  return { x: 0, y: Math.round((input.sourceHeight - height) / 2), width: input.sourceWidth, height, scale: input.targetWidth / input.sourceWidth };
}
