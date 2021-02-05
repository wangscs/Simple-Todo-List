
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
	name: "Welcome to my todolist"
});

const item2 = new Item ({
	name: "Enter todo task in new item"
});

const item3 = new Item ({
	name: "Press checkmark to delete task"
});

const defaultItems = [item1, item2, item3];

const listSchema = {
	name: String,
	items: [itemSchema]
}

const List = mongoose.model("list", listSchema);


// Route that returns the homepage of the todo list website
app.get("/", function(req, res){
	const day = date.getDate();
	Item.find({}, function(err, foundItems){
		if(foundItems.length === 0){
			Item.insertMany(defaultItems, function(err){
				if(err){
					console.log(err);
				} else {
					console.log("Successfully inserted default items");
				}
			});
			res.redirect("/");
		} else {
			res.render("list", {
				listTitle: day,
				newListItems: foundItems,
			});
		}
	});
});

/** 
 * Get route method that searches for a list in DB,
 * if no list exists, create a new list with param name
 * otherwise, retrieve and render that existing list
 */
app.get("/:customListName", function(req, res){
	// Access req.params.paramsName
	const customListName = req.params.customListName;

	List.findOne({name: customListName}, function(err, foundList){
		if(!err){
			if(!foundList){
				// Create a new list
				const list = new List({
					name: customListName,
					items: defaultItems
				});
				list.save();
				res.redirect("/" + customListName)
			} else {
				res.render("list", {
					listTitle: foundList.name,
					newListItems: foundList.items
				});
			}
		}
	});
});


/*  Appends new todo item into specified array and 
		redirects user to the appropriate todo list
*/
app.post("/", function(req, res){
	const itemName = req.body.newItem;
	const listName = req.body.list;

	const item = new Item ({
		name: itemName
	});

	const day = date.getDate();
	
	if(listName === day){
		item.save();
		res.redirect("/");
	} else {
		List.findOne({name: listName}, function(err, foundList){
			foundList.items.push(item);
			foundList.save();
			res.redirect("/" + listName);
		});
	}
	
	item.save();
	res.redirect("/");

	if(req.body.list === "Work") {
		workItems.push(item);
		res.redirect("/work");
	} else {
		Item.insertMany(itemName, function(err){
			if(err){
				console.log(err);
			} else {
				console.log("Successfully inserted item");
			}
		});
		res.redirect("/");
	}
});

app.post("/delete", function(req, res){
	const checkedItemID = req.body.checkbox;

	Item.findByIdAndRemove(checkedItemID, function(err){
		if(err){
			console.log(err);
		} else {
			console.log("Successfully deleted item")
		}
	});
	res.redirect("/");
});

app.listen(3000, function(){
    console.log("Server started on port 3000");
});