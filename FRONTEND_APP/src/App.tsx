import "./App.css";
import { Route, Routes, useNavigate } from "react-router-dom";
import GetCode from "./components/getCode";
import SendCode from "./components/sendCode";
import SignIn from "./components/signIn";

import Cookie from "js-cookie";
import { useEffect } from "react";

function App() {
  const Nav = useNavigate();

  useEffect(() => {
    const token = Cookie.get("token");
    if (!token) {
      Nav("/signin");
      console.log("No token found in cookies");
      return;
    }
  }, []);

  return (
    <Routes>
      <Route path="/" element={<GetCode />} />
      <Route path="/auth/linkedin/callback" element={<SendCode />} />
      <Route path="/auth/youtube/callback" element={<SendCode />} />
      <Route path="/signin" element={<SignIn />} />
    </Routes>
  );
}

export default App;
