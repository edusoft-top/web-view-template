# 🚀 วิธีการติดตั้งและเริ่มใช้งาน (Installation Guide)

สามารถเลือกติดตั้งได้ 2 รูปแบบตามความต้องการ ดังนี้:

---

## แบบที่ 1: การสร้างโปรเจกต์ใหม่
> สําหรับผู้ที่ต้องการเริ่มจากศูนย์

**1. ติดตั้ง Expo CLI (หากยังไม่มี):**
```bash
npm install -g expo-cli eas-cli
```

**2. สร้างโปรเจกต์ใหม่:**
```bash
npx create-expo-app@latest my-app-name
cd my-app-name
```

**3. เชื่อมต่อกับ Expo Account (เพื่อเอา Project ID ใหม่):**
```bash
eas login
npx eas project:init
```

**4. ติดตั้ง Library ที่จําเป็นเพิ่มเติม (ตัวอย่าง):**
```bash
npx expo install expo-camera expo-face-detector
```

---

## แบบที่ 2: การคัดลอกโปรเจกต์นี้ไปใช้งาน (Clone & Install Dependencies)
> หากคุณดาวน์โหลดไฟล์จาก GitHub นี้ หรือใช้คําสั่ง `git clone`

**1. Clone โปรเจกต์:**
```bash
git clone https://github.com/edusoft-top/web-view-template.git
cd REPOSITORY_NAME
```

**2. ติดตั้ง Library ทั้งหมดที่ระบุใน `package.json`:**
```bash
npm install
# หรือถ้าใช้ yarn
yarn install
```

**3. ตั้งค่า Expo Project ID ใหม่ (สําคัญมาก):**

> เนื่องจากไฟล์เดิมจะมี `projectId` ของผู้พัฒนาเดิมติดไป ให้รันคําสั่งนี้เพื่อสร้าง ID ของคุณเองในบัญชีใหม่:

```bash
npx eas project:init
```

**4. เริ่มรันโปรเจกต์:**
```bash
npx expo start
```

---

## 🛠 เทคโนโลยีที่ใช้ (Tech Stack)

| Framework | React Native (Expo) |
| Language | JavaScript / TypeScript |

---

## 📱 การ Build แอปพลิเคชัน (EAS Build)


```bash
# android
eas build --platform android

# ios
eas build --platform ios
```

---

## 💡 คําแนะนําเพิ่มเติมสําหรับการใช้ Git

อย่าลืมสร้างไฟล์ `.gitignore` เพื่อไม่ให้ไฟล์ขยะหรือโฟลเดอร์หนักๆ ถูกดันขึ้น GitHub:

```plaintext
node_modules/
.expo/
dist/
npm-debug.*
*.jks
*.p12
*.key
*.mobileprovision
```
