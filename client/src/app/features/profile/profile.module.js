/**
 * @typedef {Object} TravelPlan
 * @property {string[]} counties
 * @property {Date} startDate
 * @property {Date} endDate
 */

angular.module('dateNightApp.profile', ['dateNightApp.core'])
  .constant('COUNTIES', [
    'Oslo', 'Viken', 'Innlandet', 'Vestfold og Telemark', 
    'Agder', 'Rogaland', 'Vestland', 'Møre og Romsdal', 
    'Trøndelag', 'Nordland', 'Troms og Finnmark'
  ]);
