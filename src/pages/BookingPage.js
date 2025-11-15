import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI, bookingAPI } from "../api/api";
import "./BookingPage.css";

function BookingPage() {
  const navigate = useNavigate();
  const [trains, setTrains] = useState([]);
  const [selectedTrain, setSelectedTrain] = useState(null);
  const [remainingTime, setRemainingTime] = useState(180); // 3분 = 180초
  const [bookings, setBookings] = useState([]); // 배열로 변경
  const [loading, setLoading] = useState(false);
  const [showBookings, setShowBookings] = useState(false); // 예매 내역 표시 여부

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
      const newBooking = response.data;

      // 예매 내역에 추가
      setBookings((prev) => [...prev, newBooking]);

      // 선택 해제
      setSelectedTrain(null);

      // 열차 목록 새로고침
      const trainsResponse = await bookingAPI.getTrains();
      setTrains(trainsResponse.data);

      alert(
        `예매 완료! (좌석: ${newBooking.seatNumber})\n계속 예매하실 수 있습니다.`
      );
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

  return (
    <div className="booking-page">
      <div className="container">
        <div className="header">
          <h1>🚄 열차 선택</h1>
          <div className={`timer ${remainingTime <= 30 ? "warning" : ""}`}>
            남은 시간: {formatTime(remainingTime)}
          </div>
        </div>

        {/* 예매 내역 표시 */}
        {bookings.length > 0 && (
          <div className="bookings-summary">
            <div className="summary-header">
              <h3>✅ 예매 완료: {bookings.length}건</h3>
              <button
                className="toggle-button"
                onClick={() => setShowBookings(!showBookings)}
              >
                {showBookings ? "숨기기 ▲" : "보기 ▼"}
              </button>
            </div>

            {showBookings && (
              <div className="bookings-list">
                {bookings.map((booking, index) => (
                  <div key={index} className="booking-item">
                    <span className="booking-number">{index + 1}.</span>
                    <span className="booking-train">{booking.trainNumber}</span>
                    <span className="booking-route">
                      {booking.departure} → {booking.arrival}
                    </span>
                    <span className="booking-seat">{booking.seatNumber}</span>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

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
