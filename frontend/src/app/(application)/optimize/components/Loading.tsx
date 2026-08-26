"use client";

import Image from "next/image";
import styled from "styled-components";

export default function Loading() {
  return (
    <Wrapper>
      <Container>
        <Hourglass>
          <Image src="/icons/Loading.png" width={120} height={120} alt="Loading" priority />
        </Hourglass>
        <Message>
          열심히 경로를 짜고 있어요!
          <br />
          조금만 기다려주세요!
        </Message>
      </Container>
    </Wrapper>
  );
}

const Wrapper = styled.div`
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
`;

const Container = styled.div`
  text-align: center;
`;

const Hourglass = styled.div`
  display: inline-block;
  transform: scaleX(-1) rotate(-15deg);
  margin-bottom: 16px;
`;

const Message = styled.p`
  font-size: 20px;
  font-weight: 600;
  line-height: 1.4;
  margin: 0;
`;


