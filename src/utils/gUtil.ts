export default class gUtils {
    public constructor(public glContext: WebGL2RenderingContext) {
    }

    public CreateArrBuffer() {
        const arr_buffer = this.glContext.createBuffer();
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, arr_buffer);
    }

    public CreateBufferF32(data: number[]) {
        const buffer = this.glContext.createBuffer();
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, buffer);
        // console.log(new Float32Array(data))
        this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Float32Array(data), this.glContext.STATIC_DRAW);
        // this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, null);
    }

    public CreateBufferUi8(data: number[]) {
        const buffer = this.glContext.createBuffer();
        this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, buffer);
        this.glContext.bufferData(this.glContext.ARRAY_BUFFER, new Uint8Array(data), this.glContext.STATIC_DRAW);
        // this.glContext.bindBuffer(this.glContext.ARRAY_BUFFER, null);
    }

    public SetAttrib(vao: WebGLVertexArrayObject | null, attrib_layout: number, data: number[], size: number, type: number, normalize: boolean, stride: number, offset: number) {
        if(vao == null) {
            vao = this.glContext.createVertexArray();
        }

        this.glContext.bindVertexArray(vao);

        this.glContext.enableVertexAttribArray(attrib_layout);

        this.CreateBufferF32(data);

        this.glContext.vertexAttribPointer(attrib_layout, size, type, normalize, stride, offset);
        // this.glContext.bindVertexArray(null);
        return vao;
    }

    public async LoadTexture(imageURL: string, texIndex: number) {
        const texture = this.glContext.createTexture();

        this.glContext.activeTexture(this.glContext.TEXTURE0 + texIndex);
        this.glContext.bindTexture(this.glContext.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = this.glContext.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = this.glContext.RGBA;
        const srcType = this.glContext.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 255, 255, 255]);  // opaque blue
        this.glContext.texImage2D(this.glContext.TEXTURE_2D, level, internalFormat,
                        width, height, border, srcFormat, srcType, pixel);
        
        const image = new Image();
        // image.src = imageURL;
        
        image.onload = () => {
            this.glContext.bindTexture(this.glContext.TEXTURE_2D, texture);
            this.glContext.texImage2D(this.glContext.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
            this.glContext.generateMipmap(this.glContext.TEXTURE_2D);
            console.log('texture image ready');
        }
        
        image.src = imageURL;

        return texture;
    }

    public LoadTextureT(image: HTMLImageElement, texIndex: number) {
        const texture = this.glContext.createTexture();

        this.glContext.activeTexture(this.glContext.TEXTURE0 + texIndex);
        this.glContext.bindTexture(this.glContext.TEXTURE_2D, texture);

        const level = 0;
        const internalFormat = this.glContext.RGBA;
        const width = 1;
        const height = 1;
        const border = 0;
        const srcFormat = this.glContext.RGBA;
        const srcType = this.glContext.UNSIGNED_BYTE;
        const pixel = new Uint8Array([0, 255, 255, 255]);  // opaque blue
        this.glContext.texImage2D(this.glContext.TEXTURE_2D, level, internalFormat,
                        width, height, border, srcFormat, srcType, pixel);
        
        this.glContext.bindTexture(this.glContext.TEXTURE_2D, texture);
        this.glContext.texImage2D(this.glContext.TEXTURE_2D, level, internalFormat, srcFormat, srcType, image);
        this.glContext.generateMipmap(this.glContext.TEXTURE_2D);
        
        return texture;
    }

    public CreateTexture(texIndex: number, textWidth: number, texHeight: number, border: number, texData: Uint8Array, internalFormat: number, colorFormat:number, type: number) {
        const texture = this.glContext.createTexture();
        this.glContext.activeTexture(this.glContext.TEXTURE0 + texIndex);
        this.glContext.bindTexture(this.glContext.TEXTURE_2D, texture);

        this.glContext.texImage2D(this.glContext.TEXTURE_2D, 0, internalFormat, textWidth, texHeight, border, colorFormat, type, texData);
        this.glContext.texParameteri(this.glContext.TEXTURE_2D, this.glContext.TEXTURE_MIN_FILTER, this.glContext.NEAREST);
        this.glContext.texParameteri(this.glContext.TEXTURE_2D, this.glContext.TEXTURE_MAG_FILTER, this.glContext.NEAREST);
        this.glContext.texParameteri(this.glContext.TEXTURE_2D, this.glContext.TEXTURE_WRAP_S, this.glContext.CLAMP_TO_EDGE);
        this.glContext.texParameteri(this.glContext.TEXTURE_2D, this.glContext.TEXTURE_WRAP_T, this.glContext.CLAMP_TO_EDGE);
    }

    public ResizeCanvasToDisplaySize(canvas: HTMLCanvasElement, multiplier = 1) {
        const width  = canvas.clientWidth  * multiplier | 0;
        const height = canvas.clientHeight * multiplier | 0;
        if (canvas.width !== width ||  canvas.height !== height) {
          canvas.width  = width;
          canvas.height = height;
          return true;
        }
        return false;
    }

    public InitContext(canvas: HTMLCanvasElement, multiplier = 1) {
        this.ResizeCanvasToDisplaySize(canvas, multiplier);
        this.glContext.viewport(0, 0, this.glContext.canvas.width, this.glContext.canvas.height);
        this.glContext.enable(this.glContext.DEPTH_TEST);
        this.glContext.enable(this.glContext.CULL_FACE);
        this.glContext.clear(this.glContext.COLOR_BUFFER_BIT | this.glContext.DEPTH_BUFFER_BIT);
    }

}