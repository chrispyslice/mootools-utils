/**
 * AjaxAuth
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

var AjaxAuth = new Class({

	// Implement options to get setOptions
	Implements: Options,
	
	options: {
		// Default URL to get data from
		'url': '_dynamic/auth/',
		
		// Form
		'login_form': 'signin',
		
		// Register form
		'reg_form': 'register',
		
		// 
		'login_html': '#bar #right p',
		
		// Close button
		'close': 'close-login',
		
		// Login->Register
		'login_register': 'register-form',
		
		// Register->Login
		'register_login': 'login-form',
		
		// Logout Link
		'logout': 'logout',
		
		'login': 'loginlink'
	},
	
	/**
	 * Constructor
	 */
	initialize: function(options)
	{
		// Marge options
		this.setOptions(options);
		
		// Get the login form
		this.$_login_form = $(this.options.login_form);
		
		// Get the register form
		this.$_reg_form = $(this.options.reg_form);
		
		// Close button
		this.$_close = $(this.options.close);
		
		this.$_login_register = $(this.options.login_register);
		
		this.$_register_login = $(this.options.register_login);
		
		this.$_logout = $(this.options.logout);
		
		this.$_login = $(this.options.login);
		
		// Create a message div for login status updates
		// e.g., credential failure
		this.$_message = new Element('div', {
			'id': 'login_message'
		}).inject(this.$_login_form, 'before');
				
		console.log('AjaxAuth loaded');
	},
	
	setup: function()
	{
		// So we don't need to bind everything to the sun
		var self = this;
		
		// Add event handler for submitting the login form
		self.$_login_form.addEvent('submit', function(evt) {
			// Prevent the form actually submitting
			evt.stop();

			// Login		
			if(!$('login_username').value || !$('login_password').value) self.message('Please enter both a username and a password');
			else self.login($('login_username').value, $('login_password').value);
		});
		
		// Register form
		self.$_reg_form.addEvent('submit', function(evt) {
			evt.stop();
			
			if(!$('register_username').value || !$('register_password').value || !$('register_password_repeat').value || !$('register_first')) self.message('All fields are required ');
			else if($('register_password').value !== $('register_password_repeat').value) self.message('Both passwords need to be the same');
			else self.register($('register_username').value, $('register_password').value, $('register_first').value); 
		});
		
		// Login -> Register form fade
		self.$_login_register.addEvent('click', function() {			
			
			self.removeMessage();
			// Crete a new tween on the login form
			new Fx.Tween(self.$_login_form)
			
			// Fade out the login form
			.start('opacity', 0)
			
			// Set the display of the login form to none
			// Can use this keyword since the Tween was created on the login form
			.chain(function() {
				this.set('display', 'none');
				
				// 
				self.$_reg_form.set('styles', {
					'display': 'block',
					'opacity': 0
				}).fade('in');
			});
		});
		
		// Register -> Login form fade
		self.$_register_login.addEvent('click', function() {
			self.removeMessage();
			new Fx.Tween(self.$_reg_form)
			
			.start('opacity', 0)
			
			.chain(function() {
				this.set('display', 'none');
				
				
				
				self.$_login_form.set('styles', {
					'display': 'block',
					'opacity': 0
				}).fade('in');
			});
		});
		
		// Add event to close the form
		self.$_close.addEvent('click', function() {
			new Fx.Tween($('login_menu'))
			.start('opacity', 0)
			.chain(function() {
				$('login_menu').set('display', 'none');
			});

		});
		
		return this;
	},
	
	login: function(username, password)
	{
		// So we don't need to bind everything to the sun
		// Also generating a sha512 hash of the password passed to us
		var self = this, password_hashed = new jsSHA(password).getHash('SHA-512', 'HEX');	
		
		new Request.JSON({
			// Url to send request to
			'url': self.options.url + '?mode=login',
			
			// An error occured with the request
			'onFailure': function(xhr)
			{
				self.message('An unexpected error was encountered');
			},
			
			// If the request was successful. Note that this doesn't mean that the details were fine, just that the request
			// complete successfully.
			'onComplete': function(data) {
				// The login failed
				if(!data.result)
				{
					// Add a new element for the error message
					self.message('Username or password incorrect');
					
					// Prevent further execution outside of this block
					return;
				}
				
				// Fade out the menu
				$('login_menu').fade('out');
				
				// Change the link to a welcome message in order to signify the login success
				$('login_staging').set('html', 'Welcome, ' + data.result.firstname + ' <a href="#" class="staging_link" id="logout">Logout</a>');
				
				self.removeMessage();
				
				// Set event to logout
				self.setLogoutEvent();
			}
		}).post({
			'username': username,
			'password': password_hashed
		});
	},
	
	register: function(username, password, name)
	{
		var self = this, password_hashed = new jsSHA(password).getHash('SHA-512', 'HEX');
		
		// Bad username
		if(!username.match(/^[a-z0-9_-]{3,15}$/))
		{
			self.message('You have selected an invalid username. Usernames must be letters, numbers, - or _ and between 3 and 15 characters long.');
			return;
		}
		
		new Request.JSON({
			'url': self.options.url + '?mode=register',
			'onComplete': function(data) {
				
				// The username has already been taken, so display some alternatives 
				if(data.result == 'user_exists')
				{
					var msg = 'The username you chose already exists. There are some alternatives: ';
					data.suggestions.each(function(suggestion, index) {
						msg += '<strong>' + suggestion + '</strong> ';
					});
					self.message(msg);
					return;
				}
				
				new Fx.Tween(self.$_reg_form)
				.start('opacity', 0)
				.chain(function(){
					self.$_reg_form.set('styles', {
						'display': 'none',
						'opacity': 0
					});
					this.callChain();
				})
				.chain(function() {
					self.$_login_form.set('styles', {
						'display': 'block',
						'opacity': 0
					}).fade('in');
					this.callChain();
				})
				.chain(function() {
					self.message('You have sucessfully registered and can now login.');
				});
			}
		}).post({
			'username': username,
			'password': password_hashed,
			'firstname': name
		});
	},
	
	logout: function()
	{
		var self = this;
		
		new Request.JSON({
			'url': self.options.url + '?mode=logout',
			'onComplete': function(data) {
				if(data.status == 'success') $('login_staging').set('html', '<a href="#" id="loginlink" class="staging_link">Login and Register</a>');
				else alert('Could not logout.');
				
				self.setPanelEvent();
			}
		}).send();
		
		
	},
	
	setLogoutEvent: function()
	{
		var self = this;
		
		// Relook for the element
		$(this.options.logout).addEvent('click', function() {
		    self.logout();
		});
	},
	
	setPanelEvent: function()
	{
		var self = this;
		
		$(this.options.login).addEvent('click', function() {
			$('login_menu').set('styles', {'display': 'block', 'opacity': 0}).fade('in');
		});
	},
	
	/**
	 * Helper function to display an error message in red
	 */
	message: function(msg)
	{
		var self = this;
		
		self.$_message.set({
			'styles': {
				'display': 'block',
				'opacity': 0
			},
			'html': msg
		}).tween('opacity', 1);
	},
	
	removeMessage: function()
	{
		var self = this;
		new Fx.Tween(self.$_message).start('opacity', 0)
		.chain(function() {
			self.$_message.set('styles', {
				'display': 'none',
				'opacity': 0
			});
		});
	}
});
