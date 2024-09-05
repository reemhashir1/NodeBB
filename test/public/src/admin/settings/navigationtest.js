// 'use strict';

// /* global jest, beforeAll, expect, document */

// const $ = require('jquery');
// require('jquery-ui/ui/widgets/draggable');
// require('jquery-ui/ui/widgets/droppable');
// require('jquery-ui/ui/widgets/sortable');

// // Mock external dependencies
// jest.mock('translator');
// jest.mock('iconSelect');
// jest.mock('benchpress');
// jest.mock('alerts');

// describe('navigation', () => {
//     let navigation;
//     let ajaxify;

//     beforeAll(() => {
//         // Set up the document body for testing
//         document.body.innerHTML = `
//             <ul id="available">
//                 <li><div class="drag-item"></div></li>
//             </ul>
//             <ul id="active-navigation"></ul>
//         `;

//         // Mock global variables
//         ajaxify = { data: { available: [] } };
//         global.ajaxify = ajaxify;

//         // Import the navigation module
//         navigation = require('./navigation.js'); // Correct path for navigation.js
//     });
// });