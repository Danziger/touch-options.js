(function(global) {
	"use strict";

	/***************************************************************************
	 *	touch-options-local-storage.js:
	 *	A JS class to help you manage user settings with just on click/touch.
	 *  This versions uses localStorage to persist data.
	 *
	 *	By Dani Gámez Franco, http://gmzcodes.com
	 *	Licensed under MIT.
	 *
	 *	Version: 2.0.4
	 *	Last Update: 2015-07-07
	 *
	 **************************************************************************/
	
	// CONSTRUCTOR & (PUBLIC) VARIABLES ////////////////////////////////////////
	
	var TouchOptions = function(options) {

		/* OPTIONS FORMAT (and default values):

		options = {
			// storage: "local" (default) | "sync"
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
		
		// this.storage = options.storage === "sync" ? "sync" : "local";
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

	// PRIVATE AUX. METHODS ////////////////////////////////////////////////////
	
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
	
	// PRIVATE DOM/UI-RELATED METHODS //////////////////////////////////////////

	TouchOptions.prototype._updateSwapOption = function(element, val) {
		if(element !== null) element.innerHTML = val;
	};

	TouchOptions.prototype._updateBooleanOption = function(element, val, panel) {
		if(element !== null) element.classList[(this.invertChecked?!val:val) ? "add" : "remove"](this.classNames.checked);
		if(panel !== null) panel.classList[(this.invertVisible?!val:val) ? "add" : "remove"](this.classNames.visible);
	};
	
	// PRIVATE SANITIZATION METHODS //////////////////////////////////////////// 
	
	TouchOptions.prototype._sanitizeBoolean = function(val, defaultVal) {
		return (val=== 'true' || val==='false') ? val==='true' : ( defaultVal === true ? true : false );
	};

	TouchOptions.prototype._sanitizeInt = function(val, defaultVal, max) {
		return Math.min(max, Math.max(0, isNaN(val) ? (isNaN(defaultVal) ? 0 : defaultVal) : val));
	};
	
	// PRIVATE STORAGE-TYPE-DEPENDENT METHODS //////////////////////////////////
	
	TouchOptions.prototype._loadBoolean = function(key, defaultVal) {
		return this._sanitizeBoolean(localStorage[key], defaultVal); // Load from localStorage and sanitize
		// Just some extra lines so that in bot versions (local-storage and chrome-storage)
		// the methods start in the same line numbers.
		// This way you can compare them easily.
	};

	TouchOptions.prototype._loadInt = function(key, defaultVal, max) {
		return this._sanitizeInt(parseInt(localStorage[key]), parseInt(defaultVal), max);
		
		
		
	};	
	
	// PUBLIC STORAGE-TYPE-DEPENDENT METHODS ///////////////////////////////////
	
	// touchOptions.add(HTMLElement | string option, array of string values[, int initVal]);
	// touchOptions.add(HTMLElement | string option[, boolean initVal = false, HTMLElement | string panel])
	TouchOptions.prototype.add = function(option, param1, param2) {
	
		if(typeof option === "string") {
			var key = option;
			var element = document.getElementById(option);
		}
		else if(this._isDOMElement(option)) {
			var key = option.id;
			var element = option;
		}
		else{
			console.error("TouchOptions: First argument must be a string or a DOM element.");
			return this; // Chainable
		}

		if(this.ops.hasOwnProperty(key)) console.warn("TouchOptions: Option " + key + " already exists. It will be overrided");

		if(arguments.length >= 2 && Object.prototype.toString.call(param1) === "[object Array]") {
			
			// Swap option:
			
			var val = this._loadInt(key, param2, param1.length - 1);
			
			this.ops[key] = {
				element: element,
				val: val,
				values: param1
			};
			
			this._updateSwapOption(element, param1[val]);
		}
		else if(arguments.length >= 1) {
		
			// Toggle option:

			var panel = this._isDOMElement(param2) ? param2 : document.getElementById(param2);
			var val = this._loadBoolean(key, param1);
			
			this.ops[key] = {
				element: element,
				val: val,
				panel: panel
			};
		
			this._updateBooleanOption(element, val, panel);
			
		}
		else {
			console.error("TouchOptions: Invalid arguments.");
			return this; // Chainable
		}
		
		if(this.saveInitialValue) this.save(key); // Save to storage
		
		return this; // Chainable
	};
	
	// touchOptions.save([string | array of string keys])
	// touchOptions.save()
	// touchOptions.save("op1")
	// touchOptions.save(["op1","op2"])
	TouchOptions.prototype.save = function(keys) {

		var ops = this.ops;

		if(arguments.length === 0) keys = Object.keys(ops); // Save all:
		
		if(Object.prototype.toString.call(keys) === "[object Array]") { // Save multiple:
			for(key in keys) {
				if(!ops.hasOwnProperty(key)) console.error("TouchOptions: Unknown key '" + key + "'.");
				else {
					try { localStorage.setItem(key, ops[key].val); }
					catch(e) { console.error("TouchOptions: Something went wrong while saving options. Probably, the localStorage quota has been exceeded."); }
				}
			}
		}
		else { // Save one:
			if(!ops.hasOwnProperty(keys)) console.error("TouchOptions: Unknown key '" + keys + "'.");
			else {
				try {localStorage.setItem(keys, ops[keys].val); }
				catch(e) { console.error("TouchOptions: Something went wrong while saving options. Probably, the localStorage quota has been exceeded."); }
			}
		}

		return this; // Chainable
	};
	
	// touchOptions.getBytesInUse()
	TouchOptions.prototype.getBytesInUse = function() {
		var ops = this.ops, string = "";
		for(key in ops) string += key + ops[key].val;
		
		
		
		
		
		
		return string.length; // NOT chainable. Returns an estimated value.
	}
	
	// touchOptions.remove([string | array of string keys])
	// touchOptions.remove()
	// touchOptions.remove("op1")
	// touchOptions.remove(["op1","op2"])
	// NOTE: Will NOT affect DOM in any way.
	TouchOptions.prototype.remove = function(keys) {

		if(arguments.length === 0) { // Remove all:
			for(key in Object.keys(this.ops)) localStorage.removeItem(key);
			this.ops = {};
		}
		else if(Object.prototype.toString.call(keys) === "[object Array]") { // Remove multiple:
			for(key in keys) {
				delete this.ops[key]; // It does NOT matter if id does not exist (:
				localStorage.removeItem(key);
			}
		}
		else { // Remove one:
			delete this.ops[keys]; // It does NOT matter if id does not exist (:
			localStorage.removeItem(keys);
		}

		
		return this; // Chainable
	};
	
	// touchOptions.clear()
	// NOTE: Will NOT affect DOM in any way.
	TouchOptions.prototype.clear = function() {
		this.ops = {};		
		localStorage.clear();
		
		
		return this; // Chainable
	}
	
	// PUBLIC COMMON METHODS ///////////////////////////////////////////////////

	// touchOptions.reload([string keys])
	// touchOptions.reload()
	// touchOptions.reload("op1")
	TouchOptions.prototype.reload = function(keys) {

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
			for(key in ops) r(ops[key]);
		}
		else { // Reload one
			r(this.ops[keys]);
		}

		console.warn = cw; // Restore original console.warn

		return this; // Chainable
	};

	// touchOptions.set(string | array of string keys[, boolean | int param1, boolean param2])
	// touchOptions.set("op1")
	// touchOptions.set("op1", true)
	// touchOptions.set("op1", 42)
	// touchOptions.set(["op1", "op2"], true)
	// touchOptions.set(["op1", "op2"], 42)
	// touchOptions.set("op1", 42, true)
	// touchOptions.set(["op1", "op2"], 42, true)
	TouchOptions.prototype.set = function(keys, param1, param2) {

		if(arguments.length === 0) return this.reset(); // Chainable

		if(arguments.length === 1){
			this.touch(keys); // touch() will validate this key
			return this; // In this case, set() does the same as touch() but set() is chainable and does NOT return the current value!
		}
		
		if(arguments.length === 2){ // param1 should be boolean or int

			if(param1 !== true && param1 !== false && (isNaN(param1 = parseInt(param1)) || param1 < 0) ) {
				console.error("TouchOptions: Invalid value '" + param1 + "'.");
				return this;
			}
			
			param2 = param1;
			
			if(Object.prototype.toString.call(keys) !== "[object Array]") keys = [keys];
		}

		if(arguments.length === 3){

			if(param2 !== true && param2 !== false || (isNaN(param1 = parseInt(param1)) || param1 < 0 ) ) { // param1 = defaultInt, param2 = defaultBoolean
				console.error("TouchOptions: Invalid value '" + param1 + "'.");
				return this;
			}
			
			if(Object.prototype.toString.call(keys) !== "[object Array]") keys = [keys];
		}
		
		var validKeys = [];
		
		for(key in keys) {
			
			if(this.ops.hasOwnProperty(key)) {

				var op = this.ops[key];
				
				if(op.hasOwnProperty("values") && typeof param1 === "number") { // Swap option:
					
					if(param1 > op.values.length-1) { // Range validation
						console.error("TouchOptions: Invalid value '" + param1 + "'.");
					}
					else {
						validKeys.push(key);
						this._updateSwapOption(op.element, op.values[op.val = param1]); // Update op.val & DOM 
					}
				}
				else if(typeof param2 === "boolean") { // Toggle option:
					// param2 value already validated
					validKeys.push(key);
					this._updateBooleanOption(op.element, op.val = val, op.panel); // Update op.val & DOM 
				}
				// else is not possible, it has been validated before.
			}
			else {
				console.error("TouchOptions: Unknown key '" + keys + "'.");
			}
		}

		if(validKeys.length > 0) this.save(validKeys);

		return this; // Chainable
	};

	// touchOptions.reset([int defaultInt = 0, boolean defaultBoolean = false])
	// touchOptions.reset(2)
	// touchOptions.reset(2, true)
	TouchOptions.prototype.reset = function(defaultInt, defaultBoolean){

		defaultInt = parseInt(defaultInt);
		defaultInt = isNaN(defaultInt) ? 0 : defaultInt;
		
		defaultBoolean = defaultBoolean === true ? true : false;

		var ops = this.ops;

		for(key in ops) {
			var op = ops[key];
			
			if(op.hasOwnProperty("values")) // Swap option:
				this._updateSwapOption(op.element, op.values[op.val = Math.min(defaultInt, op.values.length - 1)]); // Update DOM
			else // Toggle option:
				this._updateBooleanOption(op.element, op.val = defaultBoolean, op.panel); // Update DOM
		}
		
		this.save(); // Save all
		
		return this; // Chainable
	}
	
	// touchOptions.touch(string key)
	// touchOptions.touch("op1")
	TouchOptions.prototype.touch = function(key){

		if(!this.ops.hasOwnProperty(key)) {
			console.error("TouchOptions: Unknown key '" + key + "'.");
			return undefined;
		}

		var op = this.ops[key];

		if(op.hasOwnProperty("values")) // Swap option:
			this._updateSwapOption(op.element, op.values[op.val = (op.val+1) % op.values.length]); // Update DOM
		else // Toggle option:
			this._updateBooleanOption(op.element, op.val = !op.val, op.panel); // Update DOM

		this.save(key);

		return op.val; // NOT chainable
	};

	// touchOptions.get(string key[, boolean verbose = false])
	// touchOptions.get("op1")
	// touchOptions.get("op1", true)
	TouchOptions.prototype.get = function(key, verbose) {
		var op = this.ops[key];
		return verbose && op.hasOwnProperty("values") ? op.values(op.val) : op.val; // NOT chainable
	};
	
	// touchOptions.getKeys()
	TouchOptions.prototype.getKeys = function() {
		return Object.keys(this.ops); // NOT chainable.
	}
	
	// touchOptions.getValues()
	TouchOptions.prototype.getValues = function() {
		var ops = this.ops, values = {};
		for(key in ops) values[key] = ops[key].val;
		return values; // NOT chainable.
	}
	
	// touchOptions.getElements()
	TouchOptions.prototype.getElements = function() {
		var ops = this.ops, elements = {};
		for(key in ops) elements[key] = ops[key].element;
		return elements; // NOT chainable.
	}
	
	// *************************************************************************

	global.TouchOptions = TouchOptions;

}(window));