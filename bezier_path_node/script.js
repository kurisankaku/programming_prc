// ノード接続管理システム
class NodeConnectionSystem {
    constructor() {
        this.nodes = new Map();
        this.connections = [];
        this.draggedNode = null;
        this.dragOffset = { x: 0, y: 0 };
        this.connectingFrom = null;
        this.tempPath = null;
        
        this.init();
    }
    
    init() {
        // すべてのノードを初期化
        document.querySelectorAll('.node').forEach(node => {
            this.initNode(node);
        });
        
        // イベントリスナーの設定
        document.addEventListener('mousemove', this.handleMouseMove.bind(this));
        document.addEventListener('mouseup', this.handleMouseUp.bind(this));
        
        // 初期接続の作成（デモ用）
        this.createInitialConnections();
    }
    
    initNode(nodeElement) {
        const nodeId = nodeElement.getAttribute('data-node-id');
        
        // ノード情報を保存
        this.nodes.set(nodeId, {
            element: nodeElement,
            outputs: [],
            inputs: []
        });
        
        // ドラッグ機能の追加
        nodeElement.addEventListener('mousedown', this.handleNodeMouseDown.bind(this));
        
        // 接続ポイントの初期化
        nodeElement.querySelectorAll('.connection-point').forEach(point => {
            point.addEventListener('click', this.handleConnectionPointClick.bind(this));
            point.addEventListener('mouseenter', this.handleConnectionPointHover.bind(this));
        });
    }
    
    handleNodeMouseDown(e) {
        // 接続ポイントのクリックは除外
        if (e.target.classList.contains('connection-point')) {
            return;
        }
        
        const node = e.currentTarget;
        this.draggedNode = node;
        node.classList.add('dragging');
        
        const rect = node.getBoundingClientRect();
        const canvasRect = document.getElementById('canvas').getBoundingClientRect();
        
        this.dragOffset.x = e.clientX - rect.left;
        this.dragOffset.y = e.clientY - rect.top;
        
        e.preventDefault();
    }
    
    handleMouseMove(e) {
        // ノードのドラッグ処理
        if (this.draggedNode) {
            const canvasRect = document.getElementById('canvas').getBoundingClientRect();
            const x = e.clientX - canvasRect.left - this.dragOffset.x;
            const y = e.clientY - canvasRect.top - this.dragOffset.y;
            
            this.draggedNode.style.left = x + 'px';
            this.draggedNode.style.top = y + 'px';
            
            // 接続線の更新
            this.updateConnectionsForNode(this.draggedNode);
        }
        
        // 一時的な接続線の更新
        if (this.connectingFrom && this.tempPath) {
            const canvasRect = document.getElementById('canvas').getBoundingClientRect();
            const startPoint = this.getConnectionPointPosition(this.connectingFrom);
            const endPoint = {
                x: e.clientX - canvasRect.left,
                y: e.clientY - canvasRect.top
            };
            
            const path = this.calculateBezierPath(startPoint, endPoint);
            this.tempPath.setAttribute('d', path);
        }
    }
    
    handleMouseUp(e) {
        if (this.draggedNode) {
            this.draggedNode.classList.remove('dragging');
            this.draggedNode = null;
        }
    }
    
    handleConnectionPointClick(e) {
        e.stopPropagation();
        const point = e.currentTarget;
        
        if (!this.connectingFrom) {
            // 接続開始
            if (point.classList.contains('output')) {
                this.startConnection(point);
            }
        } else {
            // 接続完了
            if (point.classList.contains('input') && point !== this.connectingFrom) {
                this.completeConnection(point);
            } else {
                this.cancelConnection();
            }
        }
    }
    
    handleConnectionPointHover(e) {
        const point = e.currentTarget;
        if (this.connectingFrom && point.classList.contains('input')) {
            point.style.transform = 'scale(1.2)';
        }
    }
    
    startConnection(fromPoint) {
        this.connectingFrom = fromPoint;
        fromPoint.classList.add('connecting');
        
        // 一時的な接続線を作成
        const svg = document.getElementById('connectionsLayer');
        this.tempPath = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        this.tempPath.classList.add('temp-connection');
        svg.appendChild(this.tempPath);
    }
    
    completeConnection(toPoint) {
        if (!this.connectingFrom) return;
        
        // 接続情報を保存
        const connection = {
            from: this.connectingFrom,
            to: toPoint,
            path: null
        };
        
        // 実際の接続線を作成
        this.createConnectionPath(connection);
        this.connections.push(connection);
        
        // 接続ポイントの状態を更新
        this.connectingFrom.classList.add('connected');
        toPoint.classList.add('connected');
        
        // 一時的な要素をクリーンアップ
        this.cancelConnection();
    }
    
    cancelConnection() {
        if (this.connectingFrom) {
            this.connectingFrom.classList.remove('connecting');
            this.connectingFrom = null;
        }
        
        if (this.tempPath) {
            this.tempPath.remove();
            this.tempPath = null;
        }
    }
    
    createConnectionPath(connection) {
        const svg = document.getElementById('connectionsLayer');
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        path.classList.add('connection-path');
        
        const startPoint = this.getConnectionPointPosition(connection.from);
        const endPoint = this.getConnectionPointPosition(connection.to);
        const pathData = this.calculateBezierPath(startPoint, endPoint);
        
        path.setAttribute('d', pathData);
        svg.appendChild(path);
        
        connection.path = path;
    }
    
    calculateBezierPath(start, end) {
        // ベジェ曲線の制御点を計算
        const dx = end.x - start.x;
        const dy = end.y - start.y;
        
        // 垂直距離が小さい場合は直線
        if (Math.abs(dy) < 10) {
            return `M ${start.x},${start.y} L ${end.x},${end.y}`;
        }
        
        // 垂直距離に応じてS字カーブの強度を調整
        // 垂直距離が大きいほど、水平方向の制御点オフセットを大きくする
        const verticalFactor = Math.min(Math.abs(dy) / 100, 2); // 最大2倍まで
        const baseOffset = 100; // 基本オフセット
        const controlOffset = baseOffset * verticalFactor;
        
        // S字カーブを作るために制御点を配置
        // 始点側の制御点は右側に、終点側の制御点は左側に配置
        const path = `M ${start.x},${start.y} C ${start.x + controlOffset},${start.y} ${end.x - controlOffset},${end.y} ${end.x},${end.y}`;
        
        return path;
    }
    
    getConnectionPointPosition(point) {
        const rect = point.getBoundingClientRect();
        const canvasRect = document.getElementById('canvas').getBoundingClientRect();
        
        return {
            x: rect.left - canvasRect.left + rect.width / 2,
            y: rect.top - canvasRect.top + rect.height / 2
        };
    }
    
    updateConnectionsForNode(node) {
        const nodeId = node.getAttribute('data-node-id');
        
        // このノードに関連するすべての接続を更新
        this.connections.forEach(connection => {
            const fromNode = connection.from.closest('.node');
            const toNode = connection.to.closest('.node');
            
            if (fromNode === node || toNode === node) {
                const startPoint = this.getConnectionPointPosition(connection.from);
                const endPoint = this.getConnectionPointPosition(connection.to);
                const pathData = this.calculateBezierPath(startPoint, endPoint);
                
                connection.path.setAttribute('d', pathData);
            }
        });
    }
    
    createInitialConnections() {
        // デモ用の初期接続を作成
        setTimeout(() => {
            // クラス1 -> LLM 2
            const output1 = document.querySelector('#node1 [data-output="1"]');
            const input2 = document.querySelector('#node2 [data-input="1"]');
            if (output1 && input2) {
                this.connectingFrom = output1;
                this.completeConnection(input2);
            }
            
            // クラス3 -> LLM 3
            const output3 = document.querySelector('#node1 [data-output="3"]');
            const input3 = document.querySelector('#node3 [data-input="1"]');
            if (output3 && input3) {
                this.connectingFrom = output3;
                this.completeConnection(input3);
            }
            
            // LLM 2 -> 終了
            const llm2 = document.querySelector('#node2');
            const end1 = document.querySelector('#node4 [data-input="1"]');
            if (llm2 && end1) {
                // LLM 2に出力ポイントを追加
                const outputPoint = document.createElement('button');
                outputPoint.className = 'connection-point output';
                outputPoint.style.position = 'absolute';
                outputPoint.style.right = '-12px';
                outputPoint.style.top = '50%';
                outputPoint.style.transform = 'translateY(-50%)';
                llm2.appendChild(outputPoint);
                
                this.connectingFrom = outputPoint;
                this.completeConnection(end1);
            }
        }, 100);
    }
}

// システムの初期化
document.addEventListener('DOMContentLoaded', () => {
    new NodeConnectionSystem();
});