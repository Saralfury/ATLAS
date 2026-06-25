from __future__ import annotations

from pathlib import Path

import joblib
import pandas as pd
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import roc_auc_score
from sklearn.model_selection import train_test_split

from app.services.ml_predictor import FEATURE_NAMES

ROOT = Path(__file__).resolve().parents[1]


def main() -> None:
    data_path = ROOT / "ml" / "training_data.csv"
    if not data_path.exists():
        from ml.generate_training_data import main as generate

        generate()
    df = pd.read_csv(data_path)
    X = df[FEATURE_NAMES]
    y = df["congested"]
    X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.25, random_state=42, stratify=y)
    model = RandomForestClassifier(n_estimators=180, max_depth=8, random_state=42, class_weight="balanced")
    model.fit(X_train, y_train)
    auc = roc_auc_score(y_test, model.predict_proba(X_test)[:, 1])
    out = ROOT / "ml" / "model.pkl"
    joblib.dump(model, out)
    print(f"Saved {out} ({out.stat().st_size} bytes). roc_auc={auc:.3f}")


if __name__ == "__main__":
    main()
