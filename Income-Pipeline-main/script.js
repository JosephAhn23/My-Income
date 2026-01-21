// Interactive pipeline editor with draggable boxes and auto-updating connections
document.addEventListener('DOMContentLoaded', function() {
    const boxes = document.querySelectorAll('.pipeline-box');
    const svg = document.querySelector('.connectors-svg');
    const pipeline = document.querySelector('.pipeline');
    let isDragging = false;
    let currentBox = null;
    let offset = { x: 0, y: 0 };
    
    // Default positions from box-positions.json
    // These MUST match the JSON file exactly
    const defaultPositions = {
        1: { x: -284, y: 6 },       // Grade 6 Math Kangaroo
        2: { x: 344, y: 25 },       // Gauss Contest
        3: { x: 950, y: 18 },       // Most Common Canadian Schools
        4: { x: 496, y: 1082 },     // Meritus Academy
        5: { x: 1604, y: 470 },     // Top-20 CS Universities
        6: { x: -237, y: 1061 }    // Silicon Valley SWE Independent Factors (bottom left)
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
        console.log('Positions saved!');
    }
    
    // Make all boxes draggable
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
        
        // Boxes are now fixed/stagnant - no dragging allowed
        box.style.cursor = 'default';
        box.setAttribute('draggable', 'false');
    });
    
    // Dragging is disabled - boxes are fixed in position
    // Removed all mousemove and mouseup drag handlers
    
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
    
    // Dragging disabled - boxes are fixed/stagnant
    // All mousemove and mouseup drag handlers removed
    
    // Update coordinates periodically (faster for real-time updates)
    setInterval(() => {
        boxes.forEach(box => updateCoordinates(box));
    }, 100);
    
    window.addEventListener('resize', () => {
        setTimeout(() => {
            boxes.forEach(box => updateCoordinates(box));
        }, 100);
    });
    
    // Draw smooth tree-like connections
    // New structure: 1->2->3->5 (Top-20 Unis) and 2->4 (Meritus)->5 and 6->5
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
        
        if (!box1 || !box2 || !box3 || !box4 || !box5 || !box6) return;
        
        const pipelineRect = pipeline.getBoundingClientRect();
        const box1Rect = box1.getBoundingClientRect();
        const box2Rect = box2.getBoundingClientRect();
        const box3Rect = box3.getBoundingClientRect();
        const box4Rect = box4.getBoundingClientRect();
        const box5Rect = box5.getBoundingClientRect();
        const box6Rect = box6.getBoundingClientRect();
        
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
        const box2Bottom = getBoxBottom(box2Rect);
        const box3Left = getBoxLeft(box3Rect);
        const box3Right = getBoxRight(box3Rect);
        const box4Top = getBoxTop(box4Rect);
        const box4Right = getBoxRight(box4Rect);
        const box5Top = getBoxTop(box5Rect);
        const box5Left = getBoxLeft(box5Rect);
        const box6Right = getBoxRight(box6Rect);
        
        // Path 1: Box 1 (Math Kangaroo) -> Box 2 (Gauss)
        const path1 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midX1 = (box1Right.x + box2Left.x) / 2;
        path1.setAttribute('d', `M ${box1Right.x} ${box1Right.y} C ${midX1} ${box1Right.y}, ${midX1} ${box2Left.y}, ${box2Left.x} ${box2Left.y}`);
        path1.setAttribute('class', 'connector-path');
        path1.setAttribute('stroke', 'url(#pathGradient)');
        path1.setAttribute('stroke-width', '4');
        path1.setAttribute('fill', 'none');
        path1.setAttribute('filter', 'url(#glow)');
        svg.appendChild(path1);
        
        // Path 2: Box 2 (Gauss) -> Box 3 (Most Common Schools)
        const path2 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midX2 = (box2Right.x + box3Left.x) / 2;
        path2.setAttribute('d', `M ${box2Right.x} ${box2Right.y} C ${midX2} ${box2Right.y}, ${midX2} ${box3Left.y}, ${box3Left.x} ${box3Left.y}`);
        path2.setAttribute('class', 'connector-path');
        path2.setAttribute('stroke', 'url(#pathGradient)');
        path2.setAttribute('stroke-width', '4');
        path2.setAttribute('fill', 'none');
        path2.setAttribute('filter', 'url(#glow)');
        svg.appendChild(path2);
        
        // Path 3: Box 3 (Most Common Schools) -> Box 5 (Top-20 Unis)
        const path3 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const controlX3_1 = box3Right.x + (box5Left.x - box3Right.x) * 0.3;
        const controlY3_1 = box3Right.y + (box5Left.y - box3Right.y) * 0.3;
        const controlX3_2 = box5Left.x - (box5Left.x - box3Right.x) * 0.3;
        const controlY3_2 = box5Left.y - (box5Left.y - box3Right.y) * 0.3;
        path3.setAttribute('d', `M ${box3Right.x} ${box3Right.y} C ${controlX3_1} ${controlY3_1}, ${controlX3_2} ${controlY3_2}, ${box5Left.x} ${box5Left.y}`);
        path3.setAttribute('class', 'connector-path');
        path3.setAttribute('stroke', 'url(#pathGradient)');
        path3.setAttribute('stroke-width', '4');
        path3.setAttribute('fill', 'none');
        path3.setAttribute('filter', 'url(#glow)');
        svg.appendChild(path3);
        
        // Path 4: Box 2 (Gauss) -> Box 4 (Meritus Academy)
        const path4 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const midY4 = (box2Bottom.y + box4Top.y) / 2;
        path4.setAttribute('d', `M ${box2Bottom.x} ${box2Bottom.y} C ${box2Bottom.x} ${midY4}, ${box4Top.x} ${midY4}, ${box4Top.x} ${box4Top.y}`);
        path4.setAttribute('class', 'connector-path');
        path4.setAttribute('stroke', 'url(#pathGradient)');
        path4.setAttribute('stroke-width', '4');
        path4.setAttribute('fill', 'none');
        path4.setAttribute('filter', 'url(#glow)');
        svg.appendChild(path4);
        
        // Path 5: Box 4 (Meritus Academy) -> Box 5 (Top-20 Unis)
        const path5 = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const controlX5_1 = box4Right.x + (box5Left.x - box4Right.x) * 0.3;
        const controlY5_1 = box4Right.y;
        const controlX5_2 = box5Left.x - (box5Left.x - box4Right.x) * 0.3;
        const controlY5_2 = box5Left.y;
        path5.setAttribute('d', `M ${box4Right.x} ${box4Right.y} C ${controlX5_1} ${controlY5_1}, ${controlX5_2} ${controlY5_2}, ${box5Left.x} ${box5Left.y}`);
        path5.setAttribute('class', 'connector-path');
        path5.setAttribute('stroke', 'url(#pathGradient)');
        path5.setAttribute('stroke-width', '4');
        path5.setAttribute('fill', 'none');
        path5.setAttribute('filter', 'url(#glow)');
        svg.appendChild(path5);
        
        // Path 6: Box 6 (Independent Factors) -> Box 5 (Top-20 Unis) - REMOVED
        // No connection line for Independent Factors box
        
        // Set SVG size
        svg.setAttribute('width', pipelineRect.width);
        svg.setAttribute('height', pipelineRect.height);
        svg.style.width = pipelineRect.width + 'px';
        svg.style.height = pipelineRect.height + 'px';
    }
    
    // Force default positions on page load (from box-positions.json)
    forceDefaultPositions();
    
    // Also clear localStorage to ensure fresh start
    boxes.forEach((box) => {
        const boxNumber = parseInt(box.getAttribute('data-box'));
        localStorage.removeItem(`box-${boxNumber}-position`);
    });
    
    // Add coordinate displays immediately
    addCoordinateDisplays();
    
    // Update coordinates and draw connections after positions are loaded
    setTimeout(() => {
        boxes.forEach(box => updateCoordinates(box));
        drawConnections();
    }, 200);
    
    // Also draw connections after a delay
    setTimeout(() => {
        drawConnections();
        boxes.forEach(box => updateCoordinates(box));
    }, 500);
    
    // Draw connections again after a longer delay to ensure everything is ready
    setTimeout(() => {
        drawConnections();
        boxes.forEach(box => updateCoordinates(box));
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
