class BezierEditor {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        
        this.points = [
            { x: 100, y: 200, type: 'start' },
            { x: 200, y: 100, type: 'control1' },
            { x: 500, y: 100, type: 'control2' },
            { x: 600, y: 200, type: 'end' }
        ];
        
        this.isDragging = false;
        this.draggedPoint = null;
        this.pointRadius = 8;
        
        this.init();
    }
    
    init() {
        this.setupEventListeners();
        this.draw();
    }
    
    setupEventListeners() {
        this.canvas.addEventListener('mousedown', this.handleMouseDown.bind(this));
        this.canvas.addEventListener('mousemove', this.handleMouseMove.bind(this));
        this.canvas.addEventListener('mouseup', this.handleMouseUp.bind(this));
        this.canvas.addEventListener('mouseleave', this.handleMouseUp.bind(this));
        
        document.getElementById('resetBtn').addEventListener('click', this.reset.bind(this));
    }
    
    handleMouseDown(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        for (let point of this.points) {
            const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
            if (distance <= this.pointRadius) {
                this.isDragging = true;
                this.draggedPoint = point;
                this.canvas.style.cursor = 'grabbing';
                break;
            }
        }
    }
    
    handleMouseMove(e) {
        const rect = this.canvas.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        
        if (this.isDragging && this.draggedPoint) {
            this.draggedPoint.x = x;
            this.draggedPoint.y = y;
            this.draw();
        } else {
            let hoveringOverPoint = false;
            for (let point of this.points) {
                const distance = Math.sqrt(Math.pow(x - point.x, 2) + Math.pow(y - point.y, 2));
                if (distance <= this.pointRadius) {
                    hoveringOverPoint = true;
                    break;
                }
            }
            this.canvas.style.cursor = hoveringOverPoint ? 'grab' : 'default';
        }
    }
    
    handleMouseUp() {
        this.isDragging = false;
        this.draggedPoint = null;
        this.canvas.style.cursor = 'default';
    }
    
    draw() {
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        this.drawControlLines();
        this.drawBezierCurve();
        this.drawControlPoints();
    }
    
    drawControlLines() {
        this.ctx.strokeStyle = '#ddd';
        this.ctx.lineWidth = 1;
        this.ctx.setLineDash([5, 5]);
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        this.ctx.lineTo(this.points[1].x, this.points[1].y);
        this.ctx.stroke();
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[2].x, this.points[2].y);
        this.ctx.lineTo(this.points[3].x, this.points[3].y);
        this.ctx.stroke();
        
        this.ctx.setLineDash([]);
    }
    
    drawBezierCurve() {
        this.ctx.strokeStyle = '#007bff';
        this.ctx.lineWidth = 3;
        
        this.ctx.beginPath();
        this.ctx.moveTo(this.points[0].x, this.points[0].y);
        this.ctx.bezierCurveTo(
            this.points[1].x, this.points[1].y,
            this.points[2].x, this.points[2].y,
            this.points[3].x, this.points[3].y
        );
        this.ctx.stroke();
    }
    
    drawControlPoints() {
        for (let i = 0; i < this.points.length; i++) {
            const point = this.points[i];
            
            this.ctx.fillStyle = i === 0 || i === 3 ? '#28a745' : '#007bff';
            this.ctx.strokeStyle = '#fff';
            this.ctx.lineWidth = 2;
            
            this.ctx.beginPath();
            this.ctx.arc(point.x, point.y, this.pointRadius, 0, Math.PI * 2);
            this.ctx.fill();
            this.ctx.stroke();
        }
    }
    
    reset() {
        this.points = [
            { x: 100, y: 200, type: 'start' },
            { x: 200, y: 100, type: 'control1' },
            { x: 500, y: 100, type: 'control2' },
            { x: 600, y: 200, type: 'end' }
        ];
        this.draw();
    }
}

document.addEventListener('DOMContentLoaded', () => {
    new BezierEditor('canvas');
});