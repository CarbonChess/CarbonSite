const { execSync } = require('child_process');

module.exports = function (cfg) {
    const passThruPaths = [
        'images/', 'data/', 'scripts/', 'styles/',
        '_redirects', 'favicon.ico',
    ];

    passThruPaths.forEach(file => cfg.addPassthroughCopy(file));

    cfg.on('beforeBuild', () => {
        ['common', 'home', 'play'].forEach(name => {
            execSync(`npx novasheets -c styles/${name}.nvss`, (err, stdout, stderr) => console.log(err || stdout));
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
