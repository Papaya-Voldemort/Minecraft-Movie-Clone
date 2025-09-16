// Player class for first-person controls and interaction
class Player {
    constructor(gameEngine) {
        console.log('Player constructor started...');
        this.gameEngine = gameEngine;
        
        // Position and movement
        this.position = new THREE.Vector3(0, 35, 0);
        this.velocity = new THREE.Vector3();
        this.rotation = new THREE.Euler();
        
        // Player stats
        this.health = 100;
        this.maxHealth = 100;
        this.emeralds = 0;
        
        // Movement settings
        this.moveSpeed = 8;
        this.jumpSpeed = 12;
        this.gravity = -25;
        this.friction = 0.9;
        this.mouseSensitivity = 0.002;
        
        // Player dimensions
        this.width = 0.6;
        this.height = 1.8;
        this.eyeHeight = 1.6;
        
        // Input state
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            jump: false,
            sneak: false
        };
        
        // Interaction
        this.selectedSlot = 0;
        this.reach = 5;
        this.isOnGround = false;
        
        // Equipment
        this.armor = {
            helmet: null,
            chestplate: null,
            leggings: null,
            boots: null
        };
        
        this.initCamera();
        this.updateUI();
        console.log('Player constructor completed successfully');
    }
    
    initCamera() {
        // Set camera position relative to player
        this.updateCameraPosition();
        this.gameEngine.camera.rotation.order = 'YXZ';
    }
    
    updateCameraPosition() {
        this.gameEngine.camera.position.copy(this.position);
        this.gameEngine.camera.position.y += this.eyeHeight;
    }
    
    handleMouseMove(deltaX, deltaY) {
        this.rotation.y -= deltaX * this.mouseSensitivity;
        this.rotation.x -= deltaY * this.mouseSensitivity;
        
        // Limit vertical rotation
        this.rotation.x = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, this.rotation.x));
        
        // Apply rotation to camera
        this.gameEngine.camera.rotation.x = this.rotation.x;
        this.gameEngine.camera.rotation.y = this.rotation.y;
    }
    
    handleKeyDown(keyCode) {
        switch (keyCode) {
            case 'KeyW':
                this.keys.forward = true;
                break;
            case 'KeyS':
                this.keys.backward = true;
                break;
            case 'KeyA':
                this.keys.left = true;
                break;
            case 'KeyD':
                this.keys.right = true;
                break;
            case 'Space':
                this.keys.jump = true;
                break;
            case 'ShiftLeft':
                this.keys.sneak = true;
                break;
        }
    }
    
    handleKeyUp(keyCode) {
        switch (keyCode) {
            case 'KeyW':
                this.keys.forward = false;
                break;
            case 'KeyS':
                this.keys.backward = false;
                break;
            case 'KeyA':
                this.keys.left = false;
                break;
            case 'KeyD':
                this.keys.right = false;
                break;
            case 'Space':
                this.keys.jump = false;
                break;
            case 'ShiftLeft':
                this.keys.sneak = false;
                break;
        }
    }
    
    handleClick(button) {
        const direction = new THREE.Vector3();
        this.gameEngine.camera.getWorldDirection(direction);
        
        const raycast = this.gameEngine.raycast(
            this.gameEngine.camera.position,
            direction,
            this.reach
        );
        
        if (raycast.hit) {
            const { blockPosition, blockType } = raycast;
            
            if (button === 'left') {
                // Break block
                this.breakBlock(blockPosition.x, blockPosition.y, blockPosition.z, blockType);
            } else if (button === 'right') {
                // Place block
                this.placeBlock(blockPosition, direction);
            }
        }
    }
    
    breakBlock(x, y, z, blockType) {
        // Check if block can be broken
        if (blockType === this.gameEngine.blockTypes.OBSIDIAN && !this.hasPickaxe()) {
            return; // Need special tool for obsidian
        }
        
        // Remove block
        this.gameEngine.setBlock(x, y, z, this.gameEngine.blockTypes.AIR);
        
        // Add to inventory
        if (window.inventory) {
            const itemType = this.getItemFromBlock(blockType);
            if (itemType) {
                window.inventory.addItem(itemType, 1);
            }
        }
        
        // Special drops
        if (blockType === this.gameEngine.blockTypes.EMERALD_ORE) {
            this.emeralds += Math.floor(Math.random() * 3) + 1;
            this.updateUI();
        }
    }
    
    placeBlock(hitPosition, direction) {
        if (!window.inventory) return;
        
        const selectedItem = window.inventory.getSelectedItem();
        if (!selectedItem || !this.isBlockItem(selectedItem.type)) return;
        
        // Calculate placement position
        const placeX = hitPosition.x - Math.sign(direction.x) * 0.1;
        const placeY = hitPosition.y - Math.sign(direction.y) * 0.1;
        const placeZ = hitPosition.z - Math.sign(direction.z) * 0.1;
        
        const blockX = Math.floor(placeX);
        const blockY = Math.floor(placeY);
        const blockZ = Math.floor(placeZ);
        
        // Check if position is valid (not inside player)
        if (this.isPositionInsidePlayer(blockX, blockY, blockZ)) {
            return;
        }
        
        // Check if position is empty
        if (this.gameEngine.getBlock(blockX, blockY, blockZ) !== this.gameEngine.blockTypes.AIR) {
            return;
        }
        
        // Place block
        const blockType = this.getBlockFromItem(selectedItem.type);
        this.gameEngine.setBlock(blockX, blockY, blockZ, blockType);
        
        // Remove from inventory
        window.inventory.removeItem(selectedItem.type, 1);
    }
    
    isPositionInsidePlayer(x, y, z) {
        const minX = this.position.x - this.width / 2;
        const maxX = this.position.x + this.width / 2;
        const minY = this.position.y;
        const maxY = this.position.y + this.height;
        const minZ = this.position.z - this.width / 2;
        const maxZ = this.position.z + this.width / 2;
        
        return x >= minX && x <= maxX && 
               y >= minY && y <= maxY && 
               z >= minZ && z <= maxZ;
    }
    
    getItemFromBlock(blockType) {
        const blockToItem = {
            [this.gameEngine.blockTypes.DIRT]: 'dirt',
            [this.gameEngine.blockTypes.STONE]: 'stone',
            [this.gameEngine.blockTypes.GRASS]: 'grass',
            [this.gameEngine.blockTypes.WOOD]: 'wood',
            [this.gameEngine.blockTypes.LEAVES]: 'leaves',
            [this.gameEngine.blockTypes.SAND]: 'sand',
            [this.gameEngine.blockTypes.OBSIDIAN]: 'obsidian'
        };
        
        return blockToItem[blockType];
    }
    
    getBlockFromItem(itemType) {
        const itemToBlock = {
            'dirt': this.gameEngine.blockTypes.DIRT,
            'stone': this.gameEngine.blockTypes.STONE,
            'grass': this.gameEngine.blockTypes.GRASS,
            'wood': this.gameEngine.blockTypes.WOOD,
            'leaves': this.gameEngine.blockTypes.LEAVES,
            'sand': this.gameEngine.blockTypes.SAND,
            'obsidian': this.gameEngine.blockTypes.OBSIDIAN
        };
        
        return itemToBlock[itemType];
    }
    
    isBlockItem(itemType) {
        const blockItems = ['dirt', 'stone', 'grass', 'wood', 'leaves', 'sand', 'obsidian'];
        return blockItems.includes(itemType);
    }
    
    hasPickaxe() {
        if (!window.inventory) return false;
        
        const selectedItem = window.inventory.getSelectedItem();
        return selectedItem && selectedItem.type.includes('pickaxe');
    }
    
    update(deltaTime) {
        this.updateMovement(deltaTime);
        this.updatePhysics(deltaTime);
        this.updateCameraPosition();
        this.checkEnvironmentalDamage();
    }
    
    updateMovement(deltaTime) {
        const moveVector = new THREE.Vector3();
        
        // Calculate movement direction based on input
        if (this.keys.forward) moveVector.z -= 1;
        if (this.keys.backward) moveVector.z += 1;
        if (this.keys.left) moveVector.x -= 1;
        if (this.keys.right) moveVector.x += 1;
        
        // Normalize diagonal movement
        if (moveVector.length() > 0) {
            moveVector.normalize();
            
            // Apply camera rotation to movement
            moveVector.applyAxisAngle(new THREE.Vector3(0, 1, 0), this.rotation.y);
            
            // Apply movement speed
            const speed = this.keys.sneak ? this.moveSpeed * 0.5 : this.moveSpeed;
            moveVector.multiplyScalar(speed * deltaTime);
            
            this.velocity.x = moveVector.x;
            this.velocity.z = moveVector.z;
        } else {
            // Apply friction
            this.velocity.x *= this.friction;
            this.velocity.z *= this.friction;
        }
        
        // Jumping
        if (this.keys.jump && this.isOnGround) {
            this.velocity.y = this.jumpSpeed;
            this.isOnGround = false;
        }
    }
    
    updatePhysics(deltaTime) {
        // Apply gravity
        if (!this.isOnGround) {
            this.velocity.y += this.gravity * deltaTime;
        }
        
        // Move player
        const newPosition = this.position.clone().add(
            this.velocity.clone().multiplyScalar(deltaTime)
        );
        
        // Collision detection
        this.resolveCollisions(newPosition);
        
        // Update position
        this.position.copy(newPosition);
    }
    
    resolveCollisions(newPosition) {
        const margin = 0.1;
        
        // Check Y collision (vertical)
        if (this.velocity.y < 0) {
            // Check ground collision
            const groundY = this.getGroundLevel(newPosition.x, newPosition.z);
            if (newPosition.y <= groundY + margin) {
                newPosition.y = groundY;
                this.velocity.y = 0;
                this.isOnGround = true;
            }
        } else if (this.velocity.y > 0) {
            // Check ceiling collision
            const ceilingY = this.getCeilingLevel(newPosition.x, newPosition.z, newPosition.y + this.height);
            if (newPosition.y + this.height >= ceilingY - margin) {
                newPosition.y = ceilingY - this.height;
                this.velocity.y = 0;
            }
        }
        
        // Check X collision (horizontal)
        if (this.velocity.x !== 0) {
            if (this.checkHorizontalCollision(newPosition.x, this.position.y, this.position.z)) {
                newPosition.x = this.position.x;
                this.velocity.x = 0;
            }
        }
        
        // Check Z collision (horizontal)
        if (this.velocity.z !== 0) {
            if (this.checkHorizontalCollision(this.position.x, this.position.y, newPosition.z)) {
                newPosition.z = this.position.z;
                this.velocity.z = 0;
            }
        }
    }
    
    getGroundLevel(x, z) {
        // Find the highest solid block at this position
        for (let y = Math.floor(this.position.y) + 10; y >= 0; y--) {
            const blockType = this.gameEngine.getBlock(x, y, z);
            if (blockType !== this.gameEngine.blockTypes.AIR) {
                return y + 1;
            }
        }
        return 0;
    }
    
    getCeilingLevel(x, z, maxY) {
        // Find the lowest solid block above the player
        for (let y = Math.ceil(maxY); y < this.gameEngine.maxHeight; y++) {
            const blockType = this.gameEngine.getBlock(x, y, z);
            if (blockType !== this.gameEngine.blockTypes.AIR) {
                return y;
            }
        }
        return this.gameEngine.maxHeight;
    }
    
    checkHorizontalCollision(x, y, z) {
        // Check collision with blocks around player
        const minX = x - this.width / 2;
        const maxX = x + this.width / 2;
        const minZ = z - this.width / 2;
        const maxZ = z + this.width / 2;
        const maxY = y + this.height;
        
        for (let checkX = Math.floor(minX); checkX <= Math.floor(maxX); checkX++) {
            for (let checkZ = Math.floor(minZ); checkZ <= Math.floor(maxZ); checkZ++) {
                for (let checkY = Math.floor(y); checkY <= Math.floor(maxY); checkY++) {
                    const blockType = this.gameEngine.getBlock(checkX, checkY, checkZ);
                    if (blockType !== this.gameEngine.blockTypes.AIR && 
                        blockType !== this.gameEngine.blockTypes.WATER) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    checkEnvironmentalDamage() {
        // Check if player is in dangerous blocks
        const playerBlock = this.gameEngine.getBlock(
            this.position.x,
            this.position.y + this.eyeHeight,
            this.position.z
        );
        
        if (playerBlock === this.gameEngine.blockTypes.PORTAL) {
            // Transport to another dimension
            if (window.portalManager) {
                window.portalManager.transportPlayer(this);
            }
        }
        
        // Fall damage
        if (this.velocity.y < -20) {
            const damage = Math.floor(Math.abs(this.velocity.y) - 20);
            this.takeDamage(damage);
        }
    }
    
    takeDamage(amount) {
        // Calculate damage reduction from armor
        const protection = this.calculateArmorProtection();
        const actualDamage = Math.max(1, amount * (1 - protection));
        
        this.health = Math.max(0, this.health - actualDamage);
        this.updateUI();
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    heal(amount) {
        this.health = Math.min(this.maxHealth, this.health + amount);
        this.updateUI();
    }
    
    calculateArmorProtection() {
        let protection = 0;
        
        Object.values(this.armor).forEach(item => {
            if (item) {
                if (item.includes('emerald')) {
                    protection += 0.1; // Emerald armor provides 10% protection per piece
                } else {
                    protection += 0.05; // Regular armor provides 5% protection per piece
                }
            }
        });
        
        return Math.min(0.8, protection); // Cap at 80% damage reduction
    }
    
    equipArmor(slot, item) {
        this.armor[slot] = item;
    }
    
    die() {
        // Handle player death
        console.log('Player died!');
        
        // Reset position
        this.position.set(0, 35, 0);
        this.velocity.set(0, 0, 0);
        this.health = this.maxHealth;
        
        // Drop some items
        if (window.inventory) {
            window.inventory.dropRandomItems(5);
        }
        
        this.updateUI();
    }
    
    updateUI() {
        // Update health bar
        const healthFill = document.getElementById('health-fill');
        if (healthFill) {
            const healthPercent = (this.health / this.maxHealth) * 100;
            healthFill.style.width = `${healthPercent}%`;
        }
        
        // Update emerald count
        const emeraldAmount = document.getElementById('emerald-amount');
        if (emeraldAmount) {
            emeraldAmount.textContent = this.emeralds;
        }
    }
    
    addEmeralds(amount) {
        this.emeralds += amount;
        this.updateUI();
    }
    
    spendEmeralds(amount) {
        if (this.emeralds >= amount) {
            this.emeralds -= amount;
            this.updateUI();
            return true;
        }
        return false;
    }
}

// Export for use in other modules
window.Player = Player;