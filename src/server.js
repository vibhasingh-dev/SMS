const express = require("express");
const bodyParser = require("body-parser");
const { sendSMS } = require("./smsProvider");

const app = express();

// IMPORTANT: parse JSON
app.use(bodyParser.json());

app.post("/onBeforeSendSMS", async (req, res) => {
  try {
    // 🔍 LOG RAW CDC PAYLOAD
    console.log("========== RAW CDC PAYLOAD ==========");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("=====================================");

    // 🧠 Normalize payload (CDC sends multiple formats)
    const payload =
      req.body && req.body.data
        ? req.body.data
        : req.body && req.body.phoneNumber
        ? req.body
        : {};

    const phoneNumber = payload.phoneNumber;
    const code = payload.code;
    const message = payload.message;

    if (!phoneNumber || !code) {
      throw new Error("Missing phoneNumber or code in CDC payload");
    }

    console.log("========== NORMALIZED DATA ==========");
    console.log("Phone:", phoneNumber);
    console.log("Code:", code);
    console.log("Message:", message);
    console.log("====================================");

    await sendSMS(phoneNumber, message);

    return res.status(200).json({ status: "OK" });
  } catch (err) {
    console.error("❌ OnBeforeSendSMS Error:", err.message);

    return res.status(200).json({
      status: "FAIL",
      data: {
        userFacingErrorMessage: "SMS handling failed"
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ CDC SMS Extension listening on port ${PORT}`);
});
