# Stage 1: Build the React app
FROM node:16-alpine as build

WORKDIR /app

# העתקת קבצי package וקבצי קונפיגורציה
COPY package.json ./
COPY tsconfig.json ./
COPY tailwind.config.js ./
COPY postcss.config.js ./
COPY .env.example ./

# התקנת התלויות
RUN npm install

# העתקת שאר הקוד
COPY . .

# בניית האפליקציה
RUN npm run build

# Stage 2: הרצת האפליקציה באמצעות Nginx
FROM nginx:stable-alpine

# מחיקת התוכן המוגדר כברירת מחדל ב־Nginx
RUN rm -rf /usr/share/nginx/html/*

# העתקת תיקיית build מהשלב הראשון לתיקיית Nginx
COPY --from=build /app/build /usr/share/nginx/html

# חשיפת פורט 80
EXPOSE 80

# הפעלת Nginx
CMD ["nginx", "-g", "daemon off;"]
