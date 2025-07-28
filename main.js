window.onload = async function () {
    hookHistoryMethods();
    window.addEventListener('locationchange', handleLocationChange);

    const URLparts = window.location.pathname.split('/');
    window.base = URLparts.length > 1 ? `/${URLparts[1]}/` : '/';

    const response = await fetch(`${window.base}apps.json`);
    window.apps = await response.json();

    handleLocationChange();

    document.addEventListener('click', (e) => {
        const target = e.target;
        if (target.matches('[data-route]')) {
            const route = target.dataset.route;
            if(route.includes(window.base)) window.history.pushState(null, '', route); // triggers locationchange
            else window.location.assign(route);

            e.preventDefault();
        }
    });
}

function hookHistoryMethods() {
    const origPush = history.pushState;
    const origReplace = history.replaceState;

    history.pushState = function (...args) {
        origPush.apply(this, args);
        window.dispatchEvent(new Event('locationchange'));
    };

    history.replaceState = function (...args) {
        origReplace.apply(this, args);
        window.dispatchEvent(new Event('locationchange'));
    };

    window.addEventListener('popstate', () => {
        window.dispatchEvent(new Event('locationchange'));
    });
}

function handleLocationChange() {
    const normalized = window.location.pathname.toLowerCase();
    let path = normalized.endsWith('/') ? normalized : `${normalized}/`;

    if(window.location.pathname !== path) {
        window.history.replaceState(null, '', path);
    }

    renderContent();
}

async function renderContent() {
    const URLroute = window.location.pathname.slice(window.base.length);
    const route = URLroute.endsWith('/') ? URLroute.slice(0, -1) : URLroute;

    let currentApp = window.apps[route] || '';

    if (currentApp) {
        document.getElementById('title').textContent = currentApp.title;
        document.title = currentApp.title;
        document.getElementById('app-link').dataset.route = currentApp.link;
    }
    else {
        document.getElementById('title').textContent = 'Not Found';
        document.title = 'Not Found';
    }
}