function setTabTitleAndIcon() {
  const params = window.location.hash
    .slice(1)
    .split('&')
    .reduce((acc, curr) => {
      const [key, val] = curr.split('=');
      return { ...acc, [key]: decodeURIComponent(val) };
    }, {});

  document.querySelector('link[rel="icon"]').href = params.favIconUrl;
  document.title = params.title;
}

setTabTitleAndIcon();
