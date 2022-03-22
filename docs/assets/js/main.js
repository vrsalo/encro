(function() {
	"use strict";

	const select = (el, all = false) => {
		el = el.trim()
		if (all) {
			return [...document.querySelectorAll(el)]
		} else {
			return document.querySelector(el)
		}
	}

	/**
	 * Easy event listener function
	 */
	const on = (type, el, listener, all = false) => {
		let selectEl = select(el, all)
		if (selectEl) {
			if (all) {
				selectEl.forEach(e => e.addEventListener(type, listener))
			} else {
				selectEl.addEventListener(type, listener)
			}
		}
	}

	/**
	 * Easy on scroll event listener 
	 */
	const onscroll = (el, listener) => {
		el.addEventListener('scroll', listener)
	}

	/**
	 * Navbar links active state on scroll
	 */
	let navbarlinks = select('#navbar .scrollto', true)
	const navbarlinksActive = () => {
		let position = window.scrollY + 200
		navbarlinks.forEach(navbarlink => {
			if (!navbarlink.hash) return
			let section = select(navbarlink.hash)
			if (!section) return
			if (position >= section.offsetTop && position <= (section.offsetTop + section.offsetHeight)) {
				navbarlink.classList.add('active')
			} else {
				navbarlink.classList.remove('active')
			}
		})
	}
	window.addEventListener('load', navbarlinksActive)
	onscroll(document, navbarlinksActive)

	/**
	 * Scrolls to an element with header offset
	 */
	const scrollto = (el) => {
		let header = select('#header')
		let offset = header.offsetHeight

		if (!header.classList.contains('header-scrolled')) {
			offset -= 24
		}

		let elementPos = select(el).offsetTop
		window.scrollTo({
			top: elementPos - offset,
			behavior: 'smooth'
		})
	}

	/**
	 * Toggle .header-scrolled class to #header when page is scrolled
	 */
	let selectHeader = select('#header')
	if (selectHeader) {
		const headerScrolled = () => {
			if (window.scrollY > 100) {
				selectHeader.classList.add('header-scrolled')
			} else {
				selectHeader.classList.remove('header-scrolled')
			}
		}
		window.addEventListener('load', headerScrolled)
		onscroll(document, headerScrolled)
	}

	/**
	 * Back to top button
	 */
	let backtotop = select('.back-to-top')
	if (backtotop) {
		const toggleBacktotop = () => {
			if (window.scrollY > 100) {
				backtotop.classList.add('active')
			} else {
				backtotop.classList.remove('active')
			}
		}
		window.addEventListener('load', toggleBacktotop)
		onscroll(document, toggleBacktotop)
	}

	/**
	 * Mobile nav toggle
	 */
	on('click', '.mobile-nav-toggle', function(e) {
		select('#navbar').classList.toggle('navbar-mobile')
		this.classList.toggle('bx-menu')
		this.classList.toggle('bx-x')
	})

	/**
	 * Mobile nav dropdowns activate
	 */
	on('click', '.navbar .dropdown > a', function(e) {
		if (select('#navbar').classList.contains('navbar-mobile')) {
			e.preventDefault()
			this.nextElementSibling.classList.toggle('dropdown-active')
		}
	}, true)

	/**
	 * Scrool with ofset on links with a class name .scrollto
	 */
	on('click', '.scrollto', function(e) {
		if (select(this.hash)) {
			e.preventDefault()

			let navbar = select('#navbar')
			if (navbar.classList.contains('navbar-mobile')) {
				navbar.classList.remove('navbar-mobile')
				let navbarToggle = select('.mobile-nav-toggle')
				navbarToggle.classList.toggle('bx-menu')
				navbarToggle.classList.toggle('bx-x')
			}
			scrollto(this.hash)
		}
	}, true)

	/**
	 * Scroll with ofset on page load with hash links in the url
	 */
	window.addEventListener('load', () => {
		if (window.location.hash) {
			if (select(window.location.hash)) {
				setTimeout(function() {
					scrollto(window.location.hash)
				}, 500);
			}
		}
	});

	/**
	 * Portfolio details slider
	 */
	new Swiper('.portfolio-details-slider', {
		speed: 1000,
		loop: true,
		effect: 'fade',
		fadeEffect: {
			crossFade: true
		},
		autoplay: {
			delay: 5000,
			disableOnInteraction: false
		},
		pagination: {
			el: '.swiper-pagination',
			type: 'bullets',
			clickable: true
		}
	});

	/**
	 * Animation on scroll
	 */
	window.addEventListener('load', () => {
		AOS.init({
			duration: 1000,
			easing: "ease-in-out",
			once: true,
			mirror: false
		});
	});

	let forms = document.querySelectorAll('.php-email-form');

	forms.forEach(function(e) {
		e.addEventListener('submit', function(event) {
			event.preventDefault();

			let thisForm = this;

			let action = thisForm.getAttribute('action');
			let recaptcha = thisForm.getAttribute('data-recaptcha-site-key');

			if (!action) {
				displayError(thisForm, 'The form action property is not set!')
				return;
			}
			thisForm.querySelector('.loading').classList.add('d-block');
			thisForm.querySelector('.error-message').classList.remove('d-block');
			thisForm.querySelector('.sent-message').classList.remove('d-block');

			let formData = new FormData(thisForm);

			if (recaptcha) {
				if (typeof grecaptcha !== "undefined") {
					grecaptcha.ready(function() {
						try {
							grecaptcha.execute(recaptcha, { action: 'php_email_form_submit' })
								.then(token => {
									formData.set('recaptcha-response', token);
									php_email_form_submit(thisForm, action, formData);
								})
						} catch (error) {
							displayError(thisForm, error)
						}
					});
				} else {
					displayError(thisForm, 'The reCaptcha javascript API url is not loaded!')
				}
			} else {
				php_email_form_submit(thisForm, action, formData);
			}
		});
	});

	function php_email_form_submit(thisForm, action, formData) {
		var data = {
			sender: {
				name: formData.get("name"),
				email: formData.get("email")
			},
			to: [
				{
					email: "vrsalo@gmail.com",
					name: "Info"
				}
			],
			subject: "Upit web - " + formData.get("subject"),
			htmlContent: formData.get("message").replaceAll("\n", "<br>")
		};

		fetch("https://api.sendinblue.com/v3/smtp/email", {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				"accept": "application/json",
				"content-type": "application/json",
				"api-key": "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"
			}
		})
			.then(response => {
				if (response.ok) {
					return response.text()
				} else {
					throw new Error(`${response.status} ${response.statusText} ${response.url}`);
				}
			})
			.then(data => {
				thisForm.querySelector('.loading').classList.remove('d-block');
				if (data.trim().includes("messageId")) {
					thisForm.querySelector('.sent-message').classList.add('d-block');
					thisForm.reset();
				} else {
					throw new Error(data ? data : 'Form submission failed and no error message returned from: ' + action);
				}
			})
			.catch((error) => {
				displayError(thisForm, error);
			});
	}

	function displayError(thisForm, error) {
		thisForm.querySelector('.loading').classList.remove('d-block');
		thisForm.querySelector('.error-message').innerHTML = error;
		thisForm.querySelector('.error-message').classList.add('d-block');
	}

})()

// The locale our app first shows
const defaultLocale = "en";

// The active locale
let locale;

// Gets filled with active locale translations
let translations = {};

// When the page content is ready...
document.addEventListener("DOMContentLoaded", () => {
	// Translate the page to the default locale
	setLocale(defaultLocale);
});

// Load translations for the given locale and translate
// the page to this locale
async function setLocale(newLocale) {
	if (newLocale === locale) return;

	const newTranslations =
		await fetchTranslationsFor(newLocale);

	locale = newLocale;
	translations = newTranslations;

	translatePage();


	let searchParams = new URLSearchParams(window.location.search)
	var tempTemplate;

	// news populate
	var template = $(".entry:first");
	if (template.length) {
		debugger;
		$.each(translations.news, function(key, value) {
			if (searchParams.has('id')) {
				let id = searchParams.get('id')
				if (key != id) return
			}

			tempTemplate = template.clone()
			tempTemplate.prependTo(".entries")
			tempTemplate.show();
			tempTemplate.attr("id", key);
			tempTemplate.find("img").attr("src", value.img);
			tempTemplate.find("h2").html(value.title)
			tempTemplate.find("span").html(value.date)
			tempTemplate.find(".entry-content").html("<p><i>" + value.short + "</i></p>")
			if (searchParams.has('id')) {
				tempTemplate.find(".entry-content").append("<p>" + value.extra + "</p>")
				$(".section-title").hide();
			} else {
				tempTemplate.click(function() { window.location.href = 'news.html?id=' + key });
				tempTemplate.css('cursor', 'pointer');

			}
		});

	}

	// news short main page
	template = $(".newsShort:first");
	if (template.length) {
		debugger;
		var total = translations.news.length - 3;
		$.each(translations.news.slice(-3), function(key, value) {
			tempTemplate = template.clone()
			tempTemplate.prependTo(".newsShorts")
			tempTemplate.show();

			tempTemplate.find(".icon-box").click(function() { window.location.href = 'news.html?id=' + (total + key) });
			tempTemplate.find(".icon-box").css('cursor', 'pointer');
			tempTemplate.find(".title").html(value.title)
			tempTemplate.find(".date").html(value.date)
			tempTemplate.find(".description").html(value.short)
		});
	}

	// windfarm  op
	template = $(".windfarmop:first");
	if (template.length) {
		debugger;
		$.each(translations.projects.open, function(key, value) {
			if (searchParams.has('id')) {
				let id = searchParams.get('id')
				if (value.id != id) return
			}

			tempTemplate = template.clone()
			if (key) tempTemplate.append("<hr>")

			tempTemplate.prependTo(".windfarms:first")
			tempTemplate.show();
			tempTemplate.attr("id", value.id);
			tempTemplate.find("h3").html(value.name)
			var swiper = tempTemplate.find(".swiper-wrapper")

			for (let step = 1; step < 4; step++) {
				swiper.append('<div class="swiper-slide"><img alt="" src="assets/img/wf/' + value.id + '-' + step + '.webp"></div>')
			}


			tempTemplate.find("strong").each(function(index) {
				var tempKey = $(this).attr("data-i18n-key").replaceAll("wf-", "");
				var temVale = value[tempKey]
				if (temVale)
					$(this).parent().append(": " + value[tempKey]);
				else $(this).remove()
			});

			if (searchParams.has('id')) {
				tempTemplate.find("p").html(value.text)
				$(".section-title").hide();
			} else {
				tempTemplate.click(function() { window.location.href = '?id=' + value.id });
				tempTemplate.css('cursor', 'pointer');

			}
		});

	}

	// windfarm  dev
	template = $(".windfarmdev:first");
	if (template.length) {
		debugger;
		$.each(translations.projects.dev, function(key, value) {
			if (searchParams.has('id')) {
				let id = searchParams.get('id')
				if (value.id != id) return
			}

			tempTemplate = template.clone()
			tempTemplate.prependTo(".windfarms:first")
			tempTemplate.show();
			tempTemplate.attr("id", value.id);
			tempTemplate.find("h3").html(value.name)
			var swiper = tempTemplate.find(".swiper-wrapper")


			for (let step = 1; step < 4; step++) {
				swiper.append('<div class="swiper-slide"><img alt="" src="assets/img/wf/' + value.id + '-' + step + '.jpg"></div>')
			}


			tempTemplate.find("strong").each(function(index) {
				var tempKey = $(this).attr("data-i18n-key").replaceAll("wf-", "");
				var temVale = value[tempKey]
				if (temVale)
					$(this).parent().append(": " + value[tempKey]);
				else $(this).remove()
			});


			if (searchParams.has('id')) {
				tempTemplate.find("p").html(value.text)
				$(".section-title").hide();
			} else {
				tempTemplate.click(function() { window.location.href = '?id=' + value.id });
				tempTemplate.css('cursor', 'pointer');

			}
		});

	}

	// windfarm  dev
	template = $(".social");
	if (template.length) {
		debugger;
		$.each(template, function(key, valuet) {
			if ($(valuet).hasClass('op')) {
				$.each(translations.projects.open, function(key, value) {
					$(valuet).append('<a href="operational.html?id=' + value.id + '" class="btn btn-outline-secondary rounded-pill">' + value.id + '</a>')
				});
			} else {
				$.each(translations.projects.dev, function(key, value) {
					$(valuet).append('<a href="development.html?id=' + value.id + '" class="btn btn-outline-secondary rounded-pill">' + value.id + '</a>')
				});
			}
		});

	}

	/**
 * Portfolio details slider
 */
	new Swiper('.portfolio-details-slider', {
		speed: 1000,
		loop: true,
		effect: 'fade',
		fadeEffect: {
			crossFade: true
		},
		autoplay: {
			delay: 5000,
			disableOnInteraction: false
		},
		pagination: {
			el: '.swiper-pagination',
			type: 'bullets',
			clickable: true
		}
	});

}

// Retrieve translations JSON object for the given
// locale over the network
async function fetchTranslationsFor(newLocale) {
	const response = await fetch(`assets/lang/${newLocale}.json`);
	return await response.json();
}

// Replace the inner text of each element that has a
// data-i18n-key attribute with the translation corresponding
// to its data-i18n-key
function translatePage() {
	document
		.querySelectorAll("[data-i18n-key]")
		.forEach(translateElement);
}

// Replace the inner text of the given HTML element
// with the translation in the active locale,
// corresponding to the element's data-i18n-key
function translateElement(element) {
	const key = element.getAttribute("data-i18n-key");
	if (key.startsWith('place-'))
		element.placeholder = translations[key];
	else {
		$(element).html(translations[key])
	}
}
