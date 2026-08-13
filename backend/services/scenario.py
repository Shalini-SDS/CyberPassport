from typing import Any, Dict

from services.prediction import predict_risk

DISCLAIMER = "Simulation estimates likely score impact from changed assessment answers; it is not a security guarantee."


def simulate(current_features: Dict[str, Any], changes: Dict[str, Any]) -> Dict[str, Any]:
    before = predict_risk(current_features)
    after_features = {**before["features"], **changes}
    after = predict_risk(after_features)
    return {
        "before": {
            "trust_score": before["cyber_trust_score"],
            "future_risk_score": before["future_risk_score"],
            "risk_level": before["risk_level"],
        },
        "after": {
            "trust_score": after["cyber_trust_score"],
            "future_risk_score": after["future_risk_score"],
            "risk_level": after["risk_level"],
        },
        "improvement": after["cyber_trust_score"] - before["cyber_trust_score"],
        "disclaimer": DISCLAIMER,
    }
