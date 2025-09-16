// Minimal THREE.js implementation for fallback when CDN is unavailable
// This provides basic functionality to allow the game to run

window.THREE = {
    // Basic scene management
    Scene: function() {
        this.children = [];
        this.add = function(object) { this.children.push(object); };
        this.remove = function(object) { 
            const index = this.children.indexOf(object);
            if (index > -1) this.children.splice(index, 1);
        };
        this.traverse = function(callback) {
            callback(this);
            this.children.forEach(child => {
                if (child.traverse) child.traverse(callback);
            });
        };
    },
    
    // Basic camera
    PerspectiveCamera: function(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Euler();
        this.updateProjectionMatrix = function() {};
        this.getWorldDirection = function(target) {
            // Simple implementation for raycast direction
            target = target || new THREE.Vector3();
            target.set(0, 0, -1);
            return target;
        };
    },
    
    // WebGL Renderer stub
    WebGLRenderer: function(options) {
        options = options || {};
        
        // Use provided canvas or create one
        if (options.canvas) {
            this.domElement = options.canvas;
        } else {
            this.domElement = document.createElement('canvas');
        }
        
        this.domElement.width = options.width || 800;
        this.domElement.height = options.height || 600;
        
        // Try to get WebGL context, fallback to 2D
        this.gl = this.domElement.getContext('webgl') || 
                  this.domElement.getContext('experimental-webgl');
        
        if (!this.gl) {
            // Fallback to 2D context
            this.context = this.domElement.getContext('2d');
            this.isWebGL = false;
            console.log('WebGL not available, using 2D canvas fallback');
        } else {
            this.isWebGL = true;
            console.log('WebGL context created successfully');
        }
        
        this.setSize = function(width, height) {
            this.domElement.width = width;
            this.domElement.height = height;
            if (this.gl) {
                this.gl.viewport(0, 0, width, height);
            }
        };
        
        this.setClearColor = function(color) {
            this.clearColor = color;
        };
        
        this.render = function(scene, camera) {
            if (this.isWebGL && this.gl) {
                // Simple WebGL clear
                const r = ((this.clearColor || 0x87CEEB) >> 16 & 255) / 255;
                const g = ((this.clearColor || 0x87CEEB) >> 8 & 255) / 255;
                const b = ((this.clearColor || 0x87CEEB) & 255) / 255;
                this.gl.clearColor(r, g, b, 1.0);
                this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
            } else if (this.context) {
                // Simple 2D rendering fallback
                this.context.fillStyle = '#87CEEB'; // Sky blue
                this.context.fillRect(0, 0, this.domElement.width, this.domElement.height);
                
                // Draw simple ground
                this.context.fillStyle = '#228B22'; // Green ground
                this.context.fillRect(0, this.domElement.height * 0.8, this.domElement.width, this.domElement.height * 0.2);
                
                // Draw simple text to show it's working
                this.context.fillStyle = '#000000';
                this.context.font = '20px Arial';
                this.context.fillText('Minecraft Clone - Minimal Mode', 10, 30);
                this.context.fillText('World generating...', 10, 60);
            }
        };
        
        // Shadow map stub
        this.shadowMap = {
            enabled: false,
            type: null
        };
    },
    
    // Vector3 implementation
    Vector3: function(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        
        this.set = function(x, y, z) {
            this.x = x; this.y = y; this.z = z;
            return this;
        };
        this.copy = function(v) {
            this.x = v.x; this.y = v.y; this.z = v.z;
            return this;
        };
        this.add = function(v) {
            this.x += v.x; this.y += v.y; this.z += v.z;
            return this;
        };
        this.sub = function(v) {
            this.x -= v.x; this.y -= v.y; this.z -= v.z;
            return this;
        };
        this.multiplyScalar = function(s) {
            this.x *= s; this.y *= s; this.z *= s;
            return this;
        };
        this.length = function() {
            return Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        };
        this.normalize = function() {
            const len = this.length();
            if (len > 0) this.multiplyScalar(1 / len);
            return this;
        };
        this.distanceTo = function(v) {
            const dx = this.x - v.x;
            const dy = this.y - v.y;
            const dz = this.z - v.z;
            return Math.sqrt(dx * dx + dy * dy + dz * dz);
        };
        this.clone = function() {
            return new THREE.Vector3(this.x, this.y, this.z);
        };
        this.applyAxisAngle = function(axis, angle) {
            // Simple rotation around Y axis (most common for player movement)
            if (axis.y === 1) {
                const cos = Math.cos(angle);
                const sin = Math.sin(angle);
                const x = this.x * cos - this.z * sin;
                const z = this.x * sin + this.z * cos;
                this.x = x;
                this.z = z;
            }
            return this;
        };
    },
    
    // Euler implementation (for rotation angles)
    Euler: function(x, y, z, order) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.order = order || 'XYZ';
        
        this.set = function(x, y, z, order) {
            this.x = x;
            this.y = y;
            this.z = z;
            if (order !== undefined) this.order = order;
            return this;
        };
        this.copy = function(euler) {
            this.x = euler.x;
            this.y = euler.y;
            this.z = euler.z;
            this.order = euler.order;
            return this;
        };
        this.clone = function() {
            return new THREE.Euler(this.x, this.y, this.z, this.order);
        };
    },
    
    // Vector2 implementation
    Vector2: function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    },
    
    // Basic geometries (stubs)
    BoxGeometry: function(width, height, depth) {
        this.width = width;
        this.height = height;
        this.depth = depth;
        this.dispose = function() {};
    },
    
    SphereGeometry: function(radius, widthSegments, heightSegments) {
        this.radius = radius;
        this.widthSegments = widthSegments;
        this.heightSegments = heightSegments;
        this.dispose = function() {};
    },
    
    PlaneGeometry: function(width, height) {
        this.width = width;
        this.height = height;
        this.dispose = function() {};
    },
    
    RingGeometry: function(innerRadius, outerRadius, thetaSegments) {
        this.innerRadius = innerRadius;
        this.outerRadius = outerRadius;
        this.thetaSegments = thetaSegments;
        this.dispose = function() {};
    },
    
    // BufferGeometry for mesh generation
    BufferGeometry: function() {
        this.attributes = {};
        this.index = null;
        
        this.setAttribute = function(name, attribute) {
            this.attributes[name] = attribute;
        };
        this.setIndex = function(index) {
            this.index = index;
        };
        this.computeVertexNormals = function() {
            // Stub implementation
        };
        this.dispose = function() {
            // Cleanup stub
        };
    },
    
    // BufferAttribute for geometry data
    BufferAttribute: function(array, itemSize) {
        this.array = array;
        this.itemSize = itemSize;
        this.count = array.length / itemSize;
    },
    
    Float32BufferAttribute: function(array, itemSize) {
        return new THREE.BufferAttribute(new Float32Array(array), itemSize);
    },
    
    Uint16BufferAttribute: function(array, itemSize) {
        return new THREE.BufferAttribute(new Uint16Array(array), itemSize);
    },
    
    // Basic materials (stubs)
    MeshBasicMaterial: function(params) {
        params = params || {};
        this.color = params.color || 0xffffff;
        this.opacity = params.opacity || 1;
        this.transparent = params.transparent || false;
        this.side = params.side || THREE.FrontSide;
        this.dispose = function() {};
    },
    
    MeshLambertMaterial: function(params) {
        params = params || {};
        this.color = params.color || 0xffffff;
        this.opacity = params.opacity || 1;
        this.transparent = params.transparent || false;
        this.side = params.side || THREE.FrontSide;
        this.dispose = function() {};
    },
    
    // Basic mesh
    Mesh: function(geometry, material) {
        this.geometry = geometry;
        this.material = material;
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Euler();
        this.scale = new THREE.Vector3(1, 1, 1);
        this.visible = true;
        this.children = [];
        
        this.add = function(object) { this.children.push(object); };
        this.remove = function(object) {
            const index = this.children.indexOf(object);
            if (index > -1) this.children.splice(index, 1);
        };
        this.traverse = function(callback) {
            callback(this);
            this.children.forEach(child => {
                if (child.traverse) child.traverse(callback);
            });
        };
    },
    
    // Lighting stubs
    AmbientLight: function(color, intensity) {
        this.color = color;
        this.intensity = intensity;
    },
    
    DirectionalLight: function(color, intensity) {
        this.color = color;
        this.intensity = intensity;
        this.position = new THREE.Vector3();
        this.target = { position: new THREE.Vector3() };
        this.castShadow = false;
        this.shadow = {
            mapSize: { width: 1024, height: 1024 },
            camera: {
                near: 0.5,
                far: 500,
                left: -10,
                right: 10,
                top: 10,
                bottom: -10
            }
        };
    },
    
    // Raycaster for mouse picking
    Raycaster: function() {
        this.ray = {
            origin: new THREE.Vector3(),
            direction: new THREE.Vector3()
        };
        this.setFromCamera = function(mouse, camera) {
            // Simple stub implementation
        };
        this.intersectObjects = function(objects, recursive) {
            return []; // Return empty for fallback
        };
    },
    
    // Constants
    FrontSide: 0,
    BackSide: 1,
    DoubleSide: 2,
    PCFSoftShadowMap: 1,
    
    // Color utility
    Color: function(color) {
        if (typeof color === 'string') {
            // Simple hex color parsing
            this.r = parseInt(color.substring(1, 3), 16) / 255;
            this.g = parseInt(color.substring(3, 5), 16) / 255;
            this.b = parseInt(color.substring(5, 7), 16) / 255;
        } else {
            this.r = ((color >> 16) & 255) / 255;
            this.g = ((color >> 8) & 255) / 255;
            this.b = (color & 255) / 255;
        }
        
        this.setHex = function(hex) {
            this.r = ((hex >> 16) & 255) / 255;
            this.g = ((hex >> 8) & 255) / 255;
            this.b = (hex & 255) / 255;
            return this;
        };
    },
    
    // Clock for timing
    Clock: function() {
        this.oldTime = Date.now();
        
        this.getDelta = function() {
            const newTime = Date.now();
            const delta = (newTime - this.oldTime) / 1000;
            this.oldTime = newTime;
            return delta;
        };
    },
    
    // TextureLoader stub
    TextureLoader: function() {
        this.load = function(url, onLoad, onProgress, onError) {
            // Return a simple texture stub
            const texture = {
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping,
                repeat: { set: function() {} }
            };
            if (onLoad) onLoad(texture);
            return texture;
        };
    },
    
    // Texture wrapping constants
    RepeatWrapping: 1000
};

// Simple noise implementation fallback
window.SimplexNoise = function() {
    // Permutation table for noise generation
    this.p = [];
    for(let i = 0; i < 256; i++) {
        this.p[i] = Math.floor(Math.random() * 256);
    }
    // Duplicate for overflow handling
    for(let i = 0; i < 512; i++) {
        this.p[i] = this.p[i & 255];
    }
    
    this.noise2D = function(x, y) {
        // Optimized 2D noise implementation
        try {
            // Simple hash-based noise
            const xi = Math.floor(x) & 255;
            const yi = Math.floor(y) & 255;
            const xf = x - Math.floor(x);
            const yf = y - Math.floor(y);
            
            const u = this.fade(xf);
            const v = this.fade(yf);
            
            const n00 = this.grad2(this.p[xi + this.p[yi]], xf, yf);
            const n01 = this.grad2(this.p[xi + this.p[yi + 1]], xf, yf - 1);
            const n10 = this.grad2(this.p[xi + 1 + this.p[yi]], xf - 1, yf);
            const n11 = this.grad2(this.p[xi + 1 + this.p[yi + 1]], xf - 1, yf - 1);
            
            const x1 = this.lerp(u, n00, n10);
            const x2 = this.lerp(u, n01, n11);
            
            return this.lerp(v, x1, x2);
        } catch (error) {
            console.warn('SimplexNoise.noise2D error:', error);
            // Fallback to basic noise
            return (Math.sin(x * 12.9898) + Math.cos(y * 78.233)) * 0.5;
        }
    };
    
    this.noise3D = function(x, y, z) {
        try {
            // Simple 3D noise - combines 2D noise for different planes
            return (this.noise2D(x, y) + this.noise2D(y, z) + this.noise2D(x, z)) / 3.0;
        } catch (error) {
            console.warn('SimplexNoise.noise3D error:', error);
            // Fallback to basic noise
            return (Math.sin(x * 12.9898) + Math.cos(y * 78.233) + Math.sin(z * 37.719)) * 0.33;
        }
    };
    
    this.fade = function(t) {
        return t * t * t * (t * (t * 6 - 15) + 10);
    };
    
    this.lerp = function(t, a, b) {
        return a + t * (b - a);
    };
    
    this.grad2 = function(hash, x, y) {
        const h = hash & 3;
        return ((h & 1) ? -x : x) + ((h & 2) ? -y : y);
    };
};

console.log('THREE.js minimal fallback loaded');