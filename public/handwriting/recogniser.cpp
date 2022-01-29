/*
 * Includes and namespace
 *
 */
#include <emscripten/emscripten.h>
#include <iostream>
#include <string>

#include <tesseract/baseapi.h>
#include <leptonica/allheaders.h>

using namespace std;

/*
 * Common function declarations:
 * Exposed to JS
 *
 */
#ifdef __cplusplus
    extern "C" {
        #endif

        string EMSCRIPTEN_KEEPALIVE readCharacters(string picPath);

        #ifdef __cplusplus
    }
#endif

/*
 * Common function definitions:
 * Exposed to JS
 *
 */
#ifdef __cplusplus
    extern "C" {
        #endif

        string EMSCRIPTEN_KEEPALIVE readCharacters(string picPath) {
            char *outText;

            tesseract::TessBaseAPI *api = new tesseract::TessBaseAPI();
            if (api->Init(NULL, "eng")) {
                fprintf(stderr, "Could not initialize tesseract.\n");
                exit(1);
            }

            const char* chrPicPath = picPath.c_str();
            Pix *image = pixRead(chrPicPath);
            api->SetImage(image);
            
            outText = api->GetUTF8Text();
            string outString(outText);

            api->End();
            delete api;
            delete [] outText;
            pixDestroy(&image);

            return outString;
        }

        #ifdef __cplusplus
    }
#endif

/*
 * Main function
 * ( To compile code for WebAssembly usage with Emscripten:
 *   emcc recogniser.cpp -std=c++11 -s WASM=1 -O0 -ltesseract -I<path to tesseract includes> -llept -L<path to leptonica library> -o recogniser.js)
 *
 */
int main() {
    // cout << "handwriting recognition wasm module loaded" << endl;

    return 0;
}