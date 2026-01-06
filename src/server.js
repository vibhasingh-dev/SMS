const express = require("express");
const bodyParser = require("body-parser");
const { sendSMS } = require("./smsProvider");

const app = express();

// Parse JSON body from CDC
app.use(bodyParser.json());

app.post("/onBeforeSendSMS", async (req, res) => {
  try {
    // ==================================================
    // 1️⃣ LOG RAW PAYLOAD FROM SAP CDC (VERY IMPORTANT)
    // ==================================================
    console.log("========== RAW CDC PAYLOAD ==========");
    console.log(JSON.stringify(req.body, null, 2));
    console.log("=====================================");

    // ==================================================
    // 2️⃣ NORMALIZE CDC PAYLOAD (HANDLE ALL VARIANTS)
    // ==================================================
    // CDC may send fields either under "data" or at root
    const payload = req.body && req.body.data ? req.body.data : req.body;

    const phoneNumber = payload.phoneNumber;
    const countryCode = payload.countryCode;
    const code = payload.code;
    const message = payload.message;
    const flow = payload.flow;
    const isNewUser = payload.isNewUser;

    // ==================================================
    // 3️⃣ BASIC VALIDATION (DEFENSIVE)
    // ==================================================
    if (!phoneNumber || !code) {
      throw new Error(
        "Invalid CDC payload: phoneNumber or code missing"
      );
    }

    // ==================================================
    // 4️⃣ LOG NORMALIZED DATA (FOR DEBUGGING)
    // ==================================================
    console.log("========== NORMALIZED CDC DATA ==========");
    console.log("Phone Number :", phoneNumber);
    console.log("Country Code :", countryCode);
    console.log("OTP Code     :", code);
    console.log("Message      :", message);
    console.log("Flow         :", flow);
    console.log("Is New User  :", isNewUser);
    console.log("=========================================");

    // ==================================================
    // 5️⃣ SEND SMS USING YOUR CUSTOM PROVIDER (SIMULATED)
    // ==================================================
    await sendSMS(phoneNumber, message);

    // ==================================================
    // 6️⃣ TELL CDC: SMS HANDLED, DO NOT SEND IT YOURSELF
    // ==================================================
    return res.status(200).json({
      status: "OK"
    });

  } catch (error) {
    // ==================================================
    // 7️⃣ ERROR HANDLING (CDC REQUIRES HTTP 200)
    // ==================================================
    console.error("❌ OnBeforeSendSMS Error:", error.message);

    return res.status(200).json({
      status: "FAIL",
      data: {
        userFacingErrorMessage:
          "Unable to send verification SMS. Please try again."
      }
    });
  }
});

// ==================================================
// 8️⃣ START SERVER (RENDER / LOCAL / CLOUD SAFE)
// ==================================================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`✅ CDC SMS Extension listening on port ${PORT}`);
});
