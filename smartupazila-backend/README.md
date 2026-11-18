# 🏛️ Smart Upazila (স্মার্ট উপজেলা)

> **Comprehensive AI-Driven Digital Municipality & Public Service Platform for Bangladesh Upazilas**  
> *নাগরিক সেবা সহজীকরণ, কৃত্রিম বুদ্ধিমত্তা-ভিত্তিক অভিযোগ প্রতিকার এবং ডিজিটাল প্রশাসনিক প্ল্যাটফর্ম।*

---

[![NestJS](https://img.shields.io/badge/NestJS-E0234E?style=for-the-badge&logo=nestjs&logoColor=white)](https://nestjs.com/)
[![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?style=for-the-badge&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Google Gemini AI](https://img.shields.io/badge/Google%20Gemini-8E75C2?style=for-the-badge&logo=google&logoColor=white)](https://ai.google.dev/)
[![Cloudinary](https://img.shields.io/badge/Cloudinary-3448C5?style=for-the-badge&logo=cloudinary&logoColor=white)](https://cloudinary.com/)
[![Swagger](https://img.shields.io/badge/Swagger%20OpenAPI-85EA2D?style=for-the-badge&logo=swagger&logoColor=black)](https://swagger.io/)

---

## 📖 সারসংক্ষেপ (Overview)

**Smart Upazila** হলো বাংলাদেশের উপজেলা প্রশাসনের জন্য তৈরি একটি আধুনিক, স্বয়ংক্রিয় এবং এআই-চালিত ডিজিটাল নাগরিক সেবা প্ল্যাটফর্ম। এই প্ল্যাটফর্মের মাধ্যমে নাগরিকরা সরাসরি ঘরে বসেই অভিযোগ দাখিল, জরুরি সেবা গ্রহণ, রক্তদাতা সন্ধান, স্থানীয় ঐতিহ্যবাহী স্থান ও খাবার সম্পর্কে তথ্য অনুসন্ধান এবং সরকারি নোটিশ দেখতে পারেন। 

অ্যাডমিন ও কর্মকর্তাদের জন্য এতে রয়েছে স্বয়ংক্রিয় এআই রাউটিং, সর্বনিম্ন কাজের চাপ অনুযায়ী কর্মকর্তা বণ্টন, নাগরিক অনুমোদন (KYC) এবং কেন্দ্রীয় ব্যবস্থাপনা ড্যাশবোর্ড।

---

## ✨ মূল সুবিধাসমূহ (Key Features)

### ১. 👤 নাগরিক রেজিস্ট্রেশন ও অনুমোদন (Citizen KYC & RBAC)
- **কঠোর ভ্যালিডেশন:** বাংলাদেশি সঠিক মোবাইল নম্বর (`013-019`), ইমেইল এবং ১০/১৩/১৭ ডিজিটের জাতীয় পরিচয়পত্র (NID) ফরম্যাট ভ্যালিডেশন।
- **ডুপ্লিকেট প্রতিরোধ:** ডাটাবেজ এবং সার্ভিস লেভেলে মোবাইল, ইমেইল ও NID-এর জন্য সম্পূর্ণ ইউনিকনেস সুরক্ষিত।
- **অ্যাডমিন অনুমোদন:** ভুয়া একাউন্ট রোধে সাধারণ নাগরিক রেজিস্ট্রেশনের পর উপজেলা অ্যাডমিন বা সুপারঅ্যাডমিনের অনুমোদন সাপেক্ষে একাউন্ট সক্রিয় হয়।
- **ভূমিকা-ভিত্তিক নিয়ন্ত্রণ (RBAC):** `SUPERADMIN`, `ADMIN`, `OFFICER`, এবং `CITIZEN` রোল সাপোর্ট।

### ২. 🤖 এআই অভিযোগ প্রতিকার ও স্মার্ট রাউটিং (AI-Driven Grievance Redressal)
- **Google Gemini AI ইন্টিগ্রেশন:** নাগরিকের অভিযোগের ক্যাটাগরি ও বিবরণ বিশ্লেষণ করে স্বয়ংক্রিয়ভাবে সংশ্লিষ্ট সরকারি দপ্তর (যেমন: কৃষি, স্বাস্থ্য, প্রকৌশল, শিক্ষা ইত্যাদি) এবং জরুরি স্তর (Urgency: LOW, MEDIUM, HIGH, URGENT) নির্ধারণ।
- **স্বয়ংক্রিয় কর্মকর্তা অ্যাসাইন:** সংশ্লিষ্ট দপ্তরের কর্মকর্তাদের মধ্যে যার কাছে সবচেয়ে কম কাজ পেন্ডিং রয়েছে (Least Workload Balancing), সিস্টেম স্বয়ংক্রিয়ভাবে তার কাছে অভিযোগটি পৌঁছে দেয়।
- **ছবি প্রমাণপত্র আপলোড:** Cloudinary-এর মাধ্যমে নিরাপদে প্রাইভেট ছবি আপলোড এবং সাইনড সিকিউর ইউআরএল জেনারেশন।

### ৩. 💬 এআই নাগরিক সহকারী (Conversational Civic Assistant)
- প্রাকৃতিক বাংলায় নাগরিকের যেকোনো প্রশ্নের উত্তর দিতে সক্ষম Gemini AI-চালিত চ্যাটবট।
- **Function / Tool Calling:** জরুরি নম্বর, নিকটস্থ রক্তদাতা, পর্যটন স্থান বা নোটিশ সংক্রান্ত তথ্য ডাটাবেজ থেকে রিয়েলটাইমে খুঁজে নাগরিককে জানায়।

### ৪. 📢 ডিজিটাল নোটিশ বোর্ড (Public Notice Board)
- উপজেলা প্রশাসনের সকল বিজ্ঞপ্তি, প্রেস রিলিজ, জরুরি সতর্কতা ও টেন্ডার নোটিশ ক্যাটাগরি অনুযায়ী প্রচার।
- পিডিএফ বা ছবির সংযুক্তি (Attachments) এবং পিন করা গুরুত্বপূর্ণ নোটিশ ব্যবস্থা।

### ৫. 🚨 জরুরি সেবা ডিরেক্টরি (Emergency Services)
- উপজেলা ভিত্তিক থানা/পুলিশ, ফায়ার সার্ভিস, সরকারি হাসপাতাল, অ্যাম্বুলেন্স, পল্লী বিদ্যুৎ ও ইউএনও অফিসের হটলাইন ও যোগাযোগের তালিকা।

### ৬. 🩸 জীবনরক্ষাকারী রক্তদাতা নেটওয়ার্ক (Blood Donor Registry)
- রক্তের গ্রুপ (A+, B+, O+, AB+, ইত্যাদি), ইউনিয়ন/উপজেলা এবং বর্তমান উপস্থিতির (Availability) ভিত্তিতে মুহূর্তেই রক্তদাতা অনুসন্ধানের সুযোগ।

### ৭. 🏞️ স্থানীয় পর্যটন ও খাদ্য ঐতিহ্য (Places & Local Foods)
- উপজেলার দর্শনীয় ঐতিহাসিক ও পর্যটন স্থানসমূহ।
- এলাকার ঐতিহ্যবাহী খাবার, মিষ্টি ও কুটির শিল্পের বিস্তারিত তথ্য ও ছবি।

### ৮. 🤝 কমিউনিটি লিস্টিং (Community Board)
- নাগরিক ঘোষণা, জরুরি সহায়তা ও স্থানীয় সামাজিক উদ্যোগ শেয়ারের প্ল্যাটফর্ম।

---

## 🛠️ প্রযুক্তি স্ট্যাক (Tech Stack)

| উপাদান | প্রযুক্তি |
|---|---|
| **Backend Framework** | [NestJS](https://nestjs.com/) (Node.js & TypeScript) |
