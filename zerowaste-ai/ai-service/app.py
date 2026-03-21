from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib, os, numpy as np
from dotenv import load_dotenv

load_dotenv()
app = Flask(__name__)
CORS(app, origins=['http://localhost:5173', 'http://localhost:3001'])

MODEL_PATH = os.getenv('MODEL_PATH', 'model/surplus_model.pkl')
model = None

def load_model():
    global model
    if os.path.exists(MODEL_PATH):
        model = joblib.load(MODEL_PATH)
        print(f'✅  Model loaded from {MODEL_PATH}')
    else:
        print(f'⚠️  No model found. Run: python model/train.py')

RESTAURANT_TYPE_MAP = {
    'fast_food': 0, 'fine_dining': 1, 'buffet': 2, 'cafe': 3, 'bakery': 4
}

@app.route('/health', methods=['GET'])
def health():
    return jsonify({ 'status': 'ok', 'model_loaded': model is not None })

@app.route('/predict', methods=['POST', 'OPTIONS'])
def predict():
    if request.method == 'OPTIONS':
        return '', 200
    if model is None:
        return jsonify({ 
            'error': 'Model not loaded',
            'fix': 'Run: python model/train.py' 
        }), 503
    try:
        data = request.get_json()
        print('Predict request:', data)
        rt = RESTAURANT_TYPE_MAP.get(str(data.get('restaurant_type', 'cafe')).lower(), 3)
        # Handle day mapping (M -> 0, Tu -> 1, ...) if frontend sends 'Monday'. Better to just parse.
        # But wait, frontend sends 'Monday', let's fix that mapping inside python.
        day_raw = str(data.get('day_of_week', '1')).lower()
        days_map = {'monday':0, 'tuesday':1, 'wednesday':2, 'thursday':3, 'friday':4, 'saturday':5, 'sunday':6}
        day = days_map.get(day_raw, 1) if day_raw in days_map else int(day_raw)
        month = int(data.get('month', 6))
        features = np.array([[day, month, rt, 1 if day >= 5 else 0, 0]])
        prediction = float(model.predict(features)[0])
        qty = max(1, round(prediction))
        confidence = 'high' if qty > 40 else 'medium' if qty > 20 else 'low'
        recommendation = (
            'Post early — expect high NGO demand!' if qty > 40 else
            'Good time to post surplus' if qty > 20 else
            'Consider bundling with other items'
        )
        return jsonify({
            'predicted_quantity': qty,
            'confidence': confidence,
            'recommendation': recommendation
        })
    except Exception as e:
        print('Predict error:', e)
        return jsonify({ 'error': str(e) }), 400

if __name__ == '__main__':
    load_model()
    port = int(os.getenv('PORT', 5001))
    print(f'✅  AI service running on http://localhost:{port}')
    app.run(debug=True, port=port, host='0.0.0.0')

