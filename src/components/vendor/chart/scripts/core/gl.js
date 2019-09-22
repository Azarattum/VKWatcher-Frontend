export default class GL {
    /**
     * Creates GL object.
     * @param {Element} canvas Canvas element.
     * @param {ShadersProgram} program Vertex & Fragment shaders program.
     */
    constructor(canvas, program = null) {
        //GL Initializing
        this.canvas = canvas;
        this.gl = canvas.getContext("webgl", {
            alpha: false,
            premultipliedAlpha: false
        }) || canvas.getContext("experimental-webgl", {
            alpha: false,
            premultipliedAlpha: false
        }) || canvas.getContext("moz-webgl", {
            alpha: false,
            premultipliedAlpha: false
        }) || canvas.getContext("webkit-3d", {
            alpha: false,
            premultipliedAlpha: false
        });

        this.currentProgram = 0;
        this.programsBuffer = [];
        if (program != null) {
            this.newProgram(program);
        }

        this.attributes = new Proxy([], {
            set: (obj, name, value) => {
                const program = this.programsBuffer[this.currentProgram];
                let attribute = program.attributeBuffer[program.currentStack].find(x => x.name == name);
                let type = program.attributes[name];
                if (type == undefined) {
                    console.warn(new Error("Attribute " + name + " does not exist in shader program!"));
                    return;
                }
                if (attribute != undefined) {
                    attribute.update(value);
                } else {
                    program.attributeBuffer[program.currentStack].push(
                        new Attrubute(this.gl, program.program, type, name, value)
                    );
                }
                return true;
            },
            get: (obj, name) => {
                const program = this.programsBuffer[this.currentProgram];
                let attribute = program.attributeBuffer[program.currentStack].find(x => x.name == name);
                if (attribute == undefined) return undefined;
                return attribute.value;
            }
        });

        this.uniforms = new Proxy([], {
            set: (obj, name, value) => {
                const program = this.programsBuffer[this.currentProgram];
                let uniform = program.uniformBuffer.find(x => x.name == name);
                let type = program.uniforms[name];
                if (type == undefined) {
                    console.warn(new Error("Uniform " + name + " does not exist in shader program!"));
                    return;
                }
                if (uniform != undefined) {
                    uniform.update(value);
                } else {
                    program.uniformBuffer.push(
                        new Uniform(this.gl, program.program, type, name, value)
                    );
                }
                return true;
            },
            get: (obj, name) => {
                const program = this.programsBuffer[this.currentProgram];
                let uniform = program.uniformBuffer.find(x => x.name == name);
                if (uniform == undefined) return undefined;
                return uniform.value;
            }
        });

        this.gl.clearColor(0., 0., 0., 0.);
        this.gl.enable(this.gl.BLEND);
        this.gl.disable(this.gl.DEPTH_TEST)
        this.gl.disable(this.gl.CULL_FACE)
        this.gl.blendFuncSeparate(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA,
            this.gl.ONE, this.gl.ONE_MINUS_SRC_ALPHA);

        this.resize();
    }

    //#region Properties
    /**
     * Sets current stack.
     */
    set stack(value) {
        const program = this.programsBuffer[this.currentProgram];
        if (value >= 0 && value < program.attributeBuffer.length)
            program.currentStack = value;

        for (const attribute of program.attributeBuffer[program.currentStack]) {
            attribute.bind();
        }

        if (program.indexBuffer[program.currentStack]) {
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, program.indexBuffer[program.currentStack]);
        }
    }

    /**
     * Returns current stack id.
     */
    get stack() {
        const program = this.programsBuffer[this.currentProgram];
        return program.currentStack;
    }

    /**
     * Sets current program as current.
     */
    set program(value) {
        if (value >= 0 && value < this.programsBuffer.length)
            this.currentProgram = value;

        this.programsBuffer[this.currentProgram].use();
    }

    /**
     * Returns current program id.
     */
    get program() {
        return this.currentProgram;
    }

    set background(color) {
        if (!color) return;
        this.clearColor = color.toArray();
        this.gl.clearColor(this.clearColor[0], this.clearColor[1], this.clearColor[2], this.clearColor[3]);
    }

    set indices(indices) {
        this.programsBuffer[this.currentProgram].indices = indices;
    }
    //#endregion

    //#region Public methods
    /**
     * Creates a new shders program.
     */
    newProgram(program) {
        program.attach(this.gl);
        this.programsBuffer.push(program);
        this.currentProgram = this.programsBuffer.length - 1;
        return this.currentProgram;
    }

    /**
     * Creates a new stack.
     */
    newStack() {
        const program = this.programsBuffer[this.currentProgram];
        if (program.attributeBuffer[program.currentStack].length == 0) {
            return program.currentStack;
        }
        program.attributeBuffer.push([]);
        program.currentStack = program.attributeBuffer.length - 1;
        return program.currentStack;
    }

    resize(width = this.canvas.clientWidth, height = this.canvas.clientHeight) {
        this.viewport = {
            width: width * window.devicePixelRatio,
            height: height * window.devicePixelRatio
        }
        this.canvas.width = this.viewport.width;
        this.canvas.height = this.viewport.height;
        this.gl.viewport(0, 0, this.viewport.width, this.viewport.height);
    }

    clear() {
        this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    }

    //#region Drawing functions
    drawStrip(count, offset = 0) {
        this.gl.drawArrays(this.gl.LINE_STRIP, offset, count - offset);
    }

    drawTriangles(count, offset = 0) {
        this.gl.drawArrays(this.gl.TRIANGLES, offset, count - offset);
    }

    drawPoints(count, offset = 0) {
        this.gl.drawArrays(this.gl.POINTS, offset, count - offset);
    }

    drawShape(count, offset = 0) {
        this.gl.drawArrays(this.gl.TRIANGLE_STRIP, offset, count - offset);
    }

    drawCircle(count, offset = 0) {
        this.gl.drawArrays(this.gl.TRIANGLE_FAN, offset, count - offset);
    }

    drawElements(count, offset = 0) {
        this.gl.drawElements(this.gl.TRIANGLES, count - offset, this.gl.UNSIGNED_SHORT, offset * 2);
    }
    //#endregion
    //#endregion
}

class Attrubute {
    constructor(gl, program, type, name, value) {
        this.gl = gl;
        this.type = type;
        this.buffer = gl.createBuffer();
        this.name = name;
        this.value = value;
        this.program = program;

        switch (type) {
            case gl.FLOAT:
                this.pointerSize = 1;
                this.pointerType = gl.FLOAT;
                break;
            case gl.FLOAT_VEC2:
                this.pointerSize = 2;
                this.pointerType = gl.FLOAT;
                break;
            case gl.FLOAT_VEC3:
                this.pointerSize = 3;
                this.pointerType = gl.FLOAT;
                break;
            case gl.FLOAT_VEC4:
                this.pointerSize = 4;
                this.pointerType = gl.FLOAT;
                break;
            case gl.FLOAT_MAT2:
                this.pointerSize = 2;
                this.pointerType = gl.FLOAT;
                break;
            case gl.FLOAT_MAT3:
                this.pointerSize = 3;
                this.pointerType = gl.FLOAT;
                break;
            case gl.FLOAT_MAT4:
                this.pointerSize = 4;
                this.pointerType = gl.FLOAT;
                break;

            default:
                throw new Error("Unknown attribute type " + type + "!");
        }

        this.bind();
        gl.bufferData(gl.ARRAY_BUFFER, new Float32Array(value), gl.STATIC_DRAW);
    }

    update(value) {
        this.value = value;

        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(value), this.gl.STATIC_DRAW);
    }

    bind() {
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.buffer);
        let location = this.gl.getAttribLocation(this.program, this.name);
        this.gl.vertexAttribPointer(location, this.pointerSize, this.pointerType, false, 0, 0);
        this.gl.enableVertexAttribArray(location);
    }
}

class Uniform {
    constructor(gl, program, type, name, value) {
        this.gl = gl;
        this.name = name;
        this.value = value;
        this.location = gl.getUniformLocation(program, name);
        switch (type) {
            case gl.FLOAT:
                this.function = this.gl.uniform1fv;
                break;
            case gl.FLOAT_VEC2:
                this.function = gl.uniform2fv;
                break;
            case gl.FLOAT_VEC3:
                this.function = gl.uniform3fv;
                break;
            case gl.FLOAT_VEC4:
                this.function = gl.uniform4fv;
                break;
            case gl.FLOAT_MAT2:
                this.function = (location, value) => {
                    gl.uniformMatrix2fv(location, false, value);
                };
                break;
            case gl.FLOAT_MAT3:
                this.function = (location, value) => {
                    gl.uniformMatrix3fv(location, false, value);
                };
                break;
            case gl.FLOAT_MAT4:
                this.function = (location, value) => {
                    gl.uniformMatrix4fv(location, false, value);
                };
                break;
            case gl.INT:
                this.function = gl.uniform1iv;
                break;
            case gl.INT_VEC2:
                this.function = gl.uniform2iv;
                break;
            case gl.INT_VEC3:
                this.function = gl.uniform3iv;
                break;
            case gl.INT_VEC4:
                this.function = gl.uniform4iv;
                break;
            case gl.SAMPLER_2D:
                this.function = gl.uniform1iv;
                break;
            case gl.SAMPLER_CUBE:
                this.function = gl.uniform1iv;
                break;
            case gl.BOOL:
                this.function = gl.uniform1iv;
                break;
            case gl.BOOL_VEC2:
                this.function = gl.uniform2iv;
                break;
            case gl.BOOL_VEC3:
                this.function = gl.uniform3iv;
                break;
            case gl.BOOL_VEC4:
                this.function = gl.uniform4iv;
                break;

            default:
                throw new Error("Unknown uniform type " + type + "!");
        }

        this.update(value);
    }

    update(value) {
        this.value = value;

        if (!Array.isArray(value) && !(value instanceof Float32Array)) {
            value = [value];
        }
        this.function.call(this.gl, this.location, value);
    }
}

export class Shader {
    constructor(code, type) {
        this.code = code;
        this.type = type;
        this.shader = null;
        this.gl = null;
        this.program = null;

        this._changed = false;
    }

    set variables(variables) {
        //Process "repeat" statement
        let offset = 0;
        do {
            const repeat = /^\s*\/\*\/\s*repeat\s+([0-9a-zA-Z]+)\s*\/\*\/\r?\n([^\n]*)/m;
            const result = this.code.substr(offset).match(repeat);
            if (!result) break;
            const length = result[0].length;
            const count = +parse(result[1], false);
            const statement = result[2];

            if (!Number.isInteger(count)) {
                throw new Error("Compilation failed! Iterator must be an integer!")
            }

            let compiled = [];
            for (let i = 0; i < count; i++) {
                variables.i = i;
                compiled.push(parse(statement, true));
            }
            delete variables.i;

            this.code = this.code.slice(0, result.index + offset + 1) +
                compiled.join("\n") + this.code.slice(result.index + offset + length);
            offset = result.index + 1;
        }
        while (true)
        //Process left variables
        this.code = parse(this.code, true);

        function parse(string, wrapped) {
            for (const variable in variables) {
                let exp = variable;
                if (wrapped) {
                    exp = "\\/\\*\\/\\s*" + exp + "\\s*\\/\\*\\/";
                }

                string = string.replace(new RegExp(exp, "g"), variables[variable]);
            }
            return string;
        }
    }

    attach(gl, program) {
        this.gl = gl;
        this.program = program;

        this.compile();
        gl.attachShader(program, this.shader);
    }

    update() {
        if (this.gl == null || this, program == null) {
            throw new Error("Shader is not attached!");
        }

        this.compile();
        this.gl.linkProgram(this.program);
    }

    compile() {
        if (this.shader != null && !this._changed) return;
        if (this.gl == null) {
            throw new Error("Shader is not attached!");
        }

        this.shader = this.gl.createShader(this.type);
        this.gl.shaderSource(this.shader, this.code);
        this.gl.compileShader(this.shader);
    }

    static get types() {
        return Object.freeze({
            "VERTEX": WebGLRenderingContext.VERTEX_SHADER,
            "FRAGMENT": WebGLRenderingContext.FRAGMENT_SHADER
        });
    }
}

export class ShadersProgram {
    constructor(vertex, fragment) {
        this.attributes = [];
        this.uniforms = [];
        this.vertex = vertex;
        this.fragment = fragment;
        this.gl = null;
        this.program = null;
        this.uniformBuffer = [];
        this.attributeBuffer = [
            []
        ];
        this.indexBuffer = [];
        this.currentStack = 0;
    }

    set indices(indices) {
        if (this.indexBuffer.length <= this.currentStack) {
            this.indexBuffer[this.currentStack] = this.gl.createBuffer();
            this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer[this.currentStack]);
        }

        if (!(indices instanceof Uint16Array)) {
            indices = new Uint16Array(indices);
        }

        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, indices, this.gl.STATIC_DRAW);
    }

    attach(gl) {
        if (this.gl == gl) return;
        this.gl = gl;
        this.program = gl.createProgram();
        this.vertex.attach(gl, this.program);
        this.fragment.attach(gl, this.program);

        gl.linkProgram(this.program);

        this.attributes = [];
        let attributesCount = gl.getProgramParameter(this.program, gl.ACTIVE_ATTRIBUTES);
        for (let i = 0; i < attributesCount; i++) {
            let attribute = gl.getActiveAttrib(this.program, i);
            this.attributes[attribute.name] = attribute.type;
        }

        this.uniforms = [];
        let uniformsCount = gl.getProgramParameter(this.program, gl.ACTIVE_UNIFORMS);
        for (let i = 0; i < uniformsCount; i++) {
            let uniform = gl.getActiveUniform(this.program, i);
            this.uniforms[uniform.name.replace(/[[][0-9]+]$/g, "")] = uniform.type;
        }
    }

    use() {
        if (this.gl == null) {
            throw new Error("Program is not attached!");
        }

        this.gl.useProgram(this.program);
    }
}