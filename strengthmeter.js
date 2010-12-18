/**
 * StrengthMeter
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

var StrengthMeter = new Class({
	Implements: Options,
	
	options: {
		// Default input element to bind to
		'input': 'register_password'
	},
	
	/**
	 * Constructor
	 */
	initialize: function(options)
	{
		// Set the options
		this.setOptions(options);
		
		// Get the input that we're checking
		this.$_input = $(this.options.input);
		
		// Add events to the input
		this.$_input.addEvent('keyup', function(evt) {
			// Update the bar
			this.update();
		}.bind(this));	// no point in creating a variable to use it once
		
		// Create a new element to hold the strength meter
		this.$_sm = new Element('div', {'id': 'strength-meter'}).inject(this.$_input, 'after');
		
		// And the score bar
		this.$_score = new Element('div', {'id': 'strength-meter-score'});
		
		// Put $_score inside $_sm
		this.$_sm.adopt(this.$_score);
		
		console.log('StrengthMeter loaded');
	},
	
	/**
	 * Update the score bar. Fires on every key press
	 */
	update: function()
	{
		// As little binding as possible
		var self = this;
		
		// Get the contents of $_input
		var contents = self.$_input.value;
		
		var r = Math.round(self.calculate(contents) * 2);
				
		//								max. width								not too long
		self.$_score.tween('width', ((self.$_input.getSize().x - 2) / 100) * (r > 100 ? 100 : r));
	},
	
	calculate: function(contents)
	{
		var score = contents.length;
		
		// If there isn't ANY input, the score is 0. Fixes a bug with selecting all and deleting
		if(score == 0) return 0;
		
		// Check length for a score
		// First, lLength is less than 4
		if(contents.length > 0 && contents.length <= 4) score += contents.length;
		
		// Between 5 and 7
		else if (contents.length >= 5 && contents.length <= 7) score += 6;
		
		// 8 and 15
		else if (contents.length >= 8 && contents.length <= 15) score += 12;

		// Greater than 16
		else score += 18;
		
		// >= one lowercase character
		if (contents.match(/[a-z]/)) score += 1;

		// >= one uppercase character
		if (contents.match(/[A-Z]/)) score += 5;
		
		// >= one number
		if (contents.match(/\d/)) score += 5;
		
		// >= three numbers
		if (contents.match(/.*\d.*\d.*\d/)) score += 5;
		
		// >= one Special characters
		if (contents.match(/[!,@,#,$,%,^,&,*,?,_,~]/)) score += 5;
		
		// >= two special characters
		if (contents.match(/.*[!,@,#,$,%,^,&,*,?,_,~].*[!,@,#,$,%,^,&,*,?,_,~]/)) score += 5;
		
		// upper and lowercase characters
		if (contents.match(/(?=.*[a-z])(?=.*[A-Z])/)) score += 2;
		
		// letters and numbers
		if (contents.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])/)) score += 2;
		
		// letters, numbers and special characters
		if (contents.match(/(?=.*\d)(?=.*[a-z])(?=.*[A-Z])(?=.*[!,@,#,$,%,^,&,*,?,_,~])/)) score += 2;

		return score;
	}
});
