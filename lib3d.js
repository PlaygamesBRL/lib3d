// Classe Vector3 para operações em vetores 3D
class Vector3 {
    constructor(x = 0, y = 0, z = 0) {
        this.x = x;
        this.y = y;
        this.z = z;
    }

    add(v) {
        this.x += v.x;
        this.y += v.y;
        this.z += v.z;
        return this;
    }

    subtract(v) {
        this.x -= v.x;
        this.y -= v.y;
        this.z -= v.z;
        return this;
    }

    multiplyScalar(scalar) {
        this.x *= scalar;
        this.y *= scalar;
        this.z *= scalar;
        return this;
    }

    normalize() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (length > 0) {
            this.x /= length;
            this.y /= length;
            this.z /= length;
        }
        return this;
    }

    toArray() {
        return [this.x, this.y, this.z];
    }

    copy(v) {
        this.x = v.x;
        this.y = v.y;
        this.z = v.z;
        return this;
    }
}

// Classe Matrix4 utilizando mat4 do gl-matrix
class Matrix4 {
    constructor() {
        this.matrix = mat4.create();
    }

    identity() {
        mat4.identity(this.matrix);
        return this;
    }

    translate(v) {
        mat4.translate(this.matrix, this.matrix, v.toArray());
        return this;
    }

    rotateX(angle) {
        mat4.rotateX(this.matrix, this.matrix, angle);
        return this;
    }

    rotateY(angle) {
        mat4.rotateY(this.matrix, this.matrix, angle);
        return this;
    }

    rotateZ(angle) {
        mat4.rotateZ(this.matrix, this.matrix, angle);
        return this;
    }

    scale(v) {
        mat4.scale(this.matrix, this.matrix, v.toArray());
        return this;
    }

    multiply(m) {
        mat4.multiply(this.matrix, this.matrix, m.matrix);
        return this;
    }

    perspective(fov, aspect, near, far) {
        mat4.perspective(this.matrix, fov, aspect, near, far);
        return this;
    }

    lookAt(eye, center, up) {
        mat4.lookAt(this.matrix, eye.toArray(), center.toArray(), up.toArray());
        return this;
    }

    toArray() {
        return this.matrix;
    }
}

// Classe Geometry para definir formas geométricas
class Geometry {
    constructor(gl, vertices, indices) {
        this.gl = gl;
        this.vertices = vertices;
        this.indices = indices;

        this.vertexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.bufferData(this.gl.ARRAY_BUFFER, new Float32Array(this.vertices), this.gl.STATIC_DRAW);

        this.indexBuffer = this.gl.createBuffer();
        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
        this.gl.bufferData(this.gl.ELEMENT_ARRAY_BUFFER, new Uint16Array(this.indices), this.gl.STATIC_DRAW);
    }

    bind(program) {
        const positionLocation = this.gl.getAttribLocation(program, 'aPosition');
        this.gl.bindBuffer(this.gl.ARRAY_BUFFER, this.vertexBuffer);
        this.gl.vertexAttribPointer(positionLocation, 3, this.gl.FLOAT, false, 0, 0);
        this.gl.enableVertexAttribArray(positionLocation);

        this.gl.bindBuffer(this.gl.ELEMENT_ARRAY_BUFFER, this.indexBuffer);
    }
}

// Classe Cube, estendendo Geometry
class Cube extends Geometry {
    constructor(gl, size = 1) {
        const halfSize = size / 2;
        const vertices = [
            // Face frontal
            -halfSize, -halfSize, halfSize,
             halfSize, -halfSize, halfSize,
             halfSize,  halfSize, halfSize,
            -halfSize,  halfSize, halfSize,
            // Face traseira
            -halfSize, -halfSize, -halfSize,
            -halfSize,  halfSize, -halfSize,
             halfSize,  halfSize, -halfSize,
             halfSize, -halfSize, -halfSize,
        ];

        const indices = [
            // Face frontal
            0, 1, 2,  0, 2, 3,
            // Face traseira
            4, 5, 6,  4, 6, 7,
            // Face superior
            3, 2, 6,  3, 6, 5,
            // Face inferior
            0, 4, 7,  0, 7, 1,
            // Face direita
            1, 7, 6,  1, 6, 2,
            // Face esquerda
            0, 3, 5,  0, 5, 4
        ];

        super(gl, vertices, indices);
    }
}

// Classe Sphere, estendendo Geometry
class Sphere extends Geometry {
    constructor(gl, radius = 1, widthSegments = 32, heightSegments = 16) {
        const vertices = [];
        const indices = [];

        for (let y = 0; y <= heightSegments; y++) {
            const theta = y * Math.PI / heightSegments;
            const sinTheta = Math.sin(theta);
            const cosTheta = Math.cos(theta);

            for (let x = 0; x <= widthSegments; x++) {
                const phi = x * 2 * Math.PI / widthSegments;
                const sinPhi = Math.sin(phi);
                const cosPhi = Math.cos(phi);

                const vx = cosPhi * sinTheta;
                const vy = cosTheta;
                const vz = sinPhi * sinTheta;

                vertices.push(radius * vx, radius * vy, radius * vz);

                if (x < widthSegments && y < heightSegments) {
                    const first = y * (widthSegments + 1) + x;
                    const second = first + widthSegments + 1;

                    indices.push(first, second, first + 1);
                    indices.push(second, second + 1, first + 1);
                }
            }
        }

        super(gl, vertices, indices);
    }
}

// Classe Pyramid, estendendo Geometry
class Pyramid extends Geometry {
    constructor(gl, baseSize = 1, height = 1) {
        const halfBase = baseSize / 2;
        const vertices = [
            // Base
            -halfBase, 0,  halfBase,
             halfBase, 0,  halfBase,
             halfBase, 0, -halfBase,
            -halfBase, 0, -halfBase,
            // Vértice superior
            0, height, 0
        ];

        const indices = [
            // Base
            0, 1, 2,  0, 2, 3,
            // Lados
            0, 1, 4,
            1, 2, 4,
            2, 3, 4,
            3, 0, 4
        ];

        super(gl, vertices, indices);
    }
}

class Mesh {
    constructor(geometry, material) {
        this.geometry = geometry;
        this.material = material;
        this.modelMatrix = new Matrix4();
        this.position = new Vector3();
        this.rotation = new Vector3(); // Expondo propriedades de rotação
        this.scale = new Vector3(1, 1, 1);
    }

    setPosition(position) {
        this.position.copy(position);
    }

    setRotation(x, y, z) {
        this.rotation.set(x, y, z);
        this.updateModelMatrix(); // Atualiza a matriz de modelo com a nova rotação
    }

    rotateX(angle) {
        this.rotation.x += angle;
        this.updateModelMatrix();
    }

    rotateY(angle) {
        this.rotation.y += angle;
        this.updateModelMatrix();
    }

    rotateZ(angle) {
        this.rotation.z += angle;
        this.updateModelMatrix();
    }

    setScale(scale) {
        this.scale.copy(scale);
        this.updateModelMatrix();
    }

    updateModelMatrix() {
        this.modelMatrix.identity()
            .translate(this.position)
            .rotateX(this.rotation.x)
            .rotateY(this.rotation.y)
            .rotateZ(this.rotation.z)
            .scale(this.scale);
    }

    draw(gl, camera) {
        this.material.use(gl);

        this.geometry.bind(this.material.program);

        const uModelMatrix = gl.getUniformLocation(this.material.program, 'uModelMatrix');
        const uViewMatrix = gl.getUniformLocation(this.material.program, 'uViewMatrix');
        const uProjectionMatrix = gl.getUniformLocation(this.material.program, 'uProjectionMatrix');

        gl.uniformMatrix4fv(uModelMatrix, false, this.modelMatrix.toArray());
        gl.uniformMatrix4fv(uViewMatrix, false, camera.viewMatrix.toArray());
        gl.uniformMatrix4fv(uProjectionMatrix, false, camera.projectionMatrix.toArray());

        gl.drawElements(gl.TRIANGLES, this.geometry.indices.length, gl.UNSIGNED_SHORT, 0);
    }
}

class Material {
    constructor(gl, vertexShaderSource, fragmentShaderSource) {
        this.gl = gl;

        // Cria e compila shaders
        const vertexShader = this.createShader(gl.VERTEX_SHADER, vertexShaderSource);
        const fragmentShader = this.createShader(gl.FRAGMENT_SHADER, fragmentShaderSource);

        // Cria e vincula o programa
        this.program = this.createProgram(vertexShader, fragmentShader);
    }

    static createBasicShaders(gl) {
        const vertexShaderSource = `
            attribute vec4 aPosition;
            uniform mat4 uModelMatrix;
            uniform mat4 uViewMatrix;
            uniform mat4 uProjectionMatrix;
            void main() {
                gl_Position = uProjectionMatrix * uViewMatrix * uModelMatrix * aPosition;
            }
        `;

        const fragmentShaderSource = `
            precision mediump float;
            uniform vec4 uColor;
            void main() {
                gl_FragColor = uColor;
            }
        `;

        return { vertexShaderSource, fragmentShaderSource };
    }

    createShader(type, source) {
        const shader = this.gl.createShader(type);
        this.gl.shaderSource(shader, source);
        this.gl.compileShader(shader);

        // Verifica erros de compilação
        if (!this.gl.getShaderParameter(shader, this.gl.COMPILE_STATUS)) {
            console.error('Erro na compilação do shader:', this.gl.getShaderInfoLog(shader));
            this.gl.deleteShader(shader); // Deleta o shader se houver erro
            return null;
        }
        return shader;
    }

    createProgram(vertexShader, fragmentShader) {
        const program = this.gl.createProgram();

        // Verifica se os shaders foram criados corretamente
        if (vertexShader === null || fragmentShader === null) {
            console.error('Não é possível criar o programa porque um ou ambos os shaders são inválidos.');
            return null;
        }

        this.gl.attachShader(program, vertexShader);
        this.gl.attachShader(program, fragmentShader);
        this.gl.linkProgram(program);

        // Verifica erros de vinculação
        if (!this.gl.getProgramParameter(program, this.gl.LINK_STATUS)) {
            console.error('Erro na vinculação do programa:', this.gl.getProgramInfoLog(program));
            this.gl.deleteProgram(program); // Deleta o programa se houver erro
            return null;
        }
        return program;
    }

    use() {
        this.gl.useProgram(this.program);
    }

    setColor(r, g, b, a) {
        this.use();
        const colorLocation = this.gl.getUniformLocation(this.program, 'uColor');
        if (colorLocation !== null) {
            this.gl.uniform4f(colorLocation, r, g, b, a);
        } else {
            console.error('Uniform "uColor" não encontrado no programa do shader.');
        }
    }
}

// Classe Camera para controlar a visualização
class Camera {
    constructor() {
        this.viewMatrix = new Matrix4();
        this.projectionMatrix = new Matrix4();
    }

    setPerspective(fov, aspect, near, far) {
        this.projectionMatrix.perspective(fov, aspect, near, far);
    }

    lookAt(eye, center, up) {
        this.viewMatrix.lookAt(eye, center, up);
    }
}

// Classe Scene para gerenciar objetos
class Scene {
    constructor() {
        this.objects = [];
    }

    add(object) {
        this.objects.push(object);
    }

    render(gl, camera) {
        for (let obj of this.objects) {
            obj.draw(gl, camera);
        }
    }
}

// Classe Animation para controlar animações
class Animation {
    constructor(object) {
        this.object = object;
        this.animations = [];
        this.startTime = null;
    }

    addAnimation(property, startValue, endValue, duration, loop = false) {
        this.animations.push({
            property,
            startValue,
            endValue,
            duration,
            loop,
            elapsedTime: 0 // Tempo decorrido desde o início da animação
        });
    }

    start() {
        this.startTime = performance.now();
    }

    update() {
        if (this.startTime === null) return;

        const currentTime = performance.now();
        const elapsedTime = currentTime - this.startTime;

        for (const anim of this.animations) {
            const { property, startValue, endValue, duration, loop } = anim;
            const animationDuration = loop ? Math.max(duration, 1) : duration;
            const progress = Math.min(elapsedTime / animationDuration, 1); // Limita ao valor 1

            if (loop) {
                anim.elapsedTime += elapsedTime - this.startTime;
                const loopProgress = (anim.elapsedTime % duration) / duration;
                if (property === 'rotation') {
                    this.object.rotateX(0.01); // Rotação contínua a uma taxa fixa
                    this.object.rotateY(0.01);
                }
            } else {
                if (property === 'position') {
                    const value = startValue + (endValue - startValue) * progress;
                    this.object.modelMatrix.translate(new Vector3(value, value, value));
                } else if (property === 'rotation') {
                    const value = startValue + (endValue - startValue) * progress;
                    this.object.rotateX(value);
                    this.object.rotateY(value);
                    this.object.rotateZ(value);
                } else if (property === 'scale') {
                    const value = startValue + (endValue - startValue) * progress;
                    this.object.modelMatrix.scale(new Vector3(value, value, value));
                }
            }

            if (!loop && elapsedTime >= duration) {
                this.startTime = null; // Para a animação quando a duração é alcançada
            }
        }
    }
}

// Função chamada quando a biblioteca é carregada
function bibliotecaCarregada() {
    console.log('Biblioteca lib3d.js carregada com sucesso.');
    console.log('Versão: 1.0');
    console.log('Desenvolvedor: Kaique William');
    console.log('Data: 24/agosto/2024');
}

// Função para verificar se as classes e métodos estão definidos
function verificarDefinicao(nome, obj) {
    if (obj === undefined) {
        console.error(`${nome} não está definido.`);
    } else {
        console.log(`${nome} está definido.`);
    }
}

// Verifica se as classes e métodos estão definidos
function verificarBiblioteca() {
    verificarDefinicao('Vector3', Vector3);
    verificarDefinicao('Matrix4', Matrix4);
    verificarDefinicao('Geometry', Geometry);
    verificarDefinicao('Cube', Cube);
    verificarDefinicao('Sphere', Sphere);
    verificarDefinicao('Pyramid', Pyramid);
    verificarDefinicao('Mesh', Mesh);
    verificarDefinicao('Material', Material);
    verificarDefinicao('Camera', Camera);
    verificarDefinicao('Scene', Scene);
    verificarDefinicao('Animation', Animation);

    // Adicione mais verificações conforme necessário
}


// Chama a função para verificar a definição e loga a confirmação quando a biblioteca é carregada
bibliotecaCarregada();
verificarBiblioteca();