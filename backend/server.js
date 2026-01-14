import express from "express";
import axios from "axios";
import cors from "cors";
import dotenv from "dotenv";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("HyperVerge backend running");
});

/**
 * Token generation with authenticateOnResume = yes
 */
app.post("/api/hyperverge/token", async (req, res) => {
  const { workflowId, transactionId } = req.body;

  if (!workflowId || !transactionId) {
    return res.status(400).json({
      error: "workflowId and transactionId are required"
    });
  }

  try {
    const response = await axios.post(
      "https://ind-state.idv.hyperverge.co/v2/auth/token",
      {
        appId: process.env.t8no7t,
        appKey: process.env.mgfypp59rq8zli15wlwc,
        expiry: 86400,                 // 24 hours
        workflowId,
        transactionId,
        authenticateOnResume: "yes",   // 🔑 IMPORTANT
        mobileNumber: "8291027727"     // 🔑 REQUIRED for resume
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
      "HyperVerge token error:",
      error.response?.data || error.message
    );

    res.status(500).json({
      error: "Failed to generate HyperVerge token"
    });
  }
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => {
  console.log(`✅ Backend running on http://localhost:${PORT}`);
});
