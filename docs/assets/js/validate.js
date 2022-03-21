(function() {
	"use strict";

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

		debugger;
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
			htmlContent: formData.get("message").replaceAll("\n","<br>")
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

})();
