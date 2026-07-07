// Adds the App Group entitlement to the MAIN app target so it can share data
// with the WidgetKit extension. The widget target gets its own App Group via
// targets/widget/expo-target.config.js; this covers the app side.
const { withEntitlementsPlist } = require("expo/config-plugins");

const APP_GROUP = "group.com.shadev.tinnitushelpme";
const KEY = "com.apple.security.application-groups";

module.exports = function withAppGroup(config) {
  return withEntitlementsPlist(config, (cfg) => {
    const groups = cfg.modResults[KEY] || [];
    if (!groups.includes(APP_GROUP)) {
      groups.push(APP_GROUP);
    }
    cfg.modResults[KEY] = groups;
    return cfg;
  });
};
