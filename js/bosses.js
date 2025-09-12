// Boss System with 41 Unique Boss Fights
class Boss {
    constructor(type, position, gameEngine) {
        this.type = type;
        this.position = position.clone();
        this.gameEngine = gameEngine;
        this.id = Math.random().toString(36).substr(2, 9);
        
        // Setup boss-specific stats and abilities
        this.setupBossStats();
        
        // Common boss properties
        this.isActive = false;
        this.phase = 1;
        this.maxPhases = this.phases.length;
        this.phaseTimer = 0;
        this.abilityTimer = 0;
        this.nextAbilityTime = 3;
        
        // Movement and physics
        this.velocity = new THREE.Vector3();
        this.targetPosition = position.clone();
        this.isFlying = this.canFly || false;
        
        // Combat state
        this.target = null;
        this.attackCooldown = 0;
        this.lastAttackTime = 0;
        
        // Visual representation
        this.mesh = null;
        this.healthBar = null;
        this.createMesh();
        
        // Special effects
        this.effects = [];
        this.summonedMinions = [];
    }
    
    setupBossStats() {
        const bossData = this.getBossData(this.type);
        
        // Copy all properties from boss data
        Object.assign(this, bossData);
        
        this.health = this.maxHealth;
        
        // Initialize phase data
        if (!this.phases || this.phases.length === 0) {
            this.phases = [{ healthThreshold: 0, abilities: this.abilities || [] }];
        }
    }
    
    getBossData(type) {
        const bosses = {
            // 1-10: Pig Dimension Bosses
            'pig_king': {
                name: 'Pig King',
                maxHealth: 500,
                damage: 25,
                size: { width: 2, height: 3 },
                color: 0xFF1493,
                canFly: false,
                abilities: ['charge_attack', 'summon_pigs', 'ground_slam'],
                phases: [
                    { healthThreshold: 0.7, abilities: ['charge_attack'] },
                    { healthThreshold: 0.4, abilities: ['charge_attack', 'summon_pigs'] },
                    { healthThreshold: 0, abilities: ['charge_attack', 'summon_pigs', 'ground_slam'] }
                ]
            },
            
            'bacon_lord': {
                name: 'Bacon Lord',
                maxHealth: 400,
                damage: 20,
                size: { width: 1.8, height: 2.5 },
                color: 0xDC143C,
                canFly: false,
                abilities: ['bacon_rain', 'grease_pool', 'sizzle_burst'],
                phases: [
                    { healthThreshold: 0.5, abilities: ['bacon_rain'] },
                    { healthThreshold: 0, abilities: ['bacon_rain', 'grease_pool', 'sizzle_burst'] }
                ]
            },
            
            'ham_hammer': {
                name: 'Ham Hammer',
                maxHealth: 600,
                damage: 35,
                size: { width: 2.2, height: 2.8 },
                color: 0xB22222,
                canFly: false,
                abilities: ['hammer_slam', 'shockwave', 'meat_missile'],
                phases: [
                    { healthThreshold: 0.6, abilities: ['hammer_slam'] },
                    { healthThreshold: 0.3, abilities: ['hammer_slam', 'shockwave'] },
                    { healthThreshold: 0, abilities: ['hammer_slam', 'shockwave', 'meat_missile'] }
                ]
            },
            
            'swine_sorcerer': {
                name: 'Swine Sorcerer',
                maxHealth: 350,
                damage: 30,
                size: { width: 1.5, height: 2.2 },
                color: 0x8A2BE2,
                canFly: true,
                abilities: ['magic_blast', 'teleport', 'pig_transformation', 'magic_shield'],
                phases: [
                    { healthThreshold: 0.4, abilities: ['magic_blast', 'teleport'] },
                    { healthThreshold: 0, abilities: ['magic_blast', 'teleport', 'pig_transformation', 'magic_shield'] }
                ]
            },
            
            'porky_paladin': {
                name: 'Porky Paladin',
                maxHealth: 700,
                damage: 28,
                size: { width: 2, height: 2.6 },
                color: 0xFFD700,
                canFly: false,
                abilities: ['holy_smite', 'healing_aura', 'divine_shield', 'righteous_fury'],
                phases: [
                    { healthThreshold: 0.5, abilities: ['holy_smite', 'healing_aura'] },
                    { healthThreshold: 0, abilities: ['holy_smite', 'healing_aura', 'divine_shield', 'righteous_fury'] }
                ]
            },
            
            'mud_wrestler': {
                name: 'Mud Wrestler',
                maxHealth: 550,
                damage: 22,
                size: { width: 2.4, height: 2.2 },
                color: 0x8B4513,
                canFly: false,
                abilities: ['mud_throw', 'quicksand', 'dirty_tackle', 'mud_armor'],
                phases: [
                    { healthThreshold: 0.6, abilities: ['mud_throw', 'dirty_tackle'] },
                    { healthThreshold: 0, abilities: ['mud_throw', 'quicksand', 'dirty_tackle', 'mud_armor'] }
                ]
            },
            
            'truffle_hunter': {
                name: 'Truffle Hunter',
                maxHealth: 450,
                damage: 24,
                size: { width: 1.8, height: 2.4 },
                color: 0x654321,
                canFly: false,
                abilities: ['truffle_bomb', 'sniff_track', 'dig_attack', 'mushroom_cloud'],
                phases: [
                    { healthThreshold: 0.5, abilities: ['truffle_bomb', 'sniff_track'] },
                    { healthThreshold: 0, abilities: ['truffle_bomb', 'sniff_track', 'dig_attack', 'mushroom_cloud'] }
                ]
            },
            
            'oink_overlord': {
                name: 'Oink Overlord',
                maxHealth: 800,
                damage: 32,
                size: { width: 2.5, height: 3.2 },
                color: 0xFF69B4,
                canFly: true,
                abilities: ['sonic_oink', 'pig_army', 'flying_tackle', 'oink_storm'],
                phases: [
                    { healthThreshold: 0.7, abilities: ['sonic_oink'] },
                    { healthThreshold: 0.4, abilities: ['sonic_oink', 'pig_army'] },
                    { healthThreshold: 0, abilities: ['sonic_oink', 'pig_army', 'flying_tackle', 'oink_storm'] }
                ]
            },
            
            'snort_sniper': {
                name: 'Snort Sniper',
                maxHealth: 300,
                damage: 45,
                size: { width: 1.4, height: 2 },
                color: 0x228B22,
                canFly: false,
                abilities: ['snipe_shot', 'explosive_snot', 'camouflage', 'rapid_fire'],
                phases: [
                    { healthThreshold: 0.3, abilities: ['snipe_shot', 'camouflage'] },
                    { healthThreshold: 0, abilities: ['snipe_shot', 'explosive_snot', 'camouflage', 'rapid_fire'] }
                ]
            },
            
            'pork_emperor': {
                name: 'Pork Emperor',
                maxHealth: 1000,
                damage: 40,
                size: { width: 3, height: 4 },
                color: 0x800080,
                canFly: true,
                abilities: ['imperial_decree', 'crown_beam', 'royal_summons', 'emperor_rage'],
                phases: [
                    { healthThreshold: 0.8, abilities: ['imperial_decree'] },
                    { healthThreshold: 0.5, abilities: ['imperial_decree', 'crown_beam'] },
                    { healthThreshold: 0.2, abilities: ['imperial_decree', 'crown_beam', 'royal_summons'] },
                    { healthThreshold: 0, abilities: ['imperial_decree', 'crown_beam', 'royal_summons', 'emperor_rage'] }
                ]
            },
            
            // 11-20: Sick Village Bosses
            'plague_doctor': {
                name: 'Plague Doctor',
                maxHealth: 400,
                damage: 26,
                size: { width: 1.6, height: 2.4 },
                color: 0x2F4F4F,
                canFly: false,
                abilities: ['poison_gas', 'disease_spread', 'syringe_dart', 'quarantine'],
                phases: [
                    { healthThreshold: 0.5, abilities: ['poison_gas', 'syringe_dart'] },
                    { healthThreshold: 0, abilities: ['poison_gas', 'disease_spread', 'syringe_dart', 'quarantine'] }
                ]
            },
            
            'fever_fiend': {
                name: 'Fever Fiend',
                maxHealth: 350,
                damage: 22,
                size: { width: 1.8, height: 2.6 },
                color: 0xFF4500,
                canFly: false,
                abilities: ['heat_wave', 'temperature_spike', 'delirium', 'burning_touch'],
                phases: [
                    { healthThreshold: 0.4, abilities: ['heat_wave', 'burning_touch'] },
                    { healthThreshold: 0, abilities: ['heat_wave', 'temperature_spike', 'delirium', 'burning_touch'] }
                ]
            },
            
            'cough_conjurer': {
                name: 'Cough Conjurer',
                maxHealth: 450,
                damage: 20,
                size: { width: 1.5, height: 2.2 },
                color: 0x708090,
                canFly: false,
                abilities: ['cough_cloud', 'mucus_missile', 'sneeze_blast', 'respiratory_drain'],
                phases: [
                    { healthThreshold: 0.6, abilities: ['cough_cloud'] },
                    { healthThreshold: 0.3, abilities: ['cough_cloud', 'mucus_missile'] },
                    { healthThreshold: 0, abilities: ['cough_cloud', 'mucus_missile', 'sneeze_blast', 'respiratory_drain'] }
                ]
            },
            
            'nausea_nightmare': {
                name: 'Nausea Nightmare',
                maxHealth: 500,
                damage: 18,
                size: { width: 2, height: 2.8 },
                color: 0x9ACD32,
                canFly: true,
                abilities: ['dizzy_spin', 'vomit_volley', 'stomach_churn', 'motion_sickness'],
                phases: [
                    { healthThreshold: 0.5, abilities: ['dizzy_spin', 'vomit_volley'] },
                    { healthThreshold: 0, abilities: ['dizzy_spin', 'vomit_volley', 'stomach_churn', 'motion_sickness'] }
                ]
            },
            
            'pandemic_prince': {
                name: 'Pandemic Prince',
                maxHealth: 800,
                damage: 35,
                size: { width: 2.2, height: 3 },
                color: 0x4B0082,
                canFly: false,
                abilities: ['viral_burst', 'infection_wave', 'quarantine_cage', 'mutation'],
                phases: [
                    { healthThreshold: 0.7, abilities: ['viral_burst'] },
                    { healthThreshold: 0.4, abilities: ['viral_burst', 'infection_wave'] },
                    { healthThreshold: 0, abilities: ['viral_burst', 'infection_wave', 'quarantine_cage', 'mutation'] }
                ]
            },
            
            // 21-30: Portal Guardians
            'void_warden': {
                name: 'Void Warden',
                maxHealth: 600,
                damage: 30,
                size: { width: 2.4, height: 3.5 },
                color: 0x191970,
                canFly: true,
                abilities: ['void_beam', 'portal_slash', 'dimension_rift', 'dark_shield'],
                phases: [
                    { healthThreshold: 0.5, abilities: ['void_beam', 'portal_slash'] },
                    { healthThreshold: 0, abilities: ['void_beam', 'portal_slash', 'dimension_rift', 'dark_shield'] }
                ]
            },
            
            'obsidian_giant': {
                name: 'Obsidian Giant',
                maxHealth: 1200,
                damage: 45,
                size: { width: 3, height: 4.5 },
                color: 0x000000,
                canFly: false,
                abilities: ['obsidian_crush', 'lava_spit', 'rock_throw', 'volcanic_eruption'],
                phases: [
                    { healthThreshold: 0.8, abilities: ['obsidian_crush'] },
                    { healthThreshold: 0.5, abilities: ['obsidian_crush', 'lava_spit'] },
                    { healthThreshold: 0.2, abilities: ['obsidian_crush', 'lava_spit', 'rock_throw'] },
                    { healthThreshold: 0, abilities: ['obsidian_crush', 'lava_spit', 'rock_throw', 'volcanic_eruption'] }
                ]
            },
            
            'shadow_stalker': {
                name: 'Shadow Stalker',
                maxHealth: 400,
                damage: 38,
                size: { width: 1.8, height: 2.5 },
                color: 0x2F2F2F,
                canFly: false,
                abilities: ['shadow_step', 'dark_blade', 'invisibility', 'shadow_clone'],
                phases: [
                    { healthThreshold: 0.4, abilities: ['shadow_step', 'dark_blade'] },
                    { healthThreshold: 0, abilities: ['shadow_step', 'dark_blade', 'invisibility', 'shadow_clone'] }
                ]
            },
            
            'portal_master': {
                name: 'Portal Master',
                maxHealth: 550,
                damage: 28,
                size: { width: 2, height: 2.8 },
                color: 0x8A2BE2,
                canFly: true,
                abilities: ['portal_barrage', 'teleport_trap', 'dimensional_pull', 'reality_tear'],
                phases: [
                    { healthThreshold: 0.6, abilities: ['portal_barrage'] },
                    { healthThreshold: 0.3, abilities: ['portal_barrage', 'teleport_trap'] },
                    { healthThreshold: 0, abilities: ['portal_barrage', 'teleport_trap', 'dimensional_pull', 'reality_tear'] }
                ]
            },
            
            'nether_knight': {
                name: 'Nether Knight',
                maxHealth: 750,
                damage: 42,
                size: { width: 2.2, height: 3.2 },
                color: 0xDC143C,
                canFly: false,
                abilities: ['flame_sword', 'fire_charge', 'molten_armor', 'inferno_blast'],
                phases: [
                    { healthThreshold: 0.5, abilities: ['flame_sword', 'fire_charge'] },
                    { healthThreshold: 0, abilities: ['flame_sword', 'fire_charge', 'molten_armor', 'inferno_blast'] }
                ]
            },
            
            // 31-41: Ultimate Bosses
            'dimensional_destroyer': {
                name: 'Dimensional Destroyer',
                maxHealth: 1500,
                damage: 50,
                size: { width: 4, height: 5 },
                color: 0xFF0000,
                canFly: true,
                abilities: ['reality_crack', 'world_breaker', 'space_fold', 'time_stop', 'final_doom'],
                phases: [
                    { healthThreshold: 0.8, abilities: ['reality_crack'] },
                    { healthThreshold: 0.6, abilities: ['reality_crack', 'world_breaker'] },
                    { healthThreshold: 0.4, abilities: ['reality_crack', 'world_breaker', 'space_fold'] },
                    { healthThreshold: 0.2, abilities: ['reality_crack', 'world_breaker', 'space_fold', 'time_stop'] },
                    { healthThreshold: 0, abilities: ['reality_crack', 'world_breaker', 'space_fold', 'time_stop', 'final_doom'] }
                ]
            },
            
            'emerald_empress': {
                name: 'Emerald Empress',
                maxHealth: 1200,
                damage: 48,
                size: { width: 3.5, height: 4.2 },
                color: 0x00FF7F,
                canFly: true,
                abilities: ['emerald_storm', 'crystal_prison', 'gem_beam', 'wealth_drain'],
                phases: [
                    { healthThreshold: 0.7, abilities: ['emerald_storm'] },
                    { healthThreshold: 0.4, abilities: ['emerald_storm', 'crystal_prison'] },
                    { healthThreshold: 0, abilities: ['emerald_storm', 'crystal_prison', 'gem_beam', 'wealth_drain'] }
                ]
            },
            
            'chaos_champion': {
                name: 'Chaos Champion',
                maxHealth: 1000,
                damage: 44,
                size: { width: 3, height: 3.8 },
                color: 0xFF1493,
                canFly: false,
                abilities: ['chaos_bolt', 'random_effect', 'unpredictable', 'mayhem_mode'],
                phases: [
                    { healthThreshold: 0.5, abilities: ['chaos_bolt', 'random_effect'] },
                    { healthThreshold: 0, abilities: ['chaos_bolt', 'random_effect', 'unpredictable', 'mayhem_mode'] }
                ]
            },
            
            'void_emperor': {
                name: 'Void Emperor',
                maxHealth: 1800,
                damage: 55,
                size: { width: 4.5, height: 6 },
                color: 0x000000,
                canFly: true,
                abilities: ['void_annihilation', 'null_field', 'existence_erase', 'absolute_zero', 'omega_end'],
                phases: [
                    { healthThreshold: 0.9, abilities: ['void_annihilation'] },
                    { healthThreshold: 0.7, abilities: ['void_annihilation', 'null_field'] },
                    { healthThreshold: 0.5, abilities: ['void_annihilation', 'null_field', 'existence_erase'] },
                    { healthThreshold: 0.2, abilities: ['void_annihilation', 'null_field', 'existence_erase', 'absolute_zero'] },
                    { healthThreshold: 0, abilities: ['void_annihilation', 'null_field', 'existence_erase', 'absolute_zero', 'omega_end'] }
                ]
            },
            
            'minecraft_movie_final_boss': {
                name: 'The Blocky Overlord',
                maxHealth: 2000,
                damage: 60,
                size: { width: 5, height: 7 },
                color: 0x8B008B,
                canFly: true,
                abilities: ['cube_storm', 'pixel_perfect', 'world_reshape', 'creative_mode', 'game_over'],
                phases: [
                    { healthThreshold: 0.8, abilities: ['cube_storm'] },
                    { healthThreshold: 0.6, abilities: ['cube_storm', 'pixel_perfect'] },
                    { healthThreshold: 0.4, abilities: ['cube_storm', 'pixel_perfect', 'world_reshape'] },
                    { healthThreshold: 0.2, abilities: ['cube_storm', 'pixel_perfect', 'world_reshape', 'creative_mode'] },
                    { healthThreshold: 0, abilities: ['cube_storm', 'pixel_perfect', 'world_reshape', 'creative_mode', 'game_over'] }
                ]
            }
        };
        
        return bosses[type] || bosses['pig_king'];
    }
    
    createMesh() {
        // Create boss mesh with unique appearance
        const geometry = new THREE.BoxGeometry(this.size.width, this.size.height, this.size.width);
        const material = new THREE.MeshLambertMaterial({ 
            color: this.color,
            transparent: true,
            opacity: 0.9
        });
        
        this.mesh = new THREE.Mesh(geometry, material);
        this.mesh.position.copy(this.position);
        this.mesh.position.y += this.size.height / 2;
        this.mesh.castShadow = true;
        this.mesh.receiveShadow = true;
        
        // Add glow effect
        const glowGeometry = new THREE.BoxGeometry(
            this.size.width * 1.1, 
            this.size.height * 1.1, 
            this.size.width * 1.1
        );
        const glowMaterial = new THREE.MeshBasicMaterial({
            color: this.color,
            transparent: true,
            opacity: 0.3
        });
        
        const glow = new THREE.Mesh(glowGeometry, glowMaterial);
        this.mesh.add(glow);
        
        // Add boss-specific visual features
        this.addBossFeatures();
        
        this.gameEngine.scene.add(this.mesh);
    }
    
    addBossFeatures() {
        // Add unique visual features based on boss type
        if (this.type.includes('pig') || this.type.includes('pork') || this.type.includes('ham')) {
            this.addPigFeatures();
        } else if (this.type.includes('void') || this.type.includes('shadow')) {
            this.addDarkFeatures();
        } else if (this.type.includes('emerald')) {
            this.addGemFeatures();
        }
    }
    
    addPigFeatures() {
        // Crown for pig bosses
        const crownGeometry = new THREE.CylinderGeometry(0.3, 0.4, 0.2, 8);
        const crownMaterial = new THREE.MeshLambertMaterial({ color: 0xFFD700 });
        const crown = new THREE.Mesh(crownGeometry, crownMaterial);
        crown.position.set(0, this.size.height / 2 + 0.3, 0);
        this.mesh.add(crown);
    }
    
    addDarkFeatures() {
        // Dark aura particles
        for (let i = 0; i < 10; i++) {
            const particleGeometry = new THREE.SphereGeometry(0.05, 6, 6);
            const particleMaterial = new THREE.MeshBasicMaterial({ 
                color: 0x191970,
                transparent: true,
                opacity: 0.8
            });
            
            const particle = new THREE.Mesh(particleGeometry, particleMaterial);
            particle.position.set(
                (Math.random() - 0.5) * this.size.width * 1.5,
                Math.random() * this.size.height,
                (Math.random() - 0.5) * this.size.width * 1.5
            );
            this.mesh.add(particle);
        }
    }
    
    addGemFeatures() {
        // Floating emerald crystals
        for (let i = 0; i < 6; i++) {
            const crystalGeometry = new THREE.OctahedronGeometry(0.1);
            const crystalMaterial = new THREE.MeshLambertMaterial({ 
                color: 0x00FF7F,
                transparent: true,
                opacity: 0.9
            });
            
            const crystal = new THREE.Mesh(crystalGeometry, crystalMaterial);
            const angle = (i / 6) * Math.PI * 2;
            crystal.position.set(
                Math.cos(angle) * 0.8,
                this.size.height / 2 + Math.sin(angle * 2) * 0.3,
                Math.sin(angle) * 0.8
            );
            this.mesh.add(crystal);
        }
    }
    
    activate() {
        this.isActive = true;
        this.showHealthBar();
    }
    
    showHealthBar() {
        const bossHealth = document.getElementById('boss-health');
        const bossName = document.getElementById('boss-name');
        
        if (bossHealth && bossName) {
            bossName.textContent = this.name;
            bossHealth.style.display = 'block';
            this.updateHealthBar();
        }
    }
    
    hideHealthBar() {
        const bossHealth = document.getElementById('boss-health');
        if (bossHealth) {
            bossHealth.style.display = 'none';
        }
    }
    
    updateHealthBar() {
        const healthFill = document.getElementById('boss-health-fill');
        if (healthFill) {
            const healthPercent = (this.health / this.maxHealth) * 100;
            healthFill.style.width = `${healthPercent}%`;
        }
    }
    
    update(deltaTime) {
        if (!this.isActive || this.health <= 0) return;
        
        this.abilityTimer += deltaTime;
        this.phaseTimer += deltaTime;
        this.attackCooldown = Math.max(0, this.attackCooldown - deltaTime);
        
        // Check for phase transitions
        this.checkPhaseTransition();
        
        // Update AI
        this.updateAI(deltaTime);
        
        // Update physics
        this.updatePhysics(deltaTime);
        
        // Update abilities
        if (this.abilityTimer >= this.nextAbilityTime) {
            this.useAbility();
            this.abilityTimer = 0;
            this.nextAbilityTime = 2 + Math.random() * 4; // Random interval between abilities
        }
        
        // Update visual position
        if (this.mesh) {
            this.mesh.position.copy(this.position);
            this.mesh.position.y += this.size.height / 2;
            
            // Rotate for dramatic effect
            this.mesh.rotation.y += deltaTime * 0.5;
        }
        
        // Update effects
        this.updateEffects(deltaTime);
    }
    
    checkPhaseTransition() {
        const currentHealthRatio = this.health / this.maxHealth;
        
        for (let i = this.phase; i < this.phases.length; i++) {
            if (currentHealthRatio <= this.phases[i].healthThreshold) {
                this.phase = i + 1;
                this.onPhaseChange();
                break;
            }
        }
    }
    
    onPhaseChange() {
        console.log(`${this.name} entered phase ${this.phase}!`);
        
        // Visual effect for phase change
        if (this.mesh) {
            const originalScale = this.mesh.scale.clone();
            this.mesh.scale.multiplyScalar(1.5);
            
            setTimeout(() => {
                if (this.mesh) {
                    this.mesh.scale.copy(originalScale);
                }
            }, 500);
        }
    }
    
    updateAI(deltaTime) {
        // Find player target
        if (window.player) {
            this.target = window.player;
            
            // Move towards player or use flying patterns
            if (this.canFly) {
                this.updateFlyingMovement(deltaTime);
            } else {
                this.updateGroundMovement(deltaTime);
            }
        }
    }
    
    updateFlyingMovement(deltaTime) {
        if (!this.target) return;
        
        // Fly in patterns around the player
        const time = this.phaseTimer;
        const radius = 8 + Math.sin(time * 0.5) * 3;
        const height = this.target.position.y + 5 + Math.cos(time * 0.3) * 2;
        
        this.targetPosition.x = this.target.position.x + Math.cos(time) * radius;
        this.targetPosition.y = height;
        this.targetPosition.z = this.target.position.z + Math.sin(time) * radius;
        
        // Move towards target position
        const direction = this.targetPosition.clone().sub(this.position);
        if (direction.length() > 0.5) {
            direction.normalize();
            this.velocity.copy(direction.multiplyScalar(this.moveSpeed || 3));
        }
    }
    
    updateGroundMovement(deltaTime) {
        if (!this.target) return;
        
        // Simple ground movement towards player
        const direction = this.target.position.clone().sub(this.position);
        direction.y = 0; // Don't move vertically
        
        if (direction.length() > 3) { // Stay at distance
            direction.normalize();
            this.velocity.x = direction.x * (this.moveSpeed || 2);
            this.velocity.z = direction.z * (this.moveSpeed || 2);
        } else {
            this.velocity.x *= 0.8;
            this.velocity.z *= 0.8;
        }
    }
    
    updatePhysics(deltaTime) {
        // Apply movement
        this.position.add(this.velocity.clone().multiplyScalar(deltaTime));
        
        // Ground collision for non-flying bosses
        if (!this.canFly) {
            const groundY = this.getGroundLevel(this.position.x, this.position.z);
            if (this.position.y < groundY) {
                this.position.y = groundY;
                this.velocity.y = 0;
            }
        }
        
        // Apply friction
        this.velocity.multiplyScalar(0.95);
    }
    
    getGroundLevel(x, z) {
        if (!this.gameEngine.worldGenerator) return 0;
        return this.gameEngine.worldGenerator.getHeight(x, z) + 1;
    }
    
    useAbility() {
        if (this.phase <= 0 || this.phase > this.phases.length) return;
        
        const currentPhase = this.phases[this.phase - 1];
        if (!currentPhase.abilities || currentPhase.abilities.length === 0) return;
        
        // Select random ability from current phase
        const randomAbility = currentPhase.abilities[Math.floor(Math.random() * currentPhase.abilities.length)];
        this.executeAbility(randomAbility);
    }
    
    executeAbility(abilityName) {
        console.log(`${this.name} uses ${abilityName}!`);
        
        // Execute specific ability (simplified implementations)
        switch (abilityName) {
            case 'charge_attack':
                this.chargeAttack();
                break;
            case 'summon_pigs':
                this.summonMinions('pig_person');
                break;
            case 'ground_slam':
                this.groundSlam();
                break;
            case 'magic_blast':
                this.magicBlast();
                break;
            case 'teleport':
                this.teleport();
                break;
            case 'void_beam':
                this.voidBeam();
                break;
            case 'emerald_storm':
                this.emeraldStorm();
                break;
            // Add more abilities as needed
            default:
                this.basicAttack();
        }
    }
    
    chargeAttack() {
        if (!this.target) return;
        
        const direction = this.target.position.clone().sub(this.position);
        direction.normalize();
        
        // Charge towards player
        this.velocity.copy(direction.multiplyScalar(15));
        
        // Deal damage if close enough
        setTimeout(() => {
            if (this.target && this.position.distanceTo(this.target.position) < 3) {
                this.target.takeDamage(this.damage * 1.5);
            }
        }, 500);
    }
    
    summonMinions(minionType) {
        if (!window.enemyManager) return;
        
        const count = 2 + Math.floor(Math.random() * 3);
        for (let i = 0; i < count; i++) {
            const angle = (i / count) * Math.PI * 2;
            const distance = 3 + Math.random() * 2;
            
            const spawnX = this.position.x + Math.cos(angle) * distance;
            const spawnZ = this.position.z + Math.sin(angle) * distance;
            const spawnY = this.position.y;
            
            const minion = new window.Enemy(minionType, new THREE.Vector3(spawnX, spawnY, spawnZ), this.gameEngine);
            window.enemyManager.enemies.push(minion);
            this.summonedMinions.push(minion);
        }
    }
    
    groundSlam() {
        // Create shockwave effect
        if (this.target && this.position.distanceTo(this.target.position) < 8) {
            this.target.takeDamage(this.damage * 0.8);
            // Add knockback effect
            const direction = this.target.position.clone().sub(this.position);
            direction.normalize();
            this.target.velocity.add(direction.multiplyScalar(10));
        }
    }
    
    magicBlast() {
        if (!this.target) return;
        
        // Create magic projectile (simplified)
        setTimeout(() => {
            if (this.target && this.position.distanceTo(this.target.position) < 15) {
                this.target.takeDamage(this.damage * 0.6);
            }
        }, 1000);
    }
    
    teleport() {
        if (!this.target) return;
        
        // Teleport to random position around player
        const angle = Math.random() * Math.PI * 2;
        const distance = 5 + Math.random() * 5;
        
        this.position.x = this.target.position.x + Math.cos(angle) * distance;
        this.position.z = this.target.position.z + Math.sin(angle) * distance;
        
        if (!this.canFly) {
            this.position.y = this.getGroundLevel(this.position.x, this.position.z);
        }
    }
    
    voidBeam() {
        if (!this.target) return;
        
        // Laser beam attack
        const distance = this.position.distanceTo(this.target.position);
        if (distance < 20) {
            this.target.takeDamage(this.damage * 1.2);
        }
    }
    
    emeraldStorm() {
        // Area attack around boss
        if (this.target && this.position.distanceTo(this.target.position) < 12) {
            this.target.takeDamage(this.damage * 0.4);
        }
    }
    
    basicAttack() {
        if (!this.target || this.attackCooldown > 0) return;
        
        const distance = this.position.distanceTo(this.target.position);
        if (distance < 4) {
            this.target.takeDamage(this.damage);
            this.attackCooldown = 2;
        }
    }
    
    updateEffects(deltaTime) {
        // Update visual effects and remove expired ones
        this.effects = this.effects.filter(effect => {
            effect.timer -= deltaTime;
            return effect.timer > 0;
        });
    }
    
    takeDamage(amount) {
        this.health = Math.max(0, this.health - amount);
        this.updateHealthBar();
        
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
        console.log(`${this.name} has been defeated!`);
        
        // Remove from scene
        if (this.mesh) {
            this.gameEngine.scene.remove(this.mesh);
            this.mesh.geometry.dispose();
            this.mesh.material.dispose();
            this.mesh = null;
        }
        
        // Hide health bar
        this.hideHealthBar();
        
        // Remove summoned minions
        this.summonedMinions.forEach(minion => {
            if (!minion.isDead) {
                minion.die();
            }
        });
        
        // Drop valuable loot
        this.dropBossLoot();
        
        // Mark as defeated
        this.isActive = false;
        this.isDead = true;
    }
    
    dropBossLoot() {
        if (!window.inventory || !window.player) return;
        
        // Generous loot for boss defeats
        const emeraldDrop = 10 + Math.floor(Math.random() * 20);
        window.player.addEmeralds(emeraldDrop);
        
        // Special items based on boss type
        const lootTable = {
            'pig_king': ['emerald_sword', 'emerald_helmet'],
            'emerald_empress': ['emerald_chestplate', 'emerald_leggings', 'emerald_boots'],
            'void_emperor': ['obsidian', 'emerald_ore'],
            'minecraft_movie_final_boss': ['golden_apple', 'emerald_pickaxe', 'emerald_axe']
        };
        
        const bossLoot = lootTable[this.type] || ['emerald_ore'];
        bossLoot.forEach(item => {
            window.inventory.addItem(item, 1);
        });
    }
}

// Boss Manager
class BossManager {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.activeBosses = [];
        this.defeatedBosses = new Set();
        
        // All 41 boss types
        this.allBossTypes = [
            // Pig Dimension Bosses (1-10)
            'pig_king', 'bacon_lord', 'ham_hammer', 'swine_sorcerer', 'porky_paladin',
            'mud_wrestler', 'truffle_hunter', 'oink_overlord', 'snort_sniper', 'pork_emperor',
            
            // Sick Village Bosses (11-15)
            'plague_doctor', 'fever_fiend', 'cough_conjurer', 'nausea_nightmare', 'pandemic_prince',
            
            // Portal Guardians (16-25)
            'void_warden', 'obsidian_giant', 'shadow_stalker', 'portal_master', 'nether_knight',
            'crystal_keeper', 'time_weaver', 'space_bender', 'reality_shifter', 'dream_eater',
            
            // Environmental Bosses (26-35)
            'forest_fury', 'desert_demon', 'mountain_monarch', 'ocean_overlord', 'cave_crawler',
            'sky_sovereign', 'lava_lord', 'ice_imperator', 'storm_striker', 'earth_emperor',
            
            // Ultimate Bosses (36-41)
            'dimensional_destroyer', 'emerald_empress', 'chaos_champion', 'void_emperor', 
            'elemental_avatar', 'minecraft_movie_final_boss'
        ];
    }
    
    update(deltaTime) {
        // Update all active bosses
        this.activeBosses.forEach(boss => {
            boss.update(deltaTime);
        });
        
        // Remove dead bosses
        this.activeBosses = this.activeBosses.filter(boss => {
            if (boss.isDead) {
                this.defeatedBosses.add(boss.type);
                return false;
            }
            return true;
        });
    }
    
    spawnBoss(bossType, position) {
        if (this.defeatedBosses.has(bossType)) {
            console.log(`Boss ${bossType} has already been defeated!`);
            return null;
        }
        
        const boss = new Boss(bossType, position, this.gameEngine);
        this.activeBosses.push(boss);
        boss.activate();
        
        console.log(`Boss spawned: ${boss.name}`);
        return boss;
    }
    
    spawnRandomBoss(position) {
        const availableBosses = this.allBossTypes.filter(type => !this.defeatedBosses.has(type));
        
        if (availableBosses.length === 0) {
            console.log('All bosses have been defeated!');
            return null;
        }
        
        const randomType = availableBosses[Math.floor(Math.random() * availableBosses.length)];
        return this.spawnBoss(randomType, position);
    }
    
    getProgress() {
        return {
            defeated: this.defeatedBosses.size,
            total: this.allBossTypes.length,
            remaining: this.allBossTypes.length - this.defeatedBosses.size
        };
    }
    
    hasActiveBoss() {
        return this.activeBosses.length > 0;
    }
    
    removeAllBosses() {
        this.activeBosses.forEach(boss => boss.die());
        this.activeBosses = [];
    }
}

// Export for use in other modules
window.Boss = Boss;
window.BossManager = BossManager;