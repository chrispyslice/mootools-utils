/**
 * ButtonEffect
 * 
 * @license		Creative Commons Attribution-NonCommercial 3.0 Unported [http://creativecommons.org/licenses/by-nc/3.0/]
 * @author		Chris Granville
 * @link		http://chrispyslice.wordpress.com/
 * @email		granville <dot> chris <at> gmail <dot> com
 * 
 * @file		
 * @version		1.0
 * @date		12/18/2010
 * 
 * Copyright (c) 2010
 */

var ButtonEffect = new Class({
	Implements: Options,
	
	options: {
		'allow_toggle': true
	},
	/**
	 * Constructor
	 */
	initialize: function(options)
	{
		this.setOptions(options);
		
		this.trigger = this.options.trigger;
		this.allow_toggle = this.options.allow_toggle;
		
		this.toggle = false;
		
		console.log('ButtonEffect bound to element ' + this.trigger.get('id'));
	},
	
	/**
	 * The function to fire when the trigger is clicked
	 * Basically binds some callback function to an event
	 * handler for this.trigger
	 */
	fire: function(f)
	{
		// Set self to this do we don't need to bind everything under the sun
		var self = this;
		
		// Add an event to the trigger
		this.trigger.addEvent('click', function()
		{
			// Call the object if it's a function
			if(typeof f == 'function') f.call(self);
			
			// Invert the toggle
			if(self.options.allow_toggle) self.toggle = !self.toggle;
			
			console.log('ButtonEffect fired from ' + self.trigger.get('id'));
		});
	},
	
	/**
	 * Helper function to toggle the button from outside the class
	 */
	toggle: function() {
		this.toggle = !this.toggle;
	}
});