/*
 * PAHADI AIM LAB - C++ Performance Engine
 * 
 * Provides high-speed calculation routines for reaction time analytics,
 * flick trajectory accuracy scoring, precision distance rating, and target tracking vectors.
 * 
 * Can be compiled to WebAssembly (WASM) via Emscripten:
 * emcc aim_calculator.cpp -O3 -s WASM=1 -s EXPORTED_FUNCTIONS="['_calculate_aim_rating','_calculate_tracking_score']" -o aim_calculator.js
 */

#include <iostream>
#include <cmath>
#include <algorithm>

extern "C" {

// Calculates composite aim rating based on reaction time (ms), accuracy (%), and hits
int calculate_aim_rating(double avg_reaction_ms, double accuracy_pct, int hits, int misses) {
    if (hits + misses == 0) return 0;
    
    // Weightings: 45% Reaction Speed, 45% Accuracy, 10% Volume
    double reaction_score = std::max(0.0, 1000.0 - avg_reaction_ms); // max 1000 pts
    double accuracy_score = accuracy_pct * 10.0;                       // max 1000 pts
    double volume_bonus = std::min(200.0, hits * 5.0);                 // max 200 pts
    
    double total = (reaction_score * 0.45) + (accuracy_score * 0.45) + volume_bonus;
    return static_cast<int>(std::round(total));
}

// Calculates tracking efficiency score (smoothness & time-on-target)
double calculate_tracking_score(double target_x, double target_y, double cursor_x, double cursor_y, double radius) {
    double dx = target_x - cursor_x;
    double dy = target_y - cursor_y;
    double dist = std::sqrt(dx * dx + dy * dy);
    
    if (dist <= radius) {
        // Linear scale from 1.0 (dead center) to 0.5 (edge of target)
        return 1.0 - (0.5 * (dist / radius));
    }
    return 0.0;
}

}
