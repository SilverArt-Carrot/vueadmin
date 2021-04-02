//发布项目时需要用到的babel插件
prodPlugins = []

//如果是开发环境，则移除所有的console
if(process.env.NODE_ENV === 'production') {
  prodPlugins.push('transform-remove-console')
}

module.exports = {
  "presets": [
    "@vue/cli-plugin-babel/preset"
  ],
  "plugins": [
    [
      "component",
      {
        "libraryName": "element-ui",
        "styleLibraryName": "theme-chalk"
      }
    ],
      ...prodPlugins,
    '@babel/plugin-syntax-dynamic-import'
  ]
}
