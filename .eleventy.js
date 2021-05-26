const { execSync } = require('child_process');

module.exports = function (cfg) {
    const passThruPaths = [
        'images/', 'scripts/', 'styles/',
        '_redirects', 'favicon.ico',
    ];

    passThruPaths.forEach(file => cfg.addPassthroughCopy(file));

    cfg.on('afterBuild', () => {
        ['common', 'home', 'main'].forEach(name => {
            execSync(`npx novasheets -c _site/styles/${name}.nvss`, (err, stdout, stderr) => console.log(err || stdout));
        });
    });

    return {
        passthroughFileCopy: true,
        dir: {
            includes: 'includes',
            layouts: 'layouts',
        }
    }
}
