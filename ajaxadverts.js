/**
 * AjaxAdverts
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

// Implement a method to call an event once and then remove it after a callback has been fired
// I.E., only call a function when an event as been called
// This is required in order to ensure that the blackout only fades
// out AFTER the image has loaded (makes sense in AjaxAdvert.fire(), I promise)
Element.implement({
	eventOnce: function(event, callback)
	{
		// Add the event to this
		this.addEvent(event, function() {
			// Execute the callback if possible
			if(typeof callback == 'function') callback.call();
			else console.log('Fatal error in Element.eventOnce: callback not a function');
			
			// Now remove the event so it doesn't call at an exponential rate and bork the browser
			this.removeEvents(event);
		});
	},
});

var AjaxAdvert = new Class({

	// Implement the Options class so we can use setOptions
	Implements: Options,
	
	// Default options. We could pass these in an object to the constructor too
	// which then get merged into these using setOptions()
	options: {
		// Location of the PHP file where we'll send the request to
		'adserver': '_dynamic/adserver/',
		
		// The base element into which the blackout should be injected
		'element': 'advert',
		
		// Image ID to change
		'image': 'advert-img',
		
		// Link ID to change
		'link': 'advert-link',
		
		// How often should the advert be updated?
		'interval': 3000
	},
	
	/**
	 * Constructor
	 */
	initialize: function(options)
	{
		// Merge options passed
		this.setOptions(options);
		
		// Create the blackout div for the fade effect and inject it into the page
		this.$_blackout = new Element('div', {'id': 'blackout'}).inject($(this.options.element), 'top');
		
		// Get the image
		this.$_image = $(this.options.image);
		
		// Get the link
		this.$_link = $(this.options.link);
		
		// Last loaded advert, the initial ad is ID 1
		this.current = null;
				
		console.log('AjaxAdvert loaded');
	},
	
	/**
	 * Helper function to start loading the ads
	 * Do it this way so we have a static first image, which
	 * may be handy for an actual advertiser
	 */
	start: function()
	{
		// Set self to this do we don't need to bind everything under the sun
		var self = this;
		
		// Call fire() for the first time after
		// self.options.interval seconds
		setTimeout(function() {
			self.fire();
		}, self.options.interval);
	},
	
	/**
	 * Main body of the class. Sends a request, parses the output
	 * and changes the images 
	 */
	fire: function()
	{
		// Set self to this do we don't need to bind everything under the sun
		var self = this;
		
		// Send an Ajax request to get the ad
		new Request.JSON({
			// Set the url to load
			'url': self.options.adserver,
			
			// Turn of cacheing
			//'noCache': true,
			
			// On complete
			onSuccess: function(data)
			{
				// Get the image out of the array
				var ad = '_static/images/ads/' + data[0];
				
				// Change the current image
				self.current = data[0].substr(3, 1);
								
				// Set the display to block for the blackout
				self.$_blackout.set('styles', {'display': 'block', 'opacity': 0});
				
				// This block of code swaps the images while making sure that the new images
				// has been loaded before actually performing the way. This ensures that
				// the fade effect always occurns.
				
				// New tween on self.blackout
				new Fx.Tween(self.$_blackout)
				
				// Fade it in
				.start('opacity', 1)
				
				// Do things once the blackout has faded out
				.chain(function() {
					self.$_image.eventOnce('load', function() {
						self.$_blackout.tween('opacity', 0);
					});
					// Change the src and alt attributes of the image so the new ad loads
					self.$_image.set({
						'src': ad,
						'alt': 'Advert ' + self.current
					});
					
					// Change the href of the link
					self.$_link.set('href', '_dynamic/gateway/?id=' + self.current);
					
					// Ensure that the blackout only fades in once the image has fully loaded,
					// which is fine for the kinds of image size that we're using
					// For efficiency, we write out own eventOnce() method which handles removal
					// of the event automatically
					
					
					// Make sure the ad reloads every self.options.interval seconds
					setTimeout(function() {
						self.fire();
					}, self.options.interval);
				});
			}
		}).get({ // Fire the request
			'current': self.current
		});
	}
});
