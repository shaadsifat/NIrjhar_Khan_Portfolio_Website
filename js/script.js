(function(){
  "use strict";
  var reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fineCursor = window.matchMedia('(pointer: fine)').matches;

  /* footer year */
  var yearEl = document.getElementById('year');
  if(yearEl){ yearEl.textContent = new Date().getFullYear(); }

  /* light / dark theme toggle */
  var themeToggle = document.getElementById('themeToggle');
  if(themeToggle){
    var root = document.documentElement;
    function currentTheme(){
      var stored = root.getAttribute('data-theme');
      if(stored === 'light' || stored === 'dark') return stored;
      return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    function syncToggle(theme){
      themeToggle.setAttribute('aria-checked', theme === 'dark' ? 'true' : 'false');
      themeToggle.setAttribute(
        'aria-label',
        theme === 'dark' ? 'Switch to light theme' : 'Switch to dark theme'
      );
    }
    syncToggle(currentTheme());
    themeToggle.addEventListener('click', function(){
      var next = currentTheme() === 'dark' ? 'light' : 'dark';
      root.setAttribute('data-theme', next);
      try { localStorage.setItem('theme', next); } catch(e) {}
      syncToggle(next);
    });
  }

  /* collapsible service cards (mobile only) */
  var serviceMobileQuery = window.matchMedia('(max-width: 900px)');
  document.querySelectorAll('.service-card').forEach(function(card){
    var head = card.querySelector('.service-card-head button');
    if(!head) return;
    if(serviceMobileQuery.matches){
      head.setAttribute('aria-expanded', 'false');
    }
    head.addEventListener('click', function(){
      if(!serviceMobileQuery.matches) return;
      var isOpen = card.classList.toggle('is-open');
      head.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
  });

  /* mobile hamburger nav */
  var navToggle = document.getElementById('navToggle');
  var siteNav = document.getElementById('siteNav');
  if(navToggle && siteNav){
    function closeNav(){
      siteNav.classList.remove('is-open');
      navToggle.classList.remove('is-active');
      navToggle.setAttribute('aria-expanded', 'false');
    }
    navToggle.addEventListener('click', function(){
      var isOpen = siteNav.classList.toggle('is-open');
      navToggle.classList.toggle('is-active', isOpen);
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });
    siteNav.querySelectorAll('a').forEach(function(link){
      link.addEventListener('click', closeNav);
    });
    window.addEventListener('resize', function(){
      if(window.innerWidth > 900) closeNav();
    });
  }

  /* scroll reveal (also pops the floating chips in once their section is visible) */
  var revealEls = document.querySelectorAll('.reveal, .tool-chip');
  if('IntersectionObserver' in window){
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          io.unobserve(entry.target);
        }
      });
    },{threshold:.15, rootMargin:'0px 0px -8% 0px'});
    revealEls.forEach(function(el){ io.observe(el); });
  } else {
    revealEls.forEach(function(el){ el.classList.add('is-visible'); });
  }

  /* custom cursor */
  if(fineCursor){
    document.documentElement.classList.add('has-fine-cursor');
    var dot = document.getElementById('cursorDot');
    var ring = document.getElementById('cursorRing');
    var mx=0,my=0,rx=0,ry=0;
    window.addEventListener('mousemove', function(e){
      mx = e.clientX; my = e.clientY;
      dot.style.left = mx+'px'; dot.style.top = my+'px';
    });
    (function loop(){
      rx += (mx-rx)*0.16; ry += (my-ry)*0.16;
      ring.style.left = rx+'px'; ring.style.top = ry+'px';
      requestAnimationFrame(loop);
    })();
    function bindHoverables(){
      document.querySelectorAll('a, button, .work-card, .service-card, .social-badge, .carousel-btn, .tab-btn, .tool-chip, .testimonial-card, .quote-item, .track-item').forEach(function(el){
        if(el.dataset.cursorBound) return;
        el.dataset.cursorBound = '1';
        el.addEventListener('mouseenter', function(){ ring.classList.add('is-active'); });
        el.addEventListener('mouseleave', function(){ ring.classList.remove('is-active'); });
      });
    }
    bindHoverables();
    window.__bindHoverables = bindHoverables;
  }

  /* card tilt (work + service cards) */
  if(fineCursor && !reduceMotion){
    document.querySelectorAll('.work-card, .service-card').forEach(function(card){
      card.addEventListener('mousemove', function(e){
        var r = card.getBoundingClientRect();
        var px = (e.clientX - r.left)/r.width - 0.5;
        var py = (e.clientY - r.top)/r.height - 0.5;
        card.style.transform = 'perspective(700px) rotateX('+(-py*6)+'deg) rotateY('+(px*6)+'deg) translateY(-5px)';
      });
      card.addEventListener('mouseleave', function(){
        card.style.transform = '';
      });
    });
  }

  /* hero: interaction-only motion — portrait tilts on hover, blobs drift toward the cursor */
  if(fineCursor && !reduceMotion){
    var heroEl = document.querySelector('.hero');
    var portrait = document.querySelector('.portrait-block');
    var blobs = document.querySelectorAll('.hero-blob');
    if(heroEl && portrait){
      heroEl.addEventListener('mousemove', function(e){
        var r = heroEl.getBoundingClientRect();
        var px = (e.clientX - r.left)/r.width - 0.5;
        var py = (e.clientY - r.top)/r.height - 0.5;
        portrait.style.transform = 'perspective(900px) rotateX('+(-py*8)+'deg) rotateY('+(px*8)+'deg)';
        blobs.forEach(function(b, i){
          var dir = i % 2 === 0 ? 1 : -1;
          b.style.transform = 'translate('+(px*30*dir)+'px,'+(py*30*dir)+'px)';
        });
      });
      heroEl.addEventListener('mouseleave', function(){
        portrait.style.transform = '';
        blobs.forEach(function(b){ b.style.transform = ''; });
      });
    }
  }

  /* about: portrait tilts toward the cursor, same treatment as the hero shot */
  if(fineCursor && !reduceMotion){
    var aboutEl = document.getElementById('about');
    var aboutPhoto = document.getElementById('aboutPhoto');
    if(aboutEl && aboutPhoto){
      aboutEl.addEventListener('mousemove', function(e){
        var r = aboutEl.getBoundingClientRect();
        var px = (e.clientX - r.left)/r.width - 0.5;
        var py = (e.clientY - r.top)/r.height - 0.5;
        aboutPhoto.style.transform = 'perspective(900px) rotateX('+(-py*10)+'deg) rotateY('+(px*10)+'deg)';
      });
      aboutEl.addEventListener('mouseleave', function(){
        aboutPhoto.style.transform = '';
      });
    }
  }

  /* floating tool chips — free-roaming physics bodies. Each chip drifts on
     its own heading, bounces off its section's edges and off the main
     content column (so it never sits on top of the text), and gets a
     velocity kick from cursor proximity or a click — all driven by one
     shared requestAnimationFrame loop so the motion stays fluid. */
  var chipEls = document.querySelectorAll('.tool-chip');
  if(chipEls.length){
    var chips = [];
    chipEls.forEach(function(el){
      var container = el.closest('section');
      if(!container) return;
      var rect = el.getBoundingClientRect();
      var speed = 0.3 + Math.random()*0.3;
      var angle = Math.random()*Math.PI*2;
      chips.push({
        el: el,
        container: container,
        wrap: container.querySelector('.wrap'),
        r: (rect.width || 40)/2,
        x: 0, y: 0,
        vx: Math.cos(angle)*speed,
        vy: Math.sin(angle)*speed,
        placed: false
      });
    });

    var mouseX = -9999, mouseY = -9999;
    window.addEventListener('mousemove', function(e){
      mouseX = e.clientX; mouseY = e.clientY;
    });

    var PROX = 90, REPEL = 0.85, MAX_SPEED = 2.4, MIN_SPEED = 0.22;

    /* Containers are read (getBoundingClientRect) only on scroll/resize, not
       every animation frame — with ~20 chips sharing ~7 containers, reading
       layout every frame would force a synchronous layout on every tick,
       which is exactly the kind of main-thread work that hurts INP. Between
       refreshes the physics loop only touches cached numbers + writes
       `transform`, so it stays off the layout thread entirely. */
    var containerRects = new Map();
    function refreshRects(){
      var seen = new Set();
      chips.forEach(function(c){
        if(seen.has(c.container)) return;
        seen.add(c.container);
        var cr = c.container.getBoundingClientRect();
        var ob = null;
        if(c.wrap){
          var wr = c.wrap.getBoundingClientRect();
          ob = { left: wr.left-cr.left, top: wr.top-cr.top, right: wr.right-cr.left, bottom: wr.bottom-cr.top };
        }
        containerRects.set(c.container, { left: cr.left, top: cr.top, width: cr.width, height: cr.height, ob: ob });
      });
    }
    refreshRects();
    var rectsDirty = false;
    function requestRectsRefresh(){
      if(rectsDirty) return;
      rectsDirty = true;
      requestAnimationFrame(function(){ refreshRects(); rectsDirty = false; });
    }
    window.addEventListener('scroll', requestRectsRefresh, { passive: true });
    window.addEventListener('resize', requestRectsRefresh);

    function placeChip(c, w, h, ob){
      var x, y, tries = 0;
      do {
        x = c.r + Math.random()*Math.max(1, w - c.r*2);
        y = c.r + Math.random()*Math.max(1, h - c.r*2);
        tries++;
      } while(ob && tries < 14 &&
        x > ob.left - c.r && x < ob.right + c.r && y > ob.top - c.r && y < ob.bottom + c.r);
      c.x = x; c.y = y; c.placed = true;
    }

    var COLLIDE_DIST = 50;

    function integrateChip(c){
      var cr = containerRects.get(c.container);
      if(!cr){ c.skip = true; return; }
      c.screenLeft = cr.left; c.screenTop = cr.top;
      var w = cr.width, h = cr.height;
      if(w < 40 || h < 40){ c.skip = true; return; }
      c.skip = false;
      var ob = cr.ob;
      if(!c.placed) placeChip(c, w, h, ob);
      if(reduceMotion) return;

      var cx = cr.left + c.x, cy = cr.top + c.y;
      var dx = cx - mouseX, dy = cy - mouseY;
      var dist = Math.sqrt(dx*dx + dy*dy);
      if(dist < PROX && dist > 0.01){
        var force = (1 - dist/PROX) * REPEL;
        c.vx += (dx/dist) * force;
        c.vy += (dy/dist) * force;
      }

      c.x += c.vx; c.y += c.vy;
      c.vx *= 0.985; c.vy *= 0.985;

      var speed = Math.sqrt(c.vx*c.vx + c.vy*c.vy);
      if(speed > MAX_SPEED){ c.vx = c.vx/speed*MAX_SPEED; c.vy = c.vy/speed*MAX_SPEED; }
      else if(speed < MIN_SPEED){
        var ang = Math.random()*Math.PI*2;
        c.vx += Math.cos(ang)*0.03; c.vy += Math.sin(ang)*0.03;
      }

      if(c.x < c.r){ c.x = c.r; c.vx = Math.abs(c.vx); }
      if(c.x > w - c.r){ c.x = w - c.r; c.vx = -Math.abs(c.vx); }
      if(c.y < c.r){ c.y = c.r; c.vy = Math.abs(c.vy); }
      if(c.y > h - c.r){ c.y = h - c.r; c.vy = -Math.abs(c.vy); }

      /* free to drift over the text/image column — just dim smoothly while doing so */
      if(ob){
        var closestX = Math.max(ob.left, Math.min(c.x, ob.right));
        var closestY = Math.max(ob.top, Math.min(c.y, ob.bottom));
        var ndx = c.x - closestX, ndy = c.y - closestY;
        c.dimmed = (ndx*ndx + ndy*ndy) < c.r*c.r;
      } else {
        c.dimmed = false;
      }
    }

    /* chip-to-chip collisions, in shared screen space, across all sections */
    function resolveChipCollisions(){
      for(var i=0;i<chips.length;i++){
        var a = chips[i];
        if(a.skip || reduceMotion) continue;
        for(var j=i+1;j<chips.length;j++){
          var b = chips[j];
          if(b.skip) continue;
          var ax = a.screenLeft + a.x, ay = a.screenTop + a.y;
          var bx = b.screenLeft + b.x, by = b.screenTop + b.y;
          var dx = bx - ax, dy = by - ay;
          var dist = Math.sqrt(dx*dx + dy*dy);
          if(dist < COLLIDE_DIST && dist > 0.01){
            var nx = dx/dist, ny = dy/dist;
            var overlap = (COLLIDE_DIST - dist) / 2;
            a.x -= nx*overlap; a.y -= ny*overlap;
            b.x += nx*overlap; b.y += ny*overlap;
            var avn = a.vx*nx + a.vy*ny, bvn = b.vx*nx + b.vy*ny;
            a.vx += (bvn-avn)*nx; a.vy += (bvn-avn)*ny;
            b.vx += (avn-bvn)*nx; b.vy += (avn-bvn)*ny;
          }
        }
      }
    }

    function renderChip(c){
      if(c.skip) return;
      c.el.style.transform = 'translate('+c.x+'px,'+c.y+'px)';
      c.el.classList.toggle('is-dimmed', !!c.dimmed);
    }

    (function chipLoop(){
      chips.forEach(integrateChip);
      resolveChipCollisions();
      chips.forEach(renderChip);
      requestAnimationFrame(chipLoop);
    })();

    chips.forEach(function(c){
      c.el.addEventListener('click', function(){
        var ang = Math.random()*Math.PI*2;
        var kick = 4.2;
        c.vx += Math.cos(ang)*kick;
        c.vy += Math.sin(ang)*kick;
      });
    });
  }

  /* nav scrollspy — highlights the menu item for the section currently in view */
  var navLinks = document.querySelectorAll('header nav a[href^="#"]');
  var spySections = [];
  navLinks.forEach(function(link){
    var id = link.getAttribute('href').slice(1);
    var section = document.getElementById(id);
    if(section){ spySections.push({ id: id, el: section, link: link }); }
  });
  if(spySections.length && 'IntersectionObserver' in window){
    var spyIO = new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        var match = spySections.find(function(s){ return s.el === entry.target; });
        if(!match) return;
        if(entry.isIntersecting){
          navLinks.forEach(function(l){ l.classList.remove('is-current'); });
          match.link.classList.add('is-current');
        }
      });
    },{ rootMargin:'-45% 0px -50% 0px', threshold:0 });
    spySections.forEach(function(s){ spyIO.observe(s.el); });
  }

  /* work filters */
  var filterButtons = document.querySelectorAll('.work-filters .tab-btn');
  var workCards = document.querySelectorAll('.work-card');
  filterButtons.forEach(function(btn){
    btn.addEventListener('click', function(){
      filterButtons.forEach(function(b){ b.classList.remove('is-active'); });
      btn.classList.add('is-active');
      var filter = btn.dataset.filter;
      workCards.forEach(function(card){
        var match = filter === 'all'
          ? card.dataset.hideAll !== 'true'
          : card.dataset.category === filter;
        card.classList.toggle('is-hidden', !match);
      });
    });
  });

  /* testimonial carousel — infinite loop: the real cards are flanked by a
     cloned copy on each side, so advancing past the last real page glides
     onto a visual duplicate of page 1, then silently (no transition) snaps
     back to the real page 1 the instant that glide finishes. Nothing ever
     visibly scrolls backwards. */
  var track = document.getElementById('testimonialTrack');
  if(track){
    var realCards = Array.prototype.slice.call(track.children);
    var realCount = realCards.length;
    var prevBtn = document.getElementById('tPrev');
    var nextBtn = document.getElementById('tNext');
    var dotsWrap = document.getElementById('tDots');
    var wrap = document.querySelector('.testimonial-wrap');
    var GAP = 24; // matches CSS gap
    var TRANSITION_MS = 550; // matches .testimonial-track transition duration

    var cloneBefore = realCards.map(function(c){
      var clone = c.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      return clone;
    });
    var cloneAfter = realCards.map(function(c){
      var clone = c.cloneNode(true);
      clone.setAttribute('aria-hidden', 'true');
      return clone;
    });
    track.innerHTML = '';
    cloneBefore.forEach(function(c){ track.appendChild(c); });
    realCards.forEach(function(c){ track.appendChild(c); });
    cloneAfter.forEach(function(c){ track.appendChild(c); });

    var perView = window.matchMedia('(max-width: 700px)').matches ? 1 : 2;
    var pageCount = Math.ceil(realCount / perView);
    var page = 0;
    var snapTimer = null;
    var autoTimer = null;

    function buildDots(){
      dotsWrap.innerHTML = '';
      for(var i=0;i<pageCount;i++){
        var b = document.createElement('button');
        b.type = 'button';
        b.className = 'dot-btn' + (i===0 ? ' is-active' : '');
        b.setAttribute('aria-label', 'Go to testimonial page ' + (i+1));
        b.addEventListener('click', function(idx){ return function(){ userJump(idx); }; }(i));
        dotsWrap.appendChild(b);
      }
      if(window.__bindHoverables){ window.__bindHoverables(); }
    }

    function updateDots(){
      var active = ((page % pageCount) + pageCount) % pageCount;
      Array.prototype.forEach.call(dotsWrap.children, function(d,i){
        d.classList.toggle('is-active', i===active);
      });
    }

    function render(animate){
      var cardWidth = realCards[0].getBoundingClientRect().width;
      var step = cardWidth + GAP;
      var baseOffset = realCount * step; // width of the leading clone set
      var offset = baseOffset + page * perView * step;
      track.style.transition = animate === false ? 'none' : '';
      track.style.transform = 'translateX(-' + offset + 'px)';
      if(animate === false){ track.getBoundingClientRect(); track.style.transition = ''; }
    }

    function settleIfNeeded(){
      if(snapTimer){ clearTimeout(snapTimer); snapTimer = null; }
      if(page >= pageCount || page < 0){
        snapTimer = setTimeout(function(){
          page = ((page % pageCount) + pageCount) % pageCount;
          render(false);
        }, TRANSITION_MS);
      }
    }

    function next(){
      page += 1;
      render(true);
      updateDots();
      settleIfNeeded();
    }
    function prev(){
      page -= 1;
      render(true);
      updateDots();
      settleIfNeeded();
    }
    function userJump(target){
      page = target;
      render(true);
      updateDots();
      restartAutoplay();
    }

    function startAutoplay(){
      if(reduceMotion) return;
      stopAutoplay();
      autoTimer = setInterval(next, 5000);
    }
    function stopAutoplay(){
      if(autoTimer){ clearInterval(autoTimer); autoTimer = null; }
    }
    function restartAutoplay(){ startAutoplay(); }

    prevBtn.addEventListener('click', function(){ prev(); restartAutoplay(); });
    nextBtn.addEventListener('click', function(){ next(); restartAutoplay(); });

    if(wrap){
      wrap.addEventListener('mouseenter', stopAutoplay);
      wrap.addEventListener('mouseleave', startAutoplay);
      wrap.addEventListener('focusin', stopAutoplay);
      wrap.addEventListener('focusout', startAutoplay);
    }

    window.addEventListener('resize', function(){
      var newPerView = window.matchMedia('(max-width: 700px)').matches ? 1 : 2;
      if(newPerView !== perView){
        perView = newPerView;
        pageCount = Math.ceil(realCount / perView);
        page = 0;
        buildDots();
      }
      render(false);
      updateDots();
    });

    buildDots();
    render(false);
    startAutoplay();
  }

  /* contact form — posts to contact.php (see that file for setup notes) */
  var form = document.getElementById('contactForm');
  if(form){
    var successMsg = document.getElementById('formSuccess');
    var errorMsg = document.getElementById('formError');
    var submitBtn = form.querySelector('.form-submit');

    form.addEventListener('submit', function(e){
      e.preventDefault();
      if(!form.checkValidity()){
        form.reportValidity();
        return;
      }
      successMsg.hidden = true;
      errorMsg.hidden = true;
      submitBtn.disabled = true;
      var originalLabel = submitBtn.textContent;
      submitBtn.textContent = 'Sending…';

      fetch(form.action, {
        method: 'POST',
        body: new FormData(form),
        headers: { 'Accept': 'application/json' }
      })
        .then(function(res){ return res.json().catch(function(){ return { ok:false }; }); })
        .then(function(data){
          if(data && data.ok){
            successMsg.hidden = false;
            form.reset();
          } else {
            errorMsg.textContent = (data && data.error) || 'Something went wrong sending your message. Please try again or email me directly.';
            errorMsg.hidden = false;
          }
        })
        .catch(function(){
          errorMsg.textContent = 'Could not reach the server. Please email me directly instead.';
          errorMsg.hidden = false;
        })
        .finally(function(){
          submitBtn.disabled = false;
          submitBtn.textContent = originalLabel;
        });
    });
  }
})();
