import pandas as pd
import numpy as np
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
import joblib, os

np.random.seed(42)
n = 600
data = pd.DataFrame({
    'day_of_week':      np.random.randint(0, 7, n),
    'month':            np.random.randint(1, 13, n),
    'restaurant_type':  np.random.randint(0, 5, n),
    'is_weekend':       np.random.randint(0, 2, n),
    'is_holiday':       np.random.randint(0, 2, n),
    'surplus_quantity': np.random.randint(5, 120, n),
})
X = data.drop('surplus_quantity', axis=1)
y = data['surplus_quantity']
X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)
model = RandomForestRegressor(n_estimators=100, random_state=42)
model.fit(X_train, y_train)
os.makedirs('model', exist_ok=True)
joblib.dump(model, 'model/surplus_model.pkl')
print('✅  Model trained and saved to model/surplus_model.pkl')
print(f'    Test score: {model.score(X_test, y_test):.3f}')
