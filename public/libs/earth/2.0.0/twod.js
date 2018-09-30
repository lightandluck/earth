/*
 * twod: canvas 2d helpers
 *
 * Copyright (c) 2018 Cameron Beccario
 */
 // /**
//  * Resize the canvas's drawing buffer.
//  *
//  * @param {HTMLCanvasElement} canvas element to resize
//  * @param {number} width of drawing buffer
//  * @param {number} height of drawing buffer
//  */
// export function resizeDrawingBuffer(canvas, width, height) {
//     if (canvas.width !== width || canvas.height !== height) {
//         canvas.width = width;
//         canvas.height = height;
//     }
// }
//
// /**
//  * Resize the canvas's drawing buffer to match the canvas's display size using the specified pixel ratio. For example,
//  * a ratio of 2.0 would make the drawing buffer twice the size in each dimension as the display size (and thus 4x the
//  * pixel count), whereas a ratio of 0.5 halves the size.
//  *
//  * @param {HTMLCanvasElement} canvas element to resize.
//  * @param {number} pixelRatio ratio of drawing buffer size to display size in each dimension.
//  */
// export function resizeDrawingBufferToDisplay(canvas, pixelRatio) {
//     resizeDrawingBuffer(
//         canvas,
//         Math.round(canvas.clientWidth * pixelRatio),
//         Math.round(canvas.clientHeight * pixelRatio));
// }

/**
 * @param {number} [width] width of drawing buffer
 * @param {number} [height] height of drawing buffer
 * @returns {HTMLCanvasElement}
 */

function createCanvas() {
  var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
  var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
  var result =
  /** @type {HTMLCanvasElement} */
  document.createElement("canvas");
  result.width = width;
  result.height = height; // resizeDrawingBuffer(result, width, height);

  return result;
}
/** @param {CanvasRenderingContext2D} ctx clears this 2d context */

function clearContext(ctx) {
  var _ctx$canvas = ctx.canvas,
      width = _ctx$canvas.width,
      height = _ctx$canvas.height;
  ctx.save();
  ctx.setTransform(1, 0, 0, 1, 0, 0);
  ctx.clearRect(0, 0, width, height);
  ctx.restore();
}
/** @param {HTMLCanvasElement} canvas clears the 2d context of the canvas */

function clearCanvas(canvas) {
  clearContext(canvas.getContext("2d"));
}
function makeStrokeRenderer(mesh, options) {
  return {
    /**
     * @param {CanvasRenderingContext2D} context
     * @param path D3 path function
     */
    renderTo: function renderTo(context, path) {
      assign(context, options);
      context.beginPath();
      path(mesh);
      context.stroke();
    }
  };
}
function makeLayerRenderer(renderers) {
  return {
    /**
     * @param {CanvasRenderingContext2D} context
     * @param path D3 path function
     */
    renderTo: function renderTo(context, path) {
      clearContext(context);
      path.context(context);
      context.lineJoin = "bevel";
      renderers.forEach(function (r) {
        return r.renderTo(context, path);
      });
    }
  };
}