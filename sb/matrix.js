//stored in row major order
function Matrix4() {
    var fillNumber = 0.0;
    
    //function overload
    if(typeof arguments[0] == "number") {
        fillNumber = arguments[0];
    }
    
    this.data = new Float32Array(16);
    this.store = new Float32Array(16);
    for(var i = 0; i<16; i++) {
        this.data[i]=fillNumber;
        this.store[i]=fillNumber;
    } 


}


Matrix4.prototype.scalarMultiplication = function(scalar) {
    for(var i=0; i<16; this.data[i]*=scalar,i++);
};

Matrix4.prototype.Transpose = function() {
    var h = this.data[1];
    this.data[1] = this.data[4];
    this.data[4] = h;
    h = this.data[2];
    this.data[2] = this.data[8];
    this.data[8] = h;
    h = this.data[6];
    this.data[6] = this.data[9];
    this.data[9] = h;
    h = this.data[3];
    this.data[3] = this.data[12];
    this.data[12] = h;
    h = this.data[7];
    this.data[7] = this.data[13];
    this.data[13] = h;
    h = this.data[11];
    this.data[11] = this.data[14];
    this.data[14] = h; 
};

//rotPoint = (vec2)
Matrix4.prototype.RotateSprite = function(angleInRads,rotPoint) {

};

//takes matrices as paramaters and multiplies them all together with this matrix instance
Matrix4.prototype.Multiply = function() {

    for(var i = 0; i<arguments.length; i++) {

        this.store[0] = this.data[0]*arguments[i][0]+this.data[1]*arguments[i][4]+this.data[2]*arguments[i][8]+this.data[3]*arguments[i][12];
        this.store[1] = this.data[0]*arguments[i][1]+this.data[1]*arguments[i][5]+this.data[2]*arguments[i][9]+this.data[3]*arguments[i][13];
        this.store[2] = this.data[0]*arguments[i][2]+this.data[1]*arguments[i][6]+this.data[2]*arguments[i][10]+this.data[3]*arguments[i][14];
        this.store[3] = this.data[0]*arguments[i][3]+this.data[1]*arguments[i][7]+this.data[2]*arguments[i][11]+this.data[3]*arguments[i][15];

        this.store[4] = this.data[4]*arguments[i][0]+this.data[5]*arguments[i][4]+this.data[6]*arguments[i][8]+this.data[7]*arguments[i][12];
        this.store[5] = this.data[4]*arguments[i][1]+this.data[5]*arguments[i][5]+this.data[6]*arguments[i][9]+this.data[7]*arguments[i][13];
        this.store[6] = this.data[4]*arguments[i][2]+this.data[5]*arguments[i][6]+this.data[6]*arguments[i][10]+this.data[7]*arguments[i][14];
        this.store[7] = this.data[4]*arguments[i][3]+this.data[5]*arguments[i][7]+this.data[6]*arguments[i][11]+this.data[7]*arguments[i][15];

        this.store[8] = this.data[8]*arguments[i][0]+this.data[9]*arguments[i][4]+this.data[10]*arguments[i][8]+this.data[11]*arguments[i][12];
        this.store[9] = this.data[8]*arguments[i][1]+this.data[9]*arguments[i][5]+this.data[10]*arguments[i][9]+this.data[11]*arguments[i][13];
        this.store[10] = this.data[8]*arguments[i][2]+this.data[9]*arguments[i][6]+this.data[10]*arguments[i][10]+this.data[11]*arguments[i][14];
        this.store[11] = this.data[8]*arguments[i][3]+this.data[9]*arguments[i][7]+this.data[10]*arguments[i][11]+this.data[11]*arguments[i][15];

        this.store[12] = this.data[12]*arguments[i][0]+this.data[13]*arguments[i][4]+this.data[14]*arguments[i][8]+this.data[15]*arguments[i][12];
        this.store[13] = this.data[12]*arguments[i][1]+this.data[13]*arguments[i][5]+this.data[14]*arguments[i][9]+this.data[15]*arguments[i][13];
        this.store[14] = this.data[12]*arguments[i][2]+this.data[13]*arguments[i][6]+this.data[14]*arguments[i][10]+this.data[15]*arguments[i][14];
        this.store[15] = this.data[12]*arguments[i][3]+this.data[13]*arguments[i][7]+this.data[14]*arguments[i][11]+this.data[15]*arguments[i][15];

        for(var j = 0; j<16; this.data[j]=this.store[j], j++);
    }


};

//static things----------------------------------



Matrix4.CreateIdentity = function() {
    var m = new Matrix4(0);
    m.data[0] = 1.0;
    m.data[5] = 1.0;
    m.data[10] = 1.0;
    m.data[15] = 1.0;
    return m;
};



Matrix4.CreateRotationX = function(x) {
    var m = new Matrix4(0);
    m.data[0] = 1.0;
    m.data[5] = Math.cos(x);
    m.data[6] = -Math.sin(x);
    m.data[9] = Math.sin(x);
    m.data[10] = Math.cos(x);
    m.data[15] = 1.0;
    return m;
};

Matrix4.CreateRotationY = function(y) {
    var m = new Matrix4(0);
    m.data[0] = Math.cos(y);
    m.data[2] = Math.sin(y);
    m.data[5] = 1.0;
    m.data[8] = -Math.sin(y);
    m.data[10] = Math.cos(y);
    m.data[15] = 1.0;
    return m;
};

Matrix4.CreateRotationZ = function(z) {
    var m = new Matrix4(0);
    m.data[0] = Math.cos(z);
    m.data[1] = -Math.sin(z);
    m.data[4] = Math.sin(z);
    m.data[5] = Math.cos(z);
    m.data[10] = 1.0;
    m.data[15] = 1.0;
    return m;
};

Matrix4.CreateScale = function(x,y,z) {
    x = x || 1.0; y = y || 1.0; z = z || 1.0;
    var m = new Matrix4(0);
    m.data[0] = x;
    m.data[5] = y;
    m.data[10] = z;
    m.data[15] = 1.0;
    return m;
};

Matrix4.CreateTranslation = function(x,y,z) {
    x = x || 0; y = y || 0; z = z || 0;
    var m = new Matrix4(0);
    m.data[0] = 1.0;
    m.data[5] = 1.0;
    m.data[10] = 1.0;
    m.data[3] = x;
    m.data[7] = y;
    m.data[11] = z;
    m.data[15] = 1.0;
    return m;
};

Matrix4.CreateOrthographicProjection = function(left, right, bottom, top, near, far) {
    var rl = 1.0/(right - left);
    var tb = 1.0/(top-bottom);
    var fn = 1.0/(far - near);
    var m = new Matrix4(0);
    m.data[0] = 2.0*rl;
    m.data[3] = -(right+left)*rl;
    m.data[5] = 2.0*tb;
    m.data[7] = -(top+bottom)*tb;
    m.data[10] = -2.0* fn;
    m.data[11] = -(far+near)*fn;
    m.data[15] = 1;
    return m;
}


//ascpectRatio is = width/height
//FOV(Field of View) = vertical angle(in radians) of the camera through which we are looking at the world
//zNear = location of the near Z plane
//zFar = location of the far Z plane
Matrix4.CreatePerspectiveProjection = function(aspectRatio, FOV, zNear, zFar) {
    var m = new Matrix4(0);

    var f = 1.0 / Math.tan(FOV/2);
    var rangeInv = 1 / (zNear - zFar);
    m.data[0] = f / aspectRatio;
    m.data[5] = f;
    m.data[10] = (zFar + zNear) * rangeInv; 
    m.data[11] = zNear * zFar * rangeInv * 2;
    m.data[14] = -1;
    

    return m;
};

//eye(Vector3) = camera position
//target(Vector3) = point camera is looking at
//up(Vector3) = direction that is "up" from the camera's point of view
//inMatrix = optional matrix that gets set and returned
Matrix4.CreateView = function(eye,target,up,inMatrix) {
    var x0, x1, x2, y0, y1, y2, z0, z1, z2, len,
        eyex = eye.data[0], eyey = eye.data[1], eyez = eye.data[2],
        upx = up.data[0], upy = up.data[1], upz = up.data[2],
        targetx = target.data[0], targety = target.data[1], targetz = target.data[2];
    
    if (Math.abs(eyex - targetx) < Matrix4.EPSILON &&
        Math.abs(eyey - targety) < Matrix4.EPSILON &&
        Math.abs(eyez - targetz) < Matrix4.EPSILON) {
        return Matrix4.CreateIdentity();
    }

    //z = forward Vector x = right vector y = up vector
    
    //normal(eye - target)
    z0 = eyex - targetx;
    z1 = eyey - targety;
    z2 = eyez - targetz;

    len = 1 / Math.sqrt(z0 * z0 + z1 * z1 + z2 * z2);
    z0 *= len;
    z1 *= len;
    z2 *= len;

    //normal(cross(up,z))
    x0 = upy * z2 - upz * z1;    
    x1 = upz * z0 - upx * z2;    
    x2 = upx * z1 - upy * z0;

    len = Math.sqrt(x0 * x0 + x1 * x1 + x2 * x2);
    if (!len) {
        x0 = 0;
        x1 = 0;
        x2 = 0;
    } else {
        len = 1 / len;
        x0 *= len;
        x1 *= len;
        x2 *= len;
    }

    //cross(z, x)
    y0 = z1 * x2 - z2 * x1;
    y1 = z2 * x0 - z0 * x2;
    y2 = z0 * x1 - z1 * x0;

    len = Math.sqrt(y0 * y0 + y1 * y1 + y2 * y2);
    if (!len) {
        y0 = 0;
        y1 = 0;
        y2 = 0;
    } else {
        len = 1 / len;
        y0 *= len;
        y1 *= len;
        y2 *= len;
    }
    

    var m = null;

    if(inMatrix) {
        m = inMatrix;
    } else {
        m = new Matrix4(0);
    }

    m.data[0] = x0;
    m.data[1] = y0;
    m.data[2] = z0;
    //m.data[3] = 0;
    m.data[4] = x1;
    m.data[5] = y1;
    m.data[6] = z1;
    //m.data[7] = 0;
    m.data[8] = x2;
    m.data[9] = y2;
    m.data[10] = z2;
    //m.data[11] = 0;
    m.data[12] = -(x0 * eyex + x1 * eyey + x2 * eyez); //-dot(x,eye)
    m.data[13] = -(y0 * eyex + y1 * eyey + y2 * eyez); //-dot(y,eye)
    m.data[14] = -(z0 * eyex + z1 * eyey + z2 * eyez); //-dot(z,eye)
    m.data[15] = 1;

    if(!inMatrix) {
        return m;
    }
      

};