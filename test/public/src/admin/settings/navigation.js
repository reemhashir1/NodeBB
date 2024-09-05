'use strict';

/* global jest, beforeAll, test, expect, document */

const $ = require('jquery');
require('jquery-ui/ui/widgets/draggable');
require('jquery-ui/ui/widgets/droppable');
require('jquery-ui/ui/widgets/sortable');

jest.mock('translator');
jest.mock('iconSelect');
jest.mock('benchpress');
jest.mock('alerts');

describe('navigation', () => {
	let navigation;
	let ajaxify;

	beforeAll(() => {
		document.body.innerHTML = `
			<ul id="available">
				<li><div class="drag-item"></div></li>
			</ul>
			<ul id="active-navigation"></ul>
		`;

		ajaxify = { data: { available: [] } };
		global.ajaxify = ajaxify;

		navigation = require('./navigation');
	});

	test('should initialize navigation', () => {
		const initDraggable = jest.spyOn(navigation, 'initDraggable');
		const initSortableAndDroppable = jest.spyOn(navigation, 'initSortableAndDroppable');
		const initIconPicker = jest.spyOn(navigation, 'initIconPicker');
		const initDropdownToggle = jest.spyOn(navigation, 'initDropdownToggle');
		const initClickHandlers = jest.spyOn(navigation, 'initClickHandlers');

		navigation.init();

		expect(initDraggable).toHaveBeenCalled();
		expect(initSortableAndDroppable).toHaveBeenCalled();
		expect(initIconPicker).toHaveBeenCalled();
		expect(initDropdownToggle).toHaveBeenCalled();
		expect(initClickHandlers).toHaveBeenCalled();
	});

	test('should initialize draggable items', () => {
		navigation.initDraggable();

		const draggableItems = $('#available').find('li .drag-item');
		expect(draggableItems.draggable('instance')).toBeTruthy();
	});

	test('should initialize sortable and droppable', () => {
		navigation.initSortableAndDroppable();

		const sortable = $('#active-navigation').sortable('instance');
		const droppable = $('#active-navigation').droppable('instance');

		expect(sortable).toBeTruthy();
		expect(droppable).toBeTruthy();
	});

	// Add more tests for other initialization functions if needed
});

