module.exports = function (cfg) {
    const passThruPaths = ['_redirects/', 'assets/', 'scripts/', 'styles/', 'favicon.ico'];
    passThruPaths.forEach(file => cfg.addPassthroughCopy(file));
    return {
        passthroughFileCopy: true,
        dir: {
            includes: 'includes',
            layouts: 'layouts',
        }
    }
}
