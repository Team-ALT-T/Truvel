const FALLBACK_SITE_URL = "http://localhost:3000";

function resolveSiteUrl() {
  const configuredUrl =
    process.env.SITE_URL ??
    process.env.VERCEL_PROJECT_PRODUCTION_URL ??
    process.env.VERCEL_URL ??
    FALLBACK_SITE_URL;
  const urlWithProtocol = /^https?:\/\//.test(configuredUrl)
    ? configuredUrl
    : `https://${configuredUrl}`;

  return new URL(urlWithProtocol);
}

export const siteUrl = resolveSiteUrl();
export const siteName = "Truvel";
export const siteTitle = "Truvel | 여행 계획부터 동선 최적화까지";
export const siteDescription =
  "여행지를 선택하고 일정을 만들면 이동하기 좋은 순서로 경로를 정리해 주는 여행 계획 서비스 Truvel입니다.";
