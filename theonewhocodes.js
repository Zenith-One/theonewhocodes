
module.exports = function TheOneWhoCodesModule(pb) {

    /**
     * TheOneWhoCodes - A tech blog theme for http://theonewho.codes
     *
     * @author Craig Burton <craig@theonewho.codes>
     * @copyright 2015 Craig Burton
     */
    function TheOneWhoCodes(){}

    /**
     * Called when the application is being installed for the first time.
     *
     * @param cb A callback that must be called upon completion.  cb(err, result).
     * The result is ignored
     */
    TheOneWhoCodes.onInstall = function(cb) {
        cb(null, true);
    };

    /**
     * Called when the application is uninstalling this plugin.  The plugin should
     * make every effort to clean up any plugin-specific DB items or any in function
     * overrides it makes.
     *
     * @param cb A callback that must be called upon completion.  cb(err, result).
     * The result is ignored
     */
    TheOneWhoCodes.onUninstall = function(cb) {
        cb(null, true);
    };

    /**
     * Called when the application is starting up. The function is also called at
     * the end of a successful install. It is guaranteed that all core PB services
     * will be available including access to the core DB.
     *
     * @param cb A callback that must be called upon completion.  cb(err, result).
     * The result is ignored
     */
    TheOneWhoCodes.onStartup = function(cb) {
        pb.TemplateService.registerGlobal('header_tagline', function(flag, cb) {
          var pluginService = new pb.PluginService();
          pluginService.getSetting('header_tagline', 'theonewhocodes', cb);
        });

        pb.TemplateService.registerGlobal('homepage_seo_keywords', function(flag, cb) {
          var pluginService = new pb.PluginService();
          pluginService.getSetting('homepage_seo_keywords', 'theonewhocodes', cb);
        });

        pb.TemplateService.registerGlobal('homepage_seo_description', function(flag, cb) {
          var pluginService = new pb.PluginService();
          pluginService.getSetting('homepage_seo_description', 'theonewhocodes', cb);
        });

        pb.TemplateService.registerGlobal('author_linkedin_url', function(flag, cb) {
          var pluginService = new pb.PluginService();
          pluginService.getSetting('author_linkedin_url', 'theonewhocodes', cb);
        });

        pb.TemplateService.registerGlobal('author_stackoverflow_url', function(flag, cb) {
          var pluginService = new pb.PluginService();
          pluginService.getSetting('author_stackoverflow_url', 'theonewhocodes', cb);
        });

        pb.TemplateService.registerGlobal('author_github_url', function(flag, cb) {
          var pluginService = new pb.PluginService();
          pluginService.getSetting('author_github_url', 'theonewhocodes', cb);
        });

        cb(null, true);
    };

    /**
     * Called when the application is gracefully shutting down.  No guarantees are
     * provided for how much time will be provided the plugin to shut down.
     *
     * @param cb A callback that must be called upon completion.  cb(err, result).
     * The result is ignored
     */
    TheOneWhoCodes.onShutdown = function(cb) {
        cb(null, true);
    };

    //exports
    return TheOneWhoCodes;
};
