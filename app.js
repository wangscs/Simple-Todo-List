
const express = require("express");
const bodyParser = require("body-parser");
const date = require(__dirname + "/date.js");
const mongoose = require("mongoose");

const app = express();

app.set("view engine", "ejs");

app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// Connection to mongoDB
mongoose.connect("mongodb://localhost:27017/todolistDB", {useNewUrlParser: true, useUnifiedTopology: true});

const itemSchema = {
	name: String
}

const Item = mongoose.model("item", itemSchema);

const item1 = new Item ({
	name: "Default test item 1"
});

const item2 = new Item ({
	name: "Default test item 2"
});

const item3 = new Item ({
	name: "Default test item 3"
});

const defaultItems = [item1, item2, item3];

// Item.insertMany(defaultItems, function(err){
// 	if(err){
// 		console.log(err);
// 	} else {
// 		console.log("Successfully inserted many items");
// 	}
// });



// Route that returns the homepage of the todo list website
app.get("/", function(req, res){
	const day = date.getDate();

	Item.find({}, function(err, foundItems){
		if(err){
			console.log(err);
		} else {
			res.render("list", {
				listTitle: day,
				newListItems: foundItems,
			});
		}
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