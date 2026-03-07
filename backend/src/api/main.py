from fastapi import FastAPI, File, UploadFile, Form, WebSocket, WebSocketDisconnect, Request
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
import uvicorn
import json
import uuid
import asyncio
from .logger import manager as log_manager, sync_log, log_info, log_error, log_warning
import joblib
import torch
import torch.nn as nn
import torchvision.transforms as transforms
from torchvision.models import resnet18
import numpy as np
from PIL import Image
from art.estimators.classification import PyTorchClassifier
from art.attacks.evasion import FastGradientMethod, ProjectedGradientDescent
import io
from pathlib import Path
from typing import Dict, List

# --- Setup: App and Paths ---
app = FastAPI(title="AegisAI API")

# Add CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

BASE_DIR = Path(__file__).resolve(strict=True).parent.parent.parent
MODEL_DIR = BASE_DIR / "models"

# Log app startup (sync-safe)
sync_log("INFO", "startup", "Initializing AegisAI API")

# --- Global Variables: Models, Classifiers, and Attack Objects ---
CIFAR10_CLASSES = ['airplane', 'automobile', 'bird', 'cat', 'deer',
                  'dog', 'frog', 'horse', 'ship', 'truck']
DEVICE = torch.device('cuda' if torch.cuda.is_available() else 'cpu')

# Load hardened PyTorch model
def load_hardened_model() -> nn.Module:
    model = resnet18(num_classes=10)
    model_path = MODEL_DIR / "hardened_model.pt"
    model.load_state_dict(torch.load(model_path, map_location=DEVICE))
    model.to(DEVICE)
    model.eval()
    # log model loading
    sync_log("INFO", "model", f"Loaded hardened model from {model_path}")
    return model

hardened_model = load_hardened_model()

# Try to load anomaly model with error handling for numpy compatibility
try:
    import pickle
    with open(MODEL_DIR / "anomaly_detector.pkl", 'rb') as f:
        anomaly_model = pickle.load(f)
    print("Anomaly detector model loaded successfully")
except (ModuleNotFoundError, AttributeError, FileNotFoundError) as e:
    print(f"Warning: Could not load anomaly detector model: {e}")
    print("Creating a new IsolationForest model as fallback...")
    from sklearn.ensemble import IsolationForest
    anomaly_model = IsolationForest(contamination='auto', random_state=42)
    # Fit with dummy data to make it functional
    import numpy as np
    dummy_data = np.array([[0, 1, 2], [0, 2, 3], [1, 1, 1], [0, 1, 1]])
    anomaly_model.fit(dummy_data)
    sync_log("WARNING", "model", "Anomaly detector not found; created fallback IsolationForest")

# Create ART classifier and attack objects once on startup
art_classifier = PyTorchClassifier(
    model=hardened_model,
    loss=nn.CrossEntropyLoss(),
    optimizer=torch.optim.Adam(hardened_model.parameters()),
    input_shape=(3, 32, 32),
    nb_classes=10,
    device_type='gpu' if 'cuda' in DEVICE.type else 'cpu'
)

# Create attack objects (will configure eps dynamically)
def create_fgsm_attack(eps: float = 0.03):
    return FastGradientMethod(estimator=art_classifier, eps=eps)

def create_pgd_attack(eps: float = 0.03):
    return ProjectedGradientDescent(estimator=art_classifier, eps=eps, max_iter=40)

# --- Pydantic Models for Data Validation ---
class TopKPrediction(BaseModel):
    label: str
    probability: float

class InferenceResponse(BaseModel):
    clean_prediction: str
    adversarial_prediction: str
    clean_confidence: float
    adversarial_confidence: float
    top_k: List[TopKPrediction]
    attack_type: str
    epsilon: float

class AnomalyFeatures(BaseModel):
    impossible_travel_speed: float
    login_frequency_1hr: float
    ip_change_count_24hr: float

class AnomalyResponse(BaseModel):
    is_anomaly: bool
    model_score: int

class RobustnessResponse(BaseModel):
    clean_prediction: str
    attacked_prediction: str

# --- Helper Functions ---
def preprocess_image(image_bytes: bytes) -> torch.Tensor:
    image = Image.open(io.BytesIO(image_bytes)).convert('RGB')
    transform = transforms.Compose([
        transforms.Resize((32, 32)),
        transforms.ToTensor(),
        transforms.Normalize((0.4914, 0.4822, 0.4465), (0.2023, 0.1994, 0.2010))
    ])
    return transform(image).unsqueeze(0).to(DEVICE)


@app.middleware("http")
async def log_requests(request: Request, call_next):
    # Log incoming request metadata
    client = request.client.host if request.client else "unknown"
    path = request.url.path
    method = request.method
    await log_info("http", f"Request {method} {path}", {"client": client})
    try:
        response = await call_next(request)
    except Exception as e:
        await log_error("http", f"Unhandled error {e}", {"path": path})
        raise
    return response

def get_prediction_with_confidence(model: nn.Module, img_tensor: torch.Tensor) -> tuple:
    """
    Returns: (class_name: str, confidence: float, top_k: List[Dict])
    """
    with torch.no_grad():
        outputs = model(img_tensor)
        probabilities = torch.nn.functional.softmax(outputs, dim=1)
        
        # Get top prediction
        top_prob, top_idx = probabilities.max(1)
        class_name = CIFAR10_CLASSES[top_idx.item()]
        confidence = float(top_prob.item())
        
        # Get top-5 predictions
        top5_probs, top5_indices = torch.topk(probabilities[0], k=min(5, len(CIFAR10_CLASSES)))
        top_k = [
            {"label": CIFAR10_CLASSES[idx.item()], "probability": float(prob.item())}
            for prob, idx in zip(top5_probs, top5_indices)
        ]
        
    return class_name, confidence, top_k

# --- API Endpoints ---
@app.post('/inference/image', response_model=InferenceResponse)
async def inference_image(
    file: UploadFile = File(...),
    attack_type: str = Form("FGSM"),
    epsilon: float = Form(0.03)
) -> Dict:
    """
    Run inference on clean and adversarially perturbed images.
    
    Args:
        file: Image file to process
        attack_type: "FGSM" or "PGD"
        epsilon: Attack strength (0.0 - 0.4)
    
    Returns:
        InferenceResponse with clean and adversarial predictions, confidences, and top-k
    """
    # Log request start
    await log_info("api", "inference_image called", {"attack_type": attack_type, "epsilon": epsilon})
    # Validate inputs
    attack_type = attack_type.upper()
    if attack_type not in ["FGSM", "PGD"]:
        attack_type = "FGSM"
    epsilon = max(0.0, min(epsilon, 0.4))  # Clamp to [0.0, 0.4]
    
    # Read and preprocess image
    image_bytes = await file.read()
    img_tensor = preprocess_image(image_bytes)
    
    # Get clean prediction
    clean_pred, clean_conf, top_k = get_prediction_with_confidence(hardened_model, img_tensor)
    
    # Generate adversarial image
    if attack_type == "FGSM":
        attack = create_fgsm_attack(eps=epsilon)
    else:  # PGD
        attack = create_pgd_attack(eps=epsilon)
    
    try:
        adv_numpy = attack.generate(img_tensor.cpu().numpy())
        adv_tensor = torch.from_numpy(adv_numpy).to(DEVICE)
        # Clamp to valid range after attack
        adv_tensor = torch.clamp(adv_tensor, 0, 1)
    except Exception as e:
        await log_warning("api", f"Attack generation failed: {e}, using original image")
        adv_tensor = img_tensor
    
    # Get adversarial prediction
    adv_pred, adv_conf, _ = get_prediction_with_confidence(hardened_model, adv_tensor)
    await log_info("api", "inference_image completed", {"clean": clean_pred, "adversarial": adv_pred})
    
    return {
        'clean_prediction': clean_pred,
        'adversarial_prediction': adv_pred,
        'clean_confidence': clean_conf,
        'adversarial_confidence': adv_conf,
        'top_k': top_k,
        'attack_type': attack_type,
        'epsilon': epsilon
    }

@app.post('/predict_anomaly', response_model=AnomalyResponse)
def predict_anomaly(features: AnomalyFeatures) -> Dict[str, any]:
    sample = np.array([list(features.dict().values())]).reshape(1, -1)
    score = int(anomaly_model.predict(sample)[0])
    is_anomaly = (score == -1)
    # Log anomaly prediction (synchronously)
    sync_log("INFO", "api/predict_anomaly", f"Prediction: is_anomaly={is_anomaly}, model_score={score}")
    return {'is_anomaly': is_anomaly, 'model_score': score}

@app.get('/health')
async def health():
    """Health check endpoint"""
    await log_info("api", "health_check" )
    return {
        'status': 'healthy',
        'model': 'hardened_resnet18',
        'device': str(DEVICE)
    }


@app.websocket('/ws/logs')
async def websocket_logs(websocket: WebSocket):
    """WebSocket endpoint that streams logs to clients and sends recent logs on connect."""
    # identify client
    client_id = str(uuid.uuid4())
    await websocket.accept()
    # register client queue
    q = await log_manager.register(client_id)
    try:
        # send recent logs on connect
        recent = await log_manager.get_recent()
        # send as JSON payload
        await websocket.send_text(json.dumps({"type": "recent", "logs": recent}))

        # continuously stream new logs from the per-client queue
        while True:
            rec = await q.get()
            await websocket.send_text(json.dumps({"type": "log", "log": rec}))
    except WebSocketDisconnect:
        await log_manager.unregister(client_id)
    except Exception as e:
        await log_manager.unregister(client_id)
        sync_log("ERROR", "ws", f"WebSocket error: {e}")

# --- Main Application Runner ---
if __name__ == "__main__":
    print(f"Starting FastAPI app on http://0.0.0.0:8000 ...")
    uvicorn.run(app, host="0.0.0.0", port=8000) 