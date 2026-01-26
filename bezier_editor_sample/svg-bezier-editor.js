class SVGBezierEditor {
    constructor(svgId) {
        this.svg = document.getElementById(svgId);
        
        this.points = {
            start: { x: 100, y: 200 },
            control1: { x: 200, y: 100 },
            control2: { x: 500, y: 100 },
            end: { x: 600, y: 200 }
        };
        
        this.isDragging = false;
        this.draggedPoint = null;
        this.offset = { x: 0, y: 0 };
        
        this.elements = {
            start: document.getElementById('point-start'),
            control1: document.getElementById('point-control1'),
            control2: document.getElementById('point-control2'),
            end: document.getElementById('point-end'),
            curve: document.getElementById('bezier-curve'),
            line1: document.getElementById('control-line-1'),
            line2: document.getElementById('control-line-2')
        };
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.updateDisplay();
    }
    
    setupEventListeners() {
        Object.keys(this.elements).forEach(key => {
            if (key !== 'curve' && key !== 'line1' && key !== 'line2') {
                this.elements[key].addEventListener('mousedown', (e) => this.handleMouseDown(e, key));
            }
        });
        
        this.svg.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.svg.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.svg.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        
        document.getElementById('resetBtn').addEventListener('click', this.reset.bind(this));
    }
    
    handleMouseDown(e, pointKey) {
        e.preventDefault();
        
        this.isDragging = true;
        this.draggedPoint = pointKey;
        
        const rect = this.svg.getBoundingClientRect();
        const point = this.getPointFromEvent(e, rect);
        
        this.offset.x = point.x - this.points[pointKey].x;
        this.offset.y = point.y - this.points[pointKey].y;
        
        this.elements[pointKey].classList.add('dragging');
    }
    
    handleMouseMove(e) {
        if (!this.isDragging || !this.draggedPoint) return;
        
        const rect = this.svg.getBoundingClientRect();
        const point = this.getPointFromEvent(e, rect);
        
        this.points[this.draggedPoint].x = point.x - this.offset.x;
        this.points[this.draggedPoint].y = point.y - this.offset.y;
        
        this.updateDisplay();
    }
    
    handleMouseUp() {
        if (this.isDragging && this.draggedPoint) {
            this.elements[this.draggedPoint].classList.remove('dragging');
        }
        
        this.isDragging = false;
        this.draggedPoint = null;
        this.offset = { x: 0, y: 0 };
    }
    
    getPointFromEvent(e, rect) {
        return {
            x: e.clientX - rect.left,
            y: e.clientY - rect.top
        };
    }
    
    updateDisplay() {
        this.updateControlPoints();
        this.updateControlLines();
        this.updateBezierCurve();
    }
    
    updateControlPoints() {
        Object.keys(this.points).forEach(key => {
            if (this.elements[key]) {
                this.elements[key].setAttribute('cx', this.points[key].x);
                this.elements[key].setAttribute('cy', this.points[key].y);
            }
        });
    }
    
    updateControlLines() {
        this.elements.line1.setAttribute('x1', this.points.start.x);
        this.elements.line1.setAttribute('y1', this.points.start.y);
        this.elements.line1.setAttribute('x2', this.points.control1.x);
        this.elements.line1.setAttribute('y2', this.points.control1.y);
        
        this.elements.line2.setAttribute('x1', this.points.control2.x);
        this.elements.line2.setAttribute('y1', this.points.control2.y);
        this.elements.line2.setAttribute('x2', this.points.end.x);
        this.elements.line2.setAttribute('y2', this.points.end.y);
    }
    
    updateBezierCurve() {
        const d = `M ${this.points.start.x} ${this.points.start.y} C ${this.points.control1.x} ${this.points.control1.y}, ${this.points.control2.x} ${this.points.control2.y}, ${this.points.end.x} ${this.points.end.y}`;
        this.elements.curve.setAttribute('d', d);
    }
    
    reset() {
        this.points = {
            start: { x: 100, y: 200 },
            control1: { x: 200, y: 100 },
            control2: { x: 500, y: 100 },
            end: { x: 600, y: 200 }
        };
        
        this.updateDisplay();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new SVGBezierEditor('svg-canvas');
});