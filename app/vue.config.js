// app/vue.config.js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/driver/' : '/',
  outputDir: 'dist',
  assetsDir: 'assets',
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true



      }
    }
  },
  configureWebpack: {
    optimization: {
      splitChunks: {
        chunks: 'all'
      }



    }
  }
}
