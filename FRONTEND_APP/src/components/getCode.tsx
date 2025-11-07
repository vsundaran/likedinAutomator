import { useState } from "react";

function GetCode() {
  const [linkedInLoading, setLinkedInLoading] = useState(false);
  const [youTubeLoading, setYouTubeLoading] = useState(false);

  const handleLinkedInLogin = async () => {
    setLinkedInLoading(true);
    try {
      const authUrl = `https://www.linkedin.com/oauth/v2/authorization?response_type=code&client_id=86lxqr8ax7wcsk&redirect_uri=http://localhost:5173/auth/linkedin/callback&scope=w_member_social%20email%20profile%20openid%20`;

      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to get auth URL:", error);
      setLinkedInLoading(false);
    }
  };
  const handleYouTubeLogin = async () => {
    setYouTubeLoading(true);
    try {
      const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?
response_type=code&
client_id=685872622151-b8rvu2ookuqp8j7o7uhkrnot8ncp5jl8.apps.googleusercontent.com&
scope=https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.upload+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fyoutube.force-ssl+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.email+https%3A%2F%2Fwww.googleapis.com%2Fauth%2Fuserinfo.profile&
redirect_uri=http://localhost:5173/auth/youtube/callback&
access_type=offline&
state=testingflow&
prompt=consent`;

      window.location.href = authUrl;
    } catch (error) {
      console.error("Failed to get auth URL:", error);
      setYouTubeLoading(false);
    }
  };

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
      <h1>LinkedIn OAuth App</h1>
      <button
        onClick={handleLinkedInLogin}
        disabled={linkedInLoading}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: "#0077b5",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          opacity: linkedInLoading ? 0.6 : 1,
        }}
      >
        {linkedInLoading ? "Connecting..." : "Connect with LinkedIn"}
      </button>
      <button
        onClick={handleYouTubeLogin}
        disabled={youTubeLoading}
        style={{
          padding: "12px 24px",
          fontSize: "16px",
          backgroundColor: "#ff0000",
          color: "white",
          border: "none",
          borderRadius: "4px",
          cursor: "pointer",
          opacity: youTubeLoading ? 0.6 : 1,
        }}
      >
        {youTubeLoading ? "Connecting..." : "Connect with YouTube"}
      </button>
    </div>
  );
}

export default GetCode;
