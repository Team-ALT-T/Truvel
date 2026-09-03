"use client";

import { useRouter } from "next/navigation";
import styled from "styled-components";

export default function SearchError({ reset }: { reset: () => void }) {
  const router = useRouter();

  return (
    <Page>
      <Card>
        <Title>검색 결과를 불러오지 못했습니다.</Title>
        <Description>
          잠시 후 다시 시도하거나 인기 여행지 화면으로 돌아가주세요.
        </Description>
        <Actions>
          <RetryButton type="button" onClick={reset}>
            다시 시도
          </RetryButton>
          <BackButton
            type="button"
            onClick={() => router.push("/my-trips/popular")}
          >
            인기 여행지로
          </BackButton>
        </Actions>
      </Card>
    </Page>
  );
}

const Page = styled.main`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  background: #faf8f6;
`;

const Card = styled.section`
  width: min(100%, 420px);
  padding: 32px 24px;
  border-radius: 20px;
  background: #fff;
  text-align: center;
`;

const Title = styled.h1`
  margin: 0;
  font-size: 20px;
`;

const Description = styled.p`
  margin: 12px 0 24px;
  color: #777;
  line-height: 1.6;
`;

const Actions = styled.div`
  display: flex;
  gap: 8px;
`;

const RetryButton = styled.button`
  flex: 1;
  padding: 12px;
  border: 0;
  border-radius: 12px;
  background: #3ca6ff;
  color: #fff;
  font-weight: 700;
`;

const BackButton = styled(RetryButton)`
  border: 1px solid #dfe3e8;
  background: #fff;
  color: #1c1c1c;
`;
