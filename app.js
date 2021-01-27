
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

const items = [];
const workItems = [];

// Route that returns the homepage of the todo list website
app.get("/", function(req, res){
	const day = date.getDate();
	res.render("list", {
		listTitle: day,
		newListItems:items,
	});
});

// Route that returns the work page of the todo list
app.get("/work", function(req, res){
	res.render("list", {
		listTitle: "Work List",
		newListItems: workItems,
	})
});

/*  Appends new todo item into specified array and 
		redirects user to the appropriate todo list
*/
app.post("/", function(req, res){
	const item = req.body.newItem;

	if(req.body.list === "Work") {
		workItems.push(item);
		res.redirect("/work");
	} else {
		items.push(item);
		res.redirect("/");
	}
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});