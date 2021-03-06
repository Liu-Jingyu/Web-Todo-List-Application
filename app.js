const express = require("express");
const bodyParser = require ("body-parser");
const date = require(__dirname+"/date.js");
const mongoose = require('mongoose');
const _=require("lodash");
const app = express();
app.set("view engine", "ejs");
app.use(bodyParser.urlencoded({extended:true}));
app.use(express.static("public"));
//"mongodb+srv://Jingyu:123@cluster0-zwfjp.mongodb.net/ItemDB"

mongoose.connect("mongodb+srv://Jingyu:123@cluster0-zwfjp.mongodb.net/ItemDB",{useNewUrlParser:true});
const ItemSchema=new mongoose.Schema({
  name :String
});

const Item =  mongoose.model("Item",ItemSchema);

const Item1 = new Item({
  name:"I love coding!"
});

const Item2= new Item({
  name:"Nice Weather!"
});
const Item3 = new Item({
  name:"Have a great day!"
});

const defaultItems =[Item1,Item2,Item3];

const ListSchema=new mongoose.Schema({
  name :String,
  items:[ItemSchema]
});

const List =  mongoose.model("List",ListSchema);

//let day = date.getdate();

app.get("/",function(req,res){
Item.find({},function(err,foundItems){
  console.log(foundItems);
    if(foundItems.length===0){
      Item.insertMany(defaultItems,function(err){
        if(err){
          console.log("error");
        }else{
          res.redirect("/");
        }
      });
    }else{
      res.render("list",{listtitle:"Today",newListItems:foundItems});//与ejs里面变量名字相同
    }
  });
});


app.get("/:customListName",function(req,res){
  const customListName = _.capitalize(req.params.customListName);
  List.findOne({name:customListName},function(err,foundList){
    if(!err){
      if(!foundList){
        const list = new List({
          name :customListName,
          items:defaultItems
        });
        list.save();
        res.redirect("/"+customListName);
      }else{
        res.render("list",{listtitle:foundList.name,newListItems:foundList.items});//与ejs里面变量名字相同
      }
    }
  })
});

app.post("/",function(req,res){
  const itemName=req.body.newItem;
  const listName = req.body.list;
  const item = new Item({
    name :itemName
  });
  console.log(listName);
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundList){
      foundList.items.push(item);
      foundList.save();
      res.redirect("/"+listName);
    })
  }
});

app.post("/delete",function(req,res){
  const checkedItemId = req.body.checkbox;
  const listName =req.body.listName;
  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItemId,function(err){
      if(!err){
        console.log("success delete the checked item");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItemId}}},function(err,foundList){
      if(!err){
        res.redirect("/"+listName);
      }
    })
  }
});



let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}
app.listen(port);
