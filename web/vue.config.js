// web/vue.config.js
const { defineConfig } = require('@vue/cli-service')
const path = require('path')

module.exports = defineConfig({
  transpileDependencies: true,
  configureWebpack: {
    resolve: {
      alias: {
        '@': path.resolve(__dirname, 'src'),
        '@assets': path.resolve(__dirname, 'src/assets'),
        '@components': path.resolve(__dirname, 'src/components'),
        '@views': path.resolve(__dirname, 'src/views'),
        '@store': path.resolve(__dirname, 'src/store'),
        '@utils': path.resolve(__dirname, 'src/utils'),
        '@services': path.resolve(__dirname, 'src/services'),
        '@api': path.resolve(__dirname, 'src/api')
      },
      extensions: ['.js', '.vue', '.json', '.scss', '.css'],
      modules: [
        'node_modules',
        path.resolve(__dirname, 'src')
      ]
    }
  },
  chainWebpack: config => {
    config.plugin('html').tap(args => {
      args[0].title = 'Beekeeper'
      return args
    })

    // 모듈 해결 실패 시 더 자세한 오류 메시지 표시
    config.plugin('fork-ts-checker').tap(args => {
      args[0].logger = {
        infrastructure: 'silent',
        issues: 'warning'
      }
      return args
    })
  },
  css: {
    loaderOptions: {
      sass: {
        additionalData: `@import "@/assets/styles/variables.scss";`
      }
    }
  }
})
