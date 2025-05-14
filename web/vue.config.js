 // web/vue.config.js
module.exports = {
  publicPath: '/',
  outputDir: 'dist',
  assetsDir: 'assets',
  productionSourceMap: false,
  lintOnSave: false,
  
  devServer: {
    proxy: {
      '/api': {
        target: 'http://localhost:5000',
        changeOrigin: true
      }
    }
  },
  
  // chainWebpack 설정을 module.exports 객체 내부로 이동
  chainWebpack: config => {
    config.module.rules.delete('eslint');
    
    // SVG 로더 설정
    const svgRule = config.module.rule('svg');
    svgRule.uses.clear();
    svgRule
      .use('vue-svg-loader')
      .loader('vue-svg-loader')
      .options({
        svgo: {
          plugins: [
            { removeTitle: true },
            { convertColors: { shorthex: false } },
            { convertPathData: false }
          ]
        }
      });

      // 경로 별칭 추가
    config.resolve.alias.set('@', require('path').join(__dirname, 'src'));
  },
};
