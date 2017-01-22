/*jslint indent: 2*/
/*jslint todo: true */
/*jslint plusplus: true */
/*jslint regexp: true */
/*jslint vars: true */
/*jslint node: true */
/*jslint browser: true */
/*global Nedb, Vue, d3, a, moment, location */

'use strict'

// create / use existing Nedb database
var db = new Nedb({
  filename: 'posts6.jsonl',
  autoload: true
})

// create blog
var blog = new Vue({
  el: '#app',               // attached to '#app'
  data: {
    posts: [],              // contains all posts
    title: '',              // current post title
    time: '',               // current post time
    content: '',            // current post content
    currentPost: 0,         // currently viewed / edited post
    currentEditURL: '',     // URL to edit the post
    isEditing: false        // weather the content can be edited currently
  },
  methods: {
    getAllPosts: function (callback) {
      // if we have the posts already
      if (blog.posts.length > 0) {
        // if response is requested, send existing Vue contents
        if (callback && typeof callback === 'function') {
          callback(blog.posts)
        }
      } else {
        // if don't, get them
        db.find({}).sort({createdAt: -1}).exec(function (err, results) {
          if (err) {
            a(err)
          } else {
            // add results to Vue object
            blog.posts = results
            // if response is requested, send updated Vue contents
            if (callback && typeof callback === 'function') {
              callback(blog.posts)
            }
          }
        })
      }
    },
    findPost: function (id, callback) {
      // first make sure, the data is there
      blog.getAllPosts(function () {
        // then sort it do find the right post
        var thisPost = blog.posts.filter(function (post) {
          return post._id === id
        })
        callback(thisPost)
      })
    },
    e404: function () {
      d3.select('#singlePost').classed('hidden', true)
      d3.select('#e404').classed('hidden', false)
    },
    disableEditing: function () {
      blog.isEditing = false // switches class 'editing', which shows submit button and borders for input and textarea
      document.getElementById('postContent').disabled = true
      document.getElementById('postTitle').disabled = true
    },
    enableEditing: function () {
      blog.isEditing = true // switches class 'editing', which shows submit button and borders for input and textarea
      document.getElementById('postContent').disabled = false
      document.getElementById('postTitle').disabled = false
    },
    savePost: function (e) {

      // disable submitbutton for the time of request
      e.target.disabled = true

      // create new post object
      var newPost = {
        title: blog.title,
        content: blog.content,
        createdAt: new moment().format('x').toString()
      }

      // add to nedb DB
      db.insert(newPost, function (err, response) {

        // reenable submit button
        e.target.disabled = false

        if (err || !response._id) {
          a(err)
        } else {
          // if everything is OK, add to blog.posts with the new ID
          newPost._id = response._id
          blog.posts.unshift(newPost)
          // and go to watch the new post
          location.href = '#/post/' + response._id
        }
      })
    },
    updatePost: function (e) {

      // disable submitbutton for the time of request
      e.target.disabled = true

      // prepare data for updating
      var newPost = {
        title: blog.title,
        content: blog.content,
        updatedAt: new moment().format('x').toString()
      }

      // update db
      db.update({ _id: blog.currentPost }, { $set: newPost }, function (err, numReplaced) {
        // enable submit again
        e.target.disabled = false
        if (err) {
          a(err)
        } else {
          // find post
          blog.findPost(blog.currentPost, function (response) {
            // update vue
            response[0].title = blog.title
            response[0].content = blog.content
            // and go watch it
            location.href = '#/post/' + blog.currentPost
          })
        }
      })
    }
  }
})
