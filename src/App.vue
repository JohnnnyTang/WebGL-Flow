<template>
  <canvas id="canvas" ref="paint"></canvas>
  <img src="http://localhost:8080/textures/f-texture.png">
</template>

<script lang="ts">
export default {
  name: "App",
};
</script>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import GProgram from "./shaders/gProgram";
import GUtils from "./utils/gUtil";
import Matrix4, { Vector3 } from "./math/m4";
import * as MathUtil from "./math/mathUtils";

const paint = ref<HTMLCanvasElement | null>(null);

const vertexShaderSource = `#version 300 es
in vec4 a_position;
in vec2 a_texcoord;
 
uniform mat4 u_matrix;
 
// a varying to pass the texture coordinates to the fragment shader
out vec2 v_texcoord;
 
void main() {
  // Multiply the position by the matrix.
  gl_Position = u_matrix * a_position;
 
  // Pass the texcoord to the fragment shader.
  v_texcoord = (a_texcoord / 255.0);
}
`;

const fragmentShaderSource = `#version 300 es
precision highp float;
 
// Passed in from the vertex shader.
in vec2 v_texcoord;
 
// The texture.
uniform sampler2D u_texture;
 
out vec4 outColor;
 
void main() {
   outColor = texture(u_texture, v_texcoord);
}
`;

const positions = [
  // left column front
  0, 0, 0, 0, 150, 0, 30, 0, 0, 0, 150, 0, 30, 150, 0, 30, 0, 0,

  // top rung front
  30, 0, 0, 30, 30, 0, 100, 0, 0, 30, 30, 0, 100, 30, 0, 100, 0, 0,

  // middle rung front
  30, 60, 0, 30, 90, 0, 67, 60, 0, 30, 90, 0, 67, 90, 0, 67, 60, 0,

  // left column back
  0, 0, 30, 30, 0, 30, 0, 150, 30, 0, 150, 30, 30, 0, 30, 30, 150, 30,

  // top rung back
  30, 0, 30, 100, 0, 30, 30, 30, 30, 30, 30, 30, 100, 0, 30, 100, 30, 30,

  // middle rung back
  30, 60, 30, 67, 60, 30, 30, 90, 30, 30, 90, 30, 67, 60, 30, 67, 90, 30,

  // top
  0, 0, 0, 100, 0, 0, 100, 0, 30, 0, 0, 0, 100, 0, 30, 0, 0, 30,

  // top rung right
  100, 0, 0, 100, 30, 0, 100, 30, 30, 100, 0, 0, 100, 30, 30, 100, 0, 30,

  // under top rung
  30, 30, 0, 30, 30, 30, 100, 30, 30, 30, 30, 0, 100, 30, 30, 100, 30, 0,

  // between top rung and middle
  30, 30, 0, 30, 60, 30, 30, 30, 30, 30, 30, 0, 30, 60, 0, 30, 60, 30,

  // top of middle rung
  30, 60, 0, 67, 60, 30, 30, 60, 30, 30, 60, 0, 67, 60, 0, 67, 60, 30,

  // right of middle rung
  67, 60, 0, 67, 90, 30, 67, 60, 30, 67, 60, 0, 67, 90, 0, 67, 90, 30,

  // bottom of middle rung.
  30, 90, 0, 30, 90, 30, 67, 90, 30, 30, 90, 0, 67, 90, 30, 67, 90, 0,

  // right of bottom
  30, 90, 0, 30, 150, 30, 30, 90, 30, 30, 90, 0, 30, 150, 0, 30, 150, 30,

  // bottom
  0, 150, 0, 0, 150, 30, 30, 150, 30, 0, 150, 0, 30, 150, 30, 30, 150, 0,

  // left side
  0, 0, 0, 0, 0, 30, 0, 150, 30, 0, 0, 0, 0, 150, 30, 0, 150, 0,
];

const texCoords = [
  // left column front
  38, 44, 38, 223, 113, 44, 38, 223, 113, 223, 113, 44,

  // top rung front
  113, 44, 113, 85, 218, 44, 113, 85, 218, 85, 218, 44,

  // middle rung front
  113, 112, 113, 151, 203, 112, 113, 151, 203, 151, 203, 112,

  // left column back
  38, 44, 113, 44, 38, 223, 38, 223, 113, 44, 113, 223,

  // top rung back
  113, 44, 218, 44, 113, 85, 113, 85, 218, 44, 218, 85,

  // middle rung back
  113, 112, 203, 112, 113, 151, 113, 151, 203, 112, 203, 151,

  // top
  38, 44, 38, 223, 113, 44, 38, 223, 113, 223, 113, 44,

  // top rung right
  38, 44, 38, 223, 113, 44, 38, 223, 113, 223, 113, 44,

  // under top rung
  38, 44, 38, 223, 113, 44, 38, 223, 113, 223, 113, 44,

  // between top rung and middle
  38, 44, 113, 44, 38, 223, 38, 223, 113, 44, 113, 223, 

  // top of middle rung
  0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

  // right of middle rung
  0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

  // bottom of middle rung.
  0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

  // right of bottom
  0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 1,

  // bottom
  0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,

  // left side
  0, 0, 0, 1, 1, 1, 0, 0, 1, 1, 1, 0,
];

var scale = [1, 1, 1];
var fieldOfViewRadians = MathUtil.DEG2RAD * 60;
var modelXRotationRadians = MathUtil.DEG2RAD * 180;
var modelYRotationRadians = MathUtil.DEG2RAD * 30;

onMounted(async () => {
  const canvas = paint.value as HTMLCanvasElement;
  const gl = canvas.getContext("webgl2") as WebGL2RenderingContext;

  const gUtil = new GUtils(gl);
  const gProgram = new GProgram(gl, vertexShaderSource, fragmentShaderSource);

  const vao = gUtil.SetAttrib(
    null,
    gProgram.GetAttribLayout("a_position"),
    positions,
    3,
    gl.FLOAT,
    false,
    0,
    0
  );

  gUtil.SetAttrib(
    vao,
    gProgram.GetAttribLayout("a_texcoord"),
    texCoords,
    2,
    gl.FLOAT,
    false,
    0,
    0
  );

  // const tex = gUtil.LoadTexture(
  //   "http://localhost:8080/textures/f-texture.png",
  //   0
  // );
  await gUtil.LoadTexture('http://localhost:8080/textures/f-texture.png', 0)
        .then(res => {
          if(res != null) {
            render();
          }
        });
  
  // console.log(tex);
  // const img = new Image();
  // img.src = 'http://localhost:8080/textures/f-texture.png';

  // const texture = gl.createTexture();
  // gl.activeTexture(gl.TEXTURE0 + 0);
  // gl.bindTexture(gl.TEXTURE_2D, texture);

  // const level = 0;
  // const internalFormat = gl.RGBA;
  // const width = 1;
  // const height = 1;
  // const border = 0;
  // const srcFormat = gl.RGBA;
  // const srcType = gl.UNSIGNED_BYTE;
  // const pixel = new Uint8Array([0, 255, 255, 255]);  // opaque blue

  // let flag = false;

  // img.onload = () => {
  //   console.log('texture image ready');
  //   gl.texImage2D(gl.TEXTURE_2D, level, internalFormat,
  //               width, height, border, srcFormat, srcType, pixel);
  //   gl.bindTexture(gl.TEXTURE_2D, texture);
  //   gl.texImage2D(gl.TEXTURE_2D, level, internalFormat, srcFormat, srcType, img);
  //   gl.generateMipmap(gl.TEXTURE_2D);
  //   flag = true;
  //   // render();
  // }
  //render();

  function render() {
    // if(!flag) {
    //   return;
    // }
    gUtil.InitContext(canvas);

    gProgram.use();

    var aspect = gl.canvas.clientWidth / gl.canvas.clientHeight;
    var zNear = 1;
    var zFar = 2000;
    var projectionMatrix = Matrix4.perspective(
      fieldOfViewRadians,
      aspect,
      zNear,
      zFar
    );

    var cameraPosition = [0, 0, 200] as Vector3;
    var up = [0, 1, 0] as Vector3;
    var target = [0, 0, 0] as Vector3;
    var camMat = Matrix4.lookAt(cameraPosition, target, up);
    var viewMat = Matrix4.inverse(camMat);
    var vpMat = Matrix4.multiply(projectionMatrix, viewMat);
    var matrix = Matrix4.xRotate(vpMat, modelXRotationRadians);
    matrix = Matrix4.yRotate(matrix, modelYRotationRadians);
    matrix = Matrix4.translate(matrix, -30, -70, 0);

    matrix = Matrix4.scale(matrix, scale[0], scale[1], scale[2]);

    gl.bindVertexArray(vao);

    gProgram.setMat4("u_matrix", matrix);
    gProgram.setInt('u_texture', 0);

    gl.drawArrays(gl.TRIANGLES, 0, 16 * 6);
    console.log('drawn done.');
    // clearInterval(draw);
  }

});
</script>

<style>
#canvas {
  width: 960px;
  height: 480px;
  position: absolute;
  top: 50px;
  left: 100px;
  background-color: skyblue;
}

img {
  position: absolute;
  bottom: 20px;
  left: 100px;
}

</style>
