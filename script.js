// Interactive pipeline editor with draggable boxes and auto-updating connections
document.addEventListener('DOMContentLoaded', function() {
    const boxes = document.querySelectorAll('.pipeline-box');
    const svg = document.querySelector('.connectors-svg');
    const pipeline = document.querySelector('.pipeline');
    let isDragging = false;
    let currentBox = null;
    let offset = { x: 0, y: 0 };
    let connectionUpdateTimeout = null;
    
    // Default positions from box-positions.json
    // These MUST match the JSON file exactly
    const defaultPositions = {
        1: { x: -284, y: 6 },       // Grade 6 Math Kangaroo
        2: { x: 344, y: 25 },       // Gauss Contest
        3: { x: 950, y: 18 },       // Most Common Canadian Schools
        4: { x: -272, y: 997 },     // Meritus Academy
        5: { x: 825, y: 975 },      // Top-20 CS Universities
        6: { x: 2011, y: 1698 },    // USA SWE Chance (uottawa cs)
        7: { x: 280, y: 1008 },     // Top 30 High Schools (USACO)
        8: { x: 1399, y: 914 },     // World image
        10: { x: 106, y: 2055 },    // Health image
        12: { x: 1895, y: -3 },     // Degree circle
        13: { x: 1368, y: 1895 }    // Nuclear Family / Country box
    };
    
    // Force use default positions - ignore localStorage
    function forceDefaultPositions() {
        boxes.forEach((box) => {
            const boxNumber = parseInt(box.getAttribute('data-box'));
            const defaultPos = defaultPositions[boxNumber];
            if (defaultPos) {
                box.style.position = 'absolute';
                box.style.left = defaultPos.x + 'px';
                box.style.top = defaultPos.y + 'px';
            }
        });
    }
    
    // Load saved positions
    function loadPositions() {
        boxes.forEach((box, index) => {
            const boxNumber = parseInt(box.getAttribute('data-box'));
            const saved = localStorage.getItem(`box-${boxNumber}-position`);
            if (saved) {
                const pos = JSON.parse(saved);
                box.style.position = 'absolute';
                box.style.left = pos.x + 'px';
                box.style.top = pos.y + 'px';
            } else {
                // Use default position if no saved position
                const defaultPos = defaultPositions[boxNumber];
                if (defaultPos) {
                    box.style.position = 'absolute';
                    box.style.left = defaultPos.x + 'px';
                    box.style.top = defaultPos.y + 'px';
                }
            }
        });
    }
    
    // Save positions
    function savePositions() {
        boxes.forEach((box, index) => {
            const boxNumber = index + 1;
            const rect = box.getBoundingClientRect();
            const pipelineRect = pipeline.getBoundingClientRect();
            const position = {
                x: rect.left - pipelineRect.left,
                y: rect.top - pipelineRect.top
            };
            localStorage.setItem(`box-${boxNumber}-position`, JSON.stringify(position));
        });
        // Save world container position
        if (worldContainer) {
            const rect = worldContainer.getBoundingClientRect();
            const pipelineRect = pipeline.getBoundingClientRect();
            const position = {
                x: rect.left - pipelineRect.left,
                y: rect.top - pipelineRect.top
            };
            localStorage.setItem(`box-8-position`, JSON.stringify(position));
        }
        // Save explain container position
        if (explainContainer) {
            const rect = explainContainer.getBoundingClientRect();
            const pipelineRect = pipeline.getBoundingClientRect();
            const position = {
                x: rect.left - pipelineRect.left,
                y: rect.top - pipelineRect.top
            };
            localStorage.setItem(`box-9-position`, JSON.stringify(position));
        }
        // Save health container position
        if (healthContainer) {
            const rect = healthContainer.getBoundingClientRect();
            const pipelineRect = pipeline.getBoundingClientRect();
            const position = {
                x: rect.left - pipelineRect.left,
                y: rect.top - pipelineRect.top
            };
            localStorage.setItem(`box-10-position`, JSON.stringify(position));
        }
        // Save degree circle container position
        if (degreeCircleContainer) {
            const rect = degreeCircleContainer.getBoundingClientRect();
            const pipelineRect = pipeline.getBoundingClientRect();
            const position = {
                x: rect.left - pipelineRect.left,
                y: rect.top - pipelineRect.top
            };
            localStorage.setItem(`box-12-position`, JSON.stringify(position));
        }
        console.log('Positions saved!');
    }
    
    // Position all boxes first
    boxes.forEach((box) => {
        const boxNumber = parseInt(box.getAttribute('data-box'));
        const saved = localStorage.getItem(`box-${boxNumber}-position`);
        
        if (saved) {
            // Use saved position
            const pos = JSON.parse(saved);
            box.style.position = 'absolute';
            box.style.left = pos.x + 'px';
            box.style.top = pos.y + 'px';
        } else {
            // Use default position
            const defaultPos = defaultPositions[boxNumber];
            if (defaultPos) {
                box.style.position = 'absolute';
                box.style.left = defaultPos.x + 'px';
                box.style.top = defaultPos.y + 'px';
            } else {
                box.style.position = 'relative';
            }
        }
    });
    
    // (Hourly pay box removed)
    
    // Position world container
    const worldContainer = document.querySelector('.world-container:not(.explain-container):not(.health-container)');
    if (worldContainer) {
        const boxNumber = 8;
        const saved = localStorage.getItem(`box-${boxNumber}-position`);
        if (saved) {
            const pos = JSON.parse(saved);
            worldContainer.style.position = 'absolute';
            worldContainer.style.left = pos.x + 'px';
            worldContainer.style.top = pos.y + 'px';
        } else {
            const defaultPos = defaultPositions[boxNumber];
            if (defaultPos) {
                worldContainer.style.position = 'absolute';
                worldContainer.style.left = defaultPos.x + 'px';
                worldContainer.style.top = defaultPos.y + 'px';
            }
        }
    }
    
    // Position explain container
    const explainContainer = document.querySelector('.explain-container');
    if (explainContainer) {
        const boxNumber = 9;
        const saved = localStorage.getItem(`box-${boxNumber}-position`);
        if (saved) {
            const pos = JSON.parse(saved);
            explainContainer.style.position = 'absolute';
            explainContainer.style.left = pos.x + 'px';
            explainContainer.style.top = pos.y + 'px';
        } else {
            const defaultPos = defaultPositions[boxNumber];
            if (defaultPos) {
                explainContainer.style.position = 'absolute';
                explainContainer.style.left = defaultPos.x + 'px';
                explainContainer.style.top = defaultPos.y + 'px';
            }
        }
    }
    
    // Position health container
    const healthContainer = document.querySelector('.health-container');
    if (healthContainer) {
        const boxNumber = 10;
        const saved = localStorage.getItem(`box-${boxNumber}-position`);
        if (saved) {
            const pos = JSON.parse(saved);
            healthContainer.style.position = 'absolute';
            healthContainer.style.left = pos.x + 'px';
            healthContainer.style.top = pos.y + 'px';
        } else {
            const defaultPos = defaultPositions[boxNumber];
            if (defaultPos) {
                healthContainer.style.position = 'absolute';
                healthContainer.style.left = defaultPos.x + 'px';
                healthContainer.style.top = defaultPos.y + 'px';
            }
        }
    }
    
    // Position degree circle container
    const degreeCircleContainer = document.querySelector('.degree-circle-container');
    if (degreeCircleContainer) {
        const boxNumber = 12;
        const saved = localStorage.getItem(`box-${boxNumber}-position`);
        if (saved) {
            const pos = JSON.parse(saved);
            degreeCircleContainer.style.position = 'absolute';
            degreeCircleContainer.style.left = pos.x + 'px';
            degreeCircleContainer.style.top = pos.y + 'px';
            degreeCircleContainer.style.bottom = 'auto';
        } else {
            const defaultPos = defaultPositions[boxNumber];
            if (defaultPos) {
                degreeCircleContainer.style.position = 'absolute';
                degreeCircleContainer.style.left = defaultPos.x + 'px';
                degreeCircleContainer.style.top = defaultPos.y + 'px';
                degreeCircleContainer.style.bottom = 'auto';
            }
        }
    }
    
    // Make all boxes draggable (after positioning)
    boxes.forEach((box) => {
        // Enable dragging on box header
        const boxHeader = box.querySelector('.box-header');
        if (boxHeader) {
            boxHeader.style.cursor = 'move';
            boxHeader.style.userSelect = 'none';
            
            boxHeader.addEventListener('mousedown', function(e) {
                // Don't drag if clicking on links or coordinates
                if (e.target.tagName === 'A' || e.target.closest('.coordinates-display')) {
                    return;
                }
                isDragging = true;
                currentBox = box;
                const rect = box.getBoundingClientRect();
                // Calculate offset: mouse position relative to box position (both in viewport coordinates)
                offset.x = e.clientX - rect.left;
                offset.y = e.clientY - rect.top;
                box.style.zIndex = '1000';
                box.style.transform = 'none'; // Disable hover transform during drag
                e.preventDefault();
                e.stopPropagation();
            });
        }
    });
    
    // Make world container draggable
    if (worldContainer) {
        worldContainer.style.cursor = 'move';
        worldContainer.style.userSelect = 'none';
        
        worldContainer.addEventListener('mousedown', function(e) {
            // Don't drag if clicking on coordinates display
            if (e.target.closest('.world-coordinates-display')) {
                return;
            }
            isDragging = true;
            currentBox = worldContainer;
            const rect = worldContainer.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
            worldContainer.style.zIndex = '1000';
            e.preventDefault();
            e.stopPropagation();
        });
    }
    
    // Make explain container draggable
    if (explainContainer) {
        explainContainer.style.cursor = 'move';
        explainContainer.style.userSelect = 'none';
        
        explainContainer.addEventListener('mousedown', function(e) {
            // Don't drag if clicking on coordinates display
            if (e.target.closest('.world-coordinates-display')) {
                return;
            }
            isDragging = true;
            currentBox = explainContainer;
            const rect = explainContainer.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
            explainContainer.style.zIndex = '1000';
            e.preventDefault();
            e.stopPropagation();
        });
    }
    
    // Make health container draggable
    if (healthContainer) {
        healthContainer.style.cursor = 'move';
        healthContainer.style.userSelect = 'none';
        
        healthContainer.addEventListener('mousedown', function(e) {
            // Don't drag if clicking on coordinates display
            if (e.target.closest('.world-coordinates-display')) {
                return;
            }
            isDragging = true;
            currentBox = healthContainer;
            const rect = healthContainer.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
            healthContainer.style.zIndex = '1000';
            e.preventDefault();
            e.stopPropagation();
        });
    }
    
    // Make degree circle container draggable
    if (degreeCircleContainer) {
        degreeCircleContainer.style.cursor = 'move';
        degreeCircleContainer.style.userSelect = 'none';
        
        degreeCircleContainer.addEventListener('mousedown', function(e) {
            // Don't drag if clicking on coordinates display
            if (e.target.closest('.world-coordinates-display')) {
                return;
            }
            isDragging = true;
            currentBox = degreeCircleContainer;
            const rect = degreeCircleContainer.getBoundingClientRect();
            offset.x = e.clientX - rect.left;
            offset.y = e.clientY - rect.top;
            degreeCircleContainer.style.zIndex = '1000';
            e.preventDefault();
            e.stopPropagation();
        });
    }
    
    // Mouse move - drag box
    document.addEventListener('mousemove', function(e) {
        if (!isDragging || !currentBox) return;
        
        const pipelineRect = pipeline.getBoundingClientRect();
        // Calculate new position: mouse position minus offset, relative to pipeline
        const newX = e.clientX - pipelineRect.left - offset.x;
        const newY = e.clientY - pipelineRect.top - offset.y;
        
        currentBox.style.left = newX + 'px';
        currentBox.style.top = newY + 'px';
        
        // Update coordinates in real-time
        if (currentBox.classList && (currentBox.classList.contains('world-container') || currentBox.classList.contains('explain-container') || currentBox.classList.contains('health-container') || currentBox.classList.contains('degree-circle-container'))) {
            updateWorldCoordinates();
        } else {
            updateCoordinates(currentBox);
        }
        
        // Throttle connection redraws for smoother dragging
        if (connectionUpdateTimeout) clearTimeout(connectionUpdateTimeout);
        connectionUpdateTimeout = setTimeout(() => {
            drawConnections();
        }, 16); // ~60fps
    });
    
    // Mouse up - stop dragging
    document.addEventListener('mouseup', function(e) {
        if (isDragging && currentBox) {
            isDragging = false;
            currentBox.style.zIndex = '1';
            currentBox.style.transform = ''; // Re-enable hover transform
            savePositions();
            drawConnections();
            currentBox = null;
        }
    });
    
    // Also handle mouse leave to stop dragging if mouse leaves window
    document.addEventListener('mouseleave', function(e) {
        if (isDragging && currentBox) {
            isDragging = false;
            currentBox.style.zIndex = '1';
            currentBox.style.transform = '';
            savePositions();
            drawConnections();
            currentBox = null;
        }
    });
    
    // Update coordinate display for a box
    function updateCoordinates(box) {
        const coordDisplay = box.querySelector('.coordinates-display');
        if (coordDisplay) {
            const rect = box.getBoundingClientRect();
            const pipelineRect = pipeline.getBoundingClientRect();
            const x = Math.round(rect.left - pipelineRect.left);
            const y = Math.round(rect.top - pipelineRect.top);
            coordDisplay.textContent = `(${x}, ${y})`;
        }
    }
    
    // Update world coordinates
    function updateWorldCoordinates() {
        if (worldContainer) {
            const coordDisplay = worldContainer.querySelector('.world-coordinates-display');
            if (coordDisplay) {
                const rect = worldContainer.getBoundingClientRect();
                const pipelineRect = pipeline.getBoundingClientRect();
                const x = Math.round(rect.left - pipelineRect.left);
                const y = Math.round(rect.top - pipelineRect.top);
                coordDisplay.textContent = `(${x}, ${y})`;
            }
        }
        if (explainContainer) {
            const coordDisplay = explainContainer.querySelector('.world-coordinates-display');
            if (coordDisplay) {
                const rect = explainContainer.getBoundingClientRect();
                const pipelineRect = pipeline.getBoundingClientRect();
                const x = Math.round(rect.left - pipelineRect.left);
                const y = Math.round(rect.top - pipelineRect.top);
                coordDisplay.textContent = `(${x}, ${y})`;
            }
        }
        if (healthContainer) {
            const coordDisplay = healthContainer.querySelector('.world-coordinates-display');
            if (coordDisplay) {
                const rect = healthContainer.getBoundingClientRect();
                const pipelineRect = pipeline.getBoundingClientRect();
                const x = Math.round(rect.left - pipelineRect.left);
                const y = Math.round(rect.top - pipelineRect.top);
                coordDisplay.textContent = `(${x}, ${y})`;
            }
        }
        if (degreeCircleContainer) {
            const coordDisplay = degreeCircleContainer.querySelector('.world-coordinates-display');
            if (coordDisplay) {
                const rect = degreeCircleContainer.getBoundingClientRect();
                const pipelineRect = pipeline.getBoundingClientRect();
                const x = Math.round(rect.left - pipelineRect.left);
                const y = Math.round(rect.top - pipelineRect.top);
                coordDisplay.textContent = `(${x}, ${y})`;
            }
        }
    }
    
    // Add coordinate displays to all boxes - MUST be after boxes are positioned
    function addCoordinateDisplays() {
        boxes.forEach((box) => {
            // Check if coordinate display already exists
            let coordDisplay = box.querySelector('.coordinates-display');
            if (!coordDisplay) {
                coordDisplay = document.createElement('div');
                coordDisplay.className = 'coordinates-display';
                coordDisplay.textContent = '(0, 0)';
                const boxHeader = box.querySelector('.box-header');
                if (boxHeader) {
                    // Insert after sv-percentage or at the end
                    const svPercentage = boxHeader.querySelector('.sv-percentage');
                    if (svPercentage) {
                        boxHeader.insertBefore(coordDisplay, svPercentage.nextSibling);
                    } else {
                        boxHeader.appendChild(coordDisplay);
                    }
                }
            }
        });
    }
    
    // Update coordinates periodically (faster for real-time updates)
    setInterval(() => {
        boxes.forEach(box => {
            if (!isDragging || box !== currentBox) {
                updateCoordinates(box);
            }
        });
        if (worldContainer && (!isDragging || worldContainer !== currentBox)) {
            updateWorldCoordinates();
        }
        if (explainContainer && (!isDragging || explainContainer !== currentBox)) {
            updateWorldCoordinates();
        }
        if (healthContainer && (!isDragging || healthContainer !== currentBox)) {
            updateWorldCoordinates();
        }
        if (degreeCircleContainer && (!isDragging || degreeCircleContainer !== currentBox)) {
            updateWorldCoordinates();
        }
    }, 50);
    
    window.addEventListener('resize', () => {
        setTimeout(() => {
            boxes.forEach(box => updateCoordinates(box));
        }, 100);
    });
    
    // Draw connections: Box 4 -> Box 7, Box 7 -> Box 5
    function drawConnections() {
        // Clear existing paths
        const existingPaths = svg.querySelectorAll('.connector-path');
        existingPaths.forEach(path => path.remove());
        
        const box1 = document.querySelector('[data-box="1"]');
        const box2 = document.querySelector('[data-box="2"]');
        const box3 = document.querySelector('[data-box="3"]');
        const box4 = document.querySelector('[data-box="4"]');
        const box5 = document.querySelector('[data-box="5"]');
        const box6 = document.querySelector('[data-box="6"]');
        const box7 = document.querySelector('[data-box="7"]');
        const box12 = document.querySelector('[data-box="12"]');
        const worldContainer = document.querySelector('.world-container:not(.explain-container):not(.health-container)');
        
        if (!box1 || !box2 || !box3 || !box4 || !box5 || !box6 || !box7 || !worldContainer) return;
        
        const pipelineRect = pipeline.getBoundingClientRect();
        const box1Rect = box1.getBoundingClientRect();
        const box2Rect = box2.getBoundingClientRect();
        const box3Rect = box3.getBoundingClientRect();
        const box4Rect = box4.getBoundingClientRect();
        const box5Rect = box5.getBoundingClientRect();
        const box6Rect = box6.getBoundingClientRect();
        const box7Rect = box7.getBoundingClientRect();
        const worldRect = worldContainer.getBoundingClientRect();
        
        // Helper functions
        const getBoxRight = (rect) => ({
            x: rect.right - pipelineRect.left,
            y: rect.top - pipelineRect.top + rect.height / 2
        });
        
        const getBoxLeft = (rect) => ({
            x: rect.left - pipelineRect.left,
            y: rect.top - pipelineRect.top + rect.height / 2
        });
        
        const getBoxBottom = (rect) => ({
            x: rect.left - pipelineRect.left + rect.width / 2,
            y: rect.bottom - pipelineRect.top
        });
        
        const getBoxTop = (rect) => ({
            x: rect.left - pipelineRect.left + rect.width / 2,
            y: rect.top - pipelineRect.top
        });
        
        // Connection points
        const box1Right = getBoxRight(box1Rect);
        const box2Left = getBoxLeft(box2Rect);
        const box2Right = getBoxRight(box2Rect);
        const box3Left = getBoxLeft(box3Rect);
        const box3Right = getBoxRight(box3Rect);
        const worldLeft = getBoxLeft(worldRect);
        const worldRight = getBoxRight(worldRect);
        const box5Left = getBoxLeft(box5Rect);
        const box5Right = getBoxRight(box5Rect);
        const box7Left = getBoxLeft(box7Rect);
        const box7Right = getBoxRight(box7Rect);
        const box4Left = getBoxLeft(box4Rect);
        const box4Right = getBoxRight(box4Rect);
        const box6Left = getBoxLeft(box6Rect);
        const box6Right = getBoxRight(box6Rect);
        const box12Rect = box12 ? box12.getBoundingClientRect() : null;
        const box12Left = box12Rect ? getBoxLeft(box12Rect) : null;
        const box12Right = box12Rect ? getBoxRight(box12Rect) : null;
        
        // Path 1: GR 6 Math (box 1) -> GR8 (box 2)
        const path1to2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const controlX1to2_1 = box1Right.x + (box2Left.x - box1Right.x) * 0.3;
        const controlY1to2_1 = box1Right.y;
        const controlX1to2_2 = box2Left.x - (box2Left.x - box1Right.x) * 0.3;
        const controlY1to2_2 = box2Left.y;
        path1to2.setAttribute('d', `M ${box1Right.x} ${box1Right.y} C ${controlX1to2_1} ${controlY1to2_1}, ${controlX1to2_2} ${controlY1to2_2}, ${box2Left.x} ${box2Left.y}`);
        path1to2.setAttribute('class', 'connector-path');
        path1to2.setAttribute('stroke', 'url(#pathGradient)');
        path1to2.setAttribute('stroke-width', '4');
        path1to2.setAttribute('fill', 'none');
        path1to2.setAttribute('filter', 'url(#glow)');
        svg.appendChild(path1to2);
        
        // Path 2: GR8 (box 2) -> CCC (box 3)
        const path2to3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const controlX2to3_1 = box2Right.x + (box3Left.x - box2Right.x) * 0.3;
        const controlY2to3_1 = box2Right.y;
        const controlX2to3_2 = box3Left.x - (box3Left.x - box2Right.x) * 0.3;
        const controlY2to3_2 = box3Left.y;
        path2to3.setAttribute('d', `M ${box2Right.x} ${box2Right.y} C ${controlX2to3_1} ${controlY2to3_1}, ${controlX2to3_2} ${controlY2to3_2}, ${box3Left.x} ${box3Left.y}`);
        path2to3.setAttribute('class', 'connector-path');
        path2to3.setAttribute('stroke', 'url(#pathGradient)');
        path2to3.setAttribute('stroke-width', '4');
        path2to3.setAttribute('fill', 'none');
        path2to3.setAttribute('filter', 'url(#glow)');
        svg.appendChild(path2to3);
        
        // Path 4: Meritus (box 4) -> T30 HS (box 7)
        const path4to7 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const controlX4to7_1 = box4Right.x + (box7Left.x - box4Right.x) * 0.3;
        const controlY4to7_1 = box4Right.y;
        const controlX4to7_2 = box7Left.x - (box7Left.x - box4Right.x) * 0.3;
        const controlY4to7_2 = box7Left.y;
        path4to7.setAttribute('d', `M ${box4Right.x} ${box4Right.y} C ${controlX4to7_1} ${controlY4to7_1}, ${controlX4to7_2} ${controlY4to7_2}, ${box7Left.x} ${box7Left.y}`);
        path4to7.setAttribute('class', 'connector-path');
        path4to7.setAttribute('stroke', 'url(#pathGradient)');
        path4to7.setAttribute('stroke-width', '4');
        path4to7.setAttribute('fill', 'none');
        path4to7.setAttribute('filter', 'url(#glow)');
        svg.appendChild(path4to7);
        
        // Path 5: T30 HS (box 7) -> T20 Unis (box 5)
        const path7to5 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const controlX7to5_1 = box7Right.x + (box5Left.x - box7Right.x) * 0.3;
        const controlY7to5_1 = box7Right.y;
        const controlX7to5_2 = box5Left.x - (box5Left.x - box7Right.x) * 0.3;
        const controlY7to5_2 = box5Left.y;
        path7to5.setAttribute('d', `M ${box7Right.x} ${box7Right.y} C ${controlX7to5_1} ${controlY7to5_1}, ${controlX7to5_2} ${controlY7to5_2}, ${box5Left.x} ${box5Left.y}`);
        path7to5.setAttribute('class', 'connector-path');
        path7to5.setAttribute('stroke', 'url(#pathGradient)');
        path7to5.setAttribute('stroke-width', '4');
        path7to5.setAttribute('fill', 'none');
        path7to5.setAttribute('filter', 'url(#glow)');
        svg.appendChild(path7to5);
        
        // Path 6: T20 Unis (box 5) -> World
        const path5toWorld = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const controlX5toWorld_1 = box5Right.x + (worldLeft.x - box5Right.x) * 0.3;
        const controlY5toWorld_1 = box5Right.y;
        const controlX5toWorld_2 = worldLeft.x - (worldLeft.x - box5Right.x) * 0.3;
        const controlY5toWorld_2 = worldLeft.y;
        path5toWorld.setAttribute('d', `M ${box5Right.x} ${box5Right.y} C ${controlX5toWorld_1} ${controlY5toWorld_1}, ${controlX5toWorld_2} ${controlY5toWorld_2}, ${worldLeft.x} ${worldLeft.y}`);
        path5toWorld.setAttribute('class', 'connector-path');
        path5toWorld.setAttribute('stroke', 'url(#pathGradient)');
        path5toWorld.setAttribute('stroke-width', '4');
        path5toWorld.setAttribute('fill', 'none');
        path5toWorld.setAttribute('filter', 'url(#glow)');
        svg.appendChild(path5toWorld);
        
        // Path 7: USA SWE Chance (box 6) -> World (box 8)
        const path6toWorld = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const controlX6toWorld_1 = box6Right.x + (worldLeft.x - box6Right.x) * 0.3;
        const controlY6toWorld_1 = box6Right.y;
        const controlX6toWorld_2 = worldLeft.x - (worldLeft.x - box6Right.x) * 0.3;
        const controlY6toWorld_2 = worldLeft.y;
        path6toWorld.setAttribute('d', `M ${box6Right.x} ${box6Right.y} C ${controlX6toWorld_1} ${controlY6toWorld_1}, ${controlX6toWorld_2} ${controlY6toWorld_2}, ${worldLeft.x} ${worldLeft.y}`);
        path6toWorld.setAttribute('class', 'connector-path');
        path6toWorld.setAttribute('stroke', 'url(#pathGradient)');
        path6toWorld.setAttribute('stroke-width', '4');
        path6toWorld.setAttribute('fill', 'none');
        path6toWorld.setAttribute('filter', 'url(#glow)');
        svg.appendChild(path6toWorld);
        
        // Path 8: Senior CCC (box 3) -> Degree Circle (box 12)
        if (box12 && box12Left && box12Right && box3Right) {
            const path3to12 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
            const controlX3to12_1 = box3Right.x + (box12Left.x - box3Right.x) * 0.3;
            const controlY3to12_1 = box3Right.y;
            const controlX3to12_2 = box12Left.x - (box12Left.x - box3Right.x) * 0.3;
            const controlY3to12_2 = box12Left.y;
            path3to12.setAttribute('d', `M ${box3Right.x} ${box3Right.y} C ${controlX3to12_1} ${controlY3to12_1}, ${controlX3to12_2} ${controlY3to12_2}, ${box12Left.x} ${box12Left.y}`);
            path3to12.setAttribute('class', 'connector-path');
            path3to12.setAttribute('stroke', 'url(#pathGradient)');
            path3to12.setAttribute('stroke-width', '4');
            path3to12.setAttribute('fill', 'none');
            path3to12.setAttribute('filter', 'url(#glow)');
            svg.appendChild(path3to12);
        }
        
        // Set SVG size
        svg.setAttribute('width', pipelineRect.width);
        svg.setAttribute('height', pipelineRect.height);
        svg.style.width = pipelineRect.width + 'px';
        svg.style.height = pipelineRect.height + 'px';
    }
    
    // Clear localStorage for all boxes to force new defaults
    for (let i = 1; i <= 13; i++) {
        localStorage.removeItem(`box-${i}-position`);
    }
    console.log('LocalStorage cleared - using new default positions (including Nuclear Family / Country)');
    
    // Load positions (use saved if available, otherwise defaults)
    boxes.forEach((box) => {
        const boxNumber = parseInt(box.getAttribute('data-box'));
        const saved = localStorage.getItem(`box-${boxNumber}-position`);
        if (saved) {
            const pos = JSON.parse(saved);
            box.style.position = 'absolute';
            box.style.left = pos.x + 'px';
            box.style.top = pos.y + 'px';
        } else {
            const defaultPos = defaultPositions[boxNumber];
            if (defaultPos) {
                box.style.position = 'absolute';
                box.style.left = defaultPos.x + 'px';
                box.style.top = defaultPos.y + 'px';
            }
        }
    });
    
    // Add coordinate displays immediately
    addCoordinateDisplays();
    
    // Update coordinates and draw connections after positions are loaded
    setTimeout(() => {
        boxes.forEach(box => updateCoordinates(box));
        updateWorldCoordinates(); // This will update all containers including degree circle
        drawConnections();
    }, 200);
    
    // Also draw connections after a delay
    setTimeout(() => {
        drawConnections();
        boxes.forEach(box => updateCoordinates(box));
        updateWorldCoordinates(); // This will update all containers including degree circle
    }, 500);
    
    // Draw connections again after a longer delay to ensure everything is ready
    setTimeout(() => {
        drawConnections();
        boxes.forEach(box => updateCoordinates(box));
        updateWorldCoordinates(); // This will update all containers including degree circle
    }, 800);
    
    // Redraw on window resize
    let resizeTimeout;
    window.addEventListener('resize', function() {
        clearTimeout(resizeTimeout);
        resizeTimeout = setTimeout(() => {
            drawConnections();
        }, 250);
    });
    
    // Export positions to JSON file
    function exportPositions() {
        const positions = {};
        boxes.forEach((box, index) => {
            const boxNumber = index + 1;
            const saved = localStorage.getItem(`box-${boxNumber}-position`);
            if (saved) {
                positions[`box-${boxNumber}`] = JSON.parse(saved);
            }
        });
        
        const dataStr = JSON.stringify(positions, null, 2);
        const dataBlob = new Blob([dataStr], { type: 'application/json' });
        const url = URL.createObjectURL(dataBlob);
        const link = document.createElement('a');
        link.href = url;
        link.download = 'box-positions.json';
        link.click();
        URL.revokeObjectURL(url);
    }
    
    // Add save button
    const saveButton = document.createElement('button');
    saveButton.textContent = '💾 Save Layout';
    saveButton.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 12px 24px;
        background: linear-gradient(135deg, #667eea, #764ba2);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(102, 126, 234, 0.4);
        transition: all 0.3s ease;
    `;
    saveButton.addEventListener('mouseenter', () => {
        saveButton.style.transform = 'scale(1.05)';
        saveButton.style.boxShadow = '0 6px 20px rgba(102, 126, 234, 0.6)';
    });
    saveButton.addEventListener('mouseleave', () => {
        saveButton.style.transform = 'scale(1)';
        saveButton.style.boxShadow = '0 4px 15px rgba(102, 126, 234, 0.4)';
    });
    saveButton.addEventListener('click', () => {
        savePositions();
        saveButton.textContent = '✓ Saved!';
        setTimeout(() => {
            saveButton.textContent = '💾 Save Layout';
        }, 2000);
    });
    document.body.appendChild(saveButton);
    
    // Add export button
    const exportButton = document.createElement('button');
    exportButton.textContent = '📥 Export Positions';
    exportButton.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        padding: 12px 24px;
        background: linear-gradient(135deg, #4facfe, #00f2fe);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(79, 172, 254, 0.4);
        transition: all 0.3s ease;
    `;
    exportButton.addEventListener('mouseenter', () => {
        exportButton.style.transform = 'scale(1.05)';
        exportButton.style.boxShadow = '0 6px 20px rgba(79, 172, 254, 0.6)';
    });
    exportButton.addEventListener('mouseleave', () => {
        exportButton.style.transform = 'scale(1)';
        exportButton.style.boxShadow = '0 4px 15px rgba(79, 172, 254, 0.4)';
    });
    exportButton.addEventListener('click', () => {
        exportPositions();
        exportButton.textContent = '✓ Exported!';
        setTimeout(() => {
            exportButton.textContent = '📥 Export Positions';
        }, 2000);
    });
    document.body.appendChild(exportButton);
    
    // Add reset button
    const resetButton = document.createElement('button');
    resetButton.textContent = '🔄 Reset Layout';
    resetButton.style.cssText = `
        position: fixed;
        top: 70px;
        right: 20px;
        padding: 12px 24px;
        background: linear-gradient(135deg, #f093fb, #f5576c);
        color: white;
        border: none;
        border-radius: 8px;
        cursor: pointer;
        font-size: 16px;
        font-weight: 600;
        z-index: 1000;
        box-shadow: 0 4px 15px rgba(240, 147, 251, 0.4);
        transition: all 0.3s ease;
    `;
    resetButton.addEventListener('mouseenter', () => {
        resetButton.style.transform = 'scale(1.05)';
    });
    resetButton.addEventListener('mouseleave', () => {
        resetButton.style.transform = 'scale(1)';
    });
    resetButton.addEventListener('click', () => {
        boxes.forEach((box, index) => {
            const boxNumber = index + 1;
            localStorage.removeItem(`box-${boxNumber}-position`);
            box.style.position = 'relative';
            box.style.left = '';
            box.style.top = '';
            box.style.transform = '';
        });
        setTimeout(() => {
            drawConnections();
        }, 100);
        resetButton.textContent = '✓ Reset!';
        setTimeout(() => {
            resetButton.textContent = '🔄 Reset Layout';
        }, 2000);
    });
    document.body.appendChild(resetButton);
    
    // Add entrance animations
    const listItems = document.querySelectorAll('.school-list li');
    listItems.forEach((item, index) => {
        item.style.opacity = '0';
        item.style.transform = 'translateX(-20px)';
        
        setTimeout(() => {
            item.style.transition = 'all 0.5s ease';
            item.style.opacity = '1';
            item.style.transform = 'translateX(0)';
        }, index * 50);
    });
    
    boxes.forEach((box, index) => {
        box.style.opacity = '0';
        box.style.transform = 'scale(0.9) translateY(20px)';
        
        setTimeout(() => {
            box.style.transition = 'all 0.6s ease';
            box.style.opacity = '1';
            box.style.transform = 'scale(1) translateY(0)';
        }, index * 200);
    });
    
    // Click interaction for list items
    listItems.forEach(item => {
        item.addEventListener('click', function(e) {
            if (isDragging) return;
            this.style.background = 'rgba(102, 126, 234, 0.3)';
            setTimeout(() => {
                this.style.background = 'rgba(102, 126, 234, 0.1)';
            }, 300);
        });
    });
});
