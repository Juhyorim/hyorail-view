import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./StartPage.css";

function StartPage() {
  const navigate = useNavigate();
  const [isBookingOpen, setIsBookingOpen] = useState(false);
  const [timeRemaining, setTimeRemaining] = useState("");

  // 예매 시작 시간 설정 (2025-09-15 09:00:00)
  const bookingStartTime = new Date("2025-09-15T09:00:00");

  useEffect(() => {
    const checkBookingTime = () => {
      const now = new Date();

      if (now >= bookingStartTime) {
        setIsBookingOpen(true);
        setTimeRemaining("");
      } else {
        setIsBookingOpen(false);
        const diff = bookingStartTime - now;

        const days = Math.floor(diff / (1000 * 60 * 60 * 24));
        const hours = Math.floor(
          (diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)
        );
        const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
        const seconds = Math.floor((diff % (1000 * 60)) / 1000);

        setTimeRemaining(`${days}일 ${hours}시간 ${minutes}분 ${seconds}초`);
      }
    };

    checkBookingTime();
    const interval = setInterval(checkBookingTime, 1000);

    return () => clearInterval(interval);
  }, []);

  const handleBooking = () => {
    // localStorage 기반 임시 userId (새로고침해도 유지)
    let userId = localStorage.getItem("tempUserId");
    if (!userId) {
      userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("tempUserId", userId);
    }
    navigate("/queue");
  };

  return (
    <div className="start-page">
      <div className="container">
        <h1>🌕 2025 추석 열차 예매</h1>

        <div className="info-box">
          <h2>예매 안내</h2>
          <p>📅 예매 시작: 2025년 9월 15일 오전 9시</p>
          <p>🚄 운행 일자: 2025년 9월 16일 (추석 당일)</p>
          <p>⏰ 로그인 후 3분 이내 예매를 완료해주세요</p>
        </div>

        {!isBookingOpen && (
          <div className="countdown-box">
            <h3>예매 시작까지</h3>
            <div className="countdown">{timeRemaining}</div>
          </div>
        )}

        <button
          className="booking-button"
          onClick={handleBooking}
          disabled={!isBookingOpen}
        >
          {isBookingOpen ? "예매하러가기" : "예매 대기중..."}
        </button>

        {!isBookingOpen && (
          <p className="notice">예매 시작 시간이 되면 버튼이 활성화됩니다</p>
        )}
      </div>
    </div>
  );
}

export default StartPage;
