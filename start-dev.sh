#!/bin/bash
echo "🚀 Starting Page Project in Development Mode..."
echo "Backend: http://localhost:5000"
echo "Frontend: http://localhost:3000"
echo ""
echo "Starting backend server..."
npm run dev &
BACKEND_PID=$!

echo "Waiting 3 seconds before starting frontend..."
sleep 3

echo "Starting frontend..."
cd client && npm start &
FRONTEND_PID=$!

echo ""
echo "✅ Both servers are starting..."
echo "📝 Backend PID: $BACKEND_PID"
echo "📝 Frontend PID: $FRONTEND_PID"
echo ""
echo "Press Ctrl+C to stop both servers"

# Wait for Ctrl+C
trap "echo 'Stopping servers...'; kill $BACKEND_PID $FRONTEND_PID; exit" INT
wait
