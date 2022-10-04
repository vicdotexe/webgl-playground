
//optional arguments are strings that are properties to ignore on the source
function extend(dest, source) {
    var shouldContinue = false;    
    for(var k in source) {
        for(var i = 2; i < arguments.length; i++) {
            if(k === arguments[i]) {
                shouldContinue = true;
                break;
            }                                
        }
        if(shouldContinue) {
            shouldContinue = false;
            continue;
        }
        if(source.hasOwnProperty(k)) {
            dest[k] = source[k];
        }
    }
    return dest;
}

//TypedArrayVector#############################################################################################

var baseVector = {

    normalize: function() {
        var l = this.Length;
        for(var i=0; i<2; i++) {
            this.data[i] = this.data[i]/l;
        }
    },
    set: function(inVector) {
        for(var i=0; i<this.data.length; i++)
            this.data[i] = inVector.data[i];
    },
    scale: function(scalar) {
        for(var i=0; i<this.data.length; this.data[i]*=scalar, i++);    
    },
    add: function(inVector) {
        for(var i=0; i<this.data.length; i++)
            this.data[i] += inVector.data[i];
    },
    subtract: function(inVector) {
        for(var i=0; i<this.data.length; i++)
            this.data[i] -= inVector.data[i];   
    },
    multiply: function(inVector) {
        for(var i=0; i<this.data.length; this.data[i] *= inVector.data[i], i++);        
    },
    toString: function() {
        var s = '(';
        for(var i=0; i<this.data.length; i++) {
            if(i == this.data.length-1) s += this.data[i] + ')';
            else s += this.data[i] + ',';
        }
        return s;
    }
};

var staticVector = {

    add: function(one,two,out) {
        for(var i=0; i<one.data.length; i++) {
            out.data[i] = one.data[i] + two.data[i]
        }
    },
    subtract: function(one,two,out) {
        for(var i=0; i<one.data.length; i++) {
            out.data[i] = one.data[i] - two.data[i]
        }
    },
    multiply: function(one,two,out) {
        for(var i=0; i<one.data.length; i++) {
            out.data[i] = one.data[i] * two.data[i];
        }
    },
    scale: function(one,two,out) {
        for(var i=0; i<one.data.length; i++) {
            out.data[i] *= two;
        }
    },
    dot: function(inOne,inTwo) {
        var sum = 0;
        for(var i=0; i<inOne.data.length; i++) {
            sum += inOne.data[i]*inTwo.data[i];
        }
        return sum;
    },
    distance: function(inOne,inTwo) {
        var sum = 0;
        for(var i=0; i<inOne.data.length; i++) {
            sum += ((inOne.data[i]-inTwo.data[i])*(inOne.data[i]-inTwo.data[i]));
        }
        return Math.sqrt(sum);
    },
    distanceSquared: function(inOne,inTwo) {
        var sum = 0;
        for(var i=0; i<inOne.data.length; i++) {
            sum += ((inOne.data[i]-inTwo.data[i])*(inOne.data[i]-inTwo.data[i]));
        }
        return sum;
    },
    cross: function(inOne,inTwo,outThree) {
        outThree[0] = (inOne.data[1]*inTwo.data[2]) - (inTwo.data[1]*inOne.data[2]);
        outThree[1] = -((inOne.data[0]*inTwo.data[2]) - (inTwo.data[0]*inOne.data[2]));
        outThree[2] = (inOne.data[0]*inTwo.data[1]) - (inTwo.data[0]*inOne.data[1]);
    }
};

function TypedArrayVector2() {
    if(arguments.length !== 2)
        throw new Error('There must only be two number arguments.');
    this.data = new Float32Array(arguments.length);
    for(var i =0; i< arguments.length; i++)
        this.data[i] = arguments[i];
}
Object.defineProperty(TypedArrayVector2.prototype,'x',{
    get: function() { return this.data[0]; },
    set: function(input) { this.data[0] = input; }
});
Object.defineProperty(TypedArrayVector2.prototype,'y',{
    get: function() { return this.data[1]; },
    set: function(input) { this.data[1] = input; }
});
extend(TypedArrayVector2.prototype,baseVector);
extend(TypedArrayVector2,staticVector,'cross'); 

function TypedArrayVector3() {
    if(arguments.length !== 3)
        throw new Error('There must only be three number arguments.');
    this.data = new Float32Array(arguments.length);
    for(var i =0; i< arguments.length; i++)
        this.data[i] = arguments[i];
}
Object.defineProperty(TypedArrayVector3.prototype,'x',{
    get: function() { return this.data[0]; },
    set: function(input) { this.data[0] = input; }
});
Object.defineProperty(TypedArrayVector3.prototype,'y',{
    get: function() { return this.data[1]; },
    set: function(input) { this.data[1] = input; }
});
Object.defineProperty(TypedArrayVector3.prototype,'z',{
    get: function() { return this.data[2]; },
    set: function(input) { this.data[2] = input; }
});
extend(TypedArrayVector3.prototype,baseVector);
extend(TypedArrayVector3,staticVector); 

function TypedArrayVector4() {
    if(arguments.length !== 4)
        throw new Error('There must only be four number arguments.');
    this.data = new Float32Array(arguments.length);
    for(var i =0; i< arguments.length; i++)
        this.data[i] = arguments[i];
}
Object.defineProperty(TypedArrayVector4.prototype,'x',{
    get: function() { return this.data[0]; },
    set: function(input) { this.data[0] = input; }
});
Object.defineProperty(TypedArrayVector4.prototype,'y',{
    get: function() { return this.data[1]; },
    set: function(input) { this.data[1] = input; }
});
Object.defineProperty(TypedArrayVector4.prototype,'z',{
    get: function() { return this.data[2]; },
    set: function(input) { this.data[2] = input; }
});
Object.defineProperty(TypedArrayVector4.prototype,'w',{
    get: function() { return this.data[3]; },
    set: function(input) { this.data[3] = input; }
});
Object.defineProperty(TypedArrayVector4.prototype, 'length', {
    get: function() {
        var sum = 0;
        for(var i = 0; i < this.data.length; i++)
            sum += this.data[i]*this.data[i];
        return Math.sqrt(sum);
    }
});
Object.defineProperty(TypedArrayVector4.prototype, 'lengthSquared', {
    get: function() {
        var sum = 0;
        for(var i = 0; i < this.data.length; i++)
            sum += this.data[i]*this.data[i];
        return sum;
    }
});
extend(TypedArrayVector4.prototype,baseVector);
extend(TypedArrayVector4,staticVector,'cross'); 



//SIMDVector2#############################################################################################

/**
 * Creates a two component vector.
 */
function SIMDVector2(x,y) {

    this.simdData = SIMD.Float64x2(x,y);
    this.taData = new Float64Array([x,y]);
    this.l;
}

Object.defineProperty(SIMDVector2.prototype,"data",{
    get: function() {
        this.taData[0] = SIMD.Float64x2.extractLane(this.simdData,0);
        this.taData[1] = SIMD.Float64x2.extractLane(this.simdData,1);
        return this.taData;
    }
});

Object.defineProperty(SIMDVector2.prototype,"x",{
    get: function() {return SIMD.Float64x2.extractLane(this.simdData,0);},
    set: function(input) { this.simdData = SIMD.Float64x2.replaceLane(this.simdData,0,input); }
});

Object.defineProperty(SIMDVector2.prototype,"y",{
    get: function() {return SIMD.Float64x2.extractLane(this.simdData,1);},
    set: function(input) { this.simdData = SIMD.Float64x2.replaceLane(this.simdData,1,input); }
});

Object.defineProperty(SIMDVector2.prototype,"length",{
    get: function() {
        this.l = SIMD.Float64x2.mul(this.simdData,this.simdData);
        return Math.sqrt(SIMD.Float64x2.extractLane(this.l,0) + SIMD.Float64x2.extractLane(this.l,1));
    }
});

Object.defineProperty(SIMDVector2.prototype,"lengthSquared",{
    get: function() {
        this.l = SIMD.Float64x2.mul(this.simdData,this.simdData);
        return SIMD.Float64x2.extractLane(this.l,0) + SIMD.Float64x2.extractLane(this.l,1);
    }
});

SIMDVector2.prototype.toString = function() {
    return this.simdData.toString();
};

SIMDVector2.prototype.set = function(inSIMDVector) {
    this.simdData = SIMD.Float64x2.check(inSIMDVector.simdData);
    return this.simdData;
};

SIMDVector2.prototype.normalize = function() {
    this.simdData = SIMD.Float64x2.div(this.simdData,SIMD.Float64x2.splat(this.length));
    return this.simdData;
};

SIMDVector2.prototype.scale = function(input) {
    this.simdData = SIMD.Float64x2.mul(this.simdData,SIMD.Float64x2.splat(input));
    return this.simdData;
};

SIMDVector2.prototype.add = function(input) {
    this.simdData = SIMD.Float64x2.add(this.simdData,input.simdData);
    return this.simdData;
};

SIMDVector2.prototype.subtract = function(input) {
    this.simdData = SIMD.Float64x2.sub(this.simdData,input.simdData);
    return this.simdData;
};

SIMDVector2.prototype.multiply = function(input) {
    this.simdData = SIMD.Float64x2.mul(this.simdData,input.simdData);
    return this.simdData;
};

SIMDVector2.add = function(inOne,inTwo,outThree) {
    outThree.simdData = SIMD.Float64x2.add(inOne.simdData,inTwo.simdData);
};

SIMDVector2.subtract = function(inOne,inTwo,outThree) {
    outThree.simdData = SIMD.Float64x2.sub(inOne.simdData,inTwo.simdData);
};

SIMDVector2.multiply = function(inOne,inTwo,outThree) {
    outThree.simdData = SIMD.Float64x2.mul(inOne.simdData,inTwo.simdData);
};

//intwo: scalar
SIMDVector2.scale = function(inOne,inTwo,outThree) {
    outThree.simdData = SIMD.Float64x2.mul(inOne.simdData,SIMD.Float64x2.splat(inTwo));
};

SIMDVector2.dot = function(inOne,inTwo) {
    this.l = SIMD.Float64x2.mul(inOne.simdData,inTwo.simdData);
    return SIMD.Float64x2.extractLane(this.l,0) + SIMD.Float64x2.extractLane(this.l,1);
};

SIMDVector2.distance = function(inOne,inTwo) {
    this.l = SIMD.Float64x2.sub(inOne.simdData,inTwo.simdData);
    this.l = SIMD.Float64x2.mul(this.l,this.l);
    return Math.sqrt(SIMD.Float64x2.extractLane(this.l,0) + SIMD.Float64x2.extractLane(this.l,1));
};

SIMDVector2.distanceSquared = function(inOne,inTwo) {
    this.l = SIMD.Float64x2.sub(inOne.simdData,inTwo.simdData);
    this.l = SIMD.Float64x2.mul(this.l,this.l);
    return SIMD.Float64x2.extractLane(this.l,0) + SIMD.Float64x2.extractLane(this.l,1);
};
//SIMDVector3########################################################################################
/**
 * Creates a three component vector.
 */
function SIMDVector3(x,y,z) {

    this.simdData = SIMD.Float32x4(x,y,z,0);
    this.taData = new Float32Array([x,y,z]);
    this.l;
}

Object.defineProperty(SIMDVector3.prototype,"data",{
    get: function() {
        this.taData[0] = SIMD.Float32x4.extractLane(this.simdData,0);
        this.taData[1] = SIMD.Float32x4.extractLane(this.simdData,1);
        this.taData[2] = SIMD.Float32x4.extractLane(this.simdData,2);
        return this.taData;
    }
});

Object.defineProperty(SIMDVector3.prototype,"x",{
    get: function() {return SIMD.Float32x4.extractLane(this.simdData,0);},
    set: function(input) { this.simdData = SIMD.Float32x4.replaceLane(this.simdData,0,input); }
});

Object.defineProperty(SIMDVector3.prototype,"y",{
    get: function() {return SIMD.Float32x4.extractLane(this.simdData,1);},
    set: function(input) { this.simdData = SIMD.Float32x4.replaceLane(this.simdData,1,input); }
});
Object.defineProperty(SIMDVector3.prototype,"z",{
    get: function() {return SIMD.Float32x4.extractLane(this.simdData,2);},
    set: function(input) { this.simdData = SIMD.Float32x4.replaceLane(this.simdData,2,input); }
});

Object.defineProperty(SIMDVector3.prototype,"length",{
    get: function() {
        this.l = SIMD.Float32x4.mul(this.simdData,this.simdData);
        return Math.sqrt(
            SIMD.Float32x4.extractLane(this.l,0) +
            SIMD.Float32x4.extractLane(this.l,1) +
            SIMD.Float32x4.extractLane(this.l,2)
        );
    }
});

Object.defineProperty(SIMDVector3.prototype,"lengthSquared",{
    get: function() {
        this.l = SIMD.Float32x4.mul(this.simdData,this.simdData);
        return SIMD.Float32x4.extractLane(this.l,0) +
            SIMD.Float32x4.extractLane(this.l,1) +
            SIMD.Float32x4.extractLane(this.l,2);
    }
});

SIMDVector3.prototype.toString = function() {
    return this.simdData.toString();
};

SIMDVector3.prototype.set = function(inSIMDVector) {
    this.simdData = SIMD.Float32x4.check(inSIMDVector.simdData);
    return this.simdData;
};

SIMDVector3.prototype.normalize = function() {
    this.simdData = SIMD.Float32x4.div(this.simdData,SIMD.Float32x4.splat(this.length));
    return this.simdData;
};

SIMDVector3.prototype.scale = function(input) {
    this.simdData = SIMD.Float32x4.mul(this.simdData,SIMD.Float32x4.splat(input));
    return this.simdData;
};

SIMDVector3.prototype.add = function(input) {
    this.simdData = SIMD.Float32x4.add(this.simdData,input.simdData);
    return this.simdData;
};

SIMDVector3.prototype.subtract = function(input) {
    this.simdData = SIMD.Float32x4.sub(this.simdData,input.simdData);
    return this.simdData;
};

SIMDVector3.prototype.multiply = function(input) {
    this.simdData = SIMD.Float32x4.mul(this.simdData,input.simdData);
    return this.simdData;
};


SIMDVector3.add = function(inOne,inTwo,outThree) {
    outThree.simdData = SIMD.Float32x4.add(inOne.simdData,inTwo.simdData);
};

SIMDVector3.subtract = function(inOne,inTwo,outThree) {
    outThree.simdData = SIMD.Float32x4.sub(inOne.simdData,inTwo.simdData);
};

SIMDVector3.multiply = function(inOne,inTwo,outThree) {
    outThree.simdData = SIMD.Float32x4.mul(inOne.simdData,inTwo.simdData);
};

//intwo: scalar
SIMDVector3.scale = function(inOne,inTwo,outThree) {
    outThree.simdData = SIMD.Float32x4.mul(inOne.simdData,SIMD.Float32x4.splat(inTwo));
};

SIMDVector3.dot = function(inOne,inTwo) {
    this.l = SIMD.Float32x4.mul(inOne.simdData,inTwo.simdData);
    return SIMD.Float32x4.extractLane(this.l,0) +
        SIMD.Float32x4.extractLane(this.l,1) +
        SIMD.Float32x4.extractLane(this.l,2);
};

SIMDVector3.distance = function(inOne,inTwo) {
    this.l = SIMD.Float32x4.sub(inOne.simdData,inTwo.simdData);
    this.l = SIMD.Float32x4.mul(this.l,this.l);
    return Math.sqrt(
        SIMD.Float32x4.extractLane(this.l,0) +
        SIMD.Float32x4.extractLane(this.l,1) +
        SIMD.Float32x4.extractLane(this.l,2)
    );
};

SIMDVector3.distanceSquared = function(inOne,inTwo) {
    this.l = SIMD.Float32x4.sub(inOne.simdData,inTwo.simdData);
    this.l = SIMD.Float32x4.mul(this.l,this.l);
    return SIMD.Float32x4.extractLane(this.l,0) +
        SIMD.Float32x4.extractLane(this.l,1) +
        SIMD.Float32x4.extractLane(this.l,2);
};

SIMDVector3.cross = function(inOne,inTwo,outThree) {
    
    outThree.simdData = SIMD.Float32x4.sub(
        SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(inOne.simdData,1,0,0,3),SIMD.Float32x4.swizzle(inTwo.simdData,2,2,1,3)),
        SIMD.Float32x4.mul(SIMD.Float32x4.swizzle(inOne.simdData,2,2,1,3),SIMD.Float32x4.swizzle(inTwo.simdData,1,0,0,3))
    );
    outThree.simdData = SIMD.Float32x4.replaceLane(outThree.simdData,1,-SIMD.Float32x4.extractLane(outThree.simdData,1));
};


//SIMDVector4########################################################################################
/**
 * Creates a four component vector.
 */
function SIMDVector4(x,y,z,w) {

    this.simdData = SIMD.Float32x4(x,y,z,w);
    this.taData = new Float32Array([x,y,z,w]);
    this.l;
}

Object.defineProperty(SIMDVector4.prototype,"data",{
    get: function() {
        this.taData[0] = SIMD.Float32x4.extractLane(this.simdData,0);
        this.taData[1] = SIMD.Float32x4.extractLane(this.simdData,1);
        this.taData[2] = SIMD.Float32x4.extractLane(this.simdData,2);
        this.taData[3] = SIMD.Float32x4.extractLane(this.simdData,3);
        return this.taData;
    }
});

Object.defineProperty(SIMDVector4.prototype,"x",{
    get: function() {return SIMD.Float32x4.extractLane(this.simdData,0);},
    set: function(input) { this.simdData = SIMD.Float32x4.replaceLane(this.simdData,0,input); }
});

Object.defineProperty(SIMDVector4.prototype,"y",{
    get: function() {return SIMD.Float32x4.extractLane(this.simdData,1);},
    set: function(input) { this.simdData = SIMD.Float32x4.replaceLane(this.simdData,1,input); }
});
Object.defineProperty(SIMDVector4.prototype,"z",{
    get: function() {return SIMD.Float32x4.extractLane(this.simdData,2);},
    set: function(input) { this.simdData = SIMD.Float32x4.replaceLane(this.simdData,2,input); }
});

Object.defineProperty(SIMDVector4.prototype,"w",{
    get: function() {return SIMD.Float32x4.extractLane(this.simdData,3);},
    set: function(input) { this.simdData = SIMD.Float32x4.replaceLane(this.simdData,3,input); }
});

Object.defineProperty(SIMDVector4.prototype,"length",{
    get: function() {
        this.l = SIMD.Float32x4.mul(this.simdData,this.simdData);
        return Math.sqrt(
            SIMD.Float32x4.extractLane(this.l,0) +
            SIMD.Float32x4.extractLane(this.l,1) +
            SIMD.Float32x4.extractLane(this.l,2) +
            SIMD.Float32x4.extractLane(this.l,3)
        );
    }
});

Object.defineProperty(SIMDVector4.prototype,"lengthSquared",{
    get: function() {
        this.l = SIMD.Float32x4.mul(this.simdData,this.simdData);
        return SIMD.Float32x4.extractLane(this.l,0) +
            SIMD.Float32x4.extractLane(this.l,1) +
            SIMD.Float32x4.extractLane(this.l,2) +
            SIMD.Float32x4.extractLane(this.l,3);
    }
});

SIMDVector4.prototype.toString = function() {
    return this.simdData.toString();
};

SIMDVector4.prototype.set = function(inSIMDVector) {
    this.simdData = SIMD.Float32x4.check(inSIMDVector.simdData);
    return this.simdData;
};

SIMDVector4.prototype.normalize = function() {
    this.simdData = SIMD.Float32x4.div(this.simdData,SIMD.Float32x4.splat(this.length));
    return this.simdData;
};

SIMDVector4.prototype.scale = function(input) {
    this.simdData = SIMD.Float32x4.mul(this.simdData,SIMD.Float32x4.splat(input));
    return this.simdData;
};

SIMDVector4.prototype.add = function(input) {
    this.simdData = SIMD.Float32x4.add(this.simdData,input.simdData);
    return this.simdData;
};

SIMDVector4.prototype.subtract = function(input) {
    this.simdData = SIMD.Float32x4.sub(this.simdData,input.simdData);
    return this.simdData;
};

SIMDVector4.prototype.multiply = function(input) {
    this.simdData = SIMD.Float32x4.mul(this.simdData,input.simdData);
    return this.simdData;
};

SIMDVector4.add = function(inOne,inTwo,outThree) {
    outThree.simdData = SIMD.Float32x4.add(inOne.simdData,inTwo.simdData);
};

SIMDVector4.subtract = function(inOne,inTwo,outThree) {
    outThree.simdData = SIMD.Float32x4.sub(inOne.simdData,inTwo.simdData);
};

SIMDVector4.multiply = function(inOne,inTwo,outThree) {
    outThree.simdData = SIMD.Float32x4.mul(inOne.simdData,inTwo.simdData);
};

//intwo: scalar
SIMDVector4.scale = function(inOne,inTwo,outThree) {
    outThree.simdData = SIMD.Float32x4.mul(inOne.simdData,SIMD.Float32x4.splat(inTwo));
};

SIMDVector4.dot = function(inOne,inTwo) {
    this.l = SIMD.Float32x4.mul(inOne.simdData,inTwo.simdData);
    return SIMD.Float32x4.extractLane(this.l,0) +
        SIMD.Float32x4.extractLane(this.l,1) +
        SIMD.Float32x4.extractLane(this.l,2) +
        SIMD.Float32x4.extractLane(this.l,3);
};

SIMDVector4.distance = function(inOne,inTwo) {
    this.l = SIMD.Float32x4.sub(inOne.simdData,inTwo.simdData);
    this.l = SIMD.Float32x4.mul(this.l,this.l);
    return Math.sqrt(
        SIMD.Float32x4.extractLane(this.l,0) +
        SIMD.Float32x4.extractLane(this.l,1) +
        SIMD.Float32x4.extractLane(this.l,2) +
        SIMD.Float32x4.extractLane(this.l,3)
    );
};

SIMDVector4.distanceSquared = function(inOne,inTwo) {
    this.l = SIMD.Float32x4.sub(inOne.simdData,inTwo.simdData);
    this.l = SIMD.Float32x4.mul(this.l,this.l);
    return SIMD.Float32x4.extractLane(this.l,0) +
        SIMD.Float32x4.extractLane(this.l,1) +
        SIMD.Float32x4.extractLane(this.l,2) +
        SIMD.Float32x4.extractLane(this.l,3);
};


//Vector#######################################################################################

function Vector (numberOfCompoenets) {
    
    if(typeof SIMD != "undefined") {
        switch(numberOfCompoenets) {
            case 2:
                return SIMDVector2;
                break;
            case 3:
                return SIMDVector3;
                break;
            case 4:
                return SIMDVector4;
                break;
            default:
                throw new Error('Vectors can only have 2, 3, or 4 components.');
                break;
        }
        
    } else {
        
        switch(numberOfCompoenets) {
            case 2: 
                return TypedArrayVector2;
                break;
            case 3:
                return TypedArrayVector3;
                break;
            case 4:
                return TypedArrayVector4;
                break;
            default:
                throw new Error('Vectors can only have 2, 3, or 4 components.');
                break;
        }
    }

 }


var Vector2 = new Vector(2);
var Vector3 = new Vector(3);
var Vector4 = new Vector(4);