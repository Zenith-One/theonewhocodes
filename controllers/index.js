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

  //node dependencies
  var deepcopy = require('deepcopy');

  //pb dependencies
  var util = pb.util;

  /**
   * Loads a section
   */
  function Index(){}
  util.inherits(Index, pb.BaseController);

  Index.prototype.init = function(context, cb) {
    var self = this;
    var init = function(err) {
      getRouteInfo(function(err, routeInfo){
        self.routeInfo = routeInfo;
        //get content settings
        var contentService = new pb.ContentService();
        contentService.getSettings(function(err, contentSettings) {
          if (util.isError(err)) {
            return cb(err);
          }

          //create the service
          self.contentSettings = contentSettings;
          var asContext = self.getServiceContext();
          asContext.contentSettings = contentSettings;
          self.service = new pb.ArticleServiceV2(asContext);

          //create the loader context
          var cvlContext             = self.getServiceContext();
          cvlContext.contentSettings = contentSettings;
          cvlContext.service         = self.service;
          self.contentViewLoader     = new pb.ContentViewLoader(cvlContext);

          //provide a dao
          self.dao = new pb.DAO();

          cb(null, true);
        });

      });

    };
    Index.super_.prototype.init.apply(this, [context, init]);
  };

  Index.prototype.render = function(cb) {

    var self    = this;
    var query = this.query;
    var pageNumber;
    if (query.page && pb.validation.isInt(query.page, true, false)) {
      pageNumber = parseInt(query.page, 10);
    }

    self.getContent(pageNumber, self.contentSettings.articles_per_page, function(err, articles) {
      if (util.isError(err)) {
        return cb(err);
      }

      self.getCount(pageNumber, self.contentSettings.articles_per_page, function(err, count) {
        //render
        var options = {
          useDefaultTemplate: true
        };

        // Setup pagination
        var prev;
        var next = 1;
        var prevDisplay = "none";
        var nextDisplay = "none";
        if (pageNumber && pageNumber > 0) {
          prev = pageNumber - 1;
          prevDisplay = "inline-block";

          next = pageNumber +1;
        }
        if (count) {
          var page = pageNumber || 0;
          var lastPage = Math.ceil(count / self.contentSettings.articles_per_page) - 1;
          if (lastPage > page) {
            nextDisplay = "inline-block";
          }
        }
        self.ts.registerLocal('previous_page', prev);
        self.ts.registerLocal('previous_display', prevDisplay);
        self.ts.registerLocal('next_page', next);
        self.ts.registerLocal('next_display', nextDisplay);

        self.contentViewLoader.render(articles, options, function(err, html) {
          if (util.isError(err)) {
            return cb(err);
          }

          var result = {
            content: html
          };
          cb(result);
        });
      });
    });
  };

  Index.prototype.getContent = function(pageNumber, articlesPerPage, cb) {
    var self = this;

    var section = this.req.pencilblue_section || null;
    var topic   = this.req.pencilblue_topic   || null;

    var opts = {
      render: true,
      limit: self.contentSettings.articles_per_page || 5,
      order: [{'publish_date': pb.DAO.DESC}]
    };

    if (topic) {
      opts.where = { article_topics: topic };
    }

    if (pageNumber) {
      opts.offset = pageNumber * articlesPerPage;
    }

    self.service.getPublished(opts, cb);
  };

  Index.prototype.getCount = function(pageNumber, articlesPerPage, cb) {
    var self = this;

    var section = this.req.pencilblue_section || null;
    var topic   = this.req.pencilblue_topic   || null;

    var opts = {
      where: {}
    };

    if (topic) {
      opts.where = { article_topics: topic };
    }

    pb.ContentObjectService.setPublishedClause(opts.where);
    self.service.count(opts, cb);
  };

  /**
   * Handles custom page routes (e.g. /about instead of /page/about )
   * @param {Function} cb The callback from the requestHandler
   */
  Index.prototype.customPageRouteHandler = function(cb){
    var self = this;
    // Get the constructor for the PageViewController
    var PageViewController = this.getPageControllerConstructor();

    // instantiate the PageViewController
    this.instantiatePageViewController(PageViewController, function(instance){
      // Then delegate the rendering
      self.delegateToPageController(instance, cb);
    });
  };

  /**
   * Returns the constructor for the active theme's PageViewController
   * @return {Function} the PageViewController for the active theme
   */
  Index.prototype.getPageControllerConstructor = function(){
    // Make a copy so we don't futz with the real request
    var newReq = deepcopy(this.req);

    // Update the url to the one we're proxying
    newReq.url = '/page' + this.req.url;

    // use the RequestHandler to gain a reference to the PageViewController
    var handler = this.reqHandler;
    var PageViewController = handler
        .getRoute(newReq.url)
        .themes[this.ts.activeTheme]
        .GET.controller;

    return PageViewController;
  };

  /**
   * Instantiates and initializes the PageViewcontroller
   * @param {Function} PageViewController The PageViewController constructor
   * @param {Function} done The callback to which we'll pass the instance when init is finished
   */
  Index.prototype.instantiatePageViewController = function(PageViewController, done){
    // chop off the leading slash
    var customUrl = this.req.url.substr(1);

    // Mostly just pass along the props Index got when during init
    // with the exception of the customUrl, which we generated above.
    var props = {
        request_handler: this.reqHandler,
        request: this.req,
        response: this.resp,
        session: this.session,
        localization_service: this.ls,
        path_vars: {customUrl: customUrl},
        query: this.query,
        body: this.body,
        activeTheme: this.ts.activeTheme
    };

    // Instantiate
    var pageViewControllerInstance = new PageViewController();

    // Initialize with the props, passing in the done callback we received
    pageViewControllerInstance.init(props, function(){
      done(pageViewControllerInstance);
    });
  };

  /**
   * Hands off the rendering to the instance of the PageViewController
   * @param {Object} pageViewControllerInstance
   * @param {Function} cb
   */
  Index.prototype.delegateToPageController = function(pageViewControllerInstance, cb){
    pageViewControllerInstance.render(cb);
  };

  /**
   * Ensures that all routes are loaded from config
   * @private
   * @param {Function} cb A callback that provides two parameters: cb(error, {route config data})
   */
  function getRouteInfo(cb){
    // TODO: async already does this kind of thing. Make use of it.
    var requiredRoutes = [
      'about'
    ];
    var receivedRoutes = {};
    var responses = 0;
    var handler = function(err, value, route){
      if(err){
        cb(err);
      }
      receivedRoutes[route] = value;
      responses += 1;
      if(responses === requiredRoutes.length){
        cb(null, receivedRoutes);
      }
    };
    var pluginService = new pb.PluginService();
    pluginService.getSetting('about_page_custom_url', 'theonewhocodes', function(err, value){
      handler(err, value, 'about');
    });
  }

  Index.getRoutes = function(cb) {
    getRouteInfo(function(err, routeConfig){
      if(err){
        cb(err);
      }
      var routes = [{
        method: 'get',
        path: '/',
        auth_required: false,
        content_type: 'text/html'
      },
      {
        method: 'get',
        path: '/' + routeConfig.about,
        auth_required: false,
        content_type: 'text/html',
        handler: 'customPageRouteHandler'
      }
      ];
      cb(null, routes);
    });
  };

  //exports
  return Index;


};
