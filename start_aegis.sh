#!/bin/bash
# AegisAI Full Stack Startup Script
# Usage: ./start_aegis.sh

set -e

echo "🚀 Starting AegisAI Stack..."
echo ""

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Directories
BACKEND_DIR="/Users/prakhar/Desktop/Aegis/aegisbackend"
FRONTEND_DIR="/Users/prakhar/Desktop/Aegis/aegisfrontend"

echo -e "${YELLOW}[1/2]${NC} Starting FastAPI Backend..."
cd "$BACKEND_DIR"

# Check if venv exists
if [ ! -d "venv" ]; then
    echo "Creating virtual environment..."
    python3 -m venv venv
fi

# Activate and start backend
source venv/bin/activate
python -m uvicorn src.api.main:app --reload --host 0.0.0.0 --port 8000 > /tmp/aegis_backend.log 2>&1 &
BACKEND_PID=$!
echo -e "${GREEN}✓ Backend started (PID: $BACKEND_PID)${NC}"

# Wait for backend to be ready
echo "Waiting for backend to be ready..."
for i in {1..30}; do
    if curl -s http://localhost:8000/health > /dev/null 2>&1; then
        echo -e "${GREEN}✓ Backend health check passed${NC}"
        break
    fi
    sleep 1
done

echo ""
echo -e "${YELLOW}[2/2]${NC} Starting Next.js Frontend..."
cd "$FRONTEND_DIR"

# Ensure .env.local exists
if [ ! -f ".env.local" ]; then
    echo "Creating .env.local..."
    echo "NEXT_PUBLIC_AEGIS_API_BASE_URL=http://localhost:8000" > .env.local
fi

npm run dev > /tmp/aegis_frontend.log 2>&1 &
FRONTEND_PID=$!
echo -e "${GREEN}✓ Frontend started (PID: $FRONTEND_PID)${NC}"

echo ""
echo -e "${GREEN}✅ AegisAI Stack Started Successfully!${NC}"
echo ""
echo "📊 Service Status:"
echo "  Backend:  http://localhost:8000"
echo "  Frontend: http://localhost:3000"
echo ""
echo "📋 Logs:"
echo "  Backend:  tail -f /tmp/aegis_backend.log"
echo "  Frontend: tail -f /tmp/aegis_frontend.log"
echo ""
echo "🛑 To stop all services:"
echo "  kill $BACKEND_PID $FRONTEND_PID"
echo ""

# Wait for user interrupt
trap 'echo "Stopping services..."; kill $BACKEND_PID $FRONTEND_PID 2>/dev/null; exit 0' INT

wait
