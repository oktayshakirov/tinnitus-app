/** @type {import('@bacons/apple-targets').Config} */
module.exports = {
  type: "widget",
  icon: "../../assets/images/icon.png",
  colors: {
    $accent: "#FFD2A6",
    $widgetBackground: "#5B3964",
  },
  entitlements: {
    "com.apple.security.application-groups": [
      "group.com.shadev.tinnitushelpme",
    ],
  },
};
