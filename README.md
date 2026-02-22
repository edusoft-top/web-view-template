# 🚀 วิธีการติดตั้งและเริ่มใช้งาน (Installation Guide)

**1. Clone โปรเจกต์:**
```bash
git clone https://github.com/edusoft-top/web-view-template.git
cd web-view-template
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
# android (apk)
eas build --platform android --profile preview

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
