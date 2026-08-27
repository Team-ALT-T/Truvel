"use client";

import React, { useState } from "react";
import { ChevronLeft, Plus, Search, Minus } from "lucide-react";
import Image from "next/image";
import styled from "styled-components";
import { useRouter, useSearchParams } from "next/navigation";

// 일행 목록 아이템 (퍼블리싱용 더미 타입)
interface CompanionItem {
  id: string;
  userId: string;
  nickname: string;
  avatarUrl?: string;
  status: "대기중" | "수락됨";
}

const PageWrap = styled.div`
  font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
  background-color: #f8f8f8;
  min-height: 100vh;
  max-width: 1400px;
  margin: 0 auto;
  display: flex;
  flex-direction: column;
  padding-bottom: 100px;
`;

const Header = styled.header`
  background-color: #fff;
  padding: 16px 20px;
  display: flex;
  align-items: center;
  gap: 12px;
  border-bottom: 1px solid #eee;
`;

const BackButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: none;
  cursor: pointer;
  color: #1c1c1c;
  border-radius: 50%;
  &:hover {
    background-color: #f0f0f0;
  }
`;

const HeaderTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0;
`;

const Main = styled.main`
  flex: 1;
  padding: 24px 20px;
  width: 100%;
  max-width: 100%;
  box-sizing: border-box;

  @media (min-width: 768px) {
    max-width: 640px;
    margin: 0 auto;
  }
  @media (min-width: 1024px) {
    max-width: 800px;
  }
`;

const InviteButton = styled.button`
  display: flex;
  align-items: center;
  gap: 12px;
  width: 100%;
  max-width: 100%;
  margin: 0 auto;
  padding: 14px 0;
  background: none;
  border: none;
  cursor: pointer;
  text-align: left;
  transition: opacity 0.2s;
  &:hover {
    opacity: 0.85;
  }

  @media (min-width: 768px) {
    max-width: 640px;
  }
  @media (min-width: 1024px) {
    max-width: 800px;
  }
`;

const InviteButtonIcon = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: #e8e8e8;
  color: #3ca6ff;
`;

const InviteButtonText = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: #1c1c1c;
`;

const SectionTitle = styled.p`
  font-size: 15px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0 0 16px 0;
`;

const CompanionList = styled.ul`
  list-style: none;
  padding: 0;
  margin: 0 0 24px 0;
`;

const CompanionItem = styled.li`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 16px;
  background-color: #fff;
  border-radius: 12px;
  margin-bottom: 10px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.06);
`;

const CompanionInfo = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  flex: 1;
  min-width: 0;
`;

const Avatar = styled.div`
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border-radius: 50%;
  background-color: #e8e8e8;
  overflow: hidden;
  display: flex;
  align-items: center;
  justify-content: center;
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const CompanionName = styled.span`
  font-size: 15px;
  font-weight: 500;
  color: #1c1c1c;
`;

const StatusBadge = styled.span`
  flex-shrink: 0;
  display: inline-block;
  padding: 4px 10px;
  border-radius: 12px;
  background-color: #e8e8e8;
  color: #666;
  font-size: 13px;
  font-weight: 500;
`;

const RemoveButton = styled.button`
  flex-shrink: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  border: none;
  background-color: #f0f0f0;
  color: #666;
  cursor: pointer;
  &:hover {
    background-color: #e0e0e0;
    color: #333;
  }
`;

const Footer = styled.footer`
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 1400px;
  background-color: #fff;
  border-top: 1px solid #e5e5e5;
  padding: 16px 20px 24px;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  box-shadow: 0 -2px 10px rgba(0, 0, 0, 0.05);
`;

const SkipLink = styled.button`
  background: none;
  border: none;
  font-size: 15px;
  color: #777;
  cursor: pointer;
  text-decoration: none;
  padding: 4px;
  &:hover {
    color: #333;
  }
`;

const CompleteButton = styled.button`
  width: 100%;
  max-width: 360px;
  padding: 14px 24px;
  background-color: #3ca6ff;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: #2d8de6;
  }
  @media (min-width: 768px) {
    max-width: 640px;
  }
  @media (min-width: 1024px) {
    max-width: 800px;
  }
`;

// 모달
const Overlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.4);
  z-index: 100;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 20px;
`;

const ModalCard = styled.div`
  width: 100%;
  max-width: 400px;
  background-color: #fff;
  border-radius: 16px;
  padding: 24px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.15);
`;

const ModalTitle = styled.h2`
  font-size: 18px;
  font-weight: 600;
  color: #1c1c1c;
  margin: 0 0 20px 0;
`;

const InputWrap = styled.div`
  position: relative;
  margin-bottom: 20px;
`;

const SearchInput = styled.input`
  width: 100%;
  padding: 14px 44px 14px 16px;
  border: 1px solid #e0e0e0;
  border-radius: 12px;
  font-size: 15px;
  color: #1c1c1c;
  box-sizing: border-box;
  &::placeholder {
    color: #999;
  }
  &:focus {
    outline: none;
    border-color: #3ca6ff;
  }
`;

const SearchIconButton = styled.button`
  position: absolute;
  right: 8px;
  top: 50%;
  transform: translateY(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  padding: 0;
  border: none;
  background: none;
  color: #999;
  cursor: pointer;
  border-radius: 50%;
  &:hover {
    color: #3ca6ff;
    background-color: #f0f8ff;
  }
`;

const SearchResultRow = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px 0;
  margin-bottom: 16px;
  border-bottom: 1px solid #eee;
`;

const ModalConfirmButton = styled.button`
  width: 100%;
  padding: 14px;
  background-color: #3ca6ff;
  color: #fff;
  border: none;
  border-radius: 12px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  &:hover {
    background-color: #2d8de6;
  }
`;

function InviteCompanionsPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const travelPlanId = searchParams.get("id");

  const [companions, setCompanions] = useState<CompanionItem[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [searchKeyword, setSearchKeyword] = useState("");
  const [searchResult, setSearchResult] = useState<{ userId: string; nickname: string; avatarUrl?: string } | null>(null);
  const [showRemoveOnFirst, setShowRemoveOnFirst] = useState(false);

  const handleBack = () => {
    if (travelPlanId) {
      router.push(`/mytripdetail?id=${travelPlanId}`);
    } else {
      router.back();
    }
  };

  const handleSkip = () => {
    if (travelPlanId) {
      router.push(`/mytripdetail?id=${travelPlanId}`);
    } else {
      router.back();
    }
  };

  const handleComplete = () => {
    if (travelPlanId) {
      router.push(`/mytripdetail?id=${travelPlanId}`);
    } else {
      router.back();
    }
  };

  const openInviteModal = () => {
    setSearchKeyword("");
    setSearchResult(null);
    setShowModal(true);
  };

  const closeModal = () => {
    setShowModal(false);
    setSearchKeyword("");
    setSearchResult(null);
  };

  const handleSearchConfirm = () => {
    if (!searchKeyword.trim()) return;
    setSearchResult({
      userId: searchKeyword,
      nickname: searchKeyword,
      avatarUrl: undefined,
    });
  };

  const handleInviteFromModal = () => {
    if (!searchResult) return;
    setCompanions((prev) => [
      ...prev,
      {
        id: `c-${Date.now()}`,
        userId: searchResult.userId,
        nickname: searchResult.nickname,
        avatarUrl: searchResult.avatarUrl,
        status: "대기중",
      },
    ]);
    closeModal();
  };

  const removeCompanion = (id: string) => {
    setCompanions((prev) => prev.filter((c) => c.id !== id));
  };

  const toggleFirstItemDisplay = () => {
    setShowRemoveOnFirst((prev) => !prev);
  };

  const hasCompanions = companions.length > 0;

  return (
    <PageWrap>
      <Header>
        <BackButton type="button" onClick={handleBack} aria-label="뒤로">
          <ChevronLeft className="w-6 h-6" />
        </BackButton>
        <HeaderTitle>일행 초대</HeaderTitle>
      </Header>

      <Main>
        {hasCompanions && (
          <>
            <SectionTitle>나의 일행 {companions.length}명</SectionTitle>
            <CompanionList>
              {companions.map((c) => {
                const showRemove = showRemoveOnFirst && c.id === companions[0].id;
                return (
                  <CompanionItem key={c.id}>
                    <CompanionInfo>
                      <Avatar>
                        {c.avatarUrl ? (
                          <Image src={c.avatarUrl} alt="" width={44} height={44} />
                        ) : (
                          <span style={{ fontSize: "20px" }}></span>
                        )}
                      </Avatar>
                      <CompanionName>{c.nickname}</CompanionName>
                    </CompanionInfo>
                    {showRemove ? (
                      <RemoveButton
                        type="button"
                        onClick={() => removeCompanion(c.id)}
                        aria-label="일행 제거"
                      >
                        <Minus className="w-5 h-5" />
                      </RemoveButton>
                    ) : (
                      <StatusBadge>{c.status}</StatusBadge>
                    )}
                  </CompanionItem>
                );
              })}
            </CompanionList>
          </>
        )}

        <InviteButton type="button" onClick={openInviteModal}>
          <InviteButtonIcon>
            <Plus className="w-5 h-5" strokeWidth={2.5} />
          </InviteButtonIcon>
          <InviteButtonText>친구 초대하기</InviteButtonText>
        </InviteButton>

        {/* 퍼블 확인용: 첫 번째 일행만 대기중/제거 토글 (실제 연동 시 제거) */}
        {hasCompanions && (
          <button
            type="button"
            onClick={toggleFirstItemDisplay}
            style={{
              marginTop: 16,
              fontSize: 12,
              color: "#999",
              background: "none",
              border: "none",
              cursor: "pointer",
            }}
          >
            [퍼블] 첫 번째 일행: {showRemoveOnFirst ? "제거 아이콘" : "대기중"} 보기
          </button>
        )}
      </Main>

      <Footer>
        <SkipLink type="button" onClick={handleSkip}>
          건너뛰기
        </SkipLink>
        <CompleteButton type="button" onClick={handleComplete}>
          초대 완료
        </CompleteButton>
      </Footer>

      {showModal && (
        <Overlay onClick={closeModal}>
          <ModalCard onClick={(e: React.MouseEvent) => e.stopPropagation()}>
            <ModalTitle>친구 초대하기</ModalTitle>
            <InputWrap>
              <SearchInput
                type="text"
                placeholder="아이디 입력"
                value={searchKeyword}
                onChange={(e) => {
                  setSearchKeyword(e.target.value);
                  setSearchResult(null);
                }}
                onKeyDown={(e) => e.key === "Enter" && handleSearchConfirm()}
              />
              <SearchIconButton
                type="button"
                onClick={handleSearchConfirm}
                aria-label="검색"
              >
                <Search className="w-5 h-5" />
              </SearchIconButton>
            </InputWrap>

            {searchResult ? (
              <>
                <SearchResultRow>
                  <Avatar>
                    <span style={{ fontSize: "20px" }}></span>
                  </Avatar>
                  <CompanionName>{searchResult.nickname}</CompanionName>
                </SearchResultRow>
                <ModalConfirmButton type="button" onClick={handleInviteFromModal}>
                  초대
                </ModalConfirmButton>
              </>
            ) : (
              <ModalConfirmButton type="button" onClick={handleSearchConfirm}>
                확인
              </ModalConfirmButton>
            )}
          </ModalCard>
        </Overlay>
      )}
    </PageWrap>
  );
}

export default function InviteCompanionsPage() {
  return (
    <React.Suspense fallback={null}>
      <InviteCompanionsPageContent />
    </React.Suspense>
  );
}
