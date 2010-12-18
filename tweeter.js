/**
 * Tweeter
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
 
var Tweeter = new Class({
	
	// Implement the Options class so we can call setOptions
	Implements: Options,
	
	// Default options (i.e., if no options are passed or if some are missing)
	options: {
		// Default username to load tweets for
		'username': 'stephenfry',
		
		// Default section ID into which we should inject the tweet text
		'body': 'tweet',
		
		// Where should we post the tweet information into
		'info': 'posted'
	},
	
	base_url: "http://api.twitter.com/1/statuses/user_timeline.json?screen_name={username}&count=1&include_rts=1",
	
	/**
	 * Constructor
	 **/
	initialize: function(options)
	{
		// Merge the options passed
		this.setOptions(options);
		
		// Process the base_url into something usable using the username passed
		this.url = this.base_url.substitute({
			username: this.options.username
		});
		
		// Get where we want to write data to
		// Can use this.options.body since we called setOptions() above, so any new values will be in this.options by now
		this.$_body = $(this.options.body);
		this.$_info = $(this.options.info);
		
		console.log('Tweeter loaded, using url=' + this.url);
	},
	
	/**
	 * Start loading the tweeets
	 **/
	start: function()
	{
		// Set this to self so we don't need to bind() everything under the sun
		var self = this;
		
		// Helper function to replace links and such
		var replace = function(s)
		{
			// External URLs first
			var o = s.replace(/(https?\:\/\/[a-zA-Z0-9\-\.]+\.[a-zA-Z]{2,3}(\/\S*)?)/g, '<a href="$1" target="_blank">$1</a>');
			
			// Hashtags
			o = o.replace(/(\#[\w-]+)/g, '<a href="http://twitter.com/search/$1" target="_blank">$1</a>');
			
			// Replies
			o = o.replace(/ \@([\w-]+)/g, ' @<a href="http://twitter.com/$1" target="_blank">$1</a>');
			o = o.replace(/^\@([\w-]+)/g, '@<a href="http://twitter.com/$1" target="_blank">$1</a>');
			
			return o;
		}
		
		// Send an Ajax request for a JSON output from Twitter
		new Request.JSON({
			// Need to use a proxy since we can't get data from a different domain
			'url': '_dynamic/proxy/?url=' + self.url,	
			
			// Similar to Ajax callbacks in jQuery
			'onSuccess': function(data)
			{
				// Display an error if we can't find any data
				if(!data)
				{
					self.$_body.set('html', 'Error loading tweets');
					return;
				}
				
				// Check if we've got an error back, most likely from the rate limiter
				if(data.error)
				{
					self.$_body.set('html', 'There was an error while loading, most likely due to the Twitter rate limiter. Twitter limits the number of requests to 150 requests/hour, and this server has exceeded that limit.');
					return;
				}
				
				// Set the tweet body
				self.$_body.set('html', replace(data[0].text));
				
				// And associated information
				self.$_info.set('html', 'Posted at ' + data[0].created_at + ' by <a href="http://twitter.com/' + data[0].user.screen_name + '" target="_blank">' + data[0].user.name + '</a>');
			},
			
			'onFailure': function(xhr)
			{
				self.$_body.html('html', 'The was an error while communicating with Twitter');
			}
		})
		// Fire the request
		.send();
	},
});

