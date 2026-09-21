# INAIL Catalog

เว็บไซต์แคตตาล็อกสินค้า ใช้ชื่อโฟลเดอร์ภายใน `products/` เป็นชื่อหมวด และชื่อไฟล์เป็นรหัสรูปสินค้า

## เพิ่มสินค้า

เพิ่มรูป JPG, PNG หรือ WebP ใน `products/ชื่อหมวด/` แล้ว push ไป GitHub ระบบจะสร้างรายการสินค้าใหม่ตอน build อัตโนมัติ ไม่ต้องแก้รายชื่อหมวดในโค้ด

## Render

สร้าง Static Site และเชื่อมต่อ repository นี้

- Build Command: `npm run build`
- Publish Directory: `dist`

หรือสร้างผ่าน Blueprint โดยใช้ `render.yaml`

## Preview

ใช้ `npm run build` แล้ว `npm start` เปิด http://127.0.0.1:4173

รูปสินค้าในเว็บถูกย่อเป็น WebP สำหรับออนไลน์ ไฟล์รูปต้นฉบับยังอยู่ในโฟลเดอร์เดิม
