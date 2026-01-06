const express = require("express");
const bodyParser = require("body-parser");
const { sendSMS } = require("./smsProvider");

const app = express();
app.use(bodyParser.json());

app.post("/onBeforeSendSMS", async (req, res) => {
  try {
    const { callID, extensionPoint, data } = req.body;

    console.log("=== CDC OnBeforeSendSMS ===");
    console.log("CallID:", callID);
    console.log("Extension:", extensionPoint);
    console.log("Phone:", data.phoneNumber);
    console.log("OTP Code:", data.code);
    console.log("Message:", data.message);
    console.log("==========================");

    await sendSMS(data.phoneNumber, data.message);

    return res.status(200).json({
      status: "OK"
    });

  } catch (err) {
    console.error("Extension error:", err);

    return res.status(200).json({
      status: "FAIL",
      data: {
        userFacingErrorMessage: "SMS sending failed"
      }
    });
  }
});

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log("Server running on port", PORT);
});
