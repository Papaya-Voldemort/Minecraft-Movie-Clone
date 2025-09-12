// Village System with NPCs and Trading
class Villager {
    constructor(type, position, gameEngine) {
        this.type = type;
        this.position = position.clone();
        this.gameEngine = gameEngine;
        this.id = Math.random().toString(36).substr(2, 9);
        
        // Setup villager properties
        this.setupVillagerData();
        
        // AI state
        this.state = 'idle'; // idle, walking, trading, working
        this.stateTimer = 0;
        this.workTimer = 0;
        this.workInterval = 10; // Work every 10 seconds
        
        // Movement
        this.velocity = new THREE.Vector3();
        this.targetPosition = position.clone();
        this.moveSpeed = 1;
        this.homePosition = position.clone();
        this.workPosition = position.clone();
        
        // Trading
        this.isTrading = false;
        this.tradePartner = null;
        this.tradeTimer = 0;
        
        // Visual representation
        this.mesh = null;
        this.nameTag = null;
        this.createMesh();
        
        // Generate patrol area
        this.generatePatrolArea();
    }
    
    setupVillagerData() {
        const villagerData = {
            'blacksmith': {
                name: 'Blacksmith',
                color: 0x8B4513,
                trades: {
                    'emerald_sword': 15,
                    'emerald_pickaxe': 12,
                    'emerald_axe': 10,
                    'emerald_helmet': 8,
                    'emerald_chestplate': 15,
                    'emerald_leggings': 12,
                    'emerald_boots': 6
                },
                workStation: 'anvil'
            },
            
            'farmer': {
                name: 'Farmer',
                color: 0x228B22,
                trades: {
                    'bread': 1,
                    'apple': 2,
                    'golden_apple': 5,
                    'wheat': 1
                },
                workStation: 'crop'
            },
            
            'merchant': {
                name: 'Merchant',
                color: 0x4B0082,
                trades: {
                    'emerald_ore': 3,
                    'obsidian': 5,
                    'golden_apple': 8
                },
                workStation: 'chest'
            },
            
            'guard': {
                name: 'Guard',
                color: 0x696969,
                trades: {
                    'leather_helmet': 3,
                    'leather_chestplate': 5,
                    'leather_leggings': 4,
                    'leather_boots': 2
                },
                workStation: 'weapon_rack'
            },
            
            'priest': {
                name: 'Priest',
                color: 0xFFFFFF,
                trades: {
                    'bread': 1,
                    'golden_apple': 10
                },
                workStation: 'altar',
                canHeal: true
            }
        };
        
        const data = villagerData[this.type] || villagerData['farmer'];
        this.name = data.name;
        this.color = data.color;
        this.trades = data.trades || {};
        this.workStation = data.workStation;
        this.canHeal = data.canHeal || false;
        this.health = 50;
        this.maxHealth = 50;
    }
    
    createMesh() {
        // Create villager body
        const bodyGeometry = new THREE.BoxGeometry(0.6, 1.6, 0.4);
        const bodyMaterial = new THREE.MeshLambertMaterial({ color: this.color });
        
        this.mesh = new THREE.Mesh(bodyGeometry, bodyMaterial);
        this.mesh.position.copy(this.position);
        this.mesh.position.y += 0.8;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Add head
        const headGeometry = new THREE.BoxGeometry(0.4, 0.4, 0.4);
        const headMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAC });
        const head = new THREE.Mesh(headGeometry, headMaterial);
        head.position.set(0, 1, 0);
        this.mesh.add(head);
        
        // Add nose (villager characteristic)
        const noseGeometry = new THREE.BoxGeometry(0.1, 0.1, 0.2);
        const noseMaterial = new THREE.MeshLambertMaterial({ color: 0xFFDBAC });
        const nose = new THREE.Mesh(noseGeometry, noseMaterial);
        nose.position.set(0, 0, 0.2);
        head.add(nose);
        
        // Add profession-specific features
        this.addProfessionFeatures();
        
        // Add to scene
        this.gameEngine.scene.add(this.mesh);
        
        // Create interaction trigger
        this.mesh.userData = { villager: this, interactable: true };
    }
    
    addProfessionFeatures() {
        switch (this.type) {
            case 'blacksmith':
                this.addApron(0x654321);
                break;
            case 'farmer':
                this.addHat(0x8B4513);
                break;
            case 'merchant':
                this.addCloak(0x800080);
                break;
            case 'guard':
                this.addArmor();
                break;
            case 'priest':
                this.addRobes(0xFFFFFF);
                break;
        }
    }
    
    addApron(color) {
        const apronGeometry = new THREE.BoxGeometry(0.65, 1, 0.1);
        const apronMaterial = new THREE.MeshLambertMaterial({ color: color });
        const apron = new THREE.Mesh(apronGeometry, apronMaterial);
        apron.position.set(0, 0, 0.25);
        this.mesh.add(apron);
    }
    
    addHat(color) {
        const hatGeometry = new THREE.CylinderGeometry(0.25, 0.3, 0.1, 8);
        const hatMaterial = new THREE.MeshLambertMaterial({ color: color });
        const hat = new THREE.Mesh(hatGeometry, hatMaterial);
        hat.position.set(0, 1.25, 0);
        this.mesh.add(hat);
    }
    
    addCloak(color) {
        const cloakGeometry = new THREE.BoxGeometry(0.8, 1.4, 0.1);
        const cloakMaterial = new THREE.MeshLambertMaterial({ color: color });
        const cloak = new THREE.Mesh(cloakGeometry, cloakMaterial);
        cloak.position.set(0, 0, -0.25);
        this.mesh.add(cloak);
    }
    
    addArmor() {
        const armorGeometry = new THREE.BoxGeometry(0.65, 1.2, 0.45);
        const armorMaterial = new THREE.MeshLambertMaterial({ color: 0x708090 });
        const armor = new THREE.Mesh(armorGeometry, armorMaterial);
        armor.position.set(0, 0, 0);
        this.mesh.add(armor);
    }
    
    addRobes(color) {
        const robeGeometry = new THREE.BoxGeometry(0.8, 1.8, 0.5);
        const robeMaterial = new THREE.MeshLambertMaterial({ color: color });
        const robe = new THREE.Mesh(robeMaterial, robeGeometry);
        robe.position.set(0, -0.1, 0);
        this.mesh.add(robe);
    }
    
    generatePatrolArea() {
        // Create patrol points around home position
        this.patrolPoints = [];
        const numPoints = 3;
        
        for (let i = 0; i < numPoints; i++) {
            const angle = (i / numPoints) * Math.PI * 2;
            const distance = 2 + Math.random() * 3;
            
            const x = this.homePosition.x + Math.cos(angle) * distance;
            const z = this.homePosition.z + Math.sin(angle) * distance;
            const y = this.homePosition.y;
            
            this.patrolPoints.push(new THREE.Vector3(x, y, z));
        }
        
        this.currentPatrolIndex = 0;
    }
    
    update(deltaTime) {
        this.stateTimer += deltaTime;
        this.workTimer += deltaTime;
        
        // Update AI behavior
        this.updateAI(deltaTime);
        
        // Update movement
        this.updateMovement(deltaTime);
        
        // Update visual position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.position.y += 0.8;
        }
        
        // Work behavior
        if (this.workTimer >= this.workInterval && this.state === 'idle') {
            this.startWorking();
            this.workTimer = 0;
        }
    }
    
    updateAI(deltaTime) {
        switch (this.state) {
            case 'idle':
                if (this.stateTimer > 3 + Math.random() * 5) {
                    this.state = 'walking';
                    this.selectNewDestination();
                    this.stateTimer = 0;
                }
                break;
                
            case 'walking':
                const distance = this.position.distanceTo(this.targetPosition);
                if (distance < 0.5) {
                    this.state = 'idle';
                    this.stateTimer = 0;
                }
                break;
                
            case 'working':
                if (this.stateTimer > 5) {
                    this.state = 'idle';
                    this.stateTimer = 0;
                }
                break;
                
            case 'trading':
                this.tradeTimer += deltaTime;
                if (this.tradeTimer > 10 || !this.tradePartner) {
                    this.endTrade();
                }
                break;
        }
    }
    
    updateMovement(deltaTime) {
        if (this.state !== 'walking') {
            this.velocity.multiplyScalar(0.8);
            return;
        }
        
        // Move towards target
        const direction = this.targetPosition.clone().sub(this.position);
        direction.y = 0; // Don't move vertically
        
        if (direction.length() > 0.1) {
            direction.normalize();
            this.velocity.x = direction.x * this.moveSpeed;
            this.velocity.z = direction.z * this.moveSpeed;
            
            // Face movement direction
            if (this.mesh) {
                this.mesh.lookAt(this.targetPosition);
            }
        }
        
        // Apply movement
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Ground collision
        const groundY = this.getGroundLevel(this.position.x, this.position.z);
        this.position.y = groundY;
    }
    
    getGroundLevel(x, z) {
        if (!this.gameEngine.worldGenerator) return this.homePosition.y;
        return this.gameEngine.worldGenerator.getHeight(x, z) + 1;
    }
    
    selectNewDestination() {
        if (this.patrolPoints.length === 0) return;
        
        // Select next patrol point
        this.targetPosition = this.patrolPoints[this.currentPatrolIndex].clone();
        this.currentPatrolIndex = (this.currentPatrolIndex + 1) % this.patrolPoints.length;
    }
    
    startWorking() {
        this.state = 'working';
        this.stateTimer = 0;
        
        // Move to work position if different from current
        if (this.workPosition.distanceTo(this.position) > 1) {
            this.targetPosition = this.workPosition.clone();
            this.state = 'walking';
        }
        
        // Work animation (simple scale effect)
        if (this.mesh) {
            const originalScale = this.mesh.scale.clone();
            this.mesh.scale.y *= 0.9;
            
            setTimeout(() => {
                if (this.mesh) {
                    this.mesh.scale.copy(originalScale);
                }
            }, 500);
        }
    }
    
    startTrade(player) {
        if (this.isTrading) return false;
        
        this.isTrading = true;
        this.tradePartner = player;
        this.state = 'trading';
        this.tradeTimer = 0;
        
        // Face the player
        if (this.mesh && player) {
            this.mesh.lookAt(player.position);
        }
        
        this.showTradeUI();
        return true;
    }
    
    endTrade() {
        this.isTrading = false;
        this.tradePartner = null;
        this.state = 'idle';
        this.tradeTimer = 0;
        this.hideTradeUI();
    }
    
    showTradeUI() {
        // Create trade interface
        this.createTradeInterface();
    }
    
    hideTradeUI() {
        const tradeUI = document.getElementById('trade-ui');
        if (tradeUI) {
            tradeUI.remove();
        }
    }
    
    createTradeInterface() {
        // Remove existing trade UI
        this.hideTradeUI();
        
        const tradeUI = document.createElement('div');
        tradeUI.id = 'trade-ui';
        tradeUI.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.9);
            border: 2px solid #666;
            border-radius: 10px;
            padding: 20px;
            color: white;
            z-index: 1000;
            max-width: 400px;
            width: 90%;
        `;
        
        tradeUI.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 15px;">
                <h3>Trading with ${this.name}</h3>
                <button id="close-trade" style="background: none; border: none; color: white; font-size: 1.5rem; cursor: pointer;">×</button>
            </div>
            <div id="trade-items" style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; max-height: 300px; overflow-y: auto;">
                ${this.generateTradeItems()}
            </div>
            ${this.canHeal ? '<button id="heal-button" style="width: 100%; margin-top: 10px; padding: 10px; background: #27ae60; color: white; border: none; border-radius: 5px; cursor: pointer;">Heal (5 Emeralds)</button>' : ''}
        `;
        
        document.body.appendChild(tradeUI);
        
        // Setup event listeners
        document.getElementById('close-trade').addEventListener('click', () => {
            this.endTrade();
        });
        
        // Setup trade buttons
        Object.keys(this.trades).forEach(item => {
            const button = document.getElementById(`trade-${item}`);
            if (button) {
                button.addEventListener('click', () => {
                    this.executeTrade(item);
                });
            }
        });
        
        // Setup heal button
        if (this.canHeal) {
            const healButton = document.getElementById('heal-button');
            if (healButton) {
                healButton.addEventListener('click', () => {
                    this.executeHeal();
                });
            }
        }
        
        // Close on ESC
        const escapeHandler = (e) => {
            if (e.key === 'Escape') {
                this.endTrade();
                document.removeEventListener('keydown', escapeHandler);
            }
        };
        document.addEventListener('keydown', escapeHandler);
    }
    
    generateTradeItems() {
        let html = '';
        
        Object.entries(this.trades).forEach(([item, cost]) => {
            const itemDef = window.inventory ? window.inventory.itemDefinitions[item] : null;
            const itemName = itemDef ? itemDef.name : item;
            const canAfford = window.player ? window.player.emeralds >= cost : false;
            
            html += `
                <div style="border: 1px solid #666; border-radius: 5px; padding: 10px; background: ${canAfford ? 'rgba(46, 204, 113, 0.2)' : 'rgba(231, 76, 60, 0.2)'};">
                    <div style="font-weight: bold; margin-bottom: 5px;">${itemName}</div>
                    <div style="margin-bottom: 10px;">Cost: ${cost} 💎</div>
                    <button 
                        id="trade-${item}" 
                        style="width: 100%; padding: 5px; background: ${canAfford ? '#27ae60' : '#666'}; color: white; border: none; border-radius: 3px; cursor: ${canAfford ? 'pointer' : 'not-allowed'};"
                        ${!canAfford ? 'disabled' : ''}
                    >
                        ${canAfford ? 'Buy' : 'Not enough emeralds'}
                    </button>
                </div>
            `;
        });
        
        return html;
    }
    
    executeTrade(item) {
        if (!window.player || !window.inventory || !this.trades[item]) return;
        
        const cost = this.trades[item];
        
        if (window.player.emeralds >= cost) {
            if (window.player.spendEmeralds(cost)) {
                window.inventory.addItem(item, 1);
                
                // Success feedback
                this.showTradeMessage(`Purchased ${item} for ${cost} emeralds!`);
                
                // Refresh trade UI
                setTimeout(() => {
                    if (this.isTrading) {
                        this.showTradeUI();
                    }
                }, 1000);
            }
        } else {
            this.showTradeMessage("You don't have enough emeralds!");
        }
    }
    
    executeHeal() {
        if (!window.player || !this.canHeal) return;
        
        const healCost = 5;
        
        if (window.player.emeralds >= healCost && window.player.health < window.player.maxHealth) {
            if (window.player.spendEmeralds(healCost)) {
                window.player.heal(50);
                this.showTradeMessage("You have been healed!");
                
                // Healing effect
                if (this.mesh) {
                    const originalColor = this.mesh.material.color.clone();
                    this.mesh.material.color.setHex(0x00FF00);
                    
                    setTimeout(() => {
                        if (this.mesh) {
                            this.mesh.material.color.copy(originalColor);
                        }
                    }, 1000);
                }
            }
        } else if (window.player.health >= window.player.maxHealth) {
            this.showTradeMessage("You are already at full health!");
        } else {
            this.showTradeMessage("You need 5 emeralds for healing!");
        }
    }
    
    showTradeMessage(message) {
        // Show temporary message
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20px;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 10px 20px;
            border-radius: 5px;
            z-index: 1001;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.remove();
        }, 3000);
    }
    
    interact(player) {
        if (this.isTrading) return;
        
        // Check distance
        if (this.position.distanceTo(player.position) > 3) {
            return;
        }
        
        this.startTrade(player);
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
        
        // End any active trades
        if (this.isTrading) {
            this.endTrade();
        }
        
        this.isDead = true;
    }
}

// Village Manager
class VillageManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.villages = [];
        this.villagers = [];
        this.tradeSystem = new window.TradeSystem();
    }
    
    createVillage(centerX, centerY, centerZ) {
        const village = {
            id: Math.random().toString(36).substr(2, 9),
            center: new THREE.Vector3(centerX, centerY, centerZ),
            villagers: [],
            type: this.getRandomVillageType(),
            isHealthy: true
        };
        
        // Spawn villagers based on village type
        this.spawnVillagers(village);
        
        this.villages.push(village);
        return village;
    }
    
    getRandomVillageType() {
        const types = ['farming', 'trading', 'crafting', 'military', 'religious'];
        return types[Math.floor(Math.random() * types.length)];
    }
    
    spawnVillagers(village) {
        const villagerTypes = this.getVillagerTypesForVillage(village.type);
        const villagerCount = 3 + Math.floor(Math.random() * 4);
        
        for (let i = 0; i < villagerCount; i++) {
            const villagerType = villagerTypes[i % villagerTypes.length];
            
            // Position around village center
            const angle = (i / villagerCount) * Math.PI * 2;
            const distance = 3 + Math.random() * 5;
            
            const x = village.center.x + Math.cos(angle) * distance;
            const z = village.center.z + Math.sin(angle) * distance;
            const y = village.center.y;
            
            const villager = new Villager(villagerType, new THREE.Vector3(x, y, z), this.gameEngine);
            
            village.villagers.push(villager);
            this.villagers.push(villager);
        }
        
        console.log(`Created ${village.type} village with ${villagerCount} villagers`);
    }
    
    getVillagerTypesForVillage(villageType) {
        const villagerSets = {
            'farming': ['farmer', 'farmer', 'merchant', 'guard'],
            'trading': ['merchant', 'merchant', 'blacksmith', 'guard'],
            'crafting': ['blacksmith', 'blacksmith', 'merchant', 'farmer'],
            'military': ['guard', 'guard', 'blacksmith', 'priest'],
            'religious': ['priest', 'priest', 'farmer', 'guard']
        };
        
        return villagerSets[villageType] || villagerSets['farming'];
    }
    
    createSickVillage(centerX, centerY, centerZ) {
        const village = {
            id: Math.random().toString(36).substr(2, 9),
            center: new THREE.Vector3(centerX, centerY, centerZ),
            villagers: [],
            type: 'sick',
            isHealthy: false
        };
        
        // Spawn sick villagers (these become enemies)
        const sickCount = 2 + Math.floor(Math.random() * 3);
        
        for (let i = 0; i < sickCount; i++) {
            const angle = (i / sickCount) * Math.PI * 2;
            const distance = 2 + Math.random() * 4;
            
            const x = village.center.x + Math.cos(angle) * distance;
            const z = village.center.z + Math.sin(angle) * distance;
            const y = village.center.y;
            
            // These become sick villager enemies
            if (window.enemyManager) {
                const sickVillager = new window.Enemy('sick_villager', new THREE.Vector3(x, y, z), this.gameEngine);
                window.enemyManager.enemies.push(sickVillager);
            }
        }
        
        this.villages.push(village);
        console.log(`Created sick village with ${sickCount} sick villagers`);
        return village;
    }
    
    update(deltaTime) {
        // Update all villagers
        this.villagers.forEach(villager => {
            if (!villager.isDead) {
                villager.update(deltaTime);
            }
        });
        
        // Remove dead villagers
        this.villagers = this.villagers.filter(villager => !villager.isDead);
        
        // Update village states
        this.villages.forEach(village => {
            if (village.isHealthy) {
                // Remove dead villagers from village
                village.villagers = village.villagers.filter(villager => !villager.isDead);
                
                // If village has no villagers left, mark as abandoned
                if (village.villagers.length === 0) {
                    village.isAbandoned = true;
                }
            }
        });
    }
    
    findNearestVillager(position, maxDistance = 5) {
        let nearest = null;
        let minDistance = maxDistance;
        
        this.villagers.forEach(villager => {
            if (villager.isDead) return;
            
            const distance = villager.position.distanceTo(position);
            if (distance < minDistance) {
                nearest = villager;
                minDistance = distance;
            }
        });
        
        return nearest;
    }
    
    handlePlayerInteraction(player) {
        const nearestVillager = this.findNearestVillager(player.position, 3);
        
        if (nearestVillager) {
            nearestVillager.interact(player);
            return true;
        }
        
        return false;
    }
    
    infectVillage(villageId) {
        const village = this.villages.find(v => v.id === villageId);
        if (!village || !village.isHealthy) return;
        
        village.isHealthy = false;
        village.type = 'sick';
        
        // Convert villagers to sick enemies
        village.villagers.forEach(villager => {
            if (!villager.isDead && window.enemyManager) {
                // Remove villager
                villager.die();
                
                // Spawn sick enemy in same position
                const sickEnemy = new window.Enemy('sick_villager', villager.position.clone(), this.gameEngine);
                window.enemyManager.enemies.push(sickEnemy);
            }
        });
        
        village.villagers = [];
        console.log(`Village ${villageId} has been infected!`);
    }
    
    getVillageStats() {
        const healthy = this.villages.filter(v => v.isHealthy && !v.isAbandoned).length;
        const sick = this.villages.filter(v => !v.isHealthy).length;
        const abandoned = this.villages.filter(v => v.isAbandoned).length;
        
        return {
            total: this.villages.length,
            healthy: healthy,
            sick: sick,
            abandoned: abandoned,
            totalVillagers: this.villagers.filter(v => !v.isDead).length
        };
    }
    
    removeAllVillagers() {
        this.villagers.forEach(villager => villager.die());
        this.villagers = [];
        this.villages = [];
    }
}

// Export for use in other modules
window.Villager = Villager;
window.VillageManager = VillageManager;