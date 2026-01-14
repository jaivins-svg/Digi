import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";

dotenv.config();

const app = express();

/* Needed for ES modules (__dirname replacement) */
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/* Middleware */
app.use(cors());
app.use(express.json());

/* Serve static files (Test.html) */
app.use(express.static(__dirname));

/* Root → loads Test.html */
app.get("/", (req, res) => {
  res.sendFile(path.join(__dirname, "Test.html"));
});

/**
 * Generate HyperVerge token
 * authenticateOnResume = yes
 */
app.post("/api/hyperverge/token", async (req, res) => {
  const { workflowId } = req.body;

  if (!workflowId) {
    return res.status(400).json({
      error: "workflowId is required"
    });
  }

  // 🔁 Generate new transactionId EVERY TIME
  const transactionId = `TXN_${Date.now()}`;

  try {
    const response = await axios.post(
      "https://ind-state.idv.hyperverge.co/v2/auth/token",
      {
        appId: process.env.HYPERVERGE_APP_ID,
        appKey: process.env.HYPERVERGE_APP_KEY,
        expiry: 86400,
        workflowId,
        transactionId,
        authenticateOnResume: "yes",
        mobileNumber: "8291027727"
      },
      {
        headers: {
          "Content-Type": "application/json"
        }
      }
    );

    const token = response.data?.result?.token;

    if (!token) {
      throw new Error("Token not received from HyperVerge");
    }

    res.json({
      token: `Bearer ${token}`,
      transactionId
    });

  } catch (error) {
    console.error(
      "❌ HyperVerge token error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Failed to generate HyperVerge token"
    });
  }
});

/* Start server */
const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Backend running at http://localhost:${PORT}`);
});
