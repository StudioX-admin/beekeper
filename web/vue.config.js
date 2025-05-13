// web/vue.config.js
module.exports = {
  publicPath: process.env.NODE_ENV === 'production' ? '/admin/' : '/',
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
    
    // 퍼블리싱 소스의 이미지 및 아이콘 최적화
  chainWebpack: config => {
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

    // 이미지 최적화 설정
    config.module
      .rule('images')
      .use('image-webpack-loader')
      .loader('image-webpack-loader')
      .options({
        bypassOnDebug: true,
        disable: process.env.NODE_ENV !== 'production',
        mozjpeg: {
          progressive: true,
          quality: 75
        },
        optipng: {
          enabled: true,
        },
        pngquant: {
          quality: [0.65, 0.90],
          speed: 4
        },
        gifsicle: {
          interlaced: false,
        },
        webp: {
          quality: 75
        }
      });
  }
}
