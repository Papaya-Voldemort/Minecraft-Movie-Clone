// World Generator using Simplex Noise
class WorldGenerator {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        
        try {
            this.simplex = new SimplexNoise();
            console.log('SimplexNoise instance created successfully');
        } catch (error) {
            console.error('Failed to create SimplexNoise:', error);
            // Fallback to basic noise
            this.simplex = {
                noise2D: (x, y) => (Math.sin(x * 12.9898) + Math.cos(y * 78.233)) * 0.5,
                noise3D: (x, y, z) => (Math.sin(x * 12.9898) + Math.cos(y * 78.233) + Math.sin(z * 37.719)) * 0.33
            };
        }
        
        // Generation settings
        this.baseHeight = 32;
        this.heightVariation = 16;
        this.oreFrequency = 0.02;
        this.treeFrequency = 0.01;
        this.villageDistance = 100; // Distance between villages
        this.portalFrequency = 0.001;
        
        // Biome settings
        this.biomes = {
            PLAINS: 0,
            FOREST: 1,
            MOUNTAINS: 2,
            DESERT: 3,
            WATER: 4
        };
        
        this.generatedVillages = new Set();
        this.generatedPortals = new Set();
        
        console.log('WorldGenerator initialized successfully');
    }
    
    generateChunk(chunkX, chunkZ) {
        try {
            console.log(`Generating chunk (${chunkX}, ${chunkZ})...`);
            const startX = chunkX * this.gameEngine.chunkSize;
            const startZ = chunkZ * this.gameEngine.chunkSize;
            
            for (let x = 0; x < this.gameEngine.chunkSize; x++) {
                for (let z = 0; z < this.gameEngine.chunkSize; z++) {
                    const worldX = startX + x;
                    const worldZ = startZ + z;
                    
                    this.generateColumn(worldX, worldZ);
                }
            }
            
            // Generate structures for this chunk
            this.generateStructures(chunkX, chunkZ);
            console.log(`Chunk (${chunkX}, ${chunkZ}) generated successfully`);
        } catch (error) {
            console.error(`Error generating chunk (${chunkX}, ${chunkZ}):`, error);
            // Continue with minimal chunk generation
            this.generateMinimalChunk(chunkX, chunkZ);
        }
    }
    
    generateMinimalChunk(chunkX, chunkZ) {
        console.log(`Generating minimal chunk (${chunkX}, ${chunkZ})...`);
        const startX = chunkX * this.gameEngine.chunkSize;
        const startZ = chunkZ * this.gameEngine.chunkSize;
        
        // Create a simple flat world as fallback
        for (let x = 0; x < this.gameEngine.chunkSize; x++) {
            for (let z = 0; z < this.gameEngine.chunkSize; z++) {
                const worldX = startX + x;
                const worldZ = startZ + z;
                
                // Simple flat terrain
                for (let y = 0; y <= this.baseHeight; y++) {
                    let blockType;
                    if (y === this.baseHeight) {
                        blockType = this.gameEngine.blockTypes.GRASS;
                    } else if (y >= this.baseHeight - 3) {
                        blockType = this.gameEngine.blockTypes.DIRT;
                    } else {
                        blockType = this.gameEngine.blockTypes.STONE;
                    }
                    this.gameEngine.setBlock(worldX, y, worldZ, blockType);
                }
            }
        }
    }
    
    generateColumn(x, z) {
        const biome = this.getBiome(x, z);
        const height = this.getHeight(x, z);
        
        // Generate terrain layers
        for (let y = 0; y <= height; y++) {
            let blockType;
            
            if (y === height) {
                // Surface block
                switch (biome) {
                    case this.biomes.PLAINS:
                    case this.biomes.FOREST:
                        blockType = this.gameEngine.blockTypes.GRASS;
                        break;
                    case this.biomes.DESERT:
                        blockType = this.gameEngine.blockTypes.SAND;
                        break;
                    case this.biomes.MOUNTAINS:
                        blockType = y > this.baseHeight + 8 ? 
                            this.gameEngine.blockTypes.STONE : 
                            this.gameEngine.blockTypes.GRASS;
                        break;
                    default:
                        blockType = this.gameEngine.blockTypes.GRASS;
                }
            } else if (y >= height - 3) {
                // Subsurface
                blockType = biome === this.biomes.DESERT ? 
                    this.gameEngine.blockTypes.SAND : 
                    this.gameEngine.blockTypes.DIRT;
            } else {
                // Deep layers
                blockType = this.gameEngine.blockTypes.STONE;
                
                // Add ore generation
                if (this.shouldGenerateOre(x, y, z)) {
                    blockType = this.gameEngine.blockTypes.EMERALD_ORE;
                }
            }
            
            this.gameEngine.setBlock(x, y, z, blockType);
        }
        
        // Add water at sea level
        const seaLevel = this.baseHeight - 5;
        if (height < seaLevel) {
            for (let y = height + 1; y <= seaLevel; y++) {
                this.gameEngine.setBlock(x, y, z, this.gameEngine.blockTypes.WATER);
            }
        }
        
        // Generate vegetation
        if (height >= seaLevel && biome === this.biomes.FOREST) {
            if (this.shouldGenerateTree(x, z)) {
                this.generateTree(x, height + 1, z);
            }
        }
    }
    
    getBiome(x, z) {
        try {
            const scale = 0.01;
            const noise = this.simplex.noise2D(x * scale, z * scale);
            const temp = this.simplex.noise2D(x * scale * 0.5, z * scale * 0.5);
            
            if (noise < -0.3) return this.biomes.WATER;
            if (temp > 0.4) return this.biomes.DESERT;
            if (noise > 0.3) return this.biomes.MOUNTAINS;
            if (temp > 0.1) return this.biomes.FOREST;
            return this.biomes.PLAINS;
        } catch (error) {
            console.warn('Error in getBiome:', error);
            return this.biomes.PLAINS; // Safe fallback
        }
    }
    
    getHeight(x, z) {
        try {
            const scale1 = 0.01;
            const scale2 = 0.005;
            const scale3 = 0.02;
            
            const noise1 = this.simplex.noise2D(x * scale1, z * scale1);
            const noise2 = this.simplex.noise2D(x * scale2, z * scale2);
            const noise3 = this.simplex.noise2D(x * scale3, z * scale3);
            
            const combined = noise1 * 0.5 + noise2 * 0.3 + noise3 * 0.2;
            
            return Math.floor(this.baseHeight + combined * this.heightVariation);
        } catch (error) {
            console.warn('Error in getHeight:', error);
            return this.baseHeight; // Safe fallback
        }
    }
    
    shouldGenerateOre(x, y, z) {
        if (y > this.baseHeight) return false;
        
        const noise = this.simplex.noise3D(x * 0.1, y * 0.1, z * 0.1);
        return noise > 0.7;
    }
    
    shouldGenerateTree(x, z) {
        const noise = this.simplex.noise2D(x * 0.1, z * 0.1);
        return noise > 0.6;
    }
    
    generateTree(x, y, z) {
        const height = 4 + Math.floor(Math.random() * 3);
        
        // Tree trunk
        for (let i = 0; i < height; i++) {
            this.gameEngine.setBlock(x, y + i, z, this.gameEngine.blockTypes.WOOD);
        }
        
        // Tree leaves
        const leafY = y + height - 1;
        for (let dx = -2; dx <= 2; dx++) {
            for (let dz = -2; dz <= 2; dz++) {
                for (let dy = 0; dy <= 2; dy++) {
                    const distance = Math.abs(dx) + Math.abs(dz) + Math.abs(dy);
                    if (distance <= 3 && Math.random() > 0.3) {
                        const leafX = x + dx;
                        const leafZ = z + dz;
                        const currentY = leafY + dy;
                        
                        if (this.gameEngine.getBlock(leafX, currentY, leafZ) === this.gameEngine.blockTypes.AIR) {
                            this.gameEngine.setBlock(leafX, currentY, leafZ, this.gameEngine.blockTypes.LEAVES);
                        }
                    }
                }
            }
        }
    }
    
    generateStructures(chunkX, chunkZ) {
        const centerX = chunkX * this.gameEngine.chunkSize + this.gameEngine.chunkSize / 2;
        const centerZ = chunkZ * this.gameEngine.chunkSize + this.gameEngine.chunkSize / 2;
        
        // Generate village
        if (this.shouldGenerateVillage(chunkX, chunkZ)) {
            this.generateVillage(centerX, centerZ);
        }
        
        // Generate portal
        if (this.shouldGeneratePortal(chunkX, chunkZ)) {
            this.generatePortal(centerX, centerZ);
        }
    }
    
    shouldGenerateVillage(chunkX, chunkZ) {
        const villageKey = `${Math.floor(chunkX / 8)},${Math.floor(chunkZ / 8)}`;
        
        if (this.generatedVillages.has(villageKey)) {
            return false;
        }
        
        const noise = this.simplex.noise2D(chunkX * 0.01, chunkZ * 0.01);
        if (noise > 0.5) {
            this.generatedVillages.add(villageKey);
            return true;
        }
        
        return false;
    }
    
    shouldGeneratePortal(chunkX, chunkZ) {
        const portalKey = `${Math.floor(chunkX / 16)},${Math.floor(chunkZ / 16)}`;
        
        if (this.generatedPortals.has(portalKey)) {
            return false;
        }
        
        const noise = this.simplex.noise2D(chunkX * 0.005, chunkZ * 0.005);
        if (noise > 0.8) {
            this.generatedPortals.add(portalKey);
            return true;
        }
        
        return false;
    }
    
    generateVillage(centerX, centerZ) {
        const groundY = this.getHeight(centerX, centerZ);
        
        // Clear area for village
        for (let x = centerX - 15; x <= centerX + 15; x++) {
            for (let z = centerZ - 15; z <= centerZ + 15; z++) {
                const height = this.getHeight(x, z);
                for (let y = height + 1; y <= height + 8; y++) {
                    this.gameEngine.setBlock(x, y, z, this.gameEngine.blockTypes.AIR);
                }
                // Flatten ground
                this.gameEngine.setBlock(x, groundY, z, this.gameEngine.blockTypes.GRASS);
            }
        }
        
        // Generate village buildings
        this.generateBuilding(centerX - 8, groundY + 1, centerZ - 8, 6, 4, 6); // House 1
        this.generateBuilding(centerX + 2, groundY + 1, centerZ - 8, 6, 4, 6); // House 2
        this.generateBuilding(centerX - 8, groundY + 1, centerZ + 2, 6, 4, 6); // House 3
        this.generateBuilding(centerX + 2, groundY + 1, centerZ + 2, 6, 4, 6); // House 4
        this.generateBuilding(centerX - 3, groundY + 1, centerZ - 3, 6, 5, 6); // Central building (shop)
        
        // Add villagers
        if (window.villageManager) {
            window.villageManager.createVillage(centerX, groundY + 1, centerZ);
        }
    }
    
    generateBuilding(x, y, z, width, height, depth) {
        // Floor
        for (let dx = 0; dx < width; dx++) {
            for (let dz = 0; dz < depth; dz++) {
                this.gameEngine.setBlock(x + dx, y - 1, z + dz, this.gameEngine.blockTypes.WOOD);
            }
        }
        
        // Walls
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                for (let dz = 0; dz < depth; dz++) {
                    if (dx === 0 || dx === width - 1 || dz === 0 || dz === depth - 1) {
                        if (dy === 0 || dy === height - 1 || 
                            (dx !== Math.floor(width / 2) || dz !== 0 || dy !== 1)) {
                            this.gameEngine.setBlock(
                                x + dx, 
                                y + dy, 
                                z + dz, 
                                this.gameEngine.blockTypes.WOOD
                            );
                        }
                    }
                }
            }
        }
        
        // Roof
        for (let dx = -1; dx <= width; dx++) {
            for (let dz = -1; dz <= depth; dz++) {
                this.gameEngine.setBlock(x + dx, y + height, z + dz, this.gameEngine.blockTypes.WOOD);
            }
        }
    }
    
    generatePortal(centerX, centerZ) {
        const groundY = this.getHeight(centerX, centerZ) + 1;
        
        // Clear area around portal
        for (let x = centerX - 5; x <= centerX + 5; x++) {
            for (let z = centerZ - 5; z <= centerZ + 5; z++) {
                for (let y = groundY; y <= groundY + 6; y++) {
                    this.gameEngine.setBlock(x, y, z, this.gameEngine.blockTypes.AIR);
                }
            }
        }
        
        // Portal frame (5x5 with hollow center)
        for (let x = centerX - 2; x <= centerX + 2; x++) {
            for (let z = centerZ - 2; z <= centerZ + 2; z++) {
                // Base
                this.gameEngine.setBlock(x, groundY, z, this.gameEngine.blockTypes.OBSIDIAN);
                
                // Vertical pillars at corners and sides
                if ((x === centerX - 2 || x === centerX + 2) || 
                    (z === centerZ - 2 || z === centerZ + 2)) {
                    for (let y = groundY + 1; y <= groundY + 4; y++) {
                        this.gameEngine.setBlock(x, y, z, this.gameEngine.blockTypes.OBSIDIAN);
                    }
                }
                
                // Portal blocks in center
                if (x > centerX - 2 && x < centerX + 2 && 
                    z > centerZ - 2 && z < centerZ + 2) {
                    for (let y = groundY + 1; y <= groundY + 3; y++) {
                        this.gameEngine.setBlock(x, y, z, this.gameEngine.blockTypes.PORTAL);
                    }
                }
            }
        }
        
        // Top frame
        for (let x = centerX - 2; x <= centerX + 2; x++) {
            for (let z = centerZ - 2; z <= centerZ + 2; z++) {
                if (x === centerX - 2 || x === centerX + 2 || 
                    z === centerZ - 2 || z === centerZ + 2) {
                    this.gameEngine.setBlock(x, groundY + 5, z, this.gameEngine.blockTypes.OBSIDIAN);
                }
            }
        }
        
        // Register portal with portal manager
        if (window.portalManager) {
            window.portalManager.registerPortal(centerX, groundY + 1, centerZ);
        }
    }
    
    // Generate specific formations
    generateSickVillage(centerX, centerZ) {
        const groundY = this.getHeight(centerX, centerZ);
        
        // Create a corrupted version of a normal village
        for (let x = centerX - 12; x <= centerX + 12; x++) {
            for (let z = centerZ - 12; z <= centerZ + 12; z++) {
                const height = this.getHeight(x, z);
                for (let y = height + 1; y <= height + 6; y++) {
                    this.gameEngine.setBlock(x, y, z, this.gameEngine.blockTypes.AIR);
                }
                // Corrupted ground
                if (Math.random() > 0.7) {
                    this.gameEngine.setBlock(x, groundY, z, this.gameEngine.blockTypes.OBSIDIAN);
                }
            }
        }
        
        // Generate corrupted buildings
        this.generateCorruptedBuilding(centerX - 6, groundY + 1, centerZ - 6, 5, 3, 5);
        this.generateCorruptedBuilding(centerX + 1, groundY + 1, centerZ - 6, 5, 3, 5);
        this.generateCorruptedBuilding(centerX - 6, groundY + 1, centerZ + 1, 5, 3, 5);
        
        // Add sick villagers
        if (window.enemyManager) {
            window.enemyManager.spawnSickVillagers(centerX, groundY + 1, centerZ, 5);
        }
    }
    
    generateCorruptedBuilding(x, y, z, width, height, depth) {
        // Partially destroyed building
        for (let dy = 0; dy < height; dy++) {
            for (let dx = 0; dx < width; dx++) {
                for (let dz = 0; dz < depth; dz++) {
                    if (Math.random() > 0.3) { // Randomly missing blocks
                        if (dx === 0 || dx === width - 1 || dz === 0 || dz === depth - 1) {
                            this.gameEngine.setBlock(
                                x + dx, 
                                y + dy, 
                                z + dz, 
                                this.gameEngine.blockTypes.OBSIDIAN
                            );
                        }
                    }
                }
            }
        }
    }
}

// Export for use in other modules
window.WorldGenerator = WorldGenerator;