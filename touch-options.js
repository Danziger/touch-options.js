/* TO-DO:

	- localStorage prefix and suffix.
	
	- bulkSave in just one localStorage property.
	
	- Load options (not just its values) from localStorage.

*/

(function(global) {
	"use strict";

	/***************************************************************************
	 *	touch-options.js:
	 *	A JS class to help you manage user settings with just on click/touch.
	 *
	 *	By Dani Gámez Franco, http://gmzcodes.com
	 *	Licensed under MIT.
	 *
	 *	Version: 1.0.0
	 *	Last Update: 2015-07-02
	 *
	 **************************************************************************/
	
	// CONSTRUCTOR & (PUBLIC) VARIABLES ////////////////////////////////////////
	
	var TouchOptions = function(options) {

		/* OPTIONS FORMAT:

		options = {
			saveInitialValue: false,
			
			invertChecked: false,
			invertVisible: false,
			
			classNames: {
				checked: "checked",
				visible: "visible"
			}
		}

		*/

		// Initialize options:

		options = options || {classNames: {}};

		// Merging options (no need for a merge function yet):
		
		this.saveInitialValue = options.saveInitialValue || false;
		this.invertChecked = options.invertChecked || false;
		this.invertVisible = options.invertVisible || false;
		this.classNames = {
			checked: options.classNames.checked || (this.invertChecked?"unchecked":"checked"),
			visible: options.classNames.visible || (this.invertVisible?"hidden":"visible")
		};

		// Initialize ops (user options):

		this.ops = {};
	};

	// AUX. METHODS (PRIVATE) //////////////////////////////////////////////////
	
	TouchOptions.prototype._isDOMElement = function(element) {
		// http://stackoverflow.com/questions/384286/javascript-isdom-how-do-you-check-if-a-javascript-object-is-a-dom-object

		try {
			//Using W3 DOM2 (works for FF, Opera and Chrom)
			return element instanceof HTMLElement;
		}
		catch(e){
			//Browsers not supporting W3 DOM2 don't have HTMLElement and
			//an exception is thrown and we end up here. Testing some
			//properties that all elements have. (works on IE7)
			return (typeof element==="object") &&
				(element.nodeType===1) && (typeof element.style === "object") &&
				(typeof element.ownerDocument ==="object");
		}
	};
	
	// PRIVATE METHODS /////////////////////////////////////////////////////////

	TouchOptions.prototype._updateSwapOption = function(element, val) {
		if(element !== null) element.innerHTML = val;
	};

	TouchOptions.prototype._updateBooleanOption = function(element, val, panel) {
		if(element !== null) element.classList[(this.invertChecked?!val:val) ? "add" : "remove"](this.classNames.checked);
		if(panel !== null) panel.classList[(this.invertVisible?!val:val) ? "add" : "remove"](this.classNames.visible);
	};

	// PUBLIC METHODS //////////////////////////////////////////////////////////
	
	// touchOptions.add(HTMLElement | String id, Array values[, int initVal]);
	// touchOptions.add(HTMLElement | String id[, boolean initVal = false, HTMLElement | String panel])
	TouchOptions.prototype.add = function(option, param1, param2) {

		if(typeof option === "string") {
			var id = option;
			var element = document.getElementById(option);
		}
		else if(this._isDOMElement(option)) {
			var id = option.id;
			var element = option;
		}
		else{
			console.error("TouchOptions: First argument must be a string or a DOM element.");
			return this; // Chainable
		}

		if(this.ops.hasOwnProperty(id)) console.warn("TouchOptions: Option " + id + " already exists. It will be overrided");

		if(arguments.length >= 2 && Object.prototype.toString.call(param1) === "[object Array]") {
		
			// Swap option:
			
			var val = parseInt(localStorage[id]); // Try to load from localStorage
			val = isNaN(val) ? parseInt(param2) : val; // Use param2 as initial value if property is not present or invalid in localStorage
			this.ops[id] = {
				element: element,
				val: isNaN(val) ? 0 : Math.max(val, 0), // Make sure param2 (initVal argument) is not invalid too. If it is, start at 0
				values: param1
			};
			
			this._updateSwapOption(element, param1[this.ops[id].val]);
		}
		else if(arguments.length >= 1) {
		
			// Toggle option:
			
			var val = localStorage[id]; // Try to load from localStorage
			val = (val=== '1' || val==='0') ? val==='1' : param1; // Use param1 as initial value if property is not present or invalid in localStorage
			var panel = this._isDOMElement(param2) ? param2 : document.getElementById(param2);

			this.ops[id] = {
				element: element,
				val:  val ? true : false, // Make sure param1 get parsed as a boolean
				panel: panel
			};
			
			this._updateBooleanOption(element, val, panel);
		}
		else {
			console.error("TouchOptions: Invalid arguments.");
			return this; // Chainable
		}
		
		if(this.saveInitialValue) this.save(id); // Save to localStorage
		
		return this; // Chainable
	};

	// touchOptions.reload()
	// touchOptions.reload(id)
	TouchOptions.prototype.reload = function(id) {

		var cw = console.warn;
		console.warn = function(){}; // Prevent warn from appearing

		var r = function(op) {
			if(op.hasOwnProperty("values")) // Swap option:
				this.add(op.element, op.values, op.val);
			else // Toggle option:
				this.add(op.element, op.val, op.panel);
		}.bind(this);

		if(arguments.length === 0) { // Reload all
			var ops = this.ops;
			for(id in ops) r(ops[id]);
		}
		else { // Reload one
			r(this.ops[id]);
		}

		console.warn = cw; // Restore original console.warn

		return this; // Chainable
	};

	// touchOptions.get(id)
	TouchOptions.prototype.get = function(id) { // TO-DO: Get text value when option type = swap 
		return this.ops[id].val; // NOT chainable
	};

	// touchOptions.set(id)
	// touchOptions.set(id, val)
	TouchOptions.prototype.set = function(id, val) {

		if(arguments.length === 1){
			this.touch(id); // touch() will validate this id
			return this; // In this case, set() does the same as touch() but set() is chainable and does NOT return the current value!
		}

		if(!this.ops.hasOwnProperty(id)) {
			console.error("TouchOptions: Unknown ID.");
			return this; // Chainable
		}

		var op = this.ops[id];
		
		if(op.hasOwnProperty("values")) { // Swap option:

			val = parseInt(val);
			
			if(isNaN(val) || val < 0 || val > op.values.length-1) {
				console.error("TouchOptions: Invalid value.");
				return this; // Chainable
			}

			this._updateSwapOption(op.element, op.values[op.val = val]); // Update op.val & UI 
		}
		else { // Toggle option:
		
			if(val !== true && val !==false) {
				console.error("TouchOptions: Invalid value.");
				return this; // Chainable
			}
			
			// val = val ? true : false;  // Is the previous validation too strict...?
			
			this._updateBooleanOption(op.element, op.val = val, op.panel); // Update op.val & UI 
		}

		this.save(id);

		return this; // Chainable
	};

	// touchOptions.touch(id)
	TouchOptions.prototype.touch = function(id){

		if(!this.ops.hasOwnProperty(id)) {
			console.error("TouchOptions: Unknown ID.");
			return undefined;
		}

		var op = this.ops[id];

		if(op.hasOwnProperty("values")) // Swap option:
			this._updateSwapOption(op.element, op.values[op.val = (op.val+1) % op.values.length]); // Update UI
		else // Toggle option:
			this._updateBooleanOption(op.element, op.val = !op.val, op.panel); // Update UI

		this.save(id);

		return op.val; // NOT chainable
	};

	// touchOptions.save()
	// touchOptions.save(id)
	TouchOptions.prototype.save = function(id) {

		var ops = this.ops;

		if(arguments.length === 0) { // Save all
			for(var id in ops) localStorage[id] = ops[id].val;
		}
		else { // Save one
			if(!ops.hasOwnProperty(id)) console.error("TouchOptions: Unknown ID.");
			else {
				if(ops[id].hasOwnProperty("values")) localStorage[id] = ops[id].val;
				else localStorage[id] = ops[id].val ? "1" : "0";
			}
		}

		return this; // Chainable
	};

	// touchOptions.remove()
	// touchOptions.remove(id)
	TouchOptions.prototype.remove = function(id) {

		if(arguments.length === 0)
			this.opts = {}; // Same as clear(), but will NOT clear localStorage!
		else {
			delete this.opts[id]; // It does NOT matter if id does not exist (:
			localStorage.removeItem(id);
		}

		return this; // Chainable
	};

	// touchOptions.clear()
	TouchOptions.prototype.clear = function() {
		for(id in this.opts) localStorage.removeItem(id);
		this.opts = {};		

		return this; // Chainable
	};

	// *************************************************************************

	global.TouchOptions = TouchOptions;

}(window));