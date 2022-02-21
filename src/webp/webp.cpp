/*
 * Slightly modified C++ version of Surma's article "Emscripting a C library to WASM"
 * https://developers.google.com/web/updates/2018/03/emscripting-a-c-library
 */

/*
 * Includes and namespace
 *
 */
#include <emscripten/emscripten.h>
#include <cstdlib>

#include "libwebp/src/webp/encode.h"

/*
 * Common function declarations:
 * Exposed to JS
 *
 */
#ifdef __cplusplus
    extern "C" {
        #endif

        int EMSCRIPTEN_KEEPALIVE version();

        uint8_t* EMSCRIPTEN_KEEPALIVE create_buffer(int width, int height);
        void EMSCRIPTEN_KEEPALIVE destroy_buffer(uint8_t* p);

        void EMSCRIPTEN_KEEPALIVE encode(uint8_t* img_in, int width, int height, float quality);
        void EMSCRIPTEN_KEEPALIVE free_result(uint8_t* result);
        int EMSCRIPTEN_KEEPALIVE get_result_pointer();
        int EMSCRIPTEN_KEEPALIVE get_result_size();

        #ifdef __cplusplus
    }
#endif

int result[2];

/*
 * Common function definitions:
 * Exposed to JS
 *
 */
#ifdef __cplusplus
    extern "C" {
        #endif
        
        int EMSCRIPTEN_KEEPALIVE version() {
            return WebPGetEncoderVersion();
        }
        
        uint8_t* EMSCRIPTEN_KEEPALIVE create_buffer(int width, int height) {
            return (uint8_t*)malloc(width * height * 4 * sizeof(uint8_t));
        }

        void EMSCRIPTEN_KEEPALIVE destroy_buffer(uint8_t* p) {
            free(p);
        }

        void EMSCRIPTEN_KEEPALIVE encode(uint8_t* img_in, int width, int height, float quality) {
            uint8_t* img_out;
            size_t size;

            size = WebPEncodeRGBA(img_in, width, height, width * 4, quality, &img_out);

            result[0] = (int)img_out;
            result[1] = size;
        }

        void EMSCRIPTEN_KEEPALIVE free_result(uint8_t* result) {
            WebPFree(result);
        }

        int EMSCRIPTEN_KEEPALIVE get_result_pointer() {
            return result[0];
        }

        int EMSCRIPTEN_KEEPALIVE get_result_size() {
            return result[1];
        }

        #ifdef __cplusplus
    }
#endif

/*
 * Main function
 * ( To compile code for WebAssembly usage with Emscripten (from browser):
 *   emcc webp.cpp -s WASM=1 -O0 -I libwebp libwebp/src/{dec,dsp,demux,enc,mux,utils}/*.c -s ALLOW_MEMORY_GROWTH=1 -o webp.js )
 *   // flag "-s WASM=1": wasm output https://developer.mozilla.org/en-US/docs/WebAssembly/C_to_wasm
 *   // flag "-O0": no optimisation https://emscripten.org/docs/optimizing/Optimizing-Code.html
 *   // flag "-I libwebp" and including all *.c files of libwebp/src/.. for compilation to enable utilisation of libwebp's functions
 *   // flag "-s ALLOW_MEMORY_GROWTH=1" to allow for encoding of large images
 *   // flag "-o": outputting WASM with the JS glue file https://developer.mozilla.org/en-US/docs/WebAssembly/C_to_wasm
 * 
* ( To compile code for WebAssembly usage with Emscripten (as module from node):
 *   emcc webp.cpp -s WASM=1 -O0 -I libwebp libwebp/src/{dec,dsp,demux,enc,mux,utils}/*.c -s ALLOW_MEMORY_GROWTH=1 -s MODULARIZE -o webp.js )
 * 
 * ( libwebp needs to be made available in the same folder as this *.cpp file.
 *   Please clone the git repository as follows:
 *   git clone https://github.com/webmproject/libwebp )
 *
 */
int main() {
    return 0;
}