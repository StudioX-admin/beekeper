module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'assets',
  productionSourceMap: false,
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  }
};
