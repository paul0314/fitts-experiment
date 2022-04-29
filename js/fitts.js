class Node {
    constructor(id, status) {
        this.id = id;
        this.status = status;
    }
    
    toggleStatus() {
        this.status = !this.status;
    }
}

class Model {
    constructor() {
        this.initialize();
    }
    
    initialize() {
        this.leftNode = new Node(1, true);
        this.rightNode = new Node(2, false);
        this.times = [];
        this.lastTimeClicked = new Date();
        this.fdistance = 450;
        this.fwidth = 100;
        this.fvalues = 10;
    }
    
    toggleStatus() {
        this.leftNode.toggleStatus();
        this.rightNode.toggleStatus();
        this.commitToggleStatus();
    }
    
    commitToggleStatus() {
        this.times.push(new Date() - this.lastTimeClicked);
        this.lastTimeClicked = new Date();
        this.onToggleStatus();
    }
    
    bindToggleStatus(callback) {
        this.onToggleStatus = callback;
    }
    
    setWidth(width) {
        this.fwidth = width;
        this.commitSetWidth(this.fwidth, this.fdistance);
    }
    
    commitSetWidth(width, distance) {
        this.onWidthChanged(width, distance);
    }
    
    bindWidthChanged(callback) {
        this.onWidthChanged = callback;
    }

    setDistance(distance) {
        this.fdistance = distance;
        this.commitSetDistance(this.fwidth, this.fdistance);
    }
    
    commitSetDistance(width, distance) {
        this.onDistanceChanged(width, distance);
    }
    
    bindDistanceChanged(callback) {
        this.onDistanceChanged = callback;
    }
    
    setValues(values) {
        this.fvalues = values;
    }
    
    getNode(id) {
        if (id === 1) {
            return this.leftNode;
        }
        else if (id === 2) {
            return this.rightNode;
        }
        console.error("getNode for id=" + id + " is out of range");
    }
}

class Controller {
    constructor(model) {
        this.model = model;
        this.view = new View();
        
        this.setup();
    }
    
    setup = () => {
        this.initModelBinds();
        this.initViewBinds();
    }
    
    initModelBinds() {
        this.model.bindToggleStatus(this.onToggleStatus);
        this.model.bindWidthChanged(this.onWidthChanged);
        this.model.bindDistanceChanged(this.onDistanceChanged);
    }
    
    onToggleStatus = () => {
        if (this.model.times.length < this.model.fvalues) {
            this.view.displayStatus(this.model.leftNode.status);
        }
        else {
            this.view.displayResults(this.model.fdistance, this.model.fwidth, this.model.times);
        }
    }
    
    onWidthChanged = (width, distance) => {
        this.view.updateNodeCss(width, distance)
    }

    onDistanceChanged = (width, distance) => {
        this.view.updateNodeCss(width, distance)
    }
    
    handleStartFitts = () => {
        this.startFitts();
    }
    
    startFitts() {
        this.model.lastTimeClicked = new Date();
        this.view.showFitts();
    }
    
    handleClick = (id) => {
        if (this.model.getNode(id).status) {
            this.model.toggleStatus();
        }
    }
    
    handleDistanceChange = (distance) => {
        this.model.setDistance(distance);
    }
    
    handleValuesChange = (values) => {
        this.model.setValues(values);
    }
    
    handleWidthChange = (width) => {
        this.model.setWidth(width);
    }
    
    initViewBinds() {
        this.view.bindBoxClick(this.handleClick);
        this.view.bindValuesChange(this.handleValuesChange);
        this.view.bindWidthChange(this.handleWidthChange);
        this.view.bindDistanceChange(this.handleDistanceChange);
        this.view.bindStartFitts(this.handleStartFitts);
    }
}

class View {
    constructor() {
        this.startBtn = this.getElement("startButton");
        this.leftNode = this.getElement("leftNode");
        this.rightNode = this.getElement("rightNode");
        this.dialog = this.getElement("dialog");
        this.fdistance = this.getElement("fdistance");
        this.fwidth = this.getElement("fwidth");
        this.fvalues = this.getElement("fvalues");
        this.fitts = this.getElement("fitts-experiment");
        this.results = this.getElement("results");
        this.showDialog();
        
        this.fdistance.value = "450";
        this.fwidth.value = "100";
        this.fvalues.value = "10";
    }
    
    bindBoxClick(handler) {
        this.leftNode.addEventListener("click", event => {
            event.preventDefault();
            handler(1);
        });
        this.rightNode.addEventListener("click", event => {
            event.preventDefault();
            handler(2);
        });
    }
    
    bindWidthChange(handler) {
        this.fwidth.addEventListener("change", (event) => {
            handler(parseInt(event.target.valueAsNumber));
        });
    }

    bindValuesChange(handler) {
        this.fvalues.addEventListener("change", (event) => {
            handler(parseInt(event.target.valueAsNumber));
        });
    }

    bindDistanceChange(handler) {
        this.fdistance.addEventListener("change", (event) => {
            handler(parseInt(event.target.valueAsNumber));
        });
    }
    
    bindStartFitts(handler) {
        this.startBtn.addEventListener("click", event => {
            event.preventDefault();
            handler();
        });
    }

    getElement(selector) {
        return document.getElementById(selector);
    }
    
    displayStatus(left) {
        if (left) {
            this.leftNode.className = "active";
            this.rightNode.className = "inactive";
            return;
        }
        this.leftNode.className = "inactive";
        this.rightNode.className = "active";
    }

    updateNodeCss(width, distance) {
        document.documentElement.style.setProperty(`--node-width`, `${width}px`);
        let fittsWidth = 2 * width + distance;
        document.documentElement.style.setProperty(`--fitts-width`, `${fittsWidth}px`);
    }
    
    reset() {
        console.log("reset");
        location.reload(true);
    }
    
    showDialog() {
        this.dialog.className = "show";
        this.fitts.className = "hide";
        this.results.className = "hide";
    }
    
    showFitts() {
        this.dialog.className = "hide";
        this.fitts.className = "show";
        this.results.className = "hide";
    }

    displayResults(distance, width, times) {
        let parView = this;
        this.dialog.className = "hide";
        this.fitts.className = "hide";
        this.results.className = "show";
        this.results.innerHTML = `<h2>Entfernung: ${distance}</h2><br>
            <h2>Breite: ${width}</h2><br>
            <h2>Zeiten in ms: ${times.toString().replaceAll(",", ", ")}</h2><br>
            <button type="button" id="return-button">Zurück</button>`;
        const returnButton = this.getElement("return-button");
        returnButton.addEventListener("click", () => {
            this.reset();
        });
    }
}

// Create Model, View and Controller after loading HTML
document.addEventListener("DOMContentLoaded", function() {
    let model = new Model();
    let controller = new Controller(model);

    document.documentElement.style.setProperty(`--fitts-height`, `${window.innerHeight - 45}px`);
})
