// ecommerce-store/api/index.js

import express from 'express';
import cors from 'cors';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

const app = express();

// ✅ CORS - الحل النهائي
app.use((req, res, next) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Content-Type, Authorization, X-Requested-With');
  
  // ✅ Handle preflight requests
  if (req.method === 'OPTIONS') {
    return res.status(200).send();
  }
  next();
});

app.use(express.json());

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

app.post('/api/send-email', async (req, res) => {
  const { name, email, message } = req.body;

  // ✅ التحقق من البيانات
  if (!name || !email || !message) {
    return res.status(400).json({ 
      success: false, 
      message: 'جميع الحقول مطلوبة' 
    });
  }

  try {
    await transporter.sendMail({
      from: process.env.EMAIL_USER,
      to: process.env.EMAIL_USER,
      subject: `📩 رسالة جديدة من ${name}`,
      html: `
        <h2>📩 رسالة جديدة من الموقع</h2>
        <hr />
        <p><strong>👤 الاسم:</strong> ${name}</p>
        <p><strong>📧 البريد الإلكتروني:</strong> ${email}</p>
        <p><strong>📝 الرسالة:</strong></p>
        <p style="background: #f5f5f5; padding: 12px; border-radius: 8px;">${message}</p>
      `,
    });

    res.json({ success: true, message: 'تم الإرسال بنجاح!' });
  } catch (error) {
    console.error('Error sending email:', error);
    res.status(500).json({ 
      success: false, 
      message: 'فشل الإرسال: ' + error.message 
    });
  }
});

// ✅ لو مش لاقي route
app.use((req, res) => {
  res.status(404).json({ error: 'Route not found' });
});

export default app;
