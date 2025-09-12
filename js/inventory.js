// Inventory and Item Management System
class Inventory {
    constructor() {
        this.slots = new Array(36).fill(null); // 36 inventory slots
        this.hotbarSlots = 9; // First 9 slots are hotbar
        this.selectedSlot = 0;
        
        // Item definitions
        this.itemDefinitions = {
            // Blocks
            'dirt': { name: 'Dirt', stackSize: 64, type: 'block' },
            'stone': { name: 'Stone', stackSize: 64, type: 'block' },
            'grass': { name: 'Grass Block', stackSize: 64, type: 'block' },
            'wood': { name: 'Wood', stackSize: 64, type: 'block' },
            'leaves': { name: 'Leaves', stackSize: 64, type: 'block' },
            'sand': { name: 'Sand', stackSize: 64, type: 'block' },
            'obsidian': { name: 'Obsidian', stackSize: 64, type: 'block' },
            
            // Tools
            'wood_sword': { name: 'Wooden Sword', stackSize: 1, type: 'tool', damage: 5 },
            'stone_sword': { name: 'Stone Sword', stackSize: 1, type: 'tool', damage: 8 },
            'emerald_sword': { name: 'Emerald Sword', stackSize: 1, type: 'tool', damage: 15 },
            
            'wood_pickaxe': { name: 'Wooden Pickaxe', stackSize: 1, type: 'tool', mining: 1 },
            'stone_pickaxe': { name: 'Stone Pickaxe', stackSize: 1, type: 'tool', mining: 2 },
            'emerald_pickaxe': { name: 'Emerald Pickaxe', stackSize: 1, type: 'tool', mining: 5 },
            
            'wood_axe': { name: 'Wooden Axe', stackSize: 1, type: 'tool', chopping: 1 },
            'stone_axe': { name: 'Stone Axe', stackSize: 1, type: 'tool', chopping: 2 },
            'emerald_axe': { name: 'Emerald Axe', stackSize: 1, type: 'tool', chopping: 5 },
            
            // Armor
            'leather_helmet': { name: 'Leather Helmet', stackSize: 1, type: 'armor', slot: 'helmet', protection: 1 },
            'leather_chestplate': { name: 'Leather Chestplate', stackSize: 1, type: 'armor', slot: 'chestplate', protection: 2 },
            'leather_leggings': { name: 'Leather Leggings', stackSize: 1, type: 'armor', slot: 'leggings', protection: 2 },
            'leather_boots': { name: 'Leather Boots', stackSize: 1, type: 'armor', slot: 'boots', protection: 1 },
            
            'emerald_helmet': { name: 'Emerald Helmet', stackSize: 1, type: 'armor', slot: 'helmet', protection: 3 },
            'emerald_chestplate': { name: 'Emerald Chestplate', stackSize: 1, type: 'armor', slot: 'chestplate', protection: 5 },
            'emerald_leggings': { name: 'Emerald Leggings', stackSize: 1, type: 'armor', slot: 'leggings', protection: 4 },
            'emerald_boots': { name: 'Emerald Boots', stackSize: 1, type: 'armor', slot: 'boots', protection: 2 },
            
            // Consumables
            'bread': { name: 'Bread', stackSize: 16, type: 'food', hunger: 5 },
            'apple': { name: 'Apple', stackSize: 16, type: 'food', hunger: 3 },
            'golden_apple': { name: 'Golden Apple', stackSize: 16, type: 'food', hunger: 8, healing: 10 }
        };
        
        // Crafting recipes
        this.recipes = {
            'wood_sword': [['wood'], ['wood'], ['stick']],
            'stone_sword': [['stone'], ['stone'], ['stick']],
            'emerald_sword': [['emerald_ore'], ['emerald_ore'], ['stick']],
            
            'wood_pickaxe': [['wood', 'wood', 'wood'], ['', 'stick', ''], ['', 'stick', '']],
            'stone_pickaxe': [['stone', 'stone', 'stone'], ['', 'stick', ''], ['', 'stick', '']],
            'emerald_pickaxe': [['emerald_ore', 'emerald_ore', 'emerald_ore'], ['', 'stick', ''], ['', 'stick', '']],
            
            'wood_axe': [['wood', 'wood'], ['wood', 'stick'], ['', 'stick']],
            'stone_axe': [['stone', 'stone'], ['stone', 'stick'], ['', 'stick']],
            'emerald_axe': [['emerald_ore', 'emerald_ore'], ['emerald_ore', 'stick'], ['', 'stick']],
            
            'stick': [['wood'], ['wood']],
            'bread': [['wheat', 'wheat', 'wheat']],
            
            'emerald_helmet': [['emerald_ore', 'emerald_ore', 'emerald_ore'], ['emerald_ore', '', 'emerald_ore']],
            'emerald_chestplate': [['emerald_ore', '', 'emerald_ore'], ['emerald_ore', 'emerald_ore', 'emerald_ore'], ['emerald_ore', 'emerald_ore', 'emerald_ore']],
            'emerald_leggings': [['emerald_ore', 'emerald_ore', 'emerald_ore'], ['emerald_ore', '', 'emerald_ore'], ['emerald_ore', '', 'emerald_ore']],
            'emerald_boots': [['emerald_ore', '', 'emerald_ore'], ['emerald_ore', '', 'emerald_ore']]
        };
        
        this.isOpen = false;
        this.setupUI();
        this.updateDisplay();
    }
    
    setupUI() {
        // Setup hotbar click handlers
        const hotbarSlots = document.querySelectorAll('.hotbar-slot');
        hotbarSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => {
                this.selectSlot(index);
            });
        });
        
        // Setup inventory panel
        const inventoryGrid = document.getElementById('inventory-grid');
        for (let i = 0; i < 36; i++) {
            const slot = document.createElement('div');
            slot.className = 'inventory-slot';
            slot.dataset.slot = i;
            slot.addEventListener('click', () => this.handleInventoryClick(i));
            slot.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                this.handleInventoryRightClick(i);
            });
            inventoryGrid.appendChild(slot);
        }
        
        // Setup inventory toggle
        document.getElementById('close-inventory').addEventListener('click', () => {
            this.close();
        });
        
        // Setup crafting
        this.setupCrafting();
    }
    
    setupCrafting() {
        const craftSlots = document.querySelectorAll('.craft-slot');
        craftSlots.forEach((slot, index) => {
            slot.addEventListener('click', () => this.handleCraftingClick(index));
        });
        
        document.getElementById('close-crafting').addEventListener('click', () => {
            document.getElementById('crafting-panel').style.display = 'none';
        });
        
        document.getElementById('craft-result').addEventListener('click', () => {
            this.handleCraftResult();
        });
    }
    
    addItem(itemType, quantity = 1) {
        const itemDef = this.itemDefinitions[itemType];
        if (!itemDef) return false;
        
        let remaining = quantity;
        
        // Try to stack with existing items first
        for (let i = 0; i < this.slots.length && remaining > 0; i++) {
            const slot = this.slots[i];
            if (slot && slot.type === itemType && slot.quantity < itemDef.stackSize) {
                const canAdd = Math.min(remaining, itemDef.stackSize - slot.quantity);
                slot.quantity += canAdd;
                remaining -= canAdd;
            }
        }
        
        // Add to empty slots if needed
        for (let i = 0; i < this.slots.length && remaining > 0; i++) {
            if (!this.slots[i]) {
                const canAdd = Math.min(remaining, itemDef.stackSize);
                this.slots[i] = {
                    type: itemType,
                    quantity: canAdd
                };
                remaining -= canAdd;
            }
        }
        
        this.updateDisplay();
        return remaining === 0;
    }
    
    removeItem(itemType, quantity = 1) {
        let remaining = quantity;
        
        for (let i = this.slots.length - 1; i >= 0 && remaining > 0; i--) {
            const slot = this.slots[i];
            if (slot && slot.type === itemType) {
                const canRemove = Math.min(remaining, slot.quantity);
                slot.quantity -= canRemove;
                remaining -= canRemove;
                
                if (slot.quantity <= 0) {
                    this.slots[i] = null;
                }
            }
        }
        
        this.updateDisplay();
        return remaining === 0;
    }
    
    getSelectedItem() {
        return this.slots[this.selectedSlot];
    }
    
    selectSlot(slotIndex) {
        if (slotIndex >= 0 && slotIndex < this.hotbarSlots) {
            this.selectedSlot = slotIndex;
            this.updateHotbarDisplay();
        }
    }
    
    handleInventoryClick(slotIndex) {
        // Simple click to use/equip item
        const item = this.slots[slotIndex];
        if (!item) return;
        
        const itemDef = this.itemDefinitions[item.type];
        
        if (itemDef.type === 'food') {
            this.consumeFood(slotIndex);
        } else if (itemDef.type === 'armor') {
            this.equipArmor(slotIndex);
        }
    }
    
    handleInventoryRightClick(slotIndex) {
        // Right click to split stack or quick actions
        const item = this.slots[slotIndex];
        if (!item || item.quantity <= 1) return;
        
        // Split stack in half
        const splitAmount = Math.floor(item.quantity / 2);
        if (splitAmount > 0) {
            item.quantity -= splitAmount;
            
            // Find empty slot for split items
            for (let i = 0; i < this.slots.length; i++) {
                if (!this.slots[i]) {
                    this.slots[i] = {
                        type: item.type,
                        quantity: splitAmount
                    };
                    break;
                }
            }
        }
        
        this.updateDisplay();
    }
    
    consumeFood(slotIndex) {
        const item = this.slots[slotIndex];
        if (!item) return;
        
        const itemDef = this.itemDefinitions[item.type];
        if (itemDef.type !== 'food') return;
        
        // Apply food effects
        if (window.player) {
            if (itemDef.healing) {
                window.player.heal(itemDef.healing);
            }
        }
        
        // Remove one item
        item.quantity--;
        if (item.quantity <= 0) {
            this.slots[slotIndex] = null;
        }
        
        this.updateDisplay();
    }
    
    equipArmor(slotIndex) {
        const item = this.slots[slotIndex];
        if (!item) return;
        
        const itemDef = this.itemDefinitions[item.type];
        if (itemDef.type !== 'armor') return;
        
        // Equip armor
        if (window.player) {
            window.player.equipArmor(itemDef.slot, item.type);
        }
        
        // Remove from inventory (equipped items don't take inventory space)
        item.quantity--;
        if (item.quantity <= 0) {
            this.slots[slotIndex] = null;
        }
        
        this.updateDisplay();
    }
    
    handleCraftingClick(slotIndex) {
        // Handle crafting grid interactions
        // This is simplified - in a full implementation you'd have drag/drop
        console.log(`Crafting slot ${slotIndex} clicked`);
    }
    
    handleCraftResult() {
        // Handle taking crafted item
        const recipe = this.checkCraftingRecipe();
        if (recipe) {
            // Add crafted item to inventory
            this.addItem(recipe.result, recipe.quantity || 1);
            
            // Remove ingredients from crafting grid
            // This would be implemented with actual crafting grid state
        }
    }
    
    checkCraftingRecipe() {
        // Check if current crafting grid matches any recipe
        // This is a simplified version
        return null;
    }
    
    toggle() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('inventory-panel');
        panel.style.display = this.isOpen ? 'block' : 'none';
        
        if (this.isOpen) {
            this.updateDisplay();
        }
    }
    
    close() {
        this.isOpen = false;
        document.getElementById('inventory-panel').style.display = 'none';
    }
    
    updateDisplay() {
        this.updateHotbarDisplay();
        this.updateInventoryDisplay();
    }
    
    updateHotbarDisplay() {
        const hotbarSlots = document.querySelectorAll('.hotbar-slot');
        
        hotbarSlots.forEach((slot, index) => {
            const item = this.slots[index];
            
            // Clear previous content
            slot.className = 'hotbar-slot';
            slot.innerHTML = '';
            
            if (index === this.selectedSlot) {
                slot.classList.add('active');
            }
            
            if (item) {
                const itemDef = this.itemDefinitions[item.type];
                slot.innerHTML = `
                    <div class="item-icon ${this.getItemIconClass(item.type)}"></div>
                    <div class="item-count">${item.quantity > 1 ? item.quantity : ''}</div>
                `;
                slot.title = itemDef.name;
            }
        });
    }
    
    updateInventoryDisplay() {
        if (!this.isOpen) return;
        
        const inventorySlots = document.querySelectorAll('.inventory-slot');
        
        inventorySlots.forEach((slot, index) => {
            const item = this.slots[index];
            
            slot.innerHTML = '';
            
            if (item) {
                const itemDef = this.itemDefinitions[item.type];
                slot.innerHTML = `
                    <div class="item-icon ${this.getItemIconClass(item.type)}"></div>
                    <div class="item-count">${item.quantity > 1 ? item.quantity : ''}</div>
                `;
                slot.title = itemDef.name;
            }
        });
    }
    
    getItemIconClass(itemType) {
        // Map item types to CSS classes for icons
        const iconMap = {
            'dirt': 'block-dirt',
            'stone': 'block-stone',
            'grass': 'block-grass',
            'wood': 'block-wood',
            'leaves': 'block-leaves',
            'sand': 'block-sand',
            'obsidian': 'block-stone',
            'emerald_ore': 'block-emerald',
            
            'wood_sword': 'tool-sword',
            'stone_sword': 'tool-sword',
            'emerald_sword': 'tool-sword',
            
            'wood_pickaxe': 'tool-pickaxe',
            'stone_pickaxe': 'tool-pickaxe',
            'emerald_pickaxe': 'tool-pickaxe',
            
            'wood_axe': 'tool-axe',
            'stone_axe': 'tool-axe',
            'emerald_axe': 'tool-axe',
            
            'leather_helmet': 'armor-helmet',
            'emerald_helmet': 'armor-helmet',
            'leather_chestplate': 'armor-chestplate',
            'emerald_chestplate': 'armor-chestplate',
            'leather_leggings': 'armor-leggings',
            'emerald_leggings': 'armor-leggings',
            'leather_boots': 'armor-boots',
            'emerald_boots': 'armor-boots'
        };
        
        return iconMap[itemType] || 'block-stone';
    }
    
    dropRandomItems(count) {
        // Drop random items from inventory (used when player dies)
        const nonEmptySlots = this.slots
            .map((item, index) => ({ item, index }))
            .filter(slot => slot.item !== null);
        
        for (let i = 0; i < Math.min(count, nonEmptySlots.length); i++) {
            const randomSlot = nonEmptySlots[Math.floor(Math.random() * nonEmptySlots.length)];
            const dropAmount = Math.min(randomSlot.item.quantity, Math.floor(Math.random() * 5) + 1);
            
            this.removeItem(randomSlot.item.type, dropAmount);
        }
    }
    
    // Save/Load functionality
    serialize() {
        return {
            slots: this.slots,
            selectedSlot: this.selectedSlot
        };
    }
    
    deserialize(data) {
        this.slots = data.slots || new Array(36).fill(null);
        this.selectedSlot = data.selectedSlot || 0;
        this.updateDisplay();
    }
}

// Trading system for villages
class TradeSystem {
    constructor() {
        this.trades = {
            // Basic trades
            'emerald_sword': { cost: 15, type: 'emeralds' },
            'emerald_pickaxe': { cost: 12, type: 'emeralds' },
            'emerald_axe': { cost: 10, type: 'emeralds' },
            'emerald_helmet': { cost: 8, type: 'emeralds' },
            'emerald_chestplate': { cost: 15, type: 'emeralds' },
            'emerald_leggings': { cost: 12, type: 'emeralds' },
            'emerald_boots': { cost: 6, type: 'emeralds' },
            'bread': { cost: 1, type: 'emeralds' },
            'golden_apple': { cost: 3, type: 'emeralds' }
        };
    }
    
    canAfford(itemType, player) {
        const trade = this.trades[itemType];
        if (!trade) return false;
        
        if (trade.type === 'emeralds') {
            return player.emeralds >= trade.cost;
        }
        
        return false;
    }
    
    makeTrade(itemType, player, inventory) {
        if (!this.canAfford(itemType, player)) {
            return false;
        }
        
        const trade = this.trades[itemType];
        
        if (trade.type === 'emeralds') {
            if (player.spendEmeralds(trade.cost)) {
                inventory.addItem(itemType, 1);
                return true;
            }
        }
        
        return false;
    }
    
    getTradeInfo(itemType) {
        return this.trades[itemType];
    }
    
    getAllTrades() {
        return Object.keys(this.trades);
    }
}

// Export for use in other modules
window.Inventory = Inventory;
window.TradeSystem = TradeSystem;