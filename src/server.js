const express = require("express");
const bodyParser = require("body-parser");
const jwt = require("jsonwebtoken");
const { sendSMS } = require("./smsProvider");

const app = express();

// Parse JSON body from SAP CDC
app.use(bodyParser.json());

app.post("/onBeforeSendSMS", async (req, res) => {
  try {
    // ==================================================
    // 1️⃣ LOG RAW REQUEST FROM SAP CDC
    // ==================================================
    console.log("========== RAW CDC REQUEST ==========");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("=====================================");

    let decodedPayload;

    // ==================================================
    // 2️⃣ HANDLE SIGNED (JWS) PAYLOAD
    // ==================================================
    if (req.body && req.body.jws) {
      const decoded = jwt.decode(req.body.jws, { complete: true });

      if (!decoded || !decoded.payload) {
        throw new Error("Unable to decode CDC JWS payload");
      }

      decodedPayload = decoded.payload;

      console.log("========== DECODED JWS PAYLOAD ==========");
      console.log(JSON.stringify(decodedPayload, null, 2));
      console.log("=========================================");
    } else {
      // Fallback for unsigned payloads
      decodedPayload = req.body;
    }

    // ==================================================
    // 3️⃣ UNWRAP CDC DATA OBJECT (CRITICAL STEP)
    // ==================================================
    const data = decodedPayload.data
      ? decodedPayload.data
      : decodedPayload;

    const phoneNumber = data.phoneNumber;
    const code = data.code;
    const message = data.message;

    // ==================================================
    // 4️⃣ VALIDATION
    // ==================================================
    if (!phoneNumber || !code) {
      throw new Error("Missing phoneNumber or code in CDC payload");
    }

    // ==================================================
    // 5️⃣ LOG NORMALIZED DATA
    // ==================================================
    console.log("========== NORMALIZED DATA ==========");
    console.log("Phone Number :", phoneNumber);
    console.log("OTP Code     :", code);
    console.log("Message      :", message);
    console.log("====================================");

    // ==================================================
    // 6️⃣ SEND SMS (CUSTOM PROVIDER / SIMULATED)
    // ==================================================
    await sendSMS(phoneNumber, message);

    // ==================================================
    // 7️⃣ RESPOND TO CDC (SUCCESS)
    // ==================================================
    return res.status(200).json({
      status: "OK"
    });

  } catch (error) {
    // ==================================================
    // 8️⃣ ERROR HANDLING (CDC EXPECTS HTTP 200)
    // ==================================================
    console.error("❌ OnBeforeSendSMS Error:", error.message);

    return res.status(200).json({
      status: "FAIL",
      data: {
        userFacingErrorMessage:
          "Unable to send verification code. Please try again."
      }
    });
  }
});

// ==================================================
// 9️⃣ START SERVER
// ==================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ CDC SMS Extension listening on port ${PORT}`);
});
