'use strict';

const async = require('async');
const assert = require('assert');
const db = require('../mocks/databasemock');
const sinon = require('sinon');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

// Set the path to the navigation module
const navigationModulePath = 'public/src/admin/settings/navigation.js';

describe('admin/settings/navigation', function () {
	let $, navigation, socket, ajaxify, translator, iconSelect, Benchpress, alerts;

	beforeEach(function () {
		const dom = new JSDOM(`
			<div id="available">
				<ul><li class="drag-item" data-id="custom"></li></ul>
			</div>
			<div id="active-navigation"></div>
			<div id="enabled">
				<li data-index="1"><form></form></li>
			</div>
			<button id="save"></button>
		`, { runScripts: 'dangerously', resources: 'usable' });

		global.window = dom.window;
		global.document = dom.window.document;
		$ = require('jquery')(dom.window);

		socket = { emit: sinon.stub() };
		ajaxify = { data: { available: [], groups: [] } };
		translator = { escape: sinon.stub().returnsArg(0), translate: sinon.stub(), unescape: sinon.stub().returnsArg(0) };
		iconSelect = { init: sinon.stub() };
		Benchpress = { parse: sinon.stub().callsFake((tpl, block, data, callback) => callback('<li></li>')) };
		alerts = { error: sinon.stub() };

		// Require the navigation module after setting up globals
		navigation = require(navigationModulePath)(translator, iconSelect, Benchpress, alerts);
	});

	afterEach(function () {
		sinon.restore();
	});

	describe('init', function () {
		it('should initialize drag-and-drop and event handlers', function (done) {
			async.series([
				function (next) {
					const draggableStub = sinon.spy($.fn, 'draggable');
					const sortableStub = sinon.spy($.fn, 'sortable');
					const droppableStub = sinon.spy($.fn, 'droppable');

					navigation.init();

					assert.strictEqual(draggableStub.calledOnce, true, 'draggable should be called once');
					assert.strictEqual(sortableStub.calledOnce, true, 'sortable should be called once');
					assert.strictEqual(droppableStub.calledOnce, true, 'droppable should be called once');

					next();
				},
			], done);
		});

		it('should handle iconPicker click event', function (done) {
			async.series([
				function (next) {
					navigation.init();

					const iconEl = $('<i class="fa fa-icon"></i>');
					const iconPicker = $('<div class="iconPicker"></div>').append(iconEl);

					$('#enabled').append(iconPicker);
					iconPicker.click();

					assert.strictEqual(iconSelect.init.calledOnce, true, 'iconSelect.init should be called once');
					assert.strictEqual(iconSelect.init.calledWith(iconEl), true, 'iconSelect.init should be called with iconEl');

					next();
				},
			], done);
		});

		it('should handle dropdown toggle event', function (done) {
			async.series([
				function (next) {
					navigation.init();

					const dropdownCheckbox = $('<input type="checkbox" name="dropdown">');
					const enabledItem = $('<li data-index="1"></li>');
					enabledItem.append(dropdownCheckbox);
					$('#enabled').append(enabledItem);

					dropdownCheckbox.click();
					assert.strictEqual(dropdownCheckbox.is(':checked'), true, 'dropdown checkbox should be checked');

					next();
				},
			], done);
		});
	});

	describe('save', function () {
		it('should emit save event with navigation data', function (done) {
			async.series([
				function (next) {
					navigation.init();

					navigation.save();

					assert.strictEqual(socket.emit.calledOnce, true, 'socket.emit should be called once');
					assert.strictEqual(socket.emit.calledWith('admin.navigation.save'), true, 'socket.emit should be called with admin.navigation.save');

					next();
				},
			], done);
		});
	});

	describe('remove', function () {
		it('should remove item from active-navigation and enabled', function (done) {
			async.series([
				function (next) {
					navigation.init();

					const removeBtn = $('<button class="delete"></button>');
					const enabledItem = $('<li data-index="1"></li>').append(removeBtn);
					$('#enabled').append(enabledItem);

					removeBtn.click();

					assert.strictEqual($('#active-navigation [data-index="1"]').length, 0, 'Item should be removed from active-navigation');
					assert.strictEqual($('#enabled [data-index="1"]').length, 0, 'Item should be removed from enabled');

					next();
				},
			], done);
		});
	});

	describe('toggle', function () {
		it('should toggle item enabled state', function (done) {
			async.series([
				function (next) {
					navigation.init();

					const toggleBtn = $('<button class="toggle enable"></button>');
					const enabledItem = $('<li data-index="1"></li>').append(toggleBtn);
					$('#enabled').append(enabledItem);

					toggleBtn.click();

					assert.strictEqual(toggleBtn.hasClass('hidden'), true, 'Toggle button should be hidden');
					assert.strictEqual($('#active-navigation [data-index="1"] a').hasClass('text-muted'), true, 'Item in active-navigation should be muted');

					next();
				},
			], done);
		});
	});
});
