const express = require("express");
const app = express();

app.use(express.json());

app.post("/onBeforeSendSMS", async (req, res) => {
  try {
    console.log("✅ CDC HIT RECEIVED");
    console.log("Body:", JSON.stringify(req.body, null, 2));

    return res.status(200).json({
      status: "OK"
    });

  } catch (error) {
    console.error("❌ Error:", error.message);

    return res.status(200).json({
      status: "FAIL",
      data: {
        userFacingErrorMessage: "Error sending OTP"
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`🚀 CDC SMS Extension running on port ${PORT}`);
});
