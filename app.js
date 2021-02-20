require("dotenv").config();
const express = require("express");
const bodyParser = require("body-parser");
const mongoose = require("mongoose");
const _ = require("lodash");

const app = express();

app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));

// Connection to mongoDB
mongoose.connect(process.env.MONGODBURI, {useNewUrlParser: true, useUnifiedTopology: true, useFindAndModify: false});

const itemSchema = {
	name: String
}
const Item = mongoose.model("item", itemSchema);

const listSchema = {
	name: String,
	items: [itemSchema]
}
const List = mongoose.model("list", listSchema);

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

/**
 * Get route method that retrieves the home page from server,
 * Uses current date as title and inserts default items if
 * the list is empty
 */
app.get("/", function(req, res){
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
				listTitle: "Today",
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
	const customListName = _.capitalize(req.params.customListName);

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

/**
 * Appends new todo item into specified list and 
 * redirects user to the appropriate todo list 
 */
app.post("/", function(req, res){
	const itemName = req.body.newItem;
	const listName = req.body.list;

	const item = new Item ({
		name: itemName
	});

	if(listName === "Today"){
		item.save();
		res.redirect("/");
	} else {
		List.findOne({name: listName}, function(err, foundList){
			foundList.items.push(item);
			foundList.save();
			res.redirect("/" + listName);
		});
	}
});

/**
 * Delete route method that removes items from specified list in
 * db after user has checked them off
 */
app.post("/delete", function(req, res){
	const checkedItemID = req.body.checkbox;
	const listName = req.body.listName;

	if(listName === "Today"){
		Item.findByIdAndRemove(checkedItemID, function(err){
			if(err){
				console.log(err);
			} else {
				console.log("Successfully deleted item");
			}
		});
		res.redirect("/");
	} else {
		List.findOneAndUpdate({name: listName},	{$pull: {items: {_id: checkedItemID}}},	function(err, foundList){
			if(!err){
				res.redirect("/" + listName);
			} else {
				console.log(err);
			}
		});
	}
});

/**
 * Server port, will use Heroku and if not, will
 * default to local port 3000
 */
let port = process.env.PORT;
if(port == null || port == ""){
	port = 3000;
}

app.listen(port, function(){
    console.log("Server has started successfully");
});