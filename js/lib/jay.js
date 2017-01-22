/*jslint indent: 2*/
/*jslint todo: true */
/*jslint plusplus: true */
/*jslint regexp: true */
/*jslint vars: true */
/*jslint browser: true */
/*global console, crossroads, d3, CustomStorage, ga, J, hasher, ActiveXObject */

function cl(data) {
  'use strict';
  if (window.console) {
    console.log(data);
  }
}

function ce(data) {
  'use strict';
  if (window.console) {
    console.error(data);
  }
}

// CREATE ALERTS
function a(message) {
  'use strict';
  var alertMessage = document.getElementById("alertMessage");
  alertMessage.innerHTML = "";
  alertMessage.innerHTML = message;
  d3.select("#alert").transition().duration(1000).style("opacity", "0.8").style("bottom", "0px");

  setTimeout(function () {
    d3.select("#alert").transition().duration(1000).style("opacity", "0").style("bottom", "-50px");
  }, 4000);
}

// CLOSE ALERTS
d3.select("#closeAlert").on('click', function () {
  'use strict';
  event.preventDefault();
  d3.select("#alert").transition().duration(1000).style("opacity", "0").style("bottom", "-50px");
});

/*
  MANIPULATE CLASSES
*/

function hasClass(el, className) {
  'use strict';
  return el.classList ? el.classList.contains(className) : new RegExp('\\b' + className + '\\b').test(el.className);
}

function addClass(el, className) {
  'use strict';
  if (el.classList) {
    el.classList.add(className);
  } else if (!hasClass(el, className)) {
    el.className += ' ' + className;
  }
}

function removeClass(el, className) {
  'use strict';
  if (el.classList) {
    el.classList.remove(className);
  } else {
    el.className = el.className.replace(new RegExp('\\b' + className + '\\b', 'g'), '');
  }
}


window.J = (function () {

  'use strict';

  // TODO CHECK IF LIVERELOAD EXISTS AND IF IT DOES, ADD IT.... LOOSLY OR COUPLED? AND WITH WHAT?

  function request (url, type, payload, callback) {

    if (typeof navigator.onLine === "boolean" && !navigator.onLine) {
      callback({ error: "offline" })
    }

    var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP')

    xhr.open(type, url)

    var token = J.storage.get('token') || false    // token should be implemented, but implementations may vary

    xhr.setRequestHeader('Authorization', 'Bearer ' + token)

    xhr.onerror = function (err) {
      callback({error: err})
    }

    xhr.onreadystatechange = function () {
      if (xhr.readyState > 3) {
        if (xhr.status >= 200 && xhr.status < 400) {
          var resp
          try {
            resp = JSON.parse(xhr.responseText)
          } catch (e) {
            resp = xhr.responseText
          }
          callback(resp)
        } else {
          callback({error: xhr.responseText})
        }
      }
    }

    xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest')

    if (typeof payload.entries === "undefined") { // if this is FormData, typeof payload.entries === "function"
      payload = JSON.stringify(payload)
      xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
    }   // We'll assume it's FormData otherwise

    xhr.send(payload)
  }

  return {

    storage: new CustomStorage('J'),

    ajax: {
      get: function (url, callback) {
        request(url, "GET", false, function(response) {
          callback(response)
        })
      },
      post: function (url, payload, callback) {
        request(url, "POST", payload, function(response) {
          callback(response)
        })
      },
      put: function (url, payload, callback) {
        request(url, "PUT", payload, function(response) {
          callback(response)
        })
      },
      remove: function (url, callback) {
        request(url, "DELETE", false, function(response) {
          callback(response)
        })
      }
    },
    get: function (table, id, callback) {
      var url = "api/j/?table=" + table + '&id=' + id + '&limit=1'
      J.ajax.get(url, function (data) {
        callback(data)
      })
    },
    post: function (table, payload, callback) {
      var url = "api/j/?table=" + table
      J.ajax.post(url, payload, function (data) {
        callback(data)
      })
    },
    put: function (table, id, payload, callback) {
      var url = "api/j/?table=" + table + '&id=' + id
      J.ajax.put(url, payload, function (data) {
        callback(data)
      })
    },
    remove: function (table, id, callback) {
      var url = "api/j/?table=" + table + '&id=' + id
      J.ajax.remove(url, function (data) {
        callback(data)
      })
    },
    query: function (table, limit, key, value, order, callback) {
      var url = "api/j/query/?table=" + table + '&limit=' + limit + '&key=' + key + '&value=' + value  + '&order=' + order
      J.ajax.get(url, function (data) {
        callback(data)
      })
    },
    route: function (route, id, callback) {

      switch (arguments.length) {

        // only route presented
        case 1:
          ce("J.Error: Only one argument presented to J.route");
          break;

        // two arguments present
        case 2:
          if (typeof arguments[1] === 'function') {
            var thisFunction = function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
              // TODO PERHAPS NO CLEARAPP HERE?
              if (id) { // THAT'S ID AS CALLBACK
                id(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
              }
            }
            crossroads.addRoute(route, thisFunction);
          } else if (typeof arguments[1] === 'string') {
            // IT'S A ELEMENT CONSTRUCTOR
            var thisFunction = function(id) {
              J.clearApp();
              d3.select(id).classed('hidden', false);
            }
            crossroads.addRoute(route, thisFunction);
          } else {
            ce("J. Error: ID of active element or callback expected as last argument to J.route")
          }
          break;

        // Route, id and callback present
        case 3:
          // SINCE THERE ARE CURRENTLY ONLY THREE POSSIBLE ARGUMENTS, WE TRUST, THAT SINCE 3 ARE PRESENT, THEY ARE  CORRECT
          var thisFunction = function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
            J.clearApp();
            d3.select(id).classed('hidden', false);
            if (callback) {
              callback(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
            }
          }

          crossroads.addRoute(route, thisFunction);
          break;

        case 4:
          // WE TRUST THIS TO BE route.auth();
          var thisFunction2 = function(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10) {
            J.isUser(function() {
              J.clearApp();
              d3.select(id).classed('hidden', false);
              if (callback) {
                callback(a1, a2, a3, a4, a5, a6, a7, a8, a9, a10);
              }
            }, function () {
              //a("Please log in")
              // TODO location.href = "#/login?redirect=" + route;
              location.href = "#/login";
            });
          }

          crossroads.addRoute(route, thisFunction2);
          break;

        default:
          ce("J.Error: not enough or too many arguments presented to J.route");
      }

    },

    // TODO route.auth();
    route_auth: function (newRoute, id, callback) {
      J.route(newRoute, id, callback, true);
    },

    clearApp: function () {
      var nodes = document.getElementById('app').childNodes;
      var i;
      for (i = 0; i < nodes.length; i++) {
        if (nodes[i].nodeName.toLowerCase() === 'div' || nodes[i].nodeName.toLowerCase() === 'table') {
          addClass(nodes[i], 'hidden');
        }
      }
    },
    addGA: function (id) {
      if (id) { // Google analytics.
        ga('create', id, 'auto');
        ga('send', 'pageview');
        J.hasGA = true;
      }
    },
    append: function (newContent) {
      this.innerHTML = this.innerHTML + newContent;
    },
    start: function () {
      // clear app on page load
      J.clearApp();

      // that's a 404 if the route structure is not matched
      // TODO 404 IS NOT WORKING properly
      crossroads.bypassed.add(function () {
        J.clearApp();
        d3.select("#e404").classed("hidden", false);
      });

      //setup hasher
      // hasher let's you know when route is changed
      function parseHash(newHash) {
        crossroads.parse(newHash);
      }
      hasher.initialized.add(parseHash); //parse initial hash
      hasher.changed.add(parseHash); //parse hash changes
      hasher.init(); //start listening for history change

    },

    auth: {
      login: function (data, callback) {

        var stringifiedData;
        if (typeof data === 'object') {
          stringifiedData = JSON.stringify(data);
        } else {
          ce("J.Error: Please pass an object with username and password to J.Authtenticate()");
        }

        var xhr = window.XMLHttpRequest ? new XMLHttpRequest() : new ActiveXObject('Microsoft.XMLHTTP');

        xhr.open('POST', 'api/j/authenticate');

        xhr.onerror = function (err) {
          console.log(err);
        };

        xhr.onreadystatechange = function () {
          if (xhr.readyState === 4) {
            if (xhr.status === 200) {
              var response = JSON.parse(xhr.responseText);
              J.storage.set('token', response.token); // TODO HOW COME THIS WORKS WITHOUT PARSING?
              J.user = 1;
              J.username = response.fullName || response.username;
              J.userId = response.id;
              callback(response);

            } else {
              callback({error: "Unauthorized"});
            }
          }
        }

        xhr.setRequestHeader('X-Requested-With', 'XMLHttpRequest');
        xhr.setRequestHeader('Content-Type', 'application/json; charset=UTF-8');
        xhr.send(stringifiedData);

        return xhr;
      },
      logout: function () {

        J.user = 0;
        J.username = false;
        J.userId = false;

        J.ajax.get('api/j/logout', function (response) {
          J.storage.set("token", "")
          if (response.status !== "ok") {
            a("logging out failed")
          }
        })
      },
      test: function () {
        if (J.user !== 1) {
          J.user = 'loading';
          J.ajax.get('api/j/test', function (response) {
            if (response.error) {
              J.user = 0;
            } else {
              J.user = 1;
              J.username = response.fullName || response.username;
              J.userId = response.id;
            }
          });
        }
      }
    },

    isUser: function (isLoggedIn, notLoggedIn) {
      // if it's a user
      if (J.user === 1) {
        isLoggedIn();
      } else if (J.user === 'loading') {
        // if we are not sure yet
        var i = 0;
        var waitForAuth = setInterval(function () {

          if (J.user === 1) {
            isLoggedIn();
            clearInterval(waitForAuth);
          }
          if (J.user === 0) {
            if (typeof notLoggedIn === 'function') {
              notLoggedIn();
            }
            clearInterval(waitForAuth);
          }
          if (i === 40) {
            if (typeof notLoggedIn === 'function') {
              notLoggedIn();
            }
            ce('J.Error: Failed to wait for a response from Auth server.');
            clearInterval(waitForAuth);
          }
          i++;
        }, 200);
      } else {
        if (typeof notLoggedIn === 'function') {
          notLoggedIn();
        }
      }
    }
  }

}());
