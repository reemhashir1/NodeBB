'use strict';

/* global jest, beforeAll, test, expect, document */

const $ = require('jquery');
require('jquery-ui/ui/widgets/draggable');
require('jquery-ui/ui/widgets/droppable');
require('jquery-ui/ui/widgets/sortable');

// Mock external dependencies
jest.mock('translator');
jest.mock('iconSelect');
jest.mock('benchpress');
jest.mock('alerts');

describe('navigation', () => {
	let navigation;
	let ajaxify;

	beforeAll(() => {
		// Set up the document body for testing
		document.body.innerHTML = `
			<ul id="available">
				<li><div class="drag-item"></div></li>
			</ul>
			<ul id="active-navigation"></ul>
		`;

		// Mock global variables
		ajaxify = { data: { available: [] } };
		global.ajaxify = ajaxify;

		// Import the navigation module
		navigation = require('./navigation'); // Correct path for navigation.js
	});

	test('should initialize navigation', () => {
		// Spy on the initialization functions
		const initDraggable = jest.spyOn(navigation, 'initDraggable');
		const initSortableAndDroppable = jest.spyOn(navigation, 'initSortableAndDroppable');
		const initIconPicker = jest.spyOn(navigation, 'initIconPicker');
		const initDropdownToggle = jest.spyOn(navigation, 'initDropdownToggle');
		const initClickHandlers = jest.spyOn(navigation, 'initClickHandlers');

		// Call the init function
		navigation.init();

		// Ensure all init functions are called
		expect(initDraggable).toHaveBeenCalled();
		expect(initSortableAndDroppable).toHaveBeenCalled();
		expect(initIconPicker).toHaveBeenCalled();
		expect(initDropdownToggle).toHaveBeenCalled();
		expect(initClickHandlers).toHaveBeenCalled();
	});

	test('should initialize draggable items', () => {
		// Initialize draggable items
		navigation.initDraggable();

		// Check if draggable instance exists
		const draggableItems = $('#available').find('li .drag-item');
		expect(draggableItems.draggable('instance')).toBeTruthy();
	});

	test('should initialize sortable and droppable', () => {
		// Initialize sortable and droppable items
		navigation.initSortableAndDroppable();

		// Check if sortable and droppable instances exist
		const sortable = $('#active-navigation').sortable('instance');
		const droppable = $('#active-navigation').droppable('instance');

		expect(sortable).toBeTruthy();
		expect(droppable).toBeTruthy();
	});

	// Add more tests for other initialization functions if needed
});
