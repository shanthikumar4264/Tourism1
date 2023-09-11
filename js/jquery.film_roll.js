

(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  this.FilmRoll = (function() {
    function FilmRoll(options) {
      this.options = options != null ? options : {};
      this.rotateRight = __bind(this.rotateRight, this);
      this.rotateLeft = __bind(this.rotateLeft, this);
      this.moveRight = __bind(this.moveRight, this);
      this.moveLeft = __bind(this.moveLeft, this);
      this.clearScroll = __bind(this.clearScroll, this);
      this.configureScroll = __bind(this.configureScroll, this);
      this.configureWidths = __bind(this.configureWidths, this);
      this.configureHover = __bind(this.configureHover, this);
      if (this.options.container) {
        this.div = jQuery(this.options.container);
        if (this.div.length) {
          this.configure();
        }
      }
    }

    FilmRoll.prototype.configure = function() {
      var first_child, shuttle_width,
        _this = this;
      this.children = this.div.children();
      this.children.wrapAll('<div class="film_roll_wrapper"></div>');
      this.children.wrapAll('<div class="film_roll_shuttle"></div>');
      this.wrapper = this.div.find('.film_roll_wrapper');
      this.shuttle = this.div.find('.film_roll_shuttle');
      this.rotation = [];
      shuttle_width = this.options.shuttle_width ? parseInt(this.options.shuttle_width, 10) : 10000;
      this.shuttle.width(shuttle_width);
      this.height = this.options.height ? parseInt(this.options.height, 10) : 0;
      this.wrapper.height(this.height);
      this.shuttle.height(this.height);
      if (!(this.options.no_css === true || document.film_roll_styles_added)) {
        jQuery("<style type='text/css'>        .film_roll_wrapper {display: block; text-align: center; float: none; position: relative; top: auto; right: auto; bottom: auto; left: auto; z-index: auto; width: 100%; margin: 0 !important; padding: 0 !important; overflow: hidden; width: 100%}        .film_roll_shuttle {text-align: left; float: none; position: absolute; top: 0; left:0; right: auto; bottom: auto; margin: 0 !important; padding: 0 !important; z-index: auto}        .film_roll_prev, .film_roll_next {position:absolute; top:48%; left:15px; width:40px; height:40px; margin:-20px 0 0 0; padding:0; font-size:60px; font-weight:100; line-height:30px; color:white; text-align: center; background: #222; border: 3px solid white; border-radius:23px; opacity:0.5}        .film_roll_prev:hover, .film_roll_next:hover {color:white; text-decoration:none; opacity:0.9}        .film_roll_next {left:auto; right:15px}        .film_roll_pager {text-align:center}        .film_roll_pager a {width:10px; height:10px; border:2px solid #333; border-radius:10px; display:inline-block; margin:0 5px 0 0; transition: all 1s ease}        .film_roll_pager a:hover {background: #666}        .film_roll_pager a.active {background: #333}        .film_roll_pager span {display:none}      </style>").appendTo('head');
        document.film_roll_styles_added = true;
      }
      if (this.options.pager !== false) {
        this.pager = jQuery('<div class="film_roll_pager">');
        this.div.append(this.pager);
        this.children.each(function(i, e) {
          var link;
          link = jQuery("<a href='#' data-id='" + e.id + "'><span>" + (i + 1) + "</span></a>");
          _this.pager.append(link);
          return link.click(function() {
            var direction, rotation_index;
            _this.index = i;
            rotation_index = jQuery.inArray(_this.children[i], _this.rotation);
            direction = rotation_index < (_this.children.length / 2) ? 'right' : 'left';
            _this.moveToIndex(_this.index, direction, true);
            return false;
          });
        });
      }
      this.pager_links = this.div.find('.film_roll_pager a');
      this.mouse_catcher = jQuery('<div style="position:absolute; top:0; left: 0; height: 100%; width: 100%;" class="film_roll_mouse_catcher"></div>');
      this.mouse_catcher.appendTo(this.wrapper).mousemove(function(event) {
        _this.clearScroll();
        return _this.mouse_catcher.remove();
      });
      first_child = null;
      this.children.each(function(i, e) {
        var $el;
        $el = jQuery(e);
        $el.attr('style', 'position:relative; display:inline-block; vertical-align:middle');
        $el.attr('data-film-roll-child-id', i);
        $el.addClass("film_roll_child");
        return _this.rotation.push(e);
      });
      if (this.options.prev && this.options.next) {
        this.prev = jQuery(this.options.prev);
        this.next = jQuery(this.options.next);
      } else {
        this.wrapper.append('<a class="film_roll_prev" href="#">&lsaquo;</a>');
        this.wrapper.append('<a class="film_roll_next" href="#">&rsaquo;</a>');
        this.prev = this.div.find('.film_roll_prev');
        this.next = this.div.find('.film_roll_next');
      }
      this.prev.click(function() {
        _this.clearScroll();
        return _this.moveRight();
      });
      this.next.click(function() {
        _this.clearScroll();
        return _this.moveLeft();
      });
      this.index = this.options.start_index || 0;
      this.interval = this.options.interval || 4000;
      this.animation = this.options.animation || this.interval / 4;
      jQuery(window).resize(function() {
        return _this.resize();
      });
      jQuery(window).load(function() {
        _this.configureWidths();
        _this.moveToIndex(_this.index, 'right', true);
        if (_this.options.scroll !== false) {
          _this.configureScroll();
          return _this.configureHover();
        }
      });
      this.div.trigger(jQuery.Event("film_roll:dom_ready"));
      return this;
    };

    FilmRoll.prototype.configureHover = function() {
      this.div.hover(this.clearScroll, this.configureScroll);
      if (this.options.prev && this.options.next) {
        this.prev.hover(this.clearScroll, this.configureScroll);
        return this.next.hover(this.clearScroll, this.configureScroll);
      }
    };

    FilmRoll.prototype.configureWidths = function() {
      var max_el_height,
        _this = this;
      this.div.trigger(jQuery.Event("film_roll:before_loaded"));
      this.width = max_el_height = 0;
      this.children.each(function(i, e) {
        var $el, el_height;
        $el = jQuery(e);
        _this.width += $el.outerWidth(true);
        el_height = $el.outerHeight(true);
        if (el_height > max_el_height) {
          return max_el_height = el_height;
        }
      });
      if (!this.options.height) {
        this.height = max_el_height;
      }
      this.wrapper.height(this.height);
      this.shuttle.height(this.height);
      this.real_width = this.width;
      this.shuttle.width(this.real_width * 2);
      return this;
    };

    FilmRoll.prototype.configureScroll = function() {
      var _this = this;
      if (this.scrolled !== true) {
        this.timer = setInterval(function() {
          return _this.moveLeft();
        }, this.interval);
        this.scrolled = true;
      }
      return this;
    };

    FilmRoll.prototype.clearScroll = function() {
      if (this.scrolled !== false) {
        clearInterval(this.timer);
        this.scrolled = false;
      }
      return this;
    };

    FilmRoll.prototype.marginLeft = function(rotation_index, offset) {
      var child, i, margin, _i, _len, _ref;
      if (offset == null) {
        offset = 0;
      }
      margin = 0;
      _ref = this.rotation;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        child = _ref[i];
        if (i < rotation_index && i >= offset) {
          margin += jQuery(child).outerWidth(true);
        }
      }
      return margin;
    };

    FilmRoll.prototype.marginRight = function(rotation_index, offset) {
      var child, i, margin, _i, _len, _ref;
      if (offset == null) {
        offset = 0;
      }
      offset = this.rotation.length - offset - 1;
      margin = 0;
      _ref = this.rotation;
      for (i = _i = 0, _len = _ref.length; _i < _len; i = ++_i) {
        child = _ref[i];
        if (i > rotation_index && i <= offset) {
          margin += jQuery(child).outerWidth(true);
        }
      }
      return margin;
    };

    FilmRoll.prototype.moveLeft = function() {
      this.index = (this.index + 1) % this.children.length;
      this.moveToIndex(this.index, 'left', true);
      return false;
    };

    FilmRoll.prototype.moveRight = function() {
      this.index -= 1;
      if (this.index < 0) {
        this.index = this.children.length - 1;
      }
      this.moveToIndex(this.index, 'right', true);
      return false;
    };

    FilmRoll.prototype.moveToIndex = function(index, direction, animate) {
      var child, new_left_margin, rotation_index, visible_margin, wrapper_width,
        _this = this;
      if (animate == null) {
        animate = true;
      }
      child = this.children[index];
      rotation_index = jQuery.inArray(child, this.rotation);
      this.children.removeClass('active');
      jQuery(child).addClass('active').trigger(jQuery.Event("film_roll:activate"));
      this.pager_links.removeClass('active');
      jQuery(this.pager_links[index]).addClass('active');
      wrapper_width = this.wrapper.width();
      if (wrapper_width < this.real_width) {
        visible_margin = (wrapper_width - jQuery(child).outerWidth(true)) / 2;
        if (direction === 'right') {
          while (rotation_index === 0 || this.marginLeft(rotation_index) < visible_margin) {
            this.rotateRight();
            rotation_index = jQuery.inArray(child, this.rotation);
          }
        } else {
          while (rotation_index === this.children.length - 1 || this.marginRight(rotation_index) < visible_margin) {
            this.rotateLeft();
            rotation_index = jQuery.inArray(child, this.rotation);
          }
        }
        new_left_margin = -1 * (this.marginLeft(rotation_index) - visible_margin);
        if (animate) {
          this.shuttle.stop().animate({
            'left': new_left_margin
          }, this.animation, 'swing', function() {
            return _this.div.trigger(jQuery.Event("film_roll:moved"));
          });
        } else {
          this.shuttle.css('left', new_left_margin);
          this.div.trigger(jQuery.Event("film_roll:moved"));
        }
      } else {
        this.shuttle.css('left', (wrapper_width - this.width) / 2);
      }
      return this;
    };

    FilmRoll.prototype.resize = function() {
      var _this = this;
      this.clearScroll();
      clearTimeout(this.resize_timer);
      this.resize_timer = setTimeout(function() {
        _this.configureScroll();
        _this.moveToIndex(_this.index, 'left');
        return _this.div.trigger(jQuery.Event("film_roll:resized"));
      }, 200);
      return this;
    };

    FilmRoll.prototype.rotateLeft = function() {
      var _css_left, _first_child, _shuttle_left;
      _css_left = this.shuttle.css('left');
      _shuttle_left = _css_left ? parseInt(_css_left, 10) : 0;
      _first_child = this.rotation.shift();
      this.rotation.push(_first_child);
      this.shuttle.css('left', _shuttle_left + jQuery(_first_child).outerWidth(true));
      return this.shuttle.append(this.shuttle.children().first().detach());
    };

    FilmRoll.prototype.rotateRight = function() {
      var _css_left, _last_child, _shuttle_left;
      _css_left = this.shuttle.css('left');
      _shuttle_left = _css_left ? parseInt(_css_left, 10) : 0;
      _last_child = this.rotation.pop();
      this.rotation.unshift(_last_child);
      this.shuttle.css('left', _shuttle_left - jQuery(_last_child).outerWidth(true));
      return this.shuttle.prepend(this.shuttle.children().last().detach());
    };

    return FilmRoll;

  })();

}).call(this);
