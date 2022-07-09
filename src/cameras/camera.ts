import * as MathUtils from '../math/mathUtils';
import Matrix4 from "../math/m4"

type Vector3 = [number, number, number];

export default class Camera {
    public isCamera: boolean;
    m_front: Vector3;
    m_right: Vector3;
    m_zoom: number;

    constructor(private m_position = [0.0, 0.0, 0.0] as Vector3, private m_up = [0.0, 1.0, 0.0] as Vector3, private m_yaw = -90.0, private m_pitch = 0.0, private m_roll = 0.0 ) {

        this.isCamera = true;
        this.m_front = [0.0, 0.0, -1.0] as Vector3;
        this.m_right = [0.0, 0.0, -1.0] as Vector3;
        this.m_zoom = 45.0;
        this.UpdateCameraVec();
    }

    UpdateCameraVec() {
        const front = [0, 0, 0] as Vector3;
        front[0] = Math.cos(MathUtils.degToRad(this.m_pitch)) * Math.cos(MathUtils.degToRad(this.m_yaw));
        front[1] = Math.sin(MathUtils.degToRad(this.m_pitch));
        front[2] = Math.cos(MathUtils.degToRad(this.m_pitch)) * Math.sin(MathUtils.degToRad(this.m_yaw));
        this.m_front = Matrix4.normalize(front);
        this.m_right = Matrix4.normalize(Matrix4.cross(this.m_front, this.m_up));
        this.m_up = Matrix4.normalize(Matrix4.cross(this.m_right, this.m_front));
    }

    LookAt() {
        return Matrix4.lookAt(this.m_position, Matrix4.addVectors(this.m_position, this.m_front), this.m_up);
    }

    getFOV() {
        return this.m_zoom;
    }

    getPos() {
        return this.m_position;
    }

    getFront() {
        return this.m_front;
    }

    setPos( newPos: Vector3 ) {
        this.m_position = newPos;
    }

    updateFront( dest:Vector3 ) {
        this.m_front = Matrix4.subtractVectors(dest, Matrix4.scaleVector(this.m_position, 2.0));
    }


}

export {
    Camera
}

