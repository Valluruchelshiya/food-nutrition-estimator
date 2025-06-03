# 🥗 Food Nutrition Estimator (AI-Powered)

This is an AI-based web application that detects food items from images and provides estimated nutrition information like calories, protein, carbs, and fats using the **Clarifai** image recognition model and the **CalorieNinjas API**.
## 📸 How It Works

1. Upload a food image
2. AI model detects the top 3 food items using **Clarifai**
3. Nutrition data is fetched for each item using **CalorieNinjas API**
4. Macronutrients are displayed in tables and pie charts


## 🧠 Technologies Used

### 🔥 Frontend:
- React.js
- Tailwind CSS
- Recharts (Pie Charts)
- Framer Motion (Animations)
- React Toastify (Notifications)

### 🐍 Backend:
- Python Flask
- Clarifai API (Food detection from images)
- CalorieNinjas API (Nutrition data retrieval)

## 📦 Features

✅ Upload food images  
✅ Detect multiple food items using AI  
✅ Fetch nutrition facts (Calories, Protein, Carbs, Fats, Fiber, Sugar, Sodium)  
✅ Display results in a table and pie charts  
✅ Toast notifications for errors or success  
✅ Responsive UI with smooth transitions  
