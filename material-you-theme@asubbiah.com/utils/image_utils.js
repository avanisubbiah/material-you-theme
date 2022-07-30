/**
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
// import { QuantizerCelebi } from '../quantize/quantizer_celebi.js';
// import { Score } from '../score/score.js';
// import { argbFromRgb } from './color_utils.js';
const ExtensionUtils = imports.misc.extensionUtils;
const Me = ExtensionUtils.getCurrentExtension();
const { QuantizerCelebi } = Me.imports.quantize.quantizer_celebi;
const { Score } = Me.imports.score.score;
const color_utils = Me.imports.utils.color_utils;
const {GLib, Gio} = imports.gi;


/**
 * Get the source color from an image.
 *
 * @param image The image element
 * @return Source color - the color most suitable for creating a UI theme
 */
function sourceColorFromImage(image) {
    // Convert Image data to Pixel Array
    const image_pixels = image.get_pixels();
    const n_channels = image.get_n_channels();
    const rowstride = image.get_rowstride();
    const pixels = [];
    for (let x = 0; x < image.get_width(); x++) {
        for (let y = 0; y < image.get_height(); y++) {
            const pixel = get_pixel(image_pixels, n_channels, rowstride, x, y);
            const argb = color_utils.argbFromRgb(pixel[0], pixel[1], pixel[2]);
            pixels.push(argb);
        }
    }

    // Convert Pixels to Material Colors
    const result = QuantizerCelebi.quantize(pixels, 128);
    const ranked = Score.score(result);
    const top = ranked[0];
    return top;
}

function get_pixel (pixels, n_channels, rowstride, x, y)
{
    // The pixel we wish to modify
    pixel_start = y * rowstride + x * n_channels;
    return [pixels[pixel_start], pixels[pixel_start + 1], pixels[pixel_start + 2]]
}
//# sourceMappingURL=image_utils.js.map