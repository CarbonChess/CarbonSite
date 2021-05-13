module.exports = function (cfg) {
    const passThruPaths = ['_redirects', 'assets', 'scripts', 'styles'];
    passThruPaths.forEach(file => cfg.addPassthroughCopy(file));
    return {
        passthroughFileCopy: true,
        dir: {
            includes: 'includes',
            layouts: 'layouts',
        }
    }
}
