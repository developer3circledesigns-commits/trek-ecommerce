(function () {
  'use strict';

  const APP = {
    cart: JSON.parse(localStorage.getItem('trekCart')) || [],
    wishlist: JSON.parse(localStorage.getItem('trekWishlist')) || [],
    newsletterSubs: JSON.parse(localStorage.getItem('trekNewsletter')) || [],
    orders: JSON.parse(localStorage.getItem('trekOrders')) || [],
    heroInterval: null,
    heroIndex: 0,
  };

  function qs(s, ctx) { return (ctx || document).querySelector(s); }
  function qsa(s, ctx) { return (ctx || document).querySelectorAll(s); }

  APP.saveCart = function () {
    localStorage.setItem('trekCart', JSON.stringify(APP.cart));
    updateBadge();
  };

  APP.saveWishlist = function () {
    localStorage.setItem('trekWishlist', JSON.stringify(APP.wishlist));
  };

  function updateBadge() {
    const count = APP.cart.reduce((a, b) => a + b.qty, 0);
    qsa('.badge-count').forEach(function (el) {
      el.textContent = count;
    });
  }

  function toast(msg, type) {
    var t = document.getElementById('toast-msg');
    if (!t) {
      t = document.createElement('div');
      t.id = 'toast-msg';
      t.style.cssText = 'position:fixed;bottom:80px;right:20px;background:#111;color:#fff;padding:12px 20px;border-radius:8px;font-size:.85rem;z-index:9999;opacity:0;transition:opacity .3s;max-width:320px';
      document.body.appendChild(t);
    }
    t.textContent = msg;
    t.style.background = type === 'error' ? '#c62828' : type === 'warning' ? '#f5a623' : '#111';
    t.style.opacity = '1';
    setTimeout(function () { t.style.opacity = '0'; }, 2500);
  }

  function initSearch() {
    qsa('.searchbar input, .searchbar-lg input').forEach(function (input) {
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && this.value.trim()) {
          toast('Searching for "' + this.value.trim() + '"...');
        }
      });
      var btn = input.parentElement.querySelector('button');
      if (btn) {
        btn.addEventListener('click', function () {
          if (input.value.trim()) {
            toast('Searching for "' + input.value.trim() + '"...');
          }
        });
      }
    });
  }

  function initHeartToggle() {
    qsa('.fav, .icon-btn .bi-heart').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.stopPropagation();
        var icon = this.classList.contains('bi-heart') ? this : this.querySelector('.bi-heart, .bi-heart-fill');
        if (!icon) {
          icon = this;
          if (icon.tagName === 'BUTTON') {
            icon = icon.querySelector('i') || icon;
          }
        }
        var isFill = icon.classList.contains('bi-heart-fill');
        icon.className = isFill ? 'bi bi-heart' : 'bi bi-heart-fill';
        var card = this.closest('.product-card');
        var name = card ? (qs('.p-name', card) || {}).textContent : 'Item';
        if (!isFill) {
          if (!APP.wishlist.includes(name)) APP.wishlist.push(name);
          toast('Added "' + name.trim() + '" to wishlist');
        } else {
          APP.wishlist = APP.wishlist.filter(function (n) { return n !== name; });
          toast('Removed "' + name.trim() + '" from wishlist');
        }
        APP.saveWishlist();
      });
    });
  }

  function initAddToCart() {
    qsa('.cart-btn, .btn-brand .bi-bag, .pd-add-cart').forEach(function (el) {
      el.addEventListener('click', function (e) {
        e.preventDefault();
        e.stopPropagation();
        var card = this.closest('.product-card');
        if (!card) {
          toast('Added to cart!');
          APP.cart.push({ name: 'Product', qty: 1, price: 0 });
          APP.saveCart();
          return;
        }
        var name = (qs('.p-name', card) || {}).textContent || 'Product';
        var priceText = (qs('.p-price', card) || {}).textContent || '0';
        var price = parseFloat(priceText.replace(/[₹,]/g, '')) || 0;
        var code = (qs('.p-code', card) || {}).textContent || '';
        var existing = APP.cart.find(function (item) { return item.code === code; });
        if (existing) {
          existing.qty += 1;
        } else {
          APP.cart.push({ name: name.trim(), code: code, price: price, qty: 1 });
        }
        APP.saveCart();
        toast('Added "' + name.trim() + '" to cart');
        animateCartIcon();
      });
    });

    var addToCartBtn = qs('.btn-brand .bi-bag') ? qs('.btn-brand .bi-bag').closest('.btn-brand') : null;
    if (!addToCartBtn) addToCartBtn = qs('.btn-brand.w-100');
    if (addToCartBtn && !addToCartBtn.classList.contains('initialized')) {
      addToCartBtn.classList.add('initialized');
      addToCartBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var qtyInput = qs('.qty input');
        var qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        var name = (qs('.pd-title') || {}).textContent || 'Product';
        var priceText = (qs('.pd-price') || {}).textContent || '0';
        var price = parseFloat(priceText.replace(/[₹,]/g, '')) || 0;
        var code = (qs('.pd-code') || {}).textContent || '';
        var existing = APP.cart.find(function (item) { return item.code === code; });
        if (existing) {
          existing.qty += qty;
        } else {
          APP.cart.push({ name: name.trim(), code: code, price: price, qty: qty });
        }
        APP.saveCart();
        toast('Added ' + qty + 'x "' + name.trim() + '" to cart');
        animateCartIcon();
      });
    }

    var buyNowBtn = qs('.btn-outline-brand.w-100');
    if (buyNowBtn && !buyNowBtn.classList.contains('initialized')) {
      buyNowBtn.classList.add('initialized');
      buyNowBtn.addEventListener('click', function (e) {
        e.preventDefault();
        var qtyInput = qs('.qty input');
        var qty = qtyInput ? parseInt(qtyInput.value) || 1 : 1;
        toast('Proceeding to checkout with ' + qty + ' item(s)...');
        setTimeout(function () {
          toast('Redirecting to checkout page...');
        }, 1000);
      });
    }
  }

  function animateCartIcon() {
    var bag = qs('.icon-btn .bi-bag');
    if (bag) {
      bag.style.transition = 'transform .2s';
      bag.style.transform = 'scale(1.3)';
      setTimeout(function () { bag.style.transform = 'scale(1)'; }, 200);
    }
  }

  function initHeroSlider() {
    var heroArrows = qsa('.hero-arrow, .hero .slider-arrow');
    var dots = qsa('.hero-dots span');
    if (!heroArrows.length && !dots.length) return;

    var slides = [
      { h1: 'EXPLORE<br/>TAMIL NADU', p: 'Gear Up for Your Next Adventure', bg: 'https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1600&q=80' },
      { h1: 'CONQUER<br/>THE WILD', p: 'Premium Trekking Gear for Every Trail', bg: 'https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=1600' },
      { h1: 'TREK<br/>TAMIL NADU', p: 'Explore the Unexplored with Confidence', bg: 'https://images.unsplash.com/photo-1533105079780-92b9be482077?w=1600' },
      { h1: 'ADVENTURE<br/>AWAITS', p: 'Shop the Latest Collection Now', bg: 'https://images.unsplash.com/photo-1553062407-98eeb64c6a62?w=1600' },
    ];

    var hero = qs('.hero');
    if (!hero) return;

    function showSlide(idx) {
      APP.heroIndex = ((idx % slides.length) + slides.length) % slides.length;
      var s = slides[APP.heroIndex];
      hero.style.backgroundImage = 'url(' + s.bg + ')';
      var h1 = qs('.hero h1');
      var p = qs('.hero p');
      if (h1) h1.innerHTML = s.h1;
      if (p) p.textContent = s.p;
      qsa('.hero-dots span').forEach(function (dot, i) {
        dot.classList.toggle('active', i === APP.heroIndex);
      });
    }

    function nextSlide() { showSlide(APP.heroIndex + 1); }
    function prevSlide() { showSlide(APP.heroIndex - 1); }

    heroArrows.forEach(function (arrow) {
      arrow.addEventListener('click', function (e) {
        e.preventDefault();
        clearInterval(APP.heroInterval);
        if (this.classList.contains('left')) prevSlide();
        else nextSlide();
        APP.heroInterval = setInterval(nextSlide, 5000);
      });
    });

    dots.forEach(function (dot, i) {
      dot.addEventListener('click', function () {
        clearInterval(APP.heroInterval);
        showSlide(i);
        APP.heroInterval = setInterval(nextSlide, 5000);
      });
    });

    APP.heroInterval = setInterval(nextSlide, 5000);
  }

  function initProductSliders() {
    qsa('.slider-wrap').forEach(function (wrap) {
      var left = qs('.slider-arrow.left', wrap);
      var right = qs('.slider-arrow.right', wrap);
      var row = qs('.row', wrap);
      if (!row) return;
      var scrollAmt = 250;
      if (left) {
        left.addEventListener('click', function (e) {
          e.preventDefault();
          row.scrollBy({ left: -scrollAmt, behavior: 'smooth' });
        });
      }
      if (right) {
        right.addEventListener('click', function (e) {
          e.preventDefault();
          row.scrollBy({ left: scrollAmt, behavior: 'smooth' });
        });
      }
    });
  }

  function initNewsletter() {
    qsa('.newsletter input[type="email"]').forEach(function (input) {
      var btn = input.parentElement.querySelector('.btn-brand');
      if (btn) {
        btn.addEventListener('click', function (e) {
          e.preventDefault();
          var email = input.value.trim();
          if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
            toast('Please enter a valid email address', 'warning');
            return;
          }
          if (APP.newsletterSubs.includes(email)) {
            toast('You are already subscribed!', 'warning');
            return;
          }
          APP.newsletterSubs.push(email);
          localStorage.setItem('trekNewsletter', JSON.stringify(APP.newsletterSubs));
          toast('Subscribed successfully! Thank you.');
          input.value = '';
        });
      }
      input.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          var btn = this.parentElement.querySelector('.btn-brand');
          if (btn) btn.click();
        }
      });
    });
  }

  function initChatBubble() {
    qsa('.chatbubble, .chatbox').forEach(function (bubble) {
      bubble.addEventListener('click', function (e) {
        e.preventDefault();
        toast('TrekBot: Hi! How can I help you today?');
      });
    });
  }

  function initImageGallery() {
    var thumbs = qsa('.pd-thumbs img');
    var main = qs('.pd-main img');
    if (!thumbs.length || !main) return;

    thumbs.forEach(function (thumb) {
      thumb.addEventListener('click', function () {
        qsa('.pd-thumbs img').forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        main.src = this.src.replace('w=200', 'w=800');
      });
    });

    main.parentElement.addEventListener('mousemove', function (e) {
      var rect = this.getBoundingClientRect();
      var x = ((e.clientX - rect.left) / rect.width) * 100;
      var y = ((e.clientY - rect.top) / rect.height) * 100;
      main.style.transformOrigin = x + '% ' + y + '%';
      main.style.transform = 'scale(1.5)';
    });

    main.parentElement.addEventListener('mouseleave', function () {
      main.style.transform = 'scale(1)';
    });
  }

  function initColorSwatches() {
    qsa('.swatch').forEach(function (swatch) {
      swatch.addEventListener('click', function () {
        var parent = this.parentElement;
        qsa('.swatch', parent).forEach(function (s) { s.classList.remove('active'); });
        this.classList.add('active');
        if (parent) {
          var strong = qs('strong', parent);
          if (strong) {
            strong.textContent = this.title || this.style.backgroundColor || 'Selected';
          }
        }
      });
    });
  }

  function initQtySelector() {
    qsa('.qty').forEach(function (qty) {
      var btns = qsa('button', qty);
      var input = qs('input', qty);
      if (!input) return;
      if (btns.length >= 2) {
        btns[0].addEventListener('click', function () {
          var val = parseInt(input.value) || 1;
          if (val > 1) input.value = val - 1;
        });
        btns[1].addEventListener('click', function () {
          var val = parseInt(input.value) || 1;
          input.value = val + 1;
        });
      }
      input.addEventListener('change', function () {
        var val = parseInt(this.value) || 1;
        if (val < 1) this.value = 1;
      });
    });
  }

  function initProductTabs() {
    var tabs = qsa('.pd-tabs .tab');
    var contents = qsa('.row.g-4');
    if (!tabs.length) return;

    tabs.forEach(function (tab, idx) {
      tab.addEventListener('click', function () {
        qsa('.pd-tabs .tab').forEach(function (t) { t.classList.remove('active'); });
        this.classList.add('active');
        toast('Switched to: ' + this.textContent.trim().split('(')[0].trim());
      });
    });
  }

  function initShareButton() {
    qsa('.icon-btn .bi-share').forEach(function (share) {
      var btn = share.closest('.icon-btn') || share.parentElement;
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        if (navigator.share) {
          navigator.share({ title: document.title, url: window.location.href }).catch(function () {});
        } else {
          navigator.clipboard.writeText(window.location.href).then(function () {
            toast('Link copied to clipboard!');
          }).catch(function () {
            toast('Share: ' + window.location.href);
          });
        }
      });
    });
  }

  function initAdminSidebar() {
    var sidebarLinks = qsa('.sidebar a:not(.logout a)');
    sidebarLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        qsa('.sidebar a').forEach(function (a) { a.classList.remove('active'); });
        this.classList.add('active');
        var chev = this.querySelector('.chev');
        if (chev) {
          chev.style.transition = 'transform .2s';
          chev.style.transform = chev.style.transform === 'rotate(180deg)' ? 'rotate(0deg)' : 'rotate(180deg)';
        }
        var sectionText = this.textContent.trim().split('▾')[0].trim().split('\n')[0].trim();
        var pageTitle = qs('.page-head h4');
        var crumb = qs('.crumb');
        if (pageTitle) pageTitle.textContent = sectionText || 'Dashboard';
        if (crumb) crumb.textContent = 'Home / ' + (sectionText || 'Dashboard');
      });
    });

    var hamburger = qs('.topbar-adm .ic-btn .bi-list');
    if (hamburger) {
      var hamBtn = hamburger.closest('.ic-btn') || hamburger.parentElement;
      hamBtn.addEventListener('click', function () {
        var sidebar = qs('.sidebar');
        if (sidebar) {
          var isVisible = sidebar.style.display !== 'none';
          sidebar.style.display = isVisible ? 'none' : 'flex';
          var main = qs('.main');
          if (main) main.style.marginLeft = isVisible ? '0' : '240px';
        }
      });
    }
  }

  function initAdminSearch() {
    var searchInput = qs('.topbar-adm .search input');
    if (!searchInput) return;
    searchInput.addEventListener('input', function () {
      var query = this.value.trim().toLowerCase();
      if (!query) return;
      var rows = qsa('.order-row, .low-item, .table-mini tbody tr');
      var matchCount = 0;
      rows.forEach(function (row) {
        var text = row.textContent.toLowerCase();
        if (text.includes(query)) {
          row.style.display = '';
          matchCount++;
        } else {
          row.style.display = 'none';
        }
      });
      if (query.length > 2) {
        toast('Found ' + matchCount + ' matching result(s)');
      }
    });
  }

  function initAdminNotifications() {
    var bell = qs('.topbar-adm .ic-btn .bi-bell');
    if (bell) {
      var bellBtn = bell.closest('.ic-btn') || bell.parentElement;
      bellBtn.addEventListener('click', function () {
        var badge = this.querySelector('.b');
        if (badge) {
          var count = parseInt(badge.textContent);
          if (count > 0) {
            badge.textContent = '0';
            toast('All notifications marked as read');
          }
        }
      });
    }

    var chatBtn = qs('.topbar-adm .ic-btn.chat');
    if (chatBtn) {
      chatBtn.addEventListener('click', function () {
        var badge = this.querySelector('.b');
        if (badge) {
          var count = parseInt(badge.textContent);
          if (count > 0) {
            badge.textContent = '0';
            toast('All messages marked as read');
          }
        }
      });
    }
  }

  function initAdminFullscreen() {
    var fsBtn = qs('.topbar-adm .ic-btn .bi-arrows-fullscreen');
    if (fsBtn) {
      var btn = fsBtn.closest('.ic-btn') || fsBtn.parentElement;
      btn.addEventListener('click', function () {
        if (!document.fullscreenElement) {
          document.documentElement.requestFullscreen().catch(function () {});
          fsBtn.className = 'bi bi-fullscreen-exit';
        } else {
          if (document.exitFullscreen) {
            document.exitFullscreen();
            fsBtn.className = 'bi bi-arrows-fullscreen';
          }
        }
      });
    }
  }

  function initAdminDatePill() {
    var datePill = qs('.date-pill');
    if (datePill) {
      datePill.addEventListener('click', function () {
        var now = new Date();
        var end = now.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        var start = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        var startStr = start.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
        this.innerHTML = '<i class="bi bi-calendar"></i> ' + startStr + ' - ' + end;
        toast('Date range updated to last 7 days');
      });
    }
  }

  function initAdminPillDropdown() {
    qsa('.pill-dropdown').forEach(function (pill) {
      pill.addEventListener('click', function () {
        var options = ['7 Days', '30 Days', '90 Days', 'This Year'];
        var current = this.textContent.trim().replace('▾', '').trim();
        var idx = options.indexOf(current);
        var next = options[(idx + 1) % options.length];
        this.innerHTML = next + ' ▾';
        toast('Switched to ' + next);
      });
    });
  }

  function initAdminTableSorting() {
    qsa('.table-mini th').forEach(function (th, colIdx) {
      th.style.cursor = 'pointer';
      th.addEventListener('click', function () {
        var tbody = this.closest('table').querySelector('tbody');
        var rows = Array.from(tbody.querySelectorAll('tr'));
        var asc = this._sortAsc !== true;
        this._sortAsc = asc;
        qsa('.table-mini th').forEach(function (h) {
          if (h !== th) h._sortAsc = null;
        });
        rows.sort(function (a, b) {
          var aVal = a.cells[colIdx] ? a.cells[colIdx].textContent.trim() : '';
          var bVal = b.cells[colIdx] ? b.cells[colIdx].textContent.trim() : '';
          var aNum = parseFloat(aVal.replace(/[₹,]/g, ''));
          var bNum = parseFloat(bVal.replace(/[₹,]/g, ''));
          if (!isNaN(aNum) && !isNaN(bNum)) {
            return asc ? aNum - bNum : bNum - aNum;
          }
          return asc ? aVal.localeCompare(bVal) : bVal.localeCompare(aVal);
        });
        rows.forEach(function (row) { tbody.appendChild(row); });
      });
    });
  }

  function initAdminLogout() {
    var logoutLink = qs('.logout a');
    if (logoutLink) {
      logoutLink.addEventListener('click', function (e) {
        e.preventDefault();
        toast('Logging out...');
        setTimeout(function () {
          toast('You have been logged out.');
          window.location.href = 'index.html';
        }, 1500);
      });
    }
  }

  function initCategoryClick() {
    qsa('.cat-item').forEach(function (cat) {
      cat.addEventListener('click', function () {
        var name = (qs('p', this) || {}).textContent || 'Category';
        toast('Browsing: ' + name + ' collection');
      });
    });
  }

  function initPromoClicks() {
    qsa('.promo .btn-brand').forEach(function (btn) {
      btn.addEventListener('click', function (e) {
        e.preventDefault();
        var promo = this.closest('.promo');
        var title = promo ? (qs('h3', promo) || {}).textContent : 'Promo';
        toast('Exploring: ' + title.trim());
      });
    });
  }

  function initNavActiveState() {
    var currentPage = window.location.pathname.split('/').pop() || 'index.html';
    qsa('.nav-link').forEach(function (link) {
      var href = link.getAttribute('href');
      if (href === currentPage || (currentPage === '' && href === 'index.html')) {
        link.classList.add('active');
      }
      if (currentPage === 'admin.html' && href === 'admin.html') {
        link.classList.add('active');
      }
    });
  }

  function initFooterLinks() {
    qsa('.footer a[href="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var text = this.textContent.trim() || 'Page';
        toast('Navigating to: ' + text + '...');
      });
    });
  }

  function initHeroSectionCta() {
    var heroCta = qs('.hero .btn-brand');
    if (heroCta) {
      heroCta.addEventListener('click', function (e) {
        e.preventDefault();
        toast('Opening shop collection...');
        qs('.section-title') && qs('.section-title').scrollIntoView({ behavior: 'smooth' });
      });
    }
  }

  function initViewAllLinks() {
    qsa('a.text-brand.small').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        toast('Viewing all: ' + (this.textContent.trim() || 'items'));
      });
    });
  }

  function initFeaturedProductHover() {
    qsa('.product-card').forEach(function (card) {
      card.addEventListener('mouseenter', function () {
        this.style.transition = 'box-shadow .2s, transform .2s';
        this.style.boxShadow = '0 8px 24px rgba(0,0,0,.1)';
        this.style.transform = 'translateY(-2px)';
      });
      card.addEventListener('mouseleave', function () {
        this.style.boxShadow = 'none';
        this.style.transform = 'translateY(0)';
      });
    });
  }

  function initTrackOrderLink() {
    qsa('.topbar a[href="#"]').forEach(function (link) {
      if (link.textContent.trim() === 'Track Order') {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          toast('Track Order: Enter your Order ID to track');
        });
      }
      if (link.textContent.trim() === 'Help & Support') {
        link.addEventListener('click', function (e) {
          e.preventDefault();
          toast('Help & Support: Contact us at support@trektamilnadu.com');
        });
      }
    });
  }

  function initIconButtons() {
    qsa('.icon-btn:not(.initialized)').forEach(function (btn) {
      btn.classList.add('initialized');
      if (btn.querySelector('.bi-person')) {
        btn.addEventListener('click', function () {
          toast('Account page coming soon');
        });
      }
      if (btn.querySelector('.bi-heart, .bi-heart-fill') && !btn.closest('.product-card')) {
        btn.addEventListener('click', function () {
          toast('Wishlist: ' + APP.wishlist.length + ' item(s)');
        });
      }
      if (btn.querySelector('.bi-bag')) {
        var totalItems = APP.cart.reduce(function (a, b) { return a + b.qty; }, 0);
        var totalPrice = APP.cart.reduce(function (a, b) { return a + b.price * b.qty; }, 0);
        btn.addEventListener('click', function () {
          if (totalItems === 0) {
            toast('Your cart is empty');
          } else {
            toast('Cart: ' + totalItems + ' item(s) - ₹' + totalPrice.toLocaleString('en-IN'));
          }
        });
      }
    });
  }

  function initAdminUserDropdown() {
    var avatarArea = qs('.topbar-adm .avatar');
    if (avatarArea) {
      var parent = avatarArea.closest('.d-flex');
      if (parent) {
        parent.style.cursor = 'pointer';
        parent.addEventListener('click', function () {
          toast('Admin Profile: Super Admin');
        });
      }
    }
  }

  function initProductViewAll() {
    qsa('.fw-bold a[href="#"]').forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        toast('Viewing all products');
      });
    });
  }

  function initAdminMiniStats() {
    qsa('.mini-stat').forEach(function (stat) {
      stat.addEventListener('click', function () {
        var label = (qs('.lbl', this) || {}).textContent || 'Stat';
        toast('Viewing detailed report for: ' + label);
      });
    });
  }

  function initAdminStatCards() {
    qsa('.stat').forEach(function (stat) {
      stat.style.cursor = 'pointer';
      stat.addEventListener('click', function () {
        var title = (qs('h6', this) || {}).textContent || 'Metric';
        toast('Viewing details: ' + title);
      });
    });
  }

  function initAdminChartBars() {
    qsa('.bars .g').forEach(function (group) {
      group.addEventListener('mouseenter', function () {
        var bars = qsa('span', this);
        bars.forEach(function (bar) {
          bar.style.opacity = '0.7';
        });
      });
      group.addEventListener('mouseleave', function () {
        var bars = qsa('span', this);
        bars.forEach(function (bar) {
          bar.style.opacity = '1';
        });
      });
    });
  }

  function initAdminPagination() {
    var viewAllLinks = qsa('.card-adm .text-brand.small');
    viewAllLinks.forEach(function (link) {
      link.addEventListener('click', function (e) {
        e.preventDefault();
        var parentCard = this.closest('.card-adm');
        var title = parentCard ? (qs('h6', parentCard) || {}).textContent || 'items' : 'items';
        toast('Loading all ' + title.toLowerCase() + '...');
      });
    });
  }

  function initCartDrawer() {
    if (qs('.cart-drawer')) return;
    var drawer = document.createElement('div');
    drawer.className = 'cart-drawer';
    drawer.style.cssText = 'position:fixed;top:0;right:-400px;width:380px;height:100%;background:#fff;z-index:9999;box-shadow:-4px 0 24px rgba(0,0,0,.15);transition:right .3s;display:flex;flex-direction:column;max-width:100%';
    drawer.innerHTML = '<div style="display:flex;justify-content:space-between;align-items:center;padding:16px 20px;border-bottom:1px solid #eee"><h5 style="margin:0;font-weight:700">Shopping Cart</h5><button id="cart-close" style="background:none;border:0;font-size:1.5rem;cursor:pointer">&times;</button></div><div id="cart-items" style="flex:1;overflow-y:auto;padding:16px 20px"></div><div id="cart-footer" style="padding:16px 20px;border-top:1px solid #eee"></div>';
    document.body.appendChild(drawer);

    var overlay = document.createElement('div');
    overlay.id = 'cart-overlay';
    overlay.style.cssText = 'position:fixed;inset:0;background:rgba(0,0,0,.3);z-index:9998;display:none';
    document.body.appendChild(overlay);

    function renderCart() {
      var container = document.getElementById('cart-items');
      var footer = document.getElementById('cart-footer');
      if (!container || !footer) return;
      if (APP.cart.length === 0) {
        container.innerHTML = '<div style="text-align:center;padding:40px 0;color:#888"><i class="bi bi-bag" style="font-size:3rem;display:block;margin-bottom:12px"></i>Your cart is empty</div>';
        footer.innerHTML = '';
        return;
      }
      var html = '';
      var total = 0;
      APP.cart.forEach(function (item, idx) {
        var itemTotal = item.price * item.qty;
        total += itemTotal;
        html += '<div style="display:flex;gap:12px;align-items:center;padding:12px 0;border-bottom:1px solid #f2f2f2"><div style="flex:1"><div style="font-weight:600;font-size:.9rem">' + item.name + '</div><div style="font-size:.8rem;color:#888">₹' + item.price.toLocaleString('en-IN') + ' x ' + item.qty + '</div></div><div style="font-weight:700">₹' + itemTotal.toLocaleString('en-IN') + '</div><button class="cart-remove" data-idx="' + idx + '" style="background:none;border:0;color:#c62828;cursor:pointer">&times;</button></div>';
      });
      container.innerHTML = html;
      footer.innerHTML = '<div style="display:flex;justify-content:space-between;font-weight:700;font-size:1.1rem;margin-bottom:12px"><span>Total</span><span>₹' + total.toLocaleString('en-IN') + '</span></div><button id="checkout-btn" class="btn btn-brand w-100">Checkout</button>';

      qsa('.cart-remove').forEach(function (btn) {
        btn.addEventListener('click', function () {
          var idx = parseInt(this.dataset.idx);
          APP.cart.splice(idx, 1);
          APP.saveCart();
          renderCart();
          updateBadge();
          if (APP.cart.length === 0) toast('Cart is now empty');
          else toast('Item removed from cart');
        });
      });

      var checkoutBtn = document.getElementById('checkout-btn');
      if (checkoutBtn) {
        checkoutBtn.addEventListener('click', function () {
          toast('Proceeding to checkout with ' + APP.cart.length + ' item(s)');
          APP.cart = [];
          APP.saveCart();
          renderCart();
          updateBadge();
          closeCart();
        });
      }
    }

    function openCart() {
      renderCart();
      drawer.style.right = '0';
      overlay.style.display = 'block';
      document.body.style.overflow = 'hidden';
    }

    function closeCart() {
      drawer.style.right = '-400px';
      overlay.style.display = 'none';
      document.body.style.overflow = '';
    }

    document.getElementById('cart-close').addEventListener('click', closeCart);
    overlay.addEventListener('click', closeCart);

    qsa('.icon-btn .bi-bag').forEach(function (bag) {
      var btn = bag.closest('.icon-btn');
      if (btn && !btn._cartInit) {
        btn._cartInit = true;
        btn.addEventListener('click', function (e) {
          if (!bag.closest('.product-card')) {
            openCart();
          }
        });
      }
    });
  }

  function init() {
    updateBadge();
    initSearch();
    initHeartToggle();
    initAddToCart();
    initHeroSlider();
    initProductSliders();
    initNewsletter();
    initChatBubble();
    initImageGallery();
    initColorSwatches();
    initQtySelector();
    initProductTabs();
    initShareButton();
    initAdminSidebar();
    initAdminSearch();
    initAdminNotifications();
    initAdminFullscreen();
    initAdminDatePill();
    initAdminPillDropdown();
    initAdminTableSorting();
    initAdminLogout();
    initCategoryClick();
    initPromoClicks();
    initNavActiveState();
    initFooterLinks();
    initHeroSectionCta();
    initViewAllLinks();
    initFeaturedProductHover();
    initTrackOrderLink();
    initIconButtons();
    initAdminUserDropdown();
    initProductViewAll();
    initAdminMiniStats();
    initAdminStatCards();
    initAdminChartBars();
    initAdminPagination();
    initCartDrawer();
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();
