function getAppUrl(appNodeEnv) {
    const isProdOrStaging = appNodeEnv === 'production' || appNodeEnv === 'staging';
    return isProdOrStaging ? process.env.REACT_APP_SITE_URL || '' : 'http://localhost:7000';
}

function getReactAppUrl(appNodeEnv) {
    const isProdOrStaging = appNodeEnv === 'production' || appNodeEnv === 'staging';
    return isProdOrStaging ? process.env.REACT_APP_SITE_URL || '' : 'http://localhost:3000';
}

function getLocationApiUrl(appNodeEnv) {
    const isProdOrStaging = appNodeEnv === 'production' || appNodeEnv === 'staging';
    return isProdOrStaging ? process.env.REACT_APP_API_ENDPOINT || '' : 'http://localhost:5000';
}

export { getAppUrl, getLocationApiUrl, getReactAppUrl };