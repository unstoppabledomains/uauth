module.exports = function override (config, env) {
    console.log('override')
    let loaders = config.resolve
    loaders.fallback = {
        "stream": false,
        "http": false,
        "https": false,
        "os": false,
    }
    
    return config
}