// Minimal THREE.js implementation for fallback when CDN is unavailable
// This provides basic functionality to allow the game to run

// Basic mathematical objects first
function Vector3(x, y, z) {
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
    this.clone = function() {
        return new Vector3(this.x, this.y, this.z);
    };
    this.add = function(v) {
        this.x += v.x; this.y += v.y; this.z += v.z;
        return this;
    };
    this.multiplyScalar = function(s) {
        this.x *= s; this.y *= s; this.z *= s;
        return this;
    };
    this.normalize = function() {
        const length = Math.sqrt(this.x * this.x + this.y * this.y + this.z * this.z);
        if (length > 0) {
            this.x /= length; this.y /= length; this.z /= length;
        }
        return this;
    };
}

function Euler(x, y, z, order) {
    this.x = x || 0;
    this.y = y || 0;
    this.z = z || 0;
    this.order = order || 'XYZ';
    
    this.set = function(x, y, z, order) {
        this.x = x; this.y = y; this.z = z;
        this.order = order || this.order;
        return this;
    };
}

function Vector2(x, y) {
    this.x = x || 0;
    this.y = y || 0;
}

function Raycaster() {
    this.ray = {
        origin: new Vector3(),
        direction: new Vector3()
    };
    
    this.set = function(origin, direction) {
        this.ray.origin.copy(origin);
        this.ray.direction.copy(direction);
    };
    
    this.intersectObjects = function(objects) {
        return []; // Simple fallback
    };
}

// Now define the main THREE object
window.THREE = {
    // Expose constructors
    Vector3: Vector3,
    Vector2: Vector2,
    Euler: Euler,
    Raycaster: Raycaster,
    
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
        this.fog = null;
    },
    
    // Fog
    Fog: function(color, near, far) {
        this.color = color;
        this.near = near;
        this.far = far;
    },
    
    // Basic camera
    PerspectiveCamera: function(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.position = new Vector3();
        this.rotation = new Euler();
        this.updateProjectionMatrix = function() {};
        this.getWorldDirection = function(target) {
            target = target || new Vector3();
            target.set(0, 0, -1);
            return target;
        };
    },
    
    // WebGL Renderer
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
        
        this.clearColor = 0x87CEEB; // Sky blue default
        
        this.setSize = function(width, height) {
            this.domElement.width = width;
            this.domElement.height = height;
            this.domElement.style.width = width + 'px';
            this.domElement.style.height = height + 'px';
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
                this.context.fillText('Use WASD to move, mouse to look around', 10, 60);
                this.context.fillText('Press E for inventory, C for crafting', 10, 90);
            }
        };
        
        // Shadow map stub
        this.shadowMap = {
            enabled: false,
            type: null
        };
    },
    
    // Basic materials and geometry stubs
    MeshBasicMaterial: function(options) {
        options = options || {};
        this.color = options.color || 0xffffff;
        this.map = options.map || null;
        this.transparent = options.transparent || false;
        this.opacity = options.opacity || 1.0;
    },
    
    MeshLambertMaterial: function(options) {
        options = options || {};
        this.color = options.color || 0xffffff;
        this.map = options.map || null;
        this.transparent = options.transparent || false;
        this.opacity = options.opacity || 1.0;
        this.emissive = options.emissive || 0x000000;
    },
    
    BoxGeometry: function(width, height, depth) {
        this.width = width || 1;
        this.height = height || 1;
        this.depth = depth || 1;
    },
    
    BufferGeometry: function() {
        this.attributes = {};
        this.index = null;
        
        this.setAttribute = function(name, attribute) {
            this.attributes[name] = attribute;
        };
        this.setIndex = function(index) {
            this.index = index;
        };
        this.dispose = function() {
            // Cleanup stub - in real THREE.js this would release WebGL resources
        };
    },
    
    BufferAttribute: function(array, itemSize) {
        this.array = array;
        this.itemSize = itemSize;
        this.count = array.length / itemSize;
    },
    
    Float32BufferAttribute: function(array, itemSize) {
        this.array = new Float32Array(array);
        this.itemSize = itemSize;
        this.count = this.array.length / itemSize;
    },
    
    Uint16BufferAttribute: function(array, itemSize) {
        this.array = new Uint16Array(array);
        this.itemSize = itemSize || 1;
        this.count = this.array.length / this.itemSize;
    },
    
    Mesh: function(geometry, material) {
        this.geometry = geometry;
        this.material = material;
        this.position = new Vector3();
        this.rotation = new Euler();
        this.scale = new Vector3(1, 1, 1);
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
    
    // Clock for timing
    Clock: function() {
        this.startTime = Date.now();
        this.oldTime = this.startTime;
        this.running = false;
        
        this.start = function() {
            this.startTime = Date.now();
            this.oldTime = this.startTime;
            this.running = true;
        };
        
        this.getDelta = function() {
            const newTime = Date.now();
            const delta = (newTime - this.oldTime) / 1000;
            this.oldTime = newTime;
            return delta;
        };
    },
    
    // Texture loader stub
    TextureLoader: function() {
        this.load = function(url, onLoad, onProgress, onError) {
            // Create a simple colored texture as fallback
            const canvas = document.createElement('canvas');
            canvas.width = 64;
            canvas.height = 64;
            const context = canvas.getContext('2d');
            
            // Create a simple pattern based on URL/filename
            const hash = url.split('').reduce((a,b) => {
                a = ((a << 5) - a) + b.charCodeAt(0);
                return a & a;
            }, 0);
            
            const colors = ['#8B4513', '#228B22', '#87CEEB', '#D2B48C', '#696969']; // Brown, Green, Sky Blue, Tan, Gray
            const color = colors[Math.abs(hash) % colors.length];
            
            context.fillStyle = color;
            context.fillRect(0, 0, 64, 64);
            
            // Add simple pattern
            context.fillStyle = '#000000';
            context.fillRect(0, 0, 32, 32);
            context.fillRect(32, 32, 32, 32);
            
            const texture = {
                image: canvas,
                needsUpdate: true,
                wrapS: THREE.RepeatWrapping,
                wrapT: THREE.RepeatWrapping
            };
            
            if (onLoad) onLoad(texture);
            return texture;
        };
    },
    
    // Texture class stub
    Texture: function(image) {
        this.image = image;
        this.needsUpdate = true;
        this.wrapS = THREE.RepeatWrapping;
        this.wrapT = THREE.RepeatWrapping;
    },
    
    // Lighting stubs
    AmbientLight: function(color, intensity) {
        this.color = color || 0xffffff;
        this.intensity = intensity || 1.0;
        this.type = 'AmbientLight';
    },
    
    DirectionalLight: function(color, intensity) {
        this.color = color || 0xffffff;
        this.intensity = intensity || 1.0;
        this.position = new Vector3(0, 1, 0);
        this.target = new Vector3(0, 0, 0);
        this.type = 'DirectionalLight';
        this.castShadow = false;
        this.shadow = {
            mapSize: { width: 1024, height: 1024 },
            camera: {
                near: 0.5,
                far: 50,
                left: -10,
                right: 10,
                top: 10,
                bottom: -10
            }
        };
    },
    
    // Constants
    DoubleSide: 2,
    FrontSide: 0,
    BackSide: 1,
    RepeatWrapping: 1000
};

// Simple noise implementation
window.SimplexNoise = function() {
    // Permutation table for noise generation
    this.p = [];
    for(let i = 0; i < 256; i++) {
        this.p[i] = Math.floor(Math.random() * 256);
    }
    for(let i = 0; i < 256; i++) {
        this.p[256 + i] = this.p[i];
    }
    
    this.noise2D = function(x, y) {
        try {
            // Simple 2D noise implementation
            const X = Math.floor(x) & 255;
            const Y = Math.floor(y) & 255;
            
            x -= Math.floor(x);
            y -= Math.floor(y);
            
            const u = this.fade(x);
            const v = this.fade(y);
            
            const n00 = this.grad2(this.p[X + this.p[Y]], x, y);
            const n01 = this.grad2(this.p[X + this.p[Y + 1]], x, y - 1);
            const n10 = this.grad2(this.p[X + 1 + this.p[Y]], x - 1, y);
            const n11 = this.grad2(this.p[X + 1 + this.p[Y + 1]], x - 1, y - 1);
            
            const x1 = this.lerp(u, n00, n10);
            const x2 = this.lerp(u, n01, n11);
            
            return this.lerp(v, x1, x2);
        } catch (error) {
            console.warn('SimplexNoise.noise2D error:', error);
            return (Math.sin(x * 12.9898) + Math.cos(y * 78.233)) * 0.5;
        }
    };
    
    this.noise3D = function(x, y, z) {
        try {
            return (this.noise2D(x, y) + this.noise2D(y, z) + this.noise2D(x, z)) / 3.0;
        } catch (error) {
            console.warn('SimplexNoise.noise3D error:', error);
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

console.log('THREE.js minimal fallback loaded successfully');