module.exports = {
  devServer: {
    proxy: {
      '/api': {
        target: process.env.VUE_APP_API_URL || 'http://localhost:5000',
        changeOrigin: true,
        pathRewrite: {
          '^/api': '/api'
        }
      }
    }
  },
  pwa: {
    name: '스마트폐기물관리',
    themeColor: '#4caf50',
    msTileColor: '#ffffff',
    appleMobileWebAppCapable: 'yes',
    appleMobileWebAppStatusBarStyle: 'black-translucent',
    workboxOptions: {
      skipWaiting: true
    }
  }
}
