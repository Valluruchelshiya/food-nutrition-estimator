from flask import Flask, request, jsonify
import requests
import base64
from flask_cors import CORS
from database import init_db, insert_data, get_all_data

app = Flask(__name__)
CORS(app)
init_db()

CLARIFAI_PAT = "fb8119ebc8b24a81adcd6eec34b43232"
CLARIFAI_USER_ID = "chelshiya"
CLARIFAI_APP_ID = "food-detector"
CLARIFAI_MODEL_ID = "food-item-recognition"
CALORIENINJAS_API_KEY = "mq5TY/QEqAWfuYwW3aPQ/A==SkdwPHPEyTZeF5Uk"


@app.route('/')
def home():
    return "Flask Backend is Running!"

@app.route('/predict', methods=['POST'])
def predict():
    if "file" not in request.files:
        return jsonify({"error": "No file uploaded"})

    file = request.files["file"]
    image_bytes = file.read()
    base64_image = base64.b64encode(image_bytes).decode('utf-8')

    # Clarifai API
    clarifai_url = f"https://api.clarifai.com/v2/models/{CLARIFAI_MODEL_ID}/outputs"
    headers = {
        "Authorization": f"Key {CLARIFAI_PAT}",
        "Content-Type": "application/json"
    }
    data = {
        "user_app_id": {
            "user_id": CLARIFAI_USER_ID,
            "app_id": CLARIFAI_APP_ID
        },
        "inputs": [
            {"data": {"image": {"base64": base64_image}}}
        ]
    }

    clarifai_response = requests.post(clarifai_url, json=data, headers=headers)
    if clarifai_response.status_code != 200:
        return jsonify({"error": "Clarifai API failed", "details": clarifai_response.text})

    try:
        concepts = clarifai_response.json()['outputs'][0]['data']['concepts']
        detected_foods = [concept['name'] for concept in concepts[:5]]
    except Exception as e:
        return jsonify({"error": "Failed to extract food names", "details": str(e)})

    # Fetch nutrition + store in DB
    nutrition_data = {}
    for food in detected_foods:
        response = requests.get(
            f"https://api.calorieninjas.com/v1/nutrition?query={food}",
            headers={"X-Api-Key": CALORIENINJAS_API_KEY}
        )
        print(f"🔍 Detected: {food}")

        if response.status_code == 200:
            items = response.json().get("items", [])
            print(f"🍽 Nutrition items for {food}: {items}")

            insert_data(food, items)
            nutrition_data[food] = items
        else:
            nutrition_data[food] = {"error": "Failed to fetch nutrition"}

    return jsonify({
        "food_detected": detected_foods,
        "nutrition": nutrition_data
    })

@app.route("/data", methods=["GET"])
def get_saved_data():
    return jsonify(get_all_data())

if __name__ == "__main__":
    app.run(debug=True)
