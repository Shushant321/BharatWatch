import dotenv from "dotenv";
dotenv.config({ path: "./.env" });

import connectDB from "./db/index.js";
import { app } from "./app.js";

import "./services/cloudinary.js"; // Cloudinary init

// ❌ ye import hata do:
// import { transporter } from "./services/emailTransporter.js";

connectDB()
  .then(() => {
    app.listen(process.env.PORT || 8000, () => {
      console.log(`Server is running at port : ${process.env.PORT || 8000}`);
    });
  })
  .catch((error) => {
    console.log("MongoDB connection failed !!!", error);
  });

// ❌ ye pura block bhi hata do:
// transporter.verify((err, success) => {
//   if (err) console.error("SMTP connection failed:", err);
//   else console.log("SMTP ready to send emails");
// });
