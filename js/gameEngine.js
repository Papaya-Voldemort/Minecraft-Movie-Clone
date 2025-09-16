// Game Engine Core
class GameEngine {
    constructor() {
        console.log('GameEngine constructor started...');
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        console.log('Creating THREE.Raycaster...');
        this.raycaster = new THREE.Raycaster();
        console.log('Creating THREE.Vector2...');
        this.mouse = new THREE.Vector2();
        console.log('Basic objects created successfully');
        
        // Game state
        this.isRunning = false;
        this.isPaused = false;
        this.deltaTime = 0;
        this.lastTime = 0;
        
        // World settings
        this.worldSize = 200;
        this.chunkSize = 16;
        this.maxHeight = 64;
        
        // Block types
        this.blockTypes = {
            AIR: 0,
            DIRT: 1,
            STONE: 2,
            GRASS: 3,
            WOOD: 4,
            LEAVES: 5,
            SAND: 6,
            WATER: 7,
            EMERALD_ORE: 8,
            OBSIDIAN: 9,
            PORTAL: 10
        };
        
        // Materials for different blocks
        this.materials = {};
        console.log('Setting up materials...');
        this.setupMaterials();
        console.log('Materials setup completed');
        
        // World data
        this.world = {};
        this.chunks = new Map();
        this.loadedChunks = new Set();
        
        // Performance settings
        this.renderDistance = 8; // chunks
        this.maxFPS = 60;
        this.frameTime = 1000 / this.maxFPS;
        
        console.log('Initializing renderer...');
        this.initRenderer();
        console.log('Renderer initialized successfully');
        console.log('Setting up event listeners...');
        this.setupEventListeners();
        console.log('GameEngine constructor completed successfully');
    }
    
    initRenderer() {
        // Check if we're in minimal fallback mode
        const isMinimalMode = window.useMinimalFallback || typeof THREE.WebGLRenderer === 'undefined';
        
        // Create scene
        this.scene = new THREE.Scene();
        
        // Add fog only if available
        if (THREE.Fog) {
            this.scene.fog = new THREE.Fog(0x87CEEB, 50, 200);
        }
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(
            75,
            window.innerWidth / window.innerHeight,
            0.1,
            1000
        );
        
        // Create renderer
        const canvas = document.getElementById('game-canvas');
        this.renderer = new THREE.WebGLRenderer({
            canvas: canvas,
            antialias: !isMinimalMode // Disable antialiasing in minimal mode
        });
        
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setClearColor(0x87CEEB);
        
        // Only enable shadows if supported
        if (this.renderer.shadowMap && !isMinimalMode) {
            this.renderer.shadowMap.enabled = true;
            if (THREE.PCFSoftShadowMap) {
                this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            }
        }
        
        // Store minimal mode flag
        this.isMinimalMode = isMinimalMode;
        
        if (isMinimalMode) {
            console.log('Game Engine initialized in minimal/compatibility mode');
        }
        
        // Add lighting
        this.setupLighting();
    }
    
    setupLighting() {
        console.log('Setting up lighting...');
        // Ambient light
        console.log('Creating ambient light...');
        const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
        this.scene.add(ambientLight);
        console.log('Ambient light added to scene');
        
        // Directional light (sun)
        console.log('Creating directional light...');
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(50, 100, 50);
        directionalLight.castShadow = true;
        
        directionalLight.shadow.camera.left = -100;
        directionalLight.shadow.camera.right = 100;
        directionalLight.shadow.camera.top = 100;
        directionalLight.shadow.camera.bottom = -100;
        directionalLight.shadow.camera.near = 0.1;
        directionalLight.shadow.camera.far = 200;
        directionalLight.shadow.mapSize.width = 2048;
        directionalLight.shadow.mapSize.height = 2048;
        
        this.scene.add(directionalLight);
        console.log('Directional light added to scene');
        console.log('Lighting setup completed');
    }
    
    setupMaterials() {
        console.log('Setting up materials...');
        // Create textures and materials for different block types
        console.log('Creating texture loader...');
        const textureLoader = new THREE.TextureLoader();
        console.log('Texture loader created successfully');
        
        // Basic colored materials for now
        console.log('Creating material for DIRT...');
        this.materials[this.blockTypes.DIRT] = new THREE.MeshLambertMaterial({ color: 0x8B4513 });
        console.log('Creating material for STONE...');
        this.materials[this.blockTypes.STONE] = new THREE.MeshLambertMaterial({ color: 0x808080 });
        console.log('Creating material for GRASS...');
        this.materials[this.blockTypes.GRASS] = new THREE.MeshLambertMaterial({ color: 0x228B22 });
        console.log('Creating material for WOOD...');
        this.materials[this.blockTypes.WOOD] = new THREE.MeshLambertMaterial({ color: 0xD2691E });
        console.log('Creating material for LEAVES...');
        this.materials[this.blockTypes.LEAVES] = new THREE.MeshLambertMaterial({ color: 0x32CD32 });
        console.log('Creating material for SAND...');
        this.materials[this.blockTypes.SAND] = new THREE.MeshLambertMaterial({ color: 0xF4A460 });
        console.log('Creating material for WATER...');
        this.materials[this.blockTypes.WATER] = new THREE.MeshLambertMaterial({ 
            color: 0x1E90FF,
            transparent: true,
            opacity: 0.7
        });
        console.log('Creating material for EMERALD_ORE...');
        this.materials[this.blockTypes.EMERALD_ORE] = new THREE.MeshLambertMaterial({ color: 0x00FF7F });
        console.log('Creating material for OBSIDIAN...');
        this.materials[this.blockTypes.OBSIDIAN] = new THREE.MeshLambertMaterial({ color: 0x191970 });
        console.log('Creating material for PORTAL...');
        this.materials[this.blockTypes.PORTAL] = new THREE.MeshLambertMaterial({ 
            color: 0x8A2BE2,
            transparent: true,
            opacity: 0.8
        });
        console.log('All materials created successfully');
    }
    
    setupEventListeners() {
        // Window resize
        window.addEventListener('resize', () => {
            this.camera.aspect = window.innerWidth / window.innerHeight;
            this.camera.updateProjectionMatrix();
            this.renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Pointer lock for FPS controls
        document.addEventListener('click', () => {
            if (!this.isPaused) {
                document.body.requestPointerLock();
            }
        });
        
        // Mouse movement for camera
        document.addEventListener('mousemove', (event) => {
            if (document.pointerLockElement === document.body && !this.isPaused) {
                this.handleMouseMove(event);
            }
        });
        
        // Click events for block breaking/placing
        document.addEventListener('mousedown', (event) => {
            if (document.pointerLockElement === document.body && !this.isPaused) {
                this.handleMouseClick(event);
            }
        });
        
        // Keyboard events
        document.addEventListener('keydown', (event) => {
            this.handleKeyDown(event);
        });
        
        document.addEventListener('keyup', (event) => {
            this.handleKeyUp(event);
        });
    }
    
    handleMouseMove(event) {
        if (window.player) {
            window.player.handleMouseMove(event.movementX, event.movementY);
        }
    }
    
    handleMouseClick(event) {
        if (window.player) {
            window.player.handleClick(event.button === 0 ? 'left' : 'right');
        }
    }
    
    handleKeyDown(event) {
        switch (event.code) {
            case 'Escape':
                this.togglePause();
                break;
            case 'KeyE':
                if (window.inventory) {
                    window.inventory.toggle();
                }
                break;
            case 'KeyC':
                this.toggleCrafting();
                break;
            case 'Digit1':
            case 'Digit2':
            case 'Digit3':
            case 'Digit4':
            case 'Digit5':
            case 'Digit6':
            case 'Digit7':
            case 'Digit8':
            case 'Digit9':
                if (window.inventory) {
                    window.inventory.selectSlot(parseInt(event.code.slice(-1)) - 1);
                }
                break;
        }
        
        if (window.player) {
            window.player.handleKeyDown(event.code);
        }
    }
    
    handleKeyUp(event) {
        if (window.player) {
            window.player.handleKeyUp(event.code);
        }
    }
    
    togglePause() {
        this.isPaused = !this.isPaused;
        const pauseMenu = document.getElementById('pause-menu');
        
        if (this.isPaused) {
            pauseMenu.style.display = 'flex';
            document.exitPointerLock();
        } else {
            pauseMenu.style.display = 'none';
        }
    }
    
    toggleCrafting() {
        const craftingPanel = document.getElementById('crafting-panel');
        craftingPanel.style.display = craftingPanel.style.display === 'none' ? 'block' : 'none';
    }
    
    getBlock(x, y, z) {
        const key = `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
        return this.world[key] || this.blockTypes.AIR;
    }
    
    setBlock(x, y, z, blockType) {
        const key = `${Math.floor(x)},${Math.floor(y)},${Math.floor(z)}`;
        
        if (blockType === this.blockTypes.AIR) {
            delete this.world[key];
        } else {
            this.world[key] = blockType;
        }
        
        this.updateChunkMesh(Math.floor(x / this.chunkSize), Math.floor(z / this.chunkSize));
    }
    
    updateChunkMesh(chunkX, chunkZ) {
        const chunkKey = `${chunkX},${chunkZ}`;
        
        // Remove existing chunk mesh
        if (this.chunks.has(chunkKey)) {
            this.scene.remove(this.chunks.get(chunkKey));
            this.chunks.get(chunkKey).geometry.dispose();
        }
        
        // Create new chunk mesh
        const chunkMesh = this.createChunkMesh(chunkX, chunkZ);
        if (chunkMesh) {
            this.chunks.set(chunkKey, chunkMesh);
            this.scene.add(chunkMesh);
        }
    }
    
    createChunkMesh(chunkX, chunkZ) {
        const geometry = new THREE.BufferGeometry();
        const vertices = [];
        const normals = [];
        const uvs = [];
        const colors = [];
        
        const startX = chunkX * this.chunkSize;
        const startZ = chunkZ * this.chunkSize;
        
        for (let x = 0; x < this.chunkSize; x++) {
            for (let z = 0; z < this.chunkSize; z++) {
                for (let y = 0; y < this.maxHeight; y++) {
                    const worldX = startX + x;
                    const worldZ = startZ + z;
                    const blockType = this.getBlock(worldX, y, worldZ);
                    
                    if (blockType !== this.blockTypes.AIR) {
                        this.addBlockFaces(vertices, normals, uvs, colors, worldX, y, worldZ, blockType);
                    }
                }
            }
        }
        
        if (vertices.length === 0) return null;
        
        geometry.setAttribute('position', new THREE.Float32BufferAttribute(vertices, 3));
        geometry.setAttribute('normal', new THREE.Float32BufferAttribute(normals, 3));
        geometry.setAttribute('uv', new THREE.Float32BufferAttribute(uvs, 2));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 3));
        
        const material = new THREE.MeshLambertMaterial({ vertexColors: true });
        const mesh = new THREE.Mesh(geometry, material);
        mesh.receiveShadow = true;
        mesh.castShadow = true;
        
        return mesh;
    }
    
    addBlockFaces(vertices, normals, uvs, colors, x, y, z, blockType) {
        const material = this.materials[blockType];
        const color = material.color;
        
        // Check which faces are visible
        const faces = [
            { dir: [0, 1, 0], corners: [[0,1,1], [1,1,1], [1,1,0], [0,1,0]] }, // top
            { dir: [0, -1, 0], corners: [[0,0,0], [1,0,0], [1,0,1], [0,0,1]] }, // bottom
            { dir: [1, 0, 0], corners: [[1,0,0], [1,1,0], [1,1,1], [1,0,1]] }, // right
            { dir: [-1, 0, 0], corners: [[0,0,1], [0,1,1], [0,1,0], [0,0,0]] }, // left
            { dir: [0, 0, 1], corners: [[0,0,1], [1,0,1], [1,1,1], [0,1,1]] }, // front
            { dir: [0, 0, -1], corners: [[1,0,0], [0,1,0], [0,1,0], [1,0,0]] }  // back
        ];
        
        for (const face of faces) {
            const [dx, dy, dz] = face.dir;
            const neighborBlock = this.getBlock(x + dx, y + dy, z + dz);
            
            if (neighborBlock === this.blockTypes.AIR || 
                (neighborBlock === this.blockTypes.WATER && blockType !== this.blockTypes.WATER)) {
                
                // Add face vertices
                const [c1, c2, c3, c4] = face.corners;
                
                // First triangle
                vertices.push(
                    x + c1[0], y + c1[1], z + c1[2],
                    x + c2[0], y + c2[1], z + c2[2],
                    x + c3[0], y + c3[1], z + c3[2]
                );
                
                // Second triangle
                vertices.push(
                    x + c1[0], y + c1[1], z + c1[2],
                    x + c3[0], y + c3[1], z + c3[2],
                    x + c4[0], y + c4[1], z + c4[2]
                );
                
                // Add normals (6 vertices, 2 triangles)
                for (let i = 0; i < 6; i++) {
                    normals.push(dx, dy, dz);
                }
                
                // Add UVs
                uvs.push(0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1);
                
                // Add colors
                for (let i = 0; i < 6; i++) {
                    colors.push(color.r, color.g, color.b);
                }
            }
        }
    }
    
    start() {
        this.isRunning = true;
        this.animate();
    }
    
    stop() {
        this.isRunning = false;
    }
    
    animate() {
        if (!this.isRunning) return;
        
        const currentTime = performance.now();
        this.deltaTime = currentTime - this.lastTime;
        
        if (this.deltaTime >= this.frameTime) {
            this.update(this.deltaTime / 1000);
            this.render();
            this.lastTime = currentTime;
        }
        
        requestAnimationFrame(() => this.animate());
    }
    
    update(deltaTime) {
        if (this.isPaused) return;
        
        // Update game systems
        if (window.player) {
            window.player.update(deltaTime);
        }
        
        if (window.enemyManager) {
            window.enemyManager.update(deltaTime);
        }
        
        if (window.bossManager) {
            window.bossManager.update(deltaTime);
        }
        
        // Update world chunks based on player position
        if (window.player) {
            this.updateWorldChunks();
        }
    }
    
    updateWorldChunks() {
        const playerPos = window.player.position;
        const playerChunkX = Math.floor(playerPos.x / this.chunkSize);
        const playerChunkZ = Math.floor(playerPos.z / this.chunkSize);
        
        // Load chunks around player
        for (let x = playerChunkX - this.renderDistance; x <= playerChunkX + this.renderDistance; x++) {
            for (let z = playerChunkZ - this.renderDistance; z <= playerChunkZ + this.renderDistance; z++) {
                const chunkKey = `${x},${z}`;
                
                if (!this.loadedChunks.has(chunkKey)) {
                    if (window.worldGenerator) {
                        window.worldGenerator.generateChunk(x, z);
                    }
                    this.updateChunkMesh(x, z);
                    this.loadedChunks.add(chunkKey);
                }
            }
        }
        
        // Unload distant chunks
        for (const chunkKey of this.loadedChunks) {
            const [x, z] = chunkKey.split(',').map(Number);
            const distance = Math.max(Math.abs(x - playerChunkX), Math.abs(z - playerChunkZ));
            
            if (distance > this.renderDistance + 2) {
                if (this.chunks.has(chunkKey)) {
                    this.scene.remove(this.chunks.get(chunkKey));
                    this.chunks.get(chunkKey).geometry.dispose();
                    this.chunks.delete(chunkKey);
                }
                this.loadedChunks.delete(chunkKey);
            }
        }
    }
    
    render() {
        this.renderer.render(this.scene, this.camera);
    }
    
    // Utility method for raycasting
    raycast(origin, direction, maxDistance = 10) {
        this.raycaster.set(origin, direction);
        
        // Check for block intersections
        for (let distance = 0.5; distance < maxDistance; distance += 0.5) {
            const point = origin.clone().add(direction.clone().multiplyScalar(distance));
            const blockType = this.getBlock(point.x, point.y, point.z);
            
            if (blockType !== this.blockTypes.AIR) {
                return {
                    hit: true,
                    point: point,
                    blockType: blockType,
                    blockPosition: {
                        x: Math.floor(point.x),
                        y: Math.floor(point.y),
                        z: Math.floor(point.z)
                    }
                };
            }
        }
        
        return { hit: false };
    }
}

// Export for use in other modules
window.GameEngine = GameEngine;