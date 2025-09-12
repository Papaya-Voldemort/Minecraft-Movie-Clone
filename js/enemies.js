// Enemy and Combat System
class Enemy {
    constructor(type, position, gameEngine) {
        this.type = type;
        this.position = position.clone();
        this.gameEngine = gameEngine;
        
        // Stats based on enemy type
        this.setupStats();
        
        // AI state
        this.state = 'idle'; // idle, patrolling, chasing, attacking
        this.target = null;
        this.lastPlayerSeen = null;
        this.patrolPoints = [];
        this.currentPatrolIndex = 0;
        this.stateTimer = 0;
        
        // Movement
        this.velocity = new THREE.Vector3();
        this.moveSpeed = 2;
        this.jumpSpeed = 8;
        this.gravity = -15;
        this.isOnGround = false;
        
        // Combat
        this.attackCooldown = 0;
        this.attackRange = 2;
        this.detectionRange = 15;
        
        // Visual representation
        this.mesh = null;
        this.createMesh();
        
        // Setup patrol points
        this.generatePatrolPoints();
    }
    
    setupStats() {
        const stats = {
            'pig_person': {
                health: 30,
                damage: 8,
                moveSpeed: 3,
                size: { width: 0.8, height: 1.6 },
                color: 0xFFC0CB,
                detectionRange: 20
            },
            'sick_villager': {
                health: 25,
                damage: 6,
                moveSpeed: 2,
                size: { width: 0.6, height: 1.7 },
                color: 0x8B4513,
                detectionRange: 12
            },
            'portal_guardian': {
                health: 100,
                damage: 20,
                moveSpeed: 1.5,
                size: { width: 1.2, height: 2.4 },
                color: 0x4B0082,
                detectionRange: 25
            }
        };
        
        const stat = stats[this.type] || stats['pig_person'];
        this.maxHealth = stat.health;
        this.health = this.maxHealth;
        this.damage = stat.damage;
        this.moveSpeed = stat.moveSpeed;
        this.size = stat.size;
        this.color = stat.color;
        this.detectionRange = stat.detectionRange;
    }
    
    createMesh() {
        // Create a simple humanoid representation
        const geometry = new THREE.BoxGeometry(this.size.width, this.size.height, this.size.width);
        const material = new THREE.MeshLambertMaterial({ color: this.color });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.position.y += this.size.height / 2;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Add to scene
        this.gameEngine.scene.add(this.mesh);
        
        // Add simple face
        if (this.type === 'pig_person') {
            this.addPigFeatures();
        } else if (this.type === 'sick_villager') {
            this.addSickFeatures();
        }
    }
    
    addPigFeatures() {
        // Add pig nose
        const noseGeometry = new THREE.BoxGeometry(0.2, 0.1, 0.3);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xFF69B4 });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0.3, this.size.width / 2);
        this.mesh.add(nose);
        
        // Add ears
        const earGeometry = new THREE.BoxGeometry(0.1, 0.2, 0.1);
        const earMaterial = new THREE.MeshLambertMaterial({ color: this.color });
        
        const leftEar = new THREE.Mesh(earGeometry, earMaterial);
        leftEar.position.set(-0.3, 0.6, 0);
        this.mesh.add(leftEar);
        
        const rightEar = new THREE.Mesh(earGeometry, earMaterial);
        rightEar.position.set(0.3, 0.6, 0);
        this.mesh.add(rightEar);
    }
    
    addSickFeatures() {
        // Add sick effect particles (green tint)
        const sickGeometry = new THREE.SphereGeometry(0.05, 8, 8);
        const sickMaterial = new THREE.MeshBasicMaterial({ 
            color: 0x00FF00,
            transparent: true,
            opacity: 0.6
        });
        
        for (let i = 0; i < 5; i++) {
            const particle = new THREE.Mesh(sickGeometry, sickMaterial);
            particle.position.set(
                (Math.random() - 0.5) * this.size.width,
                Math.random() * this.size.height,
                (Math.random() - 0.5) * this.size.width
            );
            this.mesh.add(particle);
        }
    }
    
    generatePatrolPoints() {
        // Generate random patrol points around spawn location
        const numPoints = 3 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const distance = 5 + Math.random() * 10;
            
            const patrolX = this.position.x + Math.cos(angle) * distance;
            const patrolZ = this.position.z + Math.sin(angle) * distance;
            const patrolY = this.gameEngine.worldGenerator ? 
                this.gameEngine.worldGenerator.getHeight(patrolX, patrolZ) + 1 :
                this.position.y;
            
            this.patrolPoints.push(new THREE.Vector3(patrolX, patrolY, patrolZ));
        }
    }
    
    update(deltaTime) {
        if (this.health <= 0) {
            this.die();
            return;
        }
        
        this.stateTimer += deltaTime;
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
        
        // Update AI
        this.updateAI(deltaTime);
        
        // Update physics
        this.updatePhysics(deltaTime);
        
        // Update visual position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.position.y += this.size.height / 2;
        }
    }
    
    updateAI(deltaTime) {
        // Check for player
        const player = window.player;
        if (player) {
            const distanceToPlayer = this.position.distanceTo(player.position);
            
            if (distanceToPlayer <= this.detectionRange) {
                this.target = player;
                this.lastPlayerSeen = player.position.clone();
                
                if (distanceToPlayer <= this.attackRange && this.attackCooldown <= 0) {
                    this.state = 'attacking';
                } else {
                    this.state = 'chasing';
                }
            } else if (this.state === 'chasing' && this.lastPlayerSeen) {
                // Continue to last known position
                const distanceToLastSeen = this.position.distanceTo(this.lastPlayerSeen);
                if (distanceToLastSeen < 1) {
                    this.state = 'patrolling';
                    this.lastPlayerSeen = null;
                    this.target = null;
                }
            } else if (this.state !== 'patrolling') {
                this.state = 'patrolling';
                this.target = null;
            }
        }
        
        // Execute state behavior
        switch (this.state) {
            case 'idle':
                if (this.stateTimer > 2 + Math.random() * 3) {
                    this.state = 'patrolling';
                    this.stateTimer = 0;
                }
                break;
                
            case 'patrolling':
                this.patrol(deltaTime);
                break;
                
            case 'chasing':
                this.chase(deltaTime);
                break;
                
            case 'attacking':
                this.attack(deltaTime);
                break;
        }
    }
    
    patrol(deltaTime) {
        if (this.patrolPoints.length === 0) {
            this.state = 'idle';
            return;
        }
        
        const targetPoint = this.patrolPoints[this.currentPatrolIndex];
        const direction = targetPoint.clone().sub(this.position);
        direction.y = 0; // Don't move vertically when patrolling
        
        const distance = direction.length();
        
        if (distance < 1) {
            // Reached patrol point, move to next
            this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
            this.state = 'idle';
            this.stateTimer = 0;
        } else {
            // Move towards patrol point
            direction.normalize();
            this.velocity.x = direction.x * this.moveSpeed * 0.5; // Slower when patrolling
            this.velocity.z = direction.z * this.moveSpeed * 0.5;
        }
    }
    
    chase(deltaTime) {
        const targetPos = this.target ? this.target.position : this.lastPlayerSeen;
        if (!targetPos) {
            this.state = 'patrolling';
            return;
        }
        
        const direction = targetPos.clone().sub(this.position);
        direction.y = 0; // Don't chase vertically
        
        if (direction.length() > 0) {
            direction.normalize();
            this.velocity.x = direction.x * this.moveSpeed;
            this.velocity.z = direction.z * this.moveSpeed;
            
            // Face the target
            if (this.mesh) {
                this.mesh.lookAt(targetPos);
            }
        }
    }
    
    attack(deltaTime) {
        if (this.attackCooldown > 0) return;
        
        if (this.target && this.position.distanceTo(this.target.position) <= this.attackRange) {
            // Deal damage to player
            this.target.takeDamage(this.damage);
            this.attackCooldown = 1.5; // 1.5 second attack cooldown
            
            // Attack animation (simple scale effect)
            if (this.mesh) {
                const originalScale = this.mesh.scale.clone();
                this.mesh.scale.multiplyScalar(1.2);
                
                setTimeout(() => {
                    if (this.mesh) {
                        this.mesh.scale.copy(originalScale);
                    }
                }, 200);
            }
            
            this.state = 'chasing';
        } else {
            this.state = 'chasing';
        }
    }
    
    updatePhysics(deltaTime) {
        // Apply gravity
        if (!this.isOnGround) {
            this.velocity.y += this.gravity * deltaTime;
        }
        
        // Move
        const newPosition = this.position.clone().add(
            this.velocity.clone().multiplyScalar(deltaTime)
        );
        
        // Check ground collision
        const groundY = this.getGroundLevel(newPosition.x, newPosition.z);
        if (newPosition.y <= groundY) {
            newPosition.y = groundY;
            this.velocity.y = 0;
            this.isOnGround = true;
        } else {
            this.isOnGround = false;
        }
        
        // Check wall collisions
        if (!this.checkWallCollision(newPosition.x, newPosition.y, this.position.z)) {
            this.position.x = newPosition.x;
        } else {
            this.velocity.x = 0;
        }
        
        if (!this.checkWallCollision(this.position.x, newPosition.y, newPosition.z)) {
            this.position.z = newPosition.z;
        } else {
            this.velocity.z = 0;
        }
        
        this.position.y = newPosition.y;
        
        // Apply friction
        this.velocity.x *= 0.8;
        this.velocity.z *= 0.8;
    }
    
    getGroundLevel(x, z) {
        if (!this.gameEngine.worldGenerator) return 0;
        return this.gameEngine.worldGenerator.getHeight(x, z) + 1;
    }
    
    checkWallCollision(x, y, z) {
        const margin = this.size.width / 2;
        
        // Check blocks around the enemy
        for (let dx = -margin; dx <= margin; dx += margin) {
            for (let dz = -margin; dz <= margin; dz += margin) {
                for (let dy = 0; dy < this.size.height; dy += 0.5) {
                    const blockType = this.gameEngine.getBlock(x + dx, y + dy, z + dz);
                    if (blockType !== this.gameEngine.blockTypes.AIR && 
                        blockType !== this.gameEngine.blockTypes.WATER) {
                        return true;
                    }
                }
            }
        }
        
        return false;
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        
        // Damage effect
        if (this.mesh && this.health > 0) {
            const originalColor = this.mesh.material.color.clone();
            this.mesh.material.color.setHex(0xFF0000);
            
            setTimeout(() => {
                if (this.mesh) {
                    this.mesh.material.color.copy(originalColor);
                }
            }, 200);
        }
        
        if (this.health <= 0) {
            this.die();
        }
    }
    
    die() {
        // Remove from scene
        if (this.mesh) {
            this.gameEngine.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
        
        // Drop items
        this.dropLoot();
        
        // Mark for removal
        this.isDead = true;
    }
    
    dropLoot() {
        if (!window.inventory) return;
        
        // Drop emeralds and items based on enemy type
        let emeraldDrop = 0;
        let itemDrops = [];
        
        switch (this.type) {
            case 'pig_person':
                emeraldDrop = Math.floor(Math.random() * 3) + 1;
                if (Math.random() < 0.3) {
                    itemDrops.push('bread');
                }
                break;
                
            case 'sick_villager':
                emeraldDrop = Math.floor(Math.random() * 2) + 1;
                if (Math.random() < 0.2) {
                    itemDrops.push('apple');
                }
                break;
                
            case 'portal_guardian':
                emeraldDrop = Math.floor(Math.random() * 8) + 5;
                itemDrops.push('obsidian');
                if (Math.random() < 0.5) {
                    itemDrops.push('emerald_ore');
                }
                break;
        }
        
        // Add emeralds to player
        if (window.player && emeraldDrop > 0) {
            window.player.addEmeralds(emeraldDrop);
        }
        
        // Add items to inventory
        itemDrops.forEach(item => {
            window.inventory.addItem(item, 1);
        });
    }
}

// Enemy Manager
class EnemyManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.enemies = [];
        this.maxEnemies = 50;
        this.spawnTimer = 0;
        this.spawnInterval = 10; // Spawn every 10 seconds
    }
    
    update(deltaTime) {
        // Update all enemies
        this.enemies.forEach(enemy => {
            enemy.update(deltaTime);
        });
        
        // Remove dead enemies
        this.enemies = this.enemies.filter(enemy => !enemy.isDead);
        
        // Spawn new enemies
        this.spawnTimer += deltaTime;
        if (this.spawnTimer >= this.spawnInterval && this.enemies.length < this.maxEnemies) {
            this.spawnRandomEnemy();
            this.spawnTimer = 0;
        }
    }
    
    spawnRandomEnemy() {
        if (!window.player) return;
        
        // Spawn enemies around the player but not too close
        const player = window.player;
        const angle = Math.random() * Math.PI * 2;
        const distance = 20 + Math.random() * 30; // 20-50 blocks away
        
        const spawnX = player.position.x + Math.cos(angle) * distance;
        const spawnZ = player.position.z + Math.sin(angle) * distance;
        const spawnY = this.gameEngine.worldGenerator ? 
            this.gameEngine.worldGenerator.getHeight(spawnX, spawnZ) + 1 :
            player.position.y;
        
        const spawnPos = new THREE.Vector3(spawnX, spawnY, spawnZ);
        
        // Random enemy type
        const enemyTypes = ['pig_person', 'sick_villager'];
        const randomType = enemyTypes[Math.floor(Math.random() * enemyTypes.length)];
        
        const enemy = new Enemy(randomType, spawnPos, this.gameEngine);
        this.enemies.push(enemy);
    }
    
    spawnSickVillagers(centerX, centerY, centerZ, count) {
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const distance = 3 + Math.random() * 5;
            
            const spawnX = centerX + Math.cos(angle) * distance;
            const spawnZ = centerZ + Math.sin(angle) * distance;
            const spawnPos = new THREE.Vector3(spawnX, centerY, spawnZ);
            
            const enemy = new Enemy('sick_villager', spawnPos, this.gameEngine);
            this.enemies.push(enemy);
        }
    }
    
    spawnPortalGuardian(portalX, portalY, portalZ) {
        const spawnPos = new THREE.Vector3(portalX, portalY + 1, portalZ);
        const guardian = new Enemy('portal_guardian', spawnPos, this.gameEngine);
        this.enemies.push(guardian);
        return guardian;
    }
    
    getEnemiesInRange(position, range) {
        return this.enemies.filter(enemy => 
            enemy.position.distanceTo(position) <= range
        );
    }
    
    removeAllEnemies() {
        this.enemies.forEach(enemy => enemy.die());
        this.enemies = [];
    }
}

// Export for use in other modules
window.Enemy = Enemy;
window.EnemyManager = EnemyManager;