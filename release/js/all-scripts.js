$(document).ready(function () {
$(document).ready(function() {
	$('.header__burger').on('click', function() {
		$('.header__mobile').addClass('active')
		$('.overhidden').addClass('active')
	})

	$('.header__close').on('click', function() {
		$('.header__mobile').removeClass('active')
		$('.overhidden').removeClass('active')
	})

	$('[data-showcase-top]').on('click', function() {
		if (!$(this).hasClass('active')) {
			var index = $(this).index()
			$(this).addClass('active').siblings().removeClass('active')
			$('[data-showcase-body]')
				.removeClass('active')
				.eq(index)
				.addClass('active')
		}
		return false
	})

	$('.showcase__select--head').on('click', function(e) {
		e.stopPropagation()
		$(this).parent().toggleClass('active')
	})

	$('.showcase__select--body span').on('click', function() {
		const text = $(this).text()
		const select = $(this).closest('.showcase__select')

		select.find('.showcase__select--head span').text(text)
		select.removeClass('active')
	})

	$(document).on('click', function() {
		$('.showcase__select').removeClass('active')
	})
	$(function() {
		let currentStep = 0

		const $steps = $('.steps__item')
		const $tops = $('.steps__top--item')
		const $topWrapper = $('.steps__top')

		function renderSteps() {
			$steps.hide().eq(currentStep).show()

			$tops.removeClass('active')
			$tops.removeClass('completed')

			$tops.each(function(index) {
				if (index < currentStep) {
					$(this).addClass('completed')
				}
			})
		}

		renderSteps()

		$('.step__next').on('click', function() {
			if (currentStep < $steps.length - 1) {
				currentStep++
				renderSteps()
			}
		})

		$('.step__prev').on('click', function() {
			if (currentStep > 0) {
				currentStep--
				renderSteps()
			}
		})

		$tops.on('click', function() {
			const index = $(this).index()
			if (index <= currentStep) {
				currentStep = index
				renderSteps()
			}
		})
	})

	$.fancybox.defaults.touch = false
	$.fancybox.defaults.closeExisting = true

	$('.header__theme').on('click', function() {
		const wrapper = $('.wrapper')
		const modal = $('.modal')

		const current = wrapper.attr('data-theme')
		const next = current === 'light' ? 'dark' : 'light'

		wrapper.attr('data-theme', next)

		modal.removeClass('light dark').addClass(next)

		localStorage.setItem('theme', next)
	})

	$(function() {
		const saved = localStorage.getItem('theme')

		if (saved) {
			$('.wrapper').attr('data-theme', saved)
			$('.modal').removeClass('light dark').addClass(saved)
		}
	})

	$('[data-top-item]').on('click', function() {
		if (!$(this).hasClass('active')) {
			var index = $(this).index()
			$(this).addClass('active').siblings().removeClass('active')
			$('[data-body-item]').removeClass('active').eq(index).addClass('active')
		}
		return false
	})

	$('.lk-faq__head').on('click', function(e) {
		$(this).toggleClass('active')
		$(this).next().toggleClass('active')
	})
})




});