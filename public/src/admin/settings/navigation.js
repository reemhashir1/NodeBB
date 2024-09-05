'use strict';

define('admin/settings/navigation', [
	'translator',
	'iconSelect',
	'benchpress',
	'alerts',
	'jquery-ui/widgets/draggable',
	'jquery-ui/widgets/droppable',
	'jquery-ui/widgets/sortable',
], function (translator, iconSelect, Benchpress, alerts) {
	const navigation = {};
	let available;

	navigation.init = function () {
		available = ajaxify.data.available;
		$('#available').find('li .drag-item').draggable({
			connectToSortable: '#active-navigation',
			helper: 'clone',
			distance: 10,
			stop: drop,
		});

		$('#active-navigation').sortable().droppable({
			accept: $('#available li .drag-item'),
		});

		$('#enabled').on('click', '.iconPicker', onIconPickerClick);
		$('#enabled').on('click', '[name="dropdown"]', onDropdownClick);
		$('#active-navigation').on('click', 'li', onSelect);
		$('#enabled').on('click', '.delete', remove);
		$('#enabled').on('click', '.toggle', toggle);
		$('#save').on('click', save);
	};

	function onIconPickerClick() {
		const iconEl = $(this).find('i');
        console.log("Icon element selected:", iconEl);
		iconSelect.init(iconEl, onIconSelect);
	}

	function onIconSelect(el) {
		const newIconClass = el.attr('value');
        console.log("New icon class selected:", newIconClass);
		const index = el.parents('[data-index]').attr('data-index');
		$('#active-navigation [data-index="' + index + '"] i.nav-icon').attr('class', 'fa fa-fw ' + newIconClass);
		el.siblings('[name="iconClass"]').val(newIconClass);
		el.siblings('.change-icon-link').toggleClass('hidden', !!newIconClass);
	}

	function onDropdownClick() {
		const el = $(this);
        console.log("Dropdown element clicked:", el);
		const index = el.parents('[data-index]').attr('data-index');
        console.log("Element index:", index);  // Log the index of the element
		$('#active-navigation [data-index="' + index + '"] i.dropdown-icon').toggleClass('hidden', !el.is(':checked'));
	}

	function onSelect() {
		const clickedIndex = $(this).attr('data-index');
		selectIndex(clickedIndex);
		return false;
	}

	function selectIndex(index) {
		$('#active-navigation li').removeClass('active');
		$('#active-navigation [data-index="' + index + '"]').addClass('active');

		const detailsForm = $('#enabled').children('[data-index="' + index + '"]');
		$('#enabled li').addClass('hidden');

		if (detailsForm.length) {
			detailsForm.removeClass('hidden');
		}
	}

	function drop(ev, ui) {
		const id = ui.helper.attr('data-id');
		const el = $('#active-navigation [data-id="' + id + '"]');
		const data = getData(id);

		data.index = getNextIndex();
		data.title = translator.escape(data.title);
		data.text = translator.escape(data.text);
		data.groups = ajaxify.data.groups;

		Promise.all([
			renderTemplate('admin/settings/navigation', 'navigation', { navigation: [data] }, el),
			renderTemplate('admin/settings/navigation', 'enabled', { enabled: [data] }, $('#enabled')),
		]).then(() => selectIndex(data.index));
	}

	function getData(id) {
		return id === 'custom' ? {
			iconClass: 'fa-navicon',
			groups: available[0].groups,
			enabled: true,
		} : available[id];
	}

	function getNextIndex() {
		return (parseInt($('#enabled').children().last().attr('data-index'), 10) || 0) + 1;
	}

	function renderTemplate(template, section, data, container) {
		return new Promise((resolve) => {
			Benchpress.parse(template, section, data, function (li) {
				translator.translate(li, function (li) {
					li = $(translator.unescape(li));
					container.append(li);
					resolve();
				});
			});
		});
	}

	function save() {
		const nav = [];
		const indices = [];

		$('#active-navigation li').each(function () {
			indices.push($(this).attr('data-index'));
		});

		indices.forEach(function (index) {
			const el = $('#enabled').children('[data-index="' + index + '"]');
			const form = el.find('form').serializeArray();
			const data = {};

			form.forEach(function (input) {
				if (data[input.name]) {
					if (!Array.isArray(data[input.name])) {
						data[input.name] = [data[input.name]];
					}
					data[input.name].push(input.value);
				} else {
					data[input.name] = input.value;
				}
			});

			nav.push(data);
		});

		socket.emit('admin.navigation.save', nav, function (err) {
			if (err) {
				alerts.error(err);
			} else {
				const saveBtn = document.getElementById('save');
				saveBtn.classList.toggle('saved', true);
				setTimeout(() => {
					saveBtn.classList.toggle('saved', false);
				}, 5000);
			}
		});
	}

	function remove() {
		const index = $(this).parents('[data-index]').attr('data-index');
		$('#active-navigation [data-index="' + index + '"]').remove();
		$('#enabled [data-index="' + index + '"]').remove();
		return false;
	}

	function toggle() {
		const btn = $(this);
		const disabled = btn.hasClass('enable');
		const index = btn.parents('[data-index]').attr('data-index');
		btn.siblings('.toggle').removeClass('hidden');
		btn.addClass('hidden');
		btn.parents('li').find('[name="enabled"]').val(disabled ? 'on' : '');
		$('#active-navigation [data-index="' + index + '"] a').toggleClass('text-muted', !disabled);
		return false;
	}

	return navigation;
});
