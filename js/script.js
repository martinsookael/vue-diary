/*jslint indent: 2*/
/*jslint todo: true */
/*jslint plusplus: true */
/*jslint regexp: true */
/*jslint vars: true */
/*jslint node: true */
/*jslint browser: true */
/*global J, blog, location, moment */

'use strict'

// route '/' triggers #frontpage to be visible, and else in #app hidden.
J.route('/', '#frontPage', function () {
  // getAllPosts makes sure, the data is downloaded from db and added to Vue
  // index.html will just show results when they arrive.
  blog.getAllPosts()
})

// route '/add' triggers #singlePost to be visible, and else in #app hidden.
J.route('/add', '#singlePost', function () {

  // reset current post
  blog.currentPost = 0

  // enable editing functionalities
  blog.enableEditing()

  // clear form
  blog.title = ''
  blog.content = ''

  // make clock tick every 1 second.
  function tick () {
    setTimeout(function () {
      if (location.hash === '#/add') {
        // if page stays in same URL, tick 1 sec
        blog.time = new moment()
        tick()
      }
    }, 1000)
  }

  // start ticking
  tick()

  // saving is handled by vue function savePost called from index.html

})

// route '/post/{id}' triggers #singlePost to be visible, and else in #app hidden.
J.route('/post/{id}', '#singlePost', function (id) {

  // disable editing functionality
  blog.disableEditing()

  // prepare link to edit post
  blog.currentEditURL = '#/edit/' + id

  // find the right post from blog.posts
  blog.findPost(id, function (response) {
    if (response.length === 0) {
      // if not found, show error 404
      blog.e404()
    } else {
      // if post is found, display it's title, content and date
      var post = response[0]
      blog.title = post.title
      blog.content = post.content
      blog.time = new moment(post.createdAt, 'x')
    }
  })
})

// route '/edit/{id}' triggers #singlePost to be visible, and else in #app hidden.
J.route('/edit/{id}', '#singlePost', function (id) {

  // set current post
  blog.currentPost = id

  // enable editing
  blog.enableEditing()

  // get the post existing data from Vue or from database
  blog.findPost(id, function (response) {
    if (response.length === 0) {
      blog.e404()
    } else {
      // set post title and content
      blog.title = response[0].title
      blog.content = response[0].content
    }
  })

  // updating is handled by vue function updatePost called from index.html

})

// start router
J.start()
