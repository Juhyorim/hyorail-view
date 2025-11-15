import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, bookingAPI } from "../api/api";
import "./BookingPage.css";

function BookingPage() {
  const navigate = useNavigate();
  const [trains, setTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [remainingTime, setRemainingTime] = useState(180); // 3분 = 180초
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const sessionId = localStorage.getItem("sessionId");
    if (!sessionId) {
      navigate("/");
      return;
    }

    // 세션 검증 및 열차 목록 조회
    authAPI
      .validateSession()
      .then((response) => {
        if (!response.data.valid) {
          alert("세션이 만료되었습니다.");
          navigate("/");
          return;
        }

        setRemainingTime(response.data.remainingSeconds || 180);
        return bookingAPI.getTrains();
      })
      .then((response) => {
        if (response) {
          setTrains(response.data);
        }
      })
      .catch((error) => {
        console.error("데이터 로딩 실패:", error);
        alert("데이터를 불러오는데 실패했습니다.");
        navigate("/");
      });

    // 타이머 설정
    const timer = setInterval(() => {
      setRemainingTime((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          handleLogout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [navigate]);

  const handleLogout = () => {
    authAPI.logout().catch((err) => console.error(err));
    localStorage.clear();
    alert("세션이 만료되어 로그아웃되었습니다.");
    navigate("/");
  };

  const handleBook = async () => {
    if (!selectedTrain) {
      alert("열차를 선택해주세요.");
      return;
    }

    setLoading(true);

    try {
      const response = await bookingAPI.book(selectedTrain.id);
      setBooking(response.data);
      alert("예매가 완료되었습니다!");
    } catch (error) {
      console.error("예매 실패:", error);
      const message = error.response?.data?.message || "예매에 실패했습니다.";
      alert(message);
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDateTime = (dateTimeString) => {
    const date = new Date(dateTimeString);
    return date.toLocaleString("ko-KR", {
      month: "long",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  if (booking) {
    return (
      <div className="booking-page">
        <div className="container">
          <h1>✅ 예매 완료</h1>

          <div className="booking-complete">
            <div className="success-icon">🎉</div>
            <h2>예매가 완료되었습니다!</h2>

            <div className="booking-info">
              <div className="info-row">
                <span className="label">열차번호</span>
                <span className="value">{booking.trainNumber}</span>
              </div>
              <div className="info-row">
                <span className="label">출발지</span>
                <span className="value">{booking.departure}</span>
              </div>
              <div className="info-row">
                <span className="label">도착지</span>
                <span className="value">{booking.arrival}</span>
              </div>
              <div className="info-row">
                <span className="label">출발시간</span>
                <span className="value">
                  {formatDateTime(booking.departureTime)}
                </span>
              </div>
              <div className="info-row">
                <span className="label">좌석번호</span>
                <span className="value highlight">{booking.seatNumber}</span>
              </div>
            </div>

            <div className="notice">
              <p>💳 결제는 내일 일괄 진행됩니다</p>
            </div>

            <button onClick={() => navigate("/")} className="home-button">
              처음으로
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="booking-page">
      <div className="container">
        <div className="header">
          <h1>🚄 열차 선택</h1>
          <div className={`timer ${remainingTime <= 30 ? "warning" : ""}`}>
            남은 시간: {formatTime(remainingTime)}
          </div>
        </div>

        <div className="train-list">
          {trains.map((train) => (
            <div
              key={train.id}
              className={`train-item ${
                selectedTrain?.id === train.id ? "selected" : ""
              } ${train.availableSeats === 0 ? "sold-out" : ""}`}
              onClick={() =>
                train.availableSeats > 0 && setSelectedTrain(train)
              }
            >
              <div className="train-header">
                <h3>{train.trainNumber}</h3>
                <span className="seats">
                  {train.availableSeats > 0
                    ? `잔여 ${train.availableSeats}석`
                    : "매진"}
                </span>
              </div>

              <div className="train-route">
                <span className="departure">{train.departure}</span>
                <span className="arrow">→</span>
                <span className="arrival">{train.arrival}</span>
              </div>

              <div className="train-time">
                <span>{formatDateTime(train.departureTime)}</span>
                <span>→</span>
                <span>{formatDateTime(train.arrivalTime)}</span>
              </div>
            </div>
          ))}
        </div>

        <button
          className="book-button"
          onClick={handleBook}
          disabled={!selectedTrain || loading}
        >
          {loading ? "예매 중..." : "예매하기"}
        </button>
      </div>
    </div>
  );
}

export default BookingPage;
