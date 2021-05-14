module.exports = function (cfg) {
    const passThruPaths = [
        'assets/', 'scripts/', 'styles/',
        '_redirects', 'favicon.ico',
    ];
    passThruPaths.forEach(file => cfg.addPassthroughCopy(file));
    return {
        passthroughFileCopy: true,
        dir: {
            includes: 'includes',
            layouts: 'layouts',
        }
    }
}
