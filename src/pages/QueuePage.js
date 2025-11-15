import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { queueAPI } from "../api/api";
import "./QueuePage.css";

function QueuePage() {
  const navigate = useNavigate();
  const [queuePosition, setQueuePosition] = useState(null);
  const [queueToken, setQueueToken] = useState(null);

  useEffect(() => {
    // localStorage에서 임시 userId 가져오기 (없으면 생성)
    let userId = localStorage.getItem("tempUserId");
    if (!userId) {
      userId = `guest_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem("tempUserId", userId);
    }

    // 대기열 진입
    queueAPI
      .enterQueue(userId)
      .then((response) => {
        const { queueToken, position, status } = response.data;
        setQueueToken(queueToken);
        setQueuePosition(position);

        // 즉시 통과 가능하면 바로 로그인 페이지로
        if (status === "ready") {
          setTimeout(() => {
            navigate("/login");
          }, 1000);
          return;
        }

        // SSE 연결하여 실시간 위치 업데이트
        const eventSource = new EventSource(
          `http://localhost:8080/api/queue/status?queueToken=${queueToken}`
        );

        eventSource.addEventListener("position", (event) => {
          const data = JSON.parse(event.data);
          setQueuePosition(data.position);
        });

        eventSource.addEventListener("ready", (event) => {
          eventSource.close();
          // 대기 완료, 로그인 페이지로 이동
          setTimeout(() => {
            navigate("/login");
          }, 1000);
        });

        eventSource.onerror = (error) => {
          console.error("SSE 에러:", error);
          eventSource.close();
        };

        return () => {
          eventSource.close();
        };
      })
      .catch((error) => {
        console.error("대기열 진입 실패:", error);
        alert("대기열 진입에 실패했습니다.");
        navigate("/");
      });
  }, [navigate]);

  return (
    <div className="queue-page">
      <div className="container">
        <h1>🚄 대기열</h1>

        <div className="queue-info">
          <div className="spinner"></div>

          {queuePosition !== null && (
            <div className="position-display">
              <h2>{queuePosition.toLocaleString()}번째</h2>
              <p>대기중입니다</p>
            </div>
          )}

          <div className="waiting-message">
            <p>잠시만 기다려주세요...</p>
            <p className="sub-text">
              순서가 되면 자동으로 로그인 화면으로 이동합니다
            </p>
          </div>
        </div>

        <div className="notice-box">
          <h3>⚠️ 유의사항</h3>
          <ul>
            <li>브라우저를 닫지 마세요</li>
            <li>새로고침하면 대기열에서 제외됩니다</li>
            <li>로그인 후 3분 이내 예매를 완료해주세요</li>
          </ul>
        </div>
      </div>
    </div>
  );
}

export default QueuePage;
