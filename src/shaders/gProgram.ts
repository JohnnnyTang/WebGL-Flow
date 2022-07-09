import { Matrix3 } from "../math/m3";
import { Matrix4 } from "../math/m4";

type Vector2 = [number, number];
type Vector3 = [number, number, number];
type Vector4 = [number, number, number, number]

export default class GProgram {
    public glProgram: WebGLProgram;

    public constructor(private glContext: WebGL2RenderingContext, vertSource: string, fragSource: string) {
        this.glProgram = glContext.createProgram() as WebGLProgram;
        const vs = this.CreateShader(glContext.VERTEX_SHADER, vertSource) as WebGLShader;
        const fs = this.CreateShader(glContext.FRAGMENT_SHADER, fragSource) as WebGLShader; 
        if(vs == null || fs == null) {
            throw console.error('Shader Create Failed! Please Check!');
        }
        glContext.attachShader(this.glProgram, vs);
        glContext.attachShader(this.glProgram, fs);
        glContext.linkProgram(this.glProgram);
        const success = glContext.getProgramParameter(this.glProgram, glContext.LINK_STATUS);
        if(!success) {
            console.log(glContext.getProgramInfoLog(this.glProgram));
            glContext.deleteProgram(this.glProgram);
            throw console.error('Program Create Failed! Please Check!');
        }
        glContext.deleteShader(vs);
        glContext.deleteShader(fs);
    }

    private CreateShader(type: number, source: string) {
        const shader = this.glContext.createShader(type) as WebGLShader;
        this.glContext.shaderSource(shader, source);
        this.glContext.compileShader(shader);
        const success = this.glContext.getShaderParameter(shader, this.glContext.COMPILE_STATUS);
        if(success) {
            return shader;
        }
        console.log(this.glContext.getShaderInfoLog(shader));
        this.glContext.deleteShader(shader);
        return null;
    }

    public setInt( uniName: string, val: number) {
        this.glContext.uniform1i(this.glContext.getUniformLocation(this.glProgram, uniName), val);
    }

    public setFloat( uniName: string, val: number) {
        this.glContext.uniform1f(this.glContext.getUniformLocation(this.glProgram, uniName), val);
    }

    public setVec2( uniName: string, val: Vector2) {
        this.glContext.uniform2fv(this.glContext.getUniformLocation(this.glProgram, uniName), val);
    }

    public setVec3( uniName: string, val: Vector3) {
        this.glContext.uniform3fv(this.glContext.getUniformLocation(this.glProgram, uniName), val);
    }

    public setVec4( uniName: string, val: Vector4) {
        this.glContext.uniform4fv(this.glContext.getUniformLocation(this.glProgram, uniName), val);
    }

    public setMat3( uniName: string, val: Matrix3) {
        this.glContext.uniformMatrix3fv(this.glContext.getUniformLocation(this.glProgram, uniName), false, val.toArray());
    }

    public setMat4( uniName: string, val: Matrix4) {
        this.glContext.uniformMatrix4fv(this.glContext.getUniformLocation(this.glProgram, uniName), false, val.toArray());
    }

    public GetAttribLayout(attribName: string){
        return this.glContext.getAttribLocation(this.glProgram, attribName);
    }

    use() {
        this.glContext.useProgram(this.glProgram);
    }
}

export {
    GProgram, 
}