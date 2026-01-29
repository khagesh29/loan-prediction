from flask import Flask, request, jsonify, render_template
import pandas as pd
import joblib
from sklearn.model_selection import train_test_split
from sklearn.ensemble import RandomForestClassifier
import os

# ------------------------
# PATH SETUP
# ------------------------
BASE_DIR = os.path.dirname(os.path.abspath(__file__))

app = Flask(
    __name__,
    template_folder=os.path.join(BASE_DIR, "../frontend/templates"),
    static_folder=os.path.join(BASE_DIR, "../frontend/static")
)

MODEL_PATH = os.path.join(BASE_DIR, "loan_model.pkl")
DATA_PATH = os.path.join(BASE_DIR, "loan_data.csv")

# ------------------------
# MODEL TRAINING
# ------------------------
def train_model():
    data = pd.read_csv(DATA_PATH)

    data["Education"] = data["Education"].map({
        "Graduate": 1,
        "Not Graduate": 0
    })

    data["Self_Employed"] = data["Self_Employed"].map({
        "Yes": 1,
        "No": 0
    })

    data["Credit_History"] = data["Credit_History"].map({
        1: 1,
        0: 0
    })

    X = data[
        [
            "Education",
            "Self_Employed",
            "ApplicantIncome",
            "LoanAmount",
            "Loan_Amount_Term",
            "Credit_History"
        ]
    ]

    y = data["Loan_Status"].map({
        "Y": 1,
        "N": 0
    })

    X_train, _, y_train, _ = train_test_split(
        X, y, test_size=0.2, random_state=42
    )

    model = RandomForestClassifier(
        n_estimators=100,
        random_state=42
    )

    model.fit(X_train, y_train)
    joblib.dump(model, MODEL_PATH)


# Train model only once
if not os.path.exists(MODEL_PATH):
    train_model()

model = joblib.load(MODEL_PATH)

# ------------------------
# PAGE ROUTES
# ------------------------
@app.route("/")
def index():
    return render_template("index.html")


@app.route("/loan")
def loan():
    return render_template("loan.html")


@app.route("/login")
def login():
    return render_template("login.html")


@app.route("/services")
def services():
    return render_template("services.html")


@app.route("/details")
def details():
    return render_template("details.html")


# ------------------------
# PREDICTION API
# ------------------------
@app.route("/predict", methods=["POST"])
def predict():
    data = request.get_json()

    education = 1 if data.get("education") == "Graduate" else 0
    self_employed = 1 if data.get("employment") == "Self Employed" else 0

    credit_map = {
        "300-500": 0,
        "501-650": 0,
        "651-750": 1,
        "751-850": 1
    }

    credit = credit_map.get(data.get("credit"), 0)

    input_df = pd.DataFrame(
        [[
            education,
            self_employed,
            int(data.get("income", 0)),
            int(data.get("loan_amount", 0)),
            int(data.get("duration", 0)),
            credit
        ]],
        columns=[
            "Education",
            "Self_Employed",
            "ApplicantIncome",
            "LoanAmount",
            "Loan_Amount_Term",
            "Credit_History"
        ]
    )

    prediction = model.predict(input_df)[0]
    confidence = round(model.predict_proba(input_df).max() * 100, 2)

    return jsonify({
        "status": int(prediction),
        "confidence": confidence
    })


# ------------------------
# RUN APP (NO DEBUG FOR RENDER)
# ------------------------
if __name__ == "__main__":
    app.run()
