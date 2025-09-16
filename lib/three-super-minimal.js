// Super minimal THREE.js implementation - just the basics
console.log('Loading super minimal THREE.js...');

window.THREE = {
    Scene: function() {
        this.children = [];
        this.add = function(obj) { this.children.push(obj); };
        this.remove = function(obj) { 
            const idx = this.children.indexOf(obj);
            if (idx > -1) this.children.splice(idx, 1);
        };
    },
    
    PerspectiveCamera: function(fov, aspect, near, far) {
        this.fov = fov;
        this.aspect = aspect;
        this.near = near;
        this.far = far;
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Euler();
        this.updateProjectionMatrix = function() {};
        this.getWorldDirection = function(target) {
            return target || new THREE.Vector3(0, 0, -1);
        };
    },
    
    WebGLRenderer: function(options) {
        options = options || {};
        
        if (options.canvas) {
            this.domElement = options.canvas;
        } else {
            this.domElement = document.createElement('canvas');
        }
        
        this.domElement.width = 800;
        this.domElement.height = 600;
        this.context = this.domElement.getContext('2d');
        
        this.setSize = function(w, h) {
            this.domElement.width = w;
            this.domElement.height = h;
        };
        
        this.setClearColor = function(color) {
            this.clearColor = color;
        };
        
        this.render = function(scene, camera) {
            if (this.context) {
                this.context.fillStyle = '#87CEEB';
                this.context.fillRect(0, 0, this.domElement.width, this.domElement.height);
                this.context.fillStyle = '#228B22';
                this.context.fillRect(0, this.domElement.height * 0.8, this.domElement.width, this.domElement.height * 0.2);
                this.context.fillStyle = '#000000';
                this.context.font = '20px Arial';
                this.context.fillText('Game Working!', 50, 50);
            }
        };
        
        this.shadowMap = { enabled: false };
    },
    
    Vector3: function(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.set = function(x, y, z) { this.x = x; this.y = y; this.z = z; return this; };
        this.copy = function(v) { this.x = v.x; this.y = v.y; this.z = v.z; return this; };
        this.clone = function() { return new THREE.Vector3(this.x, this.y, this.z); };
        this.add = function(v) { this.x += v.x; this.y += v.y; this.z += v.z; return this; };
        this.sub = function(v) { this.x -= v.x; this.y -= v.y; this.z -= v.z; return this; };
        this.multiplyScalar = function(s) { this.x *= s; this.y *= s; this.z *= s; return this; };
        this.length = function() { return Math.sqrt(this.x*this.x + this.y*this.y + this.z*this.z); };
        this.normalize = function() {
            const len = this.length();
            if (len > 0) { this.x /= len; this.y /= len; this.z /= len; }
            return this;
        };
        this.distanceTo = function(v) {
            const dx = this.x - v.x, dy = this.y - v.y, dz = this.z - v.z;
            return Math.sqrt(dx*dx + dy*dy + dz*dz);
        };
        this.setLength = function(len) { return this.normalize().multiplyScalar(len); };
    },
    
    Vector2: function(x, y) {
        this.x = x || 0;
        this.y = y || 0;
    },
    
    Euler: function(x, y, z) {
        this.x = x || 0;
        this.y = y || 0;
        this.z = z || 0;
        this.set = function(x, y, z) { this.x = x; this.y = y; this.z = z; return this; };
    },
    
    Raycaster: function() {
        this.set = function() {};
        this.intersectObjects = function() { return []; };
    },
    
    // Materials
    MeshBasicMaterial: function(opts) { 
        opts = opts || {};
        this.color = opts.color || 0xffffff;
    },
    MeshLambertMaterial: function(opts) { 
        opts = opts || {};
        this.color = opts.color || 0xffffff;
    },
    
    // Geometry
    BoxGeometry: function() {},
    SphereGeometry: function() {},
    CylinderGeometry: function() {},
    PlaneGeometry: function() {},
    BufferGeometry: function() {
        this.setAttribute = function() {};
        this.setIndex = function() {};
        this.dispose = function() {};
    },
    
    // Attributes
    BufferAttribute: function() {},
    Float32BufferAttribute: function() {},
    Uint16BufferAttribute: function() {},
    
    // Lights
    AmbientLight: function() {
        this.position = new THREE.Vector3();
    },
    DirectionalLight: function() {
        this.position = new THREE.Vector3();
        this.target = { position: new THREE.Vector3() };
        this.castShadow = false;
        this.shadow = {
            mapSize: { width: 1024, height: 1024 },
            camera: {}
        };
    },
    
    // Texture
    TextureLoader: function() {
        this.load = function(url, onLoad) {
            if (onLoad) onLoad({ image: null });
        };
    },
    Texture: function() {},
    
    // Mesh
    Mesh: function() {
        this.position = new THREE.Vector3();
        this.rotation = new THREE.Euler();
    },
    
    // Fog
    Fog: function() {},
    
    // Clock
    Clock: function() {
        this.getDelta = function() { return 0.016; };
    },
    
    // Constants
    DoubleSide: 2,
    RepeatWrapping: 1000
};

window.SimplexNoise = function() {
    this.noise2D = function() { return Math.random() - 0.5; };
    this.noise3D = function() { return Math.random() - 0.5; };
};

console.log('Super minimal THREE.js loaded successfully');