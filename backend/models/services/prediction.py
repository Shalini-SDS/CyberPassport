import os
import joblib
import pandas as pd
import numpy as np


# ============================================================
# MODEL PATHS
# ============================================================

BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))

MODEL_PATH = os.path.join(
    BASE_DIR,
    "models",
    "xgboost_final.pkl"
)

FEATURE_ENCODER_PATH = os.path.join(
    BASE_DIR,
    "models",
    "feature_encoders.pkl"
)

TARGET_ENCODER_PATH = os.path.join(
    BASE_DIR,
    "models",
    "target_encoder.pkl"
)


# ============================================================
# LOAD MODEL AND ENCODERS
# ============================================================

print("Loading CyberPassport ML model...")

model = joblib.load(MODEL_PATH)

feature_encoders = joblib.load(FEATURE_ENCODER_PATH)

target_encoder = joblib.load(TARGET_ENCODER_PATH)

print("XGBoost model loaded successfully!")
print("Feature encoders loaded successfully!")
print("Target encoder loaded successfully!")


# ============================================================
# FEATURES USED BY THE MODEL
# ============================================================

CATEGORICAL_FEATURES = [
    "occupation_category",
    "password_management",
    "password_change_frequency",
    "password_length",
    "mfa_type",
    "mfa_coverage",
    "device_encryption",
    "os_update_status",
    "vpn_usage",
    "public_wifi_usage",
    "auto_connect_disabled",
    "phishing_detection",
    "security_training",
    "https_awareness",
    "breach_exposure",
    "antivirus_status",
    "login_monitoring",
    "backup_frequency",
    "browser_password_storage",
    "software_source",
    "account_alerts_enabled",
    "cloud_backup_enabled",
    "social_media_privacy",
    "shared_device_usage",
    "email_security_level",
    "past_phishing_clicks"
]


# ============================================================
# ENCODE FEATURES
# ============================================================

def encode_features(user_data):
    """
    Convert categorical cybersecurity features into
    the numerical representation used during training.
    """

    df = pd.DataFrame([user_data])

    # --------------------------------------------------------
    # Encode categorical columns
    # --------------------------------------------------------

    for column in CATEGORICAL_FEATURES:

        if column not in df.columns:
            raise ValueError(
                f"Missing required feature: {column}"
            )

        encoder = feature_encoders[column]

        try:
            df[column] = encoder.transform(
                df[column].astype(str)
            )

        except Exception as e:

            raise ValueError(
                f"Invalid value '{df[column].iloc[0]}' "
                f"for feature '{column}'. "
                f"Error: {str(e)}"
            )

    # --------------------------------------------------------
    # Numeric features
    # --------------------------------------------------------

    numeric_features = [
        "cyber_trust_score",
        "future_risk_score"
    ]

    for column in numeric_features:

        if column not in df.columns:
            raise ValueError(
                f"Missing required numeric feature: {column}"
            )

        df[column] = pd.to_numeric(
            df[column],
            errors="coerce"
        )

    # --------------------------------------------------------
    # Make sure there are no missing values
    # --------------------------------------------------------

    if df.isnull().sum().sum() > 0:

        missing_columns = df.columns[
            df.isnull().any()
        ].tolist()

        raise ValueError(
            f"Missing or invalid values in: "
            f"{missing_columns}"
        )

    # --------------------------------------------------------
    # IMPORTANT:
    # user_id is NOT used by the model
    # risk_level is NOT an input feature
    # --------------------------------------------------------

    return df


# ============================================================
# PREDICT RISK
# ============================================================

def predict_risk(user_data):
    """
    Generate cybersecurity risk prediction.

    Returns:
        predicted class
        predicted risk level
        probabilities
    """

    # Prepare encoded data
    X = encode_features(user_data)

    # --------------------------------------------------------
    # Model prediction
    # --------------------------------------------------------

    prediction = model.predict(X)[0]

    # --------------------------------------------------------
    # Convert encoded target back to original label
    # --------------------------------------------------------

    try:

        predicted_label = target_encoder.inverse_transform(
            [prediction]
        )[0]

    except Exception:

        # Fallback if target encoder is not available
        label_mapping = {
            0: "High",
            1: "Low",
            2: "Medium"
        }

        predicted_label = label_mapping.get(
            int(prediction),
            "Unknown"
        )

    # --------------------------------------------------------
    # Prediction probabilities
    # --------------------------------------------------------

    probabilities = {}

    if hasattr(model, "predict_proba"):

        probability_values = model.predict_proba(X)[0]

        try:

            classes = target_encoder.inverse_transform(
                model.classes_.astype(int)
            )

        except Exception:

            classes = [
                "High",
                "Low",
                "Medium"
            ]

        for label, probability in zip(
            classes,
            probability_values
        ):

            probabilities[str(label)] = round(
                float(probability),
                4
            )

    # --------------------------------------------------------
    # Return result
    # --------------------------------------------------------

    return {
        "prediction": int(prediction),
        "risk_level": str(predicted_label),
        "probabilities": probabilities
    }