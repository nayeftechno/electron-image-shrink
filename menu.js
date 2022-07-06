const menu = function (isMac, isDev, appName, createAboutWindow) {
  const customMenu = [
    ...(isMac
      ? [
          {
            label: appName,
            submenu: [
              {
                label: "About",
                click: createAboutWindow,
              },
            ],
          },
        ]
      : []),
    {
      role: "fileMenu",
    },
    ...(!isMac
      ? [
          {
            label: "Help",
            submenu: [
              {
                label: "About",
                click: createAboutWindow,
              },
            ],
          },
        ]
      : []),
    ...(isDev
      ? [
          {
            label: "Developer",
            submenu: [
              { role: "reload" },
              { role: "forcereload" },
              { type: "separator" },
              { role: "toggledevtools" },
            ],
          },
        ]
      : []),
  ];
  return customMenu;
};

module.exports = menu;
