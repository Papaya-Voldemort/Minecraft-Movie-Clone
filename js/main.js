// Main Game Initialization and Control
class Game {
    constructor() {
        this.isLoading = true;
        this.loadingProgress = 0;
        this.loadingSteps = [
            'Initializing game engine...',
            'Generating world...',
            'Loading assets...',
            'Creating player...',
            'Spawning creatures...',
            'Setting up villages...',
            'Creating portals...',
            'Finalizing setup...'
        ];
        this.currentStep = 0;
        
        // Game systems
        this.gameEngine = null;
        this.worldGenerator = null;
        this.player = null;
        this.inventory = null;
        this.enemyManager = null;
        this.bossManager = null;
        this.villageManager = null;
        this.portalManager = null;
        
        // Game state
        this.gameStarted = false;
        this.isPaused = false;
        
        this.init();
    }
    
    async init() {
        console.log('Starting Minecraft Movie Clone...');
        
        // Show loading screen
        this.showLoadingStep();
        
        // Initialize game systems step by step
        await this.delay(500);
        await this.initGameEngine();
        
        await this.delay(500);
        await this.initWorldGenerator();
        
        await this.delay(500);
        await this.initPlayer();
        
        await this.delay(500);
        await this.initInventory();
        
        await this.delay(500);
        await this.initEnemySystem();
        
        await this.delay(500);
        await this.initBossSystem();
        
        await this.delay(500);
        await this.initVillageSystem();
        
        await this.delay(500);
        await this.initPortalSystem();
        
        await this.delay(500);
        await this.finalizeSetup();
        
        // Start the game
        this.startGame();
    }
    
    delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }
    
    showLoadingStep() {
        if (this.currentStep < this.loadingSteps.length) {
            const loadingText = document.getElementById('loading-text');
            const loadingProgress = document.getElementById('loading-progress');
            
            if (loadingText) {
                loadingText.textContent = this.loadingSteps[this.currentStep];
            }
            
            if (loadingProgress) {
                this.loadingProgress = ((this.currentStep + 1) / this.loadingSteps.length) * 100;
                loadingProgress.style.width = `${this.loadingProgress}%`;
            }
            
            this.currentStep++;
        }
    }
    
    async initGameEngine() {
        this.showLoadingStep();
        console.log('Initializing game engine...');
        
        this.gameEngine = new GameEngine();
        window.gameEngine = this.gameEngine; // Global reference
        
        // Add some initial blocks for testing
        this.addTestBlocks();
    }
    
    async initWorldGenerator() {
        this.showLoadingStep();
        console.log('Generating world...');
        
        this.worldGenerator = new WorldGenerator(this.gameEngine);
        window.worldGenerator = this.worldGenerator; // Global reference
        
        // Generate initial chunks around spawn
        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                this.worldGenerator.generateChunk(x, z);
                this.gameEngine.updateChunkMesh(x, z);
            }
        }
    }
    
    async initPlayer() {
        this.showLoadingStep();
        console.log('Creating player...');
        
        this.player = new Player(this.gameEngine);
        window.player = this.player; // Global reference
        
        // Position player at spawn
        this.player.position.set(0, 35, 0);
    }
    
    async initInventory() {
        this.showLoadingStep();
        console.log('Setting up inventory...');
        
        this.inventory = new Inventory();
        window.inventory = this.inventory; // Global reference
        
        // Give player some starting items
        this.inventory.addItem('dirt', 64);
        this.inventory.addItem('wood', 32);
        this.inventory.addItem('stone', 32);
        this.inventory.addItem('bread', 5);
        this.inventory.addItem('wood_sword', 1);
        this.inventory.addItem('wood_pickaxe', 1);
        
        // Give some starting emeralds
        this.player.addEmeralds(10);
    }
    
    async initEnemySystem() {
        this.showLoadingStep();
        console.log('Spawning creatures...');
        
        this.enemyManager = new EnemyManager(this.gameEngine);
        window.enemyManager = this.enemyManager; // Global reference
        
        // Spawn some initial enemies
        for (let i = 0; i < 5; i++) {
            setTimeout(() => {
                this.enemyManager.spawnRandomEnemy();
            }, i * 2000);
        }
    }
    
    async initBossSystem() {
        this.showLoadingStep();
        console.log('Preparing boss encounters...');
        
        this.bossManager = new BossManager(this.gameEngine);
        window.bossManager = this.bossManager; // Global reference
        
        // Spawn a test boss near spawn (pig king)
        setTimeout(() => {
            const bossPosition = new THREE.Vector3(50, 35, 50);
            this.bossManager.spawnBoss('pig_king', bossPosition);
        }, 5000);
    }
    
    async initVillageSystem() {
        this.showLoadingStep();
        console.log('Setting up villages...');
        
        this.villageManager = new VillageManager(this.gameEngine);
        window.villageManager = this.villageManager; // Global reference
        
        // Villages will be generated by the world generator
        // Create a test village near spawn
        setTimeout(() => {
            this.villageManager.createVillage(30, 35, 30);
        }, 2000);
        
        // Create a sick village further away
        setTimeout(() => {
            this.villageManager.createSickVillage(-40, 35, -40);
        }, 3000);
    }
    
    async initPortalSystem() {
        this.showLoadingStep();
        console.log('Creating portals...');
        
        this.portalManager = new PortalManager(this.gameEngine);
        window.portalManager = this.portalManager; // Global reference
        
        // Create test portals
        setTimeout(() => {
            // Portal to pig dimension
            this.portalManager.registerPortal(20, 35, 20, 'pig_dimension');
            
            // Portal to void
            this.portalManager.registerPortal(-20, 35, -20, 'void');
            
            // Random portal
            this.portalManager.spawnRandomPortal(new THREE.Vector3(0, 35, 0), 100);
        }, 1000);
    }
    
    async finalizeSetup() {
        this.showLoadingStep();
        console.log('Finalizing setup...');
        
        // Setup UI event handlers
        this.setupUIHandlers();
        
        // Setup interaction handlers
        this.setupInteractionHandlers();
        
        // Setup save/load system
        this.setupSaveLoad();
        
        // Final preparations
        this.gameEngine.loadedChunks.add('0,0'); // Mark spawn chunk as loaded
    }
    
    setupUIHandlers() {
        // Resume game button
        const resumeButton = document.getElementById('resume-game');
        if (resumeButton) {
            resumeButton.addEventListener('click', () => {
                this.gameEngine.togglePause();
            });
        }
        
        // Save game button
        const saveButton = document.getElementById('save-game');
        if (saveButton) {
            saveButton.addEventListener('click', () => {
                this.saveGame();
            });
        }
        
        // Load game button
        const loadButton = document.getElementById('load-game');
        if (loadButton) {
            loadButton.addEventListener('click', () => {
                this.loadGame();
            });
        }
        
        // Controls help toggle
        const controlsToggle = document.getElementById('controls-toggle');
        const controlsPanel = document.getElementById('controls-panel');
        if (controlsToggle && controlsPanel) {
            controlsToggle.addEventListener('click', () => {
                const isVisible = controlsPanel.style.display !== 'none';
                controlsPanel.style.display = isVisible ? 'none' : 'block';
            });
        }
    }
    
    setupInteractionHandlers() {
        // Right-click to interact with villagers
        document.addEventListener('contextmenu', (event) => {
            event.preventDefault();
            
            if (document.pointerLockElement === document.body && !this.gameEngine.isPaused) {
                // Try to interact with nearby villager
                if (this.villageManager) {
                    this.villageManager.handlePlayerInteraction(this.player);
                }
            }
        });
        
        // F key for additional interactions
        document.addEventListener('keydown', (event) => {
            if (event.code === 'KeyF' && !this.gameEngine.isPaused) {
                this.handleFKeyInteraction();
            }
        });
    }
    
    handleFKeyInteraction() {
        // Find nearest interactable object
        const playerPos = this.player.position;
        
        // Check for nearby villagers
        if (this.villageManager) {
            const nearestVillager = this.villageManager.findNearestVillager(playerPos, 3);
            if (nearestVillager) {
                nearestVillager.interact(this.player);
                return;
            }
        }
        
        // Check for nearby portals
        if (this.portalManager) {
            const nearbyPortals = this.portalManager.findPortalsNear(playerPos, 5);
            if (nearbyPortals.length > 0) {
                this.showPortalInfo(nearbyPortals[0]);
                return;
            }
        }
        
        // Check for nearby bosses
        if (this.bossManager) {
            const nearbyBoss = this.bossManager.activeBosses.find(boss => 
                boss.position.distanceTo(playerPos) < 10
            );
            if (nearbyBoss) {
                this.showBossInfo(nearbyBoss);
                return;
            }
        }
    }
    
    showPortalInfo(portal) {
        const message = `Portal to ${portal.destinationDimension}\nStep closer to activate`;
        this.showMessage(message, 3000);
    }
    
    showBossInfo(boss) {
        const progress = this.bossManager.getProgress();
        const message = `${boss.name}\nHealth: ${boss.health}/${boss.maxHealth}\nBosses defeated: ${progress.defeated}/${progress.total}`;
        this.showMessage(message, 3000);
    }
    
    showMessage(message, duration = 3000) {
        const messageDiv = document.createElement('div');
        messageDiv.style.cssText = `
            position: fixed;
            top: 20%;
            left: 50%;
            transform: translateX(-50%);
            background: rgba(0, 0, 0, 0.8);
            color: white;
            padding: 15px 25px;
            border-radius: 5px;
            z-index: 1000;
            text-align: center;
            white-space: pre-line;
            font-family: 'Courier New', monospace;
        `;
        messageDiv.textContent = message;
        document.body.appendChild(messageDiv);
        
        setTimeout(() => {
            messageDiv.style.opacity = '0';
            messageDiv.style.transition = 'opacity 0.5s ease';
            setTimeout(() => {
                messageDiv.remove();
            }, 500);
        }, duration);
    }
    
    setupSaveLoad() {
        // Auto-save every 5 minutes
        setInterval(() => {
            if (this.gameStarted && !this.gameEngine.isPaused) {
                this.autoSave();
            }
        }, 5 * 60 * 1000); // 5 minutes
    }
    
    addTestBlocks() {
        // Add some test blocks around spawn for initial testing
        for (let x = -2; x <= 2; x++) {
            for (let z = -2; z <= 2; z++) {
                this.gameEngine.setBlock(x, 30, z, this.gameEngine.blockTypes.GRASS);
            }
        }
        
        // Add some emerald ore
        this.gameEngine.setBlock(0, 29, 0, this.gameEngine.blockTypes.EMERALD_ORE);
        this.gameEngine.setBlock(1, 29, 1, this.gameEngine.blockTypes.EMERALD_ORE);
    }
    
    startGame() {
        console.log('Game ready! Starting...');
        
        // Hide loading screen
        const loadingScreen = document.getElementById('loading-screen');
        const gameContainer = document.getElementById('game-container');
        
        if (loadingScreen && gameContainer) {
            loadingScreen.style.opacity = '0';
            loadingScreen.style.transition = 'opacity 1s ease';
            
            setTimeout(() => {
                loadingScreen.style.display = 'none';
                gameContainer.style.display = 'block';
                
                // Start game engine
                this.gameEngine.start();
                this.gameStarted = true;
                
                // Show welcome message
                setTimeout(() => {
                    this.showWelcomeMessage();
                }, 1000);
                
            }, 1000);
        }
    }
    
    showWelcomeMessage() {
        const message = `Welcome to Minecraft Movie Clone!
        
🎯 Objectives:
• Defeat all 41 unique bosses
• Collect emerald armor and tools
• Trade with villagers using emeralds
• Explore different dimensions through portals
• Fight off pig people invasions
• Help sick villages

💎 You start with 10 emeralds and basic tools
🎮 Press ? for controls help
🗡️ First boss spawned nearby - good luck!`;
        
        this.showMessage(message, 10000);
    }
    
    saveGame() {
        try {
            const gameData = {
                player: {
                    position: this.player.position,
                    health: this.player.health,
                    emeralds: this.player.emeralds,
                    armor: this.player.armor
                },
                inventory: this.inventory.serialize(),
                world: this.gameEngine.world,
                defeatedBosses: Array.from(this.bossManager.defeatedBosses),
                villageStats: this.villageManager.getVillageStats(),
                portalStats: this.portalManager.getPortalStats(),
                timestamp: Date.now()
            };
            
            localStorage.setItem('minecraft_movie_clone_save', JSON.stringify(gameData));
            this.showMessage('Game saved successfully!', 2000);
            
        } catch (error) {
            console.error('Failed to save game:', error);
            this.showMessage('Failed to save game!', 2000);
        }
    }
    
    loadGame() {
        try {
            const savedData = localStorage.getItem('minecraft_movie_clone_save');
            if (!savedData) {
                this.showMessage('No saved game found!', 2000);
                return;
            }
            
            const gameData = JSON.parse(savedData);
            
            // Restore player data
            this.player.position.copy(gameData.player.position);
            this.player.health = gameData.player.health;
            this.player.emeralds = gameData.player.emeralds;
            this.player.armor = gameData.player.armor || {};
            this.player.updateUI();
            
            // Restore inventory
            this.inventory.deserialize(gameData.inventory);
            
            // Restore world (simplified)
            this.gameEngine.world = gameData.world || {};
            
            // Restore boss progress
            if (gameData.defeatedBosses) {
                this.bossManager.defeatedBosses = new Set(gameData.defeatedBosses);
            }
            
            this.showMessage('Game loaded successfully!', 2000);
            
        } catch (error) {
            console.error('Failed to load game:', error);
            this.showMessage('Failed to load game!', 2000);
        }
    }
    
    autoSave() {
        this.saveGame();
        console.log('Auto-saved game');
    }
    
    // Game loop updates
    update(deltaTime) {
        if (!this.gameStarted || this.gameEngine.isPaused) return;
        
        // Update all game systems
        if (this.enemyManager) this.enemyManager.update(deltaTime);
        if (this.bossManager) this.bossManager.update(deltaTime);
        if (this.villageManager) this.villageManager.update(deltaTime);
        if (this.portalManager) this.portalManager.update(deltaTime);
        
        // Check win condition
        this.checkWinCondition();
    }
    
    checkWinCondition() {
        // Check if all bosses are defeated
        const progress = this.bossManager.getProgress();
        
        if (progress.defeated === progress.total && progress.total > 0) {
            this.showVictoryMessage();
        }
    }
    
    showVictoryMessage() {
        const message = `🎉 CONGRATULATIONS! 🎉

You have defeated all ${this.bossManager.getProgress().total} bosses!

You are the true hero of the blocky world!

The pig people invasion has been stopped,
the sick villages have been cleansed,
and the portals are under control.

Thank you for playing Minecraft Movie Clone!`;
        
        this.showMessage(message, 15000);
    }
}

// Start the game when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        console.log('DOMContentLoaded - starting game');
        window.game = new Game();
    });
} else {
    // DOM is already loaded, start immediately
    console.log('DOM already loaded - starting game immediately');
    window.game = new Game();
}

// Export for debugging
window.Game = Game;