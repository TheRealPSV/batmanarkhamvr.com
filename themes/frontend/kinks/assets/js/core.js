
var introAnimation,
	sectionAnimation,
	preloaderAnimation,
	menuOpen = false,
	legalOpen = false,
	langOpen = false,
	currentSection = "";
	
var deviceSettings = {
	isWebGL: false,
    isAndroid: null,
    isEarlyIE: null,
    isIE: null,
	isIEMobile: null,
    isiPod: null,
    isiPhone: null,
    isiPad: null,
    isiOS: null,
    isMobile: null,
    isTablet: null,
    isWinSafari: null,
    isMacSafari: null
	};

function setupDeviceSettings() {
    var ua = navigator.userAgent.toLowerCase();
    deviceSettings.isAndroid = ua.indexOf("android") > -1;
    //deviceSettings.isEarlyIE = (jQuery.browser.msie == true && Number(jQuery.browser.version) <= 8) ? true : false;
    //deviceSettings.isIE = jQuery.browser.msie == true;
    deviceSettings.isiPod = navigator.userAgent.match(/iPod/i) != null;
    deviceSettings.isiPhone = navigator.userAgent.match(/iPhone/i) != null;
    deviceSettings.isiPad = navigator.userAgent.match(/iPad/i) != null;
    deviceSettings.isiOS = (navigator.userAgent.match(/(iPad|iPhone|iPod)/i) ? true : false);
    deviceSettings.isIEMobile = navigator.userAgent.match(/iemobile/i) != null;
    //determine if this is a mobile browser:
    var p = navigator.platform.toLowerCase();
    if (deviceSettings.isIEMobile || deviceSettings.isAndroid || deviceSettings.isiPad || p === 'ipad' || p === 'iphone' || p === 'ipod' || p === 'android' || p === 'palm' || p === 'windows phone' || p === 'blackberry' || p === 'linux armv7l') {
		deviceSettings.isMobile = true;
		$('body').addClass('isMobile');
    } else {
		$('body').addClass('isDesktop');
	}
	
	if ( Detector.webgl ) {
		deviceSettings.isWebGL = true;
	}
	if (deviceSettings.isAndroid || deviceSettings.isIEMobile) deviceSettings.isWebGL = false;
}
		
function initBatmanVr(){
	setupDeviceSettings();
	
	initPreloader();
	
	if (deviceSettings.isMobile) {
		initMobile();
	} else {
		initHovers();
	}
	
	initButtons();
	
	// CHECK FOR WEBGL OR NOT;s
	if (deviceSettings.isWebGL) {
		initWebGL();
	} else {
		playIntro();
	}
	
	$(window).on("resize", siteResize);
	$(window).triggerHandler("resize");
}

// LOADER CHECK
var total3dModels = 2;
var loaded3dModels = 0
function checkPreload3d() {
	loaded3dModels++
	if (loaded3dModels == total3dModels) {
		playIntro();
	}
}

// SPECIAL MOBILE STUFF
function initMobile() {
	if (deviceSettings.isAndroid) {
		$( "#email" ).focus(function() {
			TweenMax.set( "#nav", { autoAlpha: 0 } );
		});
		$( "#email" ).blur(function() {
			TweenMax.set( "#nav", { autoAlpha: 1 } );
		});
	}
}

// BUTTONS
function initButtons() {
	$('#hamburger').on('click', function(e) {
		toggleMenu();
		e.preventDefault();
	});
	
	$('#legal .close').on('click', function(e) {
		toggleLegal();
		e.preventDefault();
	});
	
	$('#lang .close').on('click', function(e) {
		toggleLang();
		e.preventDefault();
	});
}

// HOVERS
function initHovers() {
}

function toggleLegal() {
		
	if (menuOpen) {
		toggleMenu();
	}
	if (!legalOpen) {
		legalOpen = true;
		TweenMax.to( "#legal", 1, { y: -380, ease: Expo.easeInOut } );
		TweenMax.fromTo( "#legal .close", 0.5, { rotation: -90, autoAlpha: 0 }, { rotation: 0, autoAlpha: 1, ease: Expo.easeOut, delay: 0.5 } );
	} else {
		legalOpen = false;
		TweenMax.to( "#legal", 1, { y: 0, ease: Expo.easeInOut } );
		TweenMax.to( "#legal .close", 1, { rotation: -90, autoAlpha: 0, ease: Expo.easeInOut } );
	}
}

function toggleLang() {
		
	if (menuOpen) {
		toggleMenu();
	}
	if (!langOpen) {
		langOpen = true;
		TweenMax.to( "#lang", 1, { y: -250, ease: Expo.easeInOut } );
		TweenMax.fromTo( "#lang .close", 0.5, { rotation: -90, autoAlpha: 0 }, { rotation: 0, autoAlpha: 1, ease: Expo.easeOut, delay: 0.5 } );
	} else {
		langOpen = false;
		TweenMax.to( "#lang", 1, { y: 0, ease: Expo.easeInOut } );
		TweenMax.to( "#lang .close", 1, { rotation: -90, autoAlpha: 0, ease: Expo.easeInOut } );
	}
}


// SITE INTRO
function playIntro() {
	TweenMax.set( ".section", { autoAlpha: 0 } );
	TweenMax.set( "#nav", { autoAlpha: 1 } );
		
	introAnimation =  new TimelineMax({ paused: true, force3D: true });
	introAnimation.fromTo( "#preloader", 0.5, { autoAlpha: 1 }, { autoAlpha: 0}, 1 );
	introAnimation.fromTo( "#background", 2, { autoAlpha: 0 }, { autoAlpha: 1 }, 1.5 );
	introAnimation.fromTo( "#nav .navLine.left", 2, { scaleX: 0.25, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, transformOrigin: 'top left', ease: Expo.easeInOut }, 1.5 );
	introAnimation.fromTo( "#nav .navLine.right", 2, { scaleX: 0.25, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, transformOrigin: 'top right', ease: Expo.easeInOut, onComplete: function () {
		introComplete();
	}}, 1.5 );
	introAnimation.fromTo( "#navLogo img", 1, { y: 0, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: Expo.easeOut }, 3 );
	introAnimation.fromTo( ".navLeft", 1, { x: 50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeOut }, 3.25 );
	introAnimation.fromTo( ".navRight", 1, { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeOut }, 3.25 );
	introAnimation.fromTo( "#mobileLogo img", 1, { x: 50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeOut }, 3 );
	introAnimation.fromTo( "#hamburger", 1, { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeOut }, 3 );
	introAnimation.fromTo( "#legalTrigger", 1, { autoAlpha: 0 }, { autoAlpha: 1, ease: Expo.easeOut }, 3 );
	introAnimation.fromTo( "#langTrigger", 1, { autoAlpha: 0 }, { autoAlpha: 1, ease: Expo.easeOut }, 3 );
	introAnimation.fromTo( "#rating img", 1, { autoAlpha: 0 }, { autoAlpha: 1, ease: Expo.easeOut }, 3 );
	
	introAnimation.timeScale(1);
	introAnimation.play(0);
	
	preloaderIntro.stop();
}

function introComplete() {
	changeSection("home")
}

var preloaderIntro;
function initPreloader() {
	createTypewriterEffect($("#preloaderInner"));
	preloaderIntro = new TimelineLite({ paused: true });
	preloaderIntro.staggerFromTo( "#preloaderInner .letter", 1, { autoAlpha: 0 }, { autoAlpha: 1, yoyo: true, repeat: -1, repeatDelay: 0.5 }, 0.1, 0);
	preloaderIntro.play(0);
}
function createTypewriterEffect(target){
	var $target = target;
	var $text = $target.html();
	$target.html(
		$text.replace('<br>','~')
		.replace(/./g, '<span class="letter">$&</span>')
		.replace('~', '<br>' )
	);
}

// MENU
function toggleMenu() {
	TweenMax.killAll();
		
	if (legalOpen) toggleLegal();
	if (langOpen) toggleLang();
	
	if (!menuOpen) {
		menuOpen = true;
		
		TweenMax.to( "#bar1", 0.25, { scaleX: 0, ease: Expo.easeOut } );
		TweenMax.to( "#bar2", 0.75, { rotation: 45, ease: Expo.easeOut } );
		TweenMax.to( "#bar3", 0.75, { rotation: -45, ease: Expo.easeOut } );
		TweenMax.to( "#bar4", 0.25, { scaleX: 0, ease: Expo.easeOut } );

		var menuAnimationIn =  new TimelineMax({ paused: true, force3D: true, onComplete: function () { }});
		menuAnimationIn.fromTo( "#menu", 0.5, { autoAlpha: 0 }, { autoAlpha: 1, display: 'block' }, 0);
		menuAnimationIn.to( "#nav", 1, { y: 120, autoAlpha: 0, ease: Expo.easeOut }, 0);
		menuAnimationIn.to( ".navLeft", 1.25, { x: 50, autoAlpha: 0, ease: Expo.easeOut }, 0);
		menuAnimationIn.to( ".navRight", 1.25, { x: -50, autoAlpha: 0, ease: Expo.easeOut }, 0);
		menuAnimationIn.staggerFromTo( "#menuMiddle a", 1, { y: -100, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: Expo.easeOut }, -.1, 0 );
		menuAnimationIn.staggerFromTo( "#menuMiddle a .left", 1, { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, transformOrigin: 'top left', ease: Expo.easeOut }, -.1, 0.25 );
		menuAnimationIn.staggerFromTo( "#menuMiddle a .right", 1, { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, transformOrigin: 'top right', ease: Expo.easeOut }, -.1, 0.25 );
		
		menuAnimationIn.fromTo( "#social .navLine.left", 1, { scaleX: 0.25, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, transformOrigin: 'top left', ease: Expo.easeInOut }, 0 );
		menuAnimationIn.fromTo( "#social .navLine.right", 1, { scaleX: 0.25, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, transformOrigin: 'top right', ease: Expo.easeInOut }, 0 );
		menuAnimationIn.fromTo( ".iconLeft", 1, { x: 50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeOut }, 0.75 );
		menuAnimationIn.fromTo( ".iconRight", 1, { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeOut }, 0.75 );
		
		menuAnimationIn.fromTo( "#pulse .circle", 3, { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, transformOrigin: 'center center', ease: Expo.easeOut }, 0.6);
		menuAnimationIn.fromTo( "#pulse .circle", 2, { autoAlpha: 0 }, { autoAlpha: 1 }, 0.6);
		menuAnimationIn.to( "#pulse .circle", 1, { autoAlpha: 0 }, 2.6);
		
		menuAnimationIn.staggerFromTo( "#pulse .ring", 3, { scaleX: 0, scaleY: 0 }, { scaleX: 1, scaleY: 1, transformOrigin: 'center center', ease: Expo.easeOut }, -.15, 0.6);
		menuAnimationIn.staggerFromTo( "#pulse .ring", 2, { autoAlpha: 0 }, { autoAlpha: 0.25 }, -.15, 0.6);
		menuAnimationIn.staggerTo( "#pulse .ring", 1, { autoAlpha: 0 }, -.15, 2.6);
		
		menuAnimationIn.timeScale(1);
		menuAnimationIn.play(0);
		
		if(currentSection == "trailer") {
			destroyVideo();
			//pauseVideo();
		}
		
	} else {
		menuOpen = false;
		TweenMax.to( "#bar1", 0.25, { scaleX: 1, autoAlpha: 1, ease: Expo.easeOut } );
		TweenMax.to( "#bar2", 0.25, { rotation: 0, ease: Expo.easeOut } );
		TweenMax.to( "#bar3", 0.25, { rotation: 0, ease: Expo.easeOut } );
		TweenMax.to( "#bar4", 0.25, { scaleX: 1, autoAlpha: 1, ease: Expo.easeOut } );
		
		TweenMax.to( "#menu", 0.5, { autoAlpha: 0 } );
		
		TweenMax.to( ".iconLeft", 1, { x: 50, autoAlpha: 0, ease: Expo.easeOut }, 0.75 );
		TweenMax.to( ".iconRight", 1, { x: -50, autoAlpha: 0, ease: Expo.easeOut }, 0.75 );
		
		TweenMax.to( "#nav", 1, { y: 0, autoAlpha: 1, ease: Expo.easeOut, delay: 0.3 } );
		TweenMax.staggerTo( "#menuMiddle a", 0.5, { y: -50, autoAlpha: 0, ease: Expo.easeOut }, .1 );
		TweenMax.fromTo( ".navLeft", 1.25, { x: 50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeOut, delay: 0.1 });
		TweenMax.fromTo( ".navRight", 1.25, { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, ease: Expo.easeOut, delay: 0.1 });
		
		if(currentSection == "trailer") {
			loadVideo();
		}
	}
}

	
// CHANGE SECTIONS
function changeSection(target) {
	if (menuOpen) {
		toggleMenu();
	} else {
		TweenMax.killAll();
	}
	
	if (currentSection != target) {
		
		TweenMax.set( $('.section'), { autoAlpha: 0 });
		destroyVideo();
		switch (target) {
			case "home":
				break;
			case "trailer":
				break;
			case "signup":
			
				TweenMax.fromTo( "#signup .form .formLine", 1, { scaleX: 0, autoAlpha: 0 }, { scaleX: 1, autoAlpha: 1, transformOrigin: 'center center', display: 'block', ease: Expo.easeOut, delay: 2 } );
				
				break;
			case "preorder":
				break;
			default:
			 break;
		}
		currentSection = target;
		
		//
		sectionAnimation =  new TimelineMax({ paused: true, force3D: true, onComplete: function () {
			if(currentSection == "trailer") {
				loadVideo();
			}
		}});
		sectionAnimation.set( "#" + currentSection, { autoAlpha: 1, display: 'block' }, 1);
		sectionAnimation.staggerFromTo( "#" + currentSection + " .animate", 1, { y: 200, autoAlpha: 0 }, { y: 0, autoAlpha: 1, ease: Expo.easeOut }, .1, 1 );
		sectionAnimation.timeScale(1);
		sectionAnimation.play(0);
		
		if (deviceSettings.isWebGL) {
			// DO SOMETHING IN THE WEBGL
			changeModel(currentSection)
		} else {
			changeBackground();
		}
	};
}

var inTransition = false;
var backgroundSrc = asset_url+"/images/bg_home.jpg";
function changeBackground() {
	var targetSrc = asset_url+'/images/bg_' + currentSection + '.jpg'
	
	if (targetSrc != backgroundSrc) {
		inTransition = true;
		// FADE THE CURRENT BACKGROUND
		TweenMax.to( "#background", 1, { autoAlpha: 0, onComplete: function () {
			inTransition = false;
		}});
		
		// LOAD THE NEW IMAGE
		var newImg = new Image;
		newImg.onload = function() {
			showBackground();
		}
		newImg.src = targetSrc; //'assets/images/bg_' + currentSection + '.jpg';
		backgroundSrc = targetSrc; //newImg.src;
	}
	
}

function showBackground() {
	if (inTransition) {
		setTimeout(function(){ 
			showBackground();
		}, 100);
	} else {
		var imageUrl = "url('"+ backgroundSrc + "')";
		document.getElementById("background").style.backgroundImage = imageUrl;
		TweenMax.to( "#background", 2, { autoAlpha: 1 });
	}
}

// TRAILER 
function loadVideo() {
	destroyVideo();
	$('#player').append('<iframe id="youtube-player" width="100%" height="100%" src="//www.youtube.com/embed/Ya8v30zzpQo?list=PLVlnPBFnxKJht8SHjHpnz13iPNxTKJBzH&showinfo=0&autoplay=1&enablejsapi=1?ecver=1" frameborder="0" allowfullscreen></iframe>');	
}

function destroyVideo() {
		$('#player').html("");
}

function pauseVideo() {
	/*
	// TO DO
	var youtube_player = document.getElementById("youtube-player");
	if (youtube_player) {
	}
	*/
}

// SITE RESIZE
function siteResize() {
	
	var WIDTH = window.innerWidth;
	var HEIGHT = window.innerHeight;
	
	// VIDEO PLAYER RESIZE
	var playerRatio = 0.7;
	if (deviceSettings.isAndroid) playerRatio = 0.6;
	var playerHeight = HEIGHT * playerRatio;
	var playerWidth = playerHeight * (16 / 9);
	var minWidth = WIDTH * playerRatio;

	if (playerWidth > minWidth) {
		playerHeight = playerHeight * (minWidth / playerWidth);
		playerWidth = minWidth;
	}
	/*
	// OLD RESIZE
	var playerTop = (HEIGHT * 0.35) - (playerHeight * 0.35);
	var playerLeft = (WIDTH * 0.5) - (playerWidth * 0.5);
	if (deviceSettings.isMobile) playerTop = (HEIGHT * 0.3) - (playerHeight * 0.3);
	$('#player').width(playerWidth).height(playerHeight).css({'margin-top':playerTop+'px', 'margin-left':playerLeft+'px'});
	*/
	// NEW RESIZE
	var marginTop = -(playerHeight * 0.35);
	var marginLeft = -(playerWidth * 0.5);
	$('#player').width(playerWidth).height(playerHeight).css({
		'position':'absolute', 
		'top':'35%', 
		'left':'50%', 
		'margin-top':marginTop+'px', 
		'margin-left':marginLeft+'px'
	});
}


// SWEEPSTAKES FORM
$('form').submit(function(event) {
	var form = $(this);

	$.ajaxSetup({
		headers: {
			'X-CSRF-TOKEN': $('meta[name="csrf-token"]').attr('content')
		}
	});

	var formData = {
		'email'             	: $('input[name=email]').val()
	};
	// PROCESS FORM
	$.ajax({
		type        : 'POST',
		url         : '/api/signups',
		data      	: formData,
		success: function(json){
			if (json.data) {
				$('#form-error').html(json.data.email);
			} else {
				$('#form-error').html(json.message);
			}
		}
	});

	return false;
});


$(document).ready(initBatmanVr);
