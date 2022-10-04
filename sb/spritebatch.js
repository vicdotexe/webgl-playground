/**
 * An implementation of Microsoft's SpriteBatch in WebGL.
 * @module SpriteBatch
 */

/*
* @license
* 
*                                The MIT License (MIT)

Copyright (c) 2016 Microsoft Corp

Permission is hereby granted, free of charge, to any person obtaining a copy of this 
software and associated documentation files (the "Software"), to deal in the Software 
without restriction, including without limitation the rights to use, copy, modify, 
merge, publish, distribute, sublicense, and/or sell copies of the Software, and to 
permit persons to whom the Software is furnished to do so, subject to the following 
conditions: 

The above copyright notice and this permission notice shall be included in all copies 
or substantial portions of the Software.  

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, 
INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A 
PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT 
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF 
CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE 
OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
*/

/** 
 * Structure that holds info about sprites
 * @constructor
 * @struct
 * @private
 * @param {WebGLTexture} Texture - A texture for the sprite
 * @param {Vector4} Source - (left,top,right,bottom) - The rectangle in texels defining the region to draw on the image.
 * @param {Vector4} Destination -(left,top,right,bottom) The rectangle defining the in screen coordinates of the sprite we are going to draw. 
 * @param {Uint8Array} Color - [r,g,b,a], 0-255
 * @param {Vector4} OriginRotationDepth - (x,y,angleInRadians,depth)
 * @param {Vector2} TextureSize - (width,height)
 */
 function SpriteInfo(Texture,Source,Destination,Color,OriginRotationDepth,TextureSize) {
    this.texture = Texture;
    this.source = Source;
    this.destination = Destination;
    this.color = Color;
    this.originRotationDepth = OriginRotationDepth;
    this.textureSize = TextureSize;
}

/**
 * Enumeration that defines the various sorting modes for sprites in SpriteBatch.
 * @readonly
 * @enum {number}
 */
var SpriteSortMode = {
    /**Sprites are sorted by depth in back to front order before drawing. */
    BackToFront: 0,
    /**Sprites are not drawn until end is called. */
    Deferred: 1,
    /**Sprites are sorted by depth in front to back order before drawing. */
    FrontToBack: 2,
    /**Sprites are drawn immediatly when draw is called */
    Immediate: 3,
    /**Sprites are sorted by texture prior to drawing. Not Implemented. */
    Texture: 4
};

/**
 * Batches sprites for better drawing.
 * @name SpriteBatch
 */
var SpriteBatch = (function() {

    var gl;

    /**@constant {number} */
    var MaxBatchSize = 200;
    /**@constant {number} */
    var MinBatchSize = 20;

    //holds all the sprites that are to be drawn
    var spriteInfoArray;
    
    //holds the number of sprites queued that need to be drawn
    var queueCount;

    //If color is not specified the use this.
    var defaultColor;

    //Holds the sort mode for this sprite batch.
    var spriteSortMode;

    var blendState;

    var shaderProgram;

    var transformMatrix;
 
    var checkIfDepthDefined;
    var checkIfRotationDefined;

    //helper in use in the BackToFront sort algorithm
    var maxDepthValue;

    var vertexShader; 
    var fragmentShader;

    var aPosition;
    var aTextCoord;
    var aColor;
    var aRotation;
    var aOrigin;
    var uniformSamplerLoc;
    var transformMatLoc;
    var viewportSizeLoc;
    
    var vSizeInBytes;

    var positionOffset;
    var textCOffset;
    var colorOffset;
    var rotationOffset;
    var originOffset;

    var vertex;
    var storage;
    var positionView;
    var colorView;
    var vertexBuffer;
    var indices;
    var indexBuffer;

    //keeps track where we are in the vertexBuffer
    var vertexBufferPosition;

    //convenience variables for draw function
    var sx, sy, sz, sw; 

    var sbshaders = {"spriteFrag":"precision mediump float;\r\n\r\nuniform sampler2D uSampler;\r\n\r\nvarying vec4 vColor;\r\nvarying vec2 vTexCoords;\r\n\r\nvoid main() {\r\n\r\n    gl_FragColor = texture2D(uSampler, vTexCoords) * vColor;\r\n    //gl_FragColor = vColor;\r\n}","spriteVertex":"attribute vec2 aPosition;\r\nattribute vec2 aTextCoord;\r\nattribute vec4 aColor;\r\nattribute float aRotation;\r\nattribute vec2 aOrigin;\r\n\r\nuniform mat4 model;\r\nuniform vec2 viewportSize;\r\n\r\nvarying vec2 vTexCoords;\r\nvarying vec4 vColor;\r\n\r\nvoid main() {\r\n\r\n    vec2 pos = aPosition - aOrigin;\r\n    float s = pos.x;\r\n    pos.x = s*cos(aRotation) - pos.y*sin(aRotation);\r\n    pos.y = s*sin(aRotation) + pos.y*cos(aRotation);\r\n    pos += aOrigin;\r\n\r\n\r\n    gl_Position = model * vec4(pos, 0.0, 1.0);\r\n    \r\n\r\n    gl_Position.xy /= viewportSize;\r\n    gl_Position.xy *= vec2(2.0,-2.0);\r\n    gl_Position.xy -= vec2(1.0,-1.0);\r\n\r\n    vTexCoords = aTextCoord;\r\n    vColor = aColor;\r\n    \r\n}" };

    function loadShader(type, shaderSource) {
        var shader = gl.createShader(type);
        gl.shaderSource(shader, shaderSource);
        gl.compileShader(shader);

        if(!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
            console.log(gl.getShaderInfoLog(shader));
            gl.deleteShader(shader);
            throw new Error("UNABLE TO COMPILE SHADER");   
        }
        return shader;
    }

    function flush() {

        sortSprites();

        var bs = 0;
        var bt = null;
        for(var i = 0; i < queueCount; i++) {
            
            if(spriteInfoArray[i].texture != bt) {
                if(i > bs) {
                    
                    renderBatch(bt,bs,i-bs);
                    
                }
                bt = spriteInfoArray[i].texture;
                bs = i;
            }
        }

        renderBatch(bt,bs,queueCount - bs);

        queueCount = 0;

    }

    function prepare() {

        //set shaders
        gl.useProgram(shaderProgram);
        //set blend state
        //gl.blendEquation(blendState);
        //set vertex and index buffer
        gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);

        //describe how the attributes are mapped in the buffer
        gl.vertexAttribPointer(aPosition, 2, gl.FLOAT,false,vSizeInBytes,positionOffset);
        gl.vertexAttribPointer(aTextCoord, 2, gl.FLOAT,false,vSizeInBytes,textCOffset);
        gl.vertexAttribPointer(aColor, 4, gl.UNSIGNED_BYTE,true,vSizeInBytes,colorOffset);
        gl.vertexAttribPointer(aRotation, 1, gl.FLOAT,false,vSizeInBytes,rotationOffset);
        gl.vertexAttribPointer(aOrigin, 2, gl.FLOAT,false,vSizeInBytes,originOffset);
        
        gl.enableVertexAttribArray(aPosition);
        gl.enableVertexAttribArray(aTextCoord);
        gl.enableVertexAttribArray(aColor);
        gl.enableVertexAttribArray(aRotation);
        gl.enableVertexAttribArray(aOrigin);

        gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER,indexBuffer);
        //set the global transformMatrix
        gl.uniformMatrix4fv(transformMatLoc, false, transformMatrix.data);
        //set the viewport size
        gl.uniform2f(viewportSizeLoc, gl.drawingBufferWidth,gl.drawingBufferHeight);

    }

    function renderBatch(texture,startIndex,count) {

        //set the texture
        gl.activeTexture(gl.TEXTURE0);
        gl.bindTexture(gl.TEXTURE_2D, texture);

        gl.uniform1i(uniformSamplerLoc,0);
        
        

        while(count > 0) {

            var batchSize = count;

            var remainingSpace = MaxBatchSize - vertexBufferPosition;

            if(batchSize > remainingSpace) {

                if(remainingSpace < MinBatchSize) {
                    vertexBufferPosition = 0; 
                    batchSize = Math.min(count,MaxBatchSize);
                } else {
                    batchSize = remainingSpace;
                }

            }

            for(var i = 0; i < batchSize; i++) {
                renderSprite(spriteInfoArray[startIndex+i],i);
            }

            gl.drawElements(gl.TRIANGLES,batchSize*6,gl.UNSIGNED_SHORT,vertexBufferPosition*12);
        
            vertexBufferPosition += batchSize;

            count -= batchSize;
            
        }

    }
    
    function renderSprite(sprite,offset) {
            
        //flip y to convert from HTML DOM coords to Webgl coords
        //sprite.source.multiply(1.0/sprite.textureSize.x,1.0/sprite.textureSize.y,1.0/sprite.textureSize.x,1.0/sprite.textureSize.y);
        sprite.source.x *= 1.0/sprite.textureSize.x;
        sprite.source.y *= 1.0/sprite.textureSize.y;
        sprite.source.z *= 1.0/sprite.textureSize.x;
        sprite.source.w *= 1.0/sprite.textureSize.y;

        sprite.source.y = 1.0 - sprite.source.y;
        sprite.source.w = 1.0 - sprite.source.w;

        var c = colorOffset;

        positionView[0] = sprite.destination.x;
        positionView[1] = sprite.destination.y;
        positionView[2] = sprite.source.x;
        positionView[3] = sprite.source.y;
        colorView[c] = sprite.color[0];
        colorView[c+1] = sprite.color[1];
        colorView[c+2] = sprite.color[2];
        colorView[c+3] = sprite.color[3];
        positionView[5] = sprite.originRotationDepth.z;
        positionView[6] = sprite.originRotationDepth.x;
        positionView[7] = sprite.originRotationDepth.y;

        c += vSizeInBytes;

        positionView[8] = sprite.destination.x;
        positionView[9] = sprite.destination.w;
        positionView[10] = sprite.source.x;
        positionView[11] = sprite.source.w;
        colorView[c] = sprite.color[0];
        colorView[c+1] = sprite.color[1];
        colorView[c+2] = sprite.color[2];
        colorView[c+3] = sprite.color[3];
        positionView[13] = sprite.originRotationDepth.z;
        positionView[14] = sprite.originRotationDepth.x;
        positionView[15] = sprite.originRotationDepth.y;

        c += vSizeInBytes;

        positionView[16] = sprite.destination.z;
        positionView[17] = sprite.destination.y;
        positionView[18] = sprite.source.z;
        positionView[19] = sprite.source.y;
        colorView[c] = sprite.color[0];
        colorView[c+1] = sprite.color[1];
        colorView[c+2] = sprite.color[2];
        colorView[c+3] = sprite.color[3];
        positionView[21] = sprite.originRotationDepth.z;
        positionView[22] = sprite.originRotationDepth.x;
        positionView[23] = sprite.originRotationDepth.y;

        c += vSizeInBytes;

        positionView[24] = sprite.destination.z;
        positionView[25] = sprite.destination.w;
        positionView[26] = sprite.source.z;
        positionView[27] = sprite.source.w;
        colorView[c] = sprite.color[0];
        colorView[c+1] = sprite.color[1];
        colorView[c+2] = sprite.color[2];
        colorView[c+3] = sprite.color[3];
        positionView[29] = sprite.originRotationDepth.z;
        positionView[30] = sprite.originRotationDepth.x;
        positionView[31] = sprite.originRotationDepth.y;

        //this.gl.bindBuffer(this.gl.ARRAY_BUFFER,this.vertexBuffer);
        var start = (vertexBufferPosition+offset)*4*vSizeInBytes; //numberOfVerticesPerSprite * bytesPerVertex
        gl.bufferSubData(gl.ARRAY_BUFFER, start, storage);

    }
    
    function sortSprites() {
        switch(spriteSortMode)
        {
            case SpriteSortMode.Texture:
            //not implemented
            break;
            case SpriteSortMode.BackToFront:
                sortBF(spriteInfoArray,queueCount - 1);
            break;
            case SpriteSortMode.FrontToBack:
                sortFB(spriteInfoArray,queueCount - 1);
            break;
        } 

    }

    function sortFB(inArray, end) {
        var x = 0, w = 0, h;
        while(w<end) {
            for(var i = w; i <= end; i++) {
                if(inArray[i].originRotationDepth.w == x) {
                    h = inArray[w];
                    inArray[w++] = inArray[i];
                    inArray[i] = h;
                }
            }
            x++;
        }
    }

    function sortBF(inArray, end) {
        var x = maxDepthValue, w = 0, h;
        while(w<end) {
            for(var i = w; i <= end; i++) {
                if(inArray[i].originRotationDepth.w == x) {
                    h = inArray[w];
                    inArray[w++] = inArray[i];
                    inArray[i] = h;
                }
            }
            x--;
        }

    }


    return {
        /**
         * Initializes all the things.
         * @param {WebGLRenderingcontext} webGLRenderingcontext
         */
        init: function(context) {

            gl = context;
         
            spriteInfoArray = new Array(MaxBatchSize);
            for(var i = 0; i  <MaxBatchSize; i++) {
                spriteInfoArray[i] = new SpriteInfo();
                spriteInfoArray[i].source = new Vector4(0,0,0,0);
                spriteInfoArray[i].destination = new Vector4(0,0,0,0);
                spriteInfoArray[i].color =  new Uint8ClampedArray([0,0,0,0]);
                spriteInfoArray[i].originRotationDepth = new Vector4(0,0,0,0);
                spriteInfoArray[i].textureSize = new Vector2(0,0);
            }

            blendState = gl.FUNC_ADD;

            queueCount = 0;
            vertexBufferPosition = 0;
            maxDepthValue = 0;
            defaultColor = new Uint8Array([255,255,255,255]); 
            spriteSortMode = SpriteSortMode.Deferred;
            transformMatrix = Matrix4.CreateIdentity();
            checkIfDepthDefined = 'depth';
            checkIfRotationDefined = 'rotation';

            //create, load, and check the spritebatch shaders
            vertexShader = loadShader(gl.VERTEX_SHADER, sbshaders.spriteVertex);
            fragmentShader = loadShader(gl.FRAGMENT_SHADER, sbshaders.spriteFrag);
            shaderProgram = gl.createProgram();
            gl.attachShader(shaderProgram, vertexShader);
            gl.attachShader(shaderProgram, fragmentShader);
            gl.linkProgram(shaderProgram);
            if(!gl.getProgramParameter(shaderProgram, gl.LINK_STATUS)) {
                var info = gl.getProgramInfoLog(shaderProgram);
                throw new Error("SHADER ERROR: " + info);
            }

            //get the location id for the input to the shaders
            aPosition = gl.getAttribLocation(shaderProgram, "aPosition");
            aTextCoord = gl.getAttribLocation(shaderProgram, "aTextCoord");
            aColor = gl.getAttribLocation(shaderProgram, "aColor");
            aRotation = gl.getAttribLocation(shaderProgram, "aRotation");
            aOrigin = gl.getAttribLocation(shaderProgram, "aOrigin");
            uniformSamplerLoc = gl.getUniformLocation(shaderProgram, "uSampler");
            transformMatLoc = gl.getUniformLocation(shaderProgram,"model");
            viewportSizeLoc = gl.getUniformLocation(shaderProgram,"viewportSize");

            /* Vertex Buffer Map In Bytes
            --------------------------------------------
            |Position |Texture C|Color  |Rot |Origin   |
            --------------------------------------------
            |x   |y   |t   |s   |R|G|B|A|0   |x   |y   |
            --------------------------------------------
            |   4|   4|   4|   4|1|1|1|1|   4|   4|   4| <= Bytes
            --------------------------------------------

            Total Bytes = 32
            Total Floats = 8

            */

            vSizeInBytes = 32;
            positionOffset = 0;
            textCOffset = 8;
            colorOffset = 16;
            rotationOffset = 20;
            originOffset = 24;

            vertex =  new ArrayBuffer(MaxBatchSize*128); //numberOfSprites * verticesPerSprite  * vertexSizeInBytes
            storage = new ArrayBuffer(128); //Holds data for one sprite.
            positionView = new Float32Array(storage);
            colorView = new Uint8Array(storage);

            vertexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ARRAY_BUFFER, vertexBuffer);
            gl.bufferData(gl.ARRAY_BUFFER, vertex, gl.DYNAMIC_DRAW);

            indices = new Uint16Array(MaxBatchSize*6); //6 = number of indices per sprite
            var inc = 0;
            for(var i = 0; i<indices.length; i += 6) {
                
                indices[i] = inc;
                indices[i+1] = inc + 1;
                indices[i+2] = inc + 2;

                indices[i+3] = inc + 1;
                indices[i+4] = inc + 3;
                indices[i+5] = inc + 2;

                inc += 4;
            }

            indexBuffer = gl.createBuffer();
            gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indexBuffer);
            gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, indices, gl.STATIC_DRAW);
        },
        /**
         * Call this function before calling any draw calls.
         * @param {SpriteSortMode} sortMode
         * @param {blendEquation} blendEquation
         */
        begin: function(sortMode, blendEquation) {
            //TODO:ADD MORE BLENDING CAPABILITIES

            spriteSortMode = sortMode;
            blendState = blendEquation;
            //TODO: depth, stencil raster

            if(spriteSortMode == SpriteSortMode.Immediate) {
                prepare();
            }

        },
        /**
         * Draws a sprite with the specified options.
         * @param {Object} options - Information about how you want to draw your sprite.
         * @param {WebGLTexture} options.texture - If your texture was loaded with spriteBatch.loadSprites, you do not need to set this.
         * @param {Vector2} options.textureSize - (width,height) If your texture was loaded with spriteBatch.loadSprites, you do not need to set this. 
         * @param {Vector4} options.destination - (left,top,right,bottom) or (x,y) destination in screen coordinates.
         * @param {Uint8Array} [options.color] - [r,g,b,a], default color: [255,255,255,255]
         * @param {Vector4} [options.source] - (left,top,right,bottom) Source in texels. (0,0) is top left.
         * If undefined, use whole texture !!!Make sure source size is greater than zero!!!!
         * @param {Vector2} [options.origin]  - (x,y) If undefined, then origin will be upper left corner (0,0) of the sprite.
         * Origin is set relative to the destination rectangle.
         * @param {number} [options.rotation] - Specify an angle in radians.
         * @param {number} [options.depth] - Specify an integer >= 0 to define the drawing order. 
         * @param {Vector2} [options.scale] - (scaleX,scaleY) 
         * 
         * @throws {Error} -Max batch size is too small to add any more sprites. Increase it.
        */
        draw: function(options) {

            if(queueCount >= spriteInfoArray.length) {
                throw new Error("You need to increase the MaxBatchSize.");
            }

            spriteInfoArray[queueCount].texture = options.texture;
            spriteInfoArray[queueCount].textureSize.set(options.textureSize);

            if(options.color) {
                spriteInfoArray[queueCount].color = options.color;
            } else {
                spriteInfoArray[queueCount].color = defaultColor;       
            }
            
            
            
            if(options.source) {
                spriteInfoArray[queueCount].source.set(options.source);
            } else {
                spriteInfoArray[queueCount].source.x = 0;
                spriteInfoArray[queueCount].source.y = 0;
                spriteInfoArray[queueCount].source.z = options.textureSize.x;
                spriteInfoArray[queueCount].source.w = options.textureSize.y;
            }

            if(options.destination.z) {
                spriteInfoArray[queueCount].destination.set(options.destination);
            } else {
                sx = (spriteInfoArray[queueCount].source.z-spriteInfoArray[queueCount].source.x);
                sy = (spriteInfoArray[queueCount].source.w-spriteInfoArray[queueCount].source.y);
                spriteInfoArray[queueCount].destination.x = options.destination.x;
                spriteInfoArray[queueCount].destination.y = options.destination.y;
                spriteInfoArray[queueCount].destination.z = sx+options.destination.x;
                spriteInfoArray[queueCount].destination.w = sy+options.destination.y;
            }

            if(options.scale) {
                sz =  (spriteInfoArray[queueCount].destination.z - options.destination.x)*options.scale.x;
                sw =  (spriteInfoArray[queueCount].destination.w - options.destination.y)*options.scale.y;
                sx = options.destination.x;
                sy = options.destination.y;
                spriteInfoArray[queueCount].destination.x = sx;
                spriteInfoArray[queueCount].destination.y = sy;
                spriteInfoArray[queueCount].destination.z = sx+sz;
                spriteInfoArray[queueCount].destination.w = sy+sw;
            } 

            if(options.origin) {

                sx = options.origin.x;
                sy = options.origin.y;
                
                spriteInfoArray[queueCount].destination.x -= sx;
                spriteInfoArray[queueCount].destination.y -= sy;
                spriteInfoArray[queueCount].destination.z -= sx;
                spriteInfoArray[queueCount].destination.w -= sy;


                sz = spriteInfoArray[queueCount].destination.x;
                sw = spriteInfoArray[queueCount].destination.y;

                spriteInfoArray[queueCount].originRotationDepth.x = sz+sx;
                spriteInfoArray[queueCount].originRotationDepth.y = sw+sy;
                spriteInfoArray[queueCount].originRotationDepth.z = 0;
                spriteInfoArray[queueCount].originRotationDepth.w = 0;
            } 

            if(checkIfRotationDefined in options) {
                spriteInfoArray[queueCount].originRotationDepth.z = options.rotation;       
            }

            if(checkIfDepthDefined in options) {
                spriteInfoArray[queueCount].originRotationDepth.w  = options.depth;

                // find the max depth specified for our sorting algorithm
                if(spriteSortMode == SpriteSortMode.BackToFront) {
                    maxDepthValue = Math.max(maxDepthValue, options.depth);
                } 
            }



            if(spriteSortMode != SpriteSortMode.Immediate) {
                //queue the sprite for sorting and batched drawing
                queueCount++; 
            } else {
                //draw the sprite now!
                renderBatch(options.texture,queueCount, 1);
            }

        },
        /** Call this function after calling all your draw calls. */
        end: function() {
            if(spriteSortMode != SpriteSortMode.Immediate) {
                prepare();
                flush();
            }
        },
        /**
         * Load textures for WebGL. 
         * @param {Array<object>|object} spriteInfo - object.url holds the relative url location(s) of the texture(s) to load
         * @param {function} onload - This callback will be called when all the texture(s) have been loaded.
         * The onload function's parameter will be the loaded WebGLTexture object(s).
        */
        loadSprites: function(spriteInfo,onload) {

            if(Array.isArray(spriteInfo)) {

                var images = [];
                var isLoaded = [];
                for(var i = 0; i < spriteInfo.length; i++, isLoaded.push(false));

                function checkLoading() {
                    if(isLoaded.every(function(e){return e;})) {
                        onload();
                    }
                }

                for(var i = 0; i < spriteInfo.length; i++) {

                    var temp = new Image();
                    temp.src = spriteInfo[i].url;
                    images.push(temp);
                    spriteInfo[i].texture = gl.createTexture();

                    temp.onload = function(e) {

                        //see if the spriteInfo array contains the image we are loading
                        var index = -1;
                        for(var j = 0; j < spriteInfo.length; j++) {
                            if(spriteInfo[j].url === e.target.src.replace(location.href,"")) {
                                index = j;
                                isLoaded[index] = true;
                            }
                                                    
                        }
                        if(index < 0) {
                            console.log('UNABLE TO LOAD IMAGE: ' + e.target.src);
                            return;
                        }

                        //check to see if we can get the image height and width
                        if(images[index].naturalHeight && images[index].naturalWidth) {
                            spriteInfo[index].textureSize = new Vector2(images[index].naturalWidth,images[index].naturalHeight);                   
                        } else {
                            console.log('UNABLE TO GET IMAGE DIMENSIONS: ' + e.target.src);
                            isLoaded[index] = false;
                            return;
                        }


                        gl.bindTexture(gl.TEXTURE_2D, spriteInfo[index].texture);
                        gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                        gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true); //weird
                        gl.texImage2D(gl.TEXTURE_2D,0, gl.RGBA,gl.RGBA, gl.UNSIGNED_BYTE,images[index]);  //conversion requires pixel reformatting??
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                        gl.bindTexture(gl.TEXTURE_2D,null);

                        
                        

                        checkLoading();
                    };
                }   
            } else {

                var image = new Image();
                image.src = spriteInfo.url;
                spriteInfo.texture = gl.createTexture();

                image.onload = function() {

                    //check to see if we can get the image height and width
                    if(image.naturalHeight && image.naturalWidth) {
                        spriteInfo.textureSize = new Vector2(image.naturalWidth,image.naturalHeight);                   
                    } else {
                        console.log('UNABLE TO GET IMAGE DIMENSIONS: ' + e.target.src);
                        return;
                    }

                    gl.bindTexture(gl.TEXTURE_2D, spriteInfo.texture);
                    gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, true);
                    gl.pixelStorei(gl.UNPACK_PREMULTIPLY_ALPHA_WEBGL,true); //weird
                    gl.texImage2D(gl.TEXTURE_2D,0, gl.RGBA,gl.RGBA, gl.UNSIGNED_BYTE,image);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
                    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
                    gl.bindTexture(gl.TEXTURE_2D,null);

                    onload();
                };
            }

        },
        /**
         * Utility function that reduces many sprites into one sprite. It saves draw calls.
         * 
         * @param {Vector4} rectangle - (left,top,right,bottom)
         * @param {WebGLTexture} 
        */
        reduce: function(box,texture) {
            var width = box.x - box.z;
            var height = box.y - box.bottom;
            var data = new Uint8Array(width*height*4);

            box.y = gl.drawingBufferHeight - box.y;

            gl.readPixels(box.x,box.y,width,height,gl.RGBA,gl.UNSIGNED_BYTE,data);
            gl.bindTexture(gl.TEXTURE_2D,texture);
            gl.pixelStorei(gl.UNPACK_FLIP_Y_WEBGL, false);
            gl.texImage2D(tgl.TEXTURE_2D,0,gl.RGBA,width,height,0,gl.RGBA,gl.UNSIGNED_BYTE,data);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
            gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
            gl.bindTexture(gl.TEXTURE_2D,null);

            return texture;

        }
    }

})();