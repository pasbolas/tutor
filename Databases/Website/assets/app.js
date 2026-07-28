(function(){
  var globalNavigation = document.createElement('script');
  globalNavigation.src = '/scripts/global-navigation.js';
  document.head.appendChild(globalNavigation);

  var root = document.documentElement;
  var saved = localStorage.getItem('db-theme');
  if(saved) root.setAttribute('data-theme', saved);

  document.addEventListener('DOMContentLoaded', function(){
    var btn = document.getElementById('theme-toggle');
    function updateIcon(){
      if(btn) btn.textContent = root.getAttribute('data-theme') === 'dark' ? '☀' : '☾';
    }
    updateIcon();
    if(btn){
      btn.addEventListener('click', function(){
        var cur = root.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
        root.setAttribute('data-theme', cur);
        localStorage.setItem('db-theme', cur);
        updateIcon();
      });
    }

    // reading progress bar
    var bar = document.querySelector('.progress-bar');
    if(bar){
      window.addEventListener('scroll', function(){
        var h = document.documentElement;
        var scrolled = (h.scrollTop) / (h.scrollHeight - h.clientHeight) * 100;
        bar.style.width = (scrolled || 0) + '%';
      }, {passive:true});
    }

    // scroll-spy for article side TOC
    var links = document.querySelectorAll('.side-toc a[data-target]');
    if(links.length){
      var map = {};
      links.forEach(function(l){ map[l.getAttribute('data-target')] = l; });
      var tocBox = document.querySelector('.side-toc');
      var obs = new IntersectionObserver(function(entries){
        entries.forEach(function(e){
          var link = map[e.target.id];
          if(!link) return;
          if(e.isIntersecting){
            links.forEach(function(l){ l.classList.remove('active'); });
            link.classList.add('active');
            if(tocBox){
              link.scrollIntoView({block:'nearest', inline:'nearest'});
            }
          }
        });
      }, {rootMargin:'-15% 0px -70% 0px', threshold:0});
      document.querySelectorAll('.prose section').forEach(function(s){ obs.observe(s); });
    }
  });
})();
