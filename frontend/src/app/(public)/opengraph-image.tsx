import { createSocialImage, socialImageSize } from "./social-image";

export const alt = "Truvel - 여행 계획부터 동선 최적화까지";
export const size = socialImageSize;
export const contentType = "image/png";

export default function OpenGraphImage() {
  return createSocialImage();
}
