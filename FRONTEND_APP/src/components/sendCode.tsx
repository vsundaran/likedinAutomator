import { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import Cookie from "js-cookie";

function SendCode() {
  const [loading, setLoading] = useState(false);
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const code = searchParams.get("code");
  // Unused variables removed to satisfy strict TSC
  const isYouTubeCode = location.pathname.includes("youtube");

  const header = {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${Cookie.get("token")}`,
    },
    body: JSON.stringify({ code }),
  };

  const handleSendCode = async () => {
    setLoading(true);
    try {
      const url = isYouTubeCode
        ? "http://localhost:3000/api/youtube/exchangeCodeForAccessToken"
        : "http://localhost:3000/api/linkedin/exchangeCodeForAccessToken";
      const response = await fetch(url, header);
      const data = await response.json();
      console.log(data);
    } catch (error) {
      console.error("Failed to send code:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (code) {
      handleSendCode();
    }
  }, [code]);

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100vh",
        flexDirection: "column",
        gap: "20px",
      }}
    >
      <h1>Code recived</h1>
      <h2>{code}</h2>
      {loading ? <p>Sending code...</p> : <p>Code sent!</p>}
    </div>
  );
}

export default SendCode;
