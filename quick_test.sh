#!/bin/bash
# Quick Validation Tests for AegisAI Integration

API_URL="http://localhost:8000"

echo "🧪 AegisAI Integration Validation"
echo "=================================="
echo ""

# Test 1: Health Check
echo "✓ Test 1: Health Check"
curl -s "$API_URL/health" | jq .
echo ""

# Test 2: Create test image
echo "✓ Test 2: Creating test image..."
python3 -c "
from PIL import Image
img = Image.new('RGB', (32, 32), color=(100, 150, 200))
img.save('/tmp/test_aegis.png')
print('  Created: /tmp/test_aegis.png')
"
echo ""

# Test 3: Image Inference - FGSM
echo "✓ Test 3: Image Inference (FGSM)"
curl -s -X POST "$API_URL/inference/image" \
  -F "file=@/tmp/test_aegis.png" \
  -F "attack_type=FGSM" \
  -F "epsilon=0.1" | jq .
echo ""

# Test 4: Image Inference - PGD
echo "✓ Test 4: Image Inference (PGD) - takes ~3 seconds..."
curl -s -X POST "$API_URL/inference/image" \
  -F "file=@/tmp/test_aegis.png" \
  -F "attack_type=PGD" \
  -F "epsilon=0.2" | jq .
echo ""

# Test 5: Anomaly Detection
echo "✓ Test 5: Anomaly Detection (Suspicious Activity)"
curl -s -X POST "$API_URL/predict_anomaly" \
  -H "Content-Type: application/json" \
  -d '{
    "impossible_travel_speed": 1500,
    "login_frequency_1hr": 100,
    "ip_change_count_24hr": 10
  }' | jq .
echo ""

echo "=================================="
echo "✅ All tests completed!"
echo ""
echo "🎯 Next steps:"
echo "  1. Open http://localhost:3000 in your browser"
echo "  2. Go to 'AI Model Security' page"
echo "  3. Upload an image to test inference"
echo "  4. Select attack type and epsilon"
echo "  5. Click 'Run Inference' to see live results"
