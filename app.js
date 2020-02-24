const bodyParser = require("body-parser");
const express = require("express")
const mongoose = require("mongoose")
const geolib = require("geolib")
const app = express()
const ejs = require("ejs")

const port = process.env.PORT|| 3000;
// if(port==null || port="")
// {  port=3000;
// }


//****************************mongoBD connections*************************
mongoose.connect("mongodb+srv://admin-raghav:isohack-1@cluster0-zqtcb.mongodb.net/locationDB", {
  useNewUrlParser: true
});

app.use(bodyParser.urlencoded({
  extended: true
}));
app.use(express.static('static'));
app.use(express.json()) //to get coordinate working in JSON format

app.set('view engine', 'ejs');


app.listen(port, function() {
  console.log("okee");
})

//*******************************schema*********************************
const truckSchema = new mongoose.Schema({
  longitude: Number,
  latitude: Number,
  capacity: Number,
  date:String,
  phone:String
});

const farmerSchema = new mongoose.Schema({
  longitude: Number,
  latitude: Number,
  capacity: Number,
  date:String,
  phone:String
})

//*****************************model*****************************
const truckDB = mongoose.model("TruckInfo", truckSchema);
const farmerDB = mongoose.model("FarmerInfo",farmerSchema);





//*************************************get req******************************
app.get("/", function(req, res){
  res.render("index")
})

app.get('/find_vehicle',(req,res)=>{
    res.render('formFarmer.ejs')
    console.log("Home")
});
app.get('/offer_vehicle',(req,res)=>{
  res.render('formTruck.ejs')
});



//*************************************post req******************************

app.post("/farmer",function(req,res){
  var availableVehicle=[];
  //console.log(availableVehicle)
  console.log("date "+req.body.date);
  const farmer = new farmerDB({
    longitude:req.body.longitude,
    latitude:req.body.latitude,
    capacity:req.body.capacity,
    phone:req.body.phone,
    date:req.body.date
  })
  farmer.save();
  console.log("saved details successfully");///////////////////////////////////

  let lat1 = (req.body.latitude)*(Math.PI/180)
  let lon1 = (req.body.longitude)*(Math.PI/180)
  let cap = req.body.capacity;
  console.log("lat "+lat1+" lon "+lon1);/////////////////////////
  truckDB.find({date:req.body.date},function(err,locations){
    const R = 6371;
    var x1 = R * Math.cos(lat1) * Math.cos(lon1)
    var y1 = R * Math.cos(lat1) * Math.sin(lon1);
    var z1 = R * Math.sin(lat1)
    locations.forEach(function(location){
        // if(cap<0){
        //   break;
        // }
        // cap = cap-location.capacity
        let lat2 = (location.latitude)*(Math.PI/180)
        let lon2 = (location.longitude)*(Math.PI/180)
        var x2 = R*Math.cos(lat2)*Math.cos(lon2);
        var y2 = R*Math.cos(lat2)*Math.sin(lon2);
        var z2 = R*Math.sin(lat2);
        var d = Math.sqrt((x1-x2)*(x1-x2) + (y1-y2)*(y1-y2) + (z1-z2)*(z1-z2))
        console.log("dist "+d);////////////////////////////////
        availableVehicle.push({dist:d,location:location})
        console.log(availableVehicle);
    })
  }).then((response) => {
    //  console.log("availableVehicle", availableVehicle);
      availableVehicle.sort(function(bandA,bandB){
        //return a.dist>b.dist;
        let comparison = 0;
        if (bandA.dist > bandB.dist) {
          comparison = 1;
        } else if (bandA.dist < bandB.dist) {
          comparison = -1;
        }
        return comparison;
      });
      res.render("nya",{vehicleDetails:availableVehicle});
  })
})


app.post("/truck",function(req,res){
  const truck = new truckDB({
    longitude:req.body.longitude,
    latitude:req.body.latitude,
    capacity:req.body.capacity,
    phone:req.body.phone,
    date:req.body.date
  })
  truck.save();
  res.redirect("/");
})
