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

        initDraggable();
        initSortableAndDroppable();
        initIconPicker();
        initDropdownToggle();
        initClickHandlers();
    };

    function initDraggable() {
        $('#available').find('li .drag-item').draggable({
            connectToSortable: '#active-navigation',
            helper: 'clone',
            distance: 10,
            stop: drop
        });
    }

    function initSortableAndDroppable() {
        $('#active-navigation').sortable().droppable({
            accept: $('#available li .drag-item')
        });
    }

    function initIconPicker() {
        $('#enabled').on('click', '.iconPicker', function () {
            const iconEl = $(this).find('i');
            iconSelect.init(iconEl, function (el) {
                updateIcon(iconEl, el);
            });
        });
    }

    function initDropdownToggle() {
        $('#enabled').on('click', '[name="dropdown"]', function () {
            const el = $(this);
            const index = el.parents('[data-index]').attr('data-index');
            toggleDropdownIcon(index, el.is(':checked'));
        });
    }

    function initClickHandlers() {
        $('#active-navigation').on('click', 'li', onSelect);
        $('#enabled').on('click', '.delete', remove).on('click', '.toggle', toggle);
        $('#save').on('click', save);
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
        const data = id === 'custom' ? getCustomData() : available[id];

        data.index = getNewIndex();
        prepareDataForRendering(data);

        Promise.all([
            renderNavigation(data, el),
            renderForm(data)
        ]).then(() => selectIndex(data.index));
    }

    function getCustomData() {
        return {
            iconClass: 'fa-navicon',
            groups: available[0].groups,
            enabled: true
        };
    }

    function getNewIndex() {
        return (parseInt($('#enabled').children().last().attr('data-index'), 10) || 0) + 1;
    }

    function prepareDataForRendering(data) {
        data.title = translator.escape(data.title);
        data.text = translator.escape(data.text);
        data.groups = ajaxify.data.groups;
    }

    function renderNavigation(data, el) {
        return new Promise((resolve) => {
            Benchpress.parse('admin/settings/navigation', 'navigation', { navigation: [data] }, function (li) {
                translator.translate(li, function (li) {
                    li = $(translator.unescape(li));
                    el.after(li);
                    el.remove();
                    resolve();
                });
            });
        });
    }

    function renderForm(data) {
        return new Promise((resolve) => {
            Benchpress.parse('admin/settings/navigation', 'enabled', { enabled: [data] }, function (li) {
                translator.translate(li, function (li) {
                    li = $(translator.unescape(li));
                    $('#enabled').append(li);
                    resolve();
                });
            });
        });
    }

    function updateIcon(iconEl, el) {
        const newIconClass = el.attr('value');
        const index = iconEl.parents('[data-index]').attr('data-index');
        $('#active-navigation [data-index="' + index + '"] i.nav-icon').attr('class', 'fa fa-fw ' + newIconClass);
        iconEl.siblings('[name="iconClass"]').val(newIconClass);
        iconEl.siblings('.change-icon-link').toggleClass('hidden', !!newIconClass);
    }

    function toggleDropdownIcon(index, isChecked) {
        $('#active-navigation [data-index="' + index + '"] i.dropdown-icon').toggleClass('hidden', !isChecked);
    }

    function save() {
        const nav = getSerializedNavData();
        socket.emit('admin.navigation.save', nav, function (err) {
            handleSaveResponse(err);
        });
    }

    function getSerializedNavData() {
        const nav = [];
        const indices = [];

        $('#active-navigation li').each(function () {
            indices.push($(this).attr('data-index'));
        });

        indices.forEach(function (index) {
            const el = $('#enabled').children('[data-index="' + index + '"]');
            const form = el.find('form').serializeArray();
            const data = serializeFormData(form);
            nav.push(data);
        });

        return nav;
    }

    function serializeFormData(form) {
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
        return data;
    }

    function handleSaveResponse(err) {
        if (err) {
            alerts.error(err);
        } else {
            const saveBtn = document.getElementById('save');
            saveBtn.classList.toggle('saved', true);
            setTimeout(() => {
                saveBtn.classList.toggle('saved', false);
            }, 5000);
        }
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
