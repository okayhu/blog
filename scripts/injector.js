const css = hexo.extend.helper.get("css").bind(hexo);
const js = hexo.extend.helper.get("js").bind(hexo);

// hexo.extend.injector.register("head_begin", () => {
//   return css("/css/icarus-custom.css");
// });

hexo.extend.injector.register(
  "head_end",
  `<!-- Google tag (gtag.js) -->
  <script async src="https://www.googletagmanager.com/gtag/js?id=G-FFSPHD4588"></script>
  <script>
    window.dataLayer = window.dataLayer || [];
    function gtag(){dataLayer.push(arguments);}
    gtag('js', new Date());

    gtag('config', 'G-FFSPHD4588');
  </script>`
);
