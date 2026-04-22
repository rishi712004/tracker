#!/bin/bash
set -e

echo ""
echo "Starting Trackr setup..."
echo ""

# Backend setup
echo "Setting up backend..."

cd backend

echo "Creating virtual environment..."
python3 -m venv venv

echo "Activating environment..."
source venv/bin/activate

echo "Installing backend dependencies..."
pip install -q -r requirements.txt

export FLASK_APP=app:create_app
export FLASK_ENV=development

echo "Setting up database..."
flask db init 2>/dev/null || true
flask db migrate -m "initial setup" 2>/dev/null || true
flask db upgrade

echo "Backend is ready. Starting server on http://localhost:5000"
flask run --port 5000 &
FLASK_PID=$!

cd ..

# Frontend setup
echo ""
echo "Setting up frontend..."

cd frontend

echo "Installing frontend dependencies..."
npm install --silent

echo "Starting frontend on http://localhost:5173"
npm run dev &
VITE_PID=$!

cd ..

# Cleanup on exit
trap "echo ''; echo 'Stopping servers...'; kill $FLASK_PID $VITE_PID 2>/dev/null; echo 'Done.'" EXIT

echo ""
echo "Application is running:"
echo "Frontend: http://localhost:5173"
echo "Backend : http://localhost:5000"
echo ""
echo "Press Ctrl+C to stop."
echo ""