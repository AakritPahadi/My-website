# C++ / WebAssembly Performance Module

This directory contains high-performance C++ calculation routines for PAHADI Aim Lab and browser game analytics.

## Purpose & Architecture
- **Aim Rating Engine**: Fast calculation of user score ratings based on reaction time, accuracy percentage, target hits, and tracking smoothness.
- **WebAssembly Compilation**: Designed to be compiled to WASM via Emscripten (`emcc`).
- **JavaScript Fallback**: A 100% equivalent JavaScript implementation is embedded in `static/js/aim-lab.js` so that the website functions seamlessly out of the box without requiring external WASM compilation tools during deployment.

## Build Instructions (Optional)
To compile to WASM using Emscripten:
```bash
emcc aim_calculator.cpp -O3 -s WASM=1 -s EXPORTED_FUNCTIONS="['_calculate_aim_rating','_calculate_tracking_score']" -o ../../static/js/aim_calculator.js
```
