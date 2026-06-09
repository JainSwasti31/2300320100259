import axios from "axios";

/**
 * Frontend Logger - sends logs to Test Server
 */
const LOG_API_URL = "http://4.224.186.213/evaluation-service/logs";
const AUTH_URL = "http://4.224.186.213/evaluation-service/auth";
const AUTH_BODY = {
  email: process.env.REACT_APP_LOG_EMAIL || "",
  name: process.env.REACT_APP_LOG_NAME || "",
  rollNo: process.env.REACT_APP_LOG_ROLL_NO || "",
  accessCode: process.env.REACT_APP_LOG_ACCESS_CODE || "",
  clientID: process.env.REACT_APP_LOG_CLIENT_ID || "",
  clientSecret: process.env.REACT_APP_LOG_CLIENT_SECRET || "",
};

let cachedToken = null;
let tokenExpiry = 0;

async function getToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiry) return cachedToken;
  try {
    const res = await axios.post(AUTH_URL, AUTH_BODY);
    cachedToken = res.data.access_token;
    tokenExpiry = now + 12 * 60 * 1000;
    return cachedToken;
  } catch (e) {
    return null;
  }
}

async function Log(stack, level, pkg, message) {
  try {
    const token = await getToken();
    if (!token) return;
    await axios.post(LOG_API_URL, { stack, level, package: pkg, message }, {
      headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
    });
  } catch (e) { /* silent */ }
}

export default Log;
