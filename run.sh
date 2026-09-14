#!/bin/bash

cd frontend && npx vite & 
cd backend && npx nodemon index.js &

wait
