Vue-Diary
===================

How use VueJS only as a templating engine.   
Relies on custom routing and does not use webpack.    

It also demonstrates how to use Vue without MVVM architecture, but rather with a MVC (model-view-controller) like approach.   
Model and view are handled by Vue and controller with routing.  

*Using a custom routing with Vue.*   
a. in our case, routing is created in collaboration between Crossroads (depending on signals and hasher) and a custom version of Jay (slightly depending on d3).  
b. in our case, all of the blogging functionality is present in blog Vue object and routing deals with:   
b.1. Letting Vue know about the current active post.  
b.2.2 Enables or disables editing functionality (since our blogs one post view, new post add and one post edit are actually in just the same <div>)  
c. We communicate with Vue by directly manipulating the blog.posts array and other properties (title, content, time) of blog object.  

*Reactivity*  
It also demonstrates a way to solve a common problem in Single Page App development -   
keeping the data (and visualisation of data) in sync between front- and backend:  
a. we keep our front end data inside Vue object in blog.posts.  
b. If possible we use the data blog.posts already has - in our case we don't query the backend if we have the data already.  
c. If the data is updated we wait until backend confirms the update, then update the Vue object.   
d. With Vue we do not have to worry about updating the html changes ourselves, since Vue is reactive and updates html itself.  

*Blog functionality:*   
Blog has the following methods:  
getAllPosts(callback) - If blog.posts is not an empty array, downloads all posts from nedb, otherwise responds with posts.  
findPost(id, callback) - calls getAllPosts just to make sure data is there and then returns the one post that was looked for.  
e404() - shows the Error 404 page.  
disableEditing() - disabled editing for this post.  
enableEditing() - enabled editing for this post.  
savePost(event) - save new post.  
updatePost(event) - update currently edited post.   

*Routing:*   
"/" - displays "#frontPage", and hides other in "#app"  
"/add" - Add new post -  displays '#singlePost', and hides other in "#app"  
"/post/{id}" - View one post - displays '#singlePost', and hides other in "#app"  
"/edit/{id}" - Edit one post - displays '#singlePost', and hides other in "#app"  
