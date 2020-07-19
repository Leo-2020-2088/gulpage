const {src, dest, series, parallel,watch} = require('gulp')
const del = require('del')
const browserSync = require('browser-sync')
const loadPlugins = require('gulp-load-plugins')
const plugins = loadPlugins()
// const data = require('./data')
const bs = browserSync.create()

const data = {
    menus: [
      {
        name: 'Home',
        icon: 'aperture',
        link: 'index.html'
      },
      {
        name: 'Features',
        link: 'features.html'
      },
      {
        name: 'About',
        link: 'about.html'
      },
      {
        name: 'Contact',
        link: '#',
        children: [
          {
            name: 'Twitter',
            link: 'https://twitter.com/w_zce'
          },
          {
            name: 'About',
            link: 'https://weibo.com/zceme'
          },
          {
            name: 'divider'
          },
          {
            name: 'About',
            link: 'https://github.com/zce'
          }
        ]
      }
    ],
    pkg: require('./package.json'),
    date: new Date()
  }
const clean = () => {
    return del(['dist', 'temp'])
}
const style = () => {
    return src('src/assets/styles/*.scss', {base:'src'})
        .pipe(plugins.sass({outputStyle: 'expanded'}))
        .pipe(dest('temp'))
        .pipe(bs.reload({stream: true}))
}
const script = () => {
    return src('src/assets/scripts/*.js',{base: 'src'})
        .pipe(plugins.babel({
            presets: ['@babel/preset-env']
        }))
        .pipe(dest('temp'))
        .pipe(bs.reload({stream: true}))
}
const page = () => {
    return src('src/*.html', {base: 'src'})
        .pipe(plugins.swig({ data, defaults: { cache: false } }))
        .pipe(dest('temp'))
        .pipe(bs.reload({stream: true}))
}
const image = () => {
    return src('src/assets/images/**')
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}
const font = () => {
    return src('src/assets/fonts/**')
        .pipe(plugins.imagemin())
        .pipe(dest('dist'))
}
const extra = () => {
    return src('public/**', {base: 'public'})
        .pipe(dest('dist'))
}

const serve = () => {
    watch('src/assets/styles/*.scss', style)
    watch('src/assets/scripts/*.js', script)
    watch('src/*.html', page)
    watch([
        'src/assets/images/**',
        'src/assets/fonts/**',
        'public/**'
    ], bs.reload)
    bs.init({
        notify: false,
        port: 8080,
        // files: 'dist/**',
        server: {
            baseDir: ['temp','src','public'],
            routes: {
                '/node_modules': 'node_modules'
            }
        }
    })
}
const useref = () => {
    return src('temp/*.html', {base:'temp'})
        .pipe(plugins.useref({searchPath: ['temp', '.']}))
        .pipe(plugins.if(/\.js$/,plugins.uglify()))
        .pipe(plugins.if(/\.css$/,plugins.cleanCss()))
        .pipe(plugins.if(/\.html$/,plugins.htmlmin({
            minifyCSS:true,
            minifyJS:true,
            collapseWhitespace:true
        })))
        .pipe(dest('dist'))
}

const compile = parallel(style,script,page)
// 上线之前执行的任务
const build = series(clean, parallel(series(compile, useref), image,font, extra))
const develop = series(compile, serve)
module.exports = {
    build,
    develop    
}