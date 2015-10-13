/*
 Copyright (C) 2015 Craig Burton

 This program is free software: you can redistribute it and/or modify
 it under the terms of the GNU General Public License as published by
 the Free Software Foundation, either version 3 of the License, or
 (at your option) any later version.

 This program is distributed in the hope that it will be useful,
 but WITHOUT ANY WARRANTY; without even the implied warranty of
 MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
 GNU General Public License for more details.

 You should have received a copy of the GNU General Public License
 along with this program.  If not, see <http://www.gnu.org/licenses/>.
 */

module.exports = function(pb) {

  //pb dependencies
  var util = pb.util;

  /**
   * Loads a section
   */
  function Contact(){}
  util.inherits(Contact, pb.BaseController);


  // Contact.prototype.init = function(context, cb) {
  //   var self = this;
  //   var init = function(err) {
  //
  //   };
  //   Contact.super_.prototype.init.apply(this, [context, init]);
  // };

  Contact.prototype.render = function(cb) {

    var output = {
      content_type: 'text/html',
      code: 200
    };

    this.ts.load('contact', function(err, result){
      output.content = result;
      cb(output);
    });

  };

  Contact.getRoutes = function(cb) {
    var routes = [{
      method: 'get',
      path: '/contact',
      auth_required: false,
      content_type: 'text/html'
    }];
    cb(null, routes);
  };

  //exports
  return Contact;


};
