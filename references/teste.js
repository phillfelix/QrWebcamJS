/*! Copyright (C) Neave Interactive, neave.com */
var WebcamToy = {};
(function(f) {
	var e = "",
		h = 0,
		i = $("body").hasClass("mobile"),
		b = 150;

	function a(j) {
		$("#toy-intro>p").hide();
		$("#prompt-" + j).show()
	}
	function d() {
		if (Neave.isChrome) {
			if (parseInt($("#menu").css("left"), 10) < 0 || $("body").hasClass("app")) {
				$("header").animate({
					top: -50
				}, b)
			}
			$("#content").animate({
				top: 0
			}, b);
			$("#head-sponsor").animate({
				top: -40
			}, b);
			$("#infobar-stripe").show()
		}
		$("#toy-intro").addClass("bg-access")
	}
	function c() {
		if (Neave.isChrome) {
			$("header").animate({
				top: 0
			}, b);
			$("#content").animate({
				top: 50
			}, b, function() {
				$(this).css("top", "")
			});
			$("#head-sponsor").animate({
				top: 10
			}, b);
			$("#infobar-stripe").hide()
		}
		$("#toy-intro").removeClass("bg-access")
	}
	f.error = function(j) {
		$("#toy-intro").removeClass("wait");
		$("#toy-intro>p,#button-access").hide();
		a("error");
		if (!i) {
			$("#prompt-flash").show()
		}
		c();
		if (j) {
			e += j + "<br>";
			$("#toy-intro footer p").html(e);
			$("#toy-intro footer").show();
			g(j);
			console.error(j)
		}
	};

	function g(j) {
		if (f.Services) {
			Neave.trackLink(f.Services.analyticsName, "Error", j)
		}
		return false
	}
	f.init = function() {
		if (!Neave.hasWebGL) {
			f.error("WebGL not enabled");
			return
		}
		window.onerror = g;
		d();
		$("#button-access").hide();
		a("access");
		f.Camera.getCamera(function(j) {
			c();
			a("loading");
			$("#toy-intro footer").fadeOut(200, function() {
				$("#toy-intro").addClass("wait");
				if (!i) {
					f.Audio.loadAudio()
				}
				f.Effect.loadImages(function() {
					f.Effect.loadEffects(function() {
						f.UI.init(j, f.error)
					}, function() {
						f.error("Effects not loaded")
					})
				}, function() {
					f.error("Images not loaded")
				})
			})
		}, function() {
			c();
			if (h < 2) {
				h++;
				a("request-error");
				$("#button-access").show()
			} else {
				f.error("Camera not found")
			}
		})
	}
})(WebcamToy);
WebcamToy.Services = (function(f, s) {
	var c = {},
		j = {
			facebook: {
				firstName: "",
				fullName: "",
				id: "",
				url: "",
				token: "",
				album: {
					id: localStorage.getItem("facebookAlbumID") || "",
					url: "",
					privacy: ""
				}
			},
			twitter: {
				name: localStorage.getItem("twitterName") || "",
				token: localStorage.getItem("twitterToken") || "",
				secret: localStorage.getItem("twitterSecret") || "",
				forceLogin: false
			}
		},
		k = false,
		r = "Webcam Toy",
		t = "201969246526783",
		b, l, p = 0,
		e, u = "http://ve.neave.com",
		i = u + "/webcam/twitter/",
		d = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/",
		w = $("html").attr("lang");
	c.analyticsName = r + " HTML5" + (w === "en" ? "" : " (" + w.substr(0, 2).toUpperCase() + ")");
	c.imagesURL = s.staticURL + "assets/js/webcam-images.1.js";
	c.shadersURL = s.staticURL + "webcam/fs/fs.6.txt";
	c.audioBaseURL = s.staticURL + "webcam/sounds/";
	c.imagesBaseURL = s.staticURL + "webcam/images/";
	c.facebookChannelURL = "http://neave.com/webcam/channel.html";
	c.onFacebookAuth = null;
	c.onFacebookUser = null;
	c.onTwitterAuth = null;

	function a(z, y) {
		var x = d.indexOf(z.charAt(y));
		if (x === -1) {
			throw "Cannot decode base64"
		}
		return x
	}
	window.atob = window.atob ||
	function(B) {
		B = "" + B;
		var D = 0,
			A, C, z = B.length,
			y = [];
		if (z === 0) {
			return B
		}
		if (z % 4 !== 0) {
			throw "Cannot decode base64"
		}
		if (B.charAt(z - 1) === "=") {
			D = 1;
			if (B.charAt(z - 2) === "=") {
				D = 2
			}
			z -= 4
		}
		for (A = 0; A < z; A += 4) {
			C = (a(B, A) << 18) | (a(B, A + 1) << 12) | (a(B, A + 2) << 6) | a(B, A + 3);
			y.push(String.fromCharCode(C >> 16, (C >> 8) & 255, C & 255))
		}
		switch (D) {
		case 1:
			C = (a(B, A) << 18) | (a(B, A + 1) << 12) | (a(B, A + 2) << 6);
			y.push(String.fromCharCode(C >> 16, (C >> 8) & 255));
			break;
		case 2:
			C = (a(B, A) << 18) | (a(B, A + 1) << 12);
			y.push(String.fromCharCode(C >> 16));
			break
		}
		return y.join("")
	};

	function v(z) {
		var y = window.atob(z.split(",")[1]),
			x = z.split(",")[0].split(":")[1].split(";")[0],
			F = new ArrayBuffer(y.length),
			E = new Uint8Array(F),
			B = window.BlobBuilder || window.WebKitBlobBuilder || window.MozBlobBuilder,
			D, A;
		for (A = y.length; A--;) {
			E[A] = y.charCodeAt(A)
		}
		if (window.Blob) {
			try {
				return new Blob([E], {
					type: x
				})
			} catch (C) {}
		}
		if (B) {
			D = new B();
			D.append(F);
			return D.getBlob(x)
		}
		return null
	}
	c.cancelPost = function() {
		clearInterval(e);
		k = false
	};

	function o(y, x) {
		var z = $.parseJSON(y.responseText);
		if (x) {
			x(z)
		}
	}
	function m() {
		j.facebook.album.privacy = j.facebook.album.id = j.facebook.album.url = "";
		try {
			localStorage.setItem("facebookAlbumID", "")
		} catch (x) {}
	}
	function h() {
		j.facebook.token = j.facebook.firstName = j.facebook.fullName = j.facebook.id = j.facebook.url = "";
		m()
	}
	function n(x) {
		var y = x.authResponse ? x.authResponse.accessToken : "";
		if (x && x.status === "connected" && y) {
			j.facebook.token = y;
			c.facebookUser();
			if (c.onFacebookAuth) {
				c.onFacebookAuth(j.facebook.token)
			}
		} else {
			h()
		}
	}
	c.facebookInit = function() {
		var A = location.hash.substr(1);
		if (A) {
			var x = A.split("&"),
				B = {},
				y, z;
			for (y = 0; y < x.length; y++) {
				var z = x[y].split("=");
				B[z[0]] = z[1]
			}
			if (B.access_token && B.access_token.length > 50) {
				j.facebook.token = B.access_token;
				location.hash = ""
			}
		}
		window.fbAsyncInit = function() {
			FB.Event.subscribe("auth.statusChange", n);
			FB.init({
				appId: t,
				channelUrl: c.facebookChannelURL,
				status: true,
				cookie: true,
				oauth: true
			})
		};
		s.addFBScript()
	};
	c.facebookUser = function() {
		if (j.facebook.firstName) {
			if (c.onFacebookUser) {
				c.onFacebookUser(j.facebook)
			}
		} else {
			if ( !! window.FB) {
				FB.api("/me", function(x) {
					if (x) {
						j.facebook.firstName = x.first_name;
						j.facebook.fullName = x.name;
						j.facebook.id = x.id;
						j.facebook.url = x.link;
						if (c.onFacebookUser) {
							c.onFacebookUser(j.facebook)
						}
					}
				})
			}
		}
	};
	c.facebookAuth = function() {
		clearInterval(e);
		if (!j.facebook.token) {
			if (!window.FB) {
				s.addFBScript()
			} else {
				FB.login(function() {}, {
					scope: "user_photos, publish_actions"
				})
			}
		} else {
			if (c.onFacebookAuth) {
				c.onFacebookAuth(j.facebook.token || "")
			}
		}
	};
	c.facebookLogout = function() {
		clearInterval(e);
		if ( !! window.FB) {
			FB.getLoginStatus(function(x) {
				if (x && x.status === "connected") {
					FB.logout()
				}
			})
		}
		h()
	};
	c.facebookStatus = function() {
		if (!window.FB) {
			s.addFBScript()
		} else {
			FB.getLoginStatus(n)
		}
	};
	c.facebookAlbum = function(A, x, z, y) {
		if ( !! window.FB && x && z) {
			FB.api("/me/albums", function(D) {
				if (D && D.data) {
					var C = j.facebook.album.id;
					for (var E = 0; E < D.data.length; E++) {
						var B = D.data[E].name.toLowerCase();
						if (C && D.data[E].id === C || !C && (B === x.toLowerCase() || B === "webcam toy photos")) {
							if (D.data[E].can_upload) {
								j.facebook.album.url = D.data[E].link;
								j.facebook.album.privacy = D.data[E].privacy;
								j.facebook.album.id = D.data[E].id;
								try {
									localStorage.setItem("facebookAlbumID", j.facebook.album.id)
								} catch (F) {}
								if (A) {
									A(j.facebook.album.url, j.facebook.album.privacy, j.facebook.album.id)
								}
								return
							}
						}
					}
					if (!y) {
						FB.api("/me/albums", "post", {
							name: x,
							message: z
						}, function(G) {
							if (G && G.id) {
								m();
								j.facebook.album.id = G.id;
								try {
									localStorage.setItem("facebookAlbumID", j.facebook.album.id)
								} catch (H) {}
								c.facebookAlbum(A, x, z, true)
							}
						})
					}
				}
			})
		}
	};
	c.facebookPost = function(y, A, x) {
		if (!j.facebook.token) {
			x();
			return
		}
		k = true;
		var z = new FormData();
		z.append("access_token", j.facebook.token);
		z.append("message", y.message.replace(r, "@[" + t + ":" + r + "]"));
		z.append("file", v(y.image.src));
		if (b) {
			b.abort()
		}
		b = $.ajax({
			url: "https://graph.facebook.com/" + (j.facebook.album.id || "me") + "/photos",
			data: z,
			type: "POST",
			cache: false,
			contentType: false,
			processData: false,
			statusCode: {
				400: function(B) {
					o(B, x)
				},
				401: function(B) {
					o(B, x)
				},
				403: function(B) {
					o(B, x)
				},
				500: function(B) {
					o(B, x)
				}
			},
			complete: function(B) {
				if (k) {
					var C = $.parseJSON(B.responseText);
					if (C && C.success === 0) {
						x(C)
					} else {
						if (B.statusText === "OK" && C && C.id) {
							A()
						} else {
							x(C)
						}
					}
				}
			}
		})
	};

	function g(y, z, x) {
		clearInterval(e);
		if (!z) {
			y = z = x = ""
		}
		j.twitter.name = y;
		j.twitter.token = z;
		j.twitter.secret = x;
		try {
			localStorage.setItem("twitterName", y);
			localStorage.setItem("twitterToken", z);
			localStorage.setItem("twitterSecret", x)
		} catch (A) {}
		if (c.onTwitterAuth) {
			c.onTwitterAuth(y, z, x)
		}
	}
	function q(x) {
		x = x.originalEvent;
		if (x.origin === u) {
			var y = $.parseJSON(x.data);
			g(y.name, y.token, y.secret)
		}
	}
	c.twitterInit = function() {
		if (j.twitter.token) {
			if (c.onTwitterAuth) {
				c.onTwitterAuth(j.twitter.name, j.twitter.token, j.twitter.secret)
			}
		} else {
			p++;
			$.ajax({
				url: i + "verify.php?format=json",
				dataType: "jsonp",
				crossDomain: true,
				cache: false,
				success: function(x) {
					if (x.success === 1) {
						g(x.n, x.t, x.s)
					}
				}
			})
		}
	};
	c.twitterAuth = function() {
		clearInterval(e);
		if (!j.twitter.token) {
			var A = 700,
				E = window.screenX || 0,
				D = E ? $(window).width() : screen.availWidth,
				C = 520,
				x = window.screenY || 0,
				z = x ? $(window).height() : screen.availHeight,
				y = E + (D - A) / 2,
				B = x + (z - C) / 2;
			$(window).on("message", q);
			window.open(i + "?force_login=" + (j.twitter.forceLogin ? "1&destroy=1" : 0) + (w ? "&lang=" + w.substr(0, 2) : ""), "neavetwitter", "resizable=yes,toolbar=no,scrollbars=yes,status=no,width=" + A + ",height=" + C + ",left=" + y + ",top=" + B);
			if (p < 20) {
				e = setInterval(c.twitterInit, 5000)
			} else {
				e = setTimeout(c.twitterInit, 5000)
			}
		} else {
			if (c.onTwitterAuth) {
				c.onTwitterAuth(j.twitter.name, j.twitter.token, j.twitter.secret)
			}
		}
	};
	c.twitterLogout = function() {
		clearInterval(e);
		g("", "", "");
		j.twitter.forceLogin = true
	};
	c.twitterPost = function(A, z, x) {
		if (!j.twitter.token) {
			x();
			return
		}
		k = true;
		var y = new FormData();
		y.append("format", "json");
		y.append("token", j.twitter.token);
		y.append("secret", j.twitter.secret);
		y.append("message", A.message);
		if (A.width && A.height) {
			y.append("width", A.width);
			y.append("height", A.height)
		}
		y.append("file", v(A.image.src));
		if (l) {
			l.abort()
		}
		l = $.ajax({
			url: i + "tweet.php",
			data: y,
			type: "POST",
			cache: false,
			crossDomain: true,
			contentType: false,
			processData: false,
			statusCode: {
				400: x,
				401: x,
				403: x,
				500: x
			},
			complete: function(B) {
				if (k) {
					var C = $.parseJSON(B.responseText);
					if (C && C.success === 0) {
						x(C.error)
					} else {
						if (B.statusText === "OK" && C && C.id) {
							if (C.id) {
								z("http://twitter.com/" + j.twitter.name + "/status/" + C.id)
							} else {
								z()
							}
						} else {
							x()
						}
					}
				}
			}
		})
	};
	return c
}(WebcamToy, Neave));
WebcamToy.Texture = (function() {
	function b(g, e, c) {
		var f = document.createElement("canvas");
		f.width = e || g.width;
		f.height = c || g.height;
		var d = f.getContext("2d");
		if (d) {
			d.clearRect(0, 0, e, c)
		}
		return d
	}
	function a(h, f, c, g, e, d) {
		this.gl = h;
		this.id = h.createTexture();
		this.format = g;
		this.type = e;
		h.bindTexture(h.TEXTURE_2D, this.id);
		h.texParameteri(h.TEXTURE_2D, h.TEXTURE_MAG_FILTER, h.LINEAR);
		h.texParameteri(h.TEXTURE_2D, h.TEXTURE_MIN_FILTER, h.LINEAR);
		h.texParameteri(h.TEXTURE_2D, h.TEXTURE_WRAP_S, h.CLAMP_TO_EDGE);
		h.texParameteri(h.TEXTURE_2D, h.TEXTURE_WRAP_T, h.CLAMP_TO_EDGE);
		if (d) {
			this.loadContentsOf(d)
		} else {
			if (f && c) {
				this.width = f;
				this.height = c;
				h.texImage2D(h.TEXTURE_2D, 0, g, f, c, 0, g, e, null)
			}
		}
	}
	a.prototype.loadContentsOf = function(c) {
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.id);
		this.gl.pixelStorei(this.gl.UNPACK_FLIP_Y_WEBGL, true);
		try {
			this.gl.texImage2D(this.gl.TEXTURE_2D, 0, this.format, this.format, this.type, c)
		} catch (d) {}
		return this
	};
	a.prototype.use = function(c) {
		this.gl.activeTexture(this.gl.TEXTURE0 + (c || 0));
		this.gl.bindTexture(this.gl.TEXTURE_2D, this.id)
	};
	a.prototype.drawTo = function(d) {
		var c = this.gl;
		c.bindFramebuffer(c.FRAMEBUFFER, c.framebuffer = c.framebuffer || c.createFramebuffer());
		c.framebufferTexture2D(c.FRAMEBUFFER, c.COLOR_ATTACHMENT0, c.TEXTURE_2D, this.id, 0);
		d();
		c.bindFramebuffer(c.FRAMEBUFFER, null);
		return this
	};
	a.prototype.toImage = function(r, p, e, q) {
		q = q || this.height;
		e = r ? q : e || this.width;
		var l = this.height,
			o = r ? l : this.width,
			k, s = o * l * 4,
			j = new Uint8Array(s),
			n = b(this, o, l),
			m = b(this, e, q),
			g = n.createImageData(o, l),
			d = g.data,
			f;
		this.gl.readPixels(r ? (this.width - l) / 2 : 0, 0, o, l, this.gl.RGBA, this.gl.UNSIGNED_BYTE, j);
		for (k = s; k--;) {
			d[k] = j[k]
		}
		n.putImageData(g, 0, 0);
		m.save();
		m.translate(0, q);
		m.scale(e / o, -q / l);
		m.drawImage(n.canvas, 0, 0);
		m.restore();
		f = m.canvas.toDataURL("image/jpeg", p);
		n = null;
		m = null;
		return f
	};
	a.prototype.swapWith = function(c) {
		var d = c.id;
		c.id = this.id;
		this.id = d;
		d = c.width;
		c.width = this.width;
		this.width = d;
		d = c.height;
		c.height = this.height;
		this.height = d;
		d = c.format;
		c.format = this.format;
		this.format = d;
		return this
	};
	a.prototype.destroy = function() {
		this.gl.deleteTexture(this.id);
		this.id = null
	};
	return a
}());
WebcamToy.Shader = (function() {
	var f = "attribute vec2 vertex; attribute vec2 _texCoord; varying vec2 texCoord; void main() { texCoord = _texCoord; gl_Position = vec4(vertex * 2.0 - 1.0, 0.0, 1.0); }",
		b = "uniform sampler2D texture; varying vec2 texCoord; void main() { gl_FragColor = texture2D(texture, texCoord); }";

	function a(g) {
		return Object.prototype.toString.call(g) === "[object Array]"
	}
	function c(g) {
		return Object.prototype.toString.call(g) === "[object Number]"
	}
	function e(j, g, i) {
		var h = j.createShader(g);
		j.shaderSource(h, i);
		j.compileShader(h);
		if (!j.getShaderParameter(h, j.COMPILE_STATUS)) {
			throw "Compilation error: " + j.getShaderInfoLog(h)
		}
		return h
	}
	function d(h, i, g) {
		this.gl = h;
		this.vertexAttribute = null;
		this.texCoordAttribute = null;
		this.program = h.createProgram();
		i = i || f;
		g = g || b;
		g = "precision highp float;" + g;
		h.attachShader(this.program, e(h, h.VERTEX_SHADER, i));
		h.attachShader(this.program, e(h, h.FRAGMENT_SHADER, g));
		h.linkProgram(this.program);
		if (!h.getProgramParameter(this.program, h.LINK_STATUS)) {
			throw "Link error: " + h.getProgramInfoLog(this.program)
		}
	}
	d.getBlackShader = function(g) {
		return new d(g, null, "void main() { gl_FragColor = vec4(0.0, 0.0, 0.0, 1.0); }")
	};
	d.getMirrorShader = function(h, g) {
		return new d(h, null, g ? "uniform sampler2D texture; varying vec2 texCoord; void main() { gl_FragColor = texture2D(texture, vec2(1.0 - texCoord.x, texCoord.y)); }" : b)
	};
	d.prototype.uniforms = function(g) {
		if (g) {
			var k = this.gl;
			k.useProgram(this.program);
			for (var i in g) {
				if (g.hasOwnProperty(i)) {
					var h = k.getUniformLocation(this.program, i);
					if (!h) {
						continue
					}
					var j = g[i];
					if (a(j)) {
						switch (j.length) {
						case 1:
							k.uniform1fv(h, new Float32Array(j));
							break;
						case 2:
							k.uniform2fv(h, new Float32Array(j));
							break;
						case 3:
							k.uniform3fv(h, new Float32Array(j));
							break;
						case 4:
							k.uniform4fv(h, new Float32Array(j));
							break;
						case 9:
							k.uniformMatrix3fv(h, false, new Float32Array(j));
							break;
						case 16:
							k.uniformMatrix4fv(h, false, new Float32Array(j));
							break;
						default:
							throw 'Cannot load uniform "' + i + '" of length ' + j.length
						}
					} else {
						if (c(j)) {
							k.uniform1f(h, j)
						} else {
							throw 'Attempted to set uniform "' + i + '" to invalid value ' + (j || "undefined").toString()
						}
					}
				}
			}
		}
		return this
	};
	d.prototype.textures = function(g) {
		this.gl.useProgram(this.program);
		for (var h in g) {
			if (g.hasOwnProperty(h)) {
				this.gl.uniform1i(this.gl.getUniformLocation(this.program, h), g[h])
			}
		}
		return this
	};
	d.prototype.drawRect = function(j, i, g, h) {
		var k = this.gl;
		j = j || 0;
		i = i || 0;
		g = g || 1;
		h = h || 1;
		if (!k.vertexBuffer) {
			k.vertexBuffer = k.createBuffer()
		}
		k.bindBuffer(k.ARRAY_BUFFER, k.vertexBuffer);
		k.bufferData(k.ARRAY_BUFFER, new Float32Array([i, j, i, g, h, j, h, g]), k.STATIC_DRAW);
		if (!k.texCoordBuffer) {
			k.texCoordBuffer = k.createBuffer();
			k.bindBuffer(k.ARRAY_BUFFER, k.texCoordBuffer);
			k.bufferData(k.ARRAY_BUFFER, new Float32Array([0, 0, 0, 1, 1, 0, 1, 1]), k.STATIC_DRAW)
		}
		if (!this.vertexAttribute) {
			this.vertexAttribute = k.getAttribLocation(this.program, "vertex");
			k.enableVertexAttribArray(this.vertexAttribute)
		}
		if (!this.texCoordAttribute) {
			this.texCoordAttribute = k.getAttribLocation(this.program, "_texCoord");
			k.enableVertexAttribArray(this.texCoordAttribute)
		}
		k.useProgram(this.program);
		k.bindBuffer(k.ARRAY_BUFFER, k.vertexBuffer);
		k.vertexAttribPointer(this.vertexAttribute, 2, k.FLOAT, false, 0, 0);
		k.bindBuffer(k.ARRAY_BUFFER, k.texCoordBuffer);
		k.vertexAttribPointer(this.texCoordAttribute, 2, k.FLOAT, false, 0, 0);
		k.drawArrays(k.TRIANGLE_STRIP, 0, 4)
	};
	d.prototype.destroy = function() {
		if (this.gl && this.program) {
			this.gl.deleteProgram(this.program)
		}
		this.program = null
	};
	return d
}());
WebcamToy.Effect = (function(k) {
	var v = {},
		h = ["mirrorleft", "mirrorright", "mirrortop", "mirrorbottom", "mirrorquad", "upsidedown", "switch", "kaleidoscope", "fragment", "quadcam", "splitscreen", "filmstrip", "ghost", "colorghost", "trail", "rings", "tunnel", "spiral", "twist", "dent", "pinch", "bulge", "fisheye", "wedge", "ripple", "stretch", "softfocus", "hazydays", "oldmovie", "rose", "retro", "xpro", "glitch", "rainbow", "trueblue", "mono", "lomo", "cartoon", "monoquad", "lomoquad", "cartoonstrip", "blackwhite", "magazine", "comicbook", "outline", "sketch", "crosshatch", "underwater", "fire", "snow", "disco", "sparkle", "eightbit", "hotpink", "lsd", "xray", "nightvision", "thermal", "spectrum", "neon", "popart", "popbooth"],
		r = 800,
		g = 600,
		q = {
			texture2: 1
		},
		u = [2, 2, 2, 0, 0, 0, -2, -2, -2],
		l = [1, 2, 1, 2, -12, 2, 1, 2, 1],
		a = {
			add: function(w) {
				this.initShader("add");
				this.uniforms.add = {
					ratio: w || 0.5
				}
			},
			blur: function(w) {
				if (!this.initShader("blur")) {
					this.initShader("blursimple")
				}
				this.uniforms.blur1 = {
					delta: [(w || 32) / this.width, 0]
				};
				this.uniforms.blur2 = {
					delta: [0, (w || 32) / this.height]
				}
			},
			bulge: function() {
				this.uniforms = {
					mode: 1,
					strength: 0.9,
					center: this.center,
					radius: this.height / 4
				}
			},
			colorghost: function() {
				this.initShader("colorghost");
				this.initFrameTextures(this.fps = o ? 8 : 20, this.width, this.height);
				this.uniforms = {
					frame: 0,
					tex: {
						frame1: 1,
						frame2: 2
					}
				}
			},
			cartoon: function() {
				this.initShader("cartoon");
				this.initShader("ink");
				this.fps = 20;
				this.quality = 0.7;
				this.uniforms = {
					ink: {
						size: [2.5 / g * this.height / this.width, 2.5 / g]
					},
					cartoon: {
						quad: 0,
						rect: this.getRect()
					}
				}
			},
			cartoonstrip: function() {
				this.initShader("quadcam");
				this.initShader("cartoon");
				this.initShader("ink");
				this.fps = 20;
				this.quality = 0.7;
				this.isQuad = true;
				this.uniforms = {
					ink: {
						size: [2.5 / g * this.height / this.width, 2.5 / g]
					},
					cartoonstrip: {
						rect: this.getRect(120)
					}
				}
			},
			crosshatch: function() {
				this.initShader("crosshatch1");
				this.initShader("crosshatch2")
			},
			comicbook: function() {
				if (!this.initShader("comicbook")) {
					this.shaders.comicbook = null;
					this.initShader("comicbookcyan");
					this.initShader("comicbookmag");
					this.initShader("comicbookyel");
					this.initShader("comicbookkey")
				}
				this.initShader("comicbookborder");
				this.quality = 0.55;
				this.uniforms = {
					comicbook: {
						center: this.center,
						scale: Math.min(1.25, 400 / this.height)
					},
					comicbookborder: {
						rect: this.getRect(56)
					}
				}
			},
			dent: function() {
				this.initShader("bulge");
				this.uniforms = {
					mode: 0,
					strength: -1,
					center: this.center,
					radius: this.height / 4
				}
			},
			disco: function() {
				this.initShader("discored");
				this.initShader("discogreen");
				this.initShader("discoblue");
				this.startTime = Date.now() - 2000;
				this.uniforms = {
					discolights: {},
					discored: [new m(3.3, 2.9, 0.3, 0.3), new m(1.9, 2, 0.4, 0.4), new m(0.8, 0.7, 0.4, 0.5), new m(2.3, 0.1, 0.6, 0.3), new m(0.8, 1.7, 0.5, 0.4), new m(0.3, 1, 0.4, 0.4), new m(1.4, 1.7, 0.4, 0.5), new m(1.3, 2.1, 0.6, 0.3), new m(1.8, 1.7, 0.5, 0.4)],
					discogreen: [new m(1.2, 1.9, 0.3, 0.3), new m(0.7, 2.7, 0.4, 0.4), new m(1.4, 0.6, 0.4, 0.5), new m(2.6, 0.4, 0.6, 0.3), new m(0.7, 1.4, 0.5, 0.4), new m(0.7, 1.7, 0.4, 0.4), new m(0.8, 0.5, 0.4, 0.5), new m(1.4, 0.9, 0.6, 0.3), new m(0.7, 1.3, 0.5, 0.4)],
					discoblue: [new m(3.7, 0.3, 0.3, 0.3), new m(1.9, 1.3, 0.4, 0.4), new m(0.8, 0.9, 0.4, 0.5), new m(1.2, 1.7, 0.6, 0.3), new m(0.3, 0.6, 0.5, 0.4), new m(0.3, 0.3, 0.4, 0.4), new m(1.4, 0.8, 0.4, 0.5), new m(0.2, 0.6, 0.6, 0.3), new m(1.3, 0.5, 0.5, 0.4)]
				}
			},
			eightbit: function() {
				this.fps = 10;
				this.quality = 0.9;
				this.uniforms = {
					size: Math.max(1.6, this.height / g * 3.2),
					rect: this.getRect(32)
				}
			},
			fire: function() {
				var w = this.square ? (this.width - this.height) / this.width / 2 : 0;
				this.initShader("fire");
				this.initShader("firevignette");
				this.initFrameTextures(6, this.width, this.height);
				this.fps = 20;
				this.quality = 0.7;
				this.uniforms = {
					frame: 0,
					center: this.center,
					radius: this.height * 0.4,
					width: (this.square ? this.height : this.width) / 3,
					left: w,
					right: 1 - w,
					tex: {
						frame1: 1,
						frame2: 2,
						frame3: 3,
						frame4: 4,
						frame5: 5,
						frame6: 6
					}
				}
			},
			filmstrip: function() {
				var w = o ? 1.5 : 3,
					x = this.square ? (this.width - this.height) / this.width / 2 : 0;
				this.initShader("filmstrip");
				this.initFrameTextures(1, Math.round(this.width * w), Math.round(this.height * w));
				this.fps = 20;
				this.quality = 0.7;
				this.uniforms = {
					frame: 0,
					init: true,
					left: x,
					right: 1 - x
				}
			},
			fisheye: function() {
				this.initShader("bulge");
				this.uniforms = {
					mode: 1,
					strength: 1,
					center: this.center,
					radius: this.height * 0.75
				}
			},
			ghost: function() {
				this.initShader("ghost");
				this.initFrameTextures(this.fps = o ? 8 : 20, this.width, this.height);
				this.uniforms.ghost = {
					frame: 0
				}
			},
			glitch: function() {
				this.uniforms = {
					pixelSize: Math.max(10, this.height / g * 20),
					center: this.center,
					width: this.width / 2
				}
			},
			hazydays: function() {
				this.initShader("hazydays");
				this.extraTexture = this.getTexture(this.square ? n.hazydayssq : n.hazydays)
			},
			hotpink: function() {
				this.initShader("hotpink");
				this.extraTexture = this.getTexture(n.hotpink)
			},
			kaleidoscope: function() {
				if (this.mainTexture.type === this.gl.FLOAT) {
					this.initShader("kaleidoscope1");
					this.initShader("kaleidoscope2")
				} else {
					this.initShader("kaleidoscope")
				}
				this.uniforms = {
					center: this.center,
					offset: [this.width / 2, this.height * 0.1]
				}
			},
			lomo: function() {
				this.uniforms = {
					quad: 0,
					center: this.center,
					radius: this.width * 0.8,
					exposure: 2.5
				}
			},
			lomoquad: function() {
				this.initShader("lomo");
				this.isQuad = true;
				this.uniforms.lomoquad = {
					center: this.center,
					radius: this.width * 0.85,
					exposure: 2.5,
					rect: this.getRect(48),
					fade: 86
				}
			},
			lsd: function() {
				this.initShader("lsd");
				this.sourceTexture.loadContentsOf(this.source);
				this.tempTexture.drawTo(this.mirrorDrawRect);
				this.fps = 15
			},
			magazine: function() {
				var w = Math.PI / 3;
				this.quality = 0.6;
				this.uniforms = {
					center: this.center,
					scale: Math.min(1.25, 400 / this.height),
					cosa: Math.cos(w),
					sina: Math.sin(w),
					rect: this.getRect(48),
					fade: 48 * 24
				}
			},
			mix: function(w) {
				this.initShader("mix");
				this.uniforms.mix = {
					strength: w || 8
				}
			},
			mono: function() {
				this.uniforms = {
					quad: 0
				}
			},
			monoquad: function() {
				this.initShader("mono");
				this.isQuad = true;
				this.uniforms.monoquad = {
					rect: this.getRect(48),
					fade: 86
				}
			},
			nightvision: function() {
				this.quality = 0.7;
				this.uniforms = {
					center: this.center,
					radius: (this.square ? this.height : this.width) / 3.2
				}
			},
			oldmovie: function() {
				this.initShader("oldmovienoise");
				this.initShader("oldmoviedirt");
				this.initShader("sepia");
				this.fps = 10;
				this.quality = 0.7;
				this.uniforms = {
					flicker: 0,
					jump: 0,
					line: 0,
					dot0: new Array(3),
					dot1: new Array(3),
					dot2: new Array(3),
					sepia: {
						center: this.center,
						radius: this.height / 2,
						width: (this.square ? this.height : this.width) / 3
					}
				}
			},
			outline: function() {
				this.quality = 0.7
			},
			pinch: function() {
				this.initShader("bulge");
				this.uniforms = {
					mode: 1,
					strength: -0.5,
					center: this.center,
					radius: this.height / 4
				}
			},
			popart: function() {
				this.initShader("popart");
				this.extraTexture = this.getTexture(n.popart)
			},
			popbooth: function() {
				this.initShader("popart");
				this.extraTexture = this.getTexture(n.popbooth)
			},
			quad: function() {
				this.uniforms.quad = {
					texSize: this.size,
					square: this.square ? 1 : 0,
					quad: 1
				}
			},
			quadcam: function() {
				this.initShader("quadcam");
				this.isQuad = true
			},
			rainbow: function() {
				this.initShader("rainbow");
				this.initShader("rainbowscreen");
				this.initShader("rainbowborder");
				this.extraTexture = this.getTexture(this.square ? n.rainbowsq : n.rainbow)
			},
			retro: function() {
				this.initShader("retro");
				this.extraTexture = this.getTexture(this.square ? n.retrosq : n.retro)
			},
			rings: function() {
				this.initShader("rings");
				this.initFrameTextures(18, this.width, this.height);
				this.fps = 20;
				this.uniforms = {
					frame: 0,
					tex: {
						frame1: 1,
						frame2: 2,
						frame3: 3,
						frame4: 4,
						frame5: 5,
						frame6: 6
					}
				}
			},
			ripple: function() {
				this.uniforms = {
					center: this.center,
					wavelength: this.height / 16,
					amplitude: this.height / 22
				}
			},
			rose: function() {
				var x = this.square ? this.height : this.width;
				this.uniforms = {
					center: this.center,
					radius: x / 6.4,
					width: x * 0.75,
					rect: this.getRect(40),
					fade: 80
				}
			},
			snow: function() {
				var x = Math.max(60, Math.floor(this.height / 4)),
					w = Math.floor(x * this.width / this.height);
				this.tempContext2D = c.getContext2D(w, x);
				this.assets.snowflakes = [];
				this.uniforms = {
					center: this.center,
					radius: (this.square ? this.height : this.width) / 3,
					width: this.height / 2
				}
			},
			softfocus: function() {
				this.initShader("softfocus");
				this.fps = 20
			},
			sparkle: function() {
				var x = Math.max(60, Math.floor(this.height / 4)),
					w = Math.floor(x * this.width / this.height);
				this.initShader("sparkle");
				this.initFrameTextures(1, this.width, this.height);
				this.tempContext2D = c.getContext2D(w, x);
				this.fps = 20;
				this.assets.sparkles = [];
				this.uniforms = {
					mirror: this.mirror ? 1 : 0,
					tex: {
						texture2: 1,
						texture3: 2
					}
				}
			},
			spectrum: function() {
				this.quality = 0.7
			},
			spiral: function() {
				var D = 7,
					A = g / this.height * 0.95,
					B = Math.cos(D),
					z = Math.sin(D),
					y = 60 * this.height / g,
					x = 140 * this.height / g,
					w = Math.log(x / y),
					C = Math.atan(w / Math.PI / 2);
				if (this.mainTexture.type === this.gl.FLOAT) {
					this.initShader("spiral1");
					this.initShader("spiral2")
				} else {
					this.initShader("spiral")
				}
				this.uniforms = {
					spiralx: y,
					a: w,
					center: this.center,
					za: [B * A, z * A],
					start: [(this.center[0] * B + this.center[1] * z) * -A, (this.center[1] * B - this.center[0] * z) * A],
					s: [Math.cos(C), Math.sin(C)]
				}
			},
			splitscreen: function() {
				this.initShader("splitscreen");
				this.initFrameTextures(this.fps = o ? 10 : 20, this.width, this.height);
				this.uniforms = {
					frame: 0
				}
			},
			thermal: function() {
				this.initShader("thermal");
				this.extraTexture = this.getTexture(n.thermal);
				this.quality = 0.7
			},
			trail: function() {
				this.initShader("trail");
				this.sourceTexture.loadContentsOf(this.source);
				this.tempTexture.drawTo(this.mirrorDrawRect)
			},
			tunnel: function() {
				this.uniforms = {
					center: this.center,
					radius: this.height * 0.2
				}
			},
			twist: function() {
				this.uniforms = {
					center: this.center,
					radius: this.height / 2,
					angle: -150 * Math.PI / 180
				}
			},
			underwater: function() {
				var x = (this.square ? this.height : this.width) / 3;
				this.initShader("underwater");
				this.initShader("underwaterblue");
				this.assets.bubbles = new Array(12);
				this.uniforms = {
					center: this.center,
					radius: x,
					width: this.height / 2
				}
			},
			wedge: function() {
				this.uniforms = {
					center: this.center
				}
			},
			xpro: function() {
				var w = this.square ? this.width / 6 : (this.width + this.height) / 8,
					x = this.square ? this.width / 3 : (this.width + this.height) / 6;
				this.initShader("xpro");
				this.initShader("xproblur");
				this.initShader("xproborder");
				this.fps = 20;
				this.uniforms = {
					xproblur1: {
						texSize: this.size,
						center: this.center,
						blur: Math.floor(this.width / 32),
						radius: w,
						width: x,
						delta: [1 / this.width, 0]
					},
					xproblur2: {
						texSize: this.size,
						center: this.center,
						blur: Math.floor(this.width / 32),
						radius: w,
						width: x,
						delta: [0, 1 / this.height]
					},
					xproborder: {
						rect: this.getRect(60),
						fade: 180
					}
				}
			}
		},
		t = {
			add: function(w) {
				if (!this.uniforms.add) {
					a.add.call(this, w)
				}
				this.shaders.add.textures(q);
				s.call(this, this.shaders.add, this.uniforms.add)
			},
			blur: function(w) {
				if (this.shaders.blursimple) {
					s.call(this, this.shaders.blursimple, this.uniforms)
				} else {
					if (!this.uniforms.blur1) {
						a.blur.call(this, w)
					}
					s.call(this, this.shaders.blur, this.uniforms.blur1);
					s.call(this, this.shaders.blur, this.uniforms.blur2)
				}
			},
			cartoon: function() {
				s.call(this, this.shaders.ink, this.uniforms.ink);
				s.call(this, this.shaders.cartoon, this.uniforms.cartoon);
				this.mainDraw()
			},
			cartoonstrip: function() {
				s.call(this, this.shaders.ink, this.uniforms.ink);
				this.shaders.cartoon.uniforms(this.uniforms.cartoonstrip);
				t.quad.call(this, this.shaders.cartoon)
			},
			colorghost: function() {
				var x = this.uniforms.frame,
					w = this.frameTextures.length;
				this.mainTexture.use(0);
				this.frameTextures[x].drawTo(this.defaultDrawRect);
				x++;
				this.uniforms.frame = x %= w;
				this.frameTextures[x].use(1);
				this.frameTextures[(x + w / 2) % w].use(2);
				this.shaders.colorghost.textures(this.uniforms.tex);
				s.call(this, this.shaders.colorghost);
				this.mainDraw()
			},
			comicbook: function() {
				if (this.shaders.comicbook) {
					s.call(this, this.shaders.comicbook, this.uniforms.comicbook)
				} else {
					this.shaders.comicbookcyan.textures(q);
					this.shaders.comicbookmag.textures(q);
					this.shaders.comicbookyel.textures(q);
					this.shaders.comicbookkey.textures(q);
					this.tempTexture.drawTo(this.mirrorDrawRect).use(1);
					s.call(this, this.shaders.comicbookcyan, this.uniforms.comicbook);
					s.call(this, this.shaders.comicbookmag, this.uniforms.comicbook);
					s.call(this, this.shaders.comicbookyel, this.uniforms.comicbook);
					s.call(this, this.shaders.comicbookkey, this.uniforms.comicbook)
				}
				s.call(this, this.shaders.comicbookborder, this.uniforms.comicbookborder);
				this.mainDraw()
			},
			crosshatch: function() {
				var w = this;
				this.mainTexture.use(0);
				this.tempTexture.drawTo(function() {
					w.shaders.crosshatch1.drawRect()
				}).use(1);
				this.shaders.crosshatch2.textures(q);
				s.call(this, this.shaders.crosshatch2);
				this.mainDraw()
			},
			dent: function() {
				s.call(this, this.shaders.bulge, this.uniforms);
				this.mainDraw()
			},
			disco: function() {
				var x = this.uniforms.time,
					w;
				for (w = 0; w < 9; w++) {
					this.uniforms.discolights["p" + w] = this.uniforms.discored[w].getPos(x)
				}
				s.call(this, this.shaders.discored, this.uniforms.discolights);
				for (w = 0; w < 9; w++) {
					this.uniforms.discolights["p" + w] = this.uniforms.discogreen[w].getPos(x)
				}
				s.call(this, this.shaders.discogreen, this.uniforms.discolights);
				for (w = 0; w < 9; w++) {
					this.uniforms.discolights["p" + w] = this.uniforms.discoblue[w].getPos(x)
				}
				s.call(this, this.shaders.discoblue, this.uniforms.discolights);
				this.mainDraw()
			},
			filmstrip: function() {
				var y = this.defaultShader,
					w = this.frameTextures[0],
					z = this.uniforms.frame,
					x;
				this.mainTexture.use(0);
				this.gl.viewport(0, 0, w.width, w.height);
				if (this.uniforms.init) {
					this.uniforms.init = false;
					w.drawTo(function() {
						for (x = 0; x < 6; x++) {
							for (var A = 0; A < 6; A++) {
								y.drawRect(x / 6, A / 6, (x + 1) / 6, (A + 1) / 6)
							}
						}
					}).use(1)
				} else {
					w.drawTo(function() {
						for (x = 0; x < 6; x++) {
							switch (z) {
							case x:
								y.drawRect(x / 6, 0, (x + 1) / 6, 1 / 6);
								break;
							case x + 6:
								y.drawRect(x / 6, 1 / 6, (x + 1) / 6, 2 / 6);
								break;
							case x + 12:
								y.drawRect(x / 6, 2 / 6, (x + 1) / 6, 0.5);
								break;
							case x + 18:
								y.drawRect(x / 6, 0.5, (x + 1) / 6, 4 / 6);
								break;
							case x + 24:
								y.drawRect(x / 6, 4 / 6, (x + 1) / 6, 5 / 6);
								break;
							case x + 30:
								y.drawRect(x / 6, 5 / 6, (x + 1) / 6, 1);
								break
							}
						}
					}).use(1)
				}
				this.gl.viewport(0, 0, this.width, this.height);
				this.shaders.filmstrip.textures(q);
				s.call(this, this.shaders.filmstrip, this.uniforms);
				z++;
				this.uniforms.frame = z %= 36;
				this.mainDraw()
			},
			fire: function() {
				var w, y = this.uniforms.frame,
					x = this.frameTextures.length;
				this.mainTexture.use(0);
				this.frameTextures[y].drawTo(this.defaultDrawRect);
				y++;
				this.uniforms.frame = y %= x;
				for (w = x; w--;) {
					this.frameTextures[(y + w) % x].use(w + 1)
				}
				this.shaders.fire.textures(this.uniforms.tex);
				s.call(this, this.shaders.fire, this.uniforms);
				s.call(this, this.shaders.firevignette, this.uniforms);
				this.mainDraw()
			},
			fisheye: function() {
				s.call(this, this.shaders.bulge, this.uniforms);
				this.mainDraw()
			},
			ghost: function() {
				var w = this.uniforms.ghost.frame;
				this.mainTexture.use(0);
				this.frameTextures[w].drawTo(this.defaultDrawRect);
				w++;
				this.uniforms.ghost.frame = w %= this.frameTextures.length;
				this.frameTextures[w].use(1);
				t.add.call(this, 0.5);
				this.mainDraw()
			},
			hazydays: function() {
				this.extraTexture.use(1);
				this.shaders.hazydays.textures(q);
				s.call(this, this.shaders.hazydays, this.uniforms);
				this.mainDraw()
			},
			hotpink: function() {
				this.extraTexture.use(1);
				this.shaders.hotpink.textures(q);
				s.call(this, this.shaders.hotpink);
				this.mainDraw()
			},
			kaleidoscope: function() {
				if (this.mainTexture.type === this.gl.FLOAT) {
					this.shaders.kaleidoscope2.textures(q);
					this.tempTexture.drawTo(this.mirrorDrawRect).use(1);
					s.call(this, this.shaders.kaleidoscope1, this.uniforms);
					s.call(this, this.shaders.kaleidoscope2, this.uniforms)
				} else {
					s.call(this, this.shaders.kaleidoscope, this.uniforms)
				}
				this.mainDraw()
			},
			lomoquad: function() {
				this.shaders.lomo.uniforms(this.uniforms.lomoquad);
				t.quad.call(this, this.shaders.lomo)
			},
			lsd: function() {
				this.tempTexture.use(1);
				if (!o) {
					t.blur.call(this, 2)
				}
				s.call(this, this.shaders.lsd);
				t.add.call(this, o ? 0.6 : 0.85);
				this.tempTexture.swapWith(this.mainTexture);
				this.mainDraw()
			},
			mix: function(w) {
				if (!this.uniforms.mix) {
					a.mix.call(this, w)
				}
				this.shaders.mix.textures(q);
				s.call(this, this.shaders.mix, this.uniforms.mix)
			},
			monoquad: function() {
				this.shaders.mono.uniforms(this.uniforms.monoquad);
				t.quad.call(this, this.shaders.mono)
			},
			oldmovie: function() {
				if (Math.random() < 0.04) {
					this.uniforms.jump = Math.random() * 0.02 + 0.02
				} else {
					this.uniforms.jump = 0
				}
				this.uniforms.flicker = Math.random() * 1.25;
				this.uniforms.dot0[0] = Math.random() * this.width;
				this.uniforms.dot1[0] = Math.random() * this.width;
				this.uniforms.dot2[0] = Math.random() * this.width;
				this.uniforms.dot0[1] = Math.random() * this.height;
				this.uniforms.dot1[1] = Math.random() * this.height;
				this.uniforms.dot2[1] = Math.random() * this.height;
				this.uniforms.dot0[2] = Math.random() * this.width / 60 + 1;
				this.uniforms.dot1[2] = Math.random() * this.width / 60 + 1;
				this.uniforms.dot2[2] = Math.random() < 0.05 ? this.width * 2 : Math.random() * this.width / 60 + 1;
				var w = this.uniforms.line;
				if (Math.random() < 0.025) {
					w = this.width
				} else {
					if (Math.random() < 0.05) {
						w = this.width * 0.1
					} else {
						w += (Math.random() * this.width * 0.25 - w) * 0.05
					}
				}
				this.uniforms.line = w;
				s.call(this, this.shaders.oldmovienoise, this.uniforms);
				s.call(this, this.shaders.oldmoviedirt, this.uniforms);
				s.call(this, this.shaders.sepia, this.uniforms.sepia);
				this.mainDraw()
			},
			pinch: function() {
				s.call(this, this.shaders.bulge, this.uniforms);
				this.mainDraw()
			},
			popart: function() {
				this.extraTexture.use(1);
				this.shaders.popart.textures(q);
				s.call(this, this.shaders.popart, this.uniforms);
				this.mainDraw()
			},
			popbooth: function() {
				this.extraTexture.use(1);
				this.shaders.popart.textures(q);
				s.call(this, this.shaders.popart, this.uniforms);
				this.mainDraw()
			},
			rainbow: function() {
				var w = this;
				this.mainTexture.use(0);
				this.tempTexture.drawTo(function() {
					w.shaders.rainbow.drawRect()
				}).use(1);
				this.shaders.rainbowscreen.textures(q);
				s.call(this, this.shaders.rainbowscreen);
				this.extraTexture.use(1);
				this.shaders.rainbowborder.textures(q);
				s.call(this, this.shaders.rainbowborder, this.uniforms);
				this.mainDraw()
			},
			retro: function() {
				this.extraTexture.use(1);
				this.shaders.retro.textures(q);
				s.call(this, this.shaders.retro, this.uniforms);
				this.mainDraw()
			},
			rings: function() {
				var w, y = this.uniforms.frame,
					x = this.frameTextures.length;
				this.mainTexture.use(0);
				this.frameTextures[y].drawTo(this.defaultDrawRect);
				y++;
				this.uniforms.frame = y %= x;
				for (w = x / 3; w--;) {
					this.frameTextures[(y + w * 3) % x].use(w + 1)
				}
				this.shaders.rings.textures(this.uniforms.tex);
				s.call(this, this.shaders.rings, this.uniforms);
				this.mainDraw()
			},
			softfocus: function() {
				this.shaders.softfocus.textures(q);
				this.tempTexture.drawTo(this.mirrorDrawRect).use(1);
				t.blur.call(this, Math.floor(this.width / 40));
				s.call(this, this.shaders.softfocus);
				this.mainDraw()
			},
			sparkle: function() {
				this.shaders.sparkle.textures(this.uniforms.tex);
				this.tempTexture.drawTo(this.mirrorDrawRect).use(1);
				if (!o) {
					t.blur.call(this, Math.floor(this.width / 40))
				}
				this.frameTextures[0].loadContentsOf(this.context2D.canvas).use(2);
				s.call(this, this.shaders.sparkle, this.uniforms);
				this.mainDraw()
			},
			spiral: function() {
				if (this.mainTexture.type === this.gl.FLOAT) {
					this.shaders.spiral2.textures(q);
					this.tempTexture.drawTo(this.mirrorDrawRect).use(1);
					s.call(this, this.shaders.spiral1, this.uniforms);
					s.call(this, this.shaders.spiral2, this.uniforms)
				} else {
					s.call(this, this.shaders.spiral, this.uniforms)
				}
				this.mainDraw()
			},
			splitscreen: function() {
				var w = this.uniforms.frame;
				this.mainTexture.use(0);
				this.frameTextures[w].drawTo(this.defaultDrawRect);
				w++;
				this.uniforms.frame = w %= this.frameTextures.length;
				this.frameTextures[w].use(1);
				this.shaders.splitscreen.textures(q);
				s.call(this, this.shaders.splitscreen, this.uniforms);
				this.mainDraw()
			},
			thermal: function() {
				this.extraTexture.use(1);
				this.shaders.thermal.textures(q);
				s.call(this, this.shaders.thermal);
				this.mainDraw()
			},
			trail: function() {
				this.tempTexture.use(1);
				this.shaders.trail.textures(q);
				s.call(this, this.shaders.trail);
				this.tempTexture.swapWith(this.mainTexture);
				this.mainDraw()
			},
			underwater: function() {
				s.call(this, this.shaders.underwater, this.uniforms);
				s.call(this, this.shaders.underwaterblue, this.uniforms);
				this.mainDraw()
			},
			quad: function(z) {
				var y = this,
					x = this.square ? (this.width - this.height) / this.width / 2 : 0,
					B, A = 0;
				switch (z) {
				case this.shaders.mono:
				case this.shaders.lomo:
					A = 0.004;
					break;
				case this.shaders.cartoon:
					A = 0.002;
					break
				}
				B = A * this.height / this.width;
				if (!this.uniforms.quad) {
					a.quad.call(this)
				}
				this.mainTexture.use(0);
				this.tempTexture.drawTo(function() {
					z.uniforms(y.uniforms.quad);
					switch (y.quadPos) {
					case 0:
					case 4:
						y.blackShader.drawRect(0.5, x, 1, 0.5);
						z.drawRect(0.5 - A, x + B, 1 - A, 0.5 + B);
					case 3:
						y.blackShader.drawRect(0.5, 0.5, 1, 1 - x);
						z.drawRect(0.5 - A, 0.5 - B, 1 - A, 1 - x - B);
					case 2:
						y.blackShader.drawRect(0, x, 0.5, 0.5);
						z.drawRect(A, x + B, 0.5 + A, 0.5 + B);
					case 1:
						y.blackShader.drawRect(0, 0.5, 0.5, 1 - x);
						z.drawRect(A, 0.5 - B, 0.5 + A, 1 - x - B)
					}
				}).use(0);
				this.defaultShader.drawRect()
			},
			quadcam: function() {
				t.quad.call(this, this.shaders.quadcam)
			},
			xpro: function() {
				s.call(this, this.shaders.xpro);
				if (!o) {
					s.call(this, this.shaders.xproblur, this.uniforms.xproblur1);
					s.call(this, this.shaders.xproblur, this.uniforms.xproblur2)
				}
				s.call(this, this.shaders.xproborder, this.uniforms.xproborder);
				this.mainDraw()
			}
		},
		b = {
			snow: function() {
				var F = this.context2D,
					I = this.tempContext2D,
					H = F.canvas.width,
					B = F.canvas.height,
					C = I.canvas.width,
					y = I.canvas.height,
					z, x, D, A, J, E = Math.max(1200, Math.floor(2400 / g * B)),
					G = Math.max(6, Math.floor(12 / g * B));
				F.drawImage(this.source, 0, 0, H, B);
				I.drawImage(this.source, 0, 0, C, y);
				x = I.getImageData(0, 0, C, y).data;
				z = f(x, u, C, y);
				while (this.assets.snowflakes.length < E && G) {
					G--;
					J = (Math.random() + 0.2) * B / g * 10 + 1;
					this.assets.snowflakes.push(new j(Math.random() * H, 4 - J * 2, J, Math.random() - 0.5))
				}
				for (A = 0; A < this.assets.snowflakes.length; A++) {
					D = this.assets.snowflakes[A];
					if (D.y < y / 16 || D.y > y - y / 16 || z[Math.floor(D.x) + Math.floor(D.y) * C] < 204) {
						D.vx *= 0.997;
						D.vy *= 0.997;
						D.x += D.vx;
						D.y += D.vy;
						if (D.melt < 1) {
							D.melt += 1 / 16
						} else {
							D.melt = 1
						}
						if (D.x > H + D.width) {
							D.x -= H + D.width
						}
						if (D.x < -D.width) {
							D.x += H + D.width
						}
						if (D.y > y + D.height) {
							this.assets.snowflakes.splice(A++, 1)
						}
					} else {
						if (D.melt > 0) {
							D.melt -= 1 / 128;
							D.vy = D.height * 0.3
						} else {
							this.assets.snowflakes.splice(A++, 1)
						}
					}
					F.save();
					F.globalAlpha = Math.min(1, D.melt * 4);
					F.drawImage(n.snowflake, D.x * H / C - D.width / 2, D.y * B / y - D.height / 2, D.width, D.height);
					F.restore()
				}
				this.sourceTexture.loadContentsOf(F.canvas)
			},
			sparkle: function() {
				var J = this.context2D,
					O = this.tempContext2D,
					G = n.sparkle,
					M = J.canvas.width,
					H = J.canvas.height,
					I = O.canvas.width,
					A = O.canvas.height,
					B, z, C, N, D, L, K, P, F, E = 0;
				this.sourceTexture.loadContentsOf(this.source);
				J.fillRect(0, 0, this.width, this.height);
				O.drawImage(this.source, 0, 0, I, A);
				z = O.getImageData(0, 0, I, A).data;
				B = f(z, l, I, A);
				do {
					E++;
					L = Math.floor(I * Math.random());
					K = Math.floor(A * Math.random());
					if (B[L + K * I] > 32) {
						this.assets.sparkles.push(new d(L, K, Math.random() < 0.05))
					}
				} while (this.assets.sparkles.length < 128 && E < 64);
				for (F = 0; F < this.assets.sparkles.length; F++) {
					P = this.assets.sparkles[F];
					if (P.big) {
						P.big = false;
						D = 512
					} else {
						D = z[(P.x + P.y * I) * 4] + (Math.random() - 0.5) * 16
					}
					if (D < 4 || B[P.x + P.y * I] < 32) {
						this.assets.sparkles.splice(F++, 1)
					} else {
						D *= H / 122880;
						C = G.width * D;
						N = G.height * D;
						J.drawImage(G, P.x * M / I - C / 2, P.y * H / A - N / 2, C, N)
					}
				}
			},
			underwater: function() {
				var D = this.context2D,
					z = n.bubbles,
					y = D.canvas.width,
					B = D.canvas.height,
					C = this.assets.bubbles.length,
					A, x;
				D.save();
				D.drawImage(this.source, 0, 0, y, B);
				for (A = C; A--;) {
					x = this.assets.bubbles[A] = this.assets.bubbles[A] || new e(Math.random() * y, Math.random() * B, (this.height < g / 2 ? A + 5 : A), C);
					x.x += Math.sin(x.y / 12) * 2;
					x.y -= x.size * 0.15;
					if (x.y < -x.size) {
						x.x = Math.random() * y;
						x.y = B + x.size
					}
					D.drawImage(z, x.offset, 0, x.size, x.size, Math.floor(x.x), Math.floor(x.y), x.size, x.size)
				}
				D.restore();
				this.sourceTexture.loadContentsOf(D.canvas)
			}
		},
		n, o = $("body").hasClass("mobile");

	function s(x, w) {
		this.mainTexture.use(0);
		this.swapTexture.drawTo(function() {
			x.uniforms(w).drawRect()
		}).swapWith(this.mainTexture)
	}
	function i() {
		s.call(this, this.shaders[this.id], this.uniforms);
		this.mainDraw()
	}
	function f(z, J, L, G) {
		var H = new Float32Array(L * G);
		for (var F = 0; F < z.length; F += 4) {
			z[F] = z[F] * 0.3 + z[F + 1] * 0.59 + z[F + 2] * 0.11
		}
		for (var K = L; K--;) {
			for (var I = G; I--;) {
				var E = 0;
				for (var D = 3; D--;) {
					for (var B = 3; B--;) {
						var C = K + D - 1;
						var A = I + B - 1;
						if (A >= 0 && A < G && C >= 0 && C < L) {
							E += z[(C + A * L) * 4] * J[D + B * 3]
						}
					}
				}
				H[K + I * L] = E
			}
		}
		return H
	}
	function e(w, B, z, A) {
		this.x = w;
		this.y = B;
		if (z === 0) {
			this.size = 64;
			this.offset = 0
		} else {
			if (z < A * 2 / 4) {
				this.size = 48;
				this.offset = 64
			} else {
				if (z < A * 3 / 4) {
					this.size = 32;
					this.offset = 64 + 48
				} else {
					this.size = 16;
					this.offset = 64 + 48 + 32
				}
			}
		}
	}
	function d(z, A, w) {
		this.x = z;
		this.y = A;
		this.big = w
	}
	function j(w, B, z, A) {
		this.x = w;
		this.y = B;
		this.width = z * 1.5;
		this.height = z;
		this.vx = A;
		this.vy = this.height * 0.3;
		this.melt = 1
	}
	function m(x, w, z, y) {
		this.fx = x;
		this.fy = w;
		this.sx = z;
		this.sy = y;
		this.pos = new Array(2)
	}
	m.prototype.getPos = function(w) {
		this.pos[0] = Math.cos(this.fx * w) * this.sx + 0.5;
		this.pos[1] = Math.sin(this.fy * w) * this.sy + 0.5;
		return this.pos
	};

	function c(x, B, z, w) {
		if (this.gl || !x || !B) {
			return
		}
		this.source = B;
		this.width = z || r;
		this.height = w || g;
		x.width = this.width;
		x.height = this.height;
		this.size = [this.width, this.height];
		this.center = [this.width / 2, this.height / 2];
		this.context2D = c.getContext2D(Math.max(200, Math.floor(this.width / 2)), Math.max(200 * this.height / this.width, Math.floor(this.height / 2)));
		try {
			this.gl = x.getContext("experimental-webgl", {
				premultipliedAlpha: false
			})
		} catch (C) {
			this.gl = null;
			throw C;
			return
		}
		if (!this.gl) {
			throw "WebGL error";
			return
		}
		var A = this,
			D = this.gl,
			y = D.getExtension("OES_texture_float") ? D.FLOAT : D.UNSIGNED_BYTE;
		this.sourceTexture = new k.Texture(D, 0, 0, D.RGB, D.UNSIGNED_BYTE);
		this.mainTexture = new k.Texture(D, this.width, this.height, D.RGB, y);
		this.swapTexture = new k.Texture(D, this.width, this.height, D.RGB, y);
		this.tempTexture = new k.Texture(D, this.width, this.height, D.RGB, y);
		this.defaultShader = new k.Shader(D);
		this.blackShader = k.Shader.getBlackShader(D);
		this.defaultDrawRect = function() {
			A.defaultShader.drawRect()
		};
		this.mirrorDrawRect = function() {
			A.mirrorShader.drawRect()
		};
		this.shaders = {};
		this.mirror = true;
		this.useSquare(false);
		this.setEffect()
	}
	c.loadImages = function(x, w) {
		$.ajax({
			url: k.Services.imagesURL,
			dataType: "script",
			cache: true,
			error: w,
			success: function(y) {
				if (k.getImages) {
					n = k.getImages(o);
					delete k.getImages;
					if (x) {
						x()
					}
				} else {
					if (w) {
						w()
					}
				}
			}
		})
	};
	c.getContext2D = function(z, w) {
		var x = document.createElement("canvas");
		x.width = z;
		x.height = w;
		var y = x.getContext("2d");
		if (y) {
			y.clearRect(0, 0, z, w)
		}
		return y
	};

	function p(w) {
		return w.replace(/[a-zA-Z]/g, function(x) {
			return String.fromCharCode((x <= "Z" ? 90 : 122) >= (x = x.charCodeAt(0) + 13) ? x : x - 26)
		})
	}
	c.loadEffects = function(x, w) {
		$.ajax({
			url: k.Services.shadersURL,
			cache: true,
			error: w,
			complete: function(A) {
				if (A.statusText === "OK" && A.responseText) {
					var B = window.atob(p(A.responseText)),
						z = B.split("/*:*/\n"),
						y = z.length - 1,
						C;
					while (y > 0) {
						y--;
						C = z[y].substr(3, z[y].indexOf(":*/") - 3);
						if (C) {
							v[C] = z[y]
						}
					}
					if (x) {
						x()
					}
				}
			}
		})
	};
	c.prototype.mainDraw = function() {
		this.mainTexture.use(0);
		this.defaultShader.drawRect()
	};
	c.prototype.initShader = function(y) {
		if (this.shaders[y]) {
			return true
		}
		try {
			this.shaders[y] = new k.Shader(this.gl, null, v[y] ? "uniform sampler2D texture; uniform float square; uniform vec2 texSize; varying vec2 texCoord;" + v[y] : null);
			return true
		} catch (w) {
			var x = "Shader '" + y + "' error";
			console.error(x + " : " + w);
			this.shaders[y] = this.defaultShader;
			return false
		}
	};
	c.prototype.getTexture = function(w) {
		return new k.Texture(this.gl, 0, 0, this.gl.RGBA, this.gl.UNSIGNED_BYTE, w.width && w.height ? w : null)
	};
	c.prototype.initFrameTextures = function(z, y, w) {
		var x;
		if (this.frameTextures) {
			for (x = this.frameTextures.length; x--;) {
				if (this.frameTextures[x]) {
					this.frameTextures[x].destroy();
					this.frameTextures[x] = null
				}
			}
		}
		if (z && y && w) {
			this.frameTextures = new Array(z);
			for (x = 0; x < z; x++) {
				this.frameTextures[x] = new k.Texture(this.gl, y, w, this.gl.RGB, this.gl.UNSIGNED_BYTE)
			}
			this.sourceTexture.loadContentsOf(this.source);
			for (x = 0; x < z; x++) {
				this.frameTextures[x].drawTo(this.mirrorDrawRect)
			}
		} else {
			this.frameTextures = null
		}
	};
	c.prototype.setEffect = function(x) {
		if (this.extraTexture) {
			this.extraTexture.destroy()
		}
		this.extraTexture = null;
		this.tempContext2D = null;
		this.initFrameTextures();
		this.gl.viewport(0, 0, this.width, this.height);
		this.gl.clearColor(0, 0, 0, 1);
		this.gl.clear(this.gl.COLOR_BUFFER_BIT | this.gl.DEPTH_BUFFER_BIT);
		this.mainTexture.use(0);
		this.startTime = Date.now();
		this.id = x || "normal";
		this.fps = 30;
		this.fpsGrid = 0;
		this.quality = 0.8;
		this.quadPos = 0;
		this.isQuad = false;
		this.assets = {};
		this.uniforms = {};
		var w = a[this.id];
		if (w) {
			w.call(this)
		}
		this.uniforms.square = this.square ? 1 : 0;
		this.uniforms.texSize = this.size;
		this.uniforms.time = 0;
		this.effect = t[this.id];
		if (!this.effect) {
			this.initShader(this.id);
			this.effect = i
		}
		this.canvasEffect = b[this.id];
		this.effectNum = h.indexOf(this.id) + 1;
		this.draw()
	};
	c.prototype.getEffectID = function(w) {
		return h[w - 1] || "normal"
	};
	c.prototype.previousEffect = function() {
		var w = this.effectNum - 1;
		if (w < 0) {
			w = h.length
		}
		this.setEffect(this.getEffectID(w))
	};
	c.prototype.nextEffect = function() {
		var w = this.effectNum + 1;
		w %= h.length + 1;
		this.setEffect(this.getEffectID(w))
	};
	c.prototype.useMirror = function(w) {
		this.mirror = w;
		if (this.mirrorShader) {
			this.mirrorShader.destroy()
		}
		this.mirrorShader = k.Shader.getMirrorShader(this.gl, w);
		this.setEffect(this.id);
		return this
	};
	c.prototype.useSquare = function(w) {
		this.square = w;
		this.useMirror(this.mirror);
		return this
	};
	c.prototype.getRect = function(x) {
		var w = this.width / x || 0,
			z = w / this.height,
			y = (this.square ? (this.width - this.height) / 2 + w : w) / this.width;
		return [z, y, 1 - z, 1 - y]
	};
	c.prototype.draw = function() {
		this.uniforms.time = (Date.now() - this.startTime) / 1000;
		if (this.canvasEffect) {
			this.canvasEffect()
		} else {
			this.sourceTexture.loadContentsOf(this.source)
		}
		this.mainTexture.drawTo(this.mirrorDrawRect);
		if (this.effect) {
			this.effect()
		}
	};
	c.prototype.getImage = function(x, w) {
		var y = new Image();
		this.defaultShader.drawRect();
		y.src = this.mainTexture.toImage(this.square, this.quality, x, w);
		return y
	};
	return c
}(WebcamToy));
WebcamToy.Grid = (function(b) {
	function c(f, e, d) {
		return Math.min(d, Math.max(e, f))
	}
	function a(e, g, f, h) {
		this.source = g;
		this.page = 0;
		this.totalPages = 7;
		this.itemWidth = f;
		this.itemHeight = h;
		this.gridContext2D = b.Effect.getContext2D(f, h);
		this.effects = new Array(9);
		for (var d = 0; d < 9; d++) {
			this.effects[d] = new b.Effect(e[d], this.gridContext2D.canvas, f, h)
		}
	}
	a.prototype.initPages = function(g, e, d) {
		var f = this;
		this.setPage(g, function() {
			if (e) {
				e(g)
			}
			if (g > 0) {
				setTimeout(function() {
					f.initPages(g - 1, e, d)
				}, 0)
			} else {
				if (d) {
					d()
				}
			}
		})
	};
	a.prototype.draw = function() {
		var f, d;
		this.gridContext2D.drawImage(this.source, 0, 0, this.itemWidth, this.itemHeight);
		for (d = 9; d--;) {
			f = this.effects[d];
			if (!f.fpsGrid) {
				f.draw()
			}
			f.fpsGrid++;
			f.fpsGrid %= Math.ceil(30 / f.fps)
		}
	};
	a.prototype.getEffectID = function(d) {
		return this.effects[c(Math.floor(d), 0, 9)].id
	};
	a.prototype.setPage = function(f, h) {
		var g, d;
		this.page = c(Math.floor(f), 0, this.totalPages);
		for (d = 9; d--;) {
			g = this.effects[d];
			g.setEffect(g.getEffectID(this.page * 9 + d))
		}
		if (h) {
			h(f)
		}
	};
	a.prototype.previousPage = function() {
		this.page--;
		if (this.page < 0) {
			this.page = this.totalPages - 1
		}
		this.setPage(this.page)
	};
	a.prototype.nextPage = function() {
		this.page++;
		this.page %= this.totalPages;
		this.setPage(this.page)
	};
	a.prototype.useSquare = function(e) {
		for (var d = 0; d < 9; d++) {
			this.effects[d].useSquare(e)
		}
	};
	a.prototype.useMirror = function(e) {
		for (var d = 0; d < 9; d++) {
			this.effects[d].useMirror(e)
		}
	};
	a.prototype.destroy = function() {
		if (this.effects) {
			for (var d = this.effects.length; d--;) {
				if (this.effects[d]) {
					this.effects[d].destroy();
					this.effects[d] = null
				}
			}
		}
		this.effects = null;
		this.gridContext2D = null
	};
	return a
}(WebcamToy));
WebcamToy.Audio = (function(c) {
	var b = {},
		d = {},
		e = ["countdown", "capture"];

	function a(f) {
		var g = new window.Audio();
		g.src = c.Services.audioBaseURL + f + ".ogg";
		d[f] = g
	}
	b.playTrack = function(g, f) {
		if (window.Audio) {
			setTimeout(function() {
				if (d[g]) {
					d[g].play()
				}
			}, f || 0)
		}
	};
	b.loadAudio = function() {
		if (window.Audio) {
			for (var f = e.length; f--;) {
				a(e[f])
			}
		}
	};
	return b
}(WebcamToy));
WebcamToy.Camera = (function() {
	var c = {},
		e = document.createElement("video"),
		b, f;
	navigator.getUserMedia_ = navigator.getUserMedia || navigator.webkitGetUserMedia || navigator.mozGetUserMedia || navigator.msGetUserMedia;
	c.hasGetUserMedia = (function() {
		return !!navigator.getUserMedia_
	})();

	function d(h) {
		if (e.src) {
			delete e.src
		}
		if (b) {
			b(e)
		}
	}
	function g(h) {
		if (h && h.code === 1 && f) {
			f()
		} else {
			d(h)
		}
	}
	function a(i) {
		if (navigator.mozGetUserMedia) {
			e.src = i;
			e.play();
			if (b) {
				setTimeout(b, 100, e)
			}
			$("#toy").prepend(e);
			$(e).css({
				position: "absolute",
				display: "block",
				"background-color": "#000",
				"z-index": 10
			});
			return
		}
		var j = window.URL || window.webkitURL;
		$(e).on("canplay", function() {
			$(this).off("canplay");
			if (b) {
				setTimeout(b, 100, e)
			}
		});
		try {
			e.src = j ? j.createObjectURL(i) : i;
			e.loop = e.muted = true;
			e.load()
		} catch (h) {
			d(h)
		}
	}
	c.getCamera = function(j, h) {
		if (e.src) {
			return
		}
		b = j;
		f = h;
		e.onerror = function(k) {
			e.onerror = null;
			d(k)
		};
		if (c.hasGetUserMedia) {
			try {
				navigator.getUserMedia_({
					video: true,
					audio: false
				}, a, g)
			} catch (i) {
				try {
					navigator.getUserMedia_("video", a, g)
				} catch (i) {
					d(i)
				}
			}
		} else {
			if (location.pathname === "/webcam/html5/") {
				e.src = "/webcam/html5/test-video." + (Neave.isFF || Neave.isOpera ? "ogg" : "mp4");
				e.loop = e.muted = true;
				e.load();
				setTimeout(b, 1000, e)
			} else {
				d()
			}
		}
	};
	return c
}());
(function() {
	var a = 0,
		b = 0,
		c = ["ms", "moz", "webkit", "o"];
	while (a < c.length && !window.requestAnimationFrame) {
		window.requestAnimationFrame = window[c[a] + "RequestAnimationFrame"];
		window.cancelAnimationFrame = window[c[a] + "CancelAnimationFrame"] || window[c[a] + "CancelRequestAnimationFrame"];
		a++
	}
	if (!window.requestAnimationFrame) {
		window.requestAnimationFrame = function(h, e) {
			var d = new Date().getTime(),
				f = Math.max(0, 1000 / 60 - d + b),
				g = setTimeout(function() {
					h(d + f)
				}, f);
			b = d + f;
			return g
		}
	}
	if (!window.cancelAnimationFrame) {
		window.cancelAnimationFrame = function(d) {
			clearTimeout(d)
		}
	}
}());
WebcamToy.UI = (function(z, B) {
	var ba = {},
		F = {
			capturing: false,
			sharing: false,
			grid: false,
			zooming: false,
			useCameraFlash: true,
			useCountdown: true,
			photoSaved: false,
			shareService: "",
			downloadCount: (parseInt(localStorage.getItem("downloadCount"), 10) || 1),
			downloadFilename: "",
			photoCommentNum: 0,
			postAttempt: 0,
			countdown: 0,
			quadCountdown: 0
		},
		aU, g = 0,
		Z, Q, au, a0, J, T, aG, a8, aM, a6, aw = 108,
		u, aN = $("#toy"),
		ah = $("#toy-intro"),
		aW = $("#toy-ui"),
		ax = $("#toy-view"),
		P = $("#toy-grid"),
		ar = $("#toy-view canvas"),
		ay = $("#grid-ui"),
		aQ = $("#grid-view canvas"),
		a3 = $("#grid-view p"),
		al = $("#settings form"),
		o = $("#button-settings"),
		ag = $("#button-previous"),
		aJ = $("#button-next"),
		bt = $("#button-up"),
		C = $("#button-down"),
		q = $("#button-effects"),
		h = $("#button-capture"),
		bj = $("#button-back"),
		a = $("#button-download"),
		bd = $("div.button.twitter"),
		ao = $("div.button.facebook"),
		H = $("a.button.facebook"),
		bq = $("a.button.twitter"),
		bn = $("div.button.logout"),
		aa = $("#capture-text"),
		aj = $("#capture-quad-text"),
		am = $("#toy-countdown"),
		bg = $("#prompt-back"),
		ad = $("#prompt-discard"),
		aX = $("#prompt-download"),
		K = $("#toy-share-ui footer"),
		bk = $("#prompt-login"),
		bi = $("#prompt-facebook-logout"),
		bc = $("#prompt-twitter-logout"),
		b = bi.text(),
		ap = bc.text(),
		a4 = $("#prompt-facebook-post"),
		br = $("#prompt-twitter-post"),
		n = a4.text(),
		aI = br.text(),
		W = $("#photo"),
		ac = $("#photo img"),
		aO = $("#photo form"),
		aK = $('#photo input[type="text"]'),
		ae = aK[0],
		j = $("#photo p"),
		R = aK.attr("placeholder"),
		aH = $('#photo input[type="hidden"]'),
		m = $(".button.twitter .share-posting"),
		l = $(".button.facebook .share-posting"),
		L = l.text(),
		Y = m.text(),
		bb = $("body").hasClass("mobile");

	function bf(bx, by, bw, bz, bv) {
		var bu = bv ? "fade-fast" : "fade-slow";
		by.show().addClass(bu);
		setTimeout(function() {
			by.css("opacity", bx);
			setTimeout(function() {
				by.removeClass(bu);
				if (!bx) {
					by.hide()
				}
				if (bz) {
					bz()
				}
			}, bv ? 210 : 410)
		}, bw || 0)
	}
	function aD() {
		a8 = requestAnimationFrame(S)
	}
	function S() {
		if (!Z.paused) {
			if (F.grid) {
				aG = setTimeout(aD, 1000 / 30);
				au.draw()
			} else {
				aG = setTimeout(aD, 1000 / Q.fps);
				Q.draw()
			}
		}
	}
	function f() {
		Q.quadPos = F.quadCountdown = Q.isQuad ? 4 : 0;
		if (F.quadCountdown) {
			aa.hide();
			aj.show()
		} else {
			aj.hide();
			aa.show()
		}
		Q.draw();
		al.hide();
		$("#button-effects p[class^=effect]").hide();
		$("#button-effects .effect-" + Q.id).show()
	}
	function V() {
		if (!ar || !Z) {
			return
		}
		var bu = aN.width(),
			bz = aN.height(),
			by = Q.square,
			bx = Math.round;
		if (F.grid && aQ) {
			var bA = false,
				bw = parseInt(ay.css("bottom"), 10) * 2,
				bB = Math.floor(bu / 3 - 25),
				bv = Q.square ? bB : bB / T;
			aQ.stop(true, false).each(function() {
				var bD = (bz - bw - 107) / 3,
					bC = Q.square ? bD - 2 : bD * T;
				if (bC > bB) {
					bC = bB;
					bD = bv;
					bA = true
				}
				$(this).css({
					"margin-left": Q.square ? bx((bD - 2 - (bD * T)) / 2) : 0,
					width: bx(bD * T),
					height: bx(bD)
				}).parent().stop(true, false).css({
					"margin-left": 0,
					"margin-bottom": 0,
					width: bx(bC),
					height: bx(bD)
				})
			});
			$("#grid-view>div").css("margin-top", bA ? Math.max(17, (bz - bw - bv * 3 - 82) / 2) : "")
		} else {
			if (bu / bz > (by ? 1 : T)) {
				ax.css({
					width: bx(by ? bz - 2 : bz * T),
					height: bx(bz),
					"margin-left": bx(by ? (bz - 2) / -2 : bz * T / -2),
					"margin-top": bx(bz / -2)
				});
				ar.css({
					width: bx(bz * T),
					height: bx(bz),
					"margin-left": by ? bx((bz - bz * T - 2) / 2) : 0
				})
			} else {
				ax.css({
					width: bx(bu),
					height: bx(by ? bu : bu / T),
					"margin-left": bx(bu / -2),
					"margin-top": bx(by ? bu / -2 : bu / T / -2)
				});
				ar.css({
					width: bx(by ? bu * T : bu),
					height: bx(by ? bu : bu / T),
					"margin-left": by ? bx((bu - bu * T) / 2) : 0
				})
			}
		}
	}
	function t() {
		if (F.capturing || F.sharing || F.grid) {
			return
		}
		Q.previousEffect();
		f()
	}
	function y() {
		if (F.capturing || F.sharing || F.grid) {
			return
		}
		Q.nextEffect();
		f()
	}
	function k() {
		if (F.grid) {
			au.previousPage();
			a1()
		}
	}
	function bs() {
		if (F.grid) {
			au.nextPage();
			a1()
		}
	}
	function ab() {
		if (!F.sharing) {
			Z.play();
			Q.draw();
			clearTimeout(aG);
			cancelAnimationFrame(a8);
			S()
		}
	}
	function av() {
		if (Z.paused) {
			ab()
		} else {
			Z.pause()
		}
	}
	function aV() {
		if (F.capturing || F.sharing) {
			return
		}
		Q.useMirror(!Q.mirror);
		if (au) {
			au.useMirror(Q.mirror)
		}
		if (!F.grid) {
			Q.draw()
		}
	}
	function O() {
		if (F.capturing || F.sharing) {
			return
		}
		Q.useSquare(!Q.square);
		au.useSquare(Q.square);
		if (!F.grid) {
			Q.draw()
		}
		V()
	}
	function aZ() {
		if (F.capturing || F.sharing || F.grid) {
			return
		}
		F.useCountdown = !F.useCountdown
	}
	function aY() {
		if (F.capturing || F.sharing || F.grid) {
			return
		}
		F.useCameraFlash = !F.useCameraFlash
	}
	function e() {
		var bw, bu, bv = aQ.parent().eq(Q.effectNum - au.page * 9);
		if (!bv.length) {
			bv = aQ.parent().eq(4)
		}
		if (!bv.length) {
			return null
		}
		bw = aN.offset();
		bu = bv.offset();
		return {
			left: bu.left - bw.left,
			top: bu.top - bw.top,
			width: bv.width(),
			height: bv.height()
		}
	}
	function aB() {
		if (F.capturing || F.sharing || F.zooming) {
			return
		}
		F.grid = !F.grid;
		F.zooming = true;
		var bv = Math.floor(Q.effectNum / 9);
		if (F.grid) {
			V();
			al.hide();
			bf(0, aW, 0, function() {
				setTimeout(function() {
					if (au.page !== bv) {
						au.setPage(bv)
					}
					a1();
					P.show();
					var bx = e();
					if (!bx) {
						ax.hide();
						ay.show();
						return
					}
					ay.hide().css("opacity", 0);
					ax.removeClass("toy-shadow").addClass("toy-zoom-out");
					ar.addClass("toy-zoom-out");
					setTimeout(function() {
						ax.css({
							width: bx.width,
							height: bx.height,
							"margin-left": bx.left - aN.width() / 2,
							"margin-top": bx.top - aN.height() / 2
						});
						ar.css({
							width: Q.square ? bx.width * T : bx.width,
							height: bx.height,
							"margin-left": Q.square ? (bx.width - bx.width * T) / 2 : 0
						});
						setTimeout(function() {
							ax.removeClass("toy-zoom-out");
							ar.removeClass("toy-zoom-out");
							bf(0, ax, 0, null, true);
							bf(1, ay, 210, function() {
								F.zooming = false
							}, true)
						}, 510)
					}, 0)
				}, 0)
			}, true)
		} else {
			if (au.page !== bv) {
				au.setPage(bv)
			}
			var bu = e();
			if (!bu) {
				aW.show();
				ax.show();
				ay.hide();
				P.hide();
				V();
				f();
				return
			}
			V();
			var bw = {
				width: ax.width(),
				height: ax.height(),
				"margin-left": ax.css("margin-left"),
				"margin-top": ax.css("margin-top")
			};
			ax.show().css({
				opacity: 1,
				width: bu.width,
				height: bu.height,
				"margin-left": bu.left - aN.width() / 2,
				"margin-top": bu.top - aN.height() / 2
			});
			ar.css({
				width: Q.square ? bu.width * T : bu.width,
				height: bu.height,
				"margin-left": Q.square ? (bu.width - bu.width * T) / 2 : 0
			});
			bf(0, ay, 0, null, true);
			setTimeout(function() {
				ax.addClass("toy-zoom-in").css(bw);
				ar.addClass("toy-zoom-in").css({
					width: Q.square ? Math.round(bw.width * T) : bw.width,
					height: bw.height,
					"margin-left": Q.square ? Math.round((bw.width - bw.width * T - 2) / 2) : 0
				});
				setTimeout(function() {
					ax.removeClass("toy-zoom-in").addClass("toy-shadow-fade toy-shadow");
					ar.removeClass("toy-zoom-in");
					P.hide();
					V();
					bf(1, aW, 0, null, true);
					setTimeout(function() {
						ax.removeClass("toy-shadow-fade");
						F.zooming = false
					}, 210)
				}, 410)
			}, 0);
			f()
		}
	}
	function a5() {
		if (document.webkitCancelFullScreen) {
			document.webkitCancelFullScreen()
		} else {
			if (document.mozCancelFullScreen) {
				document.mozCancelFullScreen()
			} else {
				if (document.oCancelFullScreen) {
					document.oCancelFullScreen()
				} else {
					if (document.cancelFullScreen) {
						document.cancelFullScreen()
					}
				}
			}
		}
	}
	function U() {
		var bu = aN[0];
		if (bu.webkitRequestFullScreen) {
			bu.webkitRequestFullScreen(Element.ALLOW_KEYBOARD_INPUT)
		} else {
			if (bu.mozRequestFullScreen) {
				bu.mozRequestFullScreen()
			} else {
				if (bu.oRequestFullScreen) {
					bu.oRequestFullScreen()
				} else {
					if (bu.requestFullScreen) {
						bu.requestFullScreen()
					}
				}
			}
		}
	}
	function aC() {
		if (document.webkitIsFullScreen) {
			a5()
		} else {
			U()
		}
	}
	function aT() {
		return F.downloadFilename + F.downloadCount + ".jpg"
	}
	function be() {
		setTimeout(function() {
			a.removeAttr("href")
		}, 50)
	}
	function d() {
		F.sharing = false;
		be();
		if (aO.is(":visible")) {
			bf(0, aO, 0, function() {
				aO.hide()[0].reset()
			}, true)
		}
		ab();
		ac.fadeOut(250, function() {
			W.hide().css({
				opacity: 1
			}).removeClass("photo-bottom photo-tweet");
			ac.removeClass("rotate-two photo-drop photo-img-tweet photo-shadow").attr("src", "");
			bf(0, $("#toy-share-ui"), 100, function() {
				z.Services.cancelPost();
				aq();
				H.hide();
				bq.hide();
				bn.hide();
				an();
				bi.hide();
				bc.hide();
				bg.hide();
				ad.hide();
				aX.hide();
				a0 = null;
				bf(0, aN, 0, function() {
					aN.removeClass("bg-share").addClass("bg-toy");
					$("#toy-main").css("opacity", 0);
					bf(1, aN, 0, function() {
						Q.setEffect(Q.id);
						f();
						ar.show();
						ax.show();
						bf(1, $("#toy-main"), 0, function() {
							bf(1, aW)
						})
					}, true)
				}, true)
			}, true)
		})
	}
	function i() {
		if (F.countdown) {
			var bu = F.quadCountdown,
				bw = 50,
				bv = 50;
			switch (bu) {
			case 4:
				bv = bw = 25;
				break;
			case 3:
				bv = 75;
				bw = 25;
				break;
			case 2:
				bv = 25;
				bw = 75;
				break;
			case 1:
				bv = bw = 75;
				break
			}
			if (bu) {
				am.removeClass("big")
			} else {
				am.addClass("big")
			}
			am.css({
				left: bv + "%",
				top: bw + "%",
				visibility: "visible"
			}).html("<p>" + F.countdown--+"</p>").show().delay(bu ? 300 : 400).fadeOut(bu ? 100 : 150);
			z.Audio.playTrack("countdown");
			setTimeout(i, bu ? 700 : 900)
		} else {
			if (F.quadCountdown) {
				F.quadCountdown--
			}
			setTimeout(X, 200)
		}
	}
	function aP() {
		if (B.isOpera) {
			ao.hide();
			bd.hide();
			bk.hide()
		}
		F.photoCommentNum = Math.floor(Math.random() * aH.length);
		F.postAttempt = 0;
		F.photoSaved = false;
		bf(1, $("#toy-share-ui"), 300)
	}
	function X() {
		F.capturing = false;
		if (F.quadCountdown) {
			Q.quadPos = F.quadCountdown;
			z.Audio.playTrack("capture", 125);
			if (F.useCameraFlash) {
				$("#camera-flash").show().delay(250).fadeOut(250, a2)
			} else {
				setTimeout(a2, 250)
			}
			return
		}
		F.sharing = true;
		am.hide();
		switch (F.shareService) {
		case "facebook":
			ao.removeButtonClick().buttonClick(p).removeClass("button-inactive").show();
			x("post");
			aL("facebook-post");
			bn.show();
			break;
		case "twitter":
			bd.removeButtonClick().buttonClick(c).removeClass("button-inactive").show();
			x("compose");
			aL("twitter-compose");
			bn.show();
			break;
		default:
			x("login");
			aL("disclaimer");
			break
		}
		z.Audio.playTrack("capture", 125);
		if (F.useCameraFlash) {
			$("#camera-flash").show().delay(250).fadeOut(250, aP)
		} else {
			setTimeout(aP, 250)
		}
		a0 = Q.getImage();
		aW.hide();
		ar.hide();
		ax.hide();
		aN.removeClass("bg-toy").addClass("bg-share");
		if (!F.useCameraFlash) {
			aN.hide().fadeIn(100)
		}
		ac.attr({
			src: a0.src,
			width: Q.width,
			height: Q.height
		});
		switch (Q.id) {
		case "retro":
		case "rose":
		case "xpro":
			ac.removeClass("photo-white photo-thick");
			ac.addClass("photo-black photo-thin");
			break;
		case "comicbook":
		case "hazydays":
		case "rainbow":
		case "magazine":
			ac.removeClass("photo-black photo-thick");
			ac.addClass("photo-white photo-thin");
			break;
		default:
			ac.removeClass("photo-black photo-thin");
			ac.addClass("photo-white photo-thick")
		}
		W.show();
		ac.show().css("margin-top", -50);
		setTimeout(function() {
			Z.pause();
			ac.addClass("rotate-two photo-drop").css("margin-top", 0);
			setTimeout(function() {
				ac.addClass("photo-shadow")
			}, 250)
		}, 150)
	}
	function a2() {
		if (F.capturing || F.sharing || F.grid) {
			return
		}
		al.hide();
		bf(0, aW, 0, null, true);
		F.countdown = F.useCountdown ? 3 : 0;
		F.capturing = true;
		setTimeout(i, 250)
	}
	function a7(bu) {
		return $("#button-effects .effect-" + bu).text()
	}
	function bl(bu) {
		bu = bu.replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018");
		bu = bu.replace(/'/g, "\u2019");
		bu = bu.replace(/(^|[-\u2014\[(\u2018\s])"/g, "$1\u201c");
		bu = bu.replace(/"/g, "\u201d");
		bu = bu.replace(/<3/g, "\u2665");
		bu = bu.replace(/\.\.\./g, "\u2026");
		bu = bu.replace(/(:\)|:\-\)|\=\)|:D|\=D|:3|\(:)/g, "\u263a");
		bu = bu.replace(/(:\(|:\-\(|\=\()/g, "\u2639");
		bu = bu.replace(/WE(B|D)? ?CA(M(E)?|N) ?TOY/g, "WEBCAM TOY");
		bu = bu.replace(/(W|w)(E|e)(b|d)? ?(C|c)(A|a)(m(e)?|n) ?(T|t)(O|o)(Y|y)/g, "Webcam Toy");
		bu = bu.replace(/(@|#)we(b|d)? ?ca(m(e)?|n) ?toy/ig, "$1webcamtoy");
		return bu.substr(0, aw)
	}
	function A() {
		if (Q.id === "normal") {
			return R
		}
		var bu = a7(Q.id),
			bv = bu ? aH[F.photoCommentNum || 0].value.replace("%s", bu) : R;
		return bl(bv)
	}
	function a1() {
		a3.each(function(bu) {
			$(this).text(a7(au.getEffectID(bu)))
		})
	}
	function aF(bu, bv, bw) {
		if (bw.length === 3) {
			bw = ""
		} else {
			bw += "."
		}
		bu.text(bv + bw);
		aM = setTimeout(aF, 400, bu, bv, bw)
	}
	function an() {
		$("#toy-share-ui footer p").hide()
	}
	function aL(bu) {
		an();
		if (bu) {
			$("#prompt-" + bu).show()
		}
	}
	function aq() {
		clearTimeout(aM);
		ao.find("p").hide();
		bd.find("p").hide()
	}
	function x(bu) {
		aq();
		switch (F.shareService) {
		case "facebook":
			if (bu === "posted") {
				ao.hide();
				H.show()
			} else {
				H.hide();
				ao.show();
				if (bu) {
					ao.find(".share-" + bu).show()
				}
			}
			break;
		case "twitter":
			if (bu === "posted") {
				bd.hide();
				bq.show()
			} else {
				bq.hide();
				bd.show();
				if (bu) {
					bd.find(".share-" + bu).show()
				}
			}
			break;
		default:
			$(".button .share-login").show();
			break
		}
	}
	function E() {
		F.shareService = "";
		F.postAttempt = 0;
		ao.fadeOut(200);
		H.fadeOut(200);
		bd.fadeOut(200);
		bq.fadeOut(200);
		bn.fadeOut(200);
		bi.fadeOut(100);
		bc.fadeOut(100);
		an();
		bf(0, K, 0, function() {
			aq();
			ao.removeClass("share-center button-inactive").addClass("share-left");
			bd.removeClass("share-center button-inactive").addClass("share-right");
			ao.delay(250).fadeIn(400);
			bd.delay(250).fadeIn(400);
			x("login");
			aL("disclaimer");
			bf(1, K, 250, null, true);
			bf(1, bk, 250, null, true);
			ao.removeButtonClick().buttonClick(w);
			bd.removeButtonClick().buttonClick(G)
		}, true)
	}
	function af(bw) {
		var bv = "",
			bu = "";
		if (bw && bw.error) {
			bv = bw.error.message;
			bu = bw.error.type
		}
		if (F.postAttempt < 2) {
			F.postAttempt++
		} else {
			if (/oauth/i.test(bu)) {
				z.Services.facebookLogout();
				E();
				return
			} else {
				aL("facebook-error");
				bo()
			}
		}
		x("error");
		bn.removeClass("button-inactive").addClass("active");
		ao.removeClass("button-inactive").buttonClick(p);
		if (u) {
			u("Facebook post error" + (bu ? ": " + bu : "") + (bv ? ": " + bv : ""))
		}
	}
	function bp() {
		x("posted");
		aL("facebook-posted");
		bn.removeClass("button-inactive").addClass("active");
		B.trackLink(z.Services.analyticsName, "Facebook", Q.id);
		F.postAttempt = 0;
		F.photoSaved = true
	}
	function p() {
		x("posting");
		an();
		ao.removeButtonClick().addClass("button-inactive");
		bn.removeClass("active").addClass("button-inactive");
		aF(l, L, "...");
		z.Services.facebookPost({
			image: a0,
			message: A()
		}, bp, af)
	}
	function aA() {
		if (F.shareService === "facebook") {
			return
		}
		F.shareService = "facebook";
		if (bd.is(":visible")) {
			bd.fadeOut(200)
		} else {
			bd.hide()
		}
		ao.fadeOut(200);
		bf(0, bk, 0, null, true);
		an();
		bf(0, K, 0, function() {
			x("post");
			ao.hide().delay(250).fadeIn(400);
			aL("facebook-post");
			ao.removeClass("share-left").addClass("share-center");
			bn.removeClass("twitter button-inactive").addClass("facebook active").delay(250).fadeIn(400);
			if (K.data("hover")) {
				bf(1, K, 250, null, true)
			}
			ao.removeButtonClick().buttonClick(p)
		}, true)
	}
	function s(bv, bu) {
		if (bv) {
			H.attr("href", bv);
			if (bu === "everyone") {
				B.trackLink(z.Services.analyticsName, "Facebook Album", bv)
			}
		}
	}
	function bo() {
		z.Services.facebookAlbum(s, aN.attr("data-fb-album-name"), aN.attr("data-fb-album-message"))
	}
	function N(bu) {
		if (bu) {
			if (F.sharing) {
				aA()
			}
			bo()
		}
	}
	function w() {
		z.Services.onFacebookAuth = N;
		z.Services.facebookAuth()
	}
	function I(bu) {
		if (bu && bu.fullName) {
			a4.text(n.replace("%s", bu.fullName));
			bi.text(b.replace("%s", bu.fullName));
			$("#prompt-facebook-post span,#prompt-facebook-logout span").show()
		}
	}
	function D(bu) {
		if (F.postAttempt < 2) {
			F.postAttempt++
		} else {
			if (/oauth/i.test(bu)) {
				z.Services.twitterLogout();
				E();
				return
			} else {
				aL("twitter-error")
			}
		}
		x("error");
		bn.removeClass("button-inactive").addClass("active");
		bd.removeClass("button-inactive").buttonClick(bm);
		if (u) {
			u("Twitter post error" + (bu ? ": " + bu.toString() : ""))
		}
	}
	function aR(bu) {
		J = null;
		x("posted");
		aL("twitter-posted");
		bn.removeClass("button-inactive").addClass("active");
		if (bu) {
			$("a.twitter").attr("href", bu)
		}
		B.trackLink(z.Services.analyticsName, "Twitter", Q.id);
		F.postAttempt = 0;
		F.photoSaved = true
	}
	function bm() {
		J = J || Q.getImage(Math.round(450 * T), 450);
		ae.blur();
		ae.disabled = true;
		x("posting");
		an();
		bd.removeButtonClick().addClass("button-inactive");
		bn.removeClass("active").addClass("button-inactive");
		aF(m, Y, "...");
		z.Services.twitterPost({
			image: J,
			width: Q.width,
			height: Q.height,
			message: bl(aK.val()) || A()
		}, aR, D)
	}
	function at() {
		if (F.shareService === "twitter") {
			return
		}
		F.shareService = "twitter";
		if (ao.is(":visible")) {
			ao.fadeOut(200)
		} else {
			ao.hide()
		}
		bd.fadeOut(200);
		bf(0, bk, 0, null, true);
		an();
		bf(0, K, 0, function() {
			x("compose");
			bd.hide().delay(250).fadeIn(400);
			aL("twitter-compose");
			bd.removeClass("share-right").addClass("share-center");
			bn.removeClass("facebook button-inactive").addClass("twitter active").delay(250).fadeIn(400);
			if (K.data("hover")) {
				bf(1, K, 250, null, true)
			}
			bd.removeButtonClick().buttonClick(c)
		}, true)
	}
	function ai() {
		var bw = bl(aK.val());
		if (aK.val() !== bw) {
			var bv = ae.selectionStart + bw.length - aK.val().length + 1;
			ae.focus();
			aK.val("");
			aK.val(bw);
			if (ae.setSelectionRange && bv) {
				ae.setSelectionRange(bv, bv)
			}
		}
		var bu = aw - bw.length;
		j.text(bu).removeClass("short long blur").addClass(aK.is(":focus") ? (bu < 20 ? "short" : "long") : "blur")
	}
	function aE() {
		bf(0, aO, 100, function() {
			ac.addClass("rotate-two");
			W.removeClass("photo-bottom");
			ae.blur();
			aK.val("")
		}, true)
	}
	function c() {
		ac.removeClass("rotate-two photo-drop").addClass("photo-img-tweet");
		W.addClass("photo-bottom photo-tweet");
		aK.attr("placeholder", A())[0].disabled = false;
		aO.css("opacity", 0);
		bf(1, aO, 100, function() {
			ae.focus();
			ai()
		}, true);
		bd.removeButtonClick().buttonClick(bm);
		x("post");
		aL("twitter-post")
	}
	function bh(bu) {
		if (bu) {
			br.text(aI.replace("@", "@" + bu));
			bc.text(ap.replace("@", "@" + bu));
			if (F.sharing) {
				at()
			}
		}
	}
	function G() {
		z.Services.onTwitterAuth = bh;
		z.Services.twitterAuth()
	}
	function v(bu) {
		if (bu.css("opacity") === "0") {
			bu.css("opacity", "")
		}
	}
	function aS() {
		ag.buttonClick(t);
		aJ.buttonClick(y);
		if (bb) {
			return
		}
		ar.click(function() {
			al.hide()
		});
		bt.buttonClick(k);
		C.buttonClick(bs);
		q.buttonClick(aB);
		h.buttonClick(a2);
		o.buttonClick(function() {
			al.toggle()
		});
		bj.buttonClick(d).hover(function() {
			var bu = F.photoSaved ? bg : ad;
			v(bu);
			bu.stop(true, true).fadeIn(150)
		}, function() {
			var bu = F.photoSaved ? bg : ad;
			bu.stop(true, true).delay(100).fadeOut(150)
		});
		bd.buttonClick(G);
		ao.buttonClick(w);
		$(".button.twitter,.button.facebook").hover(function() {
			v(K);
			K.data("hover", true).stop(true, true).fadeIn(150)
		}, function() {
			K.data("hover", false).stop(true, true).delay(50).fadeOut(150)
		});
		bn.buttonClick(function() {
			if (bn.hasClass("active")) {
				switch (F.shareService) {
				case "facebook":
					z.Services.facebookLogout();
					break;
				case "twitter":
					z.Services.twitterLogout();
					aE();
					break
				}
				E()
			}
		}).hover(function() {
			if (bn.hasClass("active")) {
				var bu;
				switch (F.shareService) {
				case "facebook":
					bu = bi;
					break;
				case "twitter":
					bu = bc;
					break
				}
				if (bu) {
					bu.stop(true, true).fadeIn(150, function() {
						bu.css("opacity", 1)
					})
				}
			}
		}, function() {
			if (bn.hasClass("active")) {
				var bu;
				switch (F.shareService) {
				case "facebook":
					bu = bi;
					break;
				case "twitter":
					bu = bc;
					break
				}
				if (bu) {
					bu.stop(true, true).delay(50).fadeOut(150)
				}
			}
		});
		aO.submit(B.preventDefault);
		aL("disclaimer");
		$("#setting-mirror").click(aV).mousedown(function() {
			$('label[for="setting-mirror"]').addClass("settings-active")
		}).mouseup(function() {
			$('label[for="setting-mirror"]').removeClass("settings-active")
		});
		$("#setting-square").click(O).mousedown(function() {
			$('label[for="setting-square"]').addClass("settings-active")
		}).mouseup(function() {
			$('label[for="setting-square"]').removeClass("settings-active")
		});
		$("#setting-countdown").click(aZ).mousedown(function() {
			$('label[for="setting-countdown"]').addClass("settings-active")
		}).mouseup(function() {
			$('label[for="setting-countdown"]').removeClass("settings-active")
		});
		$("#setting-flash").click(aY).mousedown(function() {
			$('label[for="setting-flash"]').addClass("settings-active")
		}).mouseup(function() {
			$('label[for="setting-flash"]').removeClass("settings-active")
		});
		$("#setting-full-screen").click(aC).mousedown(function() {
			$('label[for="setting-full-screen"]').addClass("settings-active")
		}).mouseup(function() {
			$('label[for="setting-full-screen"]').removeClass("settings-active")
		});
		aQ.parent().each(function(bu) {
			$(this).mousedown(function() {
				var bz = 0.92,
					by = $(this).find("canvas"),
					bx = parseInt(by.css("height"), 10),
					bv = Q.square ? bx : parseInt(by.css("width"), 10),
					bA = Math.floor,
					bw = Math.round;
				$(this).data("pressed", true).animate({
					"margin-left": bA((bv - (bv - (Q.square ? 2 : 0)) * bz) / 2),
					"margin-bottom": bA((bx - bx * bz) / 2),
					width: bw((bv - (Q.square ? 2 : 0)) * bz),
					height: bw(bx * bz)
				}, 100, "easeOutQuad");
				by.animate({
					"margin-left": Q.square ? bA((bx - bx * T) * bz / 2) : 0,
					width: bw(bx * T * bz),
					height: bw(bx * bz)
				}, 100, "easeOutQuad")
			}).mouseup(function(bv) {
				if ($(this).data("pressed")) {
					bv.stopPropagation();
					$(this).data("pressed", false);
					Q.setEffect(au.getEffectID(bu));
					if (F.zooming) {
						V()
					} else {
						aB()
					}
				} else {
					V()
				}
			}).mouseout(function() {
				if ($(this).data("pressed")) {
					$(this).data("pressed", false);
					V()
				}
			});
			this.onselectstart = B.preventDefault
		});
		P.mouseup(function() {
			var bu = false;
			aQ.parent().each(function() {
				if ($(this).data("pressed")) {
					bu = true;
					$(this).trigger("mouseup")
				}
			});
			if (!bu) {
				V()
			}
		});
		a.click(function() {
			$(this).attr("download", aT());
			F.downloadCount++;
			try {
				localStorage.setItem("downloadCount", F.downloadCount)
			} catch (bu) {}
			B.trackLink(z.Services.analyticsName, "Download", Q.id);
			F.photoSaved = true
		}).mousedown(function() {
			$(this).attr("href", a0.src)
		}).mouseup(be).mouseout(be).hover(function() {
			v(aX);
			aX.stop(true, true).fadeIn(150)
		}, function() {
			aX.stop(true, true).delay(100).fadeOut(150)
		})
	}
	function M() {
		if (bb) {
			return
		}
		aK.on("change input focus blur mousedown mouseup", ai);
		$(document).keydown(function(bu) {
			if (F.sharing) {
				if (aK.is(":focus")) {
					return
				}
				if (bu.metaKey && bu.keyCode === 8) {
					d();
					return
				}
			}
			if (bu.altKey || bu.ctrlKey || bu.shiftKey || bu.metaKey || F.zooming) {
				return
			}
			switch (bu.keyCode) {
			case 8:
				bu.preventDefault();
				break;
			case 32:
				if (!F.grid) {
					h.addClass("button-active")
				}
				break;
			case 37:
				if (F.grid) {
					bt.addClass("button-active")
				} else {
					ag.addClass("button-active")
				}
				break;
			case 38:
				if (F.grid) {
					bt.addClass("button-active")
				}
				break;
			case 39:
				if (F.grid) {
					C.addClass("button-active")
				} else {
					aJ.addClass("button-active")
				}
				break;
			case 40:
				if (F.grid) {
					C.addClass("button-active")
				}
				break;
			case 67:
				if (!F.grid) {
					$('#setting-countdown,label[for="setting-countdown"]').addClass("settings-active")
				}
				break;
			case 70:
				if (!F.grid) {
					$('#setting-flash,label[for="setting-flash"]').addClass("settings-active")
				}
				break;
			case 71:
				if (!F.grid) {
					q.addClass("button-active")
				}
				break;
			case 73:
				if (!F.grid) {
					o.addClass("button-active")
				}
				break;
			case 77:
				if (!F.grid) {
					$('#setting-mirror,label[for="setting-mirror"]').addClass("settings-active")
				}
				break;
			case 83:
				if (!F.grid) {
					$('#setting-square,label[for="setting-square"]').addClass("settings-active")
				}
				break
			}
		}).keyup(function(bu) {
			if (F.sharing && aK.is(":focus")) {
				if (bu.keyCode === 13) {
					bm()
				}
				return
			}
			if (bu.altKey || bu.ctrlKey || bu.shiftKey || bu.metaKey || F.zooming) {
				return
			}
			switch (bu.keyCode) {
			case 8:
				bu.preventDefault();
				break;
			case 27:
				a5();
				break;
			case 32:
				if (F.grid) {
					aB()
				} else {
					h.removeClass("button-active");
					a2()
				}
				break;
			case 37:
				if (F.grid) {
					bt.removeClass("button-active");
					k()
				} else {
					ag.removeClass("button-active");
					t()
				}
				break;
			case 38:
				if (F.grid) {
					bt.removeClass("button-active");
					k()
				}
				break;
			case 39:
				if (F.grid) {
					C.removeClass("button-active");
					bs()
				} else {
					aJ.removeClass("button-active");
					y()
				}
				break;
			case 40:
				if (F.grid) {
					C.removeClass("button-active");
					bs()
				}
				break;
			case 67:
				if (!F.grid) {
					aZ();
					$('#setting-countdown,label[for="setting-countdown"]').removeClass("settings-active");
					$("#setting-countdown")[0].checked = F.useCountdown
				}
				break;
			case 70:
				if (!F.grid) {
					aY();
					$('#setting-flash,label[for="setting-flash"]').removeClass("settings-active");
					$("#setting-flash")[0].checked = F.useCameraFlash
				}
				break;
			case 71:
				q.removeClass("button-active");
				aB();
				break;
			case 73:
				if (!F.grid) {
					o.removeClass("button-active");
					!F.capturing && !F.sharing && !F.grid && al.toggle()
				}
				break;
			case 77:
				if (!F.grid) {
					$('#setting-mirror,label[for="setting-mirror"]').removeClass("settings-active")
				}
				aV();
				$("#setting-mirror")[0].checked = Q.mirror;
				break;
			case 80:
				av();
				break;
			case 83:
				if (!F.grid) {
					$('#setting-square,label[for="setting-square"]').removeClass("settings-active")
				}
				O();
				$("#setting-square")[0].checked = Q.square;
				break
			}
		})
	}
	function ak() {
		T = Z.videoWidth / Z.videoHeight || (bb ? 3 / 4 : 4 / 3);
		if (Z.videoWidth) {
			B.trackLink(z.Services.analyticsName, "Resolution", Z.videoWidth + "x" + Z.videoHeight)
		}
		if (Q) {
			Q.destroy()
		}
		Q = new z.Effect(ar[0], Z, 800, Math.floor(800 / T));
		if (!bb) {
			if (au) {
				au.destroy()
			}
			au = new z.Grid(aQ, Z, 200, Math.floor(200 / T))
		}
	}
	function r(bu) {
		bu.preventDefault();
		if (Q) {
			if (u) {
				u("WebGL context lost")
			}
			clearTimeout(aG);
			cancelAnimationFrame(a8);
			Q.destroy();
			Q = null;
			ah.css("opacity", 1).show();
			$("#toy-main,#toy-ui").hide()
		}
		if (au) {
			au.destroy();
			au = null
		}
	}
	function a9() {
		if (!Q) {
			if (u) {
				u("WebGL context restored")
			}
			ak();
			V();
			ab();
			ah.hide();
			$("#toy-main,#toy-ui").show()
		}
	}
	ba.loadImages = function() {
		var bu = ["dark-wood.jpg", "video.svg", "camera.svg", "gear.png", "check.svg", "twitter.svg", "facebook.svg", "power.svg", "dark-linen.jpg"];
		bu.forEach(function(bw) {
			var bv = new Image();
			bv.src = z.Services.imagesBaseURL + bw
		})
	};

	function az() {
		if (bb) {
			aV()
		} else {
			F.downloadFilename = a.attr("data-download");
			F.downloadFilename = F.downloadFilename.substr(0, F.downloadFilename.indexOf("."));
			$("#button-effects p span").remove();
			$("#setting-mirror")[0].checked = Q.mirror;
			$("#setting-square")[0].checked = Q.square;
			$("#setting-countdown")[0].checked = F.useCountdown;
			$("#setting-flash")[0].checked = F.useCameraFlash;
			$("body").on("webkitfullscreenchange", function() {
				$("#setting-full-screen")[0].checked = document.webkitIsFullScreen
			}).on("mozfullscreenchange", function() {
				$("#setting-full-screen")[0].checked = document.mozIsFullScreen
			});
			$(document).on("webkitvisibilitychange mozvisibilitychange", function() {
				if (document.hidden || document.webkitHidden || document.mozHidden) {
					Z.pause()
				} else {
					ab()
				}
			});
			ax.addClass("toy-shadow");
			if (!B.isOpera) {
				z.Services.twitterInit();
				z.Services.onFacebookUser = I;
				z.Services.facebookUser()
			}
		}
		f();
		aS();
		$(window).resize(V);
		V();
		ab();
		ah.removeClass("wait");
		$("#intro-logo").fadeOut(150, function() {
			$(this).remove()
		});
		bf(0, ah, 100, function() {
			bf(1, $("#toy-main"), 0, function() {
				bf(1, aW, 0, M)
			})
		}, true)
	}
	ba.init = function(bu, bv) {
		if (Z) {
			return
		}
		Z = bu;
		u = bv;
		ar.on("webglcontextlost", r).on("webglcontextrestored", a9);
		aQ.on("webglcontextlost", r);
		try {
			ak()
		} catch (bw) {
			if (u) {
				u(bw)
			}
			return
		}
		if (au) {
			au.initPages(au.totalPages, function(by) {
				var bx = Math.round(Math.max(0, Math.min(1, (au.totalPages - by + 1) / (au.totalPages + 1))) * 100);
				$("#prompt-loading span").text(bx + "%")
			}, az)
		} else {
			az()
		}
	};
	return ba
}(WebcamToy, Neave));