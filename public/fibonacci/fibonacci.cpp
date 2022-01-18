/*
 * Includes and namespace
 *
 */
#include <emscripten/emscripten.h>
#include <iostream>

using namespace std;

/*
 * Common function declarations:
 * Exposed to JS
 *
 */
#ifdef __cplusplus
    extern "C" {
        #endif

        int EMSCRIPTEN_KEEPALIVE nthFibNo(int n);

        #ifdef __cplusplus
    }
#endif

/*
 * Recursive function to calculate n-th Fibonacci no.
 *
 */
int getNthFibNo(int n) {
    if(n <= 1) {
        return n;
    }

    return getNthFibNo(n-1) + getNthFibNo(n-2);
}

/*
 * Common function definitions:
 * Exposed to JS
 *
 */
#ifdef __cplusplus
    extern "C" {
        #endif

        int EMSCRIPTEN_KEEPALIVE nthFibNo(int n) {
            return getNthFibNo(n);
        }

        #ifdef __cplusplus
    }
#endif

/*
 * Main function
 * ( To compile code for WebAssembly usage with Emscripten:
 *   emcc fibonacci.cpp -s WASM=1 -O0 -o fibonacci.js )
 *   // flag "-s WASM=1": wasm output https://developer.mozilla.org/en-US/docs/WebAssembly/C_to_wasm
 *   // flag "-O0": no optimisation https://emscripten.org/docs/optimizing/Optimizing-Code.html
 *   // flag "-o": outputting only the JS glue file https://developer.mozilla.org/en-US/docs/WebAssembly/C_to_wasm
 *
 */
int main() {
    // cout << "fibonnaci wasm module loaded" << endl;

    return 0;
}