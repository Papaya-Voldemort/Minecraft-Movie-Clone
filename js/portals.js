// Portal and Dimension System
class Portal {
    constructor(position, gameEngine, destinationDimension = 'pig_dimension') {
        this.position = position.clone();
        this.gameEngine = gameEngine;
        this.id = Math.random().toString(36).substr(2, 9);
        
        // Portal properties
        this.destinationDimension = destinationDimension;
        this.isActive = true;
        this.cooldown = 0;
        this.maxCooldown = 2; // 2 second cooldown between uses
        
        // Visual effects
        this.particles = [];
        this.animationTime = 0;
        this.pulseSpeed = 2;
        
        // Portal dimensions
        this.width = 3;
        this.height = 4;
        this.depth = 1;
        
        // Effects and sounds
        this.effects = [];
        this.isPlayerNear = false;
        this.activationRange = 2;
        
        // Create portal visual
        this.createPortalEffects();
        
        // Spawn guardian if needed
        this.spawnGuardian();
    }
    
    createPortalEffects() {
        // Create portal particles and effects
        const particleCount = 50;
        
        for (let i = 0; i < particleCount; i++) {
            const particle = this.createPortalParticle();
            this.particles.push(particle);
            this.gameEngine.scene.add(particle);
        }
        
        // Create portal center effect
        this.createPortalCenter();
    }
    
    createPortalParticle() {
        const geometry = new THREE.SphereGeometry(0.05 + Math.random() * 0.05, 6, 6);
        const material = new THREE.MeshBasicMaterial({
            color: this.getPortalColor(),
            transparent: true,
            opacity: 0.7 + Math.random() * 0.3
        });
        
        const particle = new THREE.Mesh(geometry, material);
        
        // Random position within portal area
        particle.position.set(
            this.position.x + (Math.random() - 0.5) * this.width,
            this.position.y + Math.random() * this.height,
            this.position.z + (Math.random() - 0.5) * this.depth
        );
        
        // Animation properties
        particle.userData = {
            originalY: particle.position.y,
            speed: 0.5 + Math.random() * 1,
            amplitude: 0.3 + Math.random() * 0.5,
            phase: Math.random() * Math.PI * 2
        };
        
        return particle;
    }
    
    createPortalCenter() {
        // Central portal effect
        const geometry = new THREE.PlaneGeometry(this.width - 0.5, this.height - 0.5);
        const material = new THREE.MeshBasicMaterial({
            color: this.getPortalColor(),
            transparent: true,
            opacity: 0.3,
            side: THREE.DoubleSide
        });
        
        this.centerPlane = new THREE.Mesh(geometry, material);
        this.centerPlane.position.copy(this.position);
        this.centerPlane.position.y += this.height / 2;
        
        this.gameEngine.scene.add(this.centerPlane);
    }
    
    getPortalColor() {
        const colors = {
            'pig_dimension': 0xFF1493, // Pink for pig dimension
            'nether': 0x8B0000,        // Dark red for nether
            'end': 0x9932CC,           // Purple for end
            'void': 0x191970,          // Dark blue for void
            'overworld': 0x87CEEB      // Sky blue for overworld
        };
        
        return colors[this.destinationDimension] || 0x8A2BE2;
    }
    
    spawnGuardian() {
        // Some portals have guardians
        if (Math.random() < 0.3 && window.enemyManager) { // 30% chance
            const guardianPos = this.position.clone();
            guardianPos.y += 1;
            
            const guardian = window.enemyManager.spawnPortalGuardian(
                guardianPos.x, 
                guardianPos.y, 
                guardianPos.z
            );
            
            if (guardian) {
                this.guardian = guardian;
                console.log(`Portal guardian spawned at portal ${this.id}`);
            }
        }
    }
    
    update(deltaTime) {
        this.animationTime += deltaTime;
        this.cooldown = Math.max(0, this.cooldown - deltaTime);
        
        // Update particle effects
        this.updateParticles(deltaTime);
        
        // Update center plane
        if (this.centerPlane) {
            this.centerPlane.material.opacity = 0.3 + Math.sin(this.animationTime * this.pulseSpeed) * 0.2;
            this.centerPlane.rotation.z += deltaTime;
        }
        
        // Check for player proximity
        this.checkPlayerProximity();
        
        // Update portal effects
        this.updateEffects(deltaTime);
    }
    
    updateParticles(deltaTime) {
        this.particles.forEach(particle => {
            const userData = particle.userData;
            
            // Floating animation
            particle.position.y = userData.originalY + 
                Math.sin(this.animationTime * userData.speed + userData.phase) * userData.amplitude;
            
            // Rotation
            particle.rotation.x += deltaTime * userData.speed;
            particle.rotation.y += deltaTime * userData.speed * 0.5;
            
            // Opacity pulsing
            particle.material.opacity = 0.5 + Math.sin(this.animationTime * 3 + userData.phase) * 0.3;
            
            // Gentle orbital movement
            const orbitSpeed = 0.5;
            const orbitRadius = 0.2;
            particle.position.x = this.position.x + 
                (Math.random() - 0.5) * this.width + 
                Math.cos(this.animationTime * orbitSpeed + userData.phase) * orbitRadius;
            particle.position.z = this.position.z + 
                (Math.random() - 0.5) * this.depth + 
                Math.sin(this.animationTime * orbitSpeed + userData.phase) * orbitRadius;
        });
    }
    
    checkPlayerProximity() {
        if (!window.player) return;
        
        const distance = this.position.distanceTo(window.player.position);
        const wasNear = this.isPlayerNear;
        this.isPlayerNear = distance <= this.activationRange;
        
        // Player entered portal range
        if (this.isPlayerNear && !wasNear) {
            this.onPlayerApproach();
        }
        
        // Player is in portal (teleport trigger)
        if (distance <= 1 && this.cooldown <= 0) {
            this.transportPlayer(window.player);
        }
    }
    
    onPlayerApproach() {
        // Intensify effects when player approaches
        this.pulseSpeed = 4;
        
        // Create approach effect
        this.createApproachEffect();
        
        setTimeout(() => {
            this.pulseSpeed = 2;
        }, 2000);
    }
    
    createApproachEffect() {
        // Create ring effect around portal
        const ringGeometry = new THREE.RingGeometry(2, 3, 16);
        const ringMaterial = new THREE.MeshBasicMaterial({
            color: this.getPortalColor(),
            transparent: true,
            opacity: 0.5,
            side: THREE.DoubleSide
        });
        
        const ring = new THREE.Mesh(ringGeometry, ringMaterial);
        ring.position.copy(this.position);
        ring.position.y += 0.1;
        ring.rotation.x = -Math.PI / 2;
        
        this.gameEngine.scene.add(ring);
        
        // Animate ring
        let scale = 0;
        const animate = () => {
            scale += 0.1;
            ring.scale.setScalar(scale);
            ring.material.opacity = 0.5 - (scale * 0.1);
            
            if (scale < 5) {
                requestAnimationFrame(animate);
            } else {
                this.gameEngine.scene.remove(ring);
                ring.geometry.dispose();
                ring.material.dispose();
            }
        };
        animate();
    }
    
    transportPlayer(player) {
        if (!this.isActive || this.cooldown > 0) return;
        
        console.log(`Transporting player to ${this.destinationDimension}`);
        
        // Set cooldown
        this.cooldown = this.maxCooldown;
        
        // Create transport effect
        this.createTransportEffect(player);
        
        // Transport after effect delay
        setTimeout(() => {
            this.executeTransport(player);
        }, 1000);
    }
    
    createTransportEffect(player) {
        // Flash effect
        const flash = document.createElement('div');
        flash.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, ${this.getPortalColorHex()} 0%, transparent 70%);
            pointer-events: none;
            z-index: 999;
            opacity: 0;
            transition: opacity 0.5s ease;
        `;
        
        document.body.appendChild(flash);
        
        // Fade in then out
        setTimeout(() => {
            flash.style.opacity = '0.8';
        }, 10);
        
        setTimeout(() => {
            flash.style.opacity = '0';
            setTimeout(() => {
                flash.remove();
            }, 500);
        }, 500);
        
        // Particle burst effect
        this.createParticleBurst(player.position);
    }
    
    createParticleBurst(position) {
        const burstParticles = 20;
        
        for (let i = 0; i < burstParticles; i++) {
            const geometry = new THREE.SphereGeometry(0.1, 6, 6);
            const material = new THREE.MeshBasicMaterial({
                color: this.getPortalColor(),
                transparent: true,
                opacity: 1
            });
            
            const particle = new THREE.Mesh(geometry, material);
            particle.position.copy(position);
            
            // Random direction
            const direction = new THREE.Vector3(
                (Math.random() - 0.5) * 2,
                Math.random(),
                (Math.random() - 0.5) * 2
            ).normalize();
            
            const speed = 5 + Math.random() * 5;
            
            this.gameEngine.scene.add(particle);
            
            // Animate particle
            let life = 1;
            const animate = () => {
                life -= 0.02;
                particle.position.add(direction.clone().multiplyScalar(speed * 0.016));
                particle.material.opacity = life;
                particle.scale.setScalar(life);
                
                if (life > 0) {
                    requestAnimationFrame(animate);
                } else {
                    this.gameEngine.scene.remove(particle);
                    particle.geometry.dispose();
                    particle.material.dispose();
                }
            };
            animate();
        }
    }
    
    executeTransport(player) {
        // Transport logic based on destination
        switch (this.destinationDimension) {
            case 'pig_dimension':
                this.transportToPigDimension(player);
                break;
            case 'overworld':
                this.transportToOverworld(player);
                break;
            case 'nether':
                this.transportToNether(player);
                break;
            case 'void':
                this.transportToVoid(player);
                break;
            default:
                this.transportToRandomLocation(player);
        }
        
        // Spawn enemies in new dimension
        if (this.destinationDimension === 'pig_dimension') {
            this.spawnDimensionEnemies();
        }
    }
    
    transportToPigDimension(player) {
        // Transport to pig dimension (pink sky, pig enemies)
        const newX = Math.random() * 200 - 100;
        const newZ = Math.random() * 200 - 100;
        const newY = 35;
        
        player.position.set(newX, newY, newZ);
        
        // Change environment
        this.gameEngine.scene.fog.color.setHex(0xFF69B4); // Pink fog
        this.gameEngine.renderer.setClearColor(0xFF69B4);
        
        this.showDimensionMessage("Welcome to the Pig Dimension!");
    }
    
    transportToOverworld(player) {
        // Return to normal overworld
        player.position.set(0, 35, 0);
        
        // Reset environment
        this.gameEngine.scene.fog.color.setHex(0x87CEEB); // Sky blue fog
        this.gameEngine.renderer.setClearColor(0x87CEEB);
        
        this.showDimensionMessage("Returned to the Overworld");
    }
    
    transportToNether(player) {
        // Transport to nether-like dimension
        const newX = Math.random() * 100 - 50;
        const newZ = Math.random() * 100 - 50;
        const newY = 20;
        
        player.position.set(newX, newY, newZ);
        
        // Dark red environment
        this.gameEngine.scene.fog.color.setHex(0x8B0000);
        this.gameEngine.renderer.setClearColor(0x8B0000);
        
        this.showDimensionMessage("Entered the Nether Realm!");
    }
    
    transportToVoid(player) {
        // Transport to void dimension
        const newX = Math.random() * 50 - 25;
        const newZ = Math.random() * 50 - 25;
        const newY = 100; // High in the air
        
        player.position.set(newX, newY, newZ);
        
        // Dark void environment
        this.gameEngine.scene.fog.color.setHex(0x191970);
        this.gameEngine.renderer.setClearColor(0x000000);
        
        this.showDimensionMessage("You've entered the Void...");
    }
    
    transportToRandomLocation(player) {
        // Random teleport within current dimension
        const distance = 50 + Math.random() * 100;
        const angle = Math.random() * Math.PI * 2;
        
        const newX = player.position.x + Math.cos(angle) * distance;
        const newZ = player.position.z + Math.sin(angle) * distance;
        const newY = 35;
        
        player.position.set(newX, newY, newZ);
        
        this.showDimensionMessage("Teleported to a distant location!");
    }
    
    spawnDimensionEnemies() {
        // Spawn pig people when entering pig dimension
        if (window.enemyManager) {
            const enemyCount = 3 + Math.floor(Math.random() * 5);
            
            for (let i = 0; i < enemyCount; i++) {
                setTimeout(() => {
                    window.enemyManager.spawnRandomEnemy();
                }, i * 1000);
            }
        }
    }
    
    showDimensionMessage(message) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            background: rgba(0, 0, 0, 0.8);
            color: ${this.getPortalColorHex()};
            padding: 20px 40px;
            border-radius: 10px;
            font-size: 1.5rem;
            font-weight: bold;
            z-index: 1000;
            text-align: center;
            border: 2px solid ${this.getPortalColorHex()};
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 1s ease';
            setTimeout(() => {
                messageDiv.remove();
            }, 1000);
        }, 3000);
    }
    
    getPortalColorHex() {
        const color = this.getPortalColor();
        return `#${color.toString(16).padStart(6, '0')}`;
    }
    
    updateEffects(deltaTime) {
        // Update any ongoing effects
        this.effects = this.effects.filter(effect => {
            effect.timer -= deltaTime;
            return effect.timer > 0;
        });
    }
    
    destroy() {
        // Clean up portal
        this.particles.forEach(particle => {
            this.gameEngine.scene.remove(particle);
            particle.geometry.dispose();
            particle.material.dispose();
        });
        
        if (this.centerPlane) {
            this.gameEngine.scene.remove(this.centerPlane);
            this.centerPlane.geometry.dispose();
            this.centerPlane.material.dispose();
        }
        
        this.particles = [];
        this.isActive = false;
    }
}

// Portal Manager
class PortalManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.portals = [];
        this.currentDimension = 'overworld';
        this.discoveredDimensions = new Set(['overworld']);
    }
    
    registerPortal(x, y, z, destinationDimension = 'pig_dimension') {
        const portal = new Portal(
            new THREE.Vector3(x, y, z), 
            this.gameEngine, 
            destinationDimension
        );
        
        this.portals.push(portal);
        console.log(`Portal registered at (${x}, ${y}, ${z}) -> ${destinationDimension}`);
        return portal;
    }
    
    createPortalPair(pos1, pos2, dimension1 = 'overworld', dimension2 = 'pig_dimension') {
        // Create linked portals
        const portal1 = this.registerPortal(pos1.x, pos1.y, pos1.z, dimension2);
        const portal2 = this.registerPortal(pos2.x, pos2.y, pos2.z, dimension1);
        
        // Link them
        portal1.linkedPortal = portal2;
        portal2.linkedPortal = portal1;
        
        return { portal1, portal2 };
    }
    
    update(deltaTime) {
        // Update all portals
        this.portals.forEach(portal => {
            if (portal.isActive) {
                portal.update(deltaTime);
            }
        });
    }
    
    transportPlayer(player) {
        // Find nearest active portal
        let nearestPortal = null;
        let minDistance = 2;
        
        this.portals.forEach(portal => {
            if (!portal.isActive) return;
            
            const distance = portal.position.distanceTo(player.position);
            if (distance < minDistance) {
                nearestPortal = portal;
                minDistance = distance;
            }
        });
        
        if (nearestPortal) {
            nearestPortal.transportPlayer(player);
            return true;
        }
        
        return false;
    }
    
    findPortalsNear(position, radius = 10) {
        return this.portals.filter(portal => 
            portal.isActive && portal.position.distanceTo(position) <= radius
        );
    }
    
    setCurrentDimension(dimension) {
        this.currentDimension = dimension;
        this.discoveredDimensions.add(dimension);
        
        // Update environment based on dimension
        this.updateDimensionEnvironment(dimension);
    }
    
    updateDimensionEnvironment(dimension) {
        const environments = {
            'overworld': {
                fogColor: 0x87CEEB,
                clearColor: 0x87CEEB,
                ambientColor: 0x404040,
                lightColor: 0xffffff
            },
            'pig_dimension': {
                fogColor: 0xFF69B4,
                clearColor: 0xFF69B4,
                ambientColor: 0x604040,
                lightColor: 0xffcccc
            },
            'nether': {
                fogColor: 0x8B0000,
                clearColor: 0x8B0000,
                ambientColor: 0x400000,
                lightColor: 0xff4444
            },
            'void': {
                fogColor: 0x191970,
                clearColor: 0x000000,
                ambientColor: 0x202040,
                lightColor: 0x4444ff
            }
        };
        
        const env = environments[dimension] || environments['overworld'];
        
        // Update scene environment
        this.gameEngine.scene.fog.color.setHex(env.fogColor);
        this.gameEngine.renderer.setClearColor(env.clearColor);
        
        // Update lighting
        const ambientLight = this.gameEngine.scene.children.find(child => 
            child instanceof THREE.AmbientLight
        );
        if (ambientLight) {
            ambientLight.color.setHex(env.ambientColor);
        }
        
        const directionalLight = this.gameEngine.scene.children.find(child => 
            child instanceof THREE.DirectionalLight
        );
        if (directionalLight) {
            directionalLight.color.setHex(env.lightColor);
        }
    }
    
    spawnRandomPortal(centerPosition, radius = 50) {
        // Spawn portal at random location within radius
        const angle = Math.random() * Math.PI * 2;
        const distance = Math.random() * radius;
        
        const x = centerPosition.x + Math.cos(angle) * distance;
        const z = centerPosition.z + Math.sin(angle) * distance;
        const y = centerPosition.y;
        
        // Random destination dimension
        const dimensions = ['pig_dimension', 'nether', 'void'];
        const randomDimension = dimensions[Math.floor(Math.random() * dimensions.length)];
        
        return this.registerPortal(x, y, z, randomDimension);
    }
    
    activatePortal(portalId) {
        const portal = this.portals.find(p => p.id === portalId);
        if (portal) {
            portal.isActive = true;
        }
    }
    
    deactivatePortal(portalId) {
        const portal = this.portals.find(p => p.id === portalId);
        if (portal) {
            portal.isActive = false;
        }
    }
    
    removePortal(portalId) {
        const index = this.portals.findIndex(p => p.id === portalId);
        if (index !== -1) {
            const portal = this.portals[index];
            portal.destroy();
            this.portals.splice(index, 1);
        }
    }
    
    removeAllPortals() {
        this.portals.forEach(portal => portal.destroy());
        this.portals = [];
    }
    
    getPortalStats() {
        return {
            totalPortals: this.portals.length,
            activePortals: this.portals.filter(p => p.isActive).length,
            currentDimension: this.currentDimension,
            discoveredDimensions: Array.from(this.discoveredDimensions)
        };
    }
}

// Export for use in other modules
window.Portal = Portal;
window.PortalManager = PortalManager;