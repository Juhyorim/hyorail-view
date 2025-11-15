import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { authAPI } from "../api/api";
import "./LoginPage.css";

function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await authAPI.login(username, password);
      const { sessionId, userId, name } = response.data;

      localStorage.setItem("sessionId", sessionId);
      localStorage.setItem("userId", userId);
      localStorage.setItem("userName", name);

      // 로그인 성공 후 예매 페이지로 이동
      navigate("/booking");
    } catch (error) {
      console.error("로그인 실패:", error);
      setError("로그인에 실패했습니다. 아이디와 비밀번호를 확인해주세요.");
    }
  };

  return (
    <div className="login-page">
      <div className="container">
        <h1>🔐 로그인</h1>

        <div className="login-box">
          <form onSubmit={handleLogin}>
            <div className="form-group">
              <label>아이디</label>
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="아이디를 입력하세요"
                required
              />
            </div>

            <div className="form-group">
              <label>비밀번호</label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="비밀번호를 입력하세요"
                required
              />
            </div>

            {error && <div className="error-message">{error}</div>}

            <button type="submit" className="login-button">
              로그인
            </button>
          </form>

          <div className="test-accounts">
            <h3>테스트 계정</h3>
            <p>아이디: user1 / 비밀번호: 1234</p>
            <p>아이디: user2 / 비밀번호: 1234</p>
          </div>
        </div>

        <div className="warning-box">
          <p>⚠️ 로그인 후 3분 이내 예매를 완료해주세요</p>
          <p>시간 초과 시 자동으로 로그아웃됩니다</p>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
