/**
 * MSW 요청 핸들러 모음
 *
 * 테스트에서 백엔드 API를 모킹합니다.
 * 기본 응답은 "성공" 시나리오이며,
 * 개별 테스트에서 server.use()로 오버라이드하여 실패 시나리오를 테스트할 수 있습니다.
 */
import { http, HttpResponse } from "msw";

const BASE_URL = "http://localhost:8080";

export const handlers = [
  // ─── 로그인 ────────────────────────────────────────────────
  http.post(`${BASE_URL}/auth/login`, async ({ request }) => {
    const body = (await request.json()) as { email: string; password: string };

    // 테스트용: 특정 이메일/비밀번호 조합만 성공
    if (body.email === "test@example.com" && body.password === "Password1!") {
      return HttpResponse.json({
        message: "로그인 성공",
        accessToken: "mock-access-token",
        refreshToken: "mock-refresh-token",
        grantType: "Bearer",
      });
    }

    // 그 외는 401 에러
    return HttpResponse.json(
      { message: "이메일 또는 비밀번호가 올바르지 않습니다." },
      { status: 401 },
    );
  }),

  // ─── 회원가입 ──────────────────────────────────────────────
  http.post(`${BASE_URL}/auth/signup`, async ({ request }) => {
    const body = (await request.json()) as { email: string; nickname: string };

    // 중복 이메일 시뮬레이션
    if (body.email === "duplicate@example.com") {
      return HttpResponse.json(
        { message: "이미 사용 중인 이메일입니다." },
        { status: 409 },
      );
    }

    // 중복 닉네임 시뮬레이션
    if (body.nickname === "중복닉네임") {
      return HttpResponse.json(
        { message: "이미 사용 중인 닉네임입니다." },
        { status: 409 },
      );
    }

    return HttpResponse.json({
      message: "회원가입 성공",
      userId: 1,
    });
  }),

  // ─── 이메일 인증코드 발송 ──────────────────────────────────
  http.post(`${BASE_URL}/emails/send`, async () => {
    return HttpResponse.json({
      success: true,
      message: "인증코드가 발송되었습니다.",
    });
  }),

  // ─── 이메일 인증코드 확인 ──────────────────────────────────
  http.post(`${BASE_URL}/emails/verify`, async ({ request }) => {
    const body = (await request.json()) as { email: string; code: string };

    // 테스트용: "123456"만 성공
    if (body.code === "123456") {
      return HttpResponse.json({
        success: true,
        message: "이메일 인증이 완료되었습니다.",
      });
    }

    return HttpResponse.json(
      { message: "인증코드가 올바르지 않습니다." },
      { status: 400 },
    );
  }),

  // ─── 여행 계획 목록 조회 ────────────────────────────────────
  http.get(`${BASE_URL}/travels`, () => {
    return HttpResponse.json([
      {
        travelPlanId: 1,
        startDate: "2025-08-10",
        endDate: "2025-08-15",
        countryName: "일본",
        cityName: "도쿄",
      },
      {
        travelPlanId: 2,
        startDate: "2024-12-01",
        endDate: "2024-12-05",
        countryName: "대한민국",
        cityName: "제주",
      },
    ]);
  }),

  // ─── 국가 검색 ─────────────────────────────────────────────
  http.get(`${BASE_URL}/countries`, () => {
    return HttpResponse.json([
      { countryId: 1, koreanName: "일본", englishName: "Japan" },
      { countryId: 2, koreanName: "프랑스", englishName: "France" },
      { countryId: 3, koreanName: "대한민국", englishName: "South Korea" },
    ]);
  }),

  // ─── 공개 도시 조회 (인기도 집계 없음) ─────────────────────
  http.get(`${BASE_URL}/public/cities`, ({ request }) => {
    const url = new URL(request.url);
    const countryId = url.searchParams.get("countryId");
    const allCities = [
      { cityId: 10, countryId: 1, korean: "도쿄", english: "Tokyo" },
      { cityId: 11, countryId: 1, korean: "오사카", english: "Osaka" },
      { cityId: 20, countryId: 2, korean: "파리", english: "Paris" },
      { cityId: 21, countryId: 2, korean: "바르셀로나", english: "Barcelona" },
      { cityId: 30, countryId: 3, korean: "서울", english: "Seoul" },
      { cityId: 31, countryId: 3, korean: "제주", english: "Jeju" },
    ];

    return HttpResponse.json(
      countryId
        ? allCities.filter((city) => city.countryId === Number(countryId))
        : allCities,
    );
  }),

  // ─── 여행 계획 단건 조회 ────────────────────────────────────
  http.get(`${BASE_URL}/travels/:id`, ({ params }) => {
    const id = Number(params.id);
    return HttpResponse.json({
      travelPlanId: id,
      startDate: "2025-08-10",
      endDate: "2025-08-12",
      countryName: "일본",
      cityName: "도쿄",
      daySchedules: [
        {
          dayScheduleId: 100,
          date: "2025-08-10",
          startTime: "09:00:00",
          finishTime: "18:00:00",
          dayScheduleMemo: "첫째 날 메모",
          schedules: [
            {
              scheduleOrder: 1,
              preferTime: "Morning",
              locationName: "도쿄 타워",
              location: {
                place: "도쿄 타워",
                name: "도쿄 타워",
                latitude: 35.6586,
                longitude: 139.7454,
                address: "4 Chome-2-8 Shibakoen",
                category: "관광명소",
              },
            },
          ],
        },
      ],
    });
  }),

  // ─── 장소 목록 조회 ─────────────────────────────────────────
  http.get(`${BASE_URL}/locations/getLocations/:id`, () => {
    return HttpResponse.json([
      {
        locationId: 1,
        place: "도쿄 타워",
        latitude: 35.6586,
        longitude: 139.7454,
        address: "4 Chome-2-8 Shibakoen",
        category: "관광명소",
      },
    ]);
  }),

  // ─── 도시 검색 ─────────────────────────────────────────────
  http.get(`${BASE_URL}/cities`, ({ request }) => {
    const url = new URL(request.url);
    const countryId = url.searchParams.get("countryId");

    const allCities = [
      { cityId: 10, countryId: 1, korean: "도쿄", english: "Tokyo" },
      { cityId: 11, countryId: 1, korean: "오사카", english: "Osaka" },
      { cityId: 20, countryId: 2, korean: "파리", english: "Paris" },
      { cityId: 21, countryId: 2, korean: "바르셀로나", english: "Barcelona" },
      { cityId: 30, countryId: 3, korean: "서울", english: "Seoul" },
      { cityId: 31, countryId: 3, korean: "제주", english: "Jeju" },
    ];

    if (countryId) {
      return HttpResponse.json(
        allCities.filter((c) => c.countryId === Number(countryId)),
      );
    }
    return HttpResponse.json(allCities);
  }),

  // ─── 여행 계획 생성 ─────────────────────────────────────────
  http.post(`${BASE_URL}/travels`, async () => {
    return HttpResponse.json({
      travelPlanId: 99,
      startDate: "2025-09-01",
      endDate: "2025-09-03",
      countryName: "일본",
      cityName: "도쿄",
    });
  }),

  // ─── 장소 저장 ─────────────────────────────────────────────
  http.post(`${BASE_URL}/locations`, async () => {
    return HttpResponse.json([
      {
        locationId: 10,
        place: "센소지",
        latitude: 35.7148,
        longitude: 139.7967,
        address: "2 Chome-3-1 Asakusa",
        category: "ATTRACTION",
      },
    ]);
  }),

  // ─── 일정 생성 ─────────────────────────────────────────────
  http.post(`${BASE_URL}/daySchedule/create/:travelPlanId`, async () => {
    return HttpResponse.json("일정이 생성되었습니다.");
  }),
];
